# 10. Producto y necesidades

> Escrito desde quien **consume**. Los demás documentos describen cómo se habla con la otra parte; éste describe **qué producto se construye** y, por cada flujo, **qué hace falta de la otra parte**. Lo que el contrato de hoy no cubre se marca como requerimiento con su pregunta en `PREGUNTAS.md`.

## El principio

La experiencia del usuario es lo que manda en el diseño: una herramienta para toma de decisiones rápida no puede congelar la interfaz ni exigir al usuario comprender la matemática cruda de matrices SPICE, archivos PDS binarios o transformaciones de marcos de referencia IAU/LMO.

El cliente (visor web 2D/3D y dashboard de control) requiere que el motor de cálculo entregue la información predigerida:
1. **Horizonte topográfico listo:** un perfil azimutal muestreado que no obligue al frontend a trazar rayos contra millones de polígonos en el navegador.
2. **Vectores 3D listos para WebGL:** vectores direccionales normalizados (`sun_vector_3d`, `earth_vector_3d`) utilizables directamente por fuentes de luz y cámaras de escena en Three.js / WebGL.
3. **Líneas de tiempo en memoria:** series temporales completas en un solo payload para que el slider temporal funcione a 60 FPS sin peticiones de red intermedias.

---

## Flujo por flujo

Leyenda: ✅ ya contemplado en contrato · ⚠️ pendiente o requiere ajuste (con su referencia).

| # | Necesidad del Producto | Estado | Dónde se resuelve / Contrato |
| --- | --- | --- | --- |
| 1 | Catálogo curado de sitios históricos y candidatos (Artemis III, CLPS) con nombres, coordenadas y descripciones. | ✅ | `GET /api/v1/sites` ([contrato](file:///Users/axeltapia/personal/NASA/handoff-space-NASA-challenge/contracts/lunar-landing-api-contract.md#L49-L75)) |
| 2 | Malla de elevación local diezmada (64x64 a 256x256) con cálculo de pendientes para generar la superficie 3D interactiva. | ✅ | `GET /api/v1/terrain/patch` ([contrato](file:///Users/axeltapia/personal/NASA/handoff-space-NASA-challenge/contracts/lunar-landing-api-contract.md#L77-L121)) |
| 3 | Perfil de elevación de horizonte local (0° a 359°) calculado con precisión topográfica LOLA para determinar oclusiones. | ✅ | `POST /api/v1/evaluate` (`horizon_profile`) ([contrato](file:///Users/axeltapia/personal/NASA/handoff-space-NASA-challenge/contracts/lunar-landing-api-contract.md#L123-L191)) |
| 4 | Serie de tiempo temporal con posiciones astronómicas (Sol y Tierra), visibilidad booleana y factor de potencia fotovoltaica. | ✅ | `POST /api/v1/evaluate` (`timeline[]`) ([contrato](file:///Users/axeltapia/personal/NASA/handoff-space-NASA-challenge/contracts/lunar-landing-api-contract.md#L172-L188)) |
| 5 | Contadores de cuenta regresiva operativa: horas continuas de sol, horas de enlace DTE, tiempo restante a próximo sunset y earthset. | ✅ | `POST /api/v1/evaluate` (`summary`) ([contrato](file:///Users/axeltapia/personal/NASA/handoff-space-NASA-challenge/contracts/lunar-landing-api-contract.md#L156-L167)) |
| 6 | Servicio de evaluación simultánea de 2 a 5 escenarios para la matriz de decisión y vista comparativa. | ✅ | `POST /api/v1/compare` (`results[]`) ([contrato](file:///Users/axeltapia/personal/NASA/handoff-space-NASA-challenge/contracts/lunar-landing-api-contract.md#L193-L253)) |
| 7 | Capa geográfica de Regiones Permanentemente Sombreadas (PSRs) en formato GeoJSON simplificado para superposición en mapa. | ✅ | `GET /api/v1/psr/nearby` ([contrato](file:///Users/axeltapia/personal/NASA/handoff-space-NASA-challenge/contracts/lunar-landing-api-contract.md#L255-L302)) |
| 8 | Datos precacheados o mock sin conexión para asegurar funcionamiento durante presentaciones o baja conectividad. | ✅ | Directorio `mock/` y datasets de respaldo polar. |
| 9 | Texturas fotográficas satelitales LROC NAC de alta resolución superpuestas a la malla de relieve 3D. | ⚠️ | Opcional v2: actualmente el visor aplica mapa de calor por pendientes (`slopes_deg`). |
