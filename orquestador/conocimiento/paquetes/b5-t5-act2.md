# PAQUETE · T5 · HACER b5-t5-a2 «El cierre completo de Santa Pacha» · Célula B

Guardado por Kaede (construcción) el 14 de octubre de 2026, tal como llegó de Sakuta. Las pruebas leen los textos de este archivo y los comparan con lo que se pinta.

**Precedencia de textos (Sakuta), de mayor a menor:**

1. La entrega más reciente de Futaba: rótulos e instrucciones de las partes, textos del diario y devoluciones vigentes. Tiene PASA de Shoko.
2. Las devoluciones ajustadas (Futaba, PASA).
3. El contenido adaptado a la mecánica (Futaba): enunciados, tutorial, estante, encabezado y texto alternativo.
4. La guía v1 de Mai, solo para el diseño. Sus devoluciones de la §4.4 están VIEJAS y no se usan.

**Decisiones de Sakuta:**

- Dificultad «dificil», 50 FP.
- Cabecera del diario «LIBRO DIARIO», no «ASIENTOS ANOTADOS». El término está publicado en el desafío del Tema 2, «El Libro Diario».
- Adaptación de la mecánica: un solo caso con 4 partes, contador «Asiento», «Siguiente asiento» / «Ver mi resumen». El tutorial es la compra del 1 de mayo, ya resuelta.

**Decisiones de Kaede (anotadas en el PR):**

1. **Variante del diario: la 1.** Sakuta pidió un componente propio de la célula. Ese componente avisa hacia fuera cada parte comprobada (`onParteComprobada`), así que la regla de Mai da la variante 1. El diario suma el asiento correcto de cada parte comprobada, acierte o falle el estudiante. El componente del Tema 3 no se toca.
2. **Lugar del diario:** entre el encabezado («¿Cómo se juega?») y el contador, donde lo puso Mai en su réplica.
3. **Cuándo va la C7.** Con todas las cuentas en su lado y algún valor mal, va la B · C7 si Inversiones – títulos no lleva su costo, y la B «otro valor» si Inversiones – títulos está bien. Así quedan los dos caminos de Sakuta:
   - cuadrar sin la ganancia (Inversiones – títulos por lo recibido) → falta una cuenta → A, que explica la diferencia;
   - poner la ganancia, con Inversiones – títulos por lo recibido → B · C7.

---

## 1 · Inicial

| Elemento | Texto literal |
|---|---|
| objetivo | «Registrar la inversión de Santa Pacha: sus intereses y sus dos ventas.» |
| consigna | «Lee el hecho. Arma el asiento con las cuentas del estante.» |
| regla1 | «Lee el hecho y pon en la mesa las cuentas que mueve.» |
| regla2 | «Ponlas en el Debe o en el Haber y escribe cada valor.» |
| regla3 | «Confirma cuando los dos totales den igual: tienes un solo intento.» |
| alt | «Actividad de registro. Hay cuatro hechos de la inversión de Santa Pacha. En cada uno, pon en la mesa las cuentas que mueve, ubícalas en el Debe o en el Haber y escribe cada valor. Abajo se ven los dos totales y la diferencia. Tienes un solo intento por asiento.» |
| resumen | «Bien a la primera: {bien} de {total}» |

Contador: «Asiento». Navegación: «Siguiente asiento» · «Ver mi resumen». Reinicio: «Otra vez».

## 2 · El estante (solo nombres)

| Cuenta |
|---|
| «Caja» |
| «Bancos» |
| «Inversiones – títulos» |
| «Ingresos por intereses» |
| «Ingresos financieros – ganancia en venta de títulos» |
| «Gastos financieros – pérdida en venta de títulos» |

## 3 · Las cuatro partes

### 3.1 Rótulo e instrucción (Futaba, entrega más reciente)

| Parte | Rótulo | Instrucción literal | Fuente |
|---|---|---|---|
| p1 | «Asiento 1» | «Registra el interés que llega el 1 de agosto.» | p. 194 |
| p2 | «Asiento 2» | «Registra la venta del 1 de agosto.» | pp. 194-195 |
| p3 | «Asiento 3» | «Registra el interés que llega el 1 de noviembre.» | p. 195 |
| p4 | «Asiento 4» | «Registra la venta del 1 de noviembre.» | p. 195 |

### 3.2 Enunciados (contenido adaptado)

| Parte | Enunciado literal |
|---|---|
| p1 | «1 de agosto. Santa Pacha tiene títulos por $2.000.000. Pagan un interés del 24 % al año, al terminar cada trimestre. Hoy llega a Caja el interés del primer trimestre.» |
| p2 | «1 de agosto. Santa Pacha vende 1.875 títulos, el 75 %. Cada uno le había costado $800. Los vende a $920, sin el interés. Recibe $1.725.000 en Caja.» |
| p3 | «1 de noviembre. Ya solo hay 625 títulos de $800, que suman $500.000. Llega a Caja el interés de este trimestre, al 24 % anual.» |
| p4 | «1 de noviembre. Santa Pacha vende los 625 títulos que quedan. Cada uno le había costado $800. Los vende a $750 y recibe $468.750 en Caja.» |

### 3.3 Devoluciones vigentes (Futaba, entrega más reciente; prioridad D > C > A > B)

| Parte | Tipo | Texto literal |
|---|---|---|
| p1 | D | «Este hecho solo mueve Caja e Ingresos por intereses. El interés es un ingreso: no cambia la inversión.» |
| p1 | C | «Están al revés. El interés entra a Caja, que sube: va al Debe. El ingreso va al Haber.» |
| p1 | A | «Falta una cuenta. El interés entra a Caja y, a la vez, es un ingreso.» |
| p1 | B | «Revisa el valor. El interés se calcula sobre $2.000.000, al 24 % al año, por un solo trimestre.» |
| p2 | D | «Sobra una cuenta. Esta venta solo mueve Caja, Inversiones – títulos y la ganancia. No hay pérdida, porque vendió por más de lo que costaron. Y aquí no entran Bancos ni el interés.» |
| p2 | C | «Hay cuentas al revés. Caja sube y va al Debe. Inversiones – títulos baja y la ganancia es un ingreso: los dos van al Haber.» |
| p2 | A | «Falta una cuenta. Esta venta mueve tres: Caja, Inversiones – títulos y la ganancia. Inversiones – títulos se acredita por lo que costaron los títulos, no por lo que se recibió. Por eso queda una diferencia, y esa diferencia es la ganancia.» |
| p2 | C7 | «Inversiones – títulos no se acredita por lo que se recibió. En el ejemplo del libro, se acredita por lo que costaron: 1.875 × $800 = $1.500.000. La diferencia, $225.000, es la ganancia.» |
| p2 | B | «Revisa los valores. Compara lo que recibió con lo que costaron los títulos.» |
| p3 | D | «Este hecho solo mueve Caja e Ingresos por intereses. Es igual que en agosto.» |
| p3 | C | «Están al revés. Como en agosto, Caja va al Debe y el ingreso va al Haber.» |
| p3 | A | «Falta una cuenta. El interés entra a Caja y, a la vez, es un ingreso.» |
| p3 | B | «Revisa el valor. El interés se calcula sobre los títulos que quedan, al 24 % al año, por un solo trimestre.» |
| p4 | D | «Sobra una cuenta. Esta venta solo mueve Caja, Inversiones – títulos y la pérdida. No hay ganancia, porque vendió por menos de lo que costaron. Y aquí no entran Bancos ni el interés, que se anota aparte.» |
| p4 | C | «Hay cuentas al revés. La pérdida va al Debe, junto a Caja. Inversiones – títulos baja y va al Haber.» |
| p4 | A | «Falta una cuenta. Esta venta mueve tres: Caja, Inversiones – títulos y la pérdida. Inversiones – títulos se acredita por lo que costaron los títulos, no por lo que se recibió. Por eso queda una diferencia, y esa diferencia es la pérdida.» |
| p4 | C7 | «Inversiones – títulos no se acredita por lo que se recibió. En el ejemplo del libro, se acredita por lo que costaron: 625 × $800 = $500.000. La diferencia, $31.250, es la pérdida.» |
| p4 | B | «Revisa los valores. Compara lo que recibió con lo que costaron los títulos.» |

Al acertar no hay texto: la marca junto al rótulo, y el lector de pantalla dice «Correcto.». Tras el error se revela el asiento correcto.

## 4 · El libro diario

| Elemento | Texto |
|---|---|
| cabecera | «LIBRO DIARIO» |
| cuenta | «1 asiento» · «{N} asientos» |
| boton | «Ver» · «Ocultar» |
| columnas | «DEBE» · «HABER» |

Asientos del diario. Los nombres del Haber llevan sangría.

| # | Fecha | Debe | Haber | Fuente |
|---|---|---|---|---|
| 0 | 1 de mayo | Inversiones – títulos $2.000.000 | Bancos $2.000.000 | p. 194 |
| 1 | 1 de agosto | Caja $120.000 | Ingresos por intereses $120.000 | p. 194 |
| 2 | 1 de agosto | Caja $1.725.000 | Inversiones – títulos $1.500.000 · Ingresos financieros – ganancia en venta de títulos $225.000 | pp. 194-195 |
| 3 | 1 de noviembre | Caja $30.000 | Ingresos por intereses $30.000 | p. 195 |
| 4 | 1 de noviembre | Caja $468.750 · Gastos financieros – pérdida en venta de títulos $31.250 | Inversiones – títulos $500.000 | p. 195 |

## 5 · Tutorial («Así se juega»): la compra del 1 de mayo, ya resuelta (p. 194)

| Elemento | Texto literal |
|---|---|
| enunciado | «1 de mayo. Santa Pacha tiene efectivo de sobra por un tiempo. Compra 2.500 títulos a $800 cada uno. Paga con Bancos.» |
| linea1 | «Inversiones – títulos sube y va al Debe.» |
| linea2 | «Son 2.500 × $800 = $2.000.000.» |
| linea3 | «Bancos baja: va al Haber por el mismo valor.» |
| linea4 | «El Debe y el Haber suman igual: el asiento cuadra.» |
| alt-tutorial | «Ejemplo resuelto. El 1 de mayo, Santa Pacha compra 2.500 títulos a $800 cada uno y paga con Bancos. El asiento tiene Inversiones – títulos en el Debe por $2.000.000 y Bancos en el Haber por $2.000.000. Los dos totales dan $2.000.000.» |

## 6 · Cifras del ejemplo de las pp. 194-195

Lista armada con las fuentes que da Futaba para cada asiento y cada enunciado. No es una lectura del libro hecha por Kaede. Ninguna cifra que se pinte puede salir de esta lista.

| Cifra | Qué es | Fuente (Futaba) |
|---|---|---|
| 1 | el día de cada fecha (1 de mayo, de agosto, de noviembre) | pp. 194-195 |
| 2.000.000 | costo de la compra | p. 194 |
| 2.500 | títulos comprados | p. 194 |
| 800 | costo de cada título | p. 194 |
| 24 | interés anual, en % | p. 194 |
| 120.000 | interés del primer trimestre | p. 194 |
| 1.875 | títulos vendidos el 1 de agosto | pp. 194-195 |
| 75 | parte vendida, en % | pp. 194-195 |
| 920 | precio de venta de cada título | pp. 194-195 |
| 1.725.000 | lo recibido en la primera venta | pp. 194-195 |
| 1.500.000 | costo de lo vendido el 1 de agosto | pp. 194-195 |
| 225.000 | ganancia | pp. 194-195 |
| 625 | títulos que quedan | p. 195 |
| 500.000 | costo de los que quedan | p. 195 |
| 30.000 | interés del segundo trimestre | p. 195 |
| 750 | precio de venta del 1 de noviembre | p. 195 |
| 468.750 | lo recibido en la segunda venta | p. 195 |
| 31.250 | pérdida | p. 195 |


## (1) Futaba · entrega 1 de calidad: razones por cuenta (versión final, con PASA de Shoko; pegada tal cual)

Cada razón va detrás de la plantilla «Sobra X.» o «No va X: en su lugar va Y.». El estudiante ve solo la razón de la cuenta que puso. Reemplaza la cola genérica del texto D (Sakuta).

Parte	Cuenta	Razón
Asiento 1	Bancos	En el ejemplo, el interés entra a Caja. Bancos solo se movió el día de la compra.
Asiento 1	Inversiones – títulos	Cobrar el interés no cambia la inversión: los títulos siguen siendo los mismos.
Asiento 1	Ganancia	Aquí no se vende ningún título, así que no hay ganancia.
Asiento 1	Pérdida	Aquí no se vende ningún título, así que no hay pérdida.
Asiento 2	Bancos	En el ejemplo, lo de la venta entra a Caja. Bancos solo se movió el día de la compra.
Asiento 2	Ingresos por intereses	El precio de $920 no incluye el interés. El interés se anota en su propio asiento.
Asiento 2	Pérdida	Vendió a $920 lo que le costó $800: hay ganancia, no pérdida.
Asiento 3	Bancos	Como en agosto, el interés llega a Caja.
Asiento 3	Inversiones – títulos	Cobrar el interés no cambia la inversión: siguen los mismos 625 títulos.
Asiento 3	Ganancia	Este asiento es solo el interés. La venta de noviembre va en el asiento 4.
Asiento 3	Pérdida	Este asiento es solo el interés. La pérdida es de la venta, que va en el asiento 4.
Asiento 4	Bancos	Como en agosto, lo de la venta entra a Caja.
Asiento 4	Ingresos por intereses	El interés de noviembre ya se anotó en el asiento 3. Esta venta va aparte.
Asiento 4	Ganancia	Vendió a $750 lo que le costó $800: hay pérdida, no ganancia.

b5-t5-a2 · C7 en dos ramas

C7-recibido (sin cambio): sale cuando Inversiones – títulos lleva lo recibido, $1.725.000 en el asiento 2 o $468.750 en el asiento 4.
C7-otro: sale con cualquier otro valor que no sea el costo.
Asiento 2	C7-otro	Inversiones – títulos baja por lo que costaron los títulos que vendió. Son 1.875 × $800 = $1.500.000. Lo demás que recibió es la ganancia.
Asiento 4	C7-otro	Inversiones – títulos baja por lo que costaron los títulos que vendió. Son 625 × $800 = $500.000. Lo que le faltó para llegar a ese costo es la pérdida.

## (2) Lote 6a · E3: la B general de las ventas nombra la cuenta (Futaba, con la corrección de Shoko)

Manda sobre la B de las partes 2 y 4 de la §3.3 («Revisa los valores. Compara lo que recibió con lo que costaron los títulos.»).

- Un valor errado: «Revisa el valor de {X}.» y la segunda frase de {X}.
- Dos o más: «Revisa los valores de {X} y {Y}.» y la segunda frase de {X}. Va «e» delante del sonido i. Las cuentas se nombran en el orden del asiento.
- Si la errada es Inversiones – títulos, manda antes la C7. Por eso la B solo nombra Caja, la ganancia o la pérdida.

| Cuenta | Segunda frase |
|---|---|
| Caja | «Caja recibe lo que le pagaron por la venta. Míralo en el hecho.» |
| Ingresos financieros – ganancia en venta de títulos | «La ganancia es la diferencia entre lo que recibió y lo que costaron los títulos.» |
| Gastos financieros – pérdida en venta de títulos | «La pérdida es la diferencia entre lo que costaron los títulos y lo que recibió.» |

## (3) Lote 6d-textos · las devoluciones nombran el error probable (Futaba, 16-oct; pegado tal cual)

Manda sobre la §3.3 y la (2). La C y la A de los datos son solo el porqué: la primera frase la arma la mesa con las cuentas que puso el estudiante, en el orden del asiento: «Pusiste {X} en el Debe.» / «Pusiste {X} en el Haber.» (el lado donde la puso), o «Pusiste {X} y {Y} en el lado contrario.»; «Falta {Y}.» / «Faltan {Y} y {Z}.». La cabeza de la B que nombra cuentas (E3) pasa a «No cuadra el valor de {X}.» / «No cuadran los valores de {X} y {Y}.». Las B específicas nuevas solo se activan con ese valor exacto.

| Parte | Tipo | Texto literal |
|---|---|---|
| p1 | C | «El interés entra a Caja, que sube. Y es un ingreso, que sube por el Haber.» |
| p1 | A | «El interés entra a Caja y, a la vez, es un ingreso.» |
| p1 | B | «Ese no es el interés de un trimestre sobre $2.000.000 al 24 % al año. Haz la cuenta por tres meses.» |
| p1 | B-anual | «Pusiste el interés de todo el año. Aquí llega solo el de un trimestre: tres de los doce meses.» |
| p1 | B-mes | «Pusiste el interés de un solo mes. Aquí llega el de un trimestre: tres meses.» |
| p2 | C | «Caja sube porque recibe lo de la venta. Inversiones – títulos baja porque salen títulos, y la ganancia es un ingreso.» |
| p2 | A | «Inversiones – títulos baja por lo que costaron. Lo que recibió de más va a la ganancia.» |
| p2 | B | «Algún valor no cuadra con el hecho: lo recibido, el costo o la diferencia.» |
| p3 | C | «Como en agosto: Caja recibe el interés, que es un ingreso.» |
| p3 | A | «El interés entra a Caja y, a la vez, es un ingreso.» |
| p3 | B | «Ese no es el interés de un trimestre sobre los $500.000 que quedan. Haz la cuenta por tres meses.» |
| p3 | B-sin-vender | «Calculaste sobre $2.000.000, pero ya vendió el 75 %. El interés de noviembre es sobre los $500.000 que quedan.» |
| p4 | C | «Caja sube con lo que recibe. La pérdida es un gasto, y la inversión baja porque salen títulos.» |
| p4 | A | «Inversiones – títulos se acredita por lo que costaron; lo que faltó para llegar a ese costo va a la pérdida.» |
| p4 | B | «Algún valor no cuadra con el hecho: lo recibido, el costo o la diferencia.» |

Valores que activan las B específicas: B-anual, $480.000 (p1); B-mes, $40.000 (p1); B-sin-vender, $120.000 (p3).

Segundas frases de la B de las ventas (mandan sobre la tabla de la (2)):

| Cuenta | Segunda frase |
|---|---|
| Caja | «A Caja entra lo que le pagaron por la venta, no lo que costaron los títulos.» |
| Ingresos financieros – ganancia en venta de títulos | «La ganancia no es todo lo recibido: es lo que sobra después de restar lo que costaron los títulos.» |
| Gastos financieros – pérdida en venta de títulos | «La pérdida no es todo el costo: es lo que le faltó a lo recibido para llegar a él.» |
