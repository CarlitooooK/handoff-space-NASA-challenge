# Globo lunar — Historial

Cronología, de lo más nuevo a lo más viejo. Fechas absolutas. No se borra: se agrega.

## 2026-11-14
- PR #4 de la consola fusionado (`a000db2`). Se añadió `docs/11` §10, la guía de conexión para Frontend (dónde está cada archivo, cómo probarlo, reglas al extender, problemas conocidos y pendientes opcionales).
- PR #4 abierto en la consola (`feat/globe-bridge` → `main`) con el puente y la escena de alunizaje.
- Rama `feat/globe-bridge` de la consola subida a `origin` (`b8551d4`). Sin PR todavía. Los dos archivos modificados localmente en esa copia (`.gitignore`, `.handoff-last-sync`) no son de esta iniciativa y no se incluyeron.
- Puente construido en la consola (rama `feat/globe-bridge`, commit local `b8551d4`, sin subir): `globeProtocol.ts`, `globeBridge.ts` (9 pruebas), `useGlobeBridge.ts`, `useGlobeStore`, botón "Landing scene"/"Exit scene". Probado de extremo a extremo (consola en `:5175`, globo en `:5174`, API en vivo): enlace `ready`, evaluación real de IM-2 Mons Mouton (`GO`, Sol 6,46°), escena `arrival > descent > done`, scrubber en plena escena sin romper nada, "Exit scene" vuelve al sitio. Con el globo caído, a los 8 s el fondo vuelve al placeholder y la consola sigue viva.
- Decisión de diseño al integrar: `SITE_CLICKED` y `GLOBE_CLICKED` solo seleccionan; no evalúan (como el selector). `docs/11` lo refleja.
- Escena configurable desde la consola (`9d5076a` del repo del globo): validación de opciones (`lat`, `lon`, `startAltM`, `durationS`, `distanceM`, `headingDeg`) y de todos los mensajes del puente, `SCENE_ERROR`, y la luz de escena ya no se pisa si llega un `SET_SUN_LOCAL` en plena escena. Probado con el globo en un iframe y mensajes por `postMessage` desde `http://localhost:5173`.
- Escena de alunizaje (`2a7cac3` del repo del globo), a pedido de Carlo: la fase 3 se veía confusa (arco de 100 km visto desde arriba, módulo diminuto). Ahora es una secuencia continua en plano horizontal, desde la vista global hasta el astronauta; `PLAY_LANDING_SCENE`, `SCENE_PHASE`, `SCENE_TELEMETRY`. Se añadió textura procedural de regolito.
- Errores encontrados al construirla (ver `CONOCIMIENTO.md`): `minimumLevel` en una capa global bloquea Cesium; longitudes 0–360 devuelven altura 0 en `sampleTerrain`; la cámara quedaba bajo el terreno dibujado.
- Fase 3 en el globo (`6ba649f` del repo del globo): módulo de aterrizaje con columna de motor y astronauta, con modelos de NASA 3D Resources (Apollo LM y Astronaut, 1,4 MB); `SET_VEHICLES` y `VIEW_VEHICLE`. Se descartó el SLS: solo existe como `.7z` de 14 a 70 MB.
- Relieve y polo (`005e037` del repo del globo): terreno global desde el DEM de LOLA de Moon Trek, calibrado contra `terrain/patch` (24 puntos, R² 0,997, RMSE 127 m); capa polar reproyectada que reduce el abanico; `SET_VIEW`. Se abrió `P-008` (teselas de terreno del polo).
- Fase 2 en el globo (`cdc92ee` del repo del globo): estrellas, Sol y Tierra a tamaño angular real, capa PSR, seguimiento de descenso, vista desde superficie, indicador de carga. Se abrió `P-007` (cielo en la vista global).
- Se escribió `docs/11-integracion-globo-consola.md` (reparto de responsabilidades y mapa store→mensajes) y se abrió `P-006` para que Frontend lo confirme. Se trajo el PR #1 del Figma (`docs/ideas/console-ui-figma.md`).
- El código del globo se subió a su propio repo [`luna-render-nasa-space-challenge`](https://github.com/CarlitooooK/luna-render-nasa-space-challenge) (`98ecf5a`, `main`) y se registró en este handoff.
- Se revisó el prototipo previo (Three.js) en `lunar-globe-renderer`: no compilaba, textura 1K, postMessage sin implementar.
- Se evaluaron las fuentes de teselas de Moon Trek y se decidió CesiumJS (D-011 en `docs/09-decisiones.md`).
- Se reescribió el renderer: `LunarGlobe` (clase sin framework), capas WAC/LOLA, pines por estado, fly-to, rejilla, arco de descenso, iluminación solar, puente postMessage y demo.
- Se verificó con capturas en navegador (vista global y vista a 120 km del polo sur). Se ocultaron las etiquetas en vista global por solapamiento.
- Se documentó el componente en `_compartido/lunar-globe-renderer.md` y se creó esta iniciativa.
