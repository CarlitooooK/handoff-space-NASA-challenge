# 6. Contrato y errores

Especificación del protocolo de comunicación entre el frontend (visor 2D/3D y dashboard) y el backend de cómputo topográfico y astronómico. Toda interacción sigue el contrato definido en [`contracts/lunar-landing-api-contract.md`](../contracts/lunar-landing-api-contract.md) y [`contracts/openapi.json`](../contracts/openapi.json).

---

## Formato y estándares de datos

- **Formato de intercambio:** `application/json` con codificación UTF-8 en todos los endpoints de la API.
- **Formato de fechas y marcas temporales:** Estricto ISO 8601 en tiempo universal coordinado (UTC): `YYYY-MM-DDTHH:mm:ssZ` (ejemplo: `2026-12-01T00:00:00Z`). No se permiten zonas horarias con desfase local (como `-05:00`).
- **Coordenadas y ángulos angulares (grados decimales):**
  - **Latitud lunar (`lat`):** Decimales en rango global `[-90.0, 90.0]` (`[-90.0, -80.0]` en alta resolución Polo Sur `40 m/px`; cobertura global `ldem_64.tif` fuera de esa franja para sitios Apollo). El Polo Sur exacto corresponde a `-90.0`.
  - **Longitud lunar (`lon`):** Decimales normalizados de `0.0` a `360.0` Este (o `-180.0` a `180.0` equivalente).
  - **Acimut (`az_deg`):** Decimales en el rango `[0.0, 360.0]`, medido en sentido horario desde el Norte local lunar (`0° = Norte`, `90° = Este`, `180° = Sur`, `270° = Oeste`).
  - **Elevación angular (`el_deg`):** Decimales en el rango `[-90.0, 90.0]`, medido respecto al horizonte astronómico plano local (`0° = rasante al horizonte`, positivo por encima, negativo por debajo).
  - **Pendiente de terreno (`slope_deg`):** Inclinación topográfica local en grados sexagesimales `[0.0, 90.0]`.
- **Distancias y dimensiones:**
  - Elevaciones locales (`elevation_m`, `elevations_m`): metros referenciados al radio medio lunar de referencia ($R_{\text{ref}} = 1\,737\,400\text{ m}$).
  - Dimensiones de parches de terreno (`size_km`), radios de búsqueda (`radius_km`) y distancias a cráteres o regiones permanentemente sombreadas (`nearest_psr_km`, `distance_km`): kilómetros con precisión decimal.
- **Vectores tridimensionales unitarios:**
  - Arreglos cartesianos de tres componentes `[x, y, z]` normalizados a norma unitaria ($\sqrt{x^2 + y^2 + z^2} = 1.0$), orientados en el sistema topocéntrico local: $+X = \text{Este}$, $+Y = \text{Cenit / Elevación vertical}$, $-Z = \text{Norte}$ ($+Z = \text{Sur}$).
- **Nombres de campos:** Formato uniforme `snake_case` (por ejemplo, `sun_az_deg`, `earth_visible_pct`, `start_utc`).

### Política de versionado

- **Prefijo de ruta:** Todo endpoint productivo incluye el identificador de versión mayor en la URL: `/api/v1/...`.
- **Cambios compatibles hacia atrás (Minor/Patch):** La adición de campos informativos opcionales en respuestas JSON o nuevos filtros de consulta no altera el prefijo `/api/v1/`.
- **Cambios incompatibles (Breaking changes):** Modificaciones en tipos de datos existentes, eliminación de propiedades o cambios en sistemas de referencia espaciales incrementan la versión a `/api/v2/...`.
- **Proceso de cambio:** Cualquier ajuste al contrato debe reflejarse primero en [`contracts/lunar-landing-api-contract.md`](../contracts/lunar-landing-api-contract.md) y [`contracts/openapi.json`](../contracts/openapi.json), registrarse en [`docs/09-decisiones.md`](09-decisiones.md) y comunicarse al equipo frontend antes de desplegarse en producción.

---

## Esquema de error (Unificado: Backend en vivo y Mock)

Tanto el backend en vivo (`spaceapps-api`, FastAPI) como el servidor mock (`mock/server.js`) emiten el **mismo formato contractual** en respuestas `4xx`/`5xx` (`P-001`, `D-010`):

```json
{
  "error": {
    "code": "ERR_INVALID_COORDINATES",
    "message": "lat: Input should be greater than or equal to -90",
    "details": {
      "field": "lat",
      "value": -95.0,
      "allowed_range": [-90.0, 90.0]
    }
  },
  "detail": "..."
}
```

> El campo `error.code` es la fuente única para la lógica de recuperación del cliente; `detail` se conserva únicamente como espejo opcional de FastAPI/OpenAPI.

---

## Catálogo de errores y recuperación del cliente

La lógica del cliente **debe evaluar exclusivamente la propiedad `error.code`** para decidir la estrategia de recuperación, nunca el texto legible de `error.message`.

| Código de Error | HTTP Status | Cuándo ocurre (Causa raíz) | Qué hace quien consume (Estrategia de recuperación en Frontend) |
| --- | --- | --- | --- |
| `ERR_INVALID_COORDINATES` | `422 Unprocessable Entity` | La latitud está fuera del rango lunar válido (`lat < -90.0` o `lat > 90.0`), o la longitud está fuera de `[-180.0, 360.0]`. | Resaltar en rojo el campo de entrada en la interfaz, mostrar un *tooltip* explicativo indicando el rango válido (`lat`: `-90.0°` a `90.0°`, `lon`: `-180.0°` a `360.0°`) y devolver foco al selector. |
| `ERR_DATE_OUT_OF_RANGE` | `422 Unprocessable Entity` | La fecha inicial (`start_utc`) cae fuera del rango de efemérides SPICE soportado (`1900`–`2050`). | Mostrar alerta de rango temporal no disponible (`1900-2050`), bloquear el botón de evaluación y sugerir automáticamente una ventana temporal válida centrada en la misión Artemis III (ej. `2026-12-01T00:00:00Z`). |
| `ERR_TERRAIN_UNAVAILABLE` | `404 Not Found` / `422` / `503` | Faltan los archivos topográficos LOLA DEM en el servidor o no están disponibles en el rango solicitado. | Advertir al usuario que el dataset DEM no está disponible temporalmente. Ofrecer cargar datos desde el respaldo offline (`mock/server.js`) o reintentar. |
| `ERR_UPSTREAM_SERVICE` | `503 Service Unavailable` | Indisponibilidad temporal de PostgreSQL/PostGIS, del motor físico SPICE o de un servicio externo ascendente. | Activar de inmediato el modo de contingencia (*Offline Fallback*): notificar al usuario con un banner de advertencia y usar el servidor mock local de respaldo. |
| `ERR_INVALID_PAYLOAD` | `400 Bad Request` / `422` | JSON malformado, omisión de campos obligatorios en el cuerpo (`lat`, `lon`, `start_utc`), o parámetros fuera de catálogo/tipo (ej. `resolution` distinto de `64`, `128`, `256`). | Deshabilitar el envío hasta completar los campos obligatorios o corregir parámetros inválidos, mostrando validación reactiva junto al campo reportado. |
| `ERR_SCENARIO_LIMIT_EXCEEDED` | `422 Unprocessable Entity` | La petición a `POST /api/v1/compare` incluye menos de 2 o más de 5 escenarios simultáneos. | El modal de comparación deshabilita el botón "Agregar Escenario" al llegar a 5 elementos y previene el envío si hay menos de 2 escenarios. |
| `ERR_DUPLICATE_SCENARIOS` | `422 Unprocessable Entity` | Se envían dos o más escenarios idénticos (mismas coordenadas normalizadas y misma fecha UTC) en una petición de comparación. | Alertar visualmente en la fila duplicada del modal de comparación para que el usuario diferencie el sitio o la fecha antes de ejecutar el cálculo. |
| `ERR_NOT_FOUND` | `404 Not Found` | Ruta inexistente en la API. | Verificar el prefijo `/api/v1/...` y reportar error de integración. |

---

## Ejemplo de manejo de excepciones en el cliente

```javascript
async function requestSiteEvaluation(payload) {
  try {
    const response = await fetch(`${VITE_API_BASE_URL}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      handleApiError(data.error);
      return null;
    }

    return data;
  } catch (networkErr) {
    // Falla de transporte / servidor no disponible
    activateOfflineMockFallback(payload);
  }
}

function handleApiError(error) {
  switch (error?.code) {
    case 'ERR_INVALID_COORDINATES':
      ui.highlightField('lat', 'Coordenada fuera de rango lunar (-90° a 90°)');
      break;
    case 'ERR_DATE_OUT_OF_RANGE':
      ui.showDateWarning('Fecha fuera de cobertura de efemérides SPICE (1900-2050).');
      break;
    case 'ERR_UPSTREAM_SERVICE':
    case 'ERR_TERRAIN_UNAVAILABLE':
      ui.showBannerWarning('Activando datos científicos precacheados de respaldo.');
      loadPrecalculatedSite(error.details?.suggested_site || 'artemis-shackleton-rim');
      break;
    case 'ERR_INVALID_PAYLOAD':
      ui.showFormError('Por favor verifica los campos obligatorios y parámetros del formulario.');
      break;
    default:
      ui.showGenericError(`Error no catalogado: ${error?.message ?? 'Error desconocido'}`);
  }
}
```
