/*
 * H3 · ¿Gira o sube? (da26-h3-gira-o-sube, Hacer, Medio, 25 FP × %).
 * Especificación de Gen §2 H3. La gráfica de A5 con DA₀ y dos asas: el rombo
 * del arranque (arrastre vertical = desplazar) y el círculo del extremo
 * (arrastre vertical = girar sobre el arranque). «Revelar» deshabilitado hasta
 * mover un asa. Al revelar, la línea del estudiante queda punteada, la recta
 * real se anima desde DA₀ a su lugar (600 ms) y la marca Y₀ se desliza.
 * Dos criterios por suceso: tipo y sentido. 6 sucesos de 8; puntaje /12.
 *
 * Decisión reversible: mover un asa devuelve la otra a su sitio, así la recta
 * del estudiante es siempre o un desplazamiento puro o un giro puro.
 */
import { useMemo, useState } from "react";
import { arranque, modelo, pendiente, produccion } from "../comun/modelo-da.js";
import GraficaDA from "../comun/GraficaDA.jsx";
import { Boton, MarcoHacer, Retro, useAnimado, useCronometro } from "../comun/ui.jsx";
import { azarDeLaPagina, sortear } from "../comun/azar.js";
import { BANCO_H3, CONSIGNAS, PARTIDA_H3 } from "./textos.js";
import { BORDE, FONDO } from "../comun/colores-da.js";

export const ID = "da26-h3-gira-o-sube";
const P0 = modelo();
const A0 = arranque(P0);
const S0 = pendiente(P0);
const UMBRAL_A = 20;
const UMBRAL_S = 0.015;

export const prepararH3 = (rng = Math.random) => sortear(BANCO_H3, PARTIDA_H3, rng);

/** Lo que hizo el estudiante: tipo y sentido, o null si no movió nada. */
export function lecturaH3({ arr, pend, movida }) {
  if (movida === "rombo" && Math.abs(arr - A0) >= UMBRAL_A) return { tipo: "desplaza", sentido: Math.sign(arr - A0) };
  if (movida === "circulo" && Math.abs(pend - S0) >= UMBRAL_S) return { tipo: "gira", sentido: Math.sign(pend - S0) };
  return null;
}

export function juzgarH3(suceso, lectura) {
  return { tipo: lectura.tipo === suceso.tipo, sentido: lectura.sentido === suceso.sentido };
}

export default function H3GiraOSube({ onTerminar, rng = null }) {
  const sucesos = useMemo(() => prepararH3(rng ?? azarDeLaPagina()), [rng]);
  const tiempo = useCronometro();
  const [n, setN] = useState(0);
  const [linea, setLinea] = useState({ arr: A0, pend: S0, movida: null });
  const [juicio, setJuicio] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const s = sucesos[n];
  const real = modelo(s.cambio);
  const objetivo = juicio ? { a: arranque(real), p: pendiente(real), y: produccion(real) } : { a: A0, p: S0, y: produccion(P0) };
  const aAnim = useAnimado(objetivo.a, 600);
  const pAnim = useAnimado(objetivo.p, 600);
  const yAnim = useAnimado(objetivo.y, 600);
  const lectura = lecturaH3(linea);

  const revelar = () => {
    const j = juzgarH3(s, lectura);
    setJuicio(j);
    setDetalle((d) => [
      ...d,
      { item: `${s.id}-tipo`, ok: j.tipo, subtemas: s.subtemas },
      { item: `${s.id}-sentido`, ok: j.sentido, subtemas: s.subtemas },
    ]);
  };
  const seguir = () => {
    if (n + 1 >= sucesos.length) {
      const bien = detalle.filter((d) => d.ok).length;
      onTerminar?.({ pct: Math.round((bien / detalle.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    setN(n + 1);
    setLinea({ arr: A0, pend: S0, movida: null });
    setJuicio(null);
  };

  const lineas = juicio
    ? [
      { id: "da0", arranque: A0, pendiente: S0, estilo: "fantasma" },
      { id: "estudiante", arranque: linea.arr, pendiente: linea.pend, estilo: "punteada" },
      { id: "real", arranque: aAnim, pendiente: pAnim, estilo: "real" },
    ]
    : [
      { id: "da0", arranque: A0, pendiente: S0, estilo: "fantasma" },
      { id: "estudiante", arranque: linea.arr, pendiente: linea.pend, estilo: "estudiante" },
    ];

  return (
    <MarcoHacer id={ID} consigna={CONSIGNAS[ID]} progreso={`${n + 1} / ${sucesos.length}`}>
      <div className="da26-entra" key={s.id} data-suceso={s.id}
        style={{ border: `1px solid ${BORDE}`, background: FONDO, borderRadius: 12, padding: "10px 12px", marginBottom: 8, fontSize: 16, lineHeight: 1.35 }}>
        {s.suceso}
      </div>
      <div data-figura>
        <GraficaDA
          lineas={lineas}
          bisectriz={Boolean(juicio)}
          y0={juicio ? yAnim : null}
          asas={juicio ? null : {
            arranque: linea.arr,
            pendiente: linea.pend,
            onArranque: (a) => setLinea({ arr: a, pend: S0, movida: "rombo" }),
            onPendiente: (p) => setLinea({ arr: A0, pend: p, movida: "circulo" }),
          }}
          titulo="Gráfica: DA cero y tu recta, con un rombo en el arranque y un círculo en el extremo"
        />
      </div>
      {juicio && (
        <>
          {!juicio.tipo && <Retro estado="mal" data-criterio="tipo">{s.retro.tipo}</Retro>}
          {!juicio.sentido && <Retro estado="mal" data-criterio="sentido">{s.retro.sentido}</Retro>}
          <div className="da26-fila" style={{ marginTop: 8 }} data-criterios>
            {[["tipo", "Tipo"], ["sentido", "Sentido"]].map(([k, r]) => (
              <span key={k} className="da26-retro da26-marcable" data-estado={juicio[k] ? "bien" : "mal"} data-criterio-marca={k}
                style={{ margin: 0, padding: "4px 10px", fontSize: 14 }}>
                {r} {juicio[k] ? "" : "✗"}
              </span>
            ))}
          </div>
        </>
      )}
      <div className="da26-nav">
        <span />
        {juicio
          ? <Boton primario onClick={seguir} data-siguiente>{n + 1 >= sucesos.length ? "Terminar" : "Siguiente"}</Boton>
          : <Boton primario onClick={revelar} disabled={!lectura} data-revelar>Revelar</Boton>}
      </div>
    </MarcoHacer>
  );
}
