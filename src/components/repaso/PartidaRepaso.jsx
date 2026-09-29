import { useEffect, useRef, useState } from "react";
import { FAE } from "../../theme.js";
import { barajar } from "../../utils/barajar.js";
import { porcentaje } from "../../data/politicaFiscal.js";
import { CSS_JUEGO, Opcion, Opciones, Retro, Pulsos, Cierre, Enunciado } from "../mecanicas/corazon/juego.jsx";
import { Avanzar, TEXTO_CIERRE, RotuloEscenario } from "../mecanicas/bloques/marcos.jsx";
import { MENSAJES } from "../../repaso/repaso.js";
import { estabaFallado } from "../../repaso/seleccion.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA PARTIDA DEL REPASO: diez ítems, un toque cada uno.
 *
 *   pct = aciertos / 10 × 100      (10 % por ítem; base 60 → 6 de 10 = 36 FP)
 *
 * Un intento por ítem (B2d): elegir bloquea las opciones y enseña la
 * devolución de la actividad de origen, la misma función, con la misma forma.
 * Si el ítem estaba fallado y ahora sale bien, DESPUÉS de esa devolución va
 * la línea 🎯 (B7).
 *
 * El detalle se guarda con la CLAVE entera como item_id —`sala-monitores:hospital`—:
 * es lo que junta este encuentro con los de la actividad de origen en el
 * historial.
 * ═══════════════════════════════════════════════════════════════════════════
 */

function Bloque({ bloque, ok }) {
  if (bloque.tipo === "retro") return <Retro texto={bloque.texto} />;

  if (bloque.tipo === "encabezado") {
    return (
      <p style={{ margin: "12px 0 0", fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: ok ? FAE.teal : FAE.coral }}>
        {bloque.texto}
      </p>
    );
  }

  if (bloque.tipo === "marca") {
    /* GANA / PIERDE en su tono; «✗ te equivocaste», en el del error. Las palabras lo dicen igual sin color. */
    const [resultado, error] = bloque.texto.split(" · ✗");
    return (
      <p style={{ margin: "12px 0 0", fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.06em", color: resultado === "GANA" ? FAE.teal : FAE.ambar }}>
        {resultado}
        {error !== undefined ? <span style={{ color: FAE.coral }}> · ✗{error}</span> : " · ✓"}
      </p>
    );
  }

  return (
    <p style={{ margin: "7px 0 0", fontSize: "13px", lineHeight: 1.55, color: "rgba(248,249,250,0.78)", paddingLeft: "11px", borderLeft: "2px solid rgba(248,249,250,0.28)" }}>
      {bloque.texto}
    </p>
  );
}

export default function PartidaRepaso({ items, historial, onTerminar }) {
  /* El orden de las opciones se fija una vez, al montar: no se rebaraja en cada render. */
  const [opciones] = useState(() => items.map((x) => (x.barajarOpciones ? barajar(x.opciones) : x.opciones)));
  const [i, setI] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);

  const respondidos = useRef(new Set());
  const detalle = useRef([]);
  const inicio = useRef(Date.now());

  const item = items[i];
  const pct = porcentaje(aciertos, items.length);

  useEffect(() => {
    if (terminado) onTerminar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]);

  const elegir = (id) => {
    if (respondidos.current.has(item.clave)) return;
    respondidos.current.add(item.clave);
    const ok = id === item.correcta;
    detalle.current.push({ item: item.clave, ok, intentos: 1, respuesta: id, orden: detalle.current.length + 1 });
    if (ok) setAciertos((n) => n + 1);
    setElegida(id);
  };

  const avanzar = () => {
    if (!elegida) return;
    setElegida(null);
    if (i + 1 < items.length) setI(i + 1);
    else setTerminado(true);
  };

  if (terminado) {
    return (
      <div data-partida-repaso>
        <style>{CSS_JUEGO}</style>
        <Cierre pct={Math.round(pct)}>
          <p style={TEXTO_CIERRE}>{aciertos} de {items.length}.</p>
        </Cierre>
      </div>
    );
  }

  const ok = elegida !== null && elegida === item.correcta;
  const bloques = elegida ? item.devolucion(elegida) : [];

  return (
    <div data-partida-repaso>
      <style>{CSS_JUEGO}</style>
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={items.length} hechos={i + (elegida ? 1 : 0)} enCurso={i + 1} etiqueta="Ítem" />
      </div>

      <div key={item.clave}>
        <Enunciado rotulo={item.rotulo}>
          {item.grande
            ? <span style={{ fontFamily: "Sora, sans-serif", fontSize: "24px", fontWeight: 700 }}>{item.enunciado}</span>
            : item.enunciado}
        </Enunciado>
        {item.detalle && (
          <p style={{ margin: "10px 0 0", fontSize: "14px", lineHeight: 1.5, color: "rgba(248,249,250,0.82)" }}>
            <span style={{ display: "block", fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.14em", color: FAE.teal, marginBottom: "3px" }}>
              {item.detalle.rotulo}
            </span>
            {item.detalle.texto}
          </p>
        )}
        {item.etiqueta && <RotuloEscenario texto={item.etiqueta} />}
        {item.pregunta && (
          <p style={{ margin: "14px 0 0", fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 700, lineHeight: 1.4 }}>{item.pregunta}</p>
        )}
      </div>

      <Opciones columnas={opciones[i].length > 4 || opciones[i].some((o) => o.texto.length > 40) ? "1fr" : "repeat(auto-fit, minmax(150px, 1fr))"}>
        {opciones[i].map((o) => (
          <Opcion
            key={o.id}
            ancho
            deshabilitada={Boolean(elegida)}
            onClick={() => elegir(o.id)}
            estado={!elegida ? null : o.id === elegida ? (o.id === item.correcta ? "correcta" : "incorrecta") : o.id === item.correcta ? "revelada" : null}
          >
            {o.texto}
          </Opcion>
        ))}
      </Opciones>

      {bloques.map((b, k) => <Bloque key={k} bloque={b} ok={ok} />)}
      {ok && estabaFallado(historial, item.clave) && (
        <p data-antes-fallada style={{ margin: "10px 0 0", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, color: FAE.teal }}>
          {MENSAJES.antesFallada}
        </p>
      )}

      {elegida && <Avanzar onClick={avanzar}>{i + 1 === items.length ? "Ver resultado" : "Siguiente"}</Avanzar>}
    </div>
  );
}
