import { FAE } from "../../../../theme.js";
import { ACENTOS, IconoMecanismo } from "../tesoreria.jsx";
import { partirVariedad } from "../../../../data/politicaFiscalClase.js";
import { CSS_CLASE, UnaVez, anima, useVistasAlMontar } from "./animaciones.jsx";

/*
 * ESCENA 4 · CHEQUEO RÁPIDO, PARA LA CLASE EN VIVO.
 *
 * Dos preguntas que se responden en voz alta. NADA SE CALIFICA: no hay
 * opciones que elegir, ni acierto, ni FP. La respuesta NO ESTÁ EN LA PÁGINA
 * hasta que se revela —ni oculta con CSS—, así que nadie la lee antes de
 * tiempo inspeccionando ni con un lector de pantalla.
 *
 *   El peaje               el carro paga, la talanquera sube y la moneda va
 *                          a la ranura «Tasas/tarifas» del recaudador
 *   El servicio de la deuda la flecha va DEL LIBRO AL DISTRIBUIDOR, no al
 *                          revés: esa dirección es la lección
 *
 * Por la flecha del servicio viaja la CUOTA —el papel con lo que hay que
 * pagar—, no dinero. Monedas saliendo del libro de la deuda hacia el
 * distribuidor dibujarían justo lo contrario: pedir prestado para gastar.
 */

const CSS = `
/*
 * La respuesta del servicio de la deuda es el texto más largo de la clase:
 * la columna ancha es la suya, para que quepa en 1080 sin bajar del tamaño
 * de lectura. El dibujo se queda con la estrecha.
 */
.fae-cl-chequeo { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.5fr); }
.fae-cl-pregunta { font-family: Sora, sans-serif; font-weight: 700; font-size: var(--pres-destacado, 19px); line-height: 1.16; letter-spacing: -0.01em; margin: 0; }
.fae-cl-dibujo { display: flex; flex-direction: column; gap: max(8px, 1.2vh); }
.fae-cl-dibujo .fae-cl-panel { padding-block: max(10px, 1.4vh); }
.fae-cl-respuesta-col { display: flex; flex-direction: column; gap: max(10px, 1.6vh); align-items: flex-start; }
.fae-cl-respuesta { font-size: var(--pres-lectura, 16px); line-height: 1.32; margin: 0.4em 0 0; }

.fae-cl-peaje > svg { display: block; width: 100%; height: auto; overflow: visible; }
.fae-cl-candidatos { display: flex; flex-wrap: wrap; gap: 0.5em; }
.fae-cl-candidato {
  display: inline-flex; align-items: center; gap: 0.4em; padding: 0.35em 0.8em; border-radius: 999px;
  border: var(--pres-borde, 2px) solid rgba(248,249,250,0.7);
  font-family: Sora, sans-serif; font-weight: 600; font-size: var(--pres-min, 14px);
}
/* Una ranura por fila: en la columna estrecha, de dos en dos se partían y el ✓ quedaba solo en su línea. */
.fae-cl-ranuras { display: flex; flex-direction: column; gap: 0.4em; }
.fae-cl-ranura, .fae-cl-fila {
  padding: 0.3em 0.7em; border-radius: 10px; font-size: var(--pres-min, 14px); line-height: 1.25;
  border: var(--pres-borde, 2px) solid rgba(248,249,250,0.45); background: rgba(248,249,250,0.07);
}
.fae-cl-ranura { border-left: max(6px, 0.8vh) solid ${FAE.teal}; }
.fae-cl-elegida { background: #E9C46A; border-color: #E9C46A; color: #0E1B2E; font-weight: 700; }

.fae-cl-caja { display: flex; align-items: center; gap: 0.7em; }
.fae-cl-caja-nombre { font-family: Sora, sans-serif; font-weight: 700; font-size: var(--pres-lectura, 16px); line-height: 1.2; margin: 0; }
.fae-cl-mec-panel { border-top-width: max(6px, 0.9vh); }
.fae-cl-filas { list-style: none; margin: 0.6em 0 0; padding: 0; display: flex; flex-direction: column; gap: 0.4em; }
/* Las dos flechas con su rótulo. El alto lo marcan las flechas; un rótulo de dos líneas cabe al lado. */
.fae-cl-flechas {
  display: grid; grid-template-columns: auto minmax(0, 1.3fr) auto minmax(0, 1fr); align-items: center; gap: 0.4em;
  min-height: max(72px, 9vh); padding-inline: 0.4em; box-sizing: border-box;
}
.fae-cl-flechas svg { display: block; height: max(72px, 9vh); width: auto; overflow: visible; }

@media (orientation: portrait), (max-width: 760px) {
  .fae-cl-chequeo { grid-template-columns: minmax(0, 1fr); }
}
`;

/* Cuándo termina cada movimiento, en ms: entonces aparece la respuesta escrita. */
const FIN = { peaje: 1800, "servicio-deuda": 1900 };

const mecanismoDe = (mecanismos, id) => mecanismos.find((m) => m.id === id);

function Peaje({ revelada, animar, destino, mecanismos }) {
  const cobra = ACENTOS.tributacion;
  const recaudador = mecanismoDe(mecanismos, destino.instrumento);

  return (
    <div className="fae-cl-dibujo fae-cl-peaje">
      <svg
        viewBox="0 0 200 90"
        role="img"
        aria-label={revelada ? "La talanquera sube, el carro pasa y el pago entra al recaudador." : "Un carro detenido en la caseta del peaje, pagando."}
      >
        {/* la vía */}
        <rect x="0" y="58" width="200" height="26" fill="rgba(248,249,250,0.1)" />
        <path d="M0 58 H200 M0 84 H200" stroke="rgba(248,249,250,0.55)" strokeWidth="1.5" />
        <path d="M0 71 H200" stroke="rgba(248,249,250,0.55)" strokeWidth="1.5" strokeDasharray="7 6" />
        {/* la caseta */}
        <rect x="96" y="24" width="24" height="34" rx="3" fill="#1B2F4B" stroke="#F8F9FA" strokeWidth="2.2" />
        <path d="M92 24 H124" stroke="#F8F9FA" strokeWidth="3.5" strokeLinecap="round" />
        <rect x="101" y="31" width="14" height="10" rx="1.5" fill="none" stroke="#F8F9FA" strokeWidth="1.6" />
        {/* la talanquera: gira sobre su poste */}
        <g
          style={{
            transformBox: "view-box",
            transformOrigin: "96px 52px",
            transform: revelada ? "rotate(72deg)" : "none",
            ...anima(animar, "fae-cl-barrera", 600, 150, "ease-in-out"),
          }}
        >
          <path d="M63 52 H96" stroke="#F8F9FA" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M63 52 H96" stroke={FAE.coral} strokeWidth="4.5" strokeDasharray="5 5" />
        </g>
        <circle cx="96" cy="52" r="2.6" fill="#F8F9FA" />
        {/* el pago: en la ventanilla, o camino del recaudador */}
        {revelada ? (
          <circle
            cx="177" cy="9" r="4.5" fill={FAE.ambar}
            style={{ opacity: 0, "--de-x": "-69px", "--de-y": "27px", ...anima(animar, "fae-cl-viajar", 900, 350, "ease-in-out") }}
          />
        ) : (
          <circle cx="108" cy="36" r="4.5" fill={FAE.ambar} />
        )}
        {/* el recaudador, que solo aparece con la respuesta */}
        {revelada && (
          <g style={anima(animar, "fae-cl-fundido", 350, 0)}>
            <rect x="160" y="9" width="34" height="25" rx="4" fill={`${cobra}2E`} stroke={cobra} strokeWidth="2.4" />
            <path d="M170 9 H184" stroke={cobra} strokeWidth="4" strokeLinecap="round" />
          </g>
        )}
        {/* el carro */}
        <g
          style={{
            transform: revelada ? "translateX(122px)" : "none",
            "--de-x": "-122px",
            ...anima(animar, "fae-cl-mover", 1100, 650, "cubic-bezier(.5,0,.3,1)"),
          }}
        >
          <path d="M12 70 V61 Q12 58 15 58 H20 L27 50 H45 L53 58 H57 Q60 58 60 61 V70 Z" fill={FAE.node} />
          <path d="M28.5 52.5 H36 V58 H23.5 Z M38 52.5 H44 L49.5 58 H38 Z" fill="#0E1B2E" />
          <circle cx="22" cy="70" r="4.5" fill="#0E1B2E" stroke="#F8F9FA" strokeWidth="2" />
          <circle cx="50" cy="70" r="4.5" fill="#0E1B2E" stroke="#F8F9FA" strokeWidth="2" />
        </g>
      </svg>

      {revelada ? (
        <>
          <p className="fae-cl-rotulo" style={anima(animar, "fae-cl-aparecer", 380, 800)}>
            EL RECAUDADOR · {recaudador.instrumento.toUpperCase()}
          </p>
          <div className="fae-cl-ranuras">
            {recaudador.variedades.map((v, k) => {
              const elegida = v === destino.variedad;
              return (
                <div
                  key={v}
                  className={`fae-cl-ranura${elegida ? " fae-cl-elegida" : ""}`}
                  style={anima(animar, "fae-cl-aparecer", 380, 950 + k * 150)}
                >
                  {elegida && <span aria-hidden="true">✓ </span>}
                  {v}
                  {elegida && <span className="fae-cl-oculto"> (aquí entra el peaje)</span>}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <p className="fae-cl-nota">¿A cuál de las tres máquinas va este pago?</p>
          <div className="fae-cl-candidatos">
            {mecanismos.map((m) => (
              <span key={m.id} className="fae-cl-candidato">
                <IconoMecanismo id={m.id} color="#F8F9FA" tam="1.2em" />
                {m.instrumento}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Servicio({ revelada, animar, destino, mecanismos }) {
  const deuda = mecanismoDe(mecanismos, "deuda");
  const gasto = mecanismoDe(mecanismos, destino.instrumento);

  return (
    <div className="fae-cl-dibujo">
      <div className="fae-cl-panel fae-cl-mec-panel fae-cl-caja" style={{ borderTopColor: ACENTOS.deuda }}>
        <IconoMecanismo id="deuda" color={ACENTOS.deuda} tam="2em" />
        <div>
          <p className="fae-cl-caja-nombre">{deuda.instrumento}</p>
          <p className="fae-cl-nota">Deuda ya adquirida</p>
        </div>
      </div>

      <div className="fae-cl-flechas" aria-hidden={!revelada}>
        {revelada && (
          <>
            <svg viewBox="0 0 40 100" aria-hidden="true">
              <path
                d="M20 4 V90 M9 77 L20 92 L31 77" pathLength="1" className="fae-cl-trazo"
                fill="none" stroke={ACENTOS.gasto} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
                style={anima(animar, "fae-cl-trazar", 700, 100, "ease-out")}
              />
              {/* la cuota: el papel con lo que hay que pagar */}
              <rect
                x="12" y="66" width="16" height="12" rx="2" fill="#F4EFE3"
                style={{ opacity: 0, "--de-y": "-60px", ...anima(animar, "fae-cl-viajar", 1000, 600, "ease-in-out") }}
              />
            </svg>
            <p className="fae-cl-nota" style={anima(animar, "fae-cl-aparecer", 400, 500)}>pagar lo que ya se debe</p>
            <svg viewBox="0 0 40 100" aria-hidden="true" style={anima(animar, "fae-cl-fundido", 500, 1500)}>
              <path d="M20 92 V12 M10 24 L20 10 L30 24" fill="none" stroke="rgba(248,249,250,0.5)" strokeWidth="3" strokeDasharray="5 5" strokeLinecap="round" />
              <path d="M8 40 L32 62 M32 40 L8 62" stroke={FAE.coral} strokeWidth="5" strokeLinecap="round" />
            </svg>
            <p className="fae-cl-nota" style={anima(animar, "fae-cl-aparecer", 400, 1600)}>no vuelve al libro</p>
          </>
        )}
      </div>

      <div className="fae-cl-panel fae-cl-mec-panel" style={{ borderTopColor: ACENTOS.gasto }}>
        <div className="fae-cl-caja">
          <IconoMecanismo id="gasto" color={ACENTOS.gasto} tam="2em" />
          <p className="fae-cl-caja-nombre">{gasto.instrumento}</p>
        </div>
        <ul className="fae-cl-filas">
          {gasto.variedades.map((v) => {
            const elegida = revelada && v === destino.variedad;
            return (
              <li
                key={v}
                className={`fae-cl-fila${elegida ? " fae-cl-elegida" : ""}`}
                style={elegida ? anima(animar, "fae-cl-encender", 500, 1300) : undefined}
              >
                {elegida && <span aria-hidden="true">✓ </span>}
                {partirVariedad(v).cabeza}
                {elegida && <span className="fae-cl-oculto"> (aquí va el servicio de la deuda)</span>}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

const DIBUJOS = { peaje: Peaje, "servicio-deuda": Servicio };

export function escenaChequeos({ id = "chequeos", titulo, chequeos, mecanismos }) {
  for (const c of chequeos) {
    if (!DIBUJOS[c.id]) throw new Error(`Chequeo «${c.id}» sin dibujo`);
  }

  const revelar = (e, k) => ({
    ...e,
    reveladas: e.reveladas.map((r, j) => (j === k ? true : r)),
    vueltas: e.vueltas.map((v, j) => (j === k ? v + 1 : v)),
  });
  const ocultar = (e, k) => ({ ...e, reveladas: e.reveladas.map((r, j) => (j === k ? false : r)) });

  return {
    id,
    titulo,
    identidad: "tesoreria",
    estadoInicial: { actual: 0, reveladas: chequeos.map(() => false), vueltas: chequeos.map(() => 0) },
    siguientePaso: (e) => {
      if (!e.reveladas[e.actual]) return revelar(e, e.actual);
      if (e.actual < chequeos.length - 1) return { ...e, actual: e.actual + 1 };
      return null;
    },
    textoPaso: (e) => {
      if (!e.reveladas[e.actual]) return "Revelar la respuesta";
      if (e.actual < chequeos.length - 1) return `Chequeo ${e.actual + 2}: ${chequeos[e.actual + 1].titulo}`;
      return null;
    },
    Componente: function EscenaChequeos({ estado, cambiar }) {
      const vistas = useVistasAlMontar(() => chequeos.map((c, j) => `${c.id}:${estado.vueltas[j]}`));
      const k = estado.actual;
      const ch = chequeos[k];
      const revelada = estado.reveladas[k];
      const firma = `${ch.id}:${estado.vueltas[k]}`;
      const Dibujo = DIBUJOS[ch.id];

      return (
        <div className="fae-cl fae-cl-chequeo fae-cl-rejilla-clase">
          <style>{CSS_CLASE + CSS}</style>

          <div className="fae-cl-pestanas fae-cl-a-tabs" role="group" aria-label="Chequeos">
            {chequeos.map((c, j) => (
              <button
                key={c.id}
                type="button"
                className="fae-cl-pestana"
                aria-pressed={j === k}
                onClick={() => cambiar((e) => ({ ...e, actual: j }))}
              >
                Chequeo {j + 1} · {c.titulo}
              </button>
            ))}
          </div>

          <p className="fae-cl-pregunta fae-cl-a-enunciado">{ch.pregunta}</p>

          <div className="fae-cl-a-dibujo">
            <UnaVez key={firma} firma={firma} vistas={vistas} activo={revelada}>
              {(animar) => <Dibujo revelada={revelada} animar={animar} destino={ch.destino} mecanismos={mecanismos} />}
            </UnaVez>
          </div>

          <div className="fae-cl-respuesta-col fae-cl-a-acciones">
            <button
              type="button"
              className="fae-cl-accion"
              aria-expanded={revelada}
              onClick={() => cambiar((e) => (e.reveladas[k] ? ocultar(e, k) : revelar(e, k)))}
            >
              {revelada ? "Ocultar la respuesta" : "Revelar la respuesta"}
            </button>
            <div aria-live="polite">
              {revelada ? (
                <UnaVez key={firma} firma={firma} vistas={vistas}>
                  {(animar) => (
                    <div style={anima(animar, "fae-cl-aparecer", 450, FIN[ch.id])}>
                      <p className="fae-cl-rotulo">RESPUESTA</p>
                      <p className="fae-cl-respuesta">{ch.respuesta}</p>
                    </div>
                  )}
                </UnaVez>
              ) : (
                <p className="fae-cl-nota">Se responde en voz alta. Nada de esto se califica.</p>
              )}
            </div>
          </div>
        </div>
      );
    },
  };
}
