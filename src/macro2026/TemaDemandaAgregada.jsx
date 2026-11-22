/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MACRO 2026 · T1 DEMANDA AGREGADA, LO PUBLICADO
 *
 * La mitad Aprender del tema tal como la ven los estudiantes: SOLO las piezas
 * anotadas en PUBLICADAS_T1 y declaradas en subjects.js. Lo que no está
 * publicado no se carga ni se enlaza desde aquí; sigue en la vista previa por
 * dirección, que esta vista no nombra.
 *
 * Una Aprender no da FP ni tiene fila en el catálogo del servidor, así que
 * terminar una pieza no escribe nada: se ofrece la siguiente.
 *
 * Rutas: #/demanda-agregada/aprender (la lista) y
 * #/demanda-agregada/aprender/<id> (una pieza).
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { lazy, Suspense, useState } from "react";
import { piezasPublicadasT1, estaPublicada, piezaT1, TEMA } from "./demanda-agregada/catalogo.js";
import { serializar } from "../ruta.js";
import { Raiz, Boton } from "./comun/ui.jsx";
import { FONDO, INK, INK_2 } from "./comun/colores-da.js";

/* Solo las seis Aprender: una Hacer sin publicar no entra en este paquete. */
const APRENDER = {
  "da26-a1-carrito": lazy(() => import("./demanda-agregada/A1Carrito.jsx")),
  "da26-a2-vaso-renta": lazy(() => import("./demanda-agregada/A2VasoRenta.jsx")),
  "da26-a3-columpio-tasa": lazy(() => import("./demanda-agregada/A3ColumpioTasa.jsx")),
  "da26-a4-no-miran-renta": lazy(() => import("./demanda-agregada/A4NoMiranRenta.jsx")),
  "da26-a5-bisagra-ascensor": lazy(() => import("./demanda-agregada/A5BisagraAscensor.jsx")),
  "da26-a6-eco-multiplicador": lazy(() => import("./demanda-agregada/A6EcoMultiplicador.jsx")),
};

/* Las piezas que se ven: publicadas, de Aprender y con componente. */
export const piezasVisibles = () => piezasPublicadasT1().filter((p) => p.tipo === "aprender" && APRENDER[p.id]);

const ir = (id) => { window.location.hash = serializar(TEMA, "aprender", id ?? null) || "#/"; };

function Lista() {
  const piezas = piezasVisibles();
  return (
    <div className="da26-tarjeta" data-tema-publicado={TEMA}>
      <p className="da26-rotulo da26-mono" style={{ margin: 0 }}>MACROECONOMÍA · APRENDER</p>
      <h1 style={{ font: "700 22px/28px var(--planck-font-sans, system-ui)", margin: "6px 0 12px" }}>Demanda agregada</h1>
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
        {piezas.map((p, k) => (
          <li key={p.id}>
            <button type="button" className="da26-boton" data-abrir={p.id} onClick={() => ir(p.id)}
              style={{ width: "100%", minHeight: 44, display: "flex", gap: 10, alignItems: "center", textAlign: "left", borderRadius: 12 }}>
              <span className="da26-mono" style={{ color: INK_2, width: 22, flex: "none" }}>{k + 1}</span>
              <span style={{ flex: 1 }}>{p.nombre}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Pieza({ id }) {
  const pieza = piezaT1(id);
  const Componente = APRENDER[id];
  const [intento, setIntento] = useState(0);
  const [terminada, setTerminada] = useState(false);
  const piezas = piezasVisibles();
  const siguiente = piezas[piezas.findIndex((p) => p.id === id) + 1] ?? null;
  return (
    <>
      <div style={{ maxWidth: 640, margin: "0 auto 12px" }}>
        <Boton onClick={() => ir(null)} data-volver-lista>‹ Demanda agregada</Boton>
      </div>
      {terminada ? (
        <div className="da26-tarjeta" data-pieza-terminada={id}>
          <p style={{ margin: "0 0 12px", fontSize: 16 }}>Terminaste «{pieza.nombre}».</p>
          <div className="da26-nav">
            <Boton onClick={() => { setTerminada(false); setIntento((n) => n + 1); }}>Repetir</Boton>
            {siguiente
              ? <Boton primario onClick={() => ir(siguiente.id)}>Siguiente pieza</Boton>
              : <Boton primario onClick={() => ir(null)}>Volver al tema</Boton>}
          </div>
        </div>
      ) : (
        <Suspense fallback={<div className="da26-tarjeta" style={{ minHeight: 320 }} />}>
          <Componente key={intento} onTerminar={() => setTerminada(true)} />
        </Suspense>
      )}
    </>
  );
}

export default function TemaDemandaAgregada({ extra = null, onBack }) {
  const id = extra ? String(extra).split("?")[0] : null;
  const abierta = id && estaPublicada(id) && APRENDER[id] ? id : null;
  return (
    <div style={{ minHeight: "100vh", background: FONDO, color: INK }}>
      <Raiz data-macro2026-publicado>
        <div style={{ padding: "16px 16px 56px", maxWidth: 672, margin: "0 auto" }}>
          {!abierta && (
            <div style={{ maxWidth: 640, margin: "0 auto 12px" }}>
              <Boton onClick={onBack} data-volver-indice>‹ Macroeconomía</Boton>
            </div>
          )}
          {abierta ? <Pieza key={abierta} id={abierta} /> : <Lista />}
        </div>
      </Raiz>
    </div>
  );
}
