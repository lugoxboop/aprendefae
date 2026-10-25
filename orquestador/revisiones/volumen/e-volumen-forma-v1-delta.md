# Volumen · Célula E · delta sobre `e-volumen-forma-v1.md` (Itagaki)

> Lo transcribe Kamogawa tal como lo entregó Itagaki (regla j). **Takamura lo revisa en el lote 21.** Resuelve las dos paradas de Ippo en #601: la matriz de GP (#3) y el estante de H7, que además arrastra dos defectos ya publicados.

Este delta trae solo las dos decisiones que pidió Ippo en #601. Todo lo demás queda igual.

---

## 1 · #3, la matriz de GP: la pastilla se queda dentro de la casilla, con fondo opaco

**Decisión:** la pastilla **no sale** de la casilla. Se queda en su fila de 16 px de arriba, con 4 px a cada lado, como ya está construida. **Lo que cambia es su fondo, que pasa a ser opaco.** **No suma alto.** La matriz sigue en 276 px y sobran 142.

**Por qué no sale:** mi regla 6 quería evitar el #EE8266 sobre la cara N2, donde da 3,49:1. Pero el problema no era dónde va la pastilla, sino que su tinte es transparente y deja pasar la cara de abajo. Además, el canon ya lo prohíbe: «las superficies nunca son `rgba`» (§2.4). **Con fondo opaco, el contraste ya no depende de la cara:**

| Pastilla | Fondo opaco | Texto | Contraste [calculado, WCAG] |
|---|---|---|---|
| «No va aquí» | **#30303B** (el tinte coral al 10 %, mezclado sobre #1C2939) | #EE8266 | **4,97:1** ✓ |
| «Correcto» e «Iba aquí» | **#2F3C4C** (el tinte neutro al 12 %, mezclado sobre #1C2939) | #F8F9FA | **10,7:1** ✓ |

Esto resuelve lo que ninguna de las tres ubicaciones resolvía: **«Iba aquí» tiene que ir sobre la casilla donde iba** (estándar §4.2). Con fondo opaco se queda ahí, sea esa casilla N1 o N2.

**Las otras ubicaciones, descartadas:**
- **Encima o debajo de la rejilla:** a 320, la pastilla mide unos 98 px y la columna mide 85. Si la casilla elegida y la correcta están en la misma fila, sus pastillas se pisan.
- **La columna de rótulos:** mide 56 px y la pastilla no cabe.

**La regla 6 queda así:** «Las pastillas de veredicto llevan fondo opaco: #30303B en el error, #2F3C4C en el acierto y en "Iba aquí". Pueden ir sobre cualquier cara.»

**Para H1 y H2 (opcional):** con esta misma regla, la pastilla podría volver a la tarjeta y recuperar parte de los +37 y +31 px. Como ya caben, lo decide Ippo; no es una parada.

---

## 2 · El renglón del estante de H7, rediseñado

**Cierra dos defectos publicados:** «Al debe» y «Al haber» miden 40 px de alto, y «Devolver al estante» mide 32 px con letra de 10.

**El renglón a 320** (ancho útil de 258; relleno de 4 arriba y abajo y de 6 a los lados):

| Zona | Ancho | Contenido |
|---|---|---|
| **Nombre de la cuenta** | 107 px | Inter **14/20**, peso 600, #F8F9FA. Caben unos 15 caracteres por línea: «Gasto materiales de consumo» y «Cuentas por cobrar – clientes» ocupan **2 líneas (40 px)** [calculado]. |
| espacio | 8 | |
| **Botones** | 131 px | **«Al debe» (59) · 6 · «Al haber» (66).** Inter 13/600, cara N2 **de 44 px** con filo, canto N1 de 4 px, E2. **Bloque: 48.** |

- **«Devolver al estante» usa el mismo hueco de 131 px** y reemplaza a los dos botones cuando la cuenta ya está puesta. Va en Inter **12**/600 (unos 119 px de texto [calculado]), con cara de 44 y canto de 4. **Ya no hay letra de 10.**
- **El canto cabe dentro del renglón:** bloque de 48 + 4 de relleno arriba + 4 abajo = **56**. El hover sube la cara 2 px más (−6), y el relleno de arriba lo absorbe.
- **«Al debe» y «Al haber» van en #F8F9FA, sin teal ni ámbar** (regla de la v1). El lado lo dicen la palabra y el orden: el debe va a la izquierda.

**Alto del renglón:** máx(nombre + 8, 56).

| Nombre | Alto del renglón |
|---|---|
| 1 o 2 líneas | **56 px** |
| 3 líneas | 68 px |

**Alto del estante de 12 renglones a 320:**
- Si todos los nombres ocupan 1 o 2 líneas: 12 × 56 + 11 × 6 = **738 px** [calculado]. **El aire de 6 px entre renglones no se toca.**
- Cada renglón con un nombre de 3 líneas suma 12 px.
- Lo que crece frente a hoy depende de cuántos renglones publicados tienen 1, 2 o 3 líneas:

| Renglón hoy | Hoy | Nuevo | Diferencia |
|---|---|---|---|
| Nombre en 1 línea | 40 | 56 | +16 |
| Nombre en 2 líneas | 49,3 | 56 | +6,7 |
| Nombre en 3 líneas | 64,9 | 68 | +3,1 |

- **Peor caso, con los 12 renglones en 1 línea: +192 px.** Ippo lo suma con el reparto real.

**Regla de ventana:** cada decisión de H7 es un renglón (56 o 68 px) con sus dos botones, así que **lo que se decide siempre cabe junto**, aunque el estante entero sea más alto que la ventana. Igual que hoy, el estante se recorre con scroll.

⛔ **Ippo: si a 320 algún nombre de cuenta real pasa de 3 líneas en 107 px, detente y avisa.** El arreglo sería bajar «Al debe» y «Al haber» a 56 px de ancho, con relleno de 4.

---

## 3 · Correcciones a la v1 (Takamura, lote 20; las anota Kamogawa)

- **§6 de la v1:** H1 y H2 no crecen +12. **Crecen +37 y +31**, según lo medido en #601. Al sacar la pastilla de la cara, su hueco de 4 + 20 dejó de quedar absorbido por el alto mínimo, y la cara tiene que dar sus 44 y 56 de toque sola.
- **La regla de ventana que vale es la de #506:** lo que se decide cabe junto con la vista subida a la tarjeta del hecho. La §1 de la v1 medía desde arriba de la página, cabecera incluida, y desde ahí la matriz de GP no cabía ni siquiera en main. Esa medida no es la regla.
- **El borde del estado «elegida»:** en H1, el grupo elegido lleva a la vez un borde de 2 px #B8C4D4 y la cara N2 con filo. Son dos señales para lo mismo. Si algún día se fija, se deja una sola. No bloquea.
