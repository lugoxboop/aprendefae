# PAQUETE · T6 · HACER b5-t6-a1 «¿Clientes o otra cuenta por cobrar?» · Célula B

Guardado por Kaede (construcción) el 14 de octubre de 2026, tal como llegó de Sakuta. El contenido es de Futaba, con el PASA de Shoko y sus correcciones. Las pruebas leen los textos de este archivo y los comparan con lo que se pinta.

**Diseño:** no hay guía propia de Mai. Por decisión de Sakuta, es el mismo patrón y el mismo diseño de b5-t5-a1 (guía v2 de Mai, en `b5-t5-act1.md`) con estos cambios:

- primer nivel: «Clientes» / «Otra cuenta por cobrar»; segundo nivel, solo con Clientes: «Se debita» / «Se acredita»;
- los rótulos del botón de Futaba, medidos con la tabla de glifos (§5).

**Versión que manda**, cuando hay dos:

1. **Préstamo a un cliente** (corrección obligatoria de Shoko). Futaba eligió agregar la ficha `prestamo-cliente`. El banco pasa a 10 fichas: 4 de otra cuenta por cobrar, 3 que se debitan y 3 que se acreditan.
2. **Devolución B.** Va la versión recomendada, con el nombre completo de la cuenta («Cuentas por cobrar – clientes solo recoge…»). La primera versión decía «Clientes solo recoge…».
3. **Hecho de la devolución.** «Un cliente devuelve mercancía que compró a crédito y aún no paga.», como el hecho 4 de T6 A1.
4. **Segundo fallo.** Se aplica la REGLA ÚNICA de Sakuta para las dos actividades: tras el segundo fallo, en TODA ficha aparece su acierto sin «Sí.» y con «No es esa.» delante. La columna de Futaba (§3.4) sale sola de esa regla, y la prueba lo comprueba.
5. **Lucas y Mladenovic** quedan fuera de esta actividad. La fuente de la C5 es «T6 A1, cierre de la capa 3».

**Decisión de Kaede (orden de las pestañas):** «Otra cuenta por cobrar» arriba y «Clientes» abajo. Es la regla §2.2 de la guía v2 de Mai: la pestaña que abre el panel va al final, para que no empuje a ninguna otra. Si Sakuta o Mai prefieren «Clientes» arriba, el cambio es una línea de datos.

---

## 1 · Campos

- Identificador: b5-t6-a1 · fichas b5-t6-a1-…
- Modalidad: evaluativa · «facil» · 10 FP de base.
- Puntaje: la cuenta pesa 60 % y el lado 40 %. Las fichas de otra cuenta por cobrar no tienen segundo nivel, así que valen entera al acertar la cuenta. El reintento vale la mitad.
- Tanda: las 10 fichas del banco, en orden barajado.

## 2 · Estados

### 2.1 Inicial

| Elemento | Texto literal |
|---|---|
| objetivo | «Decidir si un hecho va en Clientes o en otra cuenta por cobrar, y si se debita o se acredita.» |
| consigna | «Lee el hecho. Elige la cuenta y, si es Clientes, cómo se anota.» |
| regla1 | «Elige si el hecho va en Clientes o en otra cuenta por cobrar.» |
| regla2 | «Si va en Clientes, elige también si se debita o se acredita.» |
| regla3 | «Pulsa el botón para colocar la ficha; si fallas, tienes un intento más.» |

El contador muestra «Ficha», texto fijo del componente.

### 2.2 Colocando

| Elemento | Texto literal |
|---|---|
| nivel1 | «Clientes» · «Otra cuenta por cobrar» |
| nivel2 | «Se debita» · «Se acredita» |
| boton-nada | «Elige una cuenta» |
| boton-falta | «Elige cómo se anota» |
| boton-colocar | «Colocar la ficha» |

### 2.3 Error, acierto y resumen

Error: «La ficha no se colocó.», ❌ y la devolución que corresponda (§3.3). Acierto: ✅ y el acierto de la ficha (§3.2); después, «Siguiente ficha» o «Ver el resultado». Son textos fijos del componente.

| Elemento | Texto literal |
|---|---|
| resumen | «{bien} de {cuantas} completas al primer intento. Cada ficha valía {X} %. Elegir la cuenta pesa 60 %. Elegir si se debita o se acredita pesa 40 %. En las de otra cuenta por cobrar, la primera elección vale toda la ficha.» |
| alt | «Actividad de clasificación. Aparece un hecho. Elige si va en Clientes o en otra cuenta por cobrar. Si eliges Clientes, elige también si se debita o se acredita. Luego pulsa Colocar la ficha. Si fallas, tienes un intento más. Después de cada respuesta se lee la explicación.» |

## 3 · Banco de fichas

### 3.1 Fichas

| Id | Ficha (literal) | Respuesta | Pág. |
|---|---|---|---|
| socio | «La empresa le presta plata a uno de sus socios.» | Otra | 196-197 |
| trabajador | «La empresa le presta plata a uno de sus trabajadores.» | Otra | 196-197 |
| particular | «La empresa le presta plata a un particular.» | Otra | 196-197 |
| prestamo-cliente | «La empresa le presta plata a uno de sus clientes.» | Otra | 196-197 |
| venta-mercancia | «La empresa le vende mercancía a crédito a un cliente.» | Clientes → Se debita | 197 |
| venta-servicio | «La empresa le presta un servicio a crédito a un cliente.» | Clientes → Se debita | 197 |
| cheque | «El banco devuelve el cheque con el que un cliente había pagado.» | Clientes → Se debita | 197 y 191 |
| pago | «Un cliente paga lo que debía.» | Clientes → Se acredita | 197 |
| devolucion | «Un cliente devuelve mercancía que compró a crédito y aún no paga.» | Clientes → Se acredita | 197 · condición, p. 230 |
| descuento | «La empresa le otorga a un cliente un descuento sobre lo que todavía le debe.» | Clientes → Se acredita | 197 · condición, p. 248 |

Construcciones (Futaba): las cuatro fichas de «otra» son préstamos. La p. 196 nombra las cuentas, pero no dice de dónde salen esas deudas. Lo que decide la respuesta sí está en el libro: Clientes recoge las deudas «como consecuencia de ventas de bienes y servicios a crédito» (p. 197). El acierto del préstamo a un cliente no nombra la cuenta, porque la p. 196 solo dice «la que más se ajuste».

### 3.2 ✅ Devoluciones de acierto

| Id | Acierto (literal) |
|---|---|
| socio | «Sí. Es un préstamo, no una venta a crédito. Va en otra cuenta por cobrar: Cuentas por cobrar a socios y accionistas.» |
| trabajador | «Sí. Es un préstamo, no una venta a crédito. Va en otra cuenta por cobrar: Cuentas por cobrar a trabajadores.» |
| particular | «Sí. Es un préstamo, no una venta a crédito. Va en otra cuenta por cobrar: Préstamos a particulares.» |
| prestamo-cliente | «Sí. Es un cliente, pero esto es un préstamo, no una venta a crédito. Por eso no va en Cuentas por cobrar – clientes, sino en otra cuenta por cobrar.» |
| venta-mercancia | «Sí. Sube: se debita. El cliente queda debiendo lo que compró.» |
| venta-servicio | «Sí. Un servicio vendido a crédito también hace subir la deuda: se debita.» |
| cheque | «Sí. Sube: se debita. Ese pago no llegó a la empresa, así que la deuda vuelve.» |
| pago | «Sí. Baja: se acredita. La deuda se cancela.» |
| devolucion | «Sí. Baja: se acredita. Es una devolución de ventas.» |
| descuento | «Sí. Baja: se acredita. Ahora el cliente le debe menos.» |

### 3.3 ❌ Devoluciones de error

Criterio de T1-6: si falla el primer nivel, la devolución puede dar la respuesta; si falla el segundo, orienta sin darla.

| Tipo | Cuándo | Texto literal |
|---|---|---|
| A | Puso un hecho de Clientes en «Otra cuenta por cobrar» | «No es esa. En este hecho cambia lo que un cliente le debe a la empresa. Eso se anota en Cuentas por cobrar – clientes.» |
| B | Puso un préstamo en «Clientes» | «No es esa. Es un préstamo, no una venta a crédito. Cuentas por cobrar – clientes solo recoge lo que deben los clientes por ventas a crédito. Este va en otra cuenta por cobrar.» |
| C | Acertó «Clientes» y falló el lado | «Vas bien: es Clientes. Ahora pregúntate si con este hecho lo que deben los clientes sube o baja. Si sube, se debita. Si baja, se acredita.» |
| C5 | venta-mercancia y venta-servicio, si eligió «Se acredita» (prioridad sobre la C) | «Vas bien: es Clientes. Ojo con la palabra “crédito”: el nombre del negocio no dice en qué lado se anota. Pregúntate si lo que deben los clientes sube o baja.» |

> Auditoría integral (Shoko, 15-oct): en la C5, «crédito» pasa a “crédito”, con las comillas internas de nuestros textos (la regla de T5 · A1).

### 3.4 Tras el segundo fallo (columna de Futaba, literal)

| Id | Segundo fallo |
|---|---|
| socio | «No es esa. Es un préstamo, no una venta a crédito. Va en otra cuenta por cobrar: Cuentas por cobrar a socios y accionistas.» |
| trabajador | «No es esa. Es un préstamo, no una venta a crédito. Va en otra cuenta por cobrar: Cuentas por cobrar a trabajadores.» |
| particular | «No es esa. Es un préstamo, no una venta a crédito. Va en otra cuenta por cobrar: Préstamos a particulares.» |
| prestamo-cliente | «No es esa. Es un cliente, pero esto es un préstamo, no una venta a crédito. Por eso no va en Cuentas por cobrar – clientes, sino en otra cuenta por cobrar.» |
| venta-mercancia | «No es esa. Sube: se debita. El cliente queda debiendo lo que compró.» |
| venta-servicio | «No es esa. Un servicio vendido a crédito también hace subir la deuda: se debita.» |
| cheque | «No es esa. Sube: se debita. Ese pago no llegó a la empresa, así que la deuda vuelve.» |
| pago | «No es esa. Baja: se acredita. La deuda se cancela.» |
| devolucion | «No es esa. Baja: se acredita. Es una devolución de ventas.» |
| descuento | «No es esa. Baja: se acredita. Ahora el cliente le debe menos.» |

Las diez dicen la respuesta completa: la cuenta y, en las de Clientes, el lado.

## 4 · Para Shoko (de Futaba)

- El rótulo «Clientes» en el primer nivel, en la consigna y en las devoluciones B y C es el título del término 2 de T6 A1. La devolución A lo ata al nombre completo de la cuenta.
- Las cuatro fichas de préstamo son CONSTRUCCIÓN.

## 5 · Glifos (Kaede)

Medidos en Chromium (headless shell 141) con Sora 700 real de Google Fonts, el 14-oct-2026: canvas `measureText` por glifo y ancho pintado del rótulo entero.

| Rótulo | Ancho pintado a 14 px | Cabe en 222 (320) |
|---|---|---|
| Elige una cuenta | 117,92 | sí |
| Elige cómo se anota | 143,81 | sí |
| Colocar la ficha | 111,73 | sí |

Glifos nuevos frente a la tabla de b5-t5-a1: «m» 13,76 y «ó» 9,53. Pestaña más larga, a 12,5 px: «Otra cuenta por cobrar», 146,64 px; el hueco de la pestaña a 320 es 258 − 22 de relleno − 4 de borde = 232.


## 6 · Entrega 4 de Futaba (calidad): los cinco hechos de Clientes con otras palabras (PASA de Shoko)

Mandan sobre 3.1, 3.2 y 3.4. «Sin cambio»: el acierto de 3.2 se queda. El segundo fallo sigue la regla única de la célula (el acierto sin «Sí.», con «No es esa.» delante).

### 6.1 Fichas

| Id | Ficha |
|---|---|
| venta-mercancia | «Un cliente se lleva un pedido de mercancía a crédito, para pagarlo a fin de mes.» |
| cheque | «El banco no le paga a la empresa el cheque de un cliente: se lo devuelve.» |
| pago | «Un cliente abona una parte de lo que debe.» |
| devolucion | «Un cliente que todavía debe una compra regresa parte de la mercancía.» |
| descuento | «La empresa le rebaja a un cliente una parte de lo que le debe.» |

### 6.2 Aciertos

| Id | ✅ Acierto |
|---|---|
| venta-mercancia | «Sí. Es una venta a crédito: el cliente queda debiendo, así que se debita.» |
| cheque | «Sí. Sube: se debita. Como el cheque no se cobró, el cliente vuelve a deber.» |
| pago | «Sí. Baja: se acredita. Lo que abonó ya no lo debe.» |
| devolucion | «Sí. Baja: se acredita. Lo que regresó ya no lo tiene que pagar.» |

### 6.3 Tras el segundo fallo

| Id | Texto |
|---|---|
| venta-mercancia | «No es esa. Es una venta a crédito: el cliente queda debiendo, así que se debita.» |
| cheque | «No es esa. Sube: se debita. Como el cheque no se cobró, el cliente vuelve a deber.» |
| pago | «No es esa. Baja: se acredita. Lo que abonó ya no lo debe.» |
| devolucion | «No es esa. Baja: se acredita. Lo que regresó ya no lo tiene que pagar.» |

Para Shoko, el cruce con a4: ninguno de los cinco hechos repite las palabras de qd-03 ni de qd-04. El cheque de a1 lo cuenta el banco; el de a4, el cliente.

## 7 · Lote 6a: las fichas a un nivel (hoja de fusiones de Mai, textos de Futaba, correcciones de Shoko)

Manda sobre lo anterior en lo que toca la interfaz y en las cuatro fichas de préstamo.

### 7.1 Las tres opciones son los tres cajones

- Cajones: «Otra cuenta por cobrar» · «Clientes, se debita» · «Clientes, se acredita». Tocar un cajón coloca la ficha. No hay pestañas ni botón.
- El grupo se lee «Cuenta por cobrar». PARA SHOKO: la hoja pide la etiqueta del grupo de pestañas de hoy, que no tenía nombre.
- Reparto de devoluciones (Futaba): las de préstamo puestas en Clientes dan B; las de Clientes puestas en «Otra» dan A; el lado equivocado da C, y C5 en las dos ventas a crédito puestas en «se acredita».

### 7.2 Los préstamos, cada uno con otra forma

| id | Hecho |
|---|---|
| socio | «Un socio le pide plata prestada a la empresa, y ella se la da.» |
| trabajador | «Un trabajador necesita plata y la empresa se la entrega; él la pagará por cuotas.» |
| particular | «Alguien que no es cliente, socio ni trabajador recibe plata de la empresa. Tiene que devolverla.» |
| prestamo-cliente | «Un cliente le pide plata a la empresa, y ella se la entrega para que la devuelva.» |

La de prestamo-cliente es la corrección de Shoko. Los aciertos no cambian.

### 7.3 Textos

- «¿Cómo se juega?», línea 1 (Futaba): «Lee el hecho y elige dónde va: en otra cuenta por cobrar, o en Clientes, y si se debita o se acredita.»
- «¿Cómo se juega?», línea 2. Adaptada a la hoja de Mai (sin botón), PARA SHOKO: «Toca el cajón donde va la ficha; si fallas, tienes un intento más.»
- Resumen (Futaba): «{bien} de {cuantas} fichas bien al primer intento.»
- Texto alternativo. La corrección de Shoko, con su frase del botón adaptada, PARA SHOKO: «Actividad de clasificación. Aparece un hecho. Elige entre tres opciones: Otra cuenta por cobrar; Clientes, se debita; o Clientes, se acredita. Toca el cajón donde va la ficha. Si fallas, tienes un intento más. Después de cada respuesta se lee la explicación.»
- Se retiran: PESO_CUENTA, PESO_LADO, LADOS, CUENTAS y los rótulos del botón.

### 7.4 La tanda (R10)

Nueve fichas, antes las diez del banco. Entre 2 y 4 por cajón. El banco da 4 · 3 · 3, así que el reparto se sortea con ese tope: 4 · 3 · 2, 4 · 2 · 3 o 3 · 3 · 3.

## 8 · Lote 6b: sale la ficha del cheque devuelto (C4)

Orden de Sakuta: el cheque devuelto se practica cinco veces en B; la ficha «cheque» sale de b5-t6-a1 y se queda donde enseña algo nuevo. Su enunciado y su acierto quedan arriba como registro, sin uso. El banco queda en 4 · 2 · 3 (nueve fichas). Decisión de KAEDE: la tanda pasa de 9 a 8 fichas (porPartida 8), porque con nueve sería siempre el banco entero con el mismo reparto y el estante delataría la última (R10). Los repartos posibles son 4 · 2 · 2 y 3 · 2 · 3. El contador queda «Ficha N de 8».


## 9 · E5: el primer fallo propio de cada ficha (Futaba, fila 11 de Shoko)

Manda sobre 3.3, 7.1 y lo anterior en el primer fallo. Al primer fallo, con cualquier cajón, se lee la PISTA de la ficha: 20 palabras como mucho, no nombra el cajón y va sin emoji, por Retro (role=status), como la escalera de ayuda de la célula (`tema6/escaleraB5.js`). Al segundo fallo, la respuesta, como antes (la regla única). Las devoluciones A, B, C y C5 (§3.3) dejan de usarse y salen de los datos; quedan arriba como registro. Las fichas se emparejaron por su texto en main.

### 9.1 Pistas

| Id | Pista del primer fallo |
|---|---|
| socio | «¿El socio compró algo a crédito, o recibió plata prestada? Piensa qué deudas recoge la cuenta de clientes.» |
| trabajador | «¿Aquí hubo una venta a crédito? Piensa qué deudas recoge Cuentas por cobrar – clientes.» |
| particular | «Fíjate por qué esta persona le debe a la empresa. ¿La deuda vino de una venta a crédito?» |
| prestamo-cliente | «Que sea cliente no decide la cuenta. Mira por qué le debe: ¿compró a crédito o le prestaron?» |
| venta-mercancia | «Después de esto, ¿lo que debe el cliente sube o baja? No te guíes por la palabra “crédito”.» |
| venta-servicio | «Un servicio vendido sin cobrarlo también deja una deuda. ¿Esa deuda sube o baja?» |
| pago | «Después de pagar esa parte, ¿el cliente debe más o menos que antes?» |
| devolucion | «Lo que el cliente regresa, ¿lo sigue teniendo que pagar? Piensa si su deuda sube o baja.» |
| descuento | «Con la rebaja, ¿el cliente debe más o menos que antes?» |

### 9.2 Ficha

Cambio extra: Shoko marcó que «abono» no se enseña hasta T6 A4, y b5-t6-a1 va antes. Antes decía «Un cliente abona una parte de lo que debe.» (§6.1).

| Id | Ficha |
|---|---|
| pago | «Un cliente paga una parte de lo que debe.» |

### 9.3 Acierto

Norma de diseño nueva (sin emojis como íconos): este acierto va SIN el ✅ delante, tal como está en la tabla. Los aciertos de las demás fichas conservan el ✅ hasta el lote de corrección que viene después.

| Id | ✅ Acierto |
|---|---|
| pago | «Sí. Baja: se acredita. Lo que pagó ya no lo debe.» |

### 9.4 Tras el segundo fallo

| Id | Texto |
|---|---|
| pago | «No es esa. Baja: se acredita. Lo que pagó ya no lo debe.» |

## Lote 6d-textos · los aciertos sin la apertura de veredicto (Futaba, 16-oct)

Manda sobre todas las tablas de acierto y de segundo fallo de arriba. Fuente: entrega de Futaba del 16-oct (8:21), §1.

- Los aciertos de las 9 fichas pierden «Sí. » delante; el resto de cada texto se queda igual, letra por letra.
- Tras el segundo fallo, la regla única (b5SegundoFallo.js) ya no quita ni pone nada: el acierto sale tal cual, debajo de la pastilla «Iba aquí». Ya no hay «No es esa.» delante.
- El aviso del primer fallo pasa de «La ficha no se colocó.» a «La ficha volvió. Lee la pista y pruébala en otro cajón.» (solo en FichasUnNivel.jsx de la Célula B).
