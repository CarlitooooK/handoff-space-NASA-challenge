# Backend API REST v1 (`spaceapps-api`) — conocimiento base

API REST de FastAPI en `desktop` que sirve topografía LOLA multi-resolución, polígonos PSR de PostGIS, horizonte topográfico 360° y efemérides SPICE de Sol y Tierra para el Frontend 2D/3D. Documento transversal: lo que no cambia entre sesiones.

Verificado el `2026-11-14` consultando `GET https://chart-owned-alabama-choices.trycloudflare.com/api/v1/health` y leyendo `contracts/openapi.json` y `FRONTEND_API_GUIDE.md`.

## Dónde vive
- **Servidor host:** `desktop` (Contenedores Docker `spaceapps-api`, `spaceapps-postgres`, `spaceapps-cloudflared`). El código fuente del backend no vive en este repositorio de handoff.
- **URL Pública HTTPS (sin Tailscale):** `https://chart-owned-alabama-choices.trycloudflare.com/api/v1`
  - **Swagger UI:** `https://chart-owned-alabama-choices.trycloudflare.com/docs`
  - **ReDoc:** `https://chart-owned-alabama-choices.trycloudflare.com/redoc`
  - **OpenAPI JSON:** `https://chart-owned-alabama-choices.trycloudflare.com/openapi.json`
- **URL Interna (Tailscale):** `http://100.66.139.125:8000/api/v1`
- **Cómo probarlo:**
  ```sh
  curl -s https://chart-owned-alabama-choices.trycloudflare.com/api/v1/health
  npx openapi-typescript contracts/openapi.json -o src/types/api.d.ts
  ```

## Arquitectura
- **Motor físico + DEMs LOLA + SPICE (`spaceapps-api`):** Lee GeoTIFFs locales (`40 m/px` y `80 m/px` en Polo Sur `-90°..-80°`; `ldem_64.tif` `64 ppd` global `-90°..+90°`) y kernels SPICE (`de440s.bsp` / `de421.bsp`, `MOON_ME`).
- **Base espacial (`spaceapps-postgres` / PostGIS 3.4):** Almacena `13` sitios curados (`10` Polo Sur Artemis III/CLPS + `3` históricos Apollo) y `1,531` polígonos PSR, además de caché de horizontes y efemérides.
- **Exposición pública (`spaceapps-cloudflared`):** Cloudflare Quick Tunnel hacia `spaceapps-api:8000` con CORS abierto (`allow_origins=["*"]`).

## Cómo funciona
1. `GET /api/v1/health` — Verifica DB, PostGIS, motor físico, DEMs y kernels SPICE.
2. `GET /api/v1/sites` — Retorna los `13` sitios curados con coordenadas, `polar_x_m`/`polar_y_m`, altura, pendiente y distancia al PSR más cercano.
3. `GET /api/v1/terrain/patch` — Extrae grilla `N × N` (`64 | 128 | 256`) de `elevations_m` y `slopes_deg` en orden *row-major* + `nearby_psrs`.
4. `POST /api/v1/evaluate` — Traza horizonte 360°, evalúa trayectoria Sol/Tierra, devuelve `site.status` (`"GO" | "CAUTION" | "NO-GO"`), `summary`, `horizon_profile` y `timeline[]` con `sun_vector_3d` y `earth_vector_3d`.
5. `POST /api/v1/compare` — Evalúa de `2` a `5` escenarios lado a lado.
6. `GET /api/v1/psr/nearby` — Devuelve polígonos PSR `MultiPolygon` en metros estereográficos polares sur.

## Dependencias y contratos
- Especificación funcional: `contracts/lunar-landing-api-contract.md`
- Esquema OpenAPI 3.1.0: `contracts/openapi.json`
- Guía de consumo, tipos TypeScript y snippets Three.js: `FRONTEND_API_GUIDE.md`
- Ambientes y variables recomendadas: `docs/07-ambientes-y-pruebas.md`

## Cosas que muerden
- **Subdominio efímero de Cloudflare Quick Tunnel:** Si `spaceapps-cloudflared` o `desktop` se reinician, cambia el subdominio `*.trycloudflare.com`. Siempre leer la URL base desde `.env` (`VITE_API_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL`), nunca hardcodearla en componentes. En `desktop`, el nuevo dominio se consulta con `docker logs spaceapps-cloudflared 2>&1 | grep trycloudflare`.
- **Parámetro `resolution` en `/terrain/patch`:** Solo acepta `64`, `128` o `256`; cualquier otro entero devuelve `422 Unprocessable Entity`.
- **Alineación 3D en Three.js:** `grid.elevations_m` viene de Norte (`-Z`) a Sur (`+Z`) y Oeste (`-X`) a Este (`+X`). Requiere `geometry.rotateX(-Math.PI / 2)` en `THREE.PlaneGeometry` para coincidir 1:1 con `[+X Este, +Y Arriba, -Z Norte]` de `sun_vector_3d` y `earth_vector_3d`.
- **Eje Y en mapa 2D polar:** `+Y` en `polar_y_m` apunta hacia `0°` (hacia la Tierra). En `<svg>`/`<canvas>` debe invertirse (`screenY = cy - polar_y_m * scale`).
- **Mínimo/máximo en `/compare`:** Requiere entre `2` y `5` escenarios (`422` si se envían menos de 2 o más de 5).

## Seguridad
- La API es pública de solo lectura/cálculo para datos abiertos NASA; no maneja tokens de usuario ni API keys privadas.
- No registrar credenciales de servidor, llaves SSH ni contraseñas de base de datos en este repositorio.
