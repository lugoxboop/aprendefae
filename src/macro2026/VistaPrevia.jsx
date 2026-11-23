/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MACRO 2026 · LA VISTA PREVIA (NO PUBLICADA)
 *
 * Se abre SOLO escribiendo la dirección: #/macro-2026 (el índice de las
 * piezas de cada tema: T1 y T2) o #/macro-2026/<id> (una pieza). Ningún índice, tarjeta ni
 * camino del sitio enlaza aquí: nada nuevo se ve para los estudiantes hasta que
 * Mateo apruebe (plan.md, 22-nov).
 *
 * Las Hacer cierran con la pantalla de resumen COMÚN del sitio
 * (shared/PantallaResumen.jsx), pero sin escribir en el servidor: sus filas
 * del catálogo aún no existen (la migración espera en
 * supabase/macro2026-pendientes/). Los FP que muestra son los que pagaría el
 * motor (src/fp/motor.js · calcularFP) por esa partida, la primera vez.
 * Sin estrellas de opinión: no se puntúa una pieza sin publicar.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { lazy, Suspense, useMemo, useState } from "react";
import { calcularFP } from "../fp/motor.js";
import PantallaResumen, { ContextoResumen } from "../components/shared/PantallaResumen.jsx";
import { FORMATO } from "../hacer/pantallaResumen.js";
import { PIEZAS_T1 } from "./demanda-agregada/catalogo.js";
import { PIEZAS_T2 } from "./politica-economica/catalogo.js";
import { PIEZAS_T3 } from "./politica-fiscal/catalogo.js";
import { Raiz, Boton } from "./comun/ui.jsx";
import { FONDO, INK, INK_2, BORDE } from "./comun/colores-da.js";

const COMPONENTES = {
  "da26-a1-carrito": lazy(() => import("./demanda-agregada/A1Carrito.jsx")),
  "da26-h1-llena-carrito": lazy(() => import("./demanda-agregada/H1LlenaCarrito.jsx")),
  "da26-a2-vaso-renta": lazy(() => import("./demanda-agregada/A2VasoRenta.jsx")),
  "da26-a3-columpio-tasa": lazy(() => import("./demanda-agregada/A3ColumpioTasa.jsx")),
  "da26-a4-no-miran-renta": lazy(() => import("./demanda-agregada/A4NoMiranRenta.jsx")),
  "da26-h4-empresario": lazy(() => import("./demanda-agregada/H4Empresario.jsx")),
  "da26-a5-bisagra-ascensor": lazy(() => import("./demanda-agregada/A5BisagraAscensor.jsx")),
  "da26-h3-gira-o-sube": lazy(() => import("./demanda-agregada/H3GiraOSube.jsx")),
  "da26-a6-eco-multiplicador": lazy(() => import("./demanda-agregada/A6EcoMultiplicador.jsx")),
  "da26-h2-arma-formula": lazy(() => import("./demanda-agregada/H2ArmaFormula.jsx")),
  "da26-h5-libreta": lazy(() => import("./demanda-agregada/H5Libreta.jsx")),
  "da26-h6-meta": lazy(() => import("./demanda-agregada/H6Meta.jsx")),
  "pe26-a1-mecanico": lazy(() => import("./politica-economica/A1Mecanico.jsx")),
  "pe26-a2-fiebre": lazy(() => import("./politica-economica/A2Fiebre.jsx")),
  "pe26-a3-problema-resuelto": lazy(() => import("./politica-economica/A3ProblemaResuelto.jsx")),
  "pe26-a4-perillas": lazy(() => import("./politica-economica/A4Perillas.jsx")),
  "pe26-a5-escalera": lazy(() => import("./politica-economica/A5Escalera.jsx")),
  "pe26-h3-cables": lazy(() => import("./politica-economica/H3Cables.jsx")),
  "pe26-h1-seis-cajones": lazy(() => import("./politica-economica/H1SeisCajones.jsx")),
  "pe26-h2-grupo-logico": lazy(() => import("./politica-economica/H2GrupoLogico.jsx")),
  "pe26-h4-expediente": lazy(() => import("./politica-economica/H4Expediente.jsx")),
  "pe26-h5-dos-fiebres": lazy(() => import("./politica-economica/H5DosFiebres.jsx")),
  "pf26-a1-lupa": lazy(() => import("./politica-fiscal/A1Lupa.jsx")),
  "pf26-a2-buzones": lazy(() => import("./politica-fiscal/A2Buzones.jsx")),
  "pf26-a3-cajeros": lazy(() => import("./politica-fiscal/A3Cajeros.jsx")),
  "pf26-a4-tanque": lazy(() => import("./politica-fiscal/A4Tanque.jsx")),
  "pf26-a5-balanza": lazy(() => import("./politica-fiscal/A5Balanza.jsx")),
};

export const TEMAS = [
  { id: "t1", titulo: "T1 · Demanda agregada", piezas: PIEZAS_T1 },
  { id: "t2", titulo: "T2 · Política económica", piezas: PIEZAS_T2 },
  { id: "t3", titulo: "T3 · Política fiscal", piezas: PIEZAS_T3 },
];
const temaDe = (id) => TEMAS.find((t) => t.piezas.some((p) => p.id === id)) ?? null;
const piezaDe = (id) => temaDe(id)?.piezas.find((p) => p.id === id) ?? null;

export const ID_DE_EXTRA = (extra) => (extra ? String(extra).split("?")[0] : null);

const ir = (id) => { window.location.hash = id ? `#/macro-2026/${id}` : "#/macro-2026"; };

/**
 * La partida que la pantalla de resumen espera, armada sin servidor.
 * `resultado`: { pct, detalle: [{ item, ok, subtemas }], duracionMs }.
 */
export function partidaDePrevia(pieza, resultado, id = 1) {
  const c = pieza.clasificacion;
  const { fp } = calcularFP({
    dificultad: c.dificultad, modalidad: c.modalidad, etapas: c.etapas ?? 1,
    aciertos: resultado.pct / 100, duracionMs: resultado.duracionMs ?? null, repeticionesPrevias: 0,
  });
  return {
    id, actividadId: null, clasificacion: c, formato: FORMATO.X_DE_N,
    pct: resultado.pct, detalle: resultado.detalle, conCuenta: true, registro: null,
    aviso: { fp, repetida: false, pctGuardado: resultado.pct },
    listo: true, valida: true, motivo: null,
  };
}

function Indice() {
  return (
    <div className="da26-tarjeta" data-indice-previa>
      <p className="da26-rotulo da26-mono" style={{ margin: 0 }}>VISTA PREVIA · NO PUBLICADO</p>
      <p style={{ margin: "6px 0 4px", color: INK_2, fontSize: 14 }}>Macroeconomía 2026. Las piezas de cada tema en el orden del camino.</p>
      {TEMAS.map((t) => (
        <section key={t.id} data-tema-previa={t.id}>
          <h2 style={{ font: "700 20px/26px var(--planck-font-sans, system-ui)", margin: "14px 0 8px" }}>{t.titulo}</h2>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
            {t.piezas.map((p, k) => (
              <li key={p.id}>
                <button type="button" className="da26-boton" data-abrir={p.id} onClick={() => ir(p.id)}
                  style={{ width: "100%", display: "flex", gap: 10, alignItems: "center", textAlign: "left", borderRadius: 12 }}>
                  <span className="da26-mono" style={{ color: INK_2, width: 22, flex: "none" }}>{k + 1}</span>
                  <span style={{ flex: 1 }}>{p.nombre}</span>
                  <span className="da26-rotulo" style={{ flex: "none" }}>{p.tipo === "hacer" ? "Hacer" : "Aprender"}</span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

function Pieza({ id }) {
  const pieza = piezaDe(id);
  const tema = temaDe(id);
  const Componente = COMPONENTES[id];
  const [intento, setIntento] = useState(0);
  const [partida, setPartida] = useState(null);
  const [aprendido, setAprendido] = useState(false);
  const contexto = useMemo(() => ({
    activa: true, materiaId: "macroeconomia", partida, celebrando: false,
    limpiar: () => setPartida(null),
    onVolver: () => ir(null),
  }), [partida]);
  if (!pieza || !Componente) return <Indice />;
  const siguiente = tema.piezas[tema.piezas.indexOf(pieza) + 1];
  const repetir = () => { setPartida(null); setAprendido(false); setIntento((n) => n + 1); };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", maxWidth: 640, margin: "0 auto 12px" }}>
        <Boton onClick={() => ir(null)} data-volver-previa>‹ Las piezas</Boton>
        <span className="da26-rotulo da26-mono">VISTA PREVIA</span>
      </div>
      {partida ? (
        <div className="da26-tarjeta" data-cierre-previa>
          <ContextoResumen.Provider value={contexto}>
            <PantallaResumen onRepetir={repetir} />
          </ContextoResumen.Provider>
        </div>
      ) : aprendido ? (
        <div className="da26-tarjeta" data-cierre-previa>
          <p style={{ margin: "0 0 12px", fontSize: 16 }}>Terminaste «{pieza.nombre}».</p>
          <div className="da26-nav">
            <Boton onClick={repetir}>Repetir</Boton>
            {siguiente ? <Boton primario onClick={() => ir(siguiente.id)}>Siguiente pieza</Boton> : <Boton primario onClick={() => ir(null)}>Las piezas</Boton>}
          </div>
        </div>
      ) : (
        <Suspense fallback={<div className="da26-tarjeta" style={{ minHeight: 320 }} />}>
          <Componente
            key={intento}
            onTerminar={(resultado) => {
              if (pieza.tipo === "hacer" && resultado) setPartida(partidaDePrevia(pieza, resultado, intento + 1));
              else setAprendido(true);
            }}
          />
        </Suspense>
      )}
    </>
  );
}

export default function VistaPrevia({ extra = null, onBack }) {
  const id = ID_DE_EXTRA(extra);
  return (
    <div style={{ minHeight: "100vh", background: FONDO, color: INK }}>
      <Raiz data-vista-previa-macro2026>
        <div style={{ padding: "16px 16px 56px", maxWidth: 672, margin: "0 auto" }}>
          {!id && (
            <div style={{ maxWidth: 640, margin: "0 auto 12px" }}>
              <Boton onClick={onBack}>‹ Inicio</Boton>
            </div>
          )}
          {id ? <Pieza key={id} id={id} /> : <Indice />}
          <p style={{ maxWidth: 640, margin: "16px auto 0", fontSize: 12, color: INK_2, borderTop: `1px solid ${BORDE}`, paddingTop: 10 }}>
            Esta página no está enlazada desde el sitio. No guarda FP ni datos.
          </p>
        </div>
      </Raiz>
    </div>
  );
}
