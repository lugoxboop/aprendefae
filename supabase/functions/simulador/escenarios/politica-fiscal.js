/*
 * T3 · POLÍTICA FISCAL — la oficina es el Ministerio de Hacienda (el despacho
 * del viceministro técnico); la compañera es la Autoridad económica (la panda
 * de traje del elenco). Fuente: 6-PyEM-PolFis-02-2026 (ficha 3).
 */
import { crearEscenario } from "./motor.js";

const PERSONA = "Eres la Autoridad económica del Ministerio de Hacienda, la jefa de la oficina de análisis fiscal. Eres una panda de traje, ordenada y directa, que explica con recibos y facturas de la vida diaria.";
const OFICINA = "la oficina de análisis fiscal del Ministerio de Hacienda, donde llegan facturas, recibos, nóminas y decretos para clasificar antes de que el ministro los firme";
const ROL = "analista fiscal junior del Ministerio de Hacienda";
const TITULO = "Política fiscal";

const FUENTE = `- Marco de seis preguntas para cualquier política especializada: naturaleza (lo que la distingue), mercado (dónde se aplica), objetivos (qué metas ayuda a cumplir), instrumentos (sus herramientas), medidas (cómo se mueven los instrumentos) e impactos (efectos sobre familias, empresas y economía).
- Naturaleza: usa las finanzas públicas (ingresos, gastos, impuestos, subsidios, situación fiscal) para cumplir los objetivos de la política económica. Mercado: el de bienes y servicios, analizado con la demanda agregada. Objetivos: asignación de recursos, redistribución de la renta, estabilización económica, crecimiento y preservación del medio ambiente.
- En la DA: Y = [1/(1 − c(1 − t))]·(Ā − b·i), con Ā = C̄ + c·TR + Ī + Ḡ + XN. La política fiscal toca G y TR (dentro del gasto autónomo) y t (dentro del multiplicador).
- Instrumentos: tributación, gasto público y deuda pública.
- Tributación, todo pago obligatorio al Estado: IMPUESTO (pago sin contraprestación directa para quien paga: renta, IVA, predial, impuesto de vehículos, ICA, timbre, ganancia ocasional, aranceles, impuesto de salida); TASA (pago individualizado a cambio de un servicio concreto que uno usa: peaje, tasa aeroportuaria, derechos notariales, matrícula del vehículo, registro mercantil); CONTRIBUCIÓN (pago que ayuda a financiar un servicio u obra de la que el contribuyente se beneficia como grupo: aportes a seguridad social y parafiscales —salud, pensión, SENA, ICBF, caja de compensación—, valorización).
- Impuesto DIRECTO: recae sobre la persona (natural o jurídica) y tiene en cuenta su condición económica (renta, patrimonio, predial, vehículos, ICA, sociedades, ganancias ocasionales); la renta de personas naturales tiene tarifa progresiva. Impuesto INDIRECTO: recae sobre transacciones (consumo, compras) y no mira la condición económica de quien paga (IVA 19 % general y 5 % en algunos bienes, impoconsumo 8 % en restaurantes, aranceles). La retención en la fuente es un cobro anticipado del impuesto de renta (directo), no un impuesto distinto: la declaración puede dejar saldo a pagar. Niveles: nacional (renta, IVA, timbre), departamental (vehículos), municipal (predial, ICA, valorización).
- Gasto público: FUNCIONAMIENTO (lo que cuesta que el Estado opere: nómina, contratistas, vigilancia, dotación, arriendo de vehículos; en el PGN 2025 incluye las transferencias, 75,6 %: SGP, pensiones, salud); INVERSIÓN (infraestructura, vías, transporte masivo, escuelas, conectividad, capital humano, investigación); SERVICIO DE LA DEUDA (intereses, abonos a capital, comisiones). Subsidios y transferencias monetarias directas (Colombia Mayor $80.000 al mes, Renta Ciudadana, Devolución del IVA, Mi Casa Ya).
- Deuda pública: INTERNA, sobre todo TES en pesos (acreedores: fondos de pensiones, bancos, aseguradoras, el Banco de la República); EXTERNA, con otros gobiernos (crédito bilateral: AFD de Francia, KfW de Alemania), banca multilateral (Banco Mundial, BID, CAF), bonos globales y proveedores. Saldo a cierre de 2025: ≈ $1.194 billones ($840 internos y $354 externos); servicio de la deuda 2025: ≈ $104,5 billones (saldo es lo que se debe; servicio, lo que se paga en el año). La interna puede presionar la tasa de interés; la externa, el tipo de cambio.
- Medidas: política fiscal EXPANSIVA (sube la DA): bajar impuestos, subir gasto, subir transferencias, subir endeudamiento, combinables. CONTRACCIONISTA (baja la DA): subir impuestos, bajar gasto, bajar transferencias, contraer endeudamiento. Una medida puede mover la DA como efecto colateral aunque ese no sea su propósito (una reforma para recaudar es contraccionista).
- Impactos: capacidad de compra (renta disponible o precios), utilidades empresariales, atracción o disuasión de inversión, costos de producción, inversión pública como factor de desarrollo, inclusión y cierre de brechas, apoyo a empresas, sectores y regiones.
- «Billón» en español es un millón de millones. No inventes cifras de Colombia distintas de estas; en casos ficticios usa cifras verosímiles.`;

const base = { persona: PERSONA, oficina: OFICINA, rol: ROL, fuenteTitulo: TITULO, fuente: FUENTE };

export const ESCENARIOS = [
  crearEscenario({
    ...base,
    id: "pf26-a1-lupa",
    decision: "Lee una frase de un informe sobre la política fiscal y di cuál de las seis preguntas del marco responde.",
    opciones: {
      naturaleza: "Naturaleza: qué la distingue (usa las finanzas públicas: ingresos, gastos, impuestos, subsidios).",
      mercado: "Mercado: dónde se aplica (el mercado de bienes y servicios, la demanda agregada).",
      objetivos: "Objetivos: qué metas ayuda a cumplir (asignación, redistribución, estabilización, crecimiento, ambiente).",
      instrumentos: "Instrumentos: con qué herramientas (tributación, gasto público, deuda pública).",
      medidas: "Medidas: cómo se mueven los instrumentos (expansivas o contraccionistas).",
      impactos: "Impactos: qué efectos tiene sobre familias, empresas y la economía.",
    },
    multiple: false,
    caso: "El expediente es el borrador de un informe de un país ficticio. En el «titular» va la FRASE a clasificar, entre comillas. En los tres «datos» van detalles de contexto del informe (dato = de qué parte del informe sale, ahora = su contenido breve, antes vacío, tendencia «dato»). El testigo es quien redactó el informe.",
    rondas: {
      1: "Fácil: la frase nombra algo típico de su cara (bajar el IVA es una medida; reducir la desigualdad es un objetivo).",
      2: "Media: distinguir instrumento de medida (el gasto público frente a subir el gasto un 5 %), u objetivo de impacto.",
      3: "Difícil, con trampa: una frase que suena a objetivo pero describe un efecto sobre las empresas (impacto), o que nombra el mercado de bienes como si fuera un instrumento.",
    },
  }),
  crearEscenario({
    ...base,
    id: "pf26-a2-buzones",
    decision: "Lee un cobro que le llegó a un ciudadano o a una empresa y di en qué buzón de la tributación cae.",
    opciones: {
      impuesto: "Impuesto: se paga sin contraprestación directa; la plata cae al pozo común y no vuelve nada a cambio.",
      tasa: "Tasa: se paga a cambio de un servicio concreto que uno usa (peaje, tasa aeroportuaria, derechos notariales).",
      contribucion: "Contribución: ayuda a financiar un servicio u obra de la que el que paga se beneficia como grupo (seguridad social, valorización).",
    },
    multiple: false,
    caso: "El expediente es un recibo, factura o desprendible de un ciudadano o empresa ficticios: quién paga, qué cobro es, cuánto y a cambio de qué (sin decir la variedad).",
    rondas: {
      1: "Fácil: un cobro típico (un peaje, el IVA de una compra, la valorización por una vía nueva).",
      2: "Media: cobros de una nómina (aporte a pensión, aporte al SENA) o de un tiquete aéreo (tasa aeroportuaria, impuesto de salida).",
      3: "Difícil, con trampa: cobros que se parecen pero caen en buzones distintos (la matrícula del carro es tasa; el impuesto anual del carro es impuesto), o un aporte a salud que suena a servicio pero es contribución.",
    },
    delata: { impuesto: "\\bimpuesto\\b", tasa: "\\btasa\\b", contribucion: "contribuci" },
  }),
  crearEscenario({
    ...base,
    id: "pf26-a3-cajeros",
    decision: "Lee un impuesto que se cobró y di qué cajero lo cobró: el que mira la billetera o el que solo mira el producto.",
    opciones: {
      directo: "Directo: recae sobre la persona y mira su condición económica (renta, predial, vehículos, patrimonio, ICA, retención en la fuente).",
      indirecto: "Indirecto: recae sobre la transacción y no mira quién paga (IVA, impoconsumo, aranceles).",
    },
    multiple: false,
    caso: "El expediente es un cobro concreto a una persona o empresa ficticia: qué se cobró, sobre qué base y cuánto. Los datos pueden comparar a dos personas distintas frente al mismo cobro.",
    rondas: {
      1: "Fácil: el IVA de una camisa o el impuesto de renta de un trabajador.",
      2: "Media: el impoconsumo de un restaurante, el predial de una casa, el arancel de un carro importado.",
      3: "Difícil, con trampa: la retención en la fuente (parece un descuento de la nómina pero es renta: directo), o el IVA que la empresa declara pero que paga el consumidor (indirecto).",
    },
    delata: { directo: "\\bdirect", indirecto: "indirect" },
  }),
  crearEscenario({
    ...base,
    id: "pf26-a4-tanque",
    decision: "Lee un movimiento de plata del Estado y di por qué tubo del tanque pasa: si entra por la deuda o si sale por uno de los desagües del gasto.",
    opciones: {
      funcionamiento: "Gasto de funcionamiento: lo que cuesta que el Estado opere (nómina, contratistas, vigilancia, dotación; también las transferencias del PGN).",
      inversion: "Gasto de inversión: infraestructura, vías, transporte masivo, escuelas, conectividad, investigación.",
      servicioDeuda: "Servicio de la deuda: pagar intereses, comisiones y abonos a capital de lo que se debe.",
      deudaInterna: "Deuda interna: el Estado consigue plata prestada en pesos, sobre todo vendiendo TES a fondos, bancos y aseguradoras.",
      deudaExterna: "Deuda externa: el Estado consigue plata prestada afuera (Banco Mundial, BID, CAF, otros gobiernos, bonos globales).",
    },
    multiple: false,
    caso: "El expediente es una orden de pago o un contrato del Ministerio de un país ficticio: quién recibe o quién presta, para qué y cuánto, con el saldo del tanque antes y ahora.",
    rondas: {
      1: "Fácil: un caso típico (la nómina de los profesores, una carretera nueva, un préstamo del BID).",
      2: "Media: pagar los intereses de los TES (servicio de la deuda, no deuda interna), o el arriendo de camionetas para un ministerio (funcionamiento).",
      3: "Difícil, con trampa: vender TES a un fondo extranjero en pesos (sigue siendo deuda interna, porque son TES en pesos), o un abono a capital al Banco Mundial (servicio de la deuda, no deuda externa nueva).",
    },
    delata: { funcionamiento: "funcionamiento", inversion: "inversi[oó]n", servicioDeuda: "servicio de la deuda", deudaInterna: "deuda interna", deudaExterna: "deuda externa" },
  }),
  crearEscenario({
    ...base,
    id: "pf26-a5-balanza",
    decision: "Lee el paquete de medidas fiscales y di hacia qué plato inclina la balanza de la demanda agregada.",
    opciones: {
      expansiva: "Expansiva: empuja la DA hacia arriba (baja impuestos, sube gasto, sube transferencias, sube endeudamiento).",
      contraccionista: "Contraccionista: empuja la DA hacia abajo (sube impuestos, baja gasto, baja transferencias, contrae endeudamiento).",
    },
    multiple: false,
    caso: "El expediente es un anuncio del Ministerio de un país ficticio: tres medidas o cifras con su antes y ahora (impuestos, gasto, transferencias o deuda), todas en la misma dirección.",
    rondas: {
      1: "Fácil: una medida evidente (más gasto en vías, o subir el IVA).",
      2: "Media: dos medidas combinadas en la misma dirección (bajar la tarifa de renta y subir los subsidios).",
      3: "Difícil, con trampa: una reforma tributaria cuyo propósito es recaudar para tapar el hueco fiscal (es contraccionista como efecto colateral), o recortar el gasto para pagar deuda.",
    },
    delata: { expansiva: "expansiv", contraccionista: "contraccion|contractiv" },
  }),
];
