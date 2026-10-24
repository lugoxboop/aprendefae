---
id: celulas
titulo: Mapa de células — AprendeFAE
procedencia: decidido
---

# Mapa de células

> Decidido el 13 de octubre de 2026 por Mateo. Reparto de temas acordado con
> Levi sobre el inventario de fuentes verificado por Gen.

## CONTABILIDAD YA TIENE ESTUDIANTES: solo se agrega, nunca se borra

**Orden de Mateo del 23 de octubre de 2026, vía Miku. Va antes que cualquier
otra regla de este documento.**

Contabilidad dejó de ser terreno libre. Desde hoy vale para ella **la misma
regla que para Macroeconomía**: solo se agrega. Nunca se borra lo existente
—una actividad, una pieza, un tema, una fila del servidor, un id— ni los datos
que un estudiante ya dejó en él: progreso, intentos, FP ganado.

En la práctica:

- **Cambiar no es borrar y volver a escribir.** Una pieza publicada que se
  rehace entra como pieza nueva o detrás de una bandera; la vieja se conserva
  hasta que Mateo diga otra cosa.
- **Ocultar sí, borrar no.** Lo que no se ve este semestre se esconde con una
  bandera que se deshace en una línea (ver `TEMAS_OCULTOS` en
  `src/data/subjects.js`), y su código, sus datos y su FP se quedan.
- **Las migraciones de Contabilidad solo agregan.** Ningún `DELETE`, ningún
  `DROP` y ningún `UPDATE` que cambie FP, intentos o progreso ya registrados.
- **Un id publicado no se renombra.** Renombrarlo es borrar el viejo para el
  servidor y dejar huérfano lo que el estudiante hizo con él.
- **Borrar o dañar algo de esto es lo irreversible**: no lo decide un general.
  Se escala a Miku, que se lo lleva a Mateo.

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

## Las cinco células y su reparto

| Célula | General | Contenido | Diseño | Auditoría | Construcción | Alcance |
|---|---|---|---|---|---|---|
| **A** Attack on Titan | Erwin | Gen | Xeno | Levi | Sai | Coordinación, íconos y el índice del banco de ejercicios |
| **B** Bunny Girl Senpai | Sakuta | Futaba | Mai | Shoko | Kaede | **T6 Cuentas por cobrar** · §5.4 · pp. 199-206 |
| **C** Death Note | L | Near | Watari | Mello | Misa | T7 Inventarios (**terminado**) y **T5 Activos financieros** · §5.3 · pp. 191-198 |
| **D** Baki Hanma | Yujiro | Katsumi | Hanayama | Shibukawa | Baki | **T4 Efectivo, caja menor y bancos** · §5.1 y §5.2 · pp. 179-190 |
| **E** Hajime no Ippo | Kamogawa | Miyata | Itagaki | Takamura | Ippo | **Repaso del capítulo 5**: el banco de ejercicios · pp. 262-274 |

**El Tema 5 pasa de la Célula B a la Célula C el 15 de octubre de 2026, y la
razón es aritmética, no de desempeño.** Esa noche la Célula C cerró T7 entero
—T7-1 con 14 piezas, T7-2 con 11 y T7-3 con 15, cuarenta en total— y se quedó
sin territorio. Al mismo tiempo T5 era el tema más flaco de la materia: 4
piezas y 60 FP, contra las 11 a 15 de los temas maduros. Dejar a una célula
sin trabajo mientras el tema más flaco avanza despacio es un error de
coordinación, y se corrige moviendo el territorio, no pidiéndole a nadie que
corra más.

El corte cae donde el libro ya lo tenía: §5.3 (pp. 191-198) a C, §5.4
(pp. 199-206) a B. Las cuatro piezas que ya existen en T5 son de la Célula B,
se llaman `b5-t5-*`, se quedan publicadas y nadie las renombra; C construye lo
nuevo con prefijo `t5-`. B conserva T6 entero y el #40.

**Desde el 15 de octubre de 2026 cada general fusiona el trabajo de su
célula.** El coordinador dejó de ser la puerta por la que pasa todo: se queda
con lo compartido, los choques entre células, los datos de estudiantes, las
migraciones y destrabar generales. Si un general fusiona algo que rompe `main`
o que pisa a otra célula, el coordinador se lo devuelve para que lo arregle
él. Ver «Cada general fusiona lo suyo» en nocturno.md.

**Ukyo es el probador general y no pertenece a ninguna célula.** Es común a las
cinco: a él se le lleva una pieza cuando hay que saber si un estudiante la
entiende sin que nadie se la explique al lado.

**Por qué T4 salió de la Célula A el 14 de octubre de 2026.** A llevaba T4
asignada desde el montaje y no se construyó un solo día, porque el general de A
es también el coordinador y la coordinación siempre gana. Un alcance que vive
en la célula del coordinador es un alcance que no existe. T4 pasa a la Célula D,
y A se queda con lo que sí es suyo e indelegable: coordinar, reservar los íconos
y mantener el índice del banco de ejercicios.

**Por qué el banco de ejercicios tiene dueño ahora.** Las pp. 262-274 llevaban
escrito «de nadie» y eso funcionó mientras hubo tres células. Con cinco, «de
nadie» es una invitación a que dos lo tomen. La Célula E lo construye como la
capa de repaso del capítulo entero, y es la única célula que **consume** los
temas de las demás sin editarlos: sus actividades viven en su propio tema
transversal, y jamás toca un archivo de otra célula. Si necesita que un tema
ajeno cambie, lo reporta al coordinador y sigue con lo suyo.

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

## El prompt maestro de los diseñadores vive en el canon

`orquestador/conocimiento/prompts/disenadores-de-celula-v1.md`
`orquestador/conocimiento/prompts/pedagogicos-v1.md` (agentes de contenido)
`orquestador/conocimiento/prompts/auditores-v1.md` (auditores de calidad)
`orquestador/conocimiento/prompts/construccion-v1.md` (agentes de construcción; entra el 23 de octubre)

Lo escribieron Senku, Xeno y Ukyo, y Miku lo repartió el 15 de octubre a los
cinco diseñadores: Mai (B), Watari (C), Hanayama (D), Itagaki (E) y Xeno (A).
Trae el kit completo y vigente, el estándar de Aprender en cuatro capas, el
modelo único de Hacer, la barra de enganche y el reparto del top 10 de Ukyo por
célula.

**Está aquí, y no solo en los chats, por tres razones.** Un prompt pegado en un
chat se va hacia arriba y se pierde; un archivo se relee, se cita por línea y se
versiona. Cinco copias en cinco chats divergen en cuanto alguien corrige una; una
en el canon se corrige una vez. Y la sexta célula, o el diseñador que entre
mañana, lo encuentra sin que nadie se lo pase.

Está **sin tocar una coma**, y el «sin tocar» lleva su comprobación, porque la
primera versión de esta nota decía un número que no verificaba.

El archivo que llegó traía finales de línea de Windows (CRLF) y git los normaliza
a LF al guardarlo, así que el archivo del repositorio **no es byte por byte** el
que llegó: son 25.145 bytes en vez de 25.276, y su SHA-256 empieza por
`f7ceda14`, no por `556cebca`. Lo que sí es idéntico es el TEXTO: quitándole los
retornos de carro al original, `cmp` no encuentra una sola diferencia. Esa es la
comprobación, y es la que vale:

```bash
git show HEAD:orquestador/conocimiento/prompts/disenadores-de-celula-v1.md > /tmp/a
tr -d '\r' < <el archivo que llegó> > /tmp/b
cmp /tmp/a /tmp/b    # sin salida = idénticos
```

**La lección, que no es sobre este archivo:** un hash es una promesa
comprobable, y por eso hay que comprobarlo DESPUÉS de guardar, no antes. Yo
escribí el del archivo de entrada y lo di por bueno; git ya había avisado en una
línea que iba a cambiar los finales de línea, y esa línea pasó de largo.

Si se corrige el prompt, entra una `-v2` y esta se queda: un diseñador que
trabajó con la v1 tiene que poder leer lo que leyó.

## `git add -A` después de cambiar de rama mete en tu PR el trabajo de otro

Me pasó el 15 de octubre y lo cuento porque con cinco células en un repositorio
es de los errores que más fácil se repiten.

Arreglé una cosa de la Célula E en `FondoMateria.jsx` —un `overflow: hidden` que
rompía todos los `position: sticky` de la página—, la construí, la medí, y antes
de confirmarla me fui a atender un bloqueo de la Célula D. El cambio se quedó en
el árbol de trabajo. Cambié de rama, hice `git add -A` del otro asunto, y ese
archivo **viajó dentro de un PR cuyo mensaje no lo menciona**.

El cambio era bueno y estaba medido, así que nada se rompió. Lo que se perdió es
el registro: quien mañana busque por qué cambió ese archivo no lo encuentra en el
commit que lo trajo. Y si hubiera estado mal, habría entrado bajo un título que
hablaba de otra cosa.

**La regla: `git status` antes de confirmar, siempre, y `git add` por archivos
cuando el árbol tiene más de un asunto.** Cambiar de rama NO deja atrás lo que no
está confirmado: se lo lleva puesto.

Y si ya se colaron: **se declara en el PR**, con lo que es y con su medida. No se
revierte para reponerlo igual —eso añade dos commits y ningún dato—, pero
tampoco se calla.

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

**Dónde está cada quien.** Los chats viven en la cuenta de trabajo. **Quedan
escritos todos**, porque la noche del 15 de octubre esta tabla no existía y
costó una hora: mi navegador amaneció con una sola pestaña, la del editor SQL,
y sin los enlaces no había forma de hablar con ningún general.

| Quién | Papel | Chat |
|---|---|---|
| **Erwin** | coordinador | `https://claude.ai/chat/cd6485c4-8575-43fd-b359-4778899bda4a` |
| **Sakuta** | general, Célula B | `https://claude.ai/chat/c8bbd8ed-9d58-4e11-abad-cdb40e9f2544` |
| **L** | general, Célula C | `https://claude.ai/chat/91b2355d-d780-4b41-a18c-46b4b678a3a5` |
| **Yujiro** | general, Célula D | `https://claude.ai/chat/1b446339-13ab-43c3-9115-04fe08a52fe2` |
| **Kamogawa** | general, Célula E | `https://claude.ai/chat/e5697857-7523-47a8-8288-6c5df421034c` |
| **Xeno** | diseño | `https://claude.ai/chat/d88c6a04-b9ba-414f-b2f3-df63c0abc0c3` |
| **Levi** | calidad, Célula A y auditor central | `https://claude.ai/chat/e14fb739-cad6-4f22-b3e8-8844f7b38d0c` (desde el 24-oct; el chat anterior, `edb72638…`, quedó retirado) |
| **Gen** | contenido, Célula A | `https://claude.ai/chat/2e83efc3-0a60-477a-8625-7a0eb36e871e` |
| **Sai** | construcción, Célula A | `https://claude.ai/code/session_01HTfZSXunqjEHrG95ZZSLoB` (Sai 4.0 es la vigente; la sesión «Sai 2.0» es vieja, no se le escribe) |
| **Mello** | auditor jefe | sin enlace: se busca en `https://claude.ai/recents` |
| Kaede · Miku · Tsukasa · Feynman · Macro · Senku 4.0 | otros | se buscan en `https://claude.ai/recents` |

**Si falta alguno, está en `https://claude.ai/recents`**, no en la lista de
chats fijados. Un coordinador llegó a concluir que el auditor jefe no existía
después de consultar un listado que se lo devolvió incompleto. **Un listado
que no lo trae no prueba que no esté:** se abre el enlace y se mira. El coste
de equivocarse aquí no es un rodeo, es que una célula entera se quede
esperando una auditoría que nadie iba a empezar.

**Y una pestaña cerrada no prueba nada tampoco.** Esa misma noche los cuatro
generales parecían caídos y los cuatro estaban trabajando: lo que lo demostró
fue el repositorio —`git for-each-ref --sort=-committerdate`— y luego la lista
de recientes, donde Yujiro aparecía activo hacía 15 minutos. **Las pestañas
son mi vista, no su existencia.**

**Dos canales, y conviene saber cuál sirve para qué.** El chat llega al
general de inmediato; un comentario en su PR queda escrito y sobrevive a que
se cierre un navegador, pero solo lo ve cuando vuelve a mirar ese PR. Para
destrabar algo urgente: el chat. Para dejar constancia de una decisión: el PR.
Para las dos cosas, las dos.

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
