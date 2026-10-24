# T1 · Lote del 24-oct, segunda parte (Futaba): lo mío de la auditoría `revisiones/b-t1-p2-mai-shoko.md`

Todo texto nuevo de 10 palabras o más está medido con `npm run inflesz` y da ≥ 65. Todos tienen 25 palabras o menos, sin emoji y sin abrir con el veredicto. Ningún id cambia. f1 sigue sin preguntarse hasta el #467.

## 1 · cu0-a2, 2.ª visita (D8)

Tomo la pregunta y la devolución de p2o3 de Shoko; las dos pasan el medidor. Con la regla «suben juntos o bajan juntos», p2o3 ya no la contradice, así que solo queda p2o2 como correcta.

| Id | Texto |
|---|---|
| Pregunta | ¿Qué frase dice lo contrario de la regla «suben juntos o bajan juntos»? |
| p2o2 ✓ | Es la que más confunde. Los cuatro casos la desmienten: los dos lados suben juntos o bajan juntos. *(la de antes)* |
| p2o1 | Esa frase es cierta: es la razón por la que dan igual. Aquí se busca la que los casos desmienten. *(la de antes)* |
| p2o3 | Esa también es falsa, pero no contradice la regla. Habla de cuánto debe la empresa, y lo de los dueños también cuenta. *(Shoko)* |
| p2o4 | Esa también es falsa, pero los casos no tratan de ajustes. Muestran cómo se mueven los dos lados. *(la de antes)* |

## 2 · t1-desde-donde-preguntan: otra segunda decisión

`SEGUNDA_T1_1` sí se deduce de la primera: `correctaSegundaT1_1` es `zona === dentro ? "todo" : "informe"` (src/contabilidad/tema1.js:643). La propuesta la reemplaza; el objeto y su id de campo los ajusta Kaede. Se basa en los propósitos de pp. 11-12 (contabilidadIntro.js:156-192).

**La nueva decisión cruza adentro y afuera.** Las respuestas A, C y D salen tanto de adentro como de afuera (A está en las dos zonas), y B solo de adentro. Saber la zona no da la respuesta. Tampoco repite a H2: H2 parte del propósito y pide quién es; esta parte de quién es y pide qué se juega.

**Pregunta:** Ya sabes desde dónde pregunta. ¿Qué tiene en juego esta persona cuando lee el informe? (medida, pasa)

| Opción (id · texto) | Correcta para | Acierto (el porqué) | Devolución si la marca sin ser la correcta |
|---|---|---|---|
| `plata` · La plata que ya puso o prestó | propietarios (adentro), acreedores (afuera) | Puso su capital o le prestó a la empresa, y mira si eso le rinde o si le van a pagar. | Esa persona no ha puesto plata ni ha prestado nada. Lo que lee no es para cuidar algo que ya puso. |
| `trabajo` · Su trabajo dentro de la empresa | administradores, empleados (adentro) | Trabaja en la empresa: lee para manejarla o para saber qué puede pedir. | Esa persona no trabaja en la empresa. Lee el informe por otra razón. |
| `piensa` · Una compra o inversión que piensa | clientes, inversionistas (afuera) | Todavía no ha puesto nada: piensa si le compra o si mete plata ahí. | Esa persona no está pensando si comprar o meter plata. Lee el informe por otra razón. |
| `oficio` · Su oficio: cifras o impuestos | asociaciones, el Estado (afuera) | Lo lee por su oficio: saca cifras de todo el sector o cobra los impuestos. | Esa persona sí se juega algo propio con esta empresa. No la mira solo para sumar cifras o cobrar. |

**Pista (1.er error), según la correcta:**
- plata y piensa: ¿Esta persona ya puso algo en la empresa, o todavía no?
- trabajo: ¿Lo que lee le importa por su plata, por su trabajo, por algo que piensa hacer o por su oficio?
- oficio: ¿Lee para cuidar algo suyo, o porque se lo pide su oficio?

**Lo que hay que mirar:**
- Que el acreedor sea «plata» sale de su propósito: «responder por sus obligaciones» (I:171) y de «Le presté o le vendí a crédito» (I:172).
- Que el cliente sea «una compra que piensa» sale de «comparar precios y buscar fuentes alternativas» (I:176).
- La agrupación en cuatro es mía y se puede deshacer: Shoko decide si le basta la fidelidad.
- Para el Repaso, la llave nueva sería el id de la opción: plata, trabajo, piensa u oficio.

## 3 · t1-que-le-pasa-a-cada-uno, decisión 2: «¿Cuál de los cuatro casos es este hecho?»

Las opciones son los cuatro nombres de la p. 35 (P:115-120). La correcta sale de la llave que ya existe (`deuda-sube` → a, `aporte-sube` → b, `deuda-baja` → c y `aporte-baja` → d; T:326-342). Los 8 hechos caen así:
- caso a: cal-2, cal-3 y cal-7;
- caso b: cal-1 y cal-5;
- caso c: cal-4 y cal-8;
- caso d: cal-6.

**Pista (1.er error):** ¿Lo que tiene subió o bajó? ¿Y del otro lado se movió una deuda o lo de los dueños?

**Devolución (2.º error), según el caso que marcó.** Dice qué es ese caso y manda a mirar el hecho, sin decir cuál era:

| Marcó | Devolución |
|---|---|
| Aumento en activo y en pasivo | Ese caso es entrar algo y nacer una deuda. Mira si en este hecho hay una deuda, y si algo entró o salió. |
| Aumento en activo y en patrimonio | Ese caso es entrar algo que ponen los dueños. Mira si en este hecho hay un aporte, y si algo entró o salió. |
| Disminución en activo y en pasivo | Ese caso es salir plata para pagar una deuda. Mira si en este hecho se paga algo, y si algo entró o salió. |
| Disminución en activo y en patrimonio | Ese caso es salir algo hacia los dueños. Mira si en este hecho les devuelven algo, y si algo entró o salió. |

## 4 · t1-en-cual-estado-aparece: el estado de resultados en «Ingresos» y «Gastos»

**Datos** (`CONCEPTOS`, T:481-497). Solo cambian las tres fichas del segundo informe. Su `seccion` pasa de `null` a una de dos constantes nuevas, `INGRESOS = "ingresos"` y `GASTOS = "gastos"`:

| Ficha | Nombre | `seccion` nueva | Por qué, en el banco |
|---|---|---|---|
| c6-02 | Ingresos operacionales | `ingresos` | :511 «es lo que vendió durante el año» |
| c6-06 | Gastos de administración y ventas | `gastos` | :515 «es lo que la empresa gastó durante el año» |
| c6-09 | Ingresos no operacionales | `ingresos` | :518 «lo que obtuvo en el año» |

La base en el libro está en P:202: «cómo se han causado los ingresos y cómo se han gastado».

Quedan cinco destinos: Activo · Pasivo · Patrimonio · Ingresos · Gastos. La llave del Repaso pasa de `segundo` a `segundo:ingresos` y `segundo:gastos`, con los subtemas «Estado de resultados — ingresos» y «Estado de resultados — gastos».

**Textos:**

| Dónde | Hoy | Nuevo |
|---|---|---|
| Acierto c6-02 (T:511) | Va en el segundo informe. No es algo que la empresa tenga: es lo que vendió durante el año. | Va en el estado de resultados, en ingresos. No es algo que la empresa tenga: es lo que vendió durante el año. |
| Acierto c6-06 (T:515) | Va en el segundo informe. Es lo que la empresa gastó durante el año. | Va en el estado de resultados, en gastos. Es lo que la empresa gastó durante el año. |
| Acierto c6-09 (T:518) | Va en el segundo informe. Es lo que obtuvo en el año por algo que no es su negocio de siempre. | Va en el estado de resultados, en ingresos. Es lo que obtuvo en el año por algo que no es su negocio de siempre. |
| Error nuevo C2 (informe bien, ingresos ↔ gastos) | — | El informe es el correcto. Ahora pregúntate: ¿eso entró a la empresa en el año, o es algo que gastó? |

La C de hoy (T:506) sigue igual para las secciones del primer informe.

## 5 · H1: rótulos fijos y D2

- **Rótulos, fijos para todas las preguntas:** «Una foto» · «La película: todo el año» · «Comparar las dos fotos». Sale el dato `foto` del rótulo; se queda solo para la escena del acierto.
- **D2** (ya escrita: «Te preguntan cuánto cambió algo que tiene o debe. La película no lo muestra: compara la foto del comienzo con la del final.») sale cuando la correcta es «comparar» y se marcó «película». La D se queda para cuando se marcó «foto».
- **Lo mismo pasa en cu0-a3, ya publicado.** `evaluarP3` (src/contabilidad/aprenderTema1.js:89) le da la D a quien marca película cuando la respuesta es comparar. Kaede: la línea `else if (correcta === COMPARAR) patron = "D"` se parte en dos, con D2 para `marcada === PELICULA`.

## 6 · H2, segunda vuelta (D8): los propósitos como casos nuevos

Cada caso dice lo mismo que el propósito del libro (pp. 11-12), pero como una situación. No nombra al usuario ni repite su `pregunta` de cu0-a1. Las 4 opciones, el acierto y la pista son los de la ficha de la vuelta 1, y la devolución por opción también, cambiando «Esta frase» por «Este caso». El porqué de la pareja sale igual.

| Id | Correcta | Caso (vuelta 2) |
|---|---|---|
| h2v-01 | Propietarios | Hace cinco años puso plata en la empresa. Quiere ver si lo que puso le está dejando lo que esperaba. |
| h2v-02 | Administradores | Tiene que decidir si la empresa abre otra sede. Antes quiere ver en qué va bien y en qué va mal. |
| h2v-03 | Empleados | Va a pedir un aumento para él y sus compañeros. Primero quiere saber cómo le está yendo a la empresa. |
| h2v-04 | Acreedores | Le prestó plata a la empresa y el plazo vence pronto. Quiere ver si la empresa tiene con qué responder. |
| h2v-05 | Clientes | Le compra a la empresa todos los meses. Quiere saber si lo podrá seguir atendiendo y si otra le vende más barato. |
| h2v-06 | Inversionistas | Tiene unos ahorros y piensa comprar una parte de la empresa. Quiere saber si es seguro y si le dejaría ganancia. |
| h2v-07 | Asociaciones | Cada año junta los números de las empresas de su gremio para mostrar cómo le va a todo el sector. |
| h2v-08 | El Estado | Revisa si la empresa pagó lo que le tocaba de impuestos y si sus cuentas están en orden. |

**Devoluciones de la vuelta 2** (medidas de nuevo con «Este caso»):

| Marcó | Devolución |
|---|---|
| Propietarios | Los dueños ya pusieron su capital y miran cuánto les rinde. Este caso habla de otra cosa. |
| Administradores | Los administradores usan el informe para planear y decidir. Este caso no habla de eso. |
| Empleados | Los empleados miran la empresa para sus peticiones laborales. Este caso no habla de eso. |
| Acreedores | Los acreedores miran si la empresa les puede pagar lo que les debe. Este caso pide otra cosa. |
| Clientes | Los clientes miran si la empresa les cumple y comparan precios. Este caso pide otra cosa. |
| Inversionistas | Los inversionistas todavía no han puesto plata: miran si les conviene. Este caso habla de otra cosa. |
| Asociaciones | Las asociaciones juntan datos de muchas empresas para sacar cifras del grupo. Este caso mira a una sola. |
| El Estado | El Estado lee el informe para cobrar impuestos y hacer controles. Este caso no habla de impuestos. |

**Una cosa que no puedo arreglar del todo:** en h2v-01 y h2v-06 la diferencia entre «puso» y «piensa comprar» es justo la que hay que leer. No es una pista regalada, es la pareja que se confunde. Si Shoko la ve muy fácil, la propuesta es quitar «Hace cinco años» de h2v-01.
