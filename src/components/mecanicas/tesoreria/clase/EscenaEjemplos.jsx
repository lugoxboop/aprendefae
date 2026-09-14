import { FAE } from "../../../../theme.js";
import { ACENTOS, IconoMecanismo } from "../tesoreria.jsx";
import { CSS_CLASE, MaquinaGrande, Persona, UnaVez, anima, useVistasAlMontar } from "./animaciones.jsx";

/*
 * ESCENA 3 · TRES EJEMPLOS REALES.
 *
 * Las tres medidas de las citas de prensa del profesor, una por pestaña. Cada
 * una con su dibujo y su movimiento:
 *
 *   El IVA        un tiquete de caja: la exención se va y el IVA se suma al total
 *   La renta      un embudo: entran más personas; la tarifa NO sube
 *   Mi Casa Ya    el $1 billón sale del distribuidor hacia una casa en obra
 *
 * CUÁNDO SE MUEVE: al pedirlo. "Aplicar la medida" —o el mando— corre la
 * animación una vez y la deja en su final; "Verlo otra vez" la repite. Nada en
 * bucle: el profesor habla encima, y algo moviéndose sin parar compite con él
 * por la atención del aula y no se puede señalar. La clasificación aparece al
 * terminar el movimiento, para que primero se vea y después se nombre.
 *
 * SIN CIFRAS. Las barras del tiquete no llevan números, y la única cifra de la
 * escena es el $1 billón de la cita.
 */

const CSS = `
.fae-cl-ejemplos { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); }
.fae-cl-escenario { display: flex; flex-direction: column; gap: max(8px, 1.4vh); }
.fae-cl-texto { display: flex; flex-direction: column; gap: max(10px, 1.8vh); align-items: flex-start; }
.fae-cl-medida { font-family: Sora, sans-serif; font-weight: 700; font-size: var(--pres-destacado, 19px); line-height: 1.2; letter-spacing: -0.01em; margin: 0; }
.fae-cl-clasif { display: flex; gap: 0.8em; align-items: center; border-left-width: max(8px, 1.2vh); }
.fae-cl-clasif-texto { font-family: Sora, sans-serif; font-weight: 700; font-size: var(--pres-lectura, 16px); line-height: 1.25; margin: 0.2em 0 0; }

/* El tiquete: papel con tinta navy, el mayor contraste que da la paleta. */
.fae-cl-tiquete {
  box-sizing: border-box; width: 100%; border-radius: 6px; padding: max(12px, 2vh) max(14px, 1.6vw);
  background: #F4EFE3; color: #1D3557; box-shadow: 0 1vh 3vh rgba(0,0,0,0.4);
  font-size: var(--pres-min, 14px); line-height: 1.25;
}
.fae-cl-tiq-cabeza { font-family: Sora, sans-serif; font-weight: 700; letter-spacing: 0.14em; text-align: center; margin: 0 0 0.4em; padding-bottom: 0.5em; border-bottom: 2px dashed rgba(29,53,87,0.5); }
.fae-cl-tiq-fila { display: grid; grid-template-columns: 6.2em minmax(0, 1fr); align-items: center; gap: 0.8em; padding: 0.55em 0; font-weight: 600; }
.fae-cl-tiq-total { border-top: 2px dashed rgba(29,53,87,0.5); font-family: Sora, sans-serif; font-weight: 700; }
.fae-cl-tiq-valor { position: relative; display: flex; align-items: center; gap: 0.5em; min-height: 1.7em; }
.fae-cl-barra { display: block; flex-shrink: 0; height: 1.1em; background: #1D3557; transform-origin: left center; }
.fae-cl-tiq-valor .fae-cl-barra + .fae-cl-barra { margin-left: -0.5em; }
.fae-cl-barra-iva { background: repeating-linear-gradient(135deg, #2A9D8F 0 0.3em, #1D6F66 0.3em 0.6em); }
.fae-cl-exento { font-family: Sora, sans-serif; font-weight: 700; letter-spacing: 0.08em; border: 2px solid #1D3557; padding: 0.05em 0.45em; border-radius: 6px; white-space: nowrap; }
.fae-cl-mas-iva { font-family: Sora, sans-serif; font-weight: 700; background: #1D3557; color: #F4EFE3; padding: 0.1em 0.5em; border-radius: 6px; white-space: nowrap; }

/* El embudo de la renta. */
.fae-cl-embudo { display: flex; flex-direction: column; align-items: center; gap: max(6px, 1vh); }
/* Solo el embudo: con un selector descendiente, las fichas de la leyenda salían al 100 % de ancho. */
.fae-cl-embudo > svg { display: block; width: 100%; height: auto; max-height: 36vh; overflow: visible; }
.fae-cl-tarifa { margin: 0; font-family: Sora, sans-serif; font-weight: 700; font-size: var(--pres-min, 14px); padding: 0.35em 0.9em; border-radius: 999px; border: var(--pres-borde, 2px) solid #F8F9FA; }
.fae-cl-leyendas { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.3em 1.4em; }
.fae-cl-leyenda { display: inline-flex; align-items: center; gap: 0.45em; font-size: var(--pres-min, 14px); }

/* Mi Casa Ya: del distribuidor a la obra. */
.fae-cl-casa { display: flex; align-items: center; gap: max(8px, 1vw); }
.fae-cl-casa-lado { flex: 0 0 auto; display: flex; flex-direction: column; align-items: center; gap: 0.6vh; text-align: center; }
.fae-cl-casa-origen { width: 26%; }
.fae-cl-casa-destino { width: 32%; }
.fae-cl-casa-destino svg { display: block; width: 100%; height: auto; max-height: 28vh; }
.fae-cl-via { position: relative; flex: 1 1 auto; align-self: stretch; min-height: 3em; }
.fae-cl-via::before { content: ""; position: absolute; left: 0; right: 0.8em; top: 50%; border-top: var(--pres-borde, 2px) dashed rgba(248,249,250,0.65); }
.fae-cl-via::after { content: ""; position: absolute; right: 0; top: 50%; transform: translateY(-50%); border-style: solid; border-width: 0.45em 0 0.45em 0.8em; border-color: transparent transparent transparent rgba(248,249,250,0.85); }
.fae-cl-dinero {
  position: absolute; top: 50%; white-space: nowrap;
  font-family: Sora, sans-serif; font-weight: 700; font-size: var(--pres-lectura, 16px);
  background: #E9C46A; color: #0E1B2E; padding: 0.25em 0.6em; border-radius: 10px; box-shadow: 0 0.4vh 1.4vh rgba(0,0,0,0.45);
}

@media (orientation: portrait), (max-width: 760px) {
  .fae-cl-ejemplos { grid-template-columns: minmax(0, 1fr); }
  .fae-cl-embudo > svg { max-height: none; }
  .fae-cl-casa-destino svg { max-height: none; }
  .fae-cl-dinero { font-size: 14px; }
}
`;

/* Lo que dice el pie de cada dibujo, antes y después de aplicar la medida. */
const PIES = {
  iva: { antes: "Hoy el producto está exento: no paga IVA.", despues: "Sin la exención, el IVA se suma al total." },
  renta: { antes: "Hoy declaran los que ya están en la base.", despues: "Más personas declaran." },
  "mi-casa-ya": {
    antes: "El dinero está en el distribuidor; la casa, por construir.",
    despues: "El $1 billón adicional sale del Gasto y se vuelve vivienda.",
  },
};

/* Cuándo termina cada movimiento, en ms: entonces aparece la clasificación. */
const FIN = { iva: 1900, renta: 1500, "mi-casa-ya": 2300 };

function Caja({ aplicado, animar }) {
  return (
    <div
      className="fae-cl-tiquete"
      role="img"
      aria-label={aplicado ? "Tiquete de caja: el producto ya no está exento y el IVA se suma al total." : "Tiquete de caja: el producto está exento de IVA."}
    >
      <p className="fae-cl-tiq-cabeza">TIQUETE DE CAJA</p>
      <div className="fae-cl-tiq-fila">
        <span>Producto</span>
        <span className="fae-cl-tiq-valor">
          <span className="fae-cl-barra" style={{ width: "46%" }} />
        </span>
      </div>
      <div className="fae-cl-tiq-fila">
        <span>IVA</span>
        <span className="fae-cl-tiq-valor">
          {aplicado ? (
            <>
              {animar && (
                <span className="fae-cl-exento" style={{ position: "absolute", left: 0, opacity: 0, ...anima(true, "fae-cl-desvanecer", 450, 150, "ease-in") }}>
                  EXENTO
                </span>
              )}
              <span className="fae-cl-barra fae-cl-barra-iva" style={{ width: "18%", ...anima(animar, "fae-cl-ancho", 650, 500) }} />
              <span style={anima(animar, "fae-cl-fundido", 300, 1050)}>se cobra</span>
            </>
          ) : (
            <span className="fae-cl-exento">EXENTO</span>
          )}
        </span>
      </div>
      <div className="fae-cl-tiq-fila fae-cl-tiq-total">
        <span>TOTAL</span>
        <span className="fae-cl-tiq-valor">
          <span className="fae-cl-barra" style={{ width: "46%" }} />
          {aplicado && (
            <>
              <span className="fae-cl-barra fae-cl-barra-iva" style={{ width: "18%", ...anima(animar, "fae-cl-ancho", 650, 1100) }} />
              <span className="fae-cl-mas-iva" style={anima(animar, "fae-cl-aparecer", 380, 1650)}>+ IVA</span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}

/* Nueve sitios en la boca del embudo: los tres del centro ya estaban; los otros seis entran. */
const FILA = [22, 41.5, 61, 80.5, 100, 119.5, 139, 158.5, 178];
const YA_ESTABAN = new Set([3, 4, 5]);
const ORDEN_DE_ENTRADA = [2, 6, 1, 7, 0, 8];

function Ficha({ nueva = false }) {
  return (
    <svg viewBox="0 0 20 32" width="0.8em" height="1.3em" aria-hidden="true" style={{ overflow: "visible" }}>
      <g transform="translate(-90 -12)">
        <Persona x={100} nueva={nueva} />
      </g>
    </svg>
  );
}

function Embudo({ aplicado, animar }) {
  return (
    <div
      className="fae-cl-embudo"
      role="img"
      aria-label={aplicado ? "Embudo de la renta: entran más personas a declarar y la tarifa no sube." : "Embudo de la renta: declaran los que ya están en la base."}
    >
      <svg viewBox="0 0 200 120" aria-hidden="true">
        <path d="M8 46 H192 L108 96 V116 H92 V96 Z" fill="rgba(248,249,250,0.08)" stroke="#F8F9FA" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M8 46 H192" stroke={ACENTOS.tributacion} strokeWidth="4.5" strokeLinecap="round" />
        {FILA.map((x, k) => {
          if (YA_ESTABAN.has(k)) return <Persona key={x} x={x} />;
          if (!aplicado) return null;
          return (
            <g
              key={x}
              style={{
                "--de-x": `${x < 100 ? -46 : 46}px`,
                "--de-y": "-12px",
                ...anima(animar, "fae-cl-entrar", 700, 150 + ORDEN_DE_ENTRADA.indexOf(k) * 140),
              }}
            >
              <Persona x={x} nueva />
            </g>
          );
        })}
      </svg>
      <p className="fae-cl-tarifa">La tarifa no sube</p>
      <div className="fae-cl-leyendas">
        <span className="fae-cl-leyenda"><Ficha /> Ya declaraban</span>
        {aplicado && (
          <span className="fae-cl-leyenda" style={anima(animar, "fae-cl-aparecer", 380, 1100)}>
            <Ficha nueva /> Entran a declarar
          </span>
        )}
      </div>
    </div>
  );
}

function Casa({ aplicado, animar }) {
  const obra = FAE.ambar;
  return (
    <div
      className="fae-cl-casa"
      role="img"
      aria-label={aplicado ? "El $1 billón sale del Gasto del Gobierno y la casa de Mi Casa Ya se levanta." : "El Gasto del Gobierno tiene el dinero; la casa de Mi Casa Ya está por construir."}
    >
      <div className="fae-cl-casa-lado fae-cl-casa-origen">
        <MaquinaGrande id="gasto" color={ACENTOS.gasto} animar={animar} />
        <p className="fae-cl-nota">Gasto del Gobierno</p>
      </div>

      <div className="fae-cl-via">
        <span
          className="fae-cl-dinero"
          style={
            aplicado
              ? { left: "100%", transform: "translate(-100%, -50%)", ...anima(animar, "fae-cl-izquierda", 1100, 150, "cubic-bezier(.45,0,.2,1)") }
              : { left: 0, transform: "translate(0, -50%)" }
          }
        >
          $1 billón
        </span>
      </div>

      <div className="fae-cl-casa-lado fae-cl-casa-destino">
        <svg viewBox="0 0 100 90" aria-hidden="true">
          <path d="M2 86 H98" stroke="rgba(248,249,250,0.75)" strokeWidth="2.4" strokeLinecap="round" />
          {/* El andamio: la casa está en obra. */}
          <path d="M80 86 V26 M92 86 V26 M80 36 H92 M80 56 H92 M80 76 H92 M80 36 L92 56 M80 56 L92 76" stroke="rgba(248,249,250,0.6)" strokeWidth="1.8" fill="none" />
          {/* Lo que falta por levantar, en punteado. */}
          <rect x="10" y="46" width="58" height="40" fill="none" stroke="rgba(248,249,250,0.55)" strokeWidth="1.8" strokeDasharray="4 3" />
          <path d="M4 48 L39 18 L74 48" fill="none" stroke="rgba(248,249,250,0.55)" strokeWidth="1.8" strokeDasharray="4 3" />
          {aplicado && (
            <>
              <g style={{ transformBox: "fill-box", transformOrigin: "center bottom", ...anima(animar, "fae-cl-alto", 700, 1100, "cubic-bezier(.3,1.1,.5,1)") }}>
                <rect x="10" y="46" width="58" height="40" fill={`${obra}40`} stroke={obra} strokeWidth="3" />
                <rect x="33" y="64" width="12" height="22" fill={obra} />
                <rect x="17" y="54" width="10" height="10" fill="none" stroke={obra} strokeWidth="2.2" />
                <rect x="51" y="54" width="10" height="10" fill="none" stroke={obra} strokeWidth="2.2" />
              </g>
              <path d="M4 48 L39 18 L74 48 Z" fill={obra} stroke={obra} strokeWidth="3" strokeLinejoin="round" style={anima(animar, "fae-cl-fundido", 450, 1750)} />
            </>
          )}
        </svg>
        <p className="fae-cl-nota">Mi Casa Ya</p>
      </div>
    </div>
  );
}

const DIBUJOS = { iva: Caja, renta: Embudo, "mi-casa-ya": Casa };

export function escenaEjemplos({ id = "ejemplos", titulo, ejemplos }) {
  for (const ej of ejemplos) {
    if (!DIBUJOS[ej.id]) throw new Error(`Ejemplo «${ej.id}» sin dibujo`);
  }

  const aplicar = (e, k) => ({
    ...e,
    aplicados: e.aplicados.includes(ejemplos[k].id) ? e.aplicados : [...e.aplicados, ejemplos[k].id],
    vueltas: e.vueltas.map((v, j) => (j === k ? v + 1 : v)),
  });

  return {
    id,
    titulo,
    identidad: "tesoreria",
    estadoInicial: { actual: 0, aplicados: [], vueltas: ejemplos.map(() => 0) },
    siguientePaso: (e) => {
      if (!e.aplicados.includes(ejemplos[e.actual].id)) return aplicar(e, e.actual);
      if (e.actual < ejemplos.length - 1) return { ...e, actual: e.actual + 1 };
      return null;
    },
    textoPaso: (e) => {
      if (!e.aplicados.includes(ejemplos[e.actual].id)) return `Aplicar la medida: ${ejemplos[e.actual].corto}`;
      if (e.actual < ejemplos.length - 1) return `Ejemplo ${e.actual + 2}: ${ejemplos[e.actual + 1].corto}`;
      return null;
    },
    Componente: function EscenaEjemplos({ estado, cambiar }) {
      const vistas = useVistasAlMontar(() => ejemplos.map((ej, j) => `${ej.id}:${estado.vueltas[j]}`));
      const k = estado.actual;
      const ej = ejemplos[k];
      const aplicado = estado.aplicados.includes(ej.id);
      const firma = `${ej.id}:${estado.vueltas[k]}`;
      const Dibujo = DIBUJOS[ej.id];
      const color = ACENTOS[ej.instrumento];

      return (
        <div className="fae-cl fae-cl-ejemplos fae-cl-rejilla-clase">
          <style>{CSS_CLASE + CSS}</style>

          <div className="fae-cl-pestanas fae-cl-a-tabs" role="group" aria-label="Ejemplos">
            {ejemplos.map((x, j) => (
              <button
                key={x.id}
                type="button"
                className="fae-cl-pestana"
                aria-pressed={j === k}
                onClick={() => cambiar((e) => ({ ...e, actual: j }))}
              >
                {j + 1} · {x.corto}
                {estado.aplicados.includes(x.id) && (
                  <>
                    <span aria-hidden="true"> ✓</span>
                    <span className="fae-cl-oculto"> (ya aplicada)</span>
                  </>
                )}
              </button>
            ))}
          </div>

          <div className="fae-cl-texto fae-cl-a-enunciado">
            <p className="fae-cl-rotulo">EJEMPLO {k + 1} DE {ejemplos.length} · DE LA PRENSA</p>
            <p className="fae-cl-medida">{ej.medida}</p>
          </div>

          <div className="fae-cl-escenario fae-cl-a-dibujo">
            <UnaVez key={firma} firma={firma} vistas={vistas} activo={aplicado}>
              {(animar) => (
                <>
                  <Dibujo aplicado={aplicado} animar={animar} />
                  <p className="fae-cl-nota" style={aplicado ? anima(animar, "fae-cl-aparecer", 380, FIN[ej.id] - 300) : undefined}>
                    {aplicado ? PIES[ej.id].despues : PIES[ej.id].antes}
                  </p>
                </>
              )}
            </UnaVez>
          </div>

          <div className="fae-cl-texto fae-cl-a-acciones">
            <button type="button" className="fae-cl-accion" onClick={() => cambiar((e) => aplicar(e, k))}>
              <span aria-hidden="true">{aplicado ? "↻" : "▶"}</span> {aplicado ? "Verlo otra vez" : "Aplicar la medida"}
            </button>
            <div aria-live="polite" style={{ width: "100%" }}>
              {aplicado ? (
                <UnaVez key={firma} firma={firma} vistas={vistas}>
                  {(animar) => (
                    <div className="fae-cl-panel fae-cl-clasif" style={{ borderLeftColor: color, ...anima(animar, "fae-cl-aparecer", 420, FIN[ej.id]) }}>
                      <IconoMecanismo id={ej.instrumento} color={color} tam="2.2em" />
                      <div>
                        <p className="fae-cl-rotulo">CLASIFICACIÓN</p>
                        <p className="fae-cl-clasif-texto">{ej.clasificacion}</p>
                      </div>
                    </div>
                  )}
                </UnaVez>
              ) : (
                <p className="fae-cl-nota">¿Cobra, gasta o pide prestado? Se ve al aplicar la medida.</p>
              )}
            </div>
          </div>
        </div>
      );
    },
  };
}
