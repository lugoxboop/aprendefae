# Lote 21 · Capa 2 de T5 A1, T6 A1, T6 A2, T6 A4 y T6 A5 — un gesto por pieza (P2 de Mai, 16-oct)

Aprobada por Sakuta. Gesto único: tocar la ficha (o la fila) que nombra el paso; entra en su sitio del modelo. Sin error (juzgar es de la capa 3). Una sola mecánica, `FichaQueEntra` (`tema6/FichaQueEntra.jsx` + `contabilidad/fichaQueEntra.js`), con los datos por pieza en `data/fichasQueEntran.js`, anclados al texto del paso de main (no a su número).

| Pieza | Modelo | Gestos |
|---|---|---|
| T5 A1 | estante: Renta variable · Fija con interés · Fija con descuento | «Efectivo» se vuelve CDT, Acciones y Títulos de participación; cada uno entra a su cajón |
| T6 A1 | T «Cuentas por cobrar – clientes» y, debajo, «Caja» | factura → DEBE; pago → Caja; el movimiento del DEBE → HABER |
| T6 A2 | rejilla Anulación directa / Provisiones × Al cerrar el periodo / Al castigar | gasto → Anulación directa · Al castigar; «Nada» al cerrar, en el cierre; «Provisiones» tenue y vacía (R10) |
| T6 A4 | tabla Se revive · A Caja entran | la deuda castigada → Se revive; el pago → A Caja entran |
| T6 A5 | tablero de grupos (con el rótulo del escenario simulado) | se toca la fila de cada grupo y entra su provisión; el total entra solo |

Textos nuevos (PARA SHOKO): «Deuda castigada», «Total», «Factura», «Pago», «Nada», «Toca la ficha resaltada» y «Toca la fila resaltada».
