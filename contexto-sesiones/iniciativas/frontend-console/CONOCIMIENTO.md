# Consola Frontend — Conocimiento

Reglas, modelo y decisiones internas de la consola, con su porqué. Los acuerdos entre partes viven en `docs/09-decisiones.md`; aquí solo se citan.

## Alcance y principio
Construir el visor y dashboard del reto contra el contrato y el Backend oficial (`docs/07`). Al principio se construyó contra el mock para no esperar al backend; desde el 2026-11-14 ya no se usa (ver abajo). Manda la fluidez de interacción (scrubbing sin red) y no inventar campos ni reglas fuera del contrato (`AGENTS.md`).

## Decisiones y su porqué
- **Stack React + TypeScript + Vite + Tailwind + R3F + Zustand (2026-11-14).** Es la propuesta de `docs/ideas/frontend-architecture-guide.md`. *Porqué:* resuelve el pendiente "Stack final de interfaz web" de `iniciativas/lunar-landing-navigator/CONOCIMIENTO.md`. *Descartado:* Vanilla JS + Three.js, por menor velocidad de prototipado y de reparto en carriles.
- **Revisión del handoff antes de implementar (2026-11-14).** `scripts/sync-handoff.sh` clona el handoff en `.handoff/` (solo lectura) y lista lo que cambió desde la última revisión. *Porqué:* el handoff cambia entre sesiones y la consola no debe copiar sus docs. *Descartado:* submódulo de git, por añadir fricción al flujo de dos personas.
- **Errores por `error.code`, con respaldo `{detail}` (2026-11-14).** El cliente decide por `error.code` si existe y, si no, mapea `{detail}` por estado HTTP. *Porqué:* desde el contrato v1.1 (D-010) backend en vivo y mock emiten `ErrorResponse`; el respaldo se queda para el backend oficial, que aún no cumple `P-001` (`iniciativas/lunar-landing-navigator/HANDOFF.md`).
- **La consola no usa el mock (2026-11-14, consola PR `#7`).** Se desarrolla, se prueba y se capturan pantallas contra el Backend oficial. *Porqué:* el mock es sintético: el Sol nunca se pone, así que daba GO donde el backend real da NO-GO y escondía problemas reales de la interfaz (auditoría en `iniciativas/lunar-globe-renderer/CONOCIMIENTO.md`). *Descartado:* mantenerlo para los estados offline y de error. El offline se prueba apuntando a un puerto sin servidor, y los errores que no se pueden provocar los cubren pruebas de lógica pura. Con esto desaparecen el aislamiento CommonJS de `.handoff/package.json` (`P-004`) y el rótulo "Sample data".

- **Globo lunar como iframe externo (D-011, 2026-11-14).** Lo decidió la iniciativa `lunar-globe-renderer`; la consola solo lo incrusta y le envía datos por `postMessage`. *Porqué:* aísla el peso de Cesium del bundle de la consola. Ver `iniciativas/lunar-globe-renderer/CONOCIMIENTO.md`.

- **Globo como render único (D-015, 2026-11-14).** *Porqué:* desmontar el iframe al evaluar recargaba el globo, cortaba la cámara y cambiaba de Cesium a Three.js con un salto visible; la escena local (12 km, gris, sin imagen) se veía muy por debajo. *Descartado:* fundido cruzado entre motores y una escena de alunizaje propia en Three.js. *Costo:* dos contextos WebGL mientras "Terrain detail" está abierto.

- **Spec de onboarding (2026-11-14, consola PR `#8`).** Tour, ayudas "?" y próxima acción, especificados en `docs/specs/onboarding-ayudas-sugerencias/` de la consola, con sus decisiones D1–D13. *Porqué:* la rúbrica pesa UX/UI y Comunicación, y el audit dio 19/40 en heurísticas de Nielsen. *Reglas:* sin librerías nuevas, y ningún umbral en el cliente; el veredicto y su causa salen de `site.checks`.

## Hallazgos verificados
- **Backend oficial, 2026-11-14:** con la configuración inicial de la consola (2026-12-01, 14 días, paso de 60 min), 11 de los 13 sitios dan NO-GO y los otros dos CAUTION. Shackleton Rim da NO-GO por pendiente (16°, el límite es 15°) en cualquier fecha. Apollo 11 da GO del 9 al 21 de diciembre.
- **Backend oficial, 2026-11-14:** `hours_to_next_sunset` y `hours_to_next_earthset` llegan en `null` también cuando el astro empieza oculto en `timeline[0]`, no solo cuando nunca se pone (`P-012`).
- **Backend oficial, 2026-11-14:** Chang'e 4 da `earth_visible_pct: 0`, igual que el registro histórico.
- La consola no llama a ningún servicio fuera de nuestra API. Las únicas fuentes externas del conjunto son las teselas de `trek.nasa.gov` que carga el globo (`layers.ts`, `terrain.ts`, `polar.ts` de su repo). Verificado el 2026-11-14.
- `SELECT_SITE` acerca la cámara del globo a 120 km del sitio; cerca del polo (Shackleton, Connecting Ridge) se ve el abanico del mosaico polar (`docs/11` §7).
- Backend en vivo y mock aceptan `lat` en `[-90, 90]` y responden `ErrorResponse` con `ERR_INVALID_COORDINATES` (HTTP 422) fuera de rango; el backend en vivo sirve 13 sitios y el mock 8 (`P-003`, D-010).
- `typecheck`, `lint` y `test` de la consola pasan (27 pruebas, consola PR `#7`).

## Supuestos sin verificar
- La escena local se revisó con render por software, no en una GPU real.

## Pendiente de decisión
- Asignación de carriles entre las dos personas (decide el equipo).
- Si se versiona la copia de `openapi.json` o se obtiene siempre del handoff (hoy se versiona y se compara en `sync:handoff`).
- Cómo pide "Terrain detail" la vista a ras de suelo al globo: `SET_VIEW`, `VIEW_FROM_SURFACE` o un mensaje nuevo (con el equipo del globo; depende de `P-010` para el relieve de 40 m).
