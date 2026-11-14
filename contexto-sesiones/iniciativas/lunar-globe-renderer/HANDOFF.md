# Globo lunar (lunar-globe-renderer) — Handoff

**Última actualización:** 2026-11-14 · **Responsable:** Carlo (con agente Kiro) · **Repo / componente:** [`luna-render-nasa-space-challenge`](https://github.com/CarlitooooK/luna-render-nasa-space-challenge) (rama `main`, primer commit `98ecf5a`); carpeta local `lunar-globe-renderer/`

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
| Puente de mensajes en la consola (`useGlobeBridge`) | Lo construye Frontend; hoy la consola solo monta el iframe (`GlobeFrame.tsx`) |
| Integración en la consola (`<iframe>` + conexión al store) | No iniciado |
| Repo git propio | Hecho: [`luna-render-nasa-space-challenge`](https://github.com/CarlitooooK/luna-render-nasa-space-challenge) |
| Despliegue del globo (URL para el iframe) | No iniciado |
| Relieve geométrico global (LOLA vía Moon Trek, calibrado contra el backend) | Hecho (~666 m/px; mejora en el polo depende de `P-008`) |
| Imagen sin abanico en el polo (mosaico polar reproyectado) | Hecho en parte: abanico reducido a la mitad, quedan ~10 km y costuras tenues |
| Texturas LROC NAC de alta resolución | No iniciado (v2, ver `docs/08-pendientes.md`) |

## Pendientes (en orden de valor)
1. Responder `P-007` (vista global sin sitio; no bloquea) y probar `SET_PSR` con datos reales.
2. Integrar en la consola siguiendo `docs/11-integracion-globo-consola.md` (propuesta pendiente de `P-006`): `<iframe>` + `SET_SITES` desde `GET /sites`, `SELECT_SITE` al elegir sitio, `SET_SUN_LOCAL` con `timeline[stepIndex].sun_vector_3d`.
3. Terreno de mayor detalle en el polo: depende de `P-008` (teselas del DEM de 80 m del backend). Sin respuesta, queda el DEM global.
4. Pulido si hay tiempo: astronauta con pose o animación, rocas o cráteres pequeños en el suelo, y probar la escena en una GPU real (la prueba usó render por software).
5. Probar con el backend en vivo y medir rendimiento en la máquina de la demo.

## Cómo retomar
1. Lee `_compartido/lunar-globe-renderer.md` y `CONOCIMIENTO.md`.
2. Código: clona el repo del globo (ver cabecera). `npm install && npm run dev`. Protocolo y uso: `README.md` de ese proyecto.
3. Antes de seguir, revisa `../../../PREGUNTAS.md` y `../../../contracts/`: pueden haber cambiado.

## Notas
- Reemplaza un primer prototipo en Three.js (no compilaba, textura 1K). Respaldo local: `lunar-globe-renderer-three-legacy.tgz` junto al proyecto; no está versionado (el repo nuevo parte del código Cesium).
- Los 6 sitios de la demo son datos mock, no coordenadas oficiales.
