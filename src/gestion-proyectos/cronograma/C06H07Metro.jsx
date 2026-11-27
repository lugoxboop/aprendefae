/*
 * C06 · H07 · El metro de la ruta crítica (gp26-pla-c06-h07-metro, Difícil, 50 × 3 FP × %).
 * El mapa de metro: cada actividad es una estación con su letra y duración;
 * cada ruta, una línea de color Y NÚMERO (Línea 1 a 4). Salida «Inicio» y
 * llegada «Inauguración»; el zorro y la patrocinadora miran desde el andén.
 * A 320 px se muestra línea por línea (etapa 1) y estación por estación
 * (etapas 2 y 3): la activa en grande y sus vecinas como miniaturas con sus
 * números. Etapa 2 es un ejemplo resuelto que se desvanece: A, B, C y G ya
 * vienen llenas. Nota fija: el día 0 es el inicio.
 */
import { TrainFront } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { EstiloLote3 as EstiloLote2 } from "../comun/lote3.jsx";
import { GP_C6_H07, RED_C6, LINEAS_C6 } from "./textos-c6.js";

export const ID = GP_C6_H07.id;
const COLOR = { l1: "#e76f8a", l2: "#f2c14e", l3: "#7fd1c7", l4: "#a7bbff" };
const act = (id) => RED_C6.find((x) => x.id === id);

function Estacion({ id, datos, grande = false }) {
  const a = act(id);
  return (
    <div className="gp2-caja" data-estacion={id} style={{ textAlign: "center", padding: grande ? "8px 10px" : "4px 6px" }}>
      <b style={{ margin: 0, fontSize: grande ? 16 : 12 }}>{id} · {a.dur} d</b>
      {datos && <small className="da26-mono">{datos}</small>}
    </div>
  );
}

function Linea({ l, gruesa }) {
  return (
    <div className="gp2-fila" style={{ justifyContent: "flex-start", gap: 4 }} data-linea={l.id} data-gruesa={gruesa ? "1" : undefined}>
      <span className="gp-chip-c" style={{ background: COLOR[l.id] }}>{l.nombre}</span>
      {l.ruta.map((s, k) => (
        <span key={s} className="gp2-fila" style={{ gap: 4 }}>
          {k > 0 && <span aria-hidden="true" style={{ width: 10, height: gruesa ? 6 : 3, background: COLOR[l.id], borderRadius: 3 }} />}
          <span className="da26-mono" style={{ fontSize: 14 }}>{s}</span>
        </span>
      ))}
    </div>
  );
}

function Mapa(estado) {
  const { paso, encaja } = estado;
  if (paso.linea) {
    const l = LINEAS_C6.find((x) => x.id === paso.linea);
    return (
      <div className="gp2-caja" data-mapa-linea={l.id} style={{ marginTop: 10 }}>
        <Linea l={l} />
        <small className="da26-mono">{l.ruta.map((s) => act(s).dur).join(" + ")} = {encaja ? l.suma : "?"} · el día 0 es el inicio</small>
      </div>
    );
  }
  if (paso.id === "c6h07-ruta") {
    return (
      <div className="gp2-pila" data-mapa-completo>
        {LINEAS_C6.map((l) => <Linea key={l.id} l={l} gruesa={encaja && l.id === "l1"} />)}
        {encaja && <span className="gp-chip-c gp2-entra" data-inauguracion>Inauguración: día 23</span>}
      </div>
    );
  }
  if (paso.estacion) {
    const a = act(paso.estacion);
    const despues = RED_C6.filter((x) => x.pre.includes(a.id));
    const dato = (x) => (paso.sentido === "adelante" ? `ES ${x.es} · EF ${x.ef}` : `LS ${x.ls} · LF ${x.lf}`);
    return (
      <div className="gp2-caja" data-estacion-activa={a.id} style={{ marginTop: 10 }}>
        <div className="gp2-rejilla" style={{ "--gp2-cols": 3, marginTop: 0, alignItems: "center" }}>
          <div className="gp2-pila" style={{ marginTop: 0 }}>{(paso.sentido === "adelante" ? a.pre : []).map((p) => <Estacion key={p} id={p} datos={dato(act(p))} />)}</div>
          <Estacion id={a.id} grande datos={encaja ? dato(a) : "?"} />
          <div className="gp2-pila" style={{ marginTop: 0 }}>{(paso.sentido === "atras" ? despues : []).map((p) => <Estacion key={p.id} id={p.id} datos={dato(p)} />)}</div>
        </div>
        <small>{paso.sentido === "adelante" ? "Ya vienen llenas: A (0–3), B (3–8), C (3–11), G (3–10)." : "La ruta crítica viene llena: holgura 0. Empieza desde I (LF = 23)."}</small>
      </div>
    );
  }
  return null;
}

export const ESCENA = {
  nombre: "metro", fondo: ["#1c2230", "#0a0c12"], acento: "#e76f8a", luz: "rgba(231,111,138,.18)",
  portada: "anden-metro",
  mesa: "patrocinadora",
  objeto: { id: "anden-metro", alto: 64, lugar: "detras" },
  anim: "conecta",
  disposicion: "columna",
  antes: () => <EstiloLote2 />,
  encima: (e) => <Mapa {...e} />,
  destinos: { "*": { icono: TrainFront } },
};

export default function C06H07Metro({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C6_H07} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
