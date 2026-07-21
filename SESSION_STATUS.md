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

---

## 2026-07-21 — Cierre de Fase 1 (Claude, sesión de continuación)

No se releyó `index.html` completo ni se repitió el diagnóstico previo; se retomó
directo desde los pendientes ya documentados arriba.

### Hecho en esta sesión
1. **CTA "Sumarme a la preventa" corregido** (pendiente #2 de arriba): el
   `onclick` ahora hace `productoSel.value='Arnés'` **y** llama a
   `toggleProductoCond()` (con guard `window.toggleProductoCond`) para que el
   bloque condicional de Arnés del paso 2 del stepper se active de entrada, además
   de disparar `product_arnes_click`. Antes solo cambiaba el valor del select sin
   sincronizar el bloque condicional.
2. **Verificación de anclas/IDs**: se extrajeron todos los `href="#id"` del
   documento y se cruzaron contra los `id="..."` existentes (script Python, sin
   abrir navegador). Resultado: **0 anclas rotas** — `dispositivos`, `como`,
   `tecnologia`, `profesionales`, `sobre-ache`, `selector`, `contacto-caso`,
   `profForm` resuelven todos.
3. **`bash build.sh` ejecutado** (1 sola vez, según límite): build OK, sin errores.
4. **Verificación de `dist/`**: contiene `index.html` + `assets/` completo.
   **Hallazgo no bloqueante, no corregido a propósito** (fuera del alcance
   autorizado en esta sesión — no se tocó `build.sh`): `dist/assets/img/` incluye
   `LEEME.txt` y la carpeta `_previas/` (previews viejos de prótesis). Ambos están
   en `.gitignore` para el repo git, pero `build.sh` copia `assets/` tal cual desde
   disco (`cp -R -- assets dist/`), no filtra por gitignore, así que esos archivos
   internos sí terminan en el `dist/` que se serviría públicamente. No impide el
   build ni el funcionamiento de la landing, por eso no se corrigió ahora (regla:
   solo corregir lo que bloquea build/funcionamiento). **Queda pendiente para
   Fase 4** (o antes, si Matías lo prioriza): que `build.sh` excluya
   `assets/img/LEEME.txt` y `assets/img/_previas/` al copiar a `dist/`.
5. **No se tocó `ache-leads-appscript.gs`**: el formulario actual sí puede
   enviarse (los campos que ya existían en `FIELD_LIMITS` —`producto`, `nombre`,
   `contacto`, `raza`, etc.— siguen llegando bien; los nuevos se descartan
   silenciosamente sin error). No hubo incompatibilidad que impidiera el envío en
   absoluto, así que no aplicaba la excepción para tocar ese archivo en esta sesión.

### Estado de Fase 1
**Cerrada como técnicamente estable** dentro del alcance permitido hoy: estructura
de 17 bloques completa, copy del prompt aplicado, anclas verificadas sin roturas,
bug de `acheTrack` (sesión anterior) y bug del CTA de preventa (esta sesión)
corregidos, build corriendo sin errores. **No incluye** validación visual
(desktop/mobile), pruebas funcionales exhaustivas de formularios en navegador real,
ni la extensión de `ache-leads-appscript.gs` — esas siguen abiertas para
Fase 2/3/4 según lo acordado.

### Pendientes explícitos para la próxima sesión
1. Extender `ache-leads-appscript.gs` de forma aditiva (sin deploy) para que los
   campos nuevos del stepper y del formulario profesional lleguen al Sheet.
2. Ajustar `build.sh` para excluir `LEEME.txt` y `_previas/` del `dist/` publicado.
3. Fase 2: revisión visual real (1 desktop + 1 mobile) y ajustes de jerarquía/espaciado.
4. Fase 3: prueba funcional real del stepper (avance/retroceso, campos
   conservados) y de un envío válido + uno con error, en ambos formularios.
5. Fase 4: analytics (reemplazo de IDs placeholder si corresponde) y revisión final.

### Archivos modificados en esta sesión
- `index.html` (1 línea funcional: onclick del CTA de preventa).
- `SESSION_STATUS.md` (esta entrada).
No se tocó `ache-leads-appscript.gs`, `AGENTS.md`, `build.sh` ni `assets/`.

---

## 2026-07-21 — Limpieza de build + revisión visual Fase 2 (Claude, sesión de continuación)

No se releyó todo `index.html` ni se repitió diagnóstico previo. Se retomó directo
sobre `build.sh`, `.gitignore` y fragmentos puntuales de `index.html`.

### Parte A — Limpieza del build
- `build.sh` ahora, después de copiar `assets/` a `dist/`, elimina explícitamente:
  `assets/img/_previas/`, cualquier `*.txt`, `.DS_Store`, `.gitignore`, `*.md` y
  `*.gs` dentro de `dist/`, y purga carpetas ocultas remanentes. No se tocaron los
  archivos originales del repo ni de `assets/`, solo lo que se copia a `dist/`.
- `bash build.sh` corrido una vez. `dist/` verificado: contiene únicamente
  `index.html` + `assets/{ache-logo.svg, fonts/conthrax-sb.ttf, img/{arnes,carro,
  hero,ortesis,protesis,software-ui}.png}`. `LEEME.txt` y `_previas/` confirmados
  ausentes. Pendiente anterior cerrado.

### Parte B — Revisión visual (con limitación de entorno a documentar)
**Chrome (Claude in Chrome) no estaba conectado** en esta sesión — se intentó 2
veces (`tabs_context_mcp`), ambas fallaron con "extension not reachable" (protocolo
de máx. 2 intentos agotado, se documenta en vez de insistir). El servidor de
preview propio (`preview_start`) tampoco funcionó: `python3 -m http.server` crashea
con `PermissionError` en `os.getcwd()` dentro del sandbox que usa esa herramienta,
independientemente de los argumentos pasados (falla en la evaluación default de
`argparse` antes de leer `--directory`). **No hubo capturas reales de desktop ni
mobile en esta sesión.** En su lugar se hizo una revisión de código dirigida a los
puntos del checklist pedido, y se corrigieron 2 problemas reales de alto impacto
encontrados así:
1. **Jerarquía de H2 rota**: el bloque "Ache correction layer 2026-07-20" fijaba el
   tamaño de H2 solo para `#como`, `#soluciones`, `#tecnologia`, `#contacto`. Como
   `#soluciones` ya no existe (ahora es `#dispositivos`) y las secciones nuevas
   (`#selector`, `#orientador`, `#profesionales`, `#sobre-ache`, `#equipo`, `#faq`)
   nunca estuvieron en esa lista, sus H2 iban a caer al tamaño viejo y más grande
   (`clamp(30px,4vw,52px)`, sin tope de `max-width`) en vez del tamaño consistente
   del resto (`clamp(30px,3.2vw,46px)`). Se generalizó el selector a
   `.section h2.display` (desktop y el breakpoint de 768px) para que todos los
   títulos de sección compartan la misma jerarquía, sin achicar Biomechanics Studio
   ni Equipo como pide la regla explícita. Riesgo bajo: es un selector CSS más
   amplio sobre las mismas reglas ya probadas, no un rediseño.
2. **Clase `.form-card-h` sin definir**: se usa 8 veces como separador de bloques
   dentro del stepper de caso y del formulario profesional
   ("Animal y necesidad", "Perfil", "Experiencia", etc.), pero nunca se declaró en
   el CSS → iba a renderizar con estilos default del navegador (tamaño y márgenes
   inconsistentes con el resto del sistema tipográfico). Se agregó una regla simple
   reutilizando tokens existentes (`--amber-dk`, `--line`), con borde superior como
   separador visual entre bloques de un mismo formulario.
- Repaso adicional del checklist por código (sin captura, con el criterio de "bajo
  riesgo, alto impacto" y sin perseguir detalle no bloqueante):
  - Estados PREVENTA/CASOS PILOTO/EN DESARROLLO: colores diferenciados y con
    contraste razonable ya definidos (`.status-piloto` ámbar, `.status-preventa`
    blanco translúcido, `.status-desarrollo` gris) sobre fondo oscuro de
    `.sol-body` — no se detectó texto pegado directo sobre imagen sin scrim (el
    overlay `.sol-media::after` ya oscurece la base de la imagen antes del texto,
    patrón heredado y ya validado en sesiones previas).
  - Stepper: confirmado en código que solo el paso 1 tiene `class="active"` en el
    HTML y que `.step-panel{display:none}` oculta el resto — un paso a la vez,
    estructuralmente correcto.
  - Formulario profesional: no es un stepper (no lo pedía el prompt), pero está
    dividido con los mismos separadores `.form-card-h` en bloques temáticos, no es
    una pared de campos sin agrupar.
  - Secciones nuevas heredan el sistema de padding responsive ya existente
    (`.section.light/.dark`, colapso a 1 columna en grids bajo 960px) sin reglas
    nuevas paralelas — no se detectaron duplicaciones de sistema de espaciado.

### Pendiente real y explícito
**Falta la validación visual real en navegador** (desktop y mobile) — no se pudo
hacer en esta sesión por la falla de tooling descrita arriba, no porque se haya
decidido saltear. Cuando Chrome/preview estén disponibles, es el primer paso a
retomar: 1 captura desktop (1440) + 1 mobile (390) de la landing completa,
especialmente para confirmar visualmente los dos fixes de esta sesión (H2 y
`.form-card-h`) y el resto del checklist de Fase 2 (saturación del hero, distinción
de tarjetas de dispositivos, transiciones sobre texto, botones consistentes).

### Punto exacto para continuar
1. Conseguir un navegador funcional (Chrome extension conectada, o
   `preview_start` con un runtime distinto a `python3 -m http.server` ya que ese
   falla en este sandbox) y hacer la validación visual real pendiente.
2. Si aparecen problemas visuales reales en esa validación, aplicar correcciones
   puntuales (máx. 2 intentos por problema, alto impacto/bajo riesgo, sin
   reconstruir secciones).
3. Recién después: extender `ache-leads-appscript.gs` (aditivo, sin deploy) y
   pruebas funcionales reales de ambos formularios (pendiente de sesiones
   anteriores, sigue abierto).
4. Fase 4: analytics/revisión final.

### Archivos modificados en esta sesión
- `build.sh` (limpieza de `dist/`).
- `index.html` (generalización de la regla de H2 + nueva regla `.form-card-h`).
- `SESSION_STATUS.md` (esta entrada).
No se tocó `ache-leads-appscript.gs`, `AGENTS.md` ni `assets/`.

---

## 2026-07-21 — Corrección de los 3 hallazgos visuales (Claude, sesión de continuación)

No se hizo auditoría nueva ni se tocaron textos/secciones/formularios/analytics/Apps
Script. Solo los 3 problemas ya documentados arriba.

### Problema 1 — Tarjetas de Dispositivos (recorte de badge/título)
Causa real: `.sol-body` estaba `position:absolute;inset:auto 0 0 0` dentro de `.sol`
con `min-height:280px` fijo y `overflow:hidden`. Si el texto necesitaba más de 280px,
crecía hacia arriba y quedaba recortado por el `overflow:hidden` del padre.

Corrección aplicada (estructural, sin absolute para el bloque de contenido):
- `.sol-media` pasó de `position:absolute;inset:0` a un bloque normal en el flujo
  (`position:relative;aspect-ratio:3/2`), así que la foto ahora ocupa la parte de
  arriba de la tarjeta a su proporción real (3:2, sin recorte del encuadre) y el
  bloque de texto (`.sol-body`) quedó en flujo normal debajo, ya no absoluto.
  Se sacó el overlay oscuro (`.sol-media::after`) que ya no hacía falta porque el
  texto no se superpone más a la foto.
- `.sol` pasó a `display:flex;flex-direction:column` y se sacó el `min-height:280px`
  fijo (y sus overrides mobile de `min-height:260px`/`235px`): la tarjeta ahora
  crece en altura según lo que necesite el contenido, en vez de recortarlo.
  `overflow:hidden` se mantuvo en `.sol` (ya no es un problema porque el contenido
  ya no se sale por arriba del padre) para conservar bordes redondeados y contener
  el emblema decorativo (`.emb-wm`).
- Validado en vivo (desktop ~1054px y mobile ~406px, con capturas reales, navegando
  a `#dispositivos` y haciendo scroll por las 4 tarjetas): estado, título, texto,
  CTA y aclaración se ven completos en Prótesis/Arnés/Órtesis/Carro en ambos
  anchos, sin superposición, con la foto con protagonismo real (occupa todo el
  ancho de la tarjeta, proporción 3:2 sin recortes raros).

### Problema 2 — `.form-card-h` pisado por regla `!important`
Causa real: `.form-card h3{...!important}` (bloque "Ache correction layer
2026-07-20") aplicaba a cualquier `h3` dentro de `.form-card`, incluidos los que
tenían `class="form-card-h"`, y como usa `!important` ganaba siempre sin importar
la especificidad de la clase nueva.

Corrección aplicada (sin agregar más `!important`, solo se acotó el selector
existente): `.form-card h3{...!important}` → `.form-card h3:not(.form-card-h){...}`.
Con eso, los `h3.form-card-h` quedan completamente fuera de esa regla vieja y la
regla `.form-card-h` (sin `!important`) se aplica limpia. Se ajustó también
`.form-card-h` para que cumpla lo pedido: `font-size:13px` (antes 15px),
`font-weight:600` (antes 800, para que sea semibold y no un H2/H3 pesado), color
ámbar (`--amber-dk`), mayúsculas, `margin:24px 0 12px` + borde superior como
separador liviano entre bloques de un mismo formulario.
Validado en vivo: "Animal y necesidad" (paso 1 del formulario de caso) se ve como
etiqueta pequeña en ámbar, notoriamente menor que el título principal del paso,
en desktop y mobile — ya no parece un H2/H3.

### Problema 3 — Íconos de "Participar implica" / "El profesional recibe"
Causa: `.check-list li::before` dibujaba un cuadrado con borde ámbar y fondo
translúcido (visualmente idéntico a un checkbox sin marcar, sin serlo).
Corrección: se reemplazó por un carácter `✓` real (`content:"✓"`), en ámbar,
sin caja ni borde — un check inequívoco, sin agregar librerías ni íconos nuevos.
Validado en vivo (mobile, sección `#profesionales`): las 10 líneas de ambas listas
muestran el tilde ámbar, ya no parecen casilleros.

### Validación técnica
- `git diff --check`: sin problemas de whitespace/conflictos.
- `bash build.sh`: OK. `dist/` verificado: `index.html` + assets públicos, sin
  `LEEME.txt` ni `_previas/` (la limpieza de la sesión anterior sigue vigente).
- Validación visual: 1 pasada desktop (~1054px) + 1 pasada mobile (~406px) con
  Claude in Chrome, cubriendo específicamente los 3 puntos corregidos. No se
  repitió la auditoría completa de la sesión anterior.

### Pendiente (sin cambios respecto a la entrada anterior)
- Extender `ache-leads-appscript.gs` (aditivo, sin deploy) para los campos nuevos
  del stepper y del formulario profesional.
- Pruebas funcionales reales de envío (éxito y error) de ambos formularios.
- Fase 4: analytics/revisión final.

### Archivos modificados en esta sesión
- `index.html` (los 3 fixes de CSS: `.sol`/`.sol-media`/`.sol-body`,
  `.form-card h3:not(.form-card-h)` + `.form-card-h`, `.check-list li::before`).
- `SESSION_STATUS.md` (esta entrada).
No se tocó `build.sh`, `ache-leads-appscript.gs`, `AGENTS.md` ni `assets/`.

---

## 2026-07-21 — Extensión aditiva de `ache-leads-appscript.gs` + pruebas funcionales reales (Claude, sesión de continuación)

Objetivo único de esta sesión (pedido explícito): cerrar la integración funcional de los
dos formularios (caso + profesional) con el receptor de leads existente, sin cambios
visuales/de texto/analytics, sin deploy. Se retomó directo desde el pendiente #1 ya
documentado arriba (no se repitió el diagnóstico de fases anteriores).

### 1. Payload que envía hoy cada formulario (auditado en código, `index.html`)
**Formulario de caso** (`#caseForm`, JS ~línea 1527 en adelante): `tipo` (fijo "caso"),
`producto`, `nombre_perro`, `edad`, `peso`→alias a `tamano`, `raza`, `raza_detalle`,
`provincia`, `ciudad`, `situacion`, `evaluado_vet`, `estado_actual`, `etapa`,
condicionales según producto (`extremidad_afectada`/`amputacion_realizada`/`munon`/
`fotos_disponibles` para Prótesis; `zona`/`diagnostico`/`soporte_actual` para Órtesis;
`dificultad_principal`/`apoya_4_patas`/`asistencia` para Arnés;
`extremidades_afectadas`/`movilidad_parcial`/`solucion_actual` para Carro),
`descripcion`→alias a `mensaje`, `intencion`, `nombre`, `whatsapp`, `email`,
`medio_contacto`, `horario`, `consentimiento`, `consentimiento_compartir`, `newsletter`,
`contacto` (calculado: whatsapp||email), `pagina`, `utm_*`.

**Formulario profesional** (`#professionalForm`, JS ~línea 1599 en adelante): `tipo`
(fijo "profesional"), `nombre`, `rol_profesional`, `especialidad`, `institucion`,
`pais`, `ciudad`, `casos_mes`, `experiencia_amputaciones`, `experiencia_dispositivos`,
`forma_registro`, `forma_compartir`, `dificultad_principal_prof`, `interes_probar`,
`interes_derivar`, `interes_asesor`, `interes_fabricar`, `interes_alianza`,
`interes_demo`, bloque fabricante si corresponde (`fab_dispositivos`, `fab_materiales`,
`fab_capacidad`, `fab_zona`, `fab_formatos`, `fab_interes_studio`), `email`,
`whatsapp`, `horario`, `consentimiento`, `contacto` (calculado), `pagina`, `utm_*`.

### 2. Qué aceptaba el `.gs` antes de esta sesión
Solo 14 campos (`FIELD_LIMITS` original): `producto`, `nombre`, `contacto`, `especie`,
`raza`, `raza_detalle`, `zona`, `tamano`, `mensaje`, `consentimiento`, `pagina`,
`utm_source`, `utm_medium`, `utm_campaign`. Todo lo demás se descartaba en silencio
(sin error, pero sin llegar al Sheet) — este era el gap real documentado en sesiones
anteriores.

### 3. Distinción tutor / veterinario / rehabilitador / fabricante y producto
- **Audience**: no viajaba en el payload (se calculaba en JS solo para analytics y se
  descartaba). Se agregó `payload.audience` en ambos formularios (2 líneas, sin tocar
  texto ni visual): `'tutor'` fijo en el de caso, y la variable ya calculada
  (`'veterinarian'|'rehabilitator'|'manufacturer'`) en el profesional — mismos valores
  que ya usaba `acheTrack(...)`, sin inventar ningún valor nuevo.
- **Producto** (Prótesis/Arnés/Órtesis/Carro): ya viajaba tal cual en `producto`
  (valores exactos usados en `data-producto`/`productoSel`), sin cambios.

### 4. Extensión aditiva de `ache-leads-appscript.gs`
- `FIELD_LIMITS`: se agregaron 48 claves nuevas después de las 14 originales (mismo
  orden, nada removido ni renombrado): `audience`, `tipo` + todos los campos del
  stepper de caso (`nombre_perro`, `edad`, `provincia`, `ciudad`, `situacion`,
  `evaluado_vet`, `estado_actual`, `etapa`, los 12 campos condicionales de los 4
  productos, `descripcion`, `intencion`, `whatsapp`, `email`, `medio_contacto`,
  `horario`, `consentimiento_compartir`, `newsletter`) + todos los del formulario
  profesional (`rol_profesional`, `especialidad`, `institucion`, `pais`, `casos_mes`,
  `experiencia_amputaciones`, `experiencia_dispositivos`, `forma_registro`,
  `forma_compartir`, `dificultad_principal_prof`, los 6 `interes_*`, los 6 `fab_*`).
- `doPost`: el `sheet.appendRow([...])` ahora incluye las 62 columnas totales, en el
  mismo orden que `FIELD_LIMITS` (14 viejas intactas + 48 nuevas al final).
- `getOrCreateSheet`: los headers de una hoja nueva (`ss.insertSheet`) incluyen las 62
  etiquetas correspondientes. **Esto solo aplica si el Sheet no existe todavía** — no
  reescribe headers de un Sheet ya creado (ver limitación abajo).
- `validateAndNormalize`, `isValidConsent`, `limitText`, `sanitizeForSheet`: sin
  cambios — ya cubrían lo pedido (ver punto 6).
- No se tocó ninguna de las 14 columnas/campos viejos, ni su orden, ni sus límites.

### 5. Consentimientos (obligatorio vs. opcionales)
Sin cambios necesarios: `validateAndNormalize` ya solo exige `raw.consentimiento`
(vía `isValidConsent`) para aceptar el lead; `consentimiento_compartir` y `newsletter`
ahora viajan y se guardan, pero nunca se validan como obligatorios — se guardan
"Sí"/"No" tal cual los manda el frontend. Confirmado con test funcional (punto 8).

### 6. Seguridad/validación — estado real (sin cambios, ya estaba cubierto)
Sanitización contra formula injection (`sanitizeForSheet`), límites de longitud
(`FIELD_LIMITS`), validación de nombre + al menos un contacto (`data.nombre`/
`data.contacto`), validación de consentimiento obligatorio, error genérico al
frontend (`GENERIC_ERROR`) con detalle solo en `console.error`, fallo de mail no
pierde el lead (try/catch separado), sin HTML crudo insertado en ningún lado
(Sheet guarda texto plano, mail es texto plano). Nada de esto se reimplementó: ya
cumplía lo pedido antes de esta sesión, se revisó y se confirma que sigue así con
los campos nuevos (mismo mecanismo genérico vía `Object.keys(FIELD_LIMITS)`).

### 7. Bug real encontrado y corregido en `index.html` (no en el `.gs`)
Los 4 bloques condicionales del paso 2 (`.cond-block` por producto) quedan siempre
en el DOM — solo se ocultan por CSS (`display:none` vs `.active`), así que
`new FormData(caseForm)` siempre incluía los campos de **los 4 productos a la vez**,
incluyendo valores default de `<select>` que el usuario nunca vio (ej. un lead de
Prótesis hubiera llegado con `apoya_4_patas` de Arnés seteado a su opción por
defecto). Se agregó un filtro de 8 líneas en el submit handler del formulario de
caso (`index.html`, antes de armar el payload final) que borra del payload los
campos de los bloques que no correspondan al `producto` elegido. Validado con test
funcional real (punto 8): confirmado que ahora **solo** viajan los campos del
producto seleccionado.

Segundo hallazgo y fix, mismo formulario: al enviar el paso 3 con campos obligatorios
vacíos (nombre/whatsapp/consentimiento), el handler hacía `return` en silencio —
**no se mostraba ningún error** (el formulario usa `novalidate`, así que tampoco
aparecía la validación nativa del navegador). Esto contradecía directamente la
prueba pedida ("formulario inválido debe mostrar errores"). Fix mínimo: se agregó
un mensaje visible en `#formErr` para ese caso específico (3 líneas). El formulario
profesional no tenía este problema — no usa `novalidate`, así que ya mostraba la
validación nativa del navegador correctamente (confirmado, sin cambios).

Ambos fixes son quirúrgicos (JS, no visual, no texto de producto), con 1 intento
cada uno (dentro del límite de 2 por error).

### 8. Pruebas realizadas (todas documentadas, ninguna contra el endpoint productivo real)
1. Validación estática de sintaxis: `node --check` sobre `ache-leads-appscript.gs`
   (copiado a `.js` temporal) y sobre el bloque `<script>` principal extraído de
   `index.html` — ambos OK.
2. Prueba local de armado de payload (Node.js, réplica fiel de la lógica de
   `index.html`): 19 asserts sobre 4 escenarios (caso Prótesis, caso Órtesis,
   profesional veterinario, profesional fabricante) — todos pasaron.
3. Prueba funcional real en navegador (servidor local `http-server` vía
   `preview_start`, **con `window.fetch` interceptado en el propio navegador para
   que ningún request saliera realmente al endpoint productivo real** — se
   verificó que la URL interceptada coincidía con el `LEADS_ENDPOINT` real, o sea
   que sin el intercept el POST sí se habría enviado a producción):
   - Paso 1 sin campo obligatorio (`situacion`): bloquea el avance, confirmado.
   - Ida y vuelta entre pasos 1→2→1: valores conservados (`nombre_perro` intacto).
   - Envío válido (Prótesis, Órtesis→no probado explícito pero Carro sí): mensaje
     de éxito visible, formulario oculto, payload correcto, `audience:"tutor"`.
   - Envío inválido en paso 3 (sin nombre/whatsapp/consentimiento): con el fix del
     punto 7, ahora sí se muestra `#formErr` con mensaje claro; sin el fix no
     mostraba nada (confirmado antes/después).
   - Condicionales: confirmado que con Prótesis solo viajan sus 4 campos; con Carro
     solo viajan sus 3 campos (antes del fix viajaban los 4 bloques juntos).
   - Formulario profesional: envío con `interes_fabricar` marcado → `audience:
     "manufacturer"`, bloque fabricante activo, campos `fab_*` presentes.
   - Separación de formularios: confirmado que enviar el formulario de caso no
     oculta ni modifica el formulario profesional (siguen siendo elementos DOM
     independientes, sin estado compartido).
   - Analytics: se confirmó que los parámetros reales usados en `acheTrack(...)`
     para los eventos de submit (`{product, audience}` / `{audience}`) no incluyen
     ninguna clave de PII (`nombre`, `whatsapp`, `email`, `contacto`, `nombre_perro`,
     `descripcion`, `diagnostico`).
4. Confirmaciones visuales mínimas: 1 captura mobile (375×812, paso 1 del stepper,
   con Chrome vía `preview_*`) y 1 captura desktop (formulario profesional,
   sección "Perfil"/"Experiencia") — sin cambios visuales respecto a la sesión
   anterior, ambas legibles y sin recortes.
5. `git diff --check`: sin problemas de whitespace (corrido 1 sola vez, al final).
6. `bash build.sh`: corrido 1 sola vez al final (post-fixes). `dist/` verificado:
   solo `index.html` + `assets/` públicos, sin `.gs`/`.md`/`LEEME.txt`/`_previas/`.

### Limitaciones explícitas (sin maquillar)
1. **No se pudo probar `ache-leads-appscript.gs` ejecutándose de verdad** (Apps
   Script no se puede correr localmente ni sin desplegar). La validación fue:
   sintaxis (`node --check`), y una réplica fiel en Node.js de
   `validateAndNormalize`/`FIELD_LIMITS`/whitelist para confirmar que ningún campo
   nuevo real quedaría fuera. **No se desplegó ni se publicó el script** (regla
   explícita de la tarea).
2. **El Sheet productivo real (si ya existe, con las 14 columnas viejas) no va a
   tener los headers de las 62 columnas nuevas automáticamente** — `getOrCreateSheet`
   solo escribe headers cuando crea la hoja desde cero (`if (!sheet)`). Si el Sheet
   de Matías ya existe con datos, redeployar este script va a agregar las 48
   columnas nuevas de datos correctamente (mismo orden), pero la fila 1 (headers)
   de ese Sheet específico no se va a actualizar sola. **Paso manual pendiente**: una
   vez redeployado, agregar a mano los 48 títulos de columna nuevos en la fila 1 del
   Sheet real (están listados en el array de `getOrCreateSheet`, se pueden copiar
   tal cual).
3. Solo se probó explícitamente un envío exitoso "de punta a punta" para
   Prótesis y Carro (no Arnés/Órtesis), y un profesional fabricante (no
   veterinario/rehabilitador puro) — la lógica es la misma para los 4 productos y
   los 3 roles (mismo código genérico), pero no se ejecutó 1 test por combinación
   para no exceder el tiempo de la sesión.
4. No se revalidó visualmente la sección de Dispositivos ni el resto del sitio —
   fuera de alcance de esta sesión (objetivo único: integración de formularios).

### Pasos manuales pendientes para Matías (redeploy real)
1. Abrir el proyecto de Apps Script vinculado al Sheet de leads real.
2. Reemplazar el contenido por el `ache-leads-appscript.gs` de este commit (aditivo,
   compatible con lo que ya hay).
3. Implementar > Gestionar implementaciones > editar (lápiz) > Nueva versión (para
   que la URL ya publicada tome el cambio). La URL `/exec` no cambia.
4. Si el Sheet "Leads" ya existe: agregar a mano los 48 headers nuevos en la fila 1
   (ver lista completa en `getOrCreateSheet` del `.gs`), en el mismo orden en que
   aparecen ahí, a partir de la columna 15 (después de `utm_campaign`).
5. Probar con un envío real de prueba (uno de caso, uno profesional) y confirmar
   que aparecen las filas nuevas con las columnas nuevas pobladas.

### Compatibilidad preservada (confirmado)
- Las 14 columnas/campos viejos del `.gs` no se tocaron, no cambiaron de orden ni de
  límite.
- El script sigue aceptando JSON (`postData.contents`) y parámetros tradicionales
  (`e.parameter`) — no se tocó `parseBody`.
- La URL del endpoint (`LEADS_ENDPOINT` en `index.html`) no se modificó.
- Ningún campo viejo fue eliminado ni renombrado.

### Archivos modificados en esta sesión
- `ache-leads-appscript.gs` (extensión aditiva: `FIELD_LIMITS`, `appendRow`, headers
  de `getOrCreateSheet`; sin deploy).
- `index.html` (3 cambios funcionales, no visuales, no de texto: `payload.audience`
  en ambos formularios, filtro de campos condicionales por producto, mensaje de
  error visible en envío inválido del paso 3).
- `SESSION_STATUS.md` (esta entrada).
No se tocó `build.sh`, `AGENTS.md` ni `assets/`. No se hizo push ni deploy.

---

## 2026-07-21 — Cierre de Fase 4: analytics, privacidad, revisión funcional y preparación de deployment (Claude, sesión de continuación)

Objetivo único de esta sesión (pedido explícito): cerrar la Fase 4 técnica antes de
publicar — analytics, revisión final, validación de privacidad, preparación de
deployment. Sin push, sin deploy, sin publicar Apps Script, sin cambios de texto/
diseño salvo bloqueantes, sin librerías nuevas, sin refactors generales.

### 1. Analytics — auditoría de los 24 eventos pedidos
Los 24 eventos ya estaban implementados en `index.html` de sesiones anteriores,
todos usando la función `acheTrack(name, params)` existente (línea ~1350, con
`try/catch` y chequeo de `window.gtag`, nunca rompe la interacción si Analytics
está bloqueado): `hero_owner_click`, `hero_professional_click`,
`product_protesis_click`, `product_arnes_click`, `product_ortesis_click`,
`product_carro_click`, `case_form_start`, `case_form_step_1_complete`,
`case_form_step_2_complete`, `case_form_submit`, `protesis_case_submit`,
`arnes_preorder_submit`, `ortesis_case_submit`, `carro_research_submit`,
`professional_form_start`, `professional_form_submit`,
`manufacturer_interest_submit`, `professional_demo_click`,
`veterinarian_pilot_click`, `whatsapp_matias_click`, `faq_open`. No se
encontraron duplicados.

**Único cambio agregado esta sesión**: `faq_open` no llevaba ninguna propiedad.
Se agregó `{faq_id: N}` (N = posición 1 a 11, sin texto de la pregunta) a las 11
llamadas en la sección FAQ — coincide con la lista de propiedades no sensibles
permitidas en la consigna (`faq_id` estaba explícitamente listada pero no se
usaba). Cambio de 1 línea por ítem, sin tocar texto ni diseño.

Propiedades enviadas por evento (todas no sensibles, confirmado por lectura de
código): `{}` (clics simples, faq_open ahora con `faq_id`), `{product, audience}`
(submits de caso y sus 4 variantes por producto), `{audience}` (submits del
formulario profesional y fabricante). Ninguna incluye nombre, teléfono, email,
nombre del perro, diagnóstico, descripción, estudios ni texto libre.

### 2. Revisión de privacidad (verificado, no solo leído)
1. **Sin PII en analytics**: confirmado en código y en vivo (ver punto 3) — los
   `trackCalls` capturados en `gtag(...)` durante los envíos de prueba solo
   contenían `product`/`audience`, nunca `nombre`/`whatsapp`/`email`/
   `nombre_perro`/`descripcion`/`diagnostico`.
2. **Datos clínicos solo al receptor de leads**: confirmado — `descripcion`,
   `diagnostico`, `situacion`, etc. solo viajan en el `fetch` a `LEADS_ENDPOINT`
   (Apps Script), nunca a `gtag`/`fbq`.
3. **`consent_share` (`consentimiento_compartir`) y `consent_news` (`newsletter`)
   opcionales**: confirmado, sin `required` en el HTML.
4. **`consent_evaluation` (`consentimiento`) es el único obligatorio** en ambos
   formularios: confirmado, único checkbox con `required` en cada uno.
5. **Ningún checkbox opcional preseleccionado**: confirmado programáticamente
   (`defaultChecked === false` en los 3 checkboxes opcionales del form de caso y
   los 6 `interes_*` del form profesional).
6. **Errores visibles al usuario son genéricos**: confirmado — `formErr` muestra
   "Faltan campos obligatorios..." o el mensaje de fallback con WhatsApp; el
   `.gs` responde `GENERIC_ERROR = 'No se pudo procesar la consulta.'` al
   frontend.
7. **Detalles técnicos solo en consola/logs**: confirmado — `console.error` en
   el `.gs` para errores de mail/procesamiento; el frontend nunca expone el
   detalle real al usuario.
8. **Ningún campo oculto de otro producto se envía**: confirmado en vivo (ver
   punto 3) — el filtro de condicionales por producto (agregado en la sesión
   anterior) sigue funcionando; un envío de Prótesis no incluye campos de
   Arnés/Órtesis/Carro.
9. **Los formularios no exponen URL ni errores internos del endpoint**: confirmado
   — ningún mensaje de error visible menciona `LEADS_ENDPOINT`, códigos HTTP ni
   trazas.

### 3. Revisión funcional final (1 pasada desktop + 1 pasada mobile, fetch interceptado)
Server local (`python3 -m http.server` vía `preview_start`) con `window.fetch`
reemplazado en el propio navegador (devuelve una respuesta simulada; se confirmó
que la URL interceptada coincidía con `LEADS_ENDPOINT` real, o sea que sin el
intercept el POST habría salido a producción — **ningún dato se envió al
endpoint productivo**).

**Desktop (~1280×800)**: hero, tarjetas de dispositivos, FAQ (`faq_open` con
`faq_id` correcto), CTA `hero_owner_click`, stepper completo (paso 1 bloquea sin
`situacion`, pasos 1→2→3 avanzan con los eventos `case_form_start` /
`case_form_step_1_complete` / `case_form_step_2_complete`), envío inválido en
paso 3 (sin nombre/whatsapp/consentimiento) muestra error visible sin enviar
`fetch`, envío válido de un caso Prótesis: solo viajan los 4 campos
condicionales de Prótesis, `payload.audience:"tutor"`, eventos
`case_form_submit` + `protesis_case_submit` con `{product, audience}` sin PII,
confirmación visible sin superposiciones. Formulario profesional: envío con
`interes_fabricar` → `audience:"manufacturer"`, eventos `professional_form_submit`
+ `manufacturer_interest_submit`, payload con bloque `fab_*` presente. Sin
errores en consola.

**Mobile (375×812)**: hero (incluye `+120` visible arriba, sin regresión),
sección Dispositivos, FAQ — todo sin superposiciones ni recortes, nav como
cápsula flotante intacto. Sin errores en consola.

No se repitió la auditoría visual completa de sesiones anteriores; esta pasada
se limitó a las secciones listadas en la consigna y no encontró bloqueantes ni
regresiones nuevas.

### 4. Revisión técnica
1. Validación estática de JS: `node --check` sobre el script inline principal de
   `index.html` (extraído a un temporal) y sobre `ache-leads-appscript.gs`
   (copiado a `.js` temporal) — ambos OK.
2. `git diff --check`: sin problemas de whitespace/conflictos.
3. `bash build.sh`: corrido 1 sola vez. Resultado: OK.
4. `dist/` verificado — contiene únicamente: `index.html`,
   `assets/ache-logo.svg`, `assets/fonts/conthrax-sb.ttf`,
   `assets/img/{arnes,carro,hero,ortesis,protesis,software-ui}.png`.
5. Confirmado que `dist/` **no** incluye: `.gs`, `.md`, `.txt` internos,
   `_previas/`, archivos ocultos (`.DS_Store`, etc.) ni configuraciones
   temporales — el propio `build.sh` ya filtra todo esto (`find ... -delete`).

### Commits locales pendientes de push (6, ninguno pusheado)
```
78570fc feat: extender receptor de leads con campos del stepper de caso y form. profesional
bec4797 fix: corregir recorte de tarjetas de dispositivos, jerarquía de form-card-h e íconos de listas
9cdb40e chore: limpiar salida de dist/ y corregir jerarquía de H2/form-card-h
b06d23f fix: cerrar Fase 1 — CTA de preventa sincroniza el condicional del stepper
6d34779 wip: reestructurar landing en 17 bloques (fase 1 en curso, sin cerrar)
91e0e44 chore: restrict Cloudflare Pages output to public assets
```
más el commit de esta sesión (Fase 4, ver encabezado del commit en `git log`).

### Pasos exactos para publicar (cuando Matías lo decida)
1. **Push**: `git push origin main` desde este repo (rama `main`, remoto ya
   configurado). Revisar que no haya conflictos con `origin/main` antes (no
   debería haberlos, nadie más pushea a este repo salvo coordinación explícita).
2. **Esperar deploy de Cloudflare Pages**: automático al detectar el push a
   `main`. Verificar en el dashboard de Cloudflare Pages que el build del deploy
   termine en verde antes de considerar la publicación completa.
3. **Actualizar Apps Script**: abrir el proyecto de Apps Script vinculado al
   Sheet de leads real, reemplazar el contenido por `ache-leads-appscript.gs` de
   este repo (ya extendido de forma aditiva, ver entrada anterior de este mismo
   archivo), y usar Implementar > Gestionar implementaciones > editar (lápiz) >
   Nueva versión, para que la URL `/exec` ya publicada tome el cambio sin
   cambiar de URL.
4. **Actualizar headers del Sheet**: si el Sheet "Leads" ya existe (no se crea
   desde cero), agregar a mano los 48 headers nuevos en la fila 1, a partir de
   la columna 15, en el mismo orden en que aparecen en el array de
   `getOrCreateSheet` dentro de `ache-leads-appscript.gs` (esto NO se actualiza
   solo — limitación ya documentada en la entrada anterior).
5. **Prueba controlada real**: con el sitio ya publicado y el Apps Script ya
   redeployado, hacer un envío real de prueba (uno de formulario de caso, uno de
   formulario profesional) usando datos de prueba reconocibles como tales (ej.
   nombre "PRUEBA — borrar"), confirmar que la fila nueva aparece en el Sheet con
   las columnas nuevas pobladas, y luego borrar esa fila de prueba del Sheet.

### Rollback recomendado si algo falla
- **Si el deploy de Cloudflare falla o rompe visualmente algo en producción**:
  Cloudflare Pages mantiene el deploy anterior activo hasta que el nuevo build
  termine OK; si el build falla, no reemplaza el deploy en vivo. Si el build
  pasa pero hay una regresión visual, usar el dashboard de Cloudflare Pages para
  volver ("rollback") al deploy anterior con un clic, sin tocar git.
- **Si el Apps Script redeployado falla o el Sheet no recibe filas nuevas**: en
  Implementar > Gestionar implementaciones, se puede revertir a la versión
  anterior del script (las versiones anteriores quedan guardadas). El frontend
  (`index.html`) no cambia de `LEADS_ENDPOINT`, así que revertir el script no
  requiere ningún cambio en el sitio.
- **Si algo del código del sitio necesita revertirse tras el push**: `git revert`
  del commit problemático (nunca `reset --hard` sobre `main` ya pusheado), y
  volver a pushear — Cloudflare redeploya automáticamente con el revert.

### Limitaciones pendientes (sin maquillar)
1. Igual que en la sesión anterior: no se puede ejecutar `ache-leads-appscript.gs`
   de verdad sin desplegarlo (Apps Script no corre localmente). Esta sesión no
   agregó ni quitó nada de esa limitación.
2. Los headers del Sheet productivo (si ya existe) siguen sin actualizarse
   solos — paso manual ya documentado arriba y en la entrada anterior.
3. La propiedad `cta_location` y `form_step` (numérico) mencionadas en la lista
   de propiedades permitidas de la consigna no se usan hoy en ningún evento más
   allá de lo ya implementado (`faq_id`, `product`, `audience`) — no es un
   error, ninguno de los 24 eventos pedidos las requiere explícitamente, se deja
   documentado por si una futura sesión quiere enriquecer algún evento puntual.
4. No se probó 1 combinación por cada producto/rol en esta sesión (ya se había
   probado Prótesis/Carro y profesional-fabricante en la sesión anterior); esta
   sesión repitió Prótesis (caso) y profesional-fabricante como muestra
   representativa del filtro de condicionales y el payload de analytics, sin
   volver a probar Arnés/Órtesis/veterinario/rehabilitador explícitamente.

### Archivos modificados en esta sesión
- `index.html` (único cambio funcional: `faq_id` agregado a las 11 llamadas de
  `acheTrack('faq_open', ...)`).
- `SESSION_STATUS.md` (esta entrada).
- `RELEASE_CHECKLIST.md` (nuevo, checklist operativo no técnico para Matías).
No se tocó `build.sh`, `AGENTS.md`, `assets/` ni `ache-leads-appscript.gs`
(no requirió cambios: ya cumplía lo pedido, ver punto 2). No se hizo push ni
deploy ni se publicó el Apps Script.

---

## 2026-07-21 — Publicación guiada de Fase 4 + prueba real controlada + fix de WhatsApp (Claude, sesión de continuación)

Objetivo de esta sesión: ejecutar el checklist de publicación de `RELEASE_CHECKLIST.md`
paso a paso junto con Matías (él hace los clics reales en su navegador y Google
Workspace, a los que Claude no tiene acceso directo — ver limitación técnica abajo),
hasta cerrar una prueba real controlada del formulario de caso contra el Apps Script
y Sheet ya publicados, y corregir el único bug real encontrado.

### Limitación técnica encontrada y confirmada
La herramienta "Claude para Chrome" tiene bloqueado a nivel de la propia herramienta
(no es un permiso de usuario ni de la extensión) el acceso a `docs.google.com` (lectura
y capturas) y la navegación a `protesisparaperros.com.ar` ("Navigation to this domain
is not allowed"). Esto significa que ninguna sesión de Claude puede operar Google
Sheets/Apps Script ni el sitio público de forma autónoma vía navegador — todo lo que
sigue se hizo con Matías ejecutando los clics reales y compartiendo capturas/pegando
texto, con Claude guiando paso a paso y verificando cada resultado.

### 1. Push y deploy del commit de cierre de Fase 4
- `git push origin main`: exitoso, sin conflictos (`0fd42bc` ya estaba commiteado de
  la sesión anterior, más el fix de `#profForm` de esta sesión — ver punto 2).
- Cloudflare Pages: confirmado indirectamente (no hay acceso al dashboard) — el HTML
  servido en `https://protesisparaperros.com.ar/` contiene los marcadores únicos del
  commit publicado (`faq_id:1..11`), `HTTP/2 200`, headers `server: cloudflare`.

### 2. Fix visual: superposición del nav en `#profForm`
Encontrado en la revisión funcional del Paso 3 del checklist: el `div#profForm` no
tenía `scroll-margin-top`, a diferencia de las `.section` (que ya usan 82px), así que
al navegar directo a esa ancla el título quedaba tapado por el nav fijo, en desktop y
mobile. Fix de una línea: `#profForm{scroll-margin-top:82px}` agregado en `index.html`.
Verificado por geometría exacta del DOM (la captura de pantalla de la herramienta de
preview falló en scrolls profundos por un bug propio de esa herramienta, no del sitio;
confirmado que ocurría también en posiciones sin relación con este fix). Commit
`3670fd1`, pusheado y confirmado publicado (la regla ya aparece en el HTML servido).

### 3. Actualización del Apps Script (nueva versión, misma URL)
Guiado paso a paso: Matías abrió el proyecto de Apps Script vinculado a la planilla
"ache Innovation — Leads" (confirmado como el proyecto correcto: tenía `doPost` y
`SHEET_NAME = 'Leads'`, con las 14 columnas viejas intactas). Reemplazó el contenido
completo por el `ache-leads-appscript.gs` ya extendido (validado en la sesión
anterior), guardó, y creó una **nueva versión de la implementación existente**
(Implementar > Gestionar implementaciones > editar > Nueva versión > Implementar) —
confirmado que la URL de `/exec` no cambió (mismo ID de implementación que la versión
anterior) y que la versión activa pasó a ser "Versión 2 del 21 jul 2026".

**Aviso importante detectado y comunicado:** el código nuevo lee el mail de aviso
(`NOTIFY_EMAIL`) desde una Propiedad del Script en vez de tenerlo hardcodeado como
antes. Esto significa que, hasta que se configure esa propiedad manualmente, **los
leads se siguen guardando bien pero deja de llegar el mail de aviso**. Pendiente,
no resuelto en esta sesión (fuera de alcance de lo pedido).

### 4. Headers del Sheet actualizados
Diagnóstico correcto (con corrección de un error de conteo de la sesión anterior):
**faltaban 52 encabezados nuevos** (no 48, como decía una entrada previa de este
mismo archivo — se contó mal en su momento; el conteo real de `getOrCreateSheet` es
14 viejos + 52 nuevos = 66 columnas totales, de A a BN). Matías pegó los 52 encabezados
como una fila (texto separado por tabulaciones) desde O1, verificado con Ctrl+Flecha
derecha que no quedó ninguna columna vacía en el medio y que el último encabezado cae
exacto en BN1 ("Fabricante: interés en Studio").

### 5. Prueba real controlada (formulario de caso, producto Prótesis)
**Se hizo una sola prueba real**, con datos identificables ("TEST ACHE", "Matias
TEST", "PRUEBA CONTROLADA — eliminar después"), enviada de verdad desde el sitio en
vivo (confirmado por la columna "Página" de la fila resultante: URL real, no
localhost). Quedó registrada en la **fila 7** de la hoja "Leads". No se borró — queda
pendiente que Matías la borre después de esta sesión.

**Resultado, verificado columna por columna (valores exactos vía barra de fórmulas,
no solo capturas):**
- Correcto: Audience=`tutor`, Producto=`Prótesis`, Nombre del perro=`TEST ACHE`,
  Situación/Evaluado por veterinario/Estado actual/Etapa/Extremidad afectada/
  Amputación realizada/Muñón/Fotos disponibles, Descripción, Intención,
  Consentimiento obligatorio=`Sí`, Página=URL real. Ningún dato corrido de columna.
  Los campos de Arnés/Órtesis/Carro (Diagnóstico, Soporte actual, Dificultad
  principal, Apoya 4 patas, Nivel de asistencia, Extremidades afectadas, Movilidad
  parcial, Solución actual) llegaron **vacíos** — confirma que el filtro por producto
  sigue sin mezclar campos de otras líneas.
- Aclarado (no era un bug): la columna "Tipo" mostraba `caso`, no el producto — es
  correcto por diseño, ese campo distingue formulario de caso vs. profesional; el
  producto ya está en la columna "Producto".
- **Bug real encontrado:** las columnas "WhatsApp" y "Contacto" mostraban literalmente
  `0` en vez de `0000000000` — Google Sheets interpretó el texto puramente numérico
  como número y descartó los ceros. Confirmado con la barra de fórmulas (no solo
  visualmente). Corregido en el punto 6 de esta misma entrada.
- Hallazgo menor, probablemente error humano al completar el formulario (no de
  código, ya que esta sesión había validado antes con fetch interceptado que el
  JS manda "No" correctamente cuando esos checkboxes están destildados): las columnas
  "Consentimiento compartir" y "Consentimiento novedades" quedaron en `Sí` en vez de
  `No`, y "Medio de contacto preferido" quedó en `WhatsApp` en vez de `Email`. No se
  investigó más a fondo ni se corrigió — fuera del alcance pedido (solo el bug de
  WhatsApp).

### 6. Fix del bug de WhatsApp/Contacto (aplicado, con sintaxis validada)
Causa: `sheet.appendRow([...])` en `ache-leads-appscript.gs` escribía `contacto` y
`whatsapp` con `sanitizeForSheet()`, que solo fuerza texto (prefijo `'`) si el valor
empieza con `=+-@` (protección contra inyección de fórmulas) — un valor puramente
numérico como `"0000000000"` no entra en ese caso y Google Sheets lo autoconvierte a
Number, perdiendo los ceros a la izquierda.

Fix mínimo (2 líneas cambiadas + 1 función nueva, sin tocar nombres/orden de columnas
ni ningún otro campo): se agregó `forceTextForSheet(value)` — misma idea que
`sanitizeForSheet` pero fuerza el prefijo `'` siempre, sin condición. Se cambiaron
únicamente las dos líneas del `appendRow` que arman `contacto` y `whatsapp` para usar
`forceTextForSheet` en vez de `sanitizeForSheet`. El apóstrofo inicial no se muestra
en Sheets (se interpreta como marca de "texto plano"), igual que ya pasaba con los
valores que arrancan con `=+-@` en `sanitizeForSheet` — mismo mecanismo, ya en uso en
este archivo, solo aplicado de forma incondicional a estos dos campos. Preserva ceros
iniciales, `+`, espacios, guiones y códigos de país tal cual los manda el frontend.

Validado: `node --check` sobre el archivo (sintaxis OK), `git diff --check` sin
problemas de whitespace. **No se hizo una segunda prueba real** — pendiente para
cuando Matías lo pida, después de redeployar esta versión.

### Limitaciones y pendientes explícitos de esta sesión
1. **No verificado con una prueba real post-fix todavía** — el fix de WhatsApp está
   escrito y commiteado, pero no redeployado ni probado de nuevo (a pedido explícito,
   "no hagas una segunda prueba real todavía").
2. **El mail de aviso (`NOTIFY_EMAIL`) quedó sin configurar** tras la nueva versión
   del Apps Script — los leads se guardan bien, pero no llega mail hasta que se cargue
   esa Propiedad del Script manualmente (Configuración del proyecto > Propiedades del
   script). No resuelto, no pedido en esta sesión.
3. **La fila 7 de prueba (TEST ACHE) sigue en el Sheet**, sin borrar — pendiente que
   Matías la borre cuando confirme que ya no la necesita.
4. Los dos hallazgos menores (consentimientos opcionales en "Sí", medio de contacto en
   "WhatsApp" en vez de "Email") no se investigaron a fondo — probablemente error de
   carga manual del formulario de prueba, no de código, pero quedan sin confirmar
   100%.
5. La discrepancia de conteo de encabezados nuevos (48 vs. 52 reales) que traía una
   entrada anterior de este archivo ya quedó corregida en el punto 4 de esta entrada.

### Archivos modificados en esta sesión
- `index.html` (1 línea: `#profForm{scroll-margin-top:82px}`).
- `ache-leads-appscript.gs` (fix de WhatsApp/Contacto: 2 líneas cambiadas + 1 función
  nueva `forceTextForSheet`).
- `SESSION_STATUS.md` (esta entrada).
No se tocó `build.sh`, `AGENTS.md`, `RELEASE_CHECKLIST.md` ni `assets/`. Sí se hizo
push de ambos commits de código (`3670fd1` y el de esta corrección). Sí se publicó
una nueva versión del Apps Script (Versión 2, misma URL). Pendiente: publicar la
próxima versión del Apps Script con este fix de WhatsApp (ver checklist en el mensaje
de cierre de esta sesión).

---

## 2026-07-21 — Consolidación visual de 17 a 7 bloques (Claude, sesión de continuación, INTERRUMPIDA por Matías antes de terminar la validación visual)

Objetivo de esta sesión (pedido explícito de Matías): una única reestructuración
visual y de contenido de la landing, reduciendo la arquitectura de 17 secciones a 7
bloques visibles, sin tocar Apps Script, Google Sheets, endpoint, payloads, nombres de
campos, listeners, lógica condicional ni analytics. Sin rollback, sin librerías nuevas,
sin imágenes nuevas, sin push/deploy hasta aprobación visual.

**Matías interrumpió la sesión** en medio de la validación visual (capturas) pidiendo
cerrar con lo ya hecho: commit local, build, y actualización de este archivo, sin más
iteraciones. Por eso esta entrada documenta el corte real, no un cierre de fase.

### Mecanismo usado (no se borró nada)
Todo lo que el pedido de Matías califica como "fusionar o retirar como sección
independiente" se implementó con una clase nueva `.retire-block{display:none}`
agregada al elemento de sección/bloque correspondiente — el HTML, los `id`, los
formularios y los listeners siguen intactos en el DOM, solo dejan de ser visibles.
Nada se borró del código. Esto permite reactivar cualquier bloque quitando la clase.

### Secciones visibles finales (7 bloques, de arriba a abajo)
1. **Hero** (`<section class="hero">`) — sin cambios de estructura, solo fix tipográfico (ver abajo).
2. **Productos** (`#dispositivos`) — sin cambios de contenido en esta sesión (ya
   estaba en el orden Prótesis→Arnés→Órtesis→Carro de una sesión anterior). **No
   llegó a revisarse visualmente si el encuadre de imagen/marca de Gemini está
   resuelto en esta sesión** — pendiente real, ver más abajo.
3. **Cómo trabajamos** (`#como`) — compactado a fila de 4 (2x2 en tablet, 1 columna
   en mobile vía media queries nuevas) + nota breve agregada debajo de los pasos con
   el texto exacto pedido ("El envío del caso no implica una compra...").
4. **Formulario de caso** (`#contacto-caso`) — sin cambios funcionales ni de campos.
   Se revisó el CSS de radios/checkboxes (`.opt-grid`) y ya cumplía lo pedido (control
   a la izquierda, texto al lado, tarjeta de ancho completo, estado seleccionado con
   borde/fondo ámbar) de una sesión anterior — **no se alcanzó a confirmar esto con
   una captura real en esta sesión**, solo por lectura de CSS.
5. **Biomechanics Studio + profesionales** (`#tecnologia` + `#profesionales`
   fusionados visualmente) — se reemplazó el copy de `#profesionales` por el texto
   corto pedido ("Buscamos veterinarios, rehabilitadores y fabricantes de Argentina y
   Latinoamérica...") + un único CTA ("Solicitar una demo o participar del piloto").
   El formulario profesional (`#profForm`) se convirtió de `<div>` a `<details>/<summary>`
   nativo (colapsado por defecto) para que no ocupe pantalla completa antes de que el
   usuario lo pida — mismo `<form id="professionalForm">` adentro, sin tocar campos.
6. **Ache, equipo y respaldo** (`#sobre-ache` + `#equipo` fusionados visualmente) —
   el H2 y el párrafo de Sobre Ache se reemplazaron por el texto institucional exacto
   pedido; se ocultaron los "3 diferenciales" como tarjetas separadas. La sección
   "Contacto directo con Matías" se ocultó completa (su función queda cubierta por el
   widget de WhatsApp + la mención de Matías como CEO en Equipo).
7. **FAQ y cierre** (`#faq` + `#contacto`) — FAQ reducido a las 5 preguntas pedidas
   (faq_id 1, 2, 4, 5, 10); las otras 6 quedan ocultas con `.retire-block` (siguen en
   el DOM, sin romper la numeración de `faq_open`). El cierre reemplaza las 3 tarjetas
   grandes por 2 CTA simples ("Evaluar un caso" / "Solicitar una demo"); las 3
   tarjetas viejas quedan ocultas, no borradas.

### Secciones ocultas (con `.retire-block`, no borradas)
`#selector` ("¿Qué estás buscando?"), `.problem-section` ("Cada perro necesita una
respuesta diferente"), `#orientador` ("¿No sabés qué dispositivo necesita?"), la
sección sin id "Qué sucede después" (con las 3 tarjetas "Podemos avanzar" / etc.), el
`grid2` "Hoy permite / En desarrollo" dentro de `#tecnologia`, el `grid3` de roles
(Veterinarios/Rehabilitadores/Fabricantes) y el `grid2` "Participar implica / El
profesional recibe" dentro de `#profesionales`, el `grid3` de "3 diferenciales" dentro
de `#sobre-ache`, la sección completa "Contacto directo con Matías", el `.close-grid`
de 3 tarjetas del cierre, y 6 de las 11 preguntas del FAQ (faq_id 3, 6, 7, 8, 9, 11).

### Cambios de copy/texto (exactos, sin tocar lógica)
- Widget de WhatsApp: `.wa-label` cambiado de "Hablá directo con el CEO" a
  "Hablar con Matías" (solo el texto visible; número, `href` y tracking intactos).
- Hero, Cómo trabajamos, Profesionales, Sobre Ache y Cierre: textos exactos pedidos
  por Matías aplicados donde correspondía (ver arriba).

### Fix tipográfico del Hero (el más validado visualmente de esta sesión)
Causa real: `.hero h1` heredaba `text-transform:uppercase` de `.display` y tenía
`font-size:clamp(40px,6vw,74px)` dentro de una columna angosta (`hero-in` con
`1.08fr .92fr`) — el texto en mayúsculas no entraba y el h1 terminaba renderizando en
4 líneas en vez de las 2 lógicas del HTML.
Fix aplicado (confirmado con una captura real en desktop 1440px, ver abajo):
`.hero h1{text-transform:none;font-size:clamp(34px,4vw,54px);line-height:1.08;max-width:640px}`,
más `.hero-in{grid-template-columns:1.18fr .82fr}` (más ancho para el texto) y
`.hero{min-height:88vh}` (antes `100vh`). Resultado verificado: el título ahora
renderiza en 3 líneas reales en desktop 1440px, con case natural (no todo en
mayúsculas) y el acento ámbar ya no domina toda la pantalla.

### Transiciones/decoración reducidas (cambio mínimo, sin tocar `.reveal`)
`.hero .glow`/`.glow2` y `.emblem-wm` perdieron su `animation` (flotación/rotación
continua); `.cursor-ring` (el cursor personalizado que sigue al mouse) se ocultó con
`display:none`. Se mantuvo el `.reveal` (fade-in al hacer scroll) y los hovers
existentes, tal como pide la consigna ("apariciones suaves, hover simple").

### Validación técnica hecha
- Balance de tags (`section` 15/15, `form` 2/2, `div` 222/222, `details` 12/12,
  `summary` 12/12) — sin romper anidamiento.
- `git diff --check`: sin problemas de whitespace/conflictos.
- `bash build.sh`: corrido 1 vez, OK. `dist/` contiene solo `index.html` + `assets/`
  públicos (mismo filtro de sesiones anteriores).
- Consola del navegador (preview local): sin errores de JS. Los únicos warnings son
  los esperados de Meta Pixel (`Invalid PixelID: null`, por el placeholder sin
  reemplazar, ya documentado en sesiones previas, no es un problema nuevo).
- Anclas de nav (`#dispositivos`, `#como`, `#tecnologia`, `#profesionales`,
  `#sobre-ache`) — todas siguen resolviendo a secciones visibles; ocultar sub-bloques
  no rompió ninguna, porque los `id` de nav apuntan a las secciones contenedoras, no a
  los bloques retirados.
- **Única captura real lograda**: hero desktop @1440px (antes/después del fix de
  tipografía), confirmando 3 líneas, case natural, acento ámbar no dominante.

### Pendiente real, sin maquillar (la sesión se cortó acá, a pedido explícito)
1. **No se llegó a confirmar visualmente** la sección Productos (encuadre de imagen /
   ausencia de marca de Gemini), el Formulario de caso (radios/checkboxes en
   viewport real), Biomechanics Studio + Profesionales fusionado, ni ninguna vista
   mobile — la herramienta de preview tuvo un problema puntual de scroll/captura
   (pantalla en negro al hacer `scrollIntoView` a `#dispositivos`, resuelto
   parcialmente pero no llegó a producir una captura útil) y Matías pidió detener
   antes de seguir insistiendo.
2. **No se revisó si el orden/tratamiento visual de las tarjetas de Productos**
   (recorte de imagen, `object-position`, ausencia de marca de Gemini) quedó
   resuelto — no se tocó esa sección en esta sesión, se llegó a leer el HTML/CSS
   existente (`.sol-media{aspect-ratio:3/2;overflow:hidden}` + `object-fit:cover`,
   heredado de una sesión anterior que ya corrigió un recorte de tarjeta) pero no se
   confirmó con captura si las 4 imágenes (`protesis.png`, `arnes.png`,
   `ortesis.png`, `carro.png`) muestran alguna marca de agua de Gemini visible.
3. **El `<details id="profForm">`** (formulario profesional colapsado) no se probó
   funcionalmente en navegador — se armó por lectura de código (etiquetas
   balanceadas, `id`s intactos), pero no se confirmó que abrir/cerrar el acordeón no
   rompa el submit ni el `toggleFabricanteBlock` existente.
4. No se revisó `#como` compactado ni el nuevo cierre de 2 CTAs con una captura real.
5. No se probó nada en mobile (360/390/768) en esta sesión.

### Archivos modificados en esta sesión
- `index.html` (todos los cambios descritos arriba: capa CSS nueva
  "Ache consolidación — 2026-07-21", clases `.retire-block` agregadas a los bloques
  retirados, fix tipográfico del hero, compactación de `#como`, fusión de copy en
  `#profesionales`/`#sobre-ache`, `<details>` para `#profForm`, cierre de 2 CTA,
  reducción de 6 preguntas del FAQ, texto del widget de WhatsApp).
- `SESSION_STATUS.md` (esta entrada).
No se tocó `ache-leads-appscript.gs`, `AGENTS.md`, `build.sh` ni `assets/`. No se hizo
push ni deploy. No se modificaron payloads, nombres de campos, `required`, listeners,
lógica condicional ni eventos de analytics — se verificó por lectura de código que
ningún campo de formulario ni nombre de evento cambió, solo copy visible y CSS.

### Punto exacto para continuar
1. Levantar el servidor de preview (`ache-static`, puerto 8934) y resolver el
   problema puntual de captura en `#dispositivos` (probablemente alcanza con
   navegar con el nav real en vez de `scrollIntoView` + JS, o esperar a que termine
   el `reveal` antes de capturar).
2. Tomar las capturas pendientes: Productos desktop, Formulario desktop (radios/
   checkboxes), Biomechanics Studio desktop, Equipo desktop, Hero mobile, Formulario
   mobile — exactamente las 7 que pidió Matías en la consigna original.
3. Confirmar visualmente que el `<details id="profForm">` abre/cierra bien y que el
   submit del formulario profesional sigue funcionando igual que antes.
4. Recién con esas capturas aprobadas por Matías, evaluar push/deploy — no antes.
