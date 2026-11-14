# Lunar Landing Navigator — Conocimiento

Reglas físicas, modelo de datos y decisiones arquitectónicas con su fundamentación. Lo verificado empíricamente se separa de los supuestos operacionales.

---

## Alcance y principio

El objetivo es proveer una herramienta visual e interactiva para evaluar y comparar sitios de aterrizaje y ventanas de lanzamiento lunares, visualizando las oclusiones del horizonte respecto al Sol y la Tierra para determinar supervivencia fotovoltaica y ventanas de comunicación directa (Direct-to-Earth).

**Principio rector:** *La fluidez de usuario (60 FPS) y la accesibilidad para toma de decisiones mandan sobre la complejidad computacional en el cliente.* El motor de cálculo entrega datos predigeridos (perfiles de horizonte radiales de 360°, vectores cartesianos unitarios y series temporales completas en memoria) para que la interfaz web opere sin latencias perceptibles ni parpadeos.

---

## Decisiones y su porqué

- **Contract-first y Mock Server Zero-Dependency (2026-11-14):** Se estableció el contrato [`contracts/lunar-landing-api-contract.md`](../../../contracts/lunar-landing-api-contract.md) y se implementó [`mock/server.js`](../../../mock/server.js) usando solo módulos nativos de Node.js (con [`mock/package.json`](../../../mock/package.json) `{"type": "commonjs"}`).  
  *Porqué:* Desacopla 100% el frontend del backend de datos pesados (LOLA DEMs y kernels SPICE) y garantiza que el proyecto pueda ser evaluado o presentado offline sin riesgo de caídas de red o límites de tasa de la API de NASA.  
  *Descartado:* Acoplamiento monolítico inicial o depender de la disponibilidad constante de JPL Horizons durante la demo.

- **Esquema de errores unificado `ErrorResponse` en backend y mock (2026-11-14):** Tanto `spaceapps-api` (FastAPI en `desktop`) como `mock/server.js` emiten `{ "error": { "code": "ERR_*", "message": "...", "details": ... } }` en respuestas `400`, `404`, `422` y `503` (el backend conserva `detail` opcional para compatibilidad).  
  *Porqué:* Cumple la regla contractual de decidir por `error.code` en cliente sin divergir entre modo mock y producción (resuelve `P-001`).  
  *Descartado:* Mantener `{ detail }` crudo de FastAPI y obligar al cliente a mantener lógica condicional por entorno.

- **Cobertura global de latitud `[-90.0°, 90.0°]` con alta resolución en Polo Sur (2026-11-14):** El Polo Sur `[-90.0°, -80.0°]` se resuelve con LOLA `40 m/px` / `80 m/px` y fuera de esa franja se usa el DEM global `ldem_64.tif` (`64 ppd`), tanto en backend en vivo como en contrato y mock (`P-003`).  
  *Porqué:* Permite comparar sitios Artemis III/CLPS del Polo Sur junto con sitios históricos Apollo (`13` sitios en backend en vivo; `8` sitios en `mock/server.js`).  
  *Descartado:* Bloquear fuera de `[-90.0°, -80.0°]` cuando `GET /sites` expone sitios Apollo ecuatoriales/medias latitudes.

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
  *Ideas y Propuestas (`docs/ideas/`):* Guías exploratorias no vinculantes.

---

## Hallazgos verificados

- **Backend en vivo (`spaceapps-api` en `desktop`):** Sirve los 6 endpoints v1.1, emite `ErrorResponse` (`ERR_*`), aprueba `14/14` tests unitarios (`tests_engine.py`) y expone `13` sitios reales de PostGIS más `1,531` polígonos PSR.
- **Servidor Mock:** `mock/server.js` funciona sin dependencias externas en modo CommonJS (aislado mediante `mock/package.json`), cubre los 6 endpoints con `8` sitios, acepta `lat [-90.0°, 90.0°]` y fechas `1900..2050`, y emite `ErrorResponse`.
- **Rango de coordenadas y fechas:** Coordenadas válidas `lat` en `[-90.0°, 90.0°]` y `lon` en `[-180.0°, 360.0°]` (fuera de rango devuelve `ERR_INVALID_COORDINATES`); años válidos `1900..2050` en formato ISO 8601 UTC (`YYYY-MM-DDTHH:mm:ssZ`, fuera de rango devuelve `ERR_DATE_OUT_OF_RANGE`).
- **Geometría solar polar:** La inclinación del eje de rotación de la Luna respecto a la eclíptica es de apenas $\sim 1.54^\circ$. En el polo sur, el Sol nunca supera elevaciones de $\sim 2.0^\circ$ sobre el horizonte astronómico, proyectando sombras rasantes kilométricas.
- **Fuente única de URLs:** Por regla de [`COMO-USAR-ESTE-REPO.md`](../../../COMO-USAR-ESTE-REPO.md), todas las URLs activas (túneles Cloudflare, Tailscale y `localhost`) y variables de entorno viven exclusivamente en [`docs/07-ambientes-y-pruebas.md`](../../../docs/07-ambientes-y-pruebas.md).

---

## Supuestos sin verificar

- Se asume que el navegador cliente del evaluador cuenta con soporte estándar de WebGL 2.0; para casos excepcionales, la arquitectura contempla una vista 2D simplificada del horizonte documentada en [`docs/05-flujos.md`](../../../docs/05-flujos.md).

---

## Decisiones recientes de UI

- **Stack elegido en `frontend-console`:** React 19 + TypeScript + Vite + Tailwind CSS v4 + React Three Fiber (`Three.js`) + Zustand + Vitest (`luna-landing-navigator-console`).
