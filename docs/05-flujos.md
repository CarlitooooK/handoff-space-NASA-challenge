# 5. Flujos

Cada pantalla o caso de uso con sus datos, interacciones y manejo de excepciones.

---

## 5.1 Selección de sitio y fecha de aterrizaje (sitios curados vs. coordenadas libres)

- **Quién y cuándo:** Planificador de misión, educador o usuario general al iniciar la herramienta o al definir un nuevo caso de estudio.
- **Entrada:**
  - **Ubicación:** Selección de un sitio curado del catálogo (ej. *Shackleton Rim*, *Malapert Mountain*, sitios Artemis III / CLPS) o ingreso manual de coordenadas lunares en el polo sur (`lat`: `-90.0°` a `-80.0°`, `lon`: `-180.0°` a `180.0°` o `0.0°` a `360.0°`).
  - **Parámetros temporales:** Fecha y hora inicial en UTC (`start_utc`), duración en días (`duration_days`, por defecto 14 días) y paso de cálculo (`step_minutes`, por defecto 60 min).
  - **Parámetros de módulo (opcional):** Eficiencia del panel fotovoltaico (`panel_efficiency`) y área útil (`panel_area_m2`).
- **Pasos:**
  1. El usuario elige un sitio de la lista rápida o hace clic sobre el mapa cartográfico polar 2D.
  2. Si ingresa coordenadas libres, el sistema verifica que la latitud se encuentre en la zona polar cubierta (`-90.0` a `-80.0`).
  3. El usuario ajusta la fecha y hora de aterrizaje planificada.
  4. La aplicación envía la petición a `POST /api/v1/evaluate` (y opcionalmente a `GET /api/v1/terrain/patch` y `GET /api/v1/psr/nearby`).
  5. La interfaz renderiza las métricas iniciales del sitio, pendientes de terreno y semáforo de viabilidad.
- **Salida:**
  - Tarjetas de resumen operativo: estado `GO` / `NO-GO` con justificación técnica (pendiente del terreno, iluminación, enlace DTE).
  - Distancia a la Región Permanentemente Sombreada (PSR) más próxima.
  - Resumen ejecutivo de horas de sol y comunicación disponibles.
- **Errores y qué hace la app:**
  - `422 Unprocessable Entity` (coordenadas fuera de límite polar): la interfaz señala el campo con alerta visual e instruye ingresar una latitud entre -80° y -90°.
  - `503 Service Unavailable` / falla de conexión: el visor activa el modo de respaldo con datasets precalculados para los sitios de referencia principales.

---

## 5.2 Visualización de condiciones de Sol y Tierra sobre el horizonte

- **Quién y cuándo:** Usuario que requiere inspeccionar el comportamiento dinámico de la misión a lo largo del ciclo lunar seleccionado.
- **Entrada:**
  - Conjunto de datos retornado por `POST /api/v1/evaluate` (`horizon_profile`, `timeline[]`, `summary`).
  - Manipulación interactiva del control deslizante temporal (*timeline slider*) o botón de reproducción continua.
- **Pasos:**
  1. El sistema dibuja el gráfico del horizonte topográfico local (360° en acimut con elevación en grados).
  2. Se traza la trayectoria aparente del Sol y la Tierra respecto a la silueta del relieve lunar.
  3. En el visor 3D, se posicionan los vectores direccionales lumínicos (`sun_vector_3d`) y de comunicación (`earth_vector_3d`), proyectando sombras sobre la malla digital del terreno.
  4. Al desplazar el slider temporal, la interfaz consulta el índice correspondiente de `timeline[]` en memoria (sin latencia de red) y actualiza en tiempo real:
     - Elevación y acimut instantáneo del Sol (`sun_el_deg`, `sun_az_deg`) y visibilidad (`sun_visible`).
     - Elevación y acimut de la Tierra (`earth_el_deg`, `earth_az_deg`) y línea de vista DTE (`earth_visible`).
     - Factor de potencia instantáneo (`power_factor`).
  5. Se muestran en primer plano las cuentas regresivas operativas: horas restantes hasta el próximo ocaso (`hours_to_next_sunset`) y ocultamiento de la Tierra tras el terreno (`hours_to_next_earthset`).
- **Salida:**
  - Visor 3D sincronizado con sombras y posición celeste.
  - Indicadores activos de enlace Direct-to-Earth y estado de recarga fotovoltaica.
  - Cronómetro de tiempo operacional antes de eventos críticos de pérdida de sol o señal.
- **Errores y qué hace la app:**
  - Si la GPU no soporta WebGL para el visor 3D, la aplicación conmuta automáticamente a una vista 2D simplificada del horizonte y gráficos temporales sin bloquear la experiencia de usuario.

---

## 5.3 Comparación de escenarios (sitio vs. sitio, o fecha vs. fecha)

- **Quién y cuándo:** Planificador de misión o jurado técnico al evaluar planes de contingencia ante retrasos en la fecha de lanzamiento o al debatir entre múltiples sitios candidatos.
- **Entrada:**
  - De 2 a 5 escenarios con etiqueta descriptiva (`label`), coordenadas geográficas y fecha de inicio.
  - Duración global de misión a comparar (días).
- **Pasos:**
  1. El usuario abre la vista o modal de comparación.
  2. Configura los escenarios a contrastar (p. ej., *Escenario 1: Shackleton Rim el 1 de Dic* vs. *Escenario 2: Shackleton Rim el 15 de Dic* tras un retraso de 2 semanas, o vs. *Escenario 3: Malapert Mountain*).
  3. Presiona "Comparar escenarios".
  4. La app invoca `POST /api/v1/compare` enviando el arreglo de escenarios.
  5. El sistema computa los resúmenes y presenta una tabla comparativa con gráficos temporales superpuestos.
- **Salida:**
  - Matriz comparativa lado a lado con:
    - Estado de viabilidad (`GO` / `NO-GO`).
    - Máximas horas continuas de luz solar (`max_continuous_sun_hours`).
    - Máximas horas continuas de enlace directo (`max_continuous_dte_hours`).
    - Horas hasta el primer ocaso de Sol y Tierra.
    - Generación pico y factor de potencia medio.
  - Indicador visual que destaca la alternativa más viable según los criterios seleccionados (prioridad a energía solar vs. prioridad a enlace DTE).
- **Errores y qué hace la app:**
  - Parámetros idénticos entre dos escenarios: la interfaz previene el envío y avisa que los escenarios son duplicados.
  - Exceso de escenarios (> 5): la interfaz restringe la adición para evitar sobrecarga visual y lentitud de renderizado.
