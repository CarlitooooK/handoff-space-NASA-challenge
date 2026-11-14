# Handoff: Lunar Landing Site Navigator (South Pole Planning Tool)

Todo lo que necesita el equipo o agente para construir el visor interactivo y evaluador de sitios de aterrizaje del reto NASA Space Apps Challenge.

- **Dudas:** se escriben en [`PREGUNTAS.md`](PREGUNTAS.md) y ahí mismo se contestan. No se inventan datos ni reglas: si algo no está aquí ni en los contratos, se pregunta.
- **Agentes:** leer primero [`AGENTS.md`](AGENTS.md).

## En una línea

Herramienta intuitiva para evaluar y comparar rápidamente sitios y fechas de aterrizaje en el polo sur lunar, visualizando las posiciones del Sol y la Tierra respecto al horizonte para calcular el potencial de energía fotovoltaica y las ventanas de comunicación directa con la Tierra (Direct-to-Earth).

## Estado (Noviembre 2026)

| Pieza | Estado |
| --- | --- |
| Documentación de contexto y alcance (`docs/`) | Lista (10/10 guías completas) |
| Backend API REST v1 (`desktop` / Túnel HTTPS) | Listo (6 endpoints en vivo, `13` sitios y errores `ErrorResponse`) |
| Contrato de API (`contracts/lunar-landing-api-contract.md` + `contracts/openapi.json`) | Listo (v1.1 alineado con OpenAPI) |
| Guía de Consumo Frontend (`FRONTEND_API_GUIDE.md`) | Lista |
| Servidor mock autónomo zero-dependency (`mock/`) | Listo (`mock/server.js` + `mock/package.json` en puerto 3000, `8` sitios) |
| Frontend (Visor 2D/3D & Dashboard) | En curso: fase 1 mockeada, ver [`frontend-console`](contexto-sesiones/iniciativas/frontend-console/HANDOFF.md) |
| Globo lunar 3D (CesiumJS), repo [`luna-render-nasa-space-challenge`](https://github.com/CarlitooooK/luna-render-nasa-space-challenge) | Fase 1 lista y verificada; falta integrarlo en la consola, ver [`lunar-globe-renderer`](contexto-sesiones/iniciativas/lunar-globe-renderer/HANDOFF.md) |
| Handoff de iniciativas de sesión | Activo ([`contexto-sesiones/`](contexto-sesiones/README.md)) |

## Estructura del Repositorio: Handoff vs. Contexto de Sesiones

Para mantener la claridad del proyecto, este repositorio separa estrictamente dos capas:

1. **El Handoff (`docs/`, `contracts/`, `mock/`):** Es el **acuerdo técnico y contractual** que define *qué se construye*, bajo qué reglas científicas y cómo se comunican las piezas. Es la fuente de verdad inmutable para quien desarrolla el sistema.
2. **El Contexto de Sesiones (`contexto-sesiones/`):** Es la **memoria viva y bitácora de trabajo** entre sesiones (desarrolladores o agentes). Documenta el avance (`HISTORIAL.md`), el relevo de tareas (`HANDOFF.md` de la sesión) y lo aprendido (`CONOCIMIENTO.md`).

> **Qué va en cada capa, cuándo se escribe y cómo evitar duplicar:** [`COMO-USAR-ESTE-REPO.md`](COMO-USAR-ESTE-REPO.md). Léelo antes de escribir.

---

## 1. El Handoff (Plan Oficial de Documentación)

| # | Documento | Qué tiene |
| --- | --- | --- |
| 0 | [Reto original (NASA)](docs/00-reto-original.md) | Texto completo y descripción oficial del reto en inglés |
| 1 | [Alcance](docs/01-alcance.md) | Qué hace la v1 y qué queda fuera |
| 2 | [Arquitectura](docs/02-arquitectura.md) | Las piezas, quién hace qué y por qué |
| 3 | [Datos y accesos](docs/03-datos-y-accesos.md) | Fuentes de datos, APIs, llaves y límites |
| 4 | [Reglas del reto](docs/04-reglas-del-reto.md) | Criterios (rúbrica 12.5% c/u), restricciones y entregables |
| 5 | [Flujos](docs/05-flujos.md) | Cada pantalla o caso de uso con sus datos |
| 6 | [Contrato y errores](docs/06-contrato-y-errores.md) | Formatos, versionado y códigos de error |
| 7 | [Ambientes y pruebas](docs/07-ambientes-y-pruebas.md) | URLs activas, mock local, datos de prueba y cómo correr |
| 8 | [Pendientes y fases](docs/08-pendientes.md) | Lo que falta, quién lo hace y cómo avanzar mientras tanto |
| 9 | [Decisiones](docs/09-decisiones.md) | Las decisiones ya tomadas (ADRs) y dónde están escritas |
| 10 | [Producto y necesidades](docs/10-producto-y-necesidades.md) | Desde quien consume: qué se construye y qué se necesita de la otra parte |
| 11 | [Integración globo-consola](docs/11-integracion-globo-consola.md) | Reparto de responsabilidades y conexión entre el globo lunar y la consola (propuesta, `P-006`) |

### Interfaces, Guías y Servidor Simulado
- **Guía práctica Frontend / IA:** [`FRONTEND_API_GUIDE.md`](FRONTEND_API_GUIDE.md) (URLs activas, cliente `fetch` TypeScript, tipos y snippets Three.js).
- **Contratos** (`contracts/`): Las interfaces formales entre partes. Ver [`contracts/README.md`](contracts/README.md), [`contracts/lunar-landing-api-contract.md`](contracts/lunar-landing-api-contract.md) y [`contracts/openapi.json`](contracts/openapi.json).
- **Simulado** (`mock/`): Servidor mock zero-dependency con respuestas en milisegundos para construir sin esperar. Ver [`mock/README.md`](mock/README.md).

### Ideas y Propuestas de Referencia (No Vinculantes)
Exploraciones conceptuales y sugerencias de diseño que **no** forman parte del contrato formal del handoff:
- [Propuesta de Arquitectura Frontend](docs/ideas/frontend-architecture-guide.md): Idea general para estructurar un cliente en React + Zustand + Three.js a 60 FPS.
- [Propuesta UI/UX (TDD)](docs/ideas/lunar-landing-ui-ux-tdd.md): Boceto visual conceptual ("Deep Space Mission Control"), paleta de color y layout sugerido.

---

## 2. Contexto de Sesiones (Memoria de Trabajo)

El estado del trabajo y lo aprendido en cada sesión viven en [`contexto-sesiones/`](contexto-sesiones/README.md): un índice de iniciativas, conocimiento compartido por componente y bitácoras para continuar el trabajo sin perder contexto. Se lee al empezar una sesión y se actualiza al terminarla.
- **Iniciativas activas:**
  - [`contexto-sesiones/iniciativas/lunar-landing-navigator/HANDOFF.md`](contexto-sesiones/iniciativas/lunar-landing-navigator/HANDOFF.md) — Infraestructura general del handoff, API en vivo, contratos, mock server y documentación.
  - [`contexto-sesiones/iniciativas/handoff-api-frontend/HANDOFF.md`](contexto-sesiones/iniciativas/handoff-api-frontend/HANDOFF.md) — Cerrada: guía de consumo y respuestas `P-001`..`P-005`; continúa en `lunar-landing-navigator`.
  - [`contexto-sesiones/iniciativas/frontend-console/HANDOFF.md`](contexto-sesiones/iniciativas/frontend-console/HANDOFF.md) — Consola web React: dashboard, visor 3D y timeline contra el mock/API.

## Cómo empezar

1. Leer el reto original en [`docs/00-reto-original.md`](docs/00-reto-original.md) y los documentos 1 a 4.
2. Revisar la especificación de API en [`contracts/lunar-landing-api-contract.md`](contracts/lunar-landing-api-contract.md) o [`FRONTEND_API_GUIDE.md`](FRONTEND_API_GUIDE.md).
3. Levantar el simulado de `mock/` (`node mock/server.js`) o conectar al backend en vivo.
4. Anotar cada duda en `PREGUNTAS.md` en lugar de suponer.
5. Cambiar el simulado por el servicio real cuando esté disponible.

## Origen

Las fuentes de verdad y requerimientos oficiales provienen de la convocatoria de NASA Space Apps Challenge y los datasets científicos de NASA/JPL (Horizons) y NASA/GSFC (LOLA). Este repositorio centraliza la especificación técnica para el desarrollo y handoff.
