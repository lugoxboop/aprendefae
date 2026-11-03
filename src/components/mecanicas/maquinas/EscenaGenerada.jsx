import { FAE } from "../../../theme.js";
import { Parte, CSS_MAQUINAS } from "./salaDeMaquinas.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA ESCENA GENERADA — la capa 2 de una pieza que escribió Fermi.
 *
 * Las piezas de Aprender del sitio traen su `Escena` escrita a mano, SVG a
 * SVG. Las que escribe Fermi no pueden: lo que sale de un PDF ajeno son
 * datos, nunca código. Este componente es el otro extremo de esa frontera —
 * cinco figuras escritas a mano, aquí, de una vez, y el modelo solo las
 * llena.
 *
 * El contrato de datos y lo que se acepta está en
 * `supabase/functions/fabrica/escena.js`, que es donde tiene que estar: lo
 * que llega del modelo se valida en el servidor, antes de guardarse. Aquí se
 * pinta lo que ya pasó por ahí, y aun así se pinta a la defensiva: una pieza
 * guardada hace un mes puede traer una forma que ya no existe.
 *
 * Vive con las escenas escritas a mano y no en `shared/`: es una máquina,
 * usa su misma lámina y sus mismas primitivas. En `shared/` además rige el
 * piso de 12 px para el texto, que aquí no aplica — las unidades del viewBox
 * no son píxeles, y 13,5 de lámina son ~11 px en pantalla.
 *
 * ═══════════ LA LÁMINA DE 360 ═══════════
 *
 * Mismo convenio que la sala de máquinas: el viewBox mide 360 de ancho y la
 * letra va en 13,5. A 375 px de pantalla la escena ocupa unos 292 y la letra
 * cae en ~11 px, por encima del piso de 10,5 del sitio. A 320 px —el ancho
 * de comprobación— queda en 10,7. Por eso los rótulos están topados en 24
 * caracteres en el validador: no es manía, es lo que cabe.
 *
 * ═══════════ UNA COSA ENCENDIDA, EL RESTO APAGADO ═══════════
 *
 * `resaltar` llega como array de ids y se reparte con `Parte`, el mismo
 * helper que usan las escenas a mano: la parte encendida se rellena de teal
 * con tinta oscura encima, y las demás bajan a 0,18 de opacidad. Mateo lo
 * pidió así —«no se guía a la persona con la mirada»— y es la diferencia
 * entre una figura y un diagrama.
 *
 * Sobre el teal: va de relleno y de borde, nunca de color de letra. Encima
 * del relleno teal la tinta es #06202A. Es la regla del sitio y hay un
 * trinquete en CI que la vigila.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const TINTA_SOBRE_TEAL = "#06202A";
const LINEA = "rgba(248,249,250,0.72)";
const TENUE = "rgba(248,249,250,0.30)";
const SUAVE = "rgba(248,249,250,0.82)";

const ANCHO = 360;
const FUENTE = "Inter, sans-serif";
const ROTULO = { fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em" };

/*
 * Cuántos caracteres caben en una línea de `ancho` unidades. En Inter el
 * carácter medio pesa unas 0,56 veces el cuerpo. Empecé con 0,53 —la media
 * exacta— y los rótulos se montaban sobre las cifras: la media no sirve
 * porque un rótulo real no es texto medio, trae mayúsculas y acentos. 0,56 es
 * lo que aguantó «Venta de contado» al lado de «1.200.000», medido.
 */
const CABEN = (ancho, cuerpo = 13.5) => Math.max(4, Math.floor(ancho / (cuerpo * 0.56)));

/* Lo que ocupa una cifra ya formateada, para reservárselo al rótulo. */
const ANCHO_CIFRA = (valor, cuerpo = 12) =>
  typeof valor === "number" ? valor.toLocaleString("es-CO").length * cuerpo * 0.56 + 10 : 0;

/** ¿Cabe entero, sin que `repartir` tenga que cortarlo? */
const cabe = (texto, ancho, cuerpo) => String(texto ?? "").length <= CABEN(ancho, cuerpo);

/** Parte el rótulo en como mucho `lineas` renglones sin cortar palabras. */
export function repartir(texto, ancho, lineas = 2, cuerpo = 13.5) {
  const tope = CABEN(ancho, cuerpo);
  const palabras = String(texto ?? "").split(/\s+/).filter(Boolean);
  const filas = [];
  let actual = "";

  for (const palabra of palabras) {
    const tentativa = actual ? `${actual} ${palabra}` : palabra;
    if (tentativa.length <= tope) { actual = tentativa; continue; }
    if (actual) filas.push(actual);
    actual = palabra;
    if (filas.length === lineas) break;
  }
  if (actual && filas.length < lineas) filas.push(actual);

  /* Lo que no cupo se corta con puntos suspensivos en el último renglón: una
     palabra partida a la mitad se lee peor que una frase que se sabe cortada. */
  const sobra = palabras.join(" ").length > filas.join(" ").length;
  if (sobra && filas.length) {
    const ultima = filas[filas.length - 1];
    filas[filas.length - 1] = `${ultima.slice(0, Math.max(1, tope - 1))}…`;
  }
  return filas.length ? filas : [""];
}

function Texto({ x, y, children, cuerpo = 13.5, color = SUAVE, peso = 400, ancla = "middle" }) {
  return (
    <text x={x} y={y} textAnchor={ancla} style={{ fontFamily: FUENTE, fontSize: `${cuerpo}px`, fill: color, fontWeight: peso }}>
      {children}
    </text>
  );
}

/** El rótulo de una parte, repartido en renglones y centrado en su caja. */
function Rotulo({ cx, cy, ancho, texto, encendida, cuerpo = 13.5, lineas = 2 }) {
  const filas = repartir(texto, ancho - 14, lineas, cuerpo);
  const alto = cuerpo * 1.18;
  const inicio = cy - ((filas.length - 1) * alto) / 2 + cuerpo * 0.34;
  return (
    <>
      {filas.map((f, i) => (
        <Texto key={`${f}-${i}`} x={cx} y={inicio + i * alto} cuerpo={cuerpo} peso={encendida ? 700 : 400} color={encendida ? TINTA_SOBRE_TEAL : SUAVE}>
          {f}
        </Texto>
      ))}
    </>
  );
}

/** La caja de siempre: teal llena cuando está encendida, contorno cuando no. */
function Caja({ x, y, w, h, texto, nota, encendida, r = 10 }) {
  const conNota = Boolean(nota);
  /* Con nota, el rótulo sube un tercio del alto en vez de 7 fijos: con 7 se
     tocaba con la nota en las cajas bajas y bailaba en las altas. */
  const cyTexto = conNota ? y + h * 0.36 : y + h / 2;
  return (
    <>
      <rect
        x={x} y={y} width={w} height={h} rx={r}
        fill={encendida ? FAE.teal : "rgba(29,53,87,0.45)"}
        stroke={encendida ? FAE.teal : TENUE}
        strokeWidth={1.5}
      />
      <Rotulo cx={x + w / 2} cy={cyTexto} ancho={w} texto={texto} encendida={encendida} lineas={conNota ? 1 : 2} />
      {conNota && (
        <Texto x={x + w / 2} y={y + h - 9} cuerpo={11} color={encendida ? "rgba(6,32,42,0.72)" : "rgba(248,249,250,0.52)"}>
          {repartir(nota, w - 12, 1, 11)[0]}
        </Texto>
      )}
    </>
  );
}

function Lamina({ alto, children, pie }) {
  return (
    <figure className="fae-eg" style={{ margin: 0 }}>
      <style>{CSS_MAQUINAS}</style>
      <style>{CSS_ESCENA}</style>
      <svg viewBox={`0 0 ${ANCHO} ${alto}`} role="img" style={{ width: "100%", height: "auto", display: "block" }}>
        {children}
      </svg>
      {pie && <figcaption className="fae-eg__pie">{pie}</figcaption>}
    </figure>
  );
}

/* ═══════════════════════ 1 · FLUJO ═══════════════════════ */

const FILA_ALTO = 84;
const CAJA_ALTO = 56;

function Flujo({ escena, resaltar }) {
  const { partes, enlaces = [] } = escena;
  const filas = Math.max(...partes.map((p) => p.fila ?? 0)) + 1;
  const alto = filas * FILA_ALTO + 16;

  /* Cada fila se reparte su ancho entre las partes que de verdad tiene. Una
     rejilla fija dejaría huecos cuando una fila trae dos y otra cuatro. */
  const caja = (p) => {
    const hermanas = partes.filter((q) => (q.fila ?? 0) === (p.fila ?? 0)).sort((a, b) => (a.col ?? 0) - (b.col ?? 0));
    const i = hermanas.findIndex((q) => q.id === p.id);
    const w = Math.min(150, (ANCHO - 24 - (hermanas.length - 1) * 12) / hermanas.length);
    const total = hermanas.length * w + (hermanas.length - 1) * 12;
    const x = (ANCHO - total) / 2 + i * (w + 12);
    const y = (p.fila ?? 0) * FILA_ALTO + 16;
    return { x, y, w, h: CAJA_ALTO, cx: x + w / 2, cy: y + CAJA_ALTO / 2 };
  };

  const cajas = Object.fromEntries(partes.map((p) => [p.id, caja(p)]));

  return (
    <Lamina alto={alto} pie={escena.pie}>
      <defs>
        <marker id="fae-eg-punta" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L8 4 L0 8 z" fill={LINEA} />
        </marker>
      </defs>

      {enlaces.map((e) => {
        const a = cajas[e.de];
        const b = cajas[e.a];
        if (!a || !b) return null;
        /* Del borde al borde, no de centro a centro: una flecha que nace
           dentro de la caja se lee como si saliera de la letra. */
        const vertical = Math.abs(b.cy - a.cy) > Math.abs(b.cx - a.cx);
        const x1 = vertical ? a.cx : a.cx + Math.sign(b.cx - a.cx) * (a.w / 2 + 3);
        const y1 = vertical ? a.cy + Math.sign(b.cy - a.cy) * (a.h / 2 + 3) : a.cy;
        const x2 = vertical ? b.cx : b.cx - Math.sign(b.cx - a.cx) * (b.w / 2 + 7);
        const y2 = vertical ? b.cy - Math.sign(b.cy - a.cy) * (b.h / 2 + 7) : b.cy;
        const vivo = resaltar.includes(e.de) && resaltar.includes(e.a);
        return (
          <g key={`${e.de}-${e.a}`} opacity={resaltar.length && !vivo ? 0.18 : 1} className="fae-sm-parte">
            <line
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={vivo ? FAE.teal : LINEA} strokeWidth={vivo ? 2.2 : 1.4}
              markerEnd="url(#fae-eg-punta)"
              className={vivo ? "fae-sm-correa fae-eg-fluye" : undefined}
            />
            {/*
              * El rótulo se aparta de la línea, no se pone encima. Centrado
              * sobre una flecha vertical queda tachado por ella y no se lee —
              * se vio en la primera tirada de `scripts/ver-escenas.mjs`.
              */}
            {e.etiqueta && (
              <Texto
                x={vertical ? (x1 + x2) / 2 + 7 : (x1 + x2) / 2}
                y={vertical ? (y1 + y2) / 2 + 4 : (y1 + y2) / 2 - 7}
                cuerpo={11} color={vivo ? SUAVE : TENUE}
                ancla={vertical ? "start" : "middle"}
              >
                {repartir(e.etiqueta, vertical ? 90 : 110, 1, 11)[0]}
              </Texto>
            )}
          </g>
        );
      })}

      {partes.map((p, i) => {
        const c = cajas[p.id];
        return (
          <Parte key={p.id} id={p.id} resaltar={resaltar}>
            <g className="fae-eg-entra" style={{ animationDelay: `${i * 70}ms` }}>
              <Caja {...c} texto={p.etiqueta} nota={p.nota} encendida={resaltar.includes(p.id)} />
            </g>
          </Parte>
        );
      })}
    </Lamina>
  );
}

/* ═══════════════════════ 2 · BALANZA ═══════════════════════ */

function Balanza({ escena, resaltar }) {
  const izq = escena.partes.filter((p) => p.lado === "izq");
  const der = escena.partes.filter((p) => p.lado === "der");
  const suma = (lista) => lista.reduce((t, p) => t + (p.valor ?? 1), 0);
  const peso = suma(izq) - suma(der);
  const total = Math.max(1, suma(izq) + suma(der));
  /* Ocho grados de inclinación como tope. Más se lee como que se cae. */
  const giro = Math.max(-8, Math.min(8, (peso / total) * 16));

  const filas = Math.max(izq.length, der.length);
  const ejeY = 70;
  /*
   * Brazo y ficha salen de la lámina, no del gusto: con el platillo centrado
   * en 180 ± brazo y la ficha de ancho FICHA_ANCHO, el borde izquierdo cae en
   * 180 − brazo − FICHA_ANCHO/2 y tiene que quedar dentro de 0. Con 128 y 146
   * —lo primero que escribí— daba −21 y la primera letra de cada rótulo se
   * perdía fuera del lienzo. Medido con Playwright, no calculado a ojo.
   */
  const brazo = 88;
  const FICHA_ANCHO = 164;
  /* 28 basta cuando rótulo y cifra van juntos; si alguna ficha necesita dos
     renglones, crecen todas: fichas de dos alturas en la misma balanza se
     leerían como si una pesara más. */
  const apretadas = escena.partes.some(
    (p) => typeof p.valor === "number" && !cabe(p.etiqueta, FICHA_ANCHO - 20 - ANCHO_CIFRA(p.valor), 12),
  );
  const alturaFicha = apretadas ? 40 : 28;

  const platillo = (lista, lado) => {
    const signo = lado === "izq" ? -1 : 1;
    const cx = ANCHO / 2 + signo * brazo;
    const cy = ejeY + Math.sin((giro * Math.PI) / 180) * signo * brazo;
    return { cx, cy, lista };
  };

  const lados = [platillo(izq, "izq"), platillo(der, "der")];
  /*
   * El alto se calcula desde la ficha que más baja, no a ojo: el platillo que
   * pesa cae hasta 13 unidades (el tope de 8° sobre un brazo de 88), y bajo
   * él cuelgan todas sus fichas. Con un alto fijo, el pie de la balanza se
   * montaba encima de la última ficha — se vio en `scripts/ver-escenas.mjs`.
   */
  const CAIDA = Math.ceil(Math.sin((8 * Math.PI) / 180) * brazo);
  const alto = ejeY + CAIDA + 16 + filas * (alturaFicha + 6) + 16;
  const suelo = alto - 10;

  return (
    <Lamina alto={alto} pie={escena.pie}>
      {/* El pie y la columna: lo que no se mueve. */}
      <path d={`M${ANCHO / 2 - 22} ${suelo} L${ANCHO / 2 + 22} ${suelo}`} stroke={LINEA} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={ANCHO / 2} y1={ejeY} x2={ANCHO / 2} y2={suelo} stroke={LINEA} strokeWidth={2} />

      {/* El brazo, inclinado por la diferencia. */}
      <g className="fae-eg-brazo" style={{ transform: `rotate(${giro}deg)`, transformOrigin: `${ANCHO / 2}px ${ejeY}px`, transformBox: "view-box" }}>
        <line x1={ANCHO / 2 - brazo} y1={ejeY} x2={ANCHO / 2 + brazo} y2={ejeY} stroke={LINEA} strokeWidth={3} strokeLinecap="round" />
        <circle cx={ANCHO / 2} cy={ejeY} r={5} fill={FAE.navy} stroke={LINEA} strokeWidth={2} />
      </g>

      {lados.map(({ cx, cy, lista }, k) => (
        <g key={k}>
          <Texto x={cx} y={ejeY - 26} cuerpo={11} color={TENUE}>
            {repartir(k === 0 ? escena.titulos?.izq : escena.titulos?.der, 150, 1, 11)[0]}
          </Texto>
          <line x1={cx} y1={cy} x2={cx} y2={cy + 14} stroke={TENUE} strokeWidth={1.5} />
          {lista.map((p, i) => {
            const encendida = resaltar.includes(p.id);
            const y = cy + 16 + i * (alturaFicha + 6);
            const w = FICHA_ANCHO;
            /*
              * Si el rótulo no cabe al lado de la cifra, la cifra baja a su
              * propio renglón y el rótulo se queda con la ficha entera. Es
              * eso o cortar el rótulo, y un rótulo cortado («Capital…») no
              * enseña nada: la ficha existe para que se lea qué hay en ella.
              */
            const juntos = cabe(p.etiqueta, w - 20 - ANCHO_CIFRA(p.valor), 12);
            return (
              <Parte key={p.id} id={p.id} resaltar={resaltar}>
                <g className="fae-eg-entra" style={{ animationDelay: `${(k * 2 + i) * 70}ms` }}>
                  <rect x={cx - w / 2} y={y} width={w} height={alturaFicha} rx={8}
                    fill={encendida ? FAE.teal : "rgba(29,53,87,0.45)"}
                    stroke={encendida ? FAE.teal : TENUE} strokeWidth={1.5} />
                  <Texto x={cx - w / 2 + 10} y={y + (juntos ? alturaFicha / 2 + 4 : 17)} cuerpo={12}
                    ancla="start" peso={encendida ? 700 : 400}
                    color={encendida ? TINTA_SOBRE_TEAL : SUAVE}>
                    {repartir(p.etiqueta, juntos ? w - 20 - ANCHO_CIFRA(p.valor) : w - 20, 1, 12)[0]}
                  </Texto>
                  {typeof p.valor === "number" && (
                    <Texto x={cx + w / 2 - 10} y={y + (juntos ? alturaFicha / 2 + 4 : alturaFicha - 8)}
                      cuerpo={juntos ? 12 : 11} ancla="end" peso={700}
                      color={encendida ? TINTA_SOBRE_TEAL : "rgba(248,249,250,0.62)"}>
                      {p.valor.toLocaleString("es-CO")}
                    </Texto>
                  )}
                </g>
              </Parte>
            );
          })}
        </g>
      ))}
    </Lamina>
  );
}

/* ═══════════════════════ 3 · CUENTA T ═══════════════════════ */

function CuentaT({ escena, resaltar }) {
  const debe = escena.partes.filter((p) => p.lado === "debe");
  const haber = escena.partes.filter((p) => p.lado === "haber");
  const filas = Math.max(debe.length, haber.length, 1);
  const alto = 78 + filas * 32;
  const techo = 56;
  const medio = ANCHO / 2;
  const FILA = 32;

  const columna = (lista, lado) =>
    lista.map((p, i) => {
      const encendida = resaltar.includes(p.id);
      const x0 = lado === "debe" ? 10 : medio + 8;
      const w = medio - 18;
      const y = techo + 8 + i * FILA;
      return (
        <Parte key={p.id} id={p.id} resaltar={resaltar}>
          <g className="fae-eg-entra" style={{ animationDelay: `${i * 70}ms` }}>
            <rect x={x0} y={y} width={w} height={FILA - 6} rx={7}
              fill={encendida ? FAE.teal : "transparent"}
              stroke={encendida ? FAE.teal : "transparent"} strokeWidth={1.5} />
            <Texto x={x0 + 8} y={y + 18} cuerpo={11.5} ancla="start" peso={encendida ? 700 : 400}
              color={encendida ? TINTA_SOBRE_TEAL : SUAVE}>
              {repartir(p.etiqueta, w - 14 - ANCHO_CIFRA(p.valor, 11.5), 1, 11.5)[0]}
            </Texto>
            {typeof p.valor === "number" && (
              <Texto x={x0 + w - 8} y={y + 18} cuerpo={11.5} ancla="end" peso={700}
                color={encendida ? TINTA_SOBRE_TEAL : "rgba(248,249,250,0.62)"}>
                {p.valor.toLocaleString("es-CO")}
              </Texto>
            )}
          </g>
        </Parte>
      );
    });

  return (
    <Lamina alto={alto} pie={escena.pie}>
      <Texto x={medio} y={24} cuerpo={14} peso={700} color={FAE.node}>
        {repartir(escena.cuenta, 300, 1, 14)[0]}
      </Texto>
      {/* La T: el travesaño y el palo. */}
      <line x1={14} y1={techo - 20} x2={ANCHO - 14} y2={techo - 20} stroke={LINEA} strokeWidth={2} />
      <line x1={medio} y1={techo - 20} x2={medio} y2={alto - 10} stroke={LINEA} strokeWidth={2} />
      <Texto x={medio / 2} y={techo - 28} cuerpo={11} color={TENUE}>DEBE</Texto>
      <Texto x={medio + medio / 2} y={techo - 28} cuerpo={11} color={TENUE}>HABER</Texto>
      {columna(debe, "debe")}
      {columna(haber, "haber")}
    </Lamina>
  );
}

/* ═══════════════════════ 4 · ESCALONES ═══════════════════════ */

function Escalones({ escena, resaltar }) {
  const { partes, modo } = escena;

  if (modo === "barras") {
    const tope = Math.max(...partes.map((p) => Math.abs(p.valor ?? 0)), 1);
    const alto = 40 + partes.length * 38;
    return (
      <Lamina alto={alto} pie={escena.pie}>
        {partes.map((p, i) => {
          const encendida = resaltar.includes(p.id);
          const y = 16 + i * 38;
          const largo = Math.max(10, (Math.abs(p.valor ?? 0) / tope) * 206);
          return (
            <Parte key={p.id} id={p.id} resaltar={resaltar}>
              <g className="fae-eg-entra" style={{ animationDelay: `${i * 70}ms` }}>
                <Texto x={116} y={y + 19} cuerpo={12} ancla="end" peso={encendida ? 700 : 400} color={SUAVE}>
                  {repartir(p.etiqueta, 110, 1, 12)[0]}
                </Texto>
                <rect x={124} y={y + 4} width={largo} height={22} rx={6}
                  fill={encendida ? FAE.teal : "rgba(29,53,87,0.65)"}
                  stroke={encendida ? FAE.teal : TENUE} strokeWidth={1.2}
                  className="fae-eg-crece" style={{ transformOrigin: "124px 0", transformBox: "view-box" }} />
                {typeof p.valor === "number" && (
                  <Texto x={124 + largo + 7} y={y + 20} cuerpo={11} ancla="start" peso={700} color="rgba(248,249,250,0.68)">
                    {p.valor.toLocaleString("es-CO")}
                  </Texto>
                )}
              </g>
            </Parte>
          );
        })}
      </Lamina>
    );
  }

  /* Pila: el primero abajo, como un edificio. Cada escalón un poco más
     angosto que el de abajo, para que se lea el apilado y no una lista. */
  /* 50 y no 42: con 42 la caja quedaba en 34 de alto y el rótulo se montaba
     sobre su nota. Se vio en la primera tirada de `scripts/ver-escenas.mjs`. */
  const PASO = 50;
  const alto = 20 + partes.length * PASO;
  return (
    <Lamina alto={alto} pie={escena.pie}>
      {partes.map((p, i) => {
        const encendida = resaltar.includes(p.id);
        const desde = partes.length - 1 - i;
        const w = 290 - i * 22;
        const x = (ANCHO - w) / 2;
        const y = 12 + desde * PASO;
        return (
          <Parte key={p.id} id={p.id} resaltar={resaltar}>
            <g className="fae-eg-entra" style={{ animationDelay: `${i * 80}ms` }}>
              <Caja x={x} y={y} w={w} h={PASO - 10} texto={p.etiqueta} nota={p.nota} encendida={encendida} r={8} />
              {typeof p.valor === "number" && (
                <Texto x={x + w - 12} y={y + (p.nota ? 19 : PASO / 2 - 6)} cuerpo={11} ancla="end" peso={700}
                  color={encendida ? "rgba(6,32,42,0.75)" : "rgba(248,249,250,0.6)"}>
                  {p.valor.toLocaleString("es-CO")}
                </Texto>
              )}
            </g>
          </Parte>
        );
      })}
    </Lamina>
  );
}

/* ═══════════════════════ 5 · LÍNEA ═══════════════════════ */

function Linea({ escena, resaltar }) {
  const { partes } = escena;
  const alto = 150;
  const y = 72;
  /* El margen deja sitio para medio rótulo a cada lado; los rótulos de los
     extremos además se anclan hacia dentro, porque centrados se salían. */
  const margen = 46;
  const paso = partes.length > 1 ? (ANCHO - margen * 2) / (partes.length - 1) : 0;

  return (
    <Lamina alto={alto} pie={escena.pie}>
      <line x1={margen} y1={y} x2={ANCHO - margen} y2={y} stroke={LINEA} strokeWidth={2} strokeLinecap="round" />
      {partes.map((p, i) => {
        const encendida = resaltar.includes(p.id);
        const cx = partes.length > 1 ? margen + i * paso : ANCHO / 2;
        const arriba = i % 2 === 0;
        /* El primero se escribe hacia la derecha y el último hacia la
           izquierda: centrados, la mitad del rótulo cae fuera de la lámina. */
        const extremo = partes.length > 1 && (i === 0 || i === partes.length - 1);
        const ancla = !extremo ? "middle" : i === 0 ? "start" : "end";
        const borde = !extremo ? cx : i === 0 ? 10 : ANCHO - 10;
        const cupo = extremo ? paso + 46 : paso + 28;
        return (
          <Parte key={p.id} id={p.id} resaltar={resaltar}>
            <g className="fae-eg-entra" style={{ animationDelay: `${i * 80}ms` }}>
              <circle cx={cx} cy={y} r={encendida ? 8 : 5.5}
                fill={encendida ? FAE.teal : FAE.navy} stroke={encendida ? FAE.teal : LINEA} strokeWidth={2} />
              {p.momento && (
                <Texto x={borde} y={arriba ? y + 20 : y - 12} cuerpo={11} color={TENUE} ancla={ancla}>
                  {repartir(p.momento, cupo, 1, 11)[0]}
                </Texto>
              )}
              {repartir(p.etiqueta, cupo, 2, 12).map((f, k) => (
                <Texto key={k} x={borde} y={(arriba ? y - 30 : y + 38) + k * 14} cuerpo={12} ancla={ancla}
                  peso={encendida ? 700 : 400} color={encendida ? FAE.node : SUAVE}>
                  {f}
                </Texto>
              ))}
            </g>
          </Parte>
        );
      })}
    </Lamina>
  );
}

/* ═══════════════════════ EL DESPACHO ═══════════════════════ */

export const FIGURAS = { flujo: Flujo, balanza: Balanza, cuentaT: CuentaT, escalones: Escalones, linea: Linea };

/**
 * @param {object} p
 * @param {object} p.escena   la escena guardada con la pieza
 * @param {string[]|string} [p.resaltar]  qué se enciende en este paso
 */
export default function EscenaGenerada({ escena, resaltar }) {
  const Figura = escena && FIGURAS[escena.arquetipo];
  /* Una pieza vieja con una forma que ya no existe no tumba la pantalla: se
     queda sin capa 2 y el resto de la actividad se lee igual. */
  if (!Figura || !Array.isArray(escena.partes) || escena.partes.length === 0) return null;

  const encendidas = Array.isArray(resaltar) ? resaltar : resaltar ? [resaltar] : [];
  return <Figura escena={escena} resaltar={encendidas} />;
}

export const CSS_ESCENA = `
.fae-eg__pie {
  margin: 10px 0 0; font-family: Inter, sans-serif; font-size: 12px;
  line-height: 1.5; color: rgba(248,249,250,0.58); text-align: center;
}
@keyframes fae-eg-entra { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes fae-eg-crece { from { transform: scaleX(0.04); } to { transform: scaleX(1); } }
.fae-eg-entra {
  animation: fae-eg-entra 320ms cubic-bezier(.3,.9,.4,1) both;
  transform-box: fill-box; transform-origin: center;
}
.fae-eg-crece { animation: fae-eg-crece 520ms cubic-bezier(.3,.9,.4,1) both; }
.fae-eg-brazo { transition: transform 560ms cubic-bezier(.3,.8,.4,1); }
.fae-eg-fluye { animation: fae-sm-avanza 900ms linear infinite; }

@media (prefers-reduced-motion: reduce) {
  .fae-eg-entra, .fae-eg-crece, .fae-eg-fluye { animation: none; opacity: 1; transform: none; }
  .fae-eg-brazo { transition: none; }
}
`;
