# Gestión de Proyectos (PMBOK V6) — plan con casillas

> Encargo de Mateo, 2026-11-27 12:12 (Bogotá), a Magno: registrar la materia nueva y
> montar su esqueleto para que el contenido de Jane (Aprender/simuladores) y Gen
> (actividades Hacer) tenga dónde vivir. Solo se agrega. Nada visible a estudiantes
> sin el visto bueno de Mateo. No se inventa currículo: el detalle fino sale del
> syllabus y de la guía V6 que pasa Mateo (pedidos el 27-nov; aún no están).
>
> SI SE CORTA LA SESIÓN: sigue en la primera casilla sin marcar.

## Dónde vive (el contrato común de Magno, Jane y Gen)

| Qué | Dónde | Quién |
|---|---|---|
| Esqueleto: módulos, procesos (= subtemas) y documentos | `src/gestion-proyectos/estructura.js` | Magno (se ajusta con el syllabus) |
| Espacios: las piezas de cada módulo + interruptor de publicación | `src/gestion-proyectos/catalogo.js` (`PIEZAS`, `PUBLICADAS`) | Gen y Jane las anotan |
| Componentes de cada pieza | `src/gestion-proyectos/<módulo>/` | quien construye |
| Fichas, mapa y diseños | `orquestador/conocimiento/gestion-proyectos/{fichas,disenos}/`, `mapa.md` | Gen (Hacer), Jane (Aprender) |
| Vista previa (solo por dirección) | `#/gestion-proyectos` | — |
| Reglas que se vigilan solas | `src/gestion-proyectos/__tests__/estructura.test.mjs` | — |

**Módulos = temas del índice:** `gp-fundamentos` (caps. 1-2) · `gp-inicio` · `gp-planificacion` ·
`gp-ejecucion` · `gp-monitoreo-control` · `gp-cierre`.
**Procesos = subtemas:** `gp-<sección>` (p. ej. `gp-4-1` acta de constitución, `gp-13-1`
identificar interesados). Fundamentos: `gp-c1-*`, `gp-c2-*`. Cada pieza etiqueta los
subtemas que enseña: es lo que ve el panel docente y lo que cuenta la cobertura.
**Ids de pieza:** prefijo `gp26-` (p. ej. `gp26-ini-a1-acta`), nunca uno ya usado en el sitio.

Cómo evitar huecos y estructuras dobles: Gen y Jane NO crean su propia lista de temas;
planean sobre estos seis módulos y estos subtemas. Si el syllabus pide otro corte
(unir, partir u ordenar distinto), se cambia `estructura.js` una vez y todos lo heredan.
La vista previa marca en ámbar los procesos «sin pieza».

## Casillas

### Etapa 0 — Estructura (Magno)
- [x] Esqueleto general de la guía V6 (49 procesos, documentos), vista previa oculta, pruebas
- [x] Guía V6 (texto en español, la pasó Mateo el 27-nov, fuera del repo) → nombres de procesos, salidas y secciones de los caps. 1-2 cotejados uno a uno
- [ ] Syllabus (Mateo aún no lo tiene) → nombre exacto de la materia y recorte; entonces `confirmado: true`

### Etapa 1 — Fichas (Gen, con Jane)
- [ ] Ficha por capítulo/unidad del syllabus → `fichas/`
- [ ] Mapa: qué se repite entre módulos (p. ej. «solicitudes de cambio» sale en varios procesos) → `mapa.md`

### Etapa 2 — Por módulo: diseño (Gen Hacer, Jane Aprender), construcción, video, visto bueno
- [ ] Fundamentos · [ ] Inicio · [ ] Planificación · [ ] Ejecución · [ ] Monitoreo y control · [ ] Cierre

### Etapa 3 — Publicar (solo con el visto bueno de Mateo)
1. Anotar los ids aprobados en `PUBLICADAS` (catalogo.js).
2. Agregar a `SUBJECTS` en `src/data/subjects.js` la entrada que da `materiaParaRegistro()` (pedirlo a Erwin: subjects.js es compartido).
3. Índice de la materia (como `MacroTopicIndex.jsx`), su ruta en App, icono y tarjeta en la portada.
4. Cada Hacer con su fila en `supabase/migrations` (catálogo de actividades), solo agregando.

---

## Plan de Gen: las Hacer por capítulo

> Encargo de Mateo, 2026-11-27 (Bogotá 12:10): materia nueva basada en la Guía del PMBOK
> 6.ª ed. en español. El profesor quiere convertirla en práctica: casos y situaciones
> donde el estudiante decide. Gen hace los **Hacer** (actividades diarias de minutos);
> Jane hace los **Aprender**. Empezar por caps. 1–2 y luego toda la materia.
> No inventar contenido fuera del material. Publicar visible (memoria del proyecto).
>
> SI SE CORTA LA SESIÓN: sigue en la primera casilla sin marcar. No releas el original
> si ya hay ficha.

### Inventario del material (originales FUERA del repo: almacén privado `gestion-proyectos/originales/`)

| # | Archivo | Estado | Qué trae |
|---|---|---|---|
| 1 | Guía del PMBOK 6.ª ed. (ES), texto del PDF, 29.019 líneas | ✓ llegó | Parte 1 Guía (caps. 1–13, pp. 1–540 aprox.) + Parte 2 Estándar + apéndices |
| 2 | Syllabus del curso | ✗ no habrá (Mateo, 27-nov: solo impresos) | Se trabaja solo con la guía |
| 3 | Presentación del profesor | ✗ no habrá (ídem) | — |

Capítulos de la guía (líneas del .txt, para leer por secciones sin abrirlo entero):
1 Introducción 962 · 2 Entorno 2354 · 3 Rol del director 2854 · 4 Integración · 5 Alcance ·
6 Cronograma · 7 Costos · 8 Calidad · 9 Recursos · 10 Comunicaciones · 11 Riesgos ·
12 Adquisiciones · 13 Interesados (`grep -n "^[0-9]*\.[0-9]* "` en el .txt).

### Casillas

#### Capítulos 1 y 2
- [x] Ficha cap. 1 → `fichas/c1-introduccion.md`
- [x] Ficha cap. 2 → `fichas/c2-entorno.md`
- [x] Elenco y mundo (Altamira) → `elenco.md`
- [x] Plan y especificación de 18 Hacer → `disenos/c1-c2-hacer.md`
- [x] Puntos de conexión con Jane → `conexion-jane.md`
- [x] Objetos con Gemini (paso 6) → `public/gestion-proyectos/ilustrados/` (33)
- [x] Construcción: 18 piezas en `src/gestion-proyectos/fundamentos/`, módulo `gp-fundamentos`, ids `gp26-fun-hNN-*`, migración 0276
- [x] Video a 320 y 375 px (`videos/lote1/` en el almacén); falta la verificación de Gen
- [ ] Publicar visible

#### Capítulos 3 a 13 (orden de Mateo, 27-nov: todos los capítulos de la guía)
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

### Decisiones y avisos
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
- 2026-11-27 — Lote 1 construido sobre el contrato de Magno: las 18 Hacer van en el módulo
  `gp-fundamentos` con ids `gp26-fun-hNN-<slug>` (los `gp-hNN-*` de `disenos/c1-c2-hacer.md` son
  los nombres de diseño) y subtemas de `estructura.js`. Mapeo: proyecto, fin, cambio-valor,
  contexto → `gp-c1-proyectos`; importancia → `gp-c1-importancia`; ppp → `gp-c1-portafolios`;
  ciclo → `gp-c1-ciclo-vida`; procesos, datos → `gp-c1-procesos-areas`; adaptación →
  `gp-c1-adaptacion`; documentos, éxito → `gp-c1-negocio`; ética → `gp-c1-proposito`; EEF →
  `gp-c2-factores`; OPA → `gp-c2-activos`; sistemas, gestión → `gp-c2-gobernanza`; estructuras,
  PMO → `gp-c2-estructuras`.
