# Macro 2026 · Diagnóstico del visual (paso 6: más allá de la mascota)

Orden de Mateo, 25-nov: todo objeto del visual que no sea mascota (vasos,
tanques, tuberías, cajas, edificios, billetes, máquinas) se pide a Gemini con la
guía de estilo y se recorta e integra. Nada de rectángulos planos ni líneas
sueltas como protagonistas. A mano solo lo que Gemini no puede dar (gráficas
con datos exactos, niveles e indicadores en vivo), y montado sobre algo
ilustrado.

Método: captura a 375 px de las 59 piezas (primera pantalla tras «Siguiente»),
revisadas una a una. Nota: 0 = la protagonista es una forma plana a mano;
1 = mezcla (algún objeto ilustrado pequeño, el centro sigue plano);
2 = ilustrado o es una gráfica de datos (permitida a mano).

Las piezas comparten visual: arreglar el componente común arregla todas las
que lo usan. Por eso los lotes van por **familia de visual**, de peor a mejor.

## Familias, de peor a mejor

| # | Familia (componente) | Piezas | Nota | Qué hay hoy | Qué se pide a Gemini |
|---|---|---|---|---|---|
| 1 | Cascada de vasos (`Cascada`, comun-pm) | pm26-a3, pm26-h2, pm26-h1 | 0 | 7 vasos de líneas grises con agua plana (la captura de Mateo) | frasco de vidrio de banco con pico; el agua y el encaje quedan en vivo dentro |
| 2 | Termostato (`Termostato`, comun-pm) | pm26-a7, pm26-h5 | 0 | casa de 5 líneas y termómetro de rectángulos | casa en corte con aire acondicionado + termómetro de vidrio; el mercurio en vivo |
| 3 | Tanque / vaso de la renta | pf26-a4, da26-a2 | 0 | tanque y vaso de líneas con tubos sueltos | tanque metálico con tuberías y llaves; nivel en vivo |
| 4 | Carrito de la DA | da26-a1, da26-h1 | 0 | carrito de líneas gigante y vacío | carrito de mercado ilustrado grande; compras C, I, G, XN caen dentro |
| 5 | Balanza peso-dólar (comun-pc) | pc26-a1, pc26-h1, pc26-a4 | 0 | barra plana con bloques de billetes a mano | balanza de mercado ilustrada + fajos de pesos y billete de dólar |
| 6 | Imanes de capital (comun-pc) | pc26-a6, pc26-h5 | 0 | corchetes planos con monedas | imanes en herradura con banderas + monedas |
| 7 | Baldes del banco central | pc26-a7 | 0 | dos cubos de líneas con + y − | dos baldes metálicos ilustrados |
| 8 | Tuberías de la balanza de pagos | pc26-a5 | 0 | casa, globo y caja planos | casa-país, globo y tanque de reservas ilustrados |
| 9 | Carro del mecánico | pe26-a1 | 0 | carro de líneas | carro varado con capó abierto y humo |
| 10 | Circuito con virus | pe26-a2, pe26-h5 | 0 | óvalo de líneas con iconos y termómetro plano | termómetro de vidrio y nodos del circuito ilustrados |
| 11 | Balanza de la DA (pf) | pf26-a5, pf26-h4 | 0 | balanza de líneas | balanza de platos ilustrada |
| 12 | Buzones y cajeros de tributos | pf26-a2, pf26-h1, pf26-a3, pf26-h2 | 0 | iconos planos en cajas | buzones y ventanillas ilustrados |
| 13 | Montañas de la deuda | pf26-h5 | 0 | dos triángulos | dos montañas ilustradas (altura en vivo) |
| 14 | Lupa / alcancía | pf26-a1 | 1 | alcancía de líneas en hexágono | alcancía y lupa ilustradas |
| 15 | Billetera | pm26-a1 | 0 | billetera de líneas | billetera de cuero ilustrada |
| 16 | Palancas (termómetro y flecha) | pm26-a6 | 1 | termómetro y flecha planos | termómetro y cohete/flecha ilustrados |
| 17 | Columpio de la tasa | da26-a3 | 1 | barra y triángulo | balancín ilustrado |
| 18 | Carretera del multiplicador | da26-a6 | 1 | trapecio con rayas | carretera ilustrada |
| 19 | Barras recauda/gasta | da26-a4, pe26-h5 | 2 | gráfica de barras (dato exacto) | montar sobre pilas de monedas ilustradas |
| 20 | Cuerda exportadora-importadora | pc26-h4 | 1 | cuadrado plano entre mascotas | cuerda y nudo ilustrados |
| 21 | Gráficas (DA, dinero, tc, regímenes) | da26-a5, h3, h6, pm26-a5, h4, pc26-h2, h6, h3 | 2 | gráficas con datos | se quedan a mano; marco ilustrado (pizarra) en un lote final |
| 22 | Escaleras, fichas, memos, listas | pe26-a3, a4, a5, h1–h4, da26-h2, h4, h5, pf26-h3, h6, pm26-h6, pc26-h3 | 2 | tarjetas de interfaz, ya con mascota | sin cambio en este pedido |

## Imágenes raras ya publicadas (se regeneran)
- `objetos/grifo.png`: el chorro sale cortado contra el borde.
- `objetos/moneda.png`: disco vacío, no se lee como moneda.
- El kit de 36 objetos es clip-art plano azul que no casa con las mascotas
  chibi: cada objeto que se reemplace en un lote sale en el estilo nuevo.

## Lotes
- **Lote 1:** familias 1 a 4 (8 piezas: pm26-a3, h2, h1; pm26-a7, h5; pf26-a4;
  da26-a1, h1; de paso el carrito del Repaso). Hecho el 25-nov; video en
  `/mnt/project-files/macro-2026/videos/ilustrados-lote1/`. Visible solo tras el
  visto bueno de Mateo (el PR no se fusiona antes). Además se cambió el grifo
  de A3 (el viejo salía cortado) y los iconos a mano de H1 por los objetos de A1.
- **Lote 2:** familias 5 a 8 (7 piezas: pc26-a1, h1, a4, a6, h5, a5, a7). Lote 1
  publicado el 25-nov con visto bueno de Mateo (#758). Lote 2 hecho el 25-nov;
  video en `/mnt/project-files/macro-2026/videos/ilustrados-lote2/`. De paso:
  caja de bananos y carrito ilustrados en pc26-a4, candado en pc26-a7.
- **Lote 3:** familias 9 a 13 (pe26-a1, a2, h5; pf26-a5, h4, a2, h1, a3, h2,
  h5). Lote 2 publicado el 25-nov con visto bueno de Mateo (#759). Lote 3 hecho
  el 25-nov; video en `/mnt/project-files/macro-2026/videos/ilustrados-lote3/`.
  16 objetos nuevos (carro varado, grúa, caja de herramientas, fábrica, edificio
  de gobierno, virus, globo aerostático, columna y brazo de balanza, buzón
  teñido por tributo, caja registradora, ventanilla, montaña, pozo, barrera,
  casa con andén). El termómetro de vidrio pasó a `TermometroVidrio` común.
  Gemini deja de crear imágenes tras unas 7 en un chat («soy un modelo de
  lenguaje»): se abre un chat nuevo y se pega el estilo bloqueado completo.
- **Lote 4:** familias 14 a 20 (pf26-a1, pm26-a1, pm26-a6, da26-a3, a4, a6,
  pc26-h4; de paso las billeteras de pf26-a3). Lote 3 publicado el 25-nov con
  visto bueno de Mateo (#767). Lote 4 hecho el 25-nov; video en
  `/mnt/project-files/macro-2026/videos/ilustrados-lote4/`. 10 objetos nuevos
  (billetera, lupa, alcancía, carretera, cuerda, pila de monedas, grúa de
  torre, tabla y soporte de balancín, cohete) y tres recortes derivados
  (mango de la lupa, tramo de cuerda, pañuelo). La familia 21 (marco de
  pizarra para las gráficas) queda para un lote final si Mateo lo pide.
