import { useEffect, useState } from "react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import { porcentaje } from "../../../data/politicaFiscal.js";
import { NOMBRE_TIPO, CRECE_POR, COLOR_LADO } from "../../../data/contabilidad.js";
import { Retro, Pulsos, Cierre, Enunciado } from "../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../bloques/marcos.jsx";
import { Responder, useTanda } from "./piezas.jsx";
import { EstilosDeVerbos } from "./verbos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * SEIS CUENTAS ABIERTAS — la mecánica de Corriente de Cuentas (CU-9).
 *
 * Seis cuentas T sobre la mesa, una por familia. Los nombres de cuenta cruzan
 * y el estudiante señala dónde va cada uno; la ficha VUELA hasta esa cuenta y
 * se apila. Al final de la ronda queda un libro mayor de seis cuentas llenas.
 *
 * ═══════════ LA PRÁCTICA INTERCALADA NO SE TOCA ═══════════
 *
 * Repetir la misma clasificación a velocidad ES la técnica (Rohrer, 2012), no
 * un defecto del diseño. Lo que cambia con el rediseño es el DESTINO: antes
 * las respuestas se evaporaban una tras otra, y ahora se acumulan en un mayor
 * que crece. Doce de veinticuatro por partida, como siempre.
 *
 * ═══════════ SEIS DESTINOS A 375 px ═══════════
 *
 * Seis cuentas T completas no caben en un teléfono, así que en la mesa cada
 * una se dibuja como su cabecera y su pila: el nombre de la familia y las
 * fichas que ha recibido. Es la misma cuenta T reducida a lo que esta
 * actividad usa de ella — el resto sería decoración que obliga a desplazarse.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function SeisCuentasAbiertas({ banco, Marco, rotulo, titulo, acento, onCompletar }) {
  const sortear = () => barajar(banco.items).slice(0, banco.porPartida);
  const t = useTanda(sortear);
  const [retro, setRetro] = useState(null);
  /* Lo que ha recibido cada cuenta: solo entran los aciertos. */
  const [mesa, setMesa] = useState({});

  const item = t.items[t.i];
  const pct = porcentaje(t.aciertos, t.items.length);

  useEffect(() => {
    if (t.terminado) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);

  const responder = (familia) => {
    if (retro) return;
    const r = banco.evaluar(item, familia);
    t.anotar(item.id, r.ok, r.ok ? null : familia);
    if (r.ok) {
      t.setAciertos((n) => n + 1);
      setMesa((m) => ({ ...m, [familia]: [...(m[familia] ?? []), item.cuenta] }));
    }
    setRetro({ ...r, elegida: familia });
  };

  const avanzar = () => {
    setRetro(null);
    if (t.i + 1 < t.items.length) t.setI(t.i + 1);
    else t.setTerminado(true);
  };

  const reiniciar = () => { t.reiniciar(); setRetro(null); setMesa({}); };

  if (t.terminado) {
    const llenas = Object.values(mesa).filter((xs) => xs.length > 0).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>
            {t.aciertos} de {t.items.length} bien clasificadas, repartidas en {llenas} de las seis cuentas del mayor.
          </p>
        </Cierre>
      </Marco>
    );
  }

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <EstilosDeVerbos />
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={t.items.length} hechos={t.i + (retro ? 1 : 0)} etiqueta="Cuenta" />
      </div>

      {/* El nombre que cruza. Entra cayendo en cada vuelta: es el primer verbo. */}
      <div key={item.id} className="fae-cae">
        <Enunciado rotulo={banco.pregunta.toUpperCase()} acento={acento}>{item.texto}</Enunciado>
      </div>

      <p style={{
        margin: "16px 0 8px", fontFamily: "Sora, sans-serif", fontSize: "10.5px",
        fontWeight: 700, letterSpacing: "0.16em", color: acento,
      }}>
        LAS SEIS CUENTAS DEL MAYOR
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {banco.categorias.map((c) => {
          const recibidas = mesa[c.id] ?? [];
          const esLaBuena = retro && c.id === item.respuesta;
          const esLaTocada = retro && c.id === retro.elegida;
          let borde = "rgba(248,249,250,0.18)";
          if (esLaBuena) borde = FAE.teal;
          else if (esLaTocada) borde = FAE.coral;

          return (
            <button
              key={c.id}
              type="button"
              data-cuenta-mesa={c.id}
              disabled={Boolean(retro)}
              onClick={() => responder(c.id)}
              aria-label={`${c.nombre}: ${recibidas.length} cuentas`}
              style={{
                display: "flex", flexDirection: "column", gap: "3px",
                padding: "8px 9px", borderRadius: "11px", minHeight: "74px",
                boxSizing: "border-box", textAlign: "left", cursor: retro ? "default" : "pointer",
                background: "rgba(10,20,34,0.45)", border: `1px solid ${borde}`,
                color: FAE.text, transition: "border-color 180ms ease",
              }}
            >
              <span style={{
                fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700,
                letterSpacing: "0.08em", color: COLOR_LADO[CRECE_POR[c.id]],
              }}>
                {c.nombre.toUpperCase()}
              </span>
              {/*
                La pila. Cada acierto deja su cuenta aquí y la cuenta crece: es
                el mayor construyéndose a velocidad, que es lo que el rediseño
                pide que quede al final de la ronda.
              */}
              {recibidas.length === 0
                ? <span style={{ fontSize: "11px", color: "rgba(248,249,250,0.28)" }}>—</span>
                : recibidas.map((nombre) => (
                  <span key={nombre} data-apilada style={{ fontSize: "11px", lineHeight: 1.3, color: "rgba(248,249,250,0.72)" }}>
                    {nombre}
                  </span>
                ))}
              {esLaBuena && !mesa[c.id]?.includes(item.cuenta) && (
                <span className="fae-cae" style={{ fontSize: "11px", lineHeight: 1.3, color: FAE.teal, fontWeight: 600 }}>
                  {item.cuenta}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {retro && <Retro texto={retro.texto} />}

      {retro && (
        <Responder onClick={avanzar}>
          {t.i + 1 === t.items.length ? "Ver resultado" : "Siguiente"}
        </Responder>
      )}
      {!retro && (
        <p style={{ margin: "10px 0 0", fontSize: "12.5px", color: "rgba(248,249,250,0.45)", textAlign: "center" }}>
          Toque la cuenta donde va. Sin pensarlo mucho: la velocidad es parte del ejercicio.
        </p>
      )}
    </Marco>
  );
}
