import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Check, Volume2, VolumeX } from "lucide-react";
import { APRENDER, HACER, SUBJECTS, actividadesDeTipo, temasVisibles } from "../../data/subjects.js";
import { PastillaTema, identidadDeTema, variablesDeTono } from "../shared/TarjetaTema.jsx";
import { ESTILOS_APRENDER } from "./estilos.js";
import { alCambiarSonido, ponerSonido, sonar, sonidoEncendido } from "./sonidos.js";
import { lanzarChispas } from "./chispas.js";
import { EVENTO_PIEZA } from "./eventos.js";

export { EVENTO_PIEZA, avisarPieza } from "./eventos.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA PORTADA DEL APRENDER (Magno, 19 nov.).
 *
 * Va arriba de cada Aprender de Contabilidad y Macroeconomía, donde antes
 * estaba la insignia gris «APRENDER». Hace tres cosas:
 *
 *   1. IDENTIDAD. El tono, la pastilla y el número del tema, los mismos de su
 *      tarjeta en el índice: entrar al Aprender se siente como abrir esa
 *      tarjeta, no como cambiar de sitio.
 *   2. ESTRUCTURA. La ruta del tema: todas sus piezas, en orden, con cuál va,
 *      cuáles ya pasó y cuánto le falta. Nada queda al azar: el estudiante ve
 *      desde el principio el camino entero y dónde está parado.
 *   3. AMBIENTE. Pone la piel (.fae-ap y las variables de tono) en el
 *      contenedor del Aprender, escucha los aciertos y errores de cualquier
 *      figura (el atributo data-mensaje que ya usan las sondas) para darles
 *      sonido, salto o temblor y chispas, y trae el botón de sonido.
 *
 * Los motores (SecuenciaAprender, CuatroCapas, Presentacion, las mecánicas)
 * no dependen de la portada: sin ella se ven como siempre.
 *
 * DÓNDE VA LA PIEZA ACTUAL
 *   · En una secuencia, SecuenciaAprender avisa con el evento
 *     «fae-aprender:pieza» ({ p, total }).
 *   · En un Aprender largo (piezas una debajo de otra), cada pieza lleva
 *     data-ap-pieza="<id>" y la portada mira cuál está en pantalla; tocar una
 *     píldora de la ruta lleva hasta ella.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const reducido = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function"
  && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function datosDelTema(materia, temaId) {
  const subject = SUBJECTS[materia];
  const tema = subject?.topics.find((t) => t.id === temaId) ?? null;
  const visibles = materia === "contabilidad" ? temasVisibles(subject) : subject?.topics ?? [];
  let i = visibles.findIndex((t) => t.id === temaId);
  if (i < 0) i = subject?.topics.findIndex((t) => t.id === temaId) ?? 0;
  return { tema, indice: Math.max(0, i) };
}

/* Un acierto o un error cuenta solo si viene de un toque reciente: volver a una pantalla ya resuelta no suena. */
const VENTANA_TOQUE_MS = 1600;

/*
 * modo: "secuencia" (la pieza la avisa el motor), "lista" (piezas una debajo
 * de otra, con data-ap-pieza) o "auto" (lo decide mirando si hay anclas).
 */
export default function PortadaAprender({ materia, temaId, piezas: piezasDadas = null, modo: modoPedido = "auto" }) {
  const raiz = useRef(null);
  const ruta = useRef(null);
  const { tema, indice } = useMemo(() => datosDelTema(materia, temaId), [materia, temaId]);
  const identidad = identidadDeTema(materia, tema, indice);
  const { tono, Glifo } = identidad;

  const piezas = useMemo(() => {
    if (piezasDadas?.length) return piezasDadas;
    return actividadesDeTipo(tema, APRENDER).map((a) => ({ id: a.id, titulo: a.nombre }));
  }, [piezasDadas, tema]);
  const retos = useMemo(() => actividadesDeTipo(tema, HACER).filter((a) => !a.pendiente).length, [tema]);

  const [modo, setModo] = useState(modoPedido === "auto" ? "secuencia" : modoPedido);
  useLayoutEffect(() => {
    if (modoPedido !== "auto") { setModo(modoPedido); return; }
    const zona = raiz.current?.parentElement;
    setModo(zona?.querySelector("[data-ap-pieza]") ? "lista" : "secuencia");
  }, [modoPedido]);
  const [actual, setActual] = useState(0);
  const [vistas, setVistas] = useState(() => new Set([0]));
  const [sonido, setSonido] = useState(() => sonidoEncendido());

  useEffect(() => alCambiarSonido(setSonido), []);

  /* ───────── la piel: clase y variables en el contenedor del Aprender ───────── */
  useLayoutEffect(() => {
    const zona = raiz.current?.parentElement;
    if (!zona) return undefined;
    zona.classList.add("fae-ap");
    const vars = { "--ap": tono.base, "--ap-claro": tono.claro, "--ap-rgb": tono.rgb };
    Object.entries(vars).forEach(([k, v]) => zona.style.setProperty(k, v));
    return () => {
      zona.classList.remove("fae-ap");
      Object.keys(vars).forEach((k) => zona.style.removeProperty(k));
    };
  }, [tono]);

  /* ───────── el ambiente: toques, aciertos y errores ───────── */
  useEffect(() => {
    const zona = raiz.current?.parentElement;
    if (!zona) return undefined;
    let ultimoToque = 0;
    const recientes = new WeakMap();

    const alTocar = (e) => {
      ultimoToque = Date.now();
      const el = e.target instanceof Element ? e.target : null;
      if (!el) return;
      const propio = el.closest("[data-ap-sonido]");
      if (propio) {
        const nombre = propio.getAttribute("data-ap-sonido");
        if (nombre && nombre !== "propio" && propio.getAttribute("aria-disabled") !== "true" && !propio.disabled) sonar(nombre);
        return;
      }
      const boton = el.closest("button, [role=button], [role=radio], [role=checkbox], [role=option]");
      if (boton && !boton.disabled && boton.getAttribute("aria-disabled") !== "true") sonar("toque");
    };
    const alTeclear = () => { ultimoToque = Date.now(); };

    const devolver = (el) => {
      const valor = el.getAttribute("data-mensaje");
      const bien = valor === "acierto" || valor === "correcto" || valor === "ok";
      const mal = valor === "error" || valor === "fallo" || valor === "mal";
      if (!bien && !mal) return;
      if (Date.now() - ultimoToque > VENTANA_TOQUE_MS) return;
      const antes = recientes.get(el);
      if (antes && Date.now() - antes < 350) return;
      recientes.set(el, Date.now());
      sonar(bien ? "acierto" : "error");
      const destino = el.firstElementChild ?? el;
      if (!reducido()) {
        destino.classList.remove("fae-ap-bien", "fae-ap-mal");
        void destino.offsetWidth; // reinicia la animación
        destino.classList.add(bien ? "fae-ap-bien" : "fae-ap-mal");
      }
      if (bien) lanzarChispas(destino, { cantidad: 14, tono: tono.claro, fuerza: 0.8 });
    };

    const observador = typeof MutationObserver !== "undefined" ? new MutationObserver((cambios) => {
      for (const c of cambios) {
        if (c.type === "attributes" && c.target instanceof Element) devolver(c.target);
        c.addedNodes?.forEach((n) => {
          if (!(n instanceof Element)) return;
          if (n.hasAttribute("data-mensaje")) devolver(n);
          n.querySelectorAll?.("[data-mensaje]").forEach(devolver);
        });
      }
    }) : null;
    observador?.observe(zona, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-mensaje"] });
    zona.addEventListener("pointerdown", alTocar, true);
    zona.addEventListener("keydown", alTeclear, true);
    return () => {
      observador?.disconnect();
      zona.removeEventListener("pointerdown", alTocar, true);
      zona.removeEventListener("keydown", alTeclear, true);
    };
  }, [tono]);

  /* ───────── dónde va: la secuencia avisa ───────── */
  useEffect(() => {
    if (modo !== "secuencia") return undefined;
    const oir = (e) => {
      const p = Number(e.detail?.p) || 0;
      setActual(p);
      setVistas((v) => (v.has(p) ? v : new Set(v).add(p)));
    };
    window.addEventListener(EVENTO_PIEZA, oir);
    return () => window.removeEventListener(EVENTO_PIEZA, oir);
  }, [modo]);

  /* ───────── dónde va: en una lista, la pieza que está en pantalla ───────── */
  useEffect(() => {
    if (modo !== "lista" || typeof window === "undefined") return undefined;
    const zona = raiz.current?.parentElement;
    if (!zona) return undefined;
    let cuadro = null;
    const medir = () => {
      cuadro = null;
      const linea = window.innerHeight * 0.42;
      let k = 0;
      piezas.forEach((pz, i) => {
        const el = zona.querySelector(`[data-ap-pieza="${pz.id}"]`);
        if (el && el.getBoundingClientRect().top < linea) k = i;
      });
      setActual(k);
      setVistas((v) => (v.has(k) ? v : new Set(v).add(k)));
    };
    const raf = typeof requestAnimationFrame === "function" ? requestAnimationFrame : (f) => setTimeout(f, 16);
    const pedir = () => { if (cuadro === null) cuadro = raf(medir); };
    window.addEventListener("scroll", pedir, { passive: true });
    pedir();
    return () => {
      window.removeEventListener("scroll", pedir);
      if (cuadro !== null && typeof cancelAnimationFrame === "function") cancelAnimationFrame(cuadro);
    };
  }, [modo, piezas]);

  /* La píldora actual siempre a la vista dentro de la ruta. */
  useEffect(() => {
    const lista = ruta.current;
    const li = lista?.children?.[actual];
    if (!lista || !li || lista.scrollWidth <= lista.clientWidth) return;
    const destino = li.offsetLeft - 16;
    if (typeof lista.scrollTo === "function") lista.scrollTo({ left: destino, behavior: reducido() ? "auto" : "smooth" });
  }, [actual]);

  const irA = (pz) => {
    const zona = raiz.current?.parentElement;
    const el = zona?.querySelector(`[data-ap-pieza="${pz.id}"]`);
    el?.scrollIntoView?.({ block: "start", behavior: reducido() ? "auto" : "smooth" });
  };

  const alternarSonido = (e) => {
    const nuevo = !sonido;
    ponerSonido(nuevo);
    if (nuevo) {
      sonar("listo");
      lanzarChispas(e.currentTarget, { cantidad: 8, tono: tono.claro, fuerza: 0.5 });
    }
  };

  const total = piezas.length;
  const hechas = modo === "secuencia" ? actual : Math.max(0, vistas.size - 1);
  const avance = total > 0 ? Math.min(1, (modo === "secuencia" ? actual : hechas) / total) : 0;
  const numero = indice + 1;
  const titulo = total === 1 ? "Una pieza para entender el tema" : `${total} piezas para entender el tema`;
  const sub = retos > 0
    ? `Avanza a tu ritmo. Al final te esperan ${retos === 1 ? "1 reto" : `${retos} retos`} en Hacer.`
    : "Avanza a tu ritmo, una pieza a la vez.";

  return (
    <section ref={raiz} className="fae-ap-portada" aria-label={`Aprender · Tema ${numero}`} data-ap-portada={temaId} style={variablesDeTono(tono)}>
      <style>{ESTILOS_APRENDER}</style>
      <span className="fae-ap-portada__luz" aria-hidden="true" />
      <span className="fae-ap-portada__agua" aria-hidden="true">
        {Glifo ? <Glifo size={128} strokeWidth={1.2} focusable="false" /> : <BookOpen size={128} strokeWidth={1.2} focusable="false" />}
      </span>

      <div className="fae-ap-portada__fila">
        <PastillaTema materia={materia} tema={tema} Glifo={Glifo} respaldo={<BookOpen size={26} strokeWidth={2} aria-hidden="true" focusable="false" />} />
        <div className="fae-ap-portada__textos">
          <p className="fae-ap-portada__rotulo">Tema {numero} · Aprender</p>
          <h2 className="fae-ap-portada__titulo">{titulo}</h2>
          <p className="fae-ap-portada__sub">{sub}</p>
        </div>
        <button
          type="button"
          className="fae-ap-sonido"
          data-ap-sonido="propio"
          aria-pressed={sonido}
          aria-label={sonido ? "Apagar sonidos" : "Encender sonidos"}
          title={sonido ? "Apagar sonidos" : "Encender sonidos"}
          onClick={alternarSonido}
        >
          {sonido ? <Volume2 size={20} aria-hidden="true" /> : <VolumeX size={20} aria-hidden="true" />}
        </button>
      </div>

      {total > 1 && (
        <>
          <div className="fae-ap-avance">
            <div
              className="fae-ap-avance__riel"
              role="progressbar"
              aria-label="Avance del tema"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={modo === "secuencia" ? actual : hechas}
            >
              <span className="fae-ap-avance__lleno" style={{ transform: `scaleX(${Math.max(0.04, avance)})` }} />
            </div>
            <span className="fae-ap-avance__dato">{Math.min(actual + 1, total)} de {total}</span>
          </div>

          <ol ref={ruta} className="fae-ap-ruta" aria-label="Ruta del tema">
            {piezas.map((pz, i) => {
              const estado = i === actual ? "actual" : (modo === "secuencia" ? i < actual : vistas.has(i)) ? "hecha" : "pendiente";
              const contenido = (
                <>
                  <span className="fae-ap-ruta__num" aria-hidden="true">
                    {estado === "hecha" ? <Check size={16} strokeWidth={3} /> : i + 1}
                  </span>
                  <span className="fae-ap-ruta__texto">{pz.titulo}</span>
                </>
              );
              return (
                <li key={pz.id} aria-current={estado === "actual" ? "step" : undefined}>
                  {modo === "lista" ? (
                    <button type="button" className="fae-ap-ruta__paso" data-estado={estado} onClick={() => irA(pz)}>
                      {contenido}
                    </button>
                  ) : (
                    <span className="fae-ap-ruta__paso" data-estado={estado}>{contenido}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </>
      )}
    </section>
  );
}
