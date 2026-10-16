**T4 · Los Hacer, versión 2: el corte de calidad (de 8 a 5) y el rediseño de enganche de H3, H4, H7 y H8.**

Mateo ordenó «calidad sobre cantidad». Ninguna pieza del T4 pasaba la barra de enganche B1-B5 (`orquestador/conocimiento/enganche.md`). Yujiro cortó los Hacer de 8 a 5 (`celula-d/corte-calidad.md`, 15 oct 2026), Hanayama rediseñó los que quedan y Katsumi escribió sus textos. Mientras no haya estudiantes reales, Mateo autorizó a la célula a retirar o fundir actividades del catálogo, cambiar ids de ítems y limpiar FP e intentos de prueba.

## Qué queda y qué sale

| Pieza | Antes | Ahora | Paquete vigente |
|---|---|---|---|
| H1 «¿Entra o sale de Caja?» | fácil · 10 | igual | `d4-t4-h1-v2-rediseno.md` |
| H2 «El control que se saltaron» | fácil · 10 | **RETIRADA**: era reconocer una lista, y los controles ya los enseña A1 con figura | — (`d4-t4-h2-v1.md` queda como historia) |
| H3 «¿Se mueve la caja menor?» | medio · 25 | igual, rediseñada | `d4-t4-h3-v2-rediseno.md` |
| H4 «El arqueo de Rosa» → **«El arqueo de caja menor»** | medio · 25 | **difícil · 50**, con H5 dentro | `d4-t4-h4-v2-rediseno.md` |
| H5 «¿Al empleado o al gasto?» | difícil · 50 | **FUNDIDA EN H4**: sus cuatro casos son rondas de H4; su pregunta es la 4 | `d4-t4-h4-v2-rediseno.md` |
| H6 «¿Quién se enteró primero?» | medio · 25 | **FUNDIDA EN H7**: elegir la libreta es decidir quién no tiene la partida; sus ocho partidas salen | `d4-t4-h7-v2-rediseno.md` |
| H7 «Concilia la cuenta» | difícil · 50 | igual, rediseñada, con H6 dentro | `d4-t4-h7-v2-rediseno.md` |
| H8 «¿Se asienta o no?» | experto · 90 | igual, rediseñada | `d4-t4-h8-v2-rediseno.md` |

## Catálogo: 0208 y 0209

El catálogo del servidor lo cambian dos migraciones de la Célula D (decisión de Yujiro, 15 oct), por la puerta del #289:
- **0208**, con la marca «GUARDIAN: retiro blando de catalogo»: retira en blando `t4-el-control-que-se-saltaron` (0201), `t4-al-empleado-o-al-gasto` (0204) y `t4-quien-se-entero-primero` (0205). Solo `set retirada = true`; nada de delete. Sus filas de prueba se quedan, retiradas, y una llamada con caché vieja responde en vez de reventar.
- **0209**: un upsert que sube `t4-el-arqueo-de-rosa` (0203) a evaluativa · difícil · 50 FP · 1 etapa, como las otras difíciles del catálogo.

Van en dos archivos porque el guardián deja pasar un retiro blando solo si el archivo no trae otra actualización. La prueba es `supabase/tests/t4_corte_hacer_test.sql` (7 de 7 sobre un Postgres 16 limpio con todas las migraciones, corriéndolas dos veces). Las 0200-0207 no cambian: ya corrieron en producción.

## Ids

- **activity_id:** los de H1, H3, H4, H7 y H8 no cambian.
- **Ítems:** H3, H7 y H8 conservan los suyos. H4 sigue con «ronda:pregunta»: las rondas de Rosa conservan su id (`h4-1`, `h4-2`, `h4-4`, `h4-6`), las de H5 entran como `h5-1`…`h5-4`, y la pregunta 4 es `cuenta`. `h4-3` y `h4-5` salen; el panel docente las sigue leyendo.

## Decisiones de Katsumi (texto)



1. **Devolución igual que en A0, A1 y H1.** Acierto: ✓ + «Correcto.» + el texto. Error: ✗ + el texto, con «Incorrecto.» solo para lector. Por eso **quito «Así es.»** de todos los aciertos de los paquetes: con «Correcto.» delante, sobraba.
2. **Los cuatro Hacer son de un intento con «Iba aquí»**, así que los errores pueden decir lo que iba. Los de los paquetes ya lo hacían en casi todos; los dejo. La excepción es **H8 etapa 3**: ningún error dice el saldo, porque la v3 no lo revela hasta el acierto.
3. **El monto ya no va dentro del texto de la tarjeta** (H3, H7 y H8). La tarjeta lo muestra aparte, abajo a la derecha, como en H1. Así se acortan todas, y ninguna repite la cifra.
4. **H3: el valor del fondo lo dice el sobre** (propuesta de Hanayama). «De $300.000 a $450.000» sale del enunciado del aumento; el sobre muestra 300.000 antes y 450.000 después.
5. **H3, línea «diría»:** compara con lo que hay en el sobre **después** de la operación, desde el primer instante. En el prototipo la cifra del sobre cambiaba a los 0,7 s dentro de la misma frase (en el aumento decía «300.000» y luego «450.000»). Un saldo negativo se escribe con signo menos (−300.000), no con guion.
6. **H3, el rótulo del sobre lleva el nombre del encargado de la serie:** «LO QUE TIENE LUCÍA» en la serie 1 y «LO QUE TIENE ANDRÉS» en la serie 2.
7. **H4: todas las rondas llevan una regla de la empresa para el caso de que falte plata** («Si falta plata, se la cobran.» o «Si falta plata, la empresa la asume.»). En el prototipo, solo las rondas de H5 traían la decisión, y decía «cobrarle el faltante»: **la tarjeta respondía la pregunta 1** (si hay decisión sobre un faltante, falta). Ahora la regla está en las ocho y es condicional: el estudiante tiene que ver si aplica. En las rondas con sobrante, la regla sobra a propósito: atrapa a quien manda un sobrante a Cuentas por cobrar.
8. **Consignas cortas, de dos renglones a 320, en las cuatro piezas** (H3 17 palabras, H4 14, H7 16, H8 14). Así la figura sube a 181 px, como en el prototipo, y en «Así se juega» quedan menos palabras antes del ejemplo. En H4 el tope de 27 ya no valía: se calculó con «El arqueo» (2 palabras), y el título nuevo tiene 5.
9. **H4, la pregunta 3 pasa a «¿Por cuánto sale el reembolso?»** (un renglón). «¿Por cuánto sale el cheque del reembolso?» ocupaba dos.
10. **H4, la pregunta 1 trae un mensaje para cada zona equivocada** (el prototipo tenía uno solo para las dos), como el paquete.
11. **H4, rótulo de la regla «con el cheque bien» → «con el cheque correcto».** Los demás rótulos de Hanayama quedan.
12. **H7 y H8: las partidas de las notas del banco ya no dicen «La empresa todavía no lo ha anotado».** Con H6 dentro de H7, elegir la libreta **es** decidir quién no la tiene, y esa frase lo respondía. En H8 respondía la etapa 1. Así H7-9 baja a 3 renglones sin cortar nada más.
13. **H7 y H8: «El cliente Gloria Ruiz» → «La clienta Gloria Ruiz»**, y «Sofía Cárdenas» igual. Los mensajes de H8 que decían «cuando el cliente pagó» pasan a «con ese pago», que vale para las dos series.
14. **Marcas de los campos de cifra (H7 fase 2 y H8 etapa 3): «✓ Correcto» y «✗ Cifra errada».** «No va aquí» no sirve para una cifra (corte), y «No es el saldo» repetía «Saldo» al lado del rótulo del mayor. «Errada» es la palabra de aquí para una respuesta que no es.
15. **Cambio de cifras en H7 y H8, serie 1:** el cheque a Mario Sánchez pasa de 310.400 a **310.500** y el extracto de 1.874.300 a **1.874.400**. Con las cifras viejas, el mayor de H8 llegaba a 2.551.700 por **otro camino**, con siete decisiones malas (detalle en «Cifras»). Ahora solo llega con todas buenas. El saldo conciliado (2.551.700), los libros y las notas no cambian.
16. **«Cifras construidas» va en el pie de cada devolución** de las cuatro piezas, como en H1. En H7 fase 1, el pie pasa a «Basado en el libro, p. 190. Cifras construidas» (el texto pendiente de la serie 2). En H8 el pie cambia por etapa: p. 190, p. 191 y pp. 190-191.

## Cifras (script de Katsumi, `katsumi/hacer/cifras.py`, para H3, H4, H7 y H8)

`katsumi/hacer/cifras.py`, sobre los datos de `textos_hacer.py`. Salida completa:

```
cifras del libro reconocidas: 39

══ H3 ══

Serie Distribuidora Andina (encargado: Lucía)
  op1 Apertura del fondo: monto 300.000 · sobre antes 0+0 = 0 · después 300.000 · libro (Caja menor) 0 → 300.000  = sobre
     11 combinaciones equivocadas, todas con mensaje: True
     línea «diría» (sobre después = 300.000): caja-menor/caja: diría 300.000 (oculta: igual al sobre) · caja-menor/gastos-generales: diría 300.000 (oculta: igual al sobre) · bancos/caja-menor: diría −300.000 · caja/caja-menor: diría −300.000 · gastos-generales/caja-menor: diría −300.000
  op2 Reembolso: monto 214.600 · sobre antes 85.400+214.600 = 300.000 · después 300.000 · libro (Caja menor) 300.000 → 300.000  = sobre
     11 combinaciones equivocadas, todas con mensaje: True
     línea «diría» (sobre después = 300.000): caja-menor/bancos: diría 514.600 · caja-menor/caja: diría 514.600 · caja-menor/gastos-generales: diría 514.600 · bancos/caja-menor: diría 85.400 · caja/caja-menor: diría 85.400 · gastos-generales/caja-menor: diría 85.400
  op3 Aumento del fondo: monto 150.000 · sobre antes 300.000+0 = 300.000 · después 450.000 · libro (Caja menor) 300.000 → 450.000  = sobre
     11 combinaciones equivocadas, todas con mensaje: True
     línea «diría» (sobre después = 450.000): caja-menor/caja: diría 450.000 (oculta: igual al sobre) · caja-menor/gastos-generales: diría 450.000 (oculta: igual al sobre) · bancos/caja-menor: diría 150.000 · caja/caja-menor: diría 150.000 · gastos-generales/caja-menor: diría 150.000
  op4 Disminución del fondo: monto 100.000 · sobre antes 450.000+0 = 450.000 · después 350.000 · libro (Caja menor) 450.000 → 350.000  = sobre
     11 combinaciones equivocadas, todas con mensaje: True
     línea «diría» (sobre después = 350.000): caja-menor/bancos: diría 550.000 · caja-menor/caja: diría 550.000 · caja-menor/gastos-generales: diría 550.000 · bancos/caja-menor: diría 350.000 (oculta: igual al sobre) · gastos-generales/caja-menor: diría 350.000 (oculta: igual al sobre)
  cifras: 300.000, 214.600, 450.000, 350.000, 150.000, 100.000, 85.400 · en el libro: ninguna

Serie Muebles El Roble (encargado: Andrés)
  op1 Apertura del fondo: monto 280.000 · sobre antes 0+0 = 0 · después 280.000 · libro (Caja menor) 0 → 280.000  = sobre
     11 combinaciones equivocadas, todas con mensaje: True
     línea «diría» (sobre después = 280.000): caja-menor/caja: diría 280.000 (oculta: igual al sobre) · caja-menor/gastos-generales: diría 280.000 (oculta: igual al sobre) · bancos/caja-menor: diría −280.000 · caja/caja-menor: diría −280.000 · gastos-generales/caja-menor: diría −280.000
  op2 Reembolso: monto 187.350 · sobre antes 92.650+187.350 = 280.000 · después 280.000 · libro (Caja menor) 280.000 → 280.000  = sobre
     11 combinaciones equivocadas, todas con mensaje: True
     línea «diría» (sobre después = 280.000): caja-menor/bancos: diría 467.350 · caja-menor/caja: diría 467.350 · caja-menor/gastos-generales: diría 467.350 · bancos/caja-menor: diría 92.650 · caja/caja-menor: diría 92.650 · gastos-generales/caja-menor: diría 92.650
  op3 Aumento del fondo: monto 165.000 · sobre antes 280.000+0 = 280.000 · después 445.000 · libro (Caja menor) 280.000 → 445.000  = sobre
     11 combinaciones equivocadas, todas con mensaje: True
     línea «diría» (sobre después = 445.000): caja-menor/caja: diría 445.000 (oculta: igual al sobre) · caja-menor/gastos-generales: diría 445.000 (oculta: igual al sobre) · bancos/caja-menor: diría 115.000 · caja/caja-menor: diría 115.000 · gastos-generales/caja-menor: diría 115.000
  op4 Disminución del fondo: monto 70.000 · sobre antes 445.000+0 = 445.000 · después 375.000 · libro (Caja menor) 445.000 → 375.000  = sobre
     11 combinaciones equivocadas, todas con mensaje: True
     línea «diría» (sobre después = 375.000): caja-menor/bancos: diría 515.000 · caja-menor/caja: diría 515.000 · caja-menor/gastos-generales: diría 515.000 · bancos/caja-menor: diría 375.000 (oculta: igual al sobre) · gastos-generales/caja-menor: diría 375.000 (oculta: igual al sobre)
  cifras: 280.000, 187.350, 445.000, 375.000, 165.000, 70.000, 92.650 · en el libro: ninguna

══ H4 (con H5) ══
  h4-1  cuadra fondo 500.000 · soportes 463.750 + caja 36.250 = 500.000 · diferencia — · cheque 463.750 · caja + cheque = 500.000 · asiento debe 463.750 = haber 463.750
         pregunta 3 (aguja «caja + tu cheque», desvío del fondo): 463.750 → +0 · 500.000 → fuera → · 36.250 → fuera →
  h4-6  cuadra fondo 500.000 · soportes 287.450 + caja 212.550 = 500.000 · diferencia — · cheque 287.450 · caja + cheque = 500.000 · asiento debe 287.450 = haber 287.450
         pregunta 3 (aguja «caja + tu cheque», desvío del fondo): 287.450 → +0 · 500.000 → fuera → · 212.550 → fuera →
  h4-2  sobra  fondo 500.000 · soportes 391.800 + caja 112.500 = 504.300 · diferencia 4.300 · cheque 387.500 · caja + cheque = 500.000 · asiento debe 391.800 = haber 391.800
         pregunta 2: 4.300 → +4.300 · 108.200 → fuera → · 504.300 → fuera →
         pregunta 3 (aguja «caja + tu cheque», desvío del fondo): 387.500 → +0 · 391.800 → +4.300 · 396.100 → +8.600
         pregunta 4: Ingresos no operacionales – sobrante de caja menor, al haber · 7 elecciones equivocadas (3 cuentas × 2 lados + el lado contrario), todas con mensaje
  h4-4  sobra  fondo 500.000 · soportes 456.300 + caja 45.200 = 501.500 · diferencia 1.500 · cheque 454.800 · caja + cheque = 500.000 · asiento debe 456.300 = haber 456.300
         pregunta 2: 1.500 → +1.500 · 43.700 → fuera → · 501.500 → fuera →
         pregunta 3 (aguja «caja + tu cheque», desvío del fondo): 454.800 → +0 · 456.300 → +1.500 · 457.800 → +3.000
         pregunta 4: Ingresos no operacionales – sobrante de caja menor, al haber · 7 elecciones equivocadas (3 cuentas × 2 lados + el lado contrario), todas con mensaje
  h5-1  falta  fondo 400.000 · soportes 352.800 + caja 41.700 = 394.500 · diferencia 5.500 · cheque 358.300 · caja + cheque = 400.000 · asiento debe 358.300 = haber 358.300
         pregunta 2: 5.500 → -5.500 · 47.200 → fuera → · 394.500 → fuera →
         pregunta 3 (aguja «caja + tu cheque», desvío del fondo): 358.300 → +0 · 352.800 → -5.500 · 347.300 → fuera →
         pregunta 4: Cuentas por cobrar – empleados, al debe · 7 elecciones equivocadas (3 cuentas × 2 lados + el lado contrario), todas con mensaje
  h5-3  falta  fondo 250.000 · soportes 197.300 + caja 48.900 = 246.200 · diferencia 3.800 · cheque 201.100 · caja + cheque = 250.000 · asiento debe 201.100 = haber 201.100
         pregunta 2: 3.800 → -3.800 · 52.700 → fuera → · 246.200 → fuera →
         pregunta 3 (aguja «caja + tu cheque», desvío del fondo): 201.100 → +0 · 197.300 → -3.800 · 193.500 → -7.600
         pregunta 4: Cuentas por cobrar – empleados, al debe · 7 elecciones equivocadas (3 cuentas × 2 lados + el lado contrario), todas con mensaje
  h5-2  falta  fondo 600.000 · soportes 518.450 + caja 77.350 = 595.800 · diferencia 4.200 · cheque 522.650 · caja + cheque = 600.000 · asiento debe 522.650 = haber 522.650
         pregunta 2: 4.200 → -4.200 · 81.550 → fuera → · 595.800 → fuera →
         pregunta 3 (aguja «caja + tu cheque», desvío del fondo): 522.650 → +0 · 518.450 → -4.200 · 514.250 → -8.400
         pregunta 4: Gastos no operacionales – faltante de caja menor, al debe · 7 elecciones equivocadas (3 cuentas × 2 lados + el lado contrario), todas con mensaje
  h5-4  falta  fondo 500.000 · soportes 431.600 + caja 59.400 = 491.000 · diferencia 9.000 · cheque 440.600 · caja + cheque = 500.000 · asiento debe 440.600 = haber 440.600
         pregunta 2: 9.000 → -9.000 · 68.400 → fuera → · 491.000 → fuera →
         pregunta 3 (aguja «caja + tu cheque», desvío del fondo): 440.600 → +0 · 431.600 → -9.000 · 422.600 → fuera →
         pregunta 4: Gastos no operacionales – faltante de caja menor, al debe · 7 elecciones equivocadas (3 cuentas × 2 lados + el lado contrario), todas con mensaje
  demo  sobra  fondo 320.000 · soportes 268.400 + caja 54.300 = 322.700 · diferencia 2.700 · cheque 265.700 · caja + cheque = 320.000
  demo de «Así se juega»: choca con cifras del libro o de T4: ninguna
  respuestas de H4 que son cifra del libro: ninguna

══ H7, serie 1 · Comercializadora Los Cerezos Ltda. · 30 de septiembre ══
  banco:  1.874.400 + 1.265.000 − 587.700 = 2.551.700
  libros: 2.484.800 + 589.200 − 522.300 = 2.551.700
  combinaciones de signos que llegan a 2.551.700: banco 1 de 81, libros 1 de 243 (solo la correcta: True)
  errores con cifra: banco 1.197.100 · banco 3.139.400 · banco 1.286.700 · libros 2.417.900 · libros 3.074.000 · libros 1.962.500
── H8, serie 1 ──
  mayor: 2.484.800 + 589.200 − 522.300 = 2.551.700 (= saldo conciliado de H7: True)
  de las 19683 formas de llevar las 9 partidas al mayor (sumando, restando o sin entrar), llegan a 2.551.700: 1; es la de todas las decisiones buenas: True
  etapa 2, combinaciones equivocadas por regla (Caja, sin Bancos, Bancos al lado contrario, cuenta, al revés): p5: 10+12+3+3+1 · p6: 10+12+3+3+1 · p7: 10+12+3+3+1 · p8: 10+12+3+3+1 · p9: 10+12+3+3+1
  errores con cifra de la etapa 3: 3.074.000 · 1.962.500 · 3.229.000
  cifras de la serie que están en el libro: ninguna

══ H7, serie 2 · Distribuidora El Mirador Ltda. · 31 de octubre ══
  banco:  3.216.800 + 947.500 − 786.800 = 3.377.500
  libros: 3.090.900 + 798.100 − 511.500 = 3.377.500
  combinaciones de signos que llegan a 3.377.500: banco 1 de 81, libros 1 de 243 (solo la correcta: True)
  errores con cifra: banco 3.056.100 · banco 4.164.300 · banco 2.430.000 · libros 2.804.300 · libros 3.889.000 · libros 2.579.400
── H8, serie 2 ──
  mayor: 3.090.900 + 798.100 − 511.500 = 3.377.500 (= saldo conciliado de H7: True)
  de las 19683 formas de llevar las 9 partidas al mayor (sumando, restando o sin entrar), llegan a 3.377.500: 1; es la de todas las decisiones buenas: True
  etapa 2, combinaciones equivocadas por regla (Caja, sin Bancos, Bancos al lado contrario, cuenta, al revés): p5: 10+12+3+3+1 · p6: 10+12+3+3+1 · p7: 10+12+3+3+1 · p8: 10+12+3+3+1 · p9: 10+12+3+3+1
  errores con cifra de la etapa 3: 3.889.000 · 2.579.400 · 3.538.200
  cifras de la serie que están en el libro: ninguna

══ Cifras que se repiten entre piezas ══
  H3 s1 y H1 y demos: 150.000
  H3 s2 y H1 y demos: 70.000

TODO CUADRA
```

- **H8, «solo si todas las decisiones fueron buenas».** El script prueba las 3⁹ = 19.683 maneras de llevar las nueve partidas al mayor (cada una suma, resta o no entra: es lo que deciden las etapas 1 y 2). Con las cifras del paquete, la serie 1 llegaba a 2.551.700 por dos caminos: el bueno y otro con siete decisiones malas (sumar dos cheques y la chequera, restar el tercer cheque, y dejar fuera la clienta, el sobregiro y el cheque devuelto: 184.500 + 92.700 + 38.900 + 61.200 − 310.400 = 66.900, lo mismo que 589.200 − 522.300). Con el cheque a Mario Sánchez en 310.500 y el extracto en 1.874.400, solo llega el bueno. La serie 2 ya estaba bien.
- **H7**, por lado, con cada partida sumando, restando o fuera: solo la combinación correcta da el saldo conciliado, en las dos series.
- **H4:** en la pregunta 3, el cheque «gastos − diferencia» de H5-1 y de H5-4 cae fuera de la regla (−11.000 y −18.000), y se dibuja en el borde con «→». Hanayama escribió «±8.600 como mucho»: contó solo las rondas de H4. No rompe nada.
- **Cifras repetidas entre piezas:** 150.000 (aumento de H3, serie 1, y un hecho de H1) y 70.000 (disminución de H3, serie 2, y un hecho de H1). Son de piezas y conceptos distintos; no las cambio.
