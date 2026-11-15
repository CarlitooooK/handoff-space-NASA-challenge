# Despliegue y CI/CD — Historial

Cronología, de lo más nuevo a lo más viejo. Fechas absolutas. No se borra: se agrega.

## 2026-11-14
- Fusionados los PR de `.woodpecker/` de la consola (`#12`, `c21456b`) y del globo (`#1`, `8b1c348`), revisados por Carlo y su agente: llaves y secretos fuera del repo, `known_hosts` fijo, y los scripts `lint`, `typecheck`, `test` y `build` que llaman existen y pasan en local. Desde GitHub no se ven los checks de Woodpecker; falta confirmar el primer pipeline y que el servidor tenga `VITE_API_BASE_URL` y `VITE_GLOBE_URL`.
- **Producción única en el servidor:**
  - `deploy-backend.sh` despliega en `spaceapps-api-prod`, con alias de red `spaceapps-api-staging` para el túnel. Acepta `production`, y `staging` como alias.
  - Se probó re-ejecutando el pipeline de `615e64c` (#10): deploy, smoke 5/5 y la URL de Producción en `200`. Una revisión de salud sin límite de tiempo se colgó; se agregaron timeouts.
  - El secreto `public_api_base` apunta a Producción, para `push` y `deployment`.
  - PR del backend `AxelT456/lunar_landing_site_navigator_api#8`: pipeline y `docs/DEPLOY.md` con un solo ambiente.
- **URL del backend de prueba apagada:** `spaceapps-api` y `spaceapps-cloudflared` detenidos con `restart=no`, sin borrar. La URL responde `530`.
- **D-017 reescrita a pedido de Antonio:** lo que corría como staging (backend oficial, cada merge a `main`) pasa a ser Producción, y la URL del backend de prueba (v1.1) queda retirada. Así el backend y los fronts tienen una sola fuente de verdad. Se reescribieron `docs/07`, `docs/12` y la guía de Frontend. No se tocó ningún contenedor.
- Iniciativa creada para documentar los despliegues del backend (ya operando, D-017) y el plan de los fronts (D-018). Los pasos de Carlo para conectar los repos están en `docs/07`.
- **Backend conectado a Woodpecker 2.8.2 en `desktop`.**
  - Activado el repo `AxelT456/lunar_landing_site_navigator_api`.
  - El primer pipeline corrió con `#4`.
  - Desde entonces, cada merge a `main` se despliega a staging, y `#6` (`c254c22`) y `#7` (`615e64c`) llegaron así.
  - Procedimiento en `docs/DEPLOY.md` de ese repo.
- **Staging publicado con su propio Quick Tunnel** (`spaceapps-official-cloudflared`), sin tocar el de Producción. Las URLs están en `docs/07`.
