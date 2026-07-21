# SESSION_STATUS — Ache web institucional

Última actualización: 2026-07-21 (Claude)

## Objetivo activo
Reestructurar la landing completa (arquitectura de 17 bloques del prompt de Matías)
para reflejar el estado real de cada línea de producto, diferenciar tutor/profesional,
y preparar un experimento de validación de mercado. Tarea grande, créditos limitados
→ se prioriza arquitectura + copy + formularios funcionales antes que pulido visual.

## Repo activo
`/Users/matia/Documents/Ache Innovation/02_Web_Institucional/protesisparaperros`
Rama `main`, HEAD en `91e0e44` al iniciar esta sesión (working tree limpio).

## Estructura técnica encontrada
- Único archivo `index.html` (HTML/CSS/JS inline, sin build step, sin framework).
- `build.sh` solo copia `index.html` + `assets/` a `dist/` (sin bundler).
- Leads: POST a Google Apps Script (`ache-leads-appscript.gs`, no trackeado antes,
  ahora sí versionado). Whitelist estricta de campos (`FIELD_LIMITS`): campos no
  incluidos se descartan silenciosamente (no rompe nada, pero tampoco llegan al Sheet).
- Analytics: GA4 + Meta Pixel con placeholders de ID (`GA_MEASUREMENT_ID`, `META_PIXEL_ID`)
  sin reemplazar todavía — no es parte de esta tarea reemplazarlos, solo agregar eventos.
- Assets disponibles: `hero.png`, `protesis.png`, `ortesis.png`, `carro.png`, `arnes.png`,
  `software-ui.png`, logo `ache-logo.svg`, fuente `conthrax-sb.ttf`. **No hay fotos de
  equipo** (Matías/Lucas/Josefina) ni logos de programas (IncuBAte/EmprendING/NAVES) en
  `assets/` → se usan iniciales/placeholders prolijos, no fotos inventadas, y los
  programas se listan como texto/badges (no hay logo real que insertar).
- WhatsApp real ya configurado: `+549 11 2319-9500` (`wa.me/5491123199500`), reutilizado tal cual.

## Componentes reutilizables identificados
- Sistema de variables CSS (`--navy`, `--amber`, `--maxw`, etc.), `.btn-pri/.btn-ghost`,
  `.sol` (tarjetas de producto con imagen + fallback `onerror`), `.reveal` (fade-in),
  `.step`/`.como-grid`, `.form-card`/`.field`, `.problem-section`, `.tech-clean`/
  `.studio-access-card`, footer completo, WhatsApp float.
- Se reutiliza el patrón `onload/onerror` de imágenes de producto (turnkey, sin placeholders vacíos).

## Riesgos detectados
1. El formulario actual es de un solo paso; el nuevo pedido exige stepper real de 3 pasos
   con campos condicionales por producto + un formulario profesional separado → mucho más
   campos de los que el Apps Script actual acepta. Se extiende `FIELD_LIMITS`/columnas del
   `.gs` de forma aditiva (mismo orden de columnas viejas + nuevas al final) para no romper
   compatibilidad, pero **no se publica ni se despliega** ese script en esta tarea (regla
   explícita). Matías deberá redeployar manualmente para que los campos nuevos lleguen al Sheet.
2. Alcance del prompt es muy superior al tamaño actual del sitio (17 secciones vs. ~8
   actuales). Se prioriza completitud funcional y coherencia visual por sobre
   microanimaciones, tal como indica la regla 12 del pedido.
3. Dado el volumen, se comprime el número de commits reales respecto al ideal de 4 fases
   (para no gastar créditos re-leyendo/re-diffeando el mismo archivo gigante muchas veces),
   pero se documenta cada bloque de trabajo acá igual.

## Plan de ejecución
- Fase 1 (estructura+contenido+sistema visual+formularios, en un solo pase de escritura
  por ser un archivo único interdependiente): reescribir `index.html` completo con las 17
  secciones, copy exacto del prompt, stepper de 3 pasos, formulario profesional separado,
  FAQ en acordeón nativo `<details>`, eventos de analytics sin PII.
- Extender `ache-leads-appscript.gs` de forma aditiva (sin deploy).
- Validar: `bash build.sh`, una captura desktop y una mobile (herramienta de preview),
  un test funcional de avance/retroceso del stepper y apertura de FAQ.
- Commit(s) local(es) de respaldo. Sin push, sin deploy.

## Archivos que se van a tocar
- `index.html` (reescritura completa)
- `ache-leads-appscript.gs` (extensión aditiva de campos, sin deploy)
- `SESSION_STATUS.md` (este archivo)

## Archivos que NO se tocan
- `AGENTS.md`, `build.sh`, `assets/*` (solo lectura), software Streamlit/CAD (no aplica a este repo).

---

## 2026-07-21 — Corte por límite de créditos (Claude), Fase 1 EN CURSO (no cerrada)

### Qué se inspeccionó en este corte
- `git diff --stat` y `git diff --check` sobre el working tree: sin conflictos ni
  problemas de whitespace. `SESSION_STATUS.md` (+189/-… reescrito) e `index.html`
  (+858/-349 aprox., reescritura estructural grande).
- Validación mínima sin servidor (Python, sin abrir navegador):
  - Balance de tags `section`/`form`/`div`/`details`: OK (15/15, 2/2, 222/222, 11/11).
  - Un solo `id="contacto"` (el de la sección Cierre) y un solo `id="contacto-caso"`
    (el del formulario de caso nuevo) → sin IDs duplicados en todo el archivo.
  - Sin restos de `leadForm` (el id viejo del formulario, ya reemplazado).
  - `<style>`/`<script>` balanceados (1/1 y 4/4).
  - `python html.parser` no reportó errores de parseo (chequeo laxo, no valida
    anidamiento estricto, pero no se rompió).
- **Bug real encontrado y corregido en este corte**: se usaba `acheTrack(...)` en 32
  lugares (botones del stepper, CTAs, FAQ, submits) pero la función nunca estaba
  definida → hubiera tirado `ReferenceError` en el primer click y, en el caso del
  botón "Continuar" del stepper, habría cortado la ejecución antes de llegar a
  `goToStep(...)`, rompiendo el avance del formulario. Se agregó la definición de
  `acheTrack(name, params)` junto a `trackLeadConversion` (~línea 1352 de
  `index.html`), con `try/catch` para que nunca rompa la interacción que la dispara.
  Es la única corrección funcional aplicada en este corte; no se tocó nada visual.

### Qué se modificó de la Fase 1 (arquitectura + contenido) hasta este corte
Reescritura completa de `index.html` sobre el archivo único existente (sin cambiar
tecnología ni build). Bloques ya reescritos con el copy del prompt, en este orden:
1. Nav (enlaces: Dispositivos / Cómo trabajamos / Biomechanics Studio / Para
   profesionales / Sobre Ache; botón "Evaluar un caso").
2. Hero (eyebrow, h1, lead, CTAs, hero-stats, prueba de confianza "+120", imagen
   `hero.png` sin cambios de asset).
3. Selector tutor/profesional (`#selector`, nuevo, clases `.path-grid/.path-card`).
4. Problema (`.problem-section`, un solo card oscuro, copy nuevo).
5. Dispositivos (`#dispositivos`, 4 tarjetas reordenadas Prótesis → Arnés → Órtesis →
   Carro, con `.status-badge` por estado real y aclaración por producto).
6. Orientador (`#orientador`, nuevo, `.orient-grid` con inputs radio que precargan
   `productoSel`).
7. Cómo trabajamos (`#como`, 4 pasos con el copy nuevo "Del caso a una propuesta
   concreta").
8. Formulario de caso (`#contacto-caso`, **stepper real de 3 pasos** nuevo:
   `.stepper-progress`, `.step-panel[data-step]`, bloques condicionales por producto
   `.cond-block[data-cond]`, datalist de razas reubicado acá).
9. Qué sucede después (3 tarjetas `.info-card` con los 3 resultados posibles).
10. Biomechanics Studio (`#tecnologia`, copy nuevo + grilla "hoy permite / en
    desarrollo" + aclaración de que no reemplaza al veterinario).
11. Programa piloto profesional (`#profesionales`, 3 roles + "participar implica" /
    "el profesional recibe" + **formulario profesional independiente**
    `#professionalForm` con bloque condicional de fabricante `#fabricanteBlock`).
12. Sobre Ache (`#sobre-ache`, 3 diferenciales).
13. Equipo y red (`#equipo`, 3 tarjetas con iniciales — **no hay fotos reales del
    equipo en `assets/`**, se usó placeholder de iniciales prolijo en vez de foto
    inventada, tal como pide `AGENTS.md`; red "+120" con la formulación exacta
    pedida; programas como badges de texto porque tampoco hay logos reales de
    IncuBAte/EmprendING/NAVES en `assets/`).
14. Contacto directo con Matías (nueva sección, WhatsApp real reutilizado
    `+549 11 2319-9500`, mensaje prellenado exacto del prompt).
15. FAQ (`#faq`, acordeón nativo `<details>/<summary>`, 12 preguntas, dispara
    `faq_open` vía `ontoggle`).
16. Cierre (`id="contacto"` — quedó con este id porque el footer y otros enlaces
    legacy podían apuntar a `#contacto`; 3 tarjetas de acción).
17. Footer (marca, slogan, enlaces nuevos, aclaración + cierre "El futuro de la
    movilidad animal empieza acá"). **Pendiente real**: no existen páginas de
    Política de privacidad / Términos de uso → quedaron como enlaces `href="#"`
    deshabilitados (`onclick="return false"`), documentado acá en vez de inventar
    contenido legal.
- JS: se reescribió toda la lógica de formularios (stepper del caso + formulario
  profesional + condicionales + confirmaciones dinámicas por producto) y se agregó
  `acheTrack()` con los nombres de evento pedidos (`hero_owner_click`,
  `case_form_start`, `case_form_step_N_complete`, `protesis_case_submit`,
  `arnes_preorder_submit`, `ortesis_case_submit`, `carro_research_submit`,
  `professional_form_start/submit`, `manufacturer_interest_submit`,
  `veterinarian_pilot_click`, `professional_demo_click`, `whatsapp_matias_click`,
  `faq_open`). No se envía nombre/teléfono/email/mensaje a analytics en ningún evento.

### Qué falta (no se hizo en este corte, sin excusas)
1. **No se extendió `ache-leads-appscript.gs`** todavía. El formulario nuevo manda
   muchos campos (`nombre_perro`, `edad`, `provincia`, `situacion`, condicionales por
   producto, todo el formulario profesional, etc.) que **no están en el
   `FIELD_LIMITS` actual del script** → el backend actual los va a descartar
   silenciosamente (no rompe nada, pero tampoco llegan al Sheet salvo los campos que
   ya existían antes: `producto`, `nombre`, `contacto`, `raza`, `raza_detalle`,
   `zona`, `tamano`, `mensaje`, `consentimiento`, `pagina`, `utm_*`). **Este es el
   próximo paso concreto**: extender `FIELD_LIMITS`/columnas de forma aditiva (sin
   romper orden viejo, sin deploy) para que el Sheet capture el resto de los campos
   nuevos, y avisar a Matías que hay que redeployar el Apps Script para que tome
   efecto (esta tarea no publica ni despliega ese script).
2. **No se corrió `bash build.sh`** todavía (pendiente, se hace rápido, sin servidor).
3. **No se hizo ninguna captura visual** (ni desktop ni mobile) — se pidió
   explícitamente detener antes de eso. Sigue pendiente 1 validación desktop + 1
   mobile con la herramienta de preview cuando se retome.
4. **No se probó funcionalmente** el avance/retroceso del stepper ni el submit de
   ningún formulario en un navegador real — solo se validó estáticamente (balance de
   tags, IDs únicos, y el bug de `acheTrack` que sí se corrigió). Falta el test
   funcional real (rule: "probar un envío válido, probar validación de errores,
   probar navegación atrás y adelante").
5. Fase 2 (sistema visual/responsive fino) y Fase 4 (analytics/build final) **no
   empezaron**. Fase 3 (formularios) está escrita pero sin probar en navegador.

### Riesgos / dudas conocidas, sin maquillar
- El botón "Sumarme a la preventa" del Cierre hace
  `onclick="document.getElementById('productoSel').value='Arnés'"` pero no llama a
  `toggleProductoCond()` después, así que el bloque condicional de Arnés en el paso 2
  no se activaría automáticamente al llegar por ese link (bug menor de UX, no
  bloqueante, no corregido en este corte por orden explícita de detenerse en
  correcciones no sintácticas).
- No se verificó visualmente si las nuevas clases (`.path-grid`, `.orient-grid`,
  `.team-grid`, `.grid3`, `.grid2`, `.close-grid`, `.faq-item`, etc.) rompen algo en
  mobile — el CSS nuevo tiene un solo bloque `@media(max-width:960px)` que las
  colapsa a 1 columna, pero no fue probado en pantalla real todavía.
- El archivo `index.html` pasó de 1073 a ~2000 líneas aprox.; no se volvió a leer
  completo después del último batch de ediciones (por ahorro de contexto), solo se
  validó con los scripts Python de arriba.

### Último punto estable
Working tree con cambios sin commitear hasta este corte. Se va a crear un commit
local de respaldo inmediatamente después de guardar esta entrada (ver sección git
status más abajo, actualizada a mano tras el commit).

### Próxima acción concreta al retomar
1. Extender `ache-leads-appscript.gs` (aditivo, sin deploy) con los campos nuevos
   listados arriba.
2. Corregir el bug menor del botón "Sumarme a la preventa" (llamar
   `toggleProductoCond()` en su `onclick`, o mover esa lógica a un listener JS).
3. Correr `bash build.sh` y confirmar que `dist/` solo tiene `index.html` + `assets/`.
4. Recién ahí: 1 captura desktop + 1 mobile, y 1 test funcional real del stepper y
   de un submit (éxito y error).
5. Seguir con Fase 2 (visual/responsive) solo si hay créditos después de eso.
