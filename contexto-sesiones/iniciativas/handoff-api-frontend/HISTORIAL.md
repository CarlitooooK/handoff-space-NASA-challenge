# Handoff API → Frontend — Historial

Cronología, de lo más nuevo a lo más viejo. Fechas absolutas. No se borra: se agrega.

## 2026-11-14
- Se incorporó `FRONTEND_API_GUIDE.md` en la raíz del repositorio con la guía completa de los 6 endpoints REST v1, cliente `apiFetch`, ejemplos TypeScript y snippets Three.js (`PlaneGeometry` + vectores Sol/Tierra).
- Se copió `contracts/openapi.json` (OpenAPI `3.1.0` / API `1.0.0`) y se actualizó `contracts/README.md`.
- Se alineó `contracts/lunar-landing-api-contract.md` con el backend verificado en vivo (URLs de Cloudflare HTTPS y Tailscale, CORS abierto, `lat` `-90.0..90.0`, `13` sitios curados y `status` `"GO" | "CAUTION" | "NO-GO"`).
- Se completaron `docs/07-ambientes-y-pruebas.md` y `docs/09-decisiones.md`, se corrigieron enlaces absolutos locales en `docs/10-producto-y-necesidades.md` y se enlazó la guía en `README.md` y `AGENTS.md`.
- Se verificó en vivo `GET https://chart-owned-alabama-choices.trycloudflare.com/api/v1/health` (`200 OK`, `landing_sites_count: 13`, `psr_regions_count: 1531`).
- Se documentó el componente transversal en `contexto-sesiones/_compartido/backend-api.md` y se creó esta iniciativa en `contexto-sesiones/iniciativas/handoff-api-frontend/`.
