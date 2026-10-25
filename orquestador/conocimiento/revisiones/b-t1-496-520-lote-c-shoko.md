# T1 · Auditoría del #496 (línea «contrario»), el #520 y el lote C de Futaba (Shoko, 24-oct)

La subió Sakuta tal como salió del chat de Shoko. Se audita sobre las capturas de 7c2296d y sobre fichas/b-t1-lote-24oct-c-futaba.md.

**#496 · FALLA · la línea «contrario» dice algo falso en el caso que me mandaste.** Elegiste $275.000 en lo que tiene, y eso no es «el total para el otro lado»: ninguna parte totaliza 275.000 en el hecho 2 (lo que tiene 325.000, lo que debe 25.000, los dueños 300.000). 275.000 es 300.000 − 25.000, o sea restó en vez de sumar. Decirle al estudiante que ese total «va para el otro lado» lo manda a buscar un error que no cometió: D1 por afirmación falsa y D6 porque explica la razón equivocada. La segunda frase sí le sirve tal cual. La entrada «En {parte}:» quedó bien y la verifiqué también en la captura anterior, donde solo falló una parte.

| Dónde | Hoy | Pegar |
|---|---|---|
| t1-5 · decisión 2 · clase «contrario» | En {parte}: ese total va para el otro lado. Fíjate si con este hecho esa parte crece o se achica. | En {parte}: ese total va en el sentido contrario. Fíjate si con este hecho esa parte crece o se achica. |

Y dime en una línea qué clase cae cuando se elige $325.000 en lo que debe (ese sí es el total de la otra parte). Si cae en «contrario» también, una sola clase está cubriendo dos errores distintos y D6 baja a Medio; si tiene clase propia, cierro el PASA con el cambio de arriba, sin otra captura. El empuje a 320 va a su PR y no me frena este.

**#520 · PASA · sin otra vuelta conmigo.** Fusiona cuando T1-7 esté en la rama y el CI quede verde; no necesito verlo antes.

**Bloque 1 (mis textos aplicados) · FALLA · tres cambios.** Los 13 aciertos de t1-6 están correctos uno por uno en la parte que asignan, pero dos pasan el tope de 25 de los Hacer; y «por eso dan igual» en p2o1 choca con el concepto mismo de la pantalla (el estudiante puede leerlo como «los dos lados dan igual»), que es lo último que quiero ambiguo ahí.

| Dónde | Hoy | Pegar |
|---|---|---|
| cu0-a2 · 2.ª visita · p2o1 | Esa frase es cierta: por eso dan igual. Se busca la que dice lo contrario de la regla. | Esa frase es cierta: no es la que se busca. Falta la que contradice la regla. |
| t1-6 · T:522 · c6-13 (27 palabras) | …en el activo. Es plata que la empresa puso a producir en otra parte y va a tardar en volver. | …en el activo. Es plata puesta a producir en otra parte, y tarda en volver. |
| t1-6 · T:523 · c6-14 (28 palabras) | …en el pasivo. Es lo que la empresa calcula que va a tener que pagar por arreglos de lo que vendió. | …en el pasivo. Es lo que calcula que va a pagar por arreglos de lo vendido. |
| t1-6 · T:519 · c6-10 (queda en 25 justo) | …en el activo. Es plata que la empresa puso a producir en otra parte y puede recuperar pronto. | …en el activo. Es plata puesta a producir en otra parte, y se recupera pronto. |

El de c6-10 no está sobre el tope: lo cambio para que la pareja corto/largo plazo quede paralela, que es donde está la enseñanza.

**Bloque 2 (los 30 recortes) · FALLA · tres recortes perdieron el porqué, y una decisión mía.** Conté las 30: todas quedan en 18 o menos y 27 conservan lo que decían. Las tres de abajo no: dos botaron justo la parte que corrige al estudiante, y en D2 el dos puntos deja leer que la película compara las dos fotos, que es falso. En las tres cabe la versión completa dentro de las 18.

| Dónde | Hoy | Pegar |
|---|---|---|
| a4 · 5 · «Al de la plata» | La plata tiene su propio informe. Lo que vendió y gastó llega a la foto. | La plata tiene su informe. Lo que vendió y gastó llega a la foto y cambia cómo queda. |
| a4 · 9 · p4o2 | Va al revés. La foto del final necesita lo que calculan los otros dos. | Va al revés: la foto del final necesita lo que calculan los otros; la del comienzo va primero. |
| a3 · 8 · error D2 | Te preguntan cuánto cambió algo entre dos fechas. La película no lo muestra: compara las dos fotos. | Te preguntan cuánto cambió algo entre dos fechas. La película no lo muestra; compara tú las dos fotos. |

Decisión sobre ERROR_P3: un solo juego para t1-5 y H1, el corto. Dos textos para el mismo error se separan en la primera corrección y después nadie sabe cuál vio el estudiante.

**Bloque 3 («Ocho leen lo mismo») · PASA · falta la medición de Mai a 320 antes de fusionar.** No repite lo que le quité a la capa 3: lo que quité fue el par de rótulos a la vista sin decisión de por medio, y aquí no hay rótulos, hay decisión, y ningún paso coincide con una zona, así que la pieza no le entrega la respuesta a t1-1 —la prepara, que es distinto—. El reparto 2/2 y 1/3 es correcto frente al capítulo 1 y las tres parejas que se confunden quedan separadas. Lo único abierto es D7: cuatro nombres en fila a 320 con «Administradores» y «Inversionistas» adentro. Si en la medición de Mai alguno se parte en tres renglones o aparece scroll horizontal, eso es FALLA de D7 y la fila pasa a 2×2, no los nombres.
