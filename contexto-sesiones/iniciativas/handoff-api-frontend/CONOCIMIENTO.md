# Handoff API → Frontend — Conocimiento

Reglas, modelo y decisiones de la integración Backend → Frontend, separando lo verificado de lo supuesto.

## Alcance y principio
- El Frontend consume resultados científicos preprocesados vía REST (`JSON`), manteniendo en memoria `timeline[]` y `elevations_m` para garantizar fluidez interactiva a 60 FPS sin cargar GeoTIFFs ni calcular efemérides SPICE en el navegador (`docs/10-producto-y-necesidades.md`).

## Decisiones y su porqué
- **Publicar `FRONTEND_API_GUIDE.md` + `contracts/openapi.json` en la raíz/contratos del handoff (`2026-11-14`).** *Porqué:* Tanto desarrolladores como agentes de IA necesitan una referencia directa con tipos TypeScript, URLs vivas y snippets Three.js exactos, además del JSON OpenAPI 3.1.0 para generación automática de tipos. *Descartado:* Mantener la guía solo fuera del repo en el workspace local del autor.
- **Alinear `contracts/lunar-landing-api-contract.md` a cobertura global (`-90..90`), `13` sitios y `"GO" | "CAUTION" | "NO-GO"` (`2026-11-14`).** *Porqué:* `AGENTS.md` exige que `contracts/` y `docs/` no contradigan la guía ni el backend real.

## Hallazgos verificados
- `curl -sS -m 5 https://chart-owned-alabama-choices.trycloudflare.com/api/v1/health` respondió `200 OK` el `2026-11-14T17:29:06Z` con `status: "ok"`, `landing_sites_count: 13`, `psr_regions_count: 1531`, `engine.available: true`, DEMs `40MPP`/`80MPP`/`lola_global/ldem_64.tif` y kernels `de440s.bsp`/`de421.bsp`.
- `contracts/openapi.json` (OpenAPI `3.1.0`, API `1.0.0`) define exactamente los 6 endpoints bajo `/api/v1/*`, rango `lat` `[-90.0, 90.0]`, `lon` `[-180.0, 360.0]` y enum `status` `["GO", "CAUTION", "NO-GO"]`.
- `docs/10-producto-y-necesidades.md` contenía enlaces rotos con rutas absolutas de máquina local, corregidos a enlaces relativos `../contracts/lunar-landing-api-contract.md`.

## Supuestos sin verificar
- No se ejecutaron en vivo en esta sesión las llamadas `POST /api/v1/evaluate` ni `POST /api/v1/compare` desde un cliente navegador ni se corrió `npx openapi-typescript` en un proyecto Frontend todavía (la guía documenta la verificación previa del `2026-11-13`).
- `docs/01-alcance.md` y `docs/05-flujos.md` conservan la redacción inicial enfocada en Polo Sur (`-90°..-80°`) y `GO / NO-GO`; la cobertura ampliada a `-90..90` y `CAUTION` está ya reflejada en `contracts/` y `FRONTEND_API_GUIDE.md`.

## Pendiente de decisión
- Definir si el equipo usará `mock/` con Prism (`npx @stoplight/prism-cli mock`) o fixtures JSON estáticos para modo offline de presentación (dueño: equipo Frontend).
