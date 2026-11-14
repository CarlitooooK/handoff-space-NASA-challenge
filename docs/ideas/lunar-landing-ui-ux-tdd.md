# Documento de Diseño Técnico UI/UX (TDD) — Lunar Landing Site Navigator

> [!NOTE]
> **Idea General / Propuesta Técnica de Referencia (No Vinculante):**
> Este documento representa una exploración conceptual de diseño visual, interfaz y experiencia de usuario.
> **NO** forma parte del plan formal de documentación ni del contrato vinculante del handoff (`docs/01`–`docs/10`).
> El diseñador o desarrollador frontend puede tomarlo como inspiración o diseñar libremente la interfaz según el criterio del equipo.

**Versión:** 1.0  
**Arquitectura Visual:** Split-Screen Mission Control (30% Panel de Control / 70% Viewport Espacial + Timeline)  
**Stack Sugerido:** React (Vite / Next.js) + TailwindCSS + Three.js (`@react-three/fiber` / `@react-three/drei`) + Zustand (Estado Global)

---

## 1. Filosofía de Diseño y Sistema Visual

El objetivo de la interfaz es eliminar la fricción cognitiva de herramientas científicas complejas (como *Quickmap* o *JPL Horizons*). El usuario debe poder responder en **menos de 3 segundos** si un sitio y fecha de aterrizaje son operativamente viables (`GO / CAUTION / NO-GO`).

### 1.1 Paleta de Colores (Tema "Deep Space Mission Control")
* **Fondo Principal (Canvas / Sidebar):** `#090D16` (Espacio profundo, alto contraste contra fatiga visual).
* **Superficies / Tarjetas (Glassmorphism):** `rgba(17, 24, 39, 0.78)` con `backdrop-filter: blur(12px)` y borde `#1F2937`.
* **Semántica Astronómica y Operativa (Consistente en 2D, 3D y Timeline):**
  * **Sol / Energía Solar:** `#F59E0B` (Ámbar / Dorado brillante).
  * **Tierra / Comunicación DTE:** `#38BDF8` (Cian / Azul celeste).
  * **Regiones Sombreadas (PSR / Hielo):** `#818CF8` (Índigo translúcido al 35% de opacidad).
  * **Estado `GO`:** `#10B981` (Verde esmeralda).
  * **Estado `CAUTION`:** `#F59E0B` (Ámbar).
  * **Estado `NO-GO` / Eclipse / Bloqueo Topográfico:** `#EF4444` (Rojo coral).

### 1.2 Tipografía
* **Títulos y Etiquetas UI:** `Inter` o `Plus Jakarta Sans` (alta legibilidad en tamaños reducidos).
* **Telemetría, Coordenadas y Cronómetros:** `JetBrains Mono` o `Fira Code` (con `font-variant-numeric: tabular-nums` obligatorio para evitar jitter al mover el slider de tiempo).

---

## 2. Arquitectura de Layout (Wireframe Estructural)

La aplicación ocupa `100vw x 100vh` sin scroll global (`overflow: hidden`). Se distribuye en dos columnas maestras y un dock temporal inferior:

```text
+-----------------------------------------------------------------------------------+
| [Logo] LUNAR NAVIGATOR        [Modo: Exploración | Comparador (2)]   [API: OK 🟢] | <- Topbar (48px)
+------------------------+----------------------------------------------------------+
| PANEL IZQUIERDO (30%)  | PANEL DERECHO SUPERIOR: VIEWPORT ESPACIAL 3D (70% ancho) |
| (Scroll interno)       | (82% altura del contenedor derecho)                      |
|                        |                                                          |
| 1. Selector de Sitio   |   [Cámara: Orbital | Lander POV | Mapa Polar 2D]         |
|    - Catálogo / Custom |   [Capas: [x] PSR Hielo  [x] Vectores  [ ] Pendientes]   |
|                        |                                                          |
| 2. Ventana de Misión   |                     * (Sol)                              |
|    - Fecha UTC Inicio  |                      \                                   |
|    - Duración (14d)    |                       \  [Tierra o]                      |
|                        |                        v   /                             |
| 3. Semáforo Operativo  |              /\  /\   [📍 Lander]  /\                    |
|    [ STATUS: GO ]      |        _____/  \/  \______/______/  \_____               |
|    - Razones técnicas  |       (Malla 3D LOLA 12x12 km con sombras reales)        |
|                        |                                                          |
| 4. Tarjetas Telemetría +----------------------------------------------------------+
|    - Energía Solar     | PANEL DERECHO INFERIOR: TIMELINE SCRUBBER (18% altura)   |
|    - Comunicación DTE  | [▶ Play] [1x]  2026-12-04 14:00 UTC                      |
|    - Terreno y Hielo   | SOL (Luz):   [████████████░░░░░█████████████████]        |
|                        | TIERRA (DTE):[████████░░░░░░░░░░░░██████████████]        |
| 5. Perfil Horizonte    | ÓPTIMO:      [████████░░░░░░░░░░░░██████████████]        |
|    (Mini gráfica 360°) |              |-------▲--------------------------|        |
|                        |                     Cursor Temporal (Slider)             |
| [+ Añadir a Comparar]  |                                                          |
+------------------------+----------------------------------------------------------+
```

---

## 3. Especificación de Componentes por Panel

### 3.1 Panel Izquierdo (30% Ancho) — Mission Control Sidebar
Centro de mando parametrizable. Cualquier cambio en los inputs dispara la actualización de las métricas y el visor 3D.

#### Bloque A: Selección de Sitio de Aterrizaje
* **Dropdown de Sitios Curados:** Consume `GET /api/v1/sites`. Muestra nombre (`Shackleton Rim`), categoría (`Artemis III / CLPS`) y pendiente (`6.4°`).
* **Modo Coordenada Manual / Aleatoria:** Inputs numéricos para Latitud (`-90.0°` a `-80.0°`) y Longitud (`0°` a `360°`), más botón *"🎲 Punto Estratégico Aleatorio"* y soporte para hacer clic directo sobre la malla 3D para posicionar el pin.

#### Bloque B: Configuración Temporal y Hardware
* **Date & Time Picker (UTC):** Define `start_utc` (ej. `2026-12-01T00:00:00Z`).
* **Selector de Duración:** Chips de selección rápida de 7 días, 14 días (1 medio día lunar) o 29.5 días (1 ciclo lunar completo).
* **Acordeón de Hardware (Opcional):** Área de paneles solares ($m^2$, default: `4.0`) y Eficiencia (default: `28%`).
* **Botón Primario ("Evaluar Misión"):** Dispara en paralelo `POST /api/v1/evaluate` y `GET /api/v1/terrain/patch`.

#### Bloque C: Tarjeta de Veredicto (GO / CAUTION / NO-GO)
* Consume `evalResult.site.status` y `evalResult.site.reasons[]`.
* Badge visual de alto contraste con lista de justificaciones técnicas (ej. `✓ Pendiente segura (6.4° <= 10°)`, `✓ Iluminación solar alta (82.1%)`).

#### Bloque D: Tarjetas de Telemetría Crítica (Grid 2x2 + Instantáneo)
* **Tarjeta Solar (Ámbar):**
  * *Estado actual:* Elevación, Azimut y badge `ILUMINADO` / `ECLIPSADO POR CRÁTER`.
  * *Resumen ventana:* `% Luz Total` y `Pico Potencia (W)`.
  * *Cronómetro crítico:* `⏳ Tiempo hasta el atardecer: X hrs` (`summary.hours_to_next_sunset`).
* **Tarjeta Tierra / DTE (Cian):**
  * *Estado actual:* Elevación y badge `CONECTADO (DTE)` / `SIN SEÑAL (BLOQUEADO)`.
  * *Resumen ventana:* `% Visibilidad Tierra`.
  * *Cronómetro crítico:* `⏳ Tiempo hasta pérdida de señal: X hrs` (`summary.hours_to_next_earthset`).
* **Tarjeta Topografía y Ciencia (Gris / Índigo):**
  * Altitud, Pendiente local y distancia a PSR más cercana (`nearest_psr_km`).

#### Bloque E: Mini-Gráfica de Horizonte Local 360° (2D)
* Representa el arreglo `horizon_profile` ($0^\circ$ a $359^\circ$) como una silueta montañosa.
* Superpone el vector del Sol (`sun_az_deg`, `sun_el_deg`) y de la Tierra (`earth_az_deg`, `earth_el_deg`) actualizados sincrónicamente con el slider de tiempo para identificar qué elevación bloquea la línea de visión.

---

### 3.2 Panel Derecho Superior (70% Ancho, 82% Alto) — Visor Espacial 3D Interactivo
Renderizado en Three.js con enfoque en eficiencia de GPU (renderiza un parche local de alta precisión sin sobrecarga de geometría global).

#### Elementos de la Escena 3D
* **Terreno Lunar (`TerrainMesh`):** `PlaneGeometry` generado a partir de `grid.elevations_m` ($128 \times 128$). Incluye control de *Exageración Vertical* ($1\times$ a $3\times$).
* **Pin de Aterrizaje (`LanderMarker`):** Posicionado en el origen $(0, 0, 0)$ con marcador visual cónico/antena.
* **Cúpula Celeste y Vectores (`SkyVectors`):**
  * **Vector Solar:** Línea luminosa amarilla desde $(0, 0, 0)$ hacia `sun_vector_3d`. En el extremo ($R = 25{,}000\text{ m}$) se ubica un `DirectionalLight` (`castShadow = true`) y un sprite solar. Si `sun_visible === false`, se renderiza punteada en rojo para evidenciar la oclusión orográfica.
  * **Vector Terrestre:** Línea cian hacia `earth_vector_3d`. En el extremo ($R = 40{,}000\text{ m}$) se renderiza una esfera con textura terrestre (ilustrando visualmente la libración lunar al mover el tiempo).
* **Capa de Regiones Sombreadas (`PSROverlay`):** Consume `GET /api/v1/psr/nearby` y proyecta polígonos semitransparentes azul/índigo sobre el relieve.

#### Modos de Cámara (HUD Flotante)
1. **Vista Orbital Libre (Default):** `OrbitControls` enfocado en el punto de aterrizaje para rotación libre y análisis de sombras.
2. **Vista Lander POV (1ra Persona):** Cámara en $(0, 2, 0)$ ($2\text{ m}$ sobre el suelo). Rotación $360^\circ$ simulando la perspectiva de astronauta o rover frente al horizonte.
3. **Vista Cenital / Top-Down:** Cámara ortográfica nadir con mapa de calor de pendientes (`slopes_deg`: verde $<5^\circ$, amarillo $5^\circ\text{–}10^\circ$, rojo $>10^\circ$).

#### Interacción Directa (Click-to-Evaluate)
* Soporte para `Shift + Click` sobre la malla 3D vía `Raycaster`, convirtiendo coordenadas locales $(x, z)$ a $(\text{lat}, \text{lon})$ con botón emergente para reevaluar aterrizaje en dicho vértice.

---

### 3.3 Panel Derecho Inferior (70% Ancho, 18% Alto) — Timeline Scrubber & Animación
Control temporal desacoplado de llamadas de red: itera únicamente sobre el arreglo `evalResult.timeline[]` en memoria.

* **Controles de Reproducción:**
  * Play / Pause: Avance secuencial de `stepIndex++` cada 100 ms.
  * Selector de velocidad: $1\times$ (1 h/frame), $4\times$, $12\times$.
  * Indicador UTC actual: `timeline[stepIndex].timestamp_utc` con formato *"Día +X, Hora Y"*.
* **Barras de Disponibilidad (Gantt Operativo):**
  * **Pista 1 — Sol (`sun_visible`):** Bloques ámbar (iluminado) vs gris oscuro (noche/sombra).
  * **Pista 2 — Tierra (`earth_visible`):** Bloques cian (visibilidad DTE) vs gris oscuro (pérdida de señal).
  * **Pista 3 — Ventana Óptima:** Bloques verde esmeralda donde coinciden energía y comunicación simultáneas (`sun_visible && earth_visible`).

---

## 4. Modo Comparación de Escenarios

Permite evaluar rápidamente sitios alternativos o evaluar el impacto de retrasos de lanzamiento (`POST /api/v1/compare`).

### 4.1 Flujo de Usuario
1. El usuario evalúa el *Escenario A* (ej. Shackleton Rim — 1 de Diciembre) y pulsa `+ Fijar Escenario A`.
2. Modifica la fecha al 15 de Diciembre o selecciona otra coordenada (ej. Malapert Massif).
3. Pulsa `Comparar Escenarios`, abriendo el modal comparativo.

### 4.2 Matriz Visual de Comparación

| Métrica Clave | Escenario A: Shackleton (1 Dic) | Escenario B: Retraso (15 Dic) | Delta / Impacto |
|---|---|---|---|
| **Veredicto Operativo** | 🟢 `GO` | 🔴 `NO-GO` | **Crítico** |
| **% Iluminación Solar** | 82.1% 🏆 | 31.4% | -50.7% energía |
| **% Visibilidad Tierra (DTE)** | 64.3% | 71.0% 🏆 | +6.7% ventana DTE |
| **Horas continuas de Sol** | 196 hrs 🏆 | 48 hrs | -148 hrs de ventana |
| **Pendiente del Terreno** | 6.4° (Segura) | 6.4° (Segura) | Sin cambio |

---

## 5. Arquitectura de Estado y Rendimiento (Frontend)

Para garantizar **60 FPS constantes** sin cuellos de botella de red, el estado global (`useMissionStore`) separa el ciclo de vida asíncrono del ciclo de interacción en tiempo real:

```typescript
interface MissionStore {
  // 1. Parámetros de Selección (Disparan peticiones de red al confirmar)
  selectedSiteCoords: { lat: number; lon: number; name: string };
  missionParams: { startUtc: string; durationDays: number; stepMinutes: number };

  // 2. Caché de Respuestas de API (Inmutables salvo reevaluación)
  sitesCatalog: LandingSite[];
  terrainPatch: TerrainPatchResponse | null;
  evaluation: EvaluateResponse | null;
  nearbyPsrs: PSRNearbyResponse | null;
  comparisonResults: CompareResponse | null;

  // 3. Estado de Interacción Local (60 FPS síncrono, 0ms latencia, 0 llamadas HTTP)
  currentStepIndex: number; // Índice en evaluation.timeline
  isPlaying: boolean;
  playbackSpeed: 1 | 4 | 12;
  cameraMode: "orbital" | "pov" | "topdown";
  verticalExaggeration: number; // 1.0 a 3.0
  showSlopeHeatmap: boolean;
  showPsrOverlay: boolean;
}
```

### Reglas de Oro de Rendimiento:
1. **Cambio de Sitio (`lat`, `lon`):** Invoca `GET /terrain/patch`, `GET /psr/nearby` y `POST /evaluate`. Reconstruye `PlaneGeometry` una sola vez.
2. **Cambio de Fecha (`start_utc`):** Invoca únicamente `POST /evaluate`. Reutiliza la malla topográfica ya cargada.
3. **Scrubbing de Tiempo (`currentStepIndex`):** **Cero llamadas HTTP.** Actualiza directamente las posiciones de luces y matrices de Three.js en el loop de animación (`useFrame`).

---

## 6. Estructura de Directorios Recomendada

```text
src/
├── api/
│   ├── client.ts                # Fetch wrapper y configuración de endpoints
│   └── endpoints.ts             # getSites, getTerrainPatch, evaluateSite, compareScenarios
├── store/
│   └── useMissionStore.ts       # Store de Zustand (Red vs Slider)
├── components/
│   ├── layout/
│   │   ├── TopNavbar.tsx        # Navegación y health indicator
│   │   └── SplitWorkspace.tsx   # Contenedor 30/70
│   ├── sidebar/                 # Panel Izquierdo (30%)
│   │   ├── SiteSelector.tsx     # Selector y coordenadas manuales
│   │   ├── DateConfigurator.tsx # Fechas UTC y presets de duración
│   │   ├── VerdictBanner.tsx    # Semáforo GO / NO-GO y argumentos
│   │   ├── TelemetryCards.tsx   # Métricas instantáneas y cronómetros
│   │   └── HorizonChart2D.tsx   # Silueta 360° del relieve local
│   ├── viewport3d/              # Viewport Espacial (Three.js)
│   │   ├── LunarCanvas.tsx      # Canvas principal y luces ambientales
│   │   ├── TerrainMesh.tsx      # PlaneGeometry + shaders de pendiente
│   │   ├── CelestialBodies.tsx  # Sol direccional, esfera terrestre y vectores
│   │   ├── PsrPolygons3D.tsx    # Proyección de zonas de hielo
│   │   └── ViewportHUD.tsx      # Controles de cámara y capas
│   ├── timeline/                # Dock Inferior (18% altura)
│   │   └── TimelineScrubber.tsx # Playhead, scrubber y pistas Gantt
│   └── compare/
│       └── CompareModal.tsx     # Matriz comparativa de escenarios
└── types/
    └── api.d.ts                 # Tipos TypeScript de contrato de datos
```

---

## 7. Plan de Ejecución para el Equipo (Carriles de Desarrollo)

* **Carril 1 (UI & Dashboard):** Trabaja de forma aislada en `src/components/sidebar/` y `src/components/compare/`.
* **Carril 2 (Three.js & Gráficos 3D):** Trabaja en `src/components/viewport3d/` implementando la malla y el movimiento de luces según vectores.
* **Carril 3 (Estado y Timeline):** Implementa `useMissionStore.ts`, `TimelineScrubber.tsx` y la sincronización a 60 FPS.
