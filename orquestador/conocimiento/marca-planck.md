---
id: marca-planck
titulo: Marca Planck — la empresa detrás de AprendeFAE
procedencia: decisión (Mateo y Sebas, noviembre de 2026)
---

# Marca Planck

**Planck** es la empresa; **AprendeFAE** es su producto para la FAE del
Externado. Cada facultad recibe su producto con su nombre (Aprende[X]); todos
son "de planck". La razón social no se muestra en ningún producto.

## Dónde aparece Planck dentro de AprendeFAE

Solo en la **capa de empresa**: el respaldo "AprendeFAE es de planck" al pie de
la entrada, del panel docente y de los correos; el favicon; las propuestas y
el sitio web. Dentro de las actividades no aparece: ahí manda la identidad de
AprendeFAE y las reglas del kit (teal DEBE, ámbar HABER, coral error, foco
#F8F9FA, suelos de 12 / 10,5 px, curva `cubic-bezier(.3,.9,.4,1)`).

## El sistema

La fuente de verdad es el sistema de diseño Planck
(https://claude.ai/artifact/2ZfaKT5GYcCQ29UVFLhfbi): `README.md` es el libro
de marca, `tokens.json` los valores, `migracion.md` la tabla de equivalencias
con la paleta actual. En el repositorio:

| Archivo | Qué es |
|---|---|
| `src/styles/planck.css` | tokens como variables CSS (claro/oscuro) y `@theme` de Tailwind |
| `src/theme.planck.js` | `PLANCK`, `PLANCK_CLARO`, `PLANCK_OSCURO`, `PLANCK_TIPO` para estilos en línea |
| `src/components/RespaldoPlanck.jsx` | el pie "AprendeFAE es de planck" |
| `public/planck/*.svg` | logos e íconos; no se redibujan |

## Reglas que el constructor y el diseñador deben saber

- **Logo**: siempre en minúscula, *planck*, con el cuanto (cuadrado azul) como
  exponente; mínimo 72 px de ancho (16 px de alto en el respaldo); área de
  protección = altura de la x; sin sombra, contorno, rotación ni degradado.
  En texto corrido se escribe *Planck*.
- **Color**: grafito `--ink` #121418 y azul `--accent` #2747F5 (claro) /
  #6F86FF (oscuro). El azul es una acción o la celda de hoy, nunca relleno
  decorativo. Los semánticos del producto se conservan: `--product-debe`,
  `--product-haber`.
- **Tipografía**: Geist (títulos 700 con interletrado −0,035 a −0,045 em,
  texto 400/500, botones 600) y Geist Mono para rótulos y cifras con
  `tabular-nums`. Sora e Inter siguen en las actividades hasta que la
  migración decida lo contrario; **nunca mezcles las dos familias en una
  misma pieza** (una pantalla entera es Geist o entera es Sora/Inter).
- **Forma**: esquinas de la escala `--radius-*` (0 / 4 / 8 / 12 / 22); los
  cuadrados puros (radius-0) son del cuanto y de la cuadrícula de la semana.
- **Movimiento**: misma curva del sitio, 280 ms, solo `transform` y
  `opacity`, nada en bucle, versión reducida siempre.
- **Lo terminado no grita**: una semana completa o una barra al 100 % pasan a
  `--ink`, no a verde ni a confeti.
- **Voz**: frases cortas, verbos en imperativo breve ("Repaso diario",
  "Entrar"); se dice *materia*, *profesor*, *facultad*; no se dice
  *gamificación*, *disruptivo*, *revolucionar*, ni se le habla al estudiante
  con "¡Felicitaciones!" en mayúsculas. La carga es nuestra, no del profesor.

## Contraste

Todos los pares del sistema (texto 4,5:1; bordes, foco e íconos 3:1) están
verificados en los dos temas. Si creas un par nuevo, mídelo; no lo supongas.
