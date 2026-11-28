/*
 * C09 · H11 · Las estibas del sábado (gp26-moc-c09-h11-estibas, Difícil, 50 × 3 FP × %).
 * Tres estibas en la bodega (vasos, sillas plegables, bolsas de hielo); sobre
 * cada una, la línea punteada del plan y la pila real. La lámina muestra los
 * DATOS del paso (plan y uso real) y deja en «?» lo que el estudiante debe
 * calcular hasta que lo comprueba: la proyección de vasos, la escasez, el
 * sobrante. Etapa 2: los dos platillos con su factura; cada costo aparece al
 * calcularlo. Etapa 3: la estiba vacía de la planta y los seis pasos.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { BarraH, EstiloLote5, Lamina, puntos, resuelto } from "../comun/lote5.jsx";
import { FESTIVAL_C9, GP_C9_H11 } from "./textos-c9.js";

export const ID = GP_C9_H11.id;

// imagen-pendiente: estiba-vasos · estiba-sillas · estiba-hielo · factura · estiba-vacia
const VASOS = primero("estiba-vasos", "caja-paquete");
const SILLAS = primero("estiba-sillas", "silla-oficina");
const HIELO = primero("estiba-hielo", "nevera-barra");
const BALANZA = primero("balanza-brazo");
const VACIA = primero("estiba-vacia", "bandeja-madera");
const F = FESTIVAL_C9;

function Bodega(estado) {
  const { paso } = estado;
  if (!paso.estiba) return null;
  const proyeccion = resuelto(estado, "c9h11-01");
  const escasez = resuelto(estado, "c9h11-02");
  const sobrante = resuelto(estado, "c9h11-03");
  const liberadas = resuelto(estado, "c9h11-04");
  const hielo = resuelto(estado, "c9h11-05");
  return (
    <Lamina titulo="Bodega · plan contra uso real" data-bodega={[proyeccion, escasez, sobrante, liberadas, hielo].map(Number).join("")}>
      <div className="gp5-barras">
        <BarraH nombre="Vasos · plan (3 días)" valor={F.vasos.plan} max={16000} />
        <BarraH nombre="Vasos · usados el día 1" valor={F.vasos.dia1} max={16000} marca={F.vasos.plan} color="#a7d8ff" />
        <BarraH nombre="Vasos · a este ritmo, 3 días" valor={proyeccion ? F.vasos.dia1 * F.vasos.dias : null} max={16000} marca={F.vasos.plan} color="#a7d8ff"
          texto={proyeccion ? `${puntos(F.vasos.dia1 * F.vasos.dias)}${escasez ? ` · faltan ${puntos(F.vasos.dia1 * F.vasos.dias - F.vasos.plan)}` : ""}` : "?"} />
        <BarraH nombre="Sillas · asignadas" valor={F.sillas.plan} max={1000} />
        <BarraH nombre="Sillas · uso máximo real" valor={F.sillas.real} max={1000} marca={F.sillas.plan} color="#a7d8ff"
          texto={`${puntos(F.sillas.real)}${sobrante ? ` · sobran ${F.sillas.plan - F.sillas.real}${liberadas ? ", liberadas" : ""}` : ""}`} />
        <BarraH nombre="Hielo · plan por día" valor={F.hielo.plan} max={800} />
        <BarraH nombre="Hielo · usado" valor={F.hielo.real} max={800} marca={F.hielo.plan} color="#a7d8ff" texto={`${F.hielo.real}${hielo ? " · sin brecha" : ""}`} />
      </div>
    </Lamina>
  );
}

function Platillos(estado) {
  const { paso } = estado;
  if (!paso.platillo) return null;
  const a = resuelto(estado, "c9h11-06");
  const b = resuelto(estado, "c9h11-07");
  return (
    <Lamina titulo="Dos salidas · costo frente a pérdida" data-platillos={`${Number(a)}${Number(b)}`}>
      <div className="gp5-barras">
        <BarraH nombre="A · Pedido urgente" valor={a ? 1 : null} max={6} texto={a ? "$1.000.000" : "?"} color="#9be59b" />
        <BarraH nombre="B · No pedir" valor={b ? 6 : null} max={6} texto={b ? "$6.000.000" : "?"} color="#ffc978" />
      </div>
    </Lamina>
  );
}

function Planta() {
  return (
    <>
      <EstiloLote5 />
      <p className="gp-contexto" data-contexto-paso style={{ marginTop: 0 }}>{GP_C9_H11.etapas[2].pasos[0].contexto}</p>
    </>
  );
}

export const ESCENA = {
  nombre: "estibas", fondo: ["#2a2c30", "#0c0d0f"], acento: "#a7d8ff", luz: "rgba(167,216,255,.14)",
  portada: VASOS,
  mesa: "tu",
  objetoDe: (paso) => ({ id: paso.estiba === "sillas" ? SILLAS : paso.estiba === "hielo" ? HIELO : paso.platillo ? BALANZA : VASOS, alto: 60 }),
  objetos: [VACIA],
  encimaOrden: () => <Planta />,
  anim: "cae",
  antes: () => <EstiloLote5 />,
  encima: (e) => <><Bodega {...e} /><Platillos {...e} /></>,
  etapas: [{}, { mesa: "patrocinadora" }, { mesa: "equipo" }],
};

export default function C09H11Estibas({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C9_H11} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
