# Lunar Landing Site Navigator — API Contract Specification (v1.5)

Documentación de interfaz de comunicación (Request/Response) entre el Frontend (Visor 2D/3D y Dashboard) y el Backend (Motor topográfico LOLA y efemérides SPICE/Horizons).

---

## 1. Reglas Generales del Contrato

### 1.1 Estándares de Comunicación y Ambientes
* **URLs activas, variables de entorno y comandos de prueba:** consultar la fuente única en [`docs/07-ambientes-y-pruebas.md`](../docs/07-ambientes-y-pruebas.md).
* **Esquema OpenAPI 3.1.0:** [`contracts/openapi.json`](openapi.json).
* **CORS:** Habilitado abierto (`allow_origins=["*"]`) para llamadas directas desde `localhost` o producción. Expone las cabeceras `X-Terrain-Source` (v1.3) y `X-Terrain-Resolution-M` (v1.5) para que el navegador las lea.
* **Formato de intercambio:** `application/json` (UTF-8)
* **Formato de fechas:** ISO-8601 en UTC estricto (`YYYY-MM-DDTHH:mm:ssZ`), rango soportado **`1900-01-01` a `2050-12-31`**.
* **Guía de consumo de v1.2:** [`docs/12-contrato-api-v1.2.md`](../docs/12-contrato-api-v1.2.md) (flujo recomendado, límites, coordenadas y recetas TypeScript).
* **Versiones:** v1.2 solo **agrega** campos y endpoints a v1.1 (`site.checks`, `include_timeline` en `/compare`, `grid.source` y `grid.native_resolution_m`, `GET /psr`, `GET /ephemeris`), v1.3 agrega `GET /terrain/tiles/{z}/{row}/{col}.png`, v1.4 agrega al `summary` la visibilidad inicial y las salidas del Sol y la Tierra (§2.4) y v1.5 agrega la malla (`/terrain/tiles/heightmap`) y el sombreado (`/terrain/tiles/hillshade`) del globo, lleva `/terrain/tiles` hasta `z = 10` y agrega `X-Terrain-Resolution-M` (§2.9 a §2.11); ninguna quita ni renombra nada. Qué versión sirve cada ambiente: [`docs/07-ambientes-y-pruebas.md`](../docs/07-ambientes-y-pruebas.md).
* **Caché HTTP:** las respuestas `200` de `GET /sites`, `/terrain/patch`, `/psr`, `/psr/nearby`, `/ephemeris` y `/terrain/tiles` (con `heightmap` y `hillshade`) llevan `Cache-Control: public, max-age=3600` (datos de referencia que no cambian por petición). Las tres rutas de `/terrain/tiles` agregan `ETag` y responden `304` a `If-None-Match`. `/health` y los errores no se cachean.
* **Códigos de Estado HTTP:**
  * `200 OK`: Cálculo o consulta exitosa.
  * `400 Bad Request`: JSON malformado o ausencia de campos obligatorios del payload (`ERR_INVALID_PAYLOAD`).
  * `404 Not Found`: Ruta o recurso inexistente (`ERR_NOT_FOUND`).
  * `422 Unprocessable Entity`: Parámetros fuera de rango o regla de dominio inválida (`ERR_INVALID_COORDINATES`, `ERR_DATE_OUT_OF_RANGE`, `ERR_SCENARIO_LIMIT_EXCEEDED`, `ERR_DUPLICATE_SCENARIOS`, `ERR_INVALID_PAYLOAD`).
  * `500 Internal Server Error` / `503 Service Unavailable`: Falla al procesar datasets LOLA/SPICE o indisponibilidad de base de datos (`ERR_TERRAIN_UNAVAILABLE`, `ERR_UPSTREAM_SERVICE`).

### 1.2 Formato Estándar de Errores
Tanto el backend en vivo (`spaceapps-api`) como el mock (`mock/server.js`) emiten el envoltorio unificado `ErrorResponse`:

```json
{
  "error": {
    "code": "ERR_INVALID_COORDINATES",
    "message": "lat: Input should be greater than or equal to -90",
    "details": {
      "field": "lat",
      "value": -95,
      "allowed_range": [-90.0, 90.0]
    }
  },
  "detail": "..."
}
```

El cliente debe decidir el comportamiento por `error.code` según el catálogo completo en [`docs/06-contrato-y-errores.md`](../docs/06-contrato-y-errores.md).

### 1.3 Sistemas de Referencia Espacial

| Sistema | Ejes / Parámetros | Rango / Convención |
|---|---|---|
| **Coordenadas Geográficas (Luna)** | `lat` (Latitud) | `-90.0` a `90.0` (Polo Sur `-90.0` a `-80.0` en `40 m/px`; cobertura global con `ldem_64.tif`) |
| | `lon` (Longitud) | `0.0` a `360.0` Este (o `-180.0` a `180.0` normalizado en backend) |
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
    "landing_sites_count": 13,
    "psr_regions_count": 1531
  }
}
```

---

### 2.2 `GET /api/v1/sites`
Catálogo curado de sitios candidatos de aterrizaje (`10` del Polo Sur Artemis III / CLPS + `3` históricos globales Apollo: `apollo-11`, `apollo-15`, `apollo-17`) para poblar selectores y marcadores de mapa.

* **Query Parameters:** Ninguno.
* **Respuesta (`200 OK`):**
```json
{
  "count": 13,
  "sites": [
    {
      "id": "artemis-shackleton-rim",
      "name": "Shackleton Rim",
      "category": "Artemis III",
      "lat": -89.66,
      "lon": 222.7,
      "polar_x_m": -6991.8,
      "polar_y_m": -7576.9,
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
| `lat` | `float` | Sí | — | `-90.0` a `90.0` | Latitud del centro de la malla (`-90..-80` en `40 m/px`; global en `ldem_64.tif`) |
| `lon` | `float` | Sí | — | `-180.0` a `360.0` | Longitud del centro de la malla |
| `size_km` | `float` | No | `12.0` | `2.0` a `40.0` | Dimensión del recorte (km) |
| `resolution` | `int` | No | `128` | `64`, `128`, `256` | Número de vértices por lado ($N \times N$) |

* **Respuesta (`200 OK`):**
```json
{
  "center": {
    "lat": -89.66,
    "lon": 222.7,
    "polar_x_m": -6991.8,
    "polar_y_m": -7576.9,
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
    "slopes_deg": [5.2, 6.1],
    "source": "lola_polar",
    "native_resolution_m": 40.0
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
> **Nota técnica:** `elevations_m` y `slopes_deg` son arreglos planos unidimensionales de longitud $\text{resolution}^2$, ordenados por filas de Norte a Sur y de Oeste a Este. Las elevaciones van redondeadas a `0.1 m` y las pendientes a `0.01°`.
>
> **Origen de la malla (v1.2):** `grid.source` es `"lola_polar"` (DEM LOLA del Polo Sur, `-90°..-80°`), `"lola_global"` (`ldem_64`) o `"synthetic"` (sin datasets, solo desarrollo). `grid.native_resolution_m` es la resolución real de ese dataset (`null` en `synthetic`); si `cell_size_m` es menor, el detalle extra es interpolado.

---

### 2.4 `POST /api/v1/evaluate`
Evaluación operativa temporal: calcula el horizonte local (360°), efemérides solares y terrestres paso a paso, y vectores tridimensionales de iluminación/comunicación.

* **Headers:** `Content-Type: application/json`
* **Valores posibles de `site.status`:** `"GO"` | `"CAUTION"` | `"NO-GO"` (también aplica en `/compare`).
* **Request Body:** (`lat`: `-90.0` a `90.0`, `lon`: `-180.0` a `360.0`)
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
    ],
    "checks": [
      { "code": "SLOPE_SAFE", "level": "ok", "value": 6.4, "threshold": 10.0, "unit": "deg", "message": "Safe slope (6.4° ≤ 10°)" },
      { "code": "SUN_HIGH", "level": "ok", "value": 82.1, "threshold": 50.0, "unit": "pct", "message": "High sunlight (82.1% of the window)" },
      { "code": "DTE_AVAILABLE", "level": "ok", "value": 64.3, "threshold": 15.0, "unit": "pct", "message": "Direct-to-Earth link available (64.3% of the window)" }
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
    "sun_visible_at_start": true,
    "earth_visible_at_start": false,
    "next_sunrise_utc": null,
    "hours_to_next_sunrise": null,
    "next_earthrise_utc": "2026-12-01T09:00:00Z",
    "hours_to_next_earthrise": 9.0,
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
      "sun_vector_3d": [0.842, 0.031, -0.539],
      "earth_az_deg": 143.96,
      "earth_el_deg": -2.06,
      "earth_horizon_el_deg": 1.12,
      "earth_visible": false,
      "earth_vector_3d": [0.588, -0.036, 0.808],
      "power_factor": 0.88
    }
  ]
}
```

#### `site.checks` (v1.2)
Mismo veredicto que `reasons`, como datos. `reasons` conserva las frases en español; `checks` permite mostrar el veredicto en el idioma de la interfaz (`message` viene en inglés) o armar un texto propio con `code`, `value` y `threshold`.

| Campo | Valores |
|---|---|
| `code` | `SLOPE_SAFE`, `SLOPE_MODERATE`, `SLOPE_CRITICAL`, `SUN_HIGH`, `SUN_LIMITED`, `SUN_CRITICAL`, `DTE_AVAILABLE`, `DTE_REDUCED`, `DTE_NONE` |
| `level` | `"ok"` · `"caution"` · `"nogo"`. Un `nogo` implica `status: "NO-GO"`; sin `nogo`, un `caution` implica `"CAUTION"` |
| `value` / `threshold` | Valor medido y umbral aplicado |
| `unit` | `"deg"` (pendiente) · `"pct"` (porcentaje de la ventana) |
| `message` | Frase en inglés lista para mostrar |

Decidir siempre por `code` y `level`, nunca por el texto (igual que con los errores).

#### Potencia, ocasos y PSR: qué significa cada campo (P-011, P-012)
Aclaraciones de los campos de v1.2 y los que agrega v1.4. Aplican igual a cada resultado de `/compare`.

| Campo | Definición |
|---|---|
| `timeline[].power_factor` | Fracción `0..1` de la potencia máxima de un **panel vertical que gira siguiendo el azimut del Sol**: `disk_frac · cos(sun_el_deg)`, con `disk_frac = min(1, 0.5 + 0.5 · (sun_el_deg − sun_horizon_el_deg) / 0.2666°)`. Vale `0` cuando `sun_visible` es `false`; como el Sol cuenta como visible solo si el **centro** del disco supera la cresta, al salir salta de `0` a ~`0.5`. |
| `summary.avg_power_factor` | Promedio simple de `power_factor` sobre **todos** los pasos de la ventana, incluidos los ceros. |
| `summary.estimated_peak_power_w` | Máximo de `(1361 / r²) · panel_efficiency · panel_area_m2 · power_factor`, con `r` la distancia Sol–Luna en UA en ese paso. Puede superar `1361 · panel_efficiency · panel_area_m2` cuando `r < 1` (cerca del perihelio, 3 de enero). |
| `summary.hours_to_next_sunset` / `hours_to_next_earthset` | Horas desde `start_utc` hasta la **primera transición de visible a oculto** del astro. `null` si no hay ninguna en la ventana: visible toda la ventana, nunca sale, o sale y no se pone. Si empieza oculto, sale y se pone, **sí** trae valor (contado desde `start_utc`). |
| `summary.next_sunset_utc` / `next_earthset_utc` | Instante de esa transición: la primera muestra ya oculta. El ocaso real ocurrió hasta `step_minutes` antes. `null` en los mismos casos. |
| `summary.sun_visible_at_start` / `earth_visible_at_start` (v1.4) | Si el astro está visible en la primera muestra de la ventana (`timeline[0]`). |
| `summary.hours_to_next_sunrise` / `hours_to_next_earthrise` (v1.4) | Lo mismo que `hours_to_next_*set`, con la transición contraria: horas desde `start_utc` hasta la **primera transición de oculto a visible**. `null` si no hay ninguna en la ventana (visible toda la ventana, nunca sale, o se pone y no vuelve a salir). |
| `summary.next_sunrise_utc` / `next_earthrise_utc` (v1.4) | Instante de esa transición: la primera muestra ya visible. La salida real ocurrió hasta `step_minutes` antes. `null` en los mismos casos. |
| `site.nearest_psr_km` | Distancia del sitio al **borde** de la PSR más cercana, medida en la estereográfica polar de LOLA (sobreestima ≤ 0.8 % en −80°). `0` si el sitio está dentro. El catálogo cubre solo las PSR de más de 1 km² al sur de −80° (NASA PGDA, `LPSR_80S_20MPP_ADJ_1km2.CSV`; citar Barker et al. 2023, *Planet. Sci. J.* 4, 183), así que fuera del polo el valor no es útil. |

Desde v1.4, `*_visible_at_start` y `next_*rise_*` dicen si un astro empieza oculto y cuándo sale, sin pedir `timeline[]`; en backends anteriores hay que leer `timeline[]` (en `/compare`, con `include_timeline: true`). En `/compare` el paso por defecto es de 120 min (60 en `/evaluate`), así que `hours_to_next_*` y `next_*_utc` pueden ir hasta 2 h por detrás del evento real.

> **Vectores 3D:** `sun_vector_3d` y `earth_vector_3d` siguen el marco local de la sección 1.3: `[cos(el)·sin(az), sin(el), −cos(el)·cos(az)]`. En el ejemplo, el Sol a `az 57.38°` (noreste) tiene `z < 0` (norte) y la Tierra a `az 143.96°` (sureste) tiene `z > 0` (sur).

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
  "step_minutes": 120,
  "include_timeline": false
}
```

* **`include_timeline` (v1.2, opcional, default `false`):** con `true`, cada resultado incluye `timeline` con el mismo formato que `POST /evaluate`. Con `false`, `timeline` es `null`.

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
        ],
        "checks": [
          { "code": "SUN_HIGH", "level": "ok", "value": 82.1, "threshold": 50.0, "unit": "pct", "message": "High sunlight (82.1% of the window)" }
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
      "timeline": null
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
    "polar_x_m": -6991.8,
    "polar_y_m": -7576.9
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
              [-6500.0, -7200.0],
              [-6400.0, -7100.0],
              [-6500.0, -7200.0]
            ]
          ]
        ]
      }
    }
  ]
}
```

---

### 2.7 `GET /api/v1/psr` (v1.2)
Catálogo completo de PSRs, paginado y simplificado, para vistas de todo el polo (el globo). Para un sitio concreto se sigue usando `/psr/nearby`.

* **Query Parameters:**

| Parámetro | Tipo | Requerido | Default | Rango | Descripción |
|---|---|---|---|---|---|
| `simplify_m` | `float` | No | `500.0` | `0` a `5000` | Tolerancia de simplificación (metros); `0` = geometría completa |
| `limit` | `int` | No | `500` | `1` a `500` | Tamaño de página |
| `offset` | `int` | No | `0` | `>= 0` | Cuántas PSRs saltar (orden por `gid`) |
| `min_area_km2` | `float` | No | `0.0` | `>= 0` | Solo PSRs de al menos esta área |

* **Respuesta (`200 OK`):**
```json
{
  "total": 1531,
  "offset": 0,
  "limit": 500,
  "count": 500,
  "simplify_m": 500.0,
  "psrs": [
    {
      "gid": 1,
      "name": "HNP_833388_0453121",
      "area_km2": 1071.427,
      "label_point": { "polar_x_m": 42420.0, "polar_y_m": 41720.0, "lat": -88.038, "lon": 45.477 },
      "geometry": { "type": "MultiPolygon", "coordinates": [[[[24290, 43940], [27200, 49610], [24290, 43940]]]] }
    }
  ]
}
```
> `total` cuenta todas las PSRs que cumplen el filtro; se recorren las páginas con `offset += limit` mientras `offset < total`. `label_point` es un punto **dentro** del polígono (para pines y etiquetas), en metros polares (D-012) y en grados. `geometry` está en metros estereográficos polares (D-012).

---

### 2.8 `GET /api/v1/ephemeris` (v1.2)
Sol y Tierra vistos desde el **centro de la Luna**, para dibujar el cielo del globo sin evaluar un sitio (`P-007`). Los vectores de un sitio siguen saliendo de `POST /evaluate`.

* **Query Parameters:** `utc` (requerido): ISO-8601 UTC entre `1900` y `2050`.
* **Respuesta (`200 OK`):**
```json
{
  "utc": "2026-12-01T00:00:00Z",
  "frame": "MOON_ME_DE421",
  "sun": {
    "direction": [0.174687, -0.984289, -0.025668],
    "sub_lat_deg": -1.4708,
    "sub_lon_deg": 280.0638,
    "distance_km": 147553142.2
  },
  "earth": {
    "direction": [0.992959, 0.11611, 0.023488],
    "sub_lat_deg": 1.3459,
    "sub_lon_deg": 6.6695,
    "distance_km": 376517.1
  }
}
```

| Campo | Significado |
|---|---|
| `frame` | Marco fijo lunar de SPICE (Mean Earth / Polar Axis) |
| `direction` | Vector unitario en ese marco: `+X` hacia `lat 0°, lon 0°`, `+Y` hacia `lat 0°, lon 90° E`, `+Z` al polo norte |
| `sub_lat_deg`, `sub_lon_deg` | Punto subsolar / subterrestre (longitud `0..360` Este) |
| `distance_km` | Distancia desde el centro de la Luna |

* **Errores:** `422 ERR_DATE_OUT_OF_RANGE` fuera de `1900-2050`; `422 ERR_INVALID_PAYLOAD` si falta `utc` o no es ISO-8601; `503 ERR_UPSTREAM_SERVICE` si el servidor no tiene los kernels SPICE (no hay modelo aproximado de respaldo).

---

### 2.9 `GET /api/v1/terrain/tiles/{z}/{row}/{col}.png` (v1.3)
Teselas de elevación de **toda la Luna** para el globo (`P-008`), en el mismo esquema que NASA Moon Trek y `GeographicTilingScheme` de Cesium. Las mallas de un sitio siguen saliendo de `GET /terrain/patch`.

* **Path Parameters:**
  * `z`: nivel de `0` a `10` (hasta `9` en v1.3). El nivel `0` tiene 2 columnas × 1 fila; cada tesela abarca `180° / 2^z`.
  * `row`: `0` a `2^z − 1`; la fila `0` es el borde norte (`lat 90°`).
  * `col`: `0` a `2^(z+1) − 1`; la columna `0` empieza en `lon −180°`.
* **Respuesta (`200 OK`, `image/png`):** PNG RGB de 8 bits, **256 × 256** muestras en los centros de píxel (fila `0` al norte). Codificación **Terrarium**:

```
elevation_m = R * 256 + G + B / 256 - 32768      (resolución 1/256 m)
```

  La elevación es relativa a la esfera de `1 737 400 m`, la misma de `terrain/patch` y de `Ellipsoid.MOON`. No se usa PNG de 16 bits porque el navegador lee los PNG a través de un `<canvas>` de 8 bits; Terrarium se lee con `getImageData` y `colorSpaceConversion: 'none'`.

| Cabecera | Significado |
|---|---|
| `X-Terrain-Source` | DEM usado: `lola_polar_20mpp`, `lola_polar_40mpp`, `lola_polar_80mpp`, `lola_global` o una combinación (`lola_polar_80mpp+lola_global`) |
| `X-Terrain-Resolution-M` (v1.5) | Separación en metros de los datos del DEM que de verdad se leyeron: el píxel nativo por el factor de diezmado. Si la tesela mezcla fuentes, la más gruesa. Si es mayor que el píxel de la tesela, el detalle extra es interpolado |
| `ETag` | Cambia si cambian los DEM del servidor; con `If-None-Match` responde `304` sin cuerpo |
| `Cache-Control` | `public, max-age=3600` |

* **Fuentes:** el DEM LOLA del Polo Sur que corresponde al zoom (20 m en `z = 10`, 40 m en `z = 9`, 80 m debajo) donde tiene datos, y el DEM LOLA global más fino del servidor en el resto (`ldem_256`, ~118 m/px; `ldem_64`, ~474 m/px, si no está). En zoom bajo los DEM se leen diezmados por bloques alineados al origen del ráster, así que teselas vecinas coinciden en su borde (sin costuras), y el DEM global da la vuelta en ±180°. Fuera del polo el DEM global no aporta más detalle desde `z ≈ 8` (`X-Terrain-Resolution-M` lo dice). Las teselas de `z = 0` a `9` son las mismas de v1.3 (mismos bytes y `ETag`).
* **Errores:** `422 ERR_INVALID_PAYLOAD` si `z`, `row` o `col` están fuera del esquema; `503 ERR_TERRAIN_UNAVAILABLE` si los DEM del servidor no cubren la tesela. Una ruta sin `.png` responde `404 ERR_NOT_FOUND`.

### 2.10 `GET /api/v1/terrain/tiles/heightmap/{z}/{row}/{col}.bin` (v1.5)
El mismo relieve de §2.9, ya en la forma que usa el terreno de Cesium (`CustomHeightmapTerrainProvider` con `width = height = 65`): el globo pasa el arreglo tal cual, sin decodificar ni remuestrear. Mismo esquema de teselas, mismas fuentes y mismas cabeceras que §2.9.

* **Path Parameters:** `z` de `0` a `12` (en `z = 12` las muestras quedan a ~21 m: el DEM polar de 20 m); `row` y `col` como en §2.9.
* **Respuesta (`200 OK`, `application/octet-stream`):** **65 × 65** valores `float32` *little-endian* (16 900 bytes), fila `0` al norte. Las muestras están **sobre** los bordes y esquinas de la tesela: la muestra `(i, j)` está en `lon = lon_oeste + i · span / 64`, `lat = lat_norte − j · span / 64`. Por eso dos teselas vecinas traen valores **idénticos** en su borde común. Elevación en metros sobre la esfera de `1 737 400 m`, redondeada a 1/256 m (la misma precisión de Terrarium).

```ts
const heights = new Float32Array(await res.arrayBuffer()) // 65 * 65, listo para Cesium
```

* **Compresión:** si la petición acepta `gzip`, la respuesta va con `Content-Encoding: gzip` (unos 8 a 12 KB) y `Vary: Accept-Encoding`; el navegador la descomprime solo. Cada codificación tiene su `ETag` (la de gzip termina en `-gz"`).
* **Errores:** los de §2.9.

### 2.11 `GET /api/v1/terrain/tiles/hillshade/{z}/{row}/{col}.png` (v1.5)
Sombreado del relieve de **toda la Luna**, listo para pintarse como capa de imágenes (`UrlTemplateImageryProvider`). Mismo esquema de teselas, mismas fuentes y mismas cabeceras que §2.9.

* **Path Parameters:** `z` de `0` a `10`; `row` y `col` como en §2.9.
* **Query Parameters (todos opcionales):**
  * `light_lon` (`−180..360`, default `135`) y `light_lat` (`−90..90`, default `−22`): punto de la Luna donde la luz cae a plomo. La luz es lejana y fija en el marco lunar (no es el Sol de la simulación). Los valores por defecto son la luz que usaba el globo.
  * `exaggeration` (`0.1..20`, default `1`): multiplica las pendientes.
  * `fade_start_lat` y `fade_end_lat` (`−90..90`, juntos y distintos): la imagen lleva canal alfa, con opacidad `0` en `fade_start_lat` que sube en línea recta hasta `1` en `fade_end_lat`. Sirve para fundir el sombreado con otra capa.
  * Los parámetros se redondean a 0.01 antes de calcular y de armar la `ETag`.
* **Respuesta (`200 OK`, `image/png`):** PNG de 8 bits en gris (gris + alfa con `fade_*`), **256 × 256** en los centros de píxel (fila `0` al norte). `gris = round(255 · cos(i))`, con `i` el ángulo entre la luz y la normal del terreno; `0` si la luz queda detrás de la pendiente. **Sin sombras proyectadas:** una ladera de cara a la luz sale iluminada aunque otra montaña la tape.
* **Cálculo:** las pendientes se sacan por diferencias centrales sobre la rejilla propia del DEM (estereográfica polar con su factor de escala en el DEM polar; latitud y longitud en el global), leyendo los vecinos de cada píxel en el ráster y no en la tesela, así que no hay costuras entre teselas. El estilo (brillo, contraste, gamma) lo pone el cliente sobre la capa.
* **Errores:** los de §2.9, más `422 ERR_INVALID_PAYLOAD` si un parámetro queda fuera de rango o llega solo uno de `fade_start_lat` / `fade_end_lat`.

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
| **Veredicto en la interfaz** (Panel de resultados) | `POST /api/v1/evaluate` · `/compare` | `site.checks[]` con `code`, `level` y `message` en inglés. |
| **Pistas por escenario** (Comparador) | `POST /api/v1/compare` con `include_timeline: true` | `results[].timeline[]`. |
| **PSRs de todo el polo** (Globo) | `GET /api/v1/psr` | Recorrer páginas y dibujar polígonos con `label_point`. |
| **Sol y Tierra en la vista global** (Globo) | `GET /api/v1/ephemeris?utc=` | `direction` o punto subsolar / subterrestre en el marco fijo lunar. |
| **Relieve del globo** (Globo) | `GET /api/v1/terrain/tiles/{z}/{row}/{col}.png` | Alturas Terrarium en metros reales para el `CustomHeightmapTerrainProvider`, de toda la Luna. |
| **Malla del relieve** (Globo, v1.5) | `GET /api/v1/terrain/tiles/heightmap/{z}/{row}/{col}.bin` | Arreglo de 65 × 65 alturas que el `CustomHeightmapTerrainProvider` usa sin procesar. |
| **Relieve sombreado** (Globo, v1.5) | `GET /api/v1/terrain/tiles/hillshade/{z}/{row}/{col}.png` | Capa de imágenes en gris para el polo sur o toda la Luna. |
