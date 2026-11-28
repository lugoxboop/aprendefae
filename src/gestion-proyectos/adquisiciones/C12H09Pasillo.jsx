/*
 * C12 · H09 · El pasillo de la reclamación (gp26-moc-c12-h09-reclamacion, Medio, 25 FP × %).
 * El pasillo de oficinas en perspectiva con tres puertas en fila: 1 Negociar
 * (mesa con dos tazas), 2 Resolución alternativa (ADR, tres sillas, la del
 * medio para un tercero neutral) y 3 Apelación (puerta alta con columnas, al
 * fondo). El zorro entra por el extremo; cada decisión correcta lo deja ante
 * la puerta justa (la marca «aquí estás» aparece SOLO después de acertar);
 * avanzar de más alarga y oscurece el pasillo con su retro. El instalador es
 * un casco con su globo.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote6, Lamina } from "../comun/lote6.jsx";
import { GP_C12_H09 } from "./textos-c12.js";

export const ID = GP_C12_H09.id;

// imagen-pendiente: pasillo-puertas · mesa-tazas · puerta-columnas (puerta-oficina, silla-oficina y casco-electricista ya existen)
const PASILLO = primero("pasillo-puertas", "puerta-oficina");
const CASCO = primero("casco-electricista");
const PUERTAS = ["Negociar", "Resolución alternativa (ADR)", "Apelación"];

function Pasillo(estado) {
  const hechas = [...(estado.etapa?.hechos ?? []).map((h) => h.paso), ...(estado.encaja ? [estado.paso] : [])];
  const en = Math.max(0, ...hechas.map((p) => p.puerta ?? 0));
  const deMas = !estado.encaja && estado.ultimo === "otra1" && estado.paso.puerta;
  return (
    <Lamina titulo={deMas ? "El pasillo se alarga y se oscurece" : "El pasillo · tres puertas"} data-pasillo={en}>
      <div className="gp5-chips">
        <span className="gp5-chip" data-on={en === 0 ? "1" : undefined}>Entrada{en === 0 ? " · aquí estás" : ""}</span>
        {PUERTAS.map((n, k) => <span key={n} className="gp5-chip" data-puerta={k + 1} data-on={en === k + 1 ? "1" : undefined}>{k + 1} {n}{en === k + 1 ? " · aquí estás" : ""}</span>)}
      </div>
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "pasillo", fondo: ["#2a2622", "#0d0b0a"], acento: "#d4a373", luz: "rgba(212,163,115,.16)",
  portada: PASILLO,
  mesa: "tu",
  objeto: { id: CASCO, alto: 56 },
  anim: "abre",
  disposicion: "columna",
  antes: () => <EstiloLote6 />,
  encima: (e) => <Pasillo {...e} />,
};

export default function C12H09Pasillo({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C12_H09} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
