import { useEffect, useMemo, useState } from "react";
import { barajar } from "../../../utils/barajar.js";
import { DEBE, HABER, pesos } from "../../../data/contabilidad.js";
import {
  CUADRA_O_NO, balanceDelAsiento, puntuarCuadraONo,
} from "../../../data/contabilidadActividades.js";
import { Opcion, Opciones, Retro, Pulsos, Cierre } from "../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../bloques/marcos.jsx";
import { Responder, useTanda, AsientoEnLineas } from "./piezas.jsx";
import { Balanza, Ficha, FichaEnVuelo, EstilosDeVerbos, useArrastre } from "./verbos.jsx";
import { inclinacionDe } from "../../../contabilidad/balanza.js";
import { fichasDe, alSoltar, ladoLiviano } from "../../../contabilidad/descuadre.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CU-8 · ¿CUADRA O NO CUADRA? — Análisis · Difícil.
 *
 * Seis asientos por partida, sorteados de diez. Por cada uno, un juicio: si
 * cuadra o no. Y por los que NO cuadran, además la cifra exacta del descuadre.
 *
 * ═══════════ EL PUNTAJE DE ESTA ES DISTINTO AL DE TODAS ═══════════
 *
 * Los seis juicios valen el 75 %. El 25 % restante se reparte en partes
 * iguales entre los asientos DESCUADRADOS que hayan salido en ese intento.
 *
 * O sea que cuánto vale cada cifra depende del sorteo, y eso es deliberado: lo
 * que no puede pasar es que salgan CERO descuadrados, porque entonces ese 25 %
 * no se podría repartir y el intento valdría 75 como techo sin culpa del
 * estudiante. El banco está construido para que no ocurra —cinco cuadrados de
 * diez, seis sorteados— y hay una prueba que lo comprueba enumerando las 210
 * combinaciones posibles.
 *
 * ═══════════ LA CIFRA SOLO SE PREGUNTA SI DICE QUE NO CUADRA ═══════════
 *
 * La ficha dice que ese cuarto se gana «diciendo la cifra exacta del
 * descuadre», y solo puede decirla quien haya visto que hay descuadre. Quien
 * juzgue mal un asiento descuadrado pierde su juicio y también esa cifra: no
 * se le pregunta por una diferencia que él acaba de negar.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CUADRA = "cuadra";
export const NO_CUADRA = "no-cuadra";

const lineasDe = (asiento) => [
  ...asiento.debe.map(([cuenta, valor]) => ({ cuenta, lado: DEBE, valor })),
  ...asiento.haber.map(([cuenta, valor]) => ({ cuenta, lado: HABER, valor })),
];

export const CATEGORIAS = [
  { id: CUADRA, nombre: "Cuadra" },
  { id: NO_CUADRA, nombre: "No cuadra" },
];

/*
 * La devolución sale entera de la ficha, con las cifras del propio asiento:
 *
 *   dijo que cuadra y cuadra            aciertoCuadra
 *   dijo que no y no, con la ficha      aciertoDescuadre
 *   dijo que no y no, con una mayor     sePaso
 *   dijo que no y no, con una menor     quedaCorta
 *   dijo que cuadra y no cuadraba       dijoCuadra
 *   dijo que no y sí cuadraba           dijoNoCuadra
 *
 * Con fichas, el fallo de la cifra tiene DOS formas y no una: la balanza se
 * pasa de largo o se queda corta. El campo de texto anterior admitía
 * cualquier número y por eso le bastaba una sola devolución.
 */
export function evaluar(asiento, juicio, cifra) {
  const b = balanceDelAsiento(asiento);
  const juicioOk = (juicio === CUADRA) === b.cuadra;
  /* La cifra solo cuenta en un descuadrado que además se reconoció como tal. */
  const cifraOk = !b.cuadra && juicio === NO_CUADRA && cifra === b.descuadre;
  /* Qué le pasa a la balanza con esa ficha encima: es de donde sale el texto. */
  const efecto = !b.cuadra && juicio === NO_CUADRA && cifra != null
    ? alSoltar(asiento, cifra)
    : null;

  const e = CUADRA_O_NO.errores;
  const rellenar = (t) => t
    .replace(/\{debe\}/g, pesos(b.debe))
    .replace(/\{haber\}/g, pesos(b.haber))
    .replace(/\{descuadre\}/g, pesos(b.descuadre))
    .replace(/\{falta\}/g, pesos(efecto?.falta ?? 0))
    .replace(/\{cuentas\}/g, String(asiento.debe.length + asiento.haber.length));

  let texto;
  if (b.cuadra) {
    texto = juicio === CUADRA ? CUADRA_O_NO.aciertoCuadra : e.dijoNoCuadra;
  } else if (juicio === CUADRA) {
    texto = e.dijoCuadra;
  } else if (cifraOk) {
    texto = CUADRA_O_NO.aciertoDescuadre;
  } else {
    texto = efecto?.efecto === "pasa" ? e.sePaso : e.quedaCorta;
  }

  return { texto: rellenar(texto), juicioOk, cifraOk, balance: b, efecto };
}

/*
 * Lo que la balanza DICE, para quien no puede ver cuánto se inclina.
 *
 * Antes de responder no puede decir de cuánto es el descuadre —sería regalar
 * la respuesta por el lado accesible, que es la peor forma de regalarla— así
 * que dice solo lo que también se ve: que está inclinada, y hacia dónde.
 */
export function etiquetaDeLaBalanza(retro, balance, ficha) {
  if (!retro) {
    if (balance.cuadra) return "La balanza está nivelada";
    const liviano = ladoLiviano(balance);
    return `La balanza está inclinada: falta peso en el platillo del ${liviano === DEBE ? "debe" : "haber"}`;
  }
  if (!retro.efecto) {
    return retro.balance.cuadra
      ? "Los dos lados pesan lo mismo: el asiento cuadra"
      : `El asiento está descuadrado por ${pesos(retro.balance.descuadre)}`;
  }
  if (retro.efecto.efecto === "nivela") return `Con ${pesos(ficha)} la balanza quedó nivelada`;
  if (retro.efecto.efecto === "pasa") return `Con ${pesos(ficha)} la balanza se pasó y cayó al otro lado`;
  return `Con ${pesos(ficha)} la balanza sigue inclinada del mismo lado`;
}

export default function CuadraONoCuadra({ Marco, rotulo, titulo, acento, onCompletar }) {
  const sortear = () => barajar(CUADRA_O_NO.asientos).slice(0, CUADRA_O_NO.porPartida);
  const t = useTanda(sortear);

  const [juicio, setJuicio] = useState(null);
  /* La ficha elegida, en pesos. Null mientras no haya ninguna en el platillo. */
  const [ficha, setFicha] = useState(null);
  const [retro, setRetro] = useState(null);
  const [juicios, setJuicios] = useState(0);
  const [cifras, setCifras] = useState(0);

  const asiento = t.items[t.i];
  const balance = balanceDelAsiento(asiento);
  const liviano = ladoLiviano(balance);
  /*
   * Las cinco se barajan una vez POR ÍTEM: si se recalcularan en cada
   * repintado, saltarían de sitio bajo el dedo mientras el estudiante decide.
   */
  const fichas = useMemo(() => barajar(fichasDe(asiento)), [asiento]);

  /*
   * El gesto es arrastrar la ficha al platillo, con el toque como camino
   * alterno — tocar la ficha, tocar el platillo—. Lo segundo no es un extra:
   * es lo que hace que la actividad se pueda jugar sin arrastrar.
   */
  const arrastre = useArrastre({ onSoltar: (valor) => setFicha(valor) });

  /* Cuántos de los sorteados no cuadran: es el denominador del cuarto de la nota. */
  const descuadradosEnJuego = t.items.filter((a) => !balanceDelAsiento(a).cuadra).length;
  const pct = puntuarCuadraONo({
    juiciosAcertados: juicios,
    porPartida: t.items.length,
    descuadradosEnJuego,
    cifrasAcertadas: cifras,
  });

  useEffect(() => {
    if (t.terminado) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);

  /*
   * Quien dice «no cuadra» sobre un asiento que SÍ cuadra no tiene platillo
   * que nivelar —no hay descuadre— así que su respuesta está lista sin ficha.
   * Sin esta salida se quedaría encerrado: sin fichas que soltar y sin botón
   * que pulsar. Se vio jugándolo.
   */
  const listo = juicio === CUADRA || (juicio === NO_CUADRA && (balance.cuadra || ficha !== null));

  const responder = () => {
    if (retro || !listo) return;
    const r = evaluar(asiento, juicio, ficha);
    t.anotar(`${asiento.id}:juicio`, r.juicioOk, r.juicioOk ? null : juicio);
    if (!r.balance.cuadra) {
      /* El id del ítem no cambia: el panel docente sigue leyendo lo mismo. */
      t.anotar(`${asiento.id}:cifra`, r.cifraOk, r.cifraOk ? null : String(ficha ?? ""));
    }
    if (r.juicioOk) setJuicios((n) => n + 1);
    if (r.cifraOk) setCifras((n) => n + 1);
    setRetro(r);
  };

  const avanzar = () => {
    setRetro(null); setJuicio(null); setFicha(null); arrastre.limpiar();
    if (t.i + 1 < t.items.length) t.setI(t.i + 1);
    else t.setTerminado(true);
  };

  const reiniciar = () => {
    t.reiniciar(); setRetro(null); setJuicio(null); setFicha(null); arrastre.limpiar(); setJuicios(0); setCifras(0);
  };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>
            {juicios} de {t.items.length} juicios bien, y {cifras} de {descuadradosEnJuego} descuadres dichos con su cifra exacta.
          </p>
        </Cierre>
      </Marco>
    );
  }

  const estadoDe = (valor) => {
    if (!retro) return juicio === valor ? "elegida" : null;
    const correcto = retro.balance.cuadra ? CUADRA : NO_CUADRA;
    if (valor === correcto) return juicio === correcto ? "correcta" : "revelada";
    if (valor === juicio) return "incorrecta";
    return null;
  };

  const rotuloPregunta = {
    margin: "16px 0 8px", fontFamily: "Sora, sans-serif", fontSize: "10.5px",
    fontWeight: 700, letterSpacing: "0.16em", color: acento,
  };

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <EstilosDeVerbos />
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={t.items.length} hechos={t.i + (retro ? 1 : 0)} enCurso={t.i + 1} etiqueta="Asiento" />
      </div>

      {/*
        Los totales solo salen al corregir. Enseñarlos antes convertiría la
        actividad en leer dos números y compararlos, que es justo el trabajo
        que se está pidiendo hacer.
      */}
      <AsientoEnLineas
        lineas={lineasDe(asiento)}
        rotulo="EL ASIENTO"
        acento={acento}
        totales={Boolean(retro)}
      />

      <p style={rotuloPregunta}>¿CUADRA?</p>
      <Opciones columnas="repeat(auto-fit, minmax(150px, 1fr))">
        {CATEGORIAS.map((c) => (
          <Opcion
            key={c.id}
            ancho
            deshabilitada={Boolean(retro)}
            onClick={() => setJuicio(c.id)}
            estado={estadoDe(c.id)}
          >
            {c.nombre}
          </Opcion>
        ))}
      </Opciones>

      {/*
        ═══════════ LA BALANZA NO SE ADELANTA AL JUICIO ═══════════

        Esta actividad PIDE el juicio: dibujar la balanza antes de que el
        estudiante diga si cuadra o no sería contestar la pregunta en la
        pantalla. Aparece exactamente cuando él ya dijo «no cuadra» —o al
        corregir, si dijo que sí—, que es lo que pide la ficha.

        Y HASTA QUE SUELTA LA FICHA, LOS PLATILLOS NO LLEVAN CIFRAS. Con los
        dos totales escritos, «¿de cuánto es la diferencia?» se contestaría
        restando dos números que están en pantalla; sin ellos, el estudiante
        tiene que sumar cada lado del asiento, que es el trabajo. El platillo
        liviano se ve liviano; cuánto pesa cada uno, no.
      */}
      {(juicio === NO_CUADRA || retro) && (
        <div style={{ marginTop: "16px" }}>
          <Balanza
            inclinacion={inclinacionDe(
              retro?.efecto ? retro.efecto.debe : balance.debe,
              retro?.efecto ? retro.efecto.haber : balance.haber,
            )}
            izquierda={retro ? pesos(retro.efecto ? retro.efecto.debe : balance.debe) : "DEBE"}
            derecha={retro ? pesos(retro.efecto ? retro.efecto.haber : balance.haber) : "HABER"}
            destino={!retro && !balance.cuadra ? liviano : null}
            tomada={arrastre.tomada}
            onSoltar={() => arrastre.soltarEn(liviano)}
            etiqueta={etiquetaDeLaBalanza(retro, balance, ficha)}
          />
        </div>
      )}

      {juicio === NO_CUADRA && !balance.cuadra && (
        <>
          <p style={rotuloPregunta}>SUELTE EN EL PLATILLO LIVIANO LO QUE FALTA</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(84px, 1fr))", gap: "8px" }}>
            {fichas.map((v) => (
              <Ficha
                key={v}
                valor={v}
                lado={liviano}
                tomada={arrastre.tomada === v || ficha === v}
                deshabilitada={Boolean(retro)}
                onClick={retro ? null : () => arrastre.tocar(v)}
                gestos={retro ? null : arrastre.gestos(v)}
                etiqueta={`Soltar ${pesos(v)} en el platillo`}
              />
            ))}
          </div>
          <FichaEnVuelo valor={arrastre.tomada ?? 0} lado={liviano} puntero={arrastre.puntero} />
        </>
      )}

      {/*
        El asiento que el estudiante dijo que cuadraba y no cuadraba nunca
        llega a las fichas —no se le pregunta por una diferencia que acaba de
        negar—, así que su balanza solo aparece al corregir, con los totales.
      */}

      {retro && <Retro texto={retro.texto} />}

      {!retro
        ? <Responder onClick={responder} deshabilitado={!listo}>Responder</Responder>
        : (
          <Responder onClick={avanzar}>
            {t.i + 1 === t.items.length ? "Ver resultado" : "Siguiente asiento"}
          </Responder>
        )}

      {!retro && !listo && (
        <p style={{ margin: "9px 0 0", fontSize: "12.5px", color: "rgba(248,249,250,0.45)", textAlign: "center" }}>
          {juicio === NO_CUADRA
            ? "Suelta una ficha en el platillo liviano para nivelar la balanza."
            : "Di si el asiento cuadra."}
        </p>
      )}
      {retro && descuadradosEnJuego > 0 && (
        <p style={{ margin: "10px 0 0", fontSize: "12px", color: "rgba(248,249,250,0.4)", textAlign: "center" }}>
          En esta tanda salieron {descuadradosEnJuego} asientos descuadrados.
        </p>
      )}
    </Marco>
  );
}
