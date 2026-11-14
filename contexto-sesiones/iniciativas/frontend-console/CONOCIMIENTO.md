# Consola Frontend — Conocimiento

Reglas, modelo y decisiones internas de la consola, con su porqué. Los acuerdos entre partes viven en `docs/09-decisiones.md`; aquí solo se citan.

## Alcance y principio
Construir el visor y dashboard del reto sin esperar al backend, contra el contrato y el mock. Manda la fluidez de interacción (scrubbing sin red) y no inventar campos ni reglas fuera del contrato (`AGENTS.md`).

## Decisiones y su porqué
- **Stack React + TypeScript + Vite + Tailwind + R3F + Zustand (2026-11-14).** Es la propuesta de `docs/ideas/frontend-architecture-guide.md`. *Porqué:* resuelve el pendiente "Stack final de interfaz web" de `iniciativas/lunar-landing-navigator/CONOCIMIENTO.md`. *Descartado:* Vanilla JS + Three.js, por menor velocidad de prototipado y de reparto en carriles.
- **Revisión del handoff antes de implementar (2026-11-14).** `scripts/sync-handoff.sh` clona el handoff en `.handoff/` (solo lectura) y lista lo que cambió desde la última revisión. *Porqué:* el handoff cambia entre sesiones y la consola no debe copiar sus docs. *Descartado:* submódulo de git, por añadir fricción al flujo de dos personas.
- **Errores tolerantes a ambos formatos (2026-11-14).** El cliente decide por `error.code` si existe y, si no, mapea `{detail}` por estado HTTP. *Porqué:* backend en vivo y mock emiten formatos distintos; confirmado en `P-001` y documentado en `docs/06`. Se mantiene.
- **Mock aislado como CommonJS (2026-11-14).** Se escribe `.handoff/package.json` con `{"type":"commonjs"}` desde el script de sync. *Porqué:* no editamos `mock/` (no es nuestro). Documentado en `mock/README.md` (`P-004`).

- **Globo lunar como iframe externo (D-011, 2026-11-14).** Lo decidió la iniciativa `lunar-globe-renderer`; la consola solo lo incrusta y le envía datos por `postMessage`. *Porqué:* aísla el peso de Cesium del bundle de la consola. Ver `iniciativas/lunar-globe-renderer/CONOCIMIENTO.md`.

## Hallazgos verificados
- El mock devuelve los mismos campos que `contracts/openapi.json` para `/health`, `/evaluate` (336 puntos, `horizon_profile` de 360) y `/terrain/patch` (16384 celdas a 128×128), y envía CORS. Probado con `curl` el `2026-11-14`.
- El mock rechaza `lat` fuera de `[-90,-80]` con `ERR_INVALID_COORDINATES` (HTTP 422); el backend en vivo acepta `-90..90` (`P-003`, `docs/06`).
- `typecheck`, `lint`, `test` y `build` de la consola pasan.

## Supuestos sin verificar
- La escena 3D (escala de luces y de esferas del Sol y la Tierra, posición de cámara) se escribió pero no se revisó en el navegador.
- El backend en vivo se comporta como el mock en estructura de respuesta de las respuestas `200` (solo se contrastó el mock con el OpenAPI; los errores del backend en vivo los verificó Backend en `P-001`).

## Pendiente de decisión
- Asignación de carriles entre las dos personas (decide el equipo).
- Si se versiona la copia de `openapi.json` o se obtiene siempre del handoff (hoy se versiona y se compara en `sync:handoff`).
