# T1 · Lote del 24-oct, cuarta parte (Futaba): los cuatro textos «PENDIENTE DE FUTABA» de #535

Los leí en la rama del PR (`pull/535/head`). Todo texto de 10 palabras o más está medido con `npm run inflesz` y da ≥ 65. Ninguno pasa de 25 palabras, ninguno lleva emoji ni abre con el veredicto, y ningún id cambia. Al aplicarlos, Kaede quita las marcas «PENDIENTE DE FUTABA».

## 1 · t1-6, un solo toque sobre cinco destinos

| Dónde (pr535) | Hoy (Kaede) | Nuevo |
|---|---|---|
| `T1_6.consigna` (contabilidadTema1.js:545) | Toca dónde va la ficha: el informe y la parte, en un solo toque. | Lee la ficha. Toca a cuál de los cinco va: activo, pasivo, patrimonio, ingresos o gastos. (82,0) |
| `ASI_T1_6.pasos[0]` (asiSeJuegaBloque3.js:52) | Lee la ficha de arriba. | Se queda igual |
| `ASI_T1_6.pasos[1]` | Toca dónde va: el informe y la parte, en un solo toque. | Toca su destino, uno de los cinco, en un solo toque. (93,9) |
| `ASI_T1_6.pasos[2]` | Mira cómo sube la cuenta de ese destino. | Se queda igual |
| `ASI_T1_6.alt` (la pantalla le antepone «Ejemplo: ») | la ficha «Horno industrial» cae en «Activo», en el estado de situación financiera, y su cuenta sube a 1. | se toca «Activo», en el estado de situación financiera. La ficha «Horno industrial» cae ahí y la cuenta de ese destino sube a 1. (72,8) |
| `EJEMPLO_T1_6.acierto` (bloque3:48; no estaba marcado, pero sigue con ✅ y con el nombre viejo) | ✅ Va en el primer informe, en lo que tiene. El horno es de la panadería y le dura años. | Va en el estado de situación financiera, en el activo. El horno es de la panadería y le dura años. (84,7) |

En el alt, el orden es el del guion: la mano toca el destino una sola vez (`toques: [{ ms: 2000, en: destino }]`).

La última fila sigue la misma regla que el lote de aciertos de t1-6 del lote C, para que el ejemplo hable igual que la actividad.

## 2 · t1-1, el alt de la demo

| Dónde | Hoy | Nuevo |
|---|---|---|
| `ASI_T1_1.alt` (asiSeJuegaBloque2.js:54) | se toca la pregunta del cliente de la panadería y luego la zona ${AFUERA}. La pregunta entra a esa zona y la flecha de vuelta no se enciende. | se lee la pregunta de la panadería y se toca ${ROTULO_ZONA[ZONA_FUERA]}. La ficha «la pregunta» entra ahí y la vuelta sigue tenue. (82,6) |

Hay dos arreglos:
- **Sale «del cliente».** Nombrar a quien pregunta es justo lo que la ficha deja de hacer para no contestarle a H2.
- **Ya no dice que «se toca la pregunta».** El guion no la toca («La mano no toca la pregunta: solo AFUERA»), y el alt tiene que contar lo que se ve.

## 3 · El alt del anillo de t1-1

| Dónde | Hoy | Nuevo |
|---|---|---|
| `ALT_ANILLO_T1_1.vueltaApagada` (contabilidadTema1.js:123) | La vuelta está apagada. | La vuelta está tenue: esta persona no decide qué hace la empresa. (75,4) |

Va en paralelo con `vueltaEncendida` («La vuelta está encendida: esta persona decide.»). Dice «tenue» y no «apagada» porque la vuelta siempre se ve.

## 4 · t1-4, el acierto de la decisión 2, uno por caso

Los nombres van como los escribe el libro en pp. 35-36 («Aumento en el activo y aumento en el pasivo…»). Los rótulos de las opciones pueden quedarse con los cortos; el acierto lleva el nombre completo del libro. La llave es la del Repaso, que ya existe.

| Llave | Caso (pp. 35-36) | Acierto |
|---|---|---|
| `deuda-sube` | a | Aumento en el activo y aumento en el pasivo: entró algo y nació una deuda por lo mismo. (78,1) |
| `aporte-sube` | b | Aumento en el activo y aumento en el patrimonio: entró algo que pusieron los dueños. (71,4) |
| `deuda-baja` | c | Disminución en el activo y disminución en el pasivo: salió plata y con ella se pagó una deuda. (71,2) |
| `aporte-baja` | d | Disminución en el activo y disminución en el patrimonio: salió algo de la empresa hacia los dueños. (65,2) |

Los 8 hechos se reparten así: a = cal-2, cal-3 y cal-7; b = cal-1 y cal-5; c = cal-4 y cal-8; d = cal-6. Cada acierto sirve para todos los hechos de su caso. Las devoluciones de error son las del lote B y no cambian.
