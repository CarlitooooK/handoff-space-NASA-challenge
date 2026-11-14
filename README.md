# Handoff: Lunar Landing Site Navigator (South Pole Planning Tool)

Todo lo que necesita el equipo o agente para construir el visor interactivo y evaluador de sitios de aterrizaje del reto NASA Space Apps Challenge.

- **Dudas:** se escriben en [`PREGUNTAS.md`](PREGUNTAS.md) y ahí mismo se contestan. No se inventan datos ni reglas: si algo no está aquí ni en los contratos, se pregunta.
- **Agentes:** leer primero [`AGENTS.md`](AGENTS.md).

## En una línea

Herramienta intuitiva para evaluar y comparar rápidamente sitios y fechas de aterrizaje en el polo sur lunar, visualizando las posiciones del Sol y la Tierra respecto al horizonte para calcular el potencial de energía fotovoltaica y las ventanas de comunicación directa con la Tierra (Direct-to-Earth).

## Estado (Noviembre 2026)

| Pieza | Estado |
| --- | --- |
| Documentación de contexto y alcance (`docs/`) | Lista |
| Backend API REST v1 (`desktop` / Túnel HTTPS) | Listo (6 endpoints en vivo) |
| Contrato de API (`contracts/lunar-landing-api-contract.md` + `contracts/openapi.json`) | Listo (v1.0) |
| Guía de Consumo Frontend (`FRONTEND_API_GUIDE.md`) | Lista |
| Servidor mock / datasets precalculados | En curso |
| Frontend (Visor 2D/3D & Dashboard) | En curso |

## Documentos

| # | Documento | Qué tiene |
| --- | --- | --- |
| 0 | [Reto original (NASA)](docs/00-reto-original.md) | Texto completo y descripción oficial del reto en inglés |
| 1 | [Alcance](docs/01-alcance.md) | Qué hace la v1 y qué queda fuera |
| 2 | [Arquitectura](docs/02-arquitectura.md) | Las piezas, quién hace qué y por qué |
| 3 | [Datos y accesos](docs/03-datos-y-accesos.md) | Fuentes de datos, APIs, llaves y límites |
| 4 | [Reglas del reto](docs/04-reglas-del-reto.md) | Criterios, restricciones y entregables |
| 5 | [Flujos](docs/05-flujos.md) | Cada pantalla o caso de uso con sus datos |
| 6 | [Contrato y errores](docs/06-contrato-y-errores.md) | Formatos, versionado y códigos de error |
| 7 | [Ambientes y pruebas](docs/07-ambientes-y-pruebas.md) | URLs, datos de prueba y cómo correr en local |
| 8 | [Pendientes y fases](docs/08-pendientes.md) | Lo que falta, quién lo hace y cómo avanzar mientras tanto |
| 9 | [Decisiones](docs/09-decisiones.md) | Las decisiones ya tomadas y dónde están escritas |
| 10 | [Producto y necesidades](docs/10-producto-y-necesidades.md) | Desde quien consume: qué se construye y qué se necesita de la otra parte |

**Guía práctica para Frontend y agentes IA:** [`FRONTEND_API_GUIDE.md`](FRONTEND_API_GUIDE.md) (URLs activas, cliente `fetch` TypeScript, tipos y snippets listos para Three.js).

**Contratos** (`contracts/`): las interfaces entre las partes. Ver [`contracts/README.md`](contracts/README.md), [`contracts/lunar-landing-api-contract.md`](contracts/lunar-landing-api-contract.md) y [`contracts/openapi.json`](contracts/openapi.json).

**Simulado** (`mock/`): un servidor de mentira con los mismos cuerpos que el real, para avanzar sin esperar. Ver [`mock/README.md`](mock/README.md).

## Contexto de sesiones

El estado del trabajo y lo aprendido en cada sesión viven en [`contexto-sesiones/`](contexto-sesiones/README.md): un índice de iniciativas, conocimiento compartido por componente y plantillas para crear lo nuevo. Se lee al empezar y se deja al día al terminar.

## Cómo empezar

1. Leer el reto original en [`docs/00-reto-original.md`](docs/00-reto-original.md) y los documentos 1 a 4.
2. Revisar la guía de integración práctica en [`FRONTEND_API_GUIDE.md`](FRONTEND_API_GUIDE.md) y los contratos en [`contracts/lunar-landing-api-contract.md`](contracts/lunar-landing-api-contract.md) y [`contracts/openapi.json`](contracts/openapi.json).
3. Apuntar el Frontend a la URL pública HTTPS documentada en [`FRONTEND_API_GUIDE.md`](FRONTEND_API_GUIDE.md) (o levantar `mock/` si se requiere trabajar offline).
4. Anotar cada duda en `PREGUNTAS.md` en lugar de suponer.

## Origen

Las fuentes de verdad y requerimientos oficiales provienen de la convocatoria de NASA Space Apps Challenge y los datasets científicos de NASA/JPL (Horizons) y NASA/GSFC (LOLA). Este repositorio centraliza la especificación técnica para el desarrollo y handoff.
