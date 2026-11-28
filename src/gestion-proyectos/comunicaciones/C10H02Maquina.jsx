/*
 * C10 · H02 · La máquina de las 5C (gp26-eje-c10-h02-maquina, Medio, 25 FP × %).
 * La máquina de escribir antigua con la hoja del anuncio saliendo (el texto
 * es HTML encima) y, debajo, cinco teclas redondas grandes: Correcto ·
 * Conciso · Claro · Coherente · Controlado. Cada fragmento con falla es la
 * tarjeta; la tecla correcta lo sella en la hoja con su C (la hoja solo
 * lleva los fragmentos ya revisados). El practicante espera a un lado.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { colocados } from "../comun/lote2.jsx";
import { EstiloLote5, Lamina } from "../comun/lote5.jsx";
import { GP_C10_H02 } from "./textos-c10.js";

export const ID = GP_C10_H02.id;

// imagen-pendiente: maquina-escribir · tecla-redonda
const MAQUINA = primero("maquina-escribir", "monton-hojas");
const NOMBRES = Object.fromEntries(GP_C10_H02.etapas[0].destinos.map((d) => [d.id, d.nombre]));

function Hoja(estado) {
  if (!estado.paso.texto) return null;
  const hechos = colocados(estado);
  return (
    <Lamina titulo="Anuncio para las tiendas aliadas · revisado" data-revisados={hechos.length}>
      {hechos.length === 0 ? <small>Aún no revisas ningún fragmento.</small> : hechos.map((x) => <small key={x.id} style={{ display: "block" }}>✓ {NOMBRES[x.destino]} · {x.texto}</small>)}
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "maquina", fondo: ["#2c2c2c", "#0e0e0e"], acento: "#f4d58d", luz: "rgba(244,213,141,.14)",
  portada: MAQUINA,
  mesa: "practicante",
  objeto: { id: MAQUINA, alto: 64 },
  anim: "sella",
  sello: true,
  antes: () => <EstiloLote5 />,
  encima: (e) => <Hoja {...e} />,
};

export default function C10H02Maquina({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C10_H02} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
