# Globo lunar — Historial

Cronología, de lo más nuevo a lo más viejo. Fechas absolutas. No se borra: se agrega.

## 2026-11-14
- Se revisó el prototipo previo (Three.js) en `lunar-globe-renderer`: no compilaba, textura 1K, postMessage sin implementar.
- Se evaluaron las fuentes de teselas de Moon Trek y se decidió CesiumJS (D-011 en `docs/09-decisiones.md`).
- Se reescribió el renderer: `LunarGlobe` (clase sin framework), capas WAC/LOLA, pines por estado, fly-to, rejilla, arco de descenso, iluminación solar, puente postMessage y demo.
- Se verificó con capturas en navegador (vista global y vista a 120 km del polo sur). Se ocultaron las etiquetas en vista global por solapamiento.
- Se documentó el componente en `_compartido/lunar-globe-renderer.md` y se creó esta iniciativa.
