# 11. Integración del globo lunar en la consola

> **Estado: propuesta para confirmar con Frontend (ver `P-006`).** Define cómo se conectan el globo ([`luna-render-nasa-space-challenge`](https://github.com/CarlitooooK/luna-render-nasa-space-challenge), D-011) y la consola (`luna-landing-navigator-console`) para que cada parte construya lo suyo sin duplicar ni pisar a la otra. Cuando Frontend la confirme, se registra como decisión en `docs/09-decisiones.md`.
>
> Fuentes: protocolo de mensajes en el `README.md` del repo del globo (**fuente única**, aquí no se copia), contrato en `contracts/openapi.json`, diseño en [`ideas/console-ui-figma.md`](ideas/console-ui-figma.md) (no vinculante).

## 1. Quién construye qué

La regla para no empalmar: **cada cosa tiene un solo dueño**. Si algo no está en la columna de tu parte, no lo construyas: pídelo en `PREGUNTAS.md`.

| Tema | Dueño | Nota |
| --- | --- | --- |
| Globo lunar completo: esfera, teselas, capas, zoom, rejilla, pines, fly-to | **Globo** | La consola **no** dibuja un globo en Three.js ni añade Cesium a su bundle |
| Trayectorias, descenso y alunizaje en vista global | **Globo** | La consola solo envía los puntos |
| Sol, Tierra y estrellas como referencia en el cielo (fase 2) | **Globo** | La consola no calcula posiciones de astros para el cielo |
| Cohete y astronauta (fase 3) | **Globo** | Se activan por mensaje |
| Paneles, veredicto, KPIs, timeline/scrubber, Compare, History, Missions | **Consola** | Ver Figma |
| Llamadas a la API y store (`useMissionStore`) | **Consola** | El globo **nunca** llama a la API |
| Escena local del sitio: malla `terrain/patch`, horizonte, luces locales, capa PSR en 3D | **Consola** | Es el detalle de ~12 km; el globo no la reemplaza |
| Cálculo físico (Sol, Tierra, horizonte, DTE) | **Backend** | D-002 y D-006: ni la consola ni el globo lo calculan |

**Consecuencia directa:** el globo es la vista **global** (elegir y ubicar el sitio, ver la trayectoria) y la escena de la consola es la vista **local** del sitio. No se construyen dos globos ni dos escenas locales.

## 2. Cómo se monta en la pantalla

El Figma pide un render siempre de fondo y paneles de vidrio encima. La propuesta compatible con eso:

- El globo es un `<iframe>` de `position: fixed; inset: 0; z-index: 0`. Los paneles van encima con `pointer-events: none` en su contenedor y `auto` en cada panel, de modo que arrastrar el espacio libre mueve el globo.
- **Un solo render visible a la vez** (`viewMode: 'globe' | 'site'` en el store). Sin sitio seleccionado, o en modo Explore, se ve el globo; al evaluar un sitio se hace la transición a la escena local. La que no se ve se pausa: no se mantienen dos contextos WebGL activos.
- `F` (pantalla completa) actúa sobre el cascarón de la consola, no sobre el iframe. El fondo no cambia.
- **Atribución:** el globo muestra sus créditos de NASA/LRO y el logo de Cesium abajo a la izquierda. Los paneles, incluido el timeline, deben dejar esa franja libre (≈ 32 px) o la consola repite esa atribución completa (`docs/03-datos-y-accesos.md`).
- Textos de la interfaz en inglés (Figma, criterio 08). Los textos dentro del globo son los nombres de sitio que envíe la consola.

> Esto responde a la fila "Cómo encaja el globo con un fondo siempre visible" de `ideas/console-ui-figma.md`, **pero la decisión es de Frontend**: ver `P-006`.

## 3. Conexión técnica

**Archivos de la consola (sugeridos, carril 3 `viewport3d`):**
- `src/features/viewport3d/GlobeFrame.tsx`: el `<iframe>` y su ciclo de vida.
- `src/features/viewport3d/useGlobeBridge.ts`: suscribe el store y traduce a mensajes. Es el único archivo que habla con el iframe.
- `src/features/viewport3d/globeProtocol.ts`: los tipos de los mensajes, en **un solo archivo**, con un comentario que cite el README del globo. Mientras el globo no publique sus tipos como paquete, no los copies en otros sitios.

**Configuración:** URL del globo solo por entorno, `VITE_GLOBE_URL` (nunca fija en código, igual que `VITE_API_BASE_URL`). Origen de la consola en `?allowedOrigins=` del iframe. Los dos `vite` usan el puerto 5173 por defecto: en desarrollo el globo corre en `5174` (`npm run dev -- --port 5174`).

**Seguridad en la consola:** aceptar solo mensajes con `event.source === iframe.contentWindow` y `event.origin === new URL(VITE_GLOBE_URL).origin`. Enviar siempre con ese origen como destino, nunca `'*'`.

### Mapa del store a los mensajes

| Evento en la consola | Mensaje al globo | Notas |
| --- | --- | --- |
| `GET /sites` carga (`sites`) | `SET_SITES` | Campos del schema `LandingSite` (`id`, `name`, `category`, `lat`, `lon`). Sin `status` hasta que haya evaluación |
| Se elige un sitio (`select`) | `SELECT_SITE` | Incluye `id` para resaltar el pin. `store.selected` hoy no guarda `id`: añadirlo o buscarlo por `lat`/`lon` en `sites` |
| `evaluate` termina | `SET_SITES` de nuevo con `status` | Pinta GO/CAUTION/NO-GO. En Compare, el estado de cada escenario |
| El scrubber cambia `stepIndex` | `SET_SUN_LOCAL` con `timeline[stepIndex].sun_vector_3d` | **Vector tal cual**, sin convertir (D-008). Cero red (D-003). Agrupar con `requestAnimationFrame` |
| Trayectoria para mostrar | `SET_TRAJECTORY` | **No hay endpoint de trayectoria en el contrato.** Cualquier dato que se envíe es ilustrativo y la interfaz debe rotularlo "Sample data" |
| Cambia el modo de capas | `SET_CONFIG` | `showGrid`, `layers`, `autoRotate`, etc. |
| Reproducción | `PLAY_ANIMATION` | |
| Volver a la vista global | `RESET` | |

| Mensaje del globo | Acción en la consola |
| --- | --- |
| `READY` | Enviar el estado actual completo (sitios, selección, sol) |
| `SITE_CLICKED` | Igual que elegir en el selector: `select` y `evaluate` |
| `GLOBE_CLICKED` | Punto libre: `select` con esas coordenadas y `evaluate`. El contrato acepta cualquier `lat` en `[-90, 90]` (D-010) |
| `ANIMATION_COMPLETE` | Actualizar el estado de reproducción |

**Reservado, aún no existe:** `SET_EARTH_LOCAL` (vector `earth_vector_3d`) y mensajes para cohete y astronauta. Se añaden en el globo cuando se construya la fase 2 o 3. Los mensajes desconocidos se ignoran, así que la consola puede avanzar sin esperar.

## 4. Qué NO construir (para no empalmar)

- Un globo, teselas o marcadores de sitios en la escena Three.js de la consola.
- Cesium o `three-globe` dentro del bundle de la consola.
- El Sol, la Tierra o las estrellas del cielo global en la consola. La luz local de `CelestialBodies.tsx` sigue siendo de la consola: es la escena del sitio.
- Cálculo de efemérides o de la posición de la Tierra en el cliente.
- Llamadas a la API desde el globo, o claves y URLs de backend en el globo.
- Una segunda copia de los tipos del protocolo.

## 5. Fallas y demo

- **Sin internet el globo no carga imagen:** las teselas vienen de `trek.nasa.gov`. Para la demo y el video hay que verificar conexión o grabar con red. La consola debe seguir funcionando con su escena local.
- Si el iframe no responde `READY` en unos 8 s, mostrar un aviso discreto y quedarse en la escena local. Nunca bloquear la consola.
- Los datos de muestra (sitios mock del globo, trayectorias ilustrativas) se marcan como muestra en la interfaz (principio 5 de `PRODUCT.md` en la consola).

## 6. Orden de trabajo sin bloqueos

1. **Ahora, sin esperar al globo:** el hueco del iframe, `useGlobeBridge` con `SET_SITES`, `SELECT_SITE`, `SET_SUN_LOCAL` y los eventos de entrada. Todo eso ya existe en el globo.
2. **Cuando el globo tenga URL de despliegue:** apuntar `VITE_GLOBE_URL` y probar con el origen real.
3. **Después, en el globo (fase 2):** Sol, Tierra y estrellas. En la consola solo se añade el envío de `earth_vector_3d`.
4. **Fase 3:** cohete y astronauta, por mensaje, sin tocar el store más allá de un interruptor.

**Cambios al protocolo:** se hacen en el `README.md` del globo y se anotan en el `HISTORIAL.md` de `iniciativas/lunar-globe-renderer/`. Quien los cambie avisa a la otra parte en este repo.
