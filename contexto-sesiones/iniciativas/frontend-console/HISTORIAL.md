# Consola Frontend — Historial

Cronología, de lo más nuevo a lo más viejo. Fechas absolutas. No se borra: se agrega.

## 2026-11-14
- Se definió el globo lunar como proyecto aparte (D-011) con integración prevista por iframe; ver `iniciativas/lunar-globe-renderer/HANDOFF.md`. La consola aún no lo consume.
- Se creó el repo `luna-landing-navigator-console` con el scaffold de la fase 1 (`c1c64fd`) y se subió a `main`.
- Se generaron los tipos desde `contracts/openapi.json` y se implementaron cliente API, store, shell 30/70, sidebar, terreno 3D, luces Sol/Tierra y scrubber.
- Se verificó contra `mock/server.js` y se añadió `scripts/sync-handoff.sh` para revisar el handoff antes de implementar.
- Se subieron `P-001` a `P-005` a `PREGUNTAS.md` (`9a7c39d`).
- Se documentó el componente en `_compartido/frontend-console.md` y se creó esta iniciativa.
