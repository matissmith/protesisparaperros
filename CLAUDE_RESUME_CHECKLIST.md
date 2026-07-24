# Checklist de retoma — Claude Code

Fuente principal: `HANDOFF_CLAUDE_2026-07-24.md`.

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
- [ ] `footer-audit-ache-v1.md` para el próximo bloque.
- [ ] `navigation-audit-ache-v1.md` solo como diagnóstico histórico.
- [ ] `SESSION_STATUS.md` únicamente si hace falta rastrear una decisión antigua.

## Estado que debe confirmarse

- [ ] Rama `main`.
- [ ] HEAD esperado al crear este handoff: `c2d8de5`.
- [ ] `origin/main` esperado: `c2d8de5`.
- [ ] No hay cambios tracked o staged inesperados.
- [ ] `.claude/` permanece sin trackear.
- [ ] Los documentos de auditoría/handoff pueden estar sin trackear hasta que
      Matías autorice un commit.
- [ ] Cloudflare sirve el commit esperado antes de atribuirle estado de producción.

## URLs

- [ ] Landing: `https://protesisparaperros.com.ar/`
- [ ] Software: `https://app.protesisparaperros.com.ar/`
- [ ] Endpoint: leer `LEADS_ENDPOINT` localmente; no copiarlo a documentación
      pública ni cambiarlo por una tarea visual.

## Prohibiciones

- [ ] No tocar `ache-leads-appscript.gs` por cambios visuales.
- [ ] No tocar formularios, payloads, analytics ni endpoints en el bloque footer.
- [ ] No crear una sección Profesionales independiente.
- [ ] No cambiar catálogo, Studio, FAQ o navegación superior.
- [ ] No crear enlaces legales falsos.
- [ ] No afirmar prueba física si solo hubo emulación.
- [ ] No incluir `.claude/`.
- [ ] No hacer commit, push o deploy sin orden explícita.

## Primer trabajo pendiente

Rediseñar únicamente el footer según `footer-audit-ache-v1.md`:

- [ ] anclas aprobadas;
- [ ] CTA de caso;
- [ ] acceso a Studio y recorrido profesional;
- [ ] FAQ;
- [ ] redes sin duplicar WhatsApp;
- [ ] contraste, foco y áreas táctiles;
- [ ] responsive;
- [ ] reemplazo futuro por Política de privacidad y Términos reales.

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
