import { useEffect, useState } from "react";
import { barajar } from "../../../utils/barajar.js";
import { porcentaje } from "../../../data/politicaFiscal.js";
import { DEBE, HABER, LAVADO_DE_AUTOS, CALEJA } from "../../../data/contabilidad.js";
import { ARMA_EL_ASIENTO, TRANSACCIONES_SUELTAS } from "../../../data/contabilidadActividades.js";
import { Retro, Pulsos, Cierre, Enunciado } from "../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../bloques/marcos.jsx";
import { Responder, useTanda } from "./piezas.jsx";
import ConstructorAsiento, { filaVacia, asientoDe } from "./ConstructorAsiento.jsx";
import { Balanza, EstilosDeVerbos } from "./verbos.jsx";
import { inclinacionDe } from "../../../contabilidad/balanza.js";

/* Cuántas filas quedaron de un lado. Sin cifras, el peso es el recuento. */
const cuantasAlLado = (filas, lado) => filas.filter((f) => f.cuenta && f.lado === lado).length;

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CU-6 · ARMA EL ASIENTO — Análisis · Difícil.
 *
 * Doce transacciones, seis por partida, cuatro decisiones cada una: dos
 * cuentas y el lado de cada una. Veinticuatro decisiones por partida.
 *
 * Todas son asientos SIMPLES —una cuenta al debe, una al haber— y eso no es
 * casualidad del banco: los compuestos son de El Asiento Compuesto, y mezclarlos
 * aquí rompería la progresión del tema. Hay una prueba que lo vigila.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** De dónde sale cada transacción del banco. */
export function transaccionDe(item) {
  if (item.suelta) return TRANSACCIONES_SUELTAS.find((t) => t.id === item.suelta);
  const lista = item.caso === "lavado" ? LAVADO_DE_AUTOS.transacciones : CALEJA.transacciones;
  return lista.find((t) => t.id === item.transaccion);
}

const cuentasDe = (asiento) => [...asiento.debe, ...asiento.haber].map(([c]) => c);

/*
 * ═══════════ EL UNIVERSO DE CUENTAS, Y POR QUÉ ES ESTE ═══════════
 *
 * Los señuelos no se inventan: son las cuentas que se mueven en las OTRAS
 * transacciones de este mismo banco. Así cada opción equivocada es una cuenta
 * que el estudiante ya vio en el capítulo —no un nombre traído de fuera que se
 * descarta solo por raro— y la actividad mide si entendió la transacción, no
 * si reconoce vocabulario.
 */
export const UNIVERSO = [...new Set(
  ARMA_EL_ASIENTO.items.flatMap((i) => cuentasDe(transaccionDe(i).asiento)),
)];

/*
 * ═══════════ LA PALETA DE CADA TRANSACCIÓN ═══════════
 *
 * DECISIÓN MÍA, Y LA DEJO ESCRITA: la ficha da las transacciones y las
 * explicaciones de error, pero no dice qué cuentas ofrecer. La regla es:
 *
 *   1. Las dos correctas, siempre.
 *   2. Si una de ellas es Caja o Bancos, la otra entra también. No es relleno:
 *      la ficha tiene una explicación escrita para quien las confunde, y sin
 *      ofrecer las dos ese error no puede ocurrir y nadie la lee nunca.
 *   3. Se completa hasta seis con cuentas del universo de arriba.
 *
 * Seis y no más porque a 375 px una paleta más larga obliga a desplazarse
 * para ver las opciones, y entonces la actividad empieza a medir memoria de lo
 * que quedó arriba.
 */
export const CUANTAS_EN_PALETA = 6;
const PAREJA = { "Caja": "Bancos", "Bancos": "Caja" };

export function paletaDe(transaccion, mezclar = barajar) {
  const correctas = cuentasDe(transaccion.asiento);
  const paleta = [...correctas];
  for (const c of correctas) {
    const pareja = PAREJA[c];
    if (pareja && !paleta.includes(pareja)) paleta.push(pareja);
  }
  for (const c of mezclar(UNIVERSO)) {
    if (paleta.length >= CUANTAS_EN_PALETA) break;
    if (!paleta.includes(c)) paleta.push(c);
  }
  return mezclar(paleta);
}

/*
 * ═══════════ QUÉ SE LE DICE A QUIEN FALLA, Y EN QUÉ ORDEN ═══════════
 *
 * PRIMERO la confusión entre Caja y Bancos, que es la más concreta de todas:
 * el estudiante puso una de las dos donde iba la otra, y la ficha explica
 * exactamente cómo distinguirlas. Va antes incluso que las explicaciones
 * propias de dos transacciones, y el caso que lo obliga es la devolución de
 * aporte: se devuelve «en efectivo», o sea Caja, y quien responda Bancos está
 * cometiendo justo esa confusión. Decirle ahí «devolver un aporte disminuye el
 * patrimonio» sería responderle a una pregunta que no hizo.
 *
 * DESPUÉS las dos transacciones con explicación propia —consignar el 26 de
 * enero y la devolución de la sexta de Caleja—, que son los casos donde el
 * error típico es de concepto y Gen escribió el concepto.
 *
 * Y al final, por lo que hizo: meter una cuenta que no se mueve, o acertar las
 * dos cuentas y equivocarse de lado.
 *
 * PENDIENTE DE GEN: la ficha no trae texto de acierto para esta actividad —las
 * demás sí—, así que el «✅ Correcto.» es mío. El asiento correcto se enseña
 * con las filas marcadas, que son datos y no una frase inventada.
 */
export const ACIERTO = "✅ Correcto.";
const PROPIAS = { "ene-26": "consignar", "cal-6": "devolucionAportes" };

export function evaluar(item, transaccion, filas) {
  const real = transaccion.asiento;
  const ladoReal = new Map([
    ...real.debe.map(([c]) => [c, DEBE]),
    ...real.haber.map(([c]) => [c, HABER]),
  ]);
  const puestas = filas.filter((f) => f.cuenta && f.lado);

  let cuentasOk = 0;
  let ladosOk = 0;
  for (const [cuenta, lado] of ladoReal) {
    const puesta = puestas.find((f) => f.cuenta === cuenta);
    if (!puesta) continue;
    cuentasOk += 1;
    if (puesta.lado === lado) ladosOk += 1;
  }
  const aciertos = cuentasOk + ladosOk;
  const perfecto = aciertos === ladoReal.size * 2;

  const ajena = puestas.find((f) => !ladoReal.has(f.cuenta));
  const e = ARMA_EL_ASIENTO.errores;

  let texto;
  if (perfecto) texto = ACIERTO;
  else if (ajena && PAREJA[ajena.cuenta] && ladoReal.has(PAREJA[ajena.cuenta])) texto = e.cajaPorBancos;
  else if (PROPIAS[transaccion.id]) texto = e[PROPIAS[transaccion.id]];
  else if (ajena) texto = e.cuentaAjena.replace("{cuenta}", ajena.cuenta);
  else texto = e.invirtioLados;

  return { texto, aciertos, cuentasOk, ladosOk, perfecto, ladoReal };
}

export default function ArmaElAsiento({ Marco, rotulo, titulo, acento, onCompletar }) {
  const sortear = () => barajar(ARMA_EL_ASIENTO.items).slice(0, ARMA_EL_ASIENTO.porPartida)
    .map((item) => {
      const transaccion = transaccionDe(item);
      return { item, transaccion, paleta: paletaDe(transaccion) };
    });

  const t = useTanda(sortear);
  const [filas, setFilas] = useState([filaVacia(), filaVacia()]);
  const [retro, setRetro] = useState(null);

  const actual = t.items[t.i];
  const decisiones = t.items.length * ARMA_EL_ASIENTO.decisionesPorItem;
  const pct = porcentaje(t.aciertos, decisiones);

  useEffect(() => {
    if (t.terminado) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);

  const completo = filas.every((f) => f.cuenta && f.lado);

  const responder = () => {
    if (retro || !completo) return;
    const r = evaluar(actual.item, actual.transaccion, filas);
    const puesto = asientoDe(filas);
    t.anotar(actual.item.id, r.perfecto, r.perfecto ? null : JSON.stringify(puesto));
    t.setAciertos((n) => n + r.aciertos);
    setRetro(r);
  };

  const avanzar = () => {
    setRetro(null);
    setFilas([filaVacia(), filaVacia()]);
    if (t.i + 1 < t.items.length) t.setI(t.i + 1);
    else t.setTerminado(true);
  };

  const reiniciar = () => { t.reiniciar(); setRetro(null); setFilas([filaVacia(), filaVacia()]); };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>{t.aciertos} de {decisiones} decisiones bien — dos cuentas y dos lados en cada una de las seis.</p>
        </Cierre>
      </Marco>
    );
  }

  /* Corregido, cada fila dice si su cuenta y su lado estaban bien. */
  const estados = retro
    ? filas.map((f) => {
      if (!f.cuenta) return null;
      const lado = retro.ladoReal.get(f.cuenta);
      return lado && lado === f.lado ? "correcta" : "incorrecta";
    })
    : null;

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <EstilosDeVerbos />
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={t.items.length} hechos={t.i + (retro ? 1 : 0)} etiqueta="Transacción" />
      </div>

      <Enunciado rotulo="LA TRANSACCIÓN" acento={acento}>{actual.transaccion.texto}</Enunciado>

      <ConstructorAsiento
        filas={filas}
        cuentas={actual.paleta}
        deshabilitado={Boolean(retro)}
        estados={estados}
        acento={acento}
        onFilas={setFilas}
      />

      {/*
        LA BALANZA, SOLO AL CORREGIR. Aquí no hay cifras: lo que se pesa es
        cuántas cuentas quedaron de cada lado, que en un asiento simple es una
        y una. Poner las dos al mismo lado la tumba del todo, y eso es
        exactamente lo que el estudiante acaba de hacer mal — pero se enseña
        DESPUÉS de responder, porque antes sería decirle la respuesta.
      */}
      {retro && (
        <div style={{ marginTop: "14px" }}>
          <Balanza
            inclinacion={inclinacionDe(cuantasAlLado(filas, DEBE), cuantasAlLado(filas, HABER))}
            izquierda={`${cuantasAlLado(filas, DEBE)} al debe`}
            derecha={`${cuantasAlLado(filas, HABER)} al haber`}
            etiqueta={cuantasAlLado(filas, DEBE) === cuantasAlLado(filas, HABER)
              ? "Una cuenta a cada lado: la partida doble se sostiene"
              : "Las dos cuentas quedaron del mismo lado y la balanza se cayó"}
          />
        </div>
      )}

      {retro && <Retro texto={retro.texto} />}

      {!retro
        ? <Responder onClick={responder} deshabilitado={!completo}>Responder</Responder>
        : (
          <Responder onClick={avanzar}>
            {t.i + 1 === t.items.length ? "Ver resultado" : "Siguiente transacción"}
          </Responder>
        )}

      {!retro && !completo && (
        <p style={{ margin: "9px 0 0", fontSize: "12.5px", color: "rgba(248,249,250,0.45)", textAlign: "center" }}>
          Elige las dos cuentas y ponle lado a cada una.
        </p>
      )}
    </Marco>
  );
}
