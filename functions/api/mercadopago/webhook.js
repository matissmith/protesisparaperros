import { json, errorResponse, requireDb, HttpError, timingSafeEqual } from '../../_shared/http.js';
import { validatePaymentAgainstCase, applyPaymentResult, mapStatus } from '../../_shared/payments.js';

// Re-exported for backward compatibility (test suite imports mapStatus from here).
export { mapStatus };

async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return [...new Uint8Array(signature)].map(byte => byte.toString(16).padStart(2,'0')).join('');
}

export async function verifySignature(request, secret, dataId) {
  if (!secret) throw new HttpError(503, 'Webhook secret no configurado.');
  const signature = request.headers.get('x-signature') || ''; const requestId = request.headers.get('x-request-id') || '';
  const parts = Object.fromEntries(signature.split(',').map(part => part.trim().split('=')));
  if (!parts.ts || !parts.v1 || !requestId || !dataId) return false;
  const manifest = `id:${String(dataId).toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  return timingSafeEqual(await hmacHex(secret,manifest),parts.v1);
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.MP_ACCESS_TOKEN) throw new HttpError(503, 'Mercado Pago no configurado.');
    const url = new URL(request.url); const body = await request.clone().json().catch(() => ({}));
    const dataId = url.searchParams.get('data.id') || body?.data?.id; const type = url.searchParams.get('type') || body?.type;
    if (type !== 'payment' || !dataId) return json({ ok: true, ignored: true });
    if (!(await verifySignature(request,env.MP_WEBHOOK_SECRET,dataId))) throw new HttpError(401, 'Firma inválida.');
    const db = requireDb(env);
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(dataId)}`, { headers: { authorization: `Bearer ${env.MP_ACCESS_TOKEN}` } });
    const payment = await paymentResponse.json().catch(() => ({}));
    if (!paymentResponse.ok || !payment.id) throw new HttpError(502, 'No se pudo consultar el pago.');
    const caseId = payment.external_reference; const record = await db.prepare('SELECT * FROM evaluator_cases WHERE case_id = ?').bind(caseId).first();
    if (!record) throw new HttpError(404, 'El pago no corresponde a un caso conocido.');
    const product = validatePaymentAgainstCase(payment, record);
    const previousStatus = record.payment_status;
    const result = await applyPaymentResult(env, db, { record, product, paymentId: payment.id, rawStatus: payment.status, transactionAmount: payment.transaction_amount, source: body.action || 'updated' });
    return json({ ok: true, duplicate: !result.applied, transitionedToApproved: result.status === 'approved' && previousStatus !== 'approved' });
  } catch (error) { return errorResponse(error); }
}
