# Gestión de Proyectos — plan con casillas (Gen)

> Encargo de Mateo, 2026-11-27 (Bogotá 12:10): materia nueva basada en la Guía del PMBOK
> 6.ª ed. en español. El profesor quiere convertirla en práctica: casos y situaciones
> donde el estudiante decide. Gen hace los **Hacer** (actividades diarias de minutos);
> Jane hace los **Aprender**. Empezar por caps. 1–2 y luego toda la materia.
> No inventar contenido fuera del material. Publicar visible (memoria del proyecto).
>
> SI SE CORTA LA SESIÓN: sigue en la primera casilla sin marcar. No releas el original
> si ya hay ficha.

## Inventario del material (originales FUERA del repo: almacén privado `gestion-proyectos/originales/`)

| # | Archivo | Estado | Qué trae |
|---|---|---|---|
| 1 | Guía del PMBOK 6.ª ed. (ES), texto del PDF, 29.019 líneas | ✓ llegó | Parte 1 Guía (caps. 1–13, pp. 1–540 aprox.) + Parte 2 Estándar + apéndices |
| 2 | Syllabus del curso | ✗ no habrá (Mateo, 27-nov: solo impresos) | Se trabaja solo con la guía |
| 3 | Presentación del profesor | ✗ no habrá (ídem) | — |

Capítulos de la guía (líneas del .txt, para leer por secciones sin abrirlo entero):
1 Introducción 962 · 2 Entorno 2354 · 3 Rol del director 2854 · 4 Integración · 5 Alcance ·
6 Cronograma · 7 Costos · 8 Calidad · 9 Recursos · 10 Comunicaciones · 11 Riesgos ·
12 Adquisiciones · 13 Interesados (`grep -n "^[0-9]*\.[0-9]* "` en el .txt).

## Casillas

### Capítulos 1 y 2
- [x] Ficha cap. 1 → `fichas/c1-introduccion.md`
- [x] Ficha cap. 2 → `fichas/c2-entorno.md`
- [x] Elenco y mundo (Altamira) → `elenco.md`
- [x] Plan y especificación de 18 Hacer → `disenos/c1-c2-hacer.md`
- [x] Puntos de conexión con Jane → `conexion-jane.md`
- [ ] Objetos con Gemini (paso 6) → lista en el diseño, §3
- [ ] Construcción (materia nueva en la app + 18 piezas)
- [ ] Video a 320 y 375 px y verificación de Gen
- [ ] Publicar visible

### Capítulos 3 a 13 (orden de Mateo, 27-nov: todos los capítulos de la guía)
Cada capítulo: `fichas/cNN-*.md` + `disenos/cNN-hacer.md` (la conexión con Jane va en su §6).

| Cap. | Proyecto de Altamira (hilo) | Hacer | Ficha y diseño |
|---|---|---|---|
| 3 Rol del director | Tienda de Medellín, día a día | 7 | [x] |
| 4 Integración | Tienda de Barranquilla | 10 | [x] |
| 5 Alcance | App de pedidos v2 | 12 | [x] |
| 6 Cronograma | Tienda de Cartagena | 12 | [x] |
| 7 Costos | Bodega de Santa Marta | 12 | [x] |
| 8 Calidad | Línea de café en cápsulas | 12 | [x] |
| 9 Recursos | Festival del Café Altamira | 12 | [x] |
| 10 Comunicaciones | Lanzamiento de la marca en la costa | 11 | [x] |
| 11 Riesgos | Ampliación de la tostadora de Manizales | 12 | [x] |
| 12 Adquisiciones | Tostadora industrial importada | 12 | [x] |
| 13 Interesados | Planta de agua de la vereda | 11 | [x] |

Total de la materia: **141 Hacer** (18 de caps. 1–2 + 123 de caps. 3–13).
- [ ] Objetos con Gemini y construcción, capítulo por capítulo
- [ ] Video 320/375 y publicar, por capítulo

## Decisiones y avisos
- 2026-11-27 — La tabla 1-1 (factores ↔ categorías) y la tabla 2-1 llegaron desordenadas
  en el texto. La 2-1 se reconstruyó; las claves de H03 son criterio de Gen. Confirmar
  con el PDF o con el profesor.
- 2026-11-27 — Sin syllabus: el orden es el de la guía, un Hacer por día.
- Avisos de la fuente: la 6.ª ed. **no trae** la fórmula de canales n(n−1)/2 (c10 H07 se ajustó
  a la guía: tipos de canal, sin fórmula) ni el diagrama de Pareto con ese nombre (c08 lo trabaja
  como histograma de causas); la fórmula del TCPI con EAC trae una errata en la guía (c07).
  Gráficos ilegibles: 9-4, 11-5, 11-10, 11-14, 13-6, 8-9 (no se usaron sus claves).
- 2026-11-27 20:19 — Mateo: trabajar solo con la guía; lo que no esté se ajusta a ella, no
  se bloquea. Dudas para el profesor → `preguntas-profesor.md`. **Publicar visible cada lote
  apenas esté construido**, los 13 capítulos.
