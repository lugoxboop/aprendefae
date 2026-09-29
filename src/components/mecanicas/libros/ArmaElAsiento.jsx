import { useEffect, useState } from "react";
import { barajar } from "../../../utils/barajar.js";
import { porcentaje } from "../../../data/politicaFiscal.js";
import { DEBE, HABER, LAVADO_DE_AUTOS, CALEJA } from "../../../data/contabilidad.js";
import { ARMA_EL_ASIENTO, TRANSACCIONES_SUELTAS } from "../../../data/contabilidadActividades.js";
import { Retro, Pulsos, Cierre, Enunciado } from "../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../bloques/marcos.jsx";
import { Responder, useTanda } from "./piezas.jsx";
import { filaVacia, asientoDe } from "./ConstructorAsiento.jsx";
import { Balanza, Ficha, FichaEnVuelo, EstilosDeVerbos, useArrastre } from "./verbos.jsx";
import { inclinacionDe } from "../../../contabilidad/balanza.js";
import MesaDelAsiento, { arcoValido, leerZona, esZona } from "./MesaDelAsiento.jsx";

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
  /*
   * `cuentaAjena` ya no nombra la cuenta: con la mesa, la cuenta que sobra
   * está escrita en la T que el estudiante acaba de armar, delante de sus
   * ojos mientras lee la devolución. El hueco que llevaba antes sobraría.
   */
  else if (ajena) texto = e.cuentaAjena;
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

  /*
   * ═══════════ DOS GESTOS SOBRE LA MISMA MÁQUINA ═══════════
   *
   * Primero se nombran las dos cuentas —se toma un nombre del banco y se
   * suelta en una T— y después se traza el arco de un debe a un haber. Los
   * dos son «tomar algo y soltarlo en otro sitio», así que los dos usan
   * useArrastre y se distinguen por lo que se tomó: un nombre de cuenta o una
   * zona como «0:debe».
   *
   * Y los dos tienen su camino por toque, que es el que de verdad tiene que
   * existir: tocar el nombre y tocar la T; tocar el debe de una y el haber de
   * la otra.
   */
  /*
   * Poner un nombre en una T. No hace falta quitarlo de la otra: un nombre ya
   * puesto no se puede volver a tomar —su ficha queda deshabilitada en el
   * banco—, así que duplicarlo no es una jugada posible. Se probó quitando la
   * defensa: ninguna prueba cambiaba, porque no defendía de nada.
   */
  const nombrar = (indice, cuenta) => {
    if (retro || !cuenta || esZona(cuenta)) return;
    setFilas((xs) => xs.map((f, i) => (i === indice ? { ...f, cuenta } : f)));
  };

  /* Trazar el arco: de un debe a un haber, entre las dos cuentas. */
  const trazar = (desde, hasta) => {
    if (retro || !arcoValido(desde, hasta)) return;
    const a = leerZona(desde);
    const b = leerZona(hasta);
    setFilas((xs) => xs.map((f, i) => {
      if (i === a.indice) return { ...f, lado: a.lado };
      if (i === b.indice) return { ...f, lado: b.lado };
      return f;
    }));
  };

  const arrastre = useArrastre({
    onSoltar: (tomado, destino) => {
      if (!destino) return;
      if (destino.startsWith("nombre:")) { nombrar(Number(destino.split(":")[1]), tomado); return; }
      trazar(tomado, destino);
    },
  });

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
    arrastre.limpiar();
    if (t.i + 1 < t.items.length) t.setI(t.i + 1);
    else t.setTerminado(true);
  };

  const reiniciar = () => { t.reiniciar(); setRetro(null); setFilas([filaVacia(), filaVacia()]); arrastre.limpiar(); };

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
        <Pulsos total={t.items.length} hechos={t.i + (retro ? 1 : 0)} enCurso={t.i + 1} etiqueta="Transacción" />
      </div>

      <Enunciado rotulo="LA TRANSACCIÓN" acento={acento}>{actual.transaccion.texto}</Enunciado>

      {/*
        ═══════════ LA BALANZA DEL BORDE, SIEMPRE A LA VISTA ═══════════

        Y aquí sí desde el principio, al revés que en «¿Cuadra o no cuadra?».
        La diferencia es qué está midiendo: allá mide la respuesta —si el
        asiento cuadra— y enseñarla sería contestar la pregunta. Aquí mide si
        el asiento está CERRADO, que no es la respuesta a nada: se puede tener
        una cuenta a cada lado y estar las dos equivocadas.

        Lo que enseña es el mandamiento del capítulo: mientras el asiento esté
        a medias la balanza está caída, y al cerrarlo se nivela de golpe.
      */}
      <div style={{ margin: "14px 0 4px" }}>
        <Balanza
          inclinacion={inclinacionDe(cuantasAlLado(filas, DEBE), cuantasAlLado(filas, HABER), { vacia: 1 })}
          izquierda={`${cuantasAlLado(filas, DEBE)} al debe`}
          derecha={`${cuantasAlLado(filas, HABER)} al haber`}
          etiqueta={completo
            ? "Una cuenta a cada lado: el asiento está cerrado"
            : "El asiento está a medias y la balanza sigue caída"}
        />
      </div>

      <MesaDelAsiento
        filas={filas}
        desde={arrastre.tomada}
        esperandoNombre={arrastre.tomada != null && !esZona(arrastre.tomada)}
        estados={estados}
        deshabilitado={Boolean(retro)}
        onNombrar={(i) => arrastre.soltarEn(`nombre:${i}`)}
        gestosDeZona={(zona) => arrastre.gestos(zona)}
        onTocarZona={(zona) => (arrastre.tomada != null && esZona(arrastre.tomada)
          ? arrastre.soltarEn(zona)
          : arrastre.tocar(zona))}
      />

      <p style={{
        margin: "14px 0 8px", fontFamily: "Sora, sans-serif", fontSize: "10.5px",
        fontWeight: 700, letterSpacing: "0.16em", color: acento,
      }}>
        {filas.every((f) => f.cuenta) ? "AHORA TRACE DEL DEBE DE UNA AL HABER DE LA OTRA" : "LOS NOMBRES"}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {actual.paleta.map((c) => {
          const puesta = filas.some((f) => f.cuenta === c);
          return (
            <Ficha
              key={c}
              valor={0}
              texto={c}
              lado={DEBE}
              color="rgba(248,249,250,0.5)"
              tomada={arrastre.tomada === c}
              deshabilitada={Boolean(retro) || puesta}
              /*
               * El nombre ya puesto sigue siendo un BOTÓN, deshabilitado. Sin
               * el onClick, Ficha lo dibujaría como un div y quien navega con
               * lector de pantalla oiría un texto suelto en vez de «botón, no
               * disponible» — que es justo la información que necesita.
               */
              onClick={() => arrastre.tocar(c)}
              gestos={retro || puesta ? null : arrastre.gestos(c)}
              etiqueta={`Poner ${c} en una cuenta`}
            />
          );
        })}
      </div>
      <FichaEnVuelo
        valor={0}
        texto={esZona(arrastre.tomada) ? null : arrastre.tomada}
        lado={DEBE}
        puntero={esZona(arrastre.tomada) ? null : arrastre.puntero}
      />

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
