import test from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCT_CATALOG, followUpFor } from '../functions/_shared/catalog.js';
import { resolveAppsScriptConfig, validateCase } from '../functions/_shared/cases.js';
import { mapStatus, verifySignature } from '../functions/api/mercadopago/webhook.js';
import { assertCheckoutEnabled, checkoutUrlForEnvironment, validateMpEnvironment } from '../functions/api/checkout.js';

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

test('registra al no comprador sin mezclarlo con señales de pago', () => {
  const record = validateCase({...payload(),decision:'information_only',buyNowSelected:false,informationOnlySelected:true,paymentStarted:false});
  assert.equal(record.decision,'information_only');
  assert.equal(record.buyNowSelected,false);
  assert.equal(record.informationOnlySelected,true);
  assert.equal(record.paymentStarted,false);
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
