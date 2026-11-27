/*
 * C05 · H06 · La alacena de requisitos (gp26-pla-c05-h06-alacena, Medio, 25 × 2 FP × %).
 * Etapa 1: la alacena de madera con siete frascos rotulados; Funcional y No
 * funcional comparten la repisa «Solución» (se ve la jerarquía). El requisito
 * es una etiqueta de papel: al acertar se pega en su frasco y el frasco se
 * llena un poco. Etapa 2: dos etiquetas frente al frasco; la medible se pega,
 * la vaga se arruga y cae.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { Barra, cuantos } from "../comun/lote2.jsx";
import { EstiloLote3 as EstiloLote2 } from "../comun/lote3.jsx";
import { GP_C5_H06 } from "./textos-c5.js";

export const ID = GP_C5_H06.id;

const REPISAS = [
  { nombre: null, frascos: [["negocio", "Negocio"], ["interesados", "Interesados"]] },
  { nombre: "Solución", frascos: [["funcional", "Funcional"], ["nofuncional", "No funcional"]] },
  { nombre: null, frascos: [["transicion", "Transición"], ["proyecto", "Proyecto"], ["calidad", "Calidad"]] },
];

function Alacena(estado) {
  if (!estado.paso.texto) {
    const { encaja } = estado;
    return (
      <div className="gp2-fila" style={{ marginTop: 10 }} data-etiquetas-par>
        <Objeto id="frasco-etiqueta" alto={64} />
        <small>{encaja ? "Se pega la medible; la vaga se arruga y cae." : "¿Cuál se puede comprobar?"}</small>
      </div>
    );
  }
  return (
    <div className="gp2-pila" data-alacena>
      {REPISAS.map((r, k) => (
        <div key={k} className="gp2-caja" data-repisa={r.nombre ?? k}>
          {r.nombre && <b>{r.nombre}</b>}
          <div className="gp2-rejilla" style={{ "--gp2-cols": r.frascos.length, marginTop: 0 }}>
            {r.frascos.map(([id, n]) => (
              <div key={id} className="gp2-pieza" data-frasco={id}>
                <span className={estado.encaja === id ? "gp2-entra" : ""}><Objeto id="frasco-etiqueta" alto={34} /></span>
                <Barra nombre={n} valor={Math.min(1, cuantos(estado, id) / 2)} relleno="#f2c14e" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export const ESCENA = {
  nombre: "alacena", fondo: ["#3a2a1c", "#140d07"], acento: "#f2c14e", luz: "rgba(242,193,78,.2)",
  portada: "alacena",
  objeto: { id: "alacena", alto: 80, lugar: "detras" },
  anim: "cae",
  disposicion: "rejilla",
  antes: () => <EstiloLote2 />,
  encima: (e) => <Alacena {...e} />,
  destinos: { "*": { objeto: "frasco-etiqueta", alto: 28 } },
  etapas: [{}, { disposicion: "columna", destinos: {} }],
};

export default function C05H06Alacena({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C5_H06} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
