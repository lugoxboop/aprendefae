**T4 · A4 y H8 · cambios de la versión 3** (hallazgos de Hanayama al diseñar las pantallas, obligatorios por decisión de Yujiro).
- Autora: Katsumi.
- **Aplicados también en:**
  - los paquetes base: `d4-t4-a4-v1.md`, `d4-t4-h8-v1.md` (regenerado) y `d4-t4-h7-h8-serie2.md` (H8 serie 2);
  - los generadores `scratchpad/katsumi/gen2/h8.py` y `h8s2.py`.
- H8 se regeneró y lo comparé con la versión anterior. Solo cambia lo que dice aquí.
- **Lo que encontré al comparar:** tres líneas de H8 que yo había corregido a mano en 1210402 (el encabezado, la nota «H8 no depende de H7» y dos referencias a «las de H7») **no estaban en el generador**. Una regeneración las habría devuelto a su forma vieja. Ahora sí están en el generador.
- INFLESZ medido tal cual y sin corte en «p.» y «Ltda.». Todo lo nuevo pasa de 65. Copia: 0 coincidencias.

# A4 · P7 «Por qué no coinciden»

**Problema (Hanayama):** la lista de las seis causas, agrupadas por quién se enteró primero, iba antes de la pregunta «¿Quién tiene anotado ese cheque?», y la respondía.

**Decisión mía: muevo la lista después de la pregunta, como cierre de la pantalla.**
- La agrupación es la lección. Como cierre, ordena lo que el estudiante acaba de razonar con un caso.
- Reescribir la pregunta para que la lista no la responda la haría más rebuscada, sin ganar nada.

**Orden nuevo de P7:**
1. «El libro dice que el saldo del extracto casi nunca coincide con el de la empresa, y da seis causas. Antes de verlas, piensa en una.» (93,2; p. 188)
2. La pregunta y sus tres opciones. Ningún texto cambia.
3. **Con el acierto**, como cierre: «Estas son las seis causas del libro, según quién se enteró primero:» (91,0), y después la lista agrupada de siempre.
   - Va **solo con el acierto**, no «en cualquier caso», porque la lista revela la respuesta y la pieza deja «Probar otra». Es la regla de los errores que no revelan, de la v2.

# H8 · Etapa 3: el saldo conciliado ya no está a la vista

**Problema (Hanayama):** la etapa que más pesa de un Hacer de 90 FP se podía copiar. El saldo conciliado estaba a la vista, y era la respuesta de la etapa 3.

**Decisión de Yujiro, aplicada en las dos series.** Reemplaza la decisión anterior de dar los dos saldos conciliados como dato:
- **Datos de partida:** las nueve partidas y el saldo en libros. Ni el saldo conciliado ni el extracto.
  - *[Quitar el extracto es decisión mía: H8 no lo necesita, y con él a la vista el estudiante podría hacer la conciliación del lado del banco y llegar a la cifra sin asentar nada. Aparece en el acierto de la etapa 3.]*
- **El estudiante** asienta (etapa 2) y calcula el saldo del mayor (etapa 3).
- **Solo al acertar la etapa 3** aparece la confirmación de que es el mismo saldo conciliado.

**Textos nuevos o cambiados:**

| Dónde | v2 | **v3** |
|---|---|---|
| Consigna 1, serie 1 | «Los Cerezos ya concilió su cuenta: el saldo del banco y el de los libros, corregidos, dan $2.551.700. …» | «Los Cerezos comparó su cuenta con el extracto del banco y encontró nueve partidas. El saldo de sus libros es $2.484.800.» (83,6) |
| Consigna 1, serie 2 | «El Mirador ya concilió su cuenta: … dan $3.377.500. …» | «El Mirador comparó su cuenta con el extracto del banco y encontró nueve partidas. El saldo de sus libros es $3.090.900.» (83,6) |
| Consigna 2, las dos series | «Primero, elige qué partidas se asientan. …» | «Ahora la empresa tiene que corregir sus libros. Primero, elige qué partidas se asientan. Después, arma cada asiento. Al final, calcula el saldo de Bancos en el mayor.» (77,5) |
| Etapa 3, acierto, serie 1 | «Así es. Es el mismo saldo conciliado. …» | «Así es. Y fíjate en algo: el extracto decía $1.874.300. Si le sumas la consignación pendiente y le restas los cheques sin cobrar, también da $2.551.700. Es el saldo conciliado: los libros ya dicen la verdad.» (85,3) |
| Etapa 3, acierto, serie 2 | ídem | lo mismo con $3.216.800 y $3.377.500 (85,3) |
| Etapa 3, «cualquier otra cifra» | «… tiene que dar lo mismo que el saldo conciliado, que está a la vista. …» | «El saldo del mayor es el de los libros, más lo que el banco sumó y menos lo que el banco restó. Revisa los cinco asientos.» (100,4) |

- **Las sumas del acierto las comprobó el script:** 1.874.300 + 1.265.000 − 587.600 = 2.551.700, y 3.216.800 + 947.500 − 786.800 = 3.377.500.
- **Lo que sigue sin suponer que se jugó H7:** la consigna dice que **la empresa** comparó su cuenta, no el estudiante. Ningún texto dice «la conciliación que hiciste».
- **Lo que no cambia:**
  - los tres errores con cifra de la etapa 3. No nombran el saldo conciliado, sino lo que le falta o le sobra al cálculo;
  - las etapas 1 y 2.

## Erratas que tocan estas piezas

Sin cambios.
