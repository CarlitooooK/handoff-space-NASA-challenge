# Consola Frontend — Historial

Cronología, de lo más nuevo a lo más viejo. Fechas absolutas. No se borra: se agrega.

## 2026-11-14
- Se propuso un diseño de consola en Figma con el render como fondo y paneles glass flotantes, alternativo al shell 30/70; ver `docs/ideas/console-ui-figma.md`. Sin acordar: no cambia el código ni las decisiones.
- Se revisó `969c4c4`/`2a577df` (iniciativa `lunar-globe-renderer`, D-011): no cambia contrato ni mock; añade el pendiente de integrar el globo por iframe.
- Se definió el globo lunar como proyecto aparte (D-011) con integración prevista por iframe; ver `iniciativas/lunar-globe-renderer/HANDOFF.md`. La consola aún no lo consume.
- Se revisó `2bfb8a7` (respuestas a `P-001`..`P-005`, `docs/06` y `docs/07` corregidos); no cambia el código salvo un comentario de `errors.ts`. `.handoff-last-sync` pasó a `e541785` y luego a `2a577df`.
- Se creó el repo `luna-landing-navigator-console` con el scaffold de la fase 1 (`c1c64fd`) y se subió a `main`.
- Se generaron los tipos desde `contracts/openapi.json` y se implementaron cliente API, store, shell 30/70, sidebar, terreno 3D, luces Sol/Tierra y scrubber.
- Se verificó contra `mock/server.js` y se añadió `scripts/sync-handoff.sh` para revisar el handoff antes de implementar.
- Se subieron `P-001` a `P-005` a `PREGUNTAS.md` (`9a7c39d`).
- Se documentó el componente en `_compartido/frontend-console.md` y se creó esta iniciativa.
