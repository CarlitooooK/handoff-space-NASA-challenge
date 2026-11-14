# Instrucciones para agentes

Si eres un agente que desarrolla `<nombre-del-proyecto>` (la parte `<cliente | app | frontend | análisis>`), sigue esto.

## Fuentes

- **Contrato:** los archivos de [`contracts/`](contracts/README.md) (`lunar-landing-api-contract.md` y `openapi.json`: rutas, formatos, esquemas de datos). No uses endpoints, campos ni códigos que no estén ahí.
- **Guía de consumo Frontend:** [`FRONTEND_API_GUIDE.md`](FRONTEND_API_GUIDE.md) (URLs activas del backend, cliente `apiFetch`, tipos TS y snippets Three.js alineados con el contrato).
- **Reglas del proyecto:** `docs/`. Si un documento y un contrato chocan, manda el contrato y anótalo en `PREGUNTAS.md`.
- **Términos:** usa los de estos documentos. No introduzcas nombres ni modelos propios sin dejarlo escrito en `docs/09-decisiones.md`.

## Cuando no sepas algo

1. Busca en `docs/` y en los contratos.
2. Si no está, **no lo inventes**: agrega una pregunta en `PREGUNTAS.md` con el formato de ese archivo y sigue con lo que no dependa de la respuesta.
3. Mientras llega la respuesta, deja esa parte detrás de una interfaz o un valor de configuración, y márcala en el código con el id de la pregunta (`// P-001`).

## Reglas que no se rompen

- **Fuentes de verdad:** lo que dicen los contratos y `docs/` manda sobre lo que "parece lógico".
- **Errores:** decide por el `code` del error, nunca por el texto del mensaje.
- **Seguridad:**
  - Ninguna llave de API, token ni contraseña en el repo, en el código ni en los logs. Van en variables de entorno o en un gestor de secretos (ver `docs/03-datos-y-accesos.md`).
  - No guardes datos personales ni sensibles más de lo necesario.
- **Datos de prueba:** usa datos sintéticos o públicos. Antes de subir algo, revisa que no lleve información privada.
- `<Agrega aquí las reglas propias del proyecto: unidades, formatos de fecha, límites de uso de las APIs, etc.>`

## Qué no hace este proyecto

`<Lista lo que queda fuera de alcance para que nadie lo construya por error. Ver docs/01-alcance.md.>`

## Dónde escribir (no dupliques)

Este repo tiene dos capas. **Lee [`COMO-USAR-ESTE-REPO.md`](COMO-USAR-ESTE-REPO.md) antes de escribir**; manda sobre este resumen.

- **Handoff** (`docs/`, `contracts/`, `mock/`, `PREGUNTAS.md`): el **acuerdo** entre las partes. Solo lo acordado o verificado. Lo edita el dueño del tema.
- **Contexto de sesiones** ([`contexto-sesiones/`](contexto-sesiones/README.md)): la **memoria** del trabajo: estado, hallazgos, cronología y supuestos marcados como tales. Lo edita quien trabaja la sesión.
- **Un dato vive en un solo lugar; los demás lo citan** (por ruta o id), nunca lo copian. Busca antes de escribir.
- **Al empezar:** `git pull --rebase`, lee `contexto-sesiones/README.md` y el `HANDOFF.md` de tu iniciativa, y revisa `PREGUNTAS.md` y `contracts/`.
- **Al terminar:** reescribe el `HANDOFF.md` de tu iniciativa, agrega arriba en `HISTORIAL.md` y, si aprendiste algo general, súbelo a `_compartido/`.
- **No** edites `docs/` ni `contracts/` de una parte que no es tuya: pregunta en `PREGUNTAS.md`.
- **Nunca** secretos, tokens, llaves ni datos personales, en ninguna capa. Separa lo verificado de lo supuesto.
