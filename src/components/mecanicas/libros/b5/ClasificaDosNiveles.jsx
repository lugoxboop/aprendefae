import { useEffect, useId, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { NEUTRO, NAVY_DEL_CHIP, TEXTO_ATENUADO } from "../../../../data/contabilidadIntro.js";
import { pesoDeCadaItem } from "../../../../contabilidad/tema1.js";
import { Retro, Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { useReducido } from "../tema3/DosLineas.jsx";
import EstanteDeCajones, { claveDe, nombreLeido, cuantasFichas } from "./EstanteDeCajones.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CLASIFICAR EN DOS NIVELES — el componente de la Célula B que usan
 * b5-t5-a1 («¿Qué renta da este título?») y b5-t6-a1 («¿Clientes o otra
 * cuenta por cobrar?»).
 *
 * Es el patrón de T1-6 (EnCualEstadoAparece.jsx), replicado sin tocar el de
 * T1: una ficha, dos pestañas apiladas y, bajo la que abre, un panel unido
 * con el segundo nivel. Reintento a la mitad, 60 % el primer nivel y 40 % el
 * segundo. Diseño: la guía v2 de Mai de b5-t5-a1 (paquetes/b5-t5-act1.md):
 * pestañas de una línea, alto mínimo de 44, segundo nivel a 12 px, sin
 * rótulo entre los niveles.
 *
 * Todo lo que cambia de una actividad a otra llega en `config`: los textos,
 * las dos listas de opciones, cuál abre el segundo nivel, el sorteo, la
 * evaluación, el valor de cada ficha, el puntaje y el resumen. Este archivo
 * no escribe texto propio salvo el aviso compartido «La ficha no se colocó.»
 * y los rótulos fijos de T1-6.
 *
 * La devolución sale por Retro, con el ✅ o el ❌ al inicio del texto.
 *
 * Calidad (hoja 3 de Mai): entre el contador y la ficha, el estante de
 * cajones (EstanteDeCajones.jsx), uno por respuesta final. Al acertar, una
 * copia de la ficha vuela a su cajón; en el primer fallo va al elegido y
 * rebota; en el segundo fallo va a su cajón CORRECTO (`config.destino`).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
@keyframes fae-b5c-entra { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: none; } }
.fae-b5c-entra { animation: fae-b5c-entra 280ms ease-out both; }
@keyframes fae-b5c-rebota {
  0% { transform: translateX(0); } 30% { transform: translateX(-5px); }
  60% { transform: translateX(4px); } 100% { transform: translateX(0); }
}
.fae-b5c-rebota { animation: fae-b5c-rebota 400ms ease-out 1; }
@media (prefers-reduced-motion: reduce) {
  .fae-b5c-entra, .fae-b5c-rebota { animation: none !important; opacity: 1 !important; transform: none !important; }
}
`;

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";

/* El rótulo del botón, según lo elegido. */
export function rotuloDelBoton(config, n1, n2) {
  if (!n1) return config.botones.nada;
  if (n1 === config.abre && !n2) return config.botones.falta;
  return config.botones.colocar;
}

export default function ClasificaDosNiveles({
  config, Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null,
}) {
  const t = useTanda(() => items ?? config.sortear(barajar));
  const idPanel = useId();

  const [n1, setN1] = useState(null);
  const [n2, setN2] = useState(null);
  const [r, setR] = useState(null);
  const [intento, setIntento] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [rebotando, setRebotando] = useState(false);
  const reloj = useRef(null);
  const zonaBoton = useRef(null);
  const reducido = useReducido();
  const estante = useRef(null);
  const ficha = useRef(null);
  const [cuentas, setCuentas] = useState({});
  const [anuncio, setAnuncio] = useState("");
  const conEstante = !modoDemo && typeof config.destino === "function";

  const c = t.items[t.i];
  const cuantas = t.items.length;
  const pct = config.puntuar(respuestas, cuantas);
  const esperandoReintento = Boolean(r && !r.ok && intento === 1);
  const puedeResponder = !r || esperandoReintento;
  /* Con la opción que no abre panel no hay segundo nivel: la respuesta ya está. */
  const completo = n1 === config.abre ? Boolean(n2) : Boolean(n1);

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(reloj.current), []);
  useEffect(() => {
    if (r && !esperandoReintento && !modoDemo) zonaBoton.current?.querySelector("button")?.focus();
  }, [r, esperandoReintento]); // eslint-disable-line react-hooks/exhaustive-deps

  const enviar = () => {
    if (!completo || (r && !esperandoReintento)) return;
    const marcado = { n1, n2: n1 === config.abre ? n2 : null };
    const nuevo = config.evaluar(c, marcado, intento === 0 ? 1 : 2);
    const valor = config.valor(c, nuevo);

    /* El estante: lo que queda colocado va a su cajón correcto; el primer fallo va al elegido y vuelve. */
    if (conEstante) {
      const fin = nuevo.ok || intento > 0;
      const d = config.destino(c);
      const clave = fin ? claveDe(d.n1, d.n2) : claveDe(marcado.n1, marcado.n2);
      const vuelo = estante.current?.volar(clave, ficha.current, { rebote: !fin }) ?? Promise.resolve();
      if (fin) {
        vuelo.then(() => {
          setCuentas((x) => {
            const n = (x[clave] ?? 0) + 1;
            setAnuncio(`${nombreLeido(config, clave)}: ${cuantasFichas(n)}`);
            return { ...x, [clave]: n };
          });
        });
      }
    }

    if (!nuevo.ok) {
      setRebotando(true);
      clearTimeout(reloj.current);
      reloj.current = setTimeout(() => setRebotando(false), 420);
    }

    if (intento === 0) {
      t.anotar(c.id, nuevo.ok, nuevo.ok ? null : `${marcado.n1}${marcado.n2 ? `/${marcado.n2}` : ""}`);
      if (!nuevo.ok) { setR({ ...nuevo, primero: true }); setIntento(1); return; }
      setRespuestas((xs) => [...xs, { id: c.id, valor, primeroOk: true }]);
      setR({ ...nuevo, primero: true });
      return;
    }
    /* En el segundo intento la ficha vale la mitad de lo que habría valido. */
    setRespuestas((xs) => [...xs, { id: c.id, valor: valor / 2, primeroOk: false, segundoOk: nuevo.ok }]);
    setIntento(2);
    /* setR reemplaza: tras un reintento acertado queda solo el ✅. */
    setR({ ...nuevo, primero: false });
  };

  const avanzar = () => {
    setR(null); setIntento(0); setN1(null); setN2(null); setRebotando(false);
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => {
    t.reiniciar(); setR(null); setIntento(0); setRespuestas([]); setCuentas({}); setAnuncio("");
    setN1(null); setN2(null); setRebotando(false);
  };

  if (t.terminado) {
    const bien = respuestas.filter((x) => x.primeroOk).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <style>{CSS}</style>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p data-resumen style={TEXTO_CIERRE}>
            {config.resumen(bien, cuantas, pesoDeCadaItem(cuantas).toFixed(2))}
          </p>
        </Cierre>
      </Marco>
    );
  }

  /* Reglas de las pestañas (guía §2.5). */
  const elegirN1 = (id) => {
    if (!puedeResponder || id === n1) return;
    setN1(id);
    /* Al cambiar de pestaña se borra el segundo nivel: era de la otra. */
    setN2(null);
  };

  /* Pestaña y opción comparten el alto mínimo de 44 y el texto centrado. */
  const centrado = { display: "flex", alignItems: "center", minHeight: "44px", width: "100%", boxSizing: "border-box", textAlign: "left" };

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      {!modoDemo && (
        <>
          <Encabezado objetivo={config.objetivo} consigna={config.consigna} onComoSeJuega={onComoSeJuega} />
          <div style={{ marginBottom: "12px" }}>
            <Pulsos total={cuantas} hechos={t.i + (r && !esperandoReintento ? 1 : 0)} enCurso={t.i + 1} etiqueta="Ficha" />
          </div>
        </>
      )}
      {conEstante && (
        <EstanteDeCajones ref={estante} config={config} cuentas={cuentas} n1={n1} n2={n1 === config.abre ? n2 : null}
          reducido={reducido} anuncio={anuncio} />
      )}

      <div data-contenido>
        <p
          ref={ficha}
          data-ficha={c.id}
          className={rebotando ? "fae-b5c-rebota" : undefined}
          style={{
            margin: "0 0 12px", padding: "11px 13px", borderRadius: "11px",
            fontFamily: SORA, fontSize: "14px", fontWeight: 700, lineHeight: 1.3, color: FAE.text,
            background: "rgba(10,20,34,0.5)",
            border: `1px ${rebotando ? "dashed" : "solid"} ${rebotando ? FAE.coral : "rgba(248,249,250,0.2)"}`,
          }}
        >
          {c.texto}
        </p>

        <div data-pestanas style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {config.nivel1.map((ren) => {
            const activa = n1 === ren.id;
            const abre = ren.id === config.abre;
            const conPanel = activa && abre;
            /* Lo que ya no se puede elegir se atenúa en borde y fondo, no entero (T1-6). */
            const tenue = !puedeResponder && !activa;
            return (
              <div key={ren.id}>
                <button
                  type="button"
                  data-nivel1={ren.id}
                  data-elegido={activa ? "si" : "no"}
                  aria-pressed={activa}
                  aria-expanded={abre ? activa : undefined}
                  aria-controls={abre ? idPanel : undefined}
                  disabled={!puedeResponder}
                  onClick={() => elegirN1(ren.id)}
                  style={{
                    ...centrado,
                    padding: "9px 11px", borderRadius: conPanel ? "10px 10px 0 0" : "10px",
                    cursor: puedeResponder ? "pointer" : "default",
                    background: activa ? "rgba(184,196,212,0.12)" : tenue ? "rgba(10,20,34,0.2)" : "rgba(10,20,34,0.4)",
                    borderStyle: "solid",
                    borderWidth: conPanel ? "2px 2px 0 2px" : activa ? "2px" : "1px",
                    borderColor: activa ? NEUTRO : tenue ? "rgba(248,249,250,0.08)" : "rgba(248,249,250,0.16)",
                    color: tenue ? TEXTO_ATENUADO : FAE.text,
                    fontFamily: SORA, fontSize: "12.5px", fontWeight: 700, lineHeight: 1.25,
                  }}
                >
                  <span data-rotulo-nivel1 style={{ display: "block", whiteSpace: "nowrap" }}>{ren.rotulo}</span>
                </button>

                {conPanel && (
                  <div
                    id={idPanel}
                    role="group"
                    aria-label={ren.rotulo}
                    data-panel-segundo
                    className="fae-b5c-entra"
                    style={{
                      padding: "8px 11px 10px", borderRadius: "0 0 10px 10px",
                      background: "rgba(184,196,212,0.06)",
                      border: `2px solid ${NEUTRO}`, borderTop: "none",
                      display: "flex", flexDirection: "column", gap: "5px",
                    }}
                  >
                    {config.nivel2.map((ti) => {
                      const esta = n2 === ti.id;
                      return (
                        <button
                          key={ti.id}
                          type="button"
                          data-nivel2={ti.id}
                          data-marcada={esta ? "si" : "no"}
                          aria-pressed={esta}
                          disabled={!puedeResponder}
                          onClick={puedeResponder ? () => setN2(ti.id) : undefined}
                          style={{
                            ...centrado,
                            padding: "7px 9px", borderRadius: "8px",
                            cursor: puedeResponder ? "pointer" : "default",
                            background: esta ? NEUTRO : "rgba(10,20,34,0.4)",
                            border: `1px solid ${esta ? NEUTRO : "rgba(248,249,250,0.18)"}`,
                            color: esta ? NAVY_DEL_CHIP : FAE.text,
                            fontFamily: INTER, fontSize: "12px", lineHeight: 1.3,
                          }}
                        >
                          {ti.rotulo}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {esperandoReintento && (
          <p data-fallo style={{
            margin: "9px 0 0", padding: "7px 10px", borderRadius: "10px",
            fontSize: "12px", textAlign: "center", color: "rgba(248,249,250,0.75)",
            border: `1px dashed ${FAE.coral}`,
          }}>
            La ficha no se colocó.
          </p>
        )}
      </div>

      {r && <Retro texto={r.texto} />}

      {puedeResponder && (
        <div data-boton-colocar>
          <Responder onClick={enviar} deshabilitado={!completo}>
            {rotuloDelBoton(config, n1, n2)}
          </Responder>
        </div>
      )}
      {r && !esperandoReintento && !modoDemo && (
        <div ref={zonaBoton} data-boton-avanzar>
          <Responder onClick={avanzar}>
            {t.i + 1 === cuantas ? "Ver el resultado" : "Siguiente ficha"}
          </Responder>
        </div>
      )}

      {!modoDemo && <p style={SOLO_LECTOR}>{config.alt}</p>}
    </Marco>
  );
}
