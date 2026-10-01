import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../utils/barajar.js";
import { FAE } from "../../../theme.js";
import { DEBE, HABER, COLOR_LADO, pesos } from "../../../data/contabilidad.js";
import {
  OBJETIVO, PREGUNTA, ROTULO_TRANSACCION, SUBTEMA,
} from "../../../data/contabilidadDebitaOAcredita.js";
import {
  ASIENTOS, POR_PARTIDA, VALOR_FICHA, evaluar, puntuar, pesoDeCadaItem,
} from "../../../contabilidad/debitaOAcredita.js";
import { Retro, Pulsos, Cierre, Enunciado } from "../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../bloques/marcos.jsx";
import { Responder, useTanda } from "./piezas.jsx";
import { Encabezado } from "./tema1/encabezado.jsx";
import { CONSIGNA_TEMA2 } from "../../../data/contabilidadConsignas.js";
import {
  CuentaDeValor, Ficha, FichaEnVuelo, EstilosDeVerbos, useArrastre,
  useMovimientoReducido, SOLO_LECTOR,
} from "./verbos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A4 · ¿SE DEBITA O SE ACREDITA?
 *
 * La transacción arriba, UNA cuenta T con nombre abajo, y una ficha. El
 * estudiante la lleva al debe o al haber de esa cuenta — no de la otra.
 *
 * ═══════════ LA CONTRAPARTIDA ES LA RECOMPENSA DE HABERLO PENSADO ═══════════
 *
 * Al acertar, la otra mitad del asiento SE MATERIALIZA debajo, recibe su
 * propia ficha del lado contrario y un arco las une: ahí la partida doble deja
 * de ser una frase. Al fallar no aparece nada, y esa es la decisión que
 * importa — enseñarle la otra cuenta a quien acaba de equivocarse le regala la
 * lógica: vería «Caja al haber» y deduciría la suya sin razonarla.
 *
 * ═══════════ Y SU SITIO ESTÁ RESERVADO DESDE EL PRIMER INSTANTE ═══════════
 *
 * Reservado y LISO: sin marco, sin línea de puntos, sin hueco que se note. Si
 * el estudiante ve que «falta algo abajo», deduce que hay una segunda cuenta
 * antes de razonarlo, y con eso ya sabe demasiado. Mientras no acierte, ahí no
 * hay nada que ver, nada que leer y nada que un lector de pantalla anuncie —
 * ni siquiera el nombre, que no está escrito hasta que aparece.
 *
 * ═══════════ EN UN ERROR LA FICHA NO CAE ═══════════
 *
 * Regla absoluta de las siete. La ficha se detiene, vibra y vuelve a la mano:
 * la cuenta T queda igual de vacía que estaba. El ▲ de la cuenta preguntada sí
 * aparece, para que el reintento se haga ya sabiendo por dónde crece.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
@keyframes fae-a4-rebota {
  0% { transform: translateY(0); } 30% { transform: translateY(-8px); }
  65% { transform: translateY(3px); } 100% { transform: translateY(0); }
}
.fae-a4-rebota { animation: fae-a4-rebota 500ms ease-out 1; }
@keyframes fae-a4-late {
  0%, 100% { transform: scale(1); } 40% { transform: scale(1.08); }
}
.fae-a4-late { animation: fae-a4-late 700ms ease-in-out 2; }
@keyframes fae-a4-traza { from { stroke-dashoffset: 120; } to { stroke-dashoffset: 0; } }
.fae-a4-traza { stroke-dasharray: 120; animation: fae-a4-traza 300ms ease-out 400ms both; }
@keyframes fae-a4-pulso { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
.fae-a4-pulso { animation: fae-a4-pulso 2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .fae-a4-rebota, .fae-a4-late, .fae-a4-traza, .fae-a4-pulso {
    animation: none !important; stroke-dashoffset: 0 !important;
  }
}
`;

const SORA = "Sora, sans-serif";

/* El espacio que ocupa sitio sin decir nada, escrito para que se vea que lo es. */
/*
 * El alto que comparten los controles y la contrapartida: 265 px, que es lo
 * que mide la otra cuenta T con su arco, MEDIDO en el navegador a 375px y no
 * estimado —la primera cifra que puse era 200 y al acertar empujaba 65 px—.
 *
 * Mientras se pregunta, ahí caben la pregunta, la ficha y el aviso del
 * reintento, y lo que sobra queda debajo de todo, donde se lee como margen.
 * Al acertar, ahí está la otra cuenta. Nada de lo que hay debajo se mueve.
 */
const ALTO_DE_LA_ZONA = 265;

/* El chip neutro del tema: fondo sólido y el texto de esa palabra en navy. */
const CHIP = {
  padding: "1px 6px", borderRadius: "6px", background: "#B8C4D4",
  color: "#1D3557", fontWeight: 700,
};

/*
 * Señalar un trozo de un texto que ya estaba escrito, sin reescribirlo. Si el
 * trozo no aparece, devuelve el texto entero sin marcar: más vale no resaltar
 * nada que resaltar lo que no es.
 */
function ConTrozoMarcado({ texto, trozo, marcar, late = false }) {
  const k = trozo && marcar ? texto.indexOf(trozo) : -1;
  if (k < 0) return texto;
  return (
    <>
      {texto.slice(0, k)}
      <span data-marcado={trozo} className={late ? "fae-a4-late" : undefined} style={{ ...CHIP, display: "inline-block" }}>
        {texto.slice(k, k + trozo.length)}
      </span>
      {texto.slice(k + trozo.length)}
    </>
  );
}

/*
 * El arco que une las dos mitades. Va en vertical porque en un teléfono las
 * dos cuentas están una encima de la otra, y nace en la columna donde cayó la
 * ficha para morir en la de enfrente: la dirección es lo que enseña.
 */
function ArcoVertical({ desde, visible }) {
  /* Las dos columnas de una cuenta T ocupan media tarjeta cada una. */
  const x1 = desde === DEBE ? 27 : 73;
  const x2 = desde === DEBE ? 73 : 27;
  const color = COLOR_LADO[desde];
  return (
    <svg
      data-arco={visible ? `${desde}→${desde === DEBE ? HABER : DEBE}` : undefined}
      aria-hidden="true"
      viewBox="0 0 100 26" preserveAspectRatio="none"
      style={{
        display: "block", width: "100%", height: "26px", overflow: "visible",
        visibility: visible ? "visible" : "hidden",
      }}
    >
      <path
        className={visible ? "fae-a4-traza" : undefined}
        d={`M ${x1} 1 C ${x1} 16, ${x2} 10, ${x2} 25`}
        fill="none" stroke={color} strokeWidth="1" strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={x2} cy="25" r="1.3" fill={color} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/*
 * ═══════════ EL MODO DEMO DE «ASÍ SE JUEGA» ═══════════
 *
 * Es este mismo componente, no una copia dibujada: `items` le da el ejemplo
 * desde afuera en vez de sortearlo del banco, y `modoDemo` le quita lo que no
 * es la zona de juego —la consigna, el avance, el botón de seguir— y le corta
 * la salida: no llama a `onCompletar`, así que no hay FP, ni intentos, ni
 * progreso. Cómo se juega no cambia en nada; eso es lo que se enseña.
 */
export default function DebitaOAcredita({
  Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null,
}) {
  const reducido = useMovimientoReducido();
  const t = useTanda(() => items ?? barajar(ASIENTOS).slice(0, POR_PARTIDA));

  /* Dónde cayó la ficha. Solo el acierto escribe aquí. */
  const [puesta, setPuesta] = useState(null);
  const [retro, setRetro] = useState(null);
  const [intento, setIntento] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [rebotando, setRebotando] = useState(false);
  const reloj = useRef(null);
  const zonaBoton = useRef(null);

  const a = t.items[t.i];
  /* El ejemplo de «Así se juega» trae su propia ficha; las del banco valen lo de siempre. */
  const valorFicha = a?.valorFicha ?? VALOR_FICHA;
  const cuantas = t.items.length;
  const pct = puntuar(respuestas, cuantas);
  const esperandoReintento = Boolean(retro && !retro.ok && retro.primero);
  const puedeResponder = !retro || esperandoReintento;

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);

  useEffect(() => () => clearTimeout(reloj.current), []);

  useEffect(() => {
    if (retro && !esperandoReintento && !modoDemo) zonaBoton.current?.querySelector("button")?.focus();
  }, [retro, esperandoReintento]);

  const responder = (lado) => {
    if (retro && !esperandoReintento) return;
    const r = evaluar(a, lado);

    if (!r.ok) {
      /* La ficha no cae: un registro falso no se escribe ni un instante. */
      if (!reducido) {
        setRebotando(true);
        clearTimeout(reloj.current);
        reloj.current = setTimeout(() => setRebotando(false), 520);
      }
      arrastre.limpiar();
    } else {
      setPuesta(lado);
    }

    if (intento === 0) {
      t.anotar(a.id, r.ok, r.ok ? null : lado);
      if (!r.ok) { setRetro({ ...r, primero: true }); setIntento(1); return; }
      setRespuestas((xs) => [...xs, { id: a.id, primeroOk: true }]);
      setRetro({ ...r, primero: true });
      return;
    }
    setRespuestas((xs) => [...xs, { id: a.id, primeroOk: false, segundoOk: r.ok }]);
    setRetro({ ...r, primero: false });
  };

  const arrastre = useArrastre({
    onSoltar: (_ficha, destino) => {
      if (destino === DEBE || destino === HABER) responder(destino);
    },
  });

  const avanzar = () => {
    setRetro(null); setIntento(0); setPuesta(null); setRebotando(false); arrastre.limpiar();
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };

  const reiniciar = () => {
    t.reiniciar(); setRetro(null); setIntento(0); setPuesta(null); setRespuestas([]);
    setRebotando(false); arrastre.limpiar();
  };

  if (t.terminado) {
    const bien = respuestas.filter((r) => r.primeroOk).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <style>{CSS}</style>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>
            {bien} de {cuantas} al primer intento. Cada transacción valía {pesoDeCadaItem(cuantas).toFixed(1)} %.
          </p>
        </Cierre>
      </Marco>
    );
  }

  const acertado = retro?.ok === true;
  const debitos = puesta === DEBE ? [{ valor: valorFicha }] : [];
  const creditos = puesta === HABER ? [{ valor: valorFicha }] : [];
  const contraDebitos = a.ladoContrapartida === DEBE ? [{ valor: valorFicha }] : [];
  const contraCreditos = a.ladoContrapartida === HABER ? [{ valor: valorFicha }] : [];

  /*
   * El ▲ llega tarde: no existe hasta que hay devolución en pantalla.
   *
   * El de la contrapartida no lleva guarda propia, y no le hace falta: la
   * tarjeta entera solo se dibuja al acertar. Una segunda condición diciendo
   * lo mismo no protegería de nada —un mutante lo demostró: quitarla no
   * cambiaba ni un píxel— y haría creer que hay dos cosas que revisar.
   */
  const triangulo = retro ? a.creceP : null;
  const trianguloContra = a.creceContraP;

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      <EstilosDeVerbos />
      {!modoDemo && (
        <>
          <Encabezado consigna={CONSIGNA_TEMA2["cu-debita-o-acredita"]} onComoSeJuega={onComoSeJuega} />
          <div style={{ marginBottom: "12px" }}>
            <Pulsos total={cuantas} hechos={t.i + (retro && !esperandoReintento ? 1 : 0)} enCurso={t.i + 1} etiqueta="Transacción" />
          </div>
        </>
      )}

      <div style={{
        opacity: retro?.atenuarTransaccion ? 0.45 : 1,
        transition: "opacity 300ms ease",
      }}>
        <Enunciado rotulo={ROTULO_TRANSACCION} acento={acento}>
          <ConTrozoMarcado
            texto={a.enunciado}
            trozo={retro?.resaltarPalabra}
            marcar={Boolean(retro && !retro.ok)}
          />
        </Enunciado>
      </div>

      <div style={{ marginTop: "14px" }}>
        <CuentaDeValor
          cuenta={a.cuenta}
          debitos={debitos}
          creditos={creditos}
          destinos={puedeResponder}
          tomada={arrastre.tomada}
          onSoltar={responder}
          recien={puesta ? valorFicha : null}
          triangulo={triangulo}
          alto={92}
        />

        {/*
          ═══════ LA OTRA MITAD OCUPA EL SITIO DE LOS CONTROLES ═══════

          Su alto está reservado desde el primer instante, pero NO como una
          banda vacía encima de la ficha: eso es un hueco, y un hueco de dos
          dedos entre la cuenta y el botón se ve igual de bien que un recuadro
          punteado — el estudiante sabe que ahí va a salir algo.

          Como responder y ver la contrapartida nunca ocurren a la vez, las dos
          cosas comparten un solo bloque de alto fijo: mientras se pregunta, ahí
          están la pregunta y la ficha, arriba; al acertar, ahí está la otra
          cuenta, arriba también, pegada a la primera y con su arco. Nada de lo
          que hay debajo se mueve, y no queda ningún espacio que delate nada.
        */}
        <div data-zona style={{ minHeight: `${ALTO_DE_LA_ZONA}px` }}>
          {acertado ? (
            <div
              data-zona-contrapartida="visible"
              data-contrapartida={a.contrapartida}
              style={{ opacity: 1, transition: reducido ? "none" : "opacity 400ms ease 400ms" }}
            >
              <ArcoVertical desde={a.lado} visible />
              <CuentaDeValor
                cuenta={a.contrapartida}
                debitos={contraDebitos}
                creditos={contraCreditos}
                recien={valorFicha}
                triangulo={trianguloContra}
                alto={92}
              />
            </div>
          ) : (
            <div data-zona-contrapartida="reservada" style={{ paddingTop: "14px" }}>
              {puedeResponder && (
                <>
                  <p style={{
                    margin: "0 0 8px", fontFamily: SORA, fontSize: "10.5px",
                    fontWeight: 700, letterSpacing: "0.16em", color: acento,
                  }}>
                    {esperandoReintento ? "INTÉNTALO OTRA VEZ" : PREGUNTA.replace("{cuenta}", a.cuenta).toUpperCase()}
                  </p>
                  <div
                    style={{ display: "flex", justifyContent: "center" }}
                    onKeyDown={(e) => {
                      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
                      e.preventDefault();
                      responder(e.key === "ArrowLeft" ? DEBE : HABER);
                    }}
                  >
                    <div className={rebotando ? "fae-a4-rebota" : "fae-a4-pulso"} style={{ width: "120px" }}>
                      <Ficha
                        valor={valorFicha}
                        lado={DEBE}
                        color="rgba(248,249,250,0.5)"
                        tomada={arrastre.tomada != null}
                        onClick={() => arrastre.tocar(valorFicha)}
                        gestos={arrastre.gestos(valorFicha)}
                        etiqueta={`Ficha de ${pesos(valorFicha)}. Tómela y suéltela en el debe o en el haber de ${a.cuenta}. Con la ficha tomada, la flecha izquierda la lleva al debe y la derecha al haber.`}
                      />
                    </div>
                  </div>
                  {esperandoReintento && (
                    <p data-fallo style={{
                      margin: "10px 0 0", padding: "7px 10px", borderRadius: "10px",
                      fontSize: "12px", textAlign: "center", color: "rgba(248,249,250,0.75)",
                      border: `1px dashed ${FAE.coral}`,
                    }}>
                      La ficha volvió a la mano: la cuenta sigue vacía.
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {acertado && (
        <p style={SOLO_LECTOR}>
          {a.enunciado}. En la cuenta {a.cuenta}, el valor queda registrado en el
          {a.lado === DEBE ? " debe" : " haber"}. Aparece la cuenta {a.contrapartida} con
          el mismo valor en el {a.ladoContrapartida === DEBE ? "debe" : "haber"}, unida a
          {" "}{a.cuenta} por un arco.
        </p>
      )}

      {retro && <Retro texto={retro.texto} />}

      {/*
        La pista del error: los trozos de texto que hay que mirar, todos a la
        vez. En el patrón A es el nombre de la cuenta por la que SÍ se preguntó
        —late dos veces—; en el B, la parte del nombre que engaña, y arriba, en
        el enunciado, la palabra que dice la dirección de verdad.
      */}
      {retro && !retro.ok && (retro.resaltarCuenta || retro.resaltarParte) && (
        <p data-pista style={{
          margin: "9px 0 0", padding: "8px 10px", borderRadius: "10px",
          fontSize: "12.5px", textAlign: "center", color: "rgba(248,249,250,0.75)",
          background: "rgba(184,196,212,0.13)", borderLeft: "3px solid #B8C4D4",
        }}>
          {retro.resaltarCuenta
            ? <span data-marcado={retro.resaltarCuenta} className="fae-a4-late" style={{ ...CHIP, display: "inline-block" }}>{retro.resaltarCuenta}</span>
            : <ConTrozoMarcado texto={a.cuenta} trozo={retro.resaltarParte} marcar />}
        </p>
      )}

      {retro && !esperandoReintento && !modoDemo && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>
            {t.i + 1 === cuantas ? "Ver el resultado" : "Siguiente transacción"}
          </Responder>
        </div>
      )}

      <FichaEnVuelo valor={valorFicha} lado={DEBE} puntero={arrastre.puntero} />
      <p style={SOLO_LECTOR}>{OBJETIVO}</p>
    </Marco>
  );
}

export { SUBTEMA };
