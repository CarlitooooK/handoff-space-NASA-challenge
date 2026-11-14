# Consola Frontend (`luna-landing-navigator-console`) — conocimiento base

Cliente web React del Lunar Landing Site Navigator: dashboard, visor 3D y línea de tiempo que consumen la API v1 (o el mock). Documento transversal: lo que no cambia entre sesiones. El trabajo puntual vive en `iniciativas/frontend-console/`.

Verificado el `2026-11-14` leyendo el código del repo de la consola y probándolo contra `mock/server.js`. Lo no verificado se marca.

## Dónde vive
- **Repo / ubicación:** `https://github.com/CarlitooooK/luna-landing-navigator-console` (rama `main`). Este handoff es la fuente de verdad; la consola solo lo consume.
- **Cómo correrlo:** `npm install` → `npm run sync:handoff` → `npm run mock` → `npm run dev`. Otros comandos (`gen:types`, `typecheck`, `test`, `lint`, `build`) en el `CLAUDE.md` de ese repo.
- **Ambientes:** la URL de la API va solo en `VITE_API_BASE_URL` (incluye `/api/v1`). URLs vigentes: ver `docs/07-ambientes-y-pruebas.md`.

## Arquitectura
React 19 + TypeScript + Vite, Tailwind v4, Three.js con React Three Fiber/drei y Zustand. Estructura por carriles (propuesta en `docs/ideas/frontend-architecture-guide.md`, no vinculante):
- `src/core/{api,store,utils}`: cliente HTTP (un método por endpoint del contrato), store con tres velocidades (configuración · datos pesados · reproducción) y utilidades puras.
- `src/features/{layout,sidebar,viewport3d,timeline,comparator}`: módulos por funcionalidad.
- `src/types/api.d.ts`: generado desde `contracts/openapi.json`; `src/types/index.ts` define alias.

## Cómo funciona
1. Al arrancar consulta `/health` y `/sites`.
2. "Evaluar misión" lanza en paralelo `/evaluate`, `/terrain/patch` y `/psr/nearby`.
3. El slider recorre `evaluation.timeline[]` en memoria (sin red) y mueve las luces del Sol y la Tierra con `sun_vector_3d` / `earth_vector_3d`.

## Dependencias y contratos
- Rutas, esquemas y errores: `contracts/` y `docs/06-contrato-y-errores.md`. Guía de consumo: `FRONTEND_API_GUIDE.md`.
- Decisiones que la condicionan: `D-002`, `D-003`, `D-006`, `D-008` en `docs/09-decisiones.md`.
- Backend: `_compartido/backend-api.md`. Mock: `mock/README.md`.
- Globo lunar incrustable (D-011): `_compartido/lunar-globe-renderer.md`. Aún no integrado en la consola.

## Cosas que muerden
- `mock/server.js` es CommonJS; dentro de un proyecto `"type": "module"` falla con `require is not defined`. La consola aísla su copia con un `package.json` `{"type":"commonjs"}` dentro de `.handoff/` (`P-004`, documentado en `mock/README.md`).
- `openapi-typescript@7` pide `typescript@^5`; con Vite reciente (TS 7) se ejecuta vía `npx`, sin instalarlo (`P-005`).
- El mock sirve bajo `/api/v1/*`, aunque `docs/07` da `http://localhost:3000` como base (`P-002`).
- El mock devuelve `error.code` (formato de `docs/06`), pero `contracts/openapi.json` solo define `{detail}` (`P-001`): el cliente soporta ambos.
- El mock rechaza `lat` fuera de `[-90,-80]`; el backend en vivo acepta `-90..90` (`P-003`), así que Apollo no se prueba offline.
- El mock tiene 5 sitios y 4 PSR; el backend en vivo, 13 y 1,531 (ver `docs/07`).

## Seguridad
- Sin secretos en el repo: `.env.local` está ignorado y `.env.example` solo trae nombres y URLs públicas.
- La copia local del handoff (`.handoff/`) es de solo lectura y no se versiona.
