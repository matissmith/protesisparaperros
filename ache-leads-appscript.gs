/**
 * Ache Innovation — Recepción de leads del formulario de protesisparaperros.com.ar
 * ---------------------------------------------------------------------------
 * Qué hace: recibe el POST del formulario de la landing, guarda una fila por
 * lead en un Google Sheet y (opcional) manda un mail de aviso.
 *
 * CÓMO INSTALARLO (una sola vez, ~5 minutos):
 * 1. Andá a sheets.google.com y creá una hoja nueva. Nombrala, por ejemplo,
 *    "Ache Innovation — Leads".
 * 2. Extensiones > Apps Script.
 * 3. Borrá todo el contenido de "Code.gs" que aparece por default y pegá
 *    ACÁ ADENTRO todo este archivo completo.
 * 4. Arriba a la derecha: Implementar > Nueva implementación.
 *    - Tipo: "Aplicación web".
 *    - Descripción: lo que quieras (ej. "leads landing").
 *    - Ejecutar como: TU cuenta (Yo).
 *    - Quién tiene acceso: "Cualquier usuario" (Anyone) — sin esto el
 *      formulario público no va a poder mandar datos.
 * 5. Al implementar, Google va a pedir que autorices permisos (acceso a tus
 *    Sheets y a mandar mail en tu nombre). Es normal, es tu propio script.
 * 6. Te va a dar una URL que termina en "/exec". Copiala.
 * 7. Pegá esa URL en index.html, buscá la constante LEADS_ENDPOINT
 *    (arriba del todo del <script> principal) y reemplazá el texto
 *    'REEMPLAZAR_CON_URL_APPS_SCRIPT' por esa URL, entre comillas.
 * 8. Probá: mandá una consulta de prueba desde la landing y confirmá que
 *    aparece una fila nueva en el Sheet (y el mail, si lo dejaste activo).
 *
 * Para activar el aviso por mail, configurá la propiedad de script
 * NOTIFY_EMAIL desde Configuración del proyecto > Propiedades del script.
 * Si no existe o está vacía, el lead se guarda igual y no se envía correo.
 *
 * Si más adelante cambiás algo de este script, hay que volver a
 * "Implementar > Gestionar implementaciones > editar (lápiz) > Nueva versión"
 * para que el cambio se aplique a la URL ya publicada.
 */

const SHEET_NAME = 'Leads';
const GENERIC_ERROR = 'No se pudo procesar la consulta.';
const FIELD_LIMITS = Object.freeze({
  producto: 120,
  nombre: 120,
  contacto: 200,
  especie: 80,
  raza: 120,
  raza_detalle: 200,
  zona: 120,
  tamano: 120,
  mensaje: 3000,
  consentimiento: 30,
  pagina: 500,
  utm_source: 200,
  utm_medium: 200,
  utm_campaign: 200
});

function doPost(e) {
  try {
    const data = validateAndNormalize(parseBody(e));
    const sheet = getOrCreateSheet();
    sheet.appendRow([
      new Date(),
      sanitizeForSheet(data.producto),
      sanitizeForSheet(data.nombre),
      sanitizeForSheet(data.contacto),
      sanitizeForSheet(data.raza),
      sanitizeForSheet(data.raza_detalle),
      sanitizeForSheet(data.zona),
      sanitizeForSheet(data.tamano),
      sanitizeForSheet(data.mensaje),
      sanitizeForSheet(data.consentimiento),
      sanitizeForSheet(data.pagina),
      sanitizeForSheet(data.utm_source),
      sanitizeForSheet(data.utm_medium),
      sanitizeForSheet(data.utm_campaign)
    ]);

    try {
      const notifyEmail = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
      if (notifyEmail && notifyEmail.trim()) notify(data, notifyEmail.trim());
    } catch (mailErr) {
      console.error('No se pudo enviar la notificación del lead.', mailErr);
    }

    return jsonResponse({ok: true});
  } catch (err) {
    console.error('No se pudo procesar el lead.', err);
    return jsonResponse({ok: false, error: GENERIC_ERROR});
  }
}

// Solo para poder probar la URL desde el navegador y confirmar que responde.
function doGet(e) {
  return jsonResponse({ok: true, message: 'Ache Innovation — endpoint de leads activo.'});
}

function parseBody(e) {
  if (!e || typeof e !== 'object') throw new Error('Evento POST ausente.');

  const parameters = e.parameter;
  if (parameters && typeof parameters === 'object' && Object.keys(parameters).length) {
    return parameters;
  }

  const contents = e.postData && e.postData.contents;
  if (!contents || typeof contents !== 'string' || !contents.trim()) {
    throw new Error('Cuerpo POST vacío.');
  }

  let parsed;
  try {
    parsed = JSON.parse(contents);
  } catch (err) {
    throw new Error('El cuerpo POST no contiene JSON válido.');
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('El cuerpo POST debe ser un objeto.');
  }
  return parsed;
}

function validateAndNormalize(raw) {
  const data = {};
  Object.keys(FIELD_LIMITS).forEach(function(field) {
    data[field] = limitText(raw[field], FIELD_LIMITS[field]);
  });

  if (!data.nombre) throw new Error('Nombre requerido.');
  if (!data.contacto) throw new Error('Contacto requerido.');
  if (!isValidConsent(raw.consentimiento)) throw new Error('Consentimiento requerido.');

  return data;
}

function limitText(value, maxLength) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') throw new Error('Se recibió un valor no escalar.');
  return String(value).trim().slice(0, maxLength);
}

function isValidConsent(value) {
  if (value === true || value === 1) return true;
  if (value === false || value === 0 || value === undefined || value === null) return false;
  const normalized = String(value).trim().toLowerCase();
  return ['true', '1', 'on', 'yes', 'si', 'sí', 'acepto'].indexOf(normalized) !== -1;
}

function sanitizeForSheet(value) {
  const text = value === undefined || value === null ? '' : String(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Fecha', 'Producto', 'Nombre', 'Contacto', 'Raza', 'Raza detalle',
      'Zona afectada', 'Tamaño/peso', 'Mensaje', 'Consentimiento', 'Página',
      'utm_source', 'utm_medium', 'utm_campaign'
    ]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function notify(data, notifyEmail) {
  const subject = 'Nuevo lead — ' + (data.producto || 'Consulta general') + ' (' + (data.nombre || 'sin nombre') + ')';
  const body = [
    'Producto: ' + (data.producto || '-'),
    'Nombre: ' + (data.nombre || '-'),
    'Contacto: ' + (data.contacto || '-'),
    'Raza: ' + (data.raza || '-') + (data.raza_detalle ? ' (' + data.raza_detalle + ')' : ''),
    'Zona afectada: ' + (data.zona || '-'),
    'Tamaño/peso: ' + (data.tamano || '-'),
    'Mensaje: ' + (data.mensaje || '-'),
    '',
    'Página: ' + (data.pagina || '-'),
    'Origen: ' + ([data.utm_source, data.utm_medium, data.utm_campaign].filter(Boolean).join(' / ') || 'directo'),
    '',
    'Este mail se generó automáticamente desde el formulario de protesisparaperros.com.ar'
  ].join('\n');
  MailApp.sendEmail(notifyEmail, subject, body);
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
