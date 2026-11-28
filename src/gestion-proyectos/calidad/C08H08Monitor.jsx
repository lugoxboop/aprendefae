/*
 * C08 · H08 · La pantalla de la selladora (gp26-moc-c08-h08-monitor, Difícil, 50 × 2 FP × %).
 * La selladora con su monitor industrial; en la pantalla, el diagrama de
 * control a mano con los datos exactos: cuatro límites (6,0 · 5,8 · 5,2 ·
 * 5,0) y la media 5,5, que se distinguen por trazo y llevan su cifra escrita
 * a la derecha (14 px). En la etapa 1 se resalta la línea que se nombra.
 * Etapa 2: tres palancas en la selladora y la pantalla de cada turno; al
 * decidir, la línea sigue, se enciende la baliza o se aparta una caja.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { EstiloLote4, DiagramaControl } from "../comun/lote4.jsx";
import { GP_C8_H08 } from "./textos-c8.js";

export const ID = GP_C8_H08.id;

// imagen-pendiente: selladora · baliza (caja-paquete ya existe)
const SELLADORA = primero("selladora", "despulpadora");
const BALIZA = primero("baliza", "semaforo");
const CAJA = primero("caja-paquete");
const MUESTRA = [5.4, 5.6, 5.5, 5.3, 5.7, 5.5];

function Monitor({ paso, encaja }) {
  if (paso.grupo || (!paso.linea && !paso.turno && paso.id !== "c8h08-14")) {
    return <div className="gp4-lamina" data-monitor="terminos"><DiagramaControl puntos={MUESTRA} alto={140} /></div>;
  }
  const consecuencia = paso.turno && encaja ? { seguir: null, investigar: BALIZA, separar: CAJA }[paso.clave] : null;
  return (
    <div className="gp4-lamina" data-monitor={paso.turno ?? "limites"}>
      <b>Peso por cápsula (g){paso.turno ? ` · turno ${paso.turno}` : ""}</b>
      <DiagramaControl puntos={paso.puntos ?? MUESTRA} resaltar={paso.linea ?? null} />
      {paso.turno && encaja && (
        <div className="gp2-fila gp2-entra" style={{ justifyContent: "flex-start" }} data-consecuencia={paso.clave}>
          {consecuencia ? <Objeto id={consecuencia} alto={36} /> : <small>La selladora sigue trabajando.</small>}
        </div>
      )}
    </div>
  );
}

export const ESCENA = {
  nombre: "monitor", fondo: ["#1b2a2a", "#080f0f"], acento: "#9be59b", luz: "rgba(155,229,155,.16)",
  portada: SELLADORA,
  mesa: "gerente",
  objeto: { id: SELLADORA, alto: 72 },
  anim: "cae",
  disposicion: "rejilla",
  antes: () => <EstiloLote4 />,
  encima: (e) => <Monitor {...e} />,
  etapas: [{}, { mesa: "tu", disposicion: "columna", destinos: { "*": { forma: "palanca" } } }],
};

export default function C08H08Monitor({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C8_H08} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
