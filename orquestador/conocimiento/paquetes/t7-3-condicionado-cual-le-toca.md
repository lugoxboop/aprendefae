Para L

# T7-3 «El descuento condicionado» · pantalla `cual-le-toca`, rehecha (C1)

**Qué cambia.** El texto anterior decía «diez días después de la venta», y así la pregunta se respondía sola. Ahora la pantalla da solo las dos fechas del libro: la factura del 25 de mayo y el pago del 4 de junio. El estudiante calcula los días y busca su plazo.

**Datos.** No hay cifras ni fechas nuevas. Las dos fechas ya están publicadas en la pieza (el ejemplo, p. 252; «C7-6 resuelta: la venta es del 25 de mayo»). Las condiciones son las de `condiciones`, como las dejó Mello: 15/10, 5/20, n/30.

**Cómo cuento.** Cuento todo lo que se ve a la vez, incluidos la figura y las opciones, y cada «%» o cifra cuenta como una palabra. INFLESZ, con `npm run inflesz`.

## Pantalla

| Campo | Texto | Palabras | INFLESZ |
| --- | --- | --- | --- |
| Texto | «San Calixto le factura a Santa Martha el 25 de mayo. Santa Martha paga el 4 de junio.» | 18 | 83,6 |
| Figura | La franja de plazos de `condiciones`, **sin el pago marcado**: «15/10 · 5/20 · n/30» sobre «10 · 20 · 30 días» | 6 | no aplica |
| Pregunta | «¿Qué descuento condicionado le toca?» | 5 | no aplica |
| Opciones | «15 %» (correcta) · «5 %» · «Ninguno» | 5 | no aplica |
| Pista (1.er error) | «Mayo tiene 31 días. Calcula cuántos días van del 25 de mayo al 4 de junio y busca su plazo.» | 20 | 81,6 |
| 2.º error · «5 %» | «Del 25 de mayo al 4 de junio van diez días: seis de mayo y cuatro de junio. Con 15/10, le toca el 15 %.» | 25 | 89,7 |
| 2.º error · «Ninguno» | «Pagó en el plazo más corto: del 25 de mayo al 4 de junio van diez días. Con 15/10, le toca el 15 %.» | 24 | 88,4 |
| Acierto | «Así es: van diez días, seis de mayo y cuatro de junio. Con 15/10, le toca el 15 %.» | 19 | 95,7 |
| Figura del acierto | La franja marca el pago: «4 jun» en el día 10 (`PLAZOS_A3(true)`, como hoy) | 2 | no aplica |

**Lo que se ve a la vez, como máximo:**
- Con el acierto: 18 + 6 + 5 + 5 + 19 + 2 = **55**.
- Con el error más largo: 18 + 6 + 5 + 5 + 25 = **59**.
- Las dos quedan dentro de 60.

## Decisiones

- **La pista orienta sin dar el número.** Dice que mayo tiene 31 días y qué fechas usar, pero no cuántos días son. Es el dato que más falla al calcular de un mes al otro.
- **«5 %» es el distractor del error real.** Quien suma también el 25 de mayo llega a 11 días y cae en 5/20. El 2.º error lo corrige mostrando la cuenta: seis de mayo y cuatro de junio.
- **La figura ya no lleva los renglones de la factura.** La pantalla siguiente, `sobre-que`, pregunta «¿Sobre qué valor se calcula el 15 %?», y la respuesta es $3.990.000. Con el renglón «Valor a facturar $3.990.000» en esta pantalla, esa respuesta salía en la pantalla anterior (C1). Los valores siguen en el ejemplo, que va antes.
- **El pago se marca en la franja solo después de responder,** como en la versión publicada. Antes, daría la respuesta (E8).
- **Pie:** «Basado en el libro, pp. 252-253», sin cambios.

## Cambios frente a lo publicado

| Campo | Viejo | Nuevo |
| --- | --- | --- |
| Pregunta | «El 4 de junio, Santa Martha paga. Del 25 de mayo al 4 de junio pasaron diez días. ¿Qué descuento condicionado le toca?» | Texto: «San Calixto le factura a Santa Martha el 25 de mayo. Santa Martha paga el 4 de junio.» Pregunta: «¿Qué descuento condicionado le toca?» |
| Pista | «Calcula los días que pasaron y compáralos con el plazo de cada condición, de la más corta en adelante.» | «Mayo tiene 31 días. Calcula cuántos días van del 25 de mayo al 4 de junio y busca su plazo.» |
| Error «5 %» | «Pagó a los diez días. Con la condición 15/10, le toca el 15 %.» | «Del 25 de mayo al 4 de junio van diez días: seis de mayo y cuatro de junio. Con 15/10, le toca el 15 %.» |
| Error «Ninguno» | La misma de «5 %» | «Pagó en el plazo más corto: del 25 de mayo al 4 de junio van diez días. Con 15/10, le toca el 15 %.» |
| Acierto | «Así es. Pagó a los diez días, así que le toca el 15 %.» | «Así es: van diez días, seis de mayo y cuatro de junio. Con 15/10, le toca el 15 %.» |
| Figura antes de responder | Renglones de la factura (mi recorte) | La franja de plazos, sin el pago |

**Para Misa:**
- En `CUAL_LE_TOCA` hay que separar el texto de la pregunta.
- El campo `devolucion` pasa a ser propio de cada opción.
- La figura de antes de responder es `PLAZOS_A3(false)`.
