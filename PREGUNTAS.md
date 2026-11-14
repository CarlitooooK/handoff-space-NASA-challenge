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

### P-007: Dirección del Sol y la Tierra para la vista global (sin sitio)

- **Pregunta:** El globo (fase 2) dibuja el Sol y la Tierra en el cielo lunar a partir de `sun_vector_3d` / `earth_vector_3d`, pero hoy solo existen dentro de `POST /evaluate`, que exige un sitio. ¿Puede el backend exponer, para una fecha UTC, las direcciones del Sol y de la Tierra vistas desde el **centro de la Luna** en el marco fijo lunar (`MOON_ME`), por ejemplo `GET /api/v1/ephemeris?utc=…`? Idealmente también la distancia a la Tierra, que hoy el globo fija en la media de 384 400 km.
- **Contexto:** `docs/11-integracion-globo-consola.md` sección 7; D-002 y D-006 (el cliente no calcula física). Sin esta respuesta el globo dibuja la Tierra en la posición media (lon 0°, lat 0°) y **no dibuja el Sol**.
- **Bloquea:** no. Alternativa mientras llega: la consola evalúa un sitio de referencia y reenvía sus vectores (`SET_SUN_LOCAL`, `SET_EARTH_LOCAL`); el error angular de tomar un sitio en vez del centro es ≈0,26° para la Tierra y despreciable para el Sol.
- **Preguntó:** Globo (`lunar-globe-renderer`) · 2026-11-14
- **Respuesta:** _pendiente_
- **Respondió:** —

### P-008: Teselas de terreno del polo sur para el globo

- **Pregunta:** El globo usa hoy el DEM global de Moon Trek (~666 m/px, pasos de ~77 m, calibrado contra `terrain/patch`: RMSE ≈ 127 m). El backend tiene LOLA a 80 m/px al sur de -80° (`LDEM_80S_80MPP_ADJ`). ¿Puede servir ese DEM como teselas (por ejemplo `GET /api/v1/terrain/tiles/{z}/{x}/{y}.png`, esquema geográfico 2×1 en el nivel 0 como el de Moon Trek, elevación en 16 bits o formato Terrarium) para sustituir el relieve global solo en la región polar?
- **Contexto:** `lunar-globe-renderer`, `src/terrain.ts` (la fuente es una sola función, `fetchDemTile`, fácil de cambiar). Sin esto el relieve del polo se ve suave a menos de ~50 km de altura.
- **Bloquea:** no. Es una mejora de calidad; el globo funciona con el DEM de Moon Trek.
- **Preguntó:** Globo (`lunar-globe-renderer`) · 2026-11-14
- **Respuesta:** _pendiente_
- **Respondió:** —

---

## Respondidas

### P-006: Qué se ve de fondo en la consola: globo, escena local o ambos por modo

- **Pregunta:** El Figma (`docs/ideas/console-ui-figma.md`) asume un render siempre de fondo, hoy la escena local de terreno en Three.js. El globo de D-011 (CesiumJS por iframe) también quiere ser fondo. ¿Se acepta la propuesta de `docs/11-integracion-globo-consola.md`: globo en la vista global (sin sitio o modo Explore) y escena local al evaluar, un solo render visible a la vez, y el reparto de responsabilidades de la sección 1?
- **Contexto:** `docs/11-integracion-globo-consola.md`, carril 1 y 3 de la consola, hueco del iframe en el cascarón.
- **Bloquea:** no (el iframe y el puente `useGlobeBridge` se pueden construir ya).
- **Preguntó:** Globo (`lunar-globe-renderer`) · 2026-11-14
- **Respuesta:** Se acepta `docs/11`: globo en la vista global (sin sitio o en Explore), escena local al evaluar, un solo render visible a la vez y el reparto de la sección 1 (D-013). Verificado contra la API pública de [`docs/07-ambientes-y-pruebas.md`](docs/07-ambientes-y-pruebas.md): ya entrega lo que necesita el puente sin cambios de contrato. `/sites` da los `13` sitios con `id`, `name`, `category`, `lat` y `lon` (`SET_SITES`). `/evaluate` da `status` para los pines y `timeline[].sun_vector_3d` / `earth_vector_3d` en D-008 (`SET_SUN_LOCAL`, `SET_EARTH_LOCAL`), y acepta cualquier punto de `GLOBE_CLICKED` en `[-90, 90]` (respuestas < 0.5 s). `/psr/nearby` da los polígonos para `SET_PSR`. Notas para cada parte: (1) **Globo:** `polarSouthToLatLon` (`src/geo.ts`) usa `y = −ρ·cos λ`, calibrado con el ejemplo anterior del contrato. Según D-012 es `y = +ρ·cos λ` (`lon = atan2(x, y)`), que es lo que ya devuelve la API pública: sin ese cambio `SET_PSR` dibuja los PSR reflejados (Shackleton cae en lon ≈ 317° en vez de 222.7°). La constante `SAMPLE` de `src/main.ts` tiene la `z` con el signo contrario al de la API (Shackleton el 2026-12-01: `[0.842, 0.029, -0.539]`); la conversión D-008 → ENU de `setSunFromLocal` está bien. (2) **Consola:** `SET_SUN_LOCAL` lleva `{lat, lon, vector}` del sitio evaluado (README del globo). Fuera del Polo Sur (`lat > -80`) el terreno tiene menos resolución: para esos sitios usa `size_km` de 30 a 40 en `/terrain/patch`. `SET_TRAJECTORY` sigue como "Sample data" (no hay endpoint). (3) **Demo:** las teselas vienen de `trek.nasa.gov`; pruébalas en la red del evento. La vista global sin sitio se trata en `P-007`.
- **Respondió:** Backend / Integración · 2026-11-14 (Frontend confirma al revisar el PR)


### P-001: Formato de error del backend en vivo

- **Pregunta:** `docs/06-contrato-y-errores.md` documenta `{ error: { code, message, details } }` y el mock lo cumple, pero `contracts/openapi.json` solo define `HTTPValidationError` (`{ detail }`) y `FRONTEND_API_GUIDE.md` lee `detail`. ¿Qué formato devuelve el backend en vivo y se emiten los `ERR_*` de `docs/06`?
- **Contexto:** Manejo de errores en el cliente (`src/core/api/errors.ts`); hoy soporta ambos formatos. Decidimos por `error.code` (AGENTS.md).
- **Bloquea:** no
- **Preguntó:** Frontend (luna-landing-navigator-console) · 2026-11-14
- **Respuesta:** La API pública (URL en [`docs/07-ambientes-y-pruebas.md`](docs/07-ambientes-y-pruebas.md)) y el mock responden los errores `400`, `404`, `422` y `503` con `{ "error": { "code": "ERR_*", "message": "...", "details": ... } }` (`ErrorResponse` en [`contracts/openapi.json`](contracts/openapi.json)). Decide siempre por `error.code` según el catálogo de [`docs/06-contrato-y-errores.md`](docs/06-contrato-y-errores.md); `detail` puede venir por compatibilidad y solo sirve como respaldo.
- **Respondió:** Backend / Integración · 2026-11-14

### P-002: URL base del mock

- **Pregunta:** `docs/07-ambientes-y-pruebas.md` da `http://localhost:3000` como valor de `VITE_API_BASE_URL` para el mock, pero el mock sirve bajo `/api/v1/*`. ¿El valor correcto es `http://localhost:3000/api/v1`?
- **Contexto:** `docs/07`, tabla de variables de entorno. Usamos `http://localhost:3000/api/v1`.
- **Bloquea:** no
- **Preguntó:** Frontend (luna-landing-navigator-console) · 2026-11-14
- **Respuesta:** Para el mock, sí: `http://localhost:3000/api/v1`. Pero el ambiente para integrar y para la demo es la **API pública HTTPS** de [`docs/07-ambientes-y-pruebas.md`](docs/07-ambientes-y-pruebas.md): pon esa URL base (ya termina en `/api/v1`) en `VITE_API_BASE_URL`. No requiere VPN, Tailscale ni acceso al servidor, y tiene CORS abierto. El mock queda solo para trabajar sin internet. Si la URL pública cambia, solo cambian `docs/07` y tu `.env`.
- **Respondió:** Backend / Integración · 2026-11-14

### P-003: Rango de latitud permitido

- **Pregunta:** `docs/06` limita `lat` a `[-90.0, -80.0]` (y el mock rechaza fuera de ese rango), pero el contrato y `FRONTEND_API_GUIDE.md` aceptan `-90..90` (sitios Apollo globales). ¿Cuál es la regla vigente en `/evaluate`, `/compare` y `/terrain/patch`?
- **Contexto:** Validación de entrada y selección de sitios Apollo en el selector. Hoy no validamos el rango en el cliente.
- **Bloquea:** no
- **Preguntó:** Frontend (luna-landing-navigator-console) · 2026-11-14
- **Respuesta:** `lat` en `[-90.0, 90.0]` y `lon` en `[-180.0, 360.0]` para `/terrain/patch`, `/evaluate`, `/compare` y `/psr/nearby`, igual en la API pública y en el mock. `/sites` incluye los sitios Apollo (`apollo-11`, `apollo-15`, `apollo-17`): `13` sitios en la API pública y `8` en el mock. Fuera de rango responde `422` con `ERR_INVALID_COORDINATES`. El Polo Sur (`lat <= -80`) tiene más resolución de terreno que el resto de la Luna.
- **Respondió:** Backend / Integración · 2026-11-14

### P-004: Estado real de `mock/`

- **Pregunta:** `contexto-sesiones/iniciativas/handoff-api-frontend/HANDOFF.md` dice que el servidor offline en `mock/` está "No iniciado", pero `README.md` y `lunar-landing-navigator/HANDOFF.md` lo dan por listo (y funciona). Además `mock/server.js` es CommonJS y falla dentro de un proyecto con `"type": "module"` sin un `package.json` local. ¿Se actualiza el estado y se documenta el requisito?
- **Contexto:** Desarrollo local con el mock; aislamos la copia con `.handoff/package.json` (lo escribe `scripts/sync-handoff.sh`).
- **Bloquea:** no
- **Preguntó:** Frontend (luna-landing-navigator-console) · 2026-11-14
- **Respuesta:** Sí: el mock está operativo y alineado al contrato v1.1 (`8` sitios, `lat [-90.0, 90.0]`, fechas `1900..2050`, `ErrorResponse`). [`mock/package.json`](mock/package.json) declara `{"type": "commonjs"}` para que no falle desde proyectos ESM. Es para trabajar sin internet; la integración se hace contra la API pública (`P-002`). Se cerró la iniciativa duplicada `handoff-api-frontend/` (se conserva su historial); el estado vive en [`contexto-sesiones/iniciativas/lunar-landing-navigator/HANDOFF.md`](contexto-sesiones/iniciativas/lunar-landing-navigator/HANDOFF.md).
- **Respondió:** Backend / Integración · 2026-11-14

### P-005: Dependencia de `openapi-typescript` con TypeScript 7

- **Pregunta:** `docs/07` y el HANDOFF sugieren `npx openapi-typescript contracts/openapi.json -o src/types/api.d.ts`. `openapi-typescript@7` exige `typescript@^5`, lo que choca con scaffolds recientes (Vite trae TS 7). ¿Se acepta ejecutarlo siempre vía `npx` (sin instalarlo) o se prefiere fijar TS 5?
- **Contexto:** Generación de tipos (`npm run gen:types`). Hoy se ejecuta vía `npx`.
- **Bloquea:** no
- **Preguntó:** Frontend (luna-landing-navigator-console) · 2026-11-14
- **Respuesta:** Sí, ejecútalo con `npx openapi-typescript contracts/openapi.json -o src/types/api.d.ts` bajo demanda, sin instalarlo en `package.json` ni bajar TypeScript. También puedes generarlo desde el esquema en vivo: `/openapi.json` sobre la URL pública de [`docs/07-ambientes-y-pruebas.md`](docs/07-ambientes-y-pruebas.md). Ambos incluyen `ErrorResponse` y `ErrorDetail`.
- **Respondió:** Backend / Integración · 2026-11-14
