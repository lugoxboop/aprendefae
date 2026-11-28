/*
 * C13 · H05 · La casa de guadua (gp26-ini-c13-h05-direccion, Medio, 25 FP × %).
 * La casa de guadua de dos pisos en corte, con el zorro en la sala del centro
 * (el proyecto). Cuatro zonas con flecha y texto: Ascendente (el piso de
 * arriba) · Lateral (el cuarto de al lado) · Hacia afuera (el patio y la
 * calle) · Descendente (el sótano, donde trabaja el equipo). Al acertar, el
 * interesado entra en su zona y se enciende la luz de esa parte (forma +
 * texto); las zonas vacías siguen apagadas.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote7, Lamina, colocados } from "../comun/lote7.jsx";
import { GP_C13_H05, ZONAS_C13 } from "./textos-c13.js";

export const ID = GP_C13_H05.id;

// imagen-pendiente: casa-guadua
const CASA = primero("casa-guadua", "casa-anden");

const zona = (id) => ZONAS_C13.find((z) => z.id === id);

function Corte(estado) {
  const puestas = colocados(estado);
  const Parte = ({ id, ancho = false }) => {
    const z = zona(id);
    const en = puestas.filter((x) => x.destino === id);
    return (
      <div data-zona={id} data-luz={en.length ? "1" : undefined} data-ancho={ancho ? "1" : undefined}>
        <b>{z.flecha} {z.nombre}</b>
        <span>{z.pista}</span>
        {en.map((x) => <span key={x.id}>· {x.texto.replace(/[«»]/g, "")}</span>)}
      </div>
    );
  };
  return (
    <Lamina titulo="La casa en corte">
      <div className="gp7-casa">
        <Parte id="ascendente" ancho />
        <div data-zona="proyecto"><b>Sala · el proyecto</b><span>Tú diriges la planta</span></div>
        <Parte id="lateral" />
        <Parte id="afuera" ancho />
        <Parte id="descendente" ancho />
      </div>
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "casa", fondo: ["#2f2a1a", "#100e07"], acento: "#ffc978", luz: "rgba(255,201,120,.16)",
  portada: CASA,
  mesa: "tu",
  objeto: { id: CASA, alto: 60 },
  anim: "abre",
  antes: () => <EstiloLote7 />,
  encima: (e) => <Corte {...e} />,
};

export default function C13H05Casa({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C13_H05} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
