# Consola Frontend — Handoff

**Última actualización:** 2026-11-14 (consola `#7`, `#8`, `#9` fusionados; `#10` abierto) · **Responsable:** Equipo Frontend (consola) · **Repo / componente:** `luna-landing-navigator-console`

## En una línea
El PR `#6` ya está fusionado (D-015, contrato v1.2, `docs/` internas). Fusionados el 2026-11-14: `#7` (contrato v1.3 y baja del mock), `#8` (audit UX y spec de onboarding, lista para implementar) y `#9` (vista de horizonte, del globo).

## Estado actual
| Pieza | Estado |
| --- | --- |
| Scaffold, cliente API con errores por `error.code`, tipos generados | Hecho. Tipos con el contrato **v1.3** (`#7`) |
| Cascarón, rail, top bar, pantalla completa con paneles plegados | Hecho (`#2`) |
| Simulate, timeline y horizonte 360°, Compare, History, Missions | Hecho (`#2`) |
| Puente con el globo y globo como render único (D-015) | Hecho (`#4`, `#6`) |
| Cielo y PSR del polo antes de evaluar (`/ephemeris`, `/psr`), `evaluate()` tolerante a fallos del terreno, sin refetch si solo cambia la fecha, pines A–E de Compare y marcador del pin libre | En revisión (`#10`, del globo; requiere desplegar el globo `a891c85`) |
| Vista de horizonte (Lander POV) en la consola: pastilla "Horizon view", `SET_HORIZON`, `SET_SKY_STATE` | Hecho (`#9`); convive con "Terrain detail" |
| Documentación interna (`docs/01` a `06` de la consola) | Hecho (`#6`) |
| **Baja del mock:** la consola se desarrolla y prueba contra el Backend oficial de `docs/07`; se quitan `npm run mock` y el rótulo "Sample data" | Hecho (`#7`); el código muerto (`isSampleData`, `SET_DATA_MODE`) se quitó en `#9` |
| **Audit UX y spec de onboarding** (`docs/specs/onboarding-ayudas-sugerencias/` de la consola): tour de 7 pasos, ayudas "?", próxima acción por estado y correcciones base, en 21 tareas | Spec fusionada (`#8`). Sin código todavía |
| Uso de `site.checks` en la interfaz | Especificado (tarea B5 de la spec); no implementado |
| "Terrain detail" a ras de suelo con la cámara del globo | Decidido por el usuario; anotado en `docs/06` de la consola, sin spec. Depende del globo y de `P-010` |
| Globo desplegado y `VITE_GLOBE_URL` de producción | No iniciado |
| Video demo y AI Tool Disclosure | No iniciado |

## Pendientes (en orden de valor)
1. Revisar y fusionar la consola `#10`. El onboarding (punto 2) lo toma Diego.
2. Implementar la spec de onboarding en el orden de su `tasks.md`. Primero va el bloque A, que corrige un P0: hoy no se puede elegir un sitio con teclado.
3. Recibir respuesta a `P-011` (textos científicos de PSR y `power_factor`) y `P-012` (`hours_to_next_*` en `null` con el astro oculto al inicio). Ninguna bloquea.
4. Especificar "Terrain detail" a ras de suelo con el equipo del globo. Depende de `P-010`.
5. Lo que sigue abierto en `docs/06` de la consola:
   - robustez de `evaluate()`;
   - créditos "Ephemeris: NASA/JPL Horizons" (el backend usa SPICE);
   - probar en GPU real.
6. Desplegar el globo y la consola: no hay `.woodpecker/` todavía; `VITE_API_BASE_URL` y `VITE_GLOBE_URL` los fija la configuración del servidor (D-018), no `.env.local`. Video demo con AI Tool Disclosure y asignar carriles entre las dos personas.

## Cómo retomar
1. Lee `_compartido/frontend-console.md` y, en el repo de la consola, `docs/README.md` y `docs/specs/onboarding-ayudas-sugerencias/README.md`.
2. Sigue el `CLAUDE.md` de la consola: `npm run sync:handoff` antes de implementar, y el Backend oficial en `.env.local` (URL en `docs/07`).
3. Revisa `../../../PREGUNTAS.md` y `../../../contracts/`: pueden haber cambiado.

## Notas
- La consola ya no usa `mock/`, pero el mock sigue en este repo para quien lo necesite.
- La escena de alunizaje propia en Three.js quedó descartada por D-015.
