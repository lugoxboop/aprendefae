/*
 * C08 · H10 · La credencial del auditor (gp26-eje-c08-h10-auditoria, Medio, 25 FP × %).
 * El plano de la planta visto desde arriba, con zonas que se iluminan una por
 * decisión; en primer plano, la credencial de auditor con cordón y linterna.
 * La PMO, con la credencial, hace el recorrido junto al zorro. Cada decisión
 * mueve algo en el plano (la credencial cambia de manos, se enciende una
 * zona, aparece el sello de «verificado», una carpeta viaja al archivo de
 * lecciones). Si la decisión no es la mejor, la PMO la objeta con la retro y
 * se vuelve a decidir sin puntaje.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { EstiloLote4 } from "../comun/lote4.jsx";
import { GP_C8_H10 } from "./textos-c8.js";

export const ID = GP_C8_H10.id;

// imagen-pendiente: credencial · plano-planta (linterna ya existe)
const CREDENCIAL = primero("credencial", "sobre-boleto");
const LINTERNA = primero("linterna");
const PLANO = primero("plano-planta", "mapa-plegable");
const ZONAS = ["Recepción", "Empaque", "Selladora", "Archivo de lecciones"];

function Planta({ paso, encaja }) {
  const hasta = (paso.zona ?? 1) - (encaja ? 0 : 1);
  return (
    <div className="gp2-caja" style={{ marginTop: 10 }} data-zonas={hasta}>
      <b>Plano de la planta</b>
      <div className="gp2-rejilla" style={{ "--gp2-cols": 2 }}>
        {ZONAS.map((z, k) => (
          <span key={z} className="gp2-pieza gp2-gira" data-zona={k + 1} style={{ padding: 6, borderRadius: 8, border: "1px solid rgba(244,245,247,.3)", background: k < hasta ? "rgba(255,201,120,.28)" : "transparent" }}>
            <small>{k < hasta ? "✓ " : ""}{z}</small>
          </span>
        ))}
      </div>
      <div className="gp2-fila" style={{ justifyContent: "flex-start", marginTop: 6 }}>
        <Objeto id={CREDENCIAL} alto={32} /><Objeto id={LINTERNA} alto={28} />
        <small>{hasta >= 1 ? "La credencial la lleva la PMO." : "¿A quién le das la credencial?"}</small>
      </div>
    </div>
  );
}

export const ESCENA = {
  nombre: "auditoria", fondo: ["#1f2633", "#0a0c11"], acento: "#ffc978", luz: "rgba(255,201,120,.16)",
  portada: CREDENCIAL,
  mesa: "pmo",
  objeto: { id: PLANO, alto: 64 },
  anim: "cae",
  disposicion: "columna",
  antes: () => <EstiloLote4 />,
  encima: (e) => <Planta {...e} />,
};

export default function C08H10Auditoria({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C8_H10} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
