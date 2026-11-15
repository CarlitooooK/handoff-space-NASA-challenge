# Backend API REST v1 — conocimiento base

API REST de FastAPI en `desktop` que sirve topografía LOLA multi-resolución, polígonos PSR de PostGIS, horizonte topográfico 360° y efemérides SPICE de Sol y Tierra para el Frontend 2D/3D. Documento transversal: lo que no cambia entre sesiones.

Verificado el `2026-11-14` consultando en vivo `/api/v1/health`, `200 OK` en Apollo 11 `/terrain/patch` (`lat=0.674, lon=23.473`), errores unificados `{ error: { code, message, details } }` (`400`/`404`/`422`), `14/14` tests unitarios del motor en `spaceapps-api`, y regenerando `contracts/openapi.json`.

## Dónde vive
- **Servidor en vivo (`desktop`):** Producción corre en el contenedor `spaceapps-api-prod` (alias de red `spaceapps-api-staging`, al que apunta el túnel), publicado por `spaceapps-official-cloudflared`, con la base `spaceapps-postgres`. El stack de CI/CD son `spaceapps-woodpecker-server` y `spaceapps-woodpecker-agent`. URL vigente en [`docs/07-ambientes-y-pruebas.md`](../../docs/07-ambientes-y-pruebas.md).
- **Backend oficial `AxelT456/lunar_landing_site_navigator_api`:** desde `#6` (`c254c22`, 2026-11-14) contiene el código del backend de prueba (`app/engine`, `app/routers`, `app/db.py`) más lo de contrato v1.2 (D-014); antes era un esqueleto sintético. Woodpecker CI publica cada merge a `main` en Producción (D-017); la guía de despliegue está en `docs/DEPLOY.md` de ese repo.
- **Backend de prueba (`spaceapps-api`, imagen `backend-spaceapps-api`, túnel `spaceapps-cloudflared`):** apagado el 2026-11-14 (D-017): los contenedores están detenidos con `restart=no`, sin borrar.
- **Cómo probarlo:** ver comandos `curl` y `npx openapi-typescript` en [`docs/07-ambientes-y-pruebas.md`](../../docs/07-ambientes-y-pruebas.md).

## Arquitectura
- **Motor físico + DEMs LOLA + SPICE (contenedor de Producción):** Lee GeoTIFFs locales (`40 m/px` y `80 m/px` en Polo Sur `-90°..-80°`; `ldem_64.tif` `64 ppd` global `-90°..+90°`) y kernels SPICE (`de440s.bsp` / `de421.bsp`, `MOON_ME`).
- **Base espacial (`spaceapps-postgres` / PostGIS 3.4):** Almacena `13` sitios curados (`10` Polo Sur Artemis III/CLPS + `3` históricos Apollo) y `1,531` polígonos PSR, además de caché de horizontes y efemérides.
- **Exposición pública (`spaceapps-official-cloudflared`):** Cloudflare Quick Tunnel hacia `spaceapps-api-staging:8000` (alias de `spaceapps-api-prod`) con CORS abierto (`allow_origins=["*"]`).

## Cómo funciona
1. `GET /api/v1/health` — Verifica DB, PostGIS, motor físico, DEMs y kernels SPICE.
2. `GET /api/v1/sites` — Retorna los `13` sitios curados con coordenadas, `polar_x_m`/`polar_y_m`, altura, pendiente y distancia al PSR más cercano.
3. `GET /api/v1/terrain/patch` — Extrae grilla `N × N` (`64 | 128 | 256`) de `elevations_m` y `slopes_deg` en orden *row-major* + `nearby_psrs`.
4. `POST /api/v1/evaluate` — Traza horizonte 360°, evalúa trayectoria Sol/Tierra, devuelve `site.status` (`"GO" | "CAUTION" | "NO-GO"`), `summary`, `horizon_profile` y `timeline[]` con `sun_vector_3d` y `earth_vector_3d`.
5. `POST /api/v1/compare` — Evalúa de `2` a `5` escenarios lado a lado.
6. `GET /api/v1/psr/nearby` — Devuelve polígonos PSR `MultiPolygon` en metros estereográficos polares sur.
7. `GET /api/v1/psr` (v1.2) — Catálogo completo de PSRs paginado y simplificado, con un punto interior por polígono.
8. `GET /api/v1/ephemeris` (v1.2) — Sol y Tierra desde el centro de la Luna en `MOON_ME_DE421` con Skyfield sobre los kernels SPICE; sin kernels responde `503` (no usa el respaldo analítico de `/evaluate`).
9. `GET /api/v1/terrain/tiles/{z}/{row}/{col}.png` (v1.3; `z` 10 en v1.5) — Teselas Terrarium de 256×256 de toda la Luna para el globo: DEM LOLA polar donde hay datos y global en el resto, leídos sin costuras entre teselas. Detalle en `contracts/lunar-landing-api-contract.md` §2.9.
10. `GET /api/v1/terrain/tiles/heightmap/{z}/{row}/{col}.bin` (v1.5) — El mismo relieve como malla de 65×65 `float32` lista para Cesium. Detalle en `contracts/` §2.10.
11. `GET /api/v1/terrain/tiles/hillshade/{z}/{row}/{col}.png` (v1.5) — Relieve sombreado en gris listo para pintar. Detalle en `contracts/` §2.11.

En v1.2 `/evaluate` y `/compare` agregan `site.checks` y la caché de evaluaciones en PostGIS usa claves `v2|…` (las `v1|…` del backend de prueba no se mezclan). En v1.4 (D-020) `summary` agrega la visibilidad inicial y las salidas del Sol y la Tierra, y las claves pasan a `v3|…`.

## Dependencias y contratos
- Especificación funcional: `contracts/lunar-landing-api-contract.md`
- Esquema OpenAPI 3.1.0: `contracts/openapi.json`
- Guía de consumo, tipos TypeScript y snippets Three.js: `FRONTEND_API_GUIDE.md`
- Ambientes y variables recomendadas: `docs/07-ambientes-y-pruebas.md`

## Cosas que muerden
- **Formato de errores unificado (`P-001` resuelto):** Tanto el backend en vivo (FastAPI) como `mock/server.js` emiten `{ error: { code, message, details } }` (`ErrorResponse` en `contracts/openapi.json`; el backend conserva además `detail` por compatibilidad). Decidir el manejo de errores por `error.code` (ver [`docs/06-contrato-y-errores.md`](../../docs/06-contrato-y-errores.md)).
- **Subdominio efímero de Cloudflare Quick Tunnel:** Si `spaceapps-official-cloudflared` o `desktop` se reinician, cambia el subdominio `*.trycloudflare.com`. Siempre leer la URL base desde `.env`, nunca hardcodearla en componentes (ver [`docs/07-ambientes-y-pruebas.md`](../../docs/07-ambientes-y-pruebas.md)).
- **Respaldo de efemérides en `/evaluate`:** sin kernels SPICE, `/evaluate` consulta JPL Horizons y, si falla, un modelo analítico; `/ephemeris` no usa respaldos.
- **Parámetro `resolution` en `/terrain/patch`:** Solo acepta `64`, `128` o `256`; cualquier otro entero devuelve `422 Unprocessable Entity` (`ERR_INVALID_PAYLOAD`).
- **Alineación 3D en Three.js:** `grid.elevations_m` viene de Norte (`-Z`) a Sur (`+Z`) y Oeste (`-X`) a Este (`+X`). Requiere `geometry.rotateX(-Math.PI / 2)` en `THREE.PlaneGeometry` para coincidir 1:1 con `[+X Este, +Y Arriba, -Z Norte]` de `sun_vector_3d` y `earth_vector_3d`.
- **Eje Y en mapa 2D polar:** `+Y` en `polar_y_m` apunta hacia `0°` (hacia la Tierra). En `<svg>`/`<canvas>` debe invertirse (`screenY = cy - polar_y_m * scale`).
- **Mínimo/máximo y unicidad en `/compare`:** Requiere entre `2` y `5` escenarios (`ERR_SCENARIO_LIMIT_EXCEEDED`) y sin escenarios duplicados (`ERR_DUPLICATE_SCENARIOS`).

## Seguridad
- La API es pública de solo lectura/cálculo para datos abiertos NASA; no maneja tokens de usuario ni API keys privadas.
- No registrar credenciales de servidor, llaves SSH ni contraseñas de base de datos en este repositorio.
