# Despliegue y CI/CD — Conocimiento

Cómo se despliegan el backend y los fronts desde Woodpecker en `desktop`, el plan para los fronts y el porqué de cada decisión. Lo verificado se separa de lo supuesto. Las URLs vigentes viven solo en `docs/07`.

## Alcance y principio
El objetivo es que cada merge a `main` llegue solo a su ambiente sin pasos manuales, y que lo que ve el público cambie solo por una acción explícita o por un merge que pasó el CI.

**Criterio que manda:** nunca romper una URL pública que alguien ya usa. Antes que automatizar más, se protege lo que está en uso.

## Modelo

| Pieza | Repo | PR | Merge a `main` | Público |
| --- | --- | --- | --- | --- |
| Backend (D-017) | `AxelT456/lunar_landing_site_navigator_api` | `ci`: pytest, PostGIS con el seed, contract gate bloqueante, build de prueba | **Producción directa** (contenedor `spaceapps-api-prod`) | URL de Producción (túnel `spaceapps-official-cloudflared`) |
| Consola (D-018) | `CarlitooooK/luna-landing-navigator-console` | `ci`: lint, typecheck, test, build | **producción directa** (un solo ambiente) | Quick Tunnel propio |
| Globo (D-018) | `CarlitooooK/luna-render-nasa-space-challenge` | `ci`: typecheck, build | **producción directa** (un solo ambiente) | Quick Tunnel propio |

**URLs que guarda cada build.** Este dato manda en el orden de los pasos y en qué hay que recompilar:
- **Consola:** guarda dos URLs al compilar, `VITE_API_BASE_URL` y `VITE_GLOBE_URL` (`docs/11` §3).
- **Globo:** no guarda ninguna. La consola le pasa su propio origen en `?allowedOrigins=` (`GlobeFrame.tsx` de la consola). Si se acepta `P-010`, la URL de las teselas también llegaría por mensaje desde la consola.

## Plan de ejecución de los fronts

**Fase 0. Acceso (Antonio)**
1. La consola consume la URL de Producción (D-017, D-018): ya no hay nada que decidir ahí.
2. Registrar a `CarlitooooK` en Woodpecker (`WOODPECKER_OPEN=false`: solo entran los usuarios registrados).

**Fase 1. Servidor estático en `desktop`**
1. Un contenedor `spaceapps-frontend` (Caddy) en la red `spaceapps-net`, en un proyecto de Docker Compose aparte (`frontend`) para no tocar los del backend.
2. Un sitio por front:
   - Archivos en `/srv/spaceapps/services/frontend/<consola|globo>/releases/<sha12>`.
   - Enlace `current` a la versión activa y `prev` a la anterior.
3. Caché:
   - `index.html` sin caché.
   - `/assets/*` (con hash) y `/cesium/*` con caché larga.
4. Prueba interna antes de abrir al público:
   - Puertos en `127.0.0.1` (propuestos: 8460 consola y 8461 globo).
   - Publicados solo dentro de la red de Tailscale, nunca con Funnel (propuestos: 8450 y 8451).
   - Los puertos están **sin verificar** que estén libres.

**Fase 2. Deploy de fronts (mismo esquema que el backend)**
1. **Una llave SSH por repo**, con comando forzado y la app fija:
   - La llave de la consola solo puede ejecutar `deploy-frontend.sh consola <sha40>`.
   - La del globo solo puede ejecutar `deploy-frontend.sh globo <sha40>`.
   - Las llaves privadas no salen del servidor; en Woodpecker van como secreto.
2. **Qué hace el script:**
   1. Rechaza commits que no estén en `origin/main`.
   2. Compila en un contenedor `node:22` (`npm ci && npm run build`) con las URLs del registro.
   3. Revisa la versión nueva: `index.html` con código 200. En el globo, además, los assets de `/cesium` y los modelos. En la consola, que el JS compilado contenga la API y el globo esperados.
   4. Cambia `current` y guarda la versión anterior en `prev`. Si la revisión posterior falla, vuelve sola a `prev`.
3. **Registro de URLs en el servidor:** `frontend/urls.env`, con la API y el globo que usa la consola.
   - Es la fuente para compilar: así un cambio de túnel no exige un PR en los repos de Carlo.
   - La fuente para las personas sigue siendo `docs/07`.
4. **Modo `rebuild`:** recompila la versión activa con las URLs actuales del registro, sin pipeline.

**Fase 3. Woodpecker y repos**

| Quién | Paso |
| --- | --- |
| Antonio | Abrir un PR por repo, desde un fork, con `.woodpecker/ci.yaml` (PR y push) y `.woodpecker/deploy.yaml` (push a `main`, depende de `ci`). |
| Carlo | Pasos 1 a 3 de `docs/07`: entrar, activar los dos repos (o dar admin a `AnthonyNav`) y avisar. |
| Antonio | Ajustes de cada repo: `allow_deploy` para redesplegar a mano, tiempo límite, aprobación para PRs de forks. Cargar en cada repo su secreto `deploy_ssh_key_frontend`, solo para el evento `push`. |
| Carlo | Pasos 4 y 5 de `docs/07`: fusionar los PRs y, si quiere, proteger `main`. |

**Fase 4. Primer despliegue**
1. **Túneles primero:** antes del primer merge se levantan los Quick Tunnels de los dos fronts (`spaceapps-globe-cloudflared` y `spaceapps-console-cloudflared`) apuntando al servidor estático, aunque todavía no sirva nada. Así la URL del globo ya está en el registro cuando se compila la consola.
2. **Orden de merge:** primero el globo, que se prueba en su puerto interno; luego la consola.
3. **Pruebas:** la revisión local de Antonio se amplía con un modo remoto que valida:
   - el JS publicado de la consola (API y globo correctos);
   - los assets de Cesium del globo;
   - CORS de la API desde el origen de la consola;
   - las teselas de Moon Trek desde el origen del globo.
4. **Publicación:** las URLs se anotan en la tabla de ambientes de `docs/07`.

**Fase 5. Operación**

| Si cambia la URL de… | Qué se hace |
| --- | --- |
| la API | `rebuild` de la consola y actualizar `docs/07` |
| el globo | Anotarla en el registro, `rebuild` de la consola y actualizar `docs/07` |
| la consola | Nada que recompilar; solo actualizar `docs/07` |

- **Rollback de un front:** volver a `prev` con el script, o redesplegar un `sha` anterior de `main`.

**Fase 6. Al final:** dominio propio con un Named Tunnel (subdominios fijos para API, consola y globo). Reemplaza a los Quick Tunnels y elimina casi toda la fase 5.

## Decisiones y su porqué
- **Backend: cada merge a `main` se publica en Producción; la URL del backend de prueba se retira (2026-11-14; D-017).** *Porqué:* una sola fuente de verdad para backend y fronts. Antes, la URL de Producción servía el backend de prueba (v1.1) mientras `main` (v1.3) estaba en "staging", y el público solo veía lo nuevo tras una promoción. *Costo aceptado:* sin staging, lo que pase el CI llega al público. *Descartado:* staging más promoción manual, que fue el primer esquema ese mismo día; se descartó en cuanto la URL de "staging" ya era la que usábamos todos.
- **Fronts: un solo ambiente, producción en cada merge (2026-11-14; D-018).** *Porqué:* son archivos estáticos con cambio atómico (un enlace) y vuelta atrás en un comando. Un staging duplicaría túneles y URLs que hay que mantener, sin proteger datos ni contratos. El riesgo se cubre con el CI obligatorio en el PR, la revisión antes de publicar y el rollback automático. *Descartado:* staging y producción como en el backend.
- **La consola publicada consume la URL de Producción (2026-11-14; D-018).** *Porqué:* con D-017 Producción ya es el backend oficial con v1.3: el backend y los fronts ven lo mismo.
- **Túneles nuevos para los fronts, sin tocar el de la API (2026-11-14).** *Porqué:* reiniciar un Quick Tunnel cambia su URL. *Descartado:* rutas por path detrás de un solo túnel, porque el globo resuelve Cesium en `/cesium` absoluto y la consola compila con base `/`.
- **Compilar en el servidor, no en el agente (2026-11-14).** *Porqué:* igual que el backend. El servidor es la fuente de las URLs (`urls.env`), un cambio de túnel se resuelve con `rebuild` sin pipeline ni PR, y la llave solo puede desplegar commits de `main`. *Descartado:* URLs como secretos de Woodpecker, porque obligan a re-ejecutar el pipeline en cada cambio de túnel.
- **Publicar desde `desktop` y no en Vercel, Netlify ni Cloudflare Pages (2026-11-14).** *Porqué:* un solo lugar de operación con el mismo CI, sin cuentas ni tokens externos. *Costo aceptado:* si `desktop` se apaga, se caen la API y los fronts a la vez (la API ya dependía de él).

## Hallazgos verificados
- **Woodpecker 2.8.2:** activa los repos con `allow_deploy` apagado y entonces las promociones responden `403`. Se encendió en el backend (2026-11-14).
- **Las dos URLs al 2026-11-14, antes de apagar la vieja:** la vieja respondía `404` en `/psr`, `/ephemeris` y `/terrain/tiles`, y no trae `grid.source`. La de Producción respondía `200` y `grid.source = lola_polar` (40 m) en Shackleton.
- **Primer merge:** si se fusiona antes de activar el repo, no corre ningún pipeline. Se resolvió con un commit vacío (backend `#4`).
- **Secretos:** los pasos que un `when` descarta no resuelven secretos, así que el secreto de deploy no se expone en los PRs.
- **Acceso:** `AnthonyNav` tiene solo lectura en los dos repos de Carlo (2026-11-14). Activarlos en Woodpecker exige admin.
- **CORS:** la API responde CORS `*`, así que no necesita cambios para los orígenes nuevos de los fronts.
- **Endpoints de la consola:** usa solo endpoints de v1.1, así que funciona contra cualquiera de las dos URLs de API de `docs/07`.

## Supuestos sin verificar
- Que el rollback del backend con un *Deploy* a `production` de un pipeline anterior funcione de punta a punta (no se ha probado; el redeploy del mismo commit con un re-run sí, en el pipeline #10).
- Que los puertos propuestos (8450, 8451, 8460 y 8461) estén libres en `desktop`.
- Que un Quick Tunnel por front aguante el tráfico de la demo (los Quick Tunnels no tienen SLA).

## Pendiente de decisión
- Quién activa los repos: Carlo los activa, o da admin a `AnthonyNav` (`docs/07`).
- Cuándo borrar los contenedores apagados de la URL vieja: Antonio.
- Dominio propio: al final, sin dueño todavía.
