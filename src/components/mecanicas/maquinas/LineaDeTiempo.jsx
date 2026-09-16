import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import { EL_REZAGO, puntuarRezago } from "../../../data/politicaMonetaria.js";
import { Opcion, Opciones, Retro, Cierre, Enunciado } from "../corazon/juego.jsx";
import { Avanzar, TEXTO_CIERRE, RotuloEscenario } from "../bloques/marcos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PM-9 · EL REZAGO — Difícil.
 *
 * Cinco hechos a la línea de tiempo, del más inmediato al más tardío. Se toca
 * un hecho y luego su lugar; tocar un hecho ya puesto lo recoge para moverlo. Con los cinco
 * puestos se comprueba el orden, cada lugar dice si va bien o si el hecho va
 * antes o después, y cierra la pregunta del pronóstico.
 *
 *   pct = 16 % por hecho en su lugar exacto + 20 % la pregunta de cierre
 *
 * LA PREGUNTA DE CIERRE TRAE UNA SOLA RESPUESTA en la ficha —la correcta—, sin
 * distractores. Se pinta así, tal cual: una opción. Tocarla da su 20 %.
 * Señalado para pedagogía.
 *
 * Ítems: `<caso>:<hecho>` (ok si quedó en su lugar; `respuesta` el lugar donde
 * se puso, del 1 al 5) y `cierre`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function LineaDeTiempo({ banco = EL_REZAGO, Marco, rotulo, titulo, acento, onCompletar }) {
  const sortear = () => barajar(banco.casos)[0];
  const [caso, setCaso] = useState(sortear);
  const [bancoHechos, setBancoHechos] = useState(() => barajar(caso.hechos));
  const [lugares, setLugares] = useState([null, null, null, null, null]);
  const [elegido, setElegido] = useState(null);
  const [comprobado, setComprobado] = useState(false);
  const [cierre, setCierre] = useState(null);
  const [terminado, setTerminado] = useState(false);

  const detalle = useRef([]);
  const inicio = useRef(Date.now());

  const lleno = lugares.every(Boolean);
  const correcto = (k) => lugares[k] === caso.hechos[k].id;
  const bien = lugares.filter((_, k) => correcto(k)).length;
  const pct = puntuarRezago(bien, cierre === "correcta");
  const hecho = (id) => caso.hechos.find((h) => h.id === id);

  useEffect(() => {
    if (terminado) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]);

  /*
   * Un lugar ocupado, sin nada en la mano: se recoge ese hecho para moverlo.
   * Con un hecho en la mano: va a ese lugar; si venía de otro lugar, los dos
   * se intercambian, y si venía del banco, el que estaba vuelve al banco. Un
   * hecho puesto nunca se pierde de la línea por un toque de más.
   */
  const ponerEn = (k) => {
    if (comprobado) return;
    if (!elegido) {
      if (lugares[k]) setElegido(lugares[k]);
      return;
    }
    setLugares((l) => {
      const desde = l.indexOf(elegido);
      return l.map((x, j) => (j === k ? elegido : j === desde ? l[k] : x));
    });
    setElegido(null);
  };

  const comprobar = () => {
    if (!lleno || comprobado) return;
    lugares.forEach((id, k) => {
      const lugarReal = caso.hechos.findIndex((h) => h.id === id);
      detalle.current.push({ item: `${caso.id}:${id}`, ok: lugarReal === k, intentos: 1, respuesta: String(k + 1), orden: detalle.current.length + 1 });
    });
    setComprobado(true);
  };

  const responderCierre = () => {
    if (!comprobado || cierre) return;
    detalle.current.push({ item: "cierre", ok: true, intentos: 1, respuesta: null, orden: detalle.current.length + 1 });
    setCierre("correcta");
  };

  const reiniciar = () => {
    const otro = sortear();
    setCaso(otro);
    setBancoHechos(barajar(otro.hechos));
    setLugares([null, null, null, null, null]);
    setElegido(null); setComprobado(false); setCierre(null); setTerminado(false);
    detalle.current = [];
    inicio.current = Date.now();
  };

  if (terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otro caso">
          <p style={TEXTO_CIERRE}>{bien} de 5 hechos en su lugar.</p>
        </Cierre>
      </Marco>
    );
  }

  const sinPoner = bancoHechos.filter((h) => !lugares.includes(h.id));

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <Enunciado rotulo="EL CASO" acento={acento}>{caso.titulo}</Enunciado>
      {caso.etiqueta && <RotuloEscenario texto={caso.etiqueta} />}

      <ol style={{ listStyle: "none", margin: "14px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
        {lugares.map((id, k) => {
          const h = id ? hecho(id) : null;
          const ok = comprobado && correcto(k);
          const real = h ? caso.hechos.findIndex((x) => x.id === id) : -1;
          const color = !comprobado ? (h ? "rgba(248,249,250,0.3)" : "rgba(248,249,250,0.18)") : ok ? FAE.teal : FAE.coral;
          return (
            <li key={k}>
              <button
                type="button"
                data-lugar={k + 1}
                onClick={() => ponerEn(k)}
                disabled={comprobado || (!h && !elegido)}
                aria-pressed={Boolean(h) && elegido === id}
                aria-label={h ? `Lugar ${k + 1}: ${h.texto}. Tocar para moverlo.` : `Lugar ${k + 1}, vacío`}
                style={{
                  width: "100%", textAlign: "left", display: "flex", gap: "10px", alignItems: "flex-start",
                  padding: "10px 12px", borderRadius: "12px", cursor: comprobado ? "default" : "pointer",
                  background: h ? "rgba(248,249,250,0.04)" : "transparent",
                  border: `1px ${h ? "solid" : "dashed"} ${!comprobado && elegido && !h ? FAE.ambar : color}`,
                  color: FAE.text, fontFamily: "Inter, sans-serif",
                }}
              >
                <span style={{ flexShrink: 0, minWidth: "22px", fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, color: "rgba(248,249,250,0.6)" }}>{k + 1}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: "13.5px", lineHeight: 1.45, color: h ? FAE.text : "rgba(248,249,250,0.4)" }}>
                    {h ? h.texto : k === 0 ? "Lo más inmediato" : k === 4 ? "Lo más tardío" : "—"}
                  </span>
                  {comprobado && h && (
                    <span style={{ display: "block", marginTop: "5px", fontSize: "12.5px", lineHeight: 1.45, color }}>
                      {ok ? banco.retroBien(h) : banco.retroMal(real < k ? "antes" : "después")}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {!comprobado && (
        <>
          <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.6)", margin: "12px 0 0" }}>
            {elegido ? "Ahora toque su lugar en la línea." : sinPoner.length ? "Toque un hecho." : "Los cinco están puestos."}
          </p>
          <Opciones columnas="1fr">
            {sinPoner.map((h) => (
              <Opcion key={h.id} ancho onClick={() => setElegido(elegido === h.id ? null : h.id)} estado={elegido === h.id ? "revelada" : null}>
                {h.texto}
              </Opcion>
            ))}
          </Opciones>
          {lleno && <Avanzar onClick={comprobar}>Comprobar el orden</Avanzar>}
        </>
      )}

      {comprobado && (
        <div style={{ marginTop: "18px" }}>
          <Enunciado rotulo="PARA CERRAR" acento={acento}>{banco.cierre.pregunta}</Enunciado>
          <Opciones columnas="1fr">
            <Opcion ancho deshabilitada={Boolean(cierre)} onClick={responderCierre} estado={cierre ? "correcta" : null}>
              {banco.cierre.correcta}
            </Opcion>
          </Opciones>
          <Retro texto={cierre ? banco.cierre.retro : null} />
          {cierre && <Avanzar onClick={() => setTerminado(true)}>Ver resultado</Avanzar>}
        </div>
      )}
    </Marco>
  );
}
