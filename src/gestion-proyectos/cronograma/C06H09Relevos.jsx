/*
 * C06 · H09 · La pista de relevos (gp26-pla-c06-h09-relevos, Difícil, 50 × 2 FP × %).
 * La pista de atletismo con cuatro carriles (las cuatro rutas de la red); en
 * cada carril corre el equipo pasándose el testigo. El carril 1 (ruta crítica)
 * llega último a la meta «Día 23». El marcador muestra los días de cada carril
 * y el costo extra acumulado: comprar en una actividad sin holgura acorta el
 * carril 1; comprar en E o G acorta su carril, pero la meta sigue en 23. A 320
 * px la pista va en vertical y la tabla de compra como tarjetas.
 * Etapa 2: la zona de relevo, dos corredores juntos un tramo (ejecución rápida).
 */
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { EstiloLote3 as EstiloLote2 } from "../comun/lote3.jsx";
import { GP_C6_H09, LINEAS_C6, COMPRA_C6, RED_C6 } from "./textos-c6.js";

export const ID = GP_C6_H09.id;

/* Días de cada carril con las compras hechas (una compra = un día menos en esa actividad). */
export function carriles(compras) {
  const menos = compras.reduce((m, id) => ({ ...m, [id]: (m[id] ?? 0) + 1 }), {});
  const dur = (id) => RED_C6.find((a) => a.id === id).dur - (menos[id] ?? 0);
  return LINEAS_C6.map((l) => ({ ...l, dias: l.ruta.reduce((s, id) => s + dur(id), 0) }));
}

function Pista(estado) {
  const { paso, encaja } = estado;
  if (!paso.compra) {
    if (!paso.texto || paso.destinos.length !== 3) return null;
    return (
      <div className="gp-escenita" data-zona-relevo>
        <span className="gp2-fila"><Objeto id="testigo-relevos" alto={30} /><Objeto id="testigo-relevos" alto={30} /></span>
        <small>{paso.globo ?? "Dos corredores juntos un tramo: la sucesora empieza antes."}</small>
      </div>
    );
  }
  const compras = (estado.etapa?.hechos ?? []).filter((h) => h.paso.compra && h.paso.compra < 4).map((h) => h.destino);
  if (encaja && paso.compra < 4) compras.push(encaja);
  const tabla = carriles(compras);
  const meta = Math.max(...tabla.map((c) => c.dias));
  const costo = compras.reduce((s, id) => s + COMPRA_C6.find((c) => c.id === id).costo, 0);
  return (
    <div className="gp2-caja" data-pista data-meta={meta} style={{ marginTop: 10 }}>
      <div className="gp2-pila" style={{ marginTop: 0 }}>
        {tabla.map((c) => (
          <div key={c.id} data-carril={c.id} style={{ display: "grid", gridTemplateColumns: "64px minmax(0, 1fr) 48px", gap: 6, alignItems: "center" }}>
            <small>{c.nombre.replace("Línea", "Carril")}</small>
            <span className="gp2-medidor"><span style={{ transform: `scaleX(${c.dias / 23})`, "--gp2-relleno": c.id === "l1" ? "#e76f8a" : "#ffc978" }} /></span>
            <small className="da26-mono">{c.dias} d</small>
          </div>
        ))}
      </div>
      <p className="gp-escenita" style={{ marginBottom: 0 }}>
        <span className="gp-chip-c" data-meta-dia>Meta: día {meta}</span>
        <small className="da26-mono" data-costo>Extra: ${costo.toFixed(1).replace(".", ",")} millones</small>
      </p>
    </div>
  );
}

export const ESCENA = {
  nombre: "relevos", fondo: ["#3a2018", "#140a07"], acento: "#f4845f", luz: "rgba(244,132,95,.2)",
  portada: "pista-atletismo",
  mesa: "patrocinadora",
  objeto: { id: "pista-atletismo", alto: 72, lugar: "detras" },
  anim: "cae",
  disposicion: "columna",
  antes: () => <EstiloLote2 />,
  encima: (e) => <Pista {...e} />,
  etapas: [{}, { mesa: "pmo", objeto: { id: "testigo-relevos", alto: 56 }, disposicion: "fila3" }],
};

export default function C06H09Relevos({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C6_H09} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
