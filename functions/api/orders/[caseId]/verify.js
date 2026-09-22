import { getProduct } from '../../../_shared/catalog.js';
import { json, errorResponse, requireDb, HttpError } from '../../../_shared/http.js';
import { validatePaymentAgainstCase, applyPaymentResult, shapeOrder } from '../../../_shared/payments.js';

const TERMINAL_STATUSES = new Set(['approved', 'rejected', 'cancelled']);

// Active server-side verification: called by the frontend right after the
// user returns from Checkout Pro. Instead of waiting passively for the async
// Mercado Pago webhook, this queries Mercado Pago's Payment Search API
// directly (by external_reference = caseId) and, if a valid matching payment
// is found, applies the same idempotent update path used by the webhook.
// This makes "approved" confirmations near-instant instead of depending
// exclusively on webhook delivery timing. The webhook keeps running as the
// asynchronous safety net (covers closed tabs, delayed delivery, etc.) and
// is fully idempotent with this path via the shared payment_events dedupe key.
export async function onRequestPost({ params, env }) {
  try {
    const db = requireDb(env);
    const record = await db.prepare('SELECT * FROM evaluator_cases WHERE case_id = ?').bind(params.caseId).first();
    if (!record) throw new HttpError(404, 'Pedido inexistente.');
    const product = getProduct(record.selected_product);
    if (!product) throw new HttpError(409, 'Producto inválido.');

    if (TERMINAL_STATUSES.has(record.payment_status)) {
      return json({ ok: true, checked: false, order: shapeOrder(record, product) });
    }
    if (record.decision !== 'purchase' || !env.MP_ACCESS_TOKEN) {
      return json({ ok: true, checked: false, order: shapeOrder(record, product) });
    }

    const searchUrl = `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(params.caseId)}&sort=date_created&criteria=desc`;
    const response = await fetch(searchUrl, { headers: { authorization: `Bearer ${env.MP_ACCESS_TOKEN}` } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new HttpError(502, 'No se pudo consultar Mercado Pago.');
    const payment = Array.isArray(data.results) ? data.results[0] : null;
    if (!payment) {
      return json({ ok: true, checked: true, order: shapeOrder(record, product) });
    }

    let validatedProduct;
    try { validatedProduct = validatePaymentAgainstCase(payment, record); }
    catch { return json({ ok: true, checked: true, order: shapeOrder(record, product) }); }

    const result = await applyPaymentResult(env, db, { record, product: validatedProduct, paymentId: payment.id, rawStatus: payment.status, transactionAmount: payment.transaction_amount, source: 'active_check' });
    return json({ ok: true, checked: true, order: result.order });
  } catch (error) { return errorResponse(error); }
}
