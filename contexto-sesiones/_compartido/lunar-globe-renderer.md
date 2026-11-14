# Globo lunar — conocimiento base

Globo lunar 3D estilo Google Earth (CesiumJS + teselas NASA Moon Trek), desarrollado aparte e incrustable en la consola. Documento transversal: el trabajo puntual vive en `iniciativas/lunar-globe-renderer/`.

Verificado leyendo el código del repo del globo y probándolo en navegador (2026-11-14). Lo no verificado se marca.

## Dónde vive
- **Repo / ubicación:** [`luna-render-nasa-space-challenge`](https://github.com/CarlitooooK/luna-render-nasa-space-challenge), rama `main`. Copia local de trabajo: `lunar-globe-renderer/`, carpeta hermana de `luna-landing-navigator-console`.
- **Cómo correrlo:** `npm install && npm run dev` (copia antes los assets de Cesium a `public/cesium`). Build: `npm run build`.
- **Uso y protocolo de mensajes:** `README.md` del proyecto (fuente única; no se copia aquí).

## Arquitectura
Clase `LunarGlobe` (`src/LunarGlobe.ts`) sobre un `Viewer` de Cesium sin Ion. `src/moon.ts` fija el elipsoide lunar y debe importarse primero. `src/layers.ts` define las capas WMTS. `src/embed.ts` conecta con la ventana padre por postMessage. `src/main.ts` es la demo y el modo iframe.

## Cómo funciona
- Cielo (`src/sky.ts`): estrellas Tycho2, Tierra con textura Natural Earth local y el Sol como billboard de tamaño angular real. Sin dirección del host no hay Sol; la Tierra queda en la posición media.
- Vehículos (`src/vehicles.ts`): módulo de aterrizaje y astronauta con modelos GLB de NASA 3D Resources (`public/models/`, con `ATTRIBUTION.md`) y columna de motor por partículas. El módulo toma su posición de la trayectoria; el astronauta, del terreno.
- Relieve (`src/terrain.ts`): terreno de Cesium desde el DEM de LOLA de Moon Trek con conversión calibrada. Una sola función (`fetchDemTile`) define la fuente; cambiarla por teselas del backend (`P-008`) no toca el resto.
- Polo (`src/polar.ts`): proveedor de imagen que reproyecta el mosaico polar a la malla geográfica.
- PSR: `src/geo.ts` convierte metros polares a lat/lon.
- Capas: `wac` (base, nivel 8) y `lolaShade` (superpuesta, nivel 5).
- Entrada de datos: `LandingSite` con los campos del schema de `contracts/openapi.json`. El vector solar se recibe en el marco local del sitio (D-008) y se convierte al marco fijo lunar con el ENU del sitio.
- Eventos de salida: clic en sitio, clic en superficie, fin de animación, listo.

## Dependencias y contratos
- Datos de sitios y vectores: `contracts/` y `docs/09-decisiones.md` (D-008, D-011).
- Atribución obligatoria de NASA: `docs/03-datos-y-accesos.md`. Se muestra en los créditos de Cesium.
- Teselas externas: NASA Moon Trek (`docs/03-datos-y-accesos.md`).

## Cosas que muerden
- Hay que importar `src/moon.ts` antes de cualquier objeto de Cesium; si no, dibuja una Tierra.
- Cesium necesita `CESIUM_BASE_URL` y los assets copiados a `public/cesium` (script `cesium:assets`).
- La imagen converge en abanico justo en ±90° (proyección geográfica).
- Con `terrain` activo, entidades y cámara dependen de la altura del terreno (`RELATIVE_TO_GROUND`, `sampleTerrain`); con la red caída el terreno queda plano en esas teselas.
- `CelestialFrameTransforms` falta en los tipos públicos de Cesium 1.147; se accede con un cast.
- Un `vite` en segundo plano mantiene el puerto ocupado; detenerlo al terminar.

- Sin elipsoide terrestre Cesium no crea estrellas: el `SkyBox` va configurado a mano.
- El Sol está a 9e8 m (no a 1.5e11) por el plano lejano; el tamaño angular sí es el real.

- El reloj de Cesium debe estar en marcha (`shouldAnimate`) o las partículas no se emiten.
- Los modelos están en pulgadas (astronauta) o metros (módulo): escalar con cuidado al sustituirlos.

## Seguridad
- El puente postMessage ignora mensajes de orígenes no listados y responde solo a esos orígenes.
- Sin tokens ni claves: Cesium Ion no se usa.
