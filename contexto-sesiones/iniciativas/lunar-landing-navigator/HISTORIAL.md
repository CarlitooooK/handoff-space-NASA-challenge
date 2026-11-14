# Lunar Landing Navigator — Historial

Cronología del proyecto, de lo más nuevo a lo más viejo. Fechas absolutas. No se borra: se agrega.

---

## 2026-11-14

- **Fusión de `handoff-api-frontend` en esta iniciativa:** mismo responsable (Backend / Integración) y mismo tema; sus entradas de historial se conservan abajo en orden cronológico y lo vigente de su conocimiento vive en [`_compartido/backend-api.md`](../../_compartido/backend-api.md) y [`CONOCIMIENTO.md`](CONOCIMIENTO.md).
- **`P-006` respondida (D-013):** se acepta `docs/11`; la API pública ya entrega los datos del puente globo-consola. Se avisó al globo que `src/geo.ts` invierte la proyección con el eje Y anterior a D-012 (`SET_PSR` saldría reflejado).
- **Coordenadas polares alineadas al CRS de LOLA (D-012):** se corrigió el eje Y en los ejemplos de [`contracts/lunar-landing-api-contract.md`](../../../contracts/lunar-landing-api-contract.md) y en `mock/server.js` (ahora calcula `polar_x_m`/`polar_y_m` con la proyección LOLA). Origen: `AxelT456/lunar_landing_site_navigator_api#2`. En el mismo repo, `#1` agregó el seed de PostGIS para desarrollo local (`db/`, `docker-compose.dev.yml`). Se resolvió el conflicto con `969c4c4` en `docs/09-decisiones.md` conservando D-010 y D-011.

- **Alineación integral de backend en vivo, mock, contratos y sesiones (pendiente de commit/autorización):**
  - **Backend en vivo (`spaceapps-api` en `desktop`):** Se actualizaron `app/models.py` y `app/main.py` para emitir respuestas unificadas `ErrorResponse` (`{ error: { code, message, details }, detail }`) en códigos `400`, `404`, `422` y `503`, validar años `1900..2050` (`ERR_DATE_OUT_OF_RANGE`) y validar `/compare` (`ERR_SCENARIO_LIMIT_EXCEEDED`, `ERR_DUPLICATE_SCENARIOS`), verificando `14/14` tests unitarios (`tests_engine.py`) y pruebas HTTP contra los endpoints reales.
  - **Contratos y guías:** Se regeneró [`contracts/openapi.json`](../../../contracts/openapi.json) incluyendo `ErrorResponse` y `ErrorDetail`, y se actualizaron [`contracts/lunar-landing-api-contract.md`](../../../contracts/lunar-landing-api-contract.md) (v1.1), [`FRONTEND_API_GUIDE.md`](../../../FRONTEND_API_GUIDE.md), [`docs/01-alcance.md`](../../../docs/01-alcance.md), [`docs/06-contrato-y-errores.md`](../../../docs/06-contrato-y-errores.md), [`docs/07-ambientes-y-pruebas.md`](../../../docs/07-ambientes-y-pruebas.md) y [`docs/09-decisiones.md`](../../../docs/09-decisiones.md) respetando la regla de fuente única para URLs.
  - **Mock local (`mock/`):** Se añadieron `apollo-11`, `apollo-15` y `apollo-17` a `CURATED_SITES` (`8` sitios), se amplió el rango de latitud a `[-90.0, 90.0]` y fechas a `1900..2050`, y se creó [`mock/package.json`](../../../mock/package.json) (`{"type": "commonjs"}`) actualizando [`mock/README.md`](../../../mock/README.md).
  - **Consolidación de `contexto-sesiones/` y [`PREGUNTAS.md`](../../../PREGUNTAS.md):** Se eliminó la iniciativa duplicada `handoff-api-frontend/` fusionando sus hechos verificados en [`_compartido/backend-api.md`](../../_compartido/backend-api.md) y esta iniciativa, se reemplazaron rutas absolutas locales por enlaces relativos y se corrigieron las respuestas `P-001`..`P-005` en [`PREGUNTAS.md`](../../../PREGUNTAS.md).

- **Respuestas `P-001`..`P-005` y alineación de docs (commit `2bfb8a7`)** (traído de la iniciativa `handoff-api-frontend`, fusionada en esta; texto original):
  - Se respondieron `P-001` a `P-005` en `PREGUNTAS.md` (movidas a *Respondidas*) tras verificar en vivo `422` (`{ detail }`) y cobertura global `[-90, 90]` (Apollo 11 `200 OK` en `/terrain/patch`).
  - Se actualizaron `docs/06-contrato-y-errores.md`, `docs/07-ambientes-y-pruebas.md`, `docs/08-pendientes.md`, `docs/09-decisiones.md` (`D-010`) y `mock/README.md` (nota CommonJS/ESM, URL mock `/api/v1`, `npx openapi-typescript` y limpieza de enlaces locales absolutos).
  - Se inspeccionó `AxelT456/lunar_landing_site_navigator_api` (`64cdae2`) y se documentó su estado real (scaffolding FastAPI sintético sin `app/infrastructure/`) en `contexto-sesiones/_compartido/backend-api.md` y `CONOCIMIENTO.md`.
  - Se actualizó el estado de `mock/` en `HANDOFF.md` (`P-004`).

- **Culminación del Handoff y Documentación Técnica (10/10 guías en `docs/`):**
  - Se completó [`docs/02-arquitectura.md`](../../../docs/02-arquitectura.md) con diagrama Mermaid de integración de tres capas, responsabilidades por componente, pipeline de datos de 8 pasos y fundamentos de ingeniería (horizonte precomputado, vectores 3D normalizados y mock zero-dependency).
  - Se completó [`docs/06-contrato-y-errores.md`](../../../docs/06-contrato-y-errores.md) definiendo estándares estrictos (ISO 8601 UTC, grados decimales, unidades métricas), convención de versionado `/api/v1/`, catálogo exhaustivo de códigos de error (`ERR_INVALID_COORDINATES`, `ERR_DATE_OUT_OF_RANGE`, `ERR_TERRAIN_UNAVAILABLE`, `ERR_UPSTREAM_SERVICE`, `ERR_INVALID_PAYLOAD`, `ERR_SCENARIO_LIMIT_EXCEEDED`, `ERR_DUPLICATE_SCENARIOS`, `ERR_NOT_FOUND`) y código de recuperación en cliente.
  - Se completó [`docs/07-ambientes-y-pruebas.md`](../../../docs/07-ambientes-y-pruebas.md) con matriz de ambientes, variables de entorno documentadas sin valores sensibles, descripción de fixtures polares y comandos cURL listos para copiar y pegar.
  - Se completó [`docs/08-pendientes.md`](../../../docs/08-pendientes.md) con la estrategia de desbloqueo simultáneo para frontend, backend y video, tabla de tareas operativas y roadmap v2 (mallas LROC NAC, análisis térmico y rutas de rovers).
  - Se completó [`docs/09-decisiones.md`](../../../docs/09-decisiones.md) registrando formalmente las decisiones arquitectónicas y la versión canónica de `contracts/lunar-landing-api-contract.md`.

- **Creación del Servidor Mock Zero-Dependency (`mock/server.js`):**
  - Implementación completa en Node.js estándar sin paquetes de terceros (`http`, `url`).
  - Cobertura 100% de los endpoints de la API v1: `/api/v1/health`, `/api/v1/sites`, `/api/v1/terrain/patch`, `/api/v1/evaluate`, `/api/v1/compare`, y `/api/v1/psr/nearby`.
  - Inclusión de cabeceras CORS permisivas (`*`) para habilitar llamadas directas desde cualquier cliente web local (`http://localhost:5173`, etc.).
  - Actualización de [`mock/README.md`](../../../mock/README.md) con instrucciones de arranque y ejemplos cURL.

- **Apertura de la Iniciativa en Contexto de Sesiones:**
  - Creación de `contexto-sesiones/iniciativas/lunar-landing-navigator/` con sus artefactos `HANDOFF.md`, `CONOCIMIENTO.md` e `HISTORIAL.md`.
  - Actualización del índice maestro en [`contexto-sesiones/README.md`](../../README.md) y del estado general en [`README.md`](../../../README.md).

- **Guía de consumo `FRONTEND_API_GUIDE.md` y contexto de la API (commit `5b78a50`)** (traído de la iniciativa `handoff-api-frontend`, fusionada en esta; texto original):
  - Se incorporó `FRONTEND_API_GUIDE.md` (`contracts/openapi.json` y alineación de `contracts/lunar-landing-api-contract.md`, `docs/07`, `docs/09`, `docs/10`, `README.md`, `AGENTS.md`). Commit `5b78a50`.
  - Se creó `contexto-sesiones/_compartido/backend-api.md` y la iniciativa `contexto-sesiones/iniciativas/handoff-api-frontend/`.
