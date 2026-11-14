# Consola Frontend — Handoff

**Última actualización:** 2026-11-14 (tras el PR `#4`) · **Responsable:** Equipo Frontend (consola) · **Repo / componente:** `luna-landing-navigator-console`

## En una línea
Fase 1 fusionada en `main` (render de fondo con paneles glass, `docs/ideas/console-ui-figma.md`, contrato v1.1 y puente con el globo, consola `#2`, `#3` y `#4`), probada contra el mock y contra el backend en vivo; faltan la capa PSR y los modos de cámara en la escena local, y desplegar el globo.

## Estado actual
| Pieza | Estado |
| --- | --- |
| Scaffold (React/TS/Vite, Tailwind, R3F, Zustand, Vitest) | Hecho |
| Tipos desde `contracts/openapi.json` v1.1 + cliente API con errores por `error.code` (incluye `ERR_NOT_FOUND`) | Hecho (consola `#3`, fusionado) |
| Cascarón: render de fondo, paneles glass, rail, top bar, pantalla completa con paneles plegados | Hecho (consola `#2`, fusionado) |
| Simulate en niveles Simple y Detailed, timeline con pistas Gantt y horizonte 360° | Hecho (`#2`) |
| Comparador (`POST /compare`, 2 a 5 escenarios) | Hecho (`#2`) |
| Historial propio en `localStorage` y recrear misiones reales con fuentes citadas | Hecho (`#2`) |
| Fondo según D-013: globo sin sitio evaluado, escena local al evaluar | Hecho (`#2`; el iframe se monta solo con `VITE_GLOBE_URL`) |
| Prueba contra backend en vivo | Hecho (`#3`: 13 sitios, `ErrorResponse`) |
| Puente con el globo (`postMessage`, D-011): sitios, Sol y Tierra del scrubber, PSR, escena de alunizaje ("Landing scene" / "Exit scene"), falla suave a los 8 s | Hecho (consola `#4`, `a000db2`; 9 pruebas; probado de extremo a extremo con la API en vivo). Guía: `docs/11` §10 |
| Interruptor de `SET_VEHICLES`, indicador de carga con `LOADING` y HUD propio con `SCENE_PHASE`/`SCENE_TELEMETRY` | No iniciado (opcional) |
| Globo desplegado y `VITE_GLOBE_URL` de producción | No iniciado (no hay URL de despliegue) |
| Capa PSR (`GET /psr/nearby`) y modos de cámara en la escena local | No iniciado |
| Optimización "solo fecha → solo `/evaluate`" | No iniciado |
| Video demo y AI Tool Disclosure | No iniciado |

## Pendientes (en orden de valor)
1. Desplegar el globo (repo `luna-render-nasa-space-challenge`) y fijar `VITE_GLOBE_URL` de producción. Sin esa URL el globo solo funciona en local. Probar el conjunto en una GPU real: las pruebas usaron render por software.
2. Capa PSR (`GET /psr/nearby`) y modos de cámara en la escena local. En el globo los PSR ya se envían con `SET_PSR`.
3. Opcionales del globo, con la guía de `docs/11` §10: interruptor de `SET_VEHICLES` (rotulado de §6b), indicador de carga con `LOADING`, HUD propio con `SCENE_PHASE` y `SCENE_TELEMETRY` (siempre "illustrative"), y la escena desde Missions.
4. Respuesta a `P-009` (coordenadas de IM-2): hasta entonces Missions usa las de LROC. `P-007` y `P-008` son del globo y no bloquean.
5. Optimización "solo fecha → solo `/evaluate`".
6. Video demo y AI Tool Disclosure.
7. Asignar carriles entre las dos personas (ver Notas).

## Cómo retomar
1. Lee `_compartido/frontend-console.md` y `CONOCIMIENTO.md`.
2. Clona `luna-landing-navigator-console` y sigue su `CLAUDE.md`: `npm run sync:handoff` antes de implementar.
3. Antes de seguir, revisa `../../../PREGUNTAS.md` y `../../../contracts/`: pueden haber cambiado.

## Notas
- Este `HANDOFF.md` lo actualizó Carlo con su agente el 2026-11-14, con permiso expreso, tras fusionar el PR `#4` de la consola. Frontend lo revisa y lo ajusta si algo no coincide.
- El layout de render a pantalla completa sustituye al shell 30/70 de `docs/ideas/frontend-architecture-guide.md`; ambos son ideas no vinculantes.
- Carriles en el `CLAUDE.md` de la consola; **la asignación entre personas está sin definir**.
