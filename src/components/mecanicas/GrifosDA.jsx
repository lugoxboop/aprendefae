import { useState } from "react";
import { FAE } from "../../theme.js";
import { formatCOP } from "../../utils/formato.js";

/*
 * T1 — "Los Grifos de la Demanda Agregada".
 *
 * Material, no juego: no hay preguntas, no hay condición de término y no
 * otorga FP. Ataca una sola confusión —por qué cada pieza suma o resta— y no
 * la memorización ni la aplicación a casos, que se trabajan en otras piezas.
 *
 * LA ASIMETRÍA ES EL CONTENIDO. Los cuatro componentes no tienen la misma
 * complejidad interna y el diagrama no debe fingir que sí: Consumo lleva dos
 * válvulas y un depósito, Inversión una válvula que resta, y Gasto Público y
 * Exportaciones Netas un solo grifo cada uno. Que G se vea simple no es un
 * diagrama incompleto: es la lección.
 *
 * DOS FORMAS, DOS SIGNIFICADOS, Y NO SON INTERCAMBIABLES:
 *   grifo   = círculo teal   -> entra y suma (C̄, Y, TR, Ī, Ḡ, tc)
 *   válvula = rombo coral ×  -> multiplica o desvía (t, c, b). NUNCA suma.
 * Dibujar una propensión o una elasticidad como un grifo enseñaría una
 * fórmula falsa, así que las formas no se mezclan por comodidad de dibujo.
 */

/* ------------------------------- el modelo ------------------------------- */

const INICIAL = {
  autonomo: 800000,   // C̄
  Y: 5000000,         // Renta
  t: 0.06,            // Tasa impositiva
  TR: 500000,         // Transferencias
  c: 0.6,             // Propensión Marginal a Consumir
  inversionAut: 1500000, // Ī
  i: 8,               // Tasa de interés, en puntos porcentuales
  b: 60000,           // Elasticidad interés de la inversión, en $ por punto
  G: 2000000,         // Ḡ
  tc: 4000,           // Tipo de cambio
};

/*
 * El profesor no fija la forma de f(tc), así que aquí no se inventa una: se
 * usa una curva suave, deliberadamente no lineal, que solo respeta la
 * dirección conocida (tipo de cambio más alto -> más exportaciones netas).
 * Está rotulada como aproximación en la interfaz para que nadie la copie como
 * si fuera la fórmula.
 */
const TC_NEUTRO = 4200;
function exportacionesNetas(tc) {
  return 600000 * Math.tanh((tc - TC_NEUTRO) / 700);
}

function calcular(v) {
  const T = v.t * v.Y;                       // T = t×Y
  const disponible = v.Y + v.TR - T;         // el depósito
  const consumoInducido = v.c * disponible;  // lo que pasa la válvula c
  const ahorro = disponible - consumoInducido; // lo que no pasa
  const C = v.autonomo + consumoInducido;    // C̄ NO pasa por la válvula

  const bi = v.b * v.i;                      // lo que la válvula b produce
  const I = v.inversionAut - bi;             // y que se RESTA

  const XN = exportacionesNetas(v.tc);

  return { T, disponible, consumoInducido, ahorro, C, bi, I, G: v.G, XN, DA: C + I + v.G + XN };
}

/* --------------------------- piezas del dibujo --------------------------- */

const TRAZO = "rgba(248,249,250,0.28)";

/* Grosor del flujo: se ve cuánto pasa, no solo que pasa. */
const grosor = (valor, max) => 2 + 6 * Math.min(1, Math.max(0, Math.abs(valor) / max));

function Grifo({ x, y, etiqueta, valor, sub }) {
  return (
    <g>
      <circle cx={x} cy={y} r="15" fill={FAE.teal} />
      <text x={x} y={y + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill={FAE.bg} fontFamily="Sora, sans-serif">
        {etiqueta}
      </text>
      {sub && (
        <text x={x} y={y + 34} textAnchor="middle" fontSize="10.5" fill="rgba(248,249,250,0.55)">
          {sub}
        </text>
      )}
      {valor != null && (
        <text x={x} y={y + (sub ? 47 : 34)} textAnchor="middle" fontSize="10.5" fontWeight="600" fill={FAE.teal} fontFamily="Sora, sans-serif">
          {valor}
        </text>
      )}
    </g>
  );
}

/*
 * Válvula: rombo, encima de la línea que cruza. Va sobre el flujo, no al lado,
 * porque no es otra entrada: es algo que le pasa a lo que ya venía viajando.
 */
function Valvula({ x, y, etiqueta, valor }) {
  const r = 15;
  return (
    <g>
      <polygon points={`${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`} fill={FAE.coral} />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={FAE.bg} fontFamily="Sora, sans-serif">
        ×
      </text>
      <text x={x} y={y - r - 8} textAnchor="middle" fontSize="11" fontWeight="700" fill={FAE.coral} fontFamily="Sora, sans-serif">
        {etiqueta}
      </text>
      {valor != null && (
        <text x={x} y={y - r - 21} textAnchor="middle" fontSize="10.5" fill="rgba(248,249,250,0.55)">
          {valor}
        </text>
      )}
    </g>
  );
}

/* Depósito: borde punteado y rótulo explícito de que es un resultado. */
function Deposito({ x, y, w, h, titulo, valor }) {
  return (
    <g>
      <rect
        x={x} y={y} width={w} height={h} rx="12"
        fill="rgba(29,53,87,0.55)" stroke="rgba(248,249,250,0.45)" strokeWidth="1.5" strokeDasharray="6 4"
      />
      <text x={x + w / 2} y={y + 20} textAnchor="middle" fontSize="9" fontWeight="700" letterSpacing="0.1em" fill="rgba(248,249,250,0.5)" fontFamily="Sora, sans-serif">
        RESULTADO CALCULADO
      </text>
      <text x={x + w / 2} y={y + 42} textAnchor="middle" fontSize="12.5" fontWeight="700" fill={FAE.text} fontFamily="Sora, sans-serif">
        {titulo}
      </text>
      <text x={x + w / 2} y={y + 61} textAnchor="middle" fontSize="11.5" fontWeight="600" fill={FAE.text} fontFamily="Sora, sans-serif">
        {valor}
      </text>
    </g>
  );
}

/* Tubo de salida del componente. Se llena según su propio máximo. */
function TuboSalida({ x, yTop, alto, etiqueta, valor, maximo, permiteNegativo }) {
  const ancho = 30;
  const negativo = valor < 0;
  const frac = Math.min(1, Math.abs(valor) / maximo);

  /*
   * XN puede quedar negativo, y un tubo que solo llena hacia arriba no sabría
   * decirlo. Cuando se permiten negativos el tubo llena desde una línea media:
   * hacia arriba en teal si suma, hacia abajo en coral si resta. Los otros
   * tres llenan desde abajo, que es lo natural cuando nunca bajan de cero.
   */
  const medio = yTop + alto / 2;
  const relleno = permiteNegativo
    ? { y: negativo ? medio : medio - frac * (alto / 2), alto: frac * (alto / 2) }
    : { y: yTop + alto * (1 - frac), alto: alto * frac };

  return (
    <g>
      <rect x={x} y={yTop} width={ancho} height={alto} rx="8" fill="rgba(248,249,250,0.06)" stroke="rgba(248,249,250,0.16)" />
      <rect
        x={x} y={relleno.y} width={ancho} height={relleno.alto} rx="6"
        fill={negativo ? FAE.coral : FAE.teal}
        opacity="0.85"
      />
      {permiteNegativo && (
        <line x1={x} y1={medio} x2={x + ancho} y2={medio} stroke="rgba(248,249,250,0.5)" strokeWidth="1" strokeDasharray="3 3" />
      )}
      <text x={x + ancho / 2} y={yTop - 12} textAnchor="middle" fontSize="15" fontWeight="700" fill={FAE.text} fontFamily="Sora, sans-serif">
        {etiqueta}
      </text>
      <text x={x + ancho / 2} y={yTop + alto + 20} textAnchor="middle" fontSize="10.5" fontWeight="600" fill={negativo ? FAE.coral : FAE.teal} fontFamily="Sora, sans-serif">
        {formatCOP(valor)}
      </text>
    </g>
  );
}

/* ------------------------------ deslizador ------------------------------ */

/* Mismo patrón de DA-Learn (rótulo, valor a la derecha, riel debajo), con la
 * paleta de marca del sitio en vez de la del simulador. */
function Control({ etiqueta, hint, valor, min, max, paso, formato, acento, onChange }) {
  const pct = ((valor - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "10px", marginBottom: "5px" }}>
        <span style={{ fontSize: "13px", color: "rgba(248,249,250,0.62)" }}>
          {etiqueta}
          {hint && <span style={{ color: "rgba(248,249,250,0.38)" }}> · {hint}</span>}
        </span>
        <span style={{ fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 700, color: acento, whiteSpace: "nowrap" }}>
          {formato(valor)}
        </span>
      </div>
      <input
        type="range"
        className="da-slider"
        min={min} max={max} step={paso} value={valor}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          background: `linear-gradient(to right, ${acento} 0%, ${acento} ${pct}%, rgba(248,249,250,0.12) ${pct}%, rgba(248,249,250,0.12) 100%)`,
          "--fill-color": acento,
        }}
      />
    </div>
  );
}

/* --------------------------- marco de componente --------------------------- */

function Bloque({ titulo, formula, explicacion, children, controles }) {
  return (
    <div
      style={{
        borderRadius: "18px",
        background: "rgba(29,53,87,0.35)",
        border: "1px solid rgba(248,249,250,0.12)",
        padding: "clamp(14px, 2.2vw, 20px)",
        marginBottom: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: "12px", flexWrap: "wrap", marginBottom: "4px" }}>
        <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", color: FAE.text, margin: 0 }}>
          {titulo}
        </h3>
        <code style={{ fontFamily: "Sora, sans-serif", fontSize: "13.5px", color: FAE.teal }}>{formula}</code>
      </div>
      <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 14px" }}>
        {explicacion}
      </p>

      <div style={{ overflowX: "auto", marginBottom: "16px" }}>{children}</div>

      {controles}
    </div>
  );
}

/* --------------------------------- pieza --------------------------------- */

export default function GrifosDA() {
  const [v, setV] = useState(INICIAL);
  const r = calcular(v);
  const set = (clave) => (valor) => setV((s) => ({ ...s, [clave]: valor }));

  const pesos = (n) => formatCOP(n);
  const pct = (n) => `${(n * 100).toFixed(0)}%`;

  /* Máximos para el grosor de las líneas, por componente. */
  const MAX_C = 13000000;
  const MAX_I = 3000000;

  return (
    <div>
      {/* ============================ CONSUMO ============================ */}
      <Bloque
        titulo="Consumo"
        formula="C = C̄ + c(Y + TR − T),  con T = t×Y"
        explicacion="El más enredado de los cuatro. Fíjate en algo: el consumo autónomo se va derecho al tubo, sin pasar por ninguna válvula. Lo demás sí tiene que pasar por dos."
        controles={
          <>
            <Control etiqueta="Consumo autónomo (C̄)" hint="grifo" valor={v.autonomo} min={0} max={2000000} paso={50000} formato={pesos} acento={FAE.teal} onChange={set("autonomo")} />
            <Control etiqueta="Renta (Y)" hint="grifo" valor={v.Y} min={0} max={10000000} paso={100000} formato={pesos} acento={FAE.teal} onChange={set("Y")} />
            <Control etiqueta="Transferencias (TR)" hint="grifo" valor={v.TR} min={0} max={2000000} paso={50000} formato={pesos} acento={FAE.teal} onChange={set("TR")} />
            <Control etiqueta="Tasa impositiva (t)" hint="válvula: desvía" valor={v.t} min={0} max={0.4} paso={0.01} formato={(n) => `${pct(n)} · ${formatCOP(n * v.Y)}`} acento={FAE.coral} onChange={set("t")} />
            <Control etiqueta="Propensión marginal a consumir (c)" hint="válvula: reparte" valor={v.c} min={0.3} max={0.9} paso={0.05} formato={(n) => n.toFixed(2)} acento={FAE.coral} onChange={set("c")} />
          </>
        }
      >
        <svg viewBox="0 0 580 300" width="100%" style={{ minWidth: "520px", display: "block" }} role="img" aria-label="Diagrama del consumo: tres grifos, dos válvulas y un depósito de renta disponible">
          {/* C̄ va derecho al tubo: no pasa por c. Ese es el punto. */}
          <path d="M 63 44 H 505" fill="none" stroke={FAE.teal} strokeWidth={grosor(v.autonomo, 2000000)} opacity="0.75" />
          <text x="285" y="34" textAnchor="middle" fontSize="10.5" fill="rgba(248,249,250,0.5)">
            el autónomo no pasa por ninguna válvula
          </text>

          {/* Y -> válvula t -> depósito */}
          <path d="M 63 118 H 135" fill="none" stroke={FAE.teal} strokeWidth={grosor(v.Y, 10000000)} opacity="0.75" />
          <path d="M 165 118 H 240" fill="none" stroke={FAE.teal} strokeWidth={grosor(v.Y - r.T, 10000000)} opacity="0.75" />

          {/* Derivación de impuestos: rama secundaria, coral, claramente aparte. */}
          <path d="M 150 133 V 182" fill="none" stroke={FAE.coral} strokeWidth={grosor(r.T, 3000000)} opacity="0.85" />
          <polygon points="150,192 145,180 155,180" fill={FAE.coral} />
          <text x="150" y="209" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={FAE.coral} fontFamily="Sora, sans-serif">
            T = t×Y
          </text>
          <text x="150" y="223" textAnchor="middle" fontSize="10" fill="rgba(248,249,250,0.5)">
            {formatCOP(r.T)} · sale del sistema
          </text>

          {/* TR entra al mismo depósito */}
          <path d="M 63 262 H 270 V 190" fill="none" stroke={FAE.teal} strokeWidth={grosor(v.TR, 2000000)} opacity="0.75" />

          <Deposito x={240} y={96} w={140} h={94} titulo="Renta disponible" valor={formatCOP(r.disponible)} />

          {/* Depósito -> válvula c -> tubo */}
          <path d="M 380 143 H 415" fill="none" stroke={FAE.teal} strokeWidth={grosor(r.disponible, MAX_C)} opacity="0.75" />
          <path d="M 445 143 H 505" fill="none" stroke={FAE.teal} strokeWidth={grosor(r.consumoInducido, MAX_C)} opacity="0.75" />

          {/* Lo que no pasa la válvula no desaparece: se va al ahorro. */}
          <path d="M 430 158 V 205" fill="none" stroke={FAE.coral} strokeWidth={grosor(r.ahorro, MAX_C)} opacity="0.85" />
          <polygon points="430,215 425,203 435,203" fill={FAE.coral} />
          <text x="430" y="232" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={FAE.coral} fontFamily="Sora, sans-serif">
            Ahorro
          </text>
          <text x="430" y="246" textAnchor="middle" fontSize="10" fill="rgba(248,249,250,0.5)">
            {formatCOP(r.ahorro)}
          </text>

          <Grifo x={48} y={44} etiqueta="C̄" sub="autónomo" />
          <Grifo x={48} y={118} etiqueta="Y" sub="renta" />
          <Grifo x={48} y={262} etiqueta="TR" sub="transfer." />
          <Valvula x={150} y={118} etiqueta="t" valor={pct(v.t)} />
          <Valvula x={430} y={143} etiqueta="c" valor={v.c.toFixed(2)} />

          <TuboSalida x={505} yTop={30} alto={230} etiqueta="C" valor={r.C} maximo={MAX_C} />
        </svg>
      </Bloque>

      {/* =========================== INVERSIÓN =========================== */}
      <Bloque
        titulo="Inversión"
        formula="I = Ī − b×i"
        explicacion="Un grifo y una válvula, pero la válvula hace algo distinto: lo que produce no se suma, se resta. Por eso su rama va en coral y llega al tubo con un menos."
        controles={
          <>
            <Control etiqueta="Inversión autónoma (Ī)" hint="grifo" valor={v.inversionAut} min={0} max={3000000} paso={50000} formato={pesos} acento={FAE.teal} onChange={set("inversionAut")} />
            <Control etiqueta="Tasa de interés (i)" hint="entrada" valor={v.i} min={0} max={20} paso={0.5} formato={(n) => `${n.toFixed(1)}%`} acento={FAE.teal} onChange={set("i")} />
            <Control etiqueta="Elasticidad interés de la inversión (b)" hint="válvula: multiplica" valor={v.b} min={0} max={150000} paso={5000} formato={(n) => `${formatCOP(n)} por punto`} acento={FAE.coral} onChange={set("b")} />
          </>
        }
      >
        <svg viewBox="0 0 580 220" width="100%" style={{ minWidth: "520px", display: "block" }} role="img" aria-label="Diagrama de la inversión: un grifo, una entrada de tasa de interés y una válvula que resta">
          <path d="M 63 60 H 418" fill="none" stroke={FAE.teal} strokeWidth={grosor(v.inversionAut, MAX_I)} opacity="0.75" />
          <path d="M 442 60 H 505" fill="none" stroke={FAE.teal} strokeWidth={grosor(r.I, MAX_I)} opacity="0.75" />

          <path d="M 63 150 H 155" fill="none" stroke={FAE.teal} strokeWidth={grosor(v.i, 20)} opacity="0.75" />
          <path d="M 185 150 H 430 V 78" fill="none" stroke={FAE.coral} strokeWidth={grosor(r.bi, MAX_I)} opacity="0.85" />
          <polygon points="430,70 425,82 435,82" fill={FAE.coral} />

          {/* El menos, donde la rama toca el tubo: no hay forma de leerlo como suma. */}
          <circle cx="430" cy="60" r="12" fill={FAE.coral} />
          <text x="430" y="65" textAnchor="middle" fontSize="15" fontWeight="700" fill={FAE.bg} fontFamily="Sora, sans-serif">−</text>

          <text x="300" y="176" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={FAE.coral} fontFamily="Sora, sans-serif">
            b × i = {formatCOP(r.bi)}
          </text>
          <text x="300" y="190" textAnchor="middle" fontSize="10" fill="rgba(248,249,250,0.5)">
            esto se resta, nunca se suma
          </text>

          <Grifo x={48} y={60} etiqueta="Ī" sub="autónoma" />
          <Grifo x={48} y={150} etiqueta="i" sub="interés" />
          <Valvula x={170} y={150} etiqueta="b" valor={formatCOP(v.b)} />

          <TuboSalida x={505} yTop={30} alto={150} etiqueta="I" valor={r.I} maximo={MAX_I} />
        </svg>
      </Bloque>

      {/* ========================= GASTO PÚBLICO ========================= */}
      <Bloque
        titulo="Gasto Público"
        formula="G = Ḡ"
        explicacion="Aquí no hay segundo nivel, y no es que falte: es la respuesta. El gobierno decide cuánto gasta y ese número entra tal cual, sin válvulas, sin depósitos y sin depender de nada más del modelo."
        controles={
          <Control etiqueta="Gasto público (Ḡ)" hint="grifo" valor={v.G} min={0} max={4000000} paso={100000} formato={pesos} acento={FAE.teal} onChange={set("G")} />
        }
      >
        <svg viewBox="0 0 580 130" width="100%" style={{ minWidth: "520px", display: "block" }} role="img" aria-label="Diagrama del gasto público: un solo grifo que entra directo">
          <path d="M 63 70 H 505" fill="none" stroke={FAE.teal} strokeWidth={grosor(v.G, 4000000)} opacity="0.75" />
          <text x="290" y="56" textAnchor="middle" fontSize="10.5" fill="rgba(248,249,250,0.5)">
            un grifo, ninguna válvula: entra tal cual
          </text>
          <Grifo x={48} y={70} etiqueta="Ḡ" sub="público" />
          <TuboSalida x={505} yTop={22} alto={90} etiqueta="G" valor={r.G} maximo={4000000} />
        </svg>
      </Bloque>

      {/* ====================== EXPORTACIONES NETAS ====================== */}
      <Bloque
        titulo="Exportaciones Netas"
        formula="(X − M) = f(tc)"
        explicacion="También un solo grifo. El tipo de cambio empuja el tubo, y a diferencia de los otros tres este puede quedar en negativo: si importas más de lo que exportas, le resta a la Demanda Agregada en vez de sumarle."
        controles={
          <Control etiqueta="Tipo de cambio (tc)" hint="grifo" valor={v.tc} min={3000} max={5500} paso={50} formato={(n) => `$${n.toLocaleString("es-CO")} / USD`} acento={FAE.teal} onChange={set("tc")} />
        }
      >
        <svg viewBox="0 0 580 150" width="100%" style={{ minWidth: "520px", display: "block" }} role="img" aria-label="Diagrama de exportaciones netas: un solo grifo de tipo de cambio">
          <path d="M 63 78 H 505" fill="none" stroke={r.XN < 0 ? FAE.coral : FAE.teal} strokeWidth={grosor(r.XN, 600000)} opacity="0.8" />
          <text x="290" y="62" textAnchor="middle" fontSize="12" fontWeight="700" fill="rgba(248,249,250,0.6)" fontFamily="Sora, sans-serif">
            f(tc)
          </text>
          <text x="290" y="100" textAnchor="middle" fontSize="10" fill="rgba(248,249,250,0.45)">
            el profesor no fija esta fórmula: aquí solo se ilustra la dirección
          </text>
          <Grifo x={48} y={78} etiqueta="tc" sub="tipo de cambio" />
          <TuboSalida x={505} yTop={22} alto={110} etiqueta="XN" valor={r.XN} maximo={600000} permiteNegativo />
        </svg>
      </Bloque>

      {/* ========================= EL TANQUE COMÚN ========================= */}
      <TanqueDA r={r} />
    </div>
  );
}

/* --------------------------- el tanque compartido --------------------------- */

/*
 * El mismo elemento para los cuatro. Es lo que cierra la idea: por dentro son
 * de complejidades muy distintas, pero los cuatro terminan llenando el mismo
 * tanque. Las proporciones aquí sí son reales y comparables entre sí, a
 * diferencia de los tubos de cada bloque, que se llenan contra su propia
 * escala para que se les vea moverse.
 */
function TanqueDA({ r }) {
  const positivos = r.C + r.I + r.G + Math.max(0, r.XN);
  const ancho = (valor) => (positivos > 0 ? (Math.abs(valor) / positivos) * 100 : 0);

  const partes = [
    { id: "C", valor: r.C, color: FAE.teal },
    { id: "I", valor: r.I, color: "#3E8E85" },
    { id: "G", valor: r.G, color: FAE.node },
    { id: "XN", valor: r.XN, color: r.XN < 0 ? FAE.coral : FAE.ambar },
  ];

  return (
    <div
      style={{
        borderRadius: "18px",
        background: "rgba(42,157,143,0.07)",
        border: `1px solid ${FAE.teal}`,
        padding: "clamp(16px, 2.4vw, 22px)",
      }}
    >
      <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 6px" }}>
        EL MISMO TANQUE PARA LOS CUATRO
      </p>
      <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(24px, 4.5vw, 34px)", letterSpacing: "-0.03em", color: FAE.text, margin: "0 0 2px", fontVariantNumeric: "tabular-nums" }}>
        {formatCOP(r.DA)}
      </p>
      <p style={{ fontSize: "13.5px", color: "rgba(248,249,250,0.55)", margin: "0 0 16px" }}>
        DA = C + I + G + XN
      </p>

      <div style={{ display: "flex", height: "34px", borderRadius: "10px", overflow: "hidden", background: "rgba(248,249,250,0.08)" }}>
        {partes
          .filter((p) => p.valor > 0)
          .map((p) => (
            <div
              key={p.id}
              title={`${p.id}: ${formatCOP(p.valor)}`}
              style={{ width: `${ancho(p.valor)}%`, background: p.color, opacity: 0.85, display: "grid", placeItems: "center" }}
            >
              <span style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, color: FAE.bg }}>{p.id}</span>
            </div>
          ))}
      </div>

      {r.XN < 0 && (
        <p style={{ fontSize: "12.5px", color: FAE.coral, margin: "10px 0 0" }}>
          Las exportaciones netas están en {formatCOP(r.XN)}: no entran al tanque, le sacan. Por eso no aparecen
          como franja — se descuentan del total de arriba.
        </p>
      )}

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "14px" }}>
        {partes.map((p) => (
          <span key={p.id} style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.62)" }}>
            <span style={{ display: "inline-block", width: "9px", height: "9px", borderRadius: "2px", background: p.color, marginRight: "6px" }} />
            {p.id} {formatCOP(p.valor)}
          </span>
        ))}
      </div>
    </div>
  );
}
