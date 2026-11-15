# Consola Frontend (`luna-landing-navigator-console`) — conocimiento base

Cliente web React del Lunar Landing Site Navigator: render de fondo (el globo) con paneles de vidrio encima, línea de tiempo y pantallas Simulate, Compare, History y Missions, contra la API v1.2 o el mock. Documento transversal: lo que no cambia entre sesiones. El trabajo puntual vive en `iniciativas/frontend-console/`.

Verificado el `2026-11-14` leyendo el código de la consola (PR `#6`) y probándolo contra la API en vivo y el globo en local.

## Dónde vive
- **Repo:** `https://github.com/CarlitooooK/luna-landing-navigator-console` (rama `main`). Este handoff es la fuente de verdad; la consola solo lo consume.
- **Mapa interno completo:** `docs/` del repo de la consola. Responde qué render se ve en cada caso y de dónde sale (`02-renders.md`), qué pide a la API y qué campos usa (`03-datos-y-api.md`), qué mensajes manda al globo y cuándo (`04-puente-globo.md`), qué hace cada control (`05-pantallas.md`) y qué falta refinar (`06-limitaciones-y-pendientes.md`). Aquí no se copia.
- **Cómo correrlo:** `npm install` → `npm run sync:handoff` → `npm run mock` (o la API de `docs/07`) → `npm run dev`. Con el globo: ver `docs/11` §10.
- **Ambientes:** `VITE_API_BASE_URL` (incluye `/api/v1`) y `VITE_GLOBE_URL`. URLs vigentes: `docs/07-ambientes-y-pruebas.md`.

## Arquitectura
React 19 + TypeScript + Vite, Tailwind v4, Three.js con React Three Fiber/drei, Zustand y Vitest.
- `src/core/api`: único cliente HTTP, un método por endpoint usado, errores por `error.code`.
- `src/core/store`: `useMissionStore` (configuración · datos de la API · reproducción), `useGlobeStore` (enlace con el globo y escena de alunizaje) y `useHistoryStore` (`localStorage`).
- `src/features/viewport3d`: fondo (`SceneBackground`), iframe del globo y puente (`useGlobeBridge`, único que habla con el iframe), escena local Three.js.
- `src/types/api.d.ts`: generado desde `contracts/openapi.json` (v1.2).

## Cómo funciona
1. Al arrancar consulta `/health` y `/sites`; los sitios van al globo como pines.
2. "Run simulation" pide en paralelo `/evaluate`, `/terrain/patch` y `/psr/nearby`. El fondo **se queda en el globo** (D-015): el globo vuela al sitio y recibe Sol, Tierra, PSR y el estado del pin.
3. El scrubber recorre `evaluation.timeline[]` en memoria (sin red) y reenvía `sun_vector_3d` / `earth_vector_3d` al globo, una vez por fotograma.
4. "Landing scene" corre la escena de alunizaje del globo en el mismo render. "Terrain detail" funde encima la escena local del parche de 12 km.
5. Sin globo (`VITE_GLOBE_URL` vacío o sin `READY` en 8 s), la escena local es el fondo al evaluar.

## Dependencias y contratos
- Rutas, esquemas y errores: `contracts/` y `docs/06-contrato-y-errores.md`. Guía de consumo: `FRONTEND_API_GUIDE.md` y `docs/12-contrato-api-v1.2.md`.
- Decisiones que la condicionan: `D-002`, `D-003`, `D-006`, `D-008`, `D-010`, `D-011`, `D-013`, `D-015` (`docs/09-decisiones.md`).
- Globo: `_compartido/lunar-globe-renderer.md` y `docs/11-integracion-globo-consola.md`. Backend: `_compartido/backend-api.md`. Mock: `mock/README.md`.

## Cosas que muerden
- `mock/server.js` es CommonJS: la consola aísla su copia con un `package.json` `{"type":"commonjs"}` dentro de `.handoff/` (`P-004`).
- `openapi-typescript@7` pide `typescript@^5`; se ejecuta vía `npx` (`P-005`). Con v1.2 el tipo generado de `CompareRequest` exige `include_timeline` (tiene valor por defecto): la consola lo manda en `false`.
- El mock no manda `engine` en `/health`: la consola lo usa para rotular "Sample data".
- La API se consume solo desde la URL de Producción de `docs/07` (backend oficial, v1.3, D-017). La URL del backend de prueba (v1.1) se apagó.
- En local, si el puerto 3000 está ocupado por otra app, el mock no arranca y la consola da `ERR_NETWORK`: córrelo con `PORT=<otro> npm run mock` y ajusta `VITE_API_BASE_URL`.
- El globo y la consola usan el puerto 5173 por defecto: el globo va en 5174 (`docs/11` §3).

## Seguridad
- Sin secretos en el repo: `.env.local` está ignorado y `.env.example` solo trae nombres.
- Mensajes con el globo filtrados por `source` y `origin` exactos (`docs/11` §3).
- La copia local del handoff (`.handoff/`) es de solo lectura y no se versiona.
