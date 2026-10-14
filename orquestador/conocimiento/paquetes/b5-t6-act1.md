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
| C5 | venta-mercancia y venta-servicio, si eligió «Se acredita» (prioridad sobre la C) | «Vas bien: es Clientes. Ojo con la palabra «crédito»: el nombre del negocio no dice en qué lado se anota. Pregúntate si lo que deben los clientes sube o baja.» |

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
