# Lote T2-10 · textos de Near (25-oct-2026)

## 1 · Pie de página de cada cierre (en la `razon`)

| pieza | pie | de dónde sale |
|---|---|---|
| P1 | Basado en el libro, pp. 98-101. | ene-18 y el saldo de $4.000 de Cuentas por pagar (ene-08 y ene-12) en P1·6. El ejemplo de Caja y la definición de Cuenta no tienen página en el repo. |
| P2 | Basado en el libro. | P2 no usa asientos, y las definiciones textuales de P2·2 a P2·5 no tienen página en el repo. |
| P3 | Basado en el libro, pp. 87, 89, 90, 93 y 113. | Las páginas de Mello, más la p. 87: la regla de gastos e ingresos (comentario de `contabilidadDebeHaber.js`). |
| P4 | Basado en el libro, pp. 87 y 98-101. | ene-03, ene-04, ene-30 y las dos reglas de P4·4 y P4·5 (p. 87). cal-2 no tiene página. |
| P5 | Basado en el libro, pp. 96 y 98-101. | ene-03 y el asiento del 1 de julio (Caja / Aportes sociales $2.000), del diario de la p. 96 según `contabilidad.js`. |

## 2 · Las que vuelven a cero: las tres cuentas que cambian (C1 con P2)

Los saldos no cambian, así que la utilidad sigue en $10.500.

| ítem | campo | texto | pal. · INFLESZ |
|---|---|---|---|
| VC·1 | nombre | Ingresos por intereses · nominal · $12.000 | — |
| VC·1 | porqué | Es un ingreso: mide los intereses que la empresa ganó en el año. Al cierre, su saldo pasa a Ganancias y pérdidas. | 22 · 85,4 |
| VC·1 | retro si la pasa | Así, 20X2 empezaría con intereses que se ganaron en 20X1. Es un ingreso, y se cierra. | 16 · 69,1 |
| VC·3 | nombre | Gastos por arriendo · nominal · $5.000 | — |
| VC·3 | porqué | Es un gasto del año. Se paga cada mes y aun así se cierra, porque mide el año. | 18 · 104,4 |
| VC·3 | retro si la pasa | Pagarlo cada mes no lo deja abierto. Es un gasto: mide el año y vuelve a cero. | 17 · 95,7 |
| VC·7 | nombre | Gasto de venta – fletes · nominal · $4.500 | — |
| VC·7 | porqué | Es un gasto: lo que costó llevar lo vendido en el año. Se cierra como los demás gastos. | 18 · 100,9 |
| VC·7 | retro si la pasa | Así, 20X2 cargaría con los fletes de lo que se vendió en 20X1. Es un gasto, y se cierra. | 19 · 89,7 |
| VC·7 | consigna con este nombre | Llega el cierre de 20X1. ¿Qué pasa con Gasto de venta – fletes? | 12 · 93,0 |

Decisiones de Near, aceptadas por L:
- VC·7 no usa «Gastos por salarios», porque el cierre de P2 ya da su respuesta.
- Al salir Costo de ventas de esta actividad, se acaba ahí el choque con «Costo de mercancía vendida». La confusión entre gasto y costo la sigue cubriendo P2·4.
- VC·3: P2·5 nombra «arriendos» solo como ejemplo de la familia de gastos, no en una decisión, así que no delata la respuesta.
