# Handoff API → Frontend — Handoff

**Última actualización:** 2026-11-14 · **Responsable:** Equipo Backend / Integración · **Repo / componente:** `FRONTEND_API_GUIDE.md`, `contracts/`, `docs/`, `PREGUNTAS.md`

## En una línea
La guía de consumo (`FRONTEND_API_GUIDE.md`), el esquema `contracts/openapi.json`, las dudas `P-001`–`P-005` en `PREGUNTAS.md` y el contrato en `docs/` quedaron resueltos y alineados con el backend en vivo; el equipo de Frontend está desbloqueado para avanzar contra el servidor en vivo o `mock/server.js`.

## Estado actual
| Pieza | Estado |
| --- | --- |
| Backend API v1 en vivo (`desktop` + Túnel HTTPS) | Hecho (verificado `200 OK` en `/health` y cobertura global `-90..90` el `2026-11-14`) |
| `FRONTEND_API_GUIDE.md` + `contracts/openapi.json` | Hecho |
| Alineación de contratos y docs (`06`, `07`, `09`, `10`) + respuestas `P-001..P-005` | Hecho |
| Servidor offline en `mock/` (`mock/server.js`) | Hecho (mantenido en `lunar-landing-navigator`; ver nota CommonJS en `mock/README.md`) |
| Aplicación Frontend (Visor 2D/3D & Dashboard) | En curso (desbloqueado en repo Frontend) |

## Pendientes (en orden de valor)
1. En el proyecto Frontend: generar tipos con `npx openapi-typescript` (`P-005`), usar `http://localhost:3000/api/v1` al apuntar al mock (`P-002`) y mantener soporte dual de errores `{ detail }` / `{ error.code }` (`P-001`).
2. Si el Frontend prueba sitios Apollo contra `mock/server.js` offline, ampliar `validatePolarCoordinates` en `mock/server.js` de `[-90, -80]` a `[-90, 90]` (`P-003`).
3. Decidir si se migra o reemplaza el scaffolding `AxelT456/lunar_landing_site_navigator_api` (`64cdae2`) con el motor real LOLA/SPICE/PostGIS que ya corre en `desktop`.

## Cómo retomar
1. Lee [`../../_compartido/backend-api.md`](../../_compartido/backend-api.md) y [`CONOCIMIENTO.md`](CONOCIMIENTO.md).
2. Revisa [`../../../FRONTEND_API_GUIDE.md`](../../../FRONTEND_API_GUIDE.md) para el cliente `apiFetch` y snippets Three.js, y [`../../../docs/07-ambientes-y-pruebas.md`](../../../docs/07-ambientes-y-pruebas.md) para URLs activas.
3. Antes de seguir, revisa [`../../../PREGUNTAS.md`](../../../PREGUNTAS.md) y [`../../../contracts/`](../../../contracts/README.md): pueden haber cambiado.

## Notas
- Todas las URLs activas viven únicamente en `docs/07-ambientes-y-pruebas.md` (ver `COMO-USAR-ESTE-REPO.md`).
