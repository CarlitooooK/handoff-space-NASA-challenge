# Iniciativas

Un trabajo con inicio y fin (una funcionalidad, un análisis, una migración, un bug). Para crear una, copia [`../_plantillas/iniciativa/`](../_plantillas/iniciativa/) a `<ticket>-<nombre>/` y agrégala al índice de `../README.md`.

## Activas y completadas

- [`lunar-landing-navigator/`](lunar-landing-navigator/HANDOFF.md) — Infraestructura de handoff, documentación de 10 guías, contrato de API y servidor mock autónomo para el reto NASA Space Apps.
- [`frontend-console/`](frontend-console/HANDOFF.md) — Consola web React (dashboard, visor 3D y timeline) construida contra el contrato y el mock.
- [`despliegue-ci-cd/`](despliegue-ci-cd/HANDOFF.md) — Despliegues desde Woodpecker CI en `desktop`: backend (cada merge a `main` se publica en Producción) y plan para publicar la consola y el globo.
- [`lunar-globe-renderer/`](lunar-globe-renderer/HANDOFF.md) — Globo lunar 3D estilo Google Earth (CesiumJS + teselas NASA Moon Trek), desarrollado aparte e incrustable en la consola por iframe.
