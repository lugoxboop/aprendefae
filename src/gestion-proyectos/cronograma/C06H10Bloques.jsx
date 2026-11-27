/*
 * C06 · H10 · La torre de bloques (gp26-pla-c06-h10-bloques, Medio, 25 × 2 FP × %).
 * El histograma hecho con bloques de madera: una columna por día (11 a 17) y
 * cada bloque = 8 h de una actividad, con su nombre. La cinta horizontal marca
 * la capacidad «8 h» con el número escrito. El gerente funcional está junto a
 * la torre; el electricista no es mascota: es un casco con su rol escrito. El
 * aviso se mueve con ◀ ▶ (o escribiendo el día): a 320 px, 7 columnas de 40 px.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { EstiloLote3 as EstiloLote2 } from "../comun/lote3.jsx";
import { numeroDe } from "../comun/motores/Casillas.jsx";
import { GP_C6_H10 } from "./textos-c6.js";

export const ID = GP_C6_H10.id;
const DIAS = [11, 12, 13, 14, 15, 16, 17];

function Torre({ paso, valores, encaja }) {
  const inicio = paso.mueve ? numeroDe(valores?.dia) ?? 12 : encaja && paso.mueve ? 14 : paso.aviso ?? 12;
  const aviso = (d) => d >= inicio && d < inicio + 2;
  const luces = (d) => d >= 11 && d <= 13;
  return (
    <div className="gp2-caja" data-torre={inicio} style={{ marginTop: 10 }}>
      <div className="gp2-fila" style={{ justifyContent: "space-between" }}>
        <span className="gp2-pieza"><Objeto id="casco-electricista" alto={30} /><small>Electricista · 8 h al día</small></span>
        <small className="da26-mono">Caso {paso.caso}</small>
      </div>
      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 40px))", gap: 4, justifyContent: "center", alignItems: "end", height: 132, marginTop: 6 }} aria-hidden="true">
        <span style={{ position: "absolute", left: 0, right: 0, bottom: 52, borderTop: "2px dashed #f4f5f7" }} data-capacidad><small style={{ position: "absolute", right: 0, top: -18 }} className="da26-mono">8 h</small></span>
        {DIAS.map((d) => (
          <div key={d} data-columna={d} data-horas={(luces(d) ? 8 : 0) + (aviso(d) ? 8 : 0)} style={{ display: "grid", gap: 2, alignContent: "end" }}>
            {aviso(d) && <span title="Aviso" style={{ position: "relative" }}><Objeto id="bloque-madera" ancho={40} /><small style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 12, color: "#121418" }}>Aviso</small></span>}
            {luces(d) && <span style={{ position: "relative" }}><Objeto id="bloque-madera" ancho={40} /><small style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 12, color: "#121418" }}>Luces</small></span>}
            <small className="da26-mono" style={{ textAlign: "center", fontSize: 12 }}>{d}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export const ESCENA = {
  nombre: "bloques", fondo: ["#2f2618", "#120e08"], acento: "#e9c46a", luz: "rgba(233,196,106,.2)",
  portada: "bloque-madera",
  mesa: "gerente",
  anim: "cae",
  antes: () => <EstiloLote2 />,
  encima: (e) => <Torre {...e} />,
};

export default function C06H10Bloques({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C6_H10} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
