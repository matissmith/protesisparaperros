# Ache Innovation — Landing institucional (protesisparaperros.com.ar)

Este archivo existe para que cualquier agente (Claude, Codex, o quien sea) arranque con
el mismo piso de información, sin depender de que alguien le cuente bien la historia.
**Leelo antes de tocar nada.** Si algo acá no coincide con lo que ves en el repo,
avisá antes de asumir — puede haber otro agente trabajando en paralelo.

## Qué es esto

Ache Innovation es una startup de rehabilitación animal (Argentina, con visión de ser
pionera en América). Diseña dispositivos externos de movilidad a medida: prótesis,
órtesis, arneses de rehabilitación y carros ortopédicos, hoy enfocada en perros.

Este repo es la landing institucional + marketplace + puerta de entrada al software
clínico (Ache Biomechanics Studio, repo aparte).

- **Único archivo**: `index.html` (HTML/CSS/JS inline, sin build step, sin framework).
- **Repo**: `git@github.com:matissmith/protesisparaperros.git`, rama `main`.
- **Deploy**: Cloudflare Pages, automático con cada push a `main`.
- **Dominio en vivo (el único link que Matías comparte)**: `https://protesisparaperros.com.ar/`
- Archivo suelto sin trackear en la raíz del repo: `ache-leads-appscript.gs` — es
  código del Google Apps Script que recibe los leads del formulario, no es del
  frontend, no lo toques salvo que te pidan específicamente trabajar en eso.

## Ojo con esto: hay un archivo viejo que NO es este proyecto

Un nivel arriba de este repo (`02_Web_Institucional/`) hay un archivo suelto
`ache-innovation-claude.html` (+ un backup). **No es parte de este repo, no tiene
git, no está deployado en ningún lado que hayamos encontrado.** Es un prototipo más
viejo (última modificación fines de junio) que incluía secciones de animales
productivos (bovinos/equinos) y un iframe embebido del software. Si alguien te pide
"recuperar la sección de bovinos" o "el iframe del software", esa referencia visual
está ahí — pero no asumas que hay que portarlo a este repo sin confirmarlo primero,
puede ser una idea descartada.

## Reglas de trabajo (no negociables, ya validadas con Matías)

1. **Antes de tocar nada**: `git log --oneline -10` y `git status` en este repo.
   El estado puede haber cambiado desde la última vez que alguien lo miró — más de
   un agente puede estar trabajando acá sin coordinarse.
2. **Cambios quirúrgicos.** No reescribas secciones que ya funcionan. No rediseñes
   por intuición sin que te lo pidan.
3. **Sin emojis**, ni en copy ni en código.
4. **Sin placeholders vacíos.** Si no hay foto real, usar render/imagen genérica
   prolija, nunca un rectángulo vacío o un texto tipo "Foto acá".
5. **Probar antes de pushear**, en los anchos de siempre: 360, 390, 412, 430, 768
   (mobile/tablet, con WebKit *y* Chromium si podés — Safari real tiene bugs propios,
   por ejemplo `backdrop-filter` no se recorta bien al `border-radius`, ver más abajo)
   y 1024/1200/1440 (desktop). Sacar capturas reales, no asumir que "debería andar".
6. **Si tocás algo dentro de `@media(max-width:960px)` o similar, confirmá que
   desktop no cambió** — se puede hacer un diff de píxeles contra el commit anterior
   en 1024/1200/1440 con `prefers-reduced-motion:reduce` activado (si no, las
   animaciones con timing distinto ensucian la comparación).
7. **No pushear sin haber validado.** Mostrale a Matías antes/después si el cambio
   es visible, no solo digas "listo".
8. Si vas a modificar una sección, decí primero qué archivo/sección vas a tocar y
   por qué, antes de escribir el diff.

## Decisiones de producto que NO están escritas en el código (o poco)

- `+120 veterinarios en red` es un dato institucional importante, recuperado después
  de que una ronda anterior lo había sacado por error. Tiene que tener presencia real,
  no un número perdido. **Estado actual: visible en desktop (hero + sección
  Problema/Respuesta), pero en mobile el hero-stats está con `display:none`
  (regla vieja, línea ~355), así que en mobile el `+120` recién aparece en la sección
  Problema/Respuesta, no arriba del todo.** Decisión pendiente: ¿mostrar una versión
  compacta en el hero mobile, o alcanza con que esté más abajo?
- El hero usa el aspect-ratio real de la foto (`500/751`, o sea 1000×1502px) en mobile
  para que la imagen entre completa, sin recortar y sin bordes blancos. Si cambian la
  foto del hero, recalcular el aspect-ratio contra el archivo real, no asumir.
- Los títulos (`h2.display`) en mobile usan `text-wrap:balance` + un `clamp()` de
  font-size medido a mano contra la palabra más larga del sitio, para que nunca
  necesiten partirse a mitad de palabra. Si agregan un título nuevo con una palabra
  larga, revisar que entre en 360px de ancho antes de dar por bueno el tamaño.
- El nav en mobile es una cápsula flotante al hacer scroll (no una barra rígida de
  punta a punta). **No le agregues `backdrop-filter` (blur)** — Safari/iOS no lo
  recorta bien al `border-radius` y deja un resabio rectangular. Se sacó a propósito
  y se compensó con más opacidad de fondo sólido.
- La sección "Tecnología"/Biomechanics Studio dejó de usar fotos superpuestas con
  parallax (el efecto tapaba texto al hacer scroll en mobile, bug recurrente) y ahora
  es una tarjeta de acceso + 4 pasos numerados. Si quieren volver a un composición de
  fotos ahí, hay que resolver ese problema de superposición de nuevo, con cuidado.

## Deuda técnica conocida (no urgente, pero real)

Hay un bloque de CSS agregado con el comentario `Ache correction layer — 2026-07-20`
que usa ~25 reglas con `!important` apiladas sobre reglas viejas en vez de editarlas
directamente. Funciona, pero es frágil: cada cambio futuro en esas mismas secciones va
a tener que pelear contra ese `!important`. Sería bueno, en algún momento con tiempo,
fusionar esas reglas en las originales y sacar los `!important` innecesarios — pero
no es prioridad si no está rompiendo nada visible.

## Cómo probar localmente

No hay build. Basta con:
```
python3 -m http.server 8934
```
desde esta carpeta, y abrir `http://localhost:8934/index.html`. Para capturas
automatizadas, Playwright anda bien (`pip3 install playwright && python3 -m
playwright install webkit chromium`).
