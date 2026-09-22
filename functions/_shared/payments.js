import { getProduct, followUpFor } from './catalog.js';
import { syncPreviewLead } from './cases.js';
import { HttpError } from './http.js';

export function mapStatus(status) {
  if (status === 'approved') return 'approved';
  if (['pending', 'in_process', 'in_mediation', 'authorized'].includes(status)) return 'pending';
  if (status === 'rejected') return 'rejected';
  if (status === 'cancelled') return 'cancelled';
  if (status === 'refunded' || status === 'charged_back') return 'refunded';
  return 'pending';
}

function previewRecord(record, product, overrides = {}) {
  return {
    caseId: record.case_id, createdAt: record.created_at, dogName: record.dog_name, dogAgeValue: record.dog_age_value, dogAgeUnit: record.dog_age_unit,
    dogWeightRange: record.dog_weight_range, needSelected: record.need_selected, recommendedProduct: record.recommended_product, selectedProduct: record.selected_product,
    productChanged: Boolean(record.product_changed), productName: product.name, priceMin: product.priceMin, priceMax: product.priceMax, priceDisplay: record.price_display,
    reservationAmount: product.reservationAmount, decision: record.decision, buyerName: record.buyer_name, country: record.country, countryCode: record.country_code,
    whatsappRaw: record.whatsapp_raw, whatsappNormalized: record.whatsapp_normalized, email: record.email, city: record.city,
    priceAndTermsViewed: Boolean(record.price_terms_viewed), buyNowSelected: Boolean(record.buy_now_selected), informationOnlySelected: Boolean(record.information_only_selected),
    contactCompleted: Boolean(record.contact_completed), checkoutViewed: Boolean(record.checkout_viewed), paymentStarted: Boolean(record.payment_started),
    followUpStatus: record.follow_up_status || 'pending', ...overrides
  };
}

export function shapeOrder(record, product) {
  return {
    caseId: record.case_id, selectedProduct: record.selected_product, reservationAmount: product.reservationAmount,
    paymentStatus: record.payment_status, paymentId: record.payment_id, amountPaid: record.amount_paid,
    followUpType: record.follow_up_type, followUpStatus: record.follow_up_status,
    refundId: record.refund_id, refundStatus: record.refund_status, refundedAt: record.refunded_at,
    productName: product.name
  };
}

// Validates a raw Mercado Pago payment object against the internal case record.
// Throws HttpError if it does not correspond to this exact case/amount/currency.
export function validatePaymentAgainstCase(payment, record) {
  if (!payment || !payment.id) throw new HttpError(502, 'No se pudo consultar el pago.');
  if (String(payment.external_reference) !== String(record.case_id)) throw new HttpError(409, 'El pago no corresponde a este caso.');
  const product = getProduct(record.selected_product);
  if (!product) throw new HttpError(409, 'Producto inválido.');
  if (payment.currency_id !== 'ARS' || Number(payment.transaction_amount) !== product.reservationAmount) {
    throw new HttpError(409, 'El importe o la moneda no coinciden con el pedido.');
  }
  return product;
}

// Idempotently applies a payment status transition to a case. Safe to call from
// both the webhook handler and the active server-side verification path: the
// second caller for the same (paymentId,status) pair is a no-op that only
// re-reads the current state, so no duplicate D1 row, Sheet row, or email.
export async function applyPaymentResult(env, db, { record, product, paymentId, rawStatus, transactionAmount, source }) {
  const status = mapStatus(rawStatus);
  // Already applied AND already synced: true no-op, nothing left to do.
  if (record.payment_status === status && !record.sync_error) {
    return { applied: false, status, order: shapeOrder({ ...record, payment_id: record.payment_id ?? String(paymentId) }, product) };
  }
  const eventKey = `payment:${paymentId}:${status}`;
  const existing = await db.prepare('SELECT event_key FROM payment_events WHERE event_key = ?').bind(eventKey).first();
  const now = new Date().toISOString();
  const followUpType = status === 'approved' ? followUpFor(record.selected_product) : record.follow_up_type;
  const amountPaid = ['approved', 'refunded'].includes(status) ? Number(transactionAmount) : record.amount_paid;
  if (!existing) {
    await db.batch([
      db.prepare('INSERT INTO payment_events (event_key,case_id,payment_id,event_type,payment_status,received_at) VALUES (?,?,?,?,?,?)')
        .bind(eventKey, record.case_id, String(paymentId), source || 'updated', status, now),
      db.prepare('UPDATE evaluator_cases SET payment_status=?,status=?,payment_id=?,amount_paid=?,follow_up_type=?,follow_up_status=?,refund_status=?,refunded_at=?,updated_at=? WHERE case_id=?')
        .bind(status, status, String(paymentId), amountPaid, followUpType, 'pending', status === 'refunded' ? 'completed' : record.refund_status, status === 'refunded' ? now : record.refunded_at, now, record.case_id)
    ]);
  }
  const updatedRecord = { ...record, payment_status: status, payment_id: String(paymentId), amount_paid: amountPaid, follow_up_type: followUpType, follow_up_status: 'pending' };
  if (!existing || record.sync_error) {
    const eventType = status === 'approved' ? 'reservation_paid' : 'payment_status_update';
    const syncPayload = previewRecord(updatedRecord, product, { paymentId: String(paymentId), paymentStatus: status, amountPaid, followUpType, followUpStatus: 'pending' });
    try {
      await syncPreviewLead(env, eventType, syncPayload);
      await db.prepare('UPDATE evaluator_cases SET sync_error = NULL WHERE case_id = ?').bind(record.case_id).run();
    } catch (error) {
      await db.prepare('UPDATE evaluator_cases SET sync_error=? WHERE case_id=?').bind(String(error.message).slice(0, 500), record.case_id).run();
    }
  }
  return { applied: !existing, status, order: shapeOrder(updatedRecord, product) };
}
