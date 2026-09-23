import { getProduct } from './catalog.js';
import { HttpError, cleanText } from './http.js';

const STATUSES = new Set(['lead_created', 'checkout_created', 'pending', 'approved', 'rejected', 'cancelled', 'refunded']);
const EDITABLE_PAYMENT_STATUSES = new Set(['not_started', 'checkout_created', 'rejected', 'cancelled']);

export function validateCase(input) {
  const product = getProduct(input.selectedProduct);
  if (!product) throw new HttpError(400, 'Producto inválido.');
  if (!getProduct(input.recommendedProduct)) throw new HttpError(400, 'Recomendación inválida.');
  const decision = input.decision === 'purchase' ? 'purchase' : input.decision === 'information_only' ? 'information_only' : '';
  if (!decision) throw new HttpError(400, 'Decisión inválida.');
  const dogAgeValue = Number(input.dogAgeValue);
  const dogAgeUnit = input.dogAgeUnit;
  if (!Number.isInteger(dogAgeValue) || !((dogAgeUnit === 'months' && dogAgeValue >= 1 && dogAgeValue <= 11) || (dogAgeUnit === 'years' && dogAgeValue >= 1 && dogAgeValue <= 20))) throw new HttpError(400, 'Edad inválida.');
  const record = {
    dogName: cleanText(input.dogName, 60), dogAgeValue, dogAgeUnit, dogWeightRange: cleanText(input.dogWeightRange, 40), needSelected: cleanText(input.needSelected, 40),
    recommendedProduct: input.recommendedProduct, selectedProduct: input.selectedProduct, productChanged: input.recommendedProduct !== input.selectedProduct,
    priceMin: product.priceMin, priceMax: product.priceMax, priceDisplay: cleanText(input.priceDisplay, 80), reservationAmount: product.reservationAmount, decision,
    buyerName: cleanText(input.buyerName, 100), country: cleanText(input.country, 80), countryIso: cleanText(input.countryIso, 3), countryCode: cleanText(input.countryCode, 8),
    whatsappRaw: cleanText(input.whatsappRaw, 40), whatsappNormalized: cleanText(input.whatsappNormalized, 24), email: cleanText(input.email, 160).toLowerCase(), city: cleanText(input.city, 80),
    priceAndTermsViewed: input.priceAndTermsViewed === true, buyNowSelected: input.buyNowSelected === true, informationOnlySelected: input.informationOnlySelected === true,
    contactCompleted: input.contactCompleted === true, checkoutViewed: input.checkoutViewed === true, paymentStarted: input.paymentStarted === true, sourceUrl: cleanText(input.sourceUrl, 500)
  };
  if (record.dogName.length < 2 || !record.dogWeightRange || record.buyerName.length < 3 || !record.country || !/^\+\d{1,4}$/.test(record.countryCode) || !/^\+\d{8,15}$/.test(record.whatsappNormalized) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email) || record.city.length < 2 || !record.contactCompleted) throw new HttpError(400, 'Faltan datos obligatorios o contienen errores.');
  return record;
}

export function validateStatus(status) {
  if (!STATUSES.has(status)) throw new HttpError(400, 'Estado inválido.');
  return status;
}

export function assertCaseUpdateAllowed(existing, record, requestedCaseId) {
  if (!requestedCaseId || requestedCaseId !== existing.caseId) throw new HttpError(409, 'El caso no coincide con la solicitud guardada.');
  if (record.recommendedProduct !== existing.recommendedProduct) throw new HttpError(409, 'La recomendación original no puede modificarse.');
  if (!EDITABLE_PAYMENT_STATUSES.has(existing.paymentStatus)) throw new HttpError(409, 'El pedido ya no admite cambios de producto.');
  return true;
}

// Determina si una resubmisión del caso representa una decisión NUEVA y
// significativa (cambio de producto y/o de decisión de compra) o si es un
// reenvío sin cambios reales (refresh, back, pageshow, rerender). Solo el
// primer caso debe generar un evento de historial y disparar sincronización/
// email. `existing` trae el snapshot actual (decision, selectedProduct);
// nunca se compara contra el historial, solo contra el último estado.
export function classifyIntentTransition(existing, record) {
  const decisionChanged = existing.decision !== record.decision;
  const productChanged = existing.selectedProduct !== record.selectedProduct;
  if (!decisionChanged && !productChanged) return null;
  const eventType = record.decision === 'purchase' ? 'purchase_intent_updated' : 'information_only_updated';
  return { eventType, previousDecision: existing.decision, previousProduct: existing.selectedProduct };
}

// Traduce el eventType/decision técnico a las etiquetas comerciales que debe
// leer un humano en el mail. caseStatus (columna `status`), currentIntent
// (esto) y paymentStatus son tres conceptos separados: este helper solo
// resuelve el segundo, sin tocar los otros dos.
export function intentStatusLabels(eventType, decision) {
  if (eventType === 'purchase_intent_unconfirmed') return { intentLabel: 'Intención de compra', paymentLabel: 'No confirmado' };
  if (eventType === 'purchase_intent_updated') return { intentLabel: 'Intención de compra actualizada', paymentLabel: 'No confirmado' };
  if (eventType === 'lead_without_purchase') return { intentLabel: 'Solicitud de información', paymentLabel: 'Sin pago' };
  if (eventType === 'information_only_updated') return { intentLabel: 'Solicitud de información', paymentLabel: 'Sin pago' };
  return { intentLabel: decision === 'purchase' ? 'Intención de compra' : 'Solicitud de información', paymentLabel: 'Sin pago' };
}

export function resolveAppsScriptConfig(env) {
  const neutralConfigured = Boolean(env.APPS_SCRIPT_URL || env.APPS_SCRIPT_SECRET);
  if (neutralConfigured) {
    if (!env.APPS_SCRIPT_URL || !env.APPS_SCRIPT_SECRET) throw new Error('La configuración APPS_SCRIPT_URL/APPS_SCRIPT_SECRET está incompleta.');
    return { url: env.APPS_SCRIPT_URL, secret: env.APPS_SCRIPT_SECRET, secretField: 'integrationSecret' };
  }
  const previewConfigured = Boolean(env.PREVIEW_APPS_SCRIPT_URL || env.PREVIEW_APPS_SCRIPT_SECRET);
  if (previewConfigured) {
    if (!env.PREVIEW_APPS_SCRIPT_URL || !env.PREVIEW_APPS_SCRIPT_SECRET) throw new Error('La configuración legacy de Apps Script está incompleta.');
    return { url: env.PREVIEW_APPS_SCRIPT_URL, secret: env.PREVIEW_APPS_SCRIPT_SECRET, secretField: 'previewSecret' };
  }
  return null;
}

export async function syncPreviewLead(env, eventType, record) {
  const config = resolveAppsScriptConfig(env);
  if (!config) return { configured: false };
  const response = await fetch(config.url, {
    method: 'POST', headers: { 'content-type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...record, eventType, [config.secretField]: config.secret })
  });
  if (!response.ok) throw new Error(`Apps Script respondió ${response.status}`);
  const result = await response.json().catch(() => ({ ok: false }));
  if (!result.ok) throw new Error(result.error || 'Apps Script rechazó el evento');
  return { configured: true };
}
