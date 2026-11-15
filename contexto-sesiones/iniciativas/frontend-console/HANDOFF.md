# Consola Frontend — Handoff

**Última actualización:** 2026-11-14 (consola PR `#6` abierto) · **Responsable:** Equipo Frontend (consola) · **Repo / componente:** `luna-landing-navigator-console`

## En una línea
Fase 1 fusionada (`#2`, `#3`, `#4`). En revisión el PR `#6`: el globo pasa a ser el render único de la simulación (D-015), la consola consume el contrato v1.2 y su funcionamiento interno queda documentado en `docs/` del repo.

## Estado actual
| Pieza | Estado |
| --- | --- |
| Scaffold, cliente API con errores por `error.code`, tipos generados | Hecho. Tipos al día con el contrato **v1.2** en `#6` (`f62f81d`) |
| Cascarón con render de fondo y paneles glass, rail, top bar, pantalla completa con paneles plegados | Hecho (`#2`) |
| Simulate (Simple y Detailed), timeline con pistas y horizonte 360°, Compare, History (`localStorage`), Missions con fuentes | Hecho (`#2`) |
| Puente con el globo (`postMessage`): sitios, Sol y Tierra del scrubber, PSR, escena de alunizaje, falla suave a los 8 s | Hecho (`#4`) |
| **Globo como render único** (D-015): el iframe no se desmonta, el globo vuela al sitio al evaluar, la escena de alunizaje corre en él y "Terrain detail" funde encima la escena local | En revisión (`#6`, `5dd95b5`). Probado contra la API en vivo con IM-2 y Shackleton Rim |
| Documentación interna (`docs/01` a `06` del repo de la consola) | En revisión (`#6`, `2db0cae`) |
| Uso de las novedades v1.2 (`site.checks`, `grid.source`, `GET /psr`, `GET /ephemeris`) | No iniciado |
| Interruptor de `SET_VEHICLES`, indicador `LOADING`, parámetros de cámara de la escena | No iniciado (opcional) |
| Globo desplegado y `VITE_GLOBE_URL` de producción | No iniciado (no hay URL de despliegue) |
| Video demo y AI Tool Disclosure | No iniciado |

## Pendientes (en orden de valor)
1. Revisar y fusionar el PR `#6` de la consola y el PR de este repo con D-015.
2. Que el globo sea 100 % de nuestros datos: depende de `P-008` (teselas de relieve servidas por el backend). Nota para quien responda: el `/health` del backend en vivo ya lista `LDEM_80S_40MPP_ADJ.TIF` (40 m/px), más fino que el de 80 m que cita la pregunta. Hoy imagen y relieve del globo vienen de `trek.nasa.gov`, y el abanico polar se ve al volar a Shackleton.
3. Corregir la franja de créditos de la escena local: dice "Ephemeris: NASA/JPL Horizons", pero el backend usa kernels SPICE (`de421`, `de440s`). Propuesta en `docs/06` de la consola, sin confirmar.
4. Usar `site.checks[].message` (inglés) en vez de `reasons` (español) cuando la URL de la demo sirva v1.2.
5. Robustez del flujo (detalle en `docs/06` de la consola): que una falla de `/terrain/patch` o `/psr/nearby` no tumbe la evaluación; reusar parche y PSR si solo cambia la fecha; pasar a la escena local si el globo cae después de evaluar.
6. Desplegar el globo y probar el conjunto en una GPU real (las pruebas usaron render por software).
7. Opcionales del globo (`docs/11` §10) y video demo con AI Tool Disclosure.
8. Asignar carriles entre las dos personas.

## Cómo retomar
1. Lee `_compartido/frontend-console.md` y, en el repo de la consola, `docs/README.md`.
2. Sigue el `CLAUDE.md` de la consola: `npm run sync:handoff` antes de implementar.
3. Revisa `../../../PREGUNTAS.md` y `../../../contracts/`: pueden haber cambiado.

## Notas
- La escena de alunizaje en Three.js propia (rama local `feat/escena-alunizaje-local` de la consola, sin publicar) quedó descartada por D-015.
- El layout de render a pantalla completa sustituye al shell 30/70 de `docs/ideas/frontend-architecture-guide.md`; ambos son ideas no vinculantes.
