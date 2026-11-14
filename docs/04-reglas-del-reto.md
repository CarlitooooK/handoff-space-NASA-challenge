# 4. Reglas del reto

Lo que el reto de NASA exige, cómo se evalúa y los entregables clave que definen el éxito del proyecto.

## Objetivos del reto
- **Resolver la brecha entre datos complejos y toma de decisiones ágil:** Las herramientas actuales (Quickmap, Moon Trek, JPL Horizons) están diseñadas para análisis detallado y no para comparar escenarios alternativos de aterrizaje con rapidez ante retrasos o cambios operacionales.
- **Visualización integrada del horizonte:** Mostrar simultáneamente el relieve local y la trayectoria del Sol y la Tierra para comprender el impacto directo en la supervivencia de misiones lunares (energía y enlaces de radio).
- **Herramienta multiplataforma y accesible:** Proporcionar una solución útil tanto para equipos técnicos de ingeniería/ciencia como para divulgación científica y educación.

## Criterios de evaluación

| Criterio | Enfoque y expectativas |
| --- | --- |
| **Precisión técnica y física** | Modelado fidedigno de la posición del Sol y la Tierra respecto al horizonte topográfico real (LOLA DEM), considerando la ausencia de refracción atmosférica y la libración lunar. |
| **Claridad e impacto operativo** | Capacidad de comunicar de inmediato métricas críticas de misión: tiempo restante antes de la puesta de Sol (*sunset*) o de la Tierra (*earthset*), horas de luz continua y porcentaje de visibilidad DTE. |
| **Usabilidad y agilidad comparativa** | Facilidad para comparar múltiples escenarios `{sitio + fecha}` en paralelo o secuencialmente sin saturar la pantalla ni requerir configuraciones complejas. |
| **Accesibilidad para diversos perfiles** | Curva de aprendizaje reducida: valor inmediato para un ingeniero de misión y comprensión intuitiva para educadores o el público en general. |
| **Creatividad y diseño interactivo** | Calidad visual e interactividad en vistas 2D/3D, animaciones de ciclo lunar y fluidez en la navegación temporal. |

## Restricciones

- **Fuentes autorizadas:** Uso exclusivo de datos abiertos y documentados de la NASA y agencias colaboradoras (JPL Horizons, LRO LOLA, PDS). No inventar efemérides ni características topográficas.
- **Rendimiento e interactividad:** La comparación entre escenarios debe responder en tiempo interactivo (subsegundo o pocos segundos) mediante preprocesamiento, muestreo adaptativo o servidores de mock/cache.
- **Fidelidad al vacío:** No aplicar modelos de refracción atmosférica terrestre; el horizonte se rige estrictamente por la geometría lunar y el relieve del terreno.
- **Licencia abierta:** Todo el código fuente, componentes y documentación deben entregarse bajo licencias de código abierto compatibles con los lineamientos del NASA Space Apps Challenge.

## Entregables y fechas

| Entregable | Contenido | Estado / Fecha |
| --- | --- | --- |
| **Repositorio de código** | Código fuente completo, modular, testeado y documentado con este handoff. | Fin del hackathon |
| **Demo funcional** | Aplicación web interactiva o prototipo navegable con visor 2D/3D y slider temporal. | Fin del hackathon |
| **Video de presentación** | Demo explicativa (≤ 30 segundos a 2 minutos) demostrando la solución en acción. | Cierre oficial del evento |
| **Ficha del proyecto** | Descripción del reto, metodología, fuentes utilizadas y enlaces en la plataforma oficial de NASA Space Apps. | Cierre oficial del evento |
