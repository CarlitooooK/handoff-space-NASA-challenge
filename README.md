# Handoff: <nombre-del-proyecto> (NASA challenge)

Todo lo que necesita `<la parte que construye: persona o agente>` para construir `<qué se construye>` del reto `<nombre del reto>`.

- **Dueño de `<la otra parte>`:** `<nombre / equipo>`.
- **Dudas:** se escriben en [`PREGUNTAS.md`](PREGUNTAS.md) y ahí mismo se contestan. No se inventan datos ni reglas: si algo no está aquí ni en los contratos, se pregunta.
- **Agentes:** leer primero [`AGENTS.md`](AGENTS.md).

> **Plantilla.** Este repo nació como esqueleto. Completa los marcadores `<...>` y las secciones `_Por completar_`, y borra este aviso.

## En una línea

`<Una frase: qué hace la solución y para quién.>`

## Estado (<fecha>)

| Pieza | Estado |
| --- | --- |
| `<Pieza 1>` | `<No iniciada | En curso | Lista>` |
| `<Pieza 2>` | `<…>` |

## Documentos

| # | Documento | Qué tiene |
| --- | --- | --- |
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

**Contratos** (`contracts/`): las interfaces entre las partes. Ver [`contracts/README.md`](contracts/README.md).

**Simulado** (`mock/`): un servidor de mentira con los mismos cuerpos que el real, para avanzar sin esperar. Ver [`mock/README.md`](mock/README.md).

## Cómo empezar

1. Leer los documentos 1 a 4.
2. Levantar el simulado de `mock/` y construir contra él, detrás de una interfaz.
3. Anotar cada duda en `PREGUNTAS.md` en lugar de suponer.
4. Cambiar el simulado por el servicio real cuando esté disponible.

## Origen

Las fuentes de verdad están en `<repo o servicio de origen>`. Este repo es una copia para el handoff; si algo difiere, manda el origen. Las versiones copiadas están en [`docs/09-decisiones.md`](docs/09-decisiones.md).
