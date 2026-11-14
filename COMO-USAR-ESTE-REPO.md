# Cómo usar este repo: handoff vs. contexto de sesiones

> **Léelo antes de escribir.** Si eres una IA, esta guía manda sobre cualquier resumen que veas en `AGENTS.md` o en los README. Existe para que nadie escriba lo mismo dos veces ni se pise con otro.

## La idea en un minuto

Este repo tiene **dos capas** con trabajos distintos:

| | **Handoff** (`docs/`, `contracts/`, `mock/`, `PREGUNTAS.md`) | **Contexto de sesiones** (`contexto-sesiones/`) |
| --- | --- | --- |
| **Es** | El **acuerdo** entre las partes | La **memoria** del trabajo |
| **Responde** | ¿Qué es verdad y qué debe cumplir cada parte? | ¿En qué estado quedó el trabajo y qué aprendimos? |
| **Tono** | Normativo: "es", "debe" | Descriptivo: "se hizo", "quedó", "se supone" |
| **Cambia** | Poco, y solo por una decisión | En cada sesión |
| **Lo lee** | La otra parte, para construir sin preguntar | Quien retoma el trabajo (tú mañana, otra IA) |
| **Admite supuestos** | **No.** Solo lo acordado o verificado | **Sí**, marcados como "sin verificar" |
| **Quién lo edita** | El dueño de ese tema | Quien trabaja la sesión (el responsable de la iniciativa) |

**Regla de oro: un dato vive en un solo lugar y los demás lo citan.** Citar es poner la ruta o el id (`docs/07-ambientes-y-pruebas.md`, `P-003`, un hash de commit). Copiar el texto es duplicar, y lo duplicado se desactualiza en un lado y no en el otro.

## ¿Dónde lo escribo? Cinco preguntas, en orden

1. **¿Ya está escrito en algún lado?** Entonces no lo escribas: cítalo. Busca antes (`grep -r "<término>" .`).
2. **¿Es algo que la otra parte necesita para construir, o que ambas deben cumplir?** (alcance, reglas, formato, errores, URL de un ambiente) → **handoff** (`docs/` o `contracts/`).
3. **¿Es una duda que solo la otra parte puede contestar?** → **`PREGUNTAS.md`**.
4. **¿Es el estado de un trabajo, un hallazgo, un porqué interno, un supuesto o una cronología?** → **`contexto-sesiones/`**.
5. **¿Ninguna de las anteriores?** Probablemente no hace falta escribirlo: el código y los commits ya lo dicen.

## Qué va dónde

| Qué | Dónde | Quién | Cuándo | Cómo se cambia |
| --- | --- | --- | --- | --- |
| Alcance, arquitectura, reglas del reto, flujos, formato y errores | `docs/01…10` | El dueño de la decisión | Al decidir algo que afecta a otra parte | Se edita el doc **en el mismo commit** y se anota en `docs/09-decisiones.md` |
| Interfaces: API, datasets, esquemas | `contracts/` | El dueño del origen | Cuando cambia el origen | Se **copia** del origen y se actualiza su versión en `docs/09`. No se edita a mano |
| URLs, nombres de variables de entorno, datos de prueba, cómo correr | `docs/07-ambientes-y-pruebas.md` | Quien opera el ambiente | Cuando cambian | **Solo ahí.** Los demás escriben "ver `docs/07`" |
| Servidor simulado | `mock/` | Quien mantiene el contrato | Cuando cambia el contrato | Se alinea con `contracts/` |
| Duda entre partes | `PREGUNTAS.md` | Pregunta quien duda; responde el dueño | Cuando falta un dato | Plantilla del archivo. Al responder pasa a *Respondidas* y, si cambia un acuerdo, se actualiza el doc en el mismo commit |
| Estado de un trabajo: qué está hecho, qué falta, qué bloquea | `contexto-sesiones/iniciativas/<x>/HANDOFF.md` | El responsable de la iniciativa | Al cerrar cada sesión | Se **reescribe** para que diga lo de hoy |
| Qué se hizo y cuándo | `…/HISTORIAL.md` | Quien trabajó | Al cerrar cada sesión | Se **agrega arriba**. No se borra |
| Por qué se decidió algo (interno), hallazgos, supuestos | `…/CONOCIMIENTO.md` | Quien aprendió | Cuando se aprende o decide | Se **corrige**, no se acumula |
| Cómo funciona un componente en general | `contexto-sesiones/_compartido/<componente>.md` | Quien lo conoce | Cuando cambia algo estable | Cita `docs/` y `contracts/`; no los copia |

## Instancias: qué lees y qué escribes en cada momento

| Momento | Lees | Escribes |
| --- | --- | --- |
| **1. Al empezar** | `git pull --rebase` → `CLAUDE.md` / `AGENTS.md` → `contexto-sesiones/README.md` → el `HANDOFF.md` de tu iniciativa → los `docs/` y `contracts/` que vayas a tocar → `PREGUNTAS.md` abiertas | Nada |
| **2. Mientras trabajas** | Lo que necesites del handoff | Código. Ve notando: ¿hay una decisión que afecta a la otra parte? ¿una duda? ¿un hallazgo? |
| **3. Surge una duda para la otra parte** | — | `PREGUNTAS.md`, y marca el código con `// P-xxx` |
| **4. Se decide algo que afecta a ambas partes** | — | El doc de `docs/` que corresponda, más una línea en `docs/09-decisiones.md`, **en el mismo commit**. En el contexto, solo una línea con la referencia |
| **5. Llega una respuesta o cambia un contrato** | `PREGUNTAS.md`, `contracts/` | `docs/` o `contracts/` si cambia el acuerdo. En el `HISTORIAL.md` de la iniciativa afectada, **una línea** con el id o el commit, sin copiar el contenido |
| **6. Algo supuesto se verifica y se acuerda** | — | **Promoción:** pasa a `docs/` y en `CONOCIMIENTO.md` queda una línea con la referencia |
| **7. Al terminar** | — | `HANDOFF.md` (reescribir), `HISTORIAL.md` (agregar arriba) y, si aprendiste algo general, `_compartido/` |

## Reglas anti-duplicación

1. **Una sola fuente por dato.** Si lo ves en dos sitios, deja uno y cambia el otro por una referencia.
2. **Busca antes de escribir.** Antes de crear una iniciativa o un compartido, revisa el índice de `contexto-sesiones/README.md`: si el tema ya existe, **actualiza** esa.
3. **El contexto no repite el handoff.** Si es un acuerdo, va a `docs/`; en el contexto solo se cita.
4. **Los datos frágiles se escriben una sola vez:** URLs de túneles, versiones, conteos, fechas de verificación. En el resto, "ver `<ruta>`".
5. **No crees archivos sueltos** (`notas.md`, `resumen.md`, `contexto-extra.md`). Usa los existentes y las plantillas de `contexto-sesiones/_plantillas/`.
6. **Una iniciativa es un trabajo con inicio, fin y estado que se retoma entre sesiones.** Un cambio puntual a `docs/` no necesita iniciativa: lo registran la decisión en `docs/09` y el commit.
7. **No escribas** lo que ya dicen el código o los commits, ni conversaciones, ni resúmenes de lo ya escrito.
8. **Si el contexto choca con el handoff, manda el handoff.** Corrige el contexto y deja una línea en `HISTORIAL.md`.

## Reglas para no pisarse entre IAs

- `git pull --rebase` **antes de empezar y antes de escribir.** Commits chicos y seguidos.
- **Cada iniciativa tiene un responsable** (campo en su `HANDOFF.md`). Solo el responsable lo reescribe. Si otra persona o IA trabaja lo mismo, agrega a `HISTORIAL.md` y le avisa; no reescribe el estado.
- **No edites `docs/` ni `contracts/` de una parte que no es tuya:** pregunta en `PREGUNTAS.md`. Lo edita quien es dueño del tema.
- `HISTORIAL.md` se agrega arriba, así que un conflicto es trivial: resuélvelo **conservando ambas entradas**.
- **Nunca** secretos, tokens, llaves de API ni datos personales, en ninguna de las dos capas.

## Fuente única de cada dato en este proyecto

Esta asignación es la recomendada al crear el módulo. Si el equipo decide otra, **cámbiala aquí y en ningún otro lado.**

| Dato | Fuente única | Los demás archivos |
| --- | --- | --- |
| Rutas, parámetros y esquemas de la API | `contracts/openapi.json` (para máquinas) y `contracts/lunar-landing-api-contract.md` (para leer) | Citan el contrato; no vuelven a describir cada endpoint |
| URL activa del backend (túnel, Tailscale) y variables de entorno | `docs/07-ambientes-y-pruebas.md` | Dicen "ver `docs/07`" |
| Ejemplos de código del cliente (`apiFetch`, tipos TS, Three.js) | `FRONTEND_API_GUIDE.md` | No se copian a otros archivos |
| Cómo funciona el backend (motor, datos, qué expone) | `contexto-sesiones/_compartido/backend-api.md` | Citan `contracts/` para el detalle de rutas |
| Estado general de las piezas del proyecto | Tabla "Estado" de `README.md` | El `HANDOFF.md` de una iniciativa dice solo el estado de **su** trabajo |
| Pendientes del proyecto (acuerdos entre partes) | `docs/08-pendientes.md` | Los pendientes de una iniciativa viven en su `HANDOFF.md` |
| Decisiones acordadas | `docs/09-decisiones.md` | `CONOCIMIENTO.md` guarda el porqué interno, con la referencia |

## Ejemplos (hipotéticos)

1. **"El túnel cambió de URL."** Se cambia solo en `docs/07-ambientes-y-pruebas.md`. En el `HISTORIAL.md` de la iniciativa: "URL actualizada en `docs/07` (`abc1234`)", sin repetir la URL.
2. **"Terminé el visor 2D."** `HANDOFF.md` de la iniciativa (estado y pendientes) y `HISTORIAL.md` (qué hiciste). Nada en `docs/`.
3. **"La guía explica algo del contrato distinto al contrato."** Es un acuerdo: se corrige donde está la fuente única, o se pregunta en `PREGUNTAS.md` si es de la otra parte. No se anota una versión paralela en el contexto.
4. **"Quiero renombrar un campo de la API."** No se edita `contracts/`: se pregunta en `PREGUNTAS.md` y, cuando se acuerda, el dueño lo cambia.
5. **"Creo que el modelo devuelve las elevaciones en otro orden, pero no lo comprobé."** Va a `CONOCIMIENTO.md` como **supuesto sin verificar**. Cuando se compruebe y se acuerde, se promueve a `docs/`.
