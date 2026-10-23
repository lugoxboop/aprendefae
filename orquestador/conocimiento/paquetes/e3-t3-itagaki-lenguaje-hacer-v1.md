# Paquete e3 · T3 · P2: el lenguaje visual de los Hacer · Itagaki, v1 (23-oct-2026)

> Entrega de Itagaki (diseño, Célula E) al encargo de Kamogawa del 23-oct. Va literal, salvo el formato.
> Corrección de Kamogawa: en §7 la medición se le asignaba a «Sai»; en la Célula E, quien mide es **Ippo**.
> Son cuatro objetos nuevos y reutilizables para los Hacer que defina Miyata (`e3-t3-miyata-v1.md`, B). **Solo se agrega:** no cambia ningún id ni ningún texto aprobado. No se toca ningún componente compartido. Los rótulos son literales ya publicados de T3.

## 1 · Tokens comunes (estándar §4–§6)

**Contenedor:** 258 px a 320 y 313 px a 375 [pantalla, Sai, 13-oct]. Cada objeto va en un **contenedor hundido**: fondo rgba(10,20,34,.45), borde de 1 px rgba(248,249,250,.12) y relleno de 12. **Ancho útil: 234 / 289 px.**

- El hundido sobre el Panel #1F2D3D da ≈ **#16222F** [calculado, mezcla al 45 %].
- El interior de la cuenta T es **#0D1725** [Xeno, 15-oct].

| Token | Valor | Contraste [calculado, WCAG] |
|---|---|---|
| Texto | #F8F9FA | 15,3 sobre el hundido |
| Atenuado (montos anteriores, rótulos) | #A8B6C8 | 7,8 sobre el hundido · 8,74 sobre el interior de la T |
| Nodo (rellenos y marcas) | #CBDCF2 | 11,5 |
| Carril quieto | #8C9BB0 | 5,7 |
| «Debe», texto 12/700 | #2A9D8F | 4,84 sobre el hundido · 5,42 sobre el interior de la T |
| «Haber», texto 12/700 | #E9C46A | 9,6 · 10,78 |
| Contorno en reposo | 1 px rgba(248,249,250,.35) | 3,07 (≥ 3, lo que pide un elemento que no es texto) |
| Elegido, correcto o revelado | 2 px #F8F9FA | — |
| Error | 2 px #E76F51 (texto sobre su tinte: #EE8266) | 5,2 el borde |

**Cifras**
- Fuente ui-monospace, SFMono-Regular, Menlo, Consolas, con `tabular-nums`, a 14 px (a 13 si a 320 no cabe), en formato **$1.240.000**.
- Cada carácter mide **0,6 em** [pantalla, Ippo #360: 84 px para 10 caracteres a 14].
- La cifra más larga de T3 (act. 7) es **«$22.868.412»**, de 11 caracteres: mide 92 px a 14 y 86 px a 13.

**Feedback**
- El del estándar, sin cambios.
- Pastilla de 24 px de alto, Inter 12/700, con ícono lucide de 16 px y trazo 2,5.
- Tres estados: **«Correcto»** (Check #F8F9FA), **«No va aquí»** (X coral) e **«Iba aquí»** (sin ícono; aparece a los 0,7 s sobre la pieza donde iba).
- El bloque de mensaje lleva fondo rgba(184,196,212,.12) y una raya de 3 px.

**Toque y foco:** área táctil de 44 × 44 o más. El foco es un anillo de 2 px #F8F9FA, separado 2 px.

**Movimiento:** cubic-bezier(.3,.9,.4,1), solo transform y opacity. Con movimiento reducido, va directo al estado final y sin desplazamiento.

## 2 · Objeto 1 — El asiento de ajuste

**Estructura**
1. **Renglón Debe:**
   - el rótulo **«Debe»** (12/700, teal, 16 px de alto);
   - 4 px de aire;
   - **la casilla de la cuenta**: todo el ancho, alto mínimo de 44, relleno de 10 / 12, Inter 14/20; el texto se parte en líneas;
   - 6 px de aire;
   - **la casilla del monto**: 120 × 44, a la derecha, cifra en mono 14 y «$» fijo.
2. 12 px de aire.
3. **Renglón Haber:** igual, pero **sangrado 16 px** y con el rótulo **«Haber»** en ámbar.

**Alto:** 12 + 2 × (16 + 4 + [44 a 64] + 6 + 44) + 12 + 12 = **264 a 304 px**.

«Arriendos recibidos por anticipado» (34 caracteres, 238 px en Inter 14) **se parte en 2 líneas a 320**, porque solo caben 210 px en el debe y 194 en el haber. **A 375 cabe en 1 línea** (265 px).

| Estado | Casilla de la cuenta | Casilla del monto |
|---|---|---|
| Vacío | Contorno en reposo y «Elige la cuenta» en #A8B6C8 | Contorno en reposo y «$» en #A8B6C8 |
| Foco / presionado | Anillo de foco / escala 0,98 | Igual |
| Abierto | La hoja «Elige la cuenta» de la act. 3, con su «Cancelar» | Teclado numérico, con los puntos de miles automáticos |
| Lleno | Contorno en reposo y texto #F8F9FA | La cifra en #F8F9FA |
| Revisado bien | 2 px #F8F9FA y la pastilla «Correcto» debajo | Igual |
| Revisado mal | 2 px coral y «No va aquí»; a los 0,7 s, «Iba aquí: {cuenta}» con 2 px #F8F9FA | «Iba aquí: $X» |
| Dado (como en la act. 4) | Ficha llena, de solo lectura y sin contorno | Igual |

**Accesibilidad:** cada casilla es un botón con nombre, «Debe, cuenta: {valor o vacía}». El error se anuncia como «Incorrecto.».

## 3 · Objeto 2 — La línea del devengo

**La gramática** es la de las dos líneas de «Vender no es cobrar», que Ukyo dejó como modelo («no se toca lo que ya funciona»):
- **Arriba**, la pista «Ingresos y gastos», con marcas **cuadradas**.
- **Abajo**, la pista «Caja: entra y sale plata», con marcas **redondas**.
- **Marca llena** = suma (ingreso o entrada). **Marca vacía** = resta (gasto o salida). El **tallo** marca la dirección.
- Los rótulos son los literales de `ROTULO_PISTA`.

**Tres zonas en el eje del tiempo**, con los literales de la act. 6 y de la pieza 3:

| Zona | A 320 | A 375 |
|---|---|---|
| **«Antes»** | 40 px | 48 px |
| **Periodo**, con fondo rgba(184,196,212,.10) | 130 px | 161 px |
| **«Después»** | 64 px | 80 px |

El borde entre el periodo y «Después» es una raya vertical de 2 px #F8F9FA, con el rótulo **«Cierre del mes»** (`ROTULO_CORTE`). La escala la fija cada ítem (días o meses dentro del periodo), y la calcula Ippo con los datos del ítem.

**Alto: 164 px en los dos anchos.** Se suma así:
- 12 de margen;
- 16 de los rótulos de zona y 4 de aire;
- la pista de arriba, de 48 (rótulo de 16, carril de 2 px #8C9BB0 y 30 de marcas);
- **24 del corchete**;
- la pista de abajo, de 48;
- 12 de margen.

**El corchete** va entre las dos pistas. Une la x del hecho con la x de la plata con una línea de 2 px #F8F9FA, topes en los extremos y un rótulo centrado:
- **«Retardo»** si la plata llega después (es un acumulado);
- **«Diferido»** si la plata llega antes.

Es lo que el tema enseña, a la vista de un vistazo. **Si el hecho y la plata quedan a menos de 4 px (E11), no hay corchete:** solo cifras.

**Las marcas**
- Miden 12 px, con un tallo de 10 px.
- La actual va en #F8F9FA; las anteriores, en #B8C4D4, como en la pieza 1.
- **Para colocarla**, se toca el carril y la marca se ajusta a la unidad más cercana. El área táctil es de 44 × 44.
- **Con teclado**, cada marca es un deslizador (`role="slider"`): las flechas la mueven una unidad, y su texto de valor es «{fecha}».

| Estado | Detalle |
|---|---|
| Vacío | Los carriles, sin marcas |
| Colocada | La marca en #F8F9FA |
| Bien | Anillo de 2 px #F8F9FA y la pastilla «Correcto» |
| Mal | Contorno coral y «No va aquí»; a los 0,7 s, la marca correcta con 2 px #F8F9FA y «Iba aquí» |

**Movimiento:** la marca cae 8 px en 200 ms; el corchete se dibuja del hecho hacia la plata en 300 ms.

## 4 · Objeto 3 — La cuenta T antes y después del ajuste

**Estructura** (fondo interior #0D1725):
1. **El nombre de la cuenta**, en Inter 14/600 #F8F9FA. Ocupa 20 px en una línea y 40 en dos.
2. 6 px de aire.
3. **El travesaño**, de 2 px #B8C4D4.
4. **La cabecera**, de 18 px: «Debe» en teal y «Haber» en ámbar, en texto 12/700. Se mantiene el **▲ de la act. 4**, de 10 px #B8C4D4, junto al lado por donde crece la cuenta; su nombre accesible es «crece por el debe».
5. **La línea central**, de 2 px #B8C4D4.
6. **Los renglones**, de 28 px cada uno:
   - **Antes:** el saldo, en mono 14 **#A8B6C8**, como los montos anteriores de la pieza 1.
   - **Ajuste:** el valor en #F8F9FA, en su columna.
   - **Saldo:** debajo de una raya de 1 px, el rótulo «Saldo» (12, #A8B6C8) y la cifra en mono 14/700 #F8F9FA, en la columna de su naturaleza.

**Columna:** (234 − 2) / 2 = **116 px a 320**, de los que 100 son útiles; «$22.868.412» a 14 (92 px) cabe. A 375, la columna mide 143 px.

**Alto:** 12 + 20 + 6 + 18 + 3 × 28 + 1 + 12 = **153 px** con el nombre en una línea, y 173 px con dos.

**Antes y después es una sola T que cambia, no dos T lado a lado**, porque a 320 no caben:
- **Antes**, el saldo se ve en gris.
- **Después**, entra el renglón del ajuste (fundido con un desplazamiento de 6 px, 240 ms) y el saldo cuenta hasta su valor nuevo (400 ms).

## 5 · Objeto 4 — El resultado del periodo

**Estructura**
1. **Leyenda** (16 px): una muestra rayada con «lo del ajuste». Aparece **solo** si hay ajuste.
2. 8 px de aire.
3. **Renglón «Ingresos»** (34 px): el rótulo (Inter 13) y la cifra en mono a la derecha; debajo, una barra de 12 px **llena** de #CBDCF2.
4. 8 px de aire.
5. **Renglón «Gastos»** (34 px): igual, pero la barra va **vacía**, solo con un contorno de 2 px #CBDCF2. Es la misma gramática de la pieza 1: lo lleno suma y lo vacío resta.
6. 8 px de aire.
7. **Renglón del resultado** (28 px): un corchete de 2 px #F8F9FA desde el final de la barra de gastos hasta el final de la de ingresos, con **«Utilidad $X»** o **«Pérdida $X»**. Lleva la palabra, no solo el color.

**Alto: 160 px.** La escala se fija por ítem: el mayor de los dos valores ocupa el ancho completo (234 / 289 px).

**Con un ajuste:**
- El ajuste entra como un **tramo rayado** al final de la barra que toca, con rayas de #0E1B2E (la corrección de Takamura).
- El corchete se desplaza en 400 ms y la cifra del resultado cuenta hasta su valor nuevo.
- **Si el cambio mide menos de 4 px (E11), solo cambian las cifras.**

## 6 · Convivencia con los 7 Hacer publicados

| Hacer | Ya usa algo equivalente a | Cómo se evita que se noten dos estilos |
|---|---|---|
| Act. 1 «¿Ingreso o cobro?» | Ninguno de los cuatro objetos | No hace falta nada |
| Act. 2 «¿Cuándo se causa?» | El objeto 2: marcas en orden, pero sin escala | Se usan su toque sobre la marca y su pastilla. La actividad no se toca; si algún día converge, será en otro lote |
| Act. 3 «El mismo hecho, dos empresas» | **El objeto 1** | El objeto 1 copia sus literales («Elige la cuenta», «Debe», «Haber», «Monto:») y su feedback casilla por casilla. Sus superficies prohibidas ya las está repintando Xeno |
| Act. 4 «Arma el ajuste acumulado» | Los objetos 3 y 1: cuentas T con ▲ y fichas dadas | El ▲ y la ficha dada se conservan iguales |
| Act. 5 «Arma el ajuste diferido» | Los objetos 3 y 1, con el valor escrito | La casilla del monto es la misma |
| Act. 6 «¿Qué le toca a este periodo?» | El objeto 2: las zonas «Antes» y «Después» y el corte | Los literales y el tono de la banda del periodo son los mismos |
| Act. 7 «El cierre completo» | El objeto 4: el saldo de Ganancias y pérdidas | El corchete del resultado no reemplaza a su renglón de saldo; los dos conviven |

## 7 · Lo que no está verificado

- No se renderizó nada, y no se midieron los componentes publicados de las act. 2 a 7.
- ⛔ **Ippo: mide a 320 el alto de las casillas y de la hoja de la act. 3. Si se apartan en más de 4 px de 44 px y de la hoja de r5, detente y avisa: el objeto 1 se iguala a la act. 3.**
- El ▲ de la act. 4 sigue a ojo, en unos 10 px (#4 de Ukyo, sin medir).
- La banda del periodo, al 10 %, no tiene contraste que medir porque es fondo. Lo que se lee encima es texto #F8F9FA.
