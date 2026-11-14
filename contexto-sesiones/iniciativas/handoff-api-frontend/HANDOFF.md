# Handoff API → Frontend — Handoff

**Última actualización:** 2026-11-14 · **Responsable:** Equipo Backend / Integración · **Repo / componente:** `FRONTEND_API_GUIDE.md`, `contracts/`, `docs/`

## En una línea
La guía de consumo API (`FRONTEND_API_GUIDE.md`), el esquema `contracts/openapi.json` y el contrato `contracts/lunar-landing-api-contract.md` quedaron integrados y alineados con el backend activo; falta construir la aplicación Frontend y definir la estrategia offline en `mock/`.

## Estado actual
| Pieza | Estado |
| --- | --- |
| Backend API v1 (`desktop` + Cloudflare HTTPS) | Hecho (verificado `200 OK` en `/api/v1/health` el `2026-11-14`) |
| `FRONTEND_API_GUIDE.md` + `contracts/openapi.json` | Hecho |
| Alineación de `contracts/lunar-landing-api-contract.md` y `docs/` (`07`, `09`, `10`) | Hecho |
| Servidor offline en `mock/` (ej. Prism o fixtures JSON) | No iniciado |
| Aplicación Frontend (Visor 2D/3D + Dashboard) | En curso (por iniciar en su repo/app) |

## Pendientes (en orden de valor)
1. Generar tipos TypeScript en el proyecto Frontend usando `npx openapi-typescript contracts/openapi.json -o src/types/api.d.ts` (o apuntando al `/openapi.json` en vivo) y configurar `.env.local` con `VITE_API_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL`.
2. Completar `docs/02-arquitectura.md`, `docs/06-contrato-y-errores.md` y `docs/08-pendientes.md` si el equipo de Frontend introduce convenciones adicionales.
3. Agregar datos/mock de respaldo en `mock/` si se desea modo offline garantizado para la demo final.

## Cómo retomar
1. Lee [`../../_compartido/backend-api.md`](../../_compartido/backend-api.md) y [`CONOCIMIENTO.md`](CONOCIMIENTO.md).
2. Revisa [`../../../FRONTEND_API_GUIDE.md`](../../../FRONTEND_API_GUIDE.md) para copiar el cliente `apiFetch`, los tipos de los 6 endpoints y los snippets de `THREE.PlaneGeometry`.
3. Antes de seguir, revisa [`../../../PREGUNTAS.md`](../../../PREGUNTAS.md) y [`../../../contracts/`](../../../contracts/README.md): pueden haber cambiado.

## Notas
- Si la URL `https://chart-owned-alabama-choices.trycloudflare.com` dejara de responder por reinicio del túnel en `desktop`, consultar el nuevo subdominio o usar `http://100.66.139.125:8000/api/v1` vía Tailscale (ver `docs/07-ambientes-y-pruebas.md`).
- Verificación de contratos pendientes de actualizar automáticamente: `contracts/openapi.json` fue copiado de la exportación del `2026-11-13` y coincide en endpoints con el `/api/v1/health` verificado el `2026-11-14`.
