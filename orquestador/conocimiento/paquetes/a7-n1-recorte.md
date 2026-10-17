Para L

# Recorte B2: T7-1 A7 «El viaje de una caja» y T5 N1: solo lo que cambia

**Cómo cuento.** Cuento todo lo que se ve a la vez: el texto, la ficha, el mensaje más largo y, en A7, los rótulos de las cinco estaciones. Con esa cuenta, en main A7 da 71, 82, 74, 79 y 67 palabras y N1, 71, 71 y 66 en el enunciado. INFLESZ, con el medidor oficial; «—» si el texto tiene menos de 10 palabras.

## T7-1 A7 (`contabilidadT7_1_a7_viaje.js`)

**Estaciones**: pasan de 34 a 30 palabras. El nombre de cada estación no cambia.

| Estación | Control nuevo | Por qué |
| --- | --- | --- |
| recepcion | «Factura contra orden» | La pantalla 2 ya define «orden de compra». |
| contabilidad | «Informe de recepción, si todo llegó bien» | Igual que el de main; solo cambia «·» por coma. Conserva la condición del libro (C7). |
| conteos | «Conteo, también al azar» (la marca «Cada cierto tiempo» no cambia) | El de main usaba el verbo «contar». La condición periódica sigue en la marca. |

Bodega («Techo, puertas y póliza») y Salida («Solo con requisición autorizada», con su «solo») quedan igual.

| Pantalla | Campo | Nuevo | Pal. | INFLESZ |
| --- | --- | --- | --- | --- |
| p1 | texto | «Así viaja un pedido. Suelta la caja y mira dónde lo controla el libro. Orden de compra: el pedido hecho. Requisición: la orden para sacar mercancía. Póliza: un seguro.» | 29 | 76,4 |
| p2 | texto | «Una ferretería pidió 80 cajas y le cobran 100. Detén la caja donde se ve la diferencia.» | 17 | 70,1 |
| p2 | bien | «✓ Al recibir: la factura se compara con la orden.» | 9 | — |
| p2 | pista | «En Recepción: la factura se compara con la orden.» | 9 | — |
| p2 | mal.contabilidad | «Ahí ya es tarde: contabilidad solo registra el informe.» | 9 | — |
| p2 | mal.bodega | «La caja ya entró: la diferencia se veía antes.» | 9 | — |
| p2 | mal.conteos | «El conteo llega mucho después: se veía antes.» | 8 | — |
| p2 | mal.salida | «Para entonces la caja ya está adentro.» | 7 | — |
| p3 | texto | «Un empleado entrega 10 cajas que le pidieron de palabra. Detén la caja donde falla el control.» | 17 | 73,7 |
| p3 | bien | «✓ En la salida: sin requisición autorizada, nada sale.» | 8 | — |
| p3 | pista | «Es en Salida: sin requisición autorizada, nada sale.» | 8 | — |
| p3 | mal.recepcion | «Recepción solo revisa lo que llega.» | 6 | — |
| p3 | mal.contabilidad | «Contabilidad no decide quién saca mercancía.» | 6 | — |
| p3 | mal.bodega | «Techo y puertas no deciden quién saca qué.» | 8 | — |
| p3 | mal.conteos | «El conteo no decide quién saca mercancía.» | 7 | — |
| p4 | texto | «Hace dos años que nadie revisa la bodega. Detén la caja donde falta el control.» | 15 | 87,2 |
| p4 | ficha | «2 años · solo libros» | 4 | — |
| p4 | bien | «✓ En los conteos: el libro pide uno cada cierto tiempo.» | 10 | 84,7 |
| p4 | pista | «Es en Conteos: el libro pide uno cada cierto tiempo.» | 10 | 84,7 |
| p4 | mal.recepcion | «Recibir bien no dice cuánto queda dos años después.» | 9 | — |
| p4 | mal.contabilidad | «Contabilidad registra lo que entra, no lo que hay.» | 9 | — |
| p4 | mal.bodega | «Techo y puertas cuidan, pero no dicen cuánto hay.» | 9 | — |
| p4 | mal.salida | «La requisición cuida cada salida, no lo que queda.» | 9 | — |
| p5 | texto | «El control empieza al recibir y termina cuando la mercancía sale. El informe va a contabilidad, y la bodega se revisa cada cierto tiempo.» | 24 | 67,6 |

**Totales a la vista:** p0 51 · p1 59 · p2 60 · p3 59 · p4 59 · p5 54.

**Otros cambios:**
- **p4:** la ficha de main («Solo lo dicen los libros») repetía el texto (B5), así que cambia. Además, salen las formas del verbo «contar» que había en los mensajes.
- **p2:** los mensajes de error de main decían «se nota al recibir», es decir, daban la respuesta en el primer error (C2). Ahora dicen «se veía antes».
- **p5:** sale la frase «La caja pasa por recepción, bodega y salida», porque la ruta ya lo muestra.

## T5 N1 (`contabilidadT5_n1.js`)

| Campo | Nuevo | Pal. | INFLESZ |
| --- | --- | --- | --- |
| enunciado[0] | «Primero decide si cada inversión es temporal o si puede ser más apropiado llevarla a largo plazo. Después, ubica otras en su grupo y responde una pregunta final.» | 28 | 68,2 |
| enunciado[1] | «Es temporal si se puede vender rápido y se volverá efectivo cuando haga falta, en un año o en un ciclo de operaciones, el que sea más largo.» | 28 | 67,6 |
| ritmo-del-negocio · pregunta | «A una empresa le sobra efectivo por un tiempo, por el ritmo de su negocio. Compra acciones que se venden a diario y las venderá cuando necesite el dinero.» | 29 | 78,5 |
| ritmo-del-negocio · error | «Se venden rápido, y el efectivo sobra solo por un tiempo. El libro dice que eso justifica la intención de volverlas efectivo.» | 22 | 71,2 |
| ritmo-del-negocio · acierto | «Así es. Se venden rápido y el efectivo sobra solo un tiempo: eso justifica la intención de volverlas efectivo.» | 19 | 66,2 |
| la-intencion · pregunta | «Una empresa dice que venderá pronto sus títulos. ¿Con qué debe apoyar esa intención?» | 14 | 70,8 |
| la-intencion · correcta | «Con evidencias: su historia de inversiones.» | 6 | — |
| la-intencion · opción | «Con una carta firmada por la gerencia.» | 7 | — |
| la-intencion · opción | «Con el tipo de título que compró.» | 7 | — |
| la-intencion · error | «No basta con que la gerencia lo diga ni con el tipo de título. El libro pide evidencias, como la historia de inversiones.» | 23 | 84,3 |
| la-intencion · acierto | «Así es. El libro pide apoyar la intención con evidencias, como la historia de inversiones y su propósito.» | 18 | 69,8 |

**Totales:** enunciado 56 (antes 66) · ritmo-del-negocio 59 (antes 71) · la-intencion 57 (antes 71). Los demás ítems ya estaban en 52 o menos.

**C7.** Las dos condiciones de una inversión temporal (que se pueda vender rápido y que se vuelva efectivo en un año o en un ciclo, el más largo) siguen completas y a la vista, en el enunciado. «Puede ser más apropiado» se queda tal cual.

**Lo que sigue pendiente.** Esto reemplaza lo que se cruza con mi entrega «N1: lo que pidió Mello»: el enunciado y el bloque 3. Sigue pendiente de construir lo que esa entrega cambia y esta no toca:
- el ítem nuevo `bonos-de-compania`, que reemplaza a `bono-de-tesoreria`;
- la `intro` del bloque 2;
- los aciertos «volverlos efectivo» del caso 4.

Las opciones del bloque 3 quedan en 6, 7 y 7 palabras, sin «como» en ninguna.
