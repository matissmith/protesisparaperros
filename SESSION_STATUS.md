# SESSION_STATUS — Ache web institucional

Última actualización: 2026-07-20

## Objetivo activo
Paso 1: estabilizar la landing/web pública antes de volver a tocar software o CAD.

## Regla crítica
No tocar el software Streamlit ni OpenSCAD/CAD en este paso. El foco es solo la web institucional/landing.

## Repo activo
`/Users/matia/Documents/Ache Innovation/02_Web_Institucional/protesisparaperros`

## URL pública objetivo
`https://protesisparaperros.com.ar/`

## Archivos tocados en esta sesión
- `index.html`
- `SESSION_STATUS.md`

## Archivos que NO se tocaron
- `ache-leads-appscript.gs` (untracked; pertenece al flujo de Google Apps Script)
- Software Streamlit
- CAD / OpenSCAD
- Otros repos

## Cambios aplicados
- Se ajustó el mensaje de la landing para recuperar tono profesional y de marca.
- Se mantuvo visible la autoridad de `+120 veterinarios en red`.
- Se redujeron títulos excesivamente largos/gigantes y se mejoró jerarquía tipográfica.
- Se suavizó el salto visual entre hero oscuro y sección clara de problema/respuesta.
- Se corrigió contraste de métricas del hero, especialmente desktop.
- Se reescribieron textos clave sin infantilizar:
  - `Un talle no alcanza.`
  - `Diseño a medida, acompañado por profesionales.`
  - `Del caso real al diseño técnico.`
  - `Soluciones externas Ache.`
  - `Biomechanics Studio.`
  - `Contanos qué necesita el animal.`

## Validación hecha
- Assets locales: sin faltantes.
- Textos clave presentes.
- Render local con Playwright:
  - mobile 390px: sin overflow horizontal.
  - mobile 430px: sin overflow horizontal.
  - desktop 1440px: sin overflow horizontal.
- Capturas temporales de validación:
  - `/tmp/ache_landing_validation/mobile390.png`
  - `/tmp/ache_landing_validation/mobile430.png`
  - `/tmp/ache_landing_validation/desktop1440.png`
  - `/tmp/ache_landing_validation/desktop1440_fix.png`

## Estado Git al cierre parcial
Hay cambios locales pendientes. No publicar sin revisar diff final.
`AGENTS.md` ya estaba modificado antes de esta sesión; no fue editado durante este paso.
`ache-leads-appscript.gs` sigue untracked y no debe tocarse salvo pedido explícito.

## Próximo paso recomendado
1. Revisar visualmente la web completa más abajo de la primera pantalla.
2. Validar secciones: problema/respuesta, proceso, productos, tecnología, contacto, footer.
3. Si todo está bien, pedir autorización explícita para commitear/pushear.

## 2026-07-20 — Paso 1 / ajuste menor mobile nav
- Se reemplazó el símbolo visual del menú mobile por tres barras CSS profesionales, manteniendo aria-label="Menú".
- Motivo: sostener regla de cero emojis/símbolos informales en la web institucional.
- No se tocó software, CAD, Streamlit, ni repos externos.

## 2026-07-20 — Ajuste visual hero → problema
- Se corrigió el salto abrupto entre el hero oscuro y la sección blanca de problema/respuesta.
- Cambio limitado a CSS de landing: transición suave con gradiente superior, menor padding inicial y sin tocar textos, software, CAD ni integración.
- Archivos previstos para commit: `index.html` y `SESSION_STATUS.md`.

## 2026-07-20 — Corrección del degradado sobre métricas
- Se eliminó el pseudo-elemento que invadía el hero y tapaba las métricas `4 / +120 / 100%`.
- La transición hero → problema queda limpia: sin overlay blanco encima de números ni textos.
- Cambio limitado a CSS de landing. No se tocó software, CAD ni integración.

## 2026-07-20 — Transición hero → problema con aire real
- Se reemplazó el corte seco por una transición diseñada: el hero conserva una franja azul inferior y las métricas quedan dentro del bloque oscuro, sin overlay encima.
- Se agregó sombra/degradado dentro del propio hero y un arranque suave en la sección problema, sin tapar números ni texto.
- Cambio limitado a CSS de landing. No se tocó software, CAD, integración ni contenido.

## 2026-07-20 — Corte visual Problema → Proceso
- Se corrigió el salto blanco contra blanco entre la sección Problema/Respuesta y Proceso.
- Proceso ahora arranca como bloque propio con fondo celeste/gris Ache, sombra interna y tarjetas blancas, para que el cambio de sección sea intencional y no parezca un hueco vacío.
- Cambio limitado a landing/CSS. No se tocó software, CAD, Streamlit ni detección de raza.

## 2026-07-20 — Sistema visual de transiciones de secciones
- Pedido del usuario: dejar de resolver los cambios de fondo con líneas rectas o cortes bruscos; generar una solución de alto nivel, tecnológica e innovadora, coherente con la landing.
- Trabajo realizado: se agregó un sistema CSS de transiciones reutilizables entre secciones: diagonales/ondas suaves, halos radiales, scanline ámbar y entradas con profundidad visual.
- Alcance: solo `index.html` de la landing institucional. No se tocó el software Streamlit, CAD, detección de raza ni repositorios del software.
- Cuidado aplicado: se evitó tapar las métricas del hero y se mantuvieron las secciones legibles con reglas responsive para mobile.
- Pendiente de revisión visual: validar en navegador publicado que los cortes Hero→Problema, Problema→Proceso y Proceso→Soluciones se vean fluidos en desktop y mobile.

## 2026-07-20 — Validación del sistema de transiciones + 2 correcciones (Claude)
- Se validó en vivo (Playwright, desktop 1440 + mobile 390) el sistema de transiciones
  de la entrada anterior: las transiciones diagonales/halos no tapan métricas ni
  contenido, se ven intencionales. Sin cambios necesarios ahí.
- Se detectó y corrigió: los títulos de `#como`, `#soluciones`, `#tecnologia`, `#contacto`
  y las tarjetas Problema/Respuesta habían crecido hasta `clamp(...,72px)` en desktop en
  rondas sucesivas de "correction layers". Se bajaron a un rango más contenido
  (`clamp(28-30px, ~3vw, 40-46px)`), consistente con la escala original del sitio
  (antes de las rondas de ajuste por el feedback de Andy/Loom). Cambio solo en las
  reglas de `font-size` de esas 6 selecciones puntuales, no se tocó estructura ni copy.
- Se restauró la composición de fotos superpuestas ("efecto 3D") en la sección
  Tecnología/Biomechanics Studio, que se había eliminado del HTML en una ronda anterior
  y reemplazado solo por tarjetas de texto. Ahora conviven: las dos fotos superpuestas
  (`assets/img/software-ui.png` + `assets/img/protesis.png`, con el parallax ya afinado
  en sesiones previas) a la izquierda, y a la derecha una sola tarjeta con el texto +
  los 4 pasos numerados + CTA (antes eran dos tarjetas separadas, se unificaron para
  evitar el look de "tarjeta dentro de tarjeta").
  - Se desactivó una regla vieja (`Mobile stability patch 2026-07-19`, `@media(max-width:768px)`)
    que aplanaba las fotos y ocultaba una de las dos (`.tf.b{display:none}`) — esa regla
    quedó huérfana cuando el HTML de fotos se sacó en la ronda anterior, y al restaurar
    el HTML volvía a activarse y anulaba el efecto. Se removió esa parte específica,
    dejando intacta la parte de `.hero-stats` de ese mismo bloque (esa sigue siendo
    necesaria y está bien).
  - Verificado con capturas reales: el efecto se ve completo en desktop (1440) y mobile
    (390), con margen entre las fotos y el título — no hay superposición sobre texto.
- Validado sin overflow horizontal en 360/390/412/430/768/1024/1440.
- Pendiente, NO se tocó todavía (requiere más cuidado, se avisó al usuario antes de
  encararlo): las ~4 capas de "correction layer"/`!important` acumuladas en el CSS
  siguen ahí sin consolidar. Es deuda técnica real pero no bloquea nada visible hoy.
- Archivos tocados: `index.html`, `SESSION_STATUS.md`. No se tocó el software.
- Estado: validado localmente, no pusheado todavía — pendiente de mostrarle antes/después
  a Matías y su OK explícito antes de commitear/pushear.

## 2026-07-21 — Ajuste narrativo y visual landing (Codex)
- Objetivo: aplicar feedback documentado sin reinventar: contraste ámbar en fondos claros, jerarquía tipográfica coherente, terminología consistente, narrativa problema→solución, tarjetas de producto más claras, sección sobre Ache y mayor protagonismo del software.
- Alcance previsto: `index.html` y este archivo.
- No tocar: software Streamlit/CAD, `AGENTS.md`, `ache-leads-appscript.gs`.
- Estado: iniciado.
- 2026-07-21 Codex: reemplazada la transición acumulada defectuosa por una sola capa `Ache premium transition system v2` en `index.html`. Objetivo: eliminar cortes rectos entre hero/problema/proceso/soluciones/tecnología sin tapar métricas ni textos; no se tocó software, copy, AGENTS.md ni ache-leads-appscript.gs. Pendiente: validación visual final antes de push si el usuario confirma que se ve bien.
