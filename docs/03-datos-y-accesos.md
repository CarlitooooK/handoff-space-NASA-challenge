# 3. Datos y accesos

De dónde salen los datos, cómo se accede a ellos y qué consideraciones físicas rigen los cálculos.

## Fuentes de datos

| Fuente | Qué aporta | Formato | Límites de uso |
| --- | --- | --- | --- |
| **JPL Horizons System** (NASA/JPL) | Efemérides celestes: vectores de posición, acimut y elevación del Sol y la Tierra desde las coordenadas lunares. | JSON (API REST) / Kernels SPICE binarios | Acceso público sin costo; tasa máxima recomendada de peticiones por minuto. Requiere cache local para evitar saturación. |
| **LOLA (Lunar Orbiter Laser Altimeter)** | Topografía lunar, Modelos Digitales de Elevación (DEM polar a 20m–120m/pixel) y pendientes para calcular el perfil de horizonte local (360°). | GeoTIFF / PDS IMG / Arreglos planos (`elevations_m`) | Datasets abiertos de gran tamaño (GB). En el cliente se sirven recortes (*patches*) acotados (ej. 12 km × 12 km). |
| **NASA Quickmap / Moon Trek** | Mosaicos de contexto orbital (LROC WAC/NAC), sombreado analítico y validación de referencias de sitios históricos. | Capas WMS / WMTS / XYZ Tiles | Consumo de teselas para cartografía visual. Respetar políticas de encabezados HTTP del servicio. |
| **Datasets precalculados (Cache local)** | Posiciones tabuladas de efemérides y mallas topográficas de sitios clave (Shackleton, Haworth, Malapert). | JSON / GeoJSON optimizado | Almacenamiento local en backend o servidor de mock para respuestas subsegundo. |

## Modelado físico y consideraciones de cálculo

1. **Ausencia de refracción atmosférica (vacío lunar):**
   - La Luna carece de atmósfera perceptible; por lo tanto, la luz viaja en línea recta geométrica sin refracción.
   - El horizonte local está determinado exclusivamente por la curvatura esférica lunar ($R_{\text{Luna}} \approx 1\,737.4\text{ km}$) combinada con la elevación de las irregularidades topográficas (crestas, bordes de cráteres y montañas) obtenidas de LOLA.
2. **Libración lunar y variaciones orbitales:**
   - La oscilación aparente de la Luna (libración óptica y física) genera variaciones de varios grados en la posición aparente de la Tierra vista desde la superficie lunar en ciclos de ~27.3 días.
   - En el polo sur, donde la Tierra se mantiene siempre cerca de la línea del horizonte, la libración es la causa principal de que la Tierra periódicamente se oculte tras el terreno (*earthset*) o vuelva a aparecer (*earthrise*), modulando las ventanas de comunicación DTE.
3. **Geometría extrema del polo sur y ángulo solar:**
   - La oblicuidad del eje lunar respecto a la eclíptica es de apenas ~1.54°. En el polo sur, el Sol nunca supera elevaciones de ~1.5° a 2.0° sobre el horizonte astronómico.
   - Esta rasancia solar proyecta sombras kilométricas y da origen a Regiones Permanentemente Sombreadas (PSRs), donde existe potencial de hielo de agua pero cero energía solar.

## Autenticación y llaves

- Las fuentes de NASA (Horizons API, PDS Geosciences Node, Moon Trek) son abiertas y públicas; no requieren token privado para consultas estándar.
- Si se emplean servicios externos intermedios (servidores proxy, CDN o servicios de teselas satelitales propios), las variables de configuración se declaran en `.env`:
  - `HORIZONS_API_URL`
  - `LOLA_DATA_PATH`
- **Las llaves nunca van en el repo.** Se leen de variables de entorno y se documentan en [`docs/07-ambientes-y-pruebas.md`](07-ambientes-y-pruebas.md) sin valores sensibles.

## Cuidado y licencias

- **Atribución obligatoria:** Todo dato proveniente de NASA JPL, LRO LOLA Team y Moon Trek debe incluir créditos explícitos en la interfaz y en el reporte final.
- **Manejo de volumen de datos:** Los modelos DEM globales de LOLA a resolución nativa superan capacidades razonables de memoria web; se debe segmentar por regiones de interés (*bounding box*) o utilizar mallas diezmadas a resoluciones configurables (p. ej. 64x64, 128x128).
