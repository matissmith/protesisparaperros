import { validateCase, syncPreviewLead } from '../_shared/cases.js';
import { json, readJson, errorResponse, requireDb, booleanInt, HttpError } from '../_shared/http.js';

export async function onRequestPost({ request, env }) {
  try {
    const db = requireDb(env); const input = await readJson(request); const record = validateCase(input);
    const idempotencyKey = request.headers.get('idempotency-key') || '';
    if (!idempotencyKey || idempotencyKey.length > 100) throw new HttpError(400, 'Falta la clave de idempotencia.');
    const existing = await db.prepare('SELECT case_id AS caseId, status FROM evaluator_cases WHERE idempotency_key = ?').bind(idempotencyKey).first();
    if (existing) return json({ ok: true, caseId: existing.caseId, status: existing.status, duplicate: true });
    const caseId = crypto.randomUUID(); const now = new Date().toISOString(); const status = 'lead_created';
    await db.prepare(`INSERT INTO evaluator_cases (
      case_id,idempotency_key,created_at,updated_at,dog_name,dog_age_value,dog_age_unit,dog_weight_range,need_selected,recommended_product,selected_product,product_changed,
      price_min,price_max,price_display,reservation_amount,decision,buyer_name,country,country_iso,country_code,whatsapp_raw,whatsapp_normalized,email,city,
      price_terms_viewed,buy_now_selected,information_only_selected,contact_completed,checkout_viewed,payment_started,payment_status,status,source_url,follow_up_type,follow_up_status
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
      caseId,idempotencyKey,now,now,record.dogName,record.dogAgeValue,record.dogAgeUnit,record.dogWeightRange,record.needSelected,record.recommendedProduct,record.selectedProduct,booleanInt(record.productChanged),
      record.priceMin,record.priceMax,record.priceDisplay,record.reservationAmount,record.decision,record.buyerName,record.country,record.countryIso,record.countryCode,record.whatsappRaw,record.whatsappNormalized,record.email,record.city,
      booleanInt(record.priceAndTermsViewed),booleanInt(record.buyNowSelected),booleanInt(record.informationOnlySelected),booleanInt(record.contactCompleted),booleanInt(record.checkoutViewed),booleanInt(record.paymentStarted),'not_started',status,record.sourceUrl,null,'pending'
    ).run();
    const eventType = record.decision === 'information_only' ? 'lead_without_purchase' : 'purchase_intent_unconfirmed';
    let syncStatus = 'not_configured';
    try { const sync = await syncPreviewLead(env, eventType, { caseId, createdAt: now, status, ...record }); syncStatus = sync.configured ? 'sent' : 'not_configured'; }
    catch (error) { syncStatus = 'error'; await db.prepare('UPDATE evaluator_cases SET sync_error = ? WHERE case_id = ?').bind(String(error.message).slice(0,500),caseId).run(); }
    return json({ ok: true, caseId, status, syncStatus }, 201);
  } catch (error) { return errorResponse(error); }
}
