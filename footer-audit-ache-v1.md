# Auditoría del footer de Ache — v1

Fecha: 24 de julio de 2026  
Repo: `protesisparaperros`  
Alcance: footer actual de `index.html` y botón flotante de WhatsApp.  
Estado: análisis y propuesta; sin cambios de código.

## Estado de implementación (actualizado 2026-07-27)

Esta auditoría ya fue ejecutada. El footer que describe como "actual" en las
secciones siguientes corresponde al estado **anterior** al commit `ae0a006`
("Finalize responsive footer design"), que reemplazó el footer por completo
según la arquitectura recomendada en este documento.

- **Auditoría ejecutada:** sí, íntegramente, en `ae0a006`.
- **Problemas P0 resueltos:** los cinco hallazgos P0 de la sección 10 (enlaces
  legales falsos, "Para profesionales" como navegación, anclas antiguas, logo
  con `href="#"`, aclaración clínica/legal con contraste insuficiente) están
  resueltos en el footer actual.
- **Navegación vieja reemplazada:** "Cómo trabajamos", "Para profesionales",
  "Más" y "Contacto" ya no existen en el footer. Se usan exclusivamente las
  anclas visuales aprobadas (`#nav-dispositivos`, `#nav-como-funciona`,
  `#nav-studio`, `#nav-sobre-ache`, `#nav-consulta`) más `#faq` y `#profForm`.
- **Enlaces legales falsos eliminados:** ya no existe `href="#"` ni
  `onclick="return false"` en el footer.
- **Legales reales todavía pendientes:** Política de privacidad y Términos de
  uso se muestran como texto plano no interactivo con el rótulo "En
  preparación". Esto es transitorio, no la solución final — sigue pendiente
  redactar y publicar los documentos reales y reemplazar ese texto por enlaces
  reales (ver decisión 3 de la sección 12, ya aprobada en ese sentido).
- **WhatsApp duplicado eliminado:** el footer ya no tiene un enlace de
  WhatsApp propio; se conserva únicamente el botón flotante.
- **Contraste y accesibilidad corregidos:** la aclaración clínica/legal y el
  copyright subieron de opacidad/tamaño, se agregó `:focus-visible`, los
  íconos sociales pasaron a 44×44 px y la palabra decorativa "Ache" quedó
  `aria-hidden="true"`.
- **Este documento se conserva completo como registro histórico** de la
  auditoría original; no se borró ni resumió el análisis. El detalle técnico
  del estado real post-implementación vive en
  `HANDOFF_CLAUDE_2026-07-24.md`, sección G.

> Aclaración posterior: retirar visualmente los enlaces legales falsos es una
> medida transitoria, no la decisión final. Política de privacidad y Términos de
> uso deben reemplazarse por documentos reales antes de una campaña o revisión
> legal; no deben eliminarse definitivamente del roadmap.

## 1. Resumen ejecutivo

El footer actual funciona como cierre visual, pero conserva la arquitectura anterior de la landing. Mezcla navegación vieja, un recorrido profesional que ya no existe como sección independiente, dos enlaces legales simulados y tres accesos sociales sin contexto. La información institucional útil queda repartida entre un slogan, un aviso legal de contraste bajo y una frase final con poca jerarquía.

La recomendación es reemplazarlo por un footer compacto de cuatro bloques: **marca**, **navegación**, **acciones y recursos**, y **redes**. Debe usar exclusivamente las anclas visuales aprobadas, incorporar FAQ, distinguir el acceso al software del formulario profesional y mantener un solo acceso persistente a WhatsApp. En mobile debe priorizar marca, CTA y navegación; no limitarse a apilar las columnas actuales.

Se auditaron 21 elementos: 20 dentro del footer y el contacto flotante. Hay cinco hallazgos P0: rutas internas desactualizadas, recorrido profesional contradictorio, enlaces legales falsos, logo con destino `#` y texto legal críticamente tenue.

## 2. Inventario actual

| # | Elemento y texto visible | Acción actual | Estado | Recomendación |
|---|---|---|---|---|
| 1 | Palabra decorativa “Ache” | Ninguna | Fondo tipográfico de gran tamaño; ocupa altura sin aportar navegación | **Reducir o eliminar.** Si se mantiene, que sea una marca de agua más contenida y `aria-hidden`. |
| 2 | Logo “Ache Innovation” | `href="#"` | Lleva al inicio de forma indirecta y agrega un hash vacío | **Corregir** a `#inicio`. |
| 3 | “Potenciamos la movilidad animal, porque cada paso cuenta.” | Ninguna | Coherente con la marca, pero poco informativo | **Reemplazar** por una descripción breve de actividad. |
| 4 | LinkedIn | URL corporativa; pestaña nueva | La URL es coherente. La respuesta automatizada de LinkedIn fue 999, por lo que no permite verificar el perfil sin sesión. Icono correcto y nombre accesible | **Mantener**, con `rel="noopener noreferrer"`. |
| 5 | Instagram | `https://www.instagram.com/ache.innovation/`; pestaña nueva | Respondió correctamente. Icono y `aria-label` correctos | **Mantener**, con `rel="noopener noreferrer"`. |
| 6 | WhatsApp del footer | `wa.me/5491123199500` con mensaje; pestaña nueva | Redirige correctamente a WhatsApp, pero duplica el botón flotante | **Eliminar del footer** si se conserva el flotante. |
| 7 | Título “Ache Innovation” | Ninguna | No describe el contenido de la columna | **Reemplazar** por “Navegación”. |
| 8 | “Dispositivos” | `#dispositivos` | El destino existe, pero no usa el ancla visual aprobada | **Corregir** a `#nav-dispositivos`. |
| 9 | “Cómo trabajamos” | `#como` | Nombre y ancla pertenecen a la arquitectura anterior | **Reemplazar** por “Cómo funciona” → `#nav-como-funciona`. |
| 10 | “Biomechanics Studio” | `#tecnologia` | Llega a la sección, pero no al inicio visual aprobado | **Corregir** a `#nav-studio`. |
| 11 | “Para profesionales” | `#profesionales` | El id existe dentro de Studio, pero presentarlo como sección separada contradice la arquitectura vigente | **Eliminar como navegación**. Reconvertir, si se necesita, en acción “Participar o solicitar una demo” → `#profForm`. |
| 12 | Título “Más” | Ninguna | Genérico; no ayuda a anticipar contenido | **Reemplazar** por “Acciones y recursos”. |
| 13 | “Sobre Ache” | `#sobre-ache` | El destino existe, pero no usa el ancla visual aprobada | **Corregir** a `#nav-sobre-ache`. |
| 14 | “Contacto” | `#contacto-caso` | Es el formulario de casos, no un contacto genérico; usa ancla vieja | **Reemplazar** por CTA “Evaluar un caso” → `#nav-consulta`. |
| 15 | “Política de privacidad” | `href="#"`, `return false`, `aria-disabled` | Parece enlace, pero no existe contenido legal | **Eliminar hasta contar con una política real**. |
| 16 | “Términos de uso” | `href="#"`, `return false`, `aria-disabled` | Parece enlace, pero no existe contenido legal | **Eliminar hasta contar con términos reales**. |
| 17 | “© 2026 Ache Innovation. Todos los derechos reservados.” | Ninguna | Correcto | **Mantener**. |
| 18 | “protesisparaperros.com.ar” | Ninguna | Dominio aislado y no clickeable | **Mantener como enlace** a `https://protesisparaperros.com.ar/`. |
| 19 | Aclaración sobre movilidad y evaluación veterinaria | Ninguna | Conceptualmente necesaria, pero demasiado tenue y pequeña | **Reescribir levemente y aumentar legibilidad**. |
| 20 | “El futuro de la movilidad animal empieza acá.” | Ninguna | Buen cierre, pero hoy queda perdido como segundo disclaimer | **Mantener** como frase final diferenciada. |
| 21 | Botón flotante “Hablar con Matías” | Mismo WhatsApp; pestaña nueva | Funciona y tiene nombre accesible. En mobile queda a 8 px del borde y puede cubrir contenido legal | **Mantener como único chat**, con zona de seguridad en el footer. |

## 3. Incongruencias con la landing actual

- El menú aprobado usa **Dispositivos, Cómo funciona, Biomechanics Studio, Sobre Ache y Evaluar un caso**. El footer todavía usa “Cómo trabajamos”, “Para profesionales”, “Más” y “Contacto”.
- Cuatro enlaces internos aterrizan en ids estructurales antiguos, no en las anclas visuales nuevas. Pueden llegar a la zona general, pero no respetan el encabezado fijo ni el punto de lectura aprobado.
- “Para profesionales” sugiere una sección independiente. El recorrido real vive dentro de Biomechanics Studio y culmina en el formulario `#profForm`.
- El footer no enlaza a FAQ, aunque es un recurso principal para resolver dudas.
- No existe acceso directo a la plataforma desde el footer.
- “Contacto” oculta el propósito real del formulario unificado: evaluar u orientar un caso.
- El slogan y la frase final compiten, mientras la descripción concreta de Ache queda relegada al texto legal.
- Los enlaces falsos de privacidad y términos generan una expectativa que la web no cumple.

## 4. Auditoría de enlaces

### Destinos internos

| Enlace recomendado | Destino exacto | Motivo |
|---|---|---|
| Dispositivos | `#nav-dispositivos` | Inicio visual aprobado del catálogo. |
| Cómo funciona | `#nav-como-funciona` | Inicio visual del proceso. |
| Biomechanics Studio | `#nav-studio` | Inicio del software, sin abrirlo automáticamente. |
| Sobre Ache | `#nav-sobre-ache` | Presentación institucional y equipo. |
| Preguntas frecuentes | `#faq` | Recurso ausente en el footer actual. |
| Evaluar un caso | `#nav-consulta` | Formulario unificado con producto editable. |
| Participar o solicitar una demo | `#profForm` | Formulario profesional dentro de Studio. |

No se recomienda conservar enlaces paralelos a `#dispositivos`, `#como`, `#tecnologia`, `#sobre-ache` o `#contacto-caso`, aunque esos ids existan. La navegación debe tener un único contrato.

### Enlaces externos

- **Abrir Biomechanics Studio:** `https://app.protesisparaperros.com.ar/`, nueva pestaña, `rel="noopener noreferrer"`.
- **LinkedIn:** mantener la URL actual. La comprobación HTTP automatizada fue bloqueada por LinkedIn (999), no indica necesariamente un enlace roto.
- **Instagram:** mantener la URL actual; respondió correctamente.
- **WhatsApp:** la URL actual redirige correctamente. Debe existir una sola representación prominente.
- **Dominio oficial:** convertir el texto actual en enlace absoluto.

### Enlaces falsos

“Política de privacidad” y “Términos de uso” deben desaparecer hasta que existan documentos reales. `aria-disabled` no corrige el problema semántico de presentar un enlace ficticio.

## 5. Arquitectura definitiva recomendada

### Bloque 1 — Marca

- Logo enlazado a `#inicio`.
- Descripción informativa de dos líneas.
- Frase final, separada de la descripción y sin competir con el logo.

### Bloque 2 — Navegación

- Dispositivos
- Cómo funciona
- Biomechanics Studio
- Sobre Ache
- Preguntas frecuentes

### Bloque 3 — Acciones y recursos

- CTA principal: **Evaluar un caso**
- Abrir Biomechanics Studio
- Participar o solicitar una demo

El primer enlace debe tener tratamiento de botón. Los otros dos pueden ser enlaces destacados, no tres botones equivalentes.

### Bloque 4 — Seguir a Ache

- LinkedIn
- Instagram

WhatsApp no se repite aquí si continúa el botón flotante.

### Banda inferior

- Copyright
- Dominio oficial enlazado
- Aclaración veterinaria
- Enlaces legales reales, únicamente cuando existan

## 6. Copy definitivo

**Descripción corta**

> Ache Innovation diseña dispositivos externos de movilidad a medida y desarrolla herramientas digitales para acompañar la evaluación, el diseño y la rehabilitación animal.

**Columnas**

- Navegación
- Acciones y recursos
- Seguir a Ache

**CTA principal**

> Evaluar un caso

**Acciones secundarias**

- Abrir Biomechanics Studio
- Participar o solicitar una demo

**Copyright**

> © 2026 Ache Innovation. Todos los derechos reservados.

**Dominio**

> protesisparaperros.com.ar

**Aclaración**

> Ache desarrolla dispositivos y herramientas de apoyo para la movilidad y rehabilitación animal. La información de este sitio no reemplaza la evaluación, el diagnóstico ni la indicación de un profesional veterinario.

**Frase de cierre**

> El futuro de la movilidad animal empieza acá.

El slogan “Potenciamos la movilidad animal, porque cada paso cuenta” debería salir del footer: es más emocional, pero duplica la función de la frase final y explica menos qué hace Ache.

## 7. Diseño visual

El fondo `#0B1528` es coherente con la marca. El problema no es la paleta, sino la densidad y la jerarquía:

- El padding vertical de 80 px, la palabra “Ache” gigante y dos disclaimers separados hacen que el footer sea más alto de lo necesario.
- En desktop, la grilla `1.5fr 1fr 1fr` deja una marca amplia y dos columnas pequeñas, pero no reserva un lugar claro para acciones.
- Los enlaces usan 14 px con separación vertical de 11 px; son legibles, aunque su área táctil real es inferior a 44 px.
- El copyright al 40% de blanco queda justo para texto de 12,5 px.
- La aclaración al 30% y 11,5 px tiene contraste insuficiente y es el texto más importante desde el punto de vista clínico/legal.
- La frase final al 45% parece otra nota legal y pierde jerarquía.
- El dominio queda aislado en el extremo opuesto sin ser interactivo.
- El isotipo/palabra de fondo puede mantenerse solo si no aumenta la altura; debería funcionar como textura, no como primer nivel.

Tratamiento recomendado: 64–72 px arriba y 32–40 px abajo en desktop; divisores sutiles; descripción a 15 px; enlaces a 14–15 px; legales a 12,5–13 px con contraste AA; CTA ámbar; frase final blanca o ámbar tenue, separada por un divisor.

## 8. Responsive

### 320–430 px, iPhone y Android

Orden recomendado:

1. logo y descripción;
2. CTA “Evaluar un caso” a ancho completo;
3. acciones de Studio;
4. navegación en dos columnas cuando entren; una columna en 320 px;
5. redes con icono y etiqueta visible;
6. copyright, dominio, aclaración y frase final.

No conviene apilar sin criterio las tres columnas actuales. Los enlaces deben tener una altura táctil mínima de 44 px o suficiente padding. El botón flotante de 46 px debe conservar al menos 12–16 px del borde y el footer necesita padding inferior adicional para que no cubra legales o redes.

### 768–820 px

Usar una grilla de dos columnas: marca/acciones y navegación/redes. La banda legal ocupa todo el ancho. Evitar el estado actual donde 768 px cae en una columna única pero 820 px cambia abruptamente a dos.

### 1024 px

Cuatro bloques compactos o una grilla `2fr 1fr 1.2fr .8fr`. Mantener la descripción en un ancho legible y evitar que el CTA comprima los enlaces.

### 1280–1440 px

Cuatro columnas alineadas arriba, ancho máximo igual al resto de la landing. La banda inferior debe sostener copyright y dominio en una línea, y la aclaración en una segunda línea de ancho controlado.

En todos los tamaños: sin `nowrap` en textos largos, sin overflow, iconos de 44 × 44 px, foco visible y separación de seguridad respecto del chat flotante.

## 9. Accesibilidad

- Los SVG sociales tienen un nombre accesible mediante `aria-label`; esto está bien.
- Los enlaces externos deben usar `rel="noopener noreferrer"` y, de ser posible, anunciar visual o accesiblemente que abren otra pestaña.
- Falta un estilo global visible para `:focus-visible` en enlaces del footer. El hover no es suficiente.
- Los iconos actuales miden 40 × 40 px; conviene llevar el área interactiva a 44 × 44 px.
- Los enlaces de texto tienen alturas cercanas a la línea de texto; aumentar padding vertical.
- Los enlaces legales falsos permanecen en el orden de tabulación pese a `aria-disabled`. Deben eliminarse, no simularse.
- La marca de agua “Ache” debe ser `aria-hidden="true"` si continúa.
- El orden DOM debe coincidir con el orden visual mobile.
- Evitar textos al 30–40% de blanco para cuerpos pequeños.
- No hay evidencia de enlaces con el mismo texto y destinos distintos dentro del footer, pero sí hay duplicación funcional de WhatsApp entre footer y flotante.

## 10. Hallazgos priorizados

### P0 — errores

1. Política de privacidad y Términos de uso son enlaces falsos.
2. “Para profesionales” contradice la arquitectura aprobada.
3. Los enlaces principales usan anclas antiguas y no los destinos visuales aprobados.
4. El logo usa `href="#"` en vez de `#inicio`.
5. La aclaración clínica/legal tiene tamaño y contraste insuficientes.

### P1 — problemas importantes

1. Falta FAQ en la navegación.
2. Falta acceso al software y al formulario profesional como acciones diferenciadas.
3. “Contacto” no describe el formulario unificado.
4. WhatsApp está duplicado y el flotante puede cubrir el footer.
5. La jerarquía mobile es un apilado básico.
6. Áreas táctiles y foco de teclado insuficientes.
7. Descripción de marca poco informativa.

### P2 — mejoras

1. Reducir la palabra decorativa “Ache”.
2. Convertir el dominio en enlace.
3. Reubicar y jerarquizar la frase final.
4. Ajustar padding, divisores y proporciones.
5. Añadir una indicación discreta para enlaces que abren otra pestaña.

## 11. Plan de implementación futuro

### A. HTML

Reemplazar exclusivamente el contenido de `<footer>` por cuatro bloques semánticos y una banda inferior. Mantener el logo SVG existente. No introducir nuevas secciones.

### B. CSS

Sustituir las reglas `.foot-*` actuales por una grilla de cuatro bloques, estados responsive definidos y zonas táctiles de 44 px. No acumular una nueva capa de overrides.

### C. Enlaces

Usar las cinco anclas aprobadas, `#faq`, `#profForm`, la URL existente del software y las URLs sociales actuales. Retirar enlaces legales falsos.

### D. Responsive

Validar 320, 375, 390, 414, 430, 360, 393, 412, 768, 800, 820, 1024, 1280 y 1440 px. Comprobar overflow, orden visual, chat flotante y áreas táctiles.

### E. Accesibilidad

Agregar foco visible, `aria-hidden` a decoración, relaciones claras para iconos y `noopener noreferrer` en destinos externos.

### F. Pruebas

Probar cada enlace interno, apertura del software, redes, recorrido profesional, CTA de casos, teclado, zoom al 200% y contraste. No enviar formularios.

No deben tocarse formularios, Apps Script, analytics, navegación superior, FAQ, banner de programas ni contenido de otras secciones.

## 12. Decisiones que Matías debe aprobar

1. Reemplazar el slogan por la descripción informativa propuesta.
2. Eliminar WhatsApp del footer y conservar solamente el botón flotante.
3. Eliminar temporalmente Política de privacidad y Términos de uso hasta contar con páginas reales.
4. Incluir “Participar o solicitar una demo” como enlace a `#profForm`.
5. Mantener “El futuro de la movilidad animal empieza acá” como cierre destacado.
6. Reducir o eliminar la palabra decorativa gigante “Ache”.
7. Confirmar si se prioriza crear una Política de privacidad real antes de futuras campañas.
