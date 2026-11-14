# Contexto de sesiones

Carpeta matriz donde cada sesión de trabajo (persona o agente) deja lo que aprendió y en qué estado quedó, para que la siguiente sesión arranque sin reconstruir el contexto.

**Vive dentro de este repo a propósito:** es el canal por el que las partes comparten qué se hizo, qué se decidió y cómo retomar. Se versiona y se revisa como todo lo demás, y por eso mismo **no lleva secretos, tokens ni datos personales** (ver Convenciones).

## Cómo usarla

**Al empezar una sesión**
1. Lee este README y busca la iniciativa en el índice.
2. Abre su `HANDOFF.md`: estado actual, pendientes y cómo retomar.
3. Si necesitas el porqué de algo, ve a `CONOCIMIENTO.md` (reglas y decisiones) o a `HISTORIAL.md` (qué pasó y cuándo).
4. Para conocer un componente completo (cómo funciona, dónde vive, qué muerde), lee su archivo en `_compartido/`.
5. Revisa `../PREGUNTAS.md` y `../contracts/`: pueden haber cambiado desde la última sesión.

**Al terminar una sesión**
- Actualiza el `HANDOFF.md` de la iniciativa: estado, pendientes y la fecha de la última actualización.
- Agrega a `HISTORIAL.md` lo que se hizo, con fecha absoluta (`2026-11-08`, no "ayer").
- Si aprendiste algo que sirve fuera de la iniciativa, va en `_compartido/`.
- Si la iniciativa es nueva, copia `_plantillas/iniciativa/` a `iniciativas/<ticket>-<nombre>/` y agrégala al índice.

## Estructura

```
contexto-sesiones/
├── README.md                ← este índice
├── _compartido/             ← conocimiento transversal, un archivo por componente
├── _plantillas/             ← puntos de partida para copiar (no se editan aquí)
│   ├── compartido.md
│   └── iniciativa/
│       ├── HANDOFF.md
│       ├── CONOCIMIENTO.md
│       └── HISTORIAL.md
└── iniciativas/
    └── <ticket>-<nombre>/
        ├── HANDOFF.md       ← estado actual y cómo retomar (léelo primero)
        ├── CONOCIMIENTO.md  ← reglas, modelo, decisiones y su porqué
        └── HISTORIAL.md     ← cronología: commits, PRs, tickets y decisiones
```

## Qué va en cada archivo (para no duplicar)

| Archivo | Responde a | Cómo se actualiza |
| --- | --- | --- |
| `HANDOFF.md` | ¿En qué estado quedó y cómo retomo? | Cada sesión: se **reescribe** para que siempre diga lo de hoy |
| `CONOCIMIENTO.md` | ¿Por qué es así? Reglas, modelo y decisiones | Cuando se aprende o se decide algo; se corrige, no se acumula |
| `HISTORIAL.md` | ¿Qué pasó y cuándo? | Cada sesión: se **agrega** arriba; no se borra |
| `_compartido/<componente>.md` | ¿Cómo funciona este componente en general? | Cuando cambia algo que no depende de una iniciativa |

## Relación con el resto del repo

- [`../PREGUNTAS.md`](../PREGUNTAS.md): preguntas entre las partes, con respuesta. Si una sesión genera una duda, va ahí y se cita por id (`P-007`).
- [`../docs/`](../docs/): las reglas estables del proyecto y el acuerdo entre las partes.
- Este directorio: lo que se **aprendió** y el **estado** del trabajo. No repite `docs/`; lo cita.

## Convenciones

- Fechas siempre absolutas.
- Cita archivos con ruta relativa al repo (`docs/05-flujos.md`) y commits con su hash corto.
- **Separa lo verificado de lo supuesto:** si algo no se comprobó, dilo.
- **Nada de secretos, tokens, llaves de API ni datos personales.** Para un caso de prueba basta con un identificador o el nombre del dataset. Los valores sensibles van en variables de entorno, nunca aquí.
- `HANDOFF.md` corto y al día: quien llega debe entender el estado en un minuto. El detalle va a los otros dos archivos.

## Índice de iniciativas

| Iniciativa | Repo / componente | Estado | Última actualización |
| --- | --- | --- | --- |
| _Sin iniciativas todavía_ | | | |
