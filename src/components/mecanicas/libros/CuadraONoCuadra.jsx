import { useEffect, useState } from "react";
import { barajar } from "../../../utils/barajar.js";
import { DEBE, HABER, pesos } from "../../../data/contabilidad.js";
import {
  CUADRA_O_NO, balanceDelAsiento, puntuarCuadraONo,
} from "../../../data/contabilidadActividades.js";
import { Opcion, Opciones, Retro, Pulsos, Cierre } from "../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../bloques/marcos.jsx";
import { Responder, useTanda, leerCifra, CampoCifra, AsientoEnLineas } from "./piezas.jsx";
import { Balanza, EstilosDeVerbos } from "./verbos.jsx";
import { inclinacionDe } from "../../../contabilidad/balanza.js";

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
 *   dijo que no y no, con la cifra      aciertoDescuadre
 *   dijo que no y no, con otra cifra    cifraEquivocada
 *   dijo que cuadra y no cuadraba       dijoCuadra
 *   dijo que no y sí cuadraba           dijoNoCuadra
 */
export function evaluar(asiento, juicio, cifra) {
  const b = balanceDelAsiento(asiento);
  const juicioOk = (juicio === CUADRA) === b.cuadra;
  /* La cifra solo cuenta en un descuadrado que además se reconoció como tal. */
  const cifraOk = !b.cuadra && juicio === NO_CUADRA && cifra === b.descuadre;

  const e = CUADRA_O_NO.errores;
  const rellenar = (t) => t
    .replace(/\{debe\}/g, pesos(b.debe))
    .replace(/\{haber\}/g, pesos(b.haber))
    .replace(/\{descuadre\}/g, pesos(b.descuadre))
    .replace(/\{cuentas\}/g, String(asiento.debe.length + asiento.haber.length));

  let texto;
  if (b.cuadra) {
    texto = juicio === CUADRA ? CUADRA_O_NO.aciertoCuadra : e.dijoNoCuadra;
  } else if (juicio === CUADRA) {
    texto = e.dijoCuadra;
  } else {
    texto = cifraOk ? CUADRA_O_NO.aciertoDescuadre : e.cifraEquivocada;
  }

  return { texto: rellenar(texto), juicioOk, cifraOk, balance: b };
}

export default function CuadraONoCuadra({ Marco, rotulo, titulo, acento, onCompletar }) {
  const sortear = () => barajar(CUADRA_O_NO.asientos).slice(0, CUADRA_O_NO.porPartida);
  const t = useTanda(sortear);

  const [juicio, setJuicio] = useState(null);
  const [cifra, setCifra] = useState("");
  const [retro, setRetro] = useState(null);
  const [juicios, setJuicios] = useState(0);
  const [cifras, setCifras] = useState(0);

  const asiento = t.items[t.i];

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

  const listo = juicio === CUADRA || (juicio === NO_CUADRA && leerCifra(cifra) !== null);

  const responder = () => {
    if (retro || !listo) return;
    const r = evaluar(asiento, juicio, leerCifra(cifra));
    t.anotar(`${asiento.id}:juicio`, r.juicioOk, r.juicioOk ? null : juicio);
    if (!r.balance.cuadra) {
      t.anotar(`${asiento.id}:cifra`, r.cifraOk, r.cifraOk ? null : String(leerCifra(cifra) ?? ""));
    }
    if (r.juicioOk) setJuicios((n) => n + 1);
    if (r.cifraOk) setCifras((n) => n + 1);
    setRetro(r);
  };

  const avanzar = () => {
    setRetro(null); setJuicio(null); setCifra("");
    if (t.i + 1 < t.items.length) t.setI(t.i + 1);
    else t.setTerminado(true);
  };

  const reiniciar = () => {
    t.reiniciar(); setRetro(null); setJuicio(null); setCifra(""); setJuicios(0); setCifras(0);
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
        <Pulsos total={t.items.length} hechos={t.i + (retro ? 1 : 0)} etiqueta="Asiento" />
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

      {juicio === NO_CUADRA && (
        <>
          <p style={rotuloPregunta}>¿DE CUÁNTO ES LA DIFERENCIA?</p>
          <CampoCifra
            valor={cifra}
            onCambio={setCifra}
            onEnviar={responder}
            deshabilitado={Boolean(retro)}
            etiqueta="Diferencia del descuadre"
            estado={retro ? (retro.cifraOk ? "correcta" : "incorrecta") : null}
            autoFoco
          />
        </>
      )}

      {/*
        LA BALANZA LLEGA DESPUÉS DE RESPONDER, Y NO ES UN ADORNO.
        Esta actividad PIDE el juicio: dibujarla antes —inclinada o recta—
        sería contestar la pregunta en la pantalla. Al corregir, en cambio,
        el descuadre deja de ser una resta y pasa a ser una imagen, y la
        inclinación es proporcional: $50 de diferencia en un asiento de
        $5.000 se ve apenas, y eso también enseña.
      */}
      {retro && (
        <div style={{ marginTop: "14px" }}>
          <Balanza
            inclinacion={inclinacionDe(retro.balance.debe, retro.balance.haber)}
            izquierda={pesos(retro.balance.debe)}
            derecha={pesos(retro.balance.haber)}
            etiqueta={retro.balance.cuadra
              ? "Los dos lados pesan lo mismo: el asiento cuadra"
              : `El asiento está descuadrado por ${pesos(retro.balance.descuadre)}`}
          />
        </div>
      )}

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
          {juicio === NO_CUADRA ? "Escribe de cuánto es la diferencia." : "Di si el asiento cuadra."}
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
