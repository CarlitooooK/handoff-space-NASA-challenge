# 7. Ambientes y pruebas

Ambientes activos del Backend, servidor mock autónomo y cómo verificar o consumir la API desde el Frontend. Ver también la guía con ejemplos TypeScript y Three.js en [`FRONTEND_API_GUIDE.md`](../FRONTEND_API_GUIDE.md).

---

## Ambientes

| Ambiente | URL Base API v1 | Documentación / Esquema | Propósito y Notas |
| --- | --- | --- | --- |
| **Producción / Demo Pública (HTTPS Cloudflare Quick Tunnel)** | `https://chart-owned-alabama-choices.trycloudflare.com/api/v1` | [Swagger UI](https://chart-owned-alabama-choices.trycloudflare.com/docs) · [ReDoc](https://chart-owned-alabama-choices.trycloudflare.com/redoc) · [OpenAPI JSON](https://chart-owned-alabama-choices.trycloudflare.com/openapi.json) | Acceso abierto sin VPN; CORS `*` habilitado. Si el contenedor `spaceapps-cloudflared` se reinicia, el subdominio `*.trycloudflare.com` cambia. |
| **Red Interna del Equipo (Tailscale)** | `http://100.66.139.125:8000/api/v1` | `http://100.66.139.125:8000/docs` | IP fija en el tailnet (`desktop`). Requiere tener Tailscale activo con acceso al nodo compartido. |
| **Local Mock (Zero-Dependency)** | `http://localhost:3000/api/v1` | [`contracts/lunar-landing-api-contract.md`](../contracts/lunar-landing-api-contract.md) | Servidor nativo Node.js sin dependencias externas (`mock/server.js`, formato CommonJS). Ideal para desarrollo offline y pruebas rápidas; si corre dentro de un proyecto con `"type": "module"`, requiere aislarse con un `package.json` `{"type": "commonjs"}` (`P-004`). |
| **Local Backend (Científico)** | `http://localhost:8000/api/v1` | `http://localhost:8000/docs` | Entorno FastAPI completo con motor SPICE/Horizons y lector de GeoTIFFs LOLA en `desktop`. |

---

## Variables de entorno

Nombres recomendados para el Frontend, **sin valores secretos** (la URL se parametriza para actualizarla si cambia el Quick Tunnel o se usa el mock):

| Variable | Tipo | Ejemplo / Default | Descripción |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | Cadena | `https://chart-owned-alabama-choices.trycloudflare.com/api/v1` | URL base para proyectos basados en Vite / React. Para usar mock local: `http://localhost:3000/api/v1` (`P-002`). |
| `NEXT_PUBLIC_API_BASE_URL` | Cadena | `https://chart-owned-alabama-choices.trycloudflare.com/api/v1` | URL base para proyectos basados en Next.js. Para mock local: `http://localhost:3000/api/v1`. |
| `PORT` | Numérico | `3000` | Puerto TCP donde escucha el servidor mock local. |
| `NODE_ENV` | Cadena | `development` | Modo de ejecución del proceso. |

---

## Datos de prueba

1. **Sitios Curados:**
   - El backend sirve `13` sitios curados (`10` en el Polo Sur Artemis III/CLPS a `40 m/px` + `3` históricos Apollo globales sobre `ldem_64.tif`) y `1,531` polígonos PSR en PostGIS.
   - Coordenadas de prueba rápida (Shackleton Rim): `lat=-89.66`, `lon=222.7`, `start_utc="2026-12-01T00:00:00Z"`.
2. **Malla Topográfica (DEM Patch):**
   - Recorte de $12\text{ km} \times 12\text{ km}$ centrado en Shackleton Rim con resolución configurable ($64 \times 64$, $128 \times 128$, $256 \times 256$).
3. **Serie Temporal (Timeline 14 días):**
   - 336 puntos horarios incluyendo vectores cartesianos unitarios 3D del Sol y la Tierra con efecto de libración polar.

---

## Cómo probar la API y correr en local

### Opción A: Probar contra el Backend en Vivo (HTTPS)

```bash
# 1. Verificar salud del backend, datasets LOLA/SPICE y PostGIS
curl -s https://chart-owned-alabama-choices.trycloudflare.com/api/v1/health | jq .

# 2. Listar los 13 sitios curados
curl -s https://chart-owned-alabama-choices.trycloudflare.com/api/v1/sites | jq .

# 3. Generar tipos TypeScript desde el contrato OpenAPI local
# (ejecutar vía npx sin instalar como devDependency para no chocar con TypeScript 7 de Vite, ver P-005)
npx openapi-typescript contracts/openapi.json -o src/types/api.d.ts
```

*(Si la URL pública del túnel cambia tras un reinicio en `desktop`, se consulta con `docker logs spaceapps-cloudflared 2>&1 | grep trycloudflare`).*

---

### Opción B: Levantar el Servidor Mock Zero-Dependency (Offline / Local)

El servidor mock no requiere `npm install` ni paquetes externos; corre sobre el runtime nativo de Node.js:

```bash
# Iniciar el servidor mock en el puerto 3000
node mock/server.js

# O en un puerto personalizado
PORT=3001 node mock/server.js
```

Pruebas rápidas contra el mock local:
```bash
# Salud
curl -s http://localhost:3000/api/v1/health | jq .

# Catálogo de sitios
curl -s http://localhost:3000/api/v1/sites | jq .

# Parche topográfico 3D
curl -s "http://localhost:3000/api/v1/terrain/patch?lat=-89.66&lon=222.7&size_km=12&resolution=128" | jq .

# Evaluación con timeline temporal
curl -s -X POST http://localhost:3000/api/v1/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "lat": -89.66,
    "lon": 222.7,
    "start_utc": "2026-12-01T00:00:00Z",
    "duration_days": 14.0,
    "step_minutes": 60
  }' | jq '{site: .site, summary: .summary, timeline_points: (.timeline | length)}'
```
