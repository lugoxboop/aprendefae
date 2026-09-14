import { ACENTOS } from "../tesoreria.jsx";
import { partirVariedad } from "../../../../data/politicaFiscalClase.js";
import { CSS_CLASE, MaquinaGrande, Familia, UnaVez, anima, useVistasAlMontar } from "./animaciones.jsx";

/*
 * ESCENA 2 · COBRA, GASTA, PIDE PRESTADO.
 *
 * Las tres máquinas de la Tesorería, una al lado de la otra. Tocar una la pone
 * en marcha —el recaudador gira, el distribuidor reparte, el libro se abre— y
 * despliega sus variedades de una en una. Tocarla otra vez lo repite. El mando
 * las abre en el orden de la lista.
 */

const CSS = `
.fae-cl-trio { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: max(12px, 1.4vw); align-items: start; }
/* La columna del Gasto es la más alta: sus medidas deciden si la escena cabe en 1080 sin desplazarse. */
.fae-cl-mec { position: relative; display: flex; flex-direction: column; gap: max(8px, 1vh); border-top-width: max(6px, 0.9vh); padding-block: max(12px, 1.8vh); }
.fae-cl-mec .fae-cl-maquina { height: max(72px, 9.5vh); }
.fae-cl-mec-cabeza {
  position: relative; display: flex; flex-direction: column; align-items: stretch; gap: max(6px, 0.8vh);
  text-align: left; cursor: pointer; background: none; border: none; padding: 0; margin: 0;
  color: inherit; font: inherit; border-radius: 12px;
}
.fae-cl-otra { position: absolute; top: 0; right: 0; font-family: Sora, sans-serif; font-size: var(--pres-destacado, 19px); font-weight: 700; line-height: 1; color: rgba(248,249,250,0.9); }
.fae-cl-verbo { font-family: Sora, sans-serif; font-weight: 700; font-size: calc(var(--pres-destacado, 19px) * 1.15); line-height: 1.05; letter-spacing: -0.02em; }
.fae-cl-instrumento { display: flex; align-items: center; gap: 0.45em; font-family: Sora, sans-serif; font-weight: 600; font-size: var(--pres-lectura, 16px); line-height: 1.2; color: rgba(248,249,250,0.95); }
.fae-cl-marca { width: 0.75em; height: 0.75em; border-radius: 3px; flex-shrink: 0; }
.fae-cl-analogia { display: flex; gap: 0.5em; align-items: flex-start; font-size: var(--pres-min, 14px); line-height: 1.3; font-style: italic; color: rgba(248,249,250,0.88); margin: 0; }
.fae-cl-variedades { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: max(5px, 0.6vh); }
.fae-cl-variedad {
  padding: 0.35em 0.6em; border-left: max(5px, 0.7vh) solid; border-radius: 0 10px 10px 0;
  background: rgba(248,249,250,0.08); font-size: var(--pres-min, 14px); line-height: 1.3;
}
.fae-cl-variedad b { font-family: Sora, sans-serif; font-weight: 700; }
.fae-cl-variedad span { color: rgba(248,249,250,0.88); }
.fae-cl-invitacion {
  margin: 0; padding: 0.5em 0.7em; border-radius: 10px; border: var(--pres-borde, 2px) dashed rgba(248,249,250,0.45);
  font-size: var(--pres-min, 14px); line-height: 1.3; color: rgba(248,249,250,0.85);
}
@media (orientation: portrait), (max-width: 760px) {
  .fae-cl-trio { grid-template-columns: 1fr; }
}
`;

const vueltaDe = (e, id) => e.vueltas[id] ?? 0;
const abrir = (e, id) => ({
  abiertos: e.abiertos.includes(id) ? e.abiertos : [...e.abiertos, id],
  vueltas: { ...e.vueltas, [id]: vueltaDe(e, id) + 1 },
});

function Mecanismo({ m, estado, cambiar, vistas }) {
  const color = ACENTOS[m.id];
  const abierto = estado.abiertos.includes(m.id);
  const firma = `${m.id}:${vueltaDe(estado, m.id)}`;
  const idLista = `fae-cl-variedades-${m.id}`;

  return (
    <section className="fae-cl-panel fae-cl-mec" style={{ borderTopColor: color }}>
      <button
        type="button"
        className="fae-cl-mec-cabeza"
        aria-expanded={abierto}
        aria-controls={idLista}
        aria-label={`${m.verbo}: ${m.instrumento}. ${abierto ? "Verlo otra vez" : "Abrir sus variedades"}`}
        onClick={() => cambiar((e) => abrir(e, m.id))}
      >
        {abierto && <span className="fae-cl-otra" aria-hidden="true">↻</span>}
        <UnaVez key={firma} firma={firma} vistas={vistas} activo={abierto}>
          {(animar) => <MaquinaGrande id={m.id} color={color} animar={animar} />}
        </UnaVez>
        <span className="fae-cl-verbo">{m.verbo}</span>
        <span className="fae-cl-instrumento">
          <span className="fae-cl-marca" style={{ background: color }} aria-hidden="true" />
          {m.instrumento}
        </span>
      </button>

      <p className="fae-cl-analogia">
        <Familia />
        <span>{m.analogia}</span>
      </p>

      {abierto ? (
        <UnaVez key={firma} firma={firma} vistas={vistas}>
          {(animar) => (
            <ul id={idLista} className="fae-cl-variedades">
              {m.variedades.map((v, k) => {
                const { cabeza, detalle } = partirVariedad(v);
                return (
                  <li
                    key={v}
                    className="fae-cl-variedad"
                    style={{ borderLeftColor: color, ...anima(animar, "fae-cl-aparecer", 420, 650 + k * 380) }}
                  >
                    <b>{cabeza}</b>
                    {detalle && <> <span>{detalle}</span></>}
                  </li>
                );
              })}
            </ul>
          )}
        </UnaVez>
      ) : (
        <p id={idLista} className="fae-cl-invitacion">Toca la máquina para ver sus variedades</p>
      )}
    </section>
  );
}

export function escenaTesoreria({ id = "tesoreria", titulo, mecanismos }) {
  const siguienteCerrado = (e) => mecanismos.find((m) => !e.abiertos.includes(m.id)) ?? null;

  return {
    id,
    titulo,
    identidad: "tesoreria",
    estadoInicial: { abiertos: [], vueltas: {} },
    siguientePaso: (e) => {
      const m = siguienteCerrado(e);
      return m ? abrir(e, m.id) : null;
    },
    textoPaso: (e) => {
      const m = siguienteCerrado(e);
      return m ? `Abrir «${m.verbo}»` : null;
    },
    Componente: function EscenaTesoreria({ estado, cambiar }) {
      const vistas = useVistasAlMontar(() => mecanismos.map((m) => `${m.id}:${vueltaDe(estado, m.id)}`));
      return (
        <div className="fae-cl">
          <style>{CSS_CLASE + CSS}</style>
          <div className="fae-cl-trio">
            {mecanismos.map((m) => (
              <Mecanismo key={m.id} m={m} estado={estado} cambiar={cambiar} vistas={vistas} />
            ))}
          </div>
        </div>
      );
    },
  };
}
