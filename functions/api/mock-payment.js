import { getProduct, followUpFor } from '../_shared/catalog.js';
import { requireDb, HttpError } from '../_shared/http.js';
import { syncPreviewLead } from '../_shared/cases.js';

export async function onRequestGet({ request, env }) {
  const origin = (env.PREVIEW_SITE_URL || new URL(request.url).origin).replace(/\/$/, '');
  try {
    if (env.MP_MOCK_MODE !== 'true') throw new HttpError(404, 'No disponible.');
    const url = new URL(request.url); const caseId = url.searchParams.get('caseId'); const requested = url.searchParams.get('status');
    const status = ['approved','pending','rejected','cancelled'].includes(requested) ? requested : 'pending';
    const db = requireDb(env); const record = await db.prepare('SELECT * FROM evaluator_cases WHERE case_id = ?').bind(caseId).first();
    if (!record) throw new HttpError(404, 'Pedido inexistente.');
    const product = getProduct(record.selected_product); const now = new Date().toISOString(); const paymentId = `mock-payment-${caseId}`;
    const eventKey = `mock:${caseId}:${status}`;
    const duplicate = await db.prepare('SELECT event_key FROM payment_events WHERE event_key = ?').bind(eventKey).first();
    if (duplicate) return Response.redirect(`${origin}/evaluador/?caseId=${encodeURIComponent(caseId)}`,302);
    const followUpType = status === 'approved' ? followUpFor(record.selected_product) : null;
    await db.batch([
      db.prepare('INSERT INTO payment_events (event_key,case_id,payment_id,event_type,payment_status,received_at) VALUES (?,?,?,?,?,?)').bind(eventKey,caseId,paymentId,'mock_update',status,now),
      db.prepare('UPDATE evaluator_cases SET payment_status = ?, status = ?, payment_id = ?, amount_paid = ?, follow_up_type = ?, follow_up_status = ?, updated_at = ? WHERE case_id = ?')
        .bind(status,status,paymentId,status === 'approved' ? product.reservationAmount : null,followUpType,'pending',now,caseId)
    ]);
    const eventType = status === 'approved' ? 'reservation_paid' : 'payment_status_update';
    await syncPreviewLead(env,eventType,{caseId,createdAt:record.created_at,dogName:record.dog_name,dogAgeValue:record.dog_age_value,dogAgeUnit:record.dog_age_unit,dogWeightRange:record.dog_weight_range,needSelected:record.need_selected,recommendedProduct:record.recommended_product,selectedProduct:record.selected_product,productChanged:Boolean(record.product_changed),productName:product.name,priceMin:product.priceMin,priceMax:product.priceMax,priceDisplay:record.price_display,reservationAmount:product.reservationAmount,decision:record.decision,buyerName:record.buyer_name,country:record.country,countryCode:record.country_code,whatsappRaw:record.whatsapp_raw,whatsappNormalized:record.whatsapp_normalized,email:record.email,city:record.city,priceAndTermsViewed:Boolean(record.price_terms_viewed),buyNowSelected:Boolean(record.buy_now_selected),informationOnlySelected:Boolean(record.information_only_selected),contactCompleted:Boolean(record.contact_completed),checkoutViewed:true,paymentStarted:true,paymentId,paymentStatus:status,amountPaid:status === 'approved' ? product.reservationAmount : record.amount_paid,followUpType,followUpStatus:'pending'}).catch(()=>{});
    return Response.redirect(`${origin}/evaluador/?caseId=${encodeURIComponent(caseId)}`,302);
  } catch (error) { return new Response(error.message,{status:error.status||500}); }
}
