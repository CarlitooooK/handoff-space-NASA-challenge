# Lunar Landing Navigator — Historial

Cronología del proyecto, de lo más nuevo a lo más viejo. Fechas absolutas. No se borra: se agrega.

---

## 2026-11-14

- **Culminación del Handoff y Documentación Técnica (10/10 guías en `docs/`):**
  - Se completó [`docs/02-arquitectura.md`](file:///Users/axeltapia/personal/NASA/handoff-space-NASA-challenge/docs/02-arquitectura.md) con diagrama Mermaid de integración de tres capas, responsabilidades por componente, pipeline de datos de 8 pasos y fundamentos de ingeniería (horizonte precomputado, vectores 3D normalizados y mock zero-dependency).
  - Se completó [`docs/06-contrato-y-errores.md`](file:///Users/axeltapia/personal/NASA/handoff-space-NASA-challenge/docs/06-contrato-y-errores.md) definiendo estándares estrictos (ISO 8601 UTC, grados decimales, unidades métricas), convención de versionado `/api/v1/`, catálogo exhaustivo de códigos de error (`ERR_INVALID_COORDINATES`, `ERR_DATE_OUT_OF_RANGE`, `ERR_TERRAIN_UNAVAILABLE`, `ERR_UPSTREAM_SERVICE`, `ERR_INVALID_PAYLOAD`, `ERR_SCENARIO_LIMIT_EXCEEDED`, `ERR_DUPLICATE_SCENARIOS`) y código de recuperación en cliente.
  - Se completó [`docs/07-ambientes-y-pruebas.md`](file:///Users/axeltapia/personal/NASA/handoff-space-NASA-challenge/docs/07-ambientes-y-pruebas.md) con matriz de ambientes, variables de entorno documentadas sin valores sensibles, descripción de fixtures polares y comandos cURL listos para copiar y pegar.
  - Se completó [`docs/08-pendientes.md`](file:///Users/axeltapia/personal/NASA/handoff-space-NASA-challenge/docs/08-pendientes.md) con la estrategia de desbloqueo simultáneo para frontend, backend y video, tabla de tareas operativas y roadmap v2 (mallas LROC NAC, análisis térmico y rutas de rovers).
  - Se completó [`docs/09-decisiones.md`](file:///Users/axeltapia/personal/NASA/handoff-space-NASA-challenge/docs/09-decisiones.md) registrando formalmente las decisiones arquitectónicas D-001 a D-005 y la versión canónica de `contracts/lunar-landing-api-contract.md`.

- **Creación del Servidor Mock Zero-Dependency (`mock/server.js`):**
  - Implementación completa en Node.js estándar sin paquetes de terceros (`http`, `url`).
  - Cobertura 100% de los endpoints de la API v1.0: `/api/v1/health`, `/api/v1/sites`, `/api/v1/terrain/patch`, `/api/v1/evaluate`, `/api/v1/compare`, y `/api/v1/psr/nearby`.
  - Inclusión de cabeceras CORS permisivas (`*`) para habilitar llamadas directas desde cualquier cliente web local (`http://localhost:5173`, etc.).
  - Actualización de [`mock/README.md`](file:///Users/axeltapia/personal/NASA/handoff-space-NASA-challenge/mock/README.md) con instrucciones de arranque y ejemplos cURL.

- **Apertura de la Iniciativa en Contexto de Sesiones:**
  - Creación de [`contexto-sesiones/iniciativas/lunar-landing-navigator/`](file:///Users/axeltapia/personal/NASA/handoff-space-NASA-challenge/contexto-sesiones/iniciativas/lunar-landing-navigator/) con sus artefactos `HANDOFF.md`, `CONOCIMIENTO.md` e `HISTORIAL.md`.
  - Actualización del índice maestro en [`contexto-sesiones/README.md`](file:///Users/axeltapia/personal/NASA/handoff-space-NASA-challenge/contexto-sesiones/README.md) y del estado general en [`README.md`](file:///Users/axeltapia/personal/NASA/handoff-space-NASA-challenge/README.md).
