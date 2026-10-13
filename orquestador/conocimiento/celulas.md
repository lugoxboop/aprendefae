---
id: celulas
titulo: Mapa de células — AprendeFAE
procedencia: decidido
---

# Mapa de células

> Decidido el 13 de octubre de 2026 por Mateo. Reparto de temas acordado con
> Levi sobre el inventario de fuentes verificado por Gen.

## El alcance de Contabilidad es FINITO

El curso del profesor cubre **los capítulos 1 a 5 y nada más**. No hay capítulos
6 a 9. Contabilidad termina cuando terminen estos temas; no hay más fuente ni se
va a conseguir.

| Capítulo | Páginas | Estado |
|---|---|---|
| 1 Introducción a la contabilidad | 1-31 | publicado (Tema 1) |
| 2 La ecuación y los estados financieros | 32-81 | publicado (Tema 1) |
| 3 Las cuentas y los libros | 82-116 | publicado (Tema 2) |
| 4 Ingresos y gastos | 117-176 | publicado (Tema 3) |
| 5 Activos corrientes | 177-274 | **lo que queda** |

## Las tres células y su reparto

| Célula | General | Contenido | Diseño | Auditoría | Construcción | Alcance |
|---|---|---|---|---|---|---|
| **A** Attack on Titan | Erwin | Gen | Xeno | Levi | Sai | Cerrar T3, luego **T4** · §5.1-§5.2 · pp. 179-190 |
| **B** Bunny Girl Senpai | Sakuta | Futaba | Mai | Shoko | Kaede | **§5.3 y §5.4** · pp. 191-206 |
| **C** Death Note | L | Near | Watari | Mello | Misa | **T7 Inventarios** · §5.5-§5.6 · pp. 207-261 |

**Por qué §5.3 y §5.4 van juntas:** §5.3 son cinco páginas. Una célula sola con
cinco páginas se queda sin fuente el primer día, y ahí es donde empieza a
rellenar. Si en la plataforma son uno o dos temas lo decide Levi al leer la
ficha: se funden si comparten un caso o una cuenta del libro; si no comparten
nada, §5.3 queda como tema corto a propósito. Juntar a la fuerza dos temas que no
se tocan es la otra forma de rellenar.

**Por qué T7 no se parte entre dos células:** la segunda mitad de inventarios
depende de la primera. Partirla entre células deja a una esperando a la otra. El
corte en temas lo decide Levi sobre el mapa de la fuente, no sobre el conteo de
páginas: se corta donde cierra un concepto con su ejemplo resuelto, ninguna mitad
pasa de 41 páginas (lo que midió T3, el tema más largo hasta hoy), y ningún
ejemplo queda partido entre dos temas.

**El banco de ejercicios de las pp. 262-274 es común al capítulo.** No se reparte
a ojo: Gen hace un índice de qué secciones necesita cada ejercicio para
resolverse, y Levi asigna cada uno a **un solo tema**, el de la última sección
que necesita. Ninguna célula usa un ejercicio que no tenga asignado.

## Reglas de convivencia entre células

Medidas sobre el repositorio el 13 de octubre de 2026, no supuestas.

**Lo que NO choca, comprobado:** las actividades de Contabilidad no registran
iconos ni previsualizaciones — esos registros, que son los que tienen la prueba
de unicidad y los conteos globales, no se tocan. Los tutoriales ya van en
archivos por tema (`asiSeJuegaTemaN.js`). Los tres temas viven en bloques
separados de `subjects.js`.

**Lo que sí hay que repartir por adelantado**, para que nadie elija lo que otro
ya tomó:

| Recurso | Cómo se reparte |
|---|---|
| Número de migración | Rango reservado por célula, asignado por el coordinador |
| Prefijo de ids de actividad | Uno por célula |
| Iconos y glifos | Reserva previa: se pide antes de elegir. La prueba detecta componentes repetidos, **no significados repetidos** |
| Componentes compartidos (`CaminoHacer` y similares) | Un solo dueño. Ninguna célula los toca sin pasar por el coordinador |

**El vocabulario es de un solo dueño.** Tres células en paralelo sobre la misma
materia divergen en términos si nadie manda. El vocabulario vive en
`orquestador/conocimiento/vocabulario/` y se consulta ahí, no se inventa.

**Las migraciones tocan solo filas de su propio tema y son reversibles.** La base
es compartida con Macroeconomía, que tiene estudiantes reales.

## Lo que el coordinador debe a las células

Que ninguna espere por él. Es el único punto por donde pasa todo y por tanto el
cuello de botella y el punto único de falla del montaje. Si una célula se queda
esperando un registro, el reparto falló.
