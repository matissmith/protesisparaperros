import { getProduct, followUpFor } from '../../_shared/catalog.js';
import { json, errorResponse, requireDb, HttpError } from '../../_shared/http.js';

export async function onRequestGet({ params, env }) {
  try {
    const db = requireDb(env); const record = await db.prepare(`SELECT case_id AS caseId, selected_product AS selectedProduct, reservation_amount AS reservationAmount,
      payment_status AS paymentStatus, payment_id AS paymentId, amount_paid AS amountPaid, follow_up_type AS followUpType, follow_up_status AS followUpStatus
      , refund_id AS refundId, refund_status AS refundStatus, refunded_at AS refundedAt
      FROM evaluator_cases WHERE case_id = ?`).bind(params.caseId).first();
    if (!record) throw new HttpError(404, 'Pedido inexistente.');
    const product = getProduct(record.selectedProduct);
    return json({ ok: true, order: { ...record, productName: product?.name || record.selectedProduct, followUpType: record.followUpType || followUpFor(record.selectedProduct) } });
  } catch (error) { return errorResponse(error); }
}
