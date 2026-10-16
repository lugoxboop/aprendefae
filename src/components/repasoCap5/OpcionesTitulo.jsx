import { useLayoutEffect, useRef, useState } from "react";
import { C } from "./comun.jsx";
import { OpcionR5 } from "./OpcionR5.jsx";
import { useReducido, useTemporizadores, llevarArriba, asomarAbajo, volarDesde, MARGEN_VENTANA } from "./movimiento.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL PATRÓN «LA OPCIÓN SE VUELVE TÍTULO» (pantallas 1, 2 y 6; §0 del diseño).
 *
 * Antes: enunciado → figura inicial → cuatro opciones. Al tocar una:
 *
 *   1. las tres no elegidas se recogen (alto → 0 con fundido, 200 ms);
 *   2. la figura baja y queda justo debajo de la elegida (300 ms), y a la vez
 *      la página se desplaza para dejar la elegida a 16 px del borde superior
 *      de la ventana útil (300 ms);
 *   3. la figura reproduce la opción elegida.
 *
 * Si falló: pausa de 600 ms; debajo de la elegida se despliega la correcta
 * (200 ms) y la figura la reproduce. Las dos filas quedan tocables para volver
 * a ver cualquiera, y la que la figura muestra lleva «EN LA FIGURA». Si al
 * desplegar la correcta la figura se sale por abajo, la página se desplaza lo
 * justo para dejar su borde inferior a 16 px del de la ventana útil.
 *
 * Con reduced-motion: el estado final directo, sin recoger ni trasladar ni
 * desplazamiento suave.
 *
 * `figura(opcion, clave, onTerminar, { elegida })` pinta la figura con la
 * opción que toca (null antes de responder); `contenido(opcion)` pinta el
 * texto de cada fila. Con `sinFiguraAntes` (C.1, E8) la figura no existe
 * hasta elegir: ni la línea, ni la raya, ni los activos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RECOGER_MS = 200;
const TRASLADAR_MS = 300;
const PAUSA_MS = 600;
const DESPLEGAR_MS = 200;
const DESPLAZAR_MS = 300;

export function OpcionesTitulo({ opciones, figura, contenido, etiqueta, onCalificar, sinFiguraAntes = false }) {
  const reducido = useReducido();
  const { despues } = useTemporizadores();
  const [elegida, setElegida] = useState(null);
  const [fase, setFase] = useState("eligiendo");
  const [mostrada, setMostrada] = useState(null);
  /* null mientras la figura se prepara: ya tiene el tamaño de la opción, quieta. */
  const [clave, setClave] = useState(null);
  const [preparando, setPreparando] = useState(0);
  const cuenta = useRef(0);
  const filas = useRef({});
  const cajaFigura = useRef(null);
  const antes = useRef(null);
  const faseRef = useRef(fase);
  faseRef.current = fase;

  const correcta = opciones.find((o) => o.correcta);
  const ok = elegida === correcta.id;

  /*
   * E2 de enganche.md: lo que se mueve tiene que estar en la ventana. Antes de
   * reproducir, la figura toma el tamaño de la opción (quieta); si así se sale
   * por abajo, la página se desplaza primero (300 ms) y luego se reproduce.
   */
  const reproducir = (id) => { setMostrada(id); setClave(null); setPreparando((k) => k + 1); };
  useLayoutEffect(() => {
    if (!preparando) return;
    const r = cajaFigura.current?.getBoundingClientRect();
    const sale = r && r.bottom > window.innerHeight - MARGEN_VENTANA;
    if (sale) asomarAbajo(cajaFigura.current, reducido);
    const empezar = () => { cuenta.current += 1; setClave(cuenta.current); };
    if (sale && !reducido) despues(DESPLAZAR_MS, empezar);
    else empezar();
  }, [preparando]); // eslint-disable-line react-hooks/exhaustive-deps

  const elegir = (id) => {
    if (elegida) return;
    const acierto = id === correcta.id;
    setElegida(id);
    onCalificar?.({ ok: acierto, elegida: id });
    if (reducido) {
      setFase(acierto ? "titulo" : "correcta");
      reproducir(acierto ? id : correcta.id);
      return;
    }
    /* 1. Recoger las no elegidas. */
    for (const o of opciones) {
      const el = filas.current[o.id];
      if (o.id === id || !el?.animate) continue;
      el.animate([{ height: `${el.offsetHeight}px`, opacity: 1 }, { height: "0px", opacity: 0 }], { duration: RECOGER_MS, easing: "ease-in", fill: "forwards" });
    }
    setFase("recogiendo");
    despues(RECOGER_MS, () => {
      /* 2. Trasladar: se guardan los rectángulos para animar desde ahí. */
      antes.current = {
        figura: cajaFigura.current?.getBoundingClientRect() ?? null,
        elegida: filas.current[id]?.getBoundingClientRect() ?? null,
      };
      setFase("titulo");
    });
  };

  /* Tras el cambio de orden: FLIP de la figura y la elegida, y el desplazamiento. */
  useLayoutEffect(() => {
    if (fase === "titulo" && antes.current) {
      const a = antes.current;
      antes.current = null;
      llevarArriba(filas.current[elegida], reducido);
      volarDesde(cajaFigura.current, a.figura, TRASLADAR_MS, { reducido });
      volarDesde(filas.current[elegida], a.elegida, TRASLADAR_MS, { reducido });
      /* 3. Reproducir la elegida cuando la figura ya llegó. */
      despues(TRASLADAR_MS, () => reproducir(elegida));
    } else if (fase === "titulo" && reducido) {
      llevarArriba(filas.current[elegida], true);
      asomarAbajo(cajaFigura.current, true);
    } else if (fase === "correcta") {
      const el = filas.current[correcta.id];
      if (!reducido && el?.animate) {
        el.animate([{ height: "0px", opacity: 0, overflow: "hidden" }, { height: `${el.offsetHeight}px`, opacity: 1, overflow: "hidden" }], { duration: DESPLEGAR_MS, easing: "ease-out" });
        despues(DESPLEGAR_MS, () => reproducir(correcta.id));
      } else if (!reducido) {
        /* Sin la API de animaciones (navegador viejo): sin desplegar, pero la correcta se reproduce. */
        reproducir(correcta.id);
      } else {
        llevarArriba(filas.current[elegida], true);
        asomarAbajo(cajaFigura.current, true);
      }
    }
  }, [fase]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Al terminar la elegida, si falló: pausa y la correcta. */
  const alTerminar = () => {
    if (faseRef.current === "titulo" && !ok && !reducido) despues(PAUSA_MS, () => setFase("correcta"));
  };

  const estadoDe = (o) => {
    if (!elegida) return null;
    if (o.id === elegida) return ok ? "correcta" : "incorrecta";
    if (o.id === correcta.id && fase === "correcta") return "revelada";
    return null;
  };
  const resuelta = fase === "titulo" || fase === "correcta";
  const visibles = !resuelta
    ? opciones
    : opciones.filter((o) => o.id === elegida || (fase === "correcta" && o.id === correcta.id))
      .sort((a, b) => (a.id === elegida ? -1 : b.id === elegida ? 1 : 0));

  const fila = (o) => (
    <div key={o.id} data-opcion={o.id} ref={(el) => { filas.current[o.id] = el; }} style={{ marginTop: "8px", overflow: fase === "recogiendo" ? "hidden" : undefined }}>
      <OpcionR5
        estado={estadoDe(o)}
        enFigura={resuelta && mostrada === o.id}
        deshabilitada={Boolean(elegida) && !resuelta}
        etiqueta={etiqueta?.(o)}
        onClick={() => (elegida ? reproducir(o.id) : elegir(o.id))}
      >
        {contenido(o)}
      </OpcionR5>
    </div>
  );

  const mostradaOpcion = opciones.find((o) => o.id === mostrada) ?? null;
  const cajaDeFigura = (
    <div key="figura" ref={cajaFigura} data-caja-figura style={{ marginTop: resuelta ? "16px" : 0, background: C.navy, borderRadius: "12px", padding: "12px" }}>
      {figura(resuelta ? mostradaOpcion : null, resuelta ? clave : null, alTerminar, { elegida: opciones.find((o) => o.id === elegida) ?? null })}
    </div>
  );

  return (
    <div data-opciones-titulo data-fase={fase}>
      {resuelta ? (
        <>
          {visibles.map(fila)}
          {cajaDeFigura}
        </>
      ) : (
        <>
          {!sinFiguraAntes && cajaDeFigura}
          <div style={{ marginTop: sinFiguraAntes ? 0 : "8px" }}>{visibles.map(fila)}</div>
        </>
      )}
    </div>
  );
}
