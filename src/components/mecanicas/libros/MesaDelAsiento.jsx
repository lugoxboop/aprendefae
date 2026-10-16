import { FAE } from "../../../theme.js";
import { DEBE, HABER, COLOR_LADO } from "../../../data/contabilidad.js";
import { Ficha } from "./verbos.jsx";
import { MarcaVeredicto } from "./marcaVeredicto.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA MESA DE «ARMA EL ASIENTO»: dos cuentas T y el arco entre ellas.
 *
 * ═══════════ POR QUÉ DOS T Y NO DOS FILAS ═══════════
 *
 * Las filas del constructor de asientos dicen lo mismo —cuenta, lado— y no se
 * parecen a nada de lo que el estudiante va a ver después. La cuenta T sí: es
 * la que está en la pieza 1 de Aprender, en El Saldo de la Cuenta, en La
 * Mayorización y en las tres superficies del desafío. Poner el asiento sobre
 * dos T lo conecta con todo el resto del tema.
 *
 * ═══════════ EL ARCO ES EL GESTO, Y ES UNA SOLA DECISIÓN ═══════════
 *
 * El estudiante traza del DEBE de una cuenta al HABER de la otra. Parece dos
 * decisiones y es una: en un asiento simple, elegir cuál va al debe decide la
 * otra. Trazarlo —en vez de marcar dos casillas— es lo que hace visible que
 * las dos puntas son la misma transacción vista desde los dos lados.
 *
 * ═══════════ DÓNDE SE ANCLA EL ARCO ═══════════
 *
 * Las dos T ocupan media pantalla cada una y sus columnas, un cuarto. Así que
 * los cuatro anclajes caen en 12,5 %, 37,5 %, 62,5 % y 87,5 % del ancho, y se
 * calculan de ahí en vez de medirse con getBoundingClientRect: una medida
 * tomada del DOM se desincroniza en el primer repintado y hay que volver a
 * tomarla en cada cambio de tamaño. La rejilla ya sabe dónde están.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* El centro horizontal de cada columna, en porcentaje del ancho de la mesa. */
export const ANCLAJE = { "0:debe": 12.5, "0:haber": 37.5, "1:debe": 62.5, "1:haber": 87.5 };

export const zonaDe = (indice, lado) => `${indice}:${lado}`;

/** De «0:debe» a { indice: 0, lado: "debe" }. */
export function leerZona(zona) {
  const [indice, lado] = String(zona).split(":");
  return { indice: Number(indice), lado };
}

/*
 * Un arco vale cuando va de un debe a un haber —o al revés— y toca las dos
 * cuentas, no dos veces la misma. Las dos puntas al mismo lado no son un
 * asiento: son media transacción escrita dos veces.
 */
export const esZona = (x) => typeof x === "string" && Object.hasOwn(ANCLAJE, x);

export function arcoValido(desde, hasta) {
  /*
   * Las dos puntas tienen que ser zonas de verdad. Sin esta comprobación, un
   * NOMBRE soltado sobre una columna pasaba por arco: `leerZona("Caja")`
   * devuelve un índice que no es número y un lado que no existe, y las dos
   * desigualdades de abajo se cumplían por accidente.
   */
  if (!esZona(desde) || !esZona(hasta)) return false;
  const a = leerZona(desde);
  const b = leerZona(hasta);
  return a.indice !== b.indice && a.lado !== b.lado;
}

const ROTULO_LADO = {
  fontFamily: "Sora, sans-serif", fontSize: "9.5px", fontWeight: 700,
  letterSpacing: "0.12em", textAlign: "center",
};

/* Una de las dos cuentas T: su nombre y sus dos columnas. */
function CuentaEnBlanco({
  indice, cuenta, lado, esperando, tomada, estado, deshabilitado,
  onNombrar, gestosDeZona, onTocarZona,
}) {
  /*
   * El marco de la cuenta se corrige con el borde, y el borde teal o coral,
   * solo, no dice nada en blanco y negro (miden lo mismo: 1,07:1). Por eso la
   * corrección lleva además su marca —✓ o ✗— posada en la esquina del marco.
   * Va en la esquina, fuera del flujo, para que ni el nombre de la cuenta ni
   * las dos columnas se muevan cuando aparece. El marco no es un lado del
   * asiento, así que aquí teal y coral sí valen.
   */
  const borde = estado === "correcta" ? FAE.teal : estado === "incorrecta" ? FAE.coral : "rgba(248,249,250,0.18)";
  const veredicto = estado === "correcta" || estado === "incorrecta";

  return (
    <div
      data-t={indice}
      style={{
        position: "relative",
        flex: 1, minWidth: 0, padding: "9px 8px", borderRadius: "13px",
        background: "rgba(10,20,34,0.45)", border: `1px solid ${borde}`,
        transition: "border-color 200ms ease",
      }}
    >
      {veredicto && (
        <span
          data-marca-cuenta={indice}
          style={{
            position: "absolute", top: "-9px", right: "-5px", zIndex: 1,
            display: "flex", borderRadius: "50%", background: FAE.bg,
          }}
        >
          <MarcaVeredicto
            bien={estado === "correcta"}
            color={estado === "correcta" ? FAE.teal : FAE.coral}
            etiqueta={estado === "correcta" ? `${cuenta ?? `Cuenta ${indice + 1}`}, bien puesta` : `${cuenta ?? `Cuenta ${indice + 1}`}, mal puesta`}
          />
        </span>
      )}
      {/* El nombre: hueco mientras no se haya soltado ninguno. */}
      <button
        type="button"
        data-destino={`nombre:${indice}`}
        data-cuenta-puesta={cuenta ?? ""}
        disabled={deshabilitado}
        aria-label={cuenta ? `Cuenta ${cuenta}` : `Poner un nombre en la cuenta ${indice + 1}`}
        onClick={deshabilitado ? undefined : () => onNombrar(indice)}
        style={{
          display: "block", width: "100%", padding: "5px 4px", marginBottom: "7px",
          borderRadius: "9px", cursor: deshabilitado ? "default" : "pointer",
          background: esperando ? "rgba(233,196,106,0.12)" : "transparent",
          border: cuenta
            ? "1px solid rgba(248,249,250,0.2)"
            : `1px dashed ${esperando ? FAE.ambar : "rgba(248,249,250,0.3)"}`,
          fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700,
          lineHeight: 1.25, color: cuenta ? FAE.text : "rgba(248,249,250,0.4)",
          transition: "background 180ms ease, border-color 180ms ease",
        }}
      >
        {cuenta ?? "sin nombre"}
      </button>

      <div style={{ display: "flex", gap: "6px", borderTop: "1px solid rgba(248,249,250,0.22)", paddingTop: "7px" }}>
        {[DEBE, HABER].map((cual) => {
          const puesta = lado === cual && Boolean(cuenta);
          const señalada = tomada === zonaDe(indice, cual);
          return (
            <button
              key={cual}
              type="button"
              data-zona={zonaDe(indice, cual)}
              data-destino={zonaDe(indice, cual)}
              data-ocupada={puesta ? "si" : "no"}
              disabled={deshabilitado || !cuenta}
              aria-label={`${cual === DEBE ? "Debe" : "Haber"} de ${cuenta ?? `la cuenta ${indice + 1}`}`}
              aria-pressed={señalada}
              onClick={deshabilitado || !cuenta ? undefined : () => onTocarZona(zonaDe(indice, cual))}
              {...(deshabilitado || !cuenta ? {} : gestosDeZona(zonaDe(indice, cual)))}
              style={{
                flex: 1, minWidth: 0, minHeight: "58px", padding: "4px 3px",
                display: "flex", flexDirection: "column", gap: "4px",
                borderRadius: "9px",
                cursor: deshabilitado || !cuenta ? "default" : "grab",
                touchAction: "none",
                background: señalada ? `${COLOR_LADO[cual]}1F` : "transparent",
                border: `1px dashed ${señalada ? COLOR_LADO[cual] : "rgba(248,249,250,0.16)"}`,
                opacity: cuenta ? 1 : 0.45,
                transition: "background 180ms ease, border-color 180ms ease, opacity 180ms ease",
              }}
            >
              <span style={{ ...ROTULO_LADO, color: COLOR_LADO[cual] }}>
                {cual === DEBE ? "DEBE" : "HABER"}
              </span>
              <span style={{ flex: 1 }} />
              {/*
                * «Puesta aquí», no «bien puesta»: el marcador es un punto y no una
                * palomita. Con ✓ la ficha decía «correcto» ANTES de corregir, y
                * después de corregir convivía con la ✗ del marco en una cuenta
                * mal puesta: dos veredictos contrarios en la misma cuenta. El
                * único ✓ / ✗ de la mesa es el del marco, el que corrige.
                */}
              {puesta && <Ficha valor={0} lado={cual} texto="●" etiqueta="Puesta aquí" alto={20} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/*
 * El arco dibujado, cuando ya existe. Va por debajo de las dos T, de una
 * columna a la otra, y su color es el del lado del que SALE — teal si nace en
 * un debe, ámbar si nace en un haber— porque es la dirección lo que enseña.
 */
function Arco({ desde, hasta }) {
  if (!arcoValido(desde, hasta)) return null;
  const x1 = ANCLAJE[desde];
  const x2 = ANCLAJE[hasta];
  const color = COLOR_LADO[leerZona(desde).lado];
  const medio = (x1 + x2) / 2;

  return (
    <svg
      data-arco={`${desde}→${hasta}`}
      aria-hidden="true"
      viewBox="0 0 100 20"
      preserveAspectRatio="none"
      style={{ display: "block", width: "100%", height: "22px", overflow: "visible" }}
    >
      <path
        d={`M ${x1} 0 Q ${medio} 20 ${x2} 0`}
        fill="none" stroke={color} strokeWidth="0.6" strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={x2} cy="0" r="1.1" fill={color} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function MesaDelAsiento({
  filas, desde, esperandoNombre = false, estados, deshabilitado = false,
  onNombrar, gestosDeZona, onTocarZona,
}) {
  /*
   * El arco nace SIEMPRE en el debe y muere en el haber, se haya trazado en
   * la dirección que se haya trazado: es el orden en que el libro escribe el
   * asiento, y dibujarlo al revés cuando el estudiante lo trazó al revés
   * enseñaría que hay dos formas de escribirlo.
   */
  const nace = (() => {
    const k = filas.findIndex((f) => f.cuenta && f.lado === DEBE);
    return k >= 0 ? zonaDe(k, DEBE) : null;
  })();
  const muere = (() => {
    const k = filas.findIndex((f) => f.cuenta && f.lado === HABER);
    return k >= 0 ? zonaDe(k, HABER) : null;
  })();

  return (
    <div data-mesa>
      <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
        {filas.map((f, i) => (
          <CuentaEnBlanco
            key={i}
            indice={i}
            cuenta={f.cuenta}
            lado={f.lado}
            esperando={!f.cuenta && esperandoNombre}
            tomada={desde}
            estado={estados?.[i] ?? null}
            deshabilitado={deshabilitado}
            onNombrar={onNombrar}
            gestosDeZona={gestosDeZona}
            onTocarZona={onTocarZona}
          />
        ))}
      </div>
      <Arco desde={nace} hasta={muere} />
    </div>
  );
}
