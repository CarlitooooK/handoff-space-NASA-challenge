# Consola Frontend — Historial

Cronología, de lo más nuevo a lo más viejo. Fechas absolutas. No se borra: se agrega.

## 2026-11-14
- Consola PR `#6`: el globo pasa a ser el render único de la simulación (D-015, `docs/11` §1, §2 y §10 ajustados). El iframe ya no se desmonta al evaluar; la escena de alunizaje corre en el globo y la escena local queda como "Terrain detail". Motivo: el cambio de motor al evaluar se veía como un corte y la escena local era de mucha menor calidad.
- Se revisó el handoff hasta `cb5d0e8` y la consola sincronizó el contrato v1.2 (`f62f81d`, D-014). Sigue sin usar `checks`, `grid.source`, `/psr` ni `/ephemeris`.
- Se documentó el funcionamiento interno de la consola en su `docs/` (`2db0cae`); `_compartido/frontend-console.md` ahora lo cita en lugar de describirlo.
- Verificado con el backend oficial: `/terrain/patch` usa `lola_polar` (40 m nativos) al sur de -80° y `lola_global` (473,8 m) en el resto; el parche de 12 km a 128 queda a ~94 m por vértice.
- `P-009` respondida: IM-2 pasa al sitio de LROC (D-014), visible cuando se aplique en la base del servidor. Contrato v1.2 (`docs/12`): `site.checks` (veredicto con `message` en inglés) e `include_timeline` en `/compare`, ya en la URL del Backend oficial de `docs/07`.
- `HANDOFF.md` actualizado a pedido de Carlo: consola `#2`, `#3` y `#4` fusionadas; el puente deja de ser pendiente; pendientes reordenados (despliegue del globo, capa PSR, opcionales del globo, `P-009`).
- El puente con el globo quedó fusionado en la consola (PR #4, `a000db2`): `globeProtocol.ts`, `globeBridge.ts`, `useGlobeBridge.ts`, `useGlobeStore` y los botones de escena. Ya no hay que construirlo; guía en `docs/11` §10. El `HANDOFF.md` de esta iniciativa aún lista el puente como pendiente: lo actualiza su responsable.
- Se revisó el handoff hasta `7988348` (contrato v1.1, D-010, D-012, D-013, fases 2 y 3 del globo): la consola copia el contrato, reconoce `ERR_NOT_FOUND` y detecta el mock por `/health` (consola `#3`). D-012 no la afecta: no usa coordenadas polares.
- Se implementó la fase 1 de pantallas con el render de fondo y paneles glass (consola `#2`), probada contra el mock y el backend en vivo.
- Se preguntó `P-009` (coordenadas de IM-2 en `/sites`).
- Se propuso un diseño de consola en Figma con el render como fondo y paneles glass flotantes, alternativo al shell 30/70; ver `docs/ideas/console-ui-figma.md`. Sin acordar: no cambia el código ni las decisiones.
- Se revisó `969c4c4`/`2a577df` (iniciativa `lunar-globe-renderer`, D-011): no cambia contrato ni mock; añade el pendiente de integrar el globo por iframe.
- Se definió el globo lunar como proyecto aparte (D-011) con integración prevista por iframe; ver `iniciativas/lunar-globe-renderer/HANDOFF.md`. La consola aún no lo consume.
- Se revisó `2bfb8a7` (respuestas a `P-001`..`P-005`, `docs/06` y `docs/07` corregidos); no cambia el código salvo un comentario de `errors.ts`. `.handoff-last-sync` pasó a `e541785` y luego a `2a577df`.
- Se creó el repo `luna-landing-navigator-console` con el scaffold de la fase 1 (`c1c64fd`) y se subió a `main`.
- Se generaron los tipos desde `contracts/openapi.json` y se implementaron cliente API, store, shell 30/70, sidebar, terreno 3D, luces Sol/Tierra y scrubber.
- Se verificó contra `mock/server.js` y se añadió `scripts/sync-handoff.sh` para revisar el handoff antes de implementar.
- Se subieron `P-001` a `P-005` a `PREGUNTAS.md` (`9a7c39d`).
- Se documentó el componente en `_compartido/frontend-console.md` y se creó esta iniciativa.
