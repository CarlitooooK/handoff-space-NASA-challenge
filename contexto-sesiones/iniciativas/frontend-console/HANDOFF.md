# Consola Frontend — Handoff

**Última actualización:** 2026-11-14 · **Responsable:** Equipo Frontend (consola) · **Repo / componente:** `luna-landing-navigator-console`

## En una línea
Fase 1 lista: la consola corre completa contra el mock (selector de sitio, evaluación, veredicto, KPIs, terreno 3D, Sol/Tierra y scrubber); falta profundizar cada carril y probarla contra el backend en vivo.

## Estado actual
| Pieza | Estado |
| --- | --- |
| Scaffold (React/TS/Vite, Tailwind, R3F, Zustand, Vitest) | Hecho |
| Tipos desde `contracts/openapi.json` + cliente API con errores por `code` | Hecho |
| Shell 30/70, sidebar básico, veredicto y KPIs | Hecho (básico) |
| Visor 3D: malla de terreno + luces Sol/Tierra | Hecho (básico; sin ver renderizado en navegador) |
| Timeline scrubber (0 red) | Hecho (sin pistas Gantt) |
| Perfil de horizonte 2D, capa PSR, modos de cámara, toggles | No iniciado |
| Comparador (`POST /compare`) | No iniciado |
| Prueba contra backend en vivo | No iniciado |
| Optimización "solo fecha → solo `/evaluate`" | No iniciado |
| Video demo y AI Tool Disclosure | No iniciado |

## Pendientes (en orden de valor)
1. Verificar visualmente la escena 3D (escala de luces, cámara, exageración vertical) y ajustar.
2. Probar contra el backend en vivo y resolver `P-001` (formato de error) y `P-003` (rango de latitud).
3. Perfil de horizonte 2D y capa PSR (`GET /psr/nearby`).
4. Comparador de 2 a 5 escenarios con los errores `ERR_SCENARIO_LIMIT_EXCEEDED` y `ERR_DUPLICATE_SCENARIOS`.
5. Pistas Gantt, modos de cámara y toggles de capas.
6. Asignar carriles entre las dos personas (ver Notas).

## Cómo retomar
1. Lee `_compartido/frontend-console.md` y `CONOCIMIENTO.md`.
2. Clona `luna-landing-navigator-console` y sigue `CLAUDE.md`: `npm run sync:handoff` antes de implementar.
3. Antes de seguir, revisa `../../../PREGUNTAS.md` y `../../../contracts/`: pueden haber cambiado.

## Notas
- Carriles propuestos en `docs/ideas/frontend-architecture-guide.md`; **la asignación entre personas está sin definir** (se anota en el `CLAUDE.md` de la consola).
- Preguntas abiertas de esta iniciativa: `P-001` a `P-005`.
