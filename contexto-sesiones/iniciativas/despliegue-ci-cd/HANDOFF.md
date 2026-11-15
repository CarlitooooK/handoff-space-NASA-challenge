# Despliegue y CI/CD — Handoff

**Última actualización:** 2026-11-14 · **Responsable:** Antonio (`AnthonyNav`, opera `desktop`) · **Repo / componente:** Woodpecker CI en `desktop`; backend `AxelT456/lunar_landing_site_navigator_api`; consola `CarlitooooK/luna-landing-navigator-console`; globo `CarlitooooK/luna-render-nasa-space-challenge`

## En una línea
El backend oficial es Producción y cada merge a `main` se publica ahí (D-017); la URL del backend de prueba se apagó. La consola y el globo se publicarán igual, con un solo ambiente (D-018): primero Antonio prepara su parte y después Carlo conecta los repos con los pasos de `docs/07`.

## Estado actual
| Pieza | Estado |
| --- | --- |
| Woodpecker 2.8.2 en `desktop` (servidor, agente, OAuth de GitHub) | Hecho |
| Backend: PR → `ci` con contract gate bloqueante | Hecho |
| Backend: merge a `main` → Producción (contenedor `spaceapps-api-prod`, túnel `spaceapps-official-cloudflared`) | Hecho y probado (pipeline #10). El servidor ya acepta `production`; el pipeline lo manda desde `AxelT456/lunar_landing_site_navigator_api#8` |
| URL del backend de prueba (`spaceapps-api`, `spaceapps-cloudflared`, v1.1) | Apagada el 2026-11-14: contenedores detenidos con `restart=no`, sin borrar; la URL responde `530` |
| Fronts: preparación de Antonio (fases 1 a 3 de `CONOCIMIENTO.md`) | No iniciado |
| Fronts: pasos de Carlo (`docs/07`) | Esperan la preparación de Antonio |
| URLs públicas de la consola y del globo | No iniciado (irán a `docs/07`) |
| Dominio propio (Named Tunnel) | Pendiente al final; mientras, Quick Tunnels |

## Pendientes (en orden de valor)

**Antes de los pasos de Carlo (Antonio)**
1. **Registrar a `CarlitooooK` en Woodpecker.** El servidor no tiene registro abierto: hay que agregarlo a la lista de usuarios.
2. **Servidor:**
   - el contenedor estático;
   - el script de deploy de fronts, con una llave por repo;
   - el registro de URLs, con la API de Producción;
   - los dos Quick Tunnels de los fronts, para tener la URL del globo antes de compilar la consola.
3. **Abrir en cada repo el PR de `.woodpecker/`** desde un fork de `AnthonyNav`.

**Después**
4. **Pasos de Carlo** (`docs/07`): entrar a Woodpecker, activar los repos, avisar y fusionar los PRs.
5. **Al avisar Carlo:** cargar los ajustes y el secreto `deploy_ssh_key_frontend` en cada repo, porque solo se puede hacer con el repo ya activo. Luego verificar el primer pipeline y el primer despliegue.
6. **Publicar las URLs de la consola y del globo en `docs/07`.**
7. **Backend `#8` (Axel):** revisar y fusionar. Después, quitar del script del servidor el alias `staging`.
8. **Borrar los contenedores apagados** (`spaceapps-api`, `spaceapps-cloudflared`) cuando ya no se vayan a necesitar para volver atrás. Hay que confirmarlo antes.
9. **Al cerrar la iniciativa:** subir el funcionamiento estable a `_compartido/` (hoy está en `CONOCIMIENTO.md`).
10. **Al final:** dominio propio con un Named Tunnel, que reemplaza a los Quick Tunnels.

## Cómo retomar
1. Lee `CONOCIMIENTO.md` (modelo, plan y porqués) y las secciones "Ambientes" y "Despliegues (CI/CD)" de `../../../docs/07-ambientes-y-pruebas.md`.
2. Para el backend, el procedimiento vive en su repo: `docs/DEPLOY.md`. Hasta que se fusione `#8`, la versión de `main` todavía describe el esquema anterior (staging + promoción).
3. Antes de seguir, revisa `../../../PREGUNTAS.md` y `../../../contracts/`: pueden haber cambiado. `P-010` puede agregar la URL de las teselas a lo que la consola le pasa al globo.

## Notas
- **No se reinicia ni se recrea** `spaceapps-official-cloudflared`: cada reinicio cambia la URL de Producción y deja sin API a la consola hasta recompilarla. El deploy del backend reinicia la API, no su túnel (verificado el 2026-11-14 comparando las horas de arranque de los contenedores).
- **Alias del túnel:** el contenedor de Producción es `spaceapps-api-prod`, con el alias de red `spaceapps-api-staging`. El túnel apunta a ese alias, y cambiarle el destino exige reiniciarlo, lo que cambia la URL. El alias se queda hasta el dominio propio.
- **Script de deploy:** las revisiones de salud del script tienen límite de tiempo. Una petición lanzada justo al reconectar la red se quedó colgada 10 minutos en la primera prueba (2026-11-14).
- **Permisos en Woodpecker:** un admin del servidor tiene permiso de admin en cualquier repo **ya activado** (`SetPerm` en `server/router/middleware/session/repo.go`, `v2.8.2`). Por eso Antonio puede cargar ajustes y secretos después de que Carlo active los repos. Activarlos sí exige ser admin en GitHub, porque Woodpecker crea el webhook con la cuenta de quien activa.
- Los secretos (OAuth, token de Woodpecker, llaves SSH) viven solo en `desktop` y en la máquina de quien opera, nunca en este repo.
