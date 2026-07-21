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
  fab_interes_studio: 60
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
      sanitizeForSheet(data.fab_interes_studio)
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
      'Fabricante: zona de cobertura', 'Fabricante: formatos técnicos', 'Fabricante: interés en Studio'
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
