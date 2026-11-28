/*
 * C09 · H04 · Las reglas de la carpa (gp26-pla-c09-h04-pendon, Medio, 25 × 2 FP × %).
 * El pendón de tela colgado en la carpa del equipo, con seis franjas vacías;
 * las tarjetas suben de la canasta y, si van en el acta del equipo, se cosen
 * en la franja siguiente. Si no van, vuelven a la canasta con su retro.
 * Etapa 2: cada respuesta cambia el pendón (firmas, una franja nueva, los
 * voluntarios lo señalan), y solo después de responder.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { colocados } from "../comun/lote2.jsx";
import { EstiloLote5, Lamina } from "../comun/lote5.jsx";
import { GP_C9_H04 } from "./textos-c9.js";

export const ID = GP_C9_H04.id;

// imagen-pendiente: pendon · canasta · aguja-hilo
const PENDON = primero("pendon", "pliego-acta");
const CANASTA = primero("canasta", "bandeja-carton");
const AGUJA = primero("aguja-hilo", "ovillo-hilo");
const CAMBIOS = { firmas: "Las firmas del equipo aparecen al pie.", franja: "Se cose una franja nueva para los que llegan.", senalan: "Los voluntarios señalan el pendón." };

function Pendon(estado) {
  const cosidas = estado.paso.pendon ? [] : colocados(estado).filter((x) => x.destino === "si");
  const franjas = Array.from({ length: 6 }, (_, k) => cosidas[k]?.texto ?? null);
  return (
    <Lamina titulo="Pendón del equipo · acta de constitución" data-cosidas={cosidas.length}>
      {estado.paso.pendon ? (
        <small data-cambio-pendon={estado.encaja ? estado.paso.pendon : "espera"}>{estado.encaja ? CAMBIOS[estado.paso.pendon] : "El pendón ya tiene sus seis franjas cosidas."}</small>
      ) : (
        <div className="gp2-pila" style={{ marginTop: 0 }}>
          {franjas.map((t, k) => <div key={k} className="gp2-caja" data-lleno={t ? "1" : undefined} style={{ minHeight: 28, padding: "4px 8px" }}>{t ?? <small>Franja {k + 1}</small>}</div>)}
        </div>
      )}
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "pendon", fondo: ["#36291f", "#120c08"], acento: "#f2c14e", luz: "rgba(242,193,78,.16)",
  portada: PENDON,
  mesa: "tu",
  objeto: { id: CANASTA, alto: 56 },
  anim: "cae",
  antes: () => <EstiloLote5 />,
  encima: (e) => <Pendon {...e} />,
  destinos: { si: { objeto: AGUJA, alto: 36 }, no: { objeto: CANASTA, alto: 36 } },
};

export default function C09H04Pendon({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C9_H04} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
