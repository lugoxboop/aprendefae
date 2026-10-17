import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import EncabezadoCompacto from "./EncabezadoCompacto.jsx";
import { useReducido } from "../tema3/DosLineas.jsx";
import { volarCopia, cuantasFichas, BIEN, SEGUNDO } from "./EstanteDeCajones.jsx";
import { estiloE4, CORRECTA, TACHADA, APAGADA, REVELADA, TACHADO } from "./MarcasE4.jsx";
import { Pastilla, Mensaje, RegionViva, claseDe, botonDeAvance, CSS_B5H, CLASE_B5H, REPOSO_B, ERROR_B } from "./Devolucion.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS FICHAS A UN NIVEL — b5-t5-a1 y b5-t6-a1 (Célula B, lote 6a; hoja de
 * fusiones de Mai, §2).
 *
 * Los tres cajones del estante SON las tres opciones: tocar un cajón coloca la
 * ficha. No hay pestañas ni «Colocar la ficha». El orden: contador → ficha →
 * estante (debajo de la ficha: la ficha baja a su cajón) → devolución →
 * «Siguiente ficha».
 *
 * El estante es una fila de tres cajones-botón de ancho igual
 * (repeat(3, minmax(0, 1fr)), separación 6), de alto mínimo 84: el nombre
 * arriba (Inter 12/600), la pila de láminas abajo a la izquierda y el número
 * abajo a la derecha (Sora 14/700), como en la hoja 3.
 *
 * Dos intentos, como en el patrón:
 *   · acierto: la ficha vuela a su cajón (340 ms), la pila suma una lámina y
 *     el cajón queda «Correcto»;
 *   · primer fallo: la ficha va al cajón tocado y rebota (340 + 340 ms; el
 *     coral de 420 ms en la ficha). Ese cajón queda «No va aquí» y tachado, y no se
 *     puede volver a tocar en esta ficha. La devolución es la PISTA de la
 *     ficha (E5 de Futaba: cada ficha la suya, la escalera de ayuda de
 *     tema6/escaleraB5.js), en el bloque de mensaje como las demás;
 *   · segundo fallo: el tocado queda «No va aquí» y la ficha va a su cajón
 *     correcto, que queda «Iba aquí» (0,7 s después: ya no hay reintento); su
 *     lámina llega punteada (hoja 3, Shoko). La devolución dice la respuesta:
 *     el acierto tal cual, debajo de la pastilla «Iba aquí» (la regla única,
 *     b5SegundoFallo.js).
 *
 * LOTE 6d (estándar único de Hacer, Devolucion.jsx): los cajones van sin
 * relleno, con el contorno de reposo de 1 px .35; la pastilla con su palabra
 * va bajo el nombre y entra en el nombre accesible del cajón; el veredicto lo
 * da `r.ok` de la evaluación, nunca el texto. El último botón, «Ver mi
 * resumen».
 * «Siguiente ficha» borra las marcas; la pila y el número se quedan. Las
 * marcas son las de E4 (MarcasE4.jsx); al calificar, lo demás queda a 0,5.
 *
 * Todo lo que cambia de una actividad a otra llega en `config`: los textos,
 * los tres cajones (cada uno con lo que marca), el nombre del grupo, el
 * sorteo, la evaluación (la de siempre, con lo que marca el cajón), su
 * destino, el valor, el puntaje y el resumen.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
@keyframes fae-b5u-rebota {
  0% { transform: translateX(0); } 30% { transform: translateX(-5px); }
  60% { transform: translateX(4px); } 100% { transform: translateX(0); }
}
.fae-b5u-rebota { animation: fae-b5u-rebota 400ms ease-out 1; }
@media (prefers-reduced-motion: reduce) { .fae-b5u-rebota { animation: none !important; transform: none !important; } }
`;

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const VISIBLES = 4;

/* La lectura de un cajón: «Fija con interés: 2 fichas», con «, 1 tras el segundo intento» si alguna llegó así. */
export function lecturaUnNivel(cajon, laminas = []) {
  const tras = laminas.filter((l) => l === SEGUNDO).length;
  return `${cajon.rotulo}: ${cuantasFichas(laminas.length)}${tras ? `, ${tras} tras el segundo intento` : ""}`;
}

/* La marca de cada cajón, después de lo que se tocó en esta ficha. */
export function marcasDe(cajones, tocados, correcta, fin) {
  return Object.fromEntries(cajones.map((c) => {
    /* Lote 6d: si nunca se tocó la correcta (segundo fallo), se revela: «Iba aquí». */
    if (fin && c.clave === correcta) return [c.clave, tocados.includes(correcta) ? CORRECTA : REVELADA];
    if (tocados.includes(c.clave)) return [c.clave, TACHADA];
    return [c.clave, fin ? APAGADA : null];
  }));
}

function Cajon({ cajon, laminas = [], marca, puede, onTocar, refDe, extra = null }) {
  const cuantas = laminas.length;
  return (
    <button ref={refDe(cajon.clave)} type="button" data-cajon={cajon.clave} data-cuantas={cuantas} data-marca={marca ?? ""}
      disabled={!puede} onClick={puede ? () => onTocar(cajon) : undefined} className={claseDe(marca)}
      style={{
        boxSizing: "border-box", minHeight: "84px", minWidth: 0, width: "100%", padding: marca === CORRECTA || marca === TACHADA ? "6px 4px" : "7px 5px",
        borderRadius: "10px", background: "transparent", cursor: puede ? "pointer" : "default", textAlign: "left",
        display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "4px", color: FAE.text,
        ...estiloE4(marca, REPOSO_B),
      }}>
      <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
        <span data-nombre-cajon style={{ fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "15px", overflowWrap: "anywhere", ...(marca === TACHADA ? TACHADO : null) }}>
          {cajon.rotulo}
        </span>
        <Pastilla marca={marca} envuelve />
        {/* C4 (prop opcional `c4`): lo que el cajón tocado muestra. Sin `c4`, nada. */}
        {extra}
      </span>
      <span aria-hidden="true" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        {/* La pila: crece hacia arriba; caben cuatro a la vista. */}
        <span data-pila style={{ display: "flex", flexDirection: "column-reverse", gap: "2px", width: "16px", minHeight: `${VISIBLES * 4 + (VISIBLES - 1) * 2}px` }}>
          {laminas.slice(-VISIBLES).map((l, k) => (
            <span key={k} data-lamina={l} style={{
              display: "block", height: "4px", boxSizing: "border-box", borderRadius: "1px",
              ...(l === SEGUNDO ? { border: `1px dashed ${FAE.text}`, background: "transparent" } : { background: FAE.text }),
            }} />
          ))}
        </span>
        <span data-numero style={{ fontFamily: SORA, fontSize: "14px", fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{cuantas}</span>
      </span>
    </button>
  );
}

export default function FichasUnNivel({
  config, Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null,
  /*
   * C4 · «toda decisión se pinta» (Célula C, opcional; sin ella, todo como siempre):
   * { consecuencia(ficha, clave) → estado, Cajon({ estado, cajon, anim }), Nota({ estado, vista }), espera, css }.
   * Al tocar un cajón, su consecuencia se pinta en el acto (el cajón muestra `Cajon`); la evaluación de
   * siempre (vuelo, marcas, pastilla, mensaje, puntaje y `detalle`) llega `espera` ms después, al
   * instante con movimiento reducido. `Nota` (lo que implica el cajón) va bajo el estante con el veredicto.
   */
  c4 = null,
}) {
  const t = useTanda(() => items ?? config.sortear(barajar));
  const [r, setR] = useState(null);
  const [tocados, setTocados] = useState([]);
  const [respuestas, setRespuestas] = useState([]);
  const [rebotando, setRebotando] = useState(false);
  const [cuentas, setCuentas] = useState({});
  const [anuncio, setAnuncio] = useState("");
  /*
   * Lote 19 (D4, P2 de Mai): la segunda decisión, opcional (`config.segunda`). Sin ella, nada cambia.
   * `etapa` 1 es el cajón; 2, la decisión que pregunta otra cosa y mueve su modelo (`segunda.Vista`).
   * Con `aplica(ficha)` en «antes», la ficha se juega solo con la 2 y entra después a su cajón; con
   * «despues», la 2 sigue a la 1 y suma una decisión más al puntaje.
   */
  const segunda = config.segunda ?? null;
  const [etapa, setEtapa] = useState(1);
  const [elegidas, setElegidas] = useState([]);
  const [historial, setHistorial] = useState([]);
  const reloj = useRef(null);
  const zonaBoton = useRef(null);
  const ficha = useRef(null);
  const cajones = useRef({});
  const refDe = (clave) => (el) => { cajones.current[clave] = el; };
  const reducido = useReducido();
  const [pintadas, setPintadas] = useState({});
  const [ultimaC4, setUltimaC4] = useState(null);
  const [espera, setEspera] = useState(null);
  const relojC4 = useRef(null);

  const c = t.items[t.i];
  const cuantas = t.items.length;
  const modo = segunda?.aplica(c) ?? null;
  const enDos = modo === "antes" || etapa === 2;
  /* Con la segunda decisión, el puntaje se reparte entre todas las decisiones de la tanda. */
  const decisiones = cuantas + (segunda ? t.items.filter((x) => segunda.aplica(x) === "despues").length : 0);
  const pct = config.puntuar(respuestas, decisiones);
  const fin2 = Boolean(r) && (r.ok || elegidas.length >= 2);
  const fin = enDos ? fin2 : Boolean(r) && (r.ok || tocados.length >= 2) && modo !== "despues";
  const correcta = config.destino(c);

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { clearTimeout(reloj.current); clearTimeout(relojC4.current); }, []);
  useEffect(() => {
    if (fin && !modoDemo) zonaBoton.current?.querySelector("button")?.focus();
  }, [fin]); // eslint-disable-line react-hooks/exhaustive-deps

  /* C4: la consecuencia primero; la evaluación de siempre (tocarYa), `c4.espera` después. Sin `c4`, tocarYa. */
  const tocar = (cajon) => {
    if (!c4) { tocarYa(cajon); return; }
    if (fin || tocados.includes(cajon.clave) || espera != null) return;
    setPintadas((x) => ({ ...x, [cajon.clave]: c4.consecuencia(c, cajon.clave) }));
    setUltimaC4(cajon.clave);
    if (reducido) { tocarYa(cajon); return; }
    setEspera(cajon.clave);
    clearTimeout(relojC4.current);
    relojC4.current = setTimeout(() => { setEspera(null); tocarYa(cajon); }, c4.espera);
  };

  const tocarYa = (cajon) => {
    if (fin || tocados.includes(cajon.clave)) return;
    const intento = tocados.length + 1;
    const nuevo = config.evaluar(c, cajon.marcado, intento);
    const valor = config.valor(c, nuevo);
    const termina = nuevo.ok || intento === 2;

    /* La ficha vuela: al cajón correcto si queda colocada; al tocado y de vuelta si es el primer fallo. */
    const destino = termina ? correcta : cajon.clave;
    const vuelo = volarCopia(ficha.current, cajones.current[destino], { rebote: !termina, reducido });
    if (termina) {
      const lamina = nuevo.ok ? BIEN : SEGUNDO;
      vuelo.then(() => {
        setCuentas((x) => {
          const laminas = [...(x[correcta] ?? []), lamina];
          setAnuncio(lecturaUnNivel(config.cajones.find((k) => k.clave === correcta), laminas));
          return { ...x, [correcta]: laminas };
        });
      });
    }
    if (!nuevo.ok) {
      setRebotando(true);
      clearTimeout(reloj.current);
      reloj.current = setTimeout(() => setRebotando(false), 420);
    }

    setTocados((xs) => [...xs, cajon.clave]);
    /* Lote 19: si sigue la segunda decisión, la primera se anota y se pasa a la 2 sin su devolución (diría la respuesta de la 2). */
    if (modo === "despues" && termina) {
      if (intento === 1) t.anotar(c.id, nuevo.ok, nuevo.ok ? null : cajon.clave);
      setRespuestas((xs) => [...xs, { id: c.id, valor: intento === 1 ? valor : valor / 2, primeroOk: intento === 1 && nuevo.ok }]);
      setR(null);
      setEtapa(2);
      return;
    }
    if (intento === 1) {
      t.anotar(c.id, nuevo.ok, nuevo.ok ? null : cajon.clave);
      if (nuevo.ok) setRespuestas((xs) => [...xs, { id: c.id, valor, primeroOk: true }]);
      setR({ ...nuevo, primero: true });
      return;
    }
    /* En el segundo intento la ficha vale la mitad de lo que habría valido. */
    setRespuestas((xs) => [...xs, { id: c.id, valor: valor / 2, primeroOk: false, segundoOk: nuevo.ok }]);
    /* setR reemplaza: tras un reintento acertado queda solo el acierto. */
    setR({ ...nuevo, primero: false });
  };

  /* Lote 19: la segunda decisión. Pista al primer error; al segundo, el porqué (C2). */
  const elegir = (id) => {
    if (fin2 || elegidas.includes(id)) return;
    const intento = elegidas.length + 1;
    const nuevo = segunda.evaluar(c, id, intento);
    const termina = nuevo.ok || intento === 2;
    setElegidas((xs) => [...xs, id]);
    if (intento === 1) t.anotar(`${c.id}/2`, nuevo.ok, nuevo.ok ? null : id);
    if (termina) {
      setRespuestas((xs) => [...xs, { id: `${c.id}/2`, valor: nuevo.ok ? (intento === 1 ? 1 : 0.5) : 0, primeroOk: nuevo.ok && intento === 1 }]);
      setHistorial((xs) => [...xs, { ficha: c, n: t.i + 1, elegidas: [...elegidas, id], correcta: segunda.correcta(c) }]);
      /* La ficha que se jugó solo con la 2 entra a su cajón, como en la 1. */
      if (modo === "antes") {
        const lamina = nuevo.ok && intento === 1 ? BIEN : SEGUNDO;
        volarCopia(ficha.current, cajones.current[correcta], { reducido }).then(() => {
          setCuentas((x) => {
            const laminas = [...(x[correcta] ?? []), lamina];
            setAnuncio(lecturaUnNivel(config.cajones.find((k) => k.clave === correcta), laminas));
            return { ...x, [correcta]: laminas };
          });
        });
      }
    }
    setR({ ...nuevo, primero: intento === 1 });
  };

  const avanzar = () => {
    setR(null); setTocados([]); setRebotando(false); setEtapa(1); setElegidas([]);
    if (c4) { setPintadas({}); setUltimaC4(null); }
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => {
    t.reiniciar(); setR(null); setTocados([]); setRespuestas([]); setCuentas({}); setAnuncio(""); setRebotando(false);
    setEtapa(1); setElegidas([]); setHistorial([]);
    if (c4) { clearTimeout(relojC4.current); setPintadas({}); setUltimaC4(null); setEspera(null); }
  };

  if (t.terminado) {
    /* Bien al primer intento: la ficha con todas sus decisiones a la primera (con una sola decisión, lo de siempre). */
    const deFicha = (x) => x.id.replace(/\/2$/, "");
    const bien = t.items.filter((f) => respuestas.some((x) => deFicha(x) === f.id) && respuestas.filter((x) => deFicha(x) === f.id).every((x) => x.primeroOk)).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <style>{CSS}</style>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p data-resumen style={TEXTO_CIERRE}>{config.resumen(bien, cuantas)}</p>
        </Cierre>
      </Marco>
    );
  }

  /*
   * Lote 22 (bug de #440): en la decisión 2 el `fin` es el de la 2, pero la 1 ya terminó; sin esto, el cajón
   * correcto ya tocado salía «No va aquí» hasta el final de la 2.
   */
  const marcas = marcasDe(config.cajones, tocados, correcta, fin || (modo === "despues" && etapa === 2));
  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS + CSS_B5H + (c4?.css ?? "")}</style>
      <div className={CLASE_B5H}>
      {!modoDemo && (
        <>
          {/* Lote 6b (B1 de t5-a1): el encabezado compacto de Mai; la consigna y los pasos, plegados. */}
          <EncabezadoCompacto objetivo={config.objetivo} consigna={config.consigna} pasos={config.reglas}
            contador={`Ficha ${t.i + 1} de ${cuantas}`} />
        </>
      )}

      <p ref={ficha} data-ficha={c.id} className={rebotando ? "fae-b5u-rebota" : undefined} style={{
        margin: "0 0 10px", padding: "11px 13px", borderRadius: "11px",
        fontFamily: SORA, fontSize: "14px", fontWeight: 700, lineHeight: 1.3, color: FAE.text,
        background: "rgba(10,20,34,0.5)",
        /* Lote 6d: el rebote, 2 px sólido coral; en reposo, el contorno de 1 px .35. El borde de 2 se come 1 px del relleno. */
        ...(rebotando ? { border: ERROR_B, padding: "10px 12px" } : { border: REPOSO_B }),
      }}>
        {c.texto}
      </p>

      <div data-estante role="group" aria-label={config.grupo} style={{ display: "grid", gridTemplateColumns: `repeat(${config.cajones.length}, minmax(0, 1fr))`, columnGap: "6px" }}>
        {config.cajones.map((k) => (
          <Cajon key={k.clave} cajon={k} laminas={cuentas[k.clave]} marca={modo === "antes" ? null : marcas[k.clave]}
            puede={!fin && !enDos && !tocados.includes(k.clave) && espera == null} onTocar={tocar} refDe={refDe}
            extra={c4 && pintadas[k.clave] ? <c4.Cajon estado={pintadas[k.clave]} cajon={k} anim={!reducido} /> : null} />
        ))}
      </div>
      {segunda && (enDos || segunda.persistente) && (
        <segunda.Vista ficha={c} activa={enDos && !fin2} elegidas={enDos ? elegidas : []} correcta={enDos ? segunda.correcta(c) : null}
          fin={enDos && fin2} onElegir={elegir} historial={historial} numero={t.i + 1} reducido={reducido} />
      )}
      {c4 && ultimaC4 && !enDos && <c4.Nota estado={pintadas[ultimaC4]} vista={{ veredicto: espera == null && r != null, cerrado: fin }} />}
      <p data-anuncio-estante aria-live="polite" style={SOLO_LECTOR}>{anuncio}</p>

      {r && !fin && !enDos && (
        <p data-fallo style={{
          margin: "9px 0 0", padding: "7px 10px", borderRadius: "10px",
          fontSize: "12px", textAlign: "center", color: "rgba(248,249,250,0.75)",
          border: `1px dashed ${FAE.coral}`,
        }}>
          La ficha volvió. Lee la pista y pruébala en otro cajón.
        </p>
      )}
      {/* El veredicto es el estado de la evaluación (`r.ok`), no el texto. */}
      <RegionViva>{r && <Mensaje ok={r.ok} texto={r.texto} />}</RegionViva>

      {fin && !modoDemo && (
        <div ref={zonaBoton} data-boton-avanzar>
          <Responder onClick={avanzar}>{botonDeAvance("Ficha", t.i + 1 === cuantas)}</Responder>
        </div>
      )}

      {!modoDemo && <p style={SOLO_LECTOR}>{config.alt}</p>}
      </div>
    </Marco>
  );
}
