# Rediseño con la lista de 5 puntos — auditoría de lo publicado (T1–T5)

Rama `auditoria-5`, desde `origin/main` (512746d2, 24-nov-2026). Solo
lectura del código: no se corrieron sondas ni videos. La lista completa de
Mateo irá en `orquestador/conocimiento/checklist-actividad.md`; cuando se
hizo esta auditoría aún no estaba en `claude/project-thread-cwm6u3`, así que
se usó el resumen del coordinador:

1. Mecánica.
2. Contexto corto ANTES de la pregunta (≤ 25 palabras).
3. El estudiante EN UN ROL («te contratan como economista para…»).
4. Visual GRANDE con mascotas haciendo la acción: ≥ 120 px, y ≥ 180 px si
   la mascota es la protagonista.
5. UI diseñada: fondo y escena propios, y variados entre piezas.

## Cómo leer las tablas

- **Primer texto**: lo primero que lee el estudiante, copiado tal cual. En
  Aprender es el texto de P1. En Hacer es la consigna del encabezado de
  `MarcoHacer`.
- **Contexto**: sí o no, y dónde está. En Hacer, el enunciado del ítem (el
  pago, el suceso, la ficha) no cuenta como contexto: es el estímulo. Cuenta
  una situación que enmarque la pregunta (un titular, una lectura, un caso).
- **Rol**: sí solo si el texto pone al estudiante en un papel. Solo hay tres
  frases así en los cinco temas, todas en `pe26-h5-dos-fiebres` («Eres el
  Banco de la República…», «Eres el Gobierno…»).
- **Visual mayor**: el `alto` que declara el código (en px de CSS, igual a
  320 y a 375) y si es mascota, objeto del kit o SVG/texto. Para los SVG a
  todo el ancho, el ancho a 375 es una estimación (≈ 315 px: 375 menos el
  margen de página y el relleno de la tarjeta), no una medida.
- **UI propia**: todas las piezas usan `MarcoAprender` o `MarcoHacer`, con
  el mismo fondo de tarjeta (`FONDO` / `SUPERFICIE`). Ninguna tiene fondo ni
  escena propios, así que el punto 5 falla en las 59. La columna nombra la
  figura propia que ya existe y que serviría de base para la escena.
- **Fallos**: puntos 2 a 5 que no se cumplen. La mecánica (punto 1) está en
  todas. **prioridad** = 3 o más fallos.
- Si una mascota solo aparece en una pantalla, se dice cuál (P1 = pantalla 1).

## Resumen

| Tema | Piezas | Con rol | Con mascota ≥ 120 px | prioridad |
|---|---|---|---|---|
| T1 Demanda agregada | 12 | 0 | 2 (H4, H5) | 11 |
| T2 Política económica | 10 | 1 (H5) | 0 | 9 |
| T3 Política fiscal | 11 | 0 | 2 (H3, A5) | 10 |
| T4 Política monetaria | 13 | 0 | 3 (A2, A6, H5) | 12 |
| T5 Política cambiaria | 13 | 0 | 9 (A1, A2, A3, A6, A7, H2, H3, H4, H5) | 8 |
| **Total** | **59** | **1** | **16** | **50** |

Una pieza cuenta como «prioridad» si alguna de sus filas lo es.

Lo que falta en casi todo: el rol (58 de 59) y la UI propia (59 de 59). Las
mascotas faltan sobre todo en T1, T2, T3 y T4. El contexto existe en las
Aprender que abren con un caso, y en pocas Hacer.

Archivos comunes que tocará el rediseño en todos los temas:
`src/macro2026/comun/ui.jsx` (`MarcoAprender`, `MarcoHacer`: un hueco para
el contexto, el rol y el fondo de escena) y `src/macro2026/comun/mascotas.jsx`.
Esos son de Erwin (lo compartido): se le pide por issue.

## T1 · Demanda agregada (`src/macro2026/demanda-agregada/`)

| id | Primer texto (tal cual) | Contexto | Rol | Visual mayor (px a 375) | UI propia | Archivos | Fallos |
|---|---|---|---|---|---|---|---|
| da26-a1-carrito | «Toda la economía hace un solo mercado. Lo que compra junta es la demanda agregada.» | no (definición) | no | objeto `carrito` 76 px + SVG del carrito (≈ 315 ancho); sin mascota | no — marco común; figura propia: carrito | A1Carrito.jsx, textos.js, comun/carrito.jsx | 4 · **prioridad** |
| da26-a2-vaso-renta | «Tu renta llega por un grifo: Y.» | no (metáfora, sin situación) | no | SVG vaso y grifo (≈ 315 ancho); sin mascota | no — marco común; figura propia: vaso | A2VasoRenta.jsx, textos.js | 4 · **prioridad** |
| da26-a3-columpio-tasa | «Las empresas invierten en máquinas, plantas e inventarios. Casi siempre con crédito.» | no | no | SVG columpio (≈ 315 ancho); sin mascota | no — marco común; figura propia: columpio | A3ColumpioTasa.jsx, textos.js | 4 · **prioridad** |
| da26-a4-no-miran-renta | «El Gobierno decide su gasto, G. No depende de la renta: es autónomo.» | no | no | SVG (≈ 315 ancho); sin mascota | no — marco común | A4NoMiranRenta.jsx, textos.js | 4 · **prioridad** |
| da26-a5-bisagra-ascensor | «La demanda agregada crece con la renta. Esta recta lo muestra.» | no | no | gráfica DA (≈ 315 ancho); sin mascota | no — marco común; figura propia: bisagra | A5BisagraAscensor.jsx, textos.js, comun/GraficaDA.jsx | 4 · **prioridad** |
| da26-a6-eco-multiplicador | «El Gobierno gasta 100 en una vía. ¿Cuánto sube la producción?» | sí — P1 (12 palabras) | no | SVG ecos (≈ 315 ancho); sin mascota | no — marco común; figura propia: eco | A6EcoMultiplicador.jsx, textos.js | 3 · **prioridad** |
| da26-h1-llena-carrito · ficha → mano | «Arrastra cada compra a la mano que la hace.» | no (la ficha: «Una familia paga el mercado del mes») | no | carrito y manos (SVG); sin mascota | no — marco común | H1LlenaCarrito.jsx, textos.js, comun/carrito.jsx | 4 · **prioridad** |
| da26-h2-arma-formula · fórmula por etapa (consumo, inversión, DA) | «Arrastra cada pieza a su hueco en la fórmula.» | no | no | fórmula en texto/fichas; sin mascota | no — marco común | H2ArmaFormula.jsx, textos.js | 4 · **prioridad** |
| da26-h3-gira-o-sube · «desplaza» | «Mueve la recta a donde crees que quedará.» | no (el suceso: «El Gobierno aumenta el gasto en vías.») | no | gráfica DA (≈ 315 ancho); sin mascota | no — marco común | H3GiraOSube.jsx, textos.js, comun/GraficaDA.jsx | 4 · **prioridad** |
| da26-h3-gira-o-sube · «gira» | (la misma consigna) | no | no | igual | no | igual | 4 · **prioridad** |
| da26-h4-empresario · titular → cadena | «Arma la cadena: toca cada flecha para subirla o bajarla.» | sí — el titular («El Banco de la República baja la tasa de interés.») | no | mascota `empresario` 140 px | no — marco común; figura propia: cadena de flechas | H4Empresario.jsx, textos.js | 2 |
| da26-h5-libreta · línea con error | «Toca la línea que tiene el error.» | no (la libreta no dice de quién es ni para qué) | no | mascota `analista` 140 px | no — marco común; figura propia: libreta | H5Libreta.jsx, textos.js | 3 · **prioridad** |
| da26-h6-meta · meta por etapa (gasto, impuesto, tasa) | «Mueve la palanca hasta que la producción llegue a la meta.» | sí — `e.contexto` sobre la figura («La economía está fría. Solo puedes mover el gasto.») | no | gráfica DA (≈ 315 ancho); sin mascota | no — marco común | H6Meta.jsx, comun/modelo-da.js (ETAPAS_H6), textos.js | 3 · **prioridad** |

## T2 · Política económica (`src/macro2026/politica-economica/`)

| id | Primer texto (tal cual) | Contexto | Rol | Visual mayor (px a 375) | UI propia | Archivos | Fallos |
|---|---|---|---|---|---|---|---|
| pe26-a1-mecanico | «Se te vara el carro. ¿Lo arreglas tú o llamas al mecánico?» | sí — P1 (12 palabras) | no | SVG/iconos (≈ 315 ancho); sin mascota | no — marco común | A1Mecanico.jsx, textos.js | 3 · **prioridad** |
| pe26-a2-fiebre | «La economía es un circuito: hogares, empresas, Estado y exterior se pasan dinero.» | no | no | SVG circuito + `IconoProblema`; sin mascota | no — marco común; figura propia: circuito | A2Fiebre.jsx, textos.js, comun/iconos-pe.jsx | 4 · **prioridad** |
| pe26-a3-problema-resuelto | «Un objetivo es un problema escrito como si ya estuviera resuelto.» | no | no | iconos/texto; sin mascota | no — marco común | A3ProblemaResuelto.jsx, textos.js | 4 · **prioridad** |
| pe26-a4-perillas | «El Estado tiene cuatro ramas clásicas de política: fiscal, monetaria, cambiaria y comercial.» | no | no | tablero de perillas SVG (≈ 315 ancho); sin mascota | no — marco común; figura propia: perillas | A4Perillas.jsx, textos.js, comun/iconos-pe.jsx | 4 · **prioridad** |
| pe26-a5-escalera | «Toda política sube seis peldaños: problema, objetivo, estrategia, instrumento, medida y meta.» | no | no | escalera (`comun/Escalera.jsx`, ≈ 315 ancho); sin mascota | no — marco común; figura propia: escalera | A5Escalera.jsx, textos.js, comun/Escalera.jsx | 4 · **prioridad** |
| pe26-h1-seis-cajones · enunciado → peldaño | «Arrastra cada enunciado a su peldaño.» | no (el enunciado: «Se dispararon los precios en Colombia y crecieron al 12 % en 2024») | no | escalera de cajones (SVG/HTML); sin mascota | no — marco común | H1SeisCajones.jsx, textos.js | 4 · **prioridad** |
| pe26-h2-grupo-logico · grupo → escalera completa | «Completa la escalera: elige la tarjeta de cada peldaño.» | parcial — el nombre del grupo («Inflación») y la bandera | no | tarjetas/escalera; sin mascota | no — marco común | H2GrupoLogico.jsx, textos.js | 4 · **prioridad** |
| pe26-h3-cables · instrumento → rama | «Conecta cada instrumento con la rama que lo usa.» | no | no | cables e `IconoRama`; sin mascota | no — marco común; figura propia: cables | H3Cables.jsx, textos.js, comun/iconos-pe.jsx | 4 · **prioridad** |
| pe26-h4-expediente · peldaño que no encaja | «Toca el peldaño que no encaja.» | no (el expediente no dice de quién es) | no | escalera; sin mascota | no — marco común | H4Expediente.jsx, textos.js | 4 · **prioridad** |
| pe26-h5-dos-fiebres · fiebre 1 (BanRep, la tasa) | «Eres el Banco de la República. ¿Qué haces con la tasa?» | sí — `ENTRADA_H5` («Precios altos y la inversión cayendo. Tú decides el tratamiento.») | **sí** | medidores y circuito (SVG); sin mascota | no — marco común; figura propia: medidores | H5DosFiebres.jsx, textos.js | 2 |
| pe26-h5-dos-fiebres · fiebre 2 (Gobierno, el gasto) | «Eres el Gobierno. ¿Qué haces con el gasto p…» (consigna del paso 2) | sí — la lectura del paso 1 | **sí** | igual | no | igual | 2 |

## T3 · Política fiscal (`src/macro2026/politica-fiscal/`)

| id | Primer texto (tal cual) | Contexto | Rol | Visual mayor (px a 375) | UI propia | Archivos | Fallos |
|---|---|---|---|---|---|---|---|
| pf26-a1-lupa | «Toda política especializada se mira con la misma lupa de seis caras.» | no | no | SVG lupa (≈ 315 ancho); objeto `alcancia` 56 px; sin mascota | no — marco común; figura propia: lupa | A1Lupa.jsx, textos.js, comun/iconos-pf.jsx | 4 · **prioridad** |
| pf26-a2-buzones | «Tributación es todo pago obligatorio al Estado. Viene en tres formas.» | no | no | buzones (`IconoBuzon`); sin mascota | no — marco común; figura propia: buzones | A2Buzones.jsx, textos.js, comun/iconos-pf.jsx | 4 · **prioridad** |
| pf26-a3-cajeros | «Un impuesto directo mira quién eres: tu renta, tu casa, tu carro.» | no | no | dos cajeros (iconos); objeto `recibo` 40 px; sin mascota | no — marco común; figura propia: cajeros | A3Cajeros.jsx, textos.js, comun/iconos-pf.jsx | 4 · **prioridad** |
| pf26-a4-tanque | «El Estado es un tanque: entran tributos y préstamos; salen tres desagües de gasto.» | no (metáfora) | no | SVG tanque (≈ 315 ancho); objetos 40 px; sin mascota | no — marco común; figura propia: tanque | A4Tanque.jsx, textos.js | 4 · **prioridad** |
| pf26-a5-balanza | «La política fiscal toca tres perillas de la demanda: G, TR y t.» | no | no | mascota 180 px (la de cada impacto, en la pantalla de impactos); objeto de impacto 150 px | no — marco común; figura propia: balanza | A5Balanza.jsx, textos.js | 3 · **prioridad** |
| pf26-h1-moneda · pago → buzón | «Arrastra cada pago al buzón que le corresponde.» | no (el pago: «El IVA de una camisa») | no | buzones; objeto `moneda` 44 px; sin mascota | no — marco común | H1Moneda.jsx, textos.js, comun/iconos-pf.jsx | 4 · **prioridad** |
| pf26-h2-cajero · tributo → cajero | «Desliza cada tributo hacia el cajero que lo cobra.» | no | no | dos cajeros (iconos); sin mascota | no — marco común | H2Cajero.jsx, textos.js, comun/iconos-pf.jsx | 4 · **prioridad** |
| pf26-h3-factura · línea del documento → tipo | «Toca cada línea y dile qué es.» | parcial — «El profesor pregunta:» y el documento | no | mascota `profesor` 120 px; objeto `recibo` 36 px | no — marco común; figura propia: factura | H3Factura.jsx, textos.js | 2 |
| pf26-h4-expande · medida → plato + entrada | «Pon la medida en su plato y di por dónde entra.» | no (la medida: «Subir el gasto en vías») | no | balanza de platos (SVG); sin mascota | no — marco común | H4Expande.jsx, textos.js | 4 · **prioridad** |
| pf26-h5-montanas · «division» | «Resuelve cada reto sobre las montañas de la deuda.» | parcial — la consigna del reto («Arrastra la división: ¿cuánto de 1.194 es deuda interna?») | no | montañas SVG (≈ 315 ancho); sin mascota | no — marco común; figura propia: montañas | H5Montanas.jsx, textos.js | 4 · **prioridad** |
| pf26-h5-montanas · «acreedores» | (misma consigna) | no — «Lleva cada acreedor a su montaña.» | no | igual | no | igual | 4 · **prioridad** |
| pf26-h5-montanas · «papel» | (misma consigna) | no — «¿Con qué papel se presta casi toda la deuda interna?» | no | igual | no | igual | 4 · **prioridad** |
| pf26-h5-montanas · «cubeta» | (misma consigna) | sí — «El Gobierno paga intereses y abonos este año. ¿Eso es…?» | no | igual | no | igual | 3 · **prioridad** |
| pf26-h5-montanas · «cables» | (misma consigna) | no — «Conecta cada deuda con lo que puede mover.» | no | igual | no | igual | 4 · **prioridad** |
| pf26-h6-memo · frase falsa del memo | «Toca la frase del memo que está mal.» | sí — el memo de NOVA S. A., firmado por la gerencia | casi — el memo es de una empresa, pero no se dice quién lo revisa | objeto `fabrica` 40 px; sin mascota | no — marco común; figura propia: memo | H6Memo.jsx, textos.js | 3 · **prioridad** |

## T4 · Política monetaria (`src/macro2026/politica-monetaria/`)

| id | Primer texto (tal cual) | Contexto | Rol | Visual mayor (px a 375) | UI propia | Archivos | Fallos |
|---|---|---|---|---|---|---|---|
| pm26-a1-billetera | «El dinero no es solo lo que gastas: hace posible cada transacción de la economía.» | no | no | objetos del kit 56 px (billetera, billetes-alas); sin mascota | no — marco común; figura propia: billetera | A1Billetera.jsx, textos.js | 4 · **prioridad** |
| pm26-a2-ventanilla | «Solo el Banco de la República emite el peso colombiano.» | no | no | mascota `autoridad-economica` 180 px (P1, protagoniza); escena `viajero-banco-central` 120 px (P2) | no — marco común; figura propia: ventanilla | A2Ventanilla.jsx, textos.js, comun-pm.jsx | 3 · **prioridad** |
| pm26-a3-cascada | «Llevas 1.000 pesos al banco. El banco no los guarda todos quietos.» | sí — P1 (13 palabras) | no | cascada de vasos SVG (≈ 315 ancho); objeto `grifo` 48 px; sin mascota | no — marco común; figura propia: cascada | A3Cascada.jsx, textos.js, comun-pm.jsx | 3 · **prioridad** |
| pm26-a4-cajas | «Base monetaria: el efectivo más las reservas de los bancos en el BanRep.» | no | no | objeto `boveda` 84 px + cajas anidadas; sin mascota | no — marco común; figura propia: cajas | A4Cajas.jsx, textos.js | 4 · **prioridad** |
| pm26-a5-precio-dinero | «El BanRep decide cuánto dinero hay. Por eso la oferta es una pared vertical.» | no | no | gráfica del dinero (≈ 315 ancho); sin mascota | no — marco común | A5PrecioDinero.jsx, textos.js, comun-pm.jsx | 4 · **prioridad** |
| pm26-a6-palancas | «Naturaleza: regula la creación de dinero, el sistema financiero y el crédito.» | no | no | mascota `autoridad-economica` 120 px (P3); escena `autoridad-empresario` 120 px (P7); objetos 110–120 px | no — marco común; figura propia: tablero de palancas | A6Palancas.jsx, textos.js, comun-pm.jsx | 3 · **prioridad** |
| pm26-a7-termostato | «Inflación alta es una casa caliente. La tasa de interés es el aire acondicionado.» | sí — metáfora con situación (P1) | no | termostato SVG (≈ 315 ancho); sin mascota | no — marco común; figura propia: termostato | A7Termostato.jsx, textos.js, comun-pm.jsx | 3 · **prioridad** |
| pm26-h1-entra-sale · «compra» | «Pon cada flecha: ¿sube, baja o queda igual?» | no (la operación: «El BanRep compra dólares en el mercado cambiario.») | no | medidores y cascada; sin mascota | no — marco común | H1EntraSale.jsx, textos.js, comun-pm.jsx | 4 · **prioridad** |
| pm26-h1-entra-sale · «vende» | (misma consigna) | no | no | igual | no | igual | 4 · **prioridad** |
| pm26-h1-entra-sale · «cascada» (encaje, crédito) | (misma consigna) | no | no | cascada pequeña | no | igual | 4 · **prioridad** |
| pm26-h2-cascada-meta · meta por etapa (5.000 / 10.000 / …) | «Mueve el encaje hasta que el dinero total llegue a la meta.» | no (solo la cifra de la meta) | no | cascada SVG (≈ 315 ancho); sin mascota | no — marco común | H2CascadaMeta.jsx, textos.js, comun-pm.jsx | 4 · **prioridad** |
| pm26-h3-cajas · cosa → agregado | «Arrastra cada cosa al primer agregado donde entra.» | no | no | cajas anidadas; objeto `boveda` 44 px; sin mascota | no — marco común | H3Cajas.jsx, textos.js | 4 · **prioridad** |
| pm26-h4-mueve-tasa · suceso → curva | «Mueve la curva que cambia, hacia donde crees.» | no (el suceso: «El BanRep emite más pesos.») | no | gráfica del dinero (≈ 315 ancho); sin mascota | no — marco común | H4MueveTasa.jsx, textos.js, comun-pm.jsx | 4 · **prioridad** |
| pm26-h5-junta · ronda (lectura → tres palancas) | «Pon las tres palancas como lo haría la Junta.» | sí — la lectura de la ronda («Inflación de 9 %, muy por encima de la meta.») y el aviso | casi — «como lo haría la Junta», sin poner al estudiante en ella | mascota `autoridad-economica` 120 px (tarjeta de inicio) | no — marco común; figura propia: tablero + termostato | H5Junta.jsx, textos.js, comun-pm.jsx | 2 |
| pm26-h6-domino · cadena a ordenar | «Ordena las fichas para que caigan en orden.» | parcial — el nombre de la cadena («Baja la tasa») | no | fichas de dominó (HTML); sin mascota | no — marco común; figura propia: dominó | H6Domino.jsx, textos.js | 4 · **prioridad** |

## T5 · Política cambiaria (`src/macro2026/politica-cambiaria/`)

| id | Primer texto (tal cual) | Contexto | Rol | Visual mayor (px a 375) | UI propia | Archivos | Fallos |
|---|---|---|---|---|---|---|---|
| pc26-a1-balanza | «Guerras, petróleo o la FED: todo mueve el precio del dólar en pesos.» | sí — P1, con las cuatro noticias para tocar | no | escena `exportadora-importadora` 150 px (P5); balanza SVG (≈ 315 ancho) | no — marco común; figura propia: balanza | A1Balanza.jsx, textos.js, comun-pc.jsx | 2 |
| pc26-a2-subasta | «El mercado cambiario reúne a quienes traen dólares y a quienes los necesitan.» | no (definición) | no | seis mascotas de 120 px (P1); inversionista e importadora 120 px (P3–P4) | no — marco común; figura propia: subasta / gráfica | A2Subasta.jsx, textos.js, comun-pc.jsx | 2 |
| pc26-a3-nominal-real | «El tipo de cambio nominal es el precio del dólar hoy, en pesos corrientes.» | sí — el cartel «$4.329,90 · 16 de abril de 2025» (P1) | no | mascota `exportadora-flores` 120 px (P5); dial SVG (≈ 315 ancho) | no — marco común; figura propia: dial | A3NominalReal.jsx, textos.js, comun-pc.jsx | 2 |
| pc26-a4-banano | «Tropical Fruits vende banano a US Foods. Producir una tonelada cuesta $2.127.250.» | sí — P1 (12 palabras) | no | objetos del kit 56–64 px (caja, carrito, termómetros); sin mascota | no — marco común; figura propia: caja y góndola | A4Banano.jsx, textos.js, comun-pc.jsx | 3 · **prioridad** |
| pc26-a5-tuberias | «La balanza de pagos anota todo lo que el país transa con el exterior.» | no | no | tuberías y tanque (SVG/HTML); objetos 24–34 px; sin mascota | no — marco común; figura propia: tuberías | A5Tuberias.jsx, textos.js | 4 · **prioridad** |
| pc26-a6-imanes | «El capital va adonde gana más, con menos riesgo.» | sí — el caso del ahorro (P5: «Ahorras $600 millones un año: 9 % aquí o 4 % en EE. UU.»), pero no antes de P1 | no | mascota `inversionista` 120 px (P5–P6); imanes SVG | no — marco común; figura propia: imanes | A6Imanes.jsx, textos.js, comun-pc.jsx | 2 |
| pc26-a7-correa | «El BanRep busca estabilidad cambiaria y equilibrio en la balanza de pagos.» | no | no | mascota `autoridad-economica` 180 px (P1, protagoniza); escena `viajero-banco-central` 180 px (P4) | no — marco común; figura propia: correa | A7Correa.jsx, textos.js, comun-pc.jsx | 3 · **prioridad** |
| pc26-h1-quien-aprecia · par de tasas a → b | «Marca qué le pasó al peso y qué al dólar.» | parcial — «USD 1 $3.757 → $4.208», solo cifras | no | balanza SVG (≈ 315 ancho); sin mascota | no — marco común; figura propia: balanza | H1QuienAprecia.jsx, textos.js, comun-pc.jsx | 4 · **prioridad** |
| pc26-h2-empuja-curva · suceso → curva y dirección | «Empuja la curva que cambia, hacia donde crees.» | no (el suceso: «Llegan inversionistas extranjeros a comprar empresas colombianas.») | no | gráfica de divisas (≈ 315 ancho); la mascota o el objeto de la causa (120 px) solo al revelar | no — marco común | H2EmpujaCurva.jsx, textos.js, comun-pc.jsx | 3 · **prioridad** |
| pc26-h3-aguja · ronda (tres cifras → aguja + exportador) | «Lleva la aguja al cambio real y di quién gana.» | parcial — las tres cifras de la ronda; la nota «banano» o «calzado · Brasil» en algunas rondas | no | mascota `exportadora-flores` 120 px; dial SVG (≈ 315 ancho) | no — marco común; figura propia: dial | H3Aguja.jsx, textos.js, comun-pc.jsx | 3 · **prioridad** |
| pc26-h4-a-quien-sirve · noticia → quién gana | «Tira la cuerda hacia quien sale ganando.» | sí — la noticia («El peso se devalúa 10 %.») | no | dos mascotas de 120 px (exportadora «recibe-billete», importadora «paga-billete») | no — marco común; figura propia: la cuerda | H4AQuienSirve.jsx, textos.js | 2 |
| pc26-h5-donde-ahorro · caso «ahorro» (d1–d3) | «Sin cambios en el dólar: ¿dónde ahorras?» | sí — el caso («Ahorro de $600 millones · tc $3.757 · 9 % aquí · 4 % allá») | no | mascota `inversionista` 120 px (protagoniza: debería ir a 180); imanes y barras | no — marco común; figura propia: imanes y barras | H5DondeAhorro.jsx, textos.js, comun-pc.jsx | 3 · **prioridad** |
| pc26-h5-donde-ahorro · caso «crédito» (d4–d6) | «Sin cambios en el dólar: ¿dónde te prestas?» | sí — el caso del crédito | no | igual | no | igual | 3 · **prioridad** |
| pc26-h6-correa · hecho → régimen | «Arrastra cada hecho al régimen que describe.» | no (el hecho: «Bolivia mantiene 6,96 bolivianos por dólar.») | no | cuatro correas mini SVG (≈ 150 ancho cada una); sin mascota | no — marco común; figura propia: correas | H6Correa.jsx, textos.js, comun-pc.jsx | 4 · **prioridad** |

## Notas para el rediseño

- **Rol (punto 3).** Es lo que más falta y lo más barato: una línea de rol
  por pieza en `textos.js` y un hueco en `MarcoHacer` / `MarcoAprender` (de
  Erwin) para mostrarla antes del contexto. Hay roles naturales ya
  dibujados:
  - el analista de T1 H5;
  - el profesor de T3 H3;
  - la gerencia de NOVA en T3 H6;
  - la Junta en T4 H5;
  - el inversionista en T5 H5;
  - la exportadora en T5 H3.
- **Contexto (punto 2).** En las Hacer de sorteo, el contexto puede ir por
  ítem (como `e.contexto` de T1 H6, que ya es el patrón) o una sola vez en
  la tarjeta de inicio (como el aviso de T4 H5).
- **Mascotas (punto 4).**
  - T1 a T4 tienen poquísimas.
  - En T5 las mascotas que protagonizan van a 120 px: subirlas a 180 donde
    son la protagonista (T5 H5 inversionista, T5 H3 exportadora).
  - El tamaño se declaró a mano en cada pieza. No hay una medida a 375 que
    lo confirme; esta auditoría no corrió sondas.
- **UI (punto 5).** Hoy el fondo es el mismo en las 59. La figura propia de
  cada pieza (balanza, cascada, termostato, correa, montañas…) es la base
  natural de una escena; el fondo de escena por pieza también pasa por el
  marco común.
