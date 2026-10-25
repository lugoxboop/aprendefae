# Auditoría T2-9 · verificación final de #548, los cinco Aprender de T2 en secuencia

Mello → L · 24 de octubre de 2026. PR #548 en `41ae301`, leído en el repo en solo lectura.

**Criterios:** mis S1–S13 (línea base T2-1), el Kit y el contrato de `aprender-secuencia-v1.md`.

**Cómo lo verifiqué:**
- Leí una sola vez, de pies a cabeza, el PR, los datos, las cinco figuras y lo compartido que usan.
- **Pruebas.** `t2-secuencia` y `secuencia` dan 78 de 78. `faltasDePieza` da `[]` en las cinco.
- **Build temporal** con la bandera encendida, fuera del repo. Lo recorrí con el `medir-t2-sec.mjs` del PR a 320 × 568 y a 375 × 667: 176 estados por ancho, con las fuentes reales.
- **INFLESZ** de los 76 textos de 10 palabras o más, con el medidor oficial.
- **Capturas** a 320 px y a media escala, al final (§6).

**Lo que no cuenta como falla, como dijiste:**
- `<Veredicto />` todavía no se pinta, porque espera a #536. Por eso la pista y el porqué existen en los datos, pero aún no se ven.
- La página vieja con CuatroCapas sigue intacta.

## Veredictos

| Pieza | Veredicto | Lo mínimo |
|---|---|---|
| P1 · De qué está hecha una cuenta | **FALLA** | Lote A (barajar) y lote B (pie de página). Las cifras de Caja y del cierre salen de los datos. |
| P2 · Las dos familias | **FALLA** | Lote A y lote B. Las seis cuentas de P2·7 están ordenadas por respuesta. |
| P3 · El debe y el haber | **FALLA** | Lote A y lote B. Además: un porqué por opción mala en P3·7, el préstamo desde los datos y P3·3 a 40 palabras o menos. |
| P4 · La partida doble | **FALLA** | Lote A y lote B. Además: palabras partidas en la balanza y el texto del control «Partida doble». |
| P5 · Del diario al mayor | **FALLA** | Lote A y lote B. Además: P5·5 a 40 palabras o menos. |

Las cinco fallan sobre todo por **dos faltas comunes**, y cada una se arregla con una sola corrección por lotes (§1). Lo demás son una o dos líneas por pieza (§2), con los textos ya medidos.

**Lo que está bien en las cinco:**
- **Gancho:** la apertura se arma sola y la primera decisión (una predicción) está en la pantalla 2. Llega con 21 palabras o menos (S3).
- **Hilo:** cada pieza vuelve en el cierre al objeto con que abrió: Caja, los cajones, la mesa, la balanza y el diario del 3 de enero.
- **S9:** las diez confusiones que pedí están expuestas en un caso (tabla de §3).
- **D3 y la escalera:**
  - Al primer error salen ✕, la consecuencia punteada en coral en la figura y «Siguiente» bloqueado.
  - Al segundo, lo correcto con borde blanco y «Siguiente» libre.
  - La figura nunca guarda un estado falso: el saldo de P1·6 cambia solo con el acierto, y los totales de P4·8 dicen «$?» hasta acertar.
  - Ninguna pieza dice «Iba aquí» (S5).
- **Medida (S12), a 320 y a 375:**
  - 0 problemas de contraste en 2.512 medidos;
  - 0 textos de menos de 12 px en 2.669 medidos;
  - 0 objetivos de menos de 44 px en 352 medidos;
  - sin desplazamiento lateral, 0 errores de JS y la ficha no tapa nada;
  - las figuras caben en su alto: P1 182/183, P2 166/171, P3 178/180, P4 179/181 y P5 194/197 a 320, iguales a los tuyos;
  - el bloque de navegación se fija bien.
- **S11:** todo está en «tú». De los 76 textos, solo dos bajan de 65, y son citas textuales del libro marcadas `textual`: «Cuenta» (40,1) y las tres definiciones de P2·5 (59,1).
- **S13:** las piezas van de una en una, con «Siguiente pieza», y la última termina en «Ir a Hacer», que lleva a `#/cuentas-debe-haber/hacer`. Al recargar, vuelve a donde estaba.
- **No borra nada.** Los `id` son los mismos de antes, y con la bandera apagada la vista pinta lo mismo que main (lo prueba el PR).

## 1 · Las dos correcciones por lotes

### Lote A · nada se baraja (S7, D8)

Ninguna de las cinco piezas importa `utils/barajar.js`, y `SecuenciaAprender` tampoco baraja. Las opciones salen siempre en el mismo orden. En P3·7, la buena es siempre la segunda. En P2·7 es peor: las seis cuentas llegan con las tres reales primero y las tres nominales después, así que después de la tercera el orden da la respuesta (D5).

**Corrección.** Un solo ayudante en `secuenciaComun.jsx` que baraje una vez con `barajar` y guarde el orden en el estado de la pantalla, para que «Anterior» no lo cambie. Se usa solo donde el orden no significa nada:

| Pantalla | Qué se baraja |
|---|---|
| P1·6 | «Sube» y «Baja» |
| P2·4 | los cajones Gastos y Costos |
| P2·6 | «Sí, se cierra» y «No, sigue abierta» |
| P2·7 | **el orden de las seis cuentas** |
| P3·4 | las dos opciones |
| P3·7 | las tres opciones |
| P4·6 | las tres opciones |
| P4·8 | las dos opciones |
| P5·6 | las dos opciones |

**No se barajan**, porque el orden es la lección:
- debe a la izquierda y haber a la derecha (P1·5 y P5·5);
- las casas y los platillos de la ecuación (P3·3 y P4·3);
- los cajones «Sigue» y «Vuelve a cero»;
- las predicciones, que no se califican.

Va con una prueba al estilo de `barajado-por-intento-c`: el mismo orden dentro de la visita y otro orden con otra semilla.

### Lote B · falta el pie de página (S10, contrato §16 b)

El contrato pide «Basado en el libro, pp. …» en la zona de razón del **cierre**, una vez por pieza. Ninguna de las cinco lo tiene. Las páginas están en los comentarios de las figuras: P3, pp. 89, 90, 93 y 113; P4 y P5, Lavado pp. 98-101. Que Near confirme la lista de cada pieza; Misa agrega `razon` a los cinco cierres.

## 2 · Lo de cada pieza

### P1 · FALLA (lotes A y B, más S10)

- **Cifras escritas a mano (S10).** `CAJA = { entra: [1000, 500], sale: [150] }` está en la figura, pero ya existe en los datos: `contabilidadAprender.js`, `DE_QUE_ESTA_HECHA.ejemplo` (`debitos`, `creditos`). Se importa de ahí.
- **El cierre.** `{ debe: 50, haber: 30 }` es el ejemplo de la pieza vieja y solo existe como texto. Pasa a `contabilidadT2Secuencia.js`, al lado de `P1_TEXTOS.cierre`, y la figura lo lee de ahí.
- **Cotejé las cifras de los textos contra los datos.** $1.500, $150, $1.350, $250 (ene-18), $4.000 → $3.750 y el error $4.250: todas coinciden.

### P2 · FALLA (lotes A y B)

Lo de P2·7 está en el lote A. Fuera de eso, P2 cumple todo lo demás. Las tarjetas de P2·5 son citas textuales, y el ejemplo de Ingresos ya es el de Near T2-8.

### P3 · FALLA (lotes A y B, más S6, S10 y S2)

- **S6 · P3·7.** Las dos opciones malas tienen confusiones distintas, pero comparten un solo porqué:
  - «vive en el haber» confunde dónde vive con dónde se anota, y ese es el porqué actual;
  - «vive a la derecha» pone el activo con el pasivo y el patrimonio.

  Porqué para «a la derecha»: «Pusiste Maquinaria con el pasivo y el patrimonio. Es un activo y vive a la izquierda.» (16 · 78,1)
- **S10 · P3·4.** `PRESTAMO = { cajaAntes: 1000, monto: 500 }` está escrito a mano.
  - `monto` sale de `cu6-pagare` (`TRANSACCIONES_SUELTAS`, p. 89).
  - `cajaAntes` es el `saldoInicial` de Caja en `PIEZA_DEBE_Y_HABER.exploracion` (1.500, p. 90) menos el pagaré. Da 1.000, que coincide con el texto.
  - `FICHA_100` se cambia por `T.pruebaTu.fichas[0]`.
- **S2 · P3·3.** Tiene 48 palabras de texto, y el tope es 40. Se quita la primera oración, «Cada cuenta crece por el lado en que vive dentro de la ecuación.», que el cierre ya dice como titular. El apoyo queda en 24 palabras (89,7) y la pantalla en 33.
- **Cotejé las cifras:** Maquinaria $0 → $50.000 (cal-3) y Aportes sociales $400.000 → $350.000 (cal-1 + cal-5 − cal-6) coinciden.

### P4 · FALLA (lotes A y B, más el pulido y un texto de Misa)

- **Palabras partidas a 320 (S12, la misma regla que corrigió Watari en T2-4).** En los platillos, `Renglon` usa `overflowWrap: anywhere`, y parte las palabras:
  - «Equipo de comput|ación» en P4·2 y P4·3;
  - «Flota y equipo de transport|e» en P4·8 y P4·9.

  Se ven en las capturas. La corrección es la de Watari: cortar por palabra (`overflow-wrap: break-word`, `hyphens: auto` con `lang="es"`). Si el nombre no cabe, va en su propia línea y la cifra debajo.
- **El control «Partida doble» no pasa.** Es un nombre: no dice qué pasa al tocarlo, y repite el titular. Debe decir **«Aplicar la regla»**, porque el apoyo dice «Mira la regla…» y al tocarlo llega la segunda línea.
- **Cotejé las cifras:** Bancos antes del 30 de enero $2.250, la hipoteca $8.000 → $7.600 y el error $8.400, $50.000 contra $0, y $4.800 contra $4.800 en ene-04. Todas salen de los datos y coinciden con los textos.
- **Nota, no es falla · P4·5.** Las tres familias van al mismo grupo, y la misma pantalla dice la regla. Es una decisión que no decide nada. Si Near quiere más demanda, puede mezclar una familia de la primera regla, con su plantilla de porqué. La pieza ya tiene otras tres decisiones reales, así que S4 se cumple igual.

### P5 · FALLA (lotes A y B, más S2)

**S2 · P5·5.** Tiene 44 palabras, y la orden sale dos veces: el apoyo termina con «Lleva las cuatro líneas del 3 de enero.» y la razón dice «Lleva las cuatro líneas a su T.». Se quita la oración del apoyo y la pantalla queda en 36 (el apoyo, 92,7).

### Los textos de controles que escribió Misa

| Control | Veredicto |
|---|---|
| «Registrar» (P3·2) | Pasa. Es el verbo del libro y dice qué pasa. |
| «Partida doble» (P4·2) | **No pasa** → «Aplicar la regla». |
| «Debe» y «Haber» (P3·6) | Pasan. Son el destino de la ficha, en neutro como pide el rol del color, y el apoyo dice «en cualquier lado». |
| Fichas «$100», «$500» y «$1.000» (P3·6) | Pasan. Salen de `T.pruebaTu.fichas` con el formato de pesos. |

Al aplicar los cambios, se quitan los dos comentarios `PENDIENTE_DE_REVISION`.

## 3 · S9 · las confusiones de cada pieza

| Pieza | Confusión | Dónde |
|---|---|---|
| P1 | «debe = aumenta» | P1·6: el debe de Cuentas por pagar baja la deuda. Contrasta con el debe de Caja, que sube. |
| P1 | «el saldo va del lado del último valor» | P1·5 |
| P2 | «transitoria = poco usada» | P2·6 |
| P2 | gasto o costo | P2·4 |
| P3 | el mismo lado tiene efectos distintos | P3·1, P3·2 y P3·7 |
| P3 | entrar plata no es ganar | P3·4 |
| P3 | dónde vive contra dónde se anota | P3·3 y P3·7 |
| P4 | «el débito siempre suma» | P4·6 |
| P4 | «compuesto = descuadrado» | P4·8 |
| P5 | «mayorizar cambia la columna» | P5·5 |
| P5 | «el mayor va por fecha» | P5·1 y P5·6 |

## 4 · C1 entre Aprender y Hacer

Las correcciones van en **#499**, no en #548.

1. **«Cuadra por valor» E3 (obligatoria; el error es mío, de T2-3).** E3 quiere que el estudiante reste: 650 − 400 = 250. Pero el Aprender ya le da los dos números: P1·6 muestra el pago de $250 del 18 de enero, y P4·6 el de $400 de la hipoteca. Con eso, E3 vuelve a ser comparar una cifra con otra de memoria. Lo arreglo cambiando el cheque:
   - hecho: «Con un cheque de $760 abona $400 a la hipoteca y el resto a la deuda del computador.» (18 · 74,6);
   - se muestra: Cuentas por pagar **630** D · Hipoteca por pagar 400 D · Bancos 760 H;
   - porqué: «La deuda del computador recibe lo que queda del cheque: $360. Aquí dice $630, y la diferencia de $270 se divide por 9.» (23 · 68,0);
   - retro de Bancos: «Viste que no cuadra y culpaste al total. El cheque fue de $760, y eso dice Bancos. Revisa los abonos.» (20 · 91,1).

   Sigue siendo único: solo 630 → 360 explica la diferencia de 270.
2. **«Las que vuelven a cero» (obligatoria; también se me pasó en T2-3).** Tres de sus ocho cuentas ya se clasificaron en P2, con la respuesta a la vista:
   - **VC·3 Gastos de operación** es el mismo ítem de P2·6, con la misma trampa de «se mueve mucho»;
   - **VC·1 Ingresos por servicios** se vacía en P2·1, P2·3 y P2·7;
   - **VC·7 Costo de ventas** sale en P2·4 y P2·7.

   Se cambian por nominales que no estén en P2, y la utilidad de $10.500 no cambia, porque los saldos quedan iguales. Del repo propongo «Ingresos por intereses» para VC·1 y «Gastos por arriendo» para VC·3, que conserva la trampa porque se paga cada mes. Para VC·7 hace falta un segundo gasto con su porqué y su retro, porque T2 no tiene otro costo. Near confirma los nombres con `node scripts/canon.mjs` y mide los textos.

   Caja (VC·8) se queda: su trampa, que cobrar es Caja, es otra.
3. **Sin cambios, por riesgo bajo:**
   - El Bancos de P5 muestra $500 el 12 de enero, que es la respuesta de K2. Pero K2 se resuelve con 2.500 − 2.000, que está a la vista.
   - P4 y P3 usan cal-2 y cal-3, que también usa J2. Pero J2 se decide con las sumas.
   - «Del diario al mayor» ya no usa ene-03.

## 5 · Una nota para Erwin, no es falla de #548

Los nombres de fase de `SecuenciaAprender` («Mírelo funcionar», «Ahora pruebe usted») están en «usted», y el contenido de T2 está en «tú». Son literales del contrato (§3.1), que son compartidos. Si se cambian, se cambian para todos los temas.

## 6 · Capturas (320 px, a media escala)

Una hoja por pieza con las pantallas antes de decidir y en el acierto, y otra con los dos errores de cada Haz.

![P1](capturas/P1-ok.png)
![P1 errores](capturas/P1-err.png)
![P2](capturas/P2-ok.png)
![P2 errores](capturas/P2-err.png)
![P3](capturas/P3-ok.png)
![P3 errores](capturas/P3-err.png)
![P4](capturas/P4-ok.png)
![P4 errores](capturas/P4-err.png)
![P5](capturas/P5-ok.png)
![P5 errores](capturas/P5-err.png)

## Lo que no hice

- La banda de #536 no existe todavía, así que no pude ver la pista ni el porqué pintados. Los leí en los datos y en `mensajeDe()`.
- Cuando entre #536, la medida de altos se repite con la banda.
