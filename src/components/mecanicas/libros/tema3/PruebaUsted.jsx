import { useEffect, useRef, useState } from "react";
import {
  COLOR, SAN_CALIXTO, COMPANIA_CUALQUIERA, CONSIGNA_CAPA_3, AVISO_CAMBIO, BOTON_OTRA_EMPRESA,
} from "../../../../data/contabilidadTema3.js";
import { estadoExploracion } from "../../../../contabilidad/dosLineas.js";
import DosLineas, { useReducido, ENTRADA } from "./DosLineas.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CAPA 3 · «AHORA PRUEBE USTED» — tocar cada hecho y ver qué línea se mueve.
 *
 * Primero los cuatro hechos de San Calixto, en orden cronológico. Vistos los
 * cuatro, el estudiante pulsa «Seguir con otra empresa» (no es automático) y
 * entra Compañía Cualquiera con las dos líneas en cero: continuar las cifras
 * de San Calixto con hechos de otra empresa mostraría una suma que no existe.
 *
 * El reinicio (≈650 ms, A8): las marcas se van y los contadores bajan a $0;
 * a los 200 ms cruza el nombre; a los 450 ms entra la lista nueva. La
 * etiqueta queda «recién cambiada» y el aviso fijo hasta el primer toque de
 * un hecho de la empresa nueva. Con movimiento reducido, todo al instante;
 * el estilo «recién cambiada» y el aviso se conservan igual.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const OCULTO = { position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" };

function BotonHecho({ hecho, numero, visto, seleccionado, onTocar }) {
  return (
    <button
      type="button"
      data-hecho-boton={hecho.id}
      data-visto={visto ? "si" : "no"}
      aria-current={seleccionado ? "true" : undefined}
      onClick={onTocar}
      style={{
        display: "flex", alignItems: "center", gap: "11px", width: "100%", minHeight: "56px", boxSizing: "border-box",
        padding: "9px 12px", borderRadius: "12px", cursor: "pointer", textAlign: "left", background: "transparent",
        border: seleccionado ? `2px solid ${COLOR.blanco}` : `1px solid ${COLOR.quieto}`,
        color: COLOR.blanco, fontFamily: INTER, fontSize: "14px", lineHeight: 1.4,
      }}
    >
      <span aria-hidden="true" style={{
        flex: "none", width: "24px", height: "24px", boxSizing: "border-box", borderRadius: "50%",
        display: "grid", placeItems: "center", fontFamily: SORA, fontSize: "12px", fontWeight: 700,
        border: `2px solid ${COLOR.neutro}`,
        background: visto ? COLOR.neutro : "transparent",
        color: visto ? COLOR.navy : COLOR.blanco,
      }}>
        {numero}
      </span>
      <span>
        <span style={OCULTO}>Hecho {numero}: </span>
        {hecho.titulo}
        {hecho.fecha && <span style={{ display: "block", fontSize: "12px", color: COLOR.apagado }}>{hecho.fecha}</span>}
        {visto && <span style={OCULTO}>, visto</span>}
      </span>
    </button>
  );
}

export default function PruebaUsted() {
  const reducido = useReducido();
  /* La empresa de la lista y de las columnas, y la del nombre: cruzan en tiempos distintos (A8). */
  const [empresa, setEmpresa] = useState(SAN_CALIXTO);
  const [nombre, setNombre] = useState(SAN_CALIXTO);
  const [vistos, setVistos] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [recienCambiada, setRecienCambiada] = useState(false);
  const [reiniciando, setReiniciando] = useState(false);
  const [cruzando, setCruzando] = useState(false);
  const [listaNueva, setListaNueva] = useState(false);
  const [anuncio, setAnuncio] = useState("");
  const [vuelta, setVuelta] = useState(0);
  const chip = useRef(null);
  const relojes = useRef([]);
  useEffect(() => () => relojes.current.forEach(clearTimeout), []);

  const estado = estadoExploracion(empresa, vistos, seleccionado);

  const tocar = (hecho) => {
    if (reiniciando) return;
    setVistos((v) => (v.includes(hecho.id) ? v : [...v, hecho.id]));
    setSeleccionado(hecho.id);
    setRecienCambiada(false);
    setListaNueva(false);
    /* Repetir el texto aunque sea el mismo: la región viva lo vuelve a decir. */
    setVuelta((n) => n + 1);
    setAnuncio(hecho.texto);
  };

  const cambiarEmpresa = () => {
    const nueva = COMPANIA_CUALQUIERA;
    const avisar = `${nueva.nombre}. ${AVISO_CAMBIO}`;
    /* 0 ms: las marcas se van (200 ms) y los contadores bajan a $0 (450 ms). */
    setVistos([]);
    setSeleccionado(null);
    const cruzarNombre = () => { setNombre(nueva); setRecienCambiada(true); setCruzando(!reducido); };
    const cambiarLista = () => {
      setEmpresa(nueva);
      setListaNueva(!reducido);
      setReiniciando(false);
      setAnuncio(avisar);
      setVuelta((n) => n + 1);
      chip.current?.focus({ preventScroll: true });
    };
    if (reducido) { cruzarNombre(); cambiarLista(); return; }
    setReiniciando(true);
    relojes.current.push(setTimeout(cruzarNombre, 200));
    relojes.current.push(setTimeout(cambiarLista, 450));
  };

  const terminoSanCalixto = empresa === SAN_CALIXTO && estado.completa && !reiniciando;

  return (
    <div data-capa3-dos-lineas>
      <DosLineas
        estado={estado}
        empresa={nombre}
        recienCambiada={recienCambiada}
        cruzandoNombre={cruzando}
        chipRef={chip}
        salidaMs={reiniciando ? 200 : 160}
        msContador={450}
      />

      {/* El texto del hecho tocado, o el aviso del cambio: región viva. */}
      <div data-texto-hecho aria-live="polite" aria-atomic="true" style={{ minHeight: "66px", padding: "0 8px", margin: "2px 0 8px" }}>
        {recienCambiada ? (
          <p data-aviso-cambio style={{ margin: 0, fontFamily: INTER, fontSize: "14px", lineHeight: 1.55, color: COLOR.blanco }}>
            <span style={OCULTO}>{nombre.nombre}. </span>{AVISO_CAMBIO}
          </p>
        ) : estado.hecho ? (
          <p key={vuelta} style={{ margin: 0, fontFamily: INTER, fontSize: "14px", lineHeight: 1.55, color: COLOR.blanco, animation: reducido ? undefined : `fae-dl-fundido 150ms ${ENTRADA} both` }}>
            {anuncio}
          </p>
        ) : null}
      </div>

      <p style={{ margin: "0 0 10px", padding: "0 8px", fontFamily: SORA, fontSize: "14px", fontWeight: 600, color: COLOR.blanco }}>{CONSIGNA_CAPA_3}</p>

      <div
        key={empresa.id}
        className="fae-dl"
        data-lista-hechos={empresa.id}
        style={{ display: "flex", flexDirection: "column", gap: "8px", animation: listaNueva ? `fae-dl-fundido 200ms ${ENTRADA} both` : undefined }}
      >
        {empresa.hechos.map((h, i) => (
          <BotonHecho
            key={h.id}
            hecho={h}
            numero={i + 1}
            visto={vistos.includes(h.id)}
            seleccionado={seleccionado === h.id}
            onTocar={() => tocar(h)}
          />
        ))}
        {terminoSanCalixto && (
          <button
            type="button"
            data-otra-empresa
            onClick={cambiarEmpresa}
            style={{
              width: "100%", height: "48px", marginTop: "4px", borderRadius: "999px", cursor: "pointer",
              background: COLOR.neutro, border: "none", color: COLOR.navy, fontFamily: SORA, fontSize: "14px", fontWeight: 700,
            }}
          >
            {BOTON_OTRA_EMPRESA}
          </button>
        )}
      </div>
    </div>
  );
}
