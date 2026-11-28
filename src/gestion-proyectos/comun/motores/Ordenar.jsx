/*
 * GESTIÓN DE PROYECTOS · MOTOR «ORDENAR» (H11 los documentos, H12 las preguntas).
 *
 * Las tarjetas llegan revueltas a la bandeja; se tocan en el orden en que van
 * y caen en la línea de tiempo (tocar es la vía principal y ya funciona con
 * teclado: cada tarjeta es un botón). Tocar una ya puesta la devuelve. Con la
 * línea llena, «Comprobar». Con `puntuaPares`, un ítem por par vecino: vale
 * si el par quedó bien al primer intento. Error: la retro del par invertido
 * (o la común), y se reordena sin puntaje hasta que quede bien.
 *
 * Lote 4 (caps. 7 y 8): con `escena.deAbajo` la línea se llena de abajo hacia
 * arriba (la torre del presupuesto, los pisos del ascensor): el hueco 1 queda
 * abajo. `escena.encimaOrden({ puestas, bien, paso })` pinta lo propio de la
 * pieza (la polea, el ascensor, la cadena) sobre la línea.
 *
 * Lote 6 (caps. 11 y 12):
 *   porValor          cada ítem trae `valor` y van de mayor a menor; dos con
 *                     el mismo valor pueden ir en cualquier orden (c11 H05,
 *                     0,05 y 0,05). La retro nombra el primer par invertido con
 *                     sus cifras (`retroOrden`, con {A} {pA} {B} {pB}), salvo
 *                     que el par tenga la suya en `retrosOrden` («a-b»).
 *   puntuaPosiciones  un ítem por tarjeta: vale si quedó en su posición al
 *                     primer intento (c12 H12).
 *   Con `retrosPar`, la retro es la del primer par invertido que tenga una.
 */
import { useRef, useState } from "react";
import { Boton, Retro } from "../../../macro2026/comun/ui.jsx";
import { paresDe } from "../preparar.js";
import { Personaje } from "../elenco.jsx";
import { Objeto } from "../objetos.jsx";

const CSS = `
.gp-linea { display: grid; gap: 8px; counter-reset: gp-orden; }
.gp-hueco { position: relative; display: flex; align-items: center; gap: 10px; min-height: 52px; padding: 6px 10px; border-radius: 12px; border: 2px dashed rgba(244,245,247,.45); background: rgba(8,16,30,.6); }
.gp-hueco::before { counter-increment: gp-orden; content: counter(gp-orden); display: grid; place-items: center; flex: none; width: 28px; height: 28px; border-radius: 50%; background: #f4f5f7; color: #121418; font: 800 14px/1 var(--planck-font-mono, monospace); }
.gp-hueco[data-estado="mal"] { border-color: #E76F51; border-style: solid; }
.gp-hueco[data-estado="bien"] { border-style: solid; border-color: #f4f5f7; }
.gp-orden-tarjeta { flex: 1; min-height: 44px; padding: 8px 10px; border-radius: 10px; border: 2px solid #f4f5f7; background: #fbf7ee; color: #121418; font: 600 15px/1.3 var(--planck-font-sans, system-ui, sans-serif); text-align: left; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.gp-orden-bandeja { display: grid; gap: 8px; margin-top: 12px; }
.gp-linea[data-de-abajo="1"] { display: flex; flex-direction: column-reverse; }
`;

export default function Ordenar({ paso, escena = {}, alTerminar }) {
  const [puestas, setPuestas] = useState([]);
  const [intento, setIntento] = useState(1);
  const [malos, setMalos] = useState(new Set());
  const [retro, setRetro] = useState(null);
  const [golpes, setGolpes] = useState(0);
  const [bien, setBien] = useState(false);
  const detalle = useRef(null);
  const pares = paresDe(paso);
  const libres = paso.mezcla.filter((x) => !puestas.includes(x.id));
  const texto = (id) => paso.items.find((x) => x.id === id).texto;

  const valor = (id) => paso.items.find((x) => x.id === id).valor;
  /* ¿La tarjeta puesta en k es la que va ahí? (con porValor, cualquiera del mismo valor) */
  const vaEn = (id, k) => (paso.porValor ? valor(id) === paso.items[k].valor : paso.items[k].id === id);
  const comprobar = () => {
    const pos = Object.fromEntries(puestas.map((id, k) => [id, k]));
    const okPar = pares.map((p) => { const [a, b] = p.split("-"); return pos[a] < pos[b]; });
    const todo = puestas.every((id, k) => vaEn(id, k));
    if (intento === 1) {
      detalle.current = paso.puntuaPosiciones
        ? paso.items.map((x, k) => ({ item: `${paso.id}:${x.id}`, ok: vaEn(puestas[k], k), subtemas: paso.subtemas ?? null }))
        : paso.puntuaPares
          ? pares.map((p, k) => ({ item: `${paso.id}:${p}`, ok: okPar[k], subtemas: paso.subtemas ?? null }))
          : [{ item: paso.id, ok: todo, subtemas: paso.subtemas ?? null }];
    }
    if (todo) {
      setBien(true);
      setRetro(null);
      setTimeout(() => alTerminar({ detalle: detalle.current, puntos: detalle.current.filter((d) => d.ok).length }), 1100);
      return;
    }
    if (paso.porValor) {
      const k = puestas.findIndex((id, i) => i + 1 < puestas.length && valor(id) < valor(puestas[i + 1]));
      const [a, b] = [puestas[k], puestas[k + 1]];
      const nombre = (id) => paso.items.find((x) => x.id === id).corto ?? texto(id);
      const cifra = (id) => String(valor(id)).replace(".", ",");
      setRetro(paso.retrosOrden?.[`${a}-${b}`] ?? paso.retrosOrden?.[`${b}-${a}`]
        ?? (paso.retroOrden ?? "").replace("{A}", nombre(a)).replace("{pA}", cifra(a)).replace("{B}", nombre(b)).replace("{pB}", cifra(b)));
    } else {
      const fallos = pares.filter((p, k) => !okPar[k]);
      const fallo = fallos.find((p) => paso.retrosPar?.[p]) ?? fallos[0];
      setRetro(paso.retrosPar?.[fallo] ?? paso.retro ?? null);
    }
    setMalos(new Set(puestas.filter((id, k) => !vaEn(id, k))));
    setGolpes((g) => g + 1);
    setIntento(2);
  };

  return (
    <div data-paso-id={paso.id} data-motor="ordenar">
      <style>{CSS}</style>
      <div className="gp-visual" data-visual="orden" style={{ "--gp-a": escena.fondo?.[0], "--gp-b": escena.fondo?.[1], "--gp-acento": escena.acento }}>
        <div className="gp-mesa" style={{ minHeight: 0, marginBottom: 10 }}>
          <Personaje quien={escena.mesa ?? "tu"} alto={120} animo={bien ? "feliz" : "quieta"} />
          <div className="gp-centro gp-sobre" aria-hidden="true">
            {(escena.objetos ?? []).map((o) => <Objeto key={o} id={o} alto={72} />)}
          </div>
        </div>
        {escena.encimaOrden?.({ puestas, bien, paso })}
        <ol className="gp-linea" data-de-abajo={escena.deAbajo ? "1" : undefined} aria-label={escena.deAbajo ? "De abajo hacia arriba" : "Línea de tiempo"} style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {paso.items.map((_, k) => {
            const id = puestas[k];
            return (
              <li key={k} className="gp-hueco" data-hueco={k + 1} data-estado={bien ? "bien" : id && malos.has(id) ? "mal" : undefined}>
                {id ? (
                  <button type="button" className="gp-orden-tarjeta" data-puesta={id} disabled={bien}
                    onClick={() => { setPuestas((p) => p.filter((x) => x !== id)); setMalos(new Set()); }}
                    aria-label={`${texto(id)}. Tócala para devolverla.`}>
                    {escena.objetoTarjeta && <Objeto id={escena.objetoTarjeta} alto={32} />}{texto(id)}
                  </button>
                ) : <span className="da26-rotulo">{escena.rotuloHueco?.(k) ?? "Toca la que va aquí"}</span>}
              </li>
            );
          })}
        </ol>
        {libres.length > 0 && (
          <div className="gp-orden-bandeja" role="group" aria-label="Por ordenar">
            {libres.map((x) => (
              <button key={x.id} type="button" className="gp-orden-tarjeta" data-por-ordenar={x.id}
                onClick={() => { setPuestas((p) => [...p, x.id]); setMalos(new Set()); setRetro(null); }}>
                {escena.objetoTarjeta && <Objeto id={escena.objetoTarjeta} alto={32} />}{x.texto}
              </button>
            ))}
          </div>
        )}
      </div>
      <Retro estado="mal" key={`r${golpes}`}>{retro}</Retro>
      {!bien && puestas.length === paso.items.length && (
        <div className="gp-pie"><Boton primario onClick={comprobar} data-comprobar>Comprobar</Boton></div>
      )}
    </div>
  );
}
