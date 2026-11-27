/*
 * C08 · H06 · La espina de pescado (gp26-eje-c08-h06-espina, Medio, 25 × 2 FP × %).
 * El esqueleto de pescado en la pared; la cabeza dice «Cápsulas mal
 * selladas» y sus seis espinas (Material · Entorno · Gestión · Personas ·
 * Proceso · Equipos) son los destinos. El hámster pega notas: al acertar, la
 * nota se pega y la espina se engrosa un poco. Etapa 2: la cadena de
 * porqués; cada nota elegida se cuelga detrás de la anterior.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { cuantos } from "../comun/lote2.jsx";
import { EstiloLote4 } from "../comun/lote4.jsx";
import { GP_C8_H06 } from "./textos-c8.js";

export const ID = GP_C8_H06.id;

// imagen-pendiente: espina-pescado · nota-adhesiva
const PESCADO = primero("espina-pescado", "tablero-corcho");
const NOTA = primero("nota-adhesiva", "ficha-fichero");
const RAMAS = [["material", "Material"], ["entorno", "Entorno"], ["gestion", "Gestión"], ["personas", "Personas"], ["proceso", "Proceso"], ["equipos", "Equipos"]];

function Pescado(estado) {
  const { paso, encaja, etapa } = estado;
  if (paso.porque || paso.id === "c8h06-15") {
    const cadena = (etapa?.hechos ?? []).map((h) => h.paso).filter((p) => p.porque);
    const lista = encaja && paso.porque ? [...cadena, paso] : cadena;
    return (
      <div className="gp2-caja" style={{ marginTop: 10 }} data-porques={lista.length}>
        <b>Cápsulas mal selladas ← ¿por qué?</b>
        <div className="gp2-pila" style={{ marginTop: 0 }}>
          {lista.map((p) => <span key={p.id} className="gp2-fila gp2-entra" style={{ justifyContent: "flex-start", flexWrap: "nowrap" }}><Objeto id={NOTA} alto={22} /><small>{p.destinos.find((d) => d.id === "buena").nombre}</small></span>)}
        </div>
      </div>
    );
  }
  return (
    <div className="gp2-caja" style={{ marginTop: 10 }} data-espinas>
      <b>Cabeza: cápsulas mal selladas</b>
      <div className="gp2-rejilla">
        {RAMAS.map(([k, n]) => {
          const c = cuantos(estado, k);
          return <span key={k} className="gp2-pieza" data-espina={k} data-notas={c}><span style={{ display: "block", width: "100%", height: 3 + c * 3, borderRadius: 2, background: "#f4f5f7" }} /><small>{n} · {c}</small></span>;
        })}
      </div>
    </div>
  );
}

export const ESCENA = {
  nombre: "espina", fondo: ["#1e2d33", "#0a1013"], acento: "#a7d8ff", luz: "rgba(167,216,255,.16)",
  portada: PESCADO,
  mesa: "equipo",
  objeto: { id: PESCADO, alto: 72 },
  anim: "sella",
  disposicion: "tablero",
  antes: () => <EstiloLote4 />,
  encima: (e) => <Pescado {...e} />,
  etapas: [{}, { disposicion: "columna", mesa: "tu" }],
};

export default function C08H06Espina({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C8_H06} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
