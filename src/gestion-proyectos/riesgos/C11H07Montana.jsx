/*
 * C11 · H07 · Los caminos de la montaña (gp26-pla-c11-h07-montana, Difícil, 50 × 3 FP × %).
 * La maqueta de montaña cafetera: el camino sale de la planta y se bifurca en
 * el poste-señal (nodo de decisión, □) en dos caminos; cada uno, en la piedra
 * (nodo de oportunidad, ○), en dos senderos que terminan en cuatro miradores.
 * El árbol va dibujado encima, de arriba abajo (vertical a 320 px), y solo
 * escribe lo que ya se calculó: los miradores y las piedras pendientes van en
 * «?». Las cifras de cada mirador van en su paso. Etapa 3: el deslizador de la
 * probabilidad mueve los dos VME en vivo y el camino mayor se ilumina.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote6, Lamina, BarraH } from "../comun/lote6.jsx";
import { GP_C11_H07, AMPLIACION_C11, cifra } from "./textos-c11.js";

export const ID = GP_C11_H07.id;

// imagen-pendiente: maqueta-montana · poste-senal · mirador (piedra ya existe)
const MONTANA = primero("maqueta-montana", "montana");
const POSTE = primero("poste-senal", "senal-vial");
const PIEDRA = primero("piedra");
const AR = AMPLIACION_C11.arbol;

const MIRADOR = { "c11h07-01": "nueva-fuerte", "c11h07-02": "nueva-debil", "c11h07-03": "repotenciar-fuerte", "c11h07-04": "repotenciar-debil" };

function Arbol({ netos = {}, vme = {}, actual = null }) {
  const fila = (ramo, nombre) => (
    <div key={ramo} data-camino={ramo} style={{ padding: "4px 0", borderTop: "1px solid rgba(244,245,247,.2)" }}>
      <small style={{ display: "block", fontWeight: 800 }}>□ → {nombre} · ○ VME {vme[ramo] != null ? cifra(vme[ramo]) : "?"}</small>
      {["fuerte", "debil"].map((d) => {
        const k = `${ramo}-${d}`;
        return <small key={k} style={{ display: "block", paddingLeft: 14 }} data-mirador={k} data-actual={actual === k ? "1" : undefined}>
          {d === "fuerte" ? "60 % fuerte" : "40 % débil"} → mirador: {netos[k] != null ? cifra(netos[k]) : "?"}{actual === k ? " ◀ este" : ""}
        </small>;
      })}
    </div>
  );
  return (
    <Lamina titulo="El árbol de la junta · millones de pesos" data-arbol>
      {fila("nueva", "Tostadora nueva")}
      {fila("repotenciar", "Repotenciar")}
    </Lamina>
  );
}

const hechosDe = (estado) => new Set([...(estado.etapa?.hechos ?? []).map((h) => h.paso.id), ...(estado.revelado ? [estado.paso.id] : [])]);

function Etapa1(estado) {
  const h = hechosDe(estado);
  const netos = Object.fromEntries(Object.entries(MIRADOR).filter(([id]) => h.has(id)).map(([, k]) => [k, AR.netos[k]]));
  return <Arbol netos={netos} actual={MIRADOR[estado.paso.id] ?? null} />;
}

function Etapa2(estado) {
  const h = hechosDe(estado);
  const vme = Object.fromEntries([["c11h07-05", "nueva"], ["c11h07-06", "repotenciar"]].filter(([id]) => h.has(id)).map(([, k]) => [k, AR.vme[k]]));
  return <Arbol netos={AR.netos} vme={vme} />;
}

function Simulador({ valores }) {
  const p = valores.p / 100;
  const nueva = Math.round(1200 * p - 200);
  const rep = Math.round(400 * p + 300);
  const gana = nueva > rep ? "nueva" : rep > nueva ? "repotenciar" : "empate";
  return (
    <Lamina titulo="Las piedras en vivo · VME en millones" data-simulador={`${nueva}-${rep}`}>
      <div className="gp5-barras">
        <BarraH nombre={`Tostadora nueva${gana === "nueva" ? " ★ mayor" : ""}`} valor={Math.max(0, nueva)} texto={cifra(nueva)} max={1000} color="#ffc978" />
        <BarraH nombre={`Repotenciar${gana === "repotenciar" ? " ★ mayor" : ""}`} valor={rep} texto={cifra(rep)} max={1000} color="#a7d8ff" />
      </div>
      <small style={{ display: "block", marginTop: 4 }}>Nueva = 1.200 × p − 200 · Repotenciar = 400 × p + 300</small>
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "montana", fondo: ["#22381f", "#0a120a"], acento: "#b5e48c", luz: "rgba(181,228,140,.16)",
  portada: MONTANA,
  mesa: "tu",
  objeto: { id: POSTE, alto: 64 },
  anim: "abre",
  disposicion: "fila3",
  antes: () => <EstiloLote6 />,
  encima: (e) => <Etapa1 {...e} />,
  etapas: [
    {},
    { objeto: { id: PIEDRA, alto: 56 }, encima: (e) => <Etapa2 {...e} /> },
    { mesa: "patrocinadora", objeto: { id: MONTANA, alto: 64 }, encima: () => <Arbol netos={AR.netos} vme={AR.vme} />, explorar: (x) => <><EstiloLote6 /><Simulador {...x} /></> },
  ],
};

export default function C11H07Montana({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C11_H07} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
