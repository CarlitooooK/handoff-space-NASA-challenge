# Contrato API v1.2 — Lunar Landing Site Navigator

> **Estado:** v1.2 vigente desde 2026-11-14 ([D-014](09-decisiones.md)). **v1.3** ([D-016](09-decisiones.md)) solo agrega `GET /terrain/tiles` (§4.9, receta en §8.6); lo demás de esta guía no cambia.
> **Fuente:** backend oficial `AxelT456/lunar_landing_site_navigator_api`, `main` = `c254c22` (código en `app/models.py` y `app/routers/*`), verificado con peticiones reales.
> **Compatibilidad:** v1.2 solo **agrega** cosas a v1.1; no quita ni renombra campos. Un cliente hecho para v1.1 sigue funcionando sin cambios.
> **Relación con `contracts/`:** este documento explica el contrato para quien lo consume. El esquema formal es [`contracts/openapi.json`](../contracts/openapi.json) y la especificación, [`contracts/lunar-landing-api-contract.md`](../contracts/lunar-landing-api-contract.md); si chocan, mandan los de `contracts/` ([`AGENTS.md`](../AGENTS.md)).

---

## 1. URL base y qué sirve cada una

La API tiene **una** URL pública (Cloudflare, HTTPS, sin VPN): la fila **Producción** de [`docs/07-ambientes-y-pruebas.md`](07-ambientes-y-pruebas.md), el único lugar donde se publica. **No la escribas en el código**: configúrala con `VITE_API_BASE_URL`.

| | **Producción** (`docs/07`) | **Apagada** (`docs/07`) |
|---|---|---|
| Backend | Backend oficial `main`; cada merge que pasa el CI se publica aquí (D-017) | Backend de prueba, apagado el 2026-11-14 |
| Contrato | v1.3 completo: v1.1, las novedades de v1.2 (sección 9) y las teselas (§4.9) | Ya no responde (era v1.1) |
| Swagger / OpenAPI | `<URL>/docs` · `<URL>/openapi.json` | — |

- Producción sirve **datos reales** de la base de datos del servidor (sitios y PSR en PostGIS), de los DEM LOLA y de los kernels SPICE; no es un mock. El mock de este repo (`mock/server.js`) solo corre en local (`localhost:3000`) para trabajar sin internet y devuelve valores simulados.
- Es un *Quick Tunnel*: si el servidor reinicia el túnel, el subdominio cambia. Consulta siempre [`docs/07`](07-ambientes-y-pruebas.md).

```env
# .env.local del front (no se versiona); la URL sale de docs/07
VITE_API_BASE_URL=<URL de Producción en docs/07>/api/v1
```

Tipos TypeScript (el esquema de este repo es el mismo que sirve el backend oficial):

```bash
npx openapi-typescript contracts/openapi.json -o src/types/api.d.ts
```

---

## 2. Reglas generales

| Tema | Regla |
|---|---|
| Formato | JSON UTF-8. `POST` con `Content-Type: application/json` |
| Autenticación | Ninguna |
| CORS | `Access-Control-Allow-Origin: *` (cualquier origen, incluido `localhost`) |
| Latitud | Planetocéntrica en grados, **`-90` a `90`** (todo el globo) |
| Longitud | Este en grados. Acepta **`-180` a `360`** y la devuelve normalizada a **`[0, 360)`** (p. ej. `-137.3` → `222.7`) |
| Fechas | ISO-8601 en UTC (`2026-12-01T00:00:00Z`). Sin zona se asume UTC. Años **1900–2050** (cobertura SPICE) |
| Unidades | metros (`_m`), kilómetros (`_km`), grados (`_deg`), porcentaje 0–100 (`_pct`), horas (`_hours`), watts (`_w`) |
| Nulos | Los campos marcados *nullable* pueden venir `null`; muéstralos como "—" |
| Caché HTTP | Los `GET` exitosos de `/sites`, `/terrain/patch`, `/psr`, `/psr/nearby` y `/ephemeris` llevan `Cache-Control: public, max-age=3600` |
| Compresión | Cloudflare comprime con gzip si el cliente envía `Accept-Encoding: gzip` (los navegadores lo hacen solos) |
| Latencia típica | 0.2–0.6 s por petición (medido desde internet) |

---

## 3. Errores

Toda respuesta de error usa el mismo sobre:

```json
{
  "error": {
    "code": "ERR_INVALID_COORDINATES",
    "message": "lat: Input should be less than or equal to 90",
    "details": { "field": "lat", "value": "95", "allowed_range": [-90.0, 90.0] }
  }
}
```

- Decide siempre por **`error.code`**; `error.message` es texto para logs o para mostrar.
- Puede venir un campo `detail` por compatibilidad: **no dependas de él**.

| HTTP | `error.code` | Cuándo |
|---|---|---|
| 400 | `ERR_INVALID_PAYLOAD` | JSON mal formado o cuerpo ausente |
| 422 | `ERR_INVALID_COORDINATES` | `lat`/`lon` fuera de rango (`details.field`, `details.value`, `details.allowed_range`) |
| 422 | `ERR_DATE_OUT_OF_RANGE` | Fecha fuera de 1900–2050 |
| 422 | `ERR_INVALID_PAYLOAD` | Otro parámetro inválido (p. ej. `resolution=100`, `step_minutes=1`, fecha no ISO) |
| 422 | `ERR_SCENARIO_LIMIT_EXCEEDED` | `/compare` con menos de 2 o más de 5 escenarios |
| 422 | `ERR_DUPLICATE_SCENARIOS` | `/compare` con dos escenarios iguales (`lat`, `lon`, `start_utc`) |
| 404 | `ERR_NOT_FOUND` | Ruta inexistente |
| 503 | `ERR_TERRAIN_UNAVAILABLE` | Falta el DEM o el motor de terreno |
| 503 | `ERR_UPSTREAM_SERVICE` | Falla la base de datos o faltan los kernels SPICE |

---

## 4. Endpoints

| Método | Ruta | Para qué | v1.2 |
|---|---|---|---|
| GET | `/health` | Estado del servidor y de los datos | — |
| GET | `/sites` | Catálogo de sitios | — |
| GET | `/terrain/patch` | Malla 3D local de terreno | + `grid.source`, `grid.native_resolution_m` |
| POST | `/evaluate` | Evaluación de un sitio en una ventana de tiempo | + `site.checks` |
| POST | `/compare` | Comparar de 2 a 5 escenarios | + `include_timeline`, `site.checks` |
| GET | `/psr/nearby` | PSR alrededor de un punto | — |
| GET | `/psr` | Catálogo completo de PSR, paginado | **nuevo** |
| GET | `/ephemeris` | Sol y Tierra vistos desde el centro de la Luna | **nuevo** |
| GET | `/terrain/tiles/{z}/{row}/{col}.png` | Teselas de elevación de toda la Luna (globo) | **nuevo en v1.3** |

### 4.1 `GET /health`

Para el indicador de conexión. Sin parámetros.

```json
{
  "status": "ok",
  "timestamp_utc": "2026-11-14T22:45:01Z",
  "data_dir": "/data",
  "database": { "connected": true, "postgis": true, "postgis_version": "3.4 …", "landing_sites_count": 13, "psr_regions_count": 1531, "error": null },
  "engine": { "available": true, "missing_symbols": [], "error": null },
  "lola_dems": { "LDEM_80S_40MPP_ADJ.TIF": { "exists": true, "path": "…", "size_bytes": 716000000 } },
  "spice_kernels": { "de440s.bsp": { "exists": true, "path": "…", "size_bytes": 32000000 } }
}
```

- `status`: `"ok"` o `"degraded"`. Con `"degraded"`, muestra un aviso: los datos pueden venir incompletos.

### 4.2 `GET /sites`

Sin parámetros. Hoy devuelve 13 sitios: 8 Artemis III, 2 CLPS (`clps-im1-malapert-a`, `clps-im2-mons-mouton`) y 3 Apollo (`apollo-11`, `apollo-15`, `apollo-17`).

| Campo de `sites[]` | Tipo | Nota |
|---|---|---|
| `id` | string | Estable, úsalo como clave |
| `name`, `category` | string | `category`: `"Artemis III"`, `"CLPS"` o `"Apollo"` |
| `lat`, `lon` | number | `lon` en `[0, 360)` |
| `polar_x_m`, `polar_y_m` | number | Estereográfica polar sur (sección 7.2) |
| `elevation_m`, `slope_deg`, `nearest_psr_km` | number, nullable | De LOLA y PostGIS. `nearest_psr_km` es la distancia al **borde** de la PSR más cercana (`0` dentro de una); el catálogo solo tiene PSR de más de 1 km² al sur de -80° (P-011) |
| `description` | string, nullable | En español |

### 4.3 `GET /terrain/patch`

Malla cuadrada centrada en el punto, lista para `PlaneGeometry` de Three.js.

| Parámetro | Tipo | Requerido | Default | Rango |
|---|---|---|---|---|
| `lat` | number | sí | — | -90 … 90 |
| `lon` | number | sí | — | -180 … 360 |
| `size_km` | number | no | `12` | 2 … 40 |
| `resolution` | int | no | `128` | **solo** `64`, `128` o `256` |

Respuesta (recortada; `lat=-89.45&lon=222.7&size_km=12&resolution=64`):

```json
{
  "center": { "lat": -89.45, "lon": 222.7, "polar_x_m": -11310.3, "polar_y_m": -12256.9, "elevation_m": 1955.24, "slope_deg": 2.89 },
  "grid": {
    "size_km": 12.0, "resolution": 64, "cell_size_m": 190.48,
    "min_elevation_m": 492.8, "max_elevation_m": 1956.47,
    "elevations_m": [948.2, 961.8, 969.1, "… 4096 valores"],
    "slopes_deg": [8.41, 7.54, 5.52, "… 4096 valores"],
    "source": "lola_polar",
    "native_resolution_m": 40.0
  },
  "nearby_psrs": [ { "gid": 1470, "name": "HNP_692552_2435024", "area_km2": 1.066, "distance_km": 6.103 } ]
}
```

| Campo | Significado |
|---|---|
| `grid.elevations_m`, `grid.slopes_deg` | `resolution × resolution` valores, **por filas**. Fila 0 = borde **norte**, columna 0 = borde **oeste** (sección 7.1). Elevación redondeada a 0.1 m y pendiente a 0.01° |
| `grid.cell_size_m` | Distancia entre muestras = `size_km·1000 / (resolution − 1)` |
| `grid.source` *(v1.2)* | `"lola_polar"` (40 m/px, sur de -80°), `"lola_global"` (~474 m/px, resto del globo) o `"synthetic"` (sin DEM) |
| `grid.native_resolution_m` *(v1.2)* | Resolución real del dato. Si `cell_size_m` es menor, las celdas están **interpoladas**: no sugieren más detalle del que hay |
| `nearby_psrs` | Hasta 25 PSR en un radio de `max(1.5·size_km, 25)` km, sin geometría (para dibujarlas usa `/psr/nearby`) |

Tamaño de la respuesta (sin comprimir → con gzip): `64` ≈ 50 KB, `128` ≈ 200 KB, `256` ≈ 800 KB → 260 KB.
**Recomendación:** `128` por defecto y `256` solo para vista de detalle. Para sitios con `source: "lola_global"` usa `size_km` ≥ 20, porque el dato no tiene más resolución.

### 4.4 `POST /evaluate`

Evalúa un sitio: horizonte de 360°, Sol y Tierra en el tiempo, energía, comunicación directa con la Tierra (DTE) y veredicto.

| Campo del cuerpo | Tipo | Requerido | Default | Rango |
|---|---|---|---|---|
| `lat` | number | sí | — | -90 … 90 |
| `lon` | number | sí | — | -180 … 360 |
| `start_utc` | string ISO | sí | — | 1900 … 2050 |
| `duration_days` | number | no | `14` | > 0 … 366 |
| `step_minutes` | int | no | `60` | 5 … 1440 |
| `panel_efficiency` | number | no | `0.28` | > 0 … 1 |
| `panel_area_m2` | number | no | `4.0` | > 0 … 1000 |

```json
{ "lat": -89.45, "lon": 222.7, "start_utc": "2026-12-01T00:00:00Z", "duration_days": 14, "step_minutes": 60 }
```

Respuesta (recortada):

```json
{
  "site": {
    "lat": -89.45, "lon": 222.7, "elevation_m": 1955.24, "slope_deg": 2.89, "nearest_psr_km": 6.103,
    "status": "CAUTION",
    "reasons": ["Pendiente segura (2.9° <= 10.0°)", "Iluminación solar alta (100.0%) en la ventana seleccionada", "Sin línea de vista Direct-to-Earth (0.0%); requiere satélite relay"],
    "checks": [
      { "code": "SLOPE_SAFE", "level": "ok", "value": 2.89, "threshold": 10.0, "unit": "deg", "message": "Safe slope (2.9° ≤ 10°)" },
      { "code": "SUN_HIGH", "level": "ok", "value": 100.0, "threshold": 50.0, "unit": "pct", "message": "High sunlight (100.0% of the window)" },
      { "code": "DTE_NONE", "level": "caution", "value": 0.0, "threshold": 0.0, "unit": "pct", "message": "No direct-to-Earth line of sight (0%); needs a relay satellite" }
    ]
  },
  "summary": {
    "sun_visible_pct": 100.0, "earth_visible_pct": 0.0,
    "max_continuous_sun_hours": 336.0, "max_continuous_dte_hours": 0.0,
    "next_sunset_utc": null, "hours_to_next_sunset": null,
    "next_earthset_utc": null, "hours_to_next_earthset": null,
    "avg_power_factor": 0.9995, "estimated_peak_power_w": 1579.18
  },
  "horizon_profile": [ { "az_deg": 0, "horizon_el_deg": 0.419 }, "… 360 puntos (az 0..359)" ],
  "timeline": [
    {
      "timestamp_utc": "2026-12-01T00:00:00Z",
      "sun_az_deg": 57.38, "sun_el_deg": 1.767, "sun_horizon_el_deg": 0.300, "sun_visible": true,
      "sun_vector_3d": [0.8418, 0.0308, -0.5389],
      "earth_az_deg": 143.96, "earth_el_deg": -2.055, "earth_horizon_el_deg": 2.692, "earth_visible": false,
      "earth_vector_3d": [0.5880, -0.0359, 0.8081],
      "power_factor": 0.9995
    },
    "… duration_days·24·60/step_minutes puntos (336 en el ejemplo)"
  ]
}
```

**Veredicto.** `status` es `NO-GO` si algún check es `nogo`, `CAUTION` si alguno es `caution` y `GO` en otro caso.

| `checks[].code` | `level` | Regla |
|---|---|---|
| `SLOPE_SAFE` | ok | pendiente ≤ 10° |
| `SLOPE_MODERATE` | caution | 10° < pendiente ≤ 15° |
| `SLOPE_CRITICAL` | nogo | pendiente > 15° |
| `SUN_HIGH` | ok | sol visible ≥ 50 % |
| `SUN_LIMITED` | caution | 20 % ≤ sol < 50 % |
| `SUN_CRITICAL` | nogo | sol < 20 % |
| `DTE_AVAILABLE` | ok | Tierra visible ≥ 15 % |
| `DTE_REDUCED` | caution | 0 % < Tierra < 15 % |
| `DTE_NONE` | caution | Tierra visible = 0 % |

- `reasons` (español) y `checks` dicen lo mismo. **Para la UI usa `checks`**: trae código, nivel, valor y umbral para que el front ponga su propio texto, color o icono. `message` viene en inglés.
- `*_visible` ya considera el relieve: es `true` solo si el astro está por encima del horizonte topográfico (`sun_el_deg > sun_horizon_el_deg`).
- `hours_to_next_*` cuenta desde `start_utc` hasta la **primera transición de visible a oculto**, y `next_*_utc` es esa muestra (el ocaso real ocurrió hasta `step_minutes` antes). Son `null` si no hay ninguna en la ventana: visible todo el tiempo, nunca sale, o sale y no se pone. `null` **no** quiere decir "empieza oculto": para eso mira `timeline[0]` (P-012).
- `power_factor` es la fracción de la potencia máxima de un panel vertical que gira siguiendo al Sol: `cos(sun_el_deg)` por la parte del disco solar sobre la cresta. Vale `0` con el Sol oculto y salta a ~`0.5` al salir. `avg_power_factor` promedia todos los pasos, ceros incluidos. `estimated_peak_power_w` usa la distancia real al Sol, así que cerca del perihelio supera `1361 · panel_efficiency · panel_area_m2` (P-011). Definiciones completas: [`contracts/lunar-landing-api-contract.md`](../contracts/lunar-landing-api-contract.md) §2.4.
- **Tamaño:** 14 días cada 60 min ≈ 180 KB. Evita pedir más de ~2000 puntos (por ejemplo, 366 días cada 5 min son 105 mil).

### 4.5 `POST /compare`

Evalúa de 2 a 5 escenarios con los mismos parámetros.

| Campo del cuerpo | Tipo | Requerido | Default | Rango |
|---|---|---|---|---|
| `scenarios[]` | array | sí | — | 2 … 5 elementos, sin repetidos |
| `scenarios[].label` | string | sí | — | 1 … 120 caracteres |
| `scenarios[].lat`, `.lon`, `.start_utc` | | sí | — | igual que `/evaluate` |
| `duration_days` | number | no | `14` | > 0 … 366 |
| `step_minutes` | int | no | **`120`** | 5 … 1440 (ojo: el default es distinto al de `/evaluate`) |
| `panel_efficiency`, `panel_area_m2` | number | no | `0.28`, `4.0` | igual que `/evaluate` |
| `include_timeline` *(v1.2)* | bool | no | `false` | `true` agrega la línea de tiempo de cada escenario |

```json
{
  "scenarios": [
    { "label": "Connecting Ridge", "lat": -89.45, "lon": 222.7, "start_utc": "2026-12-01T00:00:00Z" },
    { "label": "Apollo 11", "lat": 0.674, "lon": 23.473, "start_utc": "2026-12-01T00:00:00Z" }
  ],
  "duration_days": 3,
  "include_timeline": true
}
```

```json
{
  "results": [
    { "label": "Connecting Ridge", "site": { "status": "CAUTION", "checks": ["…"], "…": "igual que /evaluate" }, "summary": { "…": "…" }, "timeline": ["… 36 puntos"] },
    { "label": "Apollo 11", "site": { "status": "NO-GO", "…": "…" }, "summary": { "…": "…" }, "timeline": ["…"] }
  ]
}
```

- `results` llega en el mismo orden que `scenarios`.
- Sin `include_timeline`, `timeline` viene `null`. `horizon_profile` no se incluye en `/compare`; si lo necesitas, pide `/evaluate` del escenario.

### 4.6 `GET /psr/nearby`

PSR (regiones permanentemente sombreadas) alrededor de un punto, con geometría para dibujar. Los datos cubren solo el sur de -80°; más al norte la lista viene vacía.

| Parámetro | Tipo | Requerido | Default | Rango |
|---|---|---|---|---|
| `lat`, `lon` | number | sí | — | como siempre |
| `radius_km` | number | no | `25` | > 0 … 300 |
| `limit` | int | no | `50` | 1 … 200 |
| `simplify_m` | number | no | `150` | 0 … 2000 (tolerancia de simplificación) |

```json
{
  "center": { "lat": -89.66, "lon": 222.7, "polar_x_m": -6991.8, "polar_y_m": -7576.9 },
  "radius_km": 25.0,
  "count": 8,
  "psrs": [
    { "gid": 921, "name": "HNP_601351_1991303", "area_km2": 1.958, "distance_km": 4.675,
      "geometry": { "type": "MultiPolygon", "coordinates": [[[[-4960, -12310], "…"]]] } }
  ]
}
```

- `geometry` es GeoJSON `MultiPolygon` en **metros de la estereográfica polar sur**, no en lat/lon. Para dibujarla sobre `/terrain/patch`, conviértela con la sección 7.3.

### 4.7 `GET /psr` *(nuevo en v1.2)*

Catálogo completo de PSR, para vistas de todo el polo (por ejemplo el globo). Usa `/psr/nearby` para un sitio y `/psr` para listar todas las regiones una vez.

| Parámetro | Tipo | Default | Rango |
|---|---|---|---|
| `simplify_m` | number | `500` | 0 … 5000 |
| `limit` | int | `500` | 1 … 500 |
| `offset` | int | `0` | ≥ 0 (orden por `gid`) |
| `min_area_km2` | number | `0` | ≥ 0 (filtra regiones pequeñas) |

```json
{
  "total": 1531, "offset": 0, "limit": 2, "count": 2, "simplify_m": 500.0,
  "psrs": [
    { "gid": 1, "name": "HNP_833388_0453121", "area_km2": 1071.427,
      "label_point": { "polar_x_m": 42420.0, "polar_y_m": 41720.0, "lat": -88.038, "lon": 45.477 },
      "geometry": { "type": "MultiPolygon", "coordinates": ["…"] } }
  ]
}
```

- **Paginación:** repite con `offset += limit` mientras `offset < total`. Hoy son 1531 regiones: 4 páginas de 500, ~570 KB cada una con `simplify_m=500`.
- Para el globo conviene filtrar con `min_area_km2` (por ejemplo `1`) y simplificar más.
- `label_point` es un punto **dentro** del polígono, útil para pines y etiquetas.

### 4.8 `GET /ephemeris` *(nuevo en v1.2)*

Dirección del Sol y de la Tierra vistas desde el **centro** de la Luna, para iluminar el globo completo antes de elegir un sitio. Para la escena de un sitio usa `sun_vector_3d` y `earth_vector_3d` de `/evaluate`.

| Parámetro | Tipo | Requerido | Rango |
|---|---|---|---|
| `utc` | string ISO | sí | 1900 … 2050 |

```json
{
  "utc": "2026-12-01T00:00:00Z",
  "frame": "MOON_ME_DE421",
  "sun":   { "direction": [0.174687, -0.984289, -0.025668], "sub_lat_deg": -1.4708, "sub_lon_deg": 280.0638, "distance_km": 147553142.2 },
  "earth": { "direction": [0.992959, 0.11611, 0.023488],   "sub_lat_deg": 1.3459,  "sub_lon_deg": 6.6695,   "distance_km": 376517.1 }
}
```

- `direction`: vector unitario en el marco fijo lunar `MOON_ME`: **+X** hacia lat 0°/lon 0°, **+Z** al polo norte y **+Y** hacia lon 90° E.
- `sub_lat_deg`/`sub_lon_deg`: punto subsolar y subterrestre (lon Este 0–360).
- Usa solo SPICE: si faltan los kernels responde `503`; nunca inventa la posición del Sol.

### 4.9 `GET /terrain/tiles/{z}/{row}/{col}.png` *(nuevo en v1.3)*

Teselas de elevación de **toda la Luna** para el relieve del globo (`P-008`). Mismo esquema que Moon Trek y `GeographicTilingScheme` de Cesium: nivel `0` = 2 columnas × 1 fila, cada tesela abarca `180° / 2^z`, fila `0` al norte, columna `0` en `lon −180°`, `z` de `0` a `9`.

- **Formato:** PNG RGB de 256 × 256 en **Terrarium**: `elevation_m = R*256 + G + B/256 − 32768` (resolución 1/256 m), sobre la esfera de 1 737 400 m (la de `terrain/patch`). Se lee con `getImageData`; no uses PNG de 16 bits (el `<canvas>` lo trunca a 8).
- **Fuente:** DEM LOLA polar (40 m desde `z` 9, 80 m debajo) donde tiene datos; LOLA global (~474 m/px) en el resto. `X-Terrain-Source` lo dice y CORS la expone. Fuera del polo no hay más detalle desde `z ≈ 6`: no pidas más zoom ahí.
- **Caché:** `Cache-Control: public, max-age=3600` y `ETag` (`If-None-Match` → `304`).
- **Errores:** `422 ERR_INVALID_PAYLOAD` (índice fuera del esquema), `503 ERR_TERRAIN_UNAVAILABLE` (sin DEM). Ante cualquier error, usa tu relieve de respaldo.
- **Quién la pide:** en el globo, cómo llegan las teselas sin romper `docs/11` §1 ("el globo nunca llama a la API") se decide en `P-010`.

---

## 5. Flujo recomendado del front

1. Al cargar: `GET /health` (indicador de conexión) y `GET /sites` (lista).
2. Al elegir sitio, en paralelo:
   - `GET /terrain/patch?lat&lon&size_km=12&resolution=128` → malla 3D.
   - `POST /evaluate` → veredicto, horizonte, línea de tiempo y vectores Sol/Tierra.
   - `GET /psr/nearby?lat&lon&radius_km=25` → capa PSR.
3. Comparador: `POST /compare` con `include_timeline: true` si se van a dibujar las líneas de tiempo.
4. Globo o vista de todo el polo: `GET /psr` (paginado) y `GET /ephemeris?utc=` para la luz.

---

## 6. Límites que el front debe validar antes de enviar

Validarlos evita 422 innecesarios:
- `lat` entre -90 y 90; `lon` entre -180 y 360.
- Fechas entre 1900 y 2050.
- `resolution` solo 64, 128 o 256; `size_km` entre 2 y 40.
- `/compare`: de 2 a 5 escenarios y sin repetir la combinación (`lat`, `lon`, `start_utc`).
- `duration_days·24·60 / step_minutes` ≤ ~2000 puntos.

---

## 7. Sistemas de coordenadas (para renderizar con sentido)

### 7.1 Escena local de un sitio (Three.js)

Todo lo local (malla, `sun_vector_3d`, `earth_vector_3d`) comparte un marco: **+X = Este, +Y = Arriba (cenit), −Z = Norte (+Z = Sur)**, con origen en el centro del parche.

- **Malla:** muestra `i` → `fila = floor(i / N)`, `col = i % N`, con `N = resolution` y `half = size_km·1000/2`:
  - `x = −half + col·cell_size_m` (oeste → este)
  - `z = −half + fila·cell_size_m` (norte → sur)
  - `y = elevations_m[i] − center.elevation_m` (multiplica por la exageración vertical que quieras)
- `PlaneGeometry(size, size, N−1, N−1)` rotada `−90°` en X tiene exactamente ese orden de vértices: primero el norte, de oeste a este.
- **Luz del Sol:** `directionalLight.position = sun_vector_3d × distancia`, en el mismo marco que la malla. `sun_az_deg` se mide desde el Norte en sentido horario (0 = N, 90 = E).
- **Horizonte 2D:** grafica `horizon_profile[az].horizon_el_deg` contra `az_deg` y superpón `sun_el_deg` y `earth_el_deg` de `timeline` contra `sun_az_deg` y `earth_az_deg`.

### 7.2 Estereográfica polar sur (`polar_x_m`, `polar_y_m`, geometrías PSR)

La misma proyección que los productos LOLA de 80°S: radio 1,737,400 m, centro en el polo sur. **+Y apunta hacia lon 0°** y **+X hacia lon 90° E**.

```
ρ = 2·R·tan((90° + lat) / 2)
x = ρ·sin(lon)
y = ρ·cos(lon)
```

### 7.3 Pasar PSR (u otros puntos polares) a la escena local del parche

Con el centro del parche (`center.polar_x_m`, `center.polar_y_m`, `center.lon`):

```ts
// Metros polares -> escena local Three.js del parche (+X Este, +Y arriba, -Z Norte)
function polarToLocal(px: number, py: number, c: { polar_x_m: number; polar_y_m: number; lon: number }) {
  const lon = (c.lon * Math.PI) / 180
  const dx = px - c.polar_x_m
  const dy = py - c.polar_y_m
  const east = dx * Math.cos(lon) - dy * Math.sin(lon)
  const north = dx * Math.sin(lon) + dy * Math.cos(lon)
  return { x: east, z: -north } // la y se toma de la malla
}
```

El error de escala de la proyección es menor al 1 % al sur de -80°, despreciable a la escala de un parche.

---

## 8. Recetas de consumo (TypeScript)

### 8.1 Cliente con manejo de errores

```ts
const API = import.meta.env.VITE_API_BASE_URL as string

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) { super(message) }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, { ...init, headers: { 'content-type': 'application/json', ...init?.headers } })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const e = body?.error
    throw new ApiError(res.status, e?.code ?? 'ERR_HTTP', e?.message ?? res.statusText, e?.details)
  }
  return body as T
}
```

### 8.2 Malla de terreno

```ts
const p = await api<TerrainPatch>(`/terrain/patch?lat=${lat}&lon=${lon}&size_km=12&resolution=128`)
const N = p.grid.resolution
const size = p.grid.size_km * 1000
const geo = new THREE.PlaneGeometry(size, size, N - 1, N - 1)
geo.rotateX(-Math.PI / 2) // plano XZ: fila 0 = norte (-Z), col 0 = oeste (-X)
const pos = geo.attributes.position
for (let i = 0; i < pos.count; i++) pos.setY(i, (p.grid.elevations_m[i] - p.center.elevation_m) * verticalScale)
geo.computeVertexNormals()
```

### 8.3 Sol y Tierra en la escena

```ts
const t = evaluation.timeline[idx]
sunLight.position.set(...(t.sun_vector_3d.map((v) => v * 50_000) as [number, number, number]))
sunLight.intensity = t.sun_visible ? 1 : 0.05
earthMarker.position.set(...(t.earth_vector_3d.map((v) => v * 40_000) as [number, number, number]))
```

### 8.4 Catálogo PSR completo

```ts
async function allPsrs(minArea = 0) {
  const out = []
  for (let offset = 0; ; offset += 500) {
    const page = await api<PsrList>(`/psr?limit=500&offset=${offset}&min_area_km2=${minArea}`)
    out.push(...page.psrs)
    if (offset + page.count >= page.total) return out
  }
}
```

### 8.5 Detectar si la URL tiene las novedades v1.2

```ts
const hasV12 = patch.grid.source != null // null en backends anteriores a v1.2
// /psr y /ephemeris responden 404 (ERR_NOT_FOUND) si el backend no los tiene: oculta esas vistas
```

### 8.6 Relieve en Terrarium (teselas de §4.9)

```ts
// tilesBaseUrl sale de la configuración (VITE_API_BASE_URL o lo que acuerde P-010), nunca fija en el código.
async function fetchTerrainTile(tilesBaseUrl: string, z: number, row: number, col: number): Promise<Float32Array | null> {
  const res = await fetch(`${tilesBaseUrl}/terrain/tiles/${z}/${row}/${col}.png`)
  if (!res.ok) return null // usa el relieve de respaldo
  const bmp = await createImageBitmap(await res.blob(), { colorSpaceConversion: 'none', premultiplyAlpha: 'none' })
  const ctx = new OffscreenCanvas(256, 256).getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(bmp, 0, 0)
  const px = ctx.getImageData(0, 0, 256, 256).data
  const elev = new Float32Array(256 * 256) // fila 0 = norte, metros sobre 1 737 400 m
  for (let i = 0; i < elev.length; i++) elev[i] = px[4 * i] * 256 + px[4 * i + 1] + px[4 * i + 2] / 256 - 32768
  return elev // sin suavizado: los valores ya son alturas reales
}
```

---

## 9. Cambios respecto a v1.1

| Cambio | Tipo | Detalle |
|---|---|---|
| `GET /psr` | nuevo endpoint | Catálogo PSR paginado con `label_point` |
| `GET /ephemeris?utc=` | nuevo endpoint | Sol y Tierra desde el centro lunar (`MOON_ME_DE421`), responde la pregunta P-007 |
| `site.checks[]` en `/evaluate` y `/compare` | campo nuevo | Veredicto en códigos, nivel, valor, umbral y unidad; `message` en inglés |
| `include_timeline` en `/compare` | parámetro nuevo | Línea de tiempo por escenario (`timeline`, si no `null`) |
| `grid.source`, `grid.native_resolution_m` | campos nuevos | Origen y resolución real del terreno |
| Redondeo en `/terrain/patch` | formato | Elevación a 0.1 m, pendiente a 0.01° (respuesta ~3 veces más pequeña) |
| `Cache-Control: public, max-age=3600` | cabecera | En los `GET` de datos de referencia |
| Sitio IM-2 en el punto objetivo de LROC | datos | Responde P-009 (`db/init/20_im2_lroc_site.sql`) |

| `GET /terrain/tiles/{z}/{row}/{col}.png` | nuevo endpoint (**v1.3**) | Teselas Terrarium de toda la Luna para el globo, responde la pregunta P-008 (D-016) |

Sin cambios: rutas, nombres y tipos de v1.1, rangos de validación, sobre de errores y códigos `ERR_*`.

---

## 10. Pendientes conocidos (no bloquean el consumo)

- **URL efímera:** Producción es un *Quick Tunnel*. Hace falta un Named Tunnel con dominio propio para que no cambie (iniciativa `despliegue-ci-cd`).
- **Terreno fuera del Polo Sur** (Apollo, Chandrayaan-3, Chang'e 4): viene de LOLA global (~474 m/px). La malla es real pero suave, y la **pendiente se calcula a 474 m**, así que subestima riesgos a escala de un aterrizador: trata los `SLOPE_*` fuera del polo como orientativos. `grid.source = "lola_global"` lo indica. Al sur de -80° la resolución es de 40 m y el parche estándar (12 km, 128) no tiene interpolación.
- **IM-2:** la DB que usa el backend todavía tiene IM-2 en `-84.79, 31.2`. La corrección al punto objetivo de LROC (`-84.78, 29.13`, P-009) está en `db/init/20_im2_lroc_site.sql`, pero aún no se aplica en el servidor (~5.7 km de diferencia).
- **Contrato del front:** `contracts/openapi.json` del front todavía es v1.1. Regenerar los tipos (sección 1) para usar las novedades.
