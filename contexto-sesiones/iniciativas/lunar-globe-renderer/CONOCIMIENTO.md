# Globo lunar — Conocimiento

Reglas, modelo y decisiones, con su porqué. Lo verificado se separa de lo supuesto.

## Alcance y principio
Fase 1 del proyecto: un globo lunar detallado, estilo Google Earth, **desarrollado por separado** de la consola e incrustable en ella. Criterio: lo más funcional para la consola y la demo, sin inventar datos ni depender de cuentas externas.

## Decisiones y su porqué
- **CesiumJS con `Ellipsoid.MOON` (2026-11-14).** Registrada como D-011 en `docs/09-decisiones.md`. *Porqué:* trae teselado con LOD, streaming y caché, y soporte de cuerpos no terrestres; las teselas WMTS de Moon Trek encajan con su `GeographicTilingScheme`. *Descartado:* Three.js con LOD propio (habría que construir el teselado), y el prototipo anterior de una esfera con textura 1K (resolución ~10 km/px, sin zoom útil).
- **Integración por iframe + postMessage (2026-11-14).** *Porqué:* aísla el peso de Cesium (~5 MB sin comprimir) y su elipsoide global del bundle de la consola, y respeta que son desarrollos separados. *Descartado como primera opción:* import directo (mezcla dependencias y el elipsoide global). Sigue disponible como `LunarGlobe`.
- **Orígenes permitidos explícitos y sin `'*'` (2026-11-14).** *Porqué:* el iframe solo debe obedecer a la consola. Configuración en `VITE_ALLOWED_ORIGINS` o `?allowedOrigins=`.
- **Sin Cesium Ion (2026-11-14).** `baseLayer: false`, solo teselas públicas. *Porqué:* sin tokens ni cuentas, coherente con `docs/03-datos-y-accesos.md`.

## Hallazgos verificados
- Teselas de Moon Trek `LRO_WAC_Mosaic_Global_303ppd_v02`: HTTP 200, `Access-Control-Allow-Origin: *`, nivel 0 = 2×1, máximo nivel 8. Nivel 9 devuelve 404. (curl y `WMTSCapabilities.xml`, 2026-11-14.)
- `LRO_LOLA_ClrShade_Global_128ppd_v04`: nivel máximo 5. `LRO_LOLA_DEM_Global_128ppd_v04` existe pero entrega PNG de 8 bits, insuficiente como elevación precisa.
- En la prueba real se cargaron 628 teselas, todas con 200, sin errores de página (puppeteer-core + Brave, 2026-11-14).
- Cesium 1.147 expone `Ellipsoid.MOON` y `CelestialFrameTransforms.computeIcrfToMoonFixedMatrix`. Esta última existe en runtime pero falta en los `.d.ts` públicos.
- En vista global los pines del polo sur se solapan: las etiquetas solo se muestran a menos de 2 500 km.
- El prototipo anterior fallaba `tsc` (4 errores, entre ellos `Vector3.slerpVectors` inexistente) y su "protocolo postMessage" solo estaba tipado, no implementado.

- Cesium solo crea el cielo estrellado por defecto con el elipsoide terrestre; con `Ellipsoid.MOON` hay que configurar el `SkyBox` a mano (`src/sky.ts`). Sin eso no hay estrellas.
- Un billboard con `sizeInMeters` a 1e8–1e9 m se renderiza como una línea; se resolvió con tamaño en píxeles recalculado por fotograma desde el FOV, que conserva el tamaño angular.
- La proyección de PSR (`polar_x_m`, `polar_y_m`) es la del CRS de LOLA (estereográfica polar sobre esfera de 1 737,4 km): x = ρ·sin λ, y = **+**ρ·cos λ, ρ = 2R·tan(π/4 + φ/2). Verificada contra `GET /sites` de la API en vivo (10 sitios polares, error 0,0000 km, 2026-11-14). Una primera versión del globo usaba y = −ρ·cos λ por calibrarse con un ejemplo del contrato que tenía Y invertido (corregido en el PR #2, D-012); ya está corregida en el globo.
- La capa polar de Moon Trek `LRO_WAC_Mosaic_SPole60_100m_v02` existe (`trek.nasa.gov/tiles/Moon/SP/…`) en metros polares (±1 095 km); Cesium no la acepta sin reproyectar.
- Distancias del cielo: el Sol real queda fuera del plano lejano de Cesium; se coloca a 9e8 m conservando el tamaño angular. La Tierra va a 384 400 km (media).

- Las teselas DEM de Moon Trek (`LRO_LOLA_DEM_Global_128ppd_v04`) son PNG de 8 bits (gris + alfa constante). Conversión verificada contra el backend en vivo: `elev ≈ 76.8·DN − 9049 m` (R² 0,997, RMSE 127 m, n=24, puntos de todas las latitudes; 2026-11-14). Niveles 0–5, filas 2^z, columnas 2^(z+1).
- Las teselas polares de Moon Trek (`…/SP/LRO_WAC_Mosaic_SPole60_100m_v02`) son PNG; la cuadrícula polar real tiene 2^z teselas por lado (la lista de capacidades dice el doble) y llega solo al nivel 5 (267 m/px).
- El terreno de Cesium creado con `CustomHeightmapTerrainProvider` no trae normales: no hay sombreado de relieve por la luz solar.
- En pruebas, el renderizado por software es lento (cientos de teselas). Para capturas conviene vista alta, ventana chica y esperar a `loading.pending == 0`.

- Modelos de NASA 3D Resources (`github.com/nasa/NASA-3D-Resources`, "libres para descargar y usar"; sin archivo LICENSE en el repo, se aplican las directrices de imágenes y medios de NASA): `Apollo Lunar Module.glb` (700 KB, 65 mil vértices, en metros, origen en la base) y `Astronaut.glb` (745 KB, 19 mil vértices, en **pulgadas**, 74 in ≈ 1,88 m, origen en el centro del cuerpo). Ambos usan Draco y texturas WebP, que Cesium 1.147 carga bien.
- El SLS Block 1 solo se publica como archivos `.7z` (14 a 70 MB): no sirve para la web.
- Las partículas de Cesium avanzan con su reloj: si `clock.shouldAnimate` es falso, la columna de motor no se emite (se encontró así).
- Un error dentro de un listener de `preRender` detiene todo el render de Cesium y muestra un diálogo; se encontró así al pedir la altitud de una trayectoria vacía.

- **No usar `minimumLevel` en una capa de imagen global.** Cesium cubre cada tesela de nivel bajo con todas las teselas de ese nivel (cientos de millones) y se bloquea con "RangeError: Too many properties to enumerate". Se limita con `minimumTerrainLevel` al crear la capa (`src/regolith.ts`).
- **`sampleTerrain` solo entiende longitudes de −180° a 180°.** La API devuelve 0°–360° (222,7° para Shackleton): sin normalizar devuelve altura 0 sin error. Corregido en `src/terrain.ts`.
- La altura de `sampleTerrain` (nivel 8) puede quedar por debajo de la malla dibujada a ras de suelo: la cámara quedaba bajo el terreno y se veía la superficie desde abajo. La escena usa `globe.getHeight` (malla ya cargada) y mantiene la cámara 4 m por encima. Validación del terreno: Shackleton Rim 866 m en el globo contra 880 m en `GET /sites`.
- Con el Sol real a 1–6° del horizonte el módulo se ve casi negro: la escena lo ilumina con una luz a 30° de elevación desde el azimut solar (recurso de cámara).
- Datos reales para la demo: `POST /evaluate` en IM-2 Mons Mouton (lat −84,79, lon 31,2, pendiente 1,3°, 5 144 m), 2026-12-21T08:00Z: Sol a 6,5° y Tierra a 10,5° sobre el horizonte, `sun_vector_3d` [0.0237, 0.1126, -0.9934], `earth_vector_3d` [-0.5971, 0.1825, -0.7812]. El 2026-12-01 en ese sitio el Sol está bajo el horizonte todo el día.
- Shackleton Rim está en sombra: la imagen del suelo es negra, mala para la escena.

- Sin validación, un mensaje con `lat` no numérico producía posiciones NaN y Cesium detenía el render. Todo mensaje del puente se valida ahora (`src/embed.ts`) y las opciones de la escena también (`sanitizeSceneOptions`).
- Si llegaba `SET_SUN_LOCAL` en plena escena, la luz física pisaba la luz de escena y el suelo se oscurecía. Corregido: durante la escena solo se reorienta la luz clave.

- Al desmontarse el iframe (la consola pasa a la escena local), el globo pierde todo su estado: el puente reenvía sitios, Sol/Tierra, PSR y selección en cada `READY`. Si hay una escena pedida, la inicia en lugar de volar al sitio.
- La consola evaluada con la API en vivo (2026-12-21T00:00Z, 2 días, paso 60 min) en IM-2 Mons Mouton da `GO`; en otra fecha del mismo sitio el Sol estaba bajo el horizonte (`NO-GO`). El estado depende de la fecha.

## Auditoría consola → render (2026-11-14)

Hecha leyendo el código de la consola (`main`, tras el PR `#4`) y la documentación (`docs/10`, `docs/05`, `docs/ideas/lunar-landing-ui-ux-tdd.md`, `PRODUCT.md`), y verificando los datos contra fuentes externas.

### Qué datos son reales y cuáles son de muestra
| Fuente | Estado | Evidencia |
| --- | --- | --- |
| API pública en vivo: Sol y Tierra (`sun_az_deg`, `sun_el_deg`, `earth_az_deg`, `earth_el_deg`) | **Real** | Contra JPL Horizons (`coord@301`, IM-2 Mons Mouton, 2026-12-21, 24 horas): diferencia 0,00° en azimut y elevación, para Sol y Tierra |
| API pública: `horizon_profile` (360°) | **Real** (derivado de LOLA) | Recalculado desde el `terrain/patch` del propio backend: diferencia media 0,46° (Mons Mouton) y 0,77° (Shackleton), máxima 2,8° |
| API pública: elevación del sitio, PSR, catálogo de 13 sitios | **Real** | `elevation_m` de `evaluate` = centro de `terrain/patch` (5144,1 y 880,1 m); el DEM del globo da 866 m en Shackleton |
| **Mock** (`mock/server.js`) | **Sintético** | Sol: `1.55 + 0.35·sin(año)` (siempre entre 1,2° y 1,9°, nunca se pone). Tierra: fórmula de libración. Horizonte: `0.85 + senos` (0,3° a 2,2°). Terreno: seno. Con el mock no hay amanecer ni ocultamiento real |
| `power_factor` / `estimated_peak_power_w` | Real del backend, **definición no documentada** | ≈0,994 con el Sol a 6,5° y pico 1 559 W frente a 1 524 W nominales (1361·4·0,28): consistente con un panel que sigue al Sol, no con uno horizontal. No usarlo para el brillo del suelo del render |
| Catálogo de Missions (`missions.ts`) | Real, con fuentes citadas | Solo hora y coordenadas; las condiciones salen de `POST /evaluate`. IM-2: las coordenadas de LROC difieren de `/sites` (`P-009`) |
| Descenso, Apollo LM, astronauta, textura de regolito, orientación de la Tierra | **Ilustrativo** | Rotulado como tal en el render y en la interfaz |

La consola ya distingue el mock en su chip ("Sample data" si `/health` no trae `engine`; "Live data" si lo trae).

### Funcionalidad de la consola y su reflejo en el render
| Funcionalidad (código) | Dato | Reflejo hoy en el globo | Brecha |
| --- | --- | --- | --- |
| Elegir sitio: catálogo, búsqueda, pin libre lat/lon (`SetupPanel`) | `GET /sites` | Pin y vuelo (`SELECT_SITE`) | El pin libre no dibuja marcador |
| Fecha, hora, duración, paso, paneles (`SetupPanel`) | Parámetros de `evaluate` | Indirecto, vía el paso del timeline | — |
| Run simulation (`evaluate`) | `evaluate`, `terrain/patch`, `psr/nearby` | Pin con GO/CAUTION/NO-GO, PSR | El detalle local lo pinta la escena Three.js de la consola, no el globo |
| Results Simple: estado, cuenta atrás a sunset y earthset, potencia, pendiente, sombra permanente (`ResultsPanel`) | `summary`, `site`, `timeline[i]` | Solo el color del pin | No se ve el ocaso ni el earthset que anuncian los contadores |
| Results Detailed: checks, az/el, horizonte, *clearance*, ventanas (`ResultsPanel`) | `timeline[i]`, `summary` | Ninguno | Sol y Tierra con sus az/el y holgura sobre el horizonte |
| Timeline: pistas, scrubber, play 1×/4×/12×, banderas (`TimelineDock`) | `timeline[]` en memoria (D-003) | Sol, Tierra y terminador siguen al scrubber | En vista orbital el amanecer no se aprecia |
| Horizon 360° (`HorizonChart`) | `horizon_profile`, az/el y *horizon_el* del paso | Ninguno | Silueta del horizonte en 3D con Sol y Tierra orbitando detrás |
| Escena local de terreno (`LunarCanvas`) | `terrain/patch` | No aplica (es de la consola) | Vista cenital con esferas de luz, no un plano horizontal |
| Compare A–E, ranking, matriz, "Show on terrain" (`ComparePanels`) | `POST /compare` | Ninguno | Pines A–E con estado y el mejor resaltado |
| History (localStorage) (`HistoryPanels`) | Corridas guardadas | Ninguno | Baja prioridad |
| Missions: replay de 7 alunizajes (`MissionsPanels`) | Catálogo + `evaluate` | Ninguno | Vista de horizonte a la hora del alunizaje y la escena, con descenso rotulado ilustrativo |
| Simple / Detailed | — | Ninguno | Etiquetas y cifras solo en Detailed |
| Chip "Sample data" / "Live data" / Offline (`TopBar`) | `/health` | Ninguno | Rotular el render cuando los datos son de muestra |
| Landing scene (extra) | `evaluate` | Hecho | Ilustrativa |

### Documentación que ya pedía esta vista
`docs/ideas/lunar-landing-ui-ux-tdd.md` define tres modos de cámara: *Orbital* (por defecto), *Lander POV* (cámara a 2 m del suelo, giro de 360°, "perspectiva de astronauta o rover frente al horizonte") y *Mapa Polar 2D*. La vista de horizonte es ese *Lander POV*, que la consola no implementó.

## Supuestos sin verificar
- `sun_vector_3d` es un vector hacia el Sol en el marco local del sitio con la convención D-008; la conversión a marco fijo lunar se probó solo con un vector mock.
- El rendimiento en el equipo de la demo (GPU real) no se midió; la prueba corrió con renderizado por software.
- La capa PSR se probó con un polígono sintético, no con datos de `/psr/nearby`.
- El rendimiento de los modelos y las partículas en la GPU de la demo (la prueba usó render por software).
- Que el uso del Apollo LM como módulo genérico sea aceptable en la presentación: es un sustituto, no el módulo de Artemis.
- Que el iframe funcione bajo el origen real de la consola y del túnel de despliegue.

## Pendiente de decisión
- Dónde se despliega el globo (URL para el iframe; el código ya vive en su repo, ver `HANDOFF.md`) y si se acepta el abanico del polo o se cambia a teselas polares. Decide el equipo.
