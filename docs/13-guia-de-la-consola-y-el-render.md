# 13. La consola y el globo, explicados sin tecnicismos

> **Para qué sirve este documento.** Es la explicación elemental de lo que hace la consola de Balam, pantalla por pantalla y botón por botón, y de cómo se acompaña con el globo lunar en 3D. Está escrito para entender el proyecto sin leer código: personas del equipo, jurado, quien tome el relevo o un agente que llegue de cero.
>
> **Estado que describe:** consola `main` (PR `#23`), globo `main` (PR `#5`) y contrato de API v1.5, al 2026-11-15. Los nombres de botones y textos van entre comillas, tal como se ven en pantalla (la interfaz está en inglés por criterio del reto). El detalle técnico vive en otros documentos y se enlaza al final.

---

## 1. La idea en una página

**El problema.** En el polo sur de la Luna el Sol no sube más de unos pocos grados sobre el horizonte, las montañas y los cráteres proyectan sombras larguísimas y la Tierra puede quedar oculta tras el terreno. Elegir dónde y cuándo aterrizar es, sobre todo, una pregunta de luz y de línea de vista: ¿habrá Sol para generar energía?, ¿se verá la Tierra para comunicarse?, ¿el suelo es lo bastante plano?

**Qué hace Balam.** Le deja a una persona elegir un sitio y una fecha, y le responde con un veredicto claro (**GO**, **CAUTION** o **NO-GO**), con las razones, y con una película de lo que pasará durante toda la estancia: cuándo sale y se pone el Sol, cuándo aparece y se oculta la Tierra tras el relieve y cuánta energía solar se puede esperar.

**Las tres piezas.**

| Pieza | Qué es, dicho simple | Quién la mantiene |
| --- | --- | --- |
| **El servidor de cálculo** (backend) | El único que "sabe" la ciencia. Calcula dónde están el Sol y la Tierra, cuánto sube el terreno en cada dirección y si el sitio es seguro. Guarda el catálogo de sitios y las zonas de sombra permanente | Backend |
| **La consola** | Lo que la persona toca: formularios, resultados, línea de tiempo, comparador, historial y misiones. **No calcula nada de ciencia**: pide al servidor y muestra | Frontend |
| **El globo lunar** | La Luna en 3D que se ve de fondo. Dibuja lo que la consola le manda y las capas de imagen y relieve de NASA | Globo |

**La regla de oro.** La consola y el globo **dibujan; no inventan**. Todo número, todo veredicto, la posición del Sol y de la Tierra y cada zona de sombra vienen del servidor. Lo poco que es ilustrativo (por ejemplo, la animación del descenso) está rotulado como tal en la propia pantalla. En la sección 9 hay la lista completa de qué es real y qué es ilustrativo.

---

## 2. Una sesión típica, de principio a fin

1. **Se abre la consola.** Si es la primera vez en ese navegador, un recorrido guiado de 7 pasos ofrece enseñar lo básico (se puede saltar). De fondo se ve la Luna entera con los 13 sitios del catálogo como puntos azules. Si el servidor responde, arriba dice "Live data".
2. **Se elige un sitio.** Escribiendo en el buscador, o haciendo clic en un punto del globo. El globo vuela y se acerca al sitio.
3. **Se elige la fecha y la duración** de la estancia en la Luna (por ejemplo 14 días, que es un día lunar de luz).
4. **Se pulsa "Run simulation".** El servidor calcula y la consola muestra el veredicto, las razones y las cifras. A la vez, el globo **baja al suelo del sitio** (vista "Horizon view") y deja ver el cielo sobre el horizonte real, con el Sol y la Tierra.
5. **Se mueve la línea de tiempo.** Al arrastrar el control, o al pulsar Play, el Sol y la Tierra se mueven en el cielo, el suelo se aclara o se oscurece y los números de "ahora" cambian. No se pide nada más al servidor: todo el viaje ya estaba calculado.
6. **Se comparan alternativas.** En Compare se agregan hasta cinco combinaciones de sitio y fecha y se ve cuál conviene, con marcadores A–E sobre el globo.
7. **Se guarda y se revisa.** Cada simulación puede guardarse en el historial. En Missions se puede repasar qué condiciones había en alunizajes reales.

---

## 3. Cómo está organizada la pantalla

La pantalla es una sola. El globo ocupa todo el fondo y los paneles de cristal flotan encima.

| Zona | Qué hay | Para qué sirve |
| --- | --- | --- |
| **Barra lateral izquierda** | Cuatro áreas: Simulate, Compare, History, Missions | Cambiar de área de trabajo. El globo de fondo **no cambia** al cambiar de área |
| **Barra superior** | El área y el sitio elegido; el interruptor **Simple / Detailed**; el estado de los datos ("Live data", "Degraded" u "Offline"); **Help** y **Full screen** | Orientarse y ajustar cuánto detalle se ve |
| **Panel izquierdo** | Los controles de cada área (en Simulate, "Setup") | Elegir qué simular |
| **Panel derecho** | Los resultados (en Simulate, "Results") | Leer el veredicto y las cifras |
| **Franja de píldoras** (encima del globo) | Botones pequeños redondeados | Cambiar lo que se ve en el globo (ver sección 7) |
| **Línea de tiempo** (abajo) | Play, velocidad, pistas de Sol y Tierra | Recorrer la estancia en el tiempo |
| **Fondo** | El globo lunar | El mundo 3D donde se ve el sitio |

**Simple y Detailed.** Es un interruptor de cuánto texto y cuántas cifras se muestran. **Simple** habla en lenguaje llano ("A good place to land", "Daylight", "Talk to Earth"). **Detailed** muestra el desglose completo con los términos técnicos y más decimales. La simulación y el veredicto son los mismos en los dos modos. La línea de tiempo siempre se ve completa, en cualquiera de los dos.

**Pantalla completa** (botón "Full screen" o tecla **F**). Oculta la barra lateral y pliega los paneles en tiras finas para ver más globo. Al acercar el cursor a una tira, el panel se despliega.

**Ayuda en todas partes.** Casi cada término y cada número tiene un "?" que lo explica en una frase. El botón **Help** (o la tecla **?**) abre el glosario completo, la lista de atajos y vuelve a lanzar el recorrido guiado.

---

## 4. Las cuatro áreas de trabajo

### 4.1 Simulate: evaluar un sitio y una fecha

**Panel "Setup" (izquierda):**

| Control | Qué hace |
| --- | --- |
| **Buscador "Search 13 sites"** | Filtra el catálogo por nombre o categoría. Se maneja también con teclado (flechas, Enter, Esc). Elegir un sitio equivale a hacer clic en su punto del globo |
| **Tarjeta del sitio** | Muestra nombre, categoría y coordenadas |
| **Catalog / Custom** (solo en Detailed) | Elegir de la lista o escribir latitud y longitud propias. Las coordenadas aceptan latitud de −90 a 90 y longitud de −180 a 360 (siempre se muestran de 0 a 360 al este) |
| **Landing date** y **Landing time (UTC)** | El momento en que la nave toca la Luna. La simulación empieza ahí. Hora de 24 horas |
| **Mission length** | 7 días, 14 días o "Full cycle" (29,5 días: un día y una noche lunares completos) |
| **Time step** (solo en Detailed) | Cada cuánto se toma una muestra: 15, 60 o 120 minutos. Un paso corto detecta puestas de Sol breves; uno largo calcula más rápido |
| **Solar panels** | Área (m²) y eficiencia (%) de los paneles. Solo afectan la estimación de energía, **no** el veredicto |
| **Run simulation** | Lanza el cálculo. Tarda una fracción de segundo |
| **Marcador (bookmark)** | Guarda la corrida en el historial. Avisa si ya estaba guardada |

**Si algo cambia después de simular** (otro sitio, otra fecha), los resultados quedan atenuados con el aviso "Out of date" para que nadie lea cifras de otra configuración. No se pueden guardar mientras estén desactualizados.

**Panel "Results" (derecha):**

- **El veredicto** en grande: **GO** (verde), **CAUTION** (amarillo) o **NO-GO** (rojo), con un titular ("A good place to land", "Not a safe choice"…). Lo decide el servidor, nunca la consola.
- **Las razones:** una lista corta con una marca por cada comprobación que hizo el servidor. Por ejemplo: "Safe slope (1.1° ≤ 10°)", "High sunlight (88.1% of the window)", "Direct-to-Earth link available (100.0% of the window)". Una marca verde significa que pasa, amarilla que es dudosa, roja que falla.
- **Daylight:** cuánto falta para que el Sol se ponga (o salga, si empieza oculto) y qué parte de la estancia tendrá luz directa.
- **Talk to Earth:** lo mismo para la Tierra. Hace falta ver la Tierra sobre el horizonte para tener radio directo con ella. Si la Tierra nunca se ve, se necesitaría un satélite de relevo.
- **Solar power now:** qué fracción de la potencia máxima de un panel vertical que gira siguiendo al Sol se tendría en el instante elegido en la línea de tiempo, y el pico de la ventana. Cambia al mover la línea de tiempo.
- **Ground slope:** qué tan inclinado está el suelo en el punto de aterrizaje.
- **Permanent shadow (PSR):** a qué distancia queda la zona de sombra permanente más cercana (útil porque ahí puede haber hielo).
- **Detailed** agrega una tabla del Sol y la Tierra en el instante elegido: si se ven, hacia dónde apuntan, a qué altura están y cuánto margen les queda sobre el relieve.
- **Next step:** una sola sugerencia al final de Results con su botón ("Compare dates", "Compare sites", "Run again"…). Dice qué conviene hacer ahora según el estado.

**Reflejo en el globo.** Al evaluar, el sitio queda coloreado según el veredicto (verde, amarillo o rojo) y se dibujan las zonas de sombra permanente cercanas. La cámara baja al suelo con "Horizon view".

### 4.2 Compare: ver varias alternativas lado a lado

| Control | Qué hace |
| --- | --- |
| **Site + Landing date + "Add scenario"** | Agrega un escenario (un sitio en una fecha, empezando a las 00:00 UTC). Hasta cinco. No admite el mismo sitio y fecha dos veces |
| **"Compare scenarios"** | Pide al servidor evaluar todos juntos. Usa la duración y los paneles de Simulate, con un paso de 120 minutos |
| **El ojo de cada escenario** | Lo carga como la simulación activa: el globo y la línea de tiempo pasan a ese escenario |
| **La papelera** | Quita el escenario |
| **Recommended** | Cuál conviene más y por qué. Primero manda el veredicto (GO antes que CAUTION, y CAUTION antes que NO-GO) y, a igual veredicto, la luz y la Tierra. Si todos son NO-GO dice "Least bad · still NO-GO" |
| **Rank by** | Cambia el criterio de desempate: Balanced (Sol y Tierra), Sunlight o Earth link |
| **Matriz "Side by side"** | **Simple:** cuatro filas en palabras (Daylight, Talk to Earth, First sunset, Ground slope). **Detailed:** once filas con todas las cifras (incluidas energía pico, factor medio, elevación y la sombra permanente más cercana) |

**Truco:** agregar el mismo sitio en dos fechas distintas muestra cuánto cuesta retrasar el lanzamiento. El botón "Compare dates" de Next step lo hace solo: agrega la fecha elegida, +7 y +14 días.

**Reflejo en el globo.** Mientras se está en Compare, cada escenario aparece sobre el globo con su letra **A, B, C, D, E**, coloreado según el veredicto del servidor y con el recomendado resaltado ("· Best"). Si dos escenarios son del mismo lugar, comparten un solo marcador con las dos letras ("A C"). Al salir de Compare los marcadores desaparecen.

### 4.3 History: las simulaciones guardadas

Guarda las corridas **solo en este navegador** (no hay cuentas ni servidor de historial) y conserva hasta 100. Se agrupan por día.

| Control | Qué hace |
| --- | --- |
| Buscador y filtros (All, Starred, GO, NO-GO) | Encuentra corridas |
| Estrella y nota | Marca las importantes y permite escribir por qué |
| **Open in Simulate** | Carga todo y vuelve a calcular |
| **Duplicate and edit** | Carga los parámetros para ajustarlos antes de calcular |
| **Add to Compare** | La suma al comparador |
| **Delete run** | La borra (sin deshacer) |

History no tiene franja de píldoras ni línea de tiempo. Al entrar a History se cierra cualquier escena abierta en el globo.

### 4.4 Missions: repasar alunizajes reales

Un catálogo de **siete alunizajes** con fecha, coordenadas, resumen y fuentes citadas: IM-1 Odysseus, IM-2 Athena, Chandrayaan-3, Chang'e 4, Apollo 11, Apollo 15 y Apollo 17.

| Control | Qué hace |
| --- | --- |
| Buscador y región | Filtra el catálogo (polo sur, cara visible, cara oculta) |
| **Replay landing window** | Evalúa ese sitio con 14 días a partir de la hora en punto anterior al alunizaje real |
| **Conditions at touchdown** | Sol, Tierra y pendiente en el primer instante |
| Veredicto de la misión | El mismo que en Results, con sus razones |
| Aviso de discrepancia | Solo aparece si el catálogo dice algo (por ejemplo "la Tierra nunca se ve") y el servidor opina distinto. Avisa; no decide quién tiene razón |

Sirve para comprobar el modelo contra la historia: por ejemplo, que el cálculo concuerde con lo que se sabe de un alunizaje.

---

## 5. El tiempo: la línea de tiempo

Después de evaluar, abajo aparece la línea de tiempo con **toda la estancia ya calculada**. Moverla no vuelve a llamar al servidor: es instantáneo.

- **Play / Pause** y velocidad **1×, 4× o 12×**.
- **El reloj:** "T+N h" y la fecha y hora UTC.
- **Las pistas:** *Sunlight* (cuándo hay Sol), *Earth link* (cuándo se ve la Tierra) y *Sun + Earth* (cuándo hay ambos a la vez), cada una con su porcentaje. Las banderas marcan las puestas de Sol y de Tierra.
- **El control deslizante** se puede arrastrar o manejar con las flechas del teclado (←/→ un paso, PageUp/PageDown un día, Home/End los extremos).
- **"Bottom view":** cambia lo que se ve bajo el reloj entre las pistas (**Timeline**) y **Horizon 360°**: la silueta del horizonte desplegada en una línea de norte a norte, con el Sol y la Tierra como puntos. Un punto **bajo** la línea está oculto detrás del terreno.

**Qué cambia al moverla:** los números de "ahora" en Results, el Sol y la Tierra en el globo y el brillo del suelo en la vista de horizonte.

---

## 6. El globo lunar

El globo es una Luna 3D que se puede girar, acercar y recorrer con el ratón o el trackpad. Se ve siempre de fondo. Funciona aunque no haya evaluación: muestra la Luna con los sitios del catálogo.

**De dónde viene lo que se ve:**

| Se ve | Origen | ¿Real o ilustrativo? |
| --- | --- | --- |
| La superficie (imagen) | Mosaicos fotográficos de NASA (LROC) | Real |
| El relieve (montañas, cráteres) | Alturas láser de NASA (LOLA), servidas por nuestro servidor | Real |
| El polo sur como relieve sombreado | Las mismas alturas, sombreadas por el servidor. **La luz del sombreado es una luz elegida, no el Sol de la simulación** | Real el relieve; ilustrativa la luz |
| Los puntos de los sitios | Catálogo del servidor | Real |
| El color del sitio evaluado (verde, amarillo o rojo) | El veredicto del servidor | Real |
| El Sol y la Tierra en el cielo | Calculados por el servidor con las efemérides de NASA/JPL | Real (posición); la textura de la Tierra y su giro son decorativos |
| Las zonas de sombra permanente (azules) | Catálogo de NASA (PGDA) servido por nuestro servidor | Real |
| La textura fina del suelo a ras de piso | Ruido generado en el navegador | **Ilustrativa** (está rotulada) |
| El módulo y el astronauta | Modelos 3D de NASA. El módulo es un Apollo LM genérico, no el real de ninguna misión | **Ilustrativos** |
| El descenso del módulo y sus números | Una curva sencilla | **Ilustrativa** (se rotula "Illustrative") |

### 6.1 Las vistas del globo

| Vista | Cómo se llega | Qué muestra |
| --- | --- | --- |
| **Vista global** | Al abrir; o con la píldora **Recenter** | La Luna entera, girando sola mientras no hay sitio elegido. Si ya se conoce la fecha de inicio, se ven el Sol y la Tierra y las sombras permanentes grandes del polo |
| **Sobre el sitio** | Al elegir un sitio | El globo vuela unos 2,5 segundos y se queda a unos 120 km mirando hacia abajo |
| **Horizon view** | Se abre sola al pulsar "Run simulation" (en Simulate, en "Replay landing window" de Missions y en los botones de Next step); o con la píldora "Horizon view" | La cámara baja del espacio hasta el suelo del sitio (unos 6 segundos) y mira el cielo sobre la silueta **real** del horizonte. El Sol y la Tierra se mueven con la línea de tiempo y se ocultan tras el terreno. Con el Sol bajo el horizonte el suelo queda en penumbra, nunca en negro total. "Back to globe" regresa |
| **Landing scene** | Píldora "Landing scene" | Una escena de alunizaje: la cámara se coloca a unos 120 m, el módulo baja desde 600 m con motor y polvo, se posa, aparece un astronauta y la cámara se acerca para dejar ver a los dos. Se puede girar con el ratón. "Exit scene" sale. **Es ilustrativa**: el contrato no tiene trayectoria real de descenso |
| **Terrain detail** | Píldora "Terrain detail" | Una vista cercana del terreno de 12 × 12 km alrededor del sitio, con sombras proyectadas por el relieve, el color según la pendiente (con leyenda de la escala de ese sitio) y el Sol y la Tierra a su tamaño real en el cielo. Se puede exagerar la altura ("Vertical ×1/×2/×4", por defecto ×2, siempre visible). Mientras está abierta, el globo de fondo se pausa para ahorrar trabajo |

### 6.2 Las píldoras (los botones sobre el globo)

| Píldora | Qué hace | Cuándo está |
| --- | --- | --- |
| **Recenter** | Vuelve a ver la Luna entera sin perder el sitio elegido; la Luna vuelve a girar sola | Siempre que el globo esté listo |
| **Grid on/off** | Dibuja las líneas de latitud y longitud | Solo en vista global; apagada por defecto |
| **Elevation on/off** | Colorea la altura del relieve | Solo en vista global; apagada por defecto. No llega más al sur de −85° |
| **Shadowed regions on/off** | Muestra u oculta las zonas de sombra permanente (en azul: un contorno fino y un relleno suave) | Con el globo listo |
| **Horizon view** | Baja al suelo del sitio | Tras evaluar |
| **Landing scene** | Lanza la escena de alunizaje | Tras evaluar |
| **Astronaut on/off** | Decide si aparece el astronauta al final de la escena de alunizaje | Con el globo listo |
| **Terrain detail** | Abre la vista cercana del terreno | Tras evaluar |
| **Back to globe / Exit scene** | Regresa al globo | Según la vista |

Con el cursor encima de una píldora durante un segundo, una burbuja explica qué muestra u oculta.

### 6.3 Las zonas azules

Son las **regiones de sombra permanente**: lugares del polo donde el Sol no llega nunca y hace un frío extremo (puede haber hielo de agua). Antes de evaluar se ven las más grandes (unas 67 de las 1.531 catalogadas, las de más de 50 km²). Al evaluar un sitio se muestran las cercanas a él, con más detalle. No coinciden con "lo oscuro" que se ve en el relieve sombreado: lo oscuro depende de hacia dónde mira la ladera respecto de la luz elegida; la sombra permanente es un dato aparte. Si estorban, la píldora "Shadowed regions" las apaga.

---

## 7. Cómo conviven la consola y el globo

La consola y el globo son dos programas distintos que se hablan por mensajes. Lo importante para entenderlos juntos:

**Quién manda.** La consola es la que sabe qué se pidió y qué respondió el servidor. El globo no consulta el servidor de cálculo (con una sola excepción: las alturas y el sombreado del relieve, que son datos fijos y guardables en caché). Todo lo demás se lo manda la consola.

**El globo nunca se cierra.** Aunque se abra "Terrain detail" o se cambie de área, el globo sigue ahí. Así no hay que recargar nada ni se pierde la posición de la cámara.

**Qué refleja el globo de lo que se hace en la consola:**

| En la consola | En el globo |
| --- | --- |
| Elegir un sitio (lista, buscador, coordenadas o clic) | Vuela hasta el sitio. Si es un lugar libre (clic en el globo o una misión), aparece un marcador con su nombre |
| Cambiar la fecha de inicio, sin evaluar todavía | Se actualizan el Sol y la Tierra de la vista global |
| "Run simulation" | El sitio se colorea según el veredicto; se dibujan sus sombras permanentes cercanas; la cámara baja al suelo (Horizon view) |
| Mover la línea de tiempo | El Sol y la Tierra se mueven en el cielo; el suelo cambia de brillo |
| Cambiar entre Simple y Detailed | En Horizon view, las etiquetas del Sol y de la Tierra pasan de solo el nombre a incluir ángulos y margen |
| Compare: agregar o comparar escenarios | Marcadores A–E coloreados; el recomendado resaltado; cambia con "Rank by" |
| Compare: el ojo de un escenario | Ese escenario pasa a ser el activo en todo |
| History: "Open in Simulate" / Missions: "Replay" | Igual que simular: el globo se lleva al sitio |
| Entrar a History | Se cierran la escena de alunizaje y la vista de horizonte |
| Elegir o evaluar otro sitio durante la escena de alunizaje | La escena se cierra y el globo encuadra el sitio nuevo |
| "Landing scene" | La cámara va al sitio, el módulo desciende; la píldora muestra la fase y la altura y velocidad (ilustrativas) |
| "Terrain detail" | Aparece la vista cercana con un fundido de medio segundo; el globo se pausa debajo y se reanuda al volver |

**Lo que el globo le avisa a la consola:** que está listo, que se hizo clic en un sitio o en un punto de la Luna (equivale a elegirlo en el buscador), en qué fase va la escena o la vista de horizonte y si hubo un problema.

**Si el globo falla.** Si no responde en 8 segundos, la consola sigue sin él: aparece un fondo decorativo de estrellas y, tras evaluar, la vista cercana del terreno. Nada de la ciencia depende del globo.

**Si el servidor falla.** Aparece un ícono de conexión que explica la caída y reintenta cada 20 segundos ("Retry now" reintenta ya). Si el servidor responde pero algo secundario falla (por ejemplo, el terreno o las sombras cercanas), el veredicto igual llega y Results avisa qué faltó.

---

## 8. Cómo aprender a usarla: ayudas y recorrido

- **"?"** junto a casi cada término: abre una frase corta y, a veces, un valor sugerido ("Try…").
- **Help** (botón o tecla **?**): glosario completo por grupos (Setup, Verdict, Sun and power, Earth link, Terrain, Time, Views, Compare), atajos de teclado y "Take the tour".
- **Next step:** la sugerencia contextual de cada área.
- **El recorrido guiado (7 pasos):** (1) bienvenida, (2) "Where, when, run": elige Apollo 11 el 13 de diciembre de 2026 y lo simula, (3) el veredicto y sus razones, (4) el tiempo como control principal, (5) ver el sitio a ras de suelo, (6) los dos niveles de detalle, (7) adónde ir después. Se abre solo la primera vez; se puede saltar, repetir desde Help o forzar con `?tour=1` al final de la dirección. No depende de que se pulse cada acción: se puede recorrer solo leyendo.
- **Atajos:** **F** (pantalla completa), **?** (Help), flechas y Enter en el buscador de sitios, y flechas, PageUp/PageDown, Home/End en la línea de tiempo.

---

## 9. Qué es real y qué es ilustrativo

**Real** (viene del servidor o de NASA):
- El veredicto y cada razón.
- Las horas hasta el próximo ocaso, el porcentaje de Sol y de Tierra, las alturas y los ángulos.
- La posición del Sol y de la Tierra en cada instante.
- La silueta del horizonte.
- El relieve y su pendiente.
- Las zonas de sombra permanente.
- Las fotos de la superficie.

**Ilustrativo** (siempre con rótulo o explicado):
- El descenso del módulo en la escena de alunizaje y su altura y velocidad en pantalla.
- El modelo del módulo (un Apollo LM genérico) y el astronauta.
- La textura de polvo fino a ras de suelo.
- La luz del relieve sombreado del polo y la del suelo en la vista de horizonte (el acimut del Sol es real; la altura de la luz está elegida para que se lea el relieve).
- El tono de cada tramo de la silueta lejana en la vista de horizonte (más claro cuando el Sol queda a la espalda).
- La exageración vertical de "Terrain detail" (siempre rotulada).
- Que, con el Sol oculto, "Terrain detail" aclara el suelo para que se vea el relieve (la pantalla lo avisa).

**Una aclaración sobre la energía.** "Solar power now" y el pico se calculan para un **panel vertical que gira siguiendo al Sol**, el diseño típico del polo sur. Con el Sol oculto vale cero y, al salir, salta a cerca de la mitad, porque el Sol cuenta como visible solo cuando su centro supera la cresta. El pico puede superar el valor "de catálogo" porque se usa la distancia real al Sol de ese día.

---

## 10. Qué se guarda y dónde

| Qué | Dónde | Notas |
| --- | --- | --- |
| Las simulaciones guardadas (History) | En este navegador | Hasta 100. Se pierden si se borra el navegador. No hay cuenta |
| Si ya se vio el recorrido guiado | En este navegador | `?tour=0` lo suprime sin tocar nada |
| Los escenarios de Compare, el sitio elegido, la fecha | En memoria, mientras la pestaña esté abierta | Al recargar, se pierden |
| Los cálculos | En el servidor | El servidor no guarda las corridas de nadie |

---

## 11. Lo que se sabe que falta o es débil

- **Fuera del polo el relieve es suave:** el dato global es de unos 474 m por punto, así que los alrededores de Apollo, por ejemplo, se ven casi planos. Con el backend más nuevo mejora.
- **El polo sur se dibuja con el relieve sombreado del servidor** cuando está disponible. Sin él, queda la foto de NASA (hasta 267 m por punto) y de cerca se ve en bloques con un abanico de bandas. Siempre queda un "estallido" al pie del polo por cómo se proyecta la Luna en una malla de latitud y longitud.
- **La vista de horizonte no proyecta sombras de unas montañas sobre otras:** el servidor sombrea el relieve pero no calcula esas sombras.
- **El recorrido y las ayudas** faltan de probar en una tarjeta gráfica real y con el modo "reducir movimiento" del sistema.
- **Textos de ayuda de sombras y energía:** ya están respondidos por el servidor; falta aplicar la redacción final.
- **La distancia a la sombra permanente fuera del polo** (Apollo, Chandrayaan-3) no significa nada útil; hay que ocultarla ahí.
- **Dos vistas a ras de suelo** ("Horizon view" y "Terrain detail"): está por decidirse si se unen (pregunta `P-013`).
- **Publicación:** cada cambio que se integra a `main` se publica solo desde el servidor del equipo. Falta anotar aquí las direcciones públicas y confirmar que el servidor tenga la dirección del servidor de cálculo y la del globo.

---

## 12. Glosario mínimo

| Palabra | Quiere decir |
| --- | --- |
| **GO / CAUTION / NO-GO** | Apto, dudoso, no apto. Lo decide el servidor |
| **Horizonte** | La silueta del terreno que se ve desde el sitio. El Sol o la Tierra se ven solo si están por encima |
| **Elevación** | Qué tan alto está algo sobre un horizonte plano; negativa si está por debajo |
| **Acimut** | La dirección en la brújula: 0° norte, 90° este |
| **Holgura (Clearance)** | Elevación menos altura del terreno. Positiva = se ve |
| **DTE (Direct-to-Earth)** | Radio directo con la Tierra; necesita ver la Tierra sobre el horizonte |
| **PSR** | Región de sombra permanente |
| **Escenario** | Un sitio en una fecha (en Compare) |
| **Paso (step)** | El intervalo entre muestras de la simulación |
| **Efemérides** | Las tablas con la posición exacta de la Luna, el Sol y la Tierra en cada fecha |
| **Pendiente** | Cuánto se inclina el suelo |
| **Fase de la Tierra** | La parte iluminada de la Tierra, según de dónde le llegue la luz del Sol |

---

## 13. Dónde está el detalle técnico

| Si necesitas… | Lee |
| --- | --- |
| Cómo se hablan consola y globo (mensajes, orden, fallas) | [`docs/11-integracion-globo-consola.md`](11-integracion-globo-consola.md) |
| Cómo pedir datos al servidor y qué significa cada campo | [`FRONTEND_API_GUIDE.md`](../FRONTEND_API_GUIDE.md), [`docs/12-contrato-api-v1.2.md`](12-contrato-api-v1.2.md) y [`contracts/`](../contracts/lunar-landing-api-contract.md) |
| Qué se decidió y por qué | [`docs/09-decisiones.md`](09-decisiones.md) |
| Preguntas abiertas y respondidas | [`PREGUNTAS.md`](../PREGUNTAS.md) |
| Pantalla por pantalla, con los nombres internos de cada pieza | La carpeta `docs/` del repo de la consola, `05-pantallas.md` y `02-renders.md` |
| Qué hizo cada sesión de trabajo | [`contexto-sesiones/`](../contexto-sesiones/README.md) |
| Cómo se publica | [`docs/07-ambientes-y-pruebas.md`](07-ambientes-y-pruebas.md) |
