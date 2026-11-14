# Globo lunar — Historial

Cronología, de lo más nuevo a lo más viejo. Fechas absolutas. No se borra: se agrega.

## 2026-11-14
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
