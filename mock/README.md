# Servidor Simulado (Mock Server)

Servidor HTTP autónomo con **cero dependencias externas de `npm`**, desarrollado con los módulos nativos de Node.js (`http`, `url`). Emula fielmente el contrato de interfaz oficial especificado en [`contracts/lunar-landing-api-contract.md`](file:///Users/axeltapia/personal/NASA/handoff-space-NASA-challenge/contracts/lunar-landing-api-contract.md).

Permite al equipo de frontend, evaluadores y jurados ejecutar la solución de forma desacoplada, con respuestas en milisegundos y sin requerir conexión a internet ni compilación de kernels SPICE.

---

## Cómo levantarlo

### Opción 1: Servidor nativo Node.js (Recomendado)

Requiere Node.js (v18 o superior). No necesita ejecutar `npm install`.

```bash
# Iniciar en el puerto por defecto (3000)
node mock/server.js

# O en un puerto personalizado
PORT=3001 node mock/server.js
```

El servidor emitirá en consola:
```text
============================================================
  Lunar Landing Navigator — Zero-Dependency Mock Server
  Listening on http://localhost:3000
============================================================
Available endpoints:
  GET  /api/v1/health
  GET  /api/v1/sites
  GET  /api/v1/terrain/patch?lat=-89.66&lon=222.7
  POST /api/v1/evaluate
  POST /api/v1/compare
  GET  /api/v1/psr/nearby?lat=-89.66&lon=222.7
============================================================
```

### Opción 2: Con Prism (A partir del OpenAPI YAML)

Si dispones de un archivo OpenAPI en `contracts/`:
```bash
npx @stoplight/prism-cli mock contracts/lunar-landing-api-contract.yaml -p 3000
```

---

## Endpoints implementados

| Método | Ruta | Descripción | Parámetros / Cuerpo clave |
|---|---|---|---|
| `GET` | `/api/v1/health` | Estado de salud y conteo de entidades. | Ninguno. |
| `GET` | `/api/v1/sites` | Catálogo de sitios curados (Artemis III, CLPS). | Ninguno. |
| `GET` | `/api/v1/terrain/patch` | Malla de elevación (`elevations_m`) y pendientes (`slopes_deg`). | `lat`, `lon`, `size_km` (def: 12), `resolution` (64, 128, 256). |
| `POST` | `/api/v1/evaluate` | Evaluación temporal, `horizon_profile` (360°), serie `timeline[]` con vectores 3D y semáforo GO/NO-GO. | `lat`, `lon`, `start_utc`, `duration_days`, `step_minutes`. |
| `POST` | `/api/v1/compare` | Evaluación simultánea de 2 a 5 escenarios. | `scenarios: [{ label, lat, lon, start_utc }]`. |
| `GET` | `/api/v1/psr/nearby` | Polígonos GeoJSON de Regiones Permanentemente Sombreadas (PSRs). | `lat`, `lon`, `radius_km`. |

---

## Pruebas de verificación rápida con cURL

```bash
# 1. Comprobar salud
curl -s http://localhost:3000/api/v1/health

# 2. Listar sitios
curl -s http://localhost:3000/api/v1/sites

# 3. Evaluar Shackleton Rim para diciembre 2026
curl -s -X POST http://localhost:3000/api/v1/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "lat": -89.66,
    "lon": 222.7,
    "start_utc": "2026-12-01T00:00:00Z",
    "duration_days": 14.0,
    "step_minutes": 60
  }'

# 4. Validar manejo de errores (coordenada fuera del polo sur lunar)
curl -s -X POST http://localhost:3000/api/v1/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "lat": -60.0,
    "lon": 10.0,
    "start_utc": "2026-12-01T00:00:00Z"
  }'
# Retorna: 422 Unprocessable Entity con código ERR_INVALID_COORDINATES
```
