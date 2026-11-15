# Consola Frontend — Conocimiento

Reglas, modelo y decisiones internas de la consola, con su porqué. Los acuerdos entre partes viven en `docs/09-decisiones.md`; aquí solo se citan.

## Alcance y principio
Construir el visor y dashboard del reto sin esperar al backend, contra el contrato y el mock. Manda la fluidez de interacción (scrubbing sin red) y no inventar campos ni reglas fuera del contrato (`AGENTS.md`).

## Decisiones y su porqué
- **Stack React + TypeScript + Vite + Tailwind + R3F + Zustand (2026-11-14).** Es la propuesta de `docs/ideas/frontend-architecture-guide.md`. *Porqué:* resuelve el pendiente "Stack final de interfaz web" de `iniciativas/lunar-landing-navigator/CONOCIMIENTO.md`. *Descartado:* Vanilla JS + Three.js, por menor velocidad de prototipado y de reparto en carriles.
- **Revisión del handoff antes de implementar (2026-11-14).** `scripts/sync-handoff.sh` clona el handoff en `.handoff/` (solo lectura) y lista lo que cambió desde la última revisión. *Porqué:* el handoff cambia entre sesiones y la consola no debe copiar sus docs. *Descartado:* submódulo de git, por añadir fricción al flujo de dos personas.
- **Errores por `error.code`, con respaldo `{detail}` (2026-11-14).** El cliente decide por `error.code` si existe y, si no, mapea `{detail}` por estado HTTP. *Porqué:* desde el contrato v1.1 (D-010) backend en vivo y mock emiten `ErrorResponse`; el respaldo se queda para el backend oficial, que aún no cumple `P-001` (`iniciativas/lunar-landing-navigator/HANDOFF.md`).
- **Mock aislado como CommonJS (2026-11-14).** Se escribe `.handoff/package.json` con `{"type":"commonjs"}` desde el script de sync. *Porqué:* no editamos `mock/` (no es nuestro). Documentado en `mock/README.md` (`P-004`).

- **Globo lunar como iframe externo (D-011, 2026-11-14).** Lo decidió la iniciativa `lunar-globe-renderer`; la consola solo lo incrusta y le envía datos por `postMessage`. *Porqué:* aísla el peso de Cesium del bundle de la consola. Ver `iniciativas/lunar-globe-renderer/CONOCIMIENTO.md`.

- **Globo como render único (D-015, 2026-11-14).** *Porqué:* desmontar el iframe al evaluar recargaba el globo, cortaba la cámara y cambiaba de Cesium a Three.js con un salto visible; la escena local (12 km, gris, sin imagen) se veía muy por debajo. *Descartado:* fundido cruzado entre motores y una escena de alunizaje propia en Three.js. *Costo:* dos contextos WebGL mientras "Terrain detail" está abierto.

## Hallazgos verificados
- La consola no llama a ningún servicio fuera de nuestra API. Las únicas fuentes externas del conjunto son las teselas de `trek.nasa.gov` que carga el globo (`layers.ts`, `terrain.ts`, `polar.ts` de su repo). Verificado el 2026-11-14.
- `SELECT_SITE` acerca la cámara del globo a 120 km del sitio; cerca del polo (Shackleton, Connecting Ridge) se ve el abanico del mosaico polar (`docs/11` §7).
- El mock devuelve los campos de `contracts/openapi.json` para `/evaluate` (336 puntos, `horizon_profile` de 360) y `/terrain/patch` (16384 celdas a 128×128), y envía CORS. Su `/health` no trae `engine` ni `timestamp_utc`, que el contrato marca como obligatorios; la consola usa esa ausencia para rotular "Sample data". Probado el `2026-11-14` con el mock de `7988348`.
- Backend en vivo y mock aceptan `lat` en `[-90, 90]` y responden `ErrorResponse` con `ERR_INVALID_COORDINATES` (HTTP 422) fuera de rango; el backend en vivo sirve 13 sitios y el mock 8 (`P-003`, D-010).
- `typecheck`, `lint`, `test` y `build` de la consola pasan.

## Supuestos sin verificar
- La escena local se revisó con render por software, no en una GPU real.
- El backend en vivo se comporta como el mock en estructura de respuesta de las respuestas `200` (solo se contrastó el mock con el OpenAPI; los errores del backend en vivo los verificó Backend en `P-001`).

## Pendiente de decisión
- Asignación de carriles entre las dos personas (decide el equipo).
- Si se versiona la copia de `openapi.json` o se obtiene siempre del handoff (hoy se versiona y se compara en `sync:handoff`).
