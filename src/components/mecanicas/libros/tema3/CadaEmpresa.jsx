import { useEffect, useMemo, useRef, useState } from "react";
import { COLOR, AVISO_CAMBIO } from "../../../../data/contabilidadTema3.js";
import {
  EMPRESAS_P3, SAN_CALIXTO_P3, ALTERNATIVOS_P3, CONSIGNA_CAPA_3_P3,
} from "../../../../data/contabilidadTema3Pieza3.js";
import { estadoCapa3P3, FASE_FINAL, MS_CASCADA } from "../../../../contabilidad/loQueYaPaso.js";
import DosLineas, { useReducido } from "./DosLineas.jsx";
import AsientoTema3 from "./AsientoTema3.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PIEZA 3 · CAPA 3 · «AHORA PRUEBE USTED» — una pestaña por empresa (Xeno, A4).
 *
 * Al tocar una empresa se reproduce el hecho completo: caen las cinco
 * marcas, se apagan contra el corte, aparece el retardo (solo San Calixto) y
 * se escribe el asiento debajo de las líneas. ≈3 s, siempre iniciado por el
 * estudiante, y se queda en el estado final. Si había otra empresa, primero
 * el reinicio de la pieza 1 (≈650 ms): las dos líneas vuelven a cero.
 *
 * Con movimiento reducido aparece directamente el estado final (Levi).
 * Tocar la misma pestaña repite; tocar la otra a mitad cancela y reinicia.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const REINICIO = 650;

/* Cuándo llega cada fase, desde que empiezan a caer las marcas. */
const TIEMPOS = {
  [SAN_CALIXTO_P3.id]: [["corte", MS_CASCADA + 100], ["retardo", MS_CASCADA + 500], ["asiento", MS_CASCADA + 800]],
  "san-miguel": [["corte", MS_CASCADA + 100], ["asiento", MS_CASCADA + 500]],
};

function Visto() {
  return (
    <span data-visto-insignia aria-hidden="true" style={{
      position: "absolute", top: "-8px", right: "-6px", width: "22px", height: "22px", borderRadius: "50%",
      background: COLOR.neutro, display: "grid", placeItems: "center",
    }}>
      <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6.5 L5 9 L9.5 3.5" fill="none" stroke={COLOR.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}

export default function CadaEmpresa() {
  const reducido = useReducido();
  const [elegida, setElegida] = useState(null);
  const [fase, setFase] = useState(FASE_FINAL);
  const [vistas, setVistas] = useState([]);
  const [anuncio, setAnuncio] = useState("");
  const [vuelta, setVuelta] = useState(0);
  const relojes = useRef([]);
  const limpiar = () => { relojes.current.forEach(clearTimeout); relojes.current = []; };
  useEffect(() => limpiar, []);

  const empresa = EMPRESAS_P3.find((e) => e.id === elegida) ?? null;
  const estado = useMemo(() => estadoCapa3P3(empresa, fase), [elegida, fase]); // eslint-disable-line react-hooks/exhaustive-deps

  const alternativos = (e) => (e.id === SAN_CALIXTO_P3.id ? [ALTERNATIVOS_P3[4], ALTERNATIVOS_P3[5]] : [ALTERNATIVOS_P3[8]]).join(" ");

  const tocar = (e) => {
    limpiar();
    const cambia = elegida !== null && elegida !== e.id;
    setVistas((v) => (v.includes(e.id) ? v : [...v, e.id]));
    setVuelta((n) => n + 1);
    setAnuncio(`${e.nombre}. ${cambia ? `${AVISO_CAMBIO} ` : ""}${alternativos(e)}`);
    if (reducido) { setElegida(e.id); setFase(FASE_FINAL); return; }
    const correr = () => {
      setElegida(e.id);
      setFase("marcas");
      for (const [f, ms] of TIEMPOS[e.id]) relojes.current.push(setTimeout(() => setFase(f), ms));
    };
    if (elegida !== null) {
      /* El reinicio: las marcas se van y los contadores bajan a $0. */
      setElegida(null);
      relojes.current.push(setTimeout(correr, REINICIO));
    } else {
      correr();
    }
  };

  const mostrarAsiento = Boolean(estado.asiento);

  return (
    <div data-capa3-p3 style={{ position: "relative" }}>
      <p style={{ margin: "0 0 10px", padding: "0 8px", fontFamily: SORA, fontSize: "14px", fontWeight: 600, color: COLOR.blanco }}>{CONSIGNA_CAPA_3_P3}</p>

      <div className="fae-dl" role="group" aria-label="Empresas" style={{ display: "flex", gap: "8px", padding: "0 8px", margin: "0 0 14px" }}>
        {EMPRESAS_P3.map((e) => {
          const activa = elegida === e.id;
          return (
            <button
              key={e.id}
              type="button"
              data-pestana={e.id}
              data-vista={vistas.includes(e.id) ? "si" : "no"}
              aria-pressed={activa}
              onClick={() => tocar(e)}
              style={{
                position: "relative", flex: "1 1 0", minWidth: 0, height: "52px", borderRadius: "12px", cursor: "pointer",
                fontFamily: SORA, fontSize: "14px", fontWeight: activa ? 700 : 600,
                background: activa ? COLOR.neutro : "transparent",
                border: `2px solid ${COLOR.neutro}`,
                color: activa ? COLOR.navy : COLOR.blanco,
              }}
            >
              {e.nombre}
              {vistas.includes(e.id) && <Visto />}
            </button>
          );
        })}
      </div>

      <DosLineas
        estado={estado}
        empresa={estado.empresa}
        sinEmpresa
        salidaMs={200}
        msContador={fase === "marcas" ? MS_CASCADA : 450}
        calendario={estado.calendario}
        pie={(
          <div data-espacio-asiento style={{ marginTop: "12px", minHeight: "128px" }}>
            {mostrarAsiento && <AsientoTema3 asiento={estado.asiento} anima={!reducido} reducido={reducido} />}
          </div>
        )}
      />

      {/* Lo que se anuncia: el nombre, el aviso si cambió la empresa, y los alternativos de Gen. */}
      <div data-anuncio-p3 aria-live="polite" aria-atomic="true" style={{
        position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap",
      }}>
        <span key={vuelta}>{anuncio}</span>
      </div>
    </div>
  );
}
