# Guía de Consumo API para Frontend — *Lunar Landing Site Navigator*

**Última actualización:** 2026-11-15 (contrato v1.5)  
**Backend:** FastAPI + PostgreSQL/PostGIS + LOLA DEM Multi-resolución (`40 m/px` Polo Sur + `80 m/px` + Global `64 ppd` `ldem_64.tif` `-90°..+90°`) + SPICE (`de440s.bsp` / `MOON_ME`)  
**CORS:** Habilitado abierto (`allow_origins=["*"]`) — puedes llamar directo desde `localhost` (`Vite`, `Next.js`, `CRA`) o producción sin proxy adicional.

---

## 1. URLs de Conexión y Cómo Revisar la Documentación

### 1.1 URL Base (`VITE_API_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL`)
Las URLs activas (URL pública HTTPS y mock local) y la versión del contrato que sirve cada una se mantienen como fuente única en [`docs/07-ambientes-y-pruebas.md`](docs/07-ambientes-y-pruebas.md) para evitar duplicar direcciones efímeras.

Define siempre la variable de entorno en `.env.local` tomando el valor vigente de [`docs/07-ambientes-y-pruebas.md`](docs/07-ambientes-y-pruebas.md):
```env
# Vite
VITE_API_BASE_URL=<URL_BASE_DESDE_DOCS_07>/api/v1

# Next.js
NEXT_PUBLIC_API_BASE_URL=<URL_BASE_DESDE_DOCS_07>/api/v1
```

### 1.2 Cómo Revisar y Probar la Documentación Interactiva

Con el host activo listado en [`docs/07-ambientes-y-pruebas.md`](docs/07-ambientes-y-pruebas.md):
1. **Swagger UI (Recomendado para probar endpoints en vivo):**
   - Entra a `<HOST_BACKEND>/docs` *(la raíz `<HOST_BACKEND>/` redirige automáticamente aquí)*.
   - **Cómo usarlo:**
     1. Abre cualquier endpoint (ej. `GET /api/v1/sites` o `POST /api/v1/evaluate`).
     2. Haz clic en **"Try it out"**.
     3. Edita parámetros o JSON y presiona **"Execute"** para ver el `curl` exacto, el código HTTP y el JSON real de respuesta.
     4. En el selector **"Servers"** arriba de Swagger viene seleccionado `/` por defecto para que siempre dispare sobre el mismo dominio actual sin errores de *Mixed Content*.
2. **ReDoc (Vista limpia para leer modelos y campos):**
   - `<HOST_BACKEND>/redoc`
3. **Esquema OpenAPI 3.1 JSON (para autogenerar tipos TypeScript):**
   - Copia local sincronizada en el repositorio: [`contracts/openapi.json`](contracts/openapi.json)
   - En vivo: `<HOST_BACKEND>/openapi.json`
   - Generar tipos TS automáticamente (vía `npx` para evitar conflictos con TypeScript 7 en Vite, ver `P-005`):
     ```bash
     npx openapi-typescript contracts/openapi.json -o src/types/api.d.ts
     ```

---

## 2. Cliente `fetch` Base en TypeScript

Tanto el backend en vivo como el servidor mock emiten el formato unificado `{ error: { code, message, details }, detail }` (`docs/06-contrato-y-errores.md`):

```ts
const API_BASE = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE) {
  throw new Error("Falta definir VITE_API_BASE_URL (ver docs/07-ambientes-y-pruebas.md)");
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown> | null
  ) {
    super(message);
  }
}

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
    const body = await res.json().catch(() => null);
    const code = body?.error?.code ?? "ERR_INVALID_PAYLOAD";
    const message =
      body?.error?.message ??
      (typeof body?.detail === "string" ? body.detail : res.statusText);
    throw new ApiError(res.status, code, message, body?.error?.details ?? null);
  }
  return res.json() as Promise<T>;
}
```

---

## 3. Cómo Llamar Cada Endpoint (11 Endpoints)

> **v1.2:** los campos y endpoints marcados *(v1.2)* son aditivos. La URL de Producción ya los sirve (ver [`docs/07-ambientes-y-pruebas.md`](docs/07-ambientes-y-pruebas.md)); trátalos como opcionales si todavía usas un mock anterior a v1.2. Flujo, límites y coordenadas de v1.2: [`docs/12-contrato-api-v1.2.md`](docs/12-contrato-api-v1.2.md).

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
    elevations_m: number[]; // row-major, longitud resolution * resolution (0.1 m)
    slopes_deg: number[];   // row-major, longitud resolution * resolution (0.01°)
    source?: "lola_polar" | "lola_global" | "synthetic"; // (v1.2)
    native_resolution_m?: number | null; // (v1.2) si cell_size_m es menor, el detalle es interpolado
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
    // (v1.2) Mismo veredicto como datos; decide por code/level, muestra message (inglés)
    checks?: Array<{
      code: "SLOPE_SAFE" | "SLOPE_MODERATE" | "SLOPE_CRITICAL" | "SUN_HIGH" | "SUN_LIMITED"
        | "SUN_CRITICAL" | "DTE_AVAILABLE" | "DTE_REDUCED" | "DTE_NONE";
      level: "ok" | "caution" | "nogo";
      value: number;
      threshold: number | null;
      unit: "deg" | "pct";
      message: string;
    }>;
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
    // (v1.4) estado en timeline[0] y primera salida (oculto -> visible) dentro de la ventana; null si no ocurre
    sun_visible_at_start?: boolean | null;
    earth_visible_at_start?: boolean | null;
    next_sunrise_utc?: string | null;
    hours_to_next_sunrise?: number | null;
    next_earthrise_utc?: string | null;
    hours_to_next_earthrise?: number | null;
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
      checks?: Array<{ code: string; level: "ok" | "caution" | "nogo"; value: number; threshold: number | null; unit: "deg" | "pct"; message: string }>; // (v1.2)
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
    // (v1.2) solo con include_timeline: true; mismos campos que timeline[] de /evaluate (3.4)
    timeline?: Array<{ timestamp_utc: string; sun_visible: boolean; earth_visible: boolean; power_factor: number }> | null;
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
    include_timeline: false, // (v1.2) true para dibujar las pistas de cada escenario
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

### 3.7 `GET /api/v1/psr` — Catálogo Completo de PSRs (v1.2)
Todas las PSRs una sola vez, en páginas, para vistas de todo el polo (el globo). Para un sitio usa `/psr/nearby`.

**Query params:** `simplify_m` (default `500`, `0..5000`), `limit` (default `500`, `1..500`), `offset` (default `0`), `min_area_km2` (default `0`).

```ts
type PsrPage = {
  total: number; offset: number; limit: number; count: number; simplify_m: number;
  psrs: Array<{
    gid: number;
    name: string | null;
    area_km2: number | null;
    label_point: { polar_x_m: number; polar_y_m: number; lat: number; lon: number }; // punto dentro del polígono
    geometry: { type: "Polygon" | "MultiPolygon"; coordinates: unknown }; // metros polares (D-012)
  }>;
};

async function loadAllPsrs(simplifyM = 500) {
  const all: PsrPage["psrs"] = [];
  for (let offset = 0, total = Infinity; offset < total; offset += 500) {
    const page = await apiFetch<PsrPage>(`/psr?offset=${offset}&limit=500&simplify_m=${simplifyM}`);
    total = page.total;
    all.push(...page.psrs);
  }
  return all;
}
```

---

### 3.8 `GET /api/v1/ephemeris` — Sol y Tierra desde el Centro de la Luna (v1.2)
Para el cielo de la vista global sin sitio (`P-007`). En la escena local sigue usando `timeline[i].sun_vector_3d` de `/evaluate`.

```ts
type EphemerisBody = {
  direction: [number, number, number]; // unitario en MOON_ME: +X lat0/lon0, +Y lon 90°E, +Z polo norte
  sub_lat_deg: number;
  sub_lon_deg: number; // 0..360 Este
  distance_km: number;
};
const eph = await apiFetch<{ utc: string; frame: string; sun: EphemerisBody; earth: EphemerisBody }>(
  `/ephemeris?utc=${encodeURIComponent("2026-12-01T00:00:00Z")}`,
);
// 503 ERR_UPSTREAM_SERVICE si el servidor no tiene SPICE: no dibujes el Sol (no hay respaldo aproximado).
```

### 3.9 Teselas de terreno del globo: `/terrain/tiles` (v1.3) y malla y sombreado (v1.5)
Solo para el **globo** (excepción acotada de D-019). La consola no las pide: le pasa al globo la URL base y el globo las pide directo, como las de Moon Trek. Contrato completo: [`contracts/lunar-landing-api-contract.md`](contracts/lunar-landing-api-contract.md) §2.9 a §2.11.

**La URL base no cambia.** Es la misma de D-019: `terrainTilesUrl = <VITE_API_BASE_URL>/terrain/tiles`, que la consola manda en `SET_CONFIG` (consola PR `#15`). Los tres productos cuelgan de ella; no hace falta otro mensaje ni otra variable de entorno.

| Qué | URL (relativa a `terrainTilesUrl`) | Formato | Niveles | Para |
|---|---|---|---|---|
| Elevación (v1.3) | `/{z}/{row}/{col}.png` | PNG Terrarium 256×256, centros de píxel | `z` 0–10 (v1.3: 0–9) | Leer alturas si hace falta procesarlas |
| **Malla (v1.5)** | `/heightmap/{z}/{row}/{col}.bin` | 65×65 `float32` LE, muestras **sobre** los bordes | `z` 0–12 | `CustomHeightmapTerrainProvider` **sin procesar** |
| **Sombreado (v1.5)** | `/hillshade/{z}/{row}/{col}.png?…` | PNG gris 256×256 (gris + alfa con `fade_*`) | `z` 0–10 | Capa de imágenes **sin procesar** |

Esquema de teselas: el de Moon Trek y `GeographicTilingScheme` de Cesium con `Ellipsoid.MOON` (nivel 0 = 2 columnas × 1 fila; `row` 0 al norte; `col` 0 en −180°). En Cesium, `{y}` es `row` y `{x}` es `col`.

**1. Detecta qué sirve el backend** (una vez, al recibir `terrainTilesUrl`):

```ts
// v1.5 si responde la malla de nivel 0; si no, v1.3 (Terrarium); si nada responde, Moon Trek.
async function terrainTilesVersion(base: string): Promise<'v1.5' | 'v1.3' | null> {
  const ok = async (u: string) => { try { return (await fetch(u)).ok } catch { return false } }
  if (await ok(`${base}/heightmap/0/0/0.bin`)) return 'v1.5'
  if (await ok(`${base}/0/0/0.png`)) return 'v1.3'
  return null
}
```

**2. Relieve con la malla** (v1.5): el arreglo va directo a Cesium. Más allá del nivel 12 interpola la malla del ancestro.

```ts
import { CustomHeightmapTerrainProvider, Ellipsoid, GeographicTilingScheme } from 'cesium'

const N = 65 // muestras por lado; la (i, j) está en lon = oeste + i·span/64, lat = norte − j·span/64
const MAX_Z = 12

async function fetchHeightmap(base: string, z: number, row: number, col: number): Promise<Float32Array | null> {
  const res = await fetch(`${base}/heightmap/${z}/${row}/${col}.bin`) // gzip lo descomprime el navegador
  if (!res.ok) return null // 404/422 definitivos; 5xx o red: reintenta con espera
  const a = new Float32Array(await res.arrayBuffer())
  return a.length === N * N ? a : null
}

export function createApiTerrain(base: string) {
  return new CustomHeightmapTerrainProvider({
    width: N,
    height: N,
    tilingScheme: new GeographicTilingScheme({ ellipsoid: Ellipsoid.MOON }),
    callback: async (x, y, level) => {
      const z = Math.min(level, MAX_Z)
      const shift = level - z
      const hm = await fetchHeightmap(base, z, y >> shift, x >> shift) // cachea por URL para no repetir
      if (!hm) return new Float32Array(N * N) // sin datos: plano
      if (shift === 0) return new Float32Array(hm) // copia: Cesium se queda con el arreglo
      const span = 2 ** shift
      const out = new Float32Array(N * N)
      for (let j = 0; j < N; j++) {
        const v = ((y + j / (N - 1)) / span - (y >> shift)) * (N - 1)
        const j0 = Math.min(N - 2, Math.floor(v)), fy = v - j0
        for (let i = 0; i < N; i++) {
          const u = ((x + i / (N - 1)) / span - (x >> shift)) * (N - 1)
          const i0 = Math.min(N - 2, Math.floor(u)), fx = u - i0
          const top = hm[j0 * N + i0] * (1 - fx) + hm[j0 * N + i0 + 1] * fx
          const bot = hm[(j0 + 1) * N + i0] * (1 - fx) + hm[(j0 + 1) * N + i0 + 1] * fx
          out[j * N + i] = top * (1 - fy) + bot * fy
        }
      }
      return out
    },
  })
}
```

**3. Polo sombreado** (v1.5): una capa de imágenes normal; el navegador no calcula nada.

```ts
import { GeographicTilingScheme, Ellipsoid, Rectangle, UrlTemplateImageryProvider } from 'cesium'

const shade = new UrlTemplateImageryProvider({
  // Mismos valores que usaba el globo: exageración 1.6, se funde con el mosaico entre −83° y −85°
  url: `${base}/hillshade/{z}/{y}/{x}.png?exaggeration=1.6&fade_start_lat=-83&fade_end_lat=-85`,
  tilingScheme: new GeographicTilingScheme({ ellipsoid: Ellipsoid.MOON }),
  rectangle: Rectangle.fromDegrees(-180, -90, 180, -83),
  maximumLevel: 10,
  tileWidth: 256,
  tileHeight: 256,
})
const layer = viewer.imageryLayers.addImageryProvider(shade)
// El estilo es del cliente: layer.brightness, layer.contrast, layer.gamma (el backend da cos(incidencia) lineal)
```

**Qué tener en cuenta:**
- **Luz del sombreado:** fija e ilustrativa (`light_lon`, `light_lat`: dónde cae a plomo; por defecto 135° E, 22° S). No es el Sol de la simulación y no hay sombras proyectadas: rotúlalo como relieve sombreado.
- **Parámetros:** se redondean a 0.01; usa siempre los mismos valores para aprovechar la caché. Fuera de rango, o un solo `fade_*`, da `422 ERR_INVALID_PAYLOAD`.
- **Cabeceras** (legibles por CORS): `X-Terrain-Source` (DEM usado) y `X-Terrain-Resolution-M` (cada cuántos metros hay un dato real; si es mayor que el píxel, el detalle extra es interpolado). Fuera del polo el DEM global (118 m) no da más detalle desde `z ≈ 8`.
- **Caché HTTP:** `Cache-Control: public, max-age=3600` y `ETag` (`304` con `If-None-Match`); el navegador lo hace solo. La malla con gzip lleva su propia `ETag` (termina en `-gz"`).
- **Errores:** `422` (índice o parámetro fuera de rango) y `503 ERR_TERRAIN_UNAVAILABLE` son definitivos para esa tesela: usa el respaldo (relieve plano o el mosaico de debajo). Ante errores de red o `5xx`, reintenta con espera y **no** guardes el fallo en caché.
- **Concurrencia:** limita las peticiones en vuelo (el globo usa 6 para `fetch` propios); `UrlTemplateImageryProvider` ya pasa por el `RequestScheduler` de Cesium.
- **Primera carga:** las teselas de `z` 0 a 2 tardan varios segundos la primera vez después de cada despliegue del backend (lectura del DEM global); luego quedan en caché. Ya pasaba con `/terrain/tiles` y se está optimizando.
- **Mock local:** `mock/` sirve las tres rutas con relieve sintético (`X-Terrain-Source: synthetic`).

> **Caché (v1.2):** `sites`, `terrain/patch`, `psr`, `psr/nearby`, `ephemeris` y `terrain/tiles` (con `heightmap` y `hillshade`) responden con `Cache-Control: public, max-age=3600`; el navegador las reutiliza sin código extra.

---

## 4. Convención de Coordenadas y Errores Comunes

1. **Mapa 2D del Polo Sur (`polar_x_m`, `polar_y_m`):**
   - Origen `(0, 0)` = Polo Sur lunar (`-90°`).
   - `+X` = `90° E`, `+Y` = `0°` (meridiano hacia la Tierra). Si dibujas en `<svg>` o `<canvas>`, recuerda invertir `Y` (`screenY = cy - polar_y_m * scale`) para que el meridiano `0°` quede hacia arriba.
2. **Escena 3D local (`terrain/patch` + `sun_vector_3d` / `earth_vector_3d`):**
   - `+X` = Este, `+Y` = Elevación / Cenit, `-Z` = Norte (`+Z` = Sur).
   - 1 unidad del mundo 3D = **1 metro lunar real** (puedes escalar `y` por un factor visual como `2x` con un slider de *"Exageración de relieve"* si el usuario quiere acentuar pendientes).
3. **Códigos de error unificados (`docs/06-contrato-y-errores.md`):**
   - `400 Bad Request` (`ERR_INVALID_PAYLOAD`): JSON malformado o campo obligatorio faltante.
   - `422 Unprocessable Entity`: validación o regla de dominio inválida (`ERR_INVALID_COORDINATES`, `ERR_DATE_OUT_OF_RANGE`, `ERR_SCENARIO_LIMIT_EXCEEDED`, `ERR_DUPLICATE_SCENARIOS`, `ERR_INVALID_PAYLOAD`). La respuesta incluye `error.code`, `error.message` y `error.details` (además de `detail` para compatibilidad).
   - `503 Service Unavailable` (`ERR_TERRAIN_UNAVAILABLE` / `ERR_UPSTREAM_SERVICE`): base de datos, kernels SPICE o archivos DEM momentáneamente no disponibles.
