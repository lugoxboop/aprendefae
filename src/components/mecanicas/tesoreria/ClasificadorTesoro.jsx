import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import {
  CLASIFICADOR, TARJETAS_POR_PARTIDA, INSTRUMENTOS, porcentaje,
  retroClasificador, retroArchivoClasificador,
} from "../../../data/politicaFiscal.js";
import { Tesoreria, Pista, Ranura, Retro, Pulsos, Cierre, TEXTO_CIERRE } from "./tesoreria.jsx";

/*
 * ACTIVIDAD 1 — "El clasificador del Tesoro". Recordar · Medio.
 *
 * El ejercicio de tarjetas del profesor, en digital: una máquina contadora de
 * documentos. Baja uno a la vez y se manda a una de tres ranuras —Tributación,
 * Gasto del Gobierno o Deuda Pública— antes de que llegue al archivo.
 *
 * Dieciocho tarjetas en el banco, doce por partida, sorteadas en cada intento.
 *
 * UN SOLO INTENTO POR DOCUMENTO. Clasificarlo lo cierra; la devolución dice
 * dónde iba y de qué variedad era. Así "primer intento" y "único intento" son
 * la misma cosa y no hay reintento que pueda heredarse al documento siguiente
 * —el fallo que tuvo corriente-titulares—.
 *
 * UN DOCUMENTO SE CIERRA UNA SOLA VEZ: entre cerrarlo y pasar al siguiente
 * sigue en pantalla unos milisegundos, y un toque de más o su propia caída no
 * pueden cerrarlo otra vez. Es la guarda de diagnostico-en-vivo, aprendida allí.
 *
 * Puntuación: aciertos / 12 × 100, sin redondeo intermedio (ver politicaFiscal.js).
 */

/* Segundos que tarda un documento en llegar al archivo. Recordar no tiene prisa: no acelera. */
const SEGUNDOS_CAIDA = 24;

const tandaNueva = () => barajar(CLASIFICADOR).slice(0, TARJETAS_POR_PARTIDA);

export default function ClasificadorTesoro({ onCompletar }) {
  const [tanda, setTanda] = useState(tandaNueva);
  const [i, setI] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [aviso, setAviso] = useState(null);
  const [marca, setMarca] = useState(null);

  const cerradas = useRef(new Set());
  const detalle = useRef([]);
  const inicio = useRef(Date.now());

  const actual = tanda[i];
  const terminado = i >= tanda.length;
  const pct = porcentaje(aciertos, tanda.length);
  const cerradaActual = !!actual && cerradas.current.has(actual.id);

  useEffect(() => {
    if (terminado) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]);

  /* `elegido` es null cuando el documento llegó solo al archivo. */
  const cerrar = (elegido) => {
    if (!actual || cerradas.current.has(actual.id)) return;
    cerradas.current.add(actual.id);
    const ok = elegido === actual.instrumento;
    detalle.current.push({
      item: actual.id,
      ok,
      intentos: 1,
      respuesta: ok ? null : elegido,
      orden: detalle.current.length + 1,
    });
    if (ok) setAciertos((n) => n + 1);
    setAviso(elegido ? retroClasificador(actual, elegido) : retroArchivoClasificador(actual));
    setMarca(ok ? "acierto" : "fallo");
    setTimeout(() => { setMarca(null); setI((n) => n + 1); }, ok ? 420 : 320);
  };

  const alCaer = (e) => { if (e.animationName === "fae-ts-caer") cerrar(null); };

  const reiniciar = () => {
    setTanda(tandaNueva());
    setI(0); setAciertos(0); setAviso(null); setMarca(null);
    cerradas.current = new Set();
    detalle.current = [];
    inicio.current = Date.now();
  };

  return (
    <Tesoreria rotulo="TESORERÍA · MÁQUINA CONTADORA" titulo="¿A qué ranura va cada documento?" acento={FAE.teal}>
      {!terminado ? (
        <>
          <div style={{ marginBottom: "12px" }}>
            <Pulsos total={tanda.length} hechos={i + (cerradaActual ? 1 : 0)} enCurso={i + 1} etiqueta="Documento" />
          </div>
          <Pista
            itemKey={actual.id}
            texto={actual.concepto}
            segundos={SEGUNDOS_CAIDA}
            detenido={marca === "acierto"}
            marca={marca}
            onAnimationEnd={alCaer}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "8px", marginTop: "12px" }}>
            {INSTRUMENTOS.map((x) => (
              <Ranura
                key={x.id}
                id={x.id}
                nombre={x.nombre}
                detalle={x.mecanismo}
                deshabilitada={cerradaActual}
                onClick={() => cerrar(x.id)}
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
              {aciertos} de {tanda.length} documentos en su ranura. Cada partida saca doce de dieciocho: la
              siguiente trae otros.
            </p>
          </Cierre>
        </>
      )}
    </Tesoreria>
  );
}
