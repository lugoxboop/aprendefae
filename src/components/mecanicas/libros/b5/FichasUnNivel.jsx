import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { NEUTRO } from "../../../../data/contabilidadIntro.js";
import { Retro, Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { useReducido } from "../tema3/DosLineas.jsx";
import { volarCopia, cuantasFichas, BIEN, SEGUNDO } from "./EstanteDeCajones.jsx";
import { Marca, estiloE4, CORRECTA, TACHADA, APAGADA, TACHADO } from "./MarcasE4.jsx";

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
 *     el cajón queda ✓;
 *   · primer fallo: la ficha va al cajón tocado y rebota (340 + 340 ms; el
 *     coral de 420 ms en la ficha). Ese cajón queda ✕ y tachado, y no se
 *     puede volver a tocar en esta ficha;
 *   · segundo fallo: el tocado queda ✕ y la ficha va a su cajón correcto, que
 *     queda ✓; su lámina llega punteada (hoja 3, Shoko).
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
const BORDE = `1px solid ${NEUTRO}`;

/* La lectura de un cajón: «Fija con interés: 2 fichas», con «, 1 tras el segundo intento» si alguna llegó así. */
export function lecturaUnNivel(cajon, laminas = []) {
  const tras = laminas.filter((l) => l === SEGUNDO).length;
  return `${cajon.rotulo}: ${cuantasFichas(laminas.length)}${tras ? `, ${tras} tras el segundo intento` : ""}`;
}

/* La marca de cada cajón, después de lo que se tocó en esta ficha. */
export function marcasDe(cajones, tocados, correcta, fin) {
  return Object.fromEntries(cajones.map((c) => {
    if (fin && c.clave === correcta) return [c.clave, CORRECTA];
    if (tocados.includes(c.clave)) return [c.clave, TACHADA];
    return [c.clave, fin ? APAGADA : null];
  }));
}

function Cajon({ cajon, laminas = [], marca, puede, onTocar, refDe }) {
  const cuantas = laminas.length;
  return (
    <button ref={refDe(cajon.clave)} type="button" data-cajon={cajon.clave} data-cuantas={cuantas} data-marca={marca ?? ""}
      disabled={!puede} onClick={puede ? () => onTocar(cajon) : undefined}
      style={{
        boxSizing: "border-box", minHeight: "84px", minWidth: 0, width: "100%", padding: marca === CORRECTA ? "6px 4px" : "7px 5px",
        borderRadius: "10px", background: "rgba(10,20,34,0.4)", cursor: puede ? "pointer" : "default", textAlign: "left",
        display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "4px", color: FAE.text,
        ...estiloE4(marca, BORDE),
      }}>
      <span style={{ display: "flex", alignItems: "flex-start", gap: "4px" }}>
        <Marca marca={marca} />
        <span data-nombre-cajon style={{ fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "15px", overflowWrap: "anywhere", ...(marca === TACHADA ? TACHADO : null) }}>
          {cajon.rotulo}
        </span>
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
}) {
  const t = useTanda(() => items ?? config.sortear(barajar));
  const [r, setR] = useState(null);
  const [tocados, setTocados] = useState([]);
  const [respuestas, setRespuestas] = useState([]);
  const [rebotando, setRebotando] = useState(false);
  const [cuentas, setCuentas] = useState({});
  const [anuncio, setAnuncio] = useState("");
  const reloj = useRef(null);
  const zonaBoton = useRef(null);
  const ficha = useRef(null);
  const cajones = useRef({});
  const refDe = (clave) => (el) => { cajones.current[clave] = el; };
  const reducido = useReducido();

  const c = t.items[t.i];
  const cuantas = t.items.length;
  const pct = config.puntuar(respuestas, cuantas);
  const fin = Boolean(r) && (r.ok || tocados.length >= 2);
  const correcta = config.destino(c);

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(reloj.current), []);
  useEffect(() => {
    if (fin && !modoDemo) zonaBoton.current?.querySelector("button")?.focus();
  }, [fin]); // eslint-disable-line react-hooks/exhaustive-deps

  const tocar = (cajon) => {
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
    if (intento === 1) {
      t.anotar(c.id, nuevo.ok, nuevo.ok ? null : cajon.clave);
      if (nuevo.ok) setRespuestas((xs) => [...xs, { id: c.id, valor, primeroOk: true }]);
      setR({ ...nuevo, primero: true });
      return;
    }
    /* En el segundo intento la ficha vale la mitad de lo que habría valido. */
    setRespuestas((xs) => [...xs, { id: c.id, valor: valor / 2, primeroOk: false, segundoOk: nuevo.ok }]);
    /* setR reemplaza: tras un reintento acertado queda solo el ✅. */
    setR({ ...nuevo, primero: false });
  };

  const avanzar = () => {
    setR(null); setTocados([]); setRebotando(false);
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => {
    t.reiniciar(); setR(null); setTocados([]); setRespuestas([]); setCuentas({}); setAnuncio(""); setRebotando(false);
  };

  if (t.terminado) {
    const bien = respuestas.filter((x) => x.primeroOk).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <style>{CSS}</style>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p data-resumen style={TEXTO_CIERRE}>{config.resumen(bien, cuantas)}</p>
        </Cierre>
      </Marco>
    );
  }

  const marcas = marcasDe(config.cajones, tocados, correcta, fin);
  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      {!modoDemo && (
        <>
          <Encabezado objetivo={config.objetivo} consigna={config.consigna} onComoSeJuega={onComoSeJuega} />
          <div data-contador style={{ marginBottom: "12px" }}>
            <Pulsos total={cuantas} hechos={t.i + (fin ? 1 : 0)} enCurso={t.i + 1} etiqueta="Ficha" />
          </div>
        </>
      )}

      <p ref={ficha} data-ficha={c.id} className={rebotando ? "fae-b5u-rebota" : undefined} style={{
        margin: "0 0 10px", padding: "11px 13px", borderRadius: "11px",
        fontFamily: SORA, fontSize: "14px", fontWeight: 700, lineHeight: 1.3, color: FAE.text,
        background: "rgba(10,20,34,0.5)",
        border: `1px ${rebotando ? "dashed" : "solid"} ${rebotando ? FAE.coral : "rgba(248,249,250,0.2)"}`,
      }}>
        {c.texto}
      </p>

      <div data-estante role="group" aria-label={config.grupo} style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", columnGap: "6px" }}>
        {config.cajones.map((k) => (
          <Cajon key={k.clave} cajon={k} laminas={cuentas[k.clave]} marca={marcas[k.clave]}
            puede={!fin && !tocados.includes(k.clave)} onTocar={tocar} refDe={refDe} />
        ))}
      </div>
      <p data-anuncio-estante aria-live="polite" style={SOLO_LECTOR}>{anuncio}</p>

      {r && !fin && (
        <p data-fallo style={{
          margin: "9px 0 0", padding: "7px 10px", borderRadius: "10px",
          fontSize: "12px", textAlign: "center", color: "rgba(248,249,250,0.75)",
          border: `1px dashed ${FAE.coral}`,
        }}>
          La ficha no se colocó.
        </p>
      )}
      {r && <Retro texto={r.texto} />}

      {fin && !modoDemo && (
        <div ref={zonaBoton} data-boton-avanzar>
          <Responder onClick={avanzar}>{t.i + 1 === cuantas ? "Ver el resultado" : "Siguiente ficha"}</Responder>
        </div>
      )}

      {!modoDemo && <p style={SOLO_LECTOR}>{config.alt}</p>}
    </Marco>
  );
}
