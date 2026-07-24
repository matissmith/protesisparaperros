# Auditoría de navegación y arquitectura de información — Ache

Fecha: 24 de julio de 2026  
Alcance: `index.html` actual, render local en 1440, 1024 y 390 px.  
Estado: propuesta; no incluye cambios de implementación.

## 1. Resumen ejecutivo

La landing tiene una estructura visible bastante más simple que su DOM: se ven nueve secciones principales y el footer. Cinco secciones históricas y varios bloques internos permanecen en el HTML con `display:none`; no ocupan espacio, pero aumentan la deuda y hacen más difícil razonar sobre navegación y CTA.

El recorrido de tutores funciona bien en lo esencial. Los CTA generales llegan al formulario con “No estoy seguro” y los cuatro CTA del catálogo preseleccionan correctamente Prótesis, Arnés de rehabilitación, Órtesis o Carro ortopédico. El formulario aparece debajo del header en los tres anchos probados.

El recorrido profesional es el problema principal:

- “Para profesionales” apunta a `#profesionales`, un `id` colocado sobre la botonera final de Studio. El usuario aterriza sin título ni explicación; en desktop el inicio del bloque queda parcialmente bajo el header.
- Los CTA con `#profForm` funcionan al hacer clic porque JavaScript abre el `<details>`, pero una URL nueva cargada directamente con `#profForm` deja el formulario cerrado y oculto.
- “Soy veterinario o fabricante” salta directamente al formulario y omite la explicación de Biomechanics Studio.

El sistema de scroll mezcla tres mecanismos: `scroll-margin-top`, un desplazamiento JavaScript con `navH=78` y el comportamiento nativo de hashes. Los clics interceptados ni siquiera actualizan `location.hash`, por lo que compartir la posición, recargarla o usar Atrás no reproduce el recorrido. La solución definitiva debe usar una única variable de altura del header y navegación nativa para anclas comunes.

### Recomendación central

Mantener cinco enlaces más un CTA:

**Dispositivos · Cómo funciona · Biomechanics Studio · Profesionales · Sobre Ache · [Evaluar un caso]**

No agregar FAQ al header: en 1024 px el menú actual ya utiliza casi todo el ancho. FAQ debe quedar accesible desde el footer.

## 2. Inventario completo de secciones visibles

Se auditan **10 bloques visibles**: nueve secciones y el footer.

| # | Encabezado / etiqueta | ID actual | Propósito y contenido | Público | CTA internos / enlaces entrantes | ¿Header? | Problemas |
|---|---|---|---|---|---|---|---|
| 1 | “Dispositivos de movilidad diseñados para cada perro.” / “Movilidad y rehabilitación animal” | Sin ID | Propuesta principal, líneas de producto, métricas y dos recorridos de entrada | Ambos | Tutor: “Evaluar el caso…”; profesional: “Soy veterinario…”; logo vuelve aquí con `#` | El logo debe llevar a Inicio | Falta `id` semántico. El CTA profesional evita la explicación del software. En mobile desaparece ese CTA. |
| 2 | “Dispositivos de movilidad para distintas necesidades” / “Soluciones de movilidad” | `dispositivos` | Catálogo de cuatro productos, estado y condiciones | Tutor, con utilidad profesional | Cuatro CTA al formulario; llegan header, footer, scroll cue | Sí: Dispositivos | Correcto. Los cuatro productos tienen CTA y preselección válida. |
| 3 | “Del caso a una propuesta concreta” / “Cómo trabajamos” | `como` | Proceso de cuatro pasos y aclaración de no compra | Ambos | Llegan header y footer; sin CTA propio | Sí, renombrado | “Cómo trabajamos” describe a Ache; “Cómo funciona” orienta mejor al usuario. |
| 4 | “Contanos el caso de tu perro” / “Formulario de caso” | `contacto-caso` | Formulario unificado, adaptativo por producto | Tutor | Header CTA, hero, catálogo, cierre y footer | CTA principal | El ID se confunde con contacto general. Conviene `consulta`. El éxito sí centra y enfoca la confirmación. |
| 5 | “Biomechanics Studio convierte…” / “Plataforma profesional” | `tecnologia` | Software, imágenes, cuatro capacidades, acceso a app, participación/demo y formulario profesional | Profesional; contexto para ambos | Header Studio, header Profesionales, hero profesional, cierre demo | Sí: Studio y subdestino Profesionales | `tecnologia` es genérico. `profesionales` está sobre una botonera, no sobre un comienzo contextual. `profForm` cerrado usa `display:none`. |
| 6 | “El equipo detrás de Ache” / “Sobre Ache” | `sobre-ache` | Presentación institucional breve | Ambos | Header y footer | Sí | El título promete equipo, pero las tarjetas están en la sección HTML siguiente. Visualmente son continuas; semánticamente están divididas. |
| 7 | Sin H2 visible / etiqueta “Programas y espacios…” | `equipo` | Tarjetas de Matías, Lucas y Josefina, red de +120 y programas | Ambos | Solo por continuidad desde Sobre Ache | No separado | Le falta encabezado propio porque depende del H2 anterior. Debe agruparse semánticamente con Sobre Ache, sin duplicar título. |
| 8 | “Preguntas frecuentes” | `faq` | Cinco preguntas visibles sobre productos, evaluación, alcance y software | Ambos | Solo por scroll; no hay enlace directo visible | No en header; sí en footer | Sección útil sin acceso directo. Añadirla al footer, no al header. |
| 9 | “Cada caso puede ser…” | `contacto` | Cierre con rutas tutor y demo profesional | Ambos | CTA general y demo | No | `contacto` es ambiguo y no contiene contacto general; debería ser `proximo-paso`. |
| 10 | Footer | Sin ID | Marca, redes, navegación secundaria, avisos | Ambos | Logo, redes, seis enlaces internos, dos enlaces legales inactivos | No | “Contacto” lleva al formulario de caso. Privacidad y Términos son enlaces sin destino. Falta FAQ. |

### Bloques no visibles que siguen en el DOM

`#selector`, la sección Problema, `#orientador`, “Qué sucede después” y “Contacto directo” usan `retire-block`; además hay grids profesionales, FAQs y tarjetas finales ocultas. No reservan altura porque `.retire-block{display:none}`, pero conservan CTA e IDs antiguos en el código. Deben tratarse como deuda de limpieza, no como parte de la arquitectura visible.

## 3. Diagnóstico del header actual

Medidas reales:

- Desktop y laptop: header fijo de **74 px**.
- Mobile scrolleado: cápsula de **56 px**, ubicada a 8 px del borde; su borde inferior queda en 64 px.
- En 1024 px los elementos caben, pero ocupan desde x=26 hasta x=998: solo quedan 26 px por lado. No hay margen para un sexto enlace, zoom o textos más largos.

| Elemento | Destino actual y resultado real | Evaluación | Decisión | Nombre recomendado |
|---|---|---|---|---|
| Logo | `#`; vuelve arriba por comportamiento nativo | Funciona, pero `#` no identifica Inicio y no aporta foco | Mantener, corregir destino | Ache → `#inicio` |
| Dispositivos | `#dispositivos`; sección en y=78, H2 visible | Nombre y destino correctos | Mantener | Dispositivos |
| Cómo trabajamos | `#como`; H2 visible | Destino correcto; nombre algo institucional | Renombrar | Cómo funciona |
| Biomechanics Studio | `#tecnologia`; H2 visible | La marca requiere contexto, que la sección sí ofrece | Mantener, cambiar ID | Biomechanics Studio |
| Para profesionales | `#profesionales`; aterriza en una botonera. H2 de Studio queda entre 672 y 1.331 px por encima según viewport; en desktop el target empieza en y=48 bajo un header que termina en y=75 | Destino incorrectamente ubicado y sin contexto | Reemplazar destino y acortar | Profesionales |
| Sobre Ache | `#sobre-ache`; H2 visible | Relevante para confianza; las tarjetas siguen debajo | Mantener | Sobre Ache |
| Evaluar un caso | `#contacto-caso`, “No estoy seguro”; H2 visible | Acción primaria correcta para el público principal | Mantener, cambiar ID | Evaluar un caso |

En mobile, los cinco enlaces aparecen en el desplegable y este se cierra al navegar. El CTA “Evaluar un caso” está fuera de `.nav-links` y se oculta; por eso el menú mobile no ofrece la acción principal.

## 4. Arquitectura de información

### Historia actual

1. Qué hace Ache: Hero.
2. Qué soluciones ofrece: Dispositivos.
3. Cómo funciona: Proceso.
4. Próximo paso para tutores: Formulario.
5. Tecnología y recorrido profesional: Studio.
6. Por qué confiar: Sobre Ache + equipo + red + programas.
7. Resolución de objeciones: FAQ.
8. Próximo paso final para ambos públicos: Cierre.

La secuencia es comprensible y no necesita un rediseño general. El formulario inmediatamente después del proceso es lógico para tutores. Studio inaugura después el recorrido profesional, y FAQ prepara el cierre.

### Problemas de navegación

- El subdestino profesional no coincide con el inicio conceptual del recorrido.
- El formulario profesional depende de un listener de clic y falla como enlace directo en una pestaña nueva.
- Los clics internos interceptados no actualizan el hash.
- El CTA principal falta dentro del menú mobile.
- Los enlaces legales visibles no tienen salida.

### Problemas de orden

- El hero profesional salta al formulario antes de explicar el valor de Studio.
- “Sobre Ache” y las tarjetas del equipo son dos `<section>` aunque forman un solo argumento de confianza.

### Problemas de contenido

- “Contacto” en el footer describe incorrectamente un formulario de evaluación.
- `tecnologia`, `como`, `contacto` y `contacto-caso` son IDs técnicos o ambiguos.
- El bloque profesional necesita un rótulo visible en el punto de aterrizaje.

### Mejoras opcionales

- Incluir FAQ en el footer.
- Eliminar en otra tarea los bloques retirados del DOM después de comprobar que no se reutilizarán.
- Añadir estado activo al enlace del header según la sección visible.

## 5. Menú definitivo recomendado

| Texto exacto | Destino | ID recomendado | Público | Reemplaza | Justificación |
|---|---|---|---|---|---|
| Dispositivos | Catálogo | `#dispositivos` | Tutor / ambos | Dispositivos | Es concreto y coincide con el contenido. |
| Cómo funciona | Proceso | `#como-funciona` | Ambos | Cómo trabajamos | Expresa qué encontrará el visitante. |
| Biomechanics Studio | Inicio informativo del software | `#studio` | Profesional / ambos | Biomechanics Studio | Mantiene la marca y no abre la app automáticamente. |
| Profesionales | Inicio visible del recorrido profesional dentro de Studio | `#profesionales` | Profesional | Para profesionales | Más corto; debe aterrizar en un título/rótulo con contexto, no en botones. |
| Sobre Ache | Bloque institucional completo | `#sobre-ache` | Ambos | Sobre Ache | Aporta confianza sin sumar otra opción. |
| **Evaluar un caso** | Formulario tutor, producto “No estoy seguro” | `#consulta` | Tutor | Evaluar un caso | CTA principal diferenciado. |

No se recomienda una alternativa secundaria: el menú de cinco enlaces más CTA equilibra los dos públicos y cabe en laptop. FAQ debe ir al footer.

## 6. Mapa definitivo de anclas

| Sección / bloque | ID actual | ID recomendado | Deben apuntar aquí | Posición esperada |
|---|---|---|---|---|
| Hero / Inicio | Sin ID | `inicio` | Logos | Inicio de página; H1 totalmente visible |
| Catálogo | `dispositivos` | `dispositivos` | Header, footer, scroll cue | Etiqueta y H2 entre 90–130 px bajo el borde superior desktop; 72–100 px mobile |
| Proceso | `como` | `como-funciona` | Header y footer | Etiqueta y H2 visibles |
| Formulario tutor | `contacto-caso` | `consulta` | CTA generales y de producto | “Formulario de caso” y H2 visibles; selector editable |
| Studio informativo | `tecnologia` | `studio` | Header Studio, CTA “Ver plataforma” | Etiqueta “Plataforma profesional” y H2 visibles |
| Recorrido profesional | `profesionales` sobre CTA | `profesionales`, reubicado antes de su introducción/acciones | Header Profesionales, hero profesional | Rótulo o título “Profesionales” visible; no abrir formulario |
| Formulario profesional | `profForm` | `formulario-profesional` | Participar/demo y demo del cierre | Abrir `<details>`, mostrar resumen/campos bajo header y enfocar su título |
| Institucional + equipo | `sobre-ache` y `equipo` | `sobre-ache`; `equipo` queda interno | Header y footer | H2 “El equipo detrás de Ache” y texto visibles |
| FAQ | `faq` | `preguntas-frecuentes` | Footer | H2 visible |
| Cierre | `contacto` | `proximo-paso` | Enlace opcional de footer | H2 y ambos CTA visibles |

Los CTA generales deben seleccionar “No estoy seguro”. Los CTA del catálogo deben conservar las preselecciones verificadas: Prótesis, Arnés de rehabilitación, Órtesis y Carro ortopédico.

## 7. Auditoría de CTA

Se auditaron **31 enlaces y botones visibles en desktop**. El botón hamburguesa y los cinco `<summary>` de FAQ se revisaron como controles, pero no se cuentan como CTA.

| # | Texto y ubicación | Acción actual | Recomendación / contexto |
|---|---|---|---|
| 1 | Logo header | `#` | `#inicio`; mantener |
| 2 | Dispositivos header | `#dispositivos` | Mantener |
| 3 | Cómo trabajamos header | `#como` | Renombrar y usar `#como-funciona` |
| 4 | Biomechanics Studio header | `#tecnologia` | `#studio`; mantener informativo |
| 5 | Para profesionales header | `#profesionales` | Corregir ubicación; renombrar Profesionales |
| 6 | Sobre Ache header | `#sobre-ache` | Mantener |
| 7 | Evaluar un caso header | Formulario; “No estoy seguro” | Mantener; incluir también en menú mobile |
| 8 | Evaluar el caso de mi perro, hero | Formulario; “No estoy seguro” | Mantener |
| 9 | Soy veterinario o fabricante, hero | Abre directamente `#profForm`, sin preselección | Llevar a `#profesionales`; no saltar explicación |
| 10 | Postular un caso de prótesis | Formulario; Prótesis | Correcto |
| 11 | Sumarse a la preventa | Formulario; Arnés de rehabilitación | Correcto |
| 12 | Consultar por una órtesis | Formulario; Órtesis | Correcto |
| 13 | Contarnos qué necesita mi perro | Formulario; Carro ortopédico | Correcto |
| 14 | Enviar consulta | Envía formulario tutor | Mantener |
| 15 | Abrir Biomechanics Studio | App real, pestaña nueva | Correcto; acción directa diferenciada |
| 16 | Participar o solicitar una demo | Abre formulario profesional sin preselección | Correcto para intención combinada; cambiar al ID definitivo |
| 17 | Evaluar un caso, cierre | Formulario; “No estoy seguro” | Correcto |
| 18 | Solicitar una demo, cierre | Abre formulario y marca demo | Correcto; mismo formulario, contexto demo |
| 19 | Logo footer | `#` | `#inicio` |
| 20 | LinkedIn footer | Externo | Mantener |
| 21 | Instagram footer | Externo | Mantener |
| 22 | WhatsApp footer | Externo | Mantener |
| 23 | Dispositivos footer | `#dispositivos` | Mantener |
| 24 | Cómo trabajamos footer | `#como` | Igualar nombre/ID al header |
| 25 | Biomechanics Studio footer | `#tecnologia` | Usar `#studio` |
| 26 | Para profesionales footer | `#profesionales` | Corregir destino y nombre |
| 27 | Sobre Ache footer | `#sobre-ache` | Mantener |
| 28 | Contacto footer | Formulario tutor | Renombrar “Evaluar un caso” |
| 29 | Política de privacidad | `#`, bloqueado por `return false` | Poner destino real o retirar hasta tenerlo |
| 30 | Términos de uso | `#`, bloqueado por `return false` | Poner destino real o retirar hasta tenerlo |
| 31 | WhatsApp flotante | Externo | Mantener; verificar que no tape CTA en cada cambio visual |

No hay tarjetas equivalentes sin CTA: las cuatro tarjetas de producto tienen acción. Los tres perfiles institucionales no necesitan CTA. Los cinco FAQs visibles abren correctamente; deben conservarse como controles locales, no como destinos de navegación individuales.

## 8. Solución global de scroll y centrado

### Por qué hoy se desfasa

1. El header real mide 74 px desktop y 56 px mobile más 8 px de separación superior.
2. JavaScript usa siempre `navH=78`, ignorando el viewport y las reglas CSS.
3. `.section` usa `scroll-margin-top:82px`; mobile lo cambia a 70 px, pero el script no utiliza esos valores.
4. Los clics usan una animación manual y `preventDefault()`, por lo que no actualizan el hash.
5. Una URL con hash usa el mecanismo nativo, diferente del clic.
6. Al abrir `#profForm`, su altura cambia antes del cálculo; en carga directa no se abre.
7. `#profesionales` está colocado en el sitio equivocado.

### Solución recomendada

- Definir una sola variable: altura efectiva `--header-h:74px`; en mobile `--header-h:64px` (56 px + 8 px superior).
- Aplicar en `html` un `scroll-padding-top` calculado con la altura más una separación de 12–16 px.
- Aplicar el mismo valor como `scroll-margin-top` a todos los destinos semánticos.
- Eliminar la animación manual y el `navH=78` para anclas comunes. Usar enlaces nativos y `scroll-behavior:smooth`, desactivado con movimiento reducido.
- Para CTA con comportamiento: preseleccionar producto o abrir el formulario y, en el siguiente frame, usar `scrollIntoView({block:"start"})`.
- No interceptar enlaces normales; así el hash, Atrás, recarga y enlaces compartidos funcionan.
- Al cargar con hash, abrir el formulario profesional si el destino lo requiere y repetir scroll/foco después del render.
- Al navegar en mobile: cerrar menú, actualizar `aria-expanded`, devolver scroll al documento y mantener foco coherente.
- Añadir `tabindex="-1"` al encabezado destino cuando se transfiera foco programáticamente.

La posición aprobable es que la etiqueta/H2 comience claramente bajo el header, no necesariamente que el borde de la sección quede centrado.

## 9. Diferencias desktop y mobile

### Desktop 1440

- Cinco enlaces y CTA tienen aire suficiente.
- Los destinos principales quedan con H2 visible.
- Profesionales es la excepción: aterriza sin título y parcialmente bajo el nav.
- El formulario profesional abierto queda correctamente bajo el header.

### Laptop 1024

- No hay overflow, pero el header ocupa prácticamente todo el ancho.
- No conviene agregar FAQ ni otro enlace.
- Los nombres más cortos “Cómo funciona” y “Profesionales” mejoran resiliencia.
- Se recomienda activar la variante hamburguesa algo antes si se soporta zoom alto.

### Mobile 390

- No hay overflow horizontal.
- Menú desplegable: orden consistente y cierre automático correcto.
- La cápsula fija termina en y=64; destinos normales llegan a y=78.
- Falta el CTA principal dentro del menú.
- Profesionales aterriza con el H2 de Studio 1.331 px por encima.
- El menú no bloquea el scroll del fondo y no expone `aria-expanded`; mejora accesible P2.
- El CTA profesional del hero no está visible; el acceso profesional depende del menú o de llegar a Studio.
- Logo permite volver arriba, pero debe usar `#inicio`.

## 10. Hallazgos priorizados

### P0 — críticos

1. **Destino de Profesionales incorrecto:** el header aterriza en una botonera sin contexto; el título queda muy por encima y parte del destino se tapa en desktop.
2. **Enlace directo al formulario profesional roto:** en una pestaña nueva, `#profForm` queda cerrado con `display:none` y la página permanece arriba.

### P1 — importantes

1. El CTA profesional del hero omite toda la explicación de Studio.
2. El menú mobile no contiene el CTA principal “Evaluar un caso”.
3. Los clics internos no actualizan el hash; Atrás, recarga y compartir no reproducen la posición.
4. Header de 1024 px sin margen para otro enlace, zoom o crecimiento de copy.
5. Política de privacidad y Términos son enlaces visibles sin salida.
6. “Sobre Ache” y las tarjetas del equipo están separadas semánticamente aunque forman un bloque.

### P2 — mejoras

1. Renombrar IDs ambiguos y “Cómo trabajamos”.
2. Añadir FAQ al footer.
3. Gestionar foco en destinos y `aria-expanded` del menú.
4. Bloquear scroll de fondo mientras el menú mobile esté abierto.
5. Retirar en otra tarea el DOM oculto obsoleto.
6. Añadir estado activo del enlace según sección.

## 11. Plan de implementación futuro

### A. HTML — complejidad baja/media

- Añadir/reubicar IDs según el mapa.
- Poner `id="inicio"` en el hero.
- Reubicar `profesionales` sobre un comienzo visible dentro de Studio.
- Renombrar enlaces de header/footer.
- Incluir el CTA principal dentro del menú mobile sin duplicarlo visualmente en desktop.
- Agrupar semánticamente Sobre Ache y equipo.
- Resolver o retirar temporalmente enlaces legales inactivos.

No tocar copy comercial, formularios, payloads, catálogo, analytics ni backend.

### B. CSS — complejidad baja

- Crear variable única de altura del header por breakpoint.
- Definir `scroll-padding-top` y `scroll-margin-top` globales.
- Ajustar breakpoint del menú si 1024 con zoom no tiene margen.
- Definir bloqueo de scroll para menú abierto.

Riesgo: reglas `!important` de la capa de corrección; debe editarse la regla responsable, no sumar otra capa.

### C. JavaScript — complejidad media

- Quitar scroll manual para enlaces comunes.
- Mantener solo efectos necesarios: preselección de producto, apertura de formulario y foco.
- Soportar carga inicial con hash.
- Actualizar estado accesible y cierre del menú mobile.
- Conservar todos los eventos analytics existentes.

Riesgo: abrir `<details>` cambia altura; el scroll debe ejecutarse después del render.

### D. Pruebas

- Header completo: 1440, 1024 y 390 px.
- Cada enlace desde arriba y desde abajo.
- Carga directa de cada hash en pestaña nueva.
- Atrás/Adelante y recarga.
- Menú mobile abierto/cerrado y scroll del fondo.
- Cuatro productos y “No estoy seguro”.
- Tres recorridos profesionales: sección, app, formulario.
- Foco visible y título no tapado.
- Sin overflow ni errores de consola.

### E. Criterios de aprobación

- Cinco enlaces + CTA, mismos destinos en desktop/mobile.
- Todo hash es único, compartible y estable.
- Título/rótulo visible bajo el header.
- Productos correctos en el formulario.
- Studio informativo no abre la app por sí mismo.
- Profesionales no aterriza en una botonera aislada.
- Formulario profesional abre desde clic y URL directa.
- Sin enlaces visibles sin salida.

Complejidad total estimada: **media**.

## 12. Decisiones que Matías debe aprobar

1. Menú definitivo de cinco enlaces más CTA.
2. Renombrar “Cómo trabajamos” a “Cómo funciona” y “Para profesionales” a “Profesionales”.
3. Hacer que el CTA profesional del hero lleve primero al bloque profesional informativo, no directamente al formulario.
4. Reubicar el inicio de Profesionales dentro de Studio y mantener el formulario como subdestino.
5. Integrar semánticamente Sobre Ache y Equipo sin cambiar su contenido visible.
6. Añadir FAQ al footer, no al header.
7. Publicar páginas reales de Privacidad/Términos o retirar esos enlaces hasta tenerlas.
8. Reemplazar el scroll manual por el sistema global de anclas y foco.
