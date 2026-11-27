/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS · LA PARTIDA DE UNA HACER (una para las 18 piezas)
 *
 * 1. Tarjeta de inicio (checklist de 5): la escena completa con el elenco de
 *    la pieza (el protagonista a 180 px o más, el rol escrito debajo), TU
 *    PAPEL, el contexto y la consigna. «Empezar».
 * 2. Las etapas, cada una con sus pasos (comun/preparar.js), y en cada paso
 *    el motor de su mecánica con la escena propia de la pieza.
 * 3. Si la pieza tiene frase de cierre, la tarjeta de cierre.
 * 4. onTerminar({ pct, detalle, duracionMs }): lo recoge RetoHacer y el resto
 *    es el flujo común (FP una vez por estudiante, pantalla de resumen).
 *
 * Puntaje: aciertos al primer intento / ítems puntuables de toda la partida
 * (por etapas igual: el servidor multiplica la base por las etapas).
 * Exploratoria (sin ítems puntuables): 100.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useMemo, useState } from "react";
import { Boton, useCronometro } from "../../macro2026/comun/ui.jsx";
import { azarDeLaPagina } from "../../macro2026/comun/azar.js";
import { CSS_GP } from "./estilo.js";
import { itemsDePaso, prepararPieza } from "./preparar.js";
import { Personaje } from "./elenco.jsx";
import { Objeto } from "./objetos.jsx";
import Decidir from "./motores/Decidir.jsx";
import Emparejar from "./motores/Emparejar.jsx";
import Ordenar from "./motores/Ordenar.jsx";
import Memorando from "./motores/Memorando.jsx";
import Dilema from "./motores/Dilema.jsx";
import Dial from "./motores/Dial.jsx";
import Casillas from "./motores/Casillas.jsx";

/* La escena de la etapa k: la base de la pieza con lo propio de esa etapa. */
const escenaDe = (escena, k) => ({ ...escena, ...(escena.etapas?.[k] ?? {}) });

function Inicio({ pieza, escena, onEmpezar }) {
  const [prota, ...resto] = pieza.elenco;
  return (
    <div className="da26-tarjeta" data-pieza={pieza.id} data-inicio-hacer>
      <style>{CSS_GP}</style>
      <section className="gp-visual" data-visual="inicio" style={{ margin: "-12px -12px 12px", "--gp-a": escena.fondo?.[0], "--gp-b": escena.fondo?.[1], "--gp-acento": escena.acento }}>
        <div className="gp-inicio-elenco">
          <Personaje quien={prota} alto={180} />
          {escena.portada && <Objeto id={escena.portada} alto={120} />}
          {resto.map((q) => <Personaje key={q} quien={q} alto={120} />)}
        </div>
        <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
          <div className="da26-papel" data-papel style={{ "--da26-acento": escena.acento ?? "#f2c14e" }}>
            <span className="da26-papel-etq">TU PAPEL</span>
            <span className="da26-papel-txt">{pieza.rol}</span>
          </div>
          <p className="da26-nota" data-contexto-escena style={{ "--da26-acento": escena.acento ?? "#f2c14e" }}>{pieza.contexto}</p>
        </div>
      </section>
      <h2 className="da26-consigna" data-consigna>{pieza.consigna}</h2>
      <div className="da26-nav">
        <span />
        <Boton primario onClick={onEmpezar} data-empezar>Empezar</Boton>
      </div>
    </div>
  );
}

export default function Partida({ pieza, escena = {}, onTerminar, rng = null, valores = null }) {
  const etapas = useMemo(() => prepararPieza(pieza, rng ?? azarDeLaPagina()), [pieza, rng]);
  const total = useMemo(() => etapas.reduce((s, e) => s + e.pasos.reduce((t, p) => t + itemsDePaso(p), 0), 0), [etapas]);
  const tiempo = useCronometro();
  const [fase, setFase] = useState("inicio");
  const [e, setE] = useState(0);
  const [p, setP] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [detalle, setDetalle] = useState([]);
  const [hechos, setHechos] = useState([]);
  const [consignaExtra, setConsignaExtra] = useState(null);
  const [cierre, setCierre] = useState(null);

  const cerrar = (pts, det, ultimo = null) => {
    const pct = total === 0 ? 100 : Math.round((pts / total) * 100);
    const res = { pct, detalle: det, duracionMs: tiempo() };
    if (pieza.cierre) { setCierre({ ...res, ultimo }); setFase("cierre"); return; }
    onTerminar?.(res);
  };

  const alTerminarPaso = (res) => {
    const pts = puntos + (res.puntos ?? 0);
    const det = [...detalle, ...(res.detalle ?? [])];
    setPuntos(pts);
    setDetalle(det);
    setConsignaExtra(null);
    const etapa = etapas[e];
    if (p + 1 < etapa.pasos.length) {
      setHechos((h) => [...h, { paso: etapa.pasos[p], destino: res.destino }]);
      setP(p + 1);
      return;
    }
    if (e + 1 < etapas.length) { setE(e + 1); setP(0); setHechos([]); setFase("entre"); return; }
    cerrar(pts, det, res);
  };

  if (fase === "inicio") return <Inicio pieza={pieza} escena={escenaDe(escena, 0)} onEmpezar={() => setFase("juego")} />;

  if (fase === "cierre") {
    return (
      <div className="da26-tarjeta" data-pieza={pieza.id} data-cierre-pieza>
        <style>{CSS_GP}</style>
        <section className="gp-visual" style={{ margin: "-12px -12px 12px", "--gp-a": escena.fondo?.[0], "--gp-b": escena.fondo?.[1], "--gp-acento": escena.acento }}>
          <div className="gp-inicio-elenco">
            <Personaje quien="tu" alto={180} animo="feliz" />
            {escena.portada && <Objeto id={escena.portada} alto={120} />}
          </div>
          {escena.final?.(cierre)}
          <p className="gp-cierre" data-frase-cierre>{pieza.cierre}</p>
        </section>
        <div className="da26-nav">
          <span />
          <Boton primario onClick={() => onTerminar?.({ pct: cierre.pct, detalle: cierre.detalle, duracionMs: cierre.duracionMs })} data-ver-resultado>Ver resultado</Boton>
        </div>
      </div>
    );
  }

  const etapa = etapas[e];
  const esc = escenaDe(escena, e);

  if (fase === "entre") {
    return (
      <div className="da26-tarjeta" data-pieza={pieza.id} data-entre-etapas={e + 1}>
        <style>{CSS_GP}</style>
        <p className="gp-etapa">Etapa {e + 1} de {etapas.length}</p>
        <h2 className="da26-consigna" data-consigna>{etapa.consigna}</h2>
        <div className="da26-nav"><span /><Boton primario onClick={() => setFase("juego")} data-seguir-etapa>Seguir</Boton></div>
      </div>
    );
  }

  const paso = etapa.pasos[p];
  const consigna = consignaExtra ?? paso.consigna ?? etapa.consigna;
  const clave = `${e}-${p}-${paso.id}`;
  const comunes = { paso, escena: esc, alTerminar: alTerminarPaso };
  let motor;
  if (paso.tipo === "decidir") motor = <Decidir key={clave} {...comunes} estadoEtapa={{ hechos, indice: p, total: etapa.pasos.length }} />;
  else if (paso.tipo === "casillas") motor = <Casillas key={clave} {...comunes} estadoEtapa={{ hechos, indice: p, total: etapa.pasos.length }} />;
  else if (paso.tipo === "emparejar") motor = <Emparejar key={clave} {...comunes} />;
  else if (paso.tipo === "ordenar") motor = <Ordenar key={clave} {...comunes} />;
  else if (paso.tipo === "memorando") motor = <Memorando key={clave} {...comunes} />;
  else if (paso.tipo === "dilema") motor = <Dilema key={clave} {...comunes} valores={valores} />;
  else if (paso.tipo === "dial") motor = <Dial key={clave} {...comunes} consignaReto={pieza.etapas[e].consignaReto} onFase={setConsignaExtra} />;

  const enUno = etapa.pasos.length === 1;
  return (
    <div className="da26-tarjeta" data-pieza={pieza.id} data-etapa={e + 1} data-paso={p + 1}>
      <style>{CSS_GP}</style>
      {etapas.length > 1 && <p className="gp-etapa" data-etapa-rotulo>Etapa {e + 1} de {etapas.length}</p>}
      <div className="da26-cabeza">
        <h2 className="da26-consigna" data-consigna style={{ margin: 0 }}>{consigna}</h2>
        {!enUno && <span className="da26-rotulo da26-mono" data-progreso style={{ flex: "none" }}>{p + 1} / {etapa.pasos.length}</span>}
      </div>
      {motor}
    </div>
  );
}
