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
- [ ] Recibir syllabus y guía V6 de Mateo → ajustar nombre exacto de la materia, módulos y subtemas (marcar `confirmado: true`)

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
