import { INFORMATION_ONLY_DECISION, checkoutIdempotencyKey, decisionSignals, shouldRecoverCheckoutPage, shouldRepositionStep } from './evaluador-state.js';

const PRODUCTS = {
  walk: { name: 'Arnés de caminata asistida', description: 'Acompaña la marcha cuando el perro todavía puede apoyar, pero necesita ayuda y mayor estabilidad.', image: '../assets/img/evaluador/arnes-caminata.png', priceMin: 55000, priceMax: 55000, reservation: 27500, group: 'harness' },
  lift: { name: 'Eslinga de elevación de cuerpo', description: 'Ayuda a levantar y acompañar al perro durante traslados y movimientos cotidianos.', image: '../assets/img/evaluador/eslinga-elevacion.png', priceMin: 95000, priceMax: 95000, reservation: 47500, group: 'harness' },
  ivdd: { name: 'Faja de soporte IVDD', description: 'Brinda soporte en la zona del lomo durante la movilidad cotidiana.', image: '../assets/img/evaluador/faja-ivdd.png', priceMin: 125000, priceMax: 125000, reservation: 62500, group: 'harness' },
  wheelchair: { name: 'Silla de ruedas', description: 'Devuelve movilidad cuando las patas traseras no sostienen o impulsan correctamente.', image: '../assets/img/evaluador/silla-ruedas.png', priceMin: 308000, priceMax: 308000, reservation: 77000, group: 'cart' },
  cart: { name: 'Carro ortopédico', description: 'Ofrece mayor sujeción y acompañamiento del cuerpo para desplazarse.', image: '../assets/img/evaluador/carro-ortopedico.png', priceMin: 462000, priceMax: 462000, reservation: 115500, group: 'cart' },
  orthosis: { name: 'Órtesis tipo bota Walker', description: 'Protege y estabiliza una pata o articulación mediante una configuración a medida.', image: '../assets/img/evaluador/ortesis.png', priceMin: 600000, priceMax: 1000000, reservation: 150000, group: 'orthosis' },
  prosthesis: { name: 'Prótesis personalizada', description: 'Reemplaza la parte faltante de una extremidad con un dispositivo diseñado para el perro.', image: '../assets/img/evaluador/protesis.png', priceMin: 1500000, priceMax: 2500000, reservation: 225000, group: 'prosthesis' }
};

const NEEDS = [
  ['walk', 'Caminar', 'Camina, pero necesita ayuda para desplazarse.'],
  ['lift', 'Levantarse', 'Necesita ayuda para incorporarse o dar pasos.'],
  ['ivdd', 'Sostener la espalda', 'Necesita apoyo en la zona del lomo.'],
  ['wheelchair', 'Movilidad en patas traseras', 'Las patas traseras no lo sostienen o impulsan bien.'],
  ['cart', 'Desplazarse con más sujeción', 'Necesita que el cuerpo quede más acompañado.'],
  ['orthosis', 'Apoyar una pata o articulación', 'Busca proteger o estabilizar una zona puntual.'],
  ['prosthesis', 'Reemplazar parte de una pata', 'Le falta una parte o tiene una amputación.']
];

const COUNTRIES = [
  ['AR','Argentina','+54'],['BO','Bolivia','+591'],['BR','Brasil','+55'],['CL','Chile','+56'],['CO','Colombia','+57'],['CR','Costa Rica','+506'],['CU','Cuba','+53'],['DO','República Dominicana','+1'],['EC','Ecuador','+593'],['SV','El Salvador','+503'],['GT','Guatemala','+502'],['HN','Honduras','+504'],['MX','México','+52'],['NI','Nicaragua','+505'],['PA','Panamá','+507'],['PY','Paraguay','+595'],['PE','Perú','+51'],['PR','Puerto Rico','+1'],['UY','Uruguay','+598'],['VE','Venezuela','+58'],
  ['US','Estados Unidos','+1'],['CA','Canadá','+1'],['ES','España','+34'],['PT','Portugal','+351'],['IT','Italia','+39'],['FR','Francia','+33'],['DE','Alemania','+49'],['GB','Reino Unido','+44'],['IE','Irlanda','+353'],['NL','Países Bajos','+31'],['BE','Bélgica','+32'],['CH','Suiza','+41'],['AT','Austria','+43'],['SE','Suecia','+46'],['NO','Noruega','+47'],['DK','Dinamarca','+45'],['FI','Finlandia','+358'],['PL','Polonia','+48'],['GR','Grecia','+30'],['IL','Israel','+972'],['AU','Australia','+61'],['NZ','Nueva Zelanda','+64'],['ZA','Sudáfrica','+27'],['IN','India','+91'],['JP','Japón','+81'],['KR','Corea del Sur','+82'],['CN','China','+86'],['SG','Singapur','+65'],['AE','Emiratos Árabes Unidos','+971'],['OTHER','Otro país','']
];

const STEPS = [
  ['El perro', 'Contanos los datos básicos de tu perro para comenzar.'],
  ['Necesidad', 'Elegí qué necesita principalmente.'],
  ['Solución', 'Conocé la solución recomendada y las alternativas disponibles.'],
  ['Precio y compra', 'Revisá el precio, la reserva y cómo se inicia el pedido.'],
  ['Datos', 'Completá tus datos para continuar.'],
  ['Confirmación y pago', 'Revisá el pedido antes de ir a Mercado Pago.']
];

const STORAGE_KEY = 'acheEvaluatorPreview:v1';
const initialState = {
  step: 1, caseId: null, caseIdempotencyKey: crypto.randomUUID(), createdAt: new Date().toISOString(), dogName: '', dogAgeValue: '', dogAgeUnit: '', dogWeightRange: '', needSelected: '', recommendedProduct: '', selectedProduct: '', productChanged: false,
  decision: '', buyerName: '', country: 'AR', countryCode: '+54', whatsappRaw: '', whatsappNormalized: '', email: '', city: '',
  priceAndTermsViewed: false, buyNowSelected: false, informationOnlySelected: false, contactCompleted: false, checkoutViewed: false, paymentStarted: false, paymentStatus: 'not_started'
};
let state = restoreState();
let busy = false;

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const money = value => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
const priceText = product => product.priceMin === product.priceMax ? money(product.priceMin) : `${money(product.priceMin)} a ${money(product.priceMax)}`;
const balance = product => product.priceMin === product.priceMax ? product.priceMin - product.reservation : null;
const chosenProduct = () => PRODUCTS[state.selectedProduct];

function restoreState() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    return parsed && parsed.schemaVersion === 1 ? { ...initialState, ...parsed } : { ...initialState, schemaVersion: 1 };
  } catch { return { ...initialState, schemaVersion: 1 }; }
}
function saveState() { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function resetState() { sessionStorage.removeItem(STORAGE_KEY); state = { ...initialState, caseIdempotencyKey: crypto.randomUUID(), createdAt: new Date().toISOString(), schemaVersion: 1 }; render(); }
function setBusy(value) { busy = value; $('#next').disabled = value; $('#back').disabled = value; }
function showError(message = '') { $('#form-error').textContent = message; }

function buildStaticOptions() {
  for (let i = 1; i <= 11; i++) $('#dog-age').add(new Option(`${i} ${i === 1 ? 'mes' : 'meses'}`, `months:${i}`));
  for (let i = 1; i <= 20; i++) $('#dog-age').add(new Option(`${i} ${i === 1 ? 'año' : 'años'}`, `years:${i}`));
  $('#need-options').innerHTML = NEEDS.map(([id, title, copy]) => `<button class="ache-choice" type="button" data-product="${id}" aria-pressed="false"><strong>${title}</strong><span>${copy}</span></button>`).join('');
  $('#country').innerHTML = COUNTRIES.map(([code, name]) => `<option value="${code}">${name}</option>`).join('');
  const callingCodes = [...new Set(COUNTRIES.map(item => item[2]).filter(Boolean))].sort((a,b) => Number(a.slice(1)) - Number(b.slice(1)));
  $('#country-code').innerHTML = callingCodes.map(code => `<option value="${code}">${code}</option>`).join('') + '<option value="other">Otro código</option>';
}

function render() {
  $$('.ache-step').forEach(step => { step.hidden = Number(step.dataset.step) !== state.step; });
  const progressStep = Math.min(state.step, 6);
  $('#step-label').textContent = state.step === 7 ? 'Recorrido completo' : `Paso ${progressStep} de 6`;
  $('#step-name').textContent = state.step === 7 ? 'Resultado' : STEPS[progressStep - 1][0];
  $('#step-context').textContent = state.step === 7 ? 'Te mostramos el estado actual de tu solicitud.' : STEPS[progressStep - 1][1];
  $('#progress-bar').style.width = `${(progressStep / 6) * 100}%`;
  $('.ache-progress').setAttribute('aria-valuenow', String(progressStep));
  $('#back').hidden = state.step === 1 || state.step === 7;
  $('#actions').hidden = state.step === 7;
  $('#next').textContent = state.step === 5 ? (state.decision === 'purchase' ? 'Revisar compra' : 'Quiero más información') : state.step === 6 ? `Pagar ${money(chosenProduct()?.reservation || 0)}` : 'Continuar';
  $('#dog-name').value = state.dogName;
  $('#dog-age').value = state.dogAgeValue && state.dogAgeUnit ? `${state.dogAgeUnit}:${state.dogAgeValue}` : '';
  $$('#weight-options [data-weight]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.weight === state.dogWeightRange)));
  $$('#need-options [data-product]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.product === state.needSelected)));
  if (state.step >= 3 && state.selectedProduct) renderProduct();
  if (state.step === 5) renderContact();
  if (state.step === 6) renderCheckout();
  showError(); saveState();
}

function renderInlineSelection() {
  const currentScroll = window.scrollY;
  document.documentElement.style.overflowAnchor = 'none';
  render();
  window.scrollTo({ top: currentScroll, behavior: 'auto' });
  requestAnimationFrame(() => {
    window.scrollTo({ top: currentScroll, behavior: 'auto' });
    document.documentElement.style.removeProperty('overflow-anchor');
  });
}

function renderStepChange() {
  render();
  requestAnimationFrame(() => {
    const heading = $(`.ache-step[data-step="${state.step}"] h2`);
    if (!heading) return;
    const rect = heading.getBoundingClientRect();
    if (!shouldRepositionStep({ top: rect.top, bottom: rect.bottom, viewportHeight: window.innerHeight })) return;
    heading.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
}

function renderProduct() {
  const product = chosenProduct();
  const isRecommended = state.selectedProduct === state.recommendedProduct;
  $('#product-image').src = product.image;
  $('#product-image').alt = `${product.name} colocado en un perro`;
  $('#product-name').textContent = product.name;
  $('#product-description').textContent = product.description;
  $('#primary-badge').hidden = false;
  $('#primary-badge').textContent = isRecommended ? 'Recomendado' : 'Elegido por vos';
  $('#product-step-title').textContent = isRecommended ? 'Tu solución' : 'Producto elegido';
  $('#product-step-help').textContent = isRecommended
    ? 'Según lo que nos contaste, esta es la solución que más se acerca a la necesidad de tu perro.'
    : 'Elegiste esta alternativa para continuar. La recomendación original de Ache sigue identificada para que puedas compararlas.';
  $('#primary-product-card').classList.toggle('is-user-selected', !isRecommended);
  $('#summary-dog').textContent = state.dogName;
  $('#summary-weight').textContent = state.dogWeightRange;
  $('#summary-age').textContent = ageDisplay();
  const alternatives = Object.entries(PRODUCTS).filter(([id, item]) => item.group === product.group && id !== state.selectedProduct);
  $('#related-products').hidden = alternatives.length === 0;
  $('#related-grid').innerHTML = alternatives.map(([id, item]) => `<button type="button" class="ache-related-card" data-related="${id}"><img src="${item.image}" alt="${item.name}"><span>${id === state.recommendedProduct ? '<span class="ache-related-badge">Recomendado</span>' : ''}<strong>${item.name}</strong></span></button>`).join('');
  $('#price-product').textContent = product.name;
  $('#total-label').textContent = product.priceMin === product.priceMax ? 'Precio total' : 'Precio estimado';
  $('#total-price').textContent = priceText(product);
  $('#pay-now').textContent = money(product.reservation);
  $('#balance-term').hidden = balance(product) === null;
  $('#balance').textContent = balance(product) === null ? '' : money(balance(product));
  $('#purchase-copy').textContent = product.priceMin === product.priceMax
    ? `Pagás ${money(product.reservation)} ahora para iniciar tu pedido. Se descuenta del precio total de ${money(product.priceMin)}.`
    : `Pagás ${money(product.reservation)} ahora para iniciar tu pedido. Se descuenta del precio final, estimado entre ${money(product.priceMin)} y ${money(product.priceMax)}.`;
}

function renderContact() {
  const purchase = state.decision === 'purchase';
  const product = chosenProduct();
  $('#contact-title').textContent = purchase ? 'Datos para la compra' : 'Tus datos de contacto';
  $('#contact-help').textContent = purchase ? 'Completá tus datos para continuar con la compra.' : 'Dejanos tus datos para recibir más información sobre la solución que viste.';
  $('#contact-economy').hidden = !purchase;
  $('#contact-note').textContent = purchase ? 'Usaremos estos datos para gestionar el pedido y comunicarnos con vos.' : 'Usaremos estos datos únicamente para responderte sobre la solución seleccionada.';
  $('#contact-product').textContent = product.name;
  $('#contact-total-label').textContent = product.priceMin === product.priceMax ? 'Precio total' : 'Precio estimado';
  $('#contact-total').textContent = priceText(product);
  $('#contact-pay-now').textContent = money(product.reservation);
  $('#buyer-name').value = state.buyerName; $('#country').value = state.country; $('#country-code').value = state.countryCode;
  $('#whatsapp').value = state.whatsappRaw; $('#email').value = state.email; $('#city').value = state.city;
}

function renderCheckout() {
  const product = chosenProduct();
  state.checkoutViewed = true;
  $('#checkout-product').textContent = product.name;
  $('#checkout-total-label').textContent = product.priceMin === product.priceMax ? 'Precio total' : 'Precio estimado';
  $('#checkout-total').textContent = priceText(product);
  $('#checkout-pay-now').textContent = money(product.reservation);
  $('#checkout-balance-term').hidden = balance(product) === null;
  $('#checkout-balance').textContent = balance(product) === null ? '' : money(balance(product));
  $('#checkout-buyer').textContent = state.buyerName; $('#checkout-dog').textContent = state.dogName;
  $('#checkout-country').textContent = countryName(state.country); $('#checkout-city').textContent = state.city;
}

function ageDisplay() { return `${state.dogAgeValue} ${state.dogAgeUnit === 'months' ? (state.dogAgeValue === '1' ? 'mes' : 'meses') : (state.dogAgeValue === '1' ? 'año' : 'años')}`; }
function countryName(code) { return COUNTRIES.find(item => item[0] === code)?.[1] || code; }
function normalizePhone() { const digits = state.whatsappRaw.replace(/\D/g, ''); return `${state.countryCode}${digits}`; }
function validatePhone() { const digits = normalizePhone().replace(/\D/g, ''); return digits.length >= 8 && digits.length <= 15 && !/^(\d)\1+$/.test(digits); }

function validateStep() {
  if (state.step === 1) {
    state.dogName = $('#dog-name').value.trim(); const age = $('#dog-age').value.split(':'); state.dogAgeUnit = age[0] || ''; state.dogAgeValue = age[1] || '';
    if (!state.dogWeightRange) return 'Elegí el peso aproximado de tu perro.';
    if (state.dogName.length < 2) return 'Ingresá el nombre de tu perro.';
    if (!state.dogAgeValue) return 'Seleccioná la edad.';
  }
  if (state.step === 2 && !state.needSelected) return 'Elegí qué necesita principalmente.';
  if (state.step === 4 && !state.decision) return 'Elegí cómo querés continuar.';
  if (state.step === 5) {
    state.buyerName = $('#buyer-name').value.trim(); state.country = $('#country').value; state.countryCode = $('#country-code').value;
    state.whatsappRaw = $('#whatsapp').value.trim(); state.email = $('#email').value.trim().toLowerCase(); state.city = $('#city').value.trim();
    if (state.buyerName.length < 3) return 'Ingresá tu nombre y apellido.';
    if (!state.country || state.country === 'OTHER') return 'Seleccioná tu país. Para otro país, escribinos mediante el canal de contacto general.';
    if (!state.countryCode || state.countryCode === 'other') return 'Seleccioná el código internacional.';
    if (!validatePhone()) return 'Ingresá un WhatsApp válido con su código internacional.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) return 'Ingresá un email válido.';
    if (state.city.length < 2) return 'Ingresá tu ciudad o localidad.';
    state.whatsappNormalized = normalizePhone(); state.contactCompleted = true;
  }
  return '';
}

function payload() {
  const product = chosenProduct();
  return {
    schemaVersion: 1, caseId: state.caseId, createdAt: state.createdAt, dogName: state.dogName, dogAgeValue: Number(state.dogAgeValue), dogAgeUnit: state.dogAgeUnit,
    dogWeightRange: state.dogWeightRange, needSelected: state.needSelected, recommendedProduct: state.recommendedProduct, selectedProduct: state.selectedProduct,
    productChanged: state.productChanged, priceMin: product.priceMin, priceMax: product.priceMax, reservationAmount: product.reservation, decision: state.decision,
    priceDisplay: priceText(product),
    buyerName: state.buyerName, country: countryName(state.country), countryIso: state.country, countryCode: state.countryCode, whatsappRaw: state.whatsappRaw,
    whatsappNormalized: state.whatsappNormalized, email: state.email, city: state.city, priceAndTermsViewed: state.priceAndTermsViewed,
    buyNowSelected: state.buyNowSelected, informationOnlySelected: state.informationOnlySelected, contactCompleted: state.contactCompleted,
    checkoutViewed: state.checkoutViewed, paymentStarted: state.paymentStarted, sourceUrl: location.href.split('?')[0]
  };
}

async function createCase() {
  const response = await fetch('../api/cases', { method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': state.caseIdempotencyKey }, body: JSON.stringify(payload()) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) throw new Error(data.error || 'No pudimos registrar los datos. Probá nuevamente.');
  state.caseId = data.caseId; state.paymentStatus = data.status; saveState();
}

async function startCheckout() {
  state.paymentStarted = true; saveState();
  const response = await fetch('../api/checkout', { method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': checkoutIdempotencyKey(state.caseId, state.selectedProduct) }, body: JSON.stringify({ caseId: state.caseId, selectedProduct: state.selectedProduct }) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) throw new Error(data.error || 'No pudimos iniciar el pago de prueba.');
  state.paymentStatus = data.status; saveState();
  location.assign(data.checkoutUrl);
}

async function nextStep() {
  if (busy) return;
  const error = validateStep(); if (error) return showError(error);
  if (state.step === 2) {
    if (!state.caseId) state.recommendedProduct = state.needSelected;
    state.selectedProduct = state.needSelected;
    state.productChanged = state.selectedProduct !== state.recommendedProduct;
  }
  if (state.step === 4) {
    state.priceAndTermsViewed = true;
    Object.assign(state, decisionSignals(state.decision));
  }
  if (state.step === 5) {
    setBusy(true); showError();
    try {
      await createCase();
      if (state.decision === INFORMATION_ONLY_DECISION) return showInformationFinish();
    } catch (error) { showError(error.message); return; } finally { setBusy(false); }
  }
  if (state.step === 6) {
    setBusy(true); showError(); try { await startCheckout(); } catch (error) { showError(error.message); setBusy(false); } return;
  }
  state.step += 1; renderStepChange();
}

function showInformationFinish() {
  state.step = 7; state.paymentStatus = 'not_applicable';
  $('#finish-title').textContent = 'Solicitud registrada';
  $('#finish-message').textContent = `Recibimos tus datos para enviarte más información sobre ${chosenProduct().name}.`;
  $('#finish-status').textContent = 'Información solicitada'; $('#post-payment').hidden = true; renderStepChange();
}

const ORDER_POLL_INTERVAL_MS = 1500;
const ORDER_POLL_TIMEOUT_MS = 20000;
const ORDER_TERMINAL_NEGATIVE = new Set(['rejected', 'cancelled']);

function showOrder(order) {
  state.step = 7; state.caseId = order.caseId; state.paymentStatus = order.paymentStatus; saveState();
  const status = order.paymentStatus;
  if (status === 'approved') {
    $('#finish-title').textContent = 'Reserva confirmada';
    $('#finish-message').textContent = `Recibimos tu pago de ${money(order.amountPaid || order.reservationAmount)} para iniciar el pedido de ${order.productName}. Te enviamos la confirmación por email.`;
    $('#finish-status').textContent = 'Pago aprobado';
    $('#post-payment').hidden = false;
    $('#post-payment').innerHTML = order.followUpType === 'clinical_15m'
      ? '<strong>Próximo paso</strong><p>Vamos a coordinar una reunión breve de aproximadamente 15 minutos para revisar el caso y continuar el proceso.</p>'
      : '<strong>Próximo paso</strong><p>Ache se comunicará para continuar con medidas, talle o configuración y los próximos pasos.</p>';
    $('#retry-payment').hidden = true;
  } else {
    $('#finish-title').textContent = status === 'rejected' ? 'No pudimos procesar el pago' : 'El pago no fue aprobado'; $('#finish-message').textContent = 'La reserva no quedó confirmada. Tus datos y el pedido siguen registrados.'; $('#finish-status').textContent = status === 'rejected' ? 'Rechazado' : 'Cancelado'; $('#post-payment').hidden = true;
    $('#retry-payment').hidden = false;
  }
  renderStepChange();
}

function showVerifying() {
  state.step = 7; saveState();
  $('#finish-title').textContent = 'Confirmando tu pago…';
  $('#finish-message').textContent = 'Estamos consultando directamente con Mercado Pago. Esto suele tardar solo unos segundos, no cierres ni recargues esta página.';
  $('#finish-status').textContent = 'Confirmando';
  $('#post-payment').hidden = true;
  $('#retry-payment').hidden = true;
  renderStepChange();
}

function showStillVerifying(order) {
  state.step = 7; state.caseId = order.caseId; state.paymentStatus = order.paymentStatus; saveState();
  $('#finish-title').textContent = 'El pago todavía está siendo verificado';
  $('#finish-message').textContent = 'Tus datos y el pedido quedaron registrados. Te vamos a avisar por email apenas se confirme el pago; también podés recargar esta página más tarde para ver el estado actualizado.';
  $('#finish-status').textContent = 'Verificación en curso';
  $('#post-payment').hidden = true;
  $('#retry-payment').hidden = true;
  renderStepChange();
}

async function fetchOrder(caseId) {
  const response = await fetch(`../api/orders/${encodeURIComponent(caseId)}`);
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error('order_fetch_failed');
  return data.order;
}

// Active check: asks the backend to query Mercado Pago directly (not just
// read whatever D1 already has). This is what makes confirmation near-instant
// instead of depending exclusively on the async webhook landing first.
async function verifyOrder(caseId) {
  const response = await fetch(`../api/orders/${encodeURIComponent(caseId)}/verify`, { method: 'POST' });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error('order_verify_failed');
  return data.order;
}

function isTerminalStatus(status) { return status === 'approved' || ORDER_TERMINAL_NEGATIVE.has(status); }

async function pollOrderStatus(caseId) {
  const deadline = Date.now() + ORDER_POLL_TIMEOUT_MS;
  let lastOrder = null;
  while (Date.now() < deadline) {
    try { lastOrder = await verifyOrder(caseId); } catch { try { lastOrder = await fetchOrder(caseId); } catch { lastOrder = null; } }
    if (lastOrder && isTerminalStatus(lastOrder.paymentStatus)) { showOrder(lastOrder); return; }
    await new Promise(resolve => setTimeout(resolve, ORDER_POLL_INTERVAL_MS));
  }
  if (lastOrder) showStillVerifying(lastOrder);
  else showError('No pudimos consultar el estado del pedido. Recargá la página en unos segundos.');
}

async function loadReturnedOrder() {
  const caseId = new URLSearchParams(location.search).get('caseId'); if (!caseId) return false;
  showVerifying();
  try { await pollOrderStatus(caseId); }
  catch { showError('No pudimos consultar el estado del pedido. Recargá la página en unos segundos.'); }
  return true;
}

document.addEventListener('click', event => {
  const weight = event.target.closest('[data-weight]'); if (weight) { state.dogWeightRange = weight.dataset.weight; renderInlineSelection(); }
  const need = event.target.closest('[data-product]'); if (need) { state.needSelected = need.dataset.product; renderInlineSelection(); }
  const related = event.target.closest('[data-related]'); if (related) { state.selectedProduct = related.dataset.related; state.productChanged = state.selectedProduct !== state.recommendedProduct; renderInlineSelection(); }
});
$('#intent-options').addEventListener('change', event => { state.decision = event.target.value; renderInlineSelection(); });
$('#country').addEventListener('change', event => { state.country = event.target.value; const match = COUNTRIES.find(item => item[0] === state.country); if (match?.[2]) state.countryCode = match[2]; $('#country-code').value = state.countryCode; saveState(); });
$('#next').addEventListener('click', nextStep);
$('#back').addEventListener('click', () => { if (!busy && state.step > 1) { state.step -= 1; renderStepChange(); } });
$('#restart').addEventListener('click', () => { history.replaceState({}, '', location.pathname); resetState(); });
$('#retry-payment').addEventListener('click', () => { state.step = 6; history.replaceState({}, '', location.pathname); renderStepChange(); });

window.addEventListener('pageshow', event => {
  const hasReturnCaseId = new URLSearchParams(location.search).has('caseId');
  if (!shouldRecoverCheckoutPage({ persisted: event.persisted, step: state.step, hasReturnCaseId })) return;
  setBusy(false);
  showError();
  render();
});

buildStaticOptions();
loadReturnedOrder().then(loaded => { if (!loaded) render(); });
