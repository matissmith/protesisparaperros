import test from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCT_CATALOG, followUpFor } from '../functions/_shared/catalog.js';
import { assertCaseUpdateAllowed, classifyIntentTransition, intentStatusLabels, resolveAppsScriptConfig, validateCase } from '../functions/_shared/cases.js';
import { mapStatus, verifySignature } from '../functions/api/mercadopago/webhook.js';
import { assertCheckoutEnabled, checkoutUrlForEnvironment, validateMpEnvironment } from '../functions/api/checkout.js';
import { INFORMATION_ONLY_DECISION, checkoutIdempotencyKey, decisionSignals, shouldRecoverCheckoutPage, shouldRepositionStep, shouldScrollAfterRender } from '../assets/js/evaluador-state.js';

const expected = {
  walk: [55000,55000,27500], lift: [95000,95000,47500], ivdd: [125000,125000,62500], wheelchair: [308000,308000,77000],
  cart: [462000,462000,115500], orthosis: [600000,1000000,150000], prosthesis: [1500000,2500000,225000]
};

function payload(product = 'walk') {
  return {
    dogName:'Mora',dogAgeValue:5,dogAgeUnit:'years',dogWeightRange:'9 a 18 kg',needSelected:product,recommendedProduct:product,selectedProduct:product,
    priceMin:1,priceMax:1,priceDisplay:'$55.000',reservationAmount:1,decision:'purchase',buyerName:'Persona Prueba',country:'Argentina',countryIso:'AR',countryCode:'+54',
    whatsappRaw:'11 1234 5678',whatsappNormalized:'+541112345678',email:'prueba@example.com',city:'Buenos Aires',priceAndTermsViewed:true,buyNowSelected:true,
    informationOnlySelected:false,contactCompleted:true,checkoutViewed:false,paymentStarted:false,sourceUrl:'http://localhost/evaluador/'
  };
}

test('el catálogo cerrado contiene los siete importes aprobados', () => {
  assert.equal(Object.keys(PRODUCT_CATALOG).length, 7);
  for (const [id, amounts] of Object.entries(expected)) {
    const product = PRODUCT_CATALOG[id];
    assert.deepEqual([product.priceMin,product.priceMax,product.reservationAmount],amounts);
  }
});

test('el servidor ignora importes manipulados por el navegador', () => {
  for (const id of Object.keys(expected)) {
    const record = validateCase(payload(id));
    assert.equal(record.priceMin,PRODUCT_CATALOG[id].priceMin);
    assert.equal(record.priceMax,PRODUCT_CATALOG[id].priceMax);
    assert.equal(record.reservationAmount,PRODUCT_CATALOG[id].reservationAmount);
  }
});

test('preserva recomendado y registra un producto alternativo', () => {
  const input = payload('lift'); input.recommendedProduct='walk';
  const record = validateCase(input);
  assert.equal(record.recommendedProduct,'walk'); assert.equal(record.selectedProduct,'lift'); assert.equal(record.productChanged,true);
});

test('permite actualizar un caso no pagado sin cambiar la recomendación original', () => {
  const record = validateCase({...payload('lift'),recommendedProduct:'walk',caseId:'case-1'});
  assert.equal(assertCaseUpdateAllowed({caseId:'case-1',recommendedProduct:'walk',paymentStatus:'checkout_created'},record,'case-1'),true);
  assert.throws(()=>assertCaseUpdateAllowed({caseId:'case-1',recommendedProduct:'walk',paymentStatus:'approved'},record,'case-1'),/no admite cambios/);
  assert.throws(()=>assertCaseUpdateAllowed({caseId:'case-1',recommendedProduct:'cart',paymentStatus:'not_started'},record,'case-1'),/recomendación original/);
});

test('cada producto usa una idempotencia de checkout independiente dentro del mismo caso', () => {
  assert.equal(checkoutIdempotencyKey('case-1','walk'),'case-1:checkout:walk:v1');
  assert.equal(checkoutIdempotencyKey('case-1','lift'),'case-1:checkout:lift:v1');
  assert.notEqual(checkoutIdempotencyKey('case-1','walk'),checkoutIdempotencyKey('case-1','lift'));
});

test('registra al no comprador sin mezclarlo con señales de pago', () => {
  const record = validateCase({...payload(),decision:'information_only',buyNowSelected:false,informationOnlySelected:true,paymentStarted:false});
  assert.equal(record.decision,'information_only');
  assert.equal(record.buyNowSelected,false);
  assert.equal(record.informationOnlySelected,true);
  assert.equal(record.paymentStarted,false);
});

test('el frontend reconoce information_only como recorrido sin compra', () => {
  assert.equal(INFORMATION_ONLY_DECISION,'information_only');
  assert.deepEqual(decisionSignals('information_only'),{buyNowSelected:false,informationOnlySelected:true});
  assert.deepEqual(decisionSignals('purchase'),{buyNowSelected:true,informationOnlySelected:false});
});

test('solo recupera el checkout al volver desde historial sin callback de pago', () => {
  assert.equal(shouldRecoverCheckoutPage({persisted:true,step:6,hasReturnCaseId:false}),true);
  assert.equal(shouldRecoverCheckoutPage({persisted:false,step:6,hasReturnCaseId:false}),false);
  assert.equal(shouldRecoverCheckoutPage({persisted:true,step:5,hasReturnCaseId:false}),false);
  assert.equal(shouldRecoverCheckoutPage({persisted:true,step:6,hasReturnCaseId:true}),false);
});

test('las selecciones dentro del mismo paso conservan el scroll', () => {
  assert.equal(shouldScrollAfterRender('inline-selection'),false);
  assert.equal(shouldScrollAfterRender('step-change'),true);
});

test('un cambio de paso sólo reposiciona cuando el encabezado queda fuera de la zona cómoda', () => {
  assert.equal(shouldRepositionStep({top:120,bottom:160,viewportHeight:800}),false);
  assert.equal(shouldRepositionStep({top:650,bottom:690,viewportHeight:800}),true);
  assert.equal(shouldRepositionStep({top:-80,bottom:-40,viewportHeight:800}),true);
});

test('valida los rangos de edad', () => {
  assert.doesNotThrow(()=>validateCase({...payload(),dogAgeValue:1,dogAgeUnit:'months'}));
  assert.doesNotThrow(()=>validateCase({...payload(),dogAgeValue:20,dogAgeUnit:'years'}));
  assert.throws(()=>validateCase({...payload(),dogAgeValue:12,dogAgeUnit:'months'}));
  assert.throws(()=>validateCase({...payload(),dogAgeValue:21,dogAgeUnit:'years'}));
});

test('distingue el seguimiento clínico del operativo', () => {
  assert.equal(followUpFor('orthosis'),'clinical_15m'); assert.equal(followUpFor('prosthesis'),'clinical_15m');
  for (const id of ['walk','lift','ivdd','wheelchair','cart']) assert.equal(followUpFor(id),'ops_measurements');
});

test('normaliza los estados de Mercado Pago', () => {
  assert.equal(mapStatus('approved'),'approved'); assert.equal(mapStatus('in_process'),'pending'); assert.equal(mapStatus('rejected'),'rejected');
  assert.equal(mapStatus('cancelled'),'cancelled'); assert.equal(mapStatus('refunded'),'refunded');
});

test('valida la firma HMAC del webhook', async () => {
  const secret='webhook-test-secret'; const dataId='12345'; const requestId='request-1'; const ts='1700000000';
  const manifest=`id:${dataId};request-id:${requestId};ts:${ts};`;
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const signed=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(manifest));
  const hex=[...new Uint8Array(signed)].map(byte=>byte.toString(16).padStart(2,'0')).join('');
  const request=new Request('https://preview.test/webhook',{headers:{'x-request-id':requestId,'x-signature':`ts=${ts},v1=${hex}`}});
  assert.equal(await verifySignature(request,secret,dataId),true);
  assert.equal(await verifySignature(request,'wrong-secret',dataId),false);
});

test('MP_ENV=test usa exclusivamente sandbox_init_point', () => {
  const result = { sandbox_init_point:'https://sandbox.example/checkout', init_point:'https://real.example/checkout' };
  assert.equal(checkoutUrlForEnvironment(result,'test'),result.sandbox_init_point);
});

test('MP_ENV=production usa exclusivamente init_point', () => {
  const result = { sandbox_init_point:'https://sandbox.example/checkout', init_point:'https://real.example/checkout' };
  assert.equal(checkoutUrlForEnvironment(result,'production'),result.init_point);
});

test('MP_ENV inválido falla cerrado', () => {
  assert.throws(()=>validateMpEnvironment('preview'),error=>error.status===503 && /MP_ENV/.test(error.message));
  assert.throws(()=>checkoutUrlForEnvironment({ sandbox_init_point:'https://sandbox.example' },''),error=>error.status===503);
});

test('CHECKOUT_ENABLED=false bloquea el checkout', () => {
  assert.throws(()=>assertCheckoutEnabled('false'),error=>error.status===503 && /deshabilitado/.test(error.message));
  assert.throws(()=>assertCheckoutEnabled(undefined),error=>error.status===503);
});

test('CHECKOUT_ENABLED=true permite continuar', () => {
  assert.equal(assertCheckoutEnabled('true'),true);
});

test('configuración neutra de Apps Script se usa en producción', () => {
  assert.deepEqual(resolveAppsScriptConfig({APPS_SCRIPT_URL:'https://prod.example/exec',APPS_SCRIPT_SECRET:'secret'}),{
    url:'https://prod.example/exec',secret:'secret',secretField:'integrationSecret'
  });
});

test('configuración legacy de Apps Script mantiene compatibilidad con preview', () => {
  assert.deepEqual(resolveAppsScriptConfig({PREVIEW_APPS_SCRIPT_URL:'https://preview.example/exec',PREVIEW_APPS_SCRIPT_SECRET:'secret'}),{
    url:'https://preview.example/exec',secret:'secret',secretField:'previewSecret'
  });
});

test('Apps Script incompleto falla cerrado', () => {
  assert.throws(()=>resolveAppsScriptConfig({APPS_SCRIPT_URL:'https://prod.example/exec'}),/incompleta/);
  assert.throws(()=>resolveAppsScriptConfig({PREVIEW_APPS_SCRIPT_SECRET:'secret'}),/incompleta/);
});

// Caso A: comprar A → volver → elegir B → comprar B. Dos intenciones de
// compra distintas para el mismo caso deben registrarse como eventos
// diferentes, con el producto final correcto y sin perder la recomendación.
test('caso A: comprar A y luego B genera dos intenciones de compra distinguibles', () => {
  const afterA = {caseId:'case-a',recommendedProduct:'walk',decision:'purchase',selectedProduct:'walk',paymentStatus:'checkout_created',intentRevision:1};
  const recordB = validateCase({...payload('lift'),recommendedProduct:'walk'});
  const transition = classifyIntentTransition(afterA, recordB);
  assert.equal(transition.eventType,'purchase_intent_updated');
  assert.equal(transition.previousProduct,'walk');
  assert.equal(recordB.selectedProduct,'lift');
  assert.equal(recordB.recommendedProduct,'walk');
});

// Caso B: comprar A → volver desde MP → "Solo quería conocer la solución".
// El historial debe reflejar que hubo intención de compra, pero la decisión
// actual pasa a information_only sin quedar como si todavía quisiera comprar.
test('caso B: de intención de compra a information_only marca la decisión actual sin borrar el historial', () => {
  const afterPurchaseIntent = {caseId:'case-b',recommendedProduct:'walk',decision:'purchase',selectedProduct:'walk',paymentStatus:'checkout_created',intentRevision:1};
  const recordInfoOnly = validateCase({...payload('walk'),decision:'information_only',buyNowSelected:false,informationOnlySelected:true});
  const transition = classifyIntentTransition(afterPurchaseIntent, recordInfoOnly);
  assert.equal(transition.eventType,'information_only_updated');
  assert.equal(transition.previousDecision,'purchase');
  assert.equal(recordInfoOnly.decision,'information_only');
});

// Caso C: information_only → volver → Comprar ahora. Debe generar una nueva
// intención de compra (no queda "atascado" en information_only).
test('caso C: de information_only a comprar ahora vuelve a generar intención de compra', () => {
  const afterInfoOnly = {caseId:'case-c',recommendedProduct:'walk',decision:'information_only',selectedProduct:'walk',paymentStatus:'not_started',intentRevision:2};
  const recordPurchase = validateCase({...payload('walk'),decision:'purchase',buyNowSelected:true,informationOnlySelected:false});
  const transition = classifyIntentTransition(afterInfoOnly, recordPurchase);
  assert.equal(transition.eventType,'purchase_intent_updated');
  assert.equal(transition.previousDecision,'information_only');
});

// Caso D: refresh/pageshow/back sin ninguna decisión nueva. Debe ser un
// no-op total: sin evento, sin revisión nueva, sin email.
test('caso D: reenviar el mismo caso sin cambios no genera ninguna transición', () => {
  const unchanged = {caseId:'case-d',recommendedProduct:'walk',decision:'purchase',selectedProduct:'walk',paymentStatus:'checkout_created',intentRevision:3};
  const sameRecord = validateCase(payload('walk'));
  assert.equal(classifyIntentTransition(unchanged, sameRecord), null);
});

// El "Estado actual" del mail es la intención comercial (currentIntent), no
// el estado técnico del caso (lead_created) ni un valor crudo de payment.
test('las etiquetas de intención distinguen los tres mails del flujo A→B→information_only', () => {
  assert.deepEqual(intentStatusLabels('purchase_intent_unconfirmed','purchase'),{intentLabel:'Intención de compra',paymentLabel:'No confirmado'});
  assert.deepEqual(intentStatusLabels('purchase_intent_updated','purchase'),{intentLabel:'Intención de compra actualizada',paymentLabel:'No confirmado'});
  assert.deepEqual(intentStatusLabels('information_only_updated','information_only'),{intentLabel:'Solicitud de información',paymentLabel:'Sin pago'});
  assert.deepEqual(intentStatusLabels('lead_without_purchase','information_only'),{intentLabel:'Solicitud de información',paymentLabel:'Sin pago'});
});
