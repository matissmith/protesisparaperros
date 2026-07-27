# Checklist de retoma — Claude Code

Fuente principal: `HANDOFF_CLAUDE_2026-07-24.md`.

> **Actualización 2026-07-27:** el footer ya fue rediseñado, commiteado (`ae0a006`
> — "Finalize responsive footer design"), pusheado y verificado en producción.
> El "primer trabajo pendiente" de este checklist (rediseño del footer) queda
> **superado**. No volver a rediseñar el footer salvo un bug real aprobado por
> Matías. El primer bloque pendiente ahora es la auditoría legal y de datos.

## Inicio

```bash
cd "/Users/matia/Documents/Ache Innovation/02_Web_Institucional/protesisparaperros"
git status --short
git log --oneline -10
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
```

## Leer antes de actuar

- [ ] `HANDOFF_CLAUDE_2026-07-24.md` completo.
- [ ] `AGENTS.md` completo.
- [ ] `footer-audit-ache-v1.md` como registro histórico del bloque ya cerrado
      (footer implementado en `ae0a006`).
- [ ] `navigation-audit-ache-v1.md` solo como diagnóstico histórico.
- [ ] `SESSION_STATUS.md` únicamente si hace falta rastrear una decisión antigua.

## Estado que debe confirmarse

- [ ] Rama `main`.
- [ ] HEAD esperado: `ae0a006` ("Finalize responsive footer design").
- [ ] `origin/main` esperado: `ae0a006`.
- [ ] No hay cambios tracked o staged inesperados.
- [ ] `.claude/` permanece sin trackear (incluye `launch.json`).
- [ ] Los documentos de auditoría/handoff pueden estar sin trackear hasta que
      Matías autorice un commit.
- [ ] Publicación verificada por contenido servido en la URL pública, no por el
      panel de Cloudflare, antes de atribuirle estado de producción.
- [ ] El footer ya está cerrado (ver handoff sección G); verificar que los
      legales sigan mostrándose como texto "En preparación", no como enlaces
      reales ni falsos.

## URLs

- [ ] Landing: `https://protesisparaperros.com.ar/`
- [ ] Software: `https://app.protesisparaperros.com.ar/`
- [ ] Endpoint: leer `LEADS_ENDPOINT` localmente; no copiarlo a documentación
      pública ni cambiarlo por una tarea visual.

## Prohibiciones

- [ ] No tocar `ache-leads-appscript.gs` por cambios visuales.
- [ ] No tocar formularios, payloads, analytics ni endpoints.
- [ ] No crear una sección Profesionales independiente.
- [ ] No cambiar catálogo, Studio, FAQ o navegación superior.
- [ ] No crear enlaces legales falsos.
- [ ] No afirmar prueba física si solo hubo emulación.
- [ ] No incluir `.claude/`.
- [ ] No hacer commit, push o deploy sin orden explícita.
- [ ] **No volver a rediseñar el footer salvo un bug real aprobado por Matías**
      (bloque cerrado en `ae0a006`).

## Primer trabajo pendiente

El footer ya fue rediseñado, commiteado y pusheado en `ae0a006` — **no es más
el primer trabajo pendiente**. El primer bloque pendiente ahora es la
auditoría legal y de datos:

- [ ] formularios;
- [ ] Apps Script;
- [ ] Google Sheets;
- [ ] analytics;
- [ ] Meta Pixel;
- [ ] Google;
- [ ] Cloudflare;
- [ ] Biomechanics Studio.

Del footer solo queda pendiente, como tarea aparte:

- [ ] redactar y publicar Política de privacidad y Términos de uso reales
      (hoy: texto no interactivo "En preparación", verificar que siga así);
- [ ] probar el footer y la navegación en un dispositivo físico real (todavía
      solo hay validación por emulación).

## ¿Debe tocarse Apps Script?

Solo si existe un bug backend reproducible o cambia el contrato de datos:

- guardado incorrecto o incompleto;
- validación backend incorrecta;
- columnas/esquema;
- respuesta JSON;
- notificación asíncrona;
- trigger o seguridad.

Si el cambio es HTML, CSS, copy, anclas o layout: **no tocar Apps Script ni crear
una nueva versión**.

## Validación antes de commit

- [ ] Revisar `git diff --check`.
- [ ] Ejecutar `bash build.sh` si cambió `index.html`.
- [ ] Verificar `dist/` solo como salida generada, no editarlo.
- [ ] Probar el bloque modificado en 320/390/430, 360/393/412, 768/800/820/1024
      y 1280/1440 según riesgo.
- [ ] Confirmar sin overflow horizontal.
- [ ] Confirmar consola sin errores nuevos.
- [ ] Confirmar formularios, analytics y endpoints intactos.
- [ ] Mostrar el diff y los archivos incluidos.

## Antes de push

- [ ] Commit aprobado por Matías.
- [ ] Staging contiene solo archivos autorizados.
- [ ] Working tree entendido.
- [ ] Push normal, nunca `--force`.
- [ ] Esperar Cloudflare y verificar el commit desplegado.
- [ ] No hacer deploy manual salvo instrucción explícita.
