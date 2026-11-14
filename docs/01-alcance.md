# 1. Alcance

Qué hace la primera versión y, con la misma claridad, qué queda fuera para acotar el desarrollo.

## Objetivo
Proporcionar una aplicación intuitiva e interactiva que permita evaluar y comparar rápidamente sitios candidatos y fechas de aterrizaje en la Luna (con énfasis en el polo sur lunar), calculando y visualizando las posiciones del Sol y la Tierra relativas al horizonte local para determinar el potencial de generación de energía solar y las ventanas operativas de comunicación directa con la Tierra (Direct-to-Earth, DTE).

## Quién lo usa
- **Planificadores de misión e ingenieros espaciales:** para evaluar con agilidad escenarios alternativos ante retrasos en lanzamientos o ajustes de hardware, balanceando las necesidades científicas y operativas de misiones como CLPS y Artemis.
- **Educadores y estudiantes:** para ilustrar de forma didáctica los desafíos extremos de iluminación, libración lunar y geometría orbital en el polo sur.
- **Público general y divulgadores:** para explorar visualmente misiones históricas y futuros puntos de alunizaje sin requerir herramientas analíticas complejas.

## Incluye (v1)
- **Selección de sitios:** catálogo curado de sitios de alto interés (`10` del Polo Sur Artemis III / CLPS + `3` históricos globales Apollo) y opción de ingresar coordenadas lunares personalizadas (latitud `-90.0°` a `90.0°` —foco de alta resolución `40 m/px` en el polo sur `-90.0°` a `-80.0°` y cobertura global `ldem_64.tif` en el resto de la Luna—, longitud `-180.0°` a `180.0°` / `0.0°` a `360.0°`).
- **Flexibilidad temporal:** selección interactiva de fecha y hora inicial (UTC) y duración de la misión para evaluar diferentes días y estaciones lunares.
- **Visualización de Sol y Tierra sobre el horizonte:** cálculo y despliegue de acimut y elevación solar y terrestre respecto al horizonte topográfico local (considerando el entorno de vacío sin refracción atmosférica).
- **Métricas operativas de energía y enlace:** estimación de perfil de iluminación, ángulo de elevación solar, factor de generación fotovoltaica, y ventanas continuas de comunicación DTE sin necesidad de satélites repetidores.
- **Tiempos críticos de cuenta regresiva:** cálculo del tiempo restante hasta el próximo ocaso solar (*sunset*) y ocultamiento terrestre (*earthset*).
- **Comparación de escenarios:** módulo para contrastar de 2 a 5 escenarios simultáneos (mismo sitio en distintas fechas o distintos sitios en una misma fecha) con semáforos de viabilidad (GO / NO-GO).
- **Vistas interactivas y dinámicas:** visor del terreno (2D y 3D) con vectores de iluminación y barra de tiempo (*timeline slider*) para reproducir el ciclo lunar paso a paso.

## No incluye
- **Comandos ni telemetría en tiempo real:** no es un sistema de control de vuelo ni interactúa con vehículos espaciales reales.
- **Simulación de mecánica de descenso (EDL):** no simula dinámica de fluidos, aerotermia, propulsión, gasto de combustible ni guiado de aterrizaje.
- **Gestión de hardware de carga útil:** no planifica el ciclo térmico interno detallado de subsistemas de instrumentos individuales ni control de baterías a bajo nivel.
- **Cartografía global completa en ultra-alta resolución:** el visor 3D y análisis de horizonte se centran prioritariamente en la región polar sur lunar.

## Cómo se sabe que funciona
- **Consistencia de efemérides:** los ángulos de elevación y acimut del Sol y la Tierra coinciden con las efemérides de JPL Horizons / SPICE dentro de una tolerancia angular de ±0.1°.
- **Oclusión topográfica verídica:** el horizonte toma en cuenta la elevación del terreno LOLA DEM, bloqueando la visibilidad del Sol o la Tierra cuando sus elevaciones caen por debajo del perfil local de la cresta o cráter.
- **Respuesta de cálculo ágil:** la evaluación completa de un horizonte a 360° y su línea de tiempo para una ventana de 14 días se ejecuta en menos de 2 segundos.
- **Comparación funcional:** la interfaz permite añadir dos fechas o dos sitios y ver de inmediato la diferencia en horas continuas de luz y comunicación.
