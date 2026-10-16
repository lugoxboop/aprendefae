**T4 · H1 «¿Entra o sale de Caja?» · versión 2: el rediseño de enganche (un solo negocio).**
- **Este archivo es la versión vigente de H1.** Sustituye los hechos, las devoluciones, el cierre y «Así se juega» de `d4-t4-h1-v1.md` y de la parte de H1 de `d4-t4-asi-se-juega-v1.md`. La v1 queda como historia.
- **Objetivo (D2, 16 oct 2026):** se ve antes de empezar, en el Encabezado compartido (su prop `objetivo`), sobre la consigna: «Decidir qué mueve Caja.» Texto corto de Katsumi: con el largo, las palabras antes de la figura pasaban de 40 (B1).
- **D9 (16 oct 2026; Hanayama):** los hechos ya respondidos se apilan detrás de la tarjeta como un fajo: hasta 7 cantos de 1 px #B8C4D4, 2 px más arriba cada uno, que crece con cada «Siguiente hecho». Su alto se reserva desde el primer hecho.
- Por qué: H1 publicado fallaba la barra de enganche B1-B5 (`orquestador/conocimiento/enganche.md`): la interacción a 357 px con 73 palabras antes, una lista de radios, el acierto «Haber de Caja» en teal y la consigna dos veces en «Así se juega».
- Diseño: Hanayama, «el cajón como tablero» (`celula-d/hanayama-h1-rediseno.md`, con su §9). Textos: Katsumi (`celula-d/katsumi-texto-rediseno.md`). Aprobados por Yujiro en su corte de calidad del 15 oct 2026 (`celula-d/corte-calidad.md`).
- **Un solo negocio:** un taller de bicicletas con 400.000 en la caja. Cifras construidas. Con los hechos barajados el saldo nunca da negativo (el peor orden deja 50.000) y siempre termina en 600.000.
- **El `activity_id` no cambia** (`t4-entra-o-sale-de-caja`; migración 0200, sin cambios). **Los ítems cambian de id:** `h1-t1`…`h1-t8` (antes `h1-1`…`h1-8`). fp_detalle guarda item_id (migración 0017): las filas viejas quedan con sus ids, y los hechos de la v1 se guardan en los datos solo para que el panel docente las siga leyendo.
- Respuesta y subtema de cada hecho: los mismos de la v1. Un solo toque por hecho; el error dice a dónde iba la plata, y la figura la lleva allí.
- INFLESZ **medido** con `src/herramientas/inflesz.js`. Todo texto de 10 o más palabras da 65 o más.

## Consigna

- Consigna: «La caja de un taller tiene 400.000. Manda cada hecho al debe, al haber o a «Caja no se mueve».» (97,2)
- Saldo inicial: 400.000

## Hechos

### h1-t1 · viene de h1-1
- Subtema: Entradas a Caja
- Va a: debe
- Monto: 180.000
- Hecho: «Arregla las bicicletas de varios clientes, y todos le pagan de contado ese día.» (72,7)
- Acierto (tras «Correcto.»): «Entró plata a la caja, y Caja es un activo: lo que entra va al debe.» (97,4)
- Error si va al haber: «Lo tomaste como una salida, pero aquí le pagaron al taller: la plata entró. Va al debe.» (81,1)
- Error si va a «Caja no se mueve»: «Sí se mueve: de contado quiere decir que la plata entró hoy a la caja. Va al debe.» (104,4)
- Página: «Basado en el libro, p. 180. Cifras construidas.»

### h1-t2 · viene de h1-2
- Subtema: Caja o Bancos
- Va a: haber · sale hacia: bancos
- Monto: 200.000
- Hecho: «Saca plata de la caja y la consigna en la cuenta corriente del taller.» (90,5)
- Acierto (tras «Correcto.»): «La plata salió de la caja y llegó al banco: Caja se acredita y Bancos se debita.» (83,6)
- Error si va al debe: «Miraste a Bancos, que es la que recibe. Caja es la que entrega la plata: va al haber.» (100,9)
- Error si va a «Caja no se mueve»: «La plata sigue siendo del taller, pero ya no está en la caja. Salió por el haber hacia Bancos.» (99,0)
- Página: «Basado en el libro, p. 180. Cifras construidas.»

### h1-t3 · viene de h1-3
- Subtema: Salidas de Caja
- Va a: haber · sale hacia: pago
- Monto: 150.000
- Hecho: «Le compra herramientas a un proveedor y se las paga con billetes de la caja.» (83,8)
- Acierto (tras «Correcto.»): «Salió plata de la caja para pagar, y lo que sale de Caja va al haber.» (97,4)
- Error si va al debe: «Pagar no es recibir. La plata salió de la caja hacia el proveedor, así que va al haber.» (94,0)
- Error si va a «Caja no se mueve»: «Sí se mueve: los billetes salieron de la caja para pagar las herramientas. Pagar en efectivo acredita Caja.» (69,8)
- Página: «Basado en el libro, p. 180. Cifras construidas.»

### h1-t4 · viene de h1-4
- Subtema: Caja o Bancos
- Va a: no-se-mueve · enciende: bancos
- Monto: 90.000
- Hecho: «Le paga a su proveedor de repuestos con un cheque propio.» (88,2)
- Acierto (tras «Correcto.»): «Un cheque propio saca la plata del banco: se acredita Bancos, y Caja no se toca.» (85,7)
- Error si va al haber: «Esa plata no sale de la caja, sino de la cuenta del banco. Por eso se acredita Bancos, y Caja no se mueve.» (95,1)
- Error si va al debe: «Aquí el taller paga, no recibe. Y paga con un cheque propio, así que la plata sale del banco. Caja no se mueve.» (96,2)
- Página: «Basado en el libro, p. 187. Cifras construidas.»

### h1-t5 · viene de h1-5
- Subtema: Entradas a Caja
- Va a: debe
- Monto: 120.000
- Hecho: «Un cliente le paga con un cheque, y el taller lo guarda en su caja.» (104,6)
- Acierto (tras «Correcto.»): «La caja guarda billetes y también los cheques que el taller tiene en la mano. Entró un cheque: va al debe.» (98,4)
- Error si va a «Caja no se mueve»: «El taller recibió el cheque y lo guarda en la caja, así que Caja sí se mueve: va al debe.» (93,4)
- Error si va al haber: «Aquí el taller recibe, no paga. Lo que entra a la caja, billetes o un cheque, va al debe.» (95,7)
- Página: «Basado en el libro, pp. 179-180. Cifras construidas.»

### h1-t6 · viene de h1-6
- Subtema: Caja o Bancos
- Va a: no-se-mueve · enciende: bancos
- Monto: 160.000
- Hecho: «Un cliente paga lo que debe consignando directo en la cuenta del taller.» (83,6)
- Acierto (tras «Correcto.»): «La plata fue directo al banco y nunca pasó por la caja. Se debita Bancos.» (95,5)
- Error si va al debe: «Sí entró plata, pero al banco, no a la caja. Se debita Bancos, y Caja no se mueve.» (100,9)
- Error si va al haber: «Nada salió de la caja. La plata entró, y entró directo al banco: Caja no se mueve.» (95,7)
- Página: «Basado en el libro, p. 186. Cifras construidas.»

### h1-t7 · viene de h1-7
- Subtema: Caja frente a ingresos
- Va a: debe
- Monto: 250.000
- Hecho: «Los socios ponen más plata, en efectivo, para que el taller crezca.» (85,8)
- Acierto (tras «Correcto.»): «Entró plata a la caja, aunque nadie compró nada. Va al debe; el aporte no es un ingreso.» (94,0)
- Error si va a «Caja no se mueve»: «Sí se mueve: el efectivo entró a la caja. Que el aporte no sea un ingreso no quiere decir que Caja se quede quieta.» (91,0)
- Error si va al haber: «Pensaste que salió, pero los socios la pusieron en la caja. Va al debe.» (97,5)
- Página: «Basado en el libro, p. 180. Cifras construidas.»

### h1-t8 · viene de h1-8
- Subtema: Caja frente a ingresos
- Va a: no-se-mueve
- Monto: 70.000
- Hecho: «Arregla una bicicleta, y el cliente le va a pagar el mes que viene.» (90,5)
- Acierto (tras «Correcto.»): «Ya hay un ingreso, pero todavía no entra un peso. Vender no es cobrar: Caja se mueve cuando llegue el pago.» (89,5)
- Error si va al debe: «El taller ya vendió, pero no ha cobrado. La plata no ha entrado a la caja, así que Caja todavía no se mueve.» (92,4)
- Error si va al haber: «Aquí no sale plata de la caja. Tampoco entra: el cliente paga el mes que viene. Caja no se mueve hoy.» (99,0)
- Página: «Cifras construidas.»

## Cierre

- Cierre: «La caja empezó en 400.000 y termina en 600.000. Lo que entró fue al debe, y lo que salió, al haber. Un cheque propio o una consignación directa del cliente mueven Bancos, no Caja.» (87,4)
- Pie del cierre: «Basado en el libro, pp. 179-180, 186 y 187. Cifras construidas.»

## Así se juega

- Paso 1: «Lee el hecho.» (<10)
- Paso 2: «¿Entra plata a la caja, sale o no la toca?» (103,4)
- Paso 3: «Toca donde va y mira el saldo.» (<10)
- Ejemplo · hecho: «Paga de contado unas llantas, con billetes de la caja.» (84,7)
- Ejemplo · monto: 60.000 · va a: haber · sale hacia: pago
- Ejemplo · acierto (tras «Correcto.»): «Salieron billetes de la caja, así que va al haber.» (90,9)
- Texto alternativo: «El taller paga unas llantas con billetes de la caja. Sale plata: el hecho va al haber, y en la caja quedan 340.000 de los 400.000.» (90,8)

## Interfaz común del rediseño (A0, A1 y H1)

Decisiones 1 y 2 de Katsumi; corte de Yujiro, ajuste 2.

- Palabra del acierto (va antes del texto): «Correcto.»
- Palabra del error: ninguna visible. El error es ✗ y el texto.
- Solo para el lector de pantalla, delante del texto del error: «Incorrecto.»
- Marca del destino acertado: «✓ Correcto»
- Marca del destino mal elegido: «✗ No va aquí»
- Marca del destino que era: «Iba aquí»
