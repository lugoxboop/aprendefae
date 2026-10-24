# T1 · Lote del 24-oct (Futaba): H1 y H2 con la auditoría de Shoko, t1-5 y títulos

Fuente de la auditoría: `revisiones/b-t1-bancos-y-torres-shoko.md`. Todo texto nuevo de 10 palabras o más está medido con `npm run inflesz` y da ≥ 65. Todos tienen 25 palabras o menos, sin emoji y sin abrir con el veredicto. Ningún id cambia.

## 1 · H1 `t1-un-dia-o-un-ano`: cambios de Shoko

| Fila | Hoy | Nuevo | `foto` | Acierto nuevo |
|---|---|---|---|---|
| h1-04 | ¿Cuántos ingresos tuvo la empresa en el año? | ¿Cuánto vendió la empresa entre el 1 de enero y el 31 de diciembre? | — (película) | Hay dos fechas, pero no se compara nada: se suma lo que vendió entre ellas. Eso lo cuenta la película. |
| h1-07 | ¿Cuánto le debía la empresa al banco al comenzar el año? | ¿Cuánto le quedó debiendo la empresa al banco al cerrar el año? | **diciembre** (era enero) | Es lo que debía el día en que cerró el año. Eso lo muestra la foto del 31 de diciembre. |
| h1-09 | ¿La empresa tiene hoy más cosas o menos que al comenzar el año? | ¿La empresa terminó el año con más cosas o con menos de las que tenía al empezarlo? | — (comparar) | Se queda igual |
| Pista de la foto | Busca en la pregunta una fecha. ¿Habla de un solo día? | ¿La pregunta habla de cómo estaba algo un solo día? | | |

- **Los dos mazos de 5 que pide Shoko** (2 de la foto, 2 de la película y 1 de comparar en cada uno):
  - mazo A: h1-01, h1-05, h1-02, h1-04 y h1-06;
  - mazo B: h1-07, h1-10, h1-03, h1-08 y h1-09.
- **Rótulos cortos que pidió Mai:** confirmo los suyos: «La foto del 31 de diciembre» (o «del 1 de enero», según el dato `foto`), «La película: todo el año» y «Comparar las dos fotos».
- **Objetivo:** tomo el de Mai, «Decide qué informe responde cada pregunta: un día, un año o el cambio entre dos días.» (medido, pasa).

## 2 · H2 `t1-quien-pregunta-esto` (Hacer aparte otra vez)

| Fila | Hoy | Nuevo |
|---|---|---|
| h2-06 · pista | Fíjate en «inversiones potenciales». ¿Esa plata ya se puso o todavía no? | ¿Esa plata ya está puesta en la empresa, o todavía se está pensando? |
| Devolución si marcó Administradores | Los jefes usan el informe para planear, controlar y decidir. Esta frase no habla de eso. | Los administradores usan el informe para planear y decidir. Esta frase no habla de eso. |

**Un cambio que no tomo tal cual:** la línea de Shoko («…planear, controlar y decidir. Esta frase no habla de eso.») da 62,6 en el medidor. Quito «controlar» y queda en 66,4. «Controlar» sigue en la pista de h2-02 y en su acierto.

**Los porqués de las parejas que pidió Mai.** Van en lugar de «[el porqué de la pareja, de Futaba]», y salen cuando el estudiante marca la opción que más se parece a la correcta, junto con la devolución de esa opción:

| Pareja (correcta · la que más se parece) | Ítems | El porqué |
|---|---|---|
| Propietarios · Inversionistas | h2-01, h2-06 | Los dos miran cuánto deja la plata puesta. Pero el dueño ya la puso, y el inversionista apenas piensa si ponerla. |
| Administradores · Propietarios | h2-02 | Los dos miran cómo va la empresa. El dueño mira cuánto le rinde lo que puso; el administrador, cómo manejarla. |
| Empleados · Administradores | h2-03 | Los dos están adentro. El empleado lee para saber qué puede pedir; el administrador, para planear y decidir. |
| Acreedores · Clientes | h2-04, h2-05 | Los dos miran si la empresa responde. El acreedor, si le paga lo que le debe; el cliente, si le cumple lo que compra. |
| Asociaciones · El Estado | h2-07, h2-08 | Los dos miran desde afuera. La asociación saca cifras de todo el sector; el Estado cobra impuestos y controla. |

Cada porqué vale en los dos sentidos de la pareja. Todos salen de los propósitos de pp. 11-12 (contabilidadIntro.js:156-192).

## 3 · t1-la-ecuacion-en-movimiento (t1-5)

**Los totales, comprobados con código** sobre los asientos de `TRANSACCIONES_CAP2` (contabilidadTema1.js:272; cal-1 a cal-6 en contabilidad.js:239-268). Son las cifras del caso Caleja del libro, así que van sin «Escenario simulado». Los 8 cuadran (lo que tiene = lo que debe + lo de los dueños).

| Hecho | No se mueve | Totales (tiene · debe · dueños) | Opciones de la decisión 2, por cada parte que se mueve (✓ primero) | Acierto |
|---|---|---|---|---|
| cal-1 | lo que debe | 300.000 · 0 · 300.000 | Tiene: **$300.000** ✓ · $0 (sin cambio). Dueños: igual | Entró plata de los socios. Lo que tiene y lo de los dueños quedan en $300.000, y la empresa todavía no debe nada. |
| cal-2 | dueños | 325.000 · 25.000 · 300.000 | Tiene: **$325.000** · $275.000 · $25.000. Debe: **$25.000** · $0 (sin cambio) | Entró un computador y nació una deuda por lo mismo. Lo que tiene sube a $325.000 y lo que debe, a $25.000. |
| cal-3 | dueños | 375.000 · 75.000 · 300.000 | Tiene: **$375.000** · $275.000 · $50.000. Debe: **$75.000** · $25.000 (sin cambio) · $50.000 | Entró una máquina con plata del banco. Lo que tiene llega a $375.000 y lo que debe, a $75.000. |
| cal-4 | dueños | 365.000 · 65.000 · 300.000 | Tiene: **$365.000** · $385.000 · $10.000. Debe: **$65.000** · $85.000 · $10.000 | Salió plata para pagar parte del computador. Lo que tiene baja a $365.000 y lo que debe, a $65.000. |
| cal-5 | lo que debe | 465.000 · 65.000 · 400.000 | Tiene: **$465.000** · $265.000 · $100.000. Dueños: **$400.000** · $200.000 · $100.000 | Un socio nuevo trajo un local. Lo que tiene sube a $465.000 y lo de los dueños, a $400.000. |
| cal-6 | lo que debe | 415.000 · 65.000 · 350.000 | Tiene: **$415.000** · $515.000 · $50.000. Dueños: **$350.000** · $450.000 · $50.000 | Le devolvieron plata a un socio. Lo que tiene baja a $415.000 y lo de los dueños, a $350.000. |
| cal-7 | dueños | 475.000 · 125.000 · 350.000 | Tiene: **$475.000** · $355.000 · $60.000. Debe: **$125.000** · $5.000 · $60.000 | Entró mercancía y nació una deuda con el proveedor. Lo que tiene sube a $475.000 y lo que debe, a $125.000. |
| cal-8 | dueños | 465.000 · 115.000 · 350.000 | Tiene: **$465.000** · $485.000 · $10.000. Debe: **$115.000** · $135.000 · $10.000 | Salió plata para pagar parte del préstamo. Lo que tiene baja a $465.000 y lo que debe, a $115.000. |

**Regla de las opciones.** Van tres: el total correcto ✓, el total anterior con el monto en sentido contrario y el monto solo. Si dos opciones se repiten, o si una da un total negativo, esa opción se cambia por «el total anterior, sin cambio». En cal-1 (las dos partes) y en cal-2 (lo que debe) la empresa parte de cero. Ahí el monto solo es la correcta y el sentido contrario da negativo, así que solo quedan dos opciones honestas: la correcta y $0. **Decido dejar dos** en esas tres filas, porque una tercera sería un error inventado. Mai ajusta el ancho.

**Pista (1.er error de la decisión 2):** Parte del total que ya tenía esa parte. ¿Le sumas o le restas lo de este hecho?

**Devoluciones (2.º error), según la opción marcada.** No dan la cifra, porque la pastilla ya dice «Iba aquí: …»:

| Marcó | Devolución |
|---|---|
| El sentido contrario | Ese total va para el otro lado. Fíjate si con este hecho esa parte crece o se achica. |
| El monto solo | Ese es solo lo que movió este hecho. El total también guarda lo que ya había antes. |
| **El total anterior, sin cambio** | Esa parte sí se mueve con este hecho, así que su total no puede quedar como antes. |

**El ejemplo nuevo de «Así se juega»** (asiSeJuegaBloque2.js:98-122, `EJEMPLO_T1_5`). El id `demo-horno-200000` es interno; Kaede lo cambia por `demo-aporte-187000` si quiere. No es id de estudiante.

| Campo | Nuevo |
|---|---|
| texto | Escenario simulado. A la panadería le entran $187.000 en plata de sus dueños. |
| asiento | debe Caja 187.000 · haber Aportes sociales 187.000 |
| antes | tiene 500.000 · debe 0 · dueños 500.000 (los de hoy) |
| decisión 1 | No se mueve: lo que debe |
| decisión 2 | Tiene: **$687.000** · $313.000 · $187.000. Dueños: **$687.000** · $313.000 · $187.000 |
| acierto | Entró plata de los dueños. Lo que tiene y lo de los dueños suben a $687.000, y lo que debe no se mueve. |
| alt | Escenario simulado. La panadería tiene $500.000 y no debe nada. Lo de los dueños es $500.000. Ellos ponen $187.000 en plata. |

**Por qué no tomo los $300.000 de Shoko:** $300.000 es la cifra del libro en cal-1, el aporte de Caleja, y una cifra construida no puede coincidir con una del libro. Revisé $187.000, $687.000 y $313.000 contra todo src/data, los registros de cifras construidas y el OCR del libro, y ninguna aparece. «Escenario simulado» va dentro del propio texto. La versión «Escenario simulado. Los dueños de la panadería ponen…» da 54,1 en el medidor; la mía, 66,2.

**:400, el cambio que pidió Shoko a la tabla sin emoji.** contabilidadTema1.js:400 queda así: «Los dos lados dan igual, pero los números no son los de este hecho. Que dé igual no basta. Fíjate cuánto entró o salió.» (medido, pasa).

## 4 · Lo del anexo de Mai

**Títulos de los 7 Hacer**, con mayúscula solo al comienzo. Están en contabilidadTema1.js y repetidos en subjects.js:545-551; hay que cambiar los dos. Ninguna prueba busca el título viejo.

| Línea | Hoy | Nuevo |
|---|---|---|
| T:24 · subjects:545 | ¿Desde Dónde Preguntan? | ¿Desde dónde preguntan? |
| T:116 · subjects:546 | ¿Qué Entró y Qué Salió? | ¿Qué entró y qué salió? |
| T:690 · subjects:547 | ¿Dónde se Rompió? | ¿Dónde se rompió? |
| T:290 · subjects:548 | ¿Qué Le Pasa a Cada Uno? | ¿Qué le pasa a cada uno? |
| T:370 · subjects:549 | La Ecuación en Movimiento | La ecuación en movimiento |
| T:436 · subjects:550 | ¿En Cuál Estado Aparece? | ¿En qué estado aparece? (el de la tabla de Shoko; el id sigue `t1-en-cual-estado-aparece`) |
| T:547 · subjects:551 | La Articulación | La articulación |

**T1-6, los nombres de los informes** (`INFORMES`, T:463-477):

| Campo | Hoy | Nuevo |
|---|---|---|
| primero · idea / cuando | Lo que la empresa tiene y debe hoy · a 31 dic | Estado de situación financiera · al 31 de diciembre |
| segundo · idea / cuando | Lo que vendió y lo que gastó durante el año · 1 ene – 31 dic | Estado de resultados · 1 ene – 31 dic |

**Ojo, Kaede:** `INFORMES` también entra en `INFORMES_T1_7` (T:562), así que cambiar `idea` cambia también los rótulos de t1-7. Si t1-7 debe seguir con las ideas en palabras, que T1-6 pinte `termino` y `cuando` en vez de `idea`, sin tocar el dato. Me parece lo mejor, porque también deja intacta la prosa de cu0-a4 (P:383-385).

**Otros dos textos que Mai dejó para mí:**

| Dónde | Hoy | Nuevo |
|---|---|---|
| t1-2 · pregunta (T:123) | ¿Qué le pasó adentro a lo que entró? | ¿Qué clase de empresa es? (auditoría de base de Shoko) |
| t1-1 · texto alternativo final del anillo | (faltaba) | Ciclo de cinco estaciones con las preguntas de las ocho personas en su zona. La vuelta solo se encendió con los administradores. |
