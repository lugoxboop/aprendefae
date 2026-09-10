import { useEffect, useRef } from "react";
import { FAE, ANCHO_ESTRECHO } from "../../theme.js";

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

/*
 * Curva suave que pasa por todos los puntos (Catmull-Rom convertido a Bézier).
 * Se usa esto y no una polilínea porque el lenguaje de líneas del sitio —la
 * red de la portada, los flujos de Demanda Agregada— es curvo, y un zigzag
 * rígido cantaría a plantilla de otro producto.
 */
export function trazo(p) {
  if (p.length < 2) return "";
  let d = `M ${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

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
 */
export default function CaminoHacer({ nodos = [], onAbrir, vacio, especial = null, resaltado = null, marcas = null }) {
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
  const lugarDelRotulo = ({ x, y }) => {
    if (n === 1) {
      return {
        left: pct(x, anchoTotal), top: pct(y + m.radio + 14, m.alto),
        width: pct(ANCHO - 60, anchoTotal), transform: "translateX(-50%)", textAlign: "center",
      };
    }
    const aLaDerecha = x < ANCHO / 2;
    const borde = aLaDerecha ? x + m.radio + 12 : x - m.radio - 12;
    const libre = (aLaDerecha ? ANCHO - borde : borde) - 6;
    return {
      ...(aLaDerecha ? { left: pct(borde, anchoTotal), textAlign: "left" } : { right: pct(anchoTotal - borde, anchoTotal), textAlign: "right" }),
      top: pct(y, m.alto), maxWidth: pct(libre, anchoTotal), transform: "translateY(-50%)",
    };
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

        {nodos.map((nodo, i) => {
          const { x, y } = p[i];
          const esSugerido = i === sugerido && n > 1;
          return (
            <g
              key={nodo.id}
              data-nodo={nodo.id}
              {...alPulsar(onAbrir, nodo.id)}
              role="button"
              tabIndex={0}
              aria-label={etiquetaAria(nodo, marcas)}
              style={{ cursor: "pointer" }}
            >
              {/* Aro coral del sugerido: acento, no candado. */}
              {esSugerido && (
                <circle cx={x} cy={y} r={m.radio + 7} fill="none" stroke={FAE.coral} strokeWidth="2" opacity="0.75" />
              )}
              {resaltado === nodo.id && (
                <circle className="fae-ch-aqui" cx={x} cy={y} r={m.radio + 12} fill="none" stroke={FAE.teal} strokeWidth="3" />
              )}

              <circle
                cx={x}
                cy={y}
                r={m.radio}
                fill={nodo.completada ? FAE.teal : "rgba(14,27,46,0.85)"}
                stroke={nodo.completada ? FAE.teal : "rgba(248,249,250,0.45)"}
                strokeWidth="2"
              />

              {/*
                El número dentro. Orienta sin ordenar. Se queda en el SVG porque
                aguanta la escala: a 320 px de ventana sigue en 16 px.
              */}
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
                {i + 1}
              </text>
            </g>
          );
        })}

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
              <IconoDesafio cx={esp.x} cy={esp.y} r={radioEspecial} completada={especial.completada} />
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
            color: nodo.completada ? FAE.text : "rgba(248,249,250,0.72)",
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

/* El círculo del desafío: halo, aro y la ola del nivel del agua. Lo usan las dos formas. */
function IconoDesafio({ cx, cy, r, completada }) {
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
      {/* El halo, que es lo que lo hace "legendario" sin gritar. */}
      <circle className="fae-ch-halo" cx={cx} cy={cy} r={r + r * 0.33} fill={FAE.ambar} />
      <circle cx={cx} cy={cy} r={r + r * 0.13} fill="none" stroke={FAE.ambar} strokeWidth="1.5" opacity="0.4" />
      <circle cx={cx} cy={cy} r={r} fill={completada ? FAE.ambar : "rgba(14,27,46,0.95)"} stroke={FAE.ambar} strokeWidth={Math.max(2.2, r * 0.077)} />
      {ola(0.16, 1)}
      {ola(0.5, 0.6)}
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
        <IconoDesafio cx={29} cy={29} r={21} completada={especial.completada} />
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
