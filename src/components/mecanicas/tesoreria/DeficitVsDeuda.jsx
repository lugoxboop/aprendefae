import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import { BANDEJAS, sortearPapeles, porcentaje, retroDeficit, retroCaidaDeficit } from "../../../data/politicaFiscal.js";
import { Tesoreria, Pista, Ranura, Retro, Pulsos, Cierre, TEXTO_CIERRE } from "./tesoreria.jsx";

/*
 * ACTIVIDAD 7 — "Déficit vs deuda". Aplicar · Difícil · Práctica intercalada.
 *
 * Diez papeles de catorce caen, cada vez más rápido, hacia cuatro bandejas:
 * Tributación, Gasto, Deuda y "Ninguno — es déficit o concepto general".
 *
 * LA CUARTA BANDEJA ES EL JUEGO. El déficit es un FLUJO —lo que falta en un
 * año— y la deuda un SALDO —lo que se acumula—; ninguno de los dos es un
 * instrumento. Por eso las cuatro frases de "Ninguno" traen su explicación en
 * la devolución de error, y el sorteo garantiza al menos dos por partida.
 *
 * Y es el segundo sitio donde "bono" cae en cajas distintas: emitir TES es
 * Deuda, pagar los intereses del crédito del BID es Gasto. Esa fila lleva la
 * misma aclaración que el ítem 7 del clasificador, acierte o falle.
 *
 * Un solo intento por papel y un cierre por papel, con la misma guarda que el
 * clasificador (ver ahí por qué).
 *
 * Puntuación: aciertos / 10 × 100.
 */

/* La velocidad de caída. Son puntos de calibración con nombre, no verdades. */
const SEGUNDOS_BASE = 16;             // lo que tarda el primer papel en caer
const ACELERACION_POR_PAPEL = 0.9;    // segundos que se recortan por cada papel resuelto
const SEGUNDOS_MINIMO = 7;            // el techo de velocidad

const segundosDe = (resueltos) => Math.max(SEGUNDOS_MINIMO, SEGUNDOS_BASE - resueltos * ACELERACION_POR_PAPEL);

const tandaNueva = () => sortearPapeles(barajar);

export default function DeficitVsDeuda({ onCompletar }) {
  const [tanda, setTanda] = useState(tandaNueva);
  const [i, setI] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [aviso, setAviso] = useState(null);
  const [marca, setMarca] = useState(null);

  const cerrados = useRef(new Set());
  const detalle = useRef([]);
  const inicio = useRef(Date.now());

  const actual = tanda[i];
  const terminado = i >= tanda.length;
  const pct = porcentaje(aciertos, tanda.length);
  const cerradoActual = !!actual && cerrados.current.has(actual.id);

  useEffect(() => {
    if (terminado) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]);

  /* `elegida` es null cuando el papel llegó solo al fondo. */
  const cerrar = (elegida) => {
    if (!actual || cerrados.current.has(actual.id)) return;
    cerrados.current.add(actual.id);
    const ok = elegida === actual.bandeja;
    detalle.current.push({
      item: actual.id,
      ok,
      intentos: 1,
      respuesta: ok ? null : elegida,
      orden: detalle.current.length + 1,
    });
    if (ok) setAciertos((n) => n + 1);
    setAviso(elegida ? retroDeficit(actual, elegida) : retroCaidaDeficit(actual));
    setMarca(ok ? "acierto" : "fallo");
    setTimeout(() => { setMarca(null); setI((n) => n + 1); }, ok ? 420 : 320);
  };

  const alCaer = (e) => { if (e.animationName === "fae-ts-caer") cerrar(null); };

  const reiniciar = () => {
    setTanda(tandaNueva());
    setI(0); setAciertos(0); setAviso(null); setMarca(null);
    cerrados.current = new Set();
    detalle.current = [];
    inicio.current = Date.now();
  };

  return (
    <Tesoreria rotulo="TESORERÍA · BANDEJAS DE ENTRADA" titulo="¿A qué bandeja va cada papel?" acento={FAE.coral}>
      {!terminado ? (
        <>
          <div style={{ marginBottom: "12px" }}>
            <Pulsos total={tanda.length} hechos={i + (cerradoActual ? 1 : 0)} etiqueta="Papel" />
          </div>
          <Pista
            itemKey={actual.id}
            texto={actual.texto}
            segundos={segundosDe(i)}
            detenido={marca === "acierto"}
            marca={marca}
            onAnimationEnd={alCaer}
            rotulo="FONDO"
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "8px", marginTop: "12px" }}>
            {BANDEJAS.map((b) => (
              <Ranura
                key={b.id}
                id={b.id}
                nombre={b.id === "ninguno" ? "Ninguno" : b.nombre}
                detalle={b.id === "ninguno" ? "es déficit o concepto general" : null}
                deshabilitada={cerradoActual}
                onClick={() => cerrar(b.id)}
              />
            ))}
          </div>
          <Retro texto={aviso} />
        </>
      ) : (
        <>
          <Retro texto={aviso} />
          <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
            <p style={TEXTO_CIERRE}>
              {aciertos} de {tanda.length} papeles en su bandeja. Recuerda la diferencia: el déficit es lo que
              falta en un año; la deuda, todo lo que se ha acumulado.
            </p>
          </Cierre>
        </>
      )}
    </Tesoreria>
  );
}
