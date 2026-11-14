# Globo lunar (lunar-globe-renderer) — Handoff

**Última actualización:** 2026-11-14 · **Responsable:** Carlo (con agente Kiro) · **Repo / componente:** `lunar-globe-renderer` (carpeta hermana de `luna-landing-navigator-console`; aún sin repo git propio)

## En una línea
Fase 1 del globo lista y verificada en navegador (CesiumJS + teselas NASA Moon Trek, protocolo iframe/postMessage implementado); falta integrarlo en la consola, subir el código a un repo y resolver el relieve 3D y el abanico en el polo.

## Estado actual
| Pieza | Estado |
| --- | --- |
| Globo lunar con imagen LROC WAC (~100 m/px) y capa LOLA | Hecho (verificado con capturas en Brave) |
| Pines de sitios (color por GO/CAUTION/NO-GO), fly-to, rejilla, arco de descenso | Hecho |
| Iluminación desde `sun_vector_3d` (convención D-008) | Hecho (probada solo con vector mock) |
| Protocolo iframe + postMessage con lista de orígenes permitidos | Hecho (sin probar contra la consola real) |
| Integración en la consola (`<iframe>` + conexión al store) | No iniciado |
| Repo git propio / despliegue del globo | No iniciado |
| Relieve geométrico (terreno desde DEM LOLA) | No iniciado |
| Imagen sin abanico en el polo (teselas polares estereográficas) | No iniciado |
| Texturas LROC NAC de alta resolución | No iniciado (v2, ver `docs/08-pendientes.md`) |

## Pendientes (en orden de valor)
1. Crear repo git para `lunar-globe-renderer` y registrarlo aquí. Hoy solo existe en disco local.
2. Integrar en la consola: `<iframe>` + `SET_SITES` desde `GET /sites`, `SELECT_SITE` al elegir sitio, `SET_SUN_LOCAL` con `timeline[stepIndex].sun_vector_3d`.
3. Corregir el abanico de la imagen en ±90° (localizar la capa polar de Moon Trek; la ruta probada dio 404).
4. Terreno 3D real del polo sur (quantized-mesh desde LOLA) si el tiempo alcanza.
5. Probar con el backend en vivo y medir rendimiento en la máquina de la demo.

## Cómo retomar
1. Lee `_compartido/lunar-globe-renderer.md` y `CONOCIMIENTO.md`.
2. Código: `lunar-globe-renderer/` (hermano de la consola). `npm install && npm run dev`. Protocolo y uso: `README.md` de ese proyecto.
3. Antes de seguir, revisa `../../../PREGUNTAS.md` y `../../../contracts/`: pueden haber cambiado.

## Notas
- Reemplaza un primer prototipo en Three.js (no compilaba, textura 1K). Respaldo local: `lunar-globe-renderer-three-legacy.tgz` junto al proyecto; no está versionado.
- Los 6 sitios de la demo son datos mock, no coordenadas oficiales.
