# 7. Ambientes y pruebas

Ambientes activos del Backend y cómo verificar o consumir la API desde el Frontend. Ver la guía detallada con ejemplos TypeScript y Three.js en [`FRONTEND_API_GUIDE.md`](../FRONTEND_API_GUIDE.md).

## Ambientes

| Ambiente | URL Base API v1 | Documentación / Esquema | Notas |
| --- | --- | --- | --- |
| **Producción / Demo Pública (HTTPS Cloudflare Quick Tunnel)** | `https://chart-owned-alabama-choices.trycloudflare.com/api/v1` | [Swagger UI](https://chart-owned-alabama-choices.trycloudflare.com/docs) · [ReDoc](https://chart-owned-alabama-choices.trycloudflare.com/redoc) · [OpenAPI JSON](https://chart-owned-alabama-choices.trycloudflare.com/openapi.json) | Acceso abierto sin Tailscale; CORS `*` habilitado para `localhost` y producción. Si el contenedor `spaceapps-cloudflared` se reinicia, el subdominio `*.trycloudflare.com` cambia. |
| **Red Interna del Equipo (Tailscale)** | `http://100.66.139.125:8000/api/v1` | `http://100.66.139.125:8000/docs` | IP fija en el tailnet (`desktop`). Requiere tener Tailscale activo con acceso al nodo compartido. |
| **Local (Mock / Frontend)** | `http://localhost:5173` / `http://localhost:3000` | [`../contracts/openapi.json`](../contracts/openapi.json) | El Frontend local puede apuntar directo a la URL pública HTTPS o a un mock en `mock/`. |

## Variables de entorno
Nombres recomendados para el Frontend, **sin valores secretos** (no requiere API keys; la URL se parametriza para poder actualizarla si cambia el Quick Tunnel):

- `VITE_API_BASE_URL` (para proyectos Vite) — ejemplo: `https://chart-owned-alabama-choices.trycloudflare.com/api/v1`
- `NEXT_PUBLIC_API_BASE_URL` (para proyectos Next.js) — ejemplo: `https://chart-owned-alabama-choices.trycloudflare.com/api/v1`

## Datos de prueba
- El backend sirve `13` sitios curados (`10` Polo Sur Artemis III/CLPS en `40 m/px` + `3` históricos Apollo sobre `ldem_64.tif` global) y `1,531` polígonos PSR en PostGIS.
- Coordenadas de prueba rápida (Shackleton Rim): `lat=-89.66`, `lon=222.7`, `start_utc="2026-12-01T00:00:00Z"`.

## Cómo probar la API

```sh
# 1. Verificar salud del backend, datasets LOLA/SPICE y PostGIS
curl -s https://chart-owned-alabama-choices.trycloudflare.com/api/v1/health

# 2. Listar los 13 sitios curados
curl -s https://chart-owned-alabama-choices.trycloudflare.com/api/v1/sites

# 3. Generar tipos TypeScript desde el contrato OpenAPI local o remoto
npx openapi-typescript contracts/openapi.json -o src/types/api.d.ts
```

Si la URL pública del túnel cambia tras un reinicio en `desktop`, se consulta en el servidor con:

```sh
docker logs spaceapps-cloudflared 2>&1 | grep trycloudflare
```
