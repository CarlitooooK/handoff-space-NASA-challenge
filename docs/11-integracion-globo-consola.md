# 11. Integración del globo lunar en la consola

> **Estado: aceptada (`P-006`, D-013).** Define cómo se conectan el globo ([`luna-render-nasa-space-challenge`](https://github.com/CarlitooooK/luna-render-nasa-space-challenge), D-011) y la consola (`luna-landing-navigator-console`) para que cada parte construya lo suyo sin duplicar ni pisar a la otra.
>
> Fuentes: protocolo de mensajes en el `README.md` del repo del globo (**fuente única**, aquí no se copia), contrato en `contracts/openapi.json`, diseño en [`ideas/console-ui-figma.md`](ideas/console-ui-figma.md) (no vinculante).

## 1. Quién construye qué

La regla para no empalmar: **cada cosa tiene un solo dueño**. Si algo no está en la columna de tu parte, no lo construyas: pídelo en `PREGUNTAS.md`.

| Tema | Dueño | Nota |
| --- | --- | --- |
| Globo lunar completo: esfera, teselas, capas, zoom, rejilla, pines, fly-to | **Globo** | La consola **no** dibuja un globo en Three.js ni añade Cesium a su bundle |
| Trayectorias, descenso y alunizaje en vista global | **Globo** | La consola solo envía los puntos |
| Sol, Tierra y estrellas como referencia en el cielo (fase 2) | **Globo** | La consola no calcula posiciones de astros para el cielo |
| Módulo de aterrizaje y astronauta (fase 3) | **Globo** | Se activan por mensaje (`SET_VEHICLES`) |
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
| El scrubber cambia `stepIndex` | `SET_SUN_LOCAL` con `timeline[stepIndex].sun_vector_3d` y `SET_EARTH_LOCAL` con `earth_vector_3d` | **Vectores tal cual**, sin convertir (D-008). Cero red (D-003). Agrupar con `requestAnimationFrame` |
| `GET /psr/nearby` responde (`psrs`) | `SET_PSR` | El arreglo `psrs` sin tocar (metros estereográficos polares); el globo lo convierte |
| El usuario pide ver el cielo, la superficie o un encuadre | `LOOK_AT {body}`, `VIEW_FROM_SURFACE {lat,lon,look?}`, `SET_VIEW {lat,lon,altM,…}` | Opcional, para el modo Cinematic |
| Capas y relieve | `SET_CONFIG` con `terrain`, `terrainExaggeration`, `layers` | El relieve va activo por defecto |
| El usuario reproduce el descenso | `FOLLOW_TRAJECTORY {enabled}`, `SET_VEHICLES {lander: true}`, `VIEW_VEHICLE {which: 'lander'}` | Cámara que sigue al módulo; el módulo recorre la trayectoria con columna de motor |
| El usuario quiere ver un astronauta en el sitio | `SET_VEHICLES {astronaut: {lat,lon}}` (`null` lo quita), `VIEW_VEHICLE {which: 'astronaut'}` | Opcional; solo se dibuja a menos de 4 km |
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
| `LOADING {pending}` | Mostrar un indicador de carga mientras `pending > 0` |
| `TRAJECTORY_PROGRESS {progress,lat,lon,altKm}` | Alimentar el HUD de altitud del descenso (≤10 por segundo) |

Los mensajes desconocidos se ignoran, así que la consola puede avanzar sin esperar a que el globo añada otros nuevos.

## 4. Qué NO construir (para no empalmar)

- Un globo, teselas o marcadores de sitios en la escena Three.js de la consola.
- Cesium o `three-globe` dentro del bundle de la consola.
- El Sol, la Tierra o las estrellas del cielo global en la consola. La luz local de `CelestialBodies.tsx` sigue siendo de la consola: es la escena del sitio.
- Cálculo de efemérides o de la posición de la Tierra en el cliente. El globo tampoco las calcula: recibe los vectores de la API.
- Llamadas a la API desde el globo, o claves y URLs de backend en el globo.
- Una segunda copia de los tipos del protocolo.

## 5. Fallas y demo

- **Sin internet el globo no carga imagen:** las teselas vienen de `trek.nasa.gov`. Para la demo y el video hay que verificar conexión o grabar con red. La consola debe seguir funcionando con su escena local.
- Si el iframe no responde `READY` en unos 8 s, mostrar un aviso discreto y quedarse en la escena local. Nunca bloquear la consola.
- Los datos de muestra (sitios mock del globo, trayectorias ilustrativas) se marcan como muestra en la interfaz (principio 5 de `PRODUCT.md` en la consola).

## 6. Cielo en el globo (fase 2, ya construido)

Con los mensajes de la sección 3 el globo dibuja estrellas, la Tierra (tamaño angular real, fase según el Sol) y el Sol (disco de 0,53° con halo). Reglas para la consola:
- **Sin Sol no hay Sol:** si la consola no envía `SET_SUN_LOCAL`, el globo no inventa una posición y no dibuja el Sol ni sombrea la Luna.
- **Sin vector de la Tierra** el globo la deja en su posición media (lon 0°, lat 0°). Es una referencia, no una efeméride.
- La distancia a la Tierra es la media (384 400 km) y su rotación y orientación son ilustrativas. La interfaz no debe presentarlas como medidas.
- La luz y los astros del globo no sustituyen a `CelestialBodies.tsx`, que es la luz de la escena local.

## 6b. Vehículos en el globo (fase 3, ya construido)

- **Módulo de aterrizaje:** sigue la trayectoria recibida con `SET_TRAJECTORY`, con columna de motor mientras desciende y unos segundos posado. Modelo: Apollo LM de NASA 3D Resources como **sustituto genérico, no el módulo de Artemis**. La interfaz no debe presentarlo como el vehículo de la misión.
- **Astronauta:** de pie sobre el terreno, estático y de baja calidad a propósito.
- **La velocidad del descenso es ilustrativa** (se ralentiza con la altitud). No es física. El contrato no tiene endpoint de trayectoria, así que cualquier trayectoria que se envíe se rotula "Sample data" (sección 3).
- **Peso:** 1,4 MB en total, y solo se descargan al activarlos.
- No hay cohete de lanzamiento (SLS): NASA solo lo publica como `.7z` de 14 a 70 MB.

## 7. Relieve y polo en el globo (ya construido)

- El globo trae **relieve global real** (LOLA vía Moon Trek, calibrado contra el DEM del backend: RMSE ≈ 127 m). Es contexto, no medición: la consola no debe mostrar alturas del globo como dato. Las elevaciones y pendientes oficiales siguen saliendo de `terrain/patch` y `evaluate`.
- La resolución es ~666 m/px: el detalle del sitio es de la escena local de la consola, no del globo. Mejorarlo en el polo depende de `P-008` (no bloquea).
- Alturas de pines, PSR y trayectoria siguen al terreno. La altitud de un punto de trayectoria (`altKm`) se interpreta **sobre la superficie**.
- El abanico de imagen alrededor del polo se redujo a la mitad pero no desapareció: ~10 km de radio en el polo geográfico.

## 8. Vista global sin sitio: pregunta abierta al backend

Para dibujar el cielo antes de elegir un sitio hacen falta direcciones del Sol y la Tierra desde el centro de la Luna. El contrato solo las da dentro de `POST /evaluate`. Se pregunta en `P-007` (no bloquea). Mientras tanto, la consola puede evaluar un sitio de referencia y reenviar sus vectores al globo.

## 9. Orden de trabajo sin bloqueos

1. **Ahora:** el hueco del iframe, `useGlobeBridge` con `SET_SITES`, `SELECT_SITE`, `SET_SUN_LOCAL` y los eventos de entrada. Todo eso ya existe en el globo.
2. **Cuando el globo tenga URL de despliegue:** apuntar `VITE_GLOBE_URL` y probar con el origen real.
3. **Fase 2 (hecha en el globo):** en la consola solo falta enviar `earth_vector_3d` con `SET_EARTH_LOCAL` y `psrs` con `SET_PSR`.
4. **Fase 3 (hecha en el globo):** en la consola solo falta un interruptor que envíe `SET_VEHICLES` y, si se quiere, `VIEW_VEHICLE`.

**Cambios al protocolo:** se hacen en el `README.md` del globo y se anotan en el `HISTORIAL.md` de `iniciativas/lunar-globe-renderer/`. Quien los cambie avisa a la otra parte en este repo.
