import { Camera, Film, FileText } from "lucide-react";
import { FAE } from "../../../../../theme.js";
import { NEUTRO } from "../../../../../data/contabilidadIntro.js";
import {
  ID_P3, NOMBRES_P3, FOTOS, ROTULO_BANDA, RANGO_BANDA, PREGUNTAS_P3, FOTO, PELICULA, COMPARAR,
} from "../../../../../data/contabilidadPiezas234.js";
import { A3_SEC, deFicha } from "../../../../../data/contabilidadT1Secuencia.js";
import { evaluarP3, escenaDeAcierto } from "../../../../../contabilidad/aprenderTema1.js";
import {
  MarcoFigura, Escenario, Nota, Fila, Tocable, SORA, INTER, SECUNDARIO, NAVY,
  paradaResuelta, ParadaModelo, figuraFrase, itemsDe, itemsResueltos, itemDelPaso, responderItem,
  CANTO, N2, SILUETA, conFases,
} from "./figurasT1.jsx";
import { pick, sinApoyo } from "./piezaRecorrido.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * cu0-a3 · LA FOTO Y LA PELÍCULA, EN SECUENCIA — 10 pantallas (Mai §8.1).
 *
 * La figura es la de LineaDelTiempo.jsx: foto del 1 de enero arriba, la banda
 * del año en medio, foto del 31 de diciembre abajo, y las dos fotos SIEMPRE
 * del mismo tamaño (un hueco vacío mide lo mismo que una foto). La publicada
 * no cabe en el escenario de 184 (cada foto mide ~78 con sus dos líneas):
 * aquí cada foto lleva la fecha y sus dos rótulos en un renglón, y el texto
 * entero de cada línea va al lector de pantalla. En las paradas la línea va
 * en su forma compacta (fechas cortas de RANGO_BANDA), al lado de la
 * devolución. Sin pulso y sin nodos: la banda no es el riel de la pieza 1.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const T = A3_SEC.pantallas;
const F = (n) => deFicha(ID_P3, n);
const textoDe = (o) => o?.texto ?? null;
const [ENERO, DICIEMBRE] = FOTOS;
const CORTA = Object.fromEntries(RANGO_BANDA.split(" – ").map((t, k) => [FOTOS[k].id, t]));
const SOLO_LECTOR = { position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" };

/* ═══════════ LAS FORMAS ═══════════ */
const ALTO_FOTO = 48;
const ALTO_FOTO_COMPACTA = 28;

/*
 * Una foto, o su hueco (punteado, del mismo tamaño). `onTocar` la vuelve
 * botón; `resaltada` le pone el borde de 2 px (lo que responde la pregunta).
 */
export function FotoSec({ foto, hueco = false, signo = null, resaltada = false, compacta = false, onTocar = null, invitacion = null }) {
  const alto = compacta ? ALTO_FOTO_COMPACTA : ALTO_FOTO;
  const caja = {
    boxSizing: "border-box", height: `${alto}px`, width: "100%", padding: compacta ? "0 6px" : "0 10px", borderRadius: compacta ? "8px" : "10px",
    display: "flex", flexDirection: "column", justifyContent: "center", alignItems: hueco ? "center" : "flex-start", textAlign: "left",
    background: hueco ? "transparent" : resaltada ? "rgba(184,196,212,0.16)" : "rgba(10,20,34,0.5)",
    border: hueco ? `2px dashed ${onTocar ? "rgba(248,249,250,.5)" : "rgba(184,196,212,.45)"}` : `${resaltada ? 2 : 1}px solid ${resaltada ? NEUTRO : SILUETA}`,
    font: "inherit", color: FAE.text, margin: 0, cursor: onTocar ? "pointer" : "default",
  };
  const dentro = hueco ? (
    <span style={{ fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "16px", color: SECUNDARIO }}>{invitacion ?? signo ?? ""}</span>
  ) : (
    <>
      <span data-fecha={foto.fecha} style={{ fontFamily: SORA, fontSize: "12px", fontWeight: 700, lineHeight: "16px", color: FAE.text, whiteSpace: "nowrap" }}>
        {compacta ? CORTA[foto.id] : foto.fecha}
      </span>
      {!compacta && (
        <span aria-hidden="true" style={{ fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: SECUNDARIO }}>
          {foto.lineas.map((l) => l.rotulo).join(" · ")}
        </span>
      )}
      <span style={SOLO_LECTOR}>{foto.lineas.map((l) => `${l.rotulo}: ${l.texto}`).join(". ")}</span>
    </>
  );
  const datos = { "data-foto-sec": foto.id, "data-hueco": hueco ? "si" : undefined, "data-resaltada": resaltada ? "si" : undefined };
  if (onTocar) return <button type="button" className={CANTO} data-tocable {...datos} onClick={onTocar} style={{ ...caja, background: hueco ? N2 : caja.background }}>{dentro}</button>;
  return <div {...datos} className={hueco ? undefined : "fae-t1s-aparece"} style={caja}>{dentro}</div>;
}

/* La banda del año: un bloque ancho que se llena de punta a punta (sin nodos ni pulso). */
export function BandaSec({ llena = false, resaltada = false, alto = 44, compacta = false, onTocar = null, invitacion = null }) {
  const caja = {
    boxSizing: "border-box", height: `${alto}px`, width: "100%", padding: compacta ? 0 : "0 10px", borderRadius: "8px", margin: 0,
    display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", font: "inherit",
    background: llena ? (resaltada ? NEUTRO : "rgba(184,196,212,0.35)") : "transparent",
    border: llena ? `${resaltada ? 2 : 1}px solid ${NEUTRO}` : `2px ${onTocar ? "dashed rgba(248,249,250,.5)" : "solid rgba(184,196,212,.3)"}`,
    color: llena && resaltada ? NAVY : FAE.text, cursor: onTocar ? "pointer" : "default",
  };
  const texto = compacta ? null : invitacion ?? (llena ? ROTULO_BANDA : RANGO_BANDA);
  const dentro = texto && <span style={{ fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "16px" }}>{texto}</span>;
  const datos = { "data-banda": llena ? "llena" : "vacia", "data-resaltada": resaltada ? "si" : undefined };
  if (onTocar) return <button type="button" className={CANTO} data-tocable {...datos} onClick={onTocar} style={{ ...caja, background: llena ? caja.background : N2 }}>{dentro}</button>;
  return <div {...datos} aria-hidden={compacta || undefined} style={caja}>{dentro}</div>;
}

/* La línea compacta de las paradas: 64 de ancho, fechas cortas. `escena`: lo que se resalta (evaluarP3). */
export function LineaCompacta({ dic = "hueco", banda = false, escena = null, foto = "diciembre" }) {
  const unaFoto = escena === "una-foto";
  return (
    <div data-linea-compacta data-escena={escena ?? undefined} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <FotoSec compacta foto={ENERO} resaltada={escena === "dos-fotos" || (unaFoto && foto === ENERO.id)} />
      <BandaSec compacta alto={20} llena={banda || escena === "banda"} resaltada={escena === "banda"} />
      {dic === "hueco"
        ? <FotoSec compacta hueco foto={DICIEMBRE} signo="?" />
        : <FotoSec compacta foto={DICIEMBRE} resaltada={escena === "dos-fotos" || (unaFoto && foto === DICIEMBRE.id)} />}
    </div>
  );
}

/* ═══════════ 1 · La predicción ═══════════ */
const RESPUESTA = textoDe(F(1).respuesta);
function FiguraPrediccion({ estado, setEstado }) {
  const elegida = estado?.elegida ?? null;
  return (
    <MarcoFigura>
      <Escenario>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Camera aria-hidden="true" size={22} strokeWidth={1.75} color={SECUNDARIO} style={{ flex: "none" }} />
          <FotoSec foto={DICIEMBRE} />
        </div>
        <Fila
          opciones={T.prediccion.opciones.map((t) => ({ id: t, texto: t }))}
          estadoDe={(id) => (id === elegida ? "acierto" : "reposo")}
          onElegir={(id) => setEstado({ elegida: id })}
          activa={elegida === null}
          data="data-prediccion"
        />
        {elegida !== null && <Nota data-respuesta-prediccion>{RESPUESTA}</Nota>}
      </Escenario>
    </MarcoFigura>
  );
}

/* ═══════════ 2 · Dos informes, con sus citas ═══════════ */
const INFORMES = [
  { id: "foto", nombre: NOMBRES_P3[0], texto: T.informes.pasos[0] },
  { id: "pelicula", nombre: NOMBRES_P3[1], texto: T.informes.pasos[1] },
];
function FiguraInformes({ estado, setEstado }) {
  const vistos = estado?.vistos ?? [];
  const ultimo = estado?.ultimo ?? null;
  const tocar = (k) => setEstado({ vistos: vistos.includes(k) ? vistos : [...vistos, k], ultimo: k });
  const inf = INFORMES.find((i) => i.id === ultimo);
  return (
    <MarcoFigura>
      <Escenario plano gap={4}>
        <div role="group" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
          {INFORMES.map((i) => (
            <Tocable key={i.id} data-tocable data-informe-sec={i.id} on={ultimo === i.id} visto={vistos.includes(i.id)} onClick={() => tocar(i.id)}
              style={{ fontSize: "12px", textAlign: "left" }}>
              {i.nombre.termino}
            </Tocable>
          ))}
        </div>
        {inf && (
          <div key={inf.id} className="fae-t1s-aparece">
            {/* 12/16 (y no la Nota de 13/18): a 320 la cita de P:202 no deja más sitio. */}
            <p data-revela={inf.id} style={{ margin: 0, fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: FAE.text }}>{inf.texto}</p>
            <p data-cita aria-label={`Así lo dice el libro: ${inf.nombre.delLibro}`} style={{ margin: "2px 0 0", fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: SECUNDARIO }}>
              «{inf.nombre.delLibro}»
            </p>
          </div>
        )}
      </Escenario>
    </MarcoFigura>
  );
}

/* ═══════════ 3 · Los apodos; el paso saca las tres tarjetas en gris ═══════════ */
const APODOS = [
  { id: "foto", Icono: Camera, termino: NOMBRES_P3[0].termino },
  { id: "pelicula", Icono: Film, termino: NOMBRES_P3[1].termino },
];
function FiguraApodos({ estado, setEstado, paso }) {
  const vistos = estado?.vistos ?? [];
  const ultimo = estado?.ultimo ?? null;
  const tocar = (k) => setEstado({ vistos: vistos.includes(k) ? vistos : [...vistos, k], ultimo: k });
  const mas = paso >= 1;
  return (
    <MarcoFigura>
      <Escenario>
        <div role="group" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
          {APODOS.map(({ id, Icono }) => (
            <Tocable key={id} data-tocable data-apodo={id} on={ultimo === id} visto={vistos.includes(id)} onClick={() => tocar(id)}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <Icono aria-hidden="true" size={18} strokeWidth={2} />{T.apodos.rotulos[id]}
            </Tocable>
          ))}
        </div>
        {!mas && ultimo && <Nota key={ultimo} data-revela={ultimo}>{APODOS.find((a) => a.id === ultimo).termino}</Nota>}
        {mas && (
          <div className="fae-t1s-aparece" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div data-tarjetas-grises aria-hidden="true" style={{ display: "flex", gap: "8px" }}>
              {[0, 1, 2].map((k) => (
                <div key={k} style={{ flex: 1, height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(184,196,212,0.10)", border: "1px solid rgba(184,196,212,0.3)" }}>
                  <FileText size={18} strokeWidth={1.75} color={SECUNDARIO} />
                </div>
              ))}
            </div>
            <Nota data-paso-mas>{T.apodos.paso}</Nota>
          </div>
        )}
      </Escenario>
    </MarcoFigura>
  );
}

/* ═══════════ 4 · El 1 de enero se toma una foto (toca la línea) ═══════════ */
function FiguraEnero({ estado, setEstado }) {
  const tomada = Boolean(estado?.tomada);
  return (
    <MarcoFigura>
      <Escenario plano>
        {tomada ? <FotoSec foto={ENERO} /> : <FotoSec hueco foto={ENERO} />}
        <BandaSec onTocar={tomada ? null : () => setEstado({ tomada: true })} invitacion={tomada ? null : T.enero.toca} />
        <FotoSec hueco foto={DICIEMBRE} />
      </Escenario>
    </MarcoFigura>
  );
}

/* ═══════════ 5 · La parada: ¿la foto del final será igual? ═══════════ */
const PARADA = F(8);
const CORRECTA_PARADA = PARADA.opciones.find((o) => o.correcta).id;
function FiguraParada({ estado, setEstado }) {
  const resuelta = paradaResuelta(estado);
  return (
    <ParadaModelo
      estado={estado} setEstado={setEstado}
      opciones={PARADA.opciones.map((o) => ({ id: o.id, texto: T.parada.rotulos[o.id] }))}
      correcta={CORRECTA_PARADA}
      pista={textoDe(PARADA.pista)}
      porqueDe={(id) => textoDe(PARADA.opciones.find((o) => o.id === id)?.devolucion)}
      acierto={textoDe(PARADA.opciones.find((o) => o.correcta).devolucion)}
      modelo={<LineaCompacta dic={resuelta ? "foto" : "hueco"} escena={resuelta ? "dos-fotos" : null} />}
      anchoModelo={64}
    />
  );
}

/* ═══════════ 6 · Entre las dos fotos pasó todo el año (toca cada punta) ═══════════ */
function FiguraDiciembre({ estado, setEstado }) {
  const vistos = estado?.vistos ?? [];
  const tocar = (k) => !vistos.includes(k) && setEstado({ vistos: [...vistos, k] });
  const dic = vistos.includes("diciembre");
  const banda = vistos.includes("banda");
  return (
    <MarcoFigura>
      <Escenario plano>
        <FotoSec foto={ENERO} />
        <BandaSec llena={banda} onTocar={banda ? null : () => tocar("banda")} />
        {dic ? <FotoSec foto={DICIEMBRE} /> : <FotoSec hueco foto={DICIEMBRE} signo={DICIEMBRE.fecha} onTocar={() => tocar("diciembre")} />}
      </Escenario>
    </MarcoFigura>
  );
}

/* ═══════════ 7 · Lo de en medio explica el cambio (recorrer tocando) ═══════════ */
function FiguraCambio({ estado, setEstado }) {
  const ultimo = estado?.ultimo ?? null;
  const vistos = estado?.vistos ?? [];
  const tocar = (k) => setEstado({ vistos: vistos.includes(k) ? vistos : [...vistos, k], ultimo: k });
  return (
    <MarcoFigura>
      <Escenario plano>
        <FotoSec foto={ENERO} resaltada={ultimo === "enero"} onTocar={() => tocar("enero")} />
        <BandaSec llena resaltada={ultimo === "banda"} onTocar={() => tocar("banda")} />
        <FotoSec foto={DICIEMBRE} resaltada={ultimo === "diciembre"} onTocar={() => tocar("diciembre")} />
      </Escenario>
    </MarcoFigura>
  );
}

/* ═══════════ 8 · La prueba: una pregunta por paso, los errores de evaluarP3 ═══════════ */
const N_PREGUNTAS = PREGUNTAS_P3.length;
const RESPUESTAS = [FOTO, PELICULA, COMPARAR];
function FiguraPrueba({ estado, setEstado, paso }) {
  const k = itemDelPaso(estado, paso, N_PREGUNTAS);
  const q = PREGUNTAS_P3[k];
  const e = itemsDe(estado)[k];
  const resuelta = paradaResuelta(e);
  const ultima = e?.elegidas?.[e.elegidas.length - 1] ?? null;
  const errorDe = (id) => (id ? evaluarP3(q, id).texto : null);
  return (
    <ParadaModelo
      estado={e} setEstado={(v) => setEstado(responderItem(estado, k, v.elegidas[v.elegidas.length - 1], q.respuesta))}
      opciones={RESPUESTAS.map((id) => ({ id, texto: T.prueba.rotulos[id] }))}
      correcta={q.respuesta}
      pista={errorDe(ultima)}
      porqueDe={errorDe}
      arriba={(
        <p key={q.id} data-pregunta={q.id} className="fae-t1s-aparece" style={{ margin: 0, height: "36px", fontFamily: INTER, fontSize: "13px", fontWeight: 600, lineHeight: "18px", color: FAE.text }}>
          {q.texto}
        </p>
      )}
      modelo={<LineaCompacta dic="foto" banda escena={resuelta ? escenaDeAcierto(q.respuesta) : null} foto={q.foto ?? DICIEMBRE.id} />}
      anchoModelo={64}
    />
  );
}

/* ═══════════ 9 · La capa 4 (excepción de Mai): sin figura ═══════════ */
export const FICHA_FRASE_A3 = F(17);
/* ═══════════ 10 · El puente: la foto, la película y una tercera tarjeta que se enciende ═══════════ */
function FiguraPuente() {
  const tarjeta = (Icono, texto, enciende = false) => (
    <div data-tarjeta={enciende ? "tercera" : undefined} className={enciende ? "fae-t1s-aparece" : undefined} style={{
      flex: 1, minWidth: 0, height: "72px", borderRadius: "10px", boxSizing: "border-box", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: "6px", animationDelay: enciende ? "400ms" : undefined,
      background: enciende ? "rgba(184,196,212,0.16)" : "rgba(10,20,34,0.5)", border: `${enciende ? 2 : 1}px ${enciende ? "solid" : "solid"} ${enciende ? NEUTRO : SILUETA}`,
    }}>
      <Icono aria-hidden="true" size={22} strokeWidth={1.75} color={enciende ? FAE.text : SECUNDARIO} />
      {texto && <span style={{ fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "16px", color: FAE.text }}>{texto}</span>}
    </div>
  );
  return (
    <MarcoFigura>
      <Escenario centrado>
        <div style={{ display: "flex", gap: "8px" }}>
          {tarjeta(Camera, T.apodos.rotulos.foto)}
          {tarjeta(Film, T.apodos.rotulos.pelicula)}
          {tarjeta(FileText, null, true)}
        </div>
      </Escenario>
    </MarcoFigura>
  );
}

export const PIEZA_FOTO_PELICULA = conFases({
  id: ID_P3,
  altoFigura: { a320: 184, a375: 184 },
  pantallas: [
    { id: "prediccion", tipo: "apertura", ...sinApoyo(T.prediccion), Figura: FiguraPrediccion },
    { id: "informes", tipo: "apertura", ...pick(T.informes), Figura: FiguraInformes },
    { id: "apodos", tipo: "miralo", ...pick(T.apodos), pasos: 1, rotulosPaso: [T.apodos.paso], Figura: FiguraApodos },
    { id: "enero", tipo: "miralo", ...pick(T.enero), Figura: FiguraEnero },
    { id: "parada", tipo: "haz", ...sinApoyo(T.parada), resuelta: paradaResuelta, Figura: FiguraParada },
    { id: "diciembre", tipo: "miralo", ...pick(T.diciembre), Figura: FiguraDiciembre },
    { id: "cambio", tipo: "miralo", ...pick(T.cambio), Figura: FiguraCambio },
    {
      id: "prueba", tipo: "haz", ...sinApoyo(T.prueba), pasos: N_PREGUNTAS - 1,
      rotulosPaso: PREGUNTAS_P3.slice(1).map((q) => q.texto), resuelta: itemsResueltos(N_PREGUNTAS), Figura: FiguraPrueba,
    },
    { id: "frase", tipo: "haz", ...pick(T.frase), resuelta: paradaResuelta, Figura: figuraFrase(FICHA_FRASE_A3) },
    { id: "puente", tipo: "cierre", ...pick(T.puente), Figura: FiguraPuente },
  ],
});
