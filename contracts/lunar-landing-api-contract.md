# Lunar Landing Site Navigator — API Contract Specification (v1.0)

Documentación de interfaz de comunicación (Request/Response) entre el Frontend (Visor 2D/3D y Dashboard) y el Backend (Motor topográfico LOLA y efemérides SPICE/Horizons).

---

## 1. Reglas Generales del Contrato

### 1.1 Estándares de Comunicación
* **Formato de intercambio:** `application/json`
* **Formato de fechas:** ISO-8601 en UTC estricto (`YYYY-MM-DDTHH:mm:ssZ`).
* **Códigos de Estado HTTP:**
  * `200 OK`: Cálculo o consulta exitosa.
  * `422 Unprocessable Entity`: Parámetros fuera de rango (latitud fuera de límites, resolución inválida, etc.).
  * `500 Internal Server Error` / `503 Service Unavailable`: Falla al procesar datasets LOLA/SPICE o indisponibilidad de base de datos.

### 1.2 Sistemas de Referencia Espacial

| Sistema | Ejes / Parámetros | Rango / Convención |
|---|---|---|
| **Coordenadas Geográficas (Luna)** | `lat` (Latitud) | `-90.0` a `-80.0` (Región Polo Sur lunar) |
| | `lon` (Longitud) | `0.0` a `360.0` Este (o `-180.0` a `180.0` normalizado) |
| **Coordenadas 3D Locales (Visor)** | Origen `(0, 0, 0)` | Centrado en el punto de aterrizaje consultado |
| | `+X` | Este |
| | `+Y` | Elevación vertical (metros) |
| | `-Z` | Norte (`+Z` = Sur) |

---

## 2. Definición de Endpoints

### 2.1 `GET /api/v1/health`
Verifica la operatividad del backend, base de datos espacial y datasets topográficos.

* **Query Parameters:** Ninguno.
* **Respuesta (`200 OK`):**
```json
{
  "status": "ok",
  "database": {
    "landing_sites_count": 10,
    "psr_regions_count": 1531
  }
}
```

---

### 2.2 `GET /api/v1/sites`
Catálogo curado de sitios candidatos de aterrizaje (misiones Artemis III, CLPS, etc.) para poblar selectores y marcadores de mapa.

* **Query Parameters:** Ninguno.
* **Respuesta (`200 OK`):**
```json
{
  "count": 10,
  "sites": [
    {
      "id": "artemis-shackleton-rim",
      "name": "Shackleton Rim",
      "category": "Artemis III",
      "lat": -89.66,
      "lon": 222.7,
      "polar_x_m": -6975.1,
      "polar_y_m": 7569.4,
      "elevation_m": 2048.5,
      "slope_deg": 6.4,
      "nearest_psr_km": 1.8,
      "description": "Cresta con alta iluminación solar cerca del cráter Shackleton."
    }
  ]
}
```

---

### 2.3 `GET /api/v1/terrain/patch`
Malla de elevación y pendientes alrededor de una coordenada para el renderizado del terreno 3D.

* **Query Parameters:**

| Parámetro | Tipo | Requerido | Default | Rango / Restricciones | Descripción |
|---|---|---|---|---|---|
| `lat` | `float` | Sí | — | `-90.0` a `-80.0` | Latitud del centro de la malla |
| `lon` | `float` | Sí | — | `-180.0` a `360.0` | Longitud del centro de la malla |
| `size_km` | `float` | No | `12.0` | `2.0` a `40.0` | Dimensión del recorte (km) |
| `resolution` | `int` | No | `128` | `64`, `128`, `256` | Número de vértices por lado ($N \times N$) |

* **Respuesta (`200 OK`):**
```json
{
  "center": {
    "lat": -89.66,
    "lon": 222.7,
    "polar_x_m": -6975.1,
    "polar_y_m": 7569.4,
    "elevation_m": 2048.5,
    "slope_deg": 6.4
  },
  "grid": {
    "size_km": 12.0,
    "resolution": 128,
    "cell_size_m": 94.48,
    "min_elevation_m": -1850.2,
    "max_elevation_m": 2410.0,
    "elevations_m": [2040.1, 2038.4],
    "slopes_deg": [5.2, 6.1]
  },
  "nearby_psrs": [
    {
      "gid": 14,
      "name": "Shackleton",
      "area_km2": 182.4,
      "distance_km": 1.8
    }
  ]
}
```
> **Nota técnica:** `elevations_m` y `slopes_deg` son arreglos planos unidimensionales de longitud $\text{resolution}^2$, ordenados por filas de Norte a Sur y de Oeste a Este.

---

### 2.4 `POST /api/v1/evaluate`
Evaluación operativa temporal: calcula el horizonte local (360°), efemérides solares y terrestres paso a paso, y vectores tridimensionales de iluminación/comunicación.

* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "lat": -89.66,
  "lon": 222.7,
  "start_utc": "2026-12-01T00:00:00Z",
  "duration_days": 14.0,
  "step_minutes": 60,
  "panel_efficiency": 0.28,
  "panel_area_m2": 4.0
}
```

* **Respuesta (`200 OK`):**
```json
{
  "site": {
    "lat": -89.66,
    "lon": 222.7,
    "elevation_m": 2048.5,
    "slope_deg": 6.4,
    "nearest_psr_km": 1.8,
    "status": "GO",
    "reasons": [
      "Pendiente segura (6.4° <= 10°)",
      "Iluminación solar alta (82.1%) en la ventana seleccionada",
      "Comunicación Direct-to-Earth disponible (64.3%)"
    ]
  },
  "summary": {
    "sun_visible_pct": 82.1,
    "earth_visible_pct": 64.3,
    "max_continuous_sun_hours": 196.0,
    "max_continuous_dte_hours": 140.0,
    "next_sunset_utc": "2026-12-09T04:00:00Z",
    "hours_to_next_sunset": 196.0,
    "next_earthset_utc": "2026-12-06T20:00:00Z",
    "hours_to_next_earthset": 140.0,
    "avg_power_factor": 0.74,
    "estimated_peak_power_w": 1528.0
  },
  "horizon_profile": [
    { "az_deg": 0, "horizon_el_deg": 0.85 },
    { "az_deg": 1, "horizon_el_deg": 0.92 }
  ],
  "timeline": [
    {
      "timestamp_utc": "2026-12-01T00:00:00Z",
      "sun_az_deg": 57.38,
      "sun_el_deg": 1.77,
      "sun_horizon_el_deg": 0.45,
      "sun_visible": true,
      "sun_vector_3d": [0.842, 0.031, 0.539],
      "earth_az_deg": 143.96,
      "earth_el_deg": -2.06,
      "earth_horizon_el_deg": 1.12,
      "earth_visible": false,
      "earth_vector_3d": [0.588, -0.036, -0.808],
      "power_factor": 0.88
    }
  ]
}
```

---

### 2.5 `POST /api/v1/compare`
Evaluación simultánea de 2 a 5 escenarios `{sitio + fecha}` para la vista comparativa.

* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "scenarios": [
    {
      "label": "Escenario A: Shackleton (1 Dic)",
      "lat": -89.66,
      "lon": 222.7,
      "start_utc": "2026-12-01T00:00:00Z"
    },
    {
      "label": "Escenario B: Shackleton Retrasado (15 Dic)",
      "lat": -89.66,
      "lon": 222.7,
      "start_utc": "2026-12-15T00:00:00Z"
    }
  ],
  "duration_days": 14.0,
  "step_minutes": 120
}
```

* **Respuesta (`200 OK`):**
```json
{
  "results": [
    {
      "label": "Escenario A: Shackleton (1 Dic)",
      "site": {
        "lat": -89.66,
        "lon": 222.7,
        "elevation_m": 2048.5,
        "slope_deg": 6.4,
        "nearest_psr_km": 1.8,
        "status": "GO",
        "reasons": [
          "Iluminación solar alta (82.1%)"
        ]
      },
      "summary": {
        "sun_visible_pct": 82.1,
        "earth_visible_pct": 64.3,
        "max_continuous_sun_hours": 196.0,
        "max_continuous_dte_hours": 140.0,
        "next_sunset_utc": "2026-12-09T04:00:00Z",
        "hours_to_next_sunset": 196.0,
        "next_earthset_utc": "2026-12-06T20:00:00Z",
        "hours_to_next_earthset": 140.0,
        "avg_power_factor": 0.74,
        "estimated_peak_power_w": 1528.0
      }
    }
  ]
}
```

---

### 2.6 `GET /api/v1/psr/nearby`
Retorna polígonos GeoJSON de Regiones Permanentemente Sombreadas (PSRs) en formato polar para superposición cartográfica.

* **Query Parameters:**

| Parámetro | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|
| `lat` | `float` | Sí | — | Latitud del centro de búsqueda |
| `lon` | `float` | Sí | — | Longitud del centro de búsqueda |
| `radius_km` | `float` | No | `25.0` | Radio de búsqueda en km |
| `limit` | `int` | No | `50` | Máximo de regiones a retornar |
| `simplify_m` | `float` | No | `150.0` | Tolerancia de simplificación de vértices (metros) |

* **Respuesta (`200 OK`):**
```json
{
  "center": {
    "lat": -89.66,
    "lon": 222.7,
    "polar_x_m": -6975.1,
    "polar_y_m": 7569.4
  },
  "radius_km": 25.0,
  "count": 1,
  "psrs": [
    {
      "gid": 14,
      "name": "Shackleton",
      "area_km2": 182.4,
      "distance_km": 1.8,
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [
            [
              [-6500.0, 7200.0],
              [-6400.0, 7100.0],
              [-6500.0, 7200.0]
            ]
          ]
        ]
      }
    }
  ]
}
```

---

## 3. Mapeo Arquitectónico: Frontend vs Backend

| Componente UI (Frontend) | Endpoint Consumido | Propósito de Datos |
|---|---|---|
| **Selector de Sitios** (Panel Izquierdo) | `GET /api/v1/sites` | Poblar catálogo seleccionable (`name`, `category`, coordenadas). |
| **Tarjetas KPI & Semáforo GO/NO-GO** (Panel Izquierdo) | `POST /api/v1/evaluate` | Renderizar `site.status` y métricas clave de `summary`. |
| **Timeline Slider** (Barra Inferior) | `POST /api/v1/evaluate` | Consumo en memoria de `timeline[]`: el slider itera índices `0..N` sin peticiones adicionales. |
| **Visor 3D Topográfico** (Panel Derecho) | `GET /api/v1/terrain/patch` + `timeline[i]` | Construcción de malla con `grid.elevations_m`; orientación de luces con `sun_vector_3d` y `earth_vector_3d`. |
| **Modal Comparativo** | `POST /api/v1/compare` | Tabla comparativa de resultados concurrentes con `results[]`. |
| **Capa de Sombras Permanentes** | `GET /api/v1/psr/nearby` | Dibujar polígonos de zonas PSR sobre el visor 2D/3D. |
