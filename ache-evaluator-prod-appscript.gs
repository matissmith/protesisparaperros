const PROD_SHEET_NAME = 'Evaluador Producción';
const PROD_EMAIL_SHEET_NAME = 'Evaluador Producción Emails';
const PROD_HEADERS = [
  'eventType','caseId','createdAt','receivedAt','dogName','dogAgeValue','dogAgeUnit','dogWeightRange','needSelected','recommendedProduct','selectedProduct','productChanged',
  'priceMin','priceMax','priceDisplay','reservationAmount','decision','buyerName','country','countryCode','whatsappRaw','whatsappNormalized','email','city','priceAndTermsViewed',
  'buyNowSelected','informationOnlySelected','contactCompleted','checkoutViewed','paymentStarted','paymentStatus','paymentId','amountPaid','followUpType','followUpStatus',
  'eventHistory','lastEventAt'
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const properties = PropertiesService.getScriptProperties();
    const expectedSecret = properties.getProperty('APP_SECRET');
    if (!expectedSecret || data.integrationSecret !== expectedSecret) return prodJson_({ ok: false, error: 'Unauthorized' });
    if (!data.caseId) return prodJson_({ ok: false, error: 'Missing caseId' });
    const result = prodUpsert_(data, properties);
    const emailSent = prodNotifyOnce_(data, properties);
    return prodJson_({ ok: true, row: result.row, created: result.created, emailSent: emailSent });
  } catch (error) {
    return prodJson_({ ok: false, error: String(error && error.message || error) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function prodSpreadsheet_(properties) {
  const spreadsheetId = properties.getProperty('PROD_SPREADSHEET_ID');
  if (!spreadsheetId) throw new Error('Falta PROD_SPREADSHEET_ID');
  return SpreadsheetApp.openById(spreadsheetId);
}

function prodSheet_(properties) {
  const spreadsheet = prodSpreadsheet_(properties);
  let sheet = spreadsheet.getSheetByName(PROD_SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(PROD_SHEET_NAME);
  if (sheet.getLastRow() === 0) { sheet.appendRow(PROD_HEADERS); sheet.setFrozenRows(1); }
  return sheet;
}

function prodUpsert_(data, properties) {
  const sheet = prodSheet_(properties);
  const now = new Date().toISOString();
  const caseColumn = PROD_HEADERS.indexOf('caseId') + 1;
  const finder = sheet.getRange(2, caseColumn, Math.max(sheet.getLastRow() - 1, 1), 1).createTextFinder(String(data.caseId)).matchEntireCell(true).findNext();
  const row = finder ? finder.getRow() : sheet.getLastRow() + 1;
  const previous = finder ? sheet.getRange(row, 1, 1, PROD_HEADERS.length).getValues()[0] : new Array(PROD_HEADERS.length).fill('');
  const previousByHeader = {};
  PROD_HEADERS.forEach((header, index) => { previousByHeader[header] = previous[index]; });
  const historyEntry = `${now}:${data.eventType || 'unknown'}:${data.paymentStatus || data.status || ''}`;
  const eventHistory = previousByHeader.eventHistory ? `${previousByHeader.eventHistory}\n${historyEntry}` : historyEntry;
  const values = PROD_HEADERS.map(header => {
    if (header === 'receivedAt' || header === 'lastEventAt') return now;
    if (header === 'eventHistory') return eventHistory;
    return Object.prototype.hasOwnProperty.call(data, header) ? prodSafe_(data[header]) : previousByHeader[header];
  });
  sheet.getRange(row, 1, 1, PROD_HEADERS.length).setValues([values]);
  return { row: row, created: !finder };
}

function prodEmailSheet_(properties) {
  const spreadsheet = prodSpreadsheet_(properties);
  let sheet = spreadsheet.getSheetByName(PROD_EMAIL_SHEET_NAME);
  if (!sheet) { sheet = spreadsheet.insertSheet(PROD_EMAIL_SHEET_NAME); sheet.appendRow(['emailKey','sentAt','subject']); sheet.setFrozenRows(1); }
  return sheet;
}

function prodNotifyOnce_(data, properties) {
  const destination = properties.getProperty('NOTIFY_EMAIL');
  if (!destination) throw new Error('Falta la propiedad NOTIFY_EMAIL');
  const subjects = {
    lead_without_purchase: `LEAD SIN COMPRA — ${data.selectedProduct || ''} — ${data.buyerName || ''}`,
    purchase_intent_unconfirmed: `INTENCIÓN DE COMPRA — PAGO NO CONFIRMADO — ${data.selectedProduct || ''} — ${data.buyerName || ''}`,
    reservation_paid: `RESERVA PAGADA — ${data.productName || data.selectedProduct || ''} — ${data.buyerName || ''}`
  };
  const subject = subjects[data.eventType];
  if (!subject) return false;
  const emailKey = `${data.caseId}:${data.eventType}:${data.eventType === 'reservation_paid' ? data.paymentId || '' : ''}`;
  const emailSheet = prodEmailSheet_(properties);
  const existing = emailSheet.getRange(2, 1, Math.max(emailSheet.getLastRow() - 1, 1), 1).createTextFinder(emailKey).matchEntireCell(true).findNext();
  if (existing) return false;
  const action = data.eventType === 'reservation_paid'
    ? data.followUpType === 'clinical_15m'
      ? '\nACCIÓN: COORDINAR REUNIÓN DE 15 MINUTOS\n'
      : '\nACCIÓN: CONTACTAR PARA CONTINUAR PEDIDO / MEDIDAS / CONFIGURACIÓN\n'
    : '';
  const body = [
    `Tipo: ${data.eventType || ''}`, `Case ID: ${data.caseId || ''}`, `Comprador: ${data.buyerName || ''}`, `WhatsApp: ${data.whatsappNormalized || ''}`, `Email: ${data.email || ''}`,
    `País: ${data.country || ''}`, `Ciudad: ${data.city || ''}`, `Perro: ${data.dogName || ''}`, `Edad: ${data.dogAgeValue || ''} ${data.dogAgeUnit || ''}`, `Peso: ${data.dogWeightRange || ''}`,
    `Necesidad: ${data.needSelected || ''}`, `Producto recomendado: ${data.recommendedProduct || ''}`, `Producto elegido: ${data.productName || data.selectedProduct || ''}`,
    `Precio total: ${data.priceDisplay || `${data.priceMin || ''}${data.priceMax && data.priceMax !== data.priceMin ? `–${data.priceMax}` : ''}`}`, `Reserva: ${data.reservationAmount || ''}`,
    `Payment ID: ${data.paymentId || ''}`, `Estado: ${data.paymentStatus || data.status || ''}`,
    `followUpType: ${data.followUpType || ''}`, `followUpStatus: ${data.followUpStatus || ''}`, action
  ].join('\n');
  MailApp.sendEmail({ to: destination, subject: subject, body: body });
  emailSheet.appendRow([emailKey, new Date().toISOString(), subject]);
  return true;
}

function prodSafe_(value) {
  if (value === null || typeof value === 'undefined') return '';
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return /^[=+\-@]/.test(text) ? `'${text}` : text.slice(0, 5000);
}

function prodJson_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
