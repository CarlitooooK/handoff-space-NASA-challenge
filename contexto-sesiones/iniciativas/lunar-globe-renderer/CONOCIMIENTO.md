# Globo lunar — Conocimiento

Reglas, modelo y decisiones, con su porqué. Lo verificado se separa de lo supuesto.

## Alcance y principio
Fase 1 del proyecto: un globo lunar detallado, estilo Google Earth, **desarrollado por separado** de la consola e incrustable en ella. Criterio: lo más funcional para la consola y la demo, sin inventar datos ni depender de cuentas externas.

## Decisiones y su porqué
- **CesiumJS con `Ellipsoid.MOON` (2026-11-14).** Registrada como D-011 en `docs/09-decisiones.md`. *Porqué:* trae teselado con LOD, streaming y caché, y soporte de cuerpos no terrestres; las teselas WMTS de Moon Trek encajan con su `GeographicTilingScheme`. *Descartado:* Three.js con LOD propio (habría que construir el teselado), y el prototipo anterior de una esfera con textura 1K (resolución ~10 km/px, sin zoom útil).
- **Integración por iframe + postMessage (2026-11-14).** *Porqué:* aísla el peso de Cesium (~5 MB sin comprimir) y su elipsoide global del bundle de la consola, y respeta que son desarrollos separados. *Descartado como primera opción:* import directo (mezcla dependencias y el elipsoide global). Sigue disponible como `LunarGlobe`.
- **Orígenes permitidos explícitos y sin `'*'` (2026-11-14).** *Porqué:* el iframe solo debe obedecer a la consola. Configuración en `VITE_ALLOWED_ORIGINS` o `?allowedOrigins=`.
- **Sin Cesium Ion (2026-11-14).** `baseLayer: false`, solo teselas públicas. *Porqué:* sin tokens ni cuentas, coherente con `docs/03-datos-y-accesos.md`.

## Hallazgos verificados
- Teselas de Moon Trek `LRO_WAC_Mosaic_Global_303ppd_v02`: HTTP 200, `Access-Control-Allow-Origin: *`, nivel 0 = 2×1, máximo nivel 8. Nivel 9 devuelve 404. (curl y `WMTSCapabilities.xml`, 2026-11-14.)
- `LRO_LOLA_ClrShade_Global_128ppd_v04`: nivel máximo 5. `LRO_LOLA_DEM_Global_128ppd_v04` existe pero entrega PNG de 8 bits, insuficiente como elevación precisa.
- En la prueba real se cargaron 628 teselas, todas con 200, sin errores de página (puppeteer-core + Brave, 2026-11-14).
- Cesium 1.147 expone `Ellipsoid.MOON` y `CelestialFrameTransforms.computeIcrfToMoonFixedMatrix`. Esta última existe en runtime pero falta en los `.d.ts` públicos.
- En vista global los pines del polo sur se solapan: las etiquetas solo se muestran a menos de 2 500 km.
- El prototipo anterior fallaba `tsc` (4 errores, entre ellos `Vector3.slerpVectors` inexistente) y su "protocolo postMessage" solo estaba tipado, no implementado.

## Supuestos sin verificar
- `sun_vector_3d` es un vector hacia el Sol en el marco local del sitio con la convención D-008; la conversión a marco fijo lunar se probó solo con un vector mock.
- El rendimiento en el equipo de la demo (GPU real) no se midió; la prueba corrió con renderizado por software.
- Que el iframe funcione bajo el origen real de la consola y del túnel de despliegue.

## Pendiente de decisión
- Dónde se hospeda el globo (repo, URL) y si se acepta el abanico del polo o se cambia a teselas polares. Decide el equipo.
