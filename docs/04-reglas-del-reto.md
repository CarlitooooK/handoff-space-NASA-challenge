# 4. Reglas del reto

Lo que el reto de NASA exige, cómo se evalúa y los entregables clave que definen el éxito del proyecto.

## Objetivos del reto
- **Resolver la brecha entre datos complejos y toma de decisiones ágil:** Las herramientas actuales (Quickmap, Moon Trek, JPL Horizons) están diseñadas para análisis detallado y no para comparar escenarios alternativos de aterrizaje con rapidez ante retrasos o cambios operacionales.
- **Visualización integrada del horizonte:** Mostrar simultáneamente el relieve local y la trayectoria del Sol y la Tierra para comprender el impacto directo en la supervivencia de misiones lunares (energía y enlaces de radio).
- **Herramienta multiplataforma y accesible:** Proporcionar una solución útil tanto para equipos técnicos de ingeniería/ciencia como para divulgación científica y educación.

## Criterios de evaluación (Rúbrica oficial NASA Space Apps)

Total: 100% distribuido equitativamente (12.5% por criterio). Esto define la prioridad técnica de lo que se construye y cómo se presenta.

| # | Criterio | Peso | Descripción y enfoque en el proyecto |
| --- | --- | --- | --- |
| 1 | **Technological Innovation** | 12.5% | Tecnología original, técnicas avanzadas y solución funcional que supera y simplifica las herramientas existentes (JPL Horizons, Quickmap, Moon Trek). |
| 2 | **User Experience (UX/UI)** | 12.5% | Prototipo funcional intuitivo, accesible, visualmente consistente y fácil de usar para comparar sitios y fechas rápidamente sin fricción. |
| 3 | **Social Impact** | 12.5% | Problema de alta relevancia (apoyo a Artemis/CLPS), beneficiarios claros (ingenieros, educadores, público), implementación realista y valor formativo. |
| 4 | **Use of NASA Data** | 12.5% | Integración rigurosa, interpretación certera y comunicación efectiva de datos de NASA/agencias asociadas (Horizons ephemeris, LOLA DEMs). |
| 5 | **Scientific Solution** | 12.5% | Precisión científica (vacío lunar sin refracción, libración, geometría solar polar), relevancia para el reto, validación y viabilidad en el mundo real. |
| 6 | **Creativity** | 12.5% | Enfoque original que combina disciplinas (astronomía, ingeniería de software, visualización 3D y diseño interactivo) de forma innovadora. |
| 7 | **Art & Technology** | 12.5% | Integración efectiva de elementos artísticos, estéticos y visuales con ciencia y tecnología para enriquecer la comprensión del entorno polar lunar. |
| 8 | **Communication** | 12.5% | Presentación clara y convincente, documentación completa en inglés, divulgación obligatoria del uso de herramientas de IA (*AI tool disclosure*) y citación adecuada de fuentes. |

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
