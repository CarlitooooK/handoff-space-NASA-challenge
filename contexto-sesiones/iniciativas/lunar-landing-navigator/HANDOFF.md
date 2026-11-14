# Lunar Landing Navigator — Handoff

**Última actualización:** 2026-11-14 · **Responsable:** Equipo Técnico Lunar Landing Navigator · **Repo / componente:** `handoff-space-NASA-challenge`

---

## En una línea

Infraestructura de especificación (10 documentos en `docs/`), contrato canónico de API (`contracts/lunar-landing-api-contract.md`) y servidor mock autónomo (`mock/server.js`) finalizados; el equipo de frontend está 100% desbloqueado para construir el visor 3D y dashboard de forma desacoplada.

---

## Estado actual

| Pieza | Estado |
| --- | --- |
| **Documentación técnica y contexto (`docs/00` a `docs/10`)** | Hecho |
| **Contrato de API formal (`contracts/lunar-landing-api-contract.md`)** | Hecho (v1.0 congelado) |
| **Servidor Mock Zero-Dependency (`mock/server.js`)** | Hecho (Node.js nativo en puerto 3000) |
| **Visor 3D Topográfico y Célico (Three.js / WebGL)** | Desbloqueado · Listo para maquetación |
| **Dashboard UI, KPIs y Timeline Slider (60 FPS)** | Desbloqueado · Listo para maquetación |
| **Motor científico SPICE/Horizons & LOLA DEM backend** | Desbloqueado · Desarrollo desacoplado |
| **Guion de Pitch, Video y AI Tool Disclosure** | Desbloqueado · En curso |

---

## Pendientes (en orden de valor)

1. **Lienzo 3D en Three.js (`web/3d-viewer`):** Generar la malla a partir de `elevations_m`, colorear con mapa de pendientes `slopes_deg`, posicionar `DirectionalLight` según `sun_vector_3d` y proyectar sombras rasantes sobre el relieve.
2. **Timeline Slider y scrubbing en memoria (`web/timeline`):** Vincular el slider interactivo para que recorra el arreglo en memoria `timeline[]` a 60 FPS actualizando los contadores de tiempo regresivo a ocaso (*sunset*) y *earthset*.
3. **Selector y Mapa Polar 2D (`web/polar-map`):** Proyección polar estereográfica con marcadores de sitios curados (`GET /api/v1/sites`) y polígonos GeoJSON de sombra permanente (`GET /api/v1/psr/nearby`).
4. **Modal de Comparación de Escenarios (`web/compare`):** Tabla comparativa de 2 a 5 alternativas con semáforo GO/NO-GO alimentada por `POST /api/v1/compare`.
5. **Entregables de Comunicación:** Grabación de demo interactiva (video ≤ 2 minutos) y redacción del *AI Tool Disclosure* conforme a la rúbrica oficial de NASA Space Apps.

---

## Cómo retomar

1. Lee [`CONOCIMIENTO.md`](file:///Users/axeltapia/personal/NASA/handoff-space-NASA-challenge/contexto-sesiones/iniciativas/lunar-landing-navigator/CONOCIMIENTO.md) y [`docs/02-arquitectura.md`](file:///Users/axeltapia/personal/NASA/handoff-space-NASA-challenge/docs/02-arquitectura.md).
2. Levanta el servidor mock local:
   ```bash
   node mock/server.js
   ```
   (Escucha en `http://localhost:3000` con CORS habilitado).
3. Conecta el cliente web apuntando las llamadas REST a `http://localhost:3000/api/v1/...`.
4. Antes de modificar endpoints o tipos de datos, consulta [`PREGUNTAS.md`](file:///Users/axeltapia/personal/NASA/handoff-space-NASA-challenge/PREGUNTAS.md) y [`contracts/lunar-landing-api-contract.md`](file:///Users/axeltapia/personal/NASA/handoff-space-NASA-challenge/contracts/lunar-landing-api-contract.md).

---

## Notas

- El servidor mock provee elevaciones, pendientes y vectores astronómicos matemáticamente coherentes con el relieve del polo sur lunar. No requiere instalación de paquetes npm.
- Todo desarrollo de interfaz debe manejar errores basándose exclusivamente en `error.code` según la matriz definida en [`docs/06-contrato-y-errores.md`](file:///Users/axeltapia/personal/NASA/handoff-space-NASA-challenge/docs/06-contrato-y-errores.md).
