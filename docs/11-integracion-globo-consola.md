# 11. Integración del globo lunar en la consola

> **Estado: aceptada (`P-006`, D-013). Puente ya fusionado en la consola (PR #4): ver §10.** Define cómo se conectan el globo ([`luna-render-nasa-space-challenge`](https://github.com/CarlitooooK/luna-render-nasa-space-challenge), D-011) y la consola (`luna-landing-navigator-console`) para que cada parte construya lo suyo sin duplicar ni pisar a la otra.
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
| El usuario pide ver el alunizaje (p. ej. Recreate / Cinematic del Figma) | `SET_SUN_LOCAL` y `SET_EARTH_LOCAL` con los vectores del paso actual y luego `PLAY_LANDING_SCENE {lat,lon}`; `STOP_LANDING_SCENE` para salir | El globo hace todo el recorrido desde la vista global. Escucha `SCENE_PHASE` y `SCENE_TELEMETRY` para el HUD |
| El usuario reproduce el descenso | `FOLLOW_TRAJECTORY {enabled}`, `SET_VEHICLES {lander: true}`, `VIEW_VEHICLE {which: 'lander'}` | Cámara que sigue al módulo; el módulo recorre la trayectoria con columna de motor |
| El usuario quiere ver un astronauta en el sitio | `SET_VEHICLES {astronaut: {lat,lon}}` (`null` lo quita), `VIEW_VEHICLE {which: 'astronaut'}` | Opcional; solo se dibuja a menos de 4 km |
| Trayectoria para mostrar | `SET_TRAJECTORY` | **No hay endpoint de trayectoria en el contrato.** Cualquier dato que se envíe es ilustrativo y la interfaz debe rotularlo "Sample data" |
| Cambia el modo de capas | `SET_CONFIG` | `showGrid`, `layers`, `autoRotate`, etc. |
| Reproducción | `PLAY_ANIMATION` | |
| Volver a la vista global | `RESET` | |

| Mensaje del globo | Acción en la consola |
| --- | --- |
| `READY` | Enviar el estado actual completo (sitios, selección, sol) |
| `SITE_CLICKED` | Igual que elegir en el selector: solo `select`. Evaluar sigue siendo decisión del usuario (botón Run simulation) |
| `GLOBE_CLICKED` | Punto libre: `select` con esas coordenadas ("Custom pin"), sin evaluar. El contrato acepta cualquier `lat` en `[-90, 90]` (D-010) |
| `ANIMATION_COMPLETE` | Actualizar el estado de reproducción |
| `SCENE_PHASE {phase}` | `arrival`, `descent`, `landed`, `done`: sincronizar paneles y botones (p. ej. mostrar "Exit scene" al terminar) |
| `SCENE_TELEMETRY {t,altM,vMps}` | HUD del descenso. **Es ilustrativa** (desaceleración constante): rotular como "Sample data"/"Illustrative" |
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

## 6a. Escena de alunizaje (fase 3, ya construida)

Una sola secuencia que va de la vista 3D de la Luna a una escena en plano horizontal sobre el terreno: la cámara vuela hasta el suelo, el módulo desciende en vertical con su motor frente a la cámara, se posa levantando polvo, aparece el astronauta y la cámara se acerca a los dos (orbitable). Detalle y parámetros en el `README.md` del globo (fuente única).
- **Los datos reales que importan** (Sol, Tierra, sitio, altura del terreno) vienen de la API. **El descenso no**: es una curva ilustrativa. El contrato no tiene endpoint de trayectoria ni de misiones; las condiciones al alunizar de "Recreate missions" (Figma C5) deben salir de `POST /evaluate`, no de esta escena.
- La luz de los modelos es un recurso de cámara (Sol a 30° de elevación); no debe presentarse como la iluminación real del sitio.
- Sin Sol enviado, no se dibuja Sol. Enviar siempre los vectores antes de `PLAY_LANDING_SCENE`.
- Mejor sobre terreno llano e iluminado. En sitios en sombra permanente (p. ej. Shackleton) el suelo de la imagen es negro.
- Mientras corre, el globo oculta los pines de sitios.

### De qué dato del backend sale cada parámetro de la escena
| Parámetro de `PLAY_LANDING_SCENE` / mensaje previo | Sale de | Notas |
| --- | --- | --- |
| `lat`, `lon` | `Site.lat` / `Site.lon` (`GET /sites`) o el punto elegido; también `evaluate.site` | Acepta 0–360 como la API |
| Sol: `SET_SUN_LOCAL` | `timeline[stepIndex].sun_vector_3d` de `POST /evaluate` | Tal cual, sin convertir. **Sin esto no hay Sol** |
| Tierra: `SET_EARTH_LOCAL` | `timeline[stepIndex].earth_vector_3d` | Tal cual |
| PSR: `SET_PSR` | `GET /psr/nearby` → `psrs` | Se dibujan pegados al terreno |
| `headingDeg`, `startAltM`, `durationS`, `distanceM`, `astronaut` | **Decisión de la interfaz** (modo Simple/Detailed, Cinematic), no del backend | Rangos y valores por defecto en el `README.md` del globo |

Lo que el backend sabe y la escena **no usa** (se muestra en los paneles de la consola): `status`, `reasons`, `slope_deg`, `elevation_m`, `nearest_psr_km`, KPIs de energía y DTE. La escena no cambia por un `NO-GO`: no hay dato de trayectoria ni de resultado de aterrizaje en el contrato, y no se inventa.

### Comportamiento que la consola puede asumir
- Un `PLAY_LANDING_SCENE` con `lat`/`lon` inválidos **no arranca** y el globo responde `SCENE_ERROR {reason}`; los demás mensajes mal formados se descartan sin afectar al render.
- Si el scrubber cambia el Sol en plena escena (`SET_SUN_LOCAL`), el Sol y la luz de los modelos se reorientan. La cámara y el descenso siguen su curso.
- Una nueva `PLAY_LANDING_SCENE` reinicia la escena; `STOP_LANDING_SCENE` o cualquier vista (`RESET`, `SELECT_SITE`, `SET_VIEW`…) la detiene y limpia módulo, astronauta y polvo.
- El relieve de la escena es el del globo (~666 m/px), no el de `terrain/patch` (más fino). Usar el parche local en el globo sería una mejora futura, no existe hoy.

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

## 10. Guía de conexión para Frontend (el puente ya está en `main` de la consola)

El puente se fusionó en la consola con el PR [#4](https://github.com/CarlitooooK/luna-landing-navigator-console/pull/4) (`a000db2`). **No hay que construirlo: hay que usarlo y, si hace falta, extenderlo.** Esta sección dice cómo.

### Dónde está cada cosa (consola, `src/`)
| Archivo | Para qué sirve | ¿Lo tocas? |
| --- | --- | --- |
| `features/viewport3d/globeProtocol.ts` | Tipos de los mensajes. **Única copia** del protocolo en la consola | Solo si el globo añade o cambia un mensaje |
| `features/viewport3d/globeBridge.ts` | Funciones puras que arman los mensajes (`toGlobeSites`, `skyMessages`, `psrItems`, `landingMessage`) y filtran los entrantes (`fromGlobe`) | Aquí se añade lógica nueva. Cada función lleva su prueba en `globeBridge.test.ts` |
| `features/viewport3d/useGlobeBridge.ts` | **Único** archivo que habla con el iframe: suscribe el store, envía y recibe | Para conectar un mensaje nuevo |
| `features/viewport3d/GlobeFrame.tsx` | Monta el iframe y cae al placeholder si el globo no responde | Rara vez |
| `core/store/useGlobeStore.ts` | Estado del enlace (`idle`, `loading`, `ready`, `unavailable`) y de la escena | Para leer el estado en la interfaz |
| `features/simulate/SceneControls.tsx` | Botones "Landing scene" / "Exit scene" y el texto de fase | Para cambiar la interfaz de la escena |

### Cómo probarlo en local
1. **Globo** (repo `luna-render-nasa-space-challenge`): `npm install && npm run dev -- --port 5174`.
2. **Consola**: en `.env.local` pon `VITE_GLOBE_URL=http://localhost:5174/` (más `VITE_API_BASE_URL`, ver `docs/07`) y corre `npm run dev`. Sin `VITE_GLOBE_URL` la consola usa el placeholder.
3. Elige un sitio, pulsa **Run simulation** y luego **Landing scene**. Para ver Sol y Tierra con datos reales usa la API pública, no el mock: el mock devuelve vectores de muestra.
4. Una buena prueba: **IM-2 Mons Mouton** con inicio `2026-12-21T00:00:00Z` y el scrubber en el paso 8 (08:00 UTC): el backend da `GO`, Sol 6,46° y Tierra 10,51° sobre el horizonte. En sitios en sombra permanente (p. ej. Shackleton) el suelo del globo sale negro; es real.
5. La CORS del globo y el origen: la consola ya le pasa su propio origen en `?allowedOrigins=`. En producción, el globo debe estar desplegado y `VITE_GLOBE_URL` apuntar a él (pendiente: aún no hay URL de despliegue).

### Qué hace el puente (no lo reimplementes)
- **Al montarse el iframe y recibir `READY`** envía todo el estado: sitios (con GO/CAUTION/NO-GO solo del sitio evaluado), Sol y Tierra del paso actual, PSR, y la selección. El iframe se desmonta al pasar a la escena local (D-013), así que esto ocurre cada vez que vuelves al globo.
- **Mientras está listo** reenvía por fotograma el Sol y la Tierra cuando cambia `stepIndex` (el scrubber), sin red.
- **Escena de alunizaje:** el botón pide `requestLanding()` y vuelve al globo; el puente manda el Sol/Tierra y luego `PLAY_LANDING_SCENE {lat, lon}` del sitio evaluado. El resto de parámetros (ángulo de cámara, altura inicial, duración) los decide el globo con valores por defecto; se pueden pasar desde `landingMessage()` si el diseño lo pide (rangos en el `README.md` del globo).
- **Clics:** `SITE_CLICKED` y `GLOBE_CLICKED` solo seleccionan. Evaluar sigue siendo del usuario.
- **Seguridad:** solo se aceptan mensajes del `contentWindow` del iframe y de su origen exacto (`fromGlobe`). Los mensajes se envían siempre con ese origen como destino.
- **Falla suave:** sin `READY` en 8 s el enlace pasa a `unavailable` y el fondo vuelve al placeholder.

### Reglas al extender
1. **Un mensaje nuevo** se añade en tres sitios y en este orden: tipo en `globeProtocol.ts`, función pura con prueba en `globeBridge.ts`, y envío o recepción en `useGlobeBridge.ts`. No copies tipos a otros archivos.
2. **No calcules física en la consola** (D-002, D-006). Sol y Tierra son `sun_vector_3d` y `earth_vector_3d` tal cual, sin convertir (D-008). Si falta el vector, el globo no dibuja Sol: no envíes uno inventado.
3. **Rotula lo ilustrativo.** La velocidad y la altitud del descenso (`SCENE_TELEMETRY`) son una curva, no física. El contrato no trae trayectoria ni misiones; las condiciones al alunizar de "Recreate missions" salen de `POST /evaluate`.
4. **Textos de interfaz en inglés** (criterio 08).
5. **Protocolo nuevo o cambiado:** se documenta en el `README.md` del globo (fuente única) y se avisa en el `HISTORIAL.md` de `iniciativas/lunar-globe-renderer/`.

### Problemas conocidos y qué significan
| Síntoma | Causa probable |
| --- | --- |
| El fondo global muestra el placeholder y `link = unavailable` | El globo no está corriendo, `VITE_GLOBE_URL` está mal o el origen de la consola no está permitido |
| El globo se ve sin Sol ni sombra | No hay evaluación o el paso no trae `sun_vector_3d` válido. Corre una simulación |
| Aparece "Run a simulation first." al pulsar la escena | No hay evaluación: la escena necesita el sitio y el Sol de `POST /evaluate` |
| `SCENE_ERROR` con un motivo | `lat` o `lon` inválidos. Se ve en la píldora de la interfaz |
| Suelo negro en la escena | Sitio en sombra permanente. Probar con uno iluminado (Mons Mouton) |
| El globo carga lento o sin imagen | Las teselas vienen de `trek.nasa.gov`: hace falta internet. Para la demo y el video, comprobar la conexión |

### Lo que queda para Frontend (todo opcional)
- Interruptor de **`SET_VEHICLES`** (módulo y astronauta sueltos, fuera de la escena). Ver `docs/11` §6b y el README del globo.
- Indicador de carga con `LOADING {pending}` (el puente ya lo recibe y lo ignora).
- Usar `SCENE_PHASE` y `SCENE_TELEMETRY` en un HUD propio, o ajustar el de `SceneControls`.
- Integrar la escena con **Missions → Replay landing window** si el diseño lo pide.
- Desplegar el globo y fijar `VITE_GLOBE_URL` de producción (depende también de este repo y del globo).
- Probar en una GPU real: la verificación se hizo con renderizado por software.

