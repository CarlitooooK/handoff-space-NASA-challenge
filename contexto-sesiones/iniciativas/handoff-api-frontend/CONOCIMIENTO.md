# Handoff API → Frontend — Conocimiento

Reglas, modelo y decisiones de la integración Backend → Frontend, separando lo verificado de lo supuesto.

## Alcance y principio
- El Frontend consume resultados científicos preprocesados vía REST (`JSON`), manteniendo en memoria `timeline[]` y `elevations_m` para garantizar fluidez interactiva a 60 FPS sin cargar GeoTIFFs ni calcular efemérides SPICE en el navegador (`docs/10-producto-y-necesidades.md`).

## Decisiones y su porqué
- Los acuerdos transversales quedan en `docs/09-decisiones.md` (`D-006` a `D-010`) y las respuestas formales en `PREGUNTAS.md` (`P-001` a `P-005`).
- **Publicar `FRONTEND_API_GUIDE.md` + `contracts/openapi.json` en el handoff (`2026-11-14`).** *Porqué:* Tanto desarrolladores como agentes de IA necesitan una referencia directa con tipos TypeScript, URLs vivas y snippets Three.js exactos, además del JSON OpenAPI 3.1.0 para generación automática de tipos. *Descartado:* Mantener la guía solo fuera del repo en el workspace local del autor.

## Hallazgos verificados
- El `2026-11-14` se verificó contra el backend en vivo (`spaceapps-api`):
  - `/api/v1/health`: `200 OK` (`status: "ok"`, `landing_sites_count: 13`, `psr_regions_count: 1531`, `engine.available: true`, DEMs `40MPP`/`80MPP`/`lola_global/ldem_64.tif`, kernels `de440s.bsp`/`de421.bsp`).
  - `/api/v1/terrain/patch?lat=0.674&lon=23.473&size_km=12&resolution=64` (Apollo 11): `200 OK` (confirma cobertura global `[-90, 90]`, `P-003`).
  - Errores `422` en `/terrain/patch` (`resolution=100`) y `/evaluate` (`lat=-95`): al principio devolvían `{ "detail": ... }`; tras la actualización del backend del 2026-11-14 devuelven `{ "error": { "code": "ERR_*" } }` (`ErrorResponse`, ver respuesta `P-001`).
- Inspección de `AxelT456/lunar_landing_site_navigator_api` (`64cdae2`, `2026-11-14`): implementa los 6 endpoints y esquemas Pydantic con buena estructura modular (`app/api`, `app/schemas`, `app/domain`, `app/core`), pero `app/infrastructure/` está vacío (`__init__.py` de 1 línea) y usa fórmulas sintéticas/hardcodeadas para `10` sitios en `[-90, -80]` sin `rasterio`, `skyfield` ni `psycopg`.
- `docs/10-producto-y-necesidades.md` y varios docs iniciales tenían enlaces con rutas absolutas locales; fueron corregidos a rutas relativas.

## Supuestos sin verificar
- Corregido el 2026-11-14: la suite `pytest` de `AxelT456/lunar_landing_site_navigator_api` se ejecutó en esta Mac (`56 passed` tras la corrección de la proyección polar, PR `#2` de ese repo).
- No se ejecutó en vivo desde navegador `POST /api/v1/compare` en esta sesión (la guía registra la validación del `2026-11-13`).

## Pendiente de decisión
- Decidido el 2026-11-14 (ver [`lunar-landing-navigator/HANDOFF.md`](../lunar-landing-navigator/HANDOFF.md)): el backend oficial reemplazará a `spaceapps-api` solo cuando pase el contract gate de su CI; mientras tanto `spaceapps-api` sigue sirviendo la API pública.
