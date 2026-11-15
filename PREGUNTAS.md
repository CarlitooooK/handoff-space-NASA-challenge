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

### P-010: Cómo obtiene el globo las teselas de terreno sin llamar a la API

- **Pregunta:** `P-008` se resolvió con `GET /api/v1/terrain/tiles/{z}/{row}/{col}.png` (D-016), pero [`docs/11-integracion-globo-consola.md`](docs/11-integracion-globo-consola.md) §1 y §4 (D-013) dicen que el globo **nunca** llama a la API ni guarda URLs del backend. ¿Se acepta esta excepción acotada? La consola le pasa al globo la URL base de las teselas por `SET_CONFIG` (por ejemplo `terrainTilesUrl`, armada desde `VITE_API_BASE_URL`), y el globo las pide igual que hoy pide las de Moon Trek: son recursos estáticos y cacheables (`ETag`, `max-age=3600`), no cálculo. Si no llega la URL o falla la red, el globo sigue con Moon Trek. Si se acepta, `docs/11` (§1, §3 y §4) y el protocolo del globo se actualizan en el mismo commit que la respuesta.
- **Contexto:** `P-008`, D-016, [`contracts/lunar-landing-api-contract.md`](contracts/lunar-landing-api-contract.md) §2.9; en el globo, `fetchDemTile` en `src/terrain.ts`. Con D-015 la escena de alunizaje corre en el globo, así que su relieve es el que se ve a ras de suelo. La alternativa de que la consola descargue las teselas y se las pase por `postMessage` duplicaría la caché y la red del globo.

  **Aporte de Backend (2026-11-15):** el endpoint ya está listo para que el navegador lo pida directo. En la URL de Producción de [`docs/07`](docs/07-ambientes-y-pruebas.md) responde con `Cache-Control: public, max-age=3600`, `ETag` (con `If-None-Match` da `304`), `X-Terrain-Source` y CORS `*` con `Access-Control-Expose-Headers: X-Terrain-Source` (backend oficial `#7`). CORS es indispensable porque el globo decodifica Terrarium con un `<canvas>`. Pasar la URL por `SET_CONFIG` encaja con D-018: la consola publicada toma `VITE_API_BASE_URL` de la configuración del servidor, así que un cambio de túnel no exige tocar el globo. Detalle para el globo: hoy crea el proveedor de terreno al construirse (`src/LunarGlobe.ts:105`), antes de recibir `SET_CONFIG`, así que al llegar `terrainTilesUrl` tendría que recrearlo (o leer la URL en cada petición). Con el backend oficial `#9` (abierto), las teselas fuera del polo pasarían de ~474 m/px a ~118 m/px. La decisión sigue siendo de Globo y Frontend.
- **Bloquea:** no. Mientras tanto el globo sigue con el relieve de Moon Trek.
- **Preguntó:** Backend / Integración · 2026-11-14
- **Respuesta:** _pendiente_
- **Respondió:** —

### P-013: ¿"Horizon view" y "Terrain detail" quedan como dos vistas o se unifican?

- **Pregunta:** Hoy la consola tiene dos vistas del sitio a ras de suelo:
  - **"Horizon view"** (globo, `docs/11` §11): cámara a 2 m del suelo, silueta real de `horizon_profile` y el Sol y la Tierra del timeline.
  - **"Terrain detail"** (escena local Three.js de la consola): el parche de `GET /terrain/patch` (12 km, 128 × 128) visto desde arriba.

  Frontend decidió que **"Horizon view" es la vista objetivo** y la que se va a refinar, y que "Terrain detail" se queda como está por ahora. ¿Se mantienen las dos o "Horizon view" absorbe a "Terrain detail"? Si se unifican: ¿puede el globo dibujar el relieve cercano al sitio (pendientes, rocas, cráteres pequeños) dentro de "Horizon view", para retirar después "Terrain detail" y su segundo contexto WebGL? Y si siguen separadas, ¿qué responde cada una, para que la interfaz las explique sin que se confundan?
- **Contexto:** probado el 2026-11-14 con la Producción de `docs/07` y el globo `a891c85`, en IM-2 Mons Mouton (2026-12-17). "Horizon view" coincide con los datos: el amanecer de las 05:00 UTC cae justo sobre la cresta, con holgura +0.01°. Pero el suelo es una banda lisa sin relieve cercano, así que no sirve para ver pendientes. La Tierra (azimut 321°) además queda fuera de cuadro sin indicación de hacia dónde girar. Detalle en `docs/specs/onboarding-ayudas-sugerencias/audit.md` (S-05) y `docs/06-limitaciones-y-pendientes.md` de la consola. El relieve fino depende de `P-010` (teselas de 40 m, D-016).
- **Bloquea:** no. Mientras tanto, el tour y las ayudas de la consola presentan las dos vistas tal como están.
- **Preguntó:** Frontend (consola) · 2026-11-14
- **Respuesta:** _pendiente_
- **Respondió:** —

---

## Respondidas

### P-012: Qué significa `hours_to_next_sunset` / `hours_to_next_earthset` en `null`

- **Pregunta:** Con el Backend oficial, `hours_to_next_sunset` y `hours_to_next_earthset` llegan en `null` en dos casos distintos: cuando el astro está visible toda la ventana y cuando **empieza oculto** en `timeline[0]`. ¿Es la semántica buscada? Es decir, ¿el campo solo cuenta el ocaso de un astro que está visible al inicio? Si es así, ¿se puede documentar en el contrato y agregar `hours_to_next_sunrise` y `hours_to_next_earthrise` como cambio aditivo?
- **Contexto:** consultas a `/evaluate` del Backend oficial, 14 días, paso de 60 min (2026-11-14):

  | Sitio y fecha | Astro en `timeline[0]` | `hours_to_next_*` | `*_visible_pct` |
  | --- | --- | --- | --- |
  | Peak Near Shackleton, 2026-12-01 | Tierra oculta (sale en el paso 319) | `earthset: null` | Tierra 5.1 % |
  | Apollo 11, 2026-12-01 | Sol oculto (sale en el paso 328) | `sunset: null` | Sol 2.4 % |
  | IM-2 Mons Mouton, 2026-12-05 | Sol y Tierra ocultos | los dos `null` | Sol 12.8 %, Tierra 45.8 % |
  | Shackleton Rim, 2026-12-01 | Sol y Tierra visibles | los dos `1.0` | Sol 0.3 %, Tierra 17.3 % |

  Hoy la consola lee `null` como "no se pone": Peak Near Shackleton diría "Earth stays in view" y Apollo 11, "No sunset in this window" (hallazgos A-05 y A-06 de `docs/specs/onboarding-ayudas-sugerencias/audit.md`, consola PR `#8`). La spec corrige eso leyendo primero `timeline[0]` y, si el astro está oculto, contando las horas hasta el primer punto visible del `timeline[]`, sin calcular física. Pero `/compare` no trae timeline, así que ahí la consola no puede distinguir los dos casos.
- **Bloquea:** no para Simulate (la consola usa el timeline). Sí limita lo que Compare puede decir en "First sunset" y "First Earthset".
- **Preguntó:** Frontend (consola) · 2026-11-14
- **Respuesta:** No del todo: `null` **no** significa "empieza oculto". `hours_to_next_*` son las horas desde el **inicio de la ventana** (`start_utc`) hasta la **primera transición de visible a oculto** del astro, y `next_*_utc` es el instante de esa transición (`_find_next_set`, backend oficial `7326cba`, `app/engine/ephemeris.py:428-436`). Son `null` si en toda la ventana no hay ninguna transición así: el astro está visible toda la ventana, nunca sale, o sale pero no alcanza a ponerse. Si empieza oculto, sale y se pone dentro de la ventana, el campo **sí** trae valor, contado desde `start_utc` y no desde la salida. En los ejemplos sale `null` porque la Tierra y el Sol salen en los pasos 319 y 328 de 336 y ya no se ponen. Resolución: el valor marca la primera muestra ya oculta, así que el ocaso real ocurrió entre esa muestra y la anterior (hasta `step_minutes` antes). **Para Compare no hace falta esperar al backend:** desde v1.2, `POST /compare` acepta `include_timeline: true` (D-014, [`docs/12`](docs/12-contrato-api-v1.2.md) §4.5) y devuelve el `timeline` de cada escenario, con el que la consola distingue los casos igual que en Simulate. `hours_to_next_sunrise` / `hours_to_next_earthrise` son viables como cambio aditivo (la misma función con la condición invertida), pero no entran al contrato hasta que estén en el backend oficial: quedan como propuesta para una v1.4 (ver abajo). Verificado en Producción con los mismos cuatro casos en `/compare` (`include_timeline: true`): con 14 días salen `null` y con 30 días traen valor (Peak Near Shackleton `earthset` 642 h; Apollo 11 `sunset` 684 h; IM-2 `sunset` 532 h y `earthset` 586 h), y el timeline muestra las salidas a las 320 h, 328 h, 294 h y 182 h. Solo siguen en `null` los astros visibles los 30 días (el Sol en Peak Near Shackleton, la Tierra en Apollo 11), que es lo correcto. `/compare` usa `step_minutes` 120 por defecto (60 en `/evaluate`), así que ahí el error llega a 2 h. La consola pide `include_timeline: false` a propósito (`src/core/store/useMissionStore.ts:190`, consola `c21456b`); pedirlo cuesta unos 168 puntos por escenario en 14 días y lo decide Frontend. Sugerencia mientras tanto: con `null`, un texto neutro que sea cierto en los tres casos, como *"No sunset in the next 14 days"*, en vez de *"stays in view"*. La v1.4 propuesta agregaría al `summary` `sun_visible_at_start`, `earth_visible_at_start`, `hours_to_next_sunrise` y `hours_to_next_earthrise`, para que Compare lo diga sin timeline. La semántica queda documentada en [`contracts/lunar-landing-api-contract.md`](contracts/lunar-landing-api-contract.md) §2.4 y [`docs/12`](docs/12-contrato-api-v1.2.md) §4.4.
- **Respondió:** Backend / Integración · 2026-11-15

### P-011: Revisión de los textos científicos de las ayudas de la consola (PSR y `power_factor`)

- **Pregunta:** ¿Alguien de ciencia o backend puede revisar dos textos en inglés antes de que la consola los muestre como ayuda "?"?
  - **`psr`:** "A permanently shadowed region (PSR) never sees the Sun. It is extremely cold and may hold water ice. This is the distance to the nearest one." ¿Es correcto? ¿Qué catálogo usa `/psr/nearby` y qué fuente se debe citar?
  - **`power`:** "Relative solar power at the time selected on the timeline, as reported by the server." ¿Qué es exactamente `power_factor` (y `avg_power_factor`)? La auditoría del globo (`contexto-sesiones/iniciativas/lunar-globe-renderer/CONOCIMIENTO.md`) observó un factor de unos 0.994 con el Sol a 6.5° y un pico de 1 559 W frente a 1 524 W nominales (1361 · 4 · 0.28), lo que cuadra con un panel que sigue al Sol. ¿Es así? ¿Por qué el pico supera el nominal? ¿Vale 0 con el Sol oculto?
- **Contexto:** spec de onboarding de la consola, `docs/specs/onboarding-ayudas-sugerencias/design.md` §2.4 (consola PR `#8`). En pantalla: "Permanent shadow 1.8 km away" y "Solar power now · 71% of panel output". El contrato v1.3 no define `power_factor`. El resto del catálogo de ayudas está en §2.3–2.5 de ese archivo, por si quieren revisarlo completo.
- **Bloquea:** no. Las dos ayudas salen con un texto neutro hasta tener la respuesta.
- **Preguntó:** Frontend (consola) · 2026-11-14
- **Respuesta:** Los dos textos sirven con ajustes. **`power_factor`** (backend oficial `7326cba`, `app/engine/ephemeris.py:624-629`) es la fracción de la potencia máxima de un **panel vertical que gira siguiendo el azimut del Sol**, el diseño típico del polo sur: `disk_frac · cos(elevación del Sol)`. `cos(elevación)` es la incidencia sobre el panel vertical; sí sigue al Sol (cos 6.5° = 0.994, lo que observaron). `disk_frac = min(1, 0.5 + 0.5 · holgura / 0.2666°)` es la parte del disco solar que queda sobre la cresta local (0.2666° es el radio del disco). El Sol cuenta como visible solo cuando su **centro** supera la cresta (`sun_el_deg > sun_horizon_el_deg`); con el centro debajo, `power_factor` vale **0**, así que al salir el Sol salta de 0 a ~0.5: el tramo en que solo asoma el borde no se modela. **`avg_power_factor`** es el promedio simple sobre **todos** los pasos de la ventana, incluidos los ceros. **El pico supera el nominal** porque la irradiancia no es 1361 W/m² fija sino `1361 / r²`, con `r` la distancia real Sol–Luna en UA. En diciembre `r` baja de 1 (el perihelio es el 3 de enero): con r ≈ 0.989 UA son ≈ 1 392 W/m² y 1 392 · 4 m² · 0.28 ≈ 1 559 W, frente a 1 524 W con 1 UA; el ejemplo de `docs/12` §4.4 (1–15 de diciembre, 1 579 W) llega a r ≈ 0.982 UA. Por eso "71% of panel output" es el 71 % de lo que daría ese panel con el Sol de frente **a la distancia de ese momento**, no de un nominal fijo. Texto propuesto: *"Share of the maximum output of a vertical, Sun-tracking solar panel at the time selected on the timeline. It drops as the Sun climbs and while part of the solar disk is behind the terrain; 0% when the Sun is hidden."* **PSR:** `/psr/nearby`, `/psr` y `nearest_psr_km` usan `psr_regions`: los 1 531 polígonos de `LPSR_80S_20MPP_ADJ_1km2.CSV` de NASA PGDA (LOLA 20 m/px), es decir, las PSR de **más de 1 km²** al sur de −80°; el polo norte no está cargado. La distancia (`ST_Distance`, `app/db.py:139`) va del sitio al **borde** de la PSR más cercana, en metros sobre la estereográfica polar de LOLA (en −80° sobreestima un 0.8 % como mucho), y vale 0 si el sitio está dentro de una. El texto es correcto con dos precisiones: "never sees the Sun" se refiere a la luz solar **directa**, y "may hold water ice" está bien planteado como hipótesis. Fuera del polo (Apollo, Chandrayaan-3) la distancia no tiene sentido y conviene no mostrar la ayuda. Texto propuesto: *"A permanently shadowed region (PSR) never receives direct sunlight. It stays extremely cold and may hold water ice. This is the distance to the edge of the nearest one (PSRs larger than 1 km² south of 80°S); 0 if the site is inside one."* Fuente a citar: NASA PGDA, *A New View of the Lunar South Pole from LOLA* (https://pgda.gsfc.nasa.gov/products/90); Barker et al. 2023, *Planet. Sci. J.* 4, 183, https://doi.org/10.3847/PSJ/acf3e1. Las definiciones quedan en [`contracts/lunar-landing-api-contract.md`](contracts/lunar-landing-api-contract.md) §2.4 y [`docs/12`](docs/12-contrato-api-v1.2.md) §4.2 y §4.4; el contrato no cambia de versión.
- **Respondió:** Backend / Integración · 2026-11-15

### P-008: Teselas de terreno del polo sur para el globo

- **Pregunta:** El globo usa hoy el DEM global de Moon Trek (~666 m/px, pasos de ~77 m, calibrado contra `terrain/patch`: RMSE ≈ 127 m). El backend tiene LOLA a 80 m/px al sur de -80° (`LDEM_80S_80MPP_ADJ`). ¿Puede servir ese DEM como teselas (por ejemplo `GET /api/v1/terrain/tiles/{z}/{x}/{y}.png`, esquema geográfico 2×1 en el nivel 0 como el de Moon Trek, elevación en 16 bits o formato Terrarium) para sustituir el relieve global solo en la región polar?
- **Contexto:** `lunar-globe-renderer`, `src/terrain.ts` (la fuente es una sola función, `fetchDemTile`, fácil de cambiar). Sin esto el relieve del polo se ve suave a menos de ~50 km de altura.
- **Bloquea:** no. Es una mejora de calidad; el globo funciona con el DEM de Moon Trek.
- **Preguntó:** Globo (`lunar-globe-renderer`) · 2026-11-14
- **Respuesta:** Sí, y para **toda la Luna**, no solo el polo: `GET /api/v1/terrain/tiles/{z}/{row}/{col}.png` (contrato v1.3, sección 2.9; D-016). Usa el mismo esquema que Moon Trek y `GeographicTilingScheme` (nivel 0 = 2×1, fila 0 = norte, columna 0 = −180°, `z` de 0 a 9) y teselas de 256×256 en centros de píxel, así que en `src/terrain.ts` solo cambia `fetchDemTile`. El formato es PNG RGB **Terrarium**: `elevation_m = R*256 + G + B/256 − 32768` (resolución 1/256 m), sobre la esfera de 1 737 400 m (la de `Ellipsoid.MOON` y `terrain/patch`). No es PNG de 16 bits porque el navegador lee los PNG por un `<canvas>` de 8 bits y los trunca; Terrarium se lee con el mismo `getImageData` y `colorSpaceConversion: 'none'`. Fuente: el DEM LOLA polar que corresponde al zoom (40 m desde `z` 9, 80 m abajo) donde tiene datos y LOLA global (`ldem_64`, ~474 m/px) en el resto; la cabecera `X-Terrain-Source` dice cuál se usó. Al cubrir toda la Luna, el globo puede usar **una sola fuente** y dejar la calibración de Moon Trek (que daba un salto medio de 118 m donde se juntaban las dos). Para el globo, una vez resuelto cómo llegan las teselas (ver abajo): decodificar sin el suavizado 3×3, subir `DEM_MAX_LEVEL` a 9 solo cerca del polo (fuera de él el DEM global no da más detalle desde `z` 6) y dejar Moon Trek solo como respaldo sin red; receta en [`docs/12`](docs/12-contrato-api-v1.2.md) §8.6. **Cómo pide el globo las teselas sin romper [`docs/11`](docs/11-integracion-globo-consola.md) §1 y §4** ("el globo nunca llama a la API") queda en `P-010`. Verificado contra los DEM reales del servidor: exactitud de 0.00 a 0.07 m frente a `terrain/patch` en `z` 9, sin costuras entre teselas vecinas (el borde difiere lo mismo que dos píxeles internos), 18–27 ms por tesela en frío y 1–2 ms en caliente. Ya lo sirve la URL del **Backend oficial**; Producción responde `404` hasta que se promueva (estado en [`docs/07-ambientes-y-pruebas.md`](docs/07-ambientes-y-pruebas.md)). Origen: `AxelT456/lunar_landing_site_navigator_api#7` (`615e64c`).
- **Respondió:** Backend / Integración · 2026-11-14

### P-007: Dirección del Sol y la Tierra para la vista global (sin sitio)

- **Pregunta:** El globo (fase 2) dibuja el Sol y la Tierra en el cielo lunar a partir de `sun_vector_3d` / `earth_vector_3d`, pero hoy solo existen dentro de `POST /evaluate`, que exige un sitio. ¿Puede el backend exponer, para una fecha UTC, las direcciones del Sol y de la Tierra vistas desde el **centro de la Luna** en el marco fijo lunar (`MOON_ME`), por ejemplo `GET /api/v1/ephemeris?utc=…`? Idealmente también la distancia a la Tierra, que hoy el globo fija en la media de 384 400 km.
- **Contexto:** `docs/11-integracion-globo-consola.md` sección 7; D-002 y D-006 (el cliente no calcula física). Sin esta respuesta el globo dibuja la Tierra en la posición media (lon 0°, lat 0°) y **no dibuja el Sol**.
- **Bloquea:** no. Alternativa mientras llega: la consola evalúa un sitio de referencia y reenvía sus vectores (`SET_SUN_LOCAL`, `SET_EARTH_LOCAL`); el error angular de tomar un sitio en vez del centro es ≈0,26° para la Tierra y despreciable para el Sol.
- **Preguntó:** Globo (`lunar-globe-renderer`) · 2026-11-14
- **Respuesta:** Sí, `GET /api/v1/ephemeris?utc=<ISO-8601>` (contrato v1.2, sección 2.8; D-014). Devuelve el Sol y la Tierra vistos desde el **centro de la Luna** en el marco fijo `MOON_ME_DE421`. Para cada uno trae `direction` (vector unitario: `+X` hacia `lat 0°, lon 0°`, `+Y` hacia `lon 90° E`, `+Z` al polo norte), `sub_lat_deg` y `sub_lon_deg` (punto subsolar o subterrestre, longitud `0..360` Este) y `distance_km`, también de la Tierra, así que ya no hace falta fijarla en 384 400 km. Ejemplo para `2026-12-01T00:00:00Z`: Sol en `(-1.47°, 280.06° E)`; Tierra en `(1.35°, 6.67° E)` a 376 517 km. Sale de los kernels SPICE: si el servidor no los tiene responde `503 ERR_UPSTREAM_SERVICE` y no hay modelo aproximado de respaldo, para que el globo nunca dibuje un Sol inventado. Fuera de `1900-2050` responde `422 ERR_DATE_OUT_OF_RANGE`. Se comprobó contra la elevación del Sol vista desde el polo sur en `/evaluate` (diferencia ≤ 0.05°). Ya responde en la URL del **Backend oficial** y en el mock; la URL de Producción lo tendrá cuando pase a v1.2 (las dos URLs y su versión: [`docs/07-ambientes-y-pruebas.md`](docs/07-ambientes-y-pruebas.md); detalle de consumo: [`docs/12-contrato-api-v1.2.md`](docs/12-contrato-api-v1.2.md) §4.8).
- **Respondió:** Backend / Integración · 2026-11-14


### P-009: Coordenadas de IM-2 en `GET /sites`

- **Pregunta:** El backend en vivo sirve `clps-im2-mons-mouton` en `lat -84.79, lon 31.2`. LROC publica el sitio objetivo de IM-2 en `-84.78°, 29.13° E` (https://www.lroc.asu.edu/images/1401), y NASA indica que Athena quedó a unos 400 m de ese objetivo. Los dos puntos están a unos 5,7 km. ¿De qué fuente sale `31.2`? Si no hay una, ¿se puede corregir a la de LROC?
- **Contexto:** `GET /api/v1/sites`; en la consola, la pantalla Missions recrea IM-2 con las coordenadas de LROC y cita la fuente. Si se mantienen las dos, el pin del catálogo y el de la misión caen en lugares distintos del globo.
- **Bloquea:** no. Mientras tanto la consola usa las de LROC.
- **Preguntó:** Frontend (`frontend-console`) · 2026-11-14
- **Respuesta:** `lon 31.2` no tenía fuente: se corrige a la de LROC, `lat -84.78, lon 29.13` (https://www.lroc.asu.edu/images/1401), con elevación, pendiente y PSR más cercana recalculadas con LOLA (`5312.6 m`, `1.13°`, `9.35 km`; D-014). Así el pin de `/sites` y el de Missions caen en el mismo lugar. La corrección está en el backend oficial (`db/init/20_im2_lroc_site.sql`), pero la base de datos del servidor aún no la tiene: las dos URLs públicas siguen mostrando `lon 31.2` hasta que se aplique (estado en [`docs/07-ambientes-y-pruebas.md`](docs/07-ambientes-y-pruebas.md)). Mientras tanto la consola puede seguir con las coordenadas de LROC. El mock no tiene IM-2, así que no cambia.
- **Respondió:** Backend / Integración · 2026-11-14


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
