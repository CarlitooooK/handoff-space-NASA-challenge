# Globo lunar (lunar-globe-renderer) — Handoff

**Última actualización:** 2026-11-14 (PR `#10` fusionado) · **Responsable:** Carlo (con agente Kiro) · **Repo / componente:** [`luna-render-nasa-space-challenge`](https://github.com/CarlitooooK/luna-render-nasa-space-challenge) (rama `main`, primer commit `98ecf5a`); carpeta local `lunar-globe-renderer/`

## En una línea
Fase 1 del globo lista y verificada en navegador (CesiumJS + teselas NASA Moon Trek, protocolo iframe/postMessage implementado); falta integrarlo en la consola, subir el código a un repo y resolver el relieve 3D y el abanico en el polo.

## Estado actual
| Pieza | Estado |
| --- | --- |
| Globo lunar con imagen LROC WAC (~100 m/px) y capa LOLA | Hecho (verificado con capturas en Brave) |
| Pines de sitios (color por GO/CAUTION/NO-GO), fly-to, rejilla, arco de descenso | Hecho |
| Iluminación desde `sun_vector_3d` (convención D-008) | Hecho (probada solo con vector mock) |
| Protocolo iframe + postMessage con lista de orígenes permitidos | Hecho (sin probar contra la consola real) |
| Cielo: estrellas, Sol y Tierra a tamaño real (fase 2) | Hecho (verificado con capturas). El Sol solo con dirección del host; la Tierra en posición media si no |
| Capa PSR desde `GET /psr/nearby` | Hecho (probada con polígono sintético; falta probar con datos reales) |
| Seguimiento del descenso, marca de touchdown, progreso para HUD, indicador de carga | Hecho |
| Vista desde la superficie (horizonte esférico, sin `horizon_profile`) | Hecho (básica) |
| Fase 3: módulo de aterrizaje (Apollo LM, genérico) con columna de motor y astronauta | Hecho (verificado con capturas; calidad baja a propósito) |
| Escena de alunizaje en plano horizontal (vuelo desde la vista global, descenso, polvo, astronauta) | Hecho (`PLAY_LANDING_SCENE`); verificada con capturas en las 4 fases en IM-2 Mons Mouton |
| Textura procedural de regolito a ras de suelo | Hecho (ilustrativa) |
| Escena configurable por la consola (parámetros validados, `SCENE_ERROR`, luz estable si cambia el Sol) | Hecho; probado por `postMessage` desde el origen de la consola con mensajes válidos e inválidos |
| Vista de horizonte (Lander POV): silueta de `horizon_profile`, Sol y Tierra del scrubber, vuelo continuo desde la esfera | Hecha en el globo (`04d69e9`); en la consola, PR [#9](https://github.com/CarlitooooK/luna-landing-navigator-console/pull/9) **fusionado** (2026-11-14) |
| Cielo global (`SET_SKY_GLOBAL`, `/ephemeris`), pines A–E de Compare (`SET_COMPARE_PINS`) y marcador del pin libre (`SET_CUSTOM_PIN`) | Hecho en el globo (`a891c85`); en la consola, PR [#10](https://github.com/CarlitooooK/luna-landing-navigator-console/pull/10) **fusionado** (`52ab449`) |
| Puente de mensajes en la consola (`useGlobeBridge`) | Construido y **subido** en la rama `feat/globe-bridge` del repo de la consola (commit `b8551d4`), **Fusionado** en `main` de la consola (PR [#4](https://github.com/CarlitooooK/luna-landing-navigator-console/pull/4), `a000db2`); probado de extremo a extremo con la API en vivo. Guía para Frontend: `docs/11` §10 |
| Integración en la consola (`<iframe>` + conexión al store) | Hecho: el globo es el render único de la consola (D-015, PR `#6`); puente fusionado (`#4`, `#9`) |
| Repo git propio | Hecho: [`luna-render-nasa-space-challenge`](https://github.com/CarlitooooK/luna-render-nasa-space-challenge) |
| Despliegue del globo (URL para el iframe) | No iniciado |
| Relieve geométrico global (LOLA vía Moon Trek, calibrado contra el backend) | Hecho (~666 m/px). `P-008` respondida: `GET /terrain/tiles` (Terrarium PNG, D-016) permite reemplazar `fetchDemTile` en `terrain.ts`; falta decidir `P-010` |
| Imagen sin abanico en el polo (mosaico polar reproyectado) | Hecho en parte: abanico reducido a la mitad, quedan ~10 km y costuras tenues |
| Texturas LROC NAC de alta resolución | No iniciado (v2, ver `docs/08-pendientes.md`) |

## Pendientes (en orden de valor)
1. (Hecho) Consola `#10` fusionada: cielo global, PSR del polo, pines A–E, pin libre. Al desplegar, el globo debe ser `a891c85` o posterior.
3. Frontend: usar y extender el puente ya fusionado en la consola (guía en `docs/11-integracion-globo-consola.md` §10). Opcional: interruptor de `SET_VEHICLES`, indicador de carga con `LOADING`, HUD con `SCENE_PHASE`/`SCENE_TELEMETRY`, integrar con Missions.
4. Terreno de mayor detalle: cambiar `fetchDemTile` a `/terrain/tiles` cuando `P-010` se resuelva, y que "Terrain detail" use la vista a ras de suelo del globo (pedido de Frontend).
4b. Traducir al inglés los créditos en español (`layers.ts`, `polar.ts`, `terrain.ts`, `regolith.ts`): el criterio 08 pide UI en inglés. Etiquetas de sitio visibles bajo los paneles (X-07).
5. Pulido si hay tiempo: astronauta con pose o animación, rocas o cráteres pequeños en el suelo, y probar la escena en una GPU real (la prueba usó render por software).
6. Despliegue: lo hará el Woodpecker de `desktop` (D-018); la URL pública del globo y `VITE_GLOBE_URL`/`VITE_API_BASE_URL` los fija la configuración del servidor, no los `.env` del repo. Probar con el backend en vivo y medir rendimiento en la máquina de la demo.

## Cómo retomar
1. Lee `_compartido/lunar-globe-renderer.md` y `CONOCIMIENTO.md`.
2. Código: clona el repo del globo (ver cabecera). `npm install && npm run dev`. Protocolo y uso: `README.md` de ese proyecto.
3. Antes de seguir, revisa `../../../PREGUNTAS.md` y `../../../contracts/`: pueden haber cambiado.

## Notas
- Reemplaza un primer prototipo en Three.js (no compilaba, textura 1K). Respaldo local: `lunar-globe-renderer-three-legacy.tgz` junto al proyecto; no está versionado (el repo nuevo parte del código Cesium).
- Los 6 sitios de la demo son datos mock, no coordenadas oficiales.
