# Globo lunar — conocimiento base

Globo lunar 3D estilo Google Earth (CesiumJS + teselas NASA Moon Trek), desarrollado aparte e incrustable en la consola. Documento transversal: el trabajo puntual vive en `iniciativas/lunar-globe-renderer/`.

Verificado leyendo el código de `lunar-globe-renderer/` y probándolo en navegador (2026-11-14). Lo no verificado se marca.

## Dónde vive
- **Repo / ubicación:** `lunar-globe-renderer/`, carpeta hermana de `luna-landing-navigator-console`. Aún sin repo git propio.
- **Cómo correrlo:** `npm install && npm run dev` (copia antes los assets de Cesium a `public/cesium`). Build: `npm run build`.
- **Uso y protocolo de mensajes:** `README.md` del proyecto (fuente única; no se copia aquí).

## Arquitectura
Clase `LunarGlobe` (`src/LunarGlobe.ts`) sobre un `Viewer` de Cesium sin Ion. `src/moon.ts` fija el elipsoide lunar y debe importarse primero. `src/layers.ts` define las capas WMTS. `src/embed.ts` conecta con la ventana padre por postMessage. `src/main.ts` es la demo y el modo iframe.

## Cómo funciona
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
- La esfera es lisa: el relieve se percibe por la imagen, no por geometría.
- `CelestialFrameTransforms` falta en los tipos públicos de Cesium 1.147; se accede con un cast.
- Un `vite` en segundo plano mantiene el puerto ocupado; detenerlo al terminar.

## Seguridad
- El puente postMessage ignora mensajes de orígenes no listados y responde solo a esos orígenes.
- Sin tokens ni claves: Cesium Ion no se usa.
