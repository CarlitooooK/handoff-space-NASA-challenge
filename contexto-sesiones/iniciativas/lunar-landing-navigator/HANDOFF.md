# Lunar Landing Navigator — Handoff

**Última actualización:** 2026-11-14 · **Responsable:** Equipo Técnico Lunar Landing Navigator · **Repo / componente:** `handoff-space-NASA-challenge`

---

## En una línea

Contrato v1.3 publicado aquí (v1.2 de D-014 más las teselas de terreno de D-016, `P-008`): especificación en `contracts/`, guía de consumo en `docs/12` y mock alineado. El backend oficial ya lo sirve en su propia URL pública; la URL de Producción sigue en v1.1 hasta decidir la promoción.

---

## Estado actual

| Pieza | Estado |
| --- | --- |
| **Documentación técnica y contexto (`docs/00` a `docs/12`)** | Hecho |
| **Contrato de API (`contracts/` + `openapi.json`)** | v1.3 (D-016: teselas de terreno), aditivo sobre v1.2 (D-014); `openapi.json` exportado del backend oficial (`615e64c`) |
| **URLs públicas** | Dos ([`docs/07`](../../../docs/07-ambientes-y-pruebas.md)): Producción (backend de prueba, v1.1) y Backend oficial (`main`, v1.3) |
| **Backend oficial (`AxelT456/lunar_landing_site_navigator_api`)** | `#6` integrado: código de producción + v1.2, contract gate 5/5 en CI. `#7` integrado: teselas de terreno de toda la Luna (`P-008`, verificado en la URL del Backend oficial). Cada merge a `main` se despliega en staging, que además tiene su URL pública; Producción cambia solo al promover |
| **CI/CD (Woodpecker en `desktop`)** | Conectado: PR → `ci` (pytest, PostGIS con el seed, contract gate bloqueante, build); merge → staging; promoción → producción |
| **Servidor Mock (`mock/server.js` + `mock/package.json`)** | v1.3 con datos simulados (CommonJS, puerto 3000, `8` sitios, teselas con relieve sintético) |
| **Consola Frontend (`luna-landing-navigator-console`)** | Ver [`frontend-console`](../frontend-console/HANDOFF.md) |
| **Guion de Pitch, Video y AI Tool Disclosure** | En curso |

---

## Pendientes (en orden de valor)

1. **Decidir la URL del front** ([`docs/12`](../../../docs/12-contrato-api-v1.2.md) §10): promover el backend oficial detrás de la URL de Producción (Woodpecker → pipeline del último `main`, hoy `615e64c` → Deploy `production`) o que el front pase a la URL del Backend oficial. En los dos casos, actualizar la tabla de versiones de [`docs/07`](../../../docs/07-ambientes-y-pruebas.md).
2. **Aplicar `db/init/20_im2_lroc_site.sql` una vez a la base del servidor** (`P-009`): la comparten las dos URLs, así que la corrección aparece en ambas.
3. **`P-010` (cómo pide el globo las teselas de `P-008`):** el endpoint ya existe (D-016), pero `docs/11` §1 y §4 dicen que el globo nunca llama a la API. Lo deciden Globo y Frontend; si se acepta, se actualizan `docs/11` y el protocolo del globo.
4. **Avisar a la consola y al globo** que el contrato v1.2 está publicado (`docs/12`): `site.checks` resuelve el texto en español de `reasons`, `include_timeline` las pistas del comparador, `GET /psr` las PSR de todo el polo y `GET /ephemeris` el cielo sin sitio. El globo actualiza `docs/11` §7 cuando adopte `/ephemeris`.
5. **Copia del contrato en el repo del backend:** su `lunar-landing-api-contract.md` quedó en una versión anterior a v1.1; sincronizarla con la de aquí.
6. **Ejemplos del contrato:** los valores de Shackleton en los ejemplos (`elevation_m 2048.5`, `slope_deg 6.4`, `GO`) vienen del esqueleto anterior y no coinciden con la API real (LOLA da `880.1 m`, `16.0°`). Son ilustrativos, pero conviene reemplazarlos por una respuesta real.
7. **URLs efímeras:** las dos son Quick Tunnels; un Named Tunnel con dominio propio evitaría actualizar `docs/07` en cada reinicio.
8. **Entregables de Comunicación:** video ≤ 2 minutos y *AI Tool Disclosure*.

---

## Cómo retomar

1. Lee [`CONOCIMIENTO.md`](CONOCIMIENTO.md), [`../../_compartido/backend-api.md`](../../_compartido/backend-api.md) y [`../../../docs/07-ambientes-y-pruebas.md`](../../../docs/07-ambientes-y-pruebas.md).
2. Para desarrollo offline con el mock local:
   ```bash
   node mock/server.js
   ```
   (Escucha en `http://localhost:3000`, base `/api/v1`, con CORS habilitado.)
3. Para regenerar tipos con `contracts/openapi.json`, sigue los comandos de [`../../../docs/07-ambientes-y-pruebas.md`](../../../docs/07-ambientes-y-pruebas.md).
4. Antes de modificar endpoints o tipos, consulta [`../../../PREGUNTAS.md`](../../../PREGUNTAS.md) y [`../../../contracts/lunar-landing-api-contract.md`](../../../contracts/lunar-landing-api-contract.md).

---

## Notas

- Los campos de v1.2 son aditivos: un cliente que los trate como opcionales funciona contra v1.1 y v1.2.
- `docs/12` y `contracts/lunar-landing-api-contract.md` describen el mismo contrato desde dos ángulos (consumo y especificación). Si cambia el contrato, se actualizan los dos en el mismo commit; si chocan, manda `contracts/`.
- Todo manejo de errores y del veredicto se decide por código (`error.code`, `checks[].code` / `level`), nunca por texto ([`../../../docs/06-contrato-y-errores.md`](../../../docs/06-contrato-y-errores.md)).
