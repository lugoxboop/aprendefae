Para L

# T7-3 · tres aciertos con la condición del libro a la vista (C7 y B2)

**Cómo cuento.** Cuento todo lo que se ve en la pantalla al acertar: el texto, el rótulo de la figura, la pregunta, las tres opciones, el acierto y los rótulos que la figura suma al acertar. Cada «%» y cada cifra cuentan como una palabra. Este conteo sale un poco más alto que el tuyo: las tres pantallas abiertas me dan 96, 86 y 103, y tú tenías 75, 87 y 86. Aun así, con mi conteo, las tres quedan en **60**.

La pista y los errores no salen a la vez que el acierto, así que no entran en la cuenta y no cambian. El INFLESZ se midió con `npm run inflesz`; los textos de menos de 10 palabras no aplican.

Las correcciones de Mello para estas tres piezas (`mello-recortes-v1.md`) caen en otras pantallas: P2 de «condicionado», la pista de P1 de «dos libros» y el resumen de «sobrantes». Ninguna toca estas tres, así que siguen como Mello las dejó.

---

## 1. «El descuento condicionado» · `condiciones`: 60 palabras

| Campo | Texto final | Palabras | INFLESZ |
| --- | --- | --- | --- |
| Texto | «Condiciones de San Calixto:» | 4 | no aplica |
| Rótulo de la figura | «5 % comercial · 15/10 · 5/20 · n/30» | 6 | no aplica |
| Rótulo de los días | «10 · 20 · 30 días» | 4 | no aplica |
| Pregunta | «15/10 es un 15 % si paga a los diez días. ¿Y si paga a los treinta?» | 17 | 99,4 |
| Opciones | «15 %» · «5 %» · «Ninguno» | 5 | no aplica |
| Acierto | «Así es: n/30 es pagar el total. 5/20 es un 5 % si paga a los veinte días.» | 18 | 89,1 |
| Figura del acierto | «15 %» · «5 %» · «sin descuento» (bajo los días 10, 20 y 30) | 6 | no aplica |

**La condición queda intacta y a la vista:** «5/20 es un 5 % **si paga a los veinte días**», y n/30 es pagar el total.

| Campo | Viejo | Nuevo |
| --- | --- | --- |
| Texto | «San Calixto le vende a Santa Martha con estas condiciones:» | «Condiciones de San Calixto:» |
| Rótulo de los días | «día 10 · día 20 · día 30» | «10 · 20 · 30 días» |
| Pregunta | «…¿Qué descuento recibe si paga a los treinta?» | «…¿Y si paga a los treinta?» |
| Acierto | «Así es: a los treinta días paga el total.» | «Así es: n/30 es pagar el total.» Así ya no repite lo que dice el plegado sobre n/30. |
| Plegado | «El 5 % es un descuento comercial: se resta del precio de lista, en la factura.» | **Sale.** El rótulo de la figura pasa a «5 % comercial». Esa definición ya se enseña completa en «El descuento comercial», la pieza anterior. |
| Plegado | «5/20 es un 5 % si paga a los veinte días, y n/30 es pagar el total a los treinta.» | Pasa al acierto, a la vista. |

---

## 2. «El descuento en los dos libros» · `no-operacional`: 60 palabras

| Campo | Texto final | Palabras | INFLESZ |
| --- | --- | --- | --- |
| Definición | «No operacional: ajeno a la operación.» | 6 | no aplica |
| Pregunta | «San Calixto quedó con saldo en el debe. ¿Cómo va al estado de resultados?» | 14 | 88,6 |
| Opciones | «Gasto no operacional» · «Ingreso no operacional» · «Costo de mercancía vendida» | 10 | no aplica |
| Acierto | «Así es. En Santa Martha es ingreso no operacional. Si usaran el permanente, San Calixto haría otro asiento: el del costo. Y Santa Martha usaría Inventario de mercancías, no Compras.» | 30 | 66,4 |

**La condición queda intacta y a la vista:** «**Si usaran el permanente**», con sus dos consecuencias: el asiento del costo en San Calixto y Inventario de mercancías en lugar de Compras en Santa Martha.

| Campo | Viejo | Nuevo |
| --- | --- | --- |
| Definición | «No operacional quiere decir que no es de la operación.» | «No operacional: ajeno a la operación.» |
| Pregunta | «En San Calixto, la cuenta terminó con saldo en el debe. ¿Cómo va al estado de resultados?» | «San Calixto quedó con saldo en el debe. ¿Cómo va al estado de resultados?» |
| Opciones | «Como gasto no operacional» · «Como ingreso no operacional» · «Como costo de la mercancía vendida» | Sin «Como». La tercera usa el nombre de cuenta del canon: «Costo de mercancía vendida». |
| Acierto | «Así es. En Santa Martha, con saldo en el haber, va como ingreso no operacional.» | «Así es. En Santa Martha es ingreso no operacional.» Sale «con saldo en el haber», porque el estudiante ya lo vio en la pantalla anterior. |
| Plegado | «Si las dos usaran el permanente, San Calixto haría además el asiento del costo de lo vendido. Y Santa Martha anotaría la compra en Inventario de mercancías, no en Compras.» | Pasa al acierto, a la vista: «Si usaran el permanente, San Calixto haría otro asiento: el del costo. Y Santa Martha usaría Inventario de mercancías, no Compras.» |

Sale «las dos», porque el sujeto ya está claro: son las dos empresas de la pantalla. Probé versiones más cortas de la condición. Las que daban menos de 65 de INFLESZ las descarté.

---

## 3. «Sobrantes y faltantes» · `sobrante`: 60 palabras

| Campo | Texto final | Palabras | INFLESZ |
| --- | --- | --- | --- |
| Texto | «La ley pide un inventario físico al menos una vez al año, a más tardar el 31 de diciembre.» | 19 | 79,6 |
| Rótulos de la figura | «Saldo en libros $465.000» · «Conteo físico $495.000» | 7 | no aplica |
| Pregunta | «El conteo da más. ¿Cuánto sobra?» | 6 | no aplica |
| Opciones | «$30.000» · «$465.000» · «$495.000» | 3 | no aplica |
| Acierto | «Así es: $495.000 − $465.000 = $30.000. Estos ajustes solo se dan en el sistema permanente.» | 14 | 66,3 |
| Figura del acierto | «Inventario de mercancías · Debe $30.000» · «Costo de mercancía vendida · Haber $30.000» | 11 | no aplica |

**Las dos condiciones del libro quedan intactas y a la vista:**
- «**al menos** una vez al año, **a más tardar** el 31 de diciembre»: va arriba, como contexto del conteo.
- «Estos ajustes **solo** se dan en el sistema permanente»: va en el acierto.

| Campo | Viejo | Nuevo |
| --- | --- | --- |
| Texto | «Una empresa usa el sistema permanente. El 31 de diciembre mira lo que hay en la bodega.» | Lo reemplaza la frase de la ley, que estaba plegada. Que la empresa usa el permanente lo dice ahora la condición del acierto. |
| Pregunta | «El conteo da más: hay un sobrante. ¿De cuánto es?» | «El conteo da más. ¿Cuánto sobra?» |
| Acierto | «Así es: $495.000 − $465.000 = $30.000.» + «Baja el costo de la mercancía vendida.» | Sale «Baja el costo…», porque la figura del acierto ya lo muestra (Costo de mercancía vendida al haber). Entra la condición del plegado. |
| Plegado | «El libro dice que, por normas de contabilidad y por ley, las empresas deben hacer un inventario físico al menos una vez al año, a más tardar el 31 de diciembre.» | Pasa al texto, a la vista: «La ley pide un inventario físico al menos una vez al año, a más tardar el 31 de diciembre.» **Sale «por normas de contabilidad»**: no limita nada y no cabía. |
| Plegado | «Y dice que estos ajustes solo se presentan en el sistema permanente.» | Pasa al acierto, a la vista: «Estos ajustes solo se dan en el sistema permanente.» Cambio «se presentan» por «se dan»: con el verbo del libro, la frase daba 57,4 de INFLESZ. El «solo» queda igual. |

---

**Para Misa:** no queda plegado en ninguna de las tres pantallas. Si el componente obliga a tener un «¿Por qué?», que quede vacío y no se pinte.

**Para Mello, dos cosas que se pueden revisar contra la página:**
- Quité «por normas de contabilidad» de la frase de la ley.
- Cambié «se presentan» por «se dan» en la condición del permanente.

En las dos, el límite («al menos», «a más tardar», «solo») sigue igual.
