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
