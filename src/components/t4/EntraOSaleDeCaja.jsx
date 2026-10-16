/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · HACER 1 · ¿ENTRA O SALE DE CAJA? — rediseño de enganche (Célula D).
 *
 * Diseño: Hanayama, «el cajón como tablero» (celula-d/hanayama-h1-
 * rediseno.md, con su §9); textos de Katsumi; corte de Yujiro. El tablero es
 * el cajón de A1: cada hecho del taller llega arriba con su monto y el
 * estudiante lo manda al Debe, al Haber o a «Caja no se mueve». La plata se
 * mueve de verdad: la cifra cae en su columna, el trazo se enciende y «En la
 * caja» cuenta hasta el saldo nuevo. Con «no se mueve», el saldo se queda
 * quieto (y si la plata pasó por el banco, Bancos se enciende sin cifra).
 *
 *   · UN SOLO TOQUE por hecho. En el error la cifra NO entra donde se eligió:
 *     ese lado se marca («✗ No va aquí», borde coral) y tiembla, y a los 0,7 s
 *     la plata va a donde de verdad iba («Iba aquí», borde blanco). La caja
 *     nunca muestra un saldo falso
 *   · el acierto: ✓ y borde blanco. NUNCA teal ni ámbar: por eso no usa Opcion
 *     ni ConstructorAsiento compartidos (pintan el acierto en teal)
 *   · «Siguiente hecho» en el Responder compartido, teal (Avance): el botón
 *     principal es teal también en Contabilidad (prompt maestro §4.3 y §5.2)
 *   · «Hecho n de 8» y el pulso activo coinciden en todos los estados: el
 *     hecho respondido no cuenta como hecho hasta tocar «Siguiente»
 *   · mientras se pregunta, nada de la respuesta está en el DOM (PH8-2)
 *   · en modo demo («Así se juega») no dibuja su Encabezado ni sus Pulsos:
 *     la consigna sale una sola vez, la de esa pantalla
 *
 * Piezas compartidas, SIN CAMBIOS: Encabezado, Pulsos, Cierre, useTanda,
 * useNumeroQueSube. Al terminar: onCompletar(pct, ms, detalle); el detalle
 * guarda el item_id (h1-t1…h1-t8) y, en el error, el destino elegido.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useRef, useState } from "react";
import { barajar } from "../../utils/barajar.js";
import { Pulsos, Cierre } from "../mecanicas/corazon/juego.jsx";
import { TEXTO_CIERRE } from "../mecanicas/bloques/marcos.jsx";
import { useTanda } from "../mecanicas/libros/piezas.jsx";
import { Encabezado } from "../mecanicas/libros/tema1/encabezado.jsx";
import {
  H1, DEBE, HABER, BOTON_H1, CIERRE_H1, ESPERA_ERROR_H1_MS, SALDO_INICIAL_H1,
  resumenH1, sortearH1, evaluarH1, puntuarH1, libroH1,
} from "../../data/contabilidadT4H1.js";
import { C, CSS_T4R, cifra, Mensaje, Avance } from "./comun.jsx";
import { mostrarTramo } from "./hacerComun.jsx";
import { Cajon, CSS_CAJON } from "./Cajon.jsx";

/* Cada columna reserva cuatro líneas: el saldo inicial más tres entradas, el máximo posible. */
const RESERVA = 4;

export default function EntraOSaleDeCaja({ Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? sortearH1(barajar));
  const [r, setR] = useState(null); /* { elegido, ok, texto, pagina, aplicado } */
  const [puestos, setPuestos] = useState([]);
  const [bien, setBien] = useState(0);
  const [vibra, setVibra] = useState(null);
  const reloj = useRef(0);
  const zonaBoton = useRef(null);
  const hecho = useRef(null);
  const enfocarHecho = useRef(false);

  const item = t.items[t.i];
  const cuantos = t.items.length;

  useEffect(() => () => clearTimeout(reloj.current), []);
  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(puntuarH1(bien, cuantos), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  /* Con el veredicto aplicado, el foco lo pone mostrarTramo: al botón si entra con el tramo; si no, a la devolución. */
  useEffect(() => { if (enfocarHecho.current) { enfocarHecho.current = false; hecho.current?.focus(); } }, [t.i]);
  const retro = useRef(null);
  /* Al dar el veredicto, la devolución entra en la ventana (decisión de Yujiro sobre la parada de Hanayama). */
  useEffect(() => { if (r && !modoDemo) mostrarTramo(retro.current?.closest("[data-t4-h1], [data-t4-h3], [data-t4-h4], [data-t4-h7], [data-t4-h8]"), { enfocar: Boolean(r?.aplicado) }); }, [Boolean(r), r?.aplicado]); // eslint-disable-line react-hooks/exhaustive-deps

  const poner = (it) => setPuestos((p) => (p.some((x) => x.id === it.id) ? p : [...p, it]));

  const responder = (d) => {
    if (r) return;
    const v = evaluarH1(item, d);
    /* En el error se guarda el destino elegido: eso le dice algo al docente. */
    t.anotar(item.id, v.ok, d);
    if (v.ok) {
      setBien((n) => n + 1);
      poner(item);
      setR({ elegido: d, ...v, aplicado: true });
      return;
    }
    setR({ elegido: d, ...v, aplicado: false });
    setVibra(d);
    reloj.current = setTimeout(() => {
      setVibra(null);
      poner(item);
      setR((x) => (x ? { ...x, aplicado: true } : x));
    }, ESPERA_ERROR_H1_MS);
  };

  const avanzar = () => {
    clearTimeout(reloj.current);
    /* Si se avanza antes de que la plata llegue a su sitio, llega ahora: el saldo nunca queda falso. */
    poner(item);
    setR(null); setVibra(null);
    if (t.i + 1 < cuantos) { enfocarHecho.current = true; t.setI(t.i + 1); } else t.setTerminado(true);
  };

  const reiniciar = () => { clearTimeout(reloj.current); t.reiniciar(); setR(null); setPuestos([]); setBien(0); setVibra(null); };

  const L = libroH1(puestos, SALDO_INICIAL_H1);
  const recien = !t.terminado && r?.aplicado ? item : null;
  const linea = (l) => ({ id: l.id, v: cifra(l.monto), foco: l.id === recien?.id });
  const marcas = r ? { [r.elegido]: r.ok ? "bien" : "mal", ...(!r.ok && r.aplicado ? { [r.correcta]: "era" } : {}) } : {};
  const vivo = !recien ? [] : recien.respuesta === DEBE ? ["entrada"] : recien.respuesta === HABER ? ["salida", recien.va] : [];

  const tablero = (
    <Cajon
      origen={t.terminado ? null : { texto: item.texto, monto: cifra(item.monto), montoFoco: !recien, clave: item.id, tarjeta: true, refHecho: hecho }}
      palabras
      debe={L.debe.map(linea)}
      haber={L.haber.map(linea)}
      reserva={RESERVA}
      saldo={L.saldo}
      vivo={vivo}
      bancos={recien?.va === "bancos" ? { monto: cifra(recien.monto) } : {}}
      pago={recien?.va === "pago" ? { monto: cifra(recien.monto) } : {}}
      luz={recien?.toca === "bancos" ? ["bancos"] : []}
      bandeja={{ ultimo: L.bandeja ? cifra(L.bandeja.monto) : null }}
      destinos={t.terminado ? null : { activos: !r, onElegir: responder, marcas }}
      vibra={vibra}
    />
  );

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <style>{CSS_T4R + CSS_CAJON}</style>
        <div data-t4-h1 data-fin className="t4r">
          {tablero}
          <Cierre pct={Math.round(puntuarH1(bien, cuantos))} onReiniciar={reiniciar} textoReiniciar={BOTON_H1.otraVez}>
            <p data-resumen style={TEXTO_CIERRE}>{resumenH1(bien, cuantos)}</p>
            <p data-cierre style={{ ...TEXTO_CIERRE, marginTop: "8px" }}>{CIERRE_H1.texto}</p>
            <p data-pie-cierre style={{ margin: "6px 0 0", fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.texto2 }}>{CIERRE_H1.pie}</p>
          </Cierre>
        </div>
      </Marco>
    );
  }

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T4R + CSS_CAJON}</style>
      {/*
        La raíz del juego lleva `data-t4-h1`; la de la demo de «Así se juega»,
        `data-t4-h1-demo`. Así `[data-t4-h1]` encuentra exactamente una: la
        partida, nunca el ejemplo.
      */}
      <div {...(modoDemo ? { "data-t4-h1-demo": "" } : { "data-t4-h1": "" })}>
        {!modoDemo && (
          <>
            <Encabezado consigna={H1.consigna} onComoSeJuega={onComoSeJuega} />
            <div style={{ marginBottom: "12px" }}>
              <Pulsos total={cuantos} hechos={t.i} enCurso={t.i + 1} etiqueta="Hecho" />
            </div>
          </>
        )}
        <div className="t4r" role="group" aria-label={H1.nombre}>{tablero}</div>
        {/* La devolución: región viva. Vacía mientras se pregunta: ni su texto ni su página están en el DOM. */}
        <div className="t4r" data-retro aria-live="polite" aria-atomic="true" ref={retro}>
          {r && <div style={{ marginTop: "12px" }}><Mensaje ok={r.ok} texto={r.texto} pagina={r.pagina} /></div>}
        </div>
        {r && !modoDemo && (
          <div className="t4r">
            <Avance refZona={zonaBoton} onClick={avanzar}>{t.i + 1 === cuantos ? BOTON_H1.verResumen : BOTON_H1.siguiente}</Avance>
          </div>
        )}
      </div>
    </Marco>
  );
}

