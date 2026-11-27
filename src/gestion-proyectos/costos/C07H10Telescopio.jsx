/*
 * C07 · H10 · El telescopio del final (gp26-moc-c07-h10-telescopio, Difícil, 50 × 3 FP × %).
 * El telescopio de bronce en la azotea de la bodega en obra apunta al letrero
 * lejano «Fin de obra», donde aparece la cifra pronosticada. Al lado, la placa
 * fija con los datos (BAC 1.200 · PV 400 · EV 300 · AC 375 · CPI 0,80 ·
 * SPI 0,75). Etapa 1: las tarjetas de fórmula se encajan en el ocular. Etapa
 * 2: el telescopio enfoca y el letrero muestra la EAC. Etapa 3: el caso del
 * acero (EAC 1.500), con ETC y VAC.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { EstiloLote4, miles, numeroDeTexto } from "../comun/lote4.jsx";
import { GP_C7_H10 } from "./textos-c7.js";

export const ID = GP_C7_H10.id;

// imagen-pendiente: telescopio · azotea-obra · placa-datos (cartel-obra ya existe)
const TELESCOPIO = primero("telescopio", "binoculares");
const AZOTEA = primero("azotea-obra", "andamio");
const LETRERO = primero("cartel-obra");

function Azotea({ paso, encaja, valores }) {
  const v = paso.tipo === "casillas" ? (encaja ? paso.casillas[0].clave : numeroDeTexto(valores?.[paso.casillas[0].id])) : null;
  const enfoca = paso.tipo === "casillas" && encaja;
  return (
    <>
      <div className="gp2-caja da26-mono" style={{ marginTop: 10, fontSize: 13 }} data-placa>
        <b>Placa de datos</b>
        BAC 1.200 · PV 400 · EV 300 · AC 375 · CPI 0,80 · SPI 0,75
      </div>
      <div className="gp-escenita" data-letrero={enfoca ? "enfocado" : "borroso"}>
        <span className="gp2-pieza"><Objeto id={AZOTEA} alto={40} /><small>Azotea</small></span>
        <span className="gp2-gira" style={{ display: "block", transform: enfoca ? "rotate(-4deg)" : "none" }}><Objeto id={TELESCOPIO} alto={44} /></span>
        <span className="gp2-pieza" style={{ opacity: enfoca ? 1 : 0.7 }}>
          <Objeto id={LETRERO} alto={40} />
          <small className="da26-mono" data-cifra-final>Fin de obra{v != null ? `: ${miles(v)}` : ""}</small>
        </span>
      </div>
    </>
  );
}

export const ESCENA = {
  nombre: "telescopio", fondo: ["#1c2433", "#090c12"], acento: "#e9c46a", luz: "rgba(233,196,106,.16)",
  portada: TELESCOPIO,
  mesa: "tu",
  objeto: { id: TELESCOPIO, alto: 80 },
  anim: "sella",
  disposicion: "columna",
  antes: () => <EstiloLote4 />,
  encima: (e) => <Azotea {...e} />,
  etapas: [{}, { mesa: "patrocinadora" }, { mesa: "patrocinadora" }],
};

export default function C07H10Telescopio({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C7_H10} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
