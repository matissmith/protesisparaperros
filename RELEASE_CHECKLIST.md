# Checklist de publicación — para Matías

Esto no es técnico. Son pasos en orden, con qué esperar en cada uno y cómo
volver atrás si algo sale mal. No hace falta entender el código para seguirlo.

## Antes de empezar

- No toques `ache-leads-appscript.gs` todavía (paso 3).
- No toques nada dentro de la carpeta `dist/` (se genera sola, no se edita a mano).
- Si algo no coincide con lo que describe este documento, parate y preguntá
  antes de seguir — no fuerces el paso siguiente.

## Paso 1 — Publicar el sitio (push)

**Qué hacer:** pedile a quien te ayude con la terminal que haga `git push` de
este repo a la rama principal.

**Qué esperar:** no debería tirar ningún error. Si tira un error de "conflicto"
o "rechazado", parate ahí — no forzar nada, avisar antes de seguir.

**No tocar:** no hace falta editar ningún archivo para este paso.

## Paso 2 — Esperar el despliegue automático

**Qué hacer:** nada. Al hacer el push del Paso 1, Cloudflare Pages detecta el
cambio y publica el sitio solo, en unos minutos.

**Cómo confirmar que funcionó:** entrá al panel de Cloudflare Pages y fijate que
el último "deployment" (despliegue) figure en verde / "Success". Después, abrí
`https://protesisparaperros.com.ar/` en una pestaña nueva (no en caché) y
recorré el sitio como lo haría un visitante: portada, dispositivos, formulario
de caso, formulario profesional, FAQ, botón de WhatsApp.

**No tocar:** no hace falta hacer nada manual en Cloudflare salvo mirar que
diga "Success".

## Paso 3 — Actualizar el Apps Script (recibe los formularios)

**Qué hacer:** abrí el proyecto de Apps Script vinculado a tu planilla de leads.
Reemplazá todo el contenido por el archivo `ache-leads-appscript.gs` de este
repo (es una versión ampliada, compatible con la que ya tenías — no borra ni
cambia nada de lo viejo, solo agrega). Después: **Implementar → Gestionar
implementaciones → ícono de lápiz → Nueva versión → Implementar**. La dirección
web que ya usa el formulario no cambia.

**Qué esperar:** el Apps Script guarda una "Nueva versión" sin pedirte cambiar
ninguna URL ni configuración adicional.

**No tocar:** no cambies el nombre del archivo, no borres funciones que no
reconozcas, no toques la URL de implementación existente.

## Paso 4 — Agregar las columnas nuevas en la planilla (Sheet)

**Qué hacer:** abrí la hoja "Leads" de tu planilla de Google Sheets. En la fila
1 (encabezados), agregá manualmente los títulos de columna nuevos, a partir de
la primera columna vacía después de las que ya existen. Los títulos exactos a
copiar están listados dentro de `ache-leads-appscript.gs`, en la función
`getOrCreateSheet` — es una lista de textos entre comillas, se pueden copiar
tal cual, en el mismo orden en que aparecen ahí.

**Por qué es necesario:** el script nuevo ya sabe guardar los datos nuevos en
esas columnas, pero no escribe los títulos solo si la hoja ya existía de antes
(solo lo hace si la crea de cero).

**Qué esperar:** después de este paso, la fila 1 de tu planilla va a tener más
columnas con nombre que antes. Los datos viejos no se mueven ni se pierden.

**No tocar:** no reordenes ni borres las columnas viejas que ya tenías.

## Paso 5 — Prueba controlada real

**Qué hacer:** con el sitio ya publicado (Paso 2) y el script ya actualizado
(Paso 3 y 4), completá y enviá un formulario real de prueba — uno de caso
(tutor) y uno profesional. Usá un nombre que se note que es una prueba, por
ejemplo "PRUEBA BORRAR".

**Cómo confirmar que funcionó:** en tu planilla de Google Sheets debería
aparecer una fila nueva por cada envío, con las columnas nuevas completas
(no vacías). También revisá que te haya llegado el mail de notificación de
lead, si tenés esa notificación activada.

**Después de confirmar:** borrá esas dos filas de prueba de la planilla para
que no queden mezcladas con leads reales.

**No tocar:** no uses datos de una persona real para esta prueba.

## Si algo sale mal — cómo volver atrás

- **El sitio se ve mal o rompió algo después del Paso 2**: entrá al panel de
  Cloudflare Pages, buscá el despliegue anterior (el que funcionaba) y usá la
  opción de volver a esa versión ("rollback"). Es un clic, no hace falta tocar
  código.
- **El formulario dejó de guardar leads después del Paso 3**: en Apps Script,
  andá a Implementar → Gestionar implementaciones y volvé a seleccionar la
  versión anterior como activa. La dirección web del formulario no cambia, así
  que el sitio sigue funcionando sin que vos toques nada ahí.
- **No estás seguro de si algo salió bien**: no sigas al paso siguiente. Es
  preferible pausar la publicación un rato hasta confirmar, que avanzar y
  después tener que deshacer varias cosas a la vez.

## Qué NO se incluyó en esta sesión (para que lo sepas)

- No se hizo push ni deploy — vos decidís cuándo hacerlo con este checklist.
- No se publicó el Apps Script — igual, es tu decisión y tu paso manual.
- No se probó cada combinación posible de producto/rol una por una, aunque el
  mecanismo es el mismo para todos.
