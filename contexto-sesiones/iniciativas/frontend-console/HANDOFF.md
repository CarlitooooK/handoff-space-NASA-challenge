# Consola Frontend — Handoff

**Última actualización:** 2026-11-15 (consola `#7` a `#16` fusionados; `main` = `9344d13`) · **Responsable:** Equipo Frontend (consola) · **Repo / componente:** `luna-landing-navigator-console`

## En una línea
La spec de onboarding está implementada completa (A1–D4) en el PR `#16` de la consola (fusionado el 2026-11-15): tour de 7 pasos, ayudas "?", "Next step" en los cuatro workspaces, botón Help y las correcciones de base del audit. Ya integra `main` hasta `#14`.

## Estado actual
| Pieza | Estado |
| --- | --- |
| Scaffold, cliente API con errores por `error.code`, tipos generados | Hecho. Tipos con el contrato **v1.3** (`#7`) |
| Cascarón, rail, top bar, pantalla completa con paneles plegados | Hecho (`#2`) |
| Simulate, timeline y horizonte 360°, Compare, History, Missions | Hecho (`#2`) |
| Puente con el globo y globo como render único (D-015) | Hecho (`#4`, `#6`) |
| Cielo y PSR del polo antes de evaluar (`/ephemeris`, `/psr`), `evaluate()` tolerante a fallos del terreno, sin refetch si solo cambia la fecha, pines A–E de Compare y marcador del pin libre | Hecho (`#10`). Requiere el globo `a891c85` o posterior |
| Cierre de la escena al cambiar de sitio o entrar a History, pausa del globo bajo "Terrain detail" (`SET_PAUSED`), interruptor "Astronaut", créditos en inglés | Hecho (`#11`, `81db1e6`). Requiere el globo `f24cbe9` o posterior |
| CI/CD: `.woodpecker/ci.yaml` (lint, typecheck, test, build) y `deploy.yaml` (publica al integrar a `main`, con smoke) | Fusionado (`#12`, Antonio, D-018). Falta ver el primer pipeline y fijar `VITE_API_BASE_URL` / `VITE_GLOBE_URL` en el servidor |
| Fuente de teselas para el globo (`SET_CONFIG { terrainTilesUrl }`, D-019): relieve LOLA real y polo sur sombreado; PSR del polo más finas | `#14` y `#15` (renombre al nombre de `P-010`) fusionados. Requiere el globo `c8d8f37` o posterior |
| **Onboarding completo** (spec A1–D4): buscador y scrubber con teclado, cuentas atrás coherentes, aviso "Out of date", hora en 24 h, fecha por defecto 2026-12-13; ayudas "?" con un catálogo único; porqué del veredicto con `site.checks`; "Next step" por estado; Help con glosario y atajos (`?`); tour de 7 pasos con simulación real (Apollo 11, 2026-12-13) | Fusionado (`#16`, Diego, `9344d13`). 166 pruebas, `tsc` limpio, CI de Woodpecker verde; Kiro lo probó mezclado con `#15` contra el Backend oficial |
| Textos de ayuda `psr` y `power` (respuesta de Backend a `P-011`) | Por aplicar en un PR aparte, después de `#16`. Anotado en `docs/06` de la consola |
| `hours_to_next_* = null` (respuesta de Backend a `P-012`) | `countdown()` de `#16` ya sigue esa semántica. Compare sigue diciendo "Rises later" sin la hora: Producción ya sirve v1.4 (`*_visible_at_start`, `hours_to_next_*rise`, handoff `#11` en revisión), falta sincronizar el contrato en la consola y usarlos |
| Vista de horizonte (Lander POV) en la consola: pastilla "Horizon view", `SET_HORIZON`, `SET_SKY_STATE` | Hecho (`#9`); convive con "Terrain detail" |
| Documentación interna (`docs/01` a `06` de la consola) | Hecho (`#6`) |
| **Baja del mock:** la consola se desarrolla y prueba contra el Backend oficial de `docs/07`; se quitan `npm run mock` y el rótulo "Sample data" | Hecho (`#7`); el código muerto (`isSampleData`, `SET_DATA_MODE`) se quitó en `#9` |
| **Audit UX y spec de onboarding** (`docs/specs/onboarding-ayudas-sugerencias/` de la consola) | Spec fusionada (`#8`); implementada en `#16` |
| "Terrain detail" rediseñado: relieve con sombras del Sol del scrubber (luz de la Tierra si el Sol está oculto), color por `slopes_deg` con leyenda de la escala del parche, Sol y Tierra a tamaño angular real, marcador del sitio, "Vertical ×1/×2/×4" (por defecto ×2, rotulado), parche de 256 × 256 | Hecho (`#13`, `c623dff`). Con dato global (474 m nativos) el relieve sigue plano fuera del polo |
| "Terrain detail" a ras de suelo con la cámara del globo | Decidido por el usuario; anotado en `docs/06` de la consola, sin spec. Depende del globo y de `P-010` |
| Globo desplegado y `VITE_GLOBE_URL` de producción | Pipeline fusionado (globo `#1`); sin confirmar el primer despliegue |
| Video demo y AI Tool Disclosure | No iniciado |

## Pendientes (en orden de valor)
1. (Hecho) Consola `#15` y `#16` fusionadas. Falta probar el tour en GPU real y con `prefers-reduced-motion`; y corregir el texto de ayuda `site` ("Sun stays within about 2° of the horizon": en IM-2 −84,79° se midieron 4,75°; decir "a few degrees").
2. Aplicar las respuestas de `P-011` en el glosario (`power` y `psr`, y ocultar la ayuda `psr` fuera del polo) en un PR aparte.
3. Cuando se fusione el handoff `#11` (contrato v1.4/v1.5): `npm run sync:handoff` en la consola, regenerar tipos y usar `*_visible_at_start` y `hours_to_next_*rise` en `countdownFromSummary()`, para que Compare y History digan cuándo sale un astro que empieza oculto sin pedir `include_timeline`.
4. Especificar "Terrain detail" a ras de suelo con el equipo del globo. Depende de `P-010` y de `P-013` (¿dos vistas o una?; Frontend decidió que "Horizon view" es la vista objetivo).
5. Lo que sigue abierto en `docs/06` de la consola, sección "Después de la spec de onboarding" (hallazgos del audit que la spec no cubre) y probar en GPU real.
6. Desplegar el globo y la consola: los pipelines ya existen; al integrar a `main` se publican. `VITE_API_BASE_URL` y `VITE_GLOBE_URL` los fija la configuración del servidor (D-018), no `.env.local`: verificar con Antonio. Hay que desplegar juntos la consola y un globo `f24cbe9` o posterior. Video demo con AI Tool Disclosure y asignar carriles entre las dos personas.

## Cómo retomar
1. Lee `_compartido/frontend-console.md` y, en el repo de la consola, `docs/README.md` y `docs/05-pantallas.md` (tour, "?", Next step y Help).
2. Sigue el `CLAUDE.md` de la consola: `npm run sync:handoff` antes de implementar, y el Backend oficial en `.env.local` (URL en `docs/07`).
3. Revisa `../../../PREGUNTAS.md` y `../../../contracts/`: pueden haber cambiado.

## Notas
- La consola ya no usa `mock/`, pero el mock sigue en este repo para quien lo necesite.
- La escena de alunizaje propia en Three.js quedó descartada por D-015.
