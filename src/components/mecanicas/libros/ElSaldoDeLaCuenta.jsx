import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../utils/barajar.js";
import { FAE } from "../../../theme.js";
import { DEBE, HABER, pesos } from "../../../data/contabilidad.js";
import {
  OBJETIVO, PREGUNTA_CIFRA, PREGUNTA_LADO, SUBTEMA,
} from "../../../data/contabilidadSaldo.js";
import {
  CUENTAS, POR_PARTIDA, evaluar, puntuar, decisionesDe, pesoDeCadaDecision,
} from "../../../contabilidad/saldoDeLaCuenta.js";
import { Retro, Pulsos, Cierre } from "../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../bloques/marcos.jsx";
import { CampoCifra, ElegirLado, Responder, leerCifra, useTanda } from "./piezas.jsx";
import { Encabezado } from "./tema1/encabezado.jsx";
import { CONSIGNA_TEMA2 } from "../../../data/contabilidadConsignas.js";
import { CuentaDeValor, EstilosDeVerbos, SOLO_LECTOR, useMovimientoReducido } from "./verbos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A5 · EL SALDO DE LA CUENTA.
 *
 * Una cuenta T con sus movimientos dibujados como columnas de altura
 * proporcional, y dos preguntas: cuánto es el saldo y de qué lado va.
 *
 * ═══════════ LAS DOS SE CONFIRMAN JUNTAS, EN UNA SOLA ACCIÓN ═══════════
 *
 * Y no es un detalle de interfaz: si el lado se preguntara DESPUÉS de haber
 * visto la cancelación, la columna que quedó en pie sería la respuesta. Hay
 * que comprometerse con las dos cosas antes de ver ninguna.
 *
 * ═══════════ EN UN PRIMER ERROR LA CANCELACIÓN NO CORRE ═══════════
 *
 * Da igual cuál de los cuatro modos de fallar sea. Las columnas se quedan como
 * estaban, enteras, y lo que se enseña es dónde mirar: los dos totales, o el
 * signo tachado, o la resta escrita sin su resultado. Si la cancelación
 * corriera, el reintento no tendría nada que calcular.
 *
 * ═══════════ TRES CUENTAS SE LLAMAN «CAJA» ═══════════
 *
 * La del ejemplo del capítulo, la de Caleja y la del lavado. Debajo del nombre
 * va la empresa, más pequeña: sin eso serían tres preguntas escritas igual con
 * tres respuestas distintas.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
/*
 * La cámara lenta del modo A. No es un adorno: a quien sumó los dos lados en
 * vez de restarlos hay que enseñarle la resta despacio, y es la misma
 * cancelación de siempre, con el reloj estirado.
 */
.fae-a5-lenta [data-comido] { transition-duration: 1200ms !important; }
@keyframes fae-a5-aparece { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
.fae-a5-aparece { animation: fae-a5-aparece 300ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .fae-a5-lenta [data-comido] { transition-duration: 1ms !important; }
  .fae-a5-aparece { animation: none !important; }
}
`;

const SORA = "Sora, sans-serif";
const CIFRA = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontVariantNumeric: "tabular-nums",
};
const CHIP = {
  padding: "1px 6px", borderRadius: "6px", background: "#B8C4D4",
  color: "#1D3557", fontWeight: 700, ...CIFRA,
};

const rotulo = (acento) => ({
  margin: "16px 0 8px", fontFamily: SORA, fontSize: "10.5px",
  fontWeight: 700, letterSpacing: "0.16em", color: acento,
});

/*
 * Los dos totales, puestos donde se puedan comparar. Es lo que la ficha manda
 * enseñar en tres de los cuatro errores: no la respuesta, sino los dos números
 * de los que sale — con el chip neutro, que aquí es el único resaltado que no
 * significa «mal».
 */
function TotalesResaltados({ cuenta, operacion }) {
  return (
    <div data-totales className="fae-a5-aparece" style={{
      margin: "10px 0 0", padding: "9px 10px", borderRadius: "11px",
      background: "rgba(10,20,34,0.4)", border: "1px solid rgba(248,249,250,0.12)",
    }}>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
        {[["Suma del debe", cuenta.debito, DEBE], ["Suma del haber", cuenta.credito, HABER]].map(([nombre, valor, lado]) => (
          <span key={lado} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", color: "rgba(248,249,250,0.6)" }}>{nombre}</span>
            <span data-total-resaltado={lado} style={CHIP}>{pesos(valor)}</span>
          </span>
        ))}
      </div>
      {operacion && (
        <p data-operacion style={{
          margin: "8px 0 0", textAlign: "center", ...CIFRA, fontSize: "14px",
          fontWeight: 700, color: "rgba(248,249,250,0.8)",
        }}>
          {operacion}
        </p>
      )}
    </div>
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
export default function ElSaldoDeLaCuenta({
  Marco, rotulo: rot, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null,
}) {
  const reducido = useMovimientoReducido();
  const t = useTanda(() => items ?? barajar(CUENTAS).slice(0, POR_PARTIDA));

  const [cifra, setCifra] = useState("");
  const [lado, setLado] = useState(null);
  const [r, setR] = useState(null);
  const [intento, setIntento] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const zonaBoton = useRef(null);

  const c = t.items[t.i];
  const cuantas = t.items.length;
  const pct = puntuar(respuestas, cuantas);
  const esperandoReintento = Boolean(r && !r.todoBien && intento === 1);

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);

  useEffect(() => {
    if (r && !esperandoReintento && !modoDemo) zonaBoton.current?.querySelector("button")?.focus();
  }, [r, esperandoReintento]);

  const responder = () => {
    if (r && !esperandoReintento) return;
    const valor = leerCifra(cifra);
    if (valor === null || !lado) return;
    const nuevo = evaluar(c, valor, lado, intento);

    if (intento === 0) {
      t.anotar(`${c.id}:saldo`, nuevo.cifraOk, nuevo.cifraOk ? null : String(valor));
      t.anotar(`${c.id}:lado`, nuevo.ladoOk, nuevo.ladoOk ? null : lado);
      if (nuevo.todoBien) {
        setRespuestas((xs) => [...xs,
          { id: `${c.id}:saldo`, primeroOk: true },
          { id: `${c.id}:lado`, primeroOk: true }]);
        setR(nuevo);
        return;
      }
      /* Lo que ya estaba bien se queda anotado bien; el resto va al reintento. */
      setRespuestas((xs) => [...xs,
        ...(nuevo.cifraOk ? [{ id: `${c.id}:saldo`, primeroOk: true }] : []),
        ...(nuevo.ladoOk ? [{ id: `${c.id}:lado`, primeroOk: true }] : [])]);
      setR(nuevo);
      setIntento(1);
      /*
       * El signo se tacha y la cifra se queda en valor absoluto: el estudiante
       * restó bien y escribió el signo de más. No se le borra el trabajo.
       */
      if (nuevo.quitarSigno) setCifra(String(Math.abs(valor)));
      return;
    }

    setRespuestas((xs) => [...xs,
      ...(!r.cifraOk ? [{ id: `${c.id}:saldo`, primeroOk: false, segundoOk: nuevo.cifraOk }] : []),
      ...(!r.ladoOk ? [{ id: `${c.id}:lado`, primeroOk: false, segundoOk: nuevo.ladoOk }] : [])]);
    /*
     * Y SE CIERRA EL REINTENTO. Sin esta línea el reintento era infinito: el
     * estudiante podía seguir respondiendo, cada vuelta añadía otra entrada al
     * detalle del docente, y el lado correcto no se destapaba nunca. Salió de
     * una prueba, no de leer el código.
     */
    setIntento(2);
    /* En el reintento la cancelación corre siempre: la respuesta ya se revela. */
    setR({ ...nuevo, cancelar: true, camaraLenta: r.modoCifra === "A" });
  };

  const avanzar = () => {
    setR(null); setIntento(0); setCifra(""); setLado(null);
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };

  const reiniciar = () => {
    t.reiniciar(); setR(null); setIntento(0); setCifra(""); setLado(null); setRespuestas([]);
  };

  if (t.terminado) {
    const bien = respuestas.filter((x) => x.primeroOk).length;
    return (
      <Marco rotulo={rot} titulo={titulo} acento={acento}>
        <style>{CSS}</style>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>
            {bien} de {decisionesDe(cuantas)} al primer intento — cifra y lado de {cuantas} cuentas.
            Cada decisión valía {pesoDeCadaDecision(cuantas).toFixed(2)} %.
          </p>
        </Cierre>
      </Marco>
    );
  }

  const listo = leerCifra(cifra) !== null && lado !== null;
  const cancelando = Boolean(r?.cancelar);
  const enError = Boolean(r && !r.todoBien);

  return (
    <Marco rotulo={rot} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      <EstilosDeVerbos />
      {!modoDemo && (
        <>
          <Encabezado consigna={CONSIGNA_TEMA2["cu-saldo-de-la-cuenta"]} onComoSeJuega={onComoSeJuega} />
          <div style={{ marginBottom: "12px" }}>
            <Pulsos total={cuantas} hechos={t.i + (r && !esperandoReintento ? 1 : 0)} enCurso={t.i + 1} etiqueta="Cuenta" />
          </div>
        </>
      )}

      {/*
        LAS COLUMNAS DE VALOR, NO LA LISTA DE CIFRAS. Cada movimiento mide lo
        que vale, así que de un vistazo se ve cuál lado pesó más —que es la
        segunda pregunta— sin regalar la primera: cuánto es el saldo sigue
        siendo una resta.
      */}
      <div className={r?.camaraLenta && cancelando && !reducido ? "fae-a5-lenta" : undefined}>
        <CuentaDeValor
          cuenta={c.cuenta}
          sub={c.empresa}
          debitos={c.debitos}
          creditos={c.creditos}
          cancelar={cancelando}
        />
      </div>

      {enError && (r.resaltarTotales || r.operacion) && (
        <TotalesResaltados cuenta={c} operacion={r.operacion} />
      )}

      <p style={rotulo(acento)}>{esperandoReintento ? "INTÉNTALO OTRA VEZ" : PREGUNTA_CIFRA}</p>
      <CampoCifra
        valor={cifra}
        onCambio={setCifra}
        onEnviar={responder}
        deshabilitado={Boolean(r) && !esperandoReintento}
        etiqueta={`Saldo de ${c.cuenta} de ${c.empresa}`}
        estado={r ? (r.cifraOk ? "correcta" : "incorrecta") : null}
        autoFoco={!modoDemo}
      />
      {r?.quitarSigno && (
        <p data-signo-quitado style={{
          margin: "7px 0 0", fontSize: "12px", textAlign: "center", color: FAE.coral,
        }}>
          <span style={{ textDecoration: "line-through" }}>−</span> El saldo no lleva signo: quedó la cifra sola.
        </p>
      )}

      <p style={rotulo(acento)}>{PREGUNTA_LADO}</p>
      <ElegirLado
        elegido={lado}
        /* El lado correcto solo se destapa cuando ya no queda reintento. */
        correcto={r && !esperandoReintento ? c.lado : null}
        onElegir={setLado}
        deshabilitado={Boolean(r) && !esperandoReintento}
      />

      {r && (
        <div style={{ marginTop: "6px" }}>
          <Retro texto={r.textoCifra} />
          <Retro texto={r.textoLado} />
        </div>
      )}

      {!r || esperandoReintento
        ? (
          <Responder onClick={responder} deshabilitado={!listo}>
            {esperandoReintento ? "Responder otra vez" : "Responder"}
          </Responder>
        )
        : !modoDemo && (
          <div ref={zonaBoton}>
            <Responder onClick={avanzar}>
              {t.i + 1 === cuantas ? "Ver el resultado" : "Siguiente cuenta"}
            </Responder>
          </div>
        )}

      {cancelando && (
        <p style={SOLO_LECTOR}>
          Cuenta {c.cuenta} de {c.empresa} con {pesos(c.debito)} en el debe y {pesos(c.credito)} en
          el haber. Tras la cancelación quedan {pesos(c.saldo)} en pie del lado del
          {c.lado === DEBE ? " debe" : " haber"}, y el marcador de saldo se ubica debajo de esa columna.
        </p>
      )}
      <p style={SOLO_LECTOR}>{OBJETIVO}</p>
    </Marco>
  );
}

export { SUBTEMA };
