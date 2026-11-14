# Guía de Arquitectura y Estructura Frontend — Lunar Landing Site Navigator

> [!NOTE]
> **Idea General / Propuesta Técnica de Referencia (No Vinculante):**
> Este documento representa una exploración conceptual de arquitectura para el cliente frontend.
> **NO** forma parte del plan formal de documentación ni del contrato vinculante del handoff (`docs/01`–`docs/10`).
> El equipo técnico tiene total libertad para adoptar, modificar o sustituir esta propuesta tecnológica según las necesidades de implementación.

## 1. Visión General y Stack Tecnológico
La aplicación es un sistema de control de misión (*Mission Control*) de página única (SPA) que opera a pantalla completa (`100vw x 100vh`) sin scroll vertical global. Combina paneles de telemetría en tiempo real con un motor de renderizado espacial 3D de alto rendimiento.

* **Core & Bundler:** React + TypeScript sobre Vite (recarga instantánea y manejo optimizado de módulos 3D).
* **Estilos y UI:** TailwindCSS + Lucide Icons (sistema de diseño oscuro de alto contraste).
* **Motor Gráfico 3D:** Three.js integrado mediante React Three Fiber (`@react-three/fiber`) y `@react-three/drei`.
* **Gestión de Estado Global:** Zustand (desacopla el bucle a 60 FPS del visor 3D para evitar re-renders innecesarios en el árbol de React).
* **Tipado de Datos:** Contratos de TypeScript derivados de la especificación OpenAPI / API Contract del backend.

---

## 2. Estructura de Directorios (Arquitectura Modular por Características)
Organización por dominios funcionales para permitir el trabajo en paralelo de 3 carriles sin conflictos de Git:

```text
src/
├── core/                                # Núcleo y lógica transversal agnóstica
│   ├── api/                             # Cliente HTTP y servicios de endpoint
│   │   ├── client.ts
│   │   ├── endpoints.ts
│   │   └── types.ts                     # DTOs y tipos del contrato
│   ├── store/                           # Store único de Zustand (Red vs Scrubber)
│   │   └── useMissionStore.ts
│   └── utils/                           # Funciones matemáticas puras
│       ├── coordinates.ts               # Conversión Polar <-> Cartesiano 3D
│       ├── metrics.ts                   # Deltas y comparativas de escenarios
│       └── time.ts                      # Formateo y utilidades UTC
│
├── features/                            # Módulos funcionales desacoplados
│   ├── layout/                          # Cascarón de aplicación (100vw x 100vh)
│   │   ├── TopNavbar.tsx                # Selector de modo e indicador de salud
│   │   └── SplitWorkspace.tsx           # Contenedor maestro 30% / 70%
│   ├── sidebar/                         # Panel de Control Izquierdo (30% ancho)
│   │   ├── SiteSelector.tsx             # Catálogo de sitios y coordenadas manuales
│   │   ├── DateConfigurator.tsx         # Selector UTC, duración y hardware
│   │   ├── VerdictBanner.tsx            # Semáforo GO / CAUTION / NO-GO
│   │   ├── TelemetryCards.tsx           # KPIs de Sol, Tierra, Topografía y Hielo
│   │   └── HorizonChart2D.tsx           # Silueta 2D 360° del relieve local
│   ├── viewport3d/                      # Visor Espacial 3D (70% ancho, 82% alto)
│   │   ├── LunarCanvas.tsx              # Canvas R3F y control de sombras
│   │   ├── TerrainMesh.tsx              # Malla LOLA 128x128 con elevaciones relativas
│   │   ├── CelestialBodies.tsx          # Luces y vectores dinámicos (Sol/Tierra)
│   │   ├── PsrOverlay.tsx               # Polígonos de regiones permanentemente sombreadas
│   │   ├── CameraController.tsx         # Modos Orbital, Lander POV y Mapa Polar
│   │   └── ViewportHUD.tsx              # Capas flotantes y exageración vertical
│   ├── timeline/                        # Dock Temporal Inferior (18% alto)
│   │   ├── TimelineScrubber.tsx         # Play/Pause, velocidad y cursor
│   │   └── GanttTracks.tsx              # Pistas de Luz, DTE y Ventana Óptima
│   └── comparator/                      # Matriz Comparativa de Escenarios
│       ├── CompareModal.tsx             # Drawer/Modal comparativo lado a lado
│       └── ScenarioColumn.tsx           # Columna por escenario con deltas y trofeos
│
├── App.tsx                              # Enrutamiento o renderizado condicional de vistas
└── main.tsx                             # Punto de entrada de React
```

---

## 3. Reglas de Flujo de Datos y Rendimiento (3 Velocidades)

| Capa | Frecuencia | Disparador | Comportamiento de Red / Memoria |
|---|---|---|---|
| **1. Configuración** | Baja | Modificación de inputs en UI | Solo actualiza parámetros en el store. No dispara cálculos pesados hasta confirmar. |
| **2. Datos Pesados (API)** | Media / Bajo demanda | Cambio de sitio o fecha | **Cambio de Sitio:** Consulta paralela a `/terrain/patch`, `/psr/nearby` y `/evaluate`.<br>**Solo Cambio de Fecha:** Solo consulta `/evaluate` (reutiliza la geometría cargada). |
| **3. Reproducción (60 FPS)** | Alta (Tiempo real) | Playback o arrastre del slider | **Cero llamadas de red.** Lee directamente `evaluation.timeline[currentStepIndex]` en memoria RAM. |

---

## 4. Directrices Técnicas para el Visor 3D

1. **Construcción del Terreno:**
   * La grilla de elevación $128 \times 128$ se centra en $(0, 0, 0)$ sustrayendo la altitud del centro para que el marcador del Lander descanse exactamente sobre el origen.
2. **Sistema de Coordenadas:**
   * `+X` = Este.
   * `+Y` = Elevación (Arriba).
   * `-Z` = Norte (`+Z` = Sur).
   * Los vectores unitarios `sun_vector_3d` y `earth_vector_3d` se escalan directamente por una distancia de proyección sin requerir conversiones trigonométricas adicionales.
3. **Oclusión Visual:**
   * Cuando `sun_visible === false`, la intensidad de la luz direccional se atenúa al mínimo y el vector se muestra punteado en rojo.
   * Comportamiento idéntico para `earth_visible === false` respecto al enlace DTE.

---

## 5. División de Trabajo en 3 Carriles Paralelos

* **Carril 1 — Core, Estado y Línea de Tiempo:**
  * Configuración base de Vite, cliente HTTP, Store de Zustand (`useMissionStore.ts`), `TopNavbar.tsx` y el dock temporal con `TimelineScrubber.tsx` y `GanttTracks.tsx`.
* **Carril 2 — Panel de Control (Sidebar) y Matriz Comparativa:**
  * Componentes de `src/features/sidebar/` y la vista de comparación `src/features/comparator/`.
* **Carril 3 — Escena Espacial 3D (Three.js):**
  * Componentes de `src/features/viewport3d/` (malla topográfica, vectores astronómicos, modos de cámara y shader de sombras).
