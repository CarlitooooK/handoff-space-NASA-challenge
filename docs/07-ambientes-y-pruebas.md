# 7. Ambientes y pruebas

Ambientes activos del Backend, servidor mock autónomo y cómo verificar o consumir la API desde el Frontend. Ver también la guía con ejemplos TypeScript y Three.js en [`FRONTEND_API_GUIDE.md`](../FRONTEND_API_GUIDE.md).

---

## Ambientes

| Ambiente | URL Base API v1 | Documentación / Esquema | Propósito y Notas |
| --- | --- | --- | --- |
| **Producción (backend oficial, HTTPS Cloudflare Quick Tunnel)** | `https://cream-interesting-conventional-conclusions.trycloudflare.com/api/v1` | [Swagger UI](https://cream-interesting-conventional-conclusions.trycloudflare.com/docs) · [OpenAPI JSON](https://cream-interesting-conventional-conclusions.trycloudflare.com/openapi.json) | **La única URL de la API para el front.** Backend oficial (`AxelT456/lunar_landing_site_navigator_api`, rama `main`): cada merge que pasa el CI se publica aquí (D-017). Acceso abierto sin VPN; CORS `*`. Si el contenedor `spaceapps-official-cloudflared` se reinicia, el subdominio `*.trycloudflare.com` cambia. |
| **Apagada (backend de prueba)** | `https://chart-owned-alabama-choices.trycloudflare.com/api/v1` | — | Era la "Producción / Demo Pública" anterior (contrato v1.1). Apagada el 2026-11-14 (D-017): responde `530`. **No la configures en ningún front.** |
| **Local Mock (Zero-Dependency)** | `http://localhost:3000/api/v1` | [`contracts/lunar-landing-api-contract.md`](../contracts/lunar-landing-api-contract.md) | Servidor nativo Node.js sin dependencias externas (`mock/server.js`); `mock/package.json` incluye `{"type": "commonjs"}` (`P-004`). Sirve `8` sitios (`5` Polo Sur + `3` Apollo) con validación unificada (`P-001`, `P-003`). |

El Frontend solo consume la URL de **Producción** o el mock local; no necesita acceso al servidor.

> **Datos reales vs. mock:** la URL de Producción sirve siempre **datos reales** de la base de datos del servidor (PostGIS: sitios y PSR), de los DEM LOLA y de los kernels SPICE; no usa el mock. El mock (`mock/server.js`) no está publicado en ninguna URL: solo corre en la máquina de quien lo arranca (`localhost:3000`), para trabajar sin internet, y sus valores son simulados. Para distinguirlos en una respuesta de `/terrain/patch` (v1.2): `grid.source` es `"lola_polar"` o `"lola_global"` con datos reales y `"synthetic"` en el mock.

### Versión del contrato por ambiente

| Ambiente | Contrato | Nota |
| --- | --- | --- |
| Producción (backend oficial) | **v1.3** | Todos los campos y endpoints de v1.2 ([`docs/12`](12-contrato-api-v1.2.md)) más `GET /terrain/tiles` (D-016), desde `AxelT456/lunar_landing_site_navigator_api#7` (`615e64c`). Verificado el 2026-11-14. |
| Apagada | — | Ya no responde. |
| Local Mock | **v1.3** | Todos los campos y endpoints de v1.3 con datos simulados (las teselas son relieve sintético, `X-Terrain-Source: synthetic`). |

IM-2 (`P-009`): la base de datos de Producción todavía tiene IM-2 en `lon 31.2`. La corrección se ve en cuanto se aplique en el servidor.

Los campos de v1.2 son aditivos: un cliente escrito para v1.2 que trate `checks`, `timeline`, `source` y `native_resolution_m` como opcionales funciona igual contra v1.1.

### Despliegues (CI/CD)

Woodpecker CI corre en `desktop`; su URL no se publica en este repo (es el panel de operación). Antonio la comparte por mensaje directo a quien necesite entrar con su cuenta de GitHub.

| Pieza | En cada PR | En cada merge a `main` | Cómo cambia lo público |
| --- | --- | --- | --- |
| Backend (`AxelT456/lunar_landing_site_navigator_api`) | Check `ci/woodpecker/pr/ci`: pytest, PostGIS con el seed, contract gate (bloquea) y build | Publicación directa en **Producción**, después de que la API nueva responda su `health` | Cada merge que pasa el CI (D-017). Vuelta atrás: en Woodpecker, *Deploy* a `production` del pipeline de un merge anterior de `main` |
| Consola y globo (`CarlitooooK/*`) | Check `ci/woodpecker/pr/ci`: la consola corre lint, typecheck, test y build; el globo, typecheck y build | Publicación directa: un solo ambiente (D-018) | Cada merge que pasa el CI. Se publica cuando Carlo complete los pasos de abajo |

Un despliegue del backend reinicia el contenedor de la API, no el de su túnel: la URL pública no cambia.

#### Pasos de Carlo para conectar la consola y el globo

Antes de estos pasos, Antonio ya habrá:
- registrado la cuenta `CarlitooooK` en Woodpecker;
- dejado listo el servidor;
- abierto en cada repo un PR con la carpeta `.woodpecker/`, desde un fork de `AnthonyNav`.

Ninguno de los pasos cambia código de los repos.

1. **Entrar a Woodpecker.** Abre la URL que te pasa Antonio, entra con GitHub (`CarlitooooK`) y autoriza la app.
   - GitHub pide acceso a tus repos. Woodpecker lo usa para leer el código, crear el webhook y marcar el check del PR.
   - No guarda tu contraseña.
2. **Activar los dos repos.** En *Repositories* → *Add repository*, activa `luna-landing-navigator-console` y `luna-render-nasa-space-challenge`.
   - Hace falta ser admin del repo en GitHub.
   - Si prefieres que lo haga Antonio, en vez de este paso dale rol *Admin* a `AnthonyNav` en GitHub → *Settings* → *Collaborators*.
3. **Avisar a Antonio.** Él carga los ajustes de cada repo y la llave de despliegue en Woodpecker. Tú no tienes que configurar nada ahí.
4. **Revisar y fusionar los PRs de `.woodpecker/`.**
   - Si Woodpecker marca el pipeline del PR como "pendiente de aprobación" (los PRs desde forks lo piden), apruébalo en Woodpecker o pídeselo a Antonio.
   - Con el merge corre el primer despliegue.
5. **Opcional: proteger `main`.** En GitHub → *Settings* → *Branches*, exige el check `ci/woodpecker/pr/ci` antes de fusionar.

Desde ahí, cada merge a `main` que pase el CI se publica solo. Las URLs públicas de la consola y del globo se agregan a la tabla de ambientes de este documento.

---

## Variables de entorno

Nombres recomendados para el Frontend, **sin valores secretos** (la URL se parametriza para actualizarla si cambia el Quick Tunnel o se usa el mock):

| Variable | Tipo | Ejemplo / Default | Descripción |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | Cadena | `https://cream-interesting-conventional-conclusions.trycloudflare.com/api/v1` | URL base para proyectos basados en Vite / React. Para usar mock local: `http://localhost:3000/api/v1` (`P-002`). |
| `NEXT_PUBLIC_API_BASE_URL` | Cadena | `https://cream-interesting-conventional-conclusions.trycloudflare.com/api/v1` | URL base para proyectos basados en Next.js. Para mock local: `http://localhost:3000/api/v1`. |
| `PORT` | Numérico | `3000` | Puerto TCP donde escucha el servidor mock local. |
| `NODE_ENV` | Cadena | `development` | Modo de ejecución del proceso. |

---

## Datos de prueba

1. **Sitios Curados:**
   - El backend sirve `13` sitios curados (`10` en el Polo Sur Artemis III/CLPS a `40 m/px` + `3` históricos Apollo globales sobre `ldem_64.tif`) y `1,531` polígonos PSR en PostGIS.
   - Coordenadas de prueba rápida (Shackleton Rim): `lat=-89.66`, `lon=222.7`, `start_utc="2026-12-01T00:00:00Z"`.
2. **Malla Topográfica (DEM Patch):**
   - Recorte de $12\text{ km} \times 12\text{ km}$ centrado en Shackleton Rim con resolución configurable ($64 \times 64$, $128 \times 128$, $256 \times 256$).
3. **Serie Temporal (Timeline 14 días):**
   - 336 puntos horarios incluyendo vectores cartesianos unitarios 3D del Sol y la Tierra con efecto de libración polar.

---

## Cómo probar la API y correr en local

### Opción A: Probar contra el Backend en Vivo (HTTPS)

```bash
# 1. Verificar salud del backend, datasets LOLA/SPICE y PostGIS
curl -s https://cream-interesting-conventional-conclusions.trycloudflare.com/api/v1/health | jq .

# 2. Listar los 13 sitios curados
curl -s https://cream-interesting-conventional-conclusions.trycloudflare.com/api/v1/sites | jq .

# 3. Generar tipos TypeScript desde el contrato OpenAPI local
# (ejecutar vía npx sin instalar como devDependency para no chocar con TypeScript 7 de Vite, ver P-005)
npx openapi-typescript contracts/openapi.json -o src/types/api.d.ts
```

*(Si la URL pública del túnel cambia tras un reinicio en `desktop`, se consulta con `docker logs spaceapps-official-cloudflared 2>&1 | grep trycloudflare`).*

---

### Opción B: Levantar el Servidor Mock Zero-Dependency (Offline / Local)

El servidor mock no requiere `npm install` ni paquetes externos; corre sobre el runtime nativo de Node.js:

```bash
# Iniciar el servidor mock en el puerto 3000
node mock/server.js

# O en un puerto personalizado
PORT=3001 node mock/server.js
```

Pruebas rápidas contra el mock local:
```bash
# Salud
curl -s http://localhost:3000/api/v1/health | jq .

# Catálogo de sitios
curl -s http://localhost:3000/api/v1/sites | jq .

# Parche topográfico 3D
curl -s "http://localhost:3000/api/v1/terrain/patch?lat=-89.66&lon=222.7&size_km=12&resolution=128" | jq .

# Evaluación con timeline temporal
curl -s -X POST http://localhost:3000/api/v1/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "lat": -89.66,
    "lon": 222.7,
    "start_utc": "2026-12-01T00:00:00Z",
    "duration_days": 14.0,
    "step_minutes": 60
  }' | jq '{site: .site, summary: .summary, timeline_points: (.timeline | length)}'
```
