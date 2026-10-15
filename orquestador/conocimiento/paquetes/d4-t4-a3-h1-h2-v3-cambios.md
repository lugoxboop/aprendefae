**T4 · A3, H1 y H2 · cambios de la versión 3** (correcciones obligatorias de las auditorías de Shibukawa: A3, H1 y H2 pasan con correcciones).
- Autora: Katsumi.
- Sobre qué versión van:
  - A3: v1 + `d4-t4-a3-a4-v2-cambios.md`.
  - H1: v1 con los cambios ya anotados en su archivo.
  - H2: v1 con los cambios ya anotados en su archivo.
- INFLESZ **medido de dos formas**, con `src/herramientas/inflesz.js`:
  - tal cual;
  - con «p.», «pp.», «Ltda.» y «n.º» sin el punto, para que la herramienta no corte la frase ahí. Es el defecto conocido.
- Todo texto nuevo pasa de 65 en las dos. Formato: (tal cual / sin corte).

## A3-1 · «girar» antes de A4 (P4, la pregunta central)

- v1: «Contabilidad va a girar el cheque del reembolso. ¿Por cuánto sale?»
- **v3:** «Contabilidad va a hacer el cheque del reembolso. ¿Por cuánto sale?» (76,7 / 76,7)
- Lo pide la misma regla de A2: lo que va antes de A4 se dice en llano.

## A3-2 · Un texto que pasaba solo por el corte en «p.» (P5, línea 3)

- v1: «Los $2.100 se acreditan en Ingresos no operacionales – sobrante de caja menor. Mira el asiento de la p. 185.» (69,3 / 66,2)
- **v3**, el texto que propone Shibukawa: «Los $2.100 van al haber de Ingresos no operacionales – sobrante de caja menor. Así está en el asiento de la página 185.» (71,2 / 71,2)
- Escribir «la página 185» en vez de «la p. 185» quita el problema de raíz.
- **Discrepancia en la medida, sin resolver:**
  - Shibukawa da **59,6** para el texto de la v1 «contado bien».
  - Yo, contándolo como dos frases (quitando el punto de «p.»), obtengo **66,2**: 19 palabras, 40 sílabas, 2 frases.
  - Si sus 59,6 salen de contar una sola frase, o de tratar la raya «–» de otro modo, no lo sé. No tengo su script.
  - El cambio resuelve el problema con cualquiera de los dos conteos: el texto nuevo da 71,2 en los dos. **No verificado por mí:** cómo cuenta Shibukawa.
- **Desde ahora mido sin corte en todo.** Barrí los 22 paquetes con un script (`scratchpad/katsumi/medir/abrev.py`) que remide cada texto citado sin el corte en abreviaturas. Ningún otro texto queda por debajo de 65 con mi conteo. El texto de A3 era el único en el borde, y con mi conteo quedaba en 66,2.

## H1-a · El hecho H1-3 chocaba con A2

El hecho del taxi es un gasto de caja menor. En A2 ese pago no mueve Caja, así que no sirve como ejemplo de «pagar en efectivo acredita Caja». Se cambia por una compra pagada de contado que no es un gasto menor.

| | v1 | **v3** |
|---|---|---|
| Hecho | «Una oficina saca billetes de la caja para pagar el taxi que trajo unos papeles.» | «Un almacén le compra unas mesas a un proveedor y se las paga en efectivo, con plata de la caja.» (80,9 / 80,9) |
| Acierto | sin cambio | «Así es. Salió plata de la caja para pagar, y lo que sale de Caja va al haber.» (104,4) |
| Si va a «Debe de Caja» | «… para pagar el taxi …» | «Al debe va lo que entra a la caja. Aquí la plata salió para pagarle al proveedor, así que va al haber.» (91,1 / 91,1) |
| Si va a «Caja no se mueve» | «Sí se mueve: los billetes salieron de la caja. …» (diagnóstico: «gasto pequeño») | «Sí se mueve: la plata salió de la caja para pagar las mesas. Pagar en efectivo acredita Caja.» (83,6 / 83,6) |

- Diagnóstico nuevo del error «Caja no se mueve»: **cree que una compra no toca la caja si no hay gasto**. Ya no dice «gasto pequeño».
- *[Hecho construido. No trae cifra, igual que los demás hechos de H1. Probé una versión con $1.200.000: con la cifra, el texto no pasaba de 65 (62,2), y la cifra no hace falta para decidir sobre Caja.]*
- **Decisión de Yujiro aplicada:** cada tarjeta se coloca una vez; si falla, va a su destino correcto con su explicación. H1 es exploratoria, así que sus errores pueden revelar la respuesta y no se reescriben.

### Lo mismo en «Así se juega» de H1 (`d4-t4-asi-se-juega-v1.md`)

Shibukawa lo recomienda: la demostración (una cafetería que paga la leche del día) también es un gasto que roza la caja menor.

| | v1 | **v3** |
|---|---|---|
| `demo` | «Una cafetería paga en efectivo, con billetes de la caja, la leche del día.» | «Una tienda le paga de contado al proveedor, con plata de la caja, las neveras que le compró.» (81,5 / 81,5) |
| `alt` | «La tarjeta dice que una cafetería paga la leche…» | «La tarjeta dice que una tienda paga las neveras con plata de la caja. Sale plata de la caja, así que la tarjeta va al haber de Caja.» (90,5 / 90,5) |

- *[Construido. No es el hecho H1-3 (otro negocio, otro bien), así que la demostración no regala la respuesta.]*

## H2-a · El caso H2-7 repetía las palabras de la opción correcta

| | v1 | **v3** |
|---|---|---|
| Caso | «Una empresa no tiene un fondo aparte para los pagos pequeños, como el café de la oficina o un domicilio.» (65,4) | «Cada vez que hay que comprar café o pagar un domicilio, alguien tiene que pedir un cheque o sacar plata de la caja principal.» (79,0 / 79,0) |

- Es el texto que propone Shibukawa. Cuenta el problema sin nombrar el remedio: el estudiante tiene que llegar por sí mismo a «caja menor».
- **Los dos distractores** ya no pueden apoyarse en «fondo propio», porque el caso no lo dice. Pasan a:
  - **control 3, tope:** «El tope sirve para frenar los pagos grandes en efectivo. Aquí los pagos son pequeños: el problema es de dónde sale la plata para pagarlos.» (77,2)
  - **control 2, llevar al banco:** «Llevar la plata al banco cada día es sobre la plata que se recibe. Aquí la plata sale, en pagos pequeños, y cada vez hay que buscarla.» (87,2)
- **El acierto no cambia:** «Así es. El libro pide apartar una caja menor para los pagos pequeños. Es justo el fondo que le falta a esta empresa.» (88,1)
- El acierto sí puede nombrar la caja menor: es la respuesta, y se muestra después de acertar.

## Erratas que tocan estas piezas

Sin cambios.

## Para Baki

A3 y H2 aún no están construidas. H1 tampoco, que yo sepa. Si alguna ya está, cambian:
- A3: P4 y la línea 3 de P5;
- H1: H1-3 y su «Así se juega»;
- H2: el caso H2-7 y sus dos distractores.
