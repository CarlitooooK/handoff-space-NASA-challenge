# Lunar Landing Navigator — Handoff

**Última actualización:** 2026-11-14 · **Responsable:** Equipo Técnico Lunar Landing Navigator · **Repo / componente:** `handoff-space-NASA-challenge`

---

## En una línea

Infraestructura contractual (10 documentos en `docs/`, contrato `contracts/lunar-landing-api-contract.md` v1.1 + `contracts/openapi.json`, guía `FRONTEND_API_GUIDE.md`), servidor mock (`mock/server.js` + `mock/package.json`) y backend API en vivo (`spaceapps-api` en `desktop`) unificados y listos para integrar con `frontend-console`.

---

## Estado actual

| Pieza | Estado |
| --- | --- |
| **Documentación técnica y contexto (`docs/00` a `docs/10`)** | Hecho |
| **Contrato de API formal (`contracts/` + `openapi.json`)** | Hecho (v1.1 alineado con backend y mock) |
| **Backend API REST en vivo (`spaceapps-api` en `desktop` + túnel HTTPS)** | Hecho (6 endpoints, `13` sitios, `ErrorResponse` unificado) |
| **Stack de CI/CD en `desktop` (Woodpecker CI + `spaceapps-ci-cloudflared`)** | Listo (pendiente conectar webhooks de repos GitHub) |
| **Servidor Mock Zero-Dependency (`mock/server.js` + `mock/package.json`)** | Hecho (CommonJS en puerto 3000, `8` sitios, `lat [-90, 90]`) |
| **Consola Frontend (`luna-landing-navigator-console`)** | En curso: fase 1 mockeada completa, ver [`frontend-console`](../frontend-console/HANDOFF.md) |
| **Guion de Pitch, Video y AI Tool Disclosure** | Desbloqueado · En curso |

---

## Pendientes (en orden de valor)

1. **Integración en vivo de Frontend y Fase 2 (`luna-landing-navigator-console`):** Verificación visual del visor 3D, prueba contra la URL HTTPS en vivo de [`docs/07-ambientes-y-pruebas.md`](../../../docs/07-ambientes-y-pruebas.md), perfil 2D de horizonte, capa PSR (`/psr/nearby`), comparador (`/compare`) y regeneración de tipos si se requiere `ErrorResponse`. Detalle en [`frontend-console/HANDOFF.md`](../frontend-console/HANDOFF.md).
2. **Revisión y commit de cambios pendientes en este repo:** Validar el working tree local antes de autorizar commit/push y regenerar `api.d.ts` en frontend si consume `ErrorResponse` desde `contracts/openapi.json`.
3. **Conectar pipelines en Woodpecker CI:** Una vez definidos los repositorios finales de backend/frontend en GitHub, conectar `.woodpecker.yml` para despliegue automático en `desktop`. (Nota: `AxelT456/lunar_landing_site_navigator_api` `64cdae2` sigue siendo solo scaffolding en memoria con `app/infrastructure/` vacío; la API productiva actual vive en `desktop`.)
4. **Entregables de Comunicación:** Grabación de demo interactiva (video ≤ 2 minutos) y redacción del *AI Tool Disclosure* conforme a la rúbrica oficial de NASA Space Apps.

---

## Cómo retomar

1. Lee [`CONOCIMIENTO.md`](CONOCIMIENTO.md), [`../../_compartido/backend-api.md`](../../_compartido/backend-api.md) y [`../../../docs/07-ambientes-y-pruebas.md`](../../../docs/07-ambientes-y-pruebas.md).
2. Para desarrollo offline con el mock local (ya incluye `mock/package.json` CommonJS):
   ```bash
   node mock/server.js
   ```
   (Escucha en `http://localhost:3000`, base `/api/v1`, con CORS habilitado).
3. Para apuntar al backend real o regenerar tipos con `contracts/openapi.json`, sigue las variables y comandos de [`../../../docs/07-ambientes-y-pruebas.md`](../../../docs/07-ambientes-y-pruebas.md).
4. Antes de modificar endpoints o tipos de datos, consulta [`../../../PREGUNTAS.md`](../../../PREGUNTAS.md) y [`../../../contracts/lunar-landing-api-contract.md`](../../../contracts/lunar-landing-api-contract.md).

---

## Notas

- Tanto el backend en vivo (`spaceapps-api`) como `mock/server.js` aceptan `lat` en `[-90.0, 90.0]` (`13` sitios en backend en vivo; `8` sitios en mock incluyendo Apollo 11, 15 y 17) y fechas UTC entre `1900` y `2050`.
- Todo desarrollo de interfaz debe manejar errores basándose exclusivamente en `error.code` (`ErrorResponse`) según la matriz definida en [`../../../docs/06-contrato-y-errores.md`](../../../docs/06-contrato-y-errores.md).
