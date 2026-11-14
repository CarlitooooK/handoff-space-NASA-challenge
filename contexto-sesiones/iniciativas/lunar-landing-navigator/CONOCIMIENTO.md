# Lunar Landing Navigator — Conocimiento

Reglas físicas, modelo de datos y decisiones arquitectónicas con su fundamentación. Lo verificado empíricamente se separa de los supuestos operacionales.

---

## Alcance y principio

El objetivo es proveer una herramienta visual e interactiva para evaluar y comparar sitios de aterrizaje y ventanas de lanzamiento en el polo sur lunar, visualizando las oclusiones del horizonte respecto al Sol y la Tierra para determinar supervivencia fotovoltaica y ventanas de comunicación directa (Direct-to-Earth).

**Principio rector:** *La fluidez de usuario (60 FPS) y la accesibilidad para toma de decisiones mandan sobre la complejidad computacional en el cliente.* El motor de cálculo entrega datos predigeridos (perfiles de horizonte radiales de 360°, vectores cartesianos unitarios y series temporales completas en memoria) para que la interfaz web opere sin latencias perceptibles ni parpadeos.

---

## Decisiones y su porqué

- **Contract-first y Mock Server Zero-Dependency (2026-11-14):** Se congeló el contrato [`contracts/lunar-landing-api-contract.md`](file:///Users/axeltapia/personal/NASA/handoff-space-NASA-challenge/contracts/lunar-landing-api-contract.md) y se implementó [`mock/server.js`](file:///Users/axeltapia/personal/NASA/handoff-space-NASA-challenge/mock/server.js) usando solo módulos nativos de Node.js.  
  *Porqué:* Desacopla 100% el frontend del backend de datos pesados (LOLA DEMs y kernels SPICE) y garantiza que el proyecto pueda ser evaluado o presentado offline sin riesgo de caídas de red o límites de tasa de la API de NASA.  
  *Descartado:* Acoplamiento monolítico inicial o depender de la disponibilidad constante de JPL Horizons durante la demo.

- **Perfil de horizonte azimutal precomputado de 360° (2026-11-14):** Enviar un array de 360 valores flotantes de elevación de horizonte (`horizon_profile`), 1 por cada grado de acimut.  
  *Porqué:* La verificación de visibilidad astronómica se reduce a una comparación numérica elemental $O(1)$ en el cliente ($\theta_{\text{astro}} > \theta_{\text{horizonte}}$), eliminando la necesidad de trazar rayos en tiempo real sobre millones de polígonos del DEM lunar en WebGL.  
  *Descartado:* Raymarching o raytracing en el shader de fragmentos en el navegador del cliente.

- **Línea de tiempo en memoria para scrubbing continuo a 60 FPS (2026-11-14):** Retornar los 336 puntos horarios de una misión de 14 días en una sola respuesta JSON en `POST /api/v1/evaluate`.  
  *Porqué:* El payload pesa menos de 100 KB gzippeado y permite al usuario arrastrar el slider temporal con respuesta instantánea a 60 FPS sin emitir llamadas de red por cada paso.  
  *Descartado:* Peticiones REST bajo demanda en cada evento `input` del control deslizante.

- **Modelado riguroso de libración polar lunar en enlace DTE (2026-11-14):** Evaluar la línea de vista directa a la Tierra considerando la oscilación por libración óptica y física (~27.3 días) y la ausencia total de refracción atmosférica (vacío lunar).  
  *Porqué:* En el polo sur lunar, la Tierra oscila muy cerca del horizonte astronómico ($0^\circ \pm 6^\circ$); omitir la libración falsearía por completo las ventanas de pérdida (*earthset*) y recuperación (*earthrise*) de señal de radio.  
  *Descartado:* Posición terrestre estática en coordenadas lunares fijas.

- **Balance equitativo según la rúbrica oficial de 8 criterios (2026-11-14):** Asignar esfuerzo balanceado a cada uno de los 8 criterios de 12.5% de NASA Space Apps (Innovación, UX, Impacto, Datos NASA, Ciencia, Creatividad, Arte/Tecnología, Comunicación).  
  *Porqué:* Un proyecto técnicamente sobresaliente que omita el video o la declaración obligatoria de herramientas de IA pierde hasta 37.5% de calificación.  
  *Descartado:* Dedicar el 100% del hackathon exclusivamente al motor numérico de backend.

- **Separación entre Handoff Contractual, Contexto de Sesiones e Ideas de Referencia (2026-11-14):**  
  *Handoff formal (`docs/`, `contracts/`, `mock/`):* Contrato vinculante de lo que el sistema debe cumplir y exponer.  
  *Contexto de Sesiones (`contexto-sesiones/`):* Memoria viva del equipo (bitácora, relevos y lecciones aprendidas).  
  *Ideas y Propuestas (`docs/ideas/`):* Guías exploratorias no vinculantes (como la propuesta de arquitectura frontend en React y el diseño conceptual UI/UX). Sirven de inspiración opcional sin atar las manos del desarrollador.

---

## Hallazgos verificados

- **Rendimiento del Servidor Mock:** `mock/server.js` atiende peticiones en menos de 3 ms en entorno local sin requerir instalación previa de librerías de `node_modules` (verificado mediante suite interna de Node.js).
- **Rango polar lunar:** El área de interés para misiones Artemis III y CLPS en el polo sur se circunscribe rigurosamente entre latitudes `-90.0°` y `-80.0°`. Todo valor fuera de este intervalo es rechazado con `ERR_INVALID_COORDINATES` (HTTP 422).
- **Geometría solar polar:** La inclinación del eje de rotación de la Luna respecto a la eclíptica es de apenas $\sim 1.54^\circ$. En el polo sur, el Sol nunca supera elevaciones de $\sim 2.0^\circ$ sobre el horizonte astronómico, proyectando sombras rasantes kilométricas.
- **Formato de intercambio:** Todas las fechas del sistema se formatean en estricto ISO 8601 UTC (`YYYY-MM-DDTHH:mm:ssZ`) y las coordenadas en grados decimales con acimut horario desde el Norte local.

---

## Supuestos sin verificar

- Se asume que el navegador cliente del evaluador cuenta con soporte estándar de WebGL 2.0; para casos excepcionales, la arquitectura contempla una vista 2D simplificada del horizonte documentada en [`docs/05-flujos.md`](file:///Users/axeltapia/personal/NASA/handoff-space-NASA-challenge/docs/05-flujos.md).

---

## Pendiente de decisión

- **Stack final de interfaz web:** Decisión entre React + Tailwind + Three.js o Vanilla JS + Three.js puro, supeditada a la velocidad de prototipado del equipo frontend asignado a la iniciativa.
