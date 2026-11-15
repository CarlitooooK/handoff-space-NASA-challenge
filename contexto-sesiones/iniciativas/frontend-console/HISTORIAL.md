# Consola Frontend — Historial

Cronología, de lo más nuevo a lo más viejo. Fechas absolutas. No se borra: se agrega.

## 2026-11-15
- **Spec de onboarding implementada completa** (consola PR `#16`, rama `feat/onboarding-bloque-a`, Diego): una tarea por commit, A1–D4 de `docs/specs/onboarding-ayudas-sugerencias/tasks.md`.
  - Bloque A: buscador de sitios (combobox ARIA) y scrubber con teclado; `countdown()` deja de contradecir los datos; aviso "Out of date" y no se guarda una corrida desactualizada; hora de alunizaje en 24 h; fecha por defecto 2026-12-13; pantalla completa con Simple/Detailed y origen de datos; History sin duplicados y con los paneles.
  - Bloque B: catálogo único de ayudas (`features/help/glossary.ts`) con una prueba contra umbrales inventados; "?" en Setup, Results, timeline, barra superior y Compare; porqué del veredicto con `site.checks`.
  - Bloque C: `nextStep()` (pura) y bloque "Next step" en Simulate, Compare ("Compare dates" con +0/+7/+14 días, "Least bad"), History y Missions (veredicto y aviso si el registro y la simulación no coinciden).
  - Bloque D: botón Help con glosario y atajos (tecla `?`); `useOnboardingStore` (`lunar-navigator.onboarding`); tour de 7 pasos en un `<dialog>` con un contorno que respira y viaja entre pasos. `?tour=0` lo suprime y `?tour=1` lo fuerza.
  - Integra `main` hasta `#14` con un merge (conflicto solo en `docs/06`). Verificado con capturas contra Producción, con globo, sin globo y sin backend. **No verificado:** `prefers-reduced-motion` y fluidez en GPU real.
  - Desvío detectado: la ayuda `terrain-detail` iba a mostrar `grid.source`; lo resolvió la leyenda de "Terrain detail" de `#13`.
  - Las respuestas de `P-011` (textos de `psr` y `power`) **no** se aplicaron en `#16`: van en un PR aparte. `countdown()` ya coincide con `P-012`.

## 2026-11-15
- Backend respondió `P-011` (textos de ayuda de PSR y `power_factor`, con propuesta en inglés y cita de PGDA) y `P-012` (semántica de `hours_to_next_*`; para Compare usar `include_timeline: true`). Ver `PREGUNTAS.md` y `contracts/` §2.4.

## 2026-11-15
- **`P-010` respondida (D-019):** la consola manda `SET_CONFIG { terrainTilesUrl: "<VITE_API_BASE_URL>/terrain/tiles" }` al globo en cada `READY` (`useGlobeBridge.ts`). `#14` fusionado (`ff3455c`) con el nombre `SET_TERRAIN_SOURCE`; `#15` lo cambia al nombre ya escrito en `P-010`. PSR del polo con `simplify_m=250`.
- **Respuestas de Backend a `P-011` y `P-012` (2026-11-15), a aplicar en la spec de onboarding de Diego:**
  - `power_factor`: fracción de la potencia máxima de un panel **vertical que gira siguiendo al Sol** (`cos(elevación) × parte del disco solar sobre la cresta`); vale 0 con el Sol oculto y salta a ~0,5 al salir; `avg_power_factor` promedia todos los pasos con los ceros. El pico puede superar `1361·eficiencia·área` porque usa la distancia real Sol–Luna (perihelio el 3 de enero). "71 % of panel output" es respecto a ese panel con el Sol de frente a la distancia de ese momento. Texto propuesto: *"Share of the maximum output of a vertical, Sun-tracking solar panel at the time selected on the timeline. It drops as the Sun climbs and while part of the solar disk is behind the terrain; 0% when the Sun is hidden."*
  - PSR: el catálogo son las 1.531 regiones de más de 1 km² al sur de −80° (NASA PGDA, citar Barker et al. 2023); `nearest_psr_km` es la distancia al **borde**; fuera del polo (Apollo, Chandrayaan-3) no tiene sentido y conviene no mostrar la ayuda. "never sees the Sun" se refiere a la luz solar **directa**.
  - `hours_to_next_*` en `null` **no** significa "empieza oculto": cuenta desde `start_utc` hasta la primera transición de visible a oculto; `null` si no hay ninguna en la ventana (visible siempre, nunca sale, o sale y no se pone). Texto neutro sugerido: *"No sunset in the next 14 days"* en lugar de *"stays in view"*. Para saber si empieza oculto, `timeline[0]`; en Compare, `include_timeline: true` (hoy la consola manda `false`; lo decide Frontend). Backend propone una v1.4 con `sun_visible_at_start`, `earth_visible_at_start`, `hours_to_next_sunrise` y `hours_to_next_earthrise`.
  - Definiciones completas en `contracts/lunar-landing-api-contract.md` §2.4 y `docs/12` §4.2 y §4.4.
- Con el backend oficial `#9` (abierto), las teselas fuera del polo pasarían de ~474 a ~118 m/px: "Terrain detail" fuera del polo mejoraría sin cambios del front.
- Consola `#13` fusionado (`c623dff`, carril del globo): "Terrain detail" rediseñado a petición de Carlo (se veía como una silueta naranja plana sobre negro).
  - Relieve con sombras proyectadas por el Sol real del paso del scrubber (Sol y Tierra del `timeline`); con el Sol oculto, luz de la Tierra y aviso "ground brightened so the relief is visible".
  - Color por `slopes_deg` del backend, con la escala de ESE parche en la leyenda (sin umbrales inventados), la fuente (`LOLA polar` / `LOLA global`, o "Synthetic (not real terrain)") y la resolución nativa.
  - Sol y Tierra a tamaño angular real, estrellas, borde difuminado, marcador del sitio, cámara que no baja del suelo.
  - "Vertical ×1/×2/×4" (por defecto ×2, siempre rotulado). Normales suavizadas cuando el dato nativo es mucho más grueso que la celda, sin tocar la geometría.
  - El parche se pide a 256 × 256 (~790 KB en el polo, 0,3 s). 53 pruebas, `tsc` y `oxlint` limpios.
  - Limitación: fuera del polo el dato es global (474 m nativos) y el relieve queda plano; mejora con `P-010` y lo que decida `P-013`.
- Aterrizaje: corregida en el globo la cámara que subía a 1 km al posarse (ver `lunar-globe-renderer/HISTORIAL.md`). Desplegar el globo `163cccc` o posterior junto con la consola.
- Fusionados consola `#11` (`81db1e6`: cierre de la escena al cambiar de sitio o entrar a History, pausa del globo bajo "Terrain detail", interruptor "Astronaut", créditos en inglés) y `#12` (`c21456b`: Woodpecker, D-018) y handoff `#9` (`P-013`). Sin PRs abiertos en los tres repos. El CI no se puede ver todavía desde GitHub: hay que mirar el primer pipeline en Woodpecker.
- Se probó "Horizon view" contra Producción (IM-2 Mons Mouton, 2026-12-17): coincide con los datos, pero no muestra relieve cercano. Decisión de Frontend: "Horizon view" es la vista objetivo y "Terrain detail" no se toca por ahora; se preguntó `P-013` (¿dos vistas o una?). En la consola empezó el bloque A de la spec de onboarding (rama `feat/onboarding-bloque-a`).
- Consola PR `#10` fusionado, `52ab449` (carril del globo): `/ephemeris` y `/psr` para la vista global, `Promise.allSettled` en `evaluate()`, parche y PSR reusados si solo cambia la fecha, no repetir el vuelo en el mismo sitio, pines A–E y marcador del pin libre. `rankBy` pasó al store. Cierra cuatro filas de `docs/06` de la consola. El onboarding lo toma Diego.
- Fusionados consola `#7`, `#8` y `#9` y handoff `#7` y `#8`. Conflicto `#7` × `#9` en `TopBar.tsx` resuelto con el lado de `#7`; se quitó `isSampleData` y `SET_DATA_MODE`. `main` de la consola: `tsc` limpio, 32 pruebas, `oxlint` 0.
- `VITE_API_BASE_URL` local ya apunta al Backend oficial (`cream-interesting…/api/v1`); no hay otro backend vivo. Un redeploy del backend no cambia la URL (docs/07). El front aún no tiene CI/CD.
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
