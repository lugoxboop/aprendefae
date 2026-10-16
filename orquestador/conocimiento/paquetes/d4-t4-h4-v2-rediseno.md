**T4 · H4 «El arqueo de caja menor» (con H5 dentro) · versión 2: el rediseño de enganche.**
- **Este archivo es la versión vigente de H4.** Sustituye `d4-t4-h4-v1.md` y `d4-t4-h5-v1.md` enteros, y la parte de H4 y H5 de `d4-t4-asi-se-juega-v1.md`. **H5 «¿Al empleado o al gasto?» se funde aquí** (corte de Yujiro): sus cuatro casos son rondas de H4 y su pregunta es la 4. El `activity_id` sigue siendo `t4-el-arqueo-de-rosa`; el nombre pasa a «El arqueo de caja menor» y la pieza sube a **difícil · 50 FP** (la migración 0209). Los ítems son «ronda:pregunta» (`h4-2:diferencia`, `h5-1:cuenta`). H4-3 y H4-5 salen.
- **Objetivo (D2, 16 oct 2026):** se ve antes de empezar, en el Encabezado compartido (su prop `objetivo`), sobre la consigna: «Arquear una caja menor y calcular su reembolso.» Texto de Katsumi (16 oct): el de antes pasaba de 8 palabras.
- Por qué: la pieza publicada en la pila fallaba la barra de enganche B1-B5 (`orquestador/conocimiento/enganche.md`; diagnóstico de Shibukawa, `celula-d/shibukawa-diagnostico-enganche.md`).
- Diseño: Hanayama (`celula-d/hanayama-h4-rediseno.md`). Textos: Katsumi (`celula-d/katsumi-texto-hacer.md`, 15 oct 2026), copiados aquí tal cual. Aprobados por Yujiro en su corte de calidad (`celula-d/corte-calidad.md`, «Hacer que quedan» y «Texto de los Hacer»).
- El código lee estos textos de `src/data/contabilidadT4H4.js`; una prueba (`src/contabilidad/__tests__/t4-h4-*.test.mjs`) compara cada uno contra este archivo, letra por letra.
- Lo que cambia frente a la v1, para todas las piezas: `d4-t4-hacer-v2-cambios.md`.

## H4 «El arqueo de caja menor» · `t4-el-arqueo-de-rosa` (con H5 dentro)

**Consigna** (14 pal. · INFLESZ 94,9; tope 27 de Hanayama, que con el título de 5 palabras baja a 24): Compara el sobre con el fondo y mira en la regla lo que decides.

Renglones a 320 y a 375: 2 (capturas; la figura queda a 181 px).

### Tarjetas de ronda (título + fondo y regla de la empresa)

Cuatro rondas por intento, una de cada tipo, sorteadas de a dos: Cuadra: H4-1 o H4-6; Sobrante de caja menor: H4-2 o H4-4; Faltante de caja menor cobrado al encargado: H5-1 o H5-3; Faltante de caja menor asumido por la empresa: H5-2 o H5-4. H4-3 y H4-5 salen (corte).

| Ronda | Título | Texto | Conteo | Renglones 320 (título + texto; tope 3) / 375 | Sobre: soportes · caja |
|---|---|---|---|---|---|
| H4-1 | Rosa · Sus Servicios, junio | Fondo de $500.000. Si falta plata, la empresa la asume. | 14 pal. | 1 + 2 / 1 + 2 | 463.750 · 36.250 |
| H4-6 | Rosa · Sus Servicios, noviembre | Fondo de $500.000. Si falta plata, se la cobran. | 13 pal. | 1 + 2 / 1 + 2 | 287.450 · 212.550 |
| H4-2 | Rosa · Sus Servicios, julio | Fondo de $500.000. Si falta plata, se la cobran. | 13 pal. | 1 + 2 / 1 + 2 | 391.800 · 112.500 |
| H4-4 | Rosa · Sus Servicios, septiembre | Fondo de $500.000. Si falta plata, la empresa la asume. | 14 pal. | 1 + 2 / 1 + 2 | 456.300 · 45.200 |
| H5-1 | Julián · Ferretería La Tuerca | Fondo de $400.000. Si falta plata, se la cobran. | 13 pal. | 1 + 2 / 1 + 2 | 352.800 · 41.700 |
| H5-3 | Camilo · Panadería El Trigal | Fondo de $250.000. Si falta plata, se la cobran. | 13 pal. | 1 + 2 / 1 + 2 | 197.300 · 48.900 |
| H5-2 | Marta · Agencia Rumbo | Fondo de $600.000. Si falta plata, la empresa la asume. | 13 pal. | 1 + 2 / 1 + 2 | 518.450 · 77.350 |
| H5-4 | Diana · Taller Rueda Libre | Fondo de $500.000. Si falta plata, la empresa la asume. | 14 pal. | 1 + 2 / 1 + 2 | 431.600 · 59.400 |

**Sobre:** «Soportes de gastos» y «En la caja» (sin cambios).

**Preguntas** (encima, «Paso n de N», con N = 2 si cuadra y 4 si no; prompt maestro §4.3):

| | Texto | Renglones 320 |
|---|---|---|
| 1 | ¿Qué muestra el arqueo? | 1 |
| 2 | ¿De cuánto es la diferencia? | 1 |
| 3 | ¿Por cuánto sale el reembolso? | 1 |
| 4 | ¿A qué cuenta va la diferencia? | 1 |

**Zonas de la pregunta 1:** «Falta», «Cuadra», «Sobra», en el orden de la regla.

**Rótulos de la regla:** «fondo 500.000» · «suman 504.300» · «suman, fuera de la regla» · «tu diferencia» · «Iba aquí: {diferencia}» (antes «era»; en el paso 2, tras el error, por ejemplo «Iba aquí: 3.800») · «caja + tu cheque» · «falta» · «sobra» · «cada marca: 2.000». Los demás son los de Hanayama. Sale «con el cheque correcto» (§2, FALLA de Shibukawa en 35348c3): en el paso 3, la aguja buena sigue en blanco sobre la marca del fondo, y la revelación es la opción correcta con su pastilla «Iba aquí».

**Asiento de la pregunta 4:** «DEBE», «HABER», «Gastos generales», la cuenta de la diferencia en sus renglones fijos y «Bancos» (sin cambios).

### Devoluciones, ronda por ronda

Un intento por pregunta; la pregunta siguiente se juega con la verdad ya dibujada. Pie de cada devolución, por tipo: cuadra «Basado en el libro, pp. 182-184. Cifras construidas»; sobrante «… pp. 183 y 185. Cifras construidas»; faltante «… pp. 183, 185 y 186. Cifras construidas».

**H4-1 · Rosa · Sus Servicios, junio** — cuadra · suma 500.000 · cheque 463.750

| Pregunta · elección | Texto | Conteo |
|---|---|---|
| 1 · Cuadra (acierto) | Correcto. $463.750 más $36.250 dan $500.000, justo el fondo. | 9 pal. |
| 1 · Sobra | Suma los dos: dan $500.000, justo el fondo. No sobra nada. | 11 pal. · INFLESZ 99,4 |
| 1 · Falta | Suma los dos: dan $500.000, justo el fondo. No falta nada. | 11 pal. · INFLESZ 99,4 |
| 3 · 463.750 (acierto) | Correcto. Si el arqueo cuadra, el cheque repone justo lo gastado: $463.750. | 12 pal. · INFLESZ 71 |
| 3 · 500.000 | El cheque no repone el fondo entero, porque en la caja quedan $36.250. Repone lo gastado: $463.750. | 17 pal. · INFLESZ 73,7 |
| 3 · 36.250 | Eso es lo que queda en la caja. El cheque repone lo que se gastó: $463.750. | 16 pal. · INFLESZ 101,5 |

**H4-6 · Rosa · Sus Servicios, noviembre** — cuadra · suma 500.000 · cheque 287.450

| Pregunta · elección | Texto | Conteo |
|---|---|---|
| 1 · Cuadra (acierto) | Correcto. $287.450 más $212.550 dan $500.000, justo el fondo. | 9 pal. |
| 1 · Sobra | Suma los dos: dan $500.000, justo el fondo. No sobra nada. | 11 pal. · INFLESZ 99,4 |
| 1 · Falta | Suma los dos: dan $500.000, justo el fondo. No falta nada. | 11 pal. · INFLESZ 99,4 |
| 3 · 287.450 (acierto) | Correcto. Si el arqueo cuadra, el cheque repone justo lo gastado: $287.450. | 12 pal. · INFLESZ 71 |
| 3 · 500.000 | El cheque no repone el fondo entero, porque en la caja quedan $212.550. Repone lo gastado: $287.450. | 17 pal. · INFLESZ 73,7 |
| 3 · 212.550 | Eso es lo que queda en la caja. El cheque repone lo que se gastó: $287.450. | 16 pal. · INFLESZ 101,5 |

**H4-2 · Rosa · Sus Servicios, julio** — sobra · suma 504.300 · diferencia 4.300 · cheque 387.500 · cuenta: Ingresos no operacionales – sobrante de caja menor, al haber

| Pregunta · elección | Texto | Conteo |
|---|---|---|
| 1 · Sobra (acierto) | Correcto. $391.800 más $112.500 dan $504.300: más que el fondo de $500.000. | 12 pal. · INFLESZ 81,4 |
| 1 · Falta | Al revés: la suma da $504.300, más que el fondo. Sobra plata. | 12 pal. · INFLESZ 102,2 |
| 1 · Cuadra | La suma da $504.300, y el fondo es de $500.000. No da exacto: sobra plata. | 15 pal. · INFLESZ 95,5 |
| 2 · 4.300 (acierto) | Correcto. $504.300 menos $500.000 da $4.300. | 6 pal. |
| 2 · 108.200 | Eso es lo que debería quedar en la caja: fondo menos gastos. La diferencia compara la suma con el fondo: $4.300. | 21 pal. · INFLESZ 80,6 |
| 2 · 504.300 | Es la suma de gastos y caja. La diferencia es cuánto se aleja esa suma del fondo: $4.300. | 18 pal. · INFLESZ 87,1 |
| 3 · 387.500 (acierto) | Correcto. Los $4.300 de más ya están en la caja, así que el cheque sale por menos de lo gastado: $387.500. | 21 pal. · INFLESZ 92,5 |
| 3 · 391.800 | Ese es el total de los gastos. Con un sobrante de caja menor, el cheque sale por menos: $387.500. | 19 pal. · INFLESZ 95,7 |
| 3 · 396.100 | Eso suma la diferencia en vez de restarla. La plata de más ya está en la caja: el cheque es de $387.500. | 22 pal. · INFLESZ 96,7 |
| 4 · la cuenta, en su lado (acierto) | Correcto. El sobrante de caja menor es un ingreso no operacional, y un ingreso va al haber. El asiento lleva los gastos al debe y el cheque a Bancos. | 29 pal. · INFLESZ 87,6 |
| 4 · Caja menor | Pensaste que la plata de más vuelve al fondo, pero Caja menor no se mueve en el reembolso. Es un ingreso. | 21 pal. · INFLESZ 92,5 |
| 4 · Cuentas por cobrar – empleados | Nadie le debe nada a la empresa: aquí no falta plata, sobra. El sobrante de caja menor es un ingreso. | 20 pal. · INFLESZ 84,7 |
| 4 · Gastos no operacionales – faltante de caja menor | Esa cuenta es para cuando falta plata. Aquí sobra, y el sobrante de caja menor es un ingreso. | 18 pal. · INFLESZ 83,6 |
| 4 · la cuenta buena en el lado contrario | La cuenta es esa, pero la pusiste con los gastos. Un ingreso va al haber. | 15 pal. · INFLESZ 99,7 |

**H4-4 · Rosa · Sus Servicios, septiembre** — sobra · suma 501.500 · diferencia 1.500 · cheque 454.800 · cuenta: Ingresos no operacionales – sobrante de caja menor, al haber

| Pregunta · elección | Texto | Conteo |
|---|---|---|
| 1 · Sobra (acierto) | Correcto. $456.300 más $45.200 dan $501.500: más que el fondo de $500.000. | 12 pal. · INFLESZ 81,4 |
| 1 · Falta | Al revés: la suma da $501.500, más que el fondo. Sobra plata. | 12 pal. · INFLESZ 102,2 |
| 1 · Cuadra | La suma da $501.500, y el fondo es de $500.000. No da exacto: sobra plata. | 15 pal. · INFLESZ 95,5 |
| 2 · 1.500 (acierto) | Correcto. $501.500 menos $500.000 da $1.500. | 6 pal. |
| 2 · 43.700 | Eso es lo que debería quedar en la caja: fondo menos gastos. La diferencia compara la suma con el fondo: $1.500. | 21 pal. · INFLESZ 80,6 |
| 2 · 501.500 | Es la suma de gastos y caja. La diferencia es cuánto se aleja esa suma del fondo: $1.500. | 18 pal. · INFLESZ 87,1 |
| 3 · 454.800 (acierto) | Correcto. Los $1.500 de más ya están en la caja, así que el cheque sale por menos de lo gastado: $454.800. | 21 pal. · INFLESZ 92,5 |
| 3 · 456.300 | Ese es el total de los gastos. Con un sobrante de caja menor, el cheque sale por menos: $454.800. | 19 pal. · INFLESZ 95,7 |
| 3 · 457.800 | Eso suma la diferencia en vez de restarla. La plata de más ya está en la caja: el cheque es de $454.800. | 22 pal. · INFLESZ 96,7 |
| 4 · la cuenta, en su lado (acierto) | Correcto. El sobrante de caja menor es un ingreso no operacional, y un ingreso va al haber. El asiento lleva los gastos al debe y el cheque a Bancos. | 29 pal. · INFLESZ 87,6 |
| 4 · Caja menor | Pensaste que la plata de más vuelve al fondo, pero Caja menor no se mueve en el reembolso. Es un ingreso. | 21 pal. · INFLESZ 92,5 |
| 4 · Cuentas por cobrar – empleados | Nadie le debe nada a la empresa: aquí no falta plata, sobra. El sobrante de caja menor es un ingreso. | 20 pal. · INFLESZ 84,7 |
| 4 · Gastos no operacionales – faltante de caja menor | Esa cuenta es para cuando falta plata. Aquí sobra, y el sobrante de caja menor es un ingreso. | 18 pal. · INFLESZ 83,6 |
| 4 · la cuenta buena en el lado contrario | La cuenta es esa, pero la pusiste con los gastos. Un ingreso va al haber. | 15 pal. · INFLESZ 99,7 |

**H5-1 · Julián · Ferretería La Tuerca** — falta · suma 394.500 · diferencia 5.500 · cheque 358.300 · cuenta: Cuentas por cobrar – empleados, al debe

| Pregunta · elección | Texto | Conteo |
|---|---|---|
| 1 · Falta (acierto) | Correcto. $352.800 más $41.700 dan $394.500: menos que el fondo de $400.000. | 12 pal. · INFLESZ 76,2 |
| 1 · Sobra | Al revés: la suma da $394.500, menos que el fondo. Falta plata. | 12 pal. · INFLESZ 97 |
| 1 · Cuadra | La suma da $394.500, y el fondo es de $400.000. No da exacto: falta plata. | 15 pal. · INFLESZ 95,5 |
| 2 · 5.500 (acierto) | Correcto. $400.000 menos $394.500 da $5.500. | 6 pal. |
| 2 · 47.200 | Eso es lo que debería quedar en la caja: fondo menos gastos. La diferencia compara la suma con el fondo: $5.500. | 21 pal. · INFLESZ 80,6 |
| 2 · 394.500 | Es la suma de gastos y caja. La diferencia es cuánto se aleja esa suma del fondo: $5.500. | 18 pal. · INFLESZ 87,1 |
| 3 · 358.300 (acierto) | Correcto. El cheque repone los gastos y los $5.500 que faltan: $358.300. | 12 pal. · INFLESZ 81,4 |
| 3 · 352.800 | El cheque no es solo lo gastado. También repone los $5.500 que faltan: $358.300. | 14 pal. · INFLESZ 84,1 |
| 3 · 347.300 | Falta plata, así que el cheque sale por más de lo gastado, no por menos: $358.300. | 16 pal. · INFLESZ 89,6 |
| 4 · la cuenta, en su lado (acierto) | Correcto. Se la cobran a Julián, así que le queda debiendo $5.500 a la empresa: Cuentas por cobrar – empleados, al debe. | 21 pal. · INFLESZ 80,6 |
| 4 · Caja menor | Pensaste que lo que falta se descuenta del fondo, pero Caja menor no se mueve en el reembolso. Mira la p. 186. | 22 pal. · INFLESZ 91,9 |
| 4 · Ingresos no operacionales – sobrante de caja menor | Esa cuenta es para cuando sobra plata. Aquí falta: la suma da $394.500, menos que el fondo. | 17 pal. · INFLESZ 84,7 |
| 4 · Gastos no operacionales – faltante de caja menor | Esa sería si la empresa asumiera la pérdida. Aquí se la cobran a Julián: le queda debiendo $5.500. | 18 pal. · INFLESZ 69,8 |
| 4 · la cuenta buena en el lado contrario | La cuenta es esa, pero la pusiste con el cheque, al haber. Va al debe, junto a los gastos. | 19 pal. · INFLESZ 102,2 |

**H5-3 · Camilo · Panadería El Trigal** — falta · suma 246.200 · diferencia 3.800 · cheque 201.100 · cuenta: Cuentas por cobrar – empleados, al debe

| Pregunta · elección | Texto | Conteo |
|---|---|---|
| 1 · Falta (acierto) | Correcto. $197.300 más $48.900 dan $246.200: menos que el fondo de $250.000. | 12 pal. · INFLESZ 76,2 |
| 1 · Sobra | Al revés: la suma da $246.200, menos que el fondo. Falta plata. | 12 pal. · INFLESZ 97 |
| 1 · Cuadra | La suma da $246.200, y el fondo es de $250.000. No da exacto: falta plata. | 15 pal. · INFLESZ 95,5 |
| 2 · 3.800 (acierto) | Correcto. $250.000 menos $246.200 da $3.800. | 6 pal. |
| 2 · 52.700 | Eso es lo que debería quedar en la caja: fondo menos gastos. La diferencia compara la suma con el fondo: $3.800. | 21 pal. · INFLESZ 80,6 |
| 2 · 246.200 | Es la suma de gastos y caja. La diferencia es cuánto se aleja esa suma del fondo: $3.800. | 18 pal. · INFLESZ 87,1 |
| 3 · 201.100 (acierto) | Correcto. El cheque repone los gastos y los $3.800 que faltan: $201.100. | 12 pal. · INFLESZ 81,4 |
| 3 · 197.300 | El cheque no es solo lo gastado. También repone los $3.800 que faltan: $201.100. | 14 pal. · INFLESZ 84,1 |
| 3 · 193.500 | Falta plata, así que el cheque sale por más de lo gastado, no por menos: $201.100. | 16 pal. · INFLESZ 89,6 |
| 4 · la cuenta, en su lado (acierto) | Correcto. Se la cobran a Camilo, así que le queda debiendo $3.800 a la empresa: Cuentas por cobrar – empleados, al debe. | 21 pal. · INFLESZ 77,7 |
| 4 · Caja menor | Pensaste que lo que falta se descuenta del fondo, pero Caja menor no se mueve en el reembolso. Mira la p. 186. | 22 pal. · INFLESZ 91,9 |
| 4 · Ingresos no operacionales – sobrante de caja menor | Esa cuenta es para cuando sobra plata. Aquí falta: la suma da $246.200, menos que el fondo. | 17 pal. · INFLESZ 84,7 |
| 4 · Gastos no operacionales – faltante de caja menor | Esa sería si la empresa asumiera la pérdida. Aquí se la cobran a Camilo: le queda debiendo $3.800. | 18 pal. · INFLESZ 66,3 |
| 4 · la cuenta buena en el lado contrario | La cuenta es esa, pero la pusiste con el cheque, al haber. Va al debe, junto a los gastos. | 19 pal. · INFLESZ 102,2 |

**H5-2 · Marta · Agencia Rumbo** — falta · suma 595.800 · diferencia 4.200 · cheque 522.650 · cuenta: Gastos no operacionales – faltante de caja menor, al debe

| Pregunta · elección | Texto | Conteo |
|---|---|---|
| 1 · Falta (acierto) | Correcto. $518.450 más $77.350 dan $595.800: menos que el fondo de $600.000. | 12 pal. · INFLESZ 76,2 |
| 1 · Sobra | Al revés: la suma da $595.800, menos que el fondo. Falta plata. | 12 pal. · INFLESZ 97 |
| 1 · Cuadra | La suma da $595.800, y el fondo es de $600.000. No da exacto: falta plata. | 15 pal. · INFLESZ 95,5 |
| 2 · 4.200 (acierto) | Correcto. $600.000 menos $595.800 da $4.200. | 6 pal. |
| 2 · 81.550 | Eso es lo que debería quedar en la caja: fondo menos gastos. La diferencia compara la suma con el fondo: $4.200. | 21 pal. · INFLESZ 80,6 |
| 2 · 595.800 | Es la suma de gastos y caja. La diferencia es cuánto se aleja esa suma del fondo: $4.200. | 18 pal. · INFLESZ 87,1 |
| 3 · 522.650 (acierto) | Correcto. El cheque repone los gastos y los $4.200 que faltan: $522.650. | 12 pal. · INFLESZ 81,4 |
| 3 · 518.450 | El cheque no es solo lo gastado. También repone los $4.200 que faltan: $522.650. | 14 pal. · INFLESZ 84,1 |
| 3 · 514.250 | Falta plata, así que el cheque sale por más de lo gastado, no por menos: $522.650. | 16 pal. · INFLESZ 89,6 |
| 4 · la cuenta, en su lado (acierto) | Correcto. La empresa asume la pérdida, y una pérdida es un gasto. Los $4.200 van al debe, en la cuenta del faltante de caja menor. | 25 pal. · INFLESZ 86,4 |
| 4 · Caja menor | Pensaste que lo que falta se descuenta del fondo, pero Caja menor no se mueve en el reembolso. Mira la p. 186. | 22 pal. · INFLESZ 91,9 |
| 4 · Ingresos no operacionales – sobrante de caja menor | Esa cuenta es para cuando sobra plata. Aquí falta: la suma da $595.800, menos que el fondo. | 17 pal. · INFLESZ 84,7 |
| 4 · Cuentas por cobrar – empleados | Esa sería si se la cobraran a Marta. Aquí la empresa asume la pérdida, y una pérdida es un gasto. | 20 pal. · INFLESZ 78,5 |
| 4 · la cuenta buena en el lado contrario | La cuenta es esa, pero la pusiste con el cheque, al haber. Va al debe, junto a los gastos. | 19 pal. · INFLESZ 102,2 |

**H5-4 · Diana · Taller Rueda Libre** — falta · suma 491.000 · diferencia 9.000 · cheque 440.600 · cuenta: Gastos no operacionales – faltante de caja menor, al debe

| Pregunta · elección | Texto | Conteo |
|---|---|---|
| 1 · Falta (acierto) | Correcto. $431.600 más $59.400 dan $491.000: menos que el fondo de $500.000. | 12 pal. · INFLESZ 76,2 |
| 1 · Sobra | Al revés: la suma da $491.000, menos que el fondo. Falta plata. | 12 pal. · INFLESZ 97 |
| 1 · Cuadra | La suma da $491.000, y el fondo es de $500.000. No da exacto: falta plata. | 15 pal. · INFLESZ 95,5 |
| 2 · 9.000 (acierto) | Correcto. $500.000 menos $491.000 da $9.000. | 6 pal. |
| 2 · 68.400 | Eso es lo que debería quedar en la caja: fondo menos gastos. La diferencia compara la suma con el fondo: $9.000. | 21 pal. · INFLESZ 80,6 |
| 2 · 491.000 | Es la suma de gastos y caja. La diferencia es cuánto se aleja esa suma del fondo: $9.000. | 18 pal. · INFLESZ 87,1 |
| 3 · 440.600 (acierto) | Correcto. El cheque repone los gastos y los $9.000 que faltan: $440.600. | 12 pal. · INFLESZ 81,4 |
| 3 · 431.600 | El cheque no es solo lo gastado. También repone los $9.000 que faltan: $440.600. | 14 pal. · INFLESZ 84,1 |
| 3 · 422.600 | Falta plata, así que el cheque sale por más de lo gastado, no por menos: $440.600. | 16 pal. · INFLESZ 89,6 |
| 4 · la cuenta, en su lado (acierto) | Correcto. La empresa asume la pérdida, y una pérdida es un gasto. Los $9.000 van al debe, en la cuenta del faltante de caja menor. | 25 pal. · INFLESZ 86,4 |
| 4 · Caja menor | Pensaste que lo que falta se descuenta del fondo, pero Caja menor no se mueve en el reembolso. Mira la p. 186. | 22 pal. · INFLESZ 91,9 |
| 4 · Ingresos no operacionales – sobrante de caja menor | Esa cuenta es para cuando sobra plata. Aquí falta: la suma da $491.000, menos que el fondo. | 17 pal. · INFLESZ 84,7 |
| 4 · Cuentas por cobrar – empleados | Esa sería si se la cobraran a Diana. Aquí la empresa asume la pérdida, y una pérdida es un gasto. | 20 pal. · INFLESZ 78,5 |
| 4 · la cuenta buena en el lado contrario | La cuenta es esa, pero la pusiste con el cheque, al haber. Va al debe, junto a los gastos. | 19 pal. · INFLESZ 102,2 |

En la pregunta 4, el mensaje de cada cuenta equivocada sale igual en el debe y en el haber; la cuenta buena en el lado contrario tiene el suyo («lado»).

### Botones, cierre

- Botones: «Siguiente paso» (dentro de la ronda), «Siguiente ronda», «Ver mi resumen», «Otra vez».
- **Resumen:** «N de 14 respuestas al primer intento.» (2 + 4 + 4 + 4 preguntas).
- **Cierre** (38 pal. · INFLESZ 82,7): Si el arqueo cuadra, el cheque repone lo gastado. Si sobra plata, sale por menos, y la diferencia es un ingreso. Si falta, sale por más, y la diferencia la paga el encargado o la asume la empresa.
- **Pie del cierre:** «Basado en el libro, pp. 182-186. Cifras construidas»

### «Así se juega»

| Lugar | Texto | Conteo |
|---|---|---|
| Paso 1 | Suma soportes y caja. | 4 pal. |
| Paso 2 | ¿Falta, cuadra o sobra? | 4 pal. |
| Paso 3 | Luego, la diferencia y el reembolso. | 6 pal. |
| Ejemplo · título | Iván · un vivero | 3 pal. |
| Ejemplo · tarjeta (sobre: soportes 268.400, caja 54.300) | Fondo de $320.000. Si falta plata, la empresa la asume. | 10 pal. · INFLESZ 83,5 |
| Acierto del ejemplo (zona «Sobra») | Correcto. $268.400 más $54.300 dan $322.700: más que el fondo de $320.000. | 12 pal. · INFLESZ 81,4 |
| Texto alternativo (`alt`) | Los soportes y la caja suman $322.700, más que el fondo de $320.000. Sobra plata, así que la aguja queda a la derecha de la marca del fondo. | 28 pal. · INFLESZ 88,3 |

Ronda construida, fuera del banco: fondo 320.000, suma 322.700, sobra 2.700. El guion toca la zona «Sobra» (lo pidió Hanayama) y la demo se queda en la pregunta 1. **Reemplaza** el ejemplo del paquete (un arqueo que cuadra, 420.000 + 80.000): con la pieza fundida, «Sobra» muestra la aguja fuera de la marca, que es lo que enseña la regla. El script comprueba que sus cifras no chocan con el libro ni con T4.

### Medido (sonda)

- **H4, 320 px** (46 estados medidos): **30 palabras** antes de la figura (tope 40) · figura a **181 px** como mucho (tope 280) · frases repetidas: **0** · desbordes propios: 0 · renglones partidos: 0 · controles < 44 px propios: 0
- **H4, 375 px** (46 estados medidos): **30 palabras** antes de la figura (tope 40) · figura a **181 px** como mucho (tope 280) · frases repetidas: **0** · desbordes propios: 0 · renglones partidos: 0 · controles < 44 px propios: 0
- **Así se juega, 320 px** (2 estados medidos): **32 palabras** antes de la figura (tope 40) · figura a **193 px** como mucho (tope 280) · frases repetidas: **0** · desbordes propios: 0 · renglones partidos: 0 · controles < 44 px propios: 2 (Pausar 40; Ver de nuevo 40)
- **Así se juega, 375 px** (2 estados medidos): **32 palabras** antes de la figura (tope 40) · figura a **175 px** como mucho (tope 280) · frases repetidas: **0** · desbordes propios: 0 · renglones partidos: 0 · controles < 44 px propios: 2 (Pausar 40; Ver de nuevo 40)

**Páginas:** el arqueo y la regla del fondo, p. 182; los asientos de sobrante y faltante, p. 183; el sobrante de Rosa, p. 185; el faltante, pp. 185-186. Todo construido salvo el fondo de 500.000 de Rosa (dato de A2).
