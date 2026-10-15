---
id: e5-mes-en-dos-cuentas
titulo: «El mes en dos cuentas» — panel común de r5-3 y r5-4
celula: E · Hajime no Ippo
procedencia: aprobado por Kamogawa; auditoría de Takamura pendiente
---

# «El mes en dos cuentas» — panel común de r5-3 y r5-4


> Por B3 de `enganche.md`: armar el asiento llenaba renglones y ningún saldo se
> movía. Un solo componente para r5-3 y r5-4, en `src/components/repasoCap5/`.
> Cuentas: **r5-3 · Caja e IVA por pagar**; **r5-4 · Caja y Descuento comercial
> condicionado**. Lo que entra es SIEMPRE la cifra del asiento correcto, aunque
> el estudiante falle (como el libro de r5-2: el error no se cobra dos veces).

### Decisión sobre §0 de Itagaki (estados del armador)

Itagaki propuso «Bien» / «Mal» en cada renglón del armador. **Manda lo que ya
está en vivo en r5-2 v2.1 y va por lote en `comun.jsx`:** la forma de Itagaki
(borde 2 px `#CBDCF2` y punto relleno de 10 px para bien; borde 2 px coral y
anillo coral de 10 px para mal, a la izquierda en la línea del valor, sin que
el renglón crezca) **con las palabras de r5-2**: cuenta «Correcta» / «No va
aquí»; valor «Correcto» / «No es este valor». «ERA ESTE» con borde discontinuo
de 1,5 px `#CBDCF2`. En el armador no queda teal ni ámbar.

### a) El panel

Caja `#1D3557`, radio 12, relleno 12, a todo el ancho del contenido (343 / 288;
interno 319 / 264). De arriba abajo: relleno 12 · marca «EL MES EN DOS
CUENTAS» (14) · 4 · **leyenda** (16): muestra rayada de 16 × 10 (rayas a 45° de
2 px `#CBDCF2` con 2 px de hueco) y «Lo de este asiento» en Inter 12 `#B8C4D4`,
una sola vez · 10 · **cuenta 1: Caja** (130) · separador (14: 6 de aire, línea
de 1 px `#B8C4D4` al 25 %, 7) · **cuenta 2** (130) · relleno 12. **Total 342**
en los dos anchos.

**Cada cuenta (130 px):** nombre (Inter 14/600 `#F8F9FA`, 20 px) · 6 ·
**renglón DEBE** (34): línea de 20 con la marca «DEBE» (10,5 px mayúsculas
`#B8C4D4`), 6 px y el rótulo de Miyata (Inter 13 `#F8F9FA`) a la izquierda, y el
acumulado (Inter 15/600 tabular) a la derecha; 4 px; barra de 10 px: riel
`#0E1B2E` a todo el ancho y relleno **teal** desde la izquierda · 6 ·
**renglón HABER** (34): igual, marca «HABER» y relleno **ámbar** (el color
siempre con su palabra) · 8 px con línea de 1 px `#B8C4D4` al 25 % ·
**diferencia** (22): la frase de Miyata (Inter 14/600) a la izquierda, el valor
(Inter 15/600 tabular) a la derecha, **sin color**; si son iguales, «Sin
diferencia» y 0.

**Escala:** fija para cada cuenta todo el mes (el lado mayor al final del mes
ocupa todo el ancho), calculada una vez desde los datos; las barras solo
crecen. Un tramo nuevo mide como mínimo 8 px. Nunca pasa del riel.
**La cifra más larga** (104.400.000, 11 caracteres) ocupa 90 px: renglón 252
de 264 a 320; diferencia 244 de 264.

### b) Antes, durante y al final

- **Antes del primer asiento:** el panel no existe.
- **En cada «Revisar asiento»:** aparece entre el armador (y «ERA ESTE» si lo
  hay) y el panel de devolución: armador → ERA ESTE → el mes en dos cuentas →
  devolución → Siguiente. Aparece con el estado anterior y luego entra lo de
  este asiento.
- **Lo nuevo sin depender del color:** el tramo de este asiento va **rayado**
  (lo acumulado, liso), con un corte de 2 px `#1D3557` entre los dos; la
  leyenda lo explica. Al revisar el siguiente, lo rayado pasa a liso antes de
  que entre lo nuevo. No se escribe la cifra del tramo (ya está en el armador;
  B5).
- **Pantalla final:** encima del bloque de asientos y del Cierre, el panel en
  cierre: todo liso, sin leyenda; la diferencia de la cuenta central (IVA por
  pagar en r5-3; Descuento comercial condicionado en r5-4) se reemplaza por la
  **frase final** de Miyata (Inter 16/24, peso 600, 2 líneas), con la cifra
  desde los datos; la diferencia de Caja se queda. Alto 352.

### c) Animación

1. El panel aparece (alto 0 → 342, 240 ms) y a la vez la página se desplaza
   hasta dejar su borde superior a 16 px del borde superior de la ventana útil
   (300 ms).
2. Lo rayado del asiento anterior pasa a liso (120 ms).
3. Cada renglón del asiento correcto que toca una de las dos cuentas, en el
   orden del asiento (primero el debe): su tramo rayado crece hasta su nuevo
   final y el acumulado cuenta del viejo al nuevo; 400 ms cada uno, 150 ms de
   desfase.
4. La diferencia cuenta hasta su valor (300 ms); si cambia de lado, la frase se
   cambia con un fundido cruzado (200 ms).

Total hasta ~1,4 s. **Un toque en el panel salta al estado final.**
«Siguiente» funciona siempre (si se toca durante la animación, la completa y
avanza). **Reduced-motion:** aparece en el estado final, ya rayado, sin
desplazamiento suave. En la ventana mientras se mueve: 16-358 (16-374 con la
línea de §d), dentro de 512 a 320 y 611 a 375.

### d) Asiento que no toca ninguna de las dos cuentas (r5-4: 1, 3, 4 y 6)

El panel aparece igual y en el mismo sitio. La leyenda se reemplaza por la
línea de Miyata de ese asiento (Inter 13/18, peso 600, `#F8F9FA`, franja
izquierda de 3 px `#CBDCF2`, 2 líneas: el panel pasa a 358 px). Las barras no
crecen; lo rayado anterior pasa a liso. Si el asiento toca una sola cuenta, la
otra se queda quieta, sin línea.

### Contraste

Teal sobre `#0E1B2E` 5,2:1; ámbar sobre `#0E1B2E` 10,3:1; `#F8F9FA` sobre
`#1D3557` 11,7:1; `#B8C4D4` sobre `#1D3557` 7,0:1; borde `#CBDCF2` sobre
`#1D3557` 8,9:1. El rayado se distingue por textura y por el corte, no por
luminancia.

### Lo que Ippo prueba del panel

- Las cifras de cada cuenta, asiento por asiento, calculadas desde los datos;
  y que entra la cifra correcta aunque el estudiante falle.
- r5-3 al final: IVA haber 22.950.000, debe 10.772.800, diferencia 12.177.200
  con la frase «a pagar»; r5-4: Descuento comercial condicionado haber 939.550,
  debe 2.610.000, diferencia 1.670.450 con la frase «Neto: diste … a quien
  pagó a tiempo.».
- La escala fija (el lado mayor del mes = todo el riel) y el mínimo de 8 px.
- El rayado solo en el asiento en curso.
- La línea de «no toca ninguna» en los asientos 1, 3, 4 y 6 de r5-4.
- E2 en Chromium: el panel entero en la ventana mientras se mueve, a 320×568 y
  375×667.
- B5 y cobertura de pantalla con los textos nuevos.

### Textos · Miyata (literales)

**r5-3 «Marzo en Comercializadora Mate»**

| Cuenta | Rótulo DEBE | Rótulo HABER | Diferencia en débito | Diferencia en crédito |
|---|---|---|---|---|
| Caja | Entradas | Salidas | Entró más que salió | Salió más que entró |
| IVA por pagar | Pagado o devuelto | Cobrado al vender | Te queda a favor | Le debes al Estado |

(«Pagado o devuelto» y no «Pagaste al comprar»: el debe del IVA también lleva
los $2.160.000 de la devolución del 20.)

Frase final del IVA: a pagar «Marzo: $12.177.200 de IVA son del Estado.»; a
favor «Marzo: $X más de IVA pagado que cobrado.» (la cifra, desde los datos).

**r5-4 «Septiembre en Barranquilla»**

| Cuenta | Rótulo DEBE | Rótulo HABER | Diferencia en débito | Diferencia en crédito |
|---|---|---|---|---|
| Caja | Entradas | Salidas | Entró más que salió | Salió más que entró |
| Descuento comercial condicionado | Diste al cobrar | Ganaste al pagar | Diste más | Ganaste más |

Frase final del descuento: ganaste más «Neto: ganaste $X por pagar a tiempo.»;
diste más «Neto: diste $1.670.450 a quien pagó a tiempo.» (este mes sale la
segunda).

Asientos que no tocan ninguna de las dos cuentas (r5-4):

| Asiento | Línea |
|---|---|
| 1 · Compra, día 2 | Lo pagarás después; Caja y descuento esperan ese día. |
| 3 · Devuelves, día 8 | La factura se achica antes de pagarla. Caja no se entera. |
| 4 · Venta, día 10 | Vendes hoy y cobras luego. Hasta entonces, nada se mueve. |
| 6 · Te devuelven, día 15 | Se corrige una venta que aún no se ha cobrado. |

Rótulos fijos de interfaz: EL MES EN DOS CUENTAS · Lo de este asiento · DEBE ·
HABER · Sin diferencia.

**Cifras del mes** (Miyata; Ippo las calcula desde los datos y la prueba las
compara): r5-3 · Caja entradas $61.987.500, salidas $46.594.350, diferencia
$15.393.150 débito; IVA haber $22.950.000, debe $10.772.800, diferencia
$12.177.200 crédito. r5-4 (diez asientos, sin los fletes del 25 y del 28) · Caja entradas
$105.710.000, salidas $25.730.950, diferencia $79.979.050 débito; descuento debe $2.610.000, haber $939.550,
diferencia $1.670.450 débito.
