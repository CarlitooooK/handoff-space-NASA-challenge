# Diseño de la consola en Figma — Lunar Landing Site Navigator

> [!NOTE]
> **Idea general / propuesta de referencia (no vinculante):**
> Exploración visual de la consola. **No** forma parte del acuerdo del handoff (`docs/01`–`docs/10`) ni del contrato.
> Si el equipo adopta el layout, se registra como decisión en `docs/09-decisiones.md` y este archivo pasa a ser solo la referencia visual.

**Archivo:** [Lunar Landing Site Navigator — HUD Modes](https://www.figma.com/design/zNJuYlWnOqwNEr8OchPX50) · **Fecha:** 2026-11-14 · **Autor:** Diego Jiménez

## La idea en una línea

El render 3D ocupa siempre toda la pantalla y es el fondo de la consola. Navegación, Setup, Results y timeline flotan encima como paneles de vidrio oscuro semitransparente, con volumen y retroiluminación. Con `F` se pasa a pantalla completa: los paneles se vuelven tarjetas flotantes y el fondo no cambia.

Es una alternativa al "Split-Screen 30/70" de [`lunar-landing-ui-ux-tdd.md`](lunar-landing-ui-ux-tdd.md), que hoy usa la consola.

## Pantallas

Página **Console** (vistas para implementar):

| Frame | Nodo | Qué resuelve |
| --- | --- | --- |
| C1 · Simulate · Simple | [`25:611`](https://www.figma.com/design/zNJuYlWnOqwNEr8OchPX50?node-id=25-611) | Vista por defecto: veredicto en lenguaje llano, cuentas regresivas y timeline de dos pistas |
| C2 · Simulate · Detailed | [`29:762`](https://www.figma.com/design/zNJuYlWnOqwNEr8OchPX50?node-id=29-762) | Misma estructura con detalle técnico: coordenadas, paso, reglas, tabla Sol vs. Tierra, capas, cámara, flags de eventos |
| C3 · Compare | [`33:762`](https://www.figma.com/design/zNJuYlWnOqwNEr8OchPX50?node-id=33-762) | De 2 a 5 escenarios: lista con recomendación, matriz con deltas y timelines apilados |
| C4 · History | [`35:914`](https://www.figma.com/design/zNJuYlWnOqwNEr8OchPX50?node-id=35-914) | Historial de simulaciones del usuario: abrir, duplicar, comparar, borrar |
| C5 · Recreate missions | [`37:1070`](https://www.figma.com/design/zNJuYlWnOqwNEr8OchPX50?node-id=37-1070) | Misiones reales (IM-1, Chandrayaan-3, Apollo…) con replay desde el touchdown |
| C6 · States | [`40:1218`](https://www.figma.com/design/zNJuYlWnOqwNEr8OchPX50?node-id=40-1218) | Input inválido, cálculo en curso, backend caído, historial vacío, evento `null` |
| C7 · Full screen | [`41:1370`](https://www.figma.com/design/zNJuYlWnOqwNEr8OchPX50?node-id=41-1370) | Modo pantalla completa (`F`) |

Página **HUD modes**: exploración previa a pantalla completa (Explore, Mission, Compare, Cinematic). **Cinematic** queda como modo de presentación para el video.

## Decisiones de diseño (propuestas)

- **Simple / Detailed** es un nivel de detalle en el top bar, no una pantalla aparte: la estructura no cambia, solo qué tan técnico es el contenido.
- **El rail izquierdo** separa las áreas de trabajo: Simulate, Compare, History y Missions.
- **Interfaz en inglés** (criterio 08, Communication; ver `docs/04-reglas-del-reto.md`).
- **Tokens:** colecciones de variables `Lunar / Primitives` y `Lunar / Semantic` con `codeSyntax` para CSS (`var(--signal-sun)`, etc.). Effect styles: `Glass/Panel`, `Glass/Raised`, `Glass/Inset`, `Button/Primary`, `Glow/*`.
- **Tipografía:** Atkinson Hyperlegible Next para la interfaz y Atkinson Hyperlegible Mono para telemetría y timestamps.

## Pendiente de acordar

| Tema | Por qué importa | Con quién |
| --- | --- | --- |
| Render de fondo vs. shell 30/70 | Cambia el cascarón del carril 1 en la consola | Frontend |
| Cómo encaja el globo de D-011 (CesiumJS por iframe) con un fondo siempre visible | El diseño asume la escena local de terreno (Three.js) como fondo | Frontend + `lunar-globe-renderer` |
| Persistencia de History | El contrato no tiene endpoints para guardar corridas. La propuesta es guardarlas en el dispositivo | Frontend; backend solo si se quiere en servidor |
| Datos de Recreate missions | Las fechas son públicas, pero las condiciones al alunizar del diseño son ilustrativas: deben salir de `POST /evaluate` | Frontend |
| Textos de `site.reasons` | El backend los manda en español y la interfaz está en inglés | Backend (pregunta pendiente) |

## Datos en el diseño

Todos los valores son **de muestra** (ejemplos del contrato e inventados para Compare y Missions) y la interfaz lo marca con "Sample data". No reflejan el backend en vivo: por ejemplo, el backend da Shackleton Rim el Dec 1 como `NO-GO`. El render del Figma es una ilustración vectorial que sustituye al canvas WebGL.
