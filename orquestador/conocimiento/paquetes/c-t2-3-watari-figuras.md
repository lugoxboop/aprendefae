# Figuras de T2 en secuencia · lote T2-3 · Watari → L

Delta sobre `c-t2-2-watari-figuras.md`. Base: patrón `prompts/aprender-secuencia-v1.md` (#470) y `c-t2-2-near-lote.md` §1-§2. Maquetas en el artefacto «Figuras de T2 en secuencia».

## Qué cambió por #470

- **Tipos de pantalla.** Mis cuatro tipos pasan a los de #470. «Lectura» y «exploración» son Míralo: el estudiante elige qué ver, y la figura no corre sola con «Siguiente». «Decisión» es Haz. «Predicción» es Haz sin calificar: vale cualquier respuesta, no lleva pastilla y la figura muestra la verdad. Cada [lee] de Near que va en medio de la pieza queda como Míralo, y su texto no cambia.
- **Pantalla 0.** El objetivo de Near es el titular de la Apertura. Ahí la figura se arma sola una vez, sin respuesta a la vista.
- **Error en Aprender (D3 de #470 con la regla C4).** La opción mala se dibuja tentativa, punteada y en coral, y el modelo no cambia: la figura no guarda un estado falso. Su frase de consecuencia va en la zona del mensaje, encima de la pista. Al segundo error, la figura pasa al estado correcto, con su porqué y borde blanco, y «Siguiente» se libera. Nada rebota. Near v2 todavía dice «rebota» o «se inclina» en P1·5, P4·5 y P5·5; manda lo que aceptaste en T2-2.
- **Reserva de figura.** Cada pieza tiene un solo alto de figura, el de su pantalla más alta, por debajo del tope de 220 px a 320. Para lograrlo: la consecuencia escrita salió de la figura y pasó a la zona del mensaje. En P5·6 queda solo el renglón de Bancos sobre su T. En P3·7 la mesa va en una línea.
- **Controles de la figura.** Ahora son neutros, con contorno de 1 px y 44 px de alto: «Sumar», «Registrar», «Ver el mayor» y las opciones. Teal queda solo para DEBE y para el «Siguiente» de la cáscara (BOTON_NAV), así no hay dos botones primarios.
- **Opciones.** El botón elegido lleva su ícono (✕ o ✓). La pastilla va dentro del botón cuando las opciones están apiladas, y en una línea debajo del grupo cuando van en columnas de 80 px, para que no se desborde.
- **Cierre.** El Cierre no exige ninguna acción. La pregunta de cierre de Near va como titular, y «Siguiente» da el paso que muestra la frase (en P1, además, el saldo de $20 cae en el debe). En P3 las opciones a, b y c pasan a un Haz antes del Cierre (P3 queda en 9 pantallas), porque #470 no admite una acción obligatoria en el Cierre.

## 1. De qué está hecha una cuenta · `cu-a1-anatomia-de-una-cuenta` · 8 pantallas

**Objeto propio:** El saldo que cae del lado mayor. **Reserva de figura:** 213 px a 320 (tope 220) · 213 px a 375 (tope 319).

| Pant. | Near v2 | Titular | Tipo (#470) | Figura | Estados |
|---|---|---|---|---|---|
| 0 | P1·0 [lee] | Objetivo | Apertura | La T sin raya y las tres fichas entran escalonadas, una vez. Sin respuesta a la vista. | llega |
| 1 | P1·1 [decide] | ¿De qué lado? | Haz (predicción, no se califica) | Los dos lados de la T son los botones «Izquierda» y «Derecha». Lo que entra cae del lado tocado y lo que sale, del otro. Cualquier lado vale, así que no lleva pastilla: la pantalla 3 pone los nombres. | antes · izq · der |
| 2 | P1·2 [lee] | Qué es una cuenta | Míralo | Toca una ficha y se marca como «aumento» (lo que entra) o «disminución» (lo que sale). Es lo que dice la definición del libro. | antes · toca |
| 3 | P1·3 [lee] | Debe y haber | Míralo | La raya baja y parte la cuenta. Al tocar cada lado aparece su nombre, «DEBE» en teal y «HABER» en ámbar. | antes · despues |
| 4 | P1·4 [toca] | Movimientos | Míralo | «Sumar» es un control de la figura, neutro y de 44 px. Cada total cuenta hacia arriba con useNumeroQueSube. | antes · despues |
| 5 | P1·5 [decide] | El saldo | Haz | Los dos lados son los botones. Si toca el haber, el saldo se dibuja allí punteado y en coral, y la T sigue igual. Al segundo error, el saldo cae en el debe, que queda con borde blanco. | antes · error1 · error2 · bien |
| 6 | P1·6 [decide] | Debe no es subir | Haz | La T de Cuentas por pagar de Lavado, con saldo de $4.000 (ene-08 y ene-12) y el pago de $250 en el debe. «Sube» y «Baja» son botones. «Sube» dibuja $4.250 punteado y en coral; la T no cambia. «Baja» deja el saldo en $3.750. | antes · error1 · error2 · bien |
| 7 | cierre cierre | Una cuenta tiene $50 en el debe y $30 en el haber. ¿Cuánto es el saldo y de qué lado va? | Cierre | La pregunta de cierre va como titular. «Siguiente» da un paso: el saldo de $20 cae en el debe y entra la frase de Near. Después, un pulso de escala de 1 a 1,03 y de vuelta a 1. | antes · paso |

## 2. Las dos familias de cuentas · `cu-a2-dos-familias` · 9 pantallas

**Objeto propio:** Los cajones que se vacían el 31 de diciembre. **Reserva de figura:** 183 px a 320 (tope 220) · 183 px a 375 (tope 319).

| Pant. | Near v2 | Titular | Tipo (#470) | Figura | Estados |
|---|---|---|---|---|---|
| 0 | P2·0 [lee] | Objetivo | Apertura | Dos cajones llenos y el calendario el 31 de diciembre. | llega |
| 1 | P2·1 [decide] | El día después | Haz (predicción, no se califica) | Los dos cajones son los botones. Al tocar uno, se marca como «Tu elección», el calendario pasa al 1 de enero y cada cajón hace lo que hace. No lleva pastilla. | antes · despues |
| 2 | P2·2 [lee] | Las reales | Míralo | Toca cada cajón real y cruza al año nuevo con su contenido (translateX). | antes · despues |
| 3 | P2·3 [lee] | Las nominales | Míralo | Toca Ingresos por servicios y su contenido sale del cajón (opacity y translateY), que queda en $0. | antes · despues |
| 4 | P2·4 [decide] | ¿Gasto o costo? | Haz | Los cajones «Gastos» y «Costos» son los botones. Si cae mal, la ficha queda punteada y en coral en el cajón de Gastos. | antes · error1 · error2 · bien |
| 5 | P2·5 [toca] | Tres nominales | Míralo | Los tres cajones nominales están cerrados. Al tocar uno, se abre (translateY) y muestra la definición textual y su ejemplo. Solo hay uno abierto a la vez. | antes · abierto |
| 6 | P2·6 [decide] | ¿Se cierra igual? | Haz | El cajón de Gastos de operación va lleno. «Sí, se cierra» y «No, sigue abierta» son botones. «No» lo dibuja lleno el 1 de enero, punteado y en coral; el cajón real no cambia. | antes · error1 · error2 · bien |
| 7 | P2·7 [toca] | Una sola pregunta | Haz | Las seis cuentas entran de a una, como ficha. Los cajones grandes «Sigue» y «Vuelve a cero» son los botones, y la cuenta queda escrita dentro del que se toca. Lleva la escalera por cuenta. | antes · error1 · error2 · bien |
| 8 | cierre cierre | Salarios por pagar y el gasto en salarios hablan de lo mismo. ¿Por qué el primero es real y el segundo, nominal? | Cierre | La frase de cierre de Near queda pegada a dos cajones: Salarios por pagar, lleno el 1 de enero, y el gasto en salarios, en $0. | llega |

## 3. El debe y el haber · `cu-a5-debe-y-haber` · 9 pantallas

**Objeto propio:** La mesa de dos casos. **Reserva de figura:** 214 px a 320 (tope 220) · 177 px a 375 (tope 319).

| Pant. | Near v2 | Titular | Tipo (#470) | Figura | Estados |
|---|---|---|---|---|---|
| 0 | P3·0 [lee] | Objetivo | Apertura | La mesa con los dos casos y su registro de $50.000 en el debe. | llega |
| 1 | P3·1 [decide] | Mismo lado, mismo monto | Haz (predicción, no se califica) | «Sí, igual» y «No, distinto» son botones. La elección queda marcada, sin pastilla, y la pantalla 2 la pone a prueba. | antes · elegido |
| 2 | P3·2 [lee] | Efectos opuestos | Míralo | «Registrar» es un control de la figura. Los saldos cuentan hacia su valor nuevo: uno sube (▲) y el otro baja (▼). | antes · despues |
| 3 | P3·3 [toca] | Dónde vive cada cuenta | Haz | Las dos casas de la ecuación son los botones. La cuenta que cae en la casa equivocada queda punteada y en coral, con la regla de esa casa. | antes · error1 · error2 · bien |
| 4 | P3·4 [decide] | La trampa | Haz | La mesa muestra Caja y Documentos por pagar (cu6-pagaré, p. 89). «Sí, ganó $500» pone un ingreso punteado y en coral, y el modelo no cambia. «No, nació una deuda» sube los dos saldos. | antes · error1 · error2 · bien |
| 5 | P3·5 [toca] | Gastos e ingresos | Míralo | Se suelta una ficha de $100 en Gastos de operación (debe) y otra en Ingresos por servicios (haber). Debajo, el medidor del patrimonio baja con una y sube con la otra. | antes · despues |
| 6 | P3·6 [toca] | Prueba tú | Míralo | Cuatro saldos en cifras que se mueven en vivo, sin barras: $100 frente a $400.000 no se vería. No califica. | antes |
| 7 | cierre cierre (opciones) | Los dos registros eran de $50.000 en el debe. ¿Por qué Maquinaria subió y Aportes sociales bajó? | Haz | La pregunta de cierre de Near, con sus tres opciones a, b y c, va como Haz antes del Cierre: #470 no deja una acción obligatoria en el Cierre. Arriba queda la mesa en una línea, con los dos saldos finales. | antes · error1 · bien |
| 8 | cierre cierre (frase) | Los dos registros eran de $50.000 en el debe. ¿Por qué Maquinaria subió y Aportes sociales bajó? | Cierre | La respuesta de Near queda pegada a la mesa final. | llega |

## 4. La partida doble y las dos reglas · `cu-a3-partida-doble` · 10 pantallas

**Objeto propio:** La balanza de totales con nombres. **Reserva de figura:** 212 px a 320 (tope 220) · 208 px a 375 (tope 319).

| Pant. | Near v2 | Titular | Tipo (#470) | Figura | Estados |
|---|---|---|---|---|---|
| 0 | P4·0 [lee] | Objetivo | Apertura | La balanza vacía y nivelada, A / P + Pt. | llega |
| 1 | P4·1 [decide] | Una sola línea | Haz (predicción, no se califica) | Después de elegir, Equipo de computación entra al platillo del activo con su cifra y la balanza se inclina. Es el estado verdadero de esa sola línea. | antes · elegido |
| 2 | P4·2 [lee] | Partida doble | Míralo | Al tocar la regla, aparece junto a la balanza la segunda línea, Cuentas por pagar $25.000, todavía fuera de los platillos. | antes · despues |
| 3 | P4·3 [toca] | La balanza | Haz | Los platillos son los botones. Si Cuentas por pagar cae en el del activo, queda punteada y en coral, la balanza no cambia y se escribe la consecuencia. | antes · error1 · error2 · bien |
| 4 | P4·4 [lee] | Primera regla | Míralo | Los platillos pasan a ser grupos. Al tocar Activos, Gastos y Costos, cada uno entra a «Crece por el debe». | antes · despues |
| 5 | P4·5 [toca] | Segunda regla | Haz | Pasivos, Patrimonio e Ingresos entran de a una y los grupos son los botones. La que cae mal queda punteada y en coral en el grupo elegido. No rebota: lo acordamos en T2-2. | antes · error1 · error2 · bien |
| 6 | P4·6 [decide] | Un pago, dos bajas | Haz | La balanza con Bancos (activo, $2.250 antes del 30 de enero) y Hipoteca por pagar ($8.000). «Bajan las dos» baja los dos platillos $400 y la balanza sigue nivelada. Cada opción mala dibuja su cifra punteada y en coral. | antes · error1 · error2 · bien |
| 7 | P4·7 [lee] | Simple o compuesto | Míralo | Un selector «Simple / Compuesto», que no califica. Simple es ene-30: un nombre por platillo. Compuesto es ene-03: dos por platillo, $10.000 contra $10.000. La balanza sigue nivelada en los dos. | simple · compuesto |
| 8 | P4·8 [decide] | ¿Muchas cuentas descuadran? | Haz | ene-03 en la balanza, con los contadores de cada lado en «$?». «No lo descuadra» hace contar los dos totales hasta $10.000. «Sí» escribe la consecuencia punteada y en coral, y la balanza sigue nivelada porque es la verdad. | antes · error1 · error2 · bien |
| 9 | cierre cierre | ¿Por qué un asiento con tres cuentas puede cuadrar igual que uno con dos? | Cierre | La frase de cierre pegada a la balanza de ene-03, nivelada y con sus totales. | llega |

## 5. Del diario al mayor · `cu-a4-diario-y-mayor` · 8 pantallas

**Objeto propio:** El renglón que viaja del diario a su T. **Reserva de figura:** 218 px a 320 (tope 220) · 218 px a 375 (tope 319).

| Pant. | Near v2 | Titular | Tipo (#470) | Figura | Estados |
|---|---|---|---|---|---|
| 0 | P5·0 [lee] | Objetivo | Apertura | El asiento del 3 de enero se escribe solo, renglón a renglón, una vez. | llega |
| 1 | P5·1 [decide] | ¿Por fecha o por cuenta? | Haz (predicción, no se califica) | Con «Verlos por fecha», los nueve hechos van en orden y los movimientos de Bancos quedan repartidos y marcados. Con «Verlos por cuenta», se juntan en la T de Bancos. No lleva pastilla: la pantalla 6 lo pregunta. | fecha · cuenta |
| 2 | P5·2 [lee] | El diario | Míralo | Al tocar un renglón se nombran sus columnas: fecha, detalle, debe y haber. | antes · despues |
| 3 | P5·3 [toca] | Cómo se escribe | Míralo | Al tocar el asiento del 1 de julio, la cuenta del haber se corre a la derecha (translateX) y aparece la explicación corta. | antes · despues |
| 4 | P5·4 [lee] | El mayor | Míralo | «Ver el mayor» es un control de la figura. Aparecen las cuatro T vacías de las cuentas del 3 de enero, dos por fila. | antes · despues |
| 5 | P5·5 [toca] | Mayorizar | Haz | Viaja un renglón por vez, como ficha. Los lados de las cuatro T son los destinos. Si cae del lado contrario, queda punteado y en coral, y la T no lo guarda (en vez del rebote de Near). Al segundo error, el valor viaja a su lado y ese lado queda con borde blanco. | antes · error1 · error2 · bien |
| 6 | P5·6 [decide] | Dos preguntas | Haz | El renglón de Bancos del diario arriba y, debajo, su T: uno encima del otro. Con el acierto, ene-03 se enciende en los dos. «¿Qué pasó en cada fecha?» dibuja el mayor en orden de fecha, punteado y en coral: sería otro diario. | antes · error1 · error2 · bien |
| 7 | cierre cierre | ¿En cuál de los dos libros se registra primero un hecho, y por qué? | Cierre | La frase de cierre pegada al diario de ene-03 con el renglón de Bancos encendido. | llega |

## Delta de las tres Hacer

- **Cuadra por valor.** Con el nombre más largo del banco, «Flota y equipo de transporte» (K3 y E1), la tabla parte el nombre en dos líneas y no se desborda. Con las cifras de millones de K1 ($1.500.000 y $2.250.000), la tabla se desbordaba a 320 px. Lo arreglé con table-layout: fixed y columnas de cifras de 6,3 em; el nombre se parte. Medido: 0 desbordes en 20 estados. E8 de Near (las columnas se dibujan después de la decisión en juzgar y encontrar) es compatible con la forma.
- **Del diario al mayor.** Los casos A y B de Near traen 4 cuentas y 5 renglones cada uno, dentro del tope de 4 y 7. Con «Flota y equipo de transporte», el renglón del diario se partía en cuatro líneas. Ahora el nombre de la cuenta va en su propia línea y debajo van el lado y el monto. En las T, la fecha va encima del monto. Medido: 0 desbordes.
- **Las que vuelven a cero.** «Seguros pagados por anticipado» y «Gastos de administración y ventas» caben a 320 px: el nombre se parte en dos líneas y la cifra baja, sin desbordar. Si Mello deja «Gastos pagados por anticipado», mide igual.
- **Cierre anual.** Los rótulos pasan a «31 de diciembre de 20X1 · antes del cierre» y «1 de enero de 20X2 · después del cierre». La opción dice «Pasa al año siguiente con su saldo» y la suma, «= Utilidad del año». La cejilla lleva «Escenario simulado».

### Código del delta (para Misa)

```css
/* Cuadra por valor: la tabla no se desborda con cifras de millones */
.asiento { table-layout: fixed; }
.asiento td:nth-child(2), .asiento td:nth-child(3) { width: 6.3em; }
.asiento td:first-child { overflow-wrap: anywhere; }
/* Del diario al mayor: la cuenta en su línea; el lado y el monto debajo */
.ren2 { grid-template-columns: 3.4em minmax(0,1fr) auto; grid-template-areas: "f c c" "f l m"; }
```

- Las que vuelven a cero, textos: «31 de diciembre de 20X1 · antes del cierre», «1 de enero de 20X2 · después del cierre», «Pasa al año siguiente con su saldo», «= Utilidad del año» y la cejilla «Escenario simulado».

## Medido

- Aprender: 212 estados de figura a 258 y 313 px. Letra mínima 12 px · botones de menos de 44 px: 0 · fuera de caja: 0 · reserva por pieza ≤ 220 a 320.
- Hacer: 40 estados. Letra mínima 12 px · botones de menos de 44 px: 0 · fuera de caja: 0.
