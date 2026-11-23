# T3 · Política fiscal — plan y especificación completa (Gen, 2026-11-22)

Fuente única: `fichas/3-politica-fiscal.md`. Tema id: `politica-fiscal`. Ids: `pf26-…`.

## 0. Reglas comunes

Valen TODAS las de `t1-demanda-agregada.md` §0 y los íconos de rama de `t2` §0.
Además, en este tema:
- **Cifras que NO se usan** porque la fuente del profesor declara «ChatGPT» (ficha §11.10):
  tablas de d. 16–17 (salvo tarifas que se repiten en documentos reales), d. 36, 38, 40,
  43 y 44. Tampoco se usa el SOAT (clasificación discutible, ficha §11.4) ni la nómina de
  salario bajo (d. 23, ficha §11.5).
- **Cifras que SÍ se usan** (documentos reales del profesor): restaurante d. 25, vehículo
  d. 28, peajes d. 31, predial d. 29, notaría d. 30, nómina de salario alto d. 22, saldo de
  deuda d. 42 (1.194 = 840 + 354 billones). Con punto de miles y «billones» en el sentido
  español; la primera vez que aparece «billón» se acompaña de «un millón de millones».
- **Tributación con tres colores fijos** (`src/macro2026/comun/tributos.js`): impuesto,
  tasa, contribución; y una marca de forma para directo (lupa) e indirecto (código de barras).
  Nunca coral.

## 1. Plan del tema

| # | id | Tipo | Nombre | Mecánica | Subtemas | Dific. | FP |
|---|---|---|---|---|---|---|---|
| 1 | pf26-a1-lupa | Aprender | La lupa de seis caras | Explorar tocando | pe-marco-analisis, pf-naturaleza | — | 0 |
| 2 | pf26-a2-buzones | Aprender | Tres buzones | Tocar y ver la consecuencia | pf-instrumentos | — | 0 |
| 3 | pf26-h1-moneda | Hacer | Echa la moneda | Arrastrar y clasificar | pf-instrumentos, pf-tributacion-casos | Fácil | 10 × % |
| 4 | pf26-a3-cajeros | Aprender | Dos cajeros | Simulador (billeteras) + línea de tiempo | pf-impuestos | — | 0 |
| 5 | pf26-h2-cajero | Hacer | ¿Qué cajero te cobra? | Deslizar la tarjeta (microdesafíos) | pf-impuestos | Fácil | 10 × % |
| 6 | pf26-h3-factura | Hacer | La factura con lupa | Encontrar y clasificar en un documento real (3 etapas) | pf-tributacion-casos, pf-impuestos | Medio | 25 × 3 = 75 × % |
| 7 | pf26-a4-tanque | Aprender | El tanque del Estado | Simulador de flujos | pf-instrumentos, pf-gasto-casos, pf-deuda-casos | — | 0 |
| 8 | pf26-h5-montanas | Hacer | Las dos montañas | Microdesafíos encadenados | pf-deuda-casos, pf-impactos | Medio | 25 × % |
| 9 | pf26-a5-balanza | Aprender | La balanza fiscal | Simulador + explorar | pf-medidas, pf-en-da, pf-impactos | — | 0 |
| 10 | pf26-h4-expande | Hacer | ¿Expande o contrae? | Predecir y revelar en la balanza | pf-medidas, pf-en-da | Medio | 25 × % |
| 11 | pf26-h6-memo | Hacer | El memo de la gerencia | Encontrar el error | pf-impactos, pf-preparcial, pf-medidas | Difícil | 50 × % |

**Variedad:** 6 Hacer, 6 mecánicas (arrastrar a buzón, deslizar tarjeta, marcar líneas de
un documento, microdesafíos, balanza con predicción, error en un memo). Ninguna A-B-C-D.
**Respaldo:** H3 trabaja con documentos reales del profesor: **aprendizaje situado y
transferencia** (el estudiante reconoce el concepto donde lo va a encontrar en su vida).
A2 y A3 usan una consecuencia física por concepto (ticket, andén, lupa): **codificación
dual** (Paivio, Mayer). H2 son decisiones muy rápidas y repetidas: **recuperación
espaciada dentro de la sesión**. H4 pide apostar antes de ver: **predicción**.

**Lo que corrijo o evito del material (para Mateo, una línea):** no uso cifras que el
profesor atribuye a ChatGPT; no clasifico el SOAT; en la DA, las transferencias entran
multiplicadas por c (como en T1), aunque la d. 11 las sume directo.

---

## 2. Especificación pieza por pieza

### A1 · La lupa de seis caras (`pf26-a1-lupa`)
**Gancho visual:** una lupa con lente hexagonal; cada cara es un botón y, al tocarla,
el lente «enfoca» un dibujo distinto de la política fiscal.

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | La lupa con las seis caras rotuladas: Naturaleza, Mercado, Objetivos, Instrumentos, Medidas, Impactos. Tocar una la ilumina. | «Toda política especializada se mira con la misma lupa de seis caras.» |
| 2 | Cara Naturaleza: el lente muestra una alcancía del Estado con tres flechas (cobra, gasta, debe). | «Naturaleza: la fiscal usa las finanzas públicas: lo que el Estado cobra, gasta y debe.» |
| 3 | Cara Mercado: el carrito de la DA de T1 (mismo dibujo y colores). | «Mercado: el de bienes y servicios. Se analiza con la demanda agregada.» |
| 4 | Cara Objetivos: cinco íconos (asignación, redistribución, estabilización, crecimiento, ambiente); tocar cada uno muestra su nombre. | «Objetivos: sirve a todos los de la política económica, porque toca a todos.» |
| 5 | Cara Instrumentos: tres asas: «Tributación», «Gasto público», «Deuda pública». | «Instrumentos: tres. Tributación, gasto público y deuda pública.» |
| 6 | Cara Medidas: una flecha que sube (expansiva) y una que baja (contraccionista) sobre el carrito. Cara Impactos: «se ve en La balanza fiscal». | «Medidas: expansivas si suben la demanda; contraccionistas si la bajan.» |

### A2 · Tres buzones (`pf26-a2-buzones`)
**Gancho visual:** tres buzones; una moneda que se arrastra a cada uno produce algo
distinto: nada vuelve (impuesto), sale un ticket y se levanta una barrera (tasa), aparece
un andén frente a la casa (contribución).

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | Los tres buzones cerrados, cada uno de su color. | «Tributación es todo pago obligatorio al Estado. Viene en tres formas.» |
| 2 | Arrastrar la moneda al buzón «Impuesto»: cae a un pozo común con muchas monedas; no sale nada. | «Impuesto: pagas y no recibes nada a cambio directo. Va al pozo común.» |
| 3 | Moneda al buzón «Tasa»: sale un ticket y una barrera de peaje se levanta. | «Tasa: pagas por un servicio que usas. Peaje, tasa aeroportuaria, notaría.» |
| 4 | Moneda al buzón «Contribución»: frente a una casa aparece un andén nuevo. | «Contribución: pagas una obra o servicio que te beneficia. Valorización, seguridad social.» |

### H1 · Echa la moneda (`pf26-h1-moneda`, Fácil, 10 FP × %)
**Consigna:** «Arrastra cada pago al buzón que le corresponde.» (8)
**Figura:** los tres buzones de A2. Cada pago es una moneda con su rótulo. Acierto: la
moneda entra y se ve la consecuencia de A2 (pozo, ticket, andén). Error: rebota con borde
coral y retro; segundo intento sin puntaje. **Partida:** 8 de 11. Puntaje = aciertos al
primer intento / 8.

| # | Pago | Correcto | Retro si lo echa en… |
|---|---|---|---|
| 1 | El IVA de una camisa | Impuesto | Tasa: «No compras un servicio del Estado: es impuesto sobre la compra.» · Contribución: «No financia una obra para ti: va al pozo común.» |
| 2 | El peaje Río Bogotá, $11.200 | Tasa | Impuesto: «A cambio usas la vía: eso lo vuelve tasa.» · Contribución: «Pagas por pasar ahora, no una obra frente a tu casa.» |
| 3 | La tasa aeroportuaria del tiquete | Tasa | Impuesto: «Pagas por usar el aeropuerto: es tasa.» · Contribución: «Es pago por un servicio que usas hoy: tasa.» |
| 4 | Tu aporte a pensión en la nómina | Contribución | Impuesto: «Financia tu propia seguridad social: es contribución.» · Tasa: «No pagas un servicio puntual: aportas a un sistema que te cubre.» |
| 5 | La valorización por una vía nueva frente a tu casa | Contribución | Impuesto: «Paga una obra que te beneficia: contribución.» · Tasa: «No es por usarla una vez: financia la obra que te valoriza.» |
| 6 | El impuesto predial de tu apartamento | Impuesto | Tasa: «No recibes un servicio a cambio: es impuesto.» · Contribución: «No financia una obra específica: va al pozo común.» |
| 7 | Los derechos notariales al vender un apartamento | Tasa | Impuesto: «Pagas por el servicio de la notaría: tasa.» · Contribución: «Es un trámite que usas, no una obra: tasa.» |
| 8 | El aporte del empleador al SENA | Contribución | Impuesto: «Es un aporte parafiscal: contribución.» · Tasa: «No pagas un servicio que usas: aportas a un sistema.» |
| 9 | El impoconsumo del 8 % en un restaurante | Impuesto | Tasa: «No es pago por un servicio del Estado: impuesto al consumo.» · Contribución: «No financia una obra para ti: impuesto.» |
| 10 | La matrícula de un carro nuevo | Tasa | Impuesto: «Pagas el trámite de registro: tasa.» · Contribución: «Es un trámite, no una obra que te beneficia: tasa.» |
| 11 | El impuesto anual del vehículo | Impuesto | Tasa: «No recibes un servicio a cambio: impuesto.» · Contribución: «Va al pozo común: impuesto.» |

Subtema: `pf-instrumentos` y `pf-tributacion-casos`.

### A3 · Dos cajeros (`pf26-a3-cajeros`)
**Gancho visual:** dos cajeros lado a lado: el «directo» mira tu billetera con una lupa;
el «indirecto» solo pasa el producto por el lector de código de barras.

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | Cajero directo. Tres billeteras (pequeña, mediana, grande); tocar cada una: el cajero cobra más a la más grande (barras de cobro 1, 2, 4: tarifa progresiva). | «Un impuesto directo mira quién eres: tu renta, tu casa, tu carro.» |
| 2 | Cajero indirecto. Las tres billeteras compran la misma camisa: el cobro es igual para las tres. | «Uno indirecto mira solo qué compras. Cobra igual al rico y al pobre.» |
| 3 | Dos columnas de fichas bajo cada cajero; tocar una ficha la mueve a su cajero si estaba fuera. | «Directos: renta, predial, vehículos, ICA. Indirectos: IVA, impoconsumo, aranceles.» |
| 4 | Línea de tiempo de 12 meses: cada mes una monedita «retención» cae en una caja; al final, la «declaración» compara la caja con el impuesto del año y muestra «saldo a pagar». | «Ojo: la retención en la fuente no es otro impuesto. Es renta cobrada por adelantado.» |
| 5 | Mapa con tres capas: Nación (renta, IVA), departamento (vehículos), municipio (predial, ICA). Tocar cada capa. | «Cobran tres niveles: Nación, departamento y municipio.» |

### H2 · ¿Qué cajero te cobra? (`pf26-h2-cajero`, Fácil, 10 FP × %)
**Consigna:** «Desliza cada tributo hacia el cajero que lo cobra.» (9)
**Figura:** los dos cajeros de A3 a izquierda (lupa, «Directo») y derecha (código de
barras, «Indirecto»). Una tarjeta al centro; se desliza con el dedo o con las flechas del
teclado, o se toca el cajero. Acierto: el cajero la recibe y hace su gesto (lupa o
escáner). Error: la tarjeta vuelve al centro, borde coral, retro; segundo intento sin
puntaje. **Partida:** 8 de 12. Puntaje = aciertos al primer intento / 8.

| # | Tributo | Correcto | Retro si yerra |
|---|---|---|---|
| 1 | Impuesto de renta | Directo | «Depende de cuánto ganas: mira tu condición.» |
| 2 | IVA | Indirecto | «Lo pagas al comprar, ganes lo que ganes.» |
| 3 | Predial | Directo | «Recae sobre tu propiedad, según su avalúo.» |
| 4 | Impoconsumo | Indirecto | «Va en la cuenta del restaurante, igual para todos.» |
| 5 | Industria y comercio (ICA) | Directo | «Depende de los ingresos de la empresa.» |
| 6 | Arancel | Indirecto | «Va dentro del precio de lo importado.» |
| 7 | Impuesto de vehículos | Directo | «Depende del valor de tu carro.» |
| 8 | Ganancia ocasional | Directo | «Grava una ganancia tuya, según su tamaño.» |
| 9 | Timbre | Indirecto | «Recae sobre el documento o la transacción.» |
| 10 | Impuesto al patrimonio | Directo | «Mira cuánto tienes: es directo.» |
| 11 | Retención en la fuente sobre tu salario | Directo | «Es tu impuesto de renta cobrado por adelantado.» |
| 12 | Impuesto de salida del país | Indirecto | «Lo paga todo el que sale, sin mirar su renta.» |

Subtema: `pf-impuestos`. Celular: a 320 px los cajeros miden 40 % del ancho cada uno; el
deslizamiento no mueve la página (`touch-action: pan-y` en la tarjeta).

### H3 · La factura con lupa (`pf26-h3-factura`, Medio, 25 × 3 = 75 FP × %)
**Consigna:** «Toca cada línea y dile qué es.» (7)
**Figura:** un documento con aspecto de recibo real (papel, renglones, totales), redibujado,
sin logos ni nombres de empresas. Arriba, el personaje del profesor con su pregunta
(«¿Por qué el carro cuesta tanto más?»). Tocar una línea abre una fila de cinco fichas:
«Impuesto directo», «Impuesto indirecto», «Tasa», «Contribución», «No es tributo».
Al elegir: correcto → la línea se pinta del color de su tributo con ✓; incorrecto → coral
breve, retro del par y la línea queda abierta para reintentar (ya no puntúa). Una barra
lateral «Lo que va al Estado» crece con cada tributo bien marcado.
**Partida:** 3 documentos (= 3 etapas) de 4. Puntaje = líneas correctas al primer intento / total de líneas.

**Documentos y clave:**
- **Carro nuevo** (d. 28; pregunta: «¿Por qué el carro cuesta tanto más?»)
  Precio base $130.000.000 → No es tributo · IVA 19 % $24.700.000 → Indirecto · Impoconsumo 8 % $10.400.000 → Indirecto · Matrícula y registro $540.200 → Tasa · Revisión técnico-mecánica $327.219 → No es tributo · Impuesto anual del vehículo $3.336.000 → Directo.
- **Tiquete internacional** (d. 24; «¿Por qué el tiquete es tan caro?»)
  Tarifa base → No es tributo · Tasa aeroportuaria → Tasa · Timbre nacional ≈ US$ 38 → Indirecto · Impuesto de salida ≈ $115.000 → Indirecto · Tarifa administrativa → No es tributo · Combustible y cargos → No es tributo.
- **Venta de apartamento en notaría** (d. 30; «¿Por qué me cobran tanto en la notaría?»)
  Derechos notariales → Tasa · Autenticaciones y biometría → Tasa · Fondo de notariado y superintendencia → Tasa · IVA del servicio notarial → Indirecto · Retención en la fuente por la venta → Directo. Total $2.316.824.
- **Nómina de un salario alto** (d. 22; «¿Qué me quitan del salario?»)
  Salario integral $16.900.000 → No es tributo · Salud 4 % $473.200 → Contribución · Pensión 4 % $473.200 → Contribución · Fondo de solidaridad 1 % $118.300 → Contribución · Retención en la fuente $1.014.000 → Directo. Neto $14.821.300.

**Retro por par (verdadero → elegido)**, ≤ 15 palabras:
| Verdadero → | Directo | Indirecto | Tasa | Contribución | No es tributo |
|---|---|---|---|---|---|
| **Directo** | — | «Mira tu renta o tu bien, no solo la compra.» | «No pagas un servicio: es impuesto sobre ti.» | «No financia un sistema o una obra para ti.» | «Sí es tributo: va al Estado, según tu condición.» |
| **Indirecto** | «Recae en la compra; no mira quién paga.» | — | «No es pago por un servicio del Estado.» | «Va al pozo común, no a una obra tuya.» | «Sí es tributo: lo cobra el Estado en la compra.» |
| **Tasa** | «Pagas por un servicio que usas; no mira tu renta.» | «No grava una compra: paga un servicio público.» | — | «Pagas el servicio que usas ahora, no una obra.» | «Sí es tributo: es el precio de un servicio público.» |
| **Contribución** | «Financia un sistema que te cubre, no es impuesto.» | «No grava una compra: es aporte a un sistema.» | «No pagas un servicio puntual: aportas a un sistema.» | — | «Sí es tributo: es un aporte obligatorio.» |
| **No es tributo** | «Es el precio de lo comprado; no va al Estado.» | «Es precio o cargo privado, no impuesto.» | «Lo cobra una empresa, no el Estado.» | «No es aporte obligatorio al Estado.» | — |

Celular: a 320 px el documento ocupa el ancho; cada línea es un bloque ≥ 48 px; las cinco
fichas aparecen bajo la línea tocada en dos filas (3 + 2), nunca como ventana flotante que
tape el documento.

### A4 · El tanque del Estado (`pf26-a4-tanque`)
**Gancho visual:** un tanque de agua con grifos que lo llenan (tributos y préstamos) y
tres desagües (funcionamiento, inversión, servicio de la deuda). Al lado, dos montañas de
deuda que crecen cuando se abre la manguera del préstamo.

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | Tanque con un grifo «Tributos» y tres desagües cerrados. Deslizador «Tributos»; el nivel sube. | «El Estado es un tanque: entran tributos y préstamos; salen tres desagües de gasto.» |
| 2 | Abrir el desagüe «Funcionamiento» (botón); el nivel baja. Íconos: nómina, insumos, servicios. | «Funcionamiento: lo que cuesta que el Estado opere. Nómina, insumos, servicios.» |
| 3 | Abrir «Inversión»: el agua sale hacia una vía, una escuela y un metro que se construyen. | «Inversión: lo que deja capacidad. Vías, escuelas, metro, investigación.» |
| 4 | Abrir «Servicio de la deuda»: el agua sale hacia una caja «intereses y abonos». | «Servicio de la deuda: los intereses y abonos de lo que se prestó.» |
| 5 | Si el tanque se vacía, se habilita la manguera «Préstamo» con dos boquillas: «Interna (pesos, TES)» y «Externa». Usarla llena el tanque y hace crecer su montaña. | «Si no alcanza, se presta: deuda interna en pesos, sobre todo TES; externa, afuera.» |
| 6 | Las dos montañas a escala: 840 y 354, con su suma 1.194. Rótulo fijo «1 billón = un millón de millones». | «Colombia debía cerca de $1.194 billones a fines de 2025: 840 internos y 354 externos.» |
| 7 | Lado a lado: la montaña (saldo) y una cubeta que sale del desagüe «Servicio de la deuda» (lo pagado en el año). | «No confundas: la deuda es lo que se debe; el servicio, lo que se paga cada año.» |

### H5 · Las dos montañas (`pf26-h5-montanas`, Medio, 25 FP × %)
**Consigna general:** «Resuelve cada reto sobre las montañas de la deuda.» (9)
**Figura:** las dos montañas de A4 (interna y externa). Cinco microdesafíos seguidos; cada
uno cambia algo en las montañas. Puntaje = retos al primer intento / 5.

| Reto | Consigna (≤ 12) | Mecánica | Correcto | Retro de error |
|---|---|---|---|---|
| 1 | «Arrastra la división: ¿cuánto de 1.194 es deuda interna?» | Deslizador que parte una montaña en dos (0–1.194, paso 10) | 840 (tolerancia ± 30) | Si < 810: «La interna es la más grande: cerca de 840 billones.» · Si > 870: «Te pasaste: la externa suma unos 354.» |
| 2 | «Lleva cada acreedor a su montaña.» | Cuatro banderas a dos montañas | Fondos de pensiones → interna · Bancos comerciales colombianos → interna · BID → externa · KfW de Alemania → externa | Fondos/bancos en externa: «Prestan en pesos, vía TES: deuda interna.» · BID en interna: «Es un banco multilateral de afuera: externa.» · KfW en interna: «Es una agencia de otro país: crédito bilateral, externa.» |
| 3 | «¿Con qué papel se presta casi toda la deuda interna?» | Tres papeles que se pegan a la montaña interna: «TES», «Bonos globales», «Crédito del BID» | TES | Bonos globales: «Se venden a inversionistas de afuera: deuda externa.» · BID: «Es un préstamo multilateral externo.» |
| 4 | «El Gobierno paga intereses y abonos este año. ¿Eso es…?» | Arrastrar la cubeta a «Saldo de la deuda» o a «Servicio de la deuda» | Servicio de la deuda | «El saldo es lo que se debe; pagar es servicio de la deuda.» |
| 5 | «Conecta cada deuda con lo que puede mover.» | Dos cables: interna y externa → «Tasa de interés» y «Tipo de cambio» | Interna → tasa de interés · Externa → tipo de cambio (d. 19) | Si los invierte: «La interna compite por pesos: tasa. La externa trae dólares: tipo de cambio.» |

Subtemas: retos 1–4 `pf-deuda-casos`; reto 5 `pf-impactos`.

### A5 · La balanza fiscal (`pf26-a5-balanza`)
**Gancho visual:** un sube y baja; las fichas de medidas se ponen en un plato y un globo
«DA» sube o baja con la inclinación. Usa `modelo-da.js` de T1 para la cifra de Y₀.

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | La ecuación de T1 con tres perillas resaltadas en el tono de la rama fiscal: G, TR, t. | «La política fiscal toca tres perillas de la demanda: G, TR y t.» |
| 2 | Plato «Expansiva»: arrastrar las fichas «más G», «más TR», «menos t»; con cada una el globo DA sube y la cifra Y₀ aumenta. | «Expansiva: más gasto, más transferencias o menos impuestos. La demanda sube.» |
| 3 | Plato «Contraccionista»: fichas «menos G», «menos TR», «más t»; el globo baja. | «Contraccionista: lo contrario. Menos gasto, menos transferencias o más impuestos.» |
| 4 | Deslizador t (0–40 %): una lupa «multiplicador» crece o se encoge; deslizador G: el globo sube sin cambiar la lupa. | «G y TR mueven el gasto autónomo. t cambia el multiplicador.» |
| 5 | Una ficha «Reforma para recaudar» cae en el plato contraccionista aunque su rótulo diga «recaudo». | «A veces el efecto es colateral: una reforma para recaudar también enfría la demanda.» |
| 6 | Cuatro personajes alrededor: familia, empresa, inversionista, región. Tocar cada uno muestra su impacto (ver abajo). | «¿Y a quién le llega? Toca cada uno.» |

Impactos (d. 19, ≤ 12 palabras): Familia «Su capacidad de compra cambia con la renta disponible y los precios.» ·
Empresa «Cambian sus costos y utilidades, y con ellas lo que reinvierte.» ·
Inversionista «Una política puede atraer o espantar inversión nacional y extranjera.» ·
Región «La inversión pública la desarrolla y cierra brechas.»

### H4 · ¿Expande o contrae? (`pf26-h4-expande`, Medio, 25 FP × %)
**Consigna:** «Pon la medida en su plato y di por dónde entra.» (11)
**Figura:** la balanza de A5 con el globo DA. Paso 1: arrastrar la ficha al plato
«Expansiva» o «Contraccionista». Paso 2: tocar por dónde entra: «Gasto autónomo (G o TR)»
o «Multiplicador (t)». Luego «Revelar»: la balanza se inclina de verdad y el globo sube o
baja; si entra por t, la lupa cambia de tamaño. Se califican los dos pasos.
**Partida:** 8 de 10. Puntaje = criterios correctos / 16.

| # | Medida | Plato · Entrada | Retro si yerra el plato · la entrada |
|---|---|---|---|
| 1 | Subir el gasto en vías | Expansiva · G | «Más gasto suma a la demanda: expansiva.» · «Es gasto del Gobierno: entra por G, en el gasto autónomo.» |
| 2 | Bajar la tarifa del impuesto de renta | Expansiva · t | «Menos impuesto deja más renta disponible: expansiva.» · «Cambia la tasa t: agranda el multiplicador.» |
| 3 | Recortar el subsidio de Renta Ciudadana | Contraccionista · TR | «Menos transferencias, menos consumo: contraccionista.» · «Es una transferencia a hogares: entra por TR.» |
| 4 | Subir el impuesto de renta a las personas | Contraccionista · t | «Más impuesto, menos renta disponible: contraccionista.» · «Sube t: encoge el multiplicador.» |
| 5 | Aumentar el pago de Colombia Mayor | Expansiva · TR | «Más dinero a hogares sube el consumo: expansiva.» · «Es una transferencia: entra por TR.» |
| 6 | Recortar el gasto de funcionamiento | Contraccionista · G | «Menos gasto público resta a la demanda.» · «Es gasto del Gobierno: entra por G.» |
| 7 | Adicionar $1 billón a Mi Casa Ya | Expansiva · TR | «Más subsidio a hogares sube su gasto: expansiva.» · «Es un subsidio a hogares: transferencia, TR.» |
| 8 | Quitar beneficios en el impuesto de renta | Contraccionista · t | «Se paga más impuesto: la demanda baja.» · «Sube lo que se paga sobre la renta: t.» |
| 9 | Que más personas declaren y paguen renta | Contraccionista · t | «Más gente paga renta: baja la renta disponible.» · «Sube la tasa efectiva sobre la renta: t.» |
| 10 | Construir la primera línea del metro de Bogotá | Expansiva · G | «Una obra pública suma a la demanda: expansiva.» · «La paga el Gobierno: entra por G.» |

Subtemas: `pf-medidas`, `pf-en-da` en todos.

### H6 · El memo de la gerencia (`pf26-h6-memo`, Difícil, 50 FP × %)
**Consigna:** «Toca la frase del memo que está mal.» (7)
**Figura:** un memo interno de «NOVA S. A.» (la empresa del pre-parcial, d. 45), con
membrete simple y cuatro frases; firma «La gerencia». Mecánica igual a T1 H5: tocar la
falsa la tacha y escribe la corrección; tocar una verdadera da su retro y no puntúa la
página. **Partida:** 4 memos de 5. Orden de frases aleatorio. Puntaje = memos al primer toque / 4.

| Memo | Frases (✗ = falsa) | Retro al tocar una verdadera | Corrección |
|---|---|---|---|
| 1 | a) Si bajan el impuesto de renta a empresas, nuestras utilidades suben. · b) Con más utilidades podemos repartir más o reinvertir. · ✗ c) Si suben el IVA, nuestros clientes compran más. · d) Más impuesto a las personas reduce su renta disponible. | a «Correcta: menos impuesto, más utilidad.» · b «Correcta: la utilidad se reparte o se reinvierte.» · d «Correcta: el impuesto resta a la renta.» | «Con más IVA, los precios suben y los clientes compran menos.» |
| 2 | a) Si el Gobierno invierte en vías, bajan nuestros costos de transporte. · ✗ b) Recortar subsidios a hogares sube nuestras ventas. · c) La inversión pública mejora la competitividad. · d) Más gasto público sube la demanda agregada. | a «Correcta: mejor infraestructura, menor costo.» · c «Correcta: así lo plantea la clase.» · d «Correcta: G suma directo a la DA.» | «Menos subsidios, menos renta disponible: nuestras ventas bajan.» |
| 3 | a) Más deuda interna del Gobierno puede subir la tasa de interés. · ✗ b) Más deuda externa no tiene relación con el dólar. · c) Una tasa más alta encarece nuestros créditos. · d) Si el crédito se encarece, invertimos menos. | a «Correcta: compite por los mismos pesos.» · c «Correcta: la tasa es el precio del crédito.» · d «Correcta: I = Ī − b·i.» | «Más deuda externa puede mover el tipo de cambio.» |
| 4 | a) Una reforma para recaudar puede bajar la demanda como efecto colateral. · b) Bajar t agranda el multiplicador. · ✗ c) Subir impuestos es una política fiscal expansiva. · d) Más pagos de Renta Ciudadana suben el consumo. | a «Correcta: recauda, pero resta renta disponible.» · b «Correcta: el denominador se achica.» · d «Correcta: más TR, más consumo.» | «Subir impuestos es contraccionista: baja la demanda agregada.» |
| 5 | a) Los impuestos son pagos sin contraprestación directa. · ✗ b) El peaje que pagan nuestros camiones es un impuesto. · c) El aporte a pensión de nuestros empleados es contribución. · d) El ICA que pagamos es un impuesto directo. | a «Correcta: van al pozo común.» · c «Correcta: financia su seguridad social.» · d «Correcta: depende de nuestros ingresos.» | «El peaje es una tasa: pago por usar un servicio.» |

Subtemas: memos 1, 2 y 4 `pf-impactos`, `pf-medidas`; memo 3 `pf-impactos`, `pf-deuda-casos`;
memo 5 `pf-instrumentos`; todos `pf-preparcial`.

---

## 3. Autoevaluación contra el Kit

| Dimensión | Nivel esperado | Por qué |
|---|---|---|
| Prerrequisitos | Pasa | Rastreable a d. 2–45; se excluyen cifras de fuente dudosa y el SOAT; sin clichés. |
| D1 | Avanzado | 13 subtemas cubiertos; los documentos reales del anexo entran en H3. |
| D2 | Avanzado | Reconocer (H1, H2), aplicar a documentos (H3), analizar medidas (H4), evaluar impactos (H6). |
| D3 | Avanzado | Retro por par en H3, por ítem en el resto. |
| D4 | Avanzado | Buzones, cajeros, recibo que se pinta, balanza, montañas: todo mueve algo con significado. |
| D6 | Avanzado | Sin plantillas: 22 en H1, 12 en H2, 20 pares en H3, 20 en H4, 15 + 5 en H6. |
| D7 | Avanzado (a medir) | El documento más largo (carro, 6 líneas) se mide a 320. |
| D8 | Avanzado | Bancos mayores que la partida; H3 sortea 3 de 4 documentos. |
| D9 | Avanzado | Lupa hexagonal, buzones, cajeros, recibo, tanque, montañas, balanza: ninguno repetido. |
| D11 | Avanzado | Tres colores de tributo y dos marcas de forma, iguales en A2, A3, H1, H2, H3. |
| D13 | Medio | ≤ 12 palabras y verbos de acción. |

## 4. Conteo de palabras
Aprender (≤ 20): A1 12 · 15 · 12 · 13 · 8 · 10 — A2 11 · 13 · 11 · 12 — A3 12 · 13 · 10 · 15 · 7 —
A4 14 · 11 · 9 · 13 · 14 · 15 · 16 — A5 12 · 11 · 10 · 10 · 14 · 8.
Consignas (≤ 12): H1 8 · H2 9 · H3 7 · H4 11 · H5 9 (y retos ≤ 12) · H6 7.
