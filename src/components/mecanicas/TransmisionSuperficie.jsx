import { useRef, useState } from "react";
import { RotateCcw, Radio } from "lucide-react";
import { FAE } from "../../theme.js";
import { FRAGMENTOS_TRANSMISION, RANURAS_TRANSMISION } from "../../data/icebergActividades.js";
import { barajarDistinto } from "../../utils/barajar.js";

/*
 * "Transmisión a la superficie" — efecto protégé.
 *
 * QUÉ MIDE, QUE NO ES LO MISMO QUE LAS OTRAS. Todas las demás preguntan si el
 * estudiante entendió. Esta pregunta si sabe EXPLICARLO. Se enseña a alguien que
 * baja por primera vez, y el canal es estrecho: caben cinco frases y ni una más.
 *
 * POR QUÉ HAY JERGA EN EL BANCO, Y POR QUÉ RESTA POCO. Las tres frases de jerga
 * son ciertas. "Existe una condición estructural subyacente que perpetúa la
 * manifestación sintomática" describe bien la estructura del iceberg; el
 * problema es que quien está bajando no la entiende. Restan, pero menos que las
 * falsas: no son un error de contenido, son un error de destinatario. Esa es
 * exactamente la trampa del que acaba de aprender algo y lo repite con las
 * palabras del libro.
 *
 * PUNTUACIÓN, POR FRAGMENTO ENVIADO.
 *
 *   clara, en su sitio ....................  +20
 *   clara, pero fuera de sitio ............  +10
 *   jerga .................................  −10
 *   incorrecta ............................  −20
 *
 * Suelo en 0, techo en 100. Las cinco claras en su orden hacen 5 × 20 = 100
 * exacto, así que el máximo se alcanza y no hay que redondear nada.
 *
 * EL ORDEN CUENTA LA MITAD, NO TODO. Una clara fuera de sitio vale 10 y no 0
 * porque haber elegido las cinco buenas ya es media explicación: el iceberg baja
 * de la superficie al modelo mental, y contarlo al revés se entiende peor, pero
 * se entiende. Lo que no se entiende es una frase en jerga.
 *
 * LA REGLA QUE SOSTIENE TODO ESTO, dicha con precisión: cambiar una frase clara
 * por ruido cuesta SIEMPRE más que descolocarla. Descolocar cuesta 10; meter
 * jerga en su sitio, 30; meter una falsedad, 40. No es cierto —y se comprobó que
 * no lo es— que elegir bien pese más que ordenar bien en todos los casos: cuatro
 * claras en su sitio con una jerga dan 70 y las cinco claras descolocadas dan
 * 50. Está bien que sea así, porque en el iceberg el orden ES contenido.
 * La escala entera está congelada en iceberg-nuevas.test.mjs.
 */

const PUNTOS = { claraEnSitio: 20, claraFueraDeSitio: 10, jerga: -10, incorrecta: -20 };

/* El orden bueno: las claras, de la superficie al fondo, tal como se declaran. */
export const CLARAS = FRAGMENTOS_TRANSMISION.filter((f) => f.clase === "clara").map((f) => f.id);

/* Lo que aporta un fragmento en el sitio donde lo pusieron. */
export function valorDe(id, posicion) {
  const f = FRAGMENTOS_TRANSMISION.find((x) => x.id === id);
  if (!f) return 0;
  if (f.clase === "incorrecta") return PUNTOS.incorrecta;
  if (f.clase === "jerga") return PUNTOS.jerga;
  return CLARAS[posicion] === id ? PUNTOS.claraEnSitio : PUNTOS.claraFueraDeSitio;
}

/*
 * La transmisión entera. Exportada para poder comprobar que el 100 se alcanza y
 * que el peor mensaje posible da 0 y no un negativo, que es lo que el motor de
 * FP recibiría.
 */
export function puntuarTransmision(enviadas) {
  const bruto = enviadas.reduce((suma, id, i) => suma + valorDe(id, i), 0);
  return Math.max(0, Math.min(100, bruto));
}

const CSS = `
@keyframes fae-ts-entrar { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.fae-ts-entrar { animation: fae-ts-entrar 420ms ease-out both; }
@keyframes fae-ts-senal { 0%,100% { opacity: .25; } 50% { opacity: 1; } }
.fae-ts-senal { animation: fae-ts-senal 1.8s ease-in-out infinite; }
@keyframes fae-ts-subir { from { transform: translateY(0); opacity: .55; } to { transform: translateY(-34px); opacity: 0; } }
.fae-ts-subir { animation: fae-ts-subir 3s ease-in infinite; }
@media (prefers-reduced-motion: reduce) {
  .fae-ts-entrar, .fae-ts-senal, .fae-ts-subir { animation: none !important; opacity: 1 !important; transform: none !important; }
}
`;

export default function TransmisionSuperficie({ onCompletar }) {
  const [enviadas, setEnviadas] = useState([]);   // ids, en el orden del mensaje
  const [enviado, setEnviado] = useState(false);
  const inicio = useRef(Date.now());

  /* El banco se baraja: con el orden del archivo, las cinco claras salen juntas. */
  const ordenPrevio = useRef(null);
  const [banco, setBanco] = useState(() => {
    const o = barajarDistinto(FRAGMENTOS_TRANSMISION, null, (f) => f.id);
    ordenPrevio.current = o;
    return o;
  });

  const lleno = enviadas.length === RANURAS_TRANSMISION;

  const pct = puntuarTransmision(enviadas);

  const alternar = (id) => {
    if (enviado) return;
    setEnviadas((e) => {
      if (e.includes(id)) return e.filter((x) => x !== id);
      if (e.length >= RANURAS_TRANSMISION) return e;
      return [...e, id];
    });
  };

  const transmitir = () => {
    if (!lleno || enviado) return;
    setEnviado(true);
    onCompletar?.(pct, Date.now() - inicio.current);
  };

  const reiniciar = () => {
    setEnviadas([]); setEnviado(false);
    const o = barajarDistinto(FRAGMENTOS_TRANSMISION, ordenPrevio.current, (f) => f.id);
    ordenPrevio.current = o;
    setBanco(o);
    inicio.current = Date.now();
  };

  const colorDe = (clase) =>
    clase === "clara" ? FAE.teal : clase === "jerga" ? FAE.ambar : FAE.coral;

  return (
    <div>
      <style>{CSS}</style>

      {/* --------------------------- quién escucha --------------------------- */}
      <div style={{ borderRadius: "18px", background: "#0A1422", border: "1px solid rgba(248,249,250,0.14)", padding: "clamp(14px, 2.2vw, 20px)", marginBottom: "14px", position: "relative", overflow: "hidden" }}>
        {/* Burbujas del que baja. */}
        <span aria-hidden="true" className="fae-ts-subir" style={{ position: "absolute", left: "78%", bottom: "18px", width: "5px", height: "5px", borderRadius: "999px", background: FAE.teal }} />
        <span aria-hidden="true" className="fae-ts-subir" style={{ position: "absolute", left: "84%", bottom: "12px", width: "3px", height: "3px", borderRadius: "999px", background: FAE.teal, animationDelay: "1.1s" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "10px" }}>
          <Radio size={15} color={FAE.teal} className="fae-ts-senal" />
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: 0 }}>
            AL OTRO LADO DEL CANAL
          </p>
        </div>
        <p style={{ fontSize: "14.5px", lineHeight: 1.6, color: FAE.text, margin: 0 }}>
          Alguien baja por primera vez y te pide que le expliques el caso de la tienda de ropa: menos
          clientes cada mes, y nadie sabe por qué. No ha visto un iceberg en su vida.
        </p>
        <p style={{ fontSize: "13px", lineHeight: 1.6, color: "rgba(248,249,250,0.55)", margin: "10px 0 0" }}>
          El canal aguanta {RANURAS_TRANSMISION} frases. Elígelas en el orden en que quieres que las oiga.
        </p>
      </div>

      {/* ---------------------------- la transmisión ---------------------------- */}
      <div style={{ borderRadius: "18px", background: "rgba(248,249,250,0.04)", border: "1px solid rgba(248,249,250,0.12)", padding: "clamp(14px, 2.2vw, 20px)", marginBottom: "14px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {Array.from({ length: RANURAS_TRANSMISION }, (_, i) => {
            const id = enviadas[i];
            const f = id ? FRAGMENTOS_TRANSMISION.find((x) => x.id === id) : null;
            const valor = id ? valorDe(id, i) : 0;
            const color = f ? colorDe(f.clase) : null;
            return (
              <div
                key={i}
                style={{
                  display: "flex", gap: "11px", alignItems: "flex-start",
                  padding: "11px 13px", borderRadius: "13px", minHeight: "20px",
                  background: f ? "rgba(248,249,250,0.03)" : "transparent",
                  border: `1px ${f ? "solid" : "dashed"} ${enviado && f ? color : f ? "rgba(248,249,250,0.16)" : "rgba(248,249,250,0.14)"}`,
                }}
              >
                <span style={{
                  flexShrink: 0, width: "22px", height: "22px", borderRadius: "999px",
                  display: "grid", placeItems: "center", fontFamily: "Sora, sans-serif",
                  fontSize: "11.5px", fontWeight: 700, fontVariantNumeric: "tabular-nums",
                  background: f ? FAE.teal : "rgba(248,249,250,0.07)",
                  color: f ? "#08111d" : "rgba(248,249,250,0.35)",
                }}>
                  {i + 1}
                </span>
                <span style={{ flex: 1, fontSize: "13.5px", lineHeight: 1.5, color: f ? FAE.text : "rgba(248,249,250,0.3)" }}>
                  {f ? f.texto : "—"}
                </span>
                {enviado && f && (
                  <span style={{ flexShrink: 0, fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>
                    {valor > 0 ? `+${valor}` : valor}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {!enviado ? (
          <button
            type="button"
            onClick={transmitir}
            disabled={!lleno}
            style={{
              marginTop: "14px", width: "100%", padding: "13px", borderRadius: "14px",
              cursor: lleno ? "pointer" : "default",
              background: lleno ? FAE.teal : "rgba(248,249,250,0.05)",
              border: `1px solid ${lleno ? FAE.teal : "rgba(248,249,250,0.14)"}`,
              color: lleno ? "#08111d" : "rgba(248,249,250,0.35)",
              fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700,
            }}
          >
            {lleno ? "Transmitir" : `Faltan ${RANURAS_TRANSMISION - enviadas.length}`}
          </button>
        ) : (
          <div className="fae-ts-entrar" style={{ marginTop: "16px" }}>
            <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "24px", color: FAE.text, margin: "0 0 6px", fontVariantNumeric: "tabular-nums" }}>
              {pct}%
            </p>
            <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 14px" }}>
              {pct === 100
                ? "Las cinco frases buenas, en el orden en que se baja. Al otro lado se entendió todo."
                : "Lo que resta no siempre es falso: una frase en jerga es cierta y no se entiende, que para quien está bajando es casi lo mismo que no decir nada."}
            </p>
            <button
              type="button"
              onClick={reiniciar}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, padding: "9px 15px", borderRadius: "999px", cursor: "pointer", background: "transparent", border: "1px solid rgba(248,249,250,0.22)", color: "rgba(248,249,250,0.7)" }}
            >
              <RotateCcw size={14} /> Volver a transmitir
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------ el banco ------------------------------ */}
      <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 10px" }}>
        LO QUE PODRÍAS DECIR
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {banco.map((f) => {
          const puesto = enviadas.indexOf(f.id);
          const elegida = puesto >= 0;
          const color = colorDe(f.clase);
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => alternar(f.id)}
              disabled={enviado || (!elegida && lleno)}
              style={{
                textAlign: "left", padding: "12px 14px", borderRadius: "13px",
                cursor: enviado || (!elegida && lleno) ? "default" : "pointer",
                background: elegida ? "rgba(42,157,143,0.10)" : "rgba(248,249,250,0.03)",
                border: `1px solid ${enviado && elegida ? color : elegida ? FAE.teal : "rgba(248,249,250,0.14)"}`,
                color: !elegida && lleno && !enviado ? "rgba(248,249,250,0.32)" : FAE.text,
                fontFamily: "Inter, sans-serif", fontSize: "13.5px", lineHeight: 1.5,
              }}
            >
              {f.texto}
            </button>
          );
        })}
      </div>
    </div>
  );
}
