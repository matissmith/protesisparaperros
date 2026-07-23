/**
 * Ache Innovation — Recepción de leads del formulario de protesisparaperros.com.ar
 * ---------------------------------------------------------------------------
 * Qué hace: recibe el POST del formulario de la landing, guarda una fila por
 * lead en un Google Sheet y responde en JSON.
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
 * 5. Al implementar, Google va a pedir que autorices el acceso a Sheets.
 *    Es normal, es tu propio script.
 * 6. Te va a dar una URL que termina en "/exec". Copiala.
 * 7. Pegá esa URL en index.html, buscá la constante LEADS_ENDPOINT
 *    (arriba del todo del <script> principal) y reemplazá el texto
 *    'REEMPLAZAR_CON_URL_APPS_SCRIPT' por esa URL, entre comillas.
 * 8. Probá: mandá una consulta de prueba desde la landing y confirmá que
 *    aparece una fila nueva en el Sheet.
 * 9. Configurá NOTIFY_EMAIL en Configuración del proyecto > Propiedades del
 *    script y ejecutá crearTriggerNotificaciones() una sola vez. El aviso se
 *    procesa fuera de doPost() para no demorar la respuesta del formulario.
 *
 * Si más adelante cambiás algo de este script, hay que volver a
 * "Implementar > Gestionar implementaciones > editar (lápiz) > Nueva versión"
 * para que el cambio se aplique a la URL ya publicada.
 */

const SHEET_NAME = 'Leads';
const GENERIC_ERROR = 'No se pudo procesar la consulta.';
const HEADERS_SCHEMA_VERSION = 'unified-intake-notifications-v1';
const HEADERS_SCHEMA_PROPERTY = 'LEADS_HEADERS_SCHEMA';
const NOTIFY_EMAIL = "matiassmith98@gmail.com";
const NOTIFICATION_BATCH_SIZE = 10;
const NOTIFICATION_HANDLER = 'procesarNotificacionesPendientes';
const QUERY_HEADERS = Object.freeze([
  'Producto de interés',
  'Situación del perro',
  'Evaluación veterinaria',
  'Provincia',
  'Detalle según producto'
]);
const NOTIFICATION_HEADERS = Object.freeze([
  'Estado de notificación',
  'Fecha de notificación',
  'Error de notificación'
]);
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
  utm_campaign: 200,
  // --- Extensión aditiva (stepper de caso + formulario profesional) ---
  // No se reordenan ni eliminan los campos de arriba. Todo lo nuevo va acá.
  audience: 40,
  tipo: 20,
  // Formulario de caso (stepper)
  nombre_perro: 120,
  edad: 60,
  provincia: 120,
  ciudad: 120,
  situacion: 300,
  evaluado_vet: 60,
  estado_actual: 120,
  etapa: 120,
  extremidad_afectada: 60,
  amputacion_realizada: 20,
  munon: 20,
  fotos_disponibles: 60,
  diagnostico: 300,
  soporte_actual: 300,
  dificultad_principal: 500,
  apoya_4_patas: 20,
  asistencia: 20,
  extremidades_afectadas: 60,
  movilidad_parcial: 20,
  solucion_actual: 300,
  descripcion: 3000,
  intencion: 200,
  whatsapp: 120,
  email: 200,
  medio_contacto: 60,
  horario: 120,
  consentimiento_compartir: 30,
  newsletter: 30,
  // Formulario profesional
  rol_profesional: 120,
  especialidad: 200,
  institucion: 200,
  pais: 120,
  casos_mes: 60,
  experiencia_amputaciones: 60,
  experiencia_dispositivos: 60,
  forma_registro: 300,
  forma_compartir: 300,
  dificultad_principal_prof: 500,
  interes_probar: 60,
  interes_derivar: 60,
  interes_asesor: 60,
  interes_fabricar: 60,
  interes_alianza: 60,
  interes_demo: 60,
  fab_dispositivos: 300,
  fab_materiales: 300,
  fab_capacidad: 120,
  fab_zona: 200,
  fab_formatos: 200,
  fab_interes_studio: 60,
  // Formulario corto de prótesis (vista histórica)
  tiempo_transcurrido: 60,
  // Formulario definitivo de consultas (columnas aditivas al final)
  producto_interes: 120,
  situacion_perro: 300,
  evaluacion_veterinaria: 40,
  detalle_producto: 200
});

function doPost(e) {
  try {
    const data = validateAndNormalize(parseBody(e));
    const sheet = getOrCreateSheet();
    sheet.appendRow([
      new Date(),
      sanitizeForSheet(data.producto),
      sanitizeForSheet(data.nombre),
      forceTextForSheet(data.contacto),
      sanitizeForSheet(data.raza),
      sanitizeForSheet(data.raza_detalle),
      sanitizeForSheet(data.zona),
      sanitizeForSheet(data.tamano),
      sanitizeForSheet(data.mensaje),
      sanitizeForSheet(data.consentimiento),
      sanitizeForSheet(data.pagina),
      sanitizeForSheet(data.utm_source),
      sanitizeForSheet(data.utm_medium),
      sanitizeForSheet(data.utm_campaign),
      // --- columnas nuevas, aditivas, mismo orden que el bloque nuevo de FIELD_LIMITS ---
      sanitizeForSheet(data.audience),
      sanitizeForSheet(data.tipo),
      sanitizeForSheet(data.nombre_perro),
      sanitizeForSheet(data.edad),
      sanitizeForSheet(data.provincia),
      sanitizeForSheet(data.ciudad),
      sanitizeForSheet(data.situacion),
      sanitizeForSheet(data.evaluado_vet),
      sanitizeForSheet(data.estado_actual),
      sanitizeForSheet(data.etapa),
      sanitizeForSheet(data.extremidad_afectada),
      sanitizeForSheet(data.amputacion_realizada),
      sanitizeForSheet(data.munon),
      sanitizeForSheet(data.fotos_disponibles),
      sanitizeForSheet(data.diagnostico),
      sanitizeForSheet(data.soporte_actual),
      sanitizeForSheet(data.dificultad_principal),
      sanitizeForSheet(data.apoya_4_patas),
      sanitizeForSheet(data.asistencia),
      sanitizeForSheet(data.extremidades_afectadas),
      sanitizeForSheet(data.movilidad_parcial),
      sanitizeForSheet(data.solucion_actual),
      sanitizeForSheet(data.descripcion),
      sanitizeForSheet(data.intencion),
      forceTextForSheet(data.whatsapp),
      sanitizeForSheet(data.email),
      sanitizeForSheet(data.medio_contacto),
      sanitizeForSheet(data.horario),
      sanitizeForSheet(data.consentimiento_compartir),
      sanitizeForSheet(data.newsletter),
      sanitizeForSheet(data.rol_profesional),
      sanitizeForSheet(data.especialidad),
      sanitizeForSheet(data.institucion),
      sanitizeForSheet(data.pais),
      sanitizeForSheet(data.casos_mes),
      sanitizeForSheet(data.experiencia_amputaciones),
      sanitizeForSheet(data.experiencia_dispositivos),
      sanitizeForSheet(data.forma_registro),
      sanitizeForSheet(data.forma_compartir),
      sanitizeForSheet(data.dificultad_principal_prof),
      sanitizeForSheet(data.interes_probar),
      sanitizeForSheet(data.interes_derivar),
      sanitizeForSheet(data.interes_asesor),
      sanitizeForSheet(data.interes_fabricar),
      sanitizeForSheet(data.interes_alianza),
      sanitizeForSheet(data.interes_demo),
      sanitizeForSheet(data.fab_dispositivos),
      sanitizeForSheet(data.fab_materiales),
      sanitizeForSheet(data.fab_capacidad),
      sanitizeForSheet(data.fab_zona),
      sanitizeForSheet(data.fab_formatos),
      sanitizeForSheet(data.fab_interes_studio),
      // --- columnas aditivas: formulario definitivo de consultas ---
      sanitizeForSheet(data.tiempo_transcurrido),
      sanitizeForSheet(data.producto_interes),
      sanitizeForSheet(data.situacion_perro),
      sanitizeForSheet(data.evaluacion_veterinaria),
      sanitizeForSheet(data.provincia),
      sanitizeForSheet(data.detalle_producto),
      'Pendiente',
      '',
      ''
    ]);

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
  if (data.tipo === 'caso') validateCaseInquiry(data, raw);

  return data;
}

function validateCaseInquiry(data, raw) {
  const detailsByProduct = {
    'Prótesis': [
      'La amputación ya fue realizada',
      'La amputación está indicada o en evaluación',
      'Nació sin parte de una extremidad',
      'No estoy seguro'
    ],
    'Órtesis': [
      'Pata delantera', 'Pata trasera', 'Rodilla', 'Codo',
      'Carpo o tarso', 'Columna o cuello', 'No estoy seguro'
    ],
    'Arnés de rehabilitación': [
      'Ayuda para levantarse', 'Ayuda para caminar', 'Soporte de la parte trasera',
      'Soporte de la parte delantera', 'Recuperación posoperatoria',
      'Soporte general', 'No estoy seguro'
    ],
    'Carro ortopédico': [
      'Patas traseras', 'Patas delanteras', 'Las cuatro patas', 'No estoy seguro'
    ],
    'No estoy seguro': [
      'Le falta total o parcialmente una extremidad',
      'Necesita soporte en una pata o articulación',
      'Necesita ayuda para levantarse o caminar',
      'Tiene dificultades para usar dos o más patas',
      'Ninguna de estas',
      'No estoy seguro'
    ]
  };
  const provinces = [
    'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Ciudad Autónoma de Buenos Aires',
    'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
    'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis',
    'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
    'Tierra del Fuego, Antártida e Islas del Atlántico Sur', 'Tucumán'
  ];
  const situationLength = String(raw.situacion_perro || '').trim().length;

  if (!detailsByProduct[data.producto_interes]) throw new Error('Producto de interés inválido.');
  if (situationLength < 10 || situationLength > 300) throw new Error('Situación del perro inválida.');
  if (['Sí', 'No', 'Está en evaluación'].indexOf(data.evaluacion_veterinaria) === -1) {
    throw new Error('Evaluación veterinaria inválida.');
  }
  if (!data.whatsapp) throw new Error('WhatsApp requerido.');
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw new Error('Email inválido.');
  if (!data.ciudad) throw new Error('Ciudad requerida.');
  if (provinces.indexOf(data.provincia) === -1) throw new Error('Provincia inválida.');
  if (detailsByProduct[data.producto_interes].indexOf(data.detalle_producto) === -1) {
    throw new Error('Detalle según producto inválido.');
  }
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

// Fuerza texto plano en Sheets (evita que números puramente numéricos como
// "0000000000" pierdan ceros a la izquierda al convertirse a Number). El
// apóstrofo inicial no se muestra: Sheets lo interpreta como marca de texto,
// igual que ya hace sanitizeForSheet para valores que empiezan con =+-@.
function forceTextForSheet(value) {
  const text = value === undefined || value === null ? '' : String(value);
  return "'" + text;
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Fecha', 'Producto', 'Nombre', 'Contacto', 'Raza', 'Raza detalle',
      'Zona afectada', 'Tamaño/peso', 'Mensaje', 'Consentimiento', 'Página',
      'utm_source', 'utm_medium', 'utm_campaign',
      'Audience', 'Tipo', 'Nombre del perro', 'Edad', 'Provincia', 'Ciudad',
      'Situación actual', 'Evaluado por veterinario', 'Estado actual', 'Etapa',
      'Extremidad afectada', 'Amputación realizada', 'Tiene muñón', 'Fotos/estudios disponibles',
      'Diagnóstico', 'Soporte actual', 'Dificultad principal', 'Apoya 4 patas', 'Nivel de asistencia',
      'Extremidades afectadas', 'Movilidad parcial', 'Solución actual', 'Descripción del caso',
      'Intención del usuario', 'WhatsApp', 'Email', 'Medio de contacto preferido', 'Horario preferido',
      'Consentimiento compartir', 'Consentimiento novedades',
      'Rol profesional', 'Especialidad', 'Institución', 'País', 'Casos de rehab por mes',
      'Experiencia amputaciones', 'Experiencia dispositivos', 'Forma de registro actual',
      'Forma de compartir con fabricantes', 'Principal dificultad (profesional)',
      'Interés: probar plataforma', 'Interés: derivar casos', 'Interés: asesor',
      'Interés: fabricar', 'Interés: alianza', 'Interés: demo',
      'Fabricante: dispositivos', 'Fabricante: materiales', 'Fabricante: capacidad',
      'Fabricante: zona de cobertura', 'Fabricante: formatos técnicos', 'Fabricante: interés en Studio',
      'Tiempo transcurrido aproximado',
      'Producto de interés', 'Situación del perro', 'Evaluación veterinaria',
      'Provincia', 'Detalle según producto',
      'Estado de notificación', 'Fecha de notificación', 'Error de notificación'
    ]);
    sheet.setFrozenRows(1);
    markHeadersReady();
  } else if (!headersAreMarkedReady()) {
    ensureQueryHeaders(sheet);
    markHeadersReady();
  }
  return sheet;
}

function headersAreMarkedReady() {
  return PropertiesService.getScriptProperties().getProperty(HEADERS_SCHEMA_PROPERTY) === HEADERS_SCHEMA_VERSION;
}

function markHeadersReady() {
  PropertiesService.getScriptProperties().setProperty(HEADERS_SCHEMA_PROPERTY, HEADERS_SCHEMA_VERSION);
}

function ensureQueryHeaders(sheet) {
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const existing = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  const fullSuffix = QUERY_HEADERS.concat(NOTIFICATION_HEADERS);
  if (endsWithHeaders(existing, fullSuffix)) return;

  const missing = endsWithHeaders(existing, QUERY_HEADERS)
    ? NOTIFICATION_HEADERS
    : fullSuffix;
  sheet.getRange(1, lastColumn + 1, 1, missing.length).setValues([missing]);
}

function endsWithHeaders(existing, required) {
  const tail = existing.slice(-required.length);
  return required.every(function(header, index) {
    return tail[index] === header;
  });
}

function procesarNotificacionesPendientes() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;

  try {
    const sheet = getOrCreateSheet();
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    const lastColumn = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
    const columns = mapHeaderColumns(headers);
    const statusColumn = columns['Estado de notificación'];
    const dateColumn = columns['Fecha de notificación'];
    const errorColumn = columns['Error de notificación'];
    if (statusColumn === undefined || dateColumn === undefined || errorColumn === undefined) {
      throw new Error('Faltan columnas de notificación.');
    }

    const notifyEmail = NOTIFY_EMAIL;
    const rows = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
    let processed = 0;

    for (let index = 0; index < rows.length && processed < NOTIFICATION_BATCH_SIZE; index += 1) {
      const row = rows[index];
      if (String(row[statusColumn] || '').trim() !== 'Pendiente') continue;

      const rowNumber = index + 2;
      sheet.getRange(rowNumber, statusColumn + 1).setValue('Procesando');
      SpreadsheetApp.flush();

      try {
        if (!notifyEmail || !notifyEmail.trim()) {
          throw new Error('NOTIFY_EMAIL no está configurado.');
        }
        enviarNotificacionLead(row, columns, notifyEmail.trim());
        sheet.getRange(rowNumber, statusColumn + 1, 1, 3)
          .setValues([['Enviado', new Date(), '']]);
      } catch (err) {
        const errorMessage = String(err && err.message ? err.message : err).slice(0, 200);
        sheet.getRange(rowNumber, statusColumn + 1, 1, 3)
          .setValues([['Error', '', sanitizeForSheet(errorMessage)]]);
        console.error('No se pudo enviar la notificación de la fila ' + rowNumber + '.', err);
      }
      processed += 1;
    }
  } finally {
    lock.releaseLock();
  }
}

function mapHeaderColumns(headers) {
  const columns = {};
  headers.forEach(function(header, index) {
    columns[String(header)] = index;
  });
  return columns;
}

function rowValue(row, columns, preferredHeaders) {
  for (let index = 0; index < preferredHeaders.length; index += 1) {
    const column = columns[preferredHeaders[index]];
    if (column !== undefined && row[column] !== '') return String(row[column]);
  }
  return '-';
}

function enviarNotificacionLead(row, columns, notifyEmail) {
  const product = rowValue(row, columns, ['Producto de interés', 'Producto']);
  const name = rowValue(row, columns, ['Nombre']);
  const subject = 'Nuevo lead — ' + product + ' (' + name + ')';
  const body = [
    'Producto: ' + product,
    'Nombre: ' + name,
    'WhatsApp: ' + rowValue(row, columns, ['WhatsApp', 'Contacto']),
    'Email: ' + rowValue(row, columns, ['Email']),
    'Ciudad: ' + rowValue(row, columns, ['Ciudad']),
    'Provincia: ' + rowValue(row, columns, ['Provincia']),
    'Situación: ' + rowValue(row, columns, ['Situación del perro', 'Mensaje']),
    'Evaluación veterinaria: ' + rowValue(row, columns, ['Evaluación veterinaria']),
    'Detalle: ' + rowValue(row, columns, ['Detalle según producto']),
    '',
    'Página: ' + rowValue(row, columns, ['Página'])
  ].join('\n');

  MailApp.sendEmail({
    to: notifyEmail,
    subject: subject,
    body: body
  });
}

function crearTriggerNotificaciones() {
  const exists = ScriptApp.getProjectTriggers().some(function(trigger) {
    return trigger.getHandlerFunction() === NOTIFICATION_HANDLER;
  });
  if (exists) return;

  ScriptApp.newTrigger(NOTIFICATION_HANDLER)
    .timeBased()
    .everyMinutes(1)
    .create();
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
