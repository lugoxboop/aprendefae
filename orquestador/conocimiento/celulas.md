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
| **Prefijo de nombre de rama** | **Uno por célula.** Faltaba en el primer reparto y se añadió el mismo día: tres células construyendo sobre el mismo repositorio chocan ahí tarde o temprano |
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

## Dos cosas que el montaje enseñó el primer día

**El chat de un agente no es el agente.** Un mismo nombre puede existir en dos
conversaciones distintas, cada una con su historia y su producto. El día que
se montaron las células, dos generales quedaron duplicados: la versión
capacitada vivía en un chat nuevo y la versión que el fundador tenía a la vista
era otra. Dos conversaciones que creen mandar sobre la misma célula le dan
órdenes distintas al mismo agente, y el agente obedece la última.

La regla: **una célula, un general, una conversación.** Cuando haya que mover el
rol, la conversación que se retira recibe un mensaje que lo dice, y no se borra
hasta que la nueva esté andando, porque ahí vive el trabajo a medias.

**Un agente no puede usar el navegador si su conversación no tiene un
computador asociado.** No es un problema de permiso: sin computador no hay a
quién pedirle autorización, así que no llega ninguna solicitud y repetir la
orden no cambia nada. Se ve en la cabecera del chat, al lado del nombre: hay un
icono de pantalla, o no lo hay. La conversación se crea desde la aplicación de
escritorio con el computador seleccionado; desde el navegador no se puede
añadir después.

**Lo mismo vale para los repositorios de una sesión de código.** No se pueden
quitar una vez abierta: el menú deja abrir el repositorio y copiar el nombre de
la rama, pero no retirarlo. Si una sesión nace con un repositorio que no es
suyo, la única defensa es la orden, y el general de esa célula la sostiene.

## Cuándo dos secciones del libro son un solo tema

**Se funden si un saldo o una transacción que nace en una se usa en la otra.
Compartir el nombre de una cuenta o de una empresa no cuenta.**

La regla anterior decía «comparten un caso o una cuenta del libro», y así
escrita daba el resultado contrario al que su autor quería. La corrigió él
mismo cuando una agente de contenido señaló la diferencia: §5.3 y §5.4 usan las
dos la cuenta Caja, pero las dos la toman de §5.1; y dos casos distintos se
llaman igual, Santa Pacha, sin compartir una sola transacción. Eso es compartir
un **símbolo**, no compartir **contenido**.

Su imagen: dos recetas que usan sal no son un solo plato. Serían un solo plato
si la salsa de la primera fuera ingrediente de la segunda.

**La lección que vale más que la regla:** una regla puede estar mal escrita y
aun así parecer que funciona, porque quien la aplica al pie de la letra llega a
una conclusión defendible. El error solo aparece cuando alguien compara el
texto de la regla con el ejemplo que su autor dio al escribirla.

## Qué puede leer cada quien

No es simétrico, y descubrirlo por las malas cuesta un turno:

- **Los generales de célula pueden abrir los chats de sus agentes** y leer otras
  conversaciones. Por eso el relevo dentro de una célula es del general.
- **El auditor jefe no puede abrir otras conversaciones NI EL REPOSITORIO.**
  Lo segundo lo dijo él mismo el 13 de octubre, y es la mitad que faltaba: ya
  sabíamos que no servía mandarle un enlace, pero durante un tiempo se le
  mandaron comandos de `git`, que tampoco le sirven. Lo que vaya para él se le
  transcribe entero dentro del mensaje, aunque el documento sea largo, ya esté
  escrito en otro sitio y exista un comando de dos líneas que lo saca. Si no
  cabe en un mensaje, va partido en varios y numerados.
- **Las sesiones de código leen el repositorio**, así que el canon es la vía
  barata de pasarles algo: se escribe una vez y lo leen las tres células.

Antes de mandar a alguien a leer algo «en la fuente», se comprueba que esa
persona pueda llegar a la fuente. No basta con que exista un camino: tiene que
existir **para esa persona**. Una célula abrió un PR explicando con todo detalle
cómo leer su paquete sin fusionarlo, citando esta misma página, y el destinatario
no podía ejecutar ni el primer comando. Nadie se equivocó de regla; se equivocaron
de destinatario.

**Un documento largo viaja por el repositorio, no por el chat.** Es la regla que
sale de ahí, y vale más que la asimetría que la causó. El primer mapa grande de
una célula —58.000 caracteres— no cabía en un mensaje y su destinatario no podía
abrir el enlace. Transcribirlo habría convertido al coordinador en el cuello de
botella, y copiar a mano un documento auditado le añade una capa de error a algo
que ya estaba verificado.

Así que: la célula lo sube a una rama suya, en `orquestador/conocimiento/mapas/`,
abre el PR y no lo fusiona. Quien tenga que leerlo lo lee con un comando. Queda
además donde lo encontrará la célula que llegue después, en vez de en un
documento que hay que saber que existe.

El chat sirve para decidir, no para almacenar.

**La excepción, y es una sola:** cuando el destinatario es el auditor jefe, manda
su limitación y no esta regla. El PR se abre igual —para versionar el documento y
para que la sesión de código construya desde ahí—, pero deja de ser el camino
hacia él. A él se le pega el texto.

## Un tema corto no es un tema fallido

T5 quedó con cinco páginas de libro y se construye así, corto a propósito. La
alternativa —fundirlo con el siguiente para que midan parecido— es la otra
forma de rellenar, y rellenar es lo que esta estructura existe para evitar.
