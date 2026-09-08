import { FAE } from "../../../theme.js";
import { COMPONENTES } from "../../../data/corazonDA.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL CORAZÓN DE LA ECONOMÍA — vocabulario compartido.
 *
 * Las tres piezas de Demanda Agregada son el mismo sistema visto de tres
 * maneras. Lo que las hace parecer una sola cosa vive aquí: la cámara, las
 * arterias, el latido y la rejilla de fondo.
 *
 * ═══════════ NUNCA ANATÓMICO ═══════════
 *
 * Es un sistema circulatorio ESTILIZADO: energía vital abstracta corriendo por
 * conductos. Ni un dibujo de corazón, ni rojo sangre. Teal y coral sobre navy,
 * que son los colores de la marca. La metáfora tiene que dar la idea de "algo
 * circula y se junta", no la de una lámina de anatomía.
 *
 * ═══════════ Y NADA DE SALA DE CONTROL ═══════════
 *
 * Política Económica tiene su identidad —metal, bisel, pilotos— y esta es otra.
 * Aquí no hay rótulos grabados ni agujas: hay conductos, pulso y luz.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CSS_CORAZON = `
/*
 * EL LATIDO ES TEXTURA, NUNCA CONTENIDO. Escala el conjunto un 3%: se siente
 * que está vivo y no comunica ninguna magnitud. La magnitud la cargan las
 * bandas, que es la corrección que hace que todo el concepto funcione.
 */
@keyframes fae-cz-latido {
  0%, 100% { transform: scale(1); }
  18%      { transform: scale(1.03); }
  36%      { transform: scale(1); }
}
.fae-cz-late { animation: fae-cz-latido 1.6s ease-in-out infinite; transform-origin: center; }

/* El halo que sale de la cámara en cada pulso. Lo usa "Pulso de memoria". */
@keyframes fae-cz-halo {
  from { transform: scale(0.55); opacity: .55; }
  to   { transform: scale(2.4);  opacity: 0; }
}
.fae-cz-halo { animation: fae-cz-halo 1.6s linear infinite; transform-origin: center; }

/* El flujo que recorre una arteria: trazo discontinuo en movimiento. */
@keyframes fae-cz-flujo { to { stroke-dashoffset: -28; } }
.fae-cz-flujo { animation: fae-cz-flujo 1.1s linear infinite; }

@keyframes fae-cz-entrar { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.fae-cz-entrar { animation: fae-cz-entrar 420ms ease-out both; }

/* La trama del fondo: tejido muy tenue, no rejilla de instrumento. */
.fae-cz-trama {
  background-image: radial-gradient(rgba(203,220,242,0.05) 1px, transparent 1px);
  background-size: 18px 18px;
}

@media (prefers-reduced-motion: reduce) {
  .fae-cz-late, .fae-cz-halo, .fae-cz-flujo, .fae-cz-entrar {
    animation: none !important; opacity: 1 !important; transform: none !important;
  }
}
`;

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CÁMARA CENTRAL — la pieza que sostiene todo lo demás.
 *
 * Cuatro bandas, una por componente, puestas una junto a otra. El ancho de
 * cada banda es su magnitud, y el ancho total de la cámara es la suma.
 *
 * ESTO NO ES DECORACIÓN, ES LA CORRECCIÓN DEL CONCEPTO. Un corazón que late
 * más fuerte enseña "hay mucho de algo"; no enseña que C + I + G + XN SE
 * SUMAN. La Demanda Agregada es una suma, y la suma tiene que verse, no
 * deducirse. Por eso las bandas cargan la aritmética y el latido no carga
 * nada: si alguna vez hay que elegir entre las dos cosas, se sacrifica el
 * latido.
 *
 * EL COLOR NUNCA VA SOLO: cada banda lleva su letra encima cuando cabe, y
 * debajo va la leyenda con letra, nombre y valor de las cuatro. Un estudiante
 * que no distinga teal de ámbar lee la misma información.
 *
 * LAS BANDAS NEGATIVAS. XN puede ser negativa —importar más que exportar— y
 * entonces no se puede dibujar como un trozo de la suma. Se dibuja aparte,
 * rayada y hacia el otro lado, con su signo escrito. Meterla como banda normal
 * enseñaría que restar es sumar un poco menos, que es exactamente el error.
 */
export function Camara({ valores, maximo, alto = 74, latiendo = true, mostrarLeyenda = true }) {
  const positivos = COMPONENTES.map((c) => ({ ...c, valor: Math.max(0, valores[c.id] ?? 0) }));
  const negativos = COMPONENTES
    .map((c) => ({ ...c, valor: Math.min(0, valores[c.id] ?? 0) }))
    .filter((c) => c.valor < 0);

  const sumaPos = positivos.reduce((s, c) => s + c.valor, 0);
  const tope = Math.max(maximo, 1);
  /* El ancho de la cámara es la suma, acotada al tope para que no se salga. */
  const anchoPct = Math.min(100, (sumaPos / tope) * 100);

  return (
    <div>
      <div
        className={latiendo ? "fae-cz-late" : undefined}
        style={{
          position: "relative",
          borderRadius: "26px",
          padding: "10px",
          background: "radial-gradient(120% 120% at 50% 0%, rgba(42,157,143,0.14), rgba(10,20,34,0.5) 70%)",
          border: "1px solid rgba(248,249,250,0.16)",
          boxShadow: "inset 0 1px 0 rgba(248,249,250,0.07)",
        }}
      >
        {/* La pista: el ancho total posible. Lo que se llena es la suma. */}
        <div
          style={{
            height: `${alto}px`,
            borderRadius: "18px",
            background: "rgba(248,249,250,0.05)",
            overflow: "hidden",
            display: "flex",
          }}
        >
          <div
            style={{
              width: `${anchoPct}%`,
              display: "flex",
              transition: "width 260ms cubic-bezier(.3,.8,.4,1)",
              minWidth: "2px",
            }}
          >
            {positivos.map((c) => {
              const parte = sumaPos > 0 ? (c.valor / sumaPos) * 100 : 0;
              return (
                <div
                  key={c.id}
                  title={`${c.id} · ${c.nombre}`}
                  style={{
                    width: `${parte}%`,
                    background: c.color,
                    transition: "width 260ms cubic-bezier(.3,.8,.4,1)",
                    display: "grid",
                    placeItems: "center",
                    overflow: "hidden",
                  }}
                >
                  {/* La letra solo si cabe: apretada es peor que ausente. */}
                  {parte > 9 && (
                    <span
                      style={{
                        fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700,
                        color: FAE.bg, letterSpacing: "0.04em",
                      }}
                    >
                      {c.id}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/*
          * Lo que resta va aparte y rayado. Dibujarlo como una banda más diría
          * que restar es sumar menos.
          */}
        {negativos.length > 0 && (
          <div style={{ marginTop: "7px" }}>
            {negativos.map((c) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    height: "10px",
                    width: `${Math.min(60, (Math.abs(c.valor) / tope) * 100)}%`,
                    borderRadius: "999px",
                    backgroundImage: `repeating-linear-gradient(45deg, ${c.color} 0 5px, transparent 5px 10px)`,
                    border: `1px solid ${c.color}88`,
                    minWidth: "10px",
                  }}
                />
                <span style={{ fontSize: "11px", color: "rgba(248,249,250,0.6)", whiteSpace: "nowrap" }}>
                  {c.id} resta
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {mostrarLeyenda && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(126px, 1fr))",
            gap: "6px 12px",
            marginTop: "10px",
          }}
        >
          {COMPONENTES.map((c) => (
            <span key={c.id} style={{ display: "flex", alignItems: "baseline", gap: "7px", minWidth: 0 }}>
              <span
                aria-hidden="true"
                style={{ width: "9px", height: "9px", borderRadius: "3px", background: c.color, flexShrink: 0 }}
              />
              <span style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, color: FAE.text }}>
                {c.id}
              </span>
              <span
                data-prueba="banda-valor"
                style={{
                  fontSize: "11.5px", color: "rgba(248,249,250,0.55)",
                  fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap",
                  overflow: "hidden", textOverflow: "ellipsis",
                }}
              >
                {pesos(valores[c.id] ?? 0)}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/*
 * ═══════════ LA SUMA QUE SE VE TIENE QUE CUADRAR ═══════════
 *
 * Todo se muestra en millones con UNA décima, siempre — también por encima de
 * diez, donde antes se quitaba el decimal por compacidad. Y la DA que se
 * enseña es la SUMA DE LOS CUATRO RÓTULOS, no el valor exacto del modelo.
 *
 * No es un capricho: con los valores de partida, los cuatro componentes
 * redondeados suman $6,7M y el modelo exacto da $6,77M, que se redondeaba a
 * $6,8M. Un estudiante que sumara los cuatro números de la leyenda encontraba
 * que no cuadran — en la pieza cuyo trabajo entero es enseñar que la Demanda
 * Agregada ES una suma. La diferencia que queda es menor que la precisión que
 * se muestra; la contradicción en pantalla no lo era.
 *
 * El signo va delante del peso: "−$0,2M", no "$-0,2M".
 */

/** El valor en millones, ya redondeado a la décima que se muestra. */
export function enMillones(n) {
  return Math.round(n / 100_000) / 10;
}

/** Formatea un número YA en millones. */
export function pesosM(m) {
  const signo = m < 0 ? "−" : "";
  return `${signo}$${Math.abs(m).toFixed(1)}M`;
}

/** Formato corto de pesos: en millones, que es la escala del modelo. */
export function pesos(n) {
  return pesosM(enMillones(n));
}

/*
 * Una arteria: un conducto cuyo GROSOR y BRILLO siguen su caudal.
 *
 * El grosor es lo que hace legible de un vistazo qué componente manda, sin
 * tener que leer el número. Se acota entre un mínimo y un máximo para que una
 * arteria vacía siga viéndose como un conducto y no desaparezca — desaparecer
 * diría "no existe", cuando lo que dice el dato es "no lleva nada ahora".
 */
export function Arteria({ color, caudal, maximo, etiqueta, children }) {
  const frac = Math.max(0, Math.min(1, Math.abs(caudal) / Math.max(maximo, 1)));
  const grosor = 3 + frac * 9;
  const opacidad = 0.32 + frac * 0.68;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
      <svg width="46" height="18" viewBox="0 0 46 18" aria-hidden="true" style={{ flexShrink: 0 }}>
        <path
          d="M2 9 H44"
          fill="none"
          stroke={color}
          strokeOpacity={opacidad}
          strokeWidth={grosor}
          strokeLinecap="round"
        />
        <path
          className="fae-cz-flujo"
          d="M2 9 H44"
          fill="none"
          stroke={FAE.text}
          strokeOpacity={0.22 * frac}
          strokeWidth={Math.max(1, grosor - 4)}
          strokeLinecap="round"
          strokeDasharray="4 10"
        />
      </svg>
      <div style={{ minWidth: 0 }}>
        {etiqueta && (
          <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, color }}>
            {etiqueta}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

/*
 * Un VASO es algo que entra y suma. Una VÁLVULA no suma: se pone encima de un
 * conducto y reparte o desvía lo que ya venía pasando.
 *
 * La distinción es la lección entera de la primera pieza —los estudiantes
 * confunden exactamente esto— así que las dos formas tienen que ser
 * inconfundibles: el vaso es un círculo lleno, la válvula un rombo hueco.
 */
export function Vaso({ etiqueta, sub, color = FAE.teal }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
      <span
        aria-hidden="true"
        style={{ width: "13px", height: "13px", borderRadius: "999px", background: color, flexShrink: 0 }}
      />
      <span style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, color: FAE.text }}>
        {etiqueta}
      </span>
      {sub && <span style={{ fontSize: "11.5px", color: "rgba(248,249,250,0.5)" }}>{sub}</span>}
    </span>
  );
}

export function Valvula({ etiqueta, sub, color = FAE.coral }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
      <span
        aria-hidden="true"
        style={{
          width: "12px", height: "12px", flexShrink: 0,
          border: `2px solid ${color}`, transform: "rotate(45deg)", borderRadius: "2px",
        }}
      />
      <span style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, color: FAE.text }}>
        {etiqueta}
      </span>
      {sub && <span style={{ fontSize: "11.5px", color: "rgba(248,249,250,0.5)" }}>{sub}</span>}
    </span>
  );
}

/* El marco compartido de las tres piezas. El equivalente del Panel de la sala. */
export function Camaraseccion({ rotulo, titulo, children, acento = FAE.teal, style }) {
  return (
    <section
      className="fae-cz-trama"
      style={{
        borderRadius: "20px",
        background: "linear-gradient(165deg, rgba(29,53,87,0.30), rgba(10,20,34,0.60))",
        border: "1px solid rgba(248,249,250,0.13)",
        padding: "clamp(14px, 2.2vw, 20px)",
        ...style,
      }}
    >
      {(rotulo || titulo) && (
        <header style={{ marginBottom: "14px" }}>
          {rotulo && (
            <p style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.16em", color: acento, margin: "0 0 5px" }}>
              {rotulo}
            </p>
          )}
          {titulo && (
            <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(15px, 2.2vw, 18px)", letterSpacing: "-0.015em", color: FAE.text, margin: 0, lineHeight: 1.25 }}>
              {titulo}
            </h3>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
