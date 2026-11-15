# Consola Frontend — Historial

Cronología, de lo más nuevo a lo más viejo. Fechas absolutas. No se borra: se agrega.

## 2026-11-14
- Audit UX de la consola y spec de onboarding, ayudas "?" y sugerencias (consola PR `#8`, `docs/specs/onboarding-ayudas-sugerencias/`).
  - **Audit:** 19/40 en las heurísticas de Nielsen. Lo más grave: con teclado no se puede elegir un sitio (P0), un NO-GO en Simple no dice por qué, Detailed muestra `reasons` en español aunque el servidor ya manda `checks`, y "Earth stays in view" aparece donde la Tierra nunca se ve o empieza oculta.
  - **Spec:** tour de 7 pasos con una simulación real (Apollo 11, 2026-12-13), catálogo de ayudas sin umbrales propios, una próxima acción por estado y 21 tareas.
  - **Decisiones internas:** D1–D13 en el `README.md` de la spec. La fecha por defecto pasa de 2026-12-01 a 2026-12-13, porque con la anterior 11 de los 13 sitios dan NO-GO en el Backend oficial. "Date" pasa a "Landing date".
- La consola deja de usar el mock (consola PR `#7`, `b49254c`): es sintético, el Sol nunca se pone y daba GO donde el backend real da NO-GO. Se desarrolla y prueba contra el Backend oficial de `docs/07`.
- Se revisó el handoff hasta `377f143` y la consola sincronizó el contrato v1.3 (consola PR `#7`, `a0cd5aa`, D-016). No usa `/terrain/tiles`: lo pediría el globo (`P-010`).
- Decisión del usuario: "Terrain detail" debe usar la vista a ras de suelo del globo, la de la escena de alunizaje sin el descenso, en vez de la escena local Three.js. Anotado en `docs/06` de la consola; sin spec. Aviso en el historial de `lunar-globe-renderer`.
- Se preguntaron `P-011` (textos científicos de las ayudas) y `P-012` (`hours_to_next_*` en `null`).
- Consola PR `#6` fusionado (`1f7ca6c`).
- Corrección de contexto (D-017): Producción en `docs/07` pasa a ser el backend oficial (v1.3) y la URL del backend de prueba se apagó. Se ajustó la línea correspondiente de `_compartido/frontend-console.md`. La consola debe apuntar `VITE_API_BASE_URL` a Producción.
- Aviso de despliegue-ci-cd (D-018): la consola y el globo se publicarán desde el Woodpecker de `desktop`, con un solo ambiente (cada merge a `main` que pase el CI se publica). No hay cambios de código, solo la carpeta `.woodpecker/`. Los pasos de Carlo para conectar los repos están en `docs/07`, sección "Despliegues (CI/CD)".
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
