**T4 · H3 «¿Se mueve la caja menor?» · serie 2 · contenido completo.**
- Autora: Katsumi. Encargo de Yujiro: segunda serie construida para que repetir la actividad cambie la empresa y las cifras (D8 Avanzado, exigencia de Mateo para los juegos).
- **En cada intento se sortea una serie:** la 1 (Distribuidora Andina, `d4-t4-h3-v1.md` con sus cambios v2) o la 2 (esta).
- **Igual que la serie 1:** la mecánica, las cuatro cuentas, el orden de las operaciones, los subtemas, el orden de prioridad de los errores y la cobertura completa de combinaciones de la v2 (H3-b).
- **Cambia:** la empresa, la encargada o el encargado, las fechas, las cifras y los textos que las nombran. Los mensajes que no nombran cifra ni empresa son **los mismos** de la serie 1, y aquí se dicen «igual que en la serie 1».
- **Cifras:** todas construidas y calculadas por script (`scratchpad/katsumi/gen3/h3s2.py`). El script comprueba que ninguna choca con una cifra del libro (pp. 177-191) ni con las de las demás actividades de T4: la serie 1 de H3, H4, H5, H7, H8 y «Así se juega».
- INFLESZ: **medido** tal cual y sin corte en abreviaturas. Todo texto de 10 o más palabras da 65 o más; el más bajo es 74,7.

## Empresa: Muebles El Roble · encargado: Andrés

| Operación | Fecha | Cifras |
| --- | --- | --- |
| Apertura | 2 de agosto | fondo 280.000 |
| Reembolso | 31 de agosto | gastos 187.350 (cuadra) |
| Aumento | septiembre | de 280.000 a 445.000: cheque de 165.000 |
| Disminución | meses después | de 445.000 a 375.000: Andrés devuelve 70.000 |

## Operaciones

### H3s2-1 · Apertura
- **Subtema:** Apertura del fondo
- **Enunciado:** «El 2 de agosto, Muebles El Roble abre una caja menor de $280.000. Le hace un cheque a Andrés, que la va a manejar.» (88,4)
- **Asiento correcto:** Caja menor al debe / Bancos al haber (modelo de la p. 181)
- **Acierto:** «Así es. La plata sale del banco y entra al fondo: Caja menor se debita y Bancos se acredita por $280.000.» (86,6)
- **Errores:** los siete de H3-1 de la serie 1 (los tres con nombre de la v1 y los dos pares de la v2). Ninguno nombra cifra ni empresa, así que van **igual que en la serie 1**.

### H3s2-2 · Reembolso *(trampa central)*
- **Subtema:** Reembolso
- **Enunciado:** «El 31 de agosto, Andrés entrega los soportes de lo que pagó en el mes: $187.350. Contabilidad hace el cheque del reembolso por esa cifra.» (74,7)
- **Asiento correcto:** Gastos generales al debe / Bancos al haber (modelo de la p. 182)
- **Acierto:** igual que en la serie 1: «Así es. Los gastos van a Gastos generales, al debe, y el cheque sale de Bancos, al haber. Caja menor no se mueve.» (98,9)
- **Errores:**
  1. *Eligió Caja menor al debe* (cree que el cheque agranda el fondo): «Esta es la trampa del reembolso. El cheque repone la plata gastada, pero el fondo no crece: sigue valiendo $280.000. Mira el asiento de la p. 182: Caja menor no aparece.» (78,5)
  2. Los demás (Caja menor al haber; no eligió Gastos generales; los dos pares de la v2; lados al revés): **igual que en la serie 1**, porque no nombran cifra.

### H3s2-3 · Aumento
- **Subtema:** Aumento del fondo
- **Enunciado:** «El fondo de Muebles El Roble se queda corto: lo reponen cada semana. En septiembre lo suben de $280.000 a $445.000, con un cheque por la diferencia.» (82,6)
- **Asiento correcto:** Caja menor al debe / Bancos al haber, por 165.000 (modelo de aumento, p. 182)
- **Acierto:** «Así es. Entran $165.000 más al fondo: Caja menor se debita y Bancos se acredita, igual que al abrirlo.» (82,6)
- **Errores:** igual que en H3-3 de la serie 1, que no nombran cifra.

### H3s2-4 · Disminución
- **Subtema:** Disminución del fondo
- **Enunciado:** «Meses después, la plata del fondo se queda quieta. Muebles El Roble lo baja de $445.000 a $375.000, y Andrés devuelve los $70.000 de diferencia.» (79,7)
- **Asiento correcto:** Caja al debe / Caja menor al haber, por 70.000 (modelo de disminución, p. 182)
- **Acierto:** igual que en la serie 1: «Así es. Mira el asiento de la p. 182: Caja menor se acredita y la plata que sale del fondo va al debe de Caja.» (96,3)
- **Errores:** igual que en H3-4 de la serie 1, que no nombran cifra.

## Cierre
Igual que en la serie 1 (v2): «Caja menor se mueve cuando el fondo se abre, se aumenta, se disminuye o se cierra. En el reembolso no se mueve: se debita Gastos generales y se acredita Bancos.» (75,5)

## Cifras y cadena

Todas construidas: 280.000, 187.350, 445.000, 165.000 (= 445.000 − 280.000), 375.000 y 70.000 (= 445.000 − 375.000). Las restas las hizo el script. No coinciden con ninguna cifra del libro ni de otra actividad de T4: es la comprobación del script, que falló tres veces antes de dar estas: con 420.000 (ya usado en «Así se juega»), con un aumento de 150.000 (serie 1) y con una disminución de 80.000 (ya usado en «Así se juega»). Por eso el fondo aumentado es 445.000.

## Erratas que toca esta pieza

Igual que la serie 1: D4-7, con la misma lectura. Las cifras son construidas.

## Lo que es mío

La empresa, el encargado, las fechas y las cifras.
