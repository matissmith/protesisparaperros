import { getProduct } from '../_shared/catalog.js';
import { json, readJson, errorResponse, requireDb, HttpError, cleanText } from '../_shared/http.js';

export function assertCheckoutEnabled(value) {
  if (value !== 'true') throw new HttpError(503, 'El checkout está temporalmente deshabilitado.');
  return true;
}

export function validateMpEnvironment(value) {
  if (!['test', 'production'].includes(value)) throw new HttpError(503, 'MP_ENV debe ser "test" o "production".');
  return value;
}

export function checkoutUrlForEnvironment(result, mpEnv) {
  validateMpEnvironment(mpEnv);
  const field = mpEnv === 'test' ? 'sandbox_init_point' : 'init_point';
  const checkoutUrl = result?.[field];
  if (!checkoutUrl) throw new HttpError(502, `Mercado Pago no devolvió ${field} para MP_ENV=${mpEnv}.`);
  return checkoutUrl;
}

export async function onRequestPost({ request, env }) {
  try {
    assertCheckoutEnabled(env.CHECKOUT_ENABLED);
    const mpEnv = validateMpEnvironment(env.MP_ENV);
    if (mpEnv === 'production' && env.MP_MOCK_MODE === 'true') throw new HttpError(503, 'MP_MOCK_MODE no puede estar activo en producción.');
    const db = requireDb(env); const input = await readJson(request);
    const caseId = cleanText(input.caseId, 60); const productId = cleanText(input.selectedProduct, 30);
    const idempotencyKey = request.headers.get('idempotency-key') || '';
    if (!caseId || !idempotencyKey) throw new HttpError(400, 'Faltan datos del pedido.');
    const record = await db.prepare('SELECT * FROM evaluator_cases WHERE case_id = ?').bind(caseId).first();
    if (!record) throw new HttpError(404, 'Pedido inexistente.');
    if (record.decision !== 'purchase') throw new HttpError(409, 'Este caso no inició una compra.');
    if (record.selected_product !== productId) throw new HttpError(409, 'El producto no coincide con el caso registrado.');
    const product = getProduct(record.selected_product);
    if (!product || record.reservation_amount !== product.reservationAmount) throw new HttpError(409, 'El importe registrado no coincide con el catálogo vigente.');
    const existing = await db.prepare('SELECT preference_id AS preferenceId, checkout_url AS checkoutUrl, status FROM payment_preferences WHERE idempotency_key = ?').bind(idempotencyKey).first();
    if (existing) return json({ ok: true, ...existing, duplicate: true });
    const siteUrl = (env.PREVIEW_SITE_URL || new URL(request.url).origin).replace(/\/$/, '');
    let preferenceId; let checkoutUrl;
    if (env.MP_MOCK_MODE === 'true') {
      preferenceId = `mock-${crypto.randomUUID()}`;
      checkoutUrl = `${siteUrl}/api/mock-payment?caseId=${encodeURIComponent(caseId)}&status=pending`;
    } else {
      if (!env.MP_ACCESS_TOKEN) throw new HttpError(503, 'Mercado Pago todavía no está configurado.');
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: { authorization: `Bearer ${env.MP_ACCESS_TOKEN}`, 'content-type': 'application/json', 'x-idempotency-key': idempotencyKey },
        body: JSON.stringify({
          items: [{ id: record.selected_product, title: `Reserva ${product.name}`, quantity: 1, currency_id: 'ARS', unit_price: product.reservationAmount }],
          payer: { name: record.buyer_name, email: record.email },
          external_reference: caseId,
          notification_url: `${siteUrl}/api/mercadopago/webhook`,
          back_urls: { success: `${siteUrl}/evaluador/?caseId=${encodeURIComponent(caseId)}`, pending: `${siteUrl}/evaluador/?caseId=${encodeURIComponent(caseId)}`, failure: `${siteUrl}/evaluador/?caseId=${encodeURIComponent(caseId)}` },
          auto_return: 'approved', statement_descriptor: 'ACHE INNOVATION', metadata: { case_id: caseId, product_id: record.selected_product, environment: mpEnv }
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.id) throw new HttpError(502, `Mercado Pago no creó el checkout${result.message ? `: ${result.message}` : '.'}`);
      preferenceId = result.id; checkoutUrl = checkoutUrlForEnvironment(result, mpEnv);
    }
    const now = new Date().toISOString();
    await db.batch([
      db.prepare('INSERT INTO payment_preferences (case_id,idempotency_key,preference_id,expected_amount,currency,checkout_url,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(caseId,idempotencyKey,preferenceId,product.reservationAmount,'ARS',checkoutUrl,'checkout_created',now,now),
      db.prepare("UPDATE evaluator_cases SET checkout_viewed = 1, payment_started = 1, payment_status = 'checkout_created', status = 'checkout_created', updated_at = ? WHERE case_id = ?").bind(now,caseId)
    ]);
    return json({ ok: true, preferenceId, checkoutUrl, status: 'checkout_created' }, 201);
  } catch (error) { return errorResponse(error); }
}
