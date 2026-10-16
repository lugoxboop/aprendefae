Para L

# T7-2 A4 «San Calixto en permanente» · pantalla `el-cierre`, rehecha (B1, B2, C1, C2, C8)

**La mecánica.** Arriba aparece la lista de los cierres del periódico, como los vio el estudiante en T7-1 A4. Él toca los que le sobran a San Calixto en el permanente y luego pulsa «Comprobar». Al acertar, o en el segundo error, la figura se transforma:
- los asientos que sobran salen;
- entra «Cerrar Costo de mercancía vendida», marcado como nuevo;
- la lista que queda es la del permanente y se queda a la vista (C8).

Todo va sin montos: X2 sigue vigente.

**Una corrección de fondo.** El texto de hoy dice «dos asientos menos», pero en el periódico de T7-1 A4 los cierres son cinco: quitar el inventario inicial, colocar el final, cerrar Ingresos por ventas, cerrar Compras y cerrar Gastos de administración y ventas. En el permanente sobran **tres**, porque Compras no existe: las compras ya fueron a Inventario de mercancías (T7-2 A1, «El costo de la mercancía que la empresa compra» → debe). Entra uno, el de Costo de mercancía vendida. «Dos menos» era el saldo neto: salen tres y entra uno. La pantalla nueva no da el número.

**Cómo cuento.** Cuento todo lo que se ve a la vez: el texto, el encabezado y los rótulos de la figura, y el mensaje. INFLESZ, con `npm run inflesz`; lo de menos de 10 palabras no aplica.

## Textos

| Campo | Texto | Palabras | INFLESZ |
| --- | --- | --- | --- |
| Texto | «Así cierra el periódico. San Calixto usa el permanente: toca los asientos que le sobran.» | 15 | 74,7 |
| Encabezado de la figura | «Cierre contra Ganancias y pérdidas» | 5 | no aplica |
| Filas que se tocan (periódico) | «Quitar el inventario inicial» · «Colocar el inventario final» · «Cerrar Ingresos por ventas» · «Cerrar Compras» · «Cerrar Gastos de administración y ventas» | 20 | no aplica |
| Pista (1.er error, si solo le faltó marcar alguna) | «Piensa qué cuenta ya está al día cuando llega el cierre, y a qué cuenta fueron las compras.» | 18 | 91,9 |
| Retro propia (1.er error, si marcó «Cerrar Ingresos por ventas») | «Ingresos por ventas existe en los dos sistemas, y al cierre se cierra igual en los dos.» | 17 | 90,9 |
| Retro propia (1.er error, si marcó «Cerrar Gastos de administración y ventas») | «Los gastos no dependen del sistema de inventario: se cierran igual en el periódico y en el permanente.» | 18 | 71,2 |
| 2.º error (la respuesta) | «Sobran los del inventario y el de Compras. Inventario de mercancías ya está al día y recibió las compras.» | 19 | 82,6 |
| Acierto | «Así es: Inventario de mercancías ya está al día y recibió las compras. En su lugar entra un cierre nuevo.» | 20 | 84,7 |
| Figura final (permanente) | «Cerrar Ingresos por ventas» · «Cerrar Costo de mercancía vendida» (nuevo) · «Cerrar Gastos de administración y ventas» | 15 | no aplica |

**Cuál mensaje sale.**
- Si en el primer intento marcó alguna fila que no sobra, sale la retro de esa fila. Si marcó las dos, sale la de la primera en la lista.
- Si solo le faltó marcar alguna, sale la pista.
- Las dos retros orientan sin nombrar lo que sobra.
- En el segundo error sale la respuesta y la figura pasa a la lista del permanente, igual que con el acierto.

## Conteo a la vista (B1 y B2)

| Momento | Cuenta | Total |
| --- | --- | --- |
| Antes de tocar (B1 ≤ 40) | 15 + 5 + 20 | **40** |
| Primer error, con el mensaje más largo | 15 + 5 + 20 + 18 | **58** |
| Segundo error, con la figura ya transformada | 15 + 5 + 15 + 19 | **54** |
| Acierto, con la figura ya transformada | 15 + 5 + 15 + 20 | **55** |

La figura empieza justo debajo del texto, con 15 palabras antes de ella.

## Comprobaciones

- **C1.** El párrafo que daba la respuesta («No hay que quitar el inventario inicial ni colocar el final: la cuenta ya está al día») sale. Ninguna pantalla anterior de la pieza dice qué asientos sobran: las pantallas de PEPS, UEPS, promedio y `que-cambia` hablan del kárdex.
- **C2.** El primer error trae la pista o la retro de la fila. El segundo trae la respuesta con su porqué.
- **C8.** La figura no se borra: queda con la lista del permanente, que es lo que el estudiante armó.
- **Pensar, no reconocer.** Cerrar Compras no está en ningún texto de la pantalla como algo que sobra. El estudiante lo deduce de que en el permanente las compras van a Inventario de mercancías, que aprendió en T7-2 A1. «Compras no existe» se dice explícito solo después, en A5.
- **Nombres de cuenta del canon:** Ingresos por ventas, Compras, Gastos de administración y ventas, Costo de mercancía vendida, Ganancias y pérdidas, Inventario de mercancías.
- **Pie**, sin cambio: «Basado en el libro, pp. 225 y 243».

## Cambios frente a lo publicado

| Campo | Viejo | Nuevo |
| --- | --- | --- |
| Párrafo 1 | «En el permanente, el cierre tiene dos asientos menos. No hay que quitar el inventario inicial ni colocar el final: la cuenta ya está al día.» | «Así cierra el periódico. San Calixto usa el permanente: toca los asientos que le sobran.» |
| Párrafo 2 | «En su lugar, la cuenta Costo de mercancía vendida se cierra contra Ganancias y pérdidas.» | Sale. La figura lo muestra con el acierto (fila nueva). |
| Figura | Los tres cierres del permanente, ya hechos, antes de preguntar | Antes: los cinco cierres del periódico, que se tocan. Después: los tres del permanente. |
| Pregunta y opciones | «¿Qué asientos del cierre no hacen falta en el permanente?» · tres opciones | Se toca la lista, sin opciones de texto. |
| Errores | «Ese sí se hace en los dos sistemas.» (el mismo para los dos) | Una retro propia para ventas y otra para gastos, más la pista para lo que falte marcar. |
| Acierto | «Así es. En el permanente, Inventario de mercancías ya está al día cuando llega el cierre.» | «Así es: Inventario de mercancías ya está al día y recibió las compras. En su lugar entra un cierre nuevo.» |
| Resumen de la pieza | «El cierre del permanente no lleva los asientos del inventario inicial y final.» | Propongo: «El cierre del permanente no lleva los asientos del inventario ni el de Compras, y cierra Costo de mercancía vendida.» (20 palabras · 68,5; suma 6 palabras al resumen) |

## Para Misa

- La figura es nueva en la pieza: una lista que se puede tocar (selección múltiple) más «Comprobar».
  - **Solución:** `inicial`, `final` y `compras`.
  - **Filas que no sobran:** `ventas` y `gastos`, cada una con su retro.
  - En el acierto o en el segundo error: salen las tres filas que sobran y entra la fila `cmv` con la marca «nuevo».
- Es Aprender: no da FP ni toca la migración.
