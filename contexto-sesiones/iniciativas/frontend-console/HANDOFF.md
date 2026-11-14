# Consola Frontend — Handoff

**Última actualización:** 2026-11-14 · **Responsable:** Equipo Frontend (consola) · **Repo / componente:** `luna-landing-navigator-console`

## En una línea
Fase 1 de pantallas lista en PR (render de fondo con paneles glass, `docs/ideas/console-ui-figma.md`), probada contra el mock y contra el backend en vivo; falta conectar el globo por `postMessage` y la capa PSR.

## Estado actual
| Pieza | Estado |
| --- | --- |
| Scaffold (React/TS/Vite, Tailwind, R3F, Zustand, Vitest) | Hecho |
| Tipos desde `contracts/openapi.json` v1.1 + cliente API con errores por `error.code` (incluye `ERR_NOT_FOUND`) | Hecho (consola `#3`, pendiente de fusionar) |
| Cascarón: render de fondo, paneles glass, rail, top bar, pantalla completa con paneles plegados | Hecho (consola `#2`, pendiente de fusionar) |
| Simulate en niveles Simple y Detailed, timeline con pistas Gantt y horizonte 360° | Hecho (`#2`) |
| Comparador (`POST /compare`, 2 a 5 escenarios) | Hecho (`#2`) |
| Historial propio en `localStorage` y recrear misiones reales con fuentes citadas | Hecho (`#2`) |
| Fondo según D-013: globo sin sitio evaluado, escena local al evaluar | Hecho (`#2`; el iframe se monta solo con `VITE_GLOBE_URL`) |
| Prueba contra backend en vivo | Hecho (`#3`: 13 sitios, `ErrorResponse`) |
| Puente con el globo (`postMessage`, D-011) | No iniciado |
| Capa PSR (`GET /psr/nearby`) y modos de cámara en la escena local | No iniciado |
| Optimización "solo fecha → solo `/evaluate`" | No iniciado |
| Video demo y AI Tool Disclosure | No iniciado |

## Pendientes (en orden de valor)
1. Revisar y fusionar consola `#2` y luego `#3` (va apilado sobre `#2`).
2. Puente con el globo: `SET_SITES`, `SELECT_SITE`, `SET_SUN_LOCAL`, `SET_EARTH_LOCAL`, `SET_PSR` y eventos de entrada, con timeout de `READY` (`docs/11` §3 y §9). Fase 3 opcional con un interruptor (`SET_VEHICLES`, rotulado de §6b).
3. Capa PSR y modos de cámara en la escena local.
4. Respuesta a `P-009` (coordenadas de IM-2): hasta entonces Missions usa las de LROC.
5. Asignar carriles entre las dos personas (ver Notas).

## Cómo retomar
1. Lee `_compartido/frontend-console.md` y `CONOCIMIENTO.md`.
2. Clona `luna-landing-navigator-console` y sigue su `CLAUDE.md`: `npm run sync:handoff` antes de implementar.
3. Antes de seguir, revisa `../../../PREGUNTAS.md` y `../../../contracts/`: pueden haber cambiado.

## Notas
- El layout de render a pantalla completa sustituye al shell 30/70 de `docs/ideas/frontend-architecture-guide.md`; ambos son ideas no vinculantes.
- Carriles en el `CLAUDE.md` de la consola; **la asignación entre personas está sin definir**.
