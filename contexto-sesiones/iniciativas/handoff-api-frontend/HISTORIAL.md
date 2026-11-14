# Handoff API → Frontend — Historial

Cronología, de lo más nuevo a lo más viejo. Fechas absolutas. No se borra: se agrega.

## 2026-11-14 (cierre)
- Se cerró la iniciativa por duplicar responsable y tema con [`lunar-landing-navigator`](../lunar-landing-navigator/HANDOFF.md); el trabajo continúa allí. Se corrigieron en `CONOCIMIENTO.md` los hallazgos que dejaron de ser ciertos.

## 2026-11-14 (actualización)
- Se respondieron `P-001` a `P-005` en `PREGUNTAS.md` (movidas a *Respondidas*) tras verificar en vivo `422` (`{ detail }`) y cobertura global `[-90, 90]` (Apollo 11 `200 OK` en `/terrain/patch`).
- Se actualizaron `docs/06-contrato-y-errores.md`, `docs/07-ambientes-y-pruebas.md`, `docs/08-pendientes.md`, `docs/09-decisiones.md` (`D-010`) y `mock/README.md` (nota CommonJS/ESM, URL mock `/api/v1`, `npx openapi-typescript` y limpieza de enlaces locales absolutos).
- Se inspeccionó `AxelT456/lunar_landing_site_navigator_api` (`64cdae2`) y se documentó su estado real (scaffolding FastAPI sintético sin `app/infrastructure/`) en `contexto-sesiones/_compartido/backend-api.md` y `CONOCIMIENTO.md`.
- Se actualizó el estado de `mock/` en `HANDOFF.md` (`P-004`).

## 2026-11-14 (inicio)
- Se incorporó `FRONTEND_API_GUIDE.md` (`contracts/openapi.json` y alineación de `contracts/lunar-landing-api-contract.md`, `docs/07`, `docs/09`, `docs/10`, `README.md`, `AGENTS.md`). Commit `5b78a50`.
- Se creó `contexto-sesiones/_compartido/backend-api.md` y la iniciativa `contexto-sesiones/iniciativas/handoff-api-frontend/`.
