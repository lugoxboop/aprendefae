/*
 * C13 · H03 · La carpeta de tres argollas (gp26-ini-c13-h03-registro, Medio, 25 × 2 FP × %).
 * La carpeta abierta sobre una mesa del salón comunal, con tres separadores:
 * Identificación · Evaluación · Clasificación. Cada dato llega como hoja
 * perforada; al ponerla bien, las argollas se abren, la hoja entra detrás de
 * su separador y la lámina la cuenta (nunca antes). El perro (PMO) mira por
 * encima y hace los tres microdesafíos de la etapa 2.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote7, Lamina, colocados } from "../comun/lote7.jsx";
import { GP_C13_H03, SECCIONES_C13 } from "./textos-c13.js";

export const ID = GP_C13_H03.id;

// imagen-pendiente: carpeta-argollas · separador · hoja-perforada
const CARPETA = primero("carpeta-argollas", "carpeta-abierta");
const SEPARADOR = primero("separador", "ficha-colgante");

function Separadores(estado) {
  const puestas = colocados(estado);
  return (
    <Lamina titulo="Registro de interesados · Junta de Acción Comunal">
      <div style={{ display: "grid", gap: 4 }} data-separadores={puestas.length}>
        {SECCIONES_C13.map((s) => {
          const hojas = puestas.filter((x) => x.destino === s.id);
          return (
            <small key={s.id} data-separador={s.id} style={{ display: "block" }}>
              <b>{s.nombre}</b>{hojas.length ? ` · ${hojas.map((x) => x.texto.replace(/[«»]/g, "")).join(" · ")}` : " · sin hojas"}
            </small>
          );
        })}
      </div>
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "carpeta", fondo: ["#2c2a3a", "#0d0c14"], acento: "#c3b4ff", luz: "rgba(195,180,255,.16)",
  portada: CARPETA,
  mesa: "tu",
  objeto: { id: CARPETA, alto: 64 },
  anim: "abre",
  antes: () => <EstiloLote7 />,
  encima: (e) => <Separadores {...e} />,
  destinos: { "*": { objeto: SEPARADOR, alto: 36 } },
  etapas: [{}, { mesa: "pmo", encima: null }],
};

export default function C13H03Carpeta({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C13_H03} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
