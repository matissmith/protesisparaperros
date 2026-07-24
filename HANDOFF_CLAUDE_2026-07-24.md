# Handoff maestro — Ache Landing — 2026-07-24

Fuente principal de continuidad para Claude Code y futuros agentes. Leer completo
antes de modificar el proyecto.

## A. Resumen del proyecto

Ache Innovation es una startup argentina de movilidad y rehabilitación animal.
La landing institucional presenta prótesis, órtesis, arneses de rehabilitación y
carros ortopédicos, recibe consultas de tutores y deriva profesionales hacia
Ache Biomechanics Studio.

- Landing: `https://protesisparaperros.com.ar/`
- Software: `https://app.protesisparaperros.com.ar/`
- Repo local:
  `/Users/matia/Documents/Ache Innovation/02_Web_Institucional/protesisparaperros`
- Repo remoto: `git@github.com:matissmith/protesisparaperros.git`
- Rama activa: `main`
- Frontend: un único `index.html`, con HTML, CSS y JavaScript inline.
- Backend de leads: `ache-leads-appscript.gs`, desplegado manualmente en Google
  Apps Script y separado del deploy web.
- Deploy web: Cloudflare Pages automático al hacer push a `main`; `build.sh`
  publica únicamente `index.html` y `assets/` en `dist/`.

El piloto tiene dos carriles que no deben mezclarse:

1. Tutores: evaluar casos reales para dispositivos de movilidad.
2. Profesionales: solicitar demo, participar en el piloto y usar Biomechanics
   Studio.

La finalidad no es maximizar formularios: es obtener casos compatibles,
contactables y operativamente atendibles, y validar uso profesional real del
software.

## B. Estado actual de producción

- Último commit en `main`: `c2d8de5` — *Finalize responsive ticker and mobile
  navigation polish*.
- `origin/main`: `c2d8de5`; no hay commits locales por enviar.
- Landing esperada en producción: `https://protesisparaperros.com.ar/`.
- Software: `https://app.protesisparaperros.com.ar/`.
- Cloudflare recibe automáticamente cada push. Este handoff no volvió a abrir
  producción ni el panel; confirmar el deployment `c2d8de5` antes de afirmar
  que Cloudflare lo sirve.
- Último código de Apps Script versionado: commit `d795760`.
- Versión activa de Apps Script: **no confirmada desde el repo**. Requiere mirar
  “Gestionar implementaciones” en el proyecto de Google.
- Endpoint usado por la landing: constante `LEADS_ENDPOINT` en `index.html`,
  URL `/exec` existente. Para continuidad alcanza identificarla como
  `https://script.google.com/macros/s/AKfycby…kRaw/exec`; no copiarla a
  documentación pública.
- Email receptor configurado en el código:
  `matiassmith98@gmail.com`.
- Trigger real: **no confirmado**. El código puede crear uno por minuto mediante
  `crearTriggerNotificaciones()`.

### Rendimiento

- Antes de separar el email se reportaron esperas cercanas a 20 segundos.
- Primer envío con la versión asíncrona: **medición no preservada**.
- Envío caliente: **medición no preservada**.
- Demora real del email: **medición no preservada**. Por diseño depende del
  trigger cada minuto y de MailApp; confirmar con una prueba controlada.

No inventar estos tiempos ni asegurar que el trigger está activo sin revisar el
proyecto real.

## C. Historial resumido de cambios

Orden cronológico de esta etapa:

- `9fb3f14` — simplificó el formulario de prótesis y agregó tiempo transcurrido.
- `283e51d` — hizo reversible el selector de producto y reparó navegación entre
  variantes del formulario.
- `27dba65` — reemplazó variantes por un formulario unificado y adaptativo; amplió
  Apps Script de forma aditiva.
- `7427fac` — corrigió formato de email y mensajes de validación.
- `d3b5562` — cerró validaciones frontend normales y simplificó la confirmación.
- `d795760` — consolidó UX del formulario y notificaciones asíncronas en Apps
  Script. Es el último commit que modificó `ache-leads-appscript.gs`.
- `c3f7e72` — intentó una nueva arquitectura de navegación; produjo CTA
  duplicados, anclas descentradas y un destino profesional incoherente.
- `76a3dfa` — revirtió completamente `c3f7e72`.
- `c2d8de5` — dejó la navegación visual definitiva, menú mobile, anclas y ticker
  responsive de programas.

Contexto visual anterior relevante:

- `4800b2a` restauró el catálogo histórico aprobado.
- `1c96d64` integró el recorrido profesional dentro de Studio.
- `32b2cf9` recuperó el acceso directo al software.
- `f36c181` corrigió Studio en mobile.
- `0b4d02a` redujo los CTA profesionales a dos caminos claros.

## D. Formulario definitivo

Existe un único formulario de consultas para los cinco estados de producto:

- Prótesis
- Órtesis
- Arnés de rehabilitación
- Carro ortopédico
- No estoy seguro

### Campos obligatorios

1. `producto_interes`
2. `situacion_perro` — 10 a 300 caracteres después de `trim()`
3. `evaluacion_veterinaria`
4. `detalle_producto` — opciones dinámicas compatibles con el producto
5. `nombre`
6. `whatsapp`
7. `email`
8. `ciudad`
9. `provincia`
10. `consentimiento`

Al cambiar producto solo cambia la pregunta dinámica. Se borra la respuesta
dinámica anterior y se conservan todos los campos comunes. No hay dos formularios
superpuestos ni `name` duplicados activos.

### Validación frontend

- Producto, evaluación, provincia y detalle se validan contra valores permitidos.
- Situación: vacío, menos de 10 o más de 300 tienen mensajes distintos.
- Nombre: mínimo 3 caracteres y debe contener letras.
- WhatsApp: permite prefijo `+`, espacios, guiones y paréntesis; normaliza antes de
  validar; exige 8–15 dígitos; rechaza letras, símbolos extra y secuencias falsas.
- Email: `type="email"`, `required`, sin espacios, con dominio y punto.
- Ciudad: mínimo 2 caracteres y al menos una letra.
- Consentimiento obligatorio.

Cada campo tiene error inline, `aria-describedby` y `aria-invalid`. Se valida en
`blur`; una vez tocado, vuelve a validarse con `input`/`change`. En submit se
muestran simultáneamente todos los errores y se enfoca el primero. La caja general
queda solo para fallos técnicos.

### Envío y confirmación

- Botón deshabilitado, spinner y texto “Enviando consulta…”.
- Campos temporalmente deshabilitados.
- Guardia contra doble clic y Enter repetido.
- Mensaje único: “Estamos enviando tu consulta. No cierres esta página.”
- Ante error se rehabilita el formulario y se permite reintentar.
- Ante éxito se muestra únicamente la confirmación aprobada, se oculta el
  formulario y el siguiente frame centra/enfoca accesiblemente el mensaje.
- No aparece CTA de WhatsApp después del envío.

### Payload y backend

El payload mantiene compatibilidad histórica:

- `producto = producto_interes`
- `descripcion = situacion_perro`
- `mensaje = situacion_perro`
- `evaluado_vet = evaluacion_veterinaria`
- incluye campos comunes, UTM y los cinco datos finales aditivos.

Apps Script agrega al final de la hoja:

- Producto de interés
- Situación del perro
- Evaluación veterinaria
- Provincia
- Detalle según producto
- Estado de notificación
- Fecha de notificación
- Error de notificación

Se probaron por código y en navegador local: cambios entre productos, conservación
de campos comunes, borrado del detalle, validación inline, bloqueo de doble envío,
estados de carga, desktop y mobile. No enviar consultas reales sin autorización.

**NO VOLVER A REDISEÑAR EL FORMULARIO salvo bug real aprobado por Matías.**

## E. Apps Script y Google Sheets

`doPost()`:

1. acepta parámetros o JSON;
2. valida y normaliza;
3. sanitiza valores contra fórmulas de Sheets;
4. obtiene/crea la hoja y verifica encabezados solo cuando cambia el esquema;
5. agrega una fila completa;
6. deja Estado de notificación = `Pendiente`;
7. responde `{ok:true}` sin ejecutar MailApp.

Errores técnicos se registran en consola; el cliente recibe un mensaje genérico.
No se devuelven detalles internos.

`procesarNotificacionesPendientes()`:

- usa `LockService.getScriptLock()` para impedir concurrencia;
- procesa como máximo 10 filas por ejecución;
- toma solo `Pendiente`;
- marca temporalmente `Procesando`;
- envía por `MailApp` fuera de `doPost()`;
- termina en `Enviado` con fecha o `Error` con mensaje breve;
- no reenvía filas ya marcadas `Enviado`.

`crearTriggerNotificaciones()` comprueba si ya existe el handler y, si falta, crea
un único trigger temporal cada minuto.

Funciones manuales existentes:

- `crearTriggerNotificaciones()`
- `procesarNotificacionesPendientes()`
- `doGet()` como health check simple

Procedimiento futuro si el backend cambia:

1. modificar y revisar estáticamente `ache-leads-appscript.gs`;
2. copiar el archivo completo al proyecto de Apps Script;
3. Gestionar implementaciones → editar → Nueva versión;
4. conservar la misma URL `/exec`;
5. confirmar columnas y trigger;
6. hacer una prueba controlada identificable.

**No crear una nueva versión de Apps Script por cambios exclusivamente visuales o
frontend.**

## F. Navegación actual

Menú aprobado:

- Dispositivos
- Cómo funciona
- Biomechanics Studio
- Sobre Ache
- Evaluar un caso

Anclas visuales:

- `#nav-dispositivos`
- `#nav-como-funciona`
- `#nav-studio`
- `#nav-sobre-ache`
- `#nav-consulta`

Las anclas están en la etiqueta o bloque introductorio visible, no en el `<section>`
antes de su padding.

- Offset desktop: `90px`.
- Header desktop medido: aproximadamente 74 px; aire final ≈16 px.
- Offset mobile: `80px`.
- Header mobile scrolleado: 56 px, con borde inferior en 64 px; aire final ≈16 px.
- Menú mobile contiene exactamente los cinco elementos aprobados.
- “Profesionales” fue eliminado del menú.
- Hay un solo CTA “Evaluar un caso” visible por viewport.
- Los CTA de producto llevan a `#nav-consulta` y preseleccionan el producto.
- Los CTA generales abren con “No estoy seguro”.
- Studio y profesionales permanecen en una sola sección conceptual.

Validación responsive realizada por emulación: iPhone 320/375/390/414/430;
Android 360/393/412; tablets 768/800/820/1024; desktop 1280/1440. No afirmar que
esto equivale a una prueba en iPhone físico.

## G. Banner de programas y FAQ

El banner está al final de Sobre Ache/equipo y funciona como transición hacia FAQ.
Mantiene un rótulo fijo sobre azul oscuro y una pista animada con:

- IncuBAte
- EmprendING
- NAVES IAE
- Empretec

La pista tiene dos grupos idénticos. Cada grupo ocupa 50% de un track de 200% y usa
grid de cuatro columnas iguales. Los nombres quedan centrados; cada punto de 4 px
se posiciona con centro exacto en el límite entre celdas. La animación es lineal,
infinita y viaja de `0` a `-50%`.

Se observaron dos ciclos completos representativos en mobile y desktop sin huecos.
La unión entre grupos quedó en tolerancia subpíxel. `prefers-reduced-motion`
desactiva la animación y oculta el grupo duplicado. Se usa `-webkit-mask-image`
como fallback Safari, pero no hubo prueba en dispositivo iOS físico.

FAQ conserva preguntas y acordeones. Su separación es 64/72 px en mobile y
84/96 px en desktop (arriba/abajo).

## H. Decisiones rechazadas o errores anteriores

- No crear una sección “Profesionales” artificial.
- No poner IDs en el `<section>` antes del padding como destino visual.
- No duplicar CTA desktop/mobile.
- No ocultar problemas de latencia solamente con mensajes.
- No editar Apps Script en cada iteración frontend.
- No usar enlaces legales falsos.
- No eliminar definitivamente Política de privacidad ni Términos: reemplazarlos
  por documentos reales.
- No implementar auditorías teóricas sin revisar el DOM real.
- No afirmar compatibilidad con iPhone físico cuando solo se emuló.
- No volver a experimentar con transiciones, overlays o capas decorativas sin una
  tarea separada.
- No reabrir catálogo, Studio o formulario por detalles menores ya aprobados.

## I. Archivos rectores y auditorías existentes

- `AGENTS.md` — reglas operativas obligatorias del repo. Vigente.
- `SESSION_STATUS.md` — historial largo de sesiones. Útil como referencia, pero
  contiene pendientes antiguos que luego fueron resueltos; este handoff prevalece.
- `RELEASE_CHECKLIST.md` — checklist histórico de publicación. Referencia; algunos
  pasos sobre Apps Script pueden estar desactualizados y deben contrastarse con este
  handoff.
- `/Users/matia/Documents/Ache Innovation/backbone-ache-v1.md` — contrato de
  invariantes del piloto y separación producto/software. Vigente.
- `/Users/matia/Documents/Ache Innovation/research-decision-primer-gate.md` —
  investigación subordinada al backbone. Referencia para decisiones de pauta; no
  redefine producto.
- `/Users/matia/Documents/Ache Innovation/pilot-protesis-operacion-v1.md` —
  protocolo operativo del piloto de prótesis. Vigente para operación.
- `navigation-audit-ache-v1.md` — auditoría que diagnosticó anclas y arquitectura.
  Es referencia histórica: su propuesta de mantener “Profesionales” en el header
  fue descartada; la navegación definitiva es la sección F.
- `footer-audit-ache-v1.md` — auditoría vigente para el próximo bloque. La
  recomendación de retirar enlaces legales es solo transitoria: deben reemplazarse
  por documentos reales.
- `CLAUDE_RESUME_CHECKLIST.md` — checklist operativo breve subordinado a este
  handoff.

No existe `CONTINUAR_PROYECTO.md` dentro de este repo. Hay uno en la carpeta superior
de Ache, pero corresponde a una etapa antigua y no se modificó.

## J. Trabajo pendiente priorizado

### Próximo bloque inmediato — footer

- rediseño visual y estructural;
- navegación actualizada;
- CTA y recursos;
- redes y contacto sin duplicación;
- accesibilidad y foco;
- responsive;
- Política de privacidad real;
- Términos de uso reales;
- política/cookies si corresponde.

Usar `footer-audit-ache-v1.md` como base. Cambiar únicamente el footer y su CSS.

### Después — auditoría legal y de datos

- formularios;
- Apps Script;
- Google Sheets;
- analytics;
- Meta Pixel;
- Google;
- Cloudflare;
- Biomechanics Studio.

### Bloque grande posterior — Biomechanics Studio

- arquitectura;
- interfaz;
- navegación asistida;
- flujo user friendly;
- morfología;
- carga de casos;
- roles;
- seguridad;
- experiencia profesional;
- roadmap técnico.

## K. Reglas para Claude

1. Leer este handoff completo antes de modificar código.
2. Leer `AGENTS.md` si existe.
3. Revisar git status y git log.
4. No asumir que un cambio pendiente está publicado.
5. No tocar Apps Script salvo que el backend realmente lo requiera.
6. No hacer commit, push o deploy sin orden explícita.
7. Modificar un bloque por vez.
8. Probar localmente desktop, iPhone, Android y tablets.
9. Diferenciar emulación de prueba física.
10. Informar archivos modificados y riesgos.
11. No crear parches sobre parches; corregir la causa.
12. Preservar formularios, analytics y endpoints aprobados.
13. No reabrir decisiones ya cerradas sin evidencia de un bug.
14. Mantener `.claude/` fuera de git salvo orden explícita.
15. Responder de manera breve y verificable.
