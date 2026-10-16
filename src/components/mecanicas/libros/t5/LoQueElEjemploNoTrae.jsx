import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { barajar, barajarDistinto } from "../../../../utils/barajar.js";
import { Panel } from "../../salaDeControl/marco.jsx";
import { CSS_T73P, cifra } from "../t7/PantallasT7_3.jsx";
import { PIEZA_LO_QUE_EL_EJEMPLO_NO_TRAE, BOTON, INTERFAZ } from "../../../../data/contabilidadT5_n6.js";
import { DEBE, HABER } from "../../../../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N6 «Lo que el ejemplo no trae» (Célula C). Aprender, sin FP.
 *
 * Cinco pantallas, una a la vez, todas con la figura arriba: las cuatro
 * cuentas T de Yarumo, que crecen con cada respuesta y siguen en pantalla
 * hasta el resumen (C8). Los textos, en data/contabilidadT5_n6.js.
 *
 *   · portada / resumen   figura, textos, botón (la portada) y pie
 *   · eleccion   figura, caso, pregunta, opciones barajadas y «Confirmar».
 *                LA ESCALERA DEL PAQUETE: 1.er error → la pista y «Probar
 *                otra»; 2.º error → el texto «2.º error» de la opción elegida
 *                y la pregunta se cierra: la respuesta queda marcada (✓, en
 *                neutro) y sale «Seguir»; acierto → el acierto y «Seguir».
 *                No usa escaleraAyuda.js, cuyo 2.º error es «La respuesta es
 *                «…».» con el acierto: aquí Near escribió un texto propio
 *                para cada opción equivocada.
 *
 * La figura cambia con el acierto o con el 2.º error (tabla «La figura» del
 * paquete): la factura de P1 se pliega dentro de Inversiones – títulos, la
 * ficha del depósito de P2 rebota contra la cuenta y sale, y en P3 aparece
 * el haber de Ingresos por dividendos. Antes de responder nunca muestra la
 * cifra que se pregunta (E8): la factura trae sus dos renglones sin la suma.
 *
 * NADA SE PLIEGA (regla C7): la condición de la p. 193 va entera, a la vista.
 *
 * FIGURA PROVISIONAL PARA WATARI: Watari todavía no entrega la forma. Esta es
 * una versión sobria con las clases de las cuentas T de T7-3
 * (PantallasT7_3.jsx, `t73p-t…`) y su hoja; lo propio va con el prefijo
 * `t5n6-`. Cuentas sin movimientos: atenuadas (borde punteado, letra
 * secundaria). Una columna en caja angosta; dos desde 420 px de caja.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const P = { fondo: "#0E1B2E", texto: "#F8F9FA", texto2: "#A8B6C8", borde: "#B8C4D4" };

export const CSS_N6 = `
.t5n6-fig { margin: 0; display: grid; gap: 10px; min-width: 0; container: t5n6 / inline-size; }
.t5n6-cuentas { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; }
.t5n6-celda { display: grid; gap: 6px; align-content: start; min-width: 0; }
.t5n6-fig .t73p-t { padding: 8px 10px; }
.t5n6-fig .t73p-t-cuenta { font-weight: 600; }
.t5n6-atenuada { border-style: dashed; }
.t5n6-atenuada .t73p-t-cuenta, .t5n6-atenuada .t73p-t-rot { color: ${P.texto2}; }
.t5n6-atenuada .t73p-t-cuenta { border-bottom-style: dashed; }
.t5n6-atenuada .t73p-t-lado + .t73p-t-lado { border-left-style: dashed; }
.t5n6-factura { margin: 0; display: grid; gap: 4px; border: 1px solid ${P.borde}; border-radius: 10px; padding: 10px 12px; transform-origin: 50% 100%; }
.t5n6-renglon { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0 8px; font-size: 15px; line-height: 1.4; }
.t5n6-renglon b { font-weight: 500; font-variant-numeric: tabular-nums; white-space: nowrap; margin-left: auto; }
.t5n6-ficha { justify-self: start; display: inline-flex; gap: 8px; padding: 6px 10px; border: 1px dashed ${P.texto}; border-radius: 8px; font-size: 14px; line-height: 1.35; background: rgba(248,249,250,0.06); }
.t5n6-ficha b { font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
.t5n6-nota { margin: 0; font-size: 13px; line-height: 1.4; color: ${P.texto2}; font-variant-numeric: tabular-nums; }
.t5n6-pliega { animation: t5n6-pliega .4s ease-in forwards; pointer-events: none; }
@keyframes t5n6-pliega { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(.6) translateY(24px); } }
.t5n6-rebota { animation: t5n6-rebota .6s ease-in-out forwards; pointer-events: none; }
@keyframes t5n6-rebota { 0% { transform: none; opacity: 1; } 35% { transform: translateY(-14px); } 55% { transform: translateY(-6px) translateX(8px); opacity: 1; } 100% { transform: translateX(48px); opacity: 0; } }
.t5n6-nuevo { animation: t5n6-aparece .12s ease-out; }
@keyframes t5n6-aparece { from { opacity: 0; } to { opacity: 1; } }
/* Los botones ya miden 44 en la hoja de T7-3; aquí se declara también, para la prueba estática de alto de la célula, que lee la hoja de este archivo. */
.t73p .t73p-btn, .t73p .t73p-op { min-height: 44px; }
.t5n6-op-correcta { border: 2px solid ${P.texto}; display: flex; align-items: center; gap: 8px; }
.t5n6-op-correcta svg { flex: none; }
@container t5n6 (min-width: 420px) {
  .t5n6-cuentas { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (prefers-reduced-motion: reduce) {
  .t5n6-pliega, .t5n6-rebota { display: none; animation: none; }
  .t5n6-nuevo { animation: none; }
}
`;

const pesos = (n) => `$${cifra(n)}`;

/** El texto del error, según la escalera del paquete: la pista al 1.º; el «2.º error» de la opción, desde el 2.º. */
export const textoDelError = (pantalla, opcion, fallos) => (fallos <= 1 ? pantalla.pista : opcion.segundoError);

/* Lo que entra y luego se va con una animación (la factura, la ficha): al terminarla, sale del todo. */
function useSalida(saliendo) {
  const [fuera, setFuera] = useState(false);
  useEffect(() => { if (!saliendo) setFuera(false); }, [saliendo]);
  return [fuera, () => { if (saliendo) setFuera(true); }];
}

function Factura({ renglones, saliendo }) {
  const [fuera, salir] = useSalida(saliendo);
  if (fuera) return null;
  return (
    /* [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION: el nombre «La factura» solo lo oye el lector de pantalla. */
    <div className={`t5n6-factura${saliendo ? " t5n6-pliega" : ""}`} role="group" aria-label="La factura" aria-hidden={saliendo || undefined}
      data-factura data-saliendo={saliendo ? "" : undefined} onAnimationEnd={salir}>
      {renglones.map((r) => (
        <span key={r.rot} className="t5n6-renglon" data-renglon>{r.rot} <b>{pesos(r.monto)}</b></span>
      ))}
    </div>
  );
}

function Ficha({ ficha, saliendo }) {
  const [fuera, salir] = useSalida(saliendo);
  if (fuera) return null;
  return (
    <span className={`t5n6-ficha${saliendo ? " t5n6-rebota" : ""}`} data-ficha aria-hidden={saliendo || undefined}
      data-saliendo={saliendo ? "" : undefined} onAnimationEnd={salir}>
      {ficha.rot} <b>{pesos(ficha.monto)}</b>
    </span>
  );
}

function CuentaT({ cuenta, movs, nuevos }) {
  const lado = (cual, clase) => (
    <div className="t73p-t-lado" data-lado-t={cual}>
      <span className={`t73p-t-rot ${clase}`}>{cual === DEBE ? INTERFAZ.debe : INTERFAZ.haber}</span>
      {movs.filter(([, m]) => m.lado === cual).map(([id, m]) => (
        <span key={id} className={`t73p-t-mov${nuevos.has(id) ? " t5n6-nuevo" : ""}`} data-mov={id}>
          <span className="t73p-t-v">{pesos(m.monto)}</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`t73p-t${movs.length ? "" : " t5n6-atenuada"}`} data-cuenta={cuenta.id} data-atenuada={movs.length ? undefined : ""} role="group" aria-label={cuenta.nombre}>
      <p className="t73p-t-cuenta">{cuenta.nombre}</p>
      <div className="t73p-t-lados">
        {lado(DEBE, "t73p-d")}
        {lado(HABER, "t73p-hb")}
      </div>
    </div>
  );
}

/** La figura de una pantalla; `resuelta` con el acierto o con el 2.º error. */
export function FiguraN6({ pieza, figura, resuelta = false }) {
  const alResolver = resuelta ? figura.alResolver ?? {} : {};
  const ids = [...figura.movimientos, ...(alResolver.movimientos ?? [])];
  const nuevos = new Set(alResolver.movimientos ?? []);
  return (
    /* [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION: el nombre de la figura solo lo oye el lector de pantalla. */
    <figure className="t5n6-fig" data-figura aria-label="Las cuentas de Yarumo" data-resuelta={resuelta ? "" : undefined}>
      {figura.factura && <Factura renglones={figura.factura} saliendo={alResolver.factura === "pliega"} />}
      <div className="t5n6-cuentas">
        {pieza.cuentas.map((c) => {
          const movs = ids.map((id) => [id, pieza.movimientos[id]]).filter(([, m]) => m.cuenta === c.id);
          const nota = alResolver.nota?.cuenta === c.id ? alResolver.nota : null;
          return (
            <div key={c.id} className="t5n6-celda">
              <CuentaT cuenta={c} movs={movs} nuevos={nuevos} />
              {figura.ficha?.junto === c.id && <Ficha ficha={figura.ficha} saliendo={alResolver.ficha === "sale"} />}
              {nota && <p className="t5n6-nota t5n6-nuevo" data-nota>{nota.texto} {pesos(nota.monto)}</p>}
            </div>
          );
        })}
      </div>
    </figure>
  );
}

function Pie({ texto }) { return texto ? <p className="t73p-pie" data-pie>{texto}</p> : null; }

function Boton({ nombre, texto, onClick, inactivo = false }) {
  return (
    <button type="button" className="t73p-btn" data-boton={nombre} aria-disabled={inactivo ? "true" : undefined} onClick={inactivo ? undefined : onClick}>
      {texto}
    </button>
  );
}

function Mensaje({ ok, texto, refFoco }) {
  return (
    <div ref={refFoco} tabIndex={-1} role="status" className={`t73p-msg ${ok ? "t73p-msg-ok" : "t73p-msg-error"}`} data-mensaje={ok ? "acierto" : "error"}>
      {ok ? <Check size={16} color={P.texto} aria-hidden="true" /> : <X size={16} color="#E76F51" aria-hidden="true" />}
      <div className="t73p-msg-cuerpo">
        <span className="t73p-msg-palabra" data-palabra>{ok ? INTERFAZ.correcto : INTERFAZ.incorrecto}</span>
        <p data-texto>{texto}</p>
      </div>
    </div>
  );
}

const Parrafos = ({ lista }) => (lista ?? []).map((t) => <p key={t} className="t73p-p" data-texto>{t}</p>);

/* ═══════════ ELECCIÓN ═══════════ */

function Eleccion({ pieza, pantalla, onSeguir }) {
  const [orden, setOrden] = useState(() => barajar(pantalla.opciones));
  const [elegida, setElegida] = useState(null);
  const [confirmada, setConfirmada] = useState(null);
  const [fallos, setFallos] = useState(0);
  const ref = useRef(null);
  const opcion = confirmada ? pantalla.opciones.find((o) => o.id === confirmada) : null;
  /* colocando · error (1.º, con la pista) · cerrada (2.º error: la respuesta) · acierto */
  const estado = !opcion ? "colocando" : opcion.correcta ? "acierto" : fallos >= 2 ? "cerrada" : "error";
  const resuelta = estado === "acierto" || estado === "cerrada";
  useEffect(() => { if (estado !== "colocando") ref.current?.focus(); }, [estado]);

  const confirmar = () => {
    const o = pantalla.opciones.find((x) => x.id === elegida);
    if (o && !o.correcta) setFallos((n) => n + 1);
    setConfirmada(elegida);
  };

  return (
    <div className="t73p" data-eleccion={pantalla.id} data-estado={estado}>
      <FiguraN6 pieza={pieza} figura={pantalla.figura} resuelta={resuelta} />
      <Parrafos lista={pantalla.parrafos} />
      <p className="t73p-p t73p-preg" data-texto data-pregunta>{pantalla.pregunta}</p>
      <div className="t73p-ops" role="group" aria-label={pantalla.pregunta}>
        {orden.map((o) => {
          const esta = o.id === (confirmada ?? elegida);
          const marcada = estado === "cerrada" && o.correcta;
          return (
            <button key={o.id} type="button"
              className={`t73p-op${(estado === "error" || estado === "cerrada") && esta ? " t73p-op-error" : ""}${marcada ? " t5n6-op-correcta" : ""}`}
              data-opcion={o.id} data-correcta={marcada ? "" : undefined} aria-pressed={esta} disabled={Boolean(confirmada)} onClick={() => setElegida(o.id)}>
              {marcada && <Check size={16} color={P.texto} aria-label={INTERFAZ.correcto} />}
              {o.texto}
            </button>
          );
        })}
      </div>
      {estado === "colocando" && <Boton nombre="confirmar" texto={BOTON.confirmar} inactivo={!elegida} onClick={confirmar} />}
      {estado === "error" && (
        <>
          <Mensaje ok={false} texto={textoDelError(pantalla, opcion, fallos)} refFoco={ref} />
          <Boton nombre="probar-otra" texto={BOTON.probarOtra} onClick={() => { setOrden((a) => barajarDistinto(pantalla.opciones, a, (o) => o.id)); setElegida(null); setConfirmada(null); }} />
        </>
      )}
      {estado === "cerrada" && <Mensaje ok={false} texto={textoDelError(pantalla, opcion, fallos)} refFoco={ref} />}
      {estado === "acierto" && <Mensaje ok texto={pantalla.acierto.texto} refFoco={ref} />}
      {resuelta && onSeguir && <Boton nombre="seguir" texto={BOTON.seguir} onClick={onSeguir} />}
      <Pie texto={pantalla.pie} />
    </div>
  );
}

/* ═══════════ LA PIEZA ═══════════ */

export default function LoQueElEjemploNoTrae({ pieza = PIEZA_LO_QUE_EL_EJEMPLO_NO_TRAE, rotulo }) {
  const [k, setK] = useState(0);
  const p = pieza.pantallas[k];
  const ultima = k === pieza.pantallas.length - 1;
  const marco = useRef(null);
  const primera = useRef(true);
  const seguir = () => setK((x) => Math.min(x + 1, pieza.pantallas.length - 1));
  useEffect(() => { if (primera.current) { primera.current = false; return; } marco.current?.focus(); }, [k]);

  return (
    <Panel rotulo={rotulo} titulo={pieza.titulo}>
      <style>{CSS_T73P + CSS_N6}</style>
      <div ref={marco} tabIndex={-1} data-pieza={pieza.id} data-pantalla={p.id} style={{ outline: "none" }}>
        {p.tipo === "eleccion" ? (
          <Eleccion key={p.id} pieza={pieza} pantalla={p} onSeguir={ultima ? null : seguir} />
        ) : (
          <div className="t73p" key={p.id}>
            <FiguraN6 pieza={pieza} figura={p.figura} />
            <Parrafos lista={p.parrafos} />
            {p.boton && !ultima && <Boton nombre={p.tipo === "portada" ? "empezar" : "seguir"} texto={p.boton} onClick={seguir} />}
            <Pie texto={p.pie} />
          </div>
        )}
      </div>
    </Panel>
  );
}
