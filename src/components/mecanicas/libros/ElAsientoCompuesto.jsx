import { useEffect, useState } from "react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import { DEBE, HABER, COLOR_LADO, pesos, LAVADO_DE_AUTOS } from "../../../data/contabilidad.js";
import { ASIENTO_COMPUESTO, COMPUESTAS_SUELTAS } from "../../../data/contabilidadActividades.js";
import { Retro, Pulsos, Cierre, Enunciado } from "../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../bloques/marcos.jsx";
import { Responder, useTanda, leerCifra } from "./piezas.jsx";
import ConstructorAsiento, { filaVacia, asientoDe } from "./ConstructorAsiento.jsx";
import { UNIVERSO as UNIVERSO_SIMPLE } from "./ArmaElAsiento.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CU-10 · EL ASIENTO COMPUESTO — Maestría · Experto.
 *
 * Mismo gesto que Arma el Asiento y un escalón más arriba: aquí el asiento
 * toca más de dos cuentas y hay que escribir cuánto va en cada una. Cinco
 * transacciones, tres por partida.
 *
 * ═══════════ EL PUNTAJE NO REPARTE POR IGUAL, Y ES DELIBERADO ═══════════
 *
 * La ficha pesa las cuentas el doble que los lados y que las cifras (0,5 /
 * 0,25 / 0,25). Elegir bien las cuentas es lo que exige haber entendido la
 * transacción; el lado sale de las dos reglas y la cifra, de leer el
 * enunciado. Quien acierta las cuentas y se equivoca en lo demás entendió la
 * mitad difícil.
 *
 * ═══════════ EL ASIENTO CORRECTO SE ENSEÑA SIEMPRE ═══════════
 *
 * Al corregir sale el asiento bueno al lado del construido. Son datos, no una
 * frase: la actividad es de construir, y ver la construcción correcta es la
 * devolución más útil que hay. Además tapa un hueco real — ver abajo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export function transaccionDe(item) {
  if (item.suelta) return COMPUESTAS_SUELTAS.find((t) => t.id === item.suelta);
  return LAVADO_DE_AUTOS.transacciones.find((t) => t.id === item.transaccion);
}

const lineasDe = (asiento) => [
  ...asiento.debe.map(([cuenta, valor]) => ({ cuenta, lado: DEBE, valor })),
  ...asiento.haber.map(([cuenta, valor]) => ({ cuenta, lado: HABER, valor })),
];

const ITEMS = ASIENTO_COMPUESTO.items.map((item) => ({ item, transaccion: transaccionDe(item) }));

/** Las cuentas que se mueven en las cinco: el universo propio de esta actividad. */
const UNIVERSO_COMPUESTO = [...new Set(ITEMS.flatMap(({ transaccion }) =>
  lineasDe(transaccion.asiento).map((l) => l.cuenta)))];

/*
 * El universo de señuelos junta las cuentas de esta actividad con las de Arma
 * el Asiento: son las del capítulo, el estudiante ya las vio todas, y así hay
 * margen para una paleta más larga sin traer nombres de fuera.
 */
export const UNIVERSO = [...new Set([...UNIVERSO_COMPUESTO, ...UNIVERSO_SIMPLE])];

/*
 * El tope de filas sale de los datos: el asiento más grande del banco toca
 * cuatro cuentas. Escribirlo a mano dejaría el tope y los datos libres de
 * separarse, y el día que entrara un asiento de cinco no cabría.
 */
export const MAXIMO_FILAS = Math.max(...ITEMS.map(({ transaccion }) => lineasDe(transaccion.asiento).length));

/*
 * La paleta: las correctas más señuelos, hasta ocho. Ocho y no seis porque
 * aquí los asientos tocan hasta cuatro cuentas y con seis quedarían solo dos
 * señuelos — el estudiante acertaría por descarte en vez de por entender.
 */
export const CUANTAS_EN_PALETA = 8;

export function paletaDe(transaccion, mezclar = barajar) {
  const paleta = [...new Set(lineasDe(transaccion.asiento).map((l) => l.cuenta))];
  for (const c of mezclar(UNIVERSO)) {
    if (paleta.length >= CUANTAS_EN_PALETA) break;
    if (!paleta.includes(c)) paleta.push(c);
  }
  return mezclar(paleta);
}

/*
 * ═══════════ LOS ERRORES QUE LA FICHA EXPLICA CASO POR CASO ═══════════
 *
 * Tres de las cinco transacciones tienen explicación propia, y las condiciones
 * se LEEN DEL ASIENTO REAL en vez de escribirse: si mañana cambia una cifra
 * del caso, la condición cambia con ella.
 */
const POR_CASO = {
  "cu10-01": (real, puesto) => {
    /* La hipoteca nace con la transacción: un pasivo que nace va al haber. */
    if (puesto.some((l) => l.cuenta === "Hipoteca por pagar" && l.lado === DEBE)) return "hipotecaAlDebe";
    /*
     * El enunciado da el valor del terreno a propósito. Si las dos cuentas del
     * debe no están las dos con su propia cifra, el estudiante las unió.
     */
    const debeReal = real.filter((l) => l.lado === DEBE);
    const separadas = debeReal.every((l) =>
      puesto.some((p) => p.cuenta === l.cuenta && p.lado === DEBE && p.valor === l.valor));
    return separadas ? null : "unioEdificioYTerreno";
  },
  "cu10-04": (real, puesto) => {
    /* Las dos mitades del pago son iguales; si no lo son, la mitad está mal. */
    const haberReal = real.filter((l) => l.lado === HABER);
    const bien = haberReal.every((l) =>
      puesto.some((p) => p.cuenta === l.cuenta && p.lado === HABER && p.valor === l.valor));
    return bien ? null : "mitadMal";
  },
  "cu10-05": (real, puesto) => {
    /* El socio aportó dos cosas y las dos entran por el debe. */
    const debeReal = real.filter((l) => l.lado === DEBE);
    const todas = debeReal.every((l) => puesto.some((p) => p.cuenta === l.cuenta));
    return todas ? null : "olvidoUnActivo";
  },
};

/*
 * ═══════════ PENDIENTE DE GEN — UN ERROR SIN TEXTO ═══════════
 *
 * Queda una forma de fallar que la ficha no cubre: acertar todas las cuentas y
 * todos los lados, que el asiento CUADRE, y repartir mal las cifras entre dos
 * cuentas del mismo lado. Pasa en las dos transacciones sin explicación propia
 * —el camión y los muebles—, donde el pago se parte entre contado y crédito y
 * se pueden intercambiar las dos cifras sin romper el total.
 *
 * `noCuadra` no sirve (sí cuadra) y `faltaCuenta` tampoco (no falta ninguna).
 * No me invento una tercera: en ese caso la devolución escrita no sale y el
 * estudiante ve el asiento correcto al lado del suyo, con su fila en coral.
 * Es menos de lo que merece y queda reportado.
 */
export function evaluar(item, transaccion, filas) {
  const real = lineasDe(transaccion.asiento);
  const puesto = filas
    .filter((f) => f.cuenta && f.lado)
    .map((f) => ({ cuenta: f.cuenta, lado: f.lado, valor: leerCifra(f.valor) }));

  let cuentas = 0;
  let lados = 0;
  let cifras = 0;
  for (const l of real) {
    const p = puesto.find((x) => x.cuenta === l.cuenta);
    if (!p) continue;
    cuentas += 1;
    if (p.lado === l.lado) lados += 1;
    if (p.lado === l.lado && p.valor === l.valor) cifras += 1;
  }
  const { peso } = ASIENTO_COMPUESTO;
  const puntaje = (cuentas / real.length) * peso.cuentas
    + (lados / real.length) * peso.lados
    + (cifras / real.length) * peso.cifras;
  const perfecto = cifras === real.length && puesto.length === real.length;

  const totalDebe = puesto.filter((l) => l.lado === DEBE).reduce((s, l) => s + (l.valor ?? 0), 0);
  const totalHaber = puesto.filter((l) => l.lado === HABER).reduce((s, l) => s + (l.valor ?? 0), 0);
  const cuadra = totalDebe === totalHaber && totalDebe > 0;

  const e = ASIENTO_COMPUESTO.errores;
  const propios = ASIENTO_COMPUESTO.erroresPorCaso[item.id] ?? {};
  /* El total sale dos veces en el acierto —debe y haber—, de ahí el global. */
  const total = transaccion.asiento.debe.reduce((s, [, v]) => s + v, 0);
  const rellenar = (t) => t
    .replace(/\{total\}/g, pesos(total))
    .replace("{cuentas}", String(real.length))
    .replace("{debe}", pesos(totalDebe))
    .replace("{haber}", pesos(totalHaber));

  /*
   * ═══════════ EL ORDEN, Y POR QUÉ LA ARITMÉTICA NO VA PRIMERO ═══════════
   *
   * `noCuadra` dice «antes de buscar el error de concepto, revise la
   * aritmética», y leído solo, invita a ponerlo delante de todo. No se puede:
   * los errores de concepto de esta actividad DESCUADRAN el asiento. Poner la
   * hipoteca al debe deja el debe en $18.000 contra $2.000 — si gana la
   * aritmética, el estudiante lee «revise las sumas» y se va a contar dígitos
   * cuando lo que tiene mal es dónde nace un pasivo.
   *
   * Así que primero la explicación del caso, que dice POR QUÉ no cuadra, y la
   * aritmética se queda para cuando no hay nada de concepto que señalar.
   */
  let texto = null;
  if (perfecto) {
    texto = rellenar(ASIENTO_COMPUESTO.acierto);
  } else {
    const propio = POR_CASO[item.id]?.(real, puesto) ?? null;
    if (propio && propios[propio]) texto = propios[propio];
    else if (!cuadra) texto = rellenar(e.noCuadra);
    else if (puesto.length < real.length || cuentas < real.length) texto = e.faltaCuenta;
  }

  return { texto, puntaje, perfecto, real, cuadra, totalDebe, totalHaber };
}

/* El asiento correcto, como datos: es la devolución de una actividad de construir. */
function AsientoCorrecto({ real }) {
  return (
    <div style={{
      marginTop: "12px", padding: "11px 13px", borderRadius: "13px",
      background: "rgba(10,20,34,0.45)", border: `1px solid ${FAE.teal}55`,
    }}>
      <p style={{
        margin: "0 0 8px", fontFamily: "Sora, sans-serif", fontSize: "10.5px",
        fontWeight: 700, letterSpacing: "0.16em", color: FAE.teal,
      }}>
        EL ASIENTO CORRECTO
      </p>
      {real.map((l) => (
        <div key={`${l.cuenta}-${l.lado}`} style={{ display: "flex", gap: "8px", alignItems: "baseline", padding: "2px 0" }}>
          <span style={{
            flexShrink: 0, width: "52px", fontFamily: "Sora, sans-serif", fontSize: "10.5px",
            fontWeight: 700, letterSpacing: "0.08em", color: COLOR_LADO[l.lado],
          }}>
            {l.lado === DEBE ? "DEBE" : "HABER"}
          </span>
          <span style={{ flex: 1, minWidth: 0, fontSize: "13px", color: FAE.text }}>{l.cuenta}</span>
          <span style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            fontVariantNumeric: "tabular-nums", fontSize: "13px", color: FAE.text,
          }}>
            {pesos(l.valor)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ElAsientoCompuesto({ Marco, rotulo, titulo, acento, onCompletar }) {
  const sortear = () => barajar(ITEMS).slice(0, ASIENTO_COMPUESTO.porPartida)
    .map(({ item, transaccion }) => ({ item, transaccion, paleta: paletaDe(transaccion) }));

  const t = useTanda(sortear);
  const [filas, setFilas] = useState([filaVacia(), filaVacia()]);
  const [retro, setRetro] = useState(null);
  const [suma, setSuma] = useState(0);

  const actual = t.items[t.i];
  const pct = t.items.length ? (suma / t.items.length) * 100 : 0;

  useEffect(() => {
    if (t.terminado) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);

  /* Una respuesta está lista cuando toda fila puesta tiene lado y cifra. */
  const puestas = filas.filter((f) => f.cuenta);
  const completo = puestas.length >= 2 && puestas.every((f) => f.lado && leerCifra(f.valor) !== null);

  const responder = () => {
    if (retro || !completo) return;
    const r = evaluar(actual.item, actual.transaccion, filas);
    t.anotar(actual.item.id, r.perfecto, r.perfecto ? null : JSON.stringify(asientoDe(filas)));
    setSuma((s) => s + r.puntaje);
    setRetro(r);
  };

  const avanzar = () => {
    setRetro(null);
    setFilas([filaVacia(), filaVacia()]);
    if (t.i + 1 < t.items.length) t.setI(t.i + 1);
    else t.setTerminado(true);
  };

  const reiniciar = () => {
    t.reiniciar(); setRetro(null); setSuma(0); setFilas([filaVacia(), filaVacia()]);
  };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>
            Tres asientos compuestos. Las cuentas pesan la mitad de la nota: elegirlas bien es lo que exige entender la transacción.
          </p>
        </Cierre>
      </Marco>
    );
  }

  /* Corregido, cada fila dice si su cuenta, su lado y su cifra estaban bien. */
  const estados = retro
    ? filas.map((f) => {
      if (!f.cuenta) return null;
      const l = retro.real.find((x) => x.cuenta === f.cuenta);
      const bien = l && l.lado === f.lado && l.valor === leerCifra(f.valor);
      return bien ? "correcta" : "incorrecta";
    })
    : null;

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={t.items.length} hechos={t.i + (retro ? 1 : 0)} etiqueta="Transacción" />
      </div>

      <Enunciado rotulo="LA TRANSACCIÓN" acento={acento}>{actual.transaccion.texto}</Enunciado>

      <ConstructorAsiento
        filas={filas}
        cuentas={actual.paleta}
        conCifras
        maximo={MAXIMO_FILAS}
        deshabilitado={Boolean(retro)}
        estados={estados}
        acento={acento}
        onFilas={setFilas}
      />

      {retro?.texto && <Retro texto={retro.texto} />}
      {retro && !retro.perfecto && <AsientoCorrecto real={retro.real} />}

      {!retro
        ? <Responder onClick={responder} deshabilitado={!completo}>Responder</Responder>
        : (
          <Responder onClick={avanzar}>
            {t.i + 1 === t.items.length ? "Ver resultado" : "Siguiente transacción"}
          </Responder>
        )}

      {!retro && !completo && (
        <p style={{ margin: "9px 0 0", fontSize: "12.5px", color: "rgba(248,249,250,0.45)", textAlign: "center" }}>
          Cada cuenta que pongas necesita su lado y su cifra.
        </p>
      )}
    </Marco>
  );
}
