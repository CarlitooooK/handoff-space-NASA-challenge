# 9. Decisiones

Las decisiones ya tomadas, para no volver a discutirlas.

| Tema | Qué se decidió | Dónde está escrita |
| --- | --- | --- |
| **Cálculo físico y topográfico en Backend** | El Backend (FastAPI + PostGIS + LOLA DEM + SPICE `de440s.bsp`/`MOON_ME`) entrega perfiles de horizonte `360°`, mallas 3D (`elevations_m`, `slopes_deg`) y vectores unitarios `sun_vector_3d` / `earth_vector_3d` listos para Three.js, sin parsear GeoTIFFs ni matrices SPICE en el navegador. (2026-11-13) | [`FRONTEND_API_GUIDE.md`](../FRONTEND_API_GUIDE.md), [`docs/10-producto-y-necesidades.md`](10-producto-y-necesidades.md) |
| **Exposición HTTPS pública + CORS abierto** | Exponer la API vía Cloudflare Quick Tunnel (`https://chart-owned-alabama-choices.trycloudflare.com/api/v1`) con respaldo fijo por Tailscale (`http://100.66.139.125:8000/api/v1`) y CORS `allow_origins=["*"]`; parametrizar la URL base en `.env` (`VITE_API_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL`) porque el subdominio Quick Tunnel es efímero si se reinicia el contenedor. (2026-11-14) | [`FRONTEND_API_GUIDE.md`](../FRONTEND_API_GUIDE.md), [`docs/07-ambientes-y-pruebas.md`](07-ambientes-y-pruebas.md) |
| **Cobertura global + alta resolución Polar Sur** | Aceptar `lat` en `-90.0..90.0` (Polo Sur `-90°..-80°` con LOLA `40 m/px` y resto de la Luna con `ldem_64.tif`) y ampliar el catálogo curado a `13` sitios (`10` Polo Sur + `3` Apollo) con semáforo `"GO" | "CAUTION" | "NO-GO"`. (2026-11-14) | [`contracts/lunar-landing-api-contract.md`](../contracts/lunar-landing-api-contract.md), [`contracts/openapi.json`](../contracts/openapi.json) |
| **Mismo sistema de coordenadas para terreno 3D y astros** | `terrain/patch` entrega `elevations_m` row-major de Norte (`-Z`) a Sur (`+Z`) y Oeste (`-X`) a Este (`+X`), alineado 1:1 con `THREE.PlaneGeometry` rotado `-Math.PI / 2` en X y con `[+X Este, +Y Arriba, -Z Norte]` de `sun_vector_3d` / `earth_vector_3d`. (2026-11-14) | [`FRONTEND_API_GUIDE.md`](../FRONTEND_API_GUIDE.md) |

## Versiones de los contratos copiados aquí

| Archivo | Fuente | Versión |
| --- | --- | --- |
| `contracts/lunar-landing-api-contract.md` | Especificación REST v1 del Backend (`spaceapps-api`) | `v1.0` (alineada el `2026-11-14` con `openapi.json` y el backend en vivo) |
| `contracts/openapi.json` | Exportado desde `https://chart-owned-alabama-choices.trycloudflare.com/openapi.json` (`spaceapps-api` en `desktop`) | OpenAPI `3.1.0` / API `1.0.0` (`2026-11-13`) |

Cuando cambie un contrato en su origen, se copia aquí y se actualiza esta tabla.
