# Célula E · deuda del estándar (lo que ya está publicado y no cumple)

> Kamogawa, 25-oct-2026. Lo pidió Takamura en el lote 20: un fallo medido en main no puede quedar solo en el cuerpo de un PR. Esta lista va **por urgencia real**, es decir, por lo que hoy ve un estudiante. Cuando un punto se cierra, se tacha y se anota el PR que lo cerró.

| # | Qué | Dónde | Medido | Dimensión | Estado |
|---|---|---|---|---|---|
| ~~1~~ | ~~**«Al debe» y «Al haber» miden 40 px de alto**, por debajo del mínimo de 44~~ | ~~H7 «El cierre completo», el estante (`ElCierreCompleto.jsx`)~~ | ~~Ippo, #601~~ | ~~D7 (Básico incumplido)~~ | **Cerrado en #610**: cara de 44 + canto de 4 (medido: 0 toques < 44 en el estante, a 320 y 375) |
| ~~2~~ | ~~**«Devolver al estante» mide 32 px con letra de 10**~~ | ~~H7, el estante~~ | ~~Ippo, #601~~ | ~~D7 + piso de letra 12~~ | **Cerrado en #610**: en el renglón del estante, cara de 44 y letra de 12 |
| 3 | **24 estados de B1 en H2 a 320:** la primera opción queda entre 305 y 327 px, cuando el tope es 280 | H2 «¿Cuándo se causa?», la segunda decisión | Ippo, #601 (`medir-t3-segunda.mjs`) | B1 | Abierto. Ya estaba así en main, no lo trajo #601 |
| 4 | **Act2 marca la respuesta correcta con relleno claro y «Se causa aquí»**, cuando el estándar pide borde neutro e «Iba aquí» | Act2 | Takamura, en la línea base y su traspaso | Estándar §4.2 | Abierto |
| 6 | **En la mesa de H7, los nombres de las cuentas van en 11 px y «Diferencia: $X» en 11,5**, por debajo del piso de 12; **el campo de cifra mide 42 px de alto** | H7, la mesa y el campo de cifra (`ElCierreCompleto.jsx`) | Ippo, #610 (`medir-t3`: 20 de letra y 1 de toque, ya en main) | Piso de letra 12 + D7 | Abierto. Fuera del delta de volumen: necesita forma de Itagaki |
| 5 | **Lo compartido que reportamos a Erwin:** el encabezado de 167 px rompe B1; «16.67» y «25.00 %» con punto; el 83 % en teal; el «Siguiente» flotante de Act2; letras de 11 y 11,5 px; el panel docente truncado a 320 | Compartido | Takamura, #542 | Varias | De Erwin, #542 |

**Orden de trabajo:** primero 1 y 2, porque los estudiantes los ven hoy y la forma ya está hecha. Después 3 y 4, en el lote del estándar. El 5 no es de la célula.
