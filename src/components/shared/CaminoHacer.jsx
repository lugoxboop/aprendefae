import { useEffect, useRef, useState } from "react";
import { FAE, ANCHO_ESTRECHO } from "../../theme.js";
import { iconoDe } from "./iconosActividad.jsx";
import PreviaActividad from "./previas/PreviaActividad.jsx";
import { bloquesDe } from "../../hacer/bloques.js";
import { registrarApertura } from "./contenidoNuevo.jsx";

/*
 * Camino de actividades para la mitad "Hacer" de cualquier tema.
 *
 * NINGÚN NODO SE BLOQUEA, NUNCA. La inspiración visual es Duolingo, pero eso
 * de ahí no se copia: el camino ordena y sugiere un recorrido, no lo impone.
 * Se puede saltar del nodo 2 al 9 sin fricción, igual que en el resto del
 * sitio se puede entrar a cualquier tema en cualquier orden. Que un nodo esté
 * sin hacer cambia cómo se ve, jamás si se puede pulsar.
 *
 * EL PROBLEMA CENTRAL ES QUE SE VEA INTENCIONADO CON CUALQUIER NÚMERO DE
 * NODOS. Un tema con uno solo no puede parecer una página rota con hueco de
 * sobra, y uno con quince no puede salirse ni apelotonarse. Por eso aquí no
 * hay ni una medida fija: separación, radio, grosor y amplitud del serpenteo
 * salen todos del número de nodos, con topes por arriba y por abajo.
 *
 * ═══════════ EL TEXTO VA EN HTML, NO DENTRO DEL SVG ═══════════
 *
 * Los rótulos estaban dentro del SVG, en unidades del viewBox. El SVG ocupa el
 * 100% del ancho con un tope igual a su lienzo, así que por debajo de ese
 * ancho TODO el dibujo se escala junto, y el texto con él: no hay unidad que
 * se libre dentro de un viewBox. Medido a 375 px de ventana (327 px útiles):
 *
 *   · Iceberg, lienzo de 596 con el ramal del desafío: escala 0,55. Nombres
 *     a 7,4 px, «DESAFÍO» a 5,5 px, la marca de partida a medias a 6,6.
 *   · Los otros cuatro caminos, lienzo de 420: escala 0,78. Nombres a 10,5.
 *
 * Y subir los tamaños no arreglaba nada: 12 px a escala 0,55 son 22 unidades,
 * y a ese cuerpo los nombres ya no caben al lado de su nodo.
 *
 * Ahora el SVG dibuja solo lo que puede escalar —la línea, los círculos, los
 * números— y los rótulos son HTML con píxeles de verdad, colocados encima en
 * porcentajes del lienzo. El texto nunca baja de 12 px a ningún ancho y, si no
 * cabe, parte la línea en vez de encogerse. En escritorio, donde la escala es
 * 1, se ve como antes.
 *
 * ═══════════ EN EL TELÉFONO EL DESAFÍO SALE DEL RAMAL ═══════════
 *
 * Por debajo de ANCHO_ESTRECHO el ramal lateral es lo que hace el lienzo de
 * 596, y 596 metidos en 327 px deja los círculos de 30 px de diámetro. Así
 * que en móvil el desafío es una tarjeta ENCIMA del camino y el lienzo vuelve
 * a 420. Sigue fuera de la secuencia —no lleva número ni está en la línea—, y
 * arriba se ve sin desplazarse, que es lo mismo que buscaba el ramal.
 *
 * Las dos formas están en el DOM y una media query enseña una: la anchura se
 * decidió en CSS por lo mismo que en AccountControl —leerla con JavaScript
 * falló de tres maneras distintas en este proyecto—.
 *
 * ═══════════ POR BLOQUES DE DIFICULTAD (porBloques) ═══════════
 *
 * Política Económica, Demanda Agregada y Política Fiscal parten su camino en
 * Cimientos, Aplicación, Análisis y Maestría, por la dificultad del catálogo
 * (hacer/bloques.js), y siguen siendo UN recorrido: un solo lienzo y una
 * línea continua de punta a punta. Cada bloque se anuncia con su título —el
 * anillo de avance, el nombre y la dificultad— en una franja propia, del lado
 * por el que no pasa la línea (ver disposicionPorBloques). Hubo una línea
 * horizontal con una frase entre bloques y partía el camino en pedazos; se
 * quitó, y las frases quedan guardadas en hacer/bloques.js. Lo que no cambia
 * es lo de arriba: rótulos en HTML a px reales, nunca por debajo de 12.
 *
 * El radio, el grosor y la amplitud salen del camino entero, y entre nodos
 * del mismo bloque hay 100 unidades como mucho: el camino no crece de más en
 * el teléfono.
 *
 * En esta forma no hay doble forma: existía por el ramal del desafío, y aquí
 * el desafío —si un tema llega a tener— va siempre como tarjeta encima.
 *
 * Y cada nodo lleva el icono de su actividad (iconosActividad.jsx) en vez del
 * número; el que no tiene uno declarado sigue con su número.
 */

/* ---------------------------- medidas que respiran ---------------------------- */

const ANCHO = 420;                 // ancho del lienzo; la altura se calcula
const MARGEN_Y = 74;               // aire arriba y abajo, para que no roce el borde

/* Un valor que se mueve entre dos topes según cuántos nodos haya. */
const entre = (min, valor, max) => Math.max(min, Math.min(max, valor));

/*
 * Con pocos nodos el camino se estira para llenar la vista; con muchos se
 * comprime hasta un mínimo legible y a partir de ahí la página se desplaza,
 * que es preferible a apretar los nodos hasta que se toquen.
 */
export function medidas(n) {
  const separacion = n <= 1 ? 0 : entre(78, Math.round(760 / (n - 1)), 148);
  const radio = entre(17, Math.round(34 - n * 0.9), 30);
  const grosor = entre(2, Math.round(5 - n * 0.15), 4.5);
  /* La amplitud del serpenteo se abre con pocos nodos y se cierra con muchos. */
  const amplitud = n <= 1 ? 0 : entre(52, Math.round(ANCHO * 0.30 - n * 1.6), 132);
  const alto = n <= 1 ? 232 : separacion * (n - 1) + MARGEN_Y * 2;
  return { separacion, radio, grosor, amplitud, alto };
}

/* Dónde cae cada nodo. Un seno da el serpenteo sin esquinas de videojuego. */
export function posiciones(n, m) {
  const centro = ANCHO / 2;
  if (n === 1) return [{ x: centro, y: m.alto / 2 }];
  /*
   * Los nodos alternan lado estrictamente, así el camino queda equilibrado
   * alrededor del centro con cualquier cantidad. El factor variable evita que
   * la alternancia se vea mecánica: cada nodo se aparta un poco distinto.
   *
   * Un seno simple no servía: con dos a cinco nodos se iba entero hacia la
   * derecha, que es justo el caso más común hoy.
   */
  return Array.from({ length: n }, (_, i) => ({
    x: centro + m.amplitud * Math.cos(i * Math.PI) * (0.72 + 0.28 * Math.sin(i * 1.3)),
    y: MARGEN_Y + i * m.separacion,
  }));
}

/* En un camino por bloques: lo más que se separan dos nodos del mismo bloque. */
const SEPARACION_BLOQUE = 100;
/*
 * La franja del título de un bloque y el aire a cada lado, en unidades del
 * lienzo. A 375 px de ventana el lienzo va a escala 0,78 y 64 unidades son
 * 50 px: cabe el anillo de 44. Los dos aires dejan libres los rótulos de los
 * nodos de antes y de después, que se extienden unos 35 unidades arriba y abajo.
 */
const BANDA = 64;
const AIRE_ANTES = 24;
const AIRE_DESPUES = 20;
const MARGEN_FINAL = 34;

/*
 * El camino por bloques entero, en un solo lienzo: dónde cae cada nodo y
 * dónde va el título de cada bloque.
 *
 * LA LÍNEA NO CRUZA NINGÚN TÍTULO, Y NO POR SUERTE. Dentro de un bloque los
 * nodos alternan de lado, como siempre; pero el primer nodo de un bloque se
 * queda del MISMO lado que el último del anterior. Así, entre bloque y
 * bloque, la línea baja por ese lado —la curva hasta se abre hacia fuera— y
 * el título ocupa la franja del lado contrario, que queda libre. Y el primer
 * bloque empieza del lado que haga que termine a la derecha: con los bloques
 * de hoy (2, 3 y 2 actividades) eso deja todos los títulos a la izquierda,
 * como estaban. Si otro reparto hiciera bajar la línea por la izquierda, ese
 * título se iría a la derecha en vez de quedar atravesado.
 */
export function disposicionPorBloques(bloques, nTotal) {
  const base = medidas(nTotal);
  const separacion = Math.min(base.separacion || SEPARACION_BLOQUE, SEPARACION_BLOQUE);
  const r = base.radio;
  const centro = ANCHO / 2;
  const puntos = [];
  const cabeceras = [];
  let lado = (bloques[0]?.nodos.length ?? 0) % 2 === 1 ? 1 : -1;
  let i = 0;

  bloques.forEach((b, k) => {
    const yCabecera = k === 0 ? 0 : puntos[puntos.length - 1].y + r + AIRE_ANTES;
    cabeceras.push({ id: b.id, y: yCabecera, lado: k === 0 ? -1 : -lado });
    let y = yCabecera + BANDA + r + AIRE_DESPUES;
    b.nodos.forEach((nodo, j) => {
      if (j > 0) {
        lado = -lado;
        y += separacion;
      }
      puntos.push({ x: centro + lado * base.amplitud * (0.72 + 0.28 * Math.sin(i * 1.3)), y, id: nodo.id });
      i += 1;
    });
  });

  const alto = (puntos[puntos.length - 1]?.y ?? 0) + r + MARGEN_FINAL;
  return { m: { ...base, separacion, alto }, puntos, cabeceras, banda: BANDA };
}

/*
 * Curva suave que pasa por todos los puntos (Catmull-Rom convertido a Bézier),
 * tramo a tramo. Se usa esto y no una polilínea porque el lenguaje de líneas
 * del sitio —la red de la portada, los flujos de Demanda Agregada— es curvo,
 * y un zigzag rígido cantaría a plantilla de otro producto.
 */
export function tramosDe(p) {
  return p.slice(0, -1).map((_, i) => {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    return {
      p1,
      c1: { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
      c2: { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },
      p2,
    };
  });
}

const u = (v) => v.toFixed(1);
const curva = ({ c1, c2, p2 }) => `C ${u(c1.x)} ${u(c1.y)}, ${u(c2.x)} ${u(c2.y)}, ${u(p2.x)} ${u(p2.y)}`;

export function trazo(p) {
  if (p.length < 2) return "";
  return `M ${u(p[0].x)} ${u(p[0].y)} ${tramosDe(p).map(curva).join(" ")}`;
}

/* Un path por tramo: el recorrido se pinta de a un tramo, cada uno del tono de su bloque. */
const tramosSueltos = (p) => tramosDe(p).map((t) => `M ${u(t.p1.x)} ${u(t.p1.y)} ${curva(t)}`);

/* ------------------------------ el nodo especial ------------------------------ */

/*
 * Un tema puede tener, además de su camino, UN nodo de desafío al lado. No es
 * una actividad más con otro color: está fuera de la secuencia numerada, tiene
 * su propio ramal, es más grande y respira con un halo ámbar.
 *
 * ESTÁ FUERA DEL CAMINO A PROPÓSITO. Meterlo dentro lo convertiría en "la
 * novena", y entonces no completar el tema por no haberlo hecho sería un
 * bloqueo encubierto. Colgado de un ramal se lee como lo que es: algo extra que
 * está ahí para quien quiera.
 *
 * Cuando no se pasa `especial`, nada de esto se dibuja y el lienzo mantiene su
 * ancho de siempre: los caminos de los demás temas no cambian ni un píxel.
 */
const ANCHO_RAMAL = 176;

const CSS_ESPECIAL = `
@keyframes fae-ch-halo {
  0%, 100% { opacity: .16; transform: scale(1); }
  50%      { opacity: .38; transform: scale(1.13); }
}
.fae-ch-halo { transform-box: fill-box; transform-origin: center; animation: fae-ch-halo 3.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .fae-ch-halo { animation: none !important; } }
`;

/* El aro del nodo que venía en la URL: late, para que se encuentre de un vistazo. */
const CSS_RESALTADO = `
@keyframes fae-ch-aqui { 0%, 100% { opacity: .95; } 50% { opacity: .35; } }
.fae-ch-aqui { animation: fae-ch-aqui 1.6s ease-in-out infinite; }
@keyframes fae-ch-aqui-caja {
  0%, 100% { box-shadow: 0 0 0 3px rgba(42,157,143,0.95); }
  50%      { box-shadow: 0 0 0 3px rgba(42,157,143,0.3); }
}
.fae-ch-aqui-caja { animation: fae-ch-aqui-caja 1.6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .fae-ch-aqui, .fae-ch-aqui-caja { animation: none !important; } }
`;

/* --------------------------------- el texto --------------------------------- */

/*
 * Qué forma se ve, y el cuerpo de los nombres. 13,5 px es el de siempre en
 * escritorio; en el teléfono sube a 14 porque se lee a la distancia del brazo.
 * Ningún texto del camino baja de 12 px.
 */
const CSS_CAMINO = `
.fae-ch-estrecho { display: none; }
.fae-ch-rotulo { font-size: 13.5px; text-wrap: balance; }
@media (max-width: ${ANCHO_ESTRECHO}px) {
  .fae-ch-ancho { display: none; }
  .fae-ch-estrecho { display: block; }
  .fae-ch-rotulo { font-size: 14px; }
}
`;

/* Una medida del lienzo como porcentaje de su caja: así el HTML sigue al SVG al escalar. */
const pct = (v, total) => `${((v / total) * 100).toFixed(3)}%`;

/*
 * Cuando un rótulo parte línea, que las dos queden parejas: «Tienes una
 * partida / a medias» y no «Tienes una partida a / medias». Donde el navegador
 * no lo entiende, parte como siempre.
 */
const PAREJO = { textWrap: "balance" };

const MARCA = { display: "block", marginTop: "3px", fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "12.5px", lineHeight: 1.3, color: FAE.ambar, ...PAREJO };
const ETIQUETA = { display: "block", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "12px", letterSpacing: "0.12em", lineHeight: 1.3, color: FAE.ambar };

const alPulsar = (onAbrir, id) => ({
  onClick: () => onAbrir?.(id),
  onKeyDown: (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    onAbrir?.(id);
  },
});

/*
 * El color del rótulo de un nodo, por estado. El ícono de una actividad que
 * trae el suyo (`nodo.icono`, hoy solo Contabilidad) usa este mismo color.
 */
const colorDelRotulo = (nodo) => (nodo.completada ? FAE.text : "rgba(248,249,250,0.72)");

const etiquetaAria = (nodo, marcas, prefijo = "") =>
  `${prefijo}${nodo.nombre}${nodo.completada ? " · completada" : ""}${marcas?.[nodo.id] ? ` · ${marcas[nodo.id]}` : ""}`;

/* --------------------------------- la pieza --------------------------------- */

/**
 * @param {object} p
 * @param {Array<{id:string, nombre:string, completada:boolean}>} p.nodos
 * @param {(id:string) => void} p.onAbrir
 * @param {string} [p.vacio] qué decir cuando el tema todavía no tiene juegos
 * @param {{id:string, nombre:string, completada:boolean, etiqueta?:string}} [p.especial]
 *        nodo de desafío al lado del camino; sin él, nada cambia
 * @param {string} [p.resaltado] id del nodo que se resalta y se trae a la vista
 * @param {Object<string,string>} [p.marcas] texto corto junto a un nodo, por id
 *        —hoy solo «Tienes una partida a medias», en el Arca—
 * @param {boolean} [p.porBloques] partir el camino en bloques de dificultad; los
 *        nodos traen entonces su `dificultad` (nodosDe la pone)
 */
export default function CaminoHacer({ nodos = [], onAbrir, vacio, especial = null, resaltado = null, marcas = null, porBloques = false }) {
  const n = nodos.length;
  const caja = useRef(null);

  /*
   * EL NODO RESALTADO SE TRAE A LA VISTA. Es el que venía en la URL al
   * recargar dentro de un juego —ver useNodoEnRuta—: en un camino largo, un
   * aro que queda fuera de la pantalla no le dice nada a nadie.
   *
   * Cada nodo está dos veces en el DOM, una por forma, y la oculta no tiene
   * caja: se trae el que se ve.
   */
  useEffect(() => {
    if (!resaltado || !caja.current) return;
    const el = [...caja.current.querySelectorAll(`[data-nodo="${CSS.escape(resaltado)}"]`)]
      .find((x) => x.getClientRects().length > 0);
    el?.scrollIntoView?.({ block: "center", behavior: "auto" });
  }, [resaltado]);

  /*
   * Un tema sin juegos todavía. Se dice y ya: inventar nodos apagados de
   * relleno para que el camino "se vea" sería prometer contenido que no está.
   */
  if (n === 0) {
    return (
      <div
        style={{
          borderRadius: "18px",
          background: "rgba(248,249,250,0.04)",
          border: "1px dashed rgba(248,249,250,0.2)",
          padding: "clamp(24px, 4vw, 38px)",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.55)", margin: 0 }}>
          {vacio ?? "Los juegos de este tema están en construcción."}
        </p>
      </div>
    );
  }

  const comunes = { nodos, onAbrir, resaltado, marcas };

  if (porBloques) {
    return (
      <div ref={caja}>
        <style>{CSS_CAMINO}</style>
        {especial && <style>{CSS_ESPECIAL}</style>}
        {resaltado && <style>{CSS_RESALTADO}</style>}
        <CaminoPorBloques {...comunes} especial={especial} />
      </div>
    );
  }

  return (
    <div ref={caja}>
      <style>{CSS_CAMINO}</style>
      {especial && <style>{CSS_ESPECIAL}</style>}
      {resaltado && <style>{CSS_RESALTADO}</style>}

      {/* Escritorio: el desafío cuelga de su ramal. */}
      <div className="fae-ch-ancho">
        <Lienzo {...comunes} especial={especial} />
      </div>

      {/* Teléfono: el desafío arriba, como tarjeta, y el camino a su ancho de siempre. */}
      <div className="fae-ch-estrecho">
        {especial && (
          <DesafioEnTarjeta especial={especial} onAbrir={onAbrir} resaltado={resaltado} marca={marcas?.[especial.id]} marcas={marcas} />
        )}
        <Lienzo {...comunes} especial={null} />
      </div>
    </div>
  );
}

/* -------------------------------- el lienzo -------------------------------- */

function Lienzo({ nodos, onAbrir, especial, resaltado, marcas }) {
  const n = nodos.length;
  const m = medidas(n);
  const p = posiciones(n, m);
  const d = trazo(p);
  /* El siguiente sugerido: el primero sin hacer. Sugerencia, no puerta. */
  const sugerido = nodos.findIndex((x) => !x.completada);

  /*
   * El desafío cuelga de un ramal a la derecha, a la altura del tercio superior
   * del camino: lo bastante arriba para verse sin desplazarse y lo bastante
   * abajo para no competir con el primer nodo.
   */
  const anchoTotal = especial ? ANCHO + ANCHO_RAMAL : ANCHO;
  const radioEspecial = Math.round(m.radio * 1.45);
  const desdeIndice = Math.min(n - 1, Math.max(0, Math.round((n - 1) * 0.34)));
  const anclaje = p[desdeIndice];
  const esp = especial
    ? { x: ANCHO + ANCHO_RAMAL / 2 - 8, y: Math.max(anclaje.y, MARGEN_Y + radioEspecial) }
    : null;

  /*
   * Dónde va el rótulo de cada nodo, en porcentajes del lienzo.
   *
   * Al lado que quede libre: si el nodo se fue a la derecha, el rótulo va a su
   * izquierda, y al revés. Su ancho máximo es lo que queda hasta el borde del
   * camino —nunca el ramal—, y si el nombre no cabe parte la línea.
   *
   * Con un solo nodo va DEBAJO y centrado: a un lado le quedaban 168 unidades
   * y el nombre de Porter tiene 39 letras; en escritorio se salía del lienzo.
   */
  const lugarDelRotulo = (punto) => {
    if (n === 1) {
      return {
        left: pct(punto.x, anchoTotal), top: pct(punto.y + m.radio + 14, m.alto),
        width: pct(ANCHO - 60, anchoTotal), transform: "translateX(-50%)", textAlign: "center",
      };
    }
    return alLado(punto, m.radio, m.alto, anchoTotal);
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: `${anchoTotal}px`, margin: "0 auto" }}>
      <svg viewBox={`0 0 ${anchoTotal} ${m.alto}`} width="100%" style={{ display: "block", overflow: "visible" }}>
        {/* La línea del recorrido, por debajo de todo. */}
        {d && (
          <path d={d} fill="none" stroke="rgba(248,249,250,0.22)" strokeWidth={m.grosor} strokeLinecap="round" />
        )}
        {/*
          El tramo ya recorrido, en teal encima del gris. Se dibuja hasta el
          último nodo hecho: enseña avance real sin cerrarle el paso a nadie.
        */}
        {d && sugerido !== 0 && (
          <path
            d={trazo(p.slice(0, sugerido === -1 ? n : sugerido + 1))}
            fill="none"
            stroke={FAE.teal}
            strokeWidth={m.grosor}
            strokeLinecap="round"
            opacity="0.75"
          />
        )}

        {nodos.map((nodo, i) => (
          <NodoSvg
            key={nodo.id}
            nodo={nodo}
            x={p[i].x}
            y={p[i].y}
            m={m}
            numero={i + 1}
            sugerido={i === sugerido && n > 1}
            resaltado={resaltado}
            marcas={marcas}
            onAbrir={onAbrir}
          />
        ))}

        {/* ------------------------- el nodo de desafío ------------------------- */}
        {esp && (
          <g>
            {/* El ramal, discontinuo: sale del camino pero no es parte de él. */}
            <path
              d={`M ${anclaje.x} ${anclaje.y} C ${(anclaje.x + esp.x) / 2} ${anclaje.y}, ${(anclaje.x + esp.x) / 2} ${esp.y}, ${esp.x - radioEspecial} ${esp.y}`}
              fill="none"
              stroke={FAE.ambar}
              strokeWidth={m.grosor * 0.8}
              strokeLinecap="round"
              strokeDasharray="6 7"
              opacity="0.5"
            />

            <g
              data-nodo={especial.id}
              {...alPulsar(onAbrir, especial.id)}
              role="button"
              tabIndex={0}
              aria-label={etiquetaAria(especial, marcas, especial.etiqueta ? `${especial.etiqueta}: ` : "")}
              style={{ cursor: "pointer" }}
            >
              {resaltado === especial.id && (
                <circle className="fae-ch-aqui" cx={esp.x} cy={esp.y} r={radioEspecial + 20} fill="none" stroke={FAE.teal} strokeWidth="3" />
              )}
              <IconoDesafio cx={esp.x} cy={esp.y} r={radioEspecial} completada={especial.completada} Marca={especial.Marca} />
            </g>
          </g>
        )}
      </svg>

      {/* ------------------- los rótulos, en HTML y a px reales ------------------- */}
      {nodos.map((nodo, i) => (
        <span
          key={nodo.id}
          aria-hidden="true"
          className="fae-ch-rotulo"
          onClick={() => onAbrir?.(nodo.id)}
          style={{
            position: "absolute",
            ...lugarDelRotulo(p[i]),
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.3,
            color: colorDelRotulo(nodo),
            cursor: "pointer",
          }}
        >
          {nodo.nombre}
          {marcas?.[nodo.id] && <span style={MARCA}>{marcas[nodo.id]}</span>}
        </span>
      ))}

      {esp && (
        <>
          {/* El rótulo del desafío, debajo; el nombre es largo y puede partirse. */}
          <span
            aria-hidden="true"
            onClick={() => onAbrir?.(especial.id)}
            style={{
              position: "absolute",
              left: pct(esp.x, anchoTotal),
              top: pct(esp.y + radioEspecial + 14, m.alto),
              width: pct(ANCHO_RAMAL - 12, anchoTotal),
              transform: "translateX(-50%)",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <span style={ETIQUETA}>{(especial.etiqueta ?? "Desafío").toUpperCase()}</span>
            <span className="fae-ch-rotulo" style={{ display: "block", marginTop: "3px", fontFamily: "Inter, sans-serif", lineHeight: 1.3, color: FAE.text }}>
              {especial.nombre}
            </span>
          </span>

          {/*
            La marca de partida a medias va ENCIMA del nodo: debajo están el
            rótulo y el nombre, y más abajo puede acabarse el lienzo.
          */}
          {marcas?.[especial.id] && (
            <span
              aria-hidden="true"
              onClick={() => onAbrir?.(especial.id)}
              style={{
                ...MARCA,
                position: "absolute",
                marginTop: 0,
                left: pct(esp.x, anchoTotal),
                top: pct(esp.y - radioEspecial - 20, m.alto),
                width: pct(ANCHO_RAMAL - 12, anchoTotal),
                transform: "translate(-50%, -100%)",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              {marcas[especial.id]}
            </span>
          )}
        </>
      )}
    </div>
  );
}

/*
 * El rótulo de un nodo, al lado que quede libre: si el nodo se fue a la
 * derecha, el rótulo va a su izquierda, y al revés. Su ancho máximo es lo que
 * queda hasta el borde del camino —nunca el ramal—, y si el nombre no cabe
 * parte la línea.
 */
function alLado({ x, y }, radio, alto, anchoTotal = ANCHO) {
  const aLaDerecha = x < ANCHO / 2;
  const borde = aLaDerecha ? x + radio + 12 : x - radio - 12;
  const libre = (aLaDerecha ? ANCHO - borde : borde) - 6;
  return {
    ...(aLaDerecha ? { left: pct(borde, anchoTotal), textAlign: "left" } : { right: pct(anchoTotal - borde, anchoTotal), textAlign: "right" }),
    top: pct(y, alto), maxWidth: pct(libre, anchoTotal), transform: "translateY(-50%)",
  };
}

/* Un nodo del camino. Lo usan las dos formas: la de siempre y la de bloques. */
function NodoSvg({ nodo, x, y, m, numero, sugerido, resaltado, marcas, onAbrir, tono = null, bloqueId, prefijo = "" }) {
  const Icono = iconoDe(nodo.id);
  const lado = Math.round(m.radio * 1.1);
  return (
    <g
      data-nodo={nodo.id}
      data-bloque-de={bloqueId}
      {...alPulsar(onAbrir, nodo.id)}
      role="button"
      tabIndex={0}
      aria-label={etiquetaAria(nodo, marcas, prefijo)}
      style={{ cursor: "pointer" }}
    >
      {/*
        * Aro del sugerido: acento, no candado. Era coral, y el coral es error en
        * todo el sitio; desde que el camino empieza en una Fácil, un aro coral en
        * el primer nodo se leía como "aquí algo va mal". Teal, fino y quieto: el
        * de "estás aquí" es más ancho, más separado y late.
        */}
      {sugerido && (
        <circle data-sugerido cx={x} cy={y} r={m.radio + 7} fill="none" stroke={FAE.teal} strokeWidth="2" opacity="0.75" />
      )}
      {resaltado === nodo.id && (
        <circle className="fae-ch-aqui" cx={x} cy={y} r={m.radio + 12} fill="none" stroke={FAE.teal} strokeWidth="3" />
      )}

      <circle
        cx={x}
        cy={y}
        r={m.radio}
        fill={nodo.completada ? FAE.teal : "rgba(14,27,46,0.85)"}
        stroke={nodo.completada ? FAE.teal : tono?.nodo ?? "rgba(248,249,250,0.45)"}
        strokeWidth={tono ? 2.5 : 2}
        style={tono?.brillo && !nodo.completada ? { filter: tono.brillo } : undefined}
      />

      {/*
        Dentro, el icono de la actividad; sin uno declarado, el número de
        siempre, que orienta sin ordenar. Los dos se quedan en el SVG porque
        aguantan la escala: a 320 px de ventana el número sigue en 16 px y el
        icono en unos 22.

        Hecha no es solo un color: además del relleno teal lleva un ✓ en su
        esquina.
      */}
      {nodo.icono ? (
        /*
          El ícono propio de la actividad (Contabilidad): el SVG de Xeno tal
          cual, en currentColor, con el color del rótulo del nodo. Lleva el ✓
          de hecha igual que los demás íconos.
        */
        <>
          <g transform={`translate(${(x - lado / 2).toFixed(1)} ${(y - lado / 2).toFixed(1)})`} pointerEvents="none" data-icono={nodo.id} data-icono-propio style={{ color: colorDelRotulo(nodo) }}>
            <nodo.icono size={lado} />
          </g>
          {nodo.completada && <Hecha x={x + m.radio * 0.74} y={y - m.radio * 0.74} r={Math.max(7, m.radio * 0.36)} />}
        </>
      ) : Icono ? (
        <>
          <g transform={`translate(${(x - lado / 2).toFixed(1)} ${(y - lado / 2).toFixed(1)})`} pointerEvents="none" data-icono={nodo.id}>
            <Icono size={lado} color={nodo.completada ? FAE.bg : "rgba(248,249,250,0.9)"} strokeWidth={2} aria-hidden="true" />
          </g>
          {nodo.completada && <Hecha x={x + m.radio * 0.74} y={y - m.radio * 0.74} r={Math.max(7, m.radio * 0.36)} />}
        </>
      ) : (
        <text
          x={x}
          y={y + m.radio * 0.34}
          textAnchor="middle"
          fontFamily="Sora, sans-serif"
          fontWeight="700"
          fontSize={m.radio * 0.92}
          fill={nodo.completada ? FAE.bg : "rgba(248,249,250,0.75)"}
          pointerEvents="none"
        >
          {numero}
        </text>
      )}
    </g>
  );
}

/* El ✓ de un nodo hecho: una marca que no depende del color. */
function Hecha({ x, y, r }) {
  return (
    <g pointerEvents="none" aria-hidden="true">
      <circle cx={x} cy={y} r={r} fill={FAE.bg} stroke={FAE.teal} strokeWidth="2" />
      <path
        d={`M ${x - r * 0.45} ${y + r * 0.02} L ${x - r * 0.1} ${y + r * 0.38} L ${x + r * 0.48} ${y - r * 0.34}`}
        fill="none" stroke={FAE.teal} strokeWidth={Math.max(2, r * 0.26)} strokeLinecap="round" strokeLinejoin="round"
      />
    </g>
  );
}

/* ------------------------------ por bloques ------------------------------ */

/*
 * El teal de cada bloque, de apagado a saturado: Cimientos y Aplicación
 * apagados, Análisis a medias, Maestría entero y con un brillo suave. NUNCA
 * CORAL: en el resto del sitio el coral es error, y usarlo para "más difícil"
 * haría que un bloque se leyera como algo que salió mal. El color no dice el
 * nivel solo: lo dicen el título del bloque y su dificultad escritos.
 */
const TONOS = {
  cimientos: { acento: "rgba(42,157,143,0.5)", nodo: "rgba(42,157,143,0.55)", linea: "rgba(42,157,143,0.65)", brillo: null },
  aplicacion: { acento: "rgba(42,157,143,0.5)", nodo: "rgba(42,157,143,0.55)", linea: "rgba(42,157,143,0.65)", brillo: null },
  analisis: { acento: "rgba(42,157,143,0.8)", nodo: "rgba(42,157,143,0.8)", linea: "rgba(42,157,143,0.85)", brillo: null },
  maestria: { acento: FAE.teal, nodo: FAE.teal, linea: FAE.teal, brillo: "drop-shadow(0 0 5px rgba(42,157,143,0.75))" },
  otras: { acento: "rgba(248,249,250,0.4)", nodo: "rgba(248,249,250,0.45)", linea: "rgba(42,157,143,0.65)", brillo: null },
};

const OCULTO = { position: "absolute", width: "1px", height: "1px", overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap" };

function CaminoPorBloques({ nodos, onAbrir, especial, resaltado, marcas }) {
  const bloques = bloquesDe(nodos);
  const orden = bloques.flatMap((b) => b.nodos);
  /*
   * Tocar un nodo abre su panel —con la previsualización— y «Empezar» abre la
   * actividad. Antes el toque entraba directo; el panel es lo que da un
   * sitio donde enseñar el gesto antes de entrar.
   */
  const [detalle, setDetalle] = useState(null);
  const nodoDetalle = detalle ? nodos.find((x) => x.id === detalle) : null;
  const bloqueDetalle = nodoDetalle ? bloques.find((b) => b.nodos.includes(nodoDetalle)) : null;

  return (
    <>
      {especial && (
        <DesafioEnTarjeta especial={especial} onAbrir={onAbrir} resaltado={resaltado} marca={marcas?.[especial.id]} marcas={marcas} />
      )}
      <LienzoPorBloques bloques={bloques} onAbrir={setDetalle} resaltado={resaltado} marcas={marcas} />
      {nodoDetalle && (
        <DetalleNodo
          key={nodoDetalle.id}
          nodo={nodoDetalle}
          bloque={bloqueDetalle}
          numero={orden.indexOf(nodoDetalle) + 1}
          onCerrar={() => setDetalle(null)}
          onEmpezar={() => {
            setDetalle(null);
            onAbrir?.(nodoDetalle.id);
            registrarApertura(nodoDetalle.id);
          }}
        />
      )}
    </>
  );
}

/*
 * EL CAMINO POR BLOQUES, EN UN SOLO LIENZO: una línea de punta a punta, sin
 * cortes entre bloques. Los títulos van en su franja, al lado contrario de por
 * donde baja la línea (ver disposicionPorBloques), en HTML y a px reales como
 * los rótulos. Al ancho del lienzo y centrado: en escritorio la columna mide
 * 860 y un título a su izquierda quedaría lejos del camino.
 *
 * Cada nodo lleva en su nombre accesible el bloque y la dificultad —el título
 * ya no lo envuelve en el DOM, así que un lector de pantalla lo oye ahí—.
 */
function LienzoPorBloques({ bloques, onAbrir, resaltado, marcas }) {
  const orden = bloques.flatMap((b) => b.nodos);
  const { m, puntos, cabeceras } = disposicionPorBloques(bloques, orden.length);
  const bloqueDe = new Map(bloques.flatMap((b) => b.nodos.map((n) => [n.id, b])));
  const tonoDe = (id) => TONOS[bloqueDe.get(id)?.id] ?? TONOS.otras;
  /* El siguiente sugerido: el primero sin hacer en el orden del camino. */
  const sugerido = orden.findIndex((x) => !x.completada);
  /* El recorrido llega hasta él, cada tramo del tono del bloque al que entra. */
  const recorridos = sugerido === -1 ? orden.length - 1 : sugerido;

  return (
    <div data-camino-bloques style={{ position: "relative", width: "100%", maxWidth: `${ANCHO}px`, margin: "0 auto" }}>
      <svg viewBox={`0 0 ${ANCHO} ${m.alto}`} width="100%" style={{ display: "block", overflow: "visible" }}>
        {puntos.length > 1 && (
          <path data-linea d={trazo(puntos)} fill="none" stroke="rgba(248,249,250,0.22)" strokeWidth={m.grosor} strokeLinecap="round" />
        )}
        {tramosSueltos(puntos).slice(0, Math.max(0, recorridos)).map((d, i) => (
          <path key={i} data-recorrido d={d} fill="none" stroke={tonoDe(orden[i + 1].id).linea} strokeWidth={m.grosor} strokeLinecap="round" opacity="0.75" />
        ))}
        {orden.map((nodo, i) => {
          const b = bloqueDe.get(nodo.id);
          return (
            <NodoSvg
              key={nodo.id}
              nodo={nodo}
              x={puntos[i].x}
              y={puntos[i].y}
              m={m}
              numero={i + 1}
              sugerido={i === sugerido && orden.length > 1}
              resaltado={resaltado}
              marcas={marcas}
              onAbrir={onAbrir}
              tono={tonoDe(nodo.id)}
              bloqueId={b.id}
              prefijo={`${b.nombre}, ${b.etiqueta.toLowerCase()}: `}
            />
          );
        })}
      </svg>

      {cabeceras.map((c) => {
        const b = bloques.find((x) => x.id === c.id);
        return (
          <section
            key={c.id}
            data-bloque={c.id}
            data-lado={c.lado < 0 ? "izquierda" : "derecha"}
            aria-labelledby={`fae-cb-${c.id}`}
            style={{ position: "absolute", top: pct(c.y + 6, m.alto), maxWidth: "58%", ...(c.lado < 0 ? { left: 0 } : { right: 0 }) }}
          >
            <CabezaBloque bloque={b} tono={TONOS[b.id] ?? TONOS.otras} alDerecha={c.lado > 0} />
          </section>
        );
      })}

      {orden.map((nodo, i) => (
        <span
          key={nodo.id}
          aria-hidden="true"
          className="fae-ch-rotulo"
          onClick={() => onAbrir?.(nodo.id)}
          style={{
            position: "absolute",
            ...alLado(puntos[i], m.radio, m.alto),
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.3,
            color: colorDelRotulo(nodo),
            cursor: "pointer",
          }}
        >
          {nodo.nombre}
          {marcas?.[nodo.id] && <span style={MARCA}>{marcas[nodo.id]}</span>}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------ el panel del nodo ------------------------------ */

const CSS_DETALLE = `
.fae-dn-fondo { position: fixed; inset: 0; z-index: 65; display: flex; align-items: center; justify-content: center; padding: 16px; background: rgba(6,12,22,0.62); animation: fae-dn-fundido 140ms ease-out backwards; }
/* La entrada solo rellena hacia atrás: al acabar no retiene el transform, y la hoja puede seguir al dedo y volver con su transición. */
.fae-dn { width: min(100%, 380px); box-sizing: border-box; border-radius: 22px; padding: 20px 20px 18px; text-align: center; color: ${FAE.text};
  background: linear-gradient(160deg, #1C3150, #13233B); border: 1px solid rgba(248,249,250,0.22); box-shadow: 0 18px 48px rgba(0,0,0,0.5);
  transition: transform 180ms ease; animation: fae-dn-subir 180ms cubic-bezier(.2,.8,.3,1) backwards; }
.fae-dn-agarre { display: none; }
.fae-dn-previa { width: 144px; height: 108px; margin: 0 auto 14px; border-radius: 16px; display: grid; place-items: center; overflow: hidden;
  background: #13233B; border: 1px solid rgba(248,249,250,0.14); }
.fae-dn-bloque { margin: 0 0 4px; font-family: Sora, sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 0.12em; color: rgba(248,249,250,0.72); }
.fae-dn-titulo { margin: 0 0 6px; font-family: Sora, sans-serif; font-weight: 700; font-size: 19px; line-height: 1.25; letter-spacing: -0.01em; }
.fae-dn-hecha { margin: 0; font-size: 13.5px; color: rgba(248,249,250,0.85); }
.fae-dn-botones { display: flex; gap: 10px; margin-top: 16px; }
.fae-dn-botones button { flex: 1; font-family: Sora, sans-serif; font-weight: 600; font-size: 15px; padding: 13px 16px; border-radius: 999px; cursor: pointer; }
.fae-dn-empezar { background: ${FAE.teal}; border: none; color: ${FAE.bg}; }
.fae-dn-cerrar { background: transparent; border: 1px solid rgba(248,249,250,0.3); color: ${FAE.text}; }
@keyframes fae-dn-fundido { from { opacity: 0; } }
@keyframes fae-dn-subir { from { opacity: 0; transform: translateY(14px); } }
@media (max-width: ${ANCHO_ESTRECHO}px) {
  .fae-dn-fondo { align-items: flex-end; padding: 0; }
  /* Sin desplazamiento propio: el arrastre vertical es de la hoja, no de la página. */
  .fae-dn { width: 100%; border-radius: 22px 22px 0 0; padding-bottom: max(18px, env(safe-area-inset-bottom)); touch-action: none; }
  /* El asa: dice que la hoja se puede bajar. */
  .fae-dn-agarre { display: block; width: 40px; height: 4px; border-radius: 999px; margin: -8px auto 12px; background: rgba(248,249,250,0.35); }
}
@media (prefers-reduced-motion: reduce) { .fae-dn-fondo, .fae-dn { animation: none !important; } }
`;

/* El icono quieto, en grande: lo que se ve antes de la animación, y en lugar de ella. */
function IconoEstatico({ nodo, numero }) {
  const Icono = iconoDe(nodo.id);
  return (
    <span
      data-estatico
      style={{
        width: "72px", height: "72px", borderRadius: "50%", display: "grid", placeItems: "center",
        border: `2.5px solid ${FAE.teal}`, background: "rgba(14,27,46,0.85)", color: FAE.text,
      }}
    >
      {nodo.icono ? (
        /* El ícono propio, del color del título de la ventana (FAE.text, heredado). */
        <nodo.icono size={36} />
      ) : Icono ? (
        <Icono size={36} color="rgba(248,249,250,0.92)" strokeWidth={1.8} aria-hidden="true" />
      ) : (
        <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "26px" }}>{numero}</span>
      )}
    </span>
  );
}

/*
 * EL PANEL PRIMERO, LA ANIMACIÓN DESPUÉS. El panel se pinta en el mismo toque
 * con el icono quieto; la previsualización se monta dos fotogramas más tarde,
 * cuando el panel ya está en pantalla, y su código se descarga la primera vez
 * (ver PreviaActividad). Una previsualización que hiciera sentir lento el
 * toque sería peor que ninguna.
 *
 * Solo existe mientras el panel está abierto: al cerrar o al empezar se
 * desmonta y el bucle se acaba. Con "reducir movimiento" no se monta nunca:
 * se queda el icono quieto, sin excepciones.
 */
function DetalleNodo({ nodo, bloque, numero, onCerrar, onEmpezar }) {
  const caja = useRef(null);
  const empezar = useRef(null);
  const cerrar = useRef(onCerrar);
  cerrar.current = onCerrar;
  const [animar, setAnimar] = useState(false);
  const reducir = typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);

  /*
   * DESLIZAR HACIA ABAJO CIERRA, en el teléfono: es lo que la gente intenta
   * con una hoja que sube desde abajo. La hoja sigue al dedo; si baja más de
   * 90 px —o se lanza rápido—, se cierra, y si no, vuelve a su sitio. Hasta
   * 8 px sigue siendo un toque, para no comerse los botones, y el clic que
   * llega después de un arrastre se descarta. En escritorio no hay hoja:
   * Escape y tocar fuera.
   */
  const arrastre = useRef(null);
  const tragarClic = useRef(false);
  const [bajada, setBajada] = useState(0);
  const alPresionar = (e) => {
    if (!window.matchMedia?.(`(max-width: ${ANCHO_ESTRECHO}px)`)?.matches) return;
    arrastre.current = { y0: e.clientY, t0: performance.now(), dy: 0, movido: false, id: e.pointerId, el: e.currentTarget };
  };
  const alMover = (e) => {
    const a = arrastre.current;
    if (!a) return;
    a.dy = Math.max(0, e.clientY - a.y0);
    if (!a.movido && a.dy > 8) {
      a.movido = true;
      try { if (a.id != null) a.el.setPointerCapture?.(a.id); } catch { /* sin captura, se sigue igual */ }
    }
    if (a.movido) setBajada(a.dy);
  };
  const alSoltar = () => {
    const a = arrastre.current;
    arrastre.current = null;
    if (!a) return;
    if (a.movido) tragarClic.current = true;
    const lanzada = a.dy > 40 && performance.now() - a.t0 < 250;
    if (a.dy > 90 || lanzada) cerrar.current();
    else setBajada(0);
  };

  useEffect(() => {
    const previo = document.activeElement;
    empezar.current?.focus();
    let segundo = null;
    const primero = requestAnimationFrame(() => {
      segundo = requestAnimationFrame(() => setAnimar(true));
    });
    const alPulsar = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cerrar.current();
        return;
      }
      /* El foco se queda dentro del panel mientras está abierto. */
      if (e.key === "Tab" && caja.current) {
        const botones = [...caja.current.querySelectorAll("button")];
        const [a, z] = [botones[0], botones[botones.length - 1]];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    document.addEventListener("keydown", alPulsar);
    return () => {
      cancelAnimationFrame(primero);
      if (segundo !== null) cancelAnimationFrame(segundo);
      document.removeEventListener("keydown", alPulsar);
      if (previo?.isConnected) previo.focus?.();
    };
  }, []);

  const estatico = <IconoEstatico nodo={nodo} numero={numero} />;

  return (
    <div className="fae-dn-fondo" onClick={() => cerrar.current()}>
      <style>{CSS_DETALLE}</style>
      <div
        ref={caja}
        className="fae-dn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fae-dn-titulo"
        onClick={(e) => e.stopPropagation()}
        onClickCapture={(e) => {
          if (!tragarClic.current) return;
          tragarClic.current = false;
          e.stopPropagation();
          e.preventDefault();
        }}
        onPointerDown={alPresionar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
        style={bajada ? { transform: `translateY(${bajada}px)`, transition: "none" } : undefined}
      >
        <span className="fae-dn-agarre" aria-hidden="true" />
        <div className="fae-dn-previa" aria-hidden="true">
          {animar && !reducir ? <PreviaActividad actividadId={nodo.id} respaldo={estatico} /> : estatico}
        </div>
        {bloque && (
          <p className="fae-dn-bloque">
            {bloque.nombre.toUpperCase()} · {bloque.etiqueta.toUpperCase()}
          </p>
        )}
        <h3 id="fae-dn-titulo" className="fae-dn-titulo">{nodo.nombre}</h3>
        {nodo.completada && (
          <p className="fae-dn-hecha"><span aria-hidden="true">✓ </span>Ya la completaste</p>
        )}
        <div className="fae-dn-botones">
          <button type="button" className="fae-dn-cerrar" onClick={() => cerrar.current()}>Cerrar</button>
          <button ref={empezar} type="button" className="fae-dn-empezar" onClick={onEmpezar}>Empezar</button>
        </div>
      </div>
    </div>
  );
}

/*
 * El título del bloque con su anillo: el arco dice cuánto va hecho y dentro va
 * la fracción escrita, «2/3», que es texto y no solo un dibujo. Se pone al día
 * sola al completar una actividad: los nodos vienen de useCompletadas, que
 * escucha el canal de FP.
 */
function CabezaBloque({ bloque, tono, alDerecha = false }) {
  const { hechas, total } = bloque;
  const R = 17;
  const L = 2 * Math.PI * R;
  return (
    <div
      data-cabeza-bloque={bloque.id}
      style={{ display: "flex", alignItems: "center", gap: "12px", flexDirection: alDerecha ? "row-reverse" : "row", textAlign: alDerecha ? "right" : "left" }}
    >
      <span
        role="img"
        aria-label={`${hechas} de ${total} ${total === 1 ? "completada" : "completadas"}`}
        style={{ position: "relative", width: "44px", height: "44px", flexShrink: 0 }}
      >
        <svg viewBox="0 0 44 44" width="44" height="44" aria-hidden="true" style={{ display: "block", overflow: "visible", filter: tono.brillo ?? undefined }}>
          <circle cx="22" cy="22" r={R} fill="none" stroke="rgba(248,249,250,0.16)" strokeWidth="3" />
          {hechas > 0 && (
            <circle
              cx="22" cy="22" r={R} fill="none" stroke={tono.acento} strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${((L * hechas) / total).toFixed(2)} ${L.toFixed(2)}`}
              transform="rotate(-90 22 22)"
              style={{ transition: "stroke-dasharray 500ms ease" }}
            />
          )}
        </svg>
        <span
          aria-hidden="true"
          data-fraccion
          style={{
            position: "absolute", inset: 0, display: "grid", placeItems: "center",
            fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "12px", color: FAE.text, fontVariantNumeric: "tabular-nums",
          }}
        >
          {hechas}/{total}
        </span>
      </span>
      <span style={{ minWidth: 0 }}>
        <h3 id={`fae-cb-${bloque.id}`} style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "16px", letterSpacing: "-0.01em", lineHeight: 1.2, color: FAE.text }}>
          {bloque.nombre}
        </h3>
        <span style={{ display: "block", marginTop: "2px", fontFamily: "Inter, sans-serif", fontSize: "12.5px", lineHeight: 1.3, color: "rgba(248,249,250,0.66)" }}>
          {bloque.etiqueta}
          <span style={OCULTO}>, {hechas} de {total} completadas</span>
        </span>
      </span>
    </div>
  );
}

/* El círculo del desafío: halo, aro y la ola del nivel del agua. Lo usan las dos formas. */
/*
 * EL DIBUJO DE DENTRO ES DEL TEMA, EL HALO ES DEL SITIO.
 *
 * El aro ámbar, el halo que respira y el relleno al completarlo son la forma de
 * «esto es un desafío» y valen para todos. Lo de dentro identifica a cada uno:
 * las olas son del Arca y la mesa de junta es del Comité de NOVA. Un desafío
 * que no pase su `Marca` se queda con las olas, que es lo que había antes de
 * que existiera el segundo.
 */
function MarcaOlas({ cx, cy, r, completada }) {
  const ola = (dy, opacity) => (
    <path
      d={`M ${cx - r * 0.52} ${cy + r * dy} q ${r * 0.26} ${-r * 0.3}, ${r * 0.52} 0 t ${r * 0.52} 0`}
      fill="none"
      stroke={completada ? FAE.bg : FAE.ambar}
      strokeWidth={Math.max(1.8, r * 0.062)}
      strokeLinecap="round"
      opacity={opacity}
      pointerEvents="none"
    />
  );
  return (
    <>
      {ola(0.16, 1)}
      {ola(0.5, 0.6)}
    </>
  );
}

function IconoDesafio({ cx, cy, r, completada, Marca = MarcaOlas }) {
  return (
    <>
      {/* El halo, que es lo que lo hace "legendario" sin gritar. */}
      <circle className="fae-ch-halo" cx={cx} cy={cy} r={r + r * 0.33} fill={FAE.ambar} />
      <circle cx={cx} cy={cy} r={r + r * 0.13} fill="none" stroke={FAE.ambar} strokeWidth="1.5" opacity="0.4" />
      <circle cx={cx} cy={cy} r={r} fill={completada ? FAE.ambar : "rgba(14,27,46,0.95)"} stroke={FAE.ambar} strokeWidth={Math.max(2.2, r * 0.077)} />
      <Marca cx={cx} cy={cy} r={r} completada={completada} />
    </>
  );
}

/*
 * El desafío en el teléfono: una tarjeta encima del camino. Mismo icono, mismo
 * ámbar, mismos datos que el nodo del ramal; solo cambia dónde está.
 */
function DesafioEnTarjeta({ especial, onAbrir, resaltado, marca, marcas }) {
  return (
    <button
      type="button"
      data-nodo={especial.id}
      onClick={() => onAbrir?.(especial.id)}
      aria-label={etiquetaAria(especial, marcas, especial.etiqueta ? `${especial.etiqueta}: ` : "")}
      className={resaltado === especial.id ? "fae-ch-aqui-caja" : undefined}
      style={{
        display: "flex", alignItems: "center", gap: "14px", width: "100%", textAlign: "left",
        padding: "14px 16px", margin: "0 0 26px", borderRadius: "18px", cursor: "pointer",
        background: "linear-gradient(155deg, rgba(233,196,106,0.10), rgba(10,20,34,0.55) 60%)",
        border: `1px solid ${FAE.ambar}66`, color: FAE.text,
      }}
    >
      <svg width="58" height="58" viewBox="0 0 58 58" aria-hidden="true" style={{ flexShrink: 0, overflow: "visible" }}>
        <IconoDesafio cx={29} cy={29} r={21} completada={especial.completada} Marca={especial.Marca} />
      </svg>
      <span style={{ minWidth: 0 }}>
        <span style={ETIQUETA}>{(especial.etiqueta ?? "Desafío").toUpperCase()}</span>
        <span style={{ display: "block", marginTop: "3px", fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "16px", lineHeight: 1.3 }}>
          {especial.nombre}
        </span>
        {marca && <span style={{ ...MARCA, marginTop: "4px", fontSize: "13px" }}>{marca}</span>}
      </span>
    </button>
  );
}
