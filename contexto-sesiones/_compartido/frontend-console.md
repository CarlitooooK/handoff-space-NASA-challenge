# Consola Frontend (`luna-landing-navigator-console`) — conocimiento base

Cliente web React del Lunar Landing Site Navigator: render de fondo (el globo) con paneles de vidrio encima, línea de tiempo y pantallas Simulate, Compare, History y Missions, contra el Backend oficial de la API (v1.3). No usa el mock. Documento transversal: lo que no cambia entre sesiones. El trabajo puntual vive en `iniciativas/frontend-console/`.

Verificado el `2026-11-15` leyendo el código de la consola (rama del PR `#16`, que integra `main` hasta `#14`) y probándolo contra el Backend oficial y el globo en local.

## Dónde vive
- **Repo:** `https://github.com/CarlitooooK/luna-landing-navigator-console` (rama `main`). Este handoff es la fuente de verdad; la consola solo lo consume.
- **Mapa interno completo:** `docs/` del repo de la consola. Responde qué render se ve en cada caso y de dónde sale (`02-renders.md`), qué pide a la API y qué campos usa (`03-datos-y-api.md`), qué mensajes manda al globo y cuándo (`04-puente-globo.md`), qué hace cada control (`05-pantallas.md`) y qué falta refinar (`06-limitaciones-y-pendientes.md`). Aquí no se copia.
- **Cómo correrlo:** `npm install` → `npm run sync:handoff` → `VITE_API_BASE_URL` del Backend oficial en `.env.local` (URL en `docs/07`) → `npm run dev`. Con el globo: ver `docs/11` §10.
- **Specs:** `docs/specs/` del repo de la consola. `onboarding-ayudas-sugerencias/` (tour, ayudas "?" y próxima acción) está implementada en `#16`; lo que dejó abierto está en `docs/06`.
- **Ambientes:** `VITE_API_BASE_URL` (incluye `/api/v1`) y `VITE_GLOBE_URL`. URLs vigentes: `docs/07-ambientes-y-pruebas.md`.

## Arquitectura
React 19 + TypeScript + Vite, Tailwind v4, Three.js con React Three Fiber/drei, Zustand y Vitest.
- `src/core/api`: único cliente HTTP, un método por endpoint usado, errores por `error.code`.
- `src/core/store`: `useMissionStore` (configuración · datos de la API · reproducción), `useGlobeStore` (enlace con el globo y escena de alunizaje) y `useHistoryStore` y `useOnboardingStore` (`localStorage`).
- `src/features/viewport3d`: fondo (`SceneBackground`), iframe del globo y puente (`useGlobeBridge`, único que habla con el iframe), escena local Three.js.
- `src/features/help`, `src/features/suggest` y `src/features/onboarding`: catálogo de ayudas y menú Help, "Next step" (`nextStep()`, pura) y tour (`resolveSteps()`, pura, y `Tour.tsx`).
- `src/types/api.d.ts`: generado desde `contracts/openapi.json` (v1.3 desde el PR `#7`).

## Cómo funciona
1. Al arrancar consulta `/health` y `/sites`; los sitios van al globo como pines.
2. "Run simulation" pide en paralelo `/evaluate`, `/terrain/patch` y `/psr/nearby`. El fondo **se queda en el globo** (D-015): el globo recibe Sol, Tierra, PSR y el estado del pin. Desde la consola `#18`, Run simulation y el Replay de Missions (vía `runSimulation()`) abren "Horizon view" en el sitio; Compare y History vuelan sobre él.
3. El scrubber recorre `evaluation.timeline[]` en memoria (sin red) y reenvía `sun_vector_3d` / `earth_vector_3d` al globo, una vez por fotograma. Con la consola `#20` (en revisión), el timeline va siempre en Detailed (velocidad y Horizon 360° en los dos modos) y Simple/Detailed cambia Setup, Results y Compare.
4. Sobre el globo: "Recenter" (`RECENTER`), "Grid" y "Elevation" (`SET_CONFIG`), desde `#18`, y "Shadowed regions" (`SET_PSR []`), desde `#17`. "Landing scene" corre la escena de alunizaje del globo en el mismo render. "Terrain detail" funde encima la escena local del parche de 12 km.
5. Sin globo (`VITE_GLOBE_URL` vacío o sin `READY` en 8 s), la escena local es el fondo al evaluar.

## Dependencias y contratos
- Rutas, esquemas y errores: `contracts/` y `docs/06-contrato-y-errores.md`. Guía de consumo: `FRONTEND_API_GUIDE.md` y `docs/12-contrato-api-v1.2.md`.
- Decisiones que la condicionan: `D-002`, `D-003`, `D-006`, `D-008`, `D-010`, `D-011`, `D-013`, `D-015` (`docs/09-decisiones.md`).
- Globo: `_compartido/lunar-globe-renderer.md` y `docs/11-integracion-globo-consola.md`. Backend: `_compartido/backend-api.md`.

## Cosas que muerden
- `openapi-typescript@7` pide `typescript@^5`; se ejecuta vía `npx` (`P-005`). Con v1.2 el tipo generado de `CompareRequest` exige `include_timeline` (tiene valor por defecto): la consola lo manda en `false`.
- `hours_to_next_sunset` / `hours_to_next_earthset` en `null` significa "sin transición de visible a oculto en la ventana" (`P-012`): visible siempre, nunca sale, o sale y no se pone. Para saber si empieza oculto hay que mirar `timeline[0]`; Compare no lo tiene porque manda `include_timeline: false`.
- Con la fecha 2026-12-01, casi todo el catálogo da NO-GO (noche lunar o poca luz). La consola arranca en 2026-12-13.
- El tour se abre solo en la primera visita del navegador. Para capturas, demos o pruebas usa `?tour=0` (no toca `localStorage`); `?tour=1` lo fuerza.
- La API se consume solo desde la URL de Producción de `docs/07` (backend oficial, v1.3, D-017). La URL del backend de prueba (v1.1) se apagó.
- Cielo global y PSR del polo vienen de `/ephemeris` y `/psr?min_area_km2=50`; si fallan, el globo queda sin Sol ni PSR del polo (no se inventan). Con una evaluación el cielo sale de sus vectores.
- La consola publicada leerá `VITE_API_BASE_URL` y `VITE_GLOBE_URL` de la configuración del servidor (D-018), no de `.env.local`. Ambos repos ya tienen `.woodpecker/` (`ci.yaml` y `deploy.yaml`, consola `#12` y globo `#1`, fusionados 2026-11-14): el CI corre en cada PR y la publicación al integrar a `main`. Falta confirmar que el servidor tenga esas dos variables.
- El globo y la consola usan el puerto 5173 por defecto: el globo va en 5174 (`docs/11` §3).

## Seguridad
- Sin secretos en el repo: `.env.local` está ignorado y `.env.example` solo trae nombres.
- Mensajes con el globo filtrados por `source` y `origin` exactos (`docs/11` §3).
- La copia local del handoff (`.handoff/`) es de solo lectura y no se versiona.
