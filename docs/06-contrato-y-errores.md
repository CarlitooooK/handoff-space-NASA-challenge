# 6. Contrato y errores

_Por completar._ Cómo hablan las partes entre sí.

## Formato
- `<JSON, nombres de campos, fechas en ISO 8601 UTC, unidades.>`
- **Versionado:** `<cómo se versiona la interfaz y cómo se avisa un cambio.>`

## Errores
Se decide por el `code`, nunca por el mensaje.

| Código | Cuándo | Qué hace quien consume |
| --- | --- | --- |
| `<E-001>` | `<causa>` | `<acción>` |
