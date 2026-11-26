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
import { PIEZAS_T4 } from "./politica-monetaria/catalogo.js";
import { PIEZAS_T5 } from "./politica-cambiaria/catalogo.js";
import { Raiz, Boton } from "./comun/ui.jsx";
import CierreAprender from "./comun/CierreAprender.jsx";
import { INK, INK_2, BORDE } from "./comun/colores-da.js";
import FondoPagina, { ESCENA_DE_TEMA } from "./comun/FondoPagina.jsx";
import { azarDeLaPagina } from "./comun/azar.js";
import { armarRonda } from "./repaso/ronda.js";
import { conVideo } from "./comun/ConVideo.jsx";

/* El Repaso Diario de Macro 2026 (diseño de Gen, 24-nov): #/macro-2026/repaso. */
const RepasoMacro = lazy(() => import("./repaso/RepasoMacro.jsx"));
export const ID_REPASO_PREVIA = "repaso";

const COMPONENTES = {
  "da26-a0-ley-demanda": lazy(() => import("./demanda-agregada/A0LeyDemanda.jsx")),
  "da26-a1-carrito": lazy(() => conVideo(() => import("./demanda-agregada/A1Carrito.jsx"), "da26-a1-carrito")),
  "da26-h1-llena-carrito": lazy(() => import("./demanda-agregada/H1LlenaCarrito.jsx")),
  "da26-a2-vaso-renta": lazy(() => conVideo(() => import("./demanda-agregada/A2VasoRenta.jsx"), "da26-a2-vaso-renta")),
  "da26-a3-columpio-tasa": lazy(() => conVideo(() => import("./demanda-agregada/A3ColumpioTasa.jsx"), "da26-a3-columpio-tasa")),
  "da26-a4-no-miran-renta": lazy(() => conVideo(() => import("./demanda-agregada/A4NoMiranRenta.jsx"), "da26-a4-no-miran-renta")),
  "da26-h4-empresario": lazy(() => import("./demanda-agregada/H4Empresario.jsx")),
  "da26-a5-bisagra-ascensor": lazy(() => conVideo(() => import("./demanda-agregada/A5BisagraAscensor.jsx"), "da26-a5-bisagra-ascensor")),
  "da26-h3-gira-o-sube": lazy(() => import("./demanda-agregada/H3GiraOSube.jsx")),
  "da26-a6-eco-multiplicador": lazy(() => conVideo(() => import("./demanda-agregada/A6EcoMultiplicador.jsx"), "da26-a6-eco-multiplicador")),
  "da26-h2-arma-formula": lazy(() => import("./demanda-agregada/H2ArmaFormula.jsx")),
  "da26-h5-libreta": lazy(() => import("./demanda-agregada/H5Libreta.jsx")),
  "da26-h6-meta": lazy(() => import("./demanda-agregada/H6Meta.jsx")),
  "pe26-a1-mecanico": lazy(() => conVideo(() => import("./politica-economica/A1Mecanico.jsx"), "pe26-a1-mecanico")),
  "pe26-a2-fiebre": lazy(() => conVideo(() => import("./politica-economica/A2Fiebre.jsx"), "pe26-a2-fiebre")),
  "pe26-a3-problema-resuelto": lazy(() => conVideo(() => import("./politica-economica/A3ProblemaResuelto.jsx"), "pe26-a3-problema-resuelto")),
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
  "pf26-h1-moneda": lazy(() => import("./politica-fiscal/H1Moneda.jsx")),
  "pf26-h2-cajero": lazy(() => import("./politica-fiscal/H2Cajero.jsx")),
  "pf26-h3-factura": lazy(() => import("./politica-fiscal/H3Factura.jsx")),
  "pf26-h5-montanas": lazy(() => import("./politica-fiscal/H5Montanas.jsx")),
  "pf26-h4-expande": lazy(() => import("./politica-fiscal/H4Expande.jsx")),
  "pf26-h6-memo": lazy(() => import("./politica-fiscal/H6Memo.jsx")),
  "pm26-a1-billetera": lazy(() => import("./politica-monetaria/A1Billetera.jsx")),
  "pm26-a2-ventanilla": lazy(() => import("./politica-monetaria/A2Ventanilla.jsx")),
  "pm26-h1-entra-sale": lazy(() => import("./politica-monetaria/H1EntraSale.jsx")),
  "pm26-a3-cascada": lazy(() => import("./politica-monetaria/A3Cascada.jsx")),
  "pm26-h2-cascada-meta": lazy(() => import("./politica-monetaria/H2CascadaMeta.jsx")),
  "pm26-a4-cajas": lazy(() => import("./politica-monetaria/A4Cajas.jsx")),
  "pm26-h3-cajas": lazy(() => import("./politica-monetaria/H3Cajas.jsx")),
  "pm26-a5-precio-dinero": lazy(() => import("./politica-monetaria/A5PrecioDinero.jsx")),
  "pm26-h4-mueve-tasa": lazy(() => import("./politica-monetaria/H4MueveTasa.jsx")),
  "pm26-a6-palancas": lazy(() => import("./politica-monetaria/A6Palancas.jsx")),
  "pm26-h6-domino": lazy(() => import("./politica-monetaria/H6Domino.jsx")),
  "pm26-a7-termostato": lazy(() => import("./politica-monetaria/A7Termostato.jsx")),
  "pm26-h5-junta": lazy(() => import("./politica-monetaria/H5Junta.jsx")),
  "pc26-a1-balanza": lazy(() => import("./politica-cambiaria/A1Balanza.jsx")),
  "pc26-h1-quien-aprecia": lazy(() => import("./politica-cambiaria/H1QuienAprecia.jsx")),
  "pc26-a2-subasta": lazy(() => import("./politica-cambiaria/A2Subasta.jsx")),
  "pc26-h2-empuja-curva": lazy(() => import("./politica-cambiaria/H2EmpujaCurva.jsx")),
  "pc26-a3-nominal-real": lazy(() => import("./politica-cambiaria/A3NominalReal.jsx")),
  "pc26-a4-banano": lazy(() => import("./politica-cambiaria/A4Banano.jsx")),
  "pc26-h3-aguja": lazy(() => import("./politica-cambiaria/H3Aguja.jsx")),
  "pc26-h4-a-quien-sirve": lazy(() => import("./politica-cambiaria/H4AQuienSirve.jsx")),
  "pc26-a5-tuberias": lazy(() => import("./politica-cambiaria/A5Tuberias.jsx")),
  "pc26-a6-imanes": lazy(() => import("./politica-cambiaria/A6Imanes.jsx")),
  "pc26-h5-donde-ahorro": lazy(() => import("./politica-cambiaria/H5DondeAhorro.jsx")),
  "pc26-a7-correa": lazy(() => import("./politica-cambiaria/A7Correa.jsx")),
  "pc26-h6-correa": lazy(() => import("./politica-cambiaria/H6Correa.jsx")),
};

export const TEMAS = [
  { id: "t1", titulo: "T1 · Demanda agregada", piezas: PIEZAS_T1 },
  { id: "t2", titulo: "T2 · Política económica", piezas: PIEZAS_T2 },
  { id: "t3", titulo: "T3 · Política fiscal", piezas: PIEZAS_T3 },
  { id: "t4", titulo: "T4 · Política monetaria", piezas: PIEZAS_T4 },
  { id: "t5", titulo: "T5 · Política cambiaria", piezas: PIEZAS_T5 },
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
      <button type="button" className="da26-boton" data-abrir="repaso" onClick={() => ir(ID_REPASO_PREVIA)} style={{ width: "100%", margin: "10px 0 4px", borderRadius: 12, textAlign: "left" }}>
        Repaso diario · la ronda del economista (sin publicar)
      </button>
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

/* La ronda del repaso, sin servidor: historial vacío, datos nuevos en cada ronda. */
function RepasoPrevia() {
  const [n, setN] = useState(0);
  const consultas = useMemo(() => {
    /* Con ?semilla=N (videos), cada «Otra ronda» avanza el azar: nunca repite. */
    const rng = azarDeLaPagina();
    for (let k = 0; k < n * 97; k += 1) rng();
    return armarRonda({ rng });
  }, [n]);
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", maxWidth: 640, margin: "0 auto 12px" }}>
        <Boton onClick={() => ir(null)} data-volver-previa>‹ Las piezas</Boton>
        <span className="da26-rotulo da26-mono">VISTA PREVIA · REPASO</span>
      </div>
      <Suspense fallback={<div className="da26-tarjeta" style={{ minHeight: 320 }} />}>
        <RepasoMacro key={n} consultas={consultas} onOtra={() => setN((k) => k + 1)} textoOtra="Otra ronda" />
      </Suspense>
    </>
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
        <CierreAprender
          data-cierre-previa nombre={pieza.nombre} onRepetir={repetir}
          onSiguiente={() => ir(siguiente ? siguiente.id : null)} textoSiguiente={siguiente ? "Siguiente pieza" : "Las piezas"} hayFlecha={Boolean(siguiente)}
        />
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
    <FondoPagina tema={id && piezaDe(id) ? ESCENA_DE_TEMA[temaDe(id).id] : null} style={{ color: INK }}>
      <Raiz data-vista-previa-macro2026>
        <div style={{ padding: "16px 16px 56px", maxWidth: 672, margin: "0 auto" }}>
          {!id && (
            <div style={{ maxWidth: 640, margin: "0 auto 12px" }}>
              <Boton onClick={onBack}>‹ Inicio</Boton>
            </div>
          )}
          {id === ID_REPASO_PREVIA ? <RepasoPrevia /> : id ? <Pieza key={id} id={id} /> : <Indice />}
          <p style={{ maxWidth: 640, margin: "16px auto 0", fontSize: 12, color: INK_2, borderTop: `1px solid ${BORDE}`, paddingTop: 10 }}>
            Esta página no está enlazada desde el sitio. No guarda FP ni datos.
          </p>
        </div>
      </Raiz>
    </FondoPagina>
  );
}
