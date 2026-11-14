# Preguntas y respuestas

Aquí quien desarrolla una parte (persona o agente) pregunta, y quien tiene la otra parte contesta. Una pregunta por entrada.

## Cómo preguntar

1. Copia la plantilla al final de la sección **Abiertas**, con el siguiente id libre (`P-001`, `P-002`…).
2. Llena **Pregunta**, **Contexto** (pantalla, endpoint o documento) y **Bloquea** (sí/no).
3. Haz commit en una rama y abre un PR, o súbelo directo a `main` si así lo acordaron. En el commit pon el id: `pregunta P-001: ...`.
4. Mientras no haya respuesta, sigue con lo demás y marca en el código el punto pendiente con el id.

Quien responde llena **Respuesta**, **Respondió** y la fecha, mueve la entrada a **Respondidas** y, si cambia un documento o un contrato, lo actualiza en el mismo commit.

```markdown
### P-000: <título corto>

- **Pregunta:** …
- **Contexto:** …
- **Bloquea:** sí | no
- **Preguntó:** <nombre o agente> · <fecha>
- **Respuesta:** _pendiente_
- **Respondió:** —
```

---

## Abiertas

### P-001: Formato de error del backend en vivo

- **Pregunta:** `docs/06-contrato-y-errores.md` documenta `{ error: { code, message, details } }` y el mock lo cumple, pero `contracts/openapi.json` solo define `HTTPValidationError` (`{ detail }`) y `FRONTEND_API_GUIDE.md` lee `detail`. ¿Qué formato devuelve el backend en vivo y se emiten los `ERR_*` de `docs/06`?
- **Contexto:** Manejo de errores en el cliente (`src/core/api/errors.ts`); hoy soporta ambos formatos. Decidimos por `error.code` (AGENTS.md).
- **Bloquea:** no
- **Preguntó:** Frontend (luna-landing-navigator-console) · 2026-11-14
- **Respuesta:** _pendiente_
- **Respondió:** —

### P-002: URL base del mock

- **Pregunta:** `docs/07-ambientes-y-pruebas.md` da `http://localhost:3000` como valor de `VITE_API_BASE_URL` para el mock, pero el mock sirve bajo `/api/v1/*`. ¿El valor correcto es `http://localhost:3000/api/v1`?
- **Contexto:** `docs/07`, tabla de variables de entorno. Usamos `http://localhost:3000/api/v1`.
- **Bloquea:** no
- **Preguntó:** Frontend (luna-landing-navigator-console) · 2026-11-14
- **Respuesta:** _pendiente_
- **Respondió:** —

### P-003: Rango de latitud permitido

- **Pregunta:** `docs/06` limita `lat` a `[-90.0, -80.0]` (y el mock rechaza fuera de ese rango), pero el contrato y `FRONTEND_API_GUIDE.md` aceptan `-90..90` (sitios Apollo globales). ¿Cuál es la regla vigente en `/evaluate`, `/compare` y `/terrain/patch`?
- **Contexto:** Validación de entrada y selección de sitios Apollo en el selector. Hoy no validamos el rango en el cliente.
- **Bloquea:** no
- **Preguntó:** Frontend (luna-landing-navigator-console) · 2026-11-14
- **Respuesta:** _pendiente_
- **Respondió:** —

### P-004: Estado real de `mock/`

- **Pregunta:** `contexto-sesiones/iniciativas/handoff-api-frontend/HANDOFF.md` dice que el servidor offline en `mock/` está "No iniciado", pero `README.md` y `lunar-landing-navigator/HANDOFF.md` lo dan por listo (y funciona). Además `mock/server.js` es CommonJS y falla dentro de un proyecto con `"type": "module"` sin un `package.json` local. ¿Se actualiza el estado y se documenta el requisito?
- **Contexto:** Desarrollo local con el mock; aislamos la copia con `.handoff/package.json` (lo escribe `scripts/sync-handoff.sh`).
- **Bloquea:** no
- **Preguntó:** Frontend (luna-landing-navigator-console) · 2026-11-14
- **Respuesta:** _pendiente_
- **Respondió:** —

### P-005: Dependencia de `openapi-typescript` con TypeScript 7

- **Pregunta:** `docs/07` y el HANDOFF sugieren `npx openapi-typescript contracts/openapi.json -o src/types/api.d.ts`. `openapi-typescript@7` exige `typescript@^5`, lo que choca con scaffolds recientes (Vite trae TS 7). ¿Se acepta ejecutarlo siempre vía `npx` (sin instalarlo) o se prefiere fijar TS 5?
- **Contexto:** Generación de tipos (`npm run gen:types`). Hoy se ejecuta vía `npx`.
- **Bloquea:** no
- **Preguntó:** Frontend (luna-landing-navigator-console) · 2026-11-14
- **Respuesta:** _pendiente_
- **Respondió:** —

---

## Respondidas

_Sin respuestas todavía._
