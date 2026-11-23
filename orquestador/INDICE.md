# Índice del canon — AprendeFAE

Mapa corto de TODO el material del repositorio: dónde está cada cosa, qué
contiene y cuándo leerla. **No es un resumen**: es la primera parada para no
abrir archivos a ciegas.

**Orden de lectura (regla k del protocolo): primero este índice → luego el
buscador (`node scripts/canon.mjs "<término>"`) → y solo al final abrir el
archivo, y solo si vas a editarlo.** Quien cree, mueva o renombre un documento
**actualiza su línea aquí en el mismo cambio**.

Última actualización: 2026-11-22 (Miku).

---

## Núcleo que se carga solo
| Archivo | Qué contiene | Cuándo leerlo |
|---|---|---|
| `CLAUDE.md` (raíz) | Índice para agentes: quién eres, qué cargar, células, reglas que no se negocian, dónde está cada cosa | Se carga solo en toda sesión; no hay que abrirlo aparte |
| `README.md` (raíz) | Presentación del repositorio | Primera vez en el repo |

## Protocolos y reglas
| Archivo | Qué contiene | Cuándo leerlo |
|---|---|---|
| `orquestador/conocimiento/protocolo-de-eficiencia.md` | Reglas a–p de ahorro de tokens, interfaz, herramientas y evidencia visual (buscar antes de abrir, una pasada, estado en el repo, índice y bitácora, ingeniería de contexto, guía web moderna, herramientas oficiales, y nada de «listo» en lo visual sin video a 320/375) | Antes de empezar a trabajar; es la vara de cómo se gasta |
| `orquestador/conocimiento/decisiones.md` | Decisiones ya cerradas, para no reabrirlas | Antes de proponer algo que suene a ya decidido |
| `orquestador/conocimiento/nocturno.md` | Trabajo nocturno y «mapa de choques»: quién toca qué archivo, rangos y ramas | Antes de tocar un archivo compartido |
| `orquestador/conocimiento/cola-de-tareas.md` | La cola de tareas de Mateo (Issues con `cola-mateo`, prioridad y estado) y el turno automático cada 5 h: cómo se anota una orden, cómo la toma el turno, qué es irreversible | Al anotar una orden de Mateo o al correr el turno |

## Calidad y enganche
| Archivo | Qué contiene | Cuándo leerlo |
|---|---|---|
| `orquestador/conocimiento/kit-de-calidad.md` | Kit de Estándar de Calidad, texto literal (D1–D9) | El auditor, al dar nivel |
| `orquestador/conocimiento/kit.md` · `kit.md` (raíz) | Kit resumido | Consulta rápida de una dimensión |
| `orquestador/conocimiento/enganche.md` | La barra de enganche (E1–E12): qué hace que una pieza enganche | Diseño y pedagógico, al crear una pieza |
| `orquestador/conocimiento/calidad/` | Notas de calidad puntuales (b5, c7) | Solo si se nombran |

## Marca y diseño
| Archivo | Qué contiene | Cuándo leerlo |
|---|---|---|
| `orquestador/conocimiento/marca-planck.md` | Kit de marca Planck (color, tipografía, logo) | Diseño, landing, UI |
| `orquestador/conocimiento/guia-estilo-imagenes.md` | Flujo + guía de estilo fija para las imágenes que Gen y los generales (Miku, Erwin, Magno) piden a Gemini (paleta, trazo, fondo; mascotas por partes; descripción bloqueada por personaje) | Antes de pedirle una imagen a Gemini |

## Contenido de Contabilidad (la materia)
| Archivo | Qué contiene | Cuándo leerlo |
|---|---|---|
| `orquestador/conocimiento/fuente.md` | La fuente de Contabilidad (el libro): de dónde sale el contenido | Pedagógico, al escribir una actividad |
| `orquestador/conocimiento/vocabulario/contabilidad.md` | Los términos de contabilidad | Al redactar o corregir términos |
| `orquestador/conocimiento/mapas/` | Mapas por tema (t3 ingresos-gastos, t4 efectivo, t5 activos financieros, t7 inventarios, e5 banco) | Al planear un tema |
| `orquestador/conocimiento/registro-cifras-construidas-*.md` | Cifras ya medidas (PM instrumentos, T7): no recalcular | Antes de volver a calcular una cifra |

## Material pesado (buscar, casi nunca abrir entero)
| Carpeta | Qué contiene | Cuándo leerlo |
|---|---|---|
| `orquestador/conocimiento/paquetes/` (214) | Paquetes de material por actividad | Solo el que te toca, vía buscador con `--todo` |
| `orquestador/conocimiento/fichas/` (20) | Fichas de actividades ya exprimidas | La de tu pieza |
| `orquestador/conocimiento/revisiones/` | Revisiones con capturas (decoración, panel docente, t3, t4, volumen, sidebar-cuenta, tienda-rpg) | Solo la revisión nombrada |

## Prompts maestros y roles
| Carpeta | Qué contiene | Cuándo leerlo |
|---|---|---|
| `orquestador/conocimiento/prompts/` (7) | Prompts maestros v1 (construcción, auditores, pedagógicos, diseñadores, panel docente, aprender-secuencia, logitos) | Fuente de las skills; normalmente la skill se carga sola |
| `orquestador/conocimiento/roles/` (5) | Definiciones de rol (células, compilación, gen, levi, xeno) | Al capacitar o revisar un rol |
| `.claude/skills/gen-disenador-actividades/` | Skill de **Gen**, el diseñador de actividades: convierte un tema en Aprender y Hacer lúdicos y muy visuales. La cargan Miku, Erwin y Magno bajo demanda cuando llega trabajo de contenido | Al diseñar o rediseñar contenido/actividades |
| `orquestador/conocimiento/herramientas.md` | Las herramientas y sondas de la casa (qué mide cada una) | Antes de medir |
| `orquestador/conocimiento/herramientas-de-sesion.md` | Cómo instalar Graphify (mapa del código) y los complementos (Agent Skills, Ponytail) en una sesión de código | Un agente de código, una vez; y para consultar el mapa del código |

## El orquestador (código)
| Archivo | Qué contiene | Cuándo leerlo |
|---|---|---|
| `orquestador/README.md` | Qué automatiza el orquestador (Gen → Levi → Xeno → compilación) | Al tocar ese flujo |
| `orquestador/src/` (14) | Código del orquestador (clave, conocimiento, herramientas, intérprete, registro, roles) | Al editarlo |

## Estado y memoria de los agentes
| Carpeta | Qué contiene | Cuándo leerlo |
|---|---|---|
| `orquestador/estado/<general>.md` | Estado por general: una línea por encargo (terminado / en curso / bloqueado). Hora real de Bogotá | Miku, para saber si un general se detuvo |
| `orquestador/traspasos/<agente>.md` | Traspaso al cambiar de chat | Al retomar en un chat nuevo |
| `orquestador/memoria/<agente>.md` | **Bitácora** (regla l): quién soy, en qué estoy, decisiones, pendientes y lo aprendido que no hay que repetir | **El agente, al empezar cualquier chat, antes de hacer nada** |

---

### Cómo mantener este índice
- Un documento nuevo, movido o renombrado: actualiza su línea **en el mismo
  commit**. Si un archivo quedó sin uso o duplicado, no lo borres: márcalo
  `(obsoleto)` aquí.
- Es un índice, no un resumen: una línea por archivo o por carpeta. Si crece de
  ~150 líneas, agrupa carpetas en vez de listar archivo por archivo.
