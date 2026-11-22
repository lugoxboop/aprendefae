# T4 · Política monetaria — plan y especificación completa (Gen, 2026-11-22)

Fuente única: `fichas/4-politica-monetaria.md`. Tema id: `politica-monetaria`. Ids: `pm26-…`.

## 0. Reglas comunes

Valen TODAS las de `t1-demanda-agregada.md` §0 y los íconos de rama de `t2` §0
(la monetaria: moneda con «%»). Además:
- **No se dibujan los agregados como muñecas que meten la base monetaria dentro de M1**:
  BM = efectivo + reservas y M1 = efectivo + cuentas corrientes; la BM no está contenida en
  M1. Se dibuja la BM como la bóveda del Banco de la República, aparte, y M1 ⊂ M2 ⊂ M3
  como cajas anidadas. (Una metáfora que implique algo falso descalifica.)
- **M3 = unos 1.031 billones** (no «1,03 billones», error del material, ficha §10.1).
- **La política monetaria entra por la tasa i** (−b·i). No se enseña que cambie c
  (ficha §10.4).
- **Objetivos:** «control de precios y crecimiento económico» como dice el profesor; la
  banda de la meta de inflación (2 %–4 %) se muestra como guía del caso (d. 43).
- **Datos del caso (d. 43):** son lecturas aproximadas del gráfico del BanRep; se rotulan
  «lectura aproximada del gráfico» y se redondean a entero o a medio punto.
- Se usa «Banco de la República» completo la primera vez en cada pieza, luego «BanRep».

## 1. Plan del tema

| # | id | Tipo | Nombre | Mecánica | Subtemas | Dific. | FP |
|---|---|---|---|---|---|---|---|
| 1 | pm26-a1-billetera | Aprender | Lo que llevas en la billetera | Explorar tocando | pm-apertura, pm-formas-dinero | — | 0 |
| 2 | pm26-a2-ventanilla | Aprender | La ventanilla del BanRep | Simulador (entregar activos, recibir pesos) | pm-creacion-primaria | — | 0 |
| 3 | pm26-h1-entra-sale | Hacer | ¿Entra o sale dinero? | Predecir y revelar (tres flechas) | pm-preguntas-balance, pm-creacion-primaria, pm-creacion-secundaria | Medio | 25 × % |
| 4 | pm26-a3-cascada | Aprender | La cascada de vasos | Simulador con controles | pm-creacion-secundaria | — | 0 |
| 5 | pm26-h2-cascada-meta | Hacer | Ajusta la cascada | Simulador con meta (3 etapas) | pm-creacion-secundaria, pm-instrumentos | Fácil | 10 × 3 = 30 × % |
| 6 | pm26-a4-cajas | Aprender | Bóveda y cajas | Explorar a escala real | pm-agregados | — | 0 |
| 7 | pm26-h3-cajas | Hacer | Cada depósito a su caja | Arrastrar y clasificar | pm-agregados, pm-formas-dinero | Medio | 25 × % |
| 8 | pm26-a5-precio-dinero | Aprender | El precio del dinero | Simulador de la gráfica | pm-mercado-dinero | — | 0 |
| 9 | pm26-h4-mueve-tasa | Hacer | Mueve la curva, mira la tasa | Predecir y revelar en la gráfica | pm-mercado-dinero | Medio | 25 × % |
| 10 | pm26-a6-palancas | Aprender | Tres palancas | Simulador de tablero | pm-naturaleza, pm-instrumentos, pm-medidas | — | 0 |
| 11 | pm26-h6-domino | Hacer | El dominó de la tasa | Ordenar en el proceso | pm-impactos, pm-medidas, pm-apertura | Medio | 25 × % |
| 12 | pm26-a7-termostato | Aprender | El termostato | Explorar una gráfica real | pm-caso-inflacion-tasa | — | 0 |
| 13 | pm26-h5-junta | Hacer | La Junta decide | Escenario con decisiones (3 rondas) | pm-medidas, pm-instrumentos, pm-caso-inflacion-tasa | Difícil | 50 × % |

**Variedad:** 6 Hacer, 6 mecánicas (tres flechas, simulador con meta, clasificar, mover una
curva, ordenar, tablero de decisiones). Ninguna A-B-C-D.
**Respaldo:** A2, A3 y A5 son simulaciones manipulables del mecanismo, no descripciones:
**principio multimedia y aprendizaje activo**. H1 y H4 piden predecir antes de ver:
**predicción y retroalimentación inmediata**. H6 ordena una cadena causal: **elaboración
causal** (criterio propio apoyado en literatura de explicación). H5 aplica a casos con
cifras: **transferencia**.

**Lo que corrijo del material (para Mateo, una línea):** M3 son 1.031 billones (no 1,03);
la política monetaria no cambia c; las preguntas 25 y 30 se repiten, así que la 30 se usa
como «vende divisas».

---

## 2. Especificación pieza por pieza

### A1 · Lo que llevas en la billetera (`pm26-a1-billetera`)
**Gancho visual:** una billetera abierta de la que salen, al tocarlas, las formas del dinero;
al final, un bolso tejido con billetes de una moneda que perdió su valor.

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | Billetera cerrada. Tocar: se abre y aparecen billetes, un cheque, una tarjeta débito, una tarjeta de crédito y un CDT. | «El dinero no es solo lo que gastas: hace posible cada transacción de la economía.» |
| 2 | Tocar cada objeto: muestra de qué depende. Billetes: «los emite el Banco de la República». Cheque: «mueve una cuenta corriente». Débito: «toca tu cuenta de ahorros». CDT: «ahorro a plazo fijo». Crédito: «es un préstamo del banco». | «Toca cada cosa y mira de dónde sale ese dinero.» |
| 3 | La tarjeta de crédito se separa del resto con un rótulo «préstamo». | «Ojo: pagar con tarjeta de crédito es pedir prestado, no gastar lo tuyo.» |
| 4 | Un bolso tejido con billetes (dibujo, sin país nombrado en la figura); al tocarlo, una etiqueta «el papel vale más que el billete». | «Si la gente pierde la confianza en una moneda, termina valiendo menos que el papel.» |
| 5 | Una aguja «tasa de interés» conecta tres íconos: alcancía (ahorro), crédito, flecha al exterior (capitales). | «El dinero se conecta con la tasa de interés, y la tasa con ahorrar, prestar e invertir.» |

### A2 · La ventanilla del BanRep (`pm26-a2-ventanilla`)
**Gancho visual:** una ventanilla de dos lados: por la izquierda entra un activo (dólar,
lingote de oro, papel TES, pagaré de un banco); por la derecha sale un fajo de pesos a la
economía. Arriba, un contador «Base monetaria».

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | La ventanilla con el edificio del Banco de la República. | «Solo el Banco de la República emite el peso colombiano.» |
| 2 | Arrastrar un dólar a la ventanilla: sale un fajo de pesos y el contador sube. | «Emite comprando cosas: dólares, oro o TES. A cambio, entrega pesos.» |
| 3 | Arrastrar un pagaré «préstamo a un banco»: también salen pesos. | «También emite prestándoles a los bancos.» |
| 4 | Botón «El BanRep vende»: el lingote sale de vuelta por la izquierda, el fajo regresa por la derecha y el contador baja. | «Si vende lo que compró, o le pagan un préstamo, los pesos vuelven y se retiran.» |
| 5 | Un estante con billetes impresos dentro del banco, quietos, rotulado «aún no son dinero». | «Billetes guardados en el banco no son dinero. Lo son al salir a cambio de algo.» |
| 6 | El contador se rotula «Base monetaria = creación primaria». | «Ese dinero que sale de la ventanilla es la creación primaria: la base monetaria.» |

### H1 · ¿Entra o sale dinero? (`pm26-h1-entra-sale`, Medio, 25 FP × %)
**Consigna:** «Pon cada flecha: ¿sube, baja o queda igual?» (8)
**Figura:** la ventanilla de A2 con tres medidores al lado: «Activos del BanRep», «Base
monetaria», «Dinero en la economía (M2)». Cada medidor tiene un botón que alterna ↑ / ↓ / =.
Encima, la tarjeta de la operación. «Revelar» se habilita con las tres puestas: la ventanilla
hace la operación de verdad (activo entra o sale, fajo sale o vuelve; en las de encaje y
depósitos, la cascada de A3 en miniatura se alarga o se acorta) y los medidores se mueven.
**Partida:** 6 de 9. Puntaje = flechas correctas / 18.

| # | Operación | Activos · BM · M2 | Retro si yerra activos · BM · M2 |
|---|---|---|---|
| 1 | El BanRep compra dólares en el mercado cambiario. | ↑ · ↑ · ↑ | «Recibe dólares: sus activos crecen.» · «Paga con pesos nuevos: la base sube.» · «Más pesos circulando: más dinero en la economía.» |
| 2 | El BanRep vende dólares en el mercado cambiario. | ↓ · ↓ · ↓ | «Entrega dólares: sus activos bajan.» · «Recibe pesos que salen de circulación.» · «Menos pesos circulando.» |
| 3 | El BanRep vende oro a joyeros nacionales. | ↓ · ↓ · ↓ | «El oro sale: sus activos bajan.» · «Los joyeros pagan con pesos que se retiran.» · «Menos pesos en la economía.» |
| 4 | El BanRep compra TES a inversionistas. | ↑ · ↑ · ↑ | «Recibe TES: sus activos crecen.» · «Paga con pesos nuevos: la base sube.» · «Es una OMA expansiva: más dinero.» |
| 5 | El BanRep vende TES a los bancos. | ↓ · ↓ · ↓ | «Entrega TES: sus activos bajan.» · «Los bancos pagan con pesos que se retiran.» · «OMA contractiva: menos dinero.» |
| 6 | El BanRep le presta liquidez a un banco. | ↑ · ↑ · ↑ | «El préstamo es un activo del BanRep.» · «Entrega pesos nuevos al banco.» · «Más liquidez, más dinero.» |
| 7 | Un banco le paga un crédito al BanRep. | ↓ · ↓ · ↓ | «Se cancela un préstamo: el activo desaparece.» · «Los pesos vuelven al BanRep.» · «Menos pesos circulando.» |
| 8 | El BanRep sube el encaje. | = · = · ↓ | «No compra ni vende nada: sus activos no cambian.» · «No emite ni retira pesos: la base igual.» · «Los bancos prestan menos: se multiplica menos dinero.» |
| 9 | La gente retira sus depósitos de los bancos. | = · = · ↓ | «El BanRep no interviene: activos igual.» · «No hay emisión nueva: la base igual.» · «Menos depósitos, menos créditos: menos dinero secundario.» |

Subtema: 1–7 `pm-creacion-primaria`; 8–9 `pm-creacion-secundaria`; todos `pm-preguntas-balance`.

### A3 · La cascada de vasos (`pm26-a3-cascada`)
**Gancho visual:** una cascada de vasos en escalera: el agua (pesos) cae en el primer vaso
(depósito); una franja fija queda en el fondo (encaje) y el resto se vierte al vaso
siguiente (crédito → nuevo depósito), un poco menos cada vez.

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | Persona A deposita 1.000 en el Banco 1: el primer vaso se llena. | «Llevas 1.000 pesos al banco. El banco no los guarda todos quietos.» |
| 2 | Una franja del fondo del vaso se tiñe y se rotula «Encaje 10 %». | «Una parte, el encaje, la congela en el BanRep. Esa no se presta.» |
| 3 | El resto (900) se vierte como crédito a la persona B, que lo deposita en el Banco 2. Botón «Siguiente préstamo» repite: 810, 729… | «El resto lo presta. Quien recibe el préstamo lo deposita en otro banco.» |
| 4 | Botón «Ver toda la cascada»: los vasos se llenan hasta que el chorro es mínimo; un contador suma los depósitos hasta ~10.000. | «Así, 1.000 pesos se vuelven muchos más. Es la creación secundaria.» |
| 5 | Deslizador «Encaje» 5 %–50 % (paso 5): la franja crece, la cascada se acorta y el contador cambia en vivo (1.000 / encaje). | «Encaje alto, cascada corta. Encaje bajo, cascada larga.» |

Fórmula visible al pie de la P3 (es la del profesor, d. 21): `$ → D − E = Cr → + $`.

### H2 · Ajusta la cascada (`pm26-h2-cascada-meta`, Fácil, 10 × 3 = 30 FP × %)
**Consigna:** «Mueve el encaje hasta que el dinero total llegue a la meta.» (11)
**Figura:** la cascada de A3 con 1.000 iniciales, el contador «Dinero total en depósitos»,
una bandera «Meta» y el deslizador del encaje (5 %–50 %, paso 5). Se puede mover libre;
«Fijar» cuenta. Total = 1.000 / encaje (redondeado a entero).
**Puntaje:** etapa lograda si se fija exacto en ≤ 3 «Fijar». Tras el 3.er fallo, el
deslizador se anima al valor correcto.

| Etapa | Meta | Solución | Retro: arriba · abajo | Pista tras el 2.º fallo |
|---|---|---|---|---|
| 1 | 5.000 | 20 % | «Demasiado dinero: sube el encaje.» · «Muy poco: baja el encaje.» | «Con 20 % se congela uno de cada cinco pesos.» |
| 2 | 10.000 | 10 % | «Te pasaste: sube un poco el encaje.» · «Falta: baja el encaje para alargar la cascada.» | «Busca un encaje de una cifra redonda pequeña.» |
| 3 | 4.000 | 25 % | «Aún sobra dinero: sube el encaje.» · «Frenaste de más: baja el encaje.» | «Con 25 % se congela uno de cada cuatro pesos.» |

Subtema: `pm-creacion-secundaria`, `pm-instrumentos`.
Nota de fidelidad: el total 1.000 / encaje es la suma de la cascada del profesor (supone que
todo se presta y se redeposita); se dice en la tarjeta de cierre: «Supone que todo préstamo
vuelve como depósito.» (9 palabras).

### A4 · Bóveda y cajas (`pm26-a4-cajas`)
**Gancho visual:** a la izquierda, la bóveda del BanRep (base monetaria); a la derecha,
tres cajas anidadas M1 ⊂ M2 ⊂ M3 dibujadas a escala real con las cifras de agosto de 2026.

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | La bóveda se llena con dos montones: «efectivo» y «reservas de los bancos». | «Base monetaria: el efectivo más las reservas de los bancos en el BanRep.» |
| 2 | Aparece la caja M1 con «efectivo» y «cuentas corrientes». | «M1, los medios de pago: efectivo más cuentas corrientes.» |
| 3 | M1 entra en una caja mayor M2 que suma «ahorros, CDT, CDAT». Tocar «cuasidineros» muestra la definición. | «M2 suma los cuasidineros: ahorros, CDT y CDAT. No pagas con ellos, pero casi.» |
| 4 | M2 entra en M3, que suma «otros depósitos y bonos». | «M3 suma otros depósitos a la vista y bonos.» |
| 5 | Las cajas se redimensionan a escala con cifras de agosto de 2026 (miles de millones): BM 193.755 · M1 231.697 · M2 980.377 · M3 1.031.096. Tocar cada una muestra su cifra en billones. | «En Colombia, M3 es unas cinco veces la base monetaria: unos 1.031 billones.» |
| 6 | Una flecha a lo largo de la lista de depósitos, rotulada «más líquido» en la cuenta corriente. | «Entre más arriba, más líquido: más fácil de gastar ya.» |

### H3 · Cada depósito a su caja (`pm26-h3-cajas`, Medio, 25 FP × %)
**Consigna:** «Arrastra cada cosa al primer agregado donde entra.» (8)
**Figura:** la bóveda (BM) y las cajas M1, M2, M3 de A4, más una bandeja «No es depósito».
Acierto: la ficha entra a su caja y la caja crece un poco. Error: rebota, borde coral, retro.
**Partida:** 7 de 9. Puntaje = aciertos al primer intento / 7.

| # | Ficha | Correcto | Retro si la lleva a… |
|---|---|---|---|
| 1 | Cuenta corriente | M1 | BM: «La BM son efectivo y reservas, no cuentas del público.» · M2: «Ya entra en M1: es medio de pago.» · M3: «Entra antes, en M1.» · No es depósito: «Sí es un depósito a la vista.» |
| 2 | Cuenta de ahorros | M2 | BM: «Es un depósito del público, no reserva del BanRep.» · M1: «No se paga con cheque: es cuasidinero, M2.» · M3: «Entra antes, en M2.» · No es depósito: «Sí es depósito: un cuasidinero.» |
| 3 | CDT | M2 | BM: «Es ahorro del público en un banco.» · M1: «Es ahorro a plazo: cuasidinero, M2.» · M3: «Entra antes, en M2.» · No es depósito: «Sí: es un depósito a término.» |
| 4 | CDAT | M2 | BM: «Es ahorro del público, no reserva.» · M1: «Es a término: cuasidinero, M2.» · M3: «Entra antes, en M2.» · No es depósito: «Sí: depósito de ahorro a término.» |
| 5 | Reservas de los bancos en el BanRep (encaje) | BM | M1: «Las reservas no son medio de pago del público.» · M2: «No es ahorro del público: es reserva bancaria.» · M3: «Es reserva: entra en la base monetaria.» · No es depósito: «Es depósito de los bancos en el BanRep.» |
| 6 | Depósitos judiciales | M3 | BM: «Es dinero del público, no reserva.» · M1: «No es medio de pago: entra en M3.» · M2: «No es cuasidinero: es otro depósito a la vista.» · No es depósito: «Sí es depósito: está en M3.» |
| 7 | Bonos del sistema financiero | M3 | BM: «No los emite el BanRep como dinero.» · M1: «No son medio de pago.» · M2: «No son cuasidinero: entran en M3.» · No es depósito: «Para el profesor, entran en M3.» |
| 8 | Convenios de pago | M3 | BM: «No es reserva del BanRep.» · M1: «No es cuenta corriente: entra en M3.» · M2: «No es cuasidinero: otro depósito a la vista.» · No es depósito: «Sí: otro depósito a la vista.» |
| 9 | Saldo de tu tarjeta de crédito | No es depósito | BM: «Es un préstamo del banco, no reserva.» · M1: «No es dinero tuyo: es crédito.» · M2: «No es ahorro: es deuda.» · M3: «No es depósito: es un préstamo.» |

Subtema: `pm-agregados`; 9 además `pm-formas-dinero`.

### A5 · El precio del dinero (`pm26-a5-precio-dinero`)
**Gancho visual:** la gráfica del mercado de dinero con la oferta como una pared vertical que
se empuja con la mano, y la demanda como una cuerda curva que se estira con el ingreso.
Eje vertical «i», horizontal «M/P». Modelo: oferta vertical en M/P = 100 (rango 80–120);
demanda L = k·Y − h·i con k = 0,5, h = 10, Y = 300 (rango 260–360). Con esos rangos la tasa
queda siempre entre 1 % y 10 % (nunca negativa). Equilibrio i = (kY − M/P)/h
= 5 % de inicio. Tasa mostrada con un decimal.

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | Solo la pared vertical «Oferta M̄/P». | «El BanRep decide cuánto dinero hay. Por eso la oferta es una pared vertical.» |
| 2 | Aparece la curva «Demanda L = kY − hi». Arrastrar un punto sobre ella: a más tasa, menos dinero quieren. | «La gente quiere menos dinero en la mano cuando la tasa de interés sube.» |
| 3 | Deslizador «Ingreso Y»: la curva se corre a la derecha o izquierda. | «Con más ingreso, quieres más dinero para tus compras: la demanda se corre.» |
| 4 | Se marca el cruce y su tasa «i₁». | «Donde se cruzan, sale la tasa de interés: el precio del dinero.» |
| 5 | Arrastrar la pared: a la derecha la tasa baja; a la izquierda, sube. | «Más dinero, tasa más baja. Menos dinero, tasa más alta.» |
| 6 | Botón «Suben los precios P»: la pared se corre a la izquierda sola (M̄/P baja) y la tasa sube. | «Si los precios suben y el dinero no, hay menos dinero real: la tasa sube.» |

### H4 · Mueve la curva, mira la tasa (`pm26-h4-mueve-tasa`, Medio, 25 FP × %)
**Consigna:** «Mueve la curva que cambia, hacia donde crees.» (8)
**Figura:** la gráfica de A5 con un asa en la pared (oferta, arrastre horizontal) y otra en la
curva (demanda, arrastre horizontal). «Revelar»: la curva correcta se mueve, la incorrecta
vuelve a su sitio si se movió, y la tasa sube o baja con una flecha. Se califican: qué
curva y hacia dónde.
**Partida:** 5 de 7. Puntaje = criterios correctos / 10.

| # | Suceso | Curva · Dirección (tasa) | Retro si yerra la curva · la dirección |
|---|---|---|---|
| 1 | El BanRep emite más pesos. | Oferta · derecha (i ↓) | «Emitir cambia cuánto dinero hay: la oferta.» · «Más dinero: la pared va a la derecha.» |
| 2 | El BanRep vende TES. | Oferta · izquierda (i ↑) | «Vender TES retira pesos: cambia la oferta.» · «Retira dinero: la pared va a la izquierda.» |
| 3 | Sube el ingreso de la economía. | Demanda · derecha (i ↑) | «El ingreso cambia cuánto dinero quiere la gente.» · «Más ingreso, más demanda de dinero: a la derecha.» |
| 4 | Cae el ingreso de la economía. | Demanda · izquierda (i ↓) | «El ingreso mueve la demanda, no la oferta.» · «Menos ingreso, menos dinero deseado: a la izquierda.» |
| 5 | Suben los precios y el BanRep no emite. | Oferta · izquierda (i ↑) | «Lo que cambia es el dinero real, M̄/P: la oferta.» · «Precios más altos: menos dinero real.» |
| 6 | El BanRep compra dólares. | Oferta · derecha (i ↓) | «Comprar dólares emite pesos: cambia la oferta.» · «Entran pesos: la pared a la derecha.» |
| 7 | El BanRep le presta liquidez a los bancos. | Oferta · derecha (i ↓) | «Prestar a los bancos es emitir: la oferta.» · «Más liquidez: a la derecha.» |

### A6 · Tres palancas (`pm26-a6-palancas`)
**Gancho visual:** un tablero con tres palancas de tres posiciones (sube / igual / baja):
«Tasa de intervención», «OMA (TES)», «Encaje». Un letrero arriba se enciende «Expansiva»
o «Contraccionista» según la combinación, y una aguja DA sube o baja.

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | La lupa de seis caras de T3 en miniatura, en la cara Naturaleza; el lente muestra la ventanilla y la cascada. | «Naturaleza: regula la creación de dinero, el sistema financiero y el crédito.» |
| 2 | Cara Objetivos: dos íconos, termómetro (precios) y flecha de crecimiento. | «Objetivos: controlar los precios y apoyar el crecimiento económico.» |
| 3 | El tablero. Tocar cada palanca muestra a qué proceso toca: tasa y OMA → «creación primaria»; encaje → «creación secundaria». | «Instrumentos: tasa de intervención, operaciones de mercado abierto con TES, y encaje.» |
| 4 | Mover palancas: «Tasa ↓», «Compra TES», «Encaje ↓» encienden «Expansiva» y la aguja DA sube. | «Expansiva: bajar la tasa, comprar TES o bajar el encaje. Más dinero, más demanda.» |
| 5 | «Tasa ↑», «Vende TES», «Encaje ↑» encienden «Contraccionista». | «Contraccionista: subir la tasa, vender TES o subir el encaje.» |
| 6 | La ecuación de T1 con la perilla de la tasa resaltada en el tono monetario; al mover la palanca, −b·i cambia y la aguja se mueve. | «En la demanda agregada entra por la tasa: −b·i. Tasa más baja, más inversión.» |
| 7 | Nueve íconos de impacto alrededor (crédito, inversión, consumo y ahorro, deuda pública, capitales, sector real…); tocar cada uno muestra su nombre. | «Sus efectos llegan al crédito, la inversión, el consumo, la deuda pública y los capitales.» |

### H6 · El dominó de la tasa (`pm26-h6-domino`, Medio, 25 FP × %)
**Consigna:** «Ordena las fichas para que caigan en orden.» (8)
**Figura:** fichas de dominó de pie en una fila, revueltas; se arrastran para reordenar
(o se tocan dos para intercambiarlas). «Empujar» las hace caer: si el orden está bien,
caen todas en cadena (120 ms entre fichas); si no, la cadena se detiene en la primera ficha
fuera de lugar, que se pinta coral y muestra su retro, y el estudiante reordena.
**Partida:** 2 cadenas de 3. Puntaje = fichas en su lugar en el primer empujón / total.

| Cadena | Orden correcto | Retro de la ficha fuera de lugar (por ficha) |
|---|---|---|
| A · Baja la tasa | 1 La Junta baja la tasa de intervención → 2 Los bancos abaratan sus créditos → 3 Familias y empresas piden más crédito → 4 Suben la inversión y el consumo → 5 Sube la demanda agregada → 6 Sube la producción | 1 «Todo empieza en la decisión de la Junta.» · 2 «Primero cambia el precio del crédito.» · 3 «Con crédito barato, se pide más.» · 4 «El crédito se gasta en invertir y consumir.» · 5 «Más inversión y consumo suman a la DA.» · 6 «Con más demanda, se produce más.» |
| B · Sube el encaje | 1 El BanRep sube el encaje → 2 Los bancos congelan más de cada depósito → 3 Prestan menos → 4 Se multiplica menos dinero → 5 Baja la demanda agregada | 1 «Arranca con la decisión del BanRep.» · 2 «El encaje es lo que se congela.» · 3 «Lo congelado no se presta.» · 4 «Menos préstamos, cascada más corta.» · 5 «Menos dinero y crédito: menos demanda.» |
| C · Compra TES | 1 El BanRep compra TES → 2 Entrega pesos nuevos → 3 Sube la base monetaria → 4 Hay más liquidez y baja la tasa → 5 Sube la inversión | 1 «La operación de mercado abierto va primero.» · 2 «Compra pagando con pesos nuevos.» · 3 «Esos pesos son base monetaria.» · 4 «Más dinero, tasa más baja.» · 5 «Tasa más baja, más inversión.» |

Subtemas: A `pm-impactos`, `pm-apertura`; B `pm-instrumentos`, `pm-creacion-secundaria`;
C `pm-instrumentos`, `pm-medidas`.
Celular: a 320 px las fichas van en columna (de arriba abajo), cada una ≥ 56 px de alto,
y caen hacia abajo.

### A7 · El termostato (`pm26-a7-termostato`)
**Gancho visual:** una casa con termómetro (inflación) y un aire acondicionado (tasa).
Debajo, la gráfica estilizada 2016–2026 del caso: dos líneas (inflación total y tasa de
intervención) y la banda 2 %–4 % sombreada. Datos = lectura aproximada del gráfico del
BanRep (d. 43): inflación ≈ 9 (2016), 2 (2020), 13 (2023), 6 (2026); tasa ≈ 4,5 (2017),
1,75 (2020–2021), 13,25 (2023), 9,25 (2025), 12 (2026). Rótulo: «Lectura aproximada del
gráfico del Banco de la República».

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | La casa con el termómetro (tono cálido de la marca, nunca coral). Botón «Subir el aire» baja la temperatura con retraso visible (3 segundos). | «Inflación alta es una casa caliente. La tasa de interés es el aire acondicionado.» |
| 2 | Banda 2 %–4 % sombreada en el termómetro. | «La meta: que la inflación quede entre 2 % y 4 %.» |
| 3 | La gráfica se dibuja de 2016 a 2026 con un control para recorrer los años (deslizador de tiempo); el punto de cada año muestra sus dos cifras. | «Recorre los años: cuando la inflación se dispara, la tasa sube detrás.» |
| 4 | Se resalta 2021–2023: la inflación sube primero, la tasa después, y la inflación tarda en bajar. | «El aire tarda en enfriar: la tasa actúa con rezago de meses.» |


### H5 · La Junta decide (`pm26-h5-junta`, Difícil, 50 FP × %)
**Consigna:** «Pon las tres palancas como lo haría la Junta.» (9)
**Figura:** el tablero de A6 y, encima, el termostato de A7 con la lectura de la ronda.
Cada palanca tiene tres posiciones. «Decidir»: cada palanca correcta se queda con ✓; cada
errada se pinta coral y muestra su retro. Luego el termómetro se mueve con rezago hacia
la banda si la decisión fue correcta. **Partida:** 3 rondas, orden aleatorio.
Puntaje = palancas correctas / 9.

| Ronda | Lectura (≤ 12 palabras) | Tasa · TES · Encaje | Retro de la palanca errada |
|---|---|---|---|
| R1 | «Inflación de 9 %, muy por encima de la meta.» | Sube · Vende · Sube | Tasa: «Para enfriar los precios, la tasa sube.» · TES: «Vender TES retira pesos: enfría.» · Encaje: «Subir el encaje frena el crédito.» |
| R2 | «Inflación de 1,5 % y la economía frenada.» | Baja · Compra · Baja | Tasa: «Con precios bajos y economía frenada, la tasa baja.» · TES: «Comprar TES inyecta pesos.» · Encaje: «Bajar el encaje libera crédito.» |
| R3 | «Inflación de 3 %, dentro de la meta, economía estable.» | Igual · Igual · Igual | Tasa: «En la meta y estable: mantener.» · TES: «Sin razón para inyectar ni retirar.» · Encaje: «Nada que corregir: el encaje se mantiene.» |

Subtema: `pm-medidas`, `pm-instrumentos`, `pm-caso-inflacion-tasa`.
Fidelidad: las rondas son casos ilustrativos (no fechas reales) y se dice en la tarjeta
inicial: «Casos de práctica, no decisiones reales de la Junta.» (8 palabras).

---

## 3. Autoevaluación contra el Kit

| Dimensión | Nivel esperado | Por qué |
|---|---|---|
| Prerrequisitos | Pasa | Rastreable a d. 2–43; se corrigen M3 y la flecha a c; metáfora de cajas sin falsedad. |
| D1 | Avanzado | 12 subtemas cubiertos, incluido el caso real. |
| D2 | Avanzado | Comprender (A1–A7), predecir (H1, H4), aplicar (H2, H3), explicar la cadena (H6), decidir (H5). |
| D3 | Avanzado | Pistas en H2; retro por flecha, por ficha y por palanca. |
| D4 | Avanzado | Ventanilla, cascada, gráfica, palancas, dominó: el estudiante mueve el mecanismo. |
| D6 | Avanzado | 27 en H1, 6 en H2, 36 en H3, 14 en H4, 16 en H6, 9 en H5. |
| D7 | Avanzado (a medir) | Gráficas y tablero a 320; dominó en columna. |
| D8 | Avanzado | Bancos mayores que la partida y rondas en orden aleatorio. |
| D9 | Avanzado | Billetera, ventanilla, cascada, bóveda y cajas, pared y cuerda, palancas, dominó, termostato. |
| D11 | Avanzado | Ventanilla y cascada reaparecen en H1 con el mismo significado. |
| D13 | Medio | ≤ 12 palabras. |

## 4. Conteo de palabras
Aprender (≤ 20): A1 14 · 10 · 13 · 15 · 16 — A2 9 · 11 · 6 · 15 · 15 · 14 — A3 13 · 13 · 13 · 12 · 8 —
A4 13 · 9 · 15 · 8 · 14 · 9 — A5 14 · 14 · 14 · 12 · 9 · 16 — A6 12 · 9 · 12 · 15 · 9 · 14 · 15 —
A7 13 · 10 · 12 · 11.
Consignas (≤ 12): H1 8 · H2 11 · H3 8 · H4 8 · H5 9 · H6 8.
