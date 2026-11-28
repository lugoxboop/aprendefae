/*
 * C05 · H07 · El telar de la trazabilidad (gp26-pla-c05-h07-telar, Difícil, 50 FP × %).
 * El telar de madera con sus cuatro columnas de clavijas: Objetivo de negocio ·
 * Requisito · Entregable de la EDT · Caso de prueba. A 320 px las columnas
 * pasan a bandas apiladas: el requisito arriba y, debajo, sus tres hilos (las
 * tres casillas). Fila completa = esa franja de tela queda tejida (✓ y textura,
 * no solo color). Después, los dos hilos sueltos y el estado de cada requisito.
 * La PMO mira desde un lado.
 */
import { CircleCheck, Pause, Ban, HelpCircle, Trash2 } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { EstiloLote3 as EstiloLote2 } from "../comun/lote3.jsx";
import { GP_C5_H07 } from "./textos-c5.js";

export const ID = GP_C5_H07.id;

const TELA = "repeating-linear-gradient(45deg, rgba(244,245,247,.55) 0 4px, rgba(244,245,247,.15) 4px 8px)";

/* Las franjas ya tejidas en la etapa (más la que entra ahora). */
function Tela(estado) {
  const filas = (estado.etapa?.hechos ?? []).filter((h) => h.paso.fila).map((h) => h.paso.fila);
  if (estado.paso.fila && estado.encaja) filas.push(estado.paso.fila);
  return (
    <div className="gp2-caja" data-tela={filas.length} style={{ marginTop: 10 }}>
      <b>Tela tejida · {filas.length} de 4</b>
      <div className="gp2-pila" style={{ marginTop: 0 }}>
        {["R1", "R2", "R3", "R4"].map((r) => (
          <div key={r} className="gp2-fila" style={{ justifyContent: "flex-start" }} data-franja={r} data-tejida={filas.includes(r) ? "1" : undefined}>
            <small className="da26-mono" style={{ width: 24 }}>{r}</small>
            <span style={{ flex: 1, height: 12, borderRadius: 4, background: filas.includes(r) ? TELA : "rgba(244,245,247,.12)" }} />
            <small style={{ width: 16 }}>{filas.includes(r) ? "✓" : ""}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export const ESCENA = {
  nombre: "telar", fondo: ["#2c2418", "#100c06"], acento: "#e6b980", luz: "rgba(230,185,128,.22)",
  portada: "telar",
  mesa: "pmo",
  objetoDe: (paso) => (paso.suelto ? { id: "ovillo-hilo", alto: 60 } : { id: "telar", alto: 84, lugar: "detras" }),
  anim: "conecta",
  antes: () => <EstiloLote2 />,
  encima: (e) => <Tela {...e} />,
  destinos: { completado: { icono: CircleCheck }, aplazado: { icono: Pause }, cancelado: { icono: Ban }, valor: { icono: HelpCircle }, quitar: { icono: Trash2 } },
};

export default function C05H07Telar({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C5_H07} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
