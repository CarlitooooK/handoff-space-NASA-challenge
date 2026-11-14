# Guía de Consumo API para Frontend — *Lunar Landing Site Navigator*

**Última actualización:** 2026-11-13  
**Backend:** FastAPI + PostgreSQL/PostGIS + LOLA DEM Multi-resolución (`40 m/px` Polo Sur + `80 m/px` + Global `64 ppd` `ldem_64.tif` `-90°..+90°`) + SPICE (`de440s.bsp` / `MOON_ME`)  
**CORS:** Habilitado abierto (`allow_origins=["*"]`) — puedes llamar directo desde `localhost` (`Vite`, `Next.js`, `CRA`) o producción sin proxy adicional.

---

## 1. URLs de Conexión y Cómo Revisar la Documentación

### 1.1 URL Base Pública (HTTPS — Sin Tailscale)
Usa esta URL para el desarrollo de todo el equipo (túnel HTTPS directo hacia `desktop`):

- **Base URL API v1:** `https://chart-owned-alabama-choices.trycloudflare.com/api/v1`
- **Respaldo por Tailscale (IP interna fija):** `http://100.66.139.125:8000/api/v1`

> **Nota sobre reinicios:** Como es un Cloudflare Quick Tunnel gratuito, si el servidor `desktop` se reinicia o apaga, el subdominio `*.trycloudflare.com` cambiará. En ese caso, en `desktop` basta correr:
> ```bash
> docker logs spaceapps-cloudflared 2>&1 | grep trycloudflare
> ```
> Por eso se recomienda definir la URL en tu `.env` (por ejemplo `.env.local`) y no dejarla fija en componentes:
> ```env
> # Vite
> VITE_API_BASE_URL=https://chart-owned-alabama-choices.trycloudflare.com/api/v1
>
> # Next.js
> NEXT_PUBLIC_API_BASE_URL=https://chart-owned-alabama-choices.trycloudflare.com/api/v1
> ```

### 1.2 Cómo Revisar y Probar la Documentación Interactiva

1. **Swagger UI (Recomendado para probar endpoints en vivo):**
   - Entra a **`https://chart-owned-alabama-choices.trycloudflare.com/docs`** *(si abres la raíz `https://chart-owned-alabama-choices.trycloudflare.com/` te redirige automáticamente aquí)*.
   - **Cómo usarlo:**
     1. Abre cualquier endpoint (ej. `GET /api/v1/sites` o `POST /api/v1/evaluate`).
     2. Haz clic en **"Try it out"**.
     3. Edita parámetros o JSON y presiona **"Execute"** para ver el `curl` exacto, el código HTTP y el JSON real de respuesta.
     4. En el selector **"Servers"** arriba de Swagger viene seleccionado `/` por defecto para que siempre dispare sobre el mismo dominio HTTPS actual sin errores de *Mixed Content* (aunque cambie la URL del túnel).
2. **ReDoc (Vista limpia para leer modelos y campos):**
   - **`https://chart-owned-alabama-choices.trycloudflare.com/redoc`**
3. **Esquema OpenAPI 3.1 JSON (para autogenerar tipos TypeScript):**
   - En vivo: **`https://chart-owned-alabama-choices.trycloudflare.com/openapi.json`**
   - Copia local en el repositorio: [contracts/openapi.json](contracts/openapi.json)
   - Generar tipos TS automáticamente:
     ```bash
     npx openapi-typescript https://chart-owned-alabama-choices.trycloudflare.com/openapi.json -o src/types/api.d.ts
     ```

---

## 2. Cliente `fetch` Base en TypeScript

```ts
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  "https://chart-owned-alabama-choices.trycloudflare.com/api/v1";

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(
      typeof err.detail === "string"
        ? err.detail
        : JSON.stringify(err.detail ?? err)
    );
  }
  return res.json() as Promise<T>;
}
```

---

## 3. Cómo Llamar Cada Endpoint (6 Endpoints)

### 3.1 `GET /api/v1/health` — Estado del Backend y Datasets
Úsalo al arrancar la app o en un indicador de estado si quieres confirmar conexión.

```ts
const health = await apiFetch("/health");
// health.status === "ok"
// health.database.landing_sites_count === 13
// health.database.psr_regions_count === 1531
```

---

### 3.2 `GET /api/v1/sites` — Catálogo Curado (Artemis III + CLPS + Apollo)
Devuelve los **13 sitios curados** (`10` del Polo Sur Artemis III/CLPS muestreados en `40 m/px` + `3` históricos globales Apollo: `apollo-11`, `apollo-15`, `apollo-17` sobre `ldem_64.tif` `-90°..+90°`) con sus coordenadas, altura LOLA (`m`), pendiente (`slope_deg`) y distancia al PSR más cercano (`nearest_psr_km`). Úsalo para llenar el menú selector y los marcadores en el mapa 2D/3D.

```ts
const data = await apiFetch<{
  count: number;
  sites: Array<{
    id: string;
    name: string;
    category: string;
    lat: number;
    lon: number;
    polar_x_m: number;
    polar_y_m: number;
    elevation_m: number | null;
    slope_deg: number | null;
    nearest_psr_km: number | null;
    description: string | null;
  }>;
}>("/sites");
```

---

### 3.3 `GET /api/v1/terrain/patch` — Malla 3D para Three.js
Extrae una grilla `N x N` centrada en `(lat, lon)` directamente desde los GeoTIFFs de NASA LOLA (no necesitas parsear `.tif` en el navegador).

**Query params:**
- `lat` (float, requerido, `-90..90`)
- `lon` (float, requerido, `-180..360` — el backend normaliza negativos a `0..360`)
- `size_km` (float, default `12.0`, rango `2.0..40.0`)
- `resolution` (int, default `128`, **solo `64`, `128` o `256`**; otro valor devuelve `422`)

```ts
const patch = await apiFetch<{
  center: {
    lat: number;
    lon: number;
    polar_x_m: number;
    polar_y_m: number;
    elevation_m: number;
    slope_deg: number;
  };
  grid: {
    size_km: number;
    resolution: 64 | 128 | 256;
    cell_size_m: number;
    min_elevation_m: number;
    max_elevation_m: number;
    elevations_m: number[]; // row-major, longitud resolution * resolution
    slopes_deg: number[];   // row-major, longitud resolution * resolution
  };
  nearby_psrs: Array<{
    gid: number;
    name: string | null;
    area_km2: number | null;
    distance_km: number;
  }>;
}>("/terrain/patch?lat=-89.66&lon=222.7&size_km=12&resolution=128");
```

#### Snippet directo para Three.js (`PlaneGeometry`)
El backend entrega `grid.elevations_m` en orden *row-major*: filas de **Norte (`-Z`) a Sur (`+Z`)** y columnas de **Oeste (`-X`) a Este (`+X`)**, que coincide **1:1** con `PlaneGeometry` rotado `-90°` en X:

```ts
import * as THREE from "three";

export function buildTerrainGeometry(
  patch: {
    center: { elevation_m: number };
    grid: { size_km: number; resolution: number; elevations_m: number[] };
  },
  verticalScale = 1.0
): THREE.PlaneGeometry {
  const { size_km, resolution, elevations_m } = patch.grid;
  const sizeMeters = size_km * 1000;

  const geometry = new THREE.PlaneGeometry(
    sizeMeters,
    sizeMeters,
    resolution - 1,
    resolution - 1
  );
  // Al rotar -PI/2 sobre X: +X = Este, +Y = Arriba, -Z = Norte, +Z = Sur
  geometry.rotateX(-Math.PI / 2);

  const pos = geometry.attributes.position;
  const baseElevation = patch.center.elevation_m;

  for (let i = 0; i < pos.count; i++) {
    // Centrar verticalmente en el punto de aterrizaje (y = 0 en el lander)
    pos.setY(i, (elevations_m[i] - baseElevation) * verticalScale);
  }

  pos.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}
```

---

### 3.4 `POST /api/v1/evaluate` — Evaluación Completa (Horizonte + Sol/Tierra + GO/NO-GO)
Endpoint principal del simulador. Calcula el horizonte topográfico `360°`, cruza la trayectoria del Sol y de la Tierra sin refracción atmosférica, estima generación eléctrica, ventanas *Direct-to-Earth* (DTE) y devuelve el semáforo `GO | CAUTION | NO-GO`.

**Body JSON:**
- `lat` (`-90..90`), `lon` (`-180..360`)
- `start_utc`: fecha ISO-8601 UTC (ej. `"2026-12-01T00:00:00Z"`)
- `duration_days`: default `14.0` (`0 < x <= 366`)
- `step_minutes`: default `60` (`5..1440`)
- `panel_efficiency`: default `0.28` (`0 < x <= 1`)
- `panel_area_m2`: default `4.0` (`0 < x <= 1000`)

```ts
const evalResult = await apiFetch<{
  site: {
    lat: number;
    lon: number;
    elevation_m: number;
    slope_deg: number;
    nearest_psr_km: number | null;
    status: "GO" | "CAUTION" | "NO-GO";
    reasons: string[];
  };
  summary: {
    sun_visible_pct: number;
    earth_visible_pct: number;
    max_continuous_sun_hours: number;
    max_continuous_dte_hours: number;
    next_sunset_utc: string | null;
    hours_to_next_sunset: number | null;
    next_earthset_utc: string | null;
    hours_to_next_earthset: number | null;
    avg_power_factor: number;
    estimated_peak_power_w: number;
  };
  horizon_profile: Array<{ az_deg: number; horizon_el_deg: number }>; // 360 pts
  timeline: Array<{
    timestamp_utc: string;
    sun_az_deg: number;
    sun_el_deg: number;
    sun_horizon_el_deg: number;
    sun_visible: boolean;
    sun_vector_3d: [number, number, number];   // [East, Up, South] unitario
    earth_az_deg: number;
    earth_el_deg: number;
    earth_horizon_el_deg: number;
    earth_visible: boolean;
    earth_vector_3d: [number, number, number]; // [East, Up, South] unitario
    power_factor: number;
  }>;
}>("/evaluate", {
  method: "POST",
  body: JSON.stringify({
    lat: -89.45,
    lon: 222.7,
    start_utc: "2026-12-01T00:00:00Z",
    duration_days: 14,
    step_minutes: 60,
    panel_efficiency: 0.28,
    panel_area_m2: 4.0,
  }),
});
```

#### Cómo animar el Sol y la Tierra en Three.js con el slider temporal
Cada elemento de `evalResult.timeline[idx]` ya trae `sun_vector_3d` y `earth_vector_3d` convertidos exactamente al mismo marco `[+X Este, +Y Arriba, -Z Norte]` que el terreno 3D:

```ts
const frame = evalResult.timeline[stepIndex];
const [sx, sy, sz] = frame.sun_vector_3d;
const [ex, ey, ez] = frame.earth_vector_3d;

// Luz direccional proyectando sombras reales de cráteres/crestas
sunDirectionalLight.position.set(sx * 25000, sy * 25000, sz * 25000);
sunDirectionalLight.intensity = frame.sun_visible ? 3.5 : 0.0;

// Posicionar esfera visual de la Tierra en el cielo lunar
earthMesh.position.set(ex * 40000, ey * 40000, ez * 40000);
earthMesh.visible = frame.earth_visible;
```

---

### 3.5 `POST /api/v1/compare` — Comparador de Escenarios (2 a 5)
Compara entre **2 y 5** sitios o distintas ventanas de fecha para un mismo sitio en una sola petición.

```ts
const comparison = await apiFetch<{
  results: Array<{
    label: string;
    site: {
      lat: number;
      lon: number;
      elevation_m: number;
      slope_deg: number;
      nearest_psr_km: number | null;
      status: "GO" | "CAUTION" | "NO-GO";
      reasons: string[];
    };
    summary: {
      sun_visible_pct: number;
      earth_visible_pct: number;
      max_continuous_sun_hours: number;
      max_continuous_dte_hours: number;
      next_sunset_utc: string | null;
      hours_to_next_sunset: number | null;
      next_earthset_utc: string | null;
      hours_to_next_earthset: number | null;
      avg_power_factor: number;
      estimated_peak_power_w: number;
    };
  }>;
}>("/compare", {
  method: "POST",
  body: JSON.stringify({
    scenarios: [
      {
        label: "Connecting Ridge (Dic 2026)",
        lat: -89.51,
        lon: 224.2,
        start_utc: "2026-12-01T00:00:00Z",
      },
      {
        label: "Malapert Massif (Dic 2026)",
        lat: -86.04,
        lon: 357.1,
        start_utc: "2026-12-01T00:00:00Z",
      },
    ],
    duration_days: 14.0,
    step_minutes: 120,
  }),
});
```

---

### 3.6 `GET /api/v1/psr/nearby` — Polígonos PSR (Agua-Hielo / Sombra Permanente)
Consulta PostGIS y devuelve polígonos `GeoJSON MultiPolygon` simplificados en **metros estereográficos polares sur (`polar_x_m`, `polar_y_m`)** dentro de un radio dado.

**Query params:**
- `lat`, `lon` (requeridos)
- `radius_km` (default `25.0`, rango `0 < x <= 300`)
- `limit` (default `50`, rango `1..200`)
- `simplify_m` (default `150.0`, rango `0..2000`)

```ts
const psrs = await apiFetch<{
  center: { lat: number; lon: number; polar_x_m: number; polar_y_m: number };
  radius_km: number;
  count: number;
  psrs: Array<{
    gid: number;
    name: string | null;
    area_km2: number | null;
    distance_km: number;
    geometry: {
      type: "MultiPolygon";
      coordinates: number[][][][]; // [poly][ring][point][x_m, y_m]
    };
  }>;
}>("/psr/nearby?lat=-89.66&lon=222.7&radius_km=25&limit=50&simplify_m=150");
```

---

## 4. Convención de Coordenadas y Errores Comunes

1. **Mapa 2D del Polo Sur (`polar_x_m`, `polar_y_m`):**
   - Origen `(0, 0)` = Polo Sur lunar (`-90°`).
   - `+X` = `90° E`, `+Y` = `0°` (meridiano hacia la Tierra). Si dibujas en `<svg>` o `<canvas>`, recuerda invertir `Y` (`screenY = cy - polar_y_m * scale`) para que el meridiano `0°` quede hacia arriba.
2. **Escena 3D local (`terrain/patch` + `sun_vector_3d` / `earth_vector_3d`):**
   - `+X` = Este, `+Y` = Elevación / Cenit, `-Z` = Norte (`+Z` = Sur).
   - 1 unidad del mundo 3D = **1 metro lunar real** (puedes escalar `y` por un factor visual como `2x` con un slider de *"Exageración de relieve"* si el usuario quiere acentuar pendientes).
3. **Códigos HTTP de error:**
   - `422 Unprocessable Entity`: parámetro inválido (por ejemplo `resolution=100` en lugar de `64|128|256`, o menos de 2 escenarios en `/compare`). `err.detail` trae el detalle exacto del campo.
   - `503 Service Unavailable`: base de datos o archivos DEM momentáneamente no disponibles.
