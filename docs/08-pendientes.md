# 8. Pendientes y fases

Estado de desbloqueo inmediato, distribución de tareas por especialidad y hoja de ruta posterior a la versión 1.0.

---

## Estado de desbloqueo inmediato

Gracias a la definición exhaustiva del contrato de interfaz en [`contracts/lunar-landing-api-contract.md`](../contracts/lunar-landing-api-contract.md) y al servidor autónomo en [`mock/server.js`](../mock/server.js), **el equipo de frontend, los analistas de datos y el equipo de comunicación pueden avanzar de forma 100% paralela e independiente**:

* El equipo de interfaz no requiere que el motor de efemérides ni la base de datos LOLA estén compilados para maquetar, animar y validar la experiencia visual.
* Las integraciones complejas (SPICE, GeoTIFFs masivos) se desarrollan detrás del contrato acordado, reemplazando el simulador de forma transparente cuando estén validadas numéricamente.

---

## Distribución de tareas y contingencias (Mientras tanto)

| Pendiente | Área / Quién | Mientras tanto (Cómo avanzar sin esperar) |
| --- | --- | --- |
| **Lienzo 3D en Three.js (`web/3d-viewer`)**<br/>Construcción de la geometría del terreno a partir del arreglo plano `elevations_m`, coloreado por pendientes `slopes_deg`, posicionamiento de `DirectionalLight` según `sun_vector_3d` y proyección de sombras rasantes. | Frontend | Consumir el endpoint `GET /api/v1/terrain/patch` y los vectores `sun_vector_3d` de `POST /api/v1/evaluate` provistos por el servidor mock local (`http://localhost:3000`). |
| **Mapa polar 2D interactivo (`web/polar-map`)**<br/>Proyección estereográfica polar sur con selector de coordenadas por clic, catálogo de sitios curados y superposición de polígonos GeoJSON de cráteres PSR. | Frontend | Utilizar `GET /api/v1/sites` y `GET /api/v1/psr/nearby` del mock server para renderizar los marcadores y polígonos sin depender de servicios WMS/GIS externos. |
| **Timeline Slider y scrubbing a 60 FPS (`web/timeline`)**<br/>Control deslizante temporal que itera la serie en memoria `timeline[]`, actualizando elevaciones, visibilidad de Tierra/Sol, generación fotovoltaica y contadores de tiempo a ocaso (*sunset*) y ocultamiento terrestre (*earthset*). | Frontend | Cargar el array precomputado de 336 puntos horarios que devuelve `POST /api/v1/evaluate` en el mock server. |
| **Matriz y modal de comparación (`web/compare`)**<br/>Vista comparativa de 2 a 5 escenarios simultáneos (sitio vs. sitio o fecha vs. fecha retrasada) con métricas contrastadas y semáforo GO/NO-GO. | Frontend | Consumir la respuesta estructurada de `POST /api/v1/compare` del mock server. |
| **Integración con JPL Horizons y SPICE (`services/ephemeris`)**<br/>Llamadas a la API REST de NASA/JPL Horizons o ingesta de kernels SPICE (`cspice`/`spiceypy`) para calcular vectores de posición selenocéntrica y libración lunar con precisión de milisegundos de arco. | Backend / Ciencia | El frontend y el visor consumen las series de tiempo estandarizadas del mock; el backend puede probarse aisladamente con tests unitarios validando la concordancia angular contra tablas publicadas de la misión Artemis. |
| **Lector y perfilador de DEM polar LOLA (`services/terrain`)**<br/>Módulo para abrir archivos GeoTIFF polares (p. ej. `LDEM_80S_20M.tif`), extraer ventanas de $12\text{ km} \times 12\text{ km}$ y trazar los 360 rayos radiales de horizonte de 0° a 359°. | Backend / Datos | El visor 3D utiliza la malla y el `horizon_profile` de Shackleton Rim ya emulados en el mock server. |
| **Guion del video de presentación (Pitch ≤ 2 min)**<br/>Narrativa enfocada en el problema real (Artemis III / CLPS), la dificultad del relieve polar extremo, la solución mediante comparación rápida interactiva y el impacto en la supervivencia de la misión. | Comunicación / Video | Grabar la pantalla directamente contra el visor web conectado al mock server, demostrando la fluidez a 60 FPS y el contraste inmediato entre dos fechas de lanzamiento. |
| **Divulgación de herramientas de IA (*AI Tool Disclosure*)**<br/>Redacción de la declaración obligatoria requerida por las reglas oficiales del NASA Space Apps Challenge, detallando qué herramientas asistieron en la arquitectura, código o documentación. | Todo el equipo | Mantener la sección de divulgación lista en la ficha final del proyecto y en el repositorio público sin atribuir autoría indebida en commits. |
| **Ficha del proyecto y diapositivas de presentación**<br/>Carga de resumen ejecutivo, metodología científica, referencias de datos (LOLA, Horizons) y enlaces al repositorio y demo desplegado en la plataforma oficial. | Todo el equipo | Tomar capturas de pantalla de los flujos ya implementados con el mock server para el material gráfico de la entrega. |

---

## Fases posteriores (Roadmap v2 / Post-Hackathon)

Una vez completada la versión 1.0 funcional del hackathon, las siguientes ampliaciones enriquecerán la capacidad analítica y fidelidad del sistema:

1. **Texturizado fotográfico orbital de ultra-alta resolución (LROC NAC):**
   - Superposición de mosaicos ortorrectificados de la cámara de ángulo estrecho del Lunar Reconnaissance Orbiter (LROC NAC) sobre la malla de elevación 3D, alcanzando resolución de hasta 0.5 metros por píxel para visualizar rocas y micro-cráteres en la zona de aterrizaje.

2. **Modelado térmico de superficie y regolito:**
   - Estimación de temperaturas criogénicas extremas (< 40 K en el fondo de los PSRs y hasta ~120 K en superficie iluminada rasante) para predecir límites operacionales de subsistemas criogénicos, rovers y trajes espaciales EVA.

3. **Planificador de rutas óptimas de exploración (*Rover Pathfinding*):**
   - Algoritmo de navegación (A* / Dijkstra adaptado a superficies esféricas) que calcule la trayectoria más segura entre una zona iluminada de aterrizaje y un depósito de hielo en un PSR adyacente, respetando restricciones de pendiente máxima permitida ($\le 15^\circ$) y exposición a luz solar.

4. **Soporte de constelaciones de retransmisión lunar (Lunar Comm Relays):**
   - Modelado de enlaces de comunicación con satélites en órbita halo (como Gateway o CubeSats de retransmisión) para cubrir ventanas donde la Tierra no tiene línea de vista directa desde la superficie (durante los periodos de *earthset* prolongados por libración).
