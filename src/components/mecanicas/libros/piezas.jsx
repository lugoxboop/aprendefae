import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { DEBE, HABER, COLOR_LADO, pesos } from "../../../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS PIEZAS QUE COMPARTEN LAS ACTIVIDADES DE CONTABILIDAD.
 *
 * Una cuenta T se dibuja igual en El Saldo de la Cuenta, en La Mayorización,
 * en El Error Escondido y en la primera pieza de Aprender. Si cada una la
 * dibujara a su manera, el estudiante vería cuatro cuentas distintas para el
 * mismo objeto — y la cuenta T es justamente lo que el capítulo le está
 * pidiendo que reconozca de un vistazo.
 *
 * EL COLOR NO ES DECORACIÓN: teal el debe, ámbar el haber, en toda la materia
 * y sin excepción (COLOR_LADO, en contabilidad.js). Coral no aparece nunca
 * aquí: significa error en todo el sitio, y un saldo al haber no es un error.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * Las cifras se alinean a la derecha y con una sola familia tipográfica de
 * ancho fijo. En una columna de números, que el 1 ocupe menos que el 8 hace
 * que dos cifras del mismo tamaño se vean distintas y haya que leerlas dígito
 * a dígito en vez de compararlas de un golpe.
 */
const CIFRA = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontVariantNumeric: "tabular-nums",
  fontSize: "14px",
  textAlign: "right",
};

const MOVIMIENTO = { ...CIFRA, padding: "3px 0", lineHeight: 1.5, color: FAE.text };

/**
 * Una cuenta T: el nombre arriba, una raya que parte el espacio en dos, y los
 * movimientos de cada lado.
 *
 *   cuenta    { cuenta, debitos[{valor}], creditos[{valor}] }
 *   saldo     null para no enseñarlo (que es lo que pide CU-5 mientras se
 *             responde), o { saldo, lado } para pintarlo del lado que pesó más
 *   resaltar  DEBE, HABER o null: enciende un lado y apaga el otro
 *   marcar    índices a destacar por lado, { debe: [], haber: [] } — lo usa El
 *             Error Escondido para señalar el movimiento que no cuadra
 */
export function CuentaT({ cuenta, saldo = null, resaltar = null, marcar = null, compacta = false }) {
  const atenuado = (lado) => (resaltar && resaltar !== lado ? 0.35 : 1);

  const columna = (lado, movimientos) => (
    <div style={{ flex: 1, minWidth: 0, opacity: atenuado(lado), transition: "opacity 220ms ease" }}>
      <p style={{
        margin: "0 0 6px", fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700,
        letterSpacing: "0.14em", color: COLOR_LADO[lado], textAlign: lado === DEBE ? "left" : "right",
      }}>
        {lado === DEBE ? "DEBE" : "HABER"}
      </p>
      {movimientos.length === 0 ? (
        <p style={{ ...MOVIMIENTO, color: "rgba(248,249,250,0.3)" }}>—</p>
      ) : (
        movimientos.map((m, k) => (
          <p
            key={`${lado}-${k}`}
            style={{
              ...MOVIMIENTO,
              ...(marcar?.[lado === DEBE ? "debe" : "haber"]?.includes(k)
                ? { color: COLOR_LADO[lado], fontWeight: 700 }
                : null),
            }}
          >
            {pesos(m.valor)}
          </p>
        ))
      )}
    </div>
  );

  return (
    <div
      data-cuenta-t={cuenta.cuenta}
      style={{
        padding: compacta ? "11px 13px" : "14px 16px", borderRadius: "14px",
        background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)",
      }}
    >
      <p style={{
        margin: "0 0 9px", fontFamily: "Sora, sans-serif", fontWeight: 700,
        fontSize: compacta ? "13px" : "14px", color: FAE.text, textAlign: "center",
      }}>
        {cuenta.cuenta}
      </p>
      <div style={{ display: "flex", gap: "12px", borderTop: "1px solid rgba(248,249,250,0.22)", paddingTop: "9px" }}>
        {columna(DEBE, cuenta.debitos ?? [])}
        <div aria-hidden="true" style={{ width: "1px", background: "rgba(248,249,250,0.22)" }} />
        {columna(HABER, cuenta.creditos ?? [])}
      </div>
      {saldo && saldo.lado && (
        <div style={{
          display: "flex", justifyContent: saldo.lado === DEBE ? "flex-start" : "flex-end",
          borderTop: "1px solid rgba(248,249,250,0.22)", marginTop: "9px", paddingTop: "8px",
        }}>
          <span style={{ ...CIFRA, fontWeight: 700, color: COLOR_LADO[saldo.lado] }}>
            {pesos(saldo.saldo)}
          </span>
        </div>
      )}
    </div>
  );
}

/*
 * ═══════════ EL CAMPO DE CIFRA ═══════════
 *
 * Un número en pesos, y nada más que eso. Va con `inputMode="numeric"` para
 * que en un celular salga el teclado de números: escribir $1.850 con el
 * teclado de letras es una fricción que no enseña contabilidad.
 *
 * ACEPTA PUNTOS Y ESPACIOS Y LOS IGNORA. Un estudiante que escribe «1.850»
 * está escribiendo bien; rechazárselo sería calificar su forma de separar
 * miles, no su saldo.
 *
 * LA COMA NO. En Colombia la coma es el separador DECIMAL, así que «1,5» es
 * uno coma cinco y no quince. Tratarla como separador de miles convertiría esa
 * respuesta en otra distinta sin avisar, que es peor que no aceptarla: todas
 * las cifras de este capítulo son pesos enteros, así que una coma significa
 * que la respuesta todavía no está lista.
 *
 * Y ACEPTA EL SIGNO MENOS, que parece lo contrario de lo que enseña el
 * capítulo y es justo por eso. El saldo nunca es negativo; un estudiante que
 * escribe −350 se equivocó de una forma concreta y la ficha tiene escrito qué
 * decirle. Si el campo rechazara el signo, ese error no ocurriría nunca y esa
 * explicación no la leería nadie.
 */
export const leerCifra = (texto) => {
  const limpio = String(texto).replace(/[.\s]/g, "").replace(/^[-−]/, "-");
  if (limpio === "" || limpio === "-" || !/^-?\d+$/.test(limpio)) return null;
  return Number(limpio);
};

export function CampoCifra({ valor, onCambio, onEnviar, deshabilitado = false, etiqueta, autoFoco = false, estado = null }) {
  const campo = useRef(null);
  useEffect(() => { if (autoFoco && !deshabilitado) campo.current?.focus(); }, [autoFoco, deshabilitado]);

  /*
   * Corregida, la cifra se ve corregida. Sin esto, el lado se marcaba en verde
   * o en coral y la cifra se quedaba con su borde de siempre: el estudiante
   * leía «el saldo es una resta» y tenía que deducir a cuál de las dos
   * respuestas se refería.
   */
  const borde = estado === "correcta" ? FAE.teal : estado === "incorrecta" ? FAE.coral : "rgba(248,249,250,0.22)";

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (!deshabilitado) onEnviar?.(); }}
      style={{ display: "flex", gap: "8px", alignItems: "stretch" }}
    >
      {/*
        Los bordes van lado por lado y no con la forma corta. Mezclar `border`
        con `borderRight` hace que React avise —y con razón—: al redibujar, el
        orden en que se aplican las dos no está garantizado y el borde puede
        quedarse del color viejo.
      */}
      <span aria-hidden="true" style={{
        display: "flex", alignItems: "center", paddingLeft: "13px", paddingRight: "2px",
        ...CIFRA, fontSize: "15px", color: "rgba(248,249,250,0.55)",
        background: "rgba(14,27,46,0.7)",
        borderTop: `1px solid ${borde}`, borderBottom: `1px solid ${borde}`,
        borderLeft: `1px solid ${borde}`, borderRight: "none",
        borderRadius: "12px 0 0 12px",
      }}>
        $
      </span>
      <input
        ref={campo}
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        disabled={deshabilitado}
        inputMode="numeric"
        autoComplete="off"
        aria-label={etiqueta}
        placeholder="0"
        style={{
          flex: 1, minWidth: 0, boxSizing: "border-box", padding: "12px 14px 12px 4px",
          background: "rgba(14,27,46,0.7)",
          borderTop: `1px solid ${borde}`, borderBottom: `1px solid ${borde}`,
          borderRight: `1px solid ${borde}`, borderLeft: "none",
          borderRadius: "0 12px 12px 0",
          color: FAE.text, ...CIFRA, fontSize: "15px", textAlign: "left",
        }}
      />
    </form>
  );
}

/**
 * Un asiento escrito en renglones: el lado, la cuenta y su cifra.
 *
 * Lo usan ¿Cuadra o No Cuadra? para enseñar el asiento que hay que juzgar y El
 * Asiento Compuesto para enseñar el correcto al corregir. Es el mismo objeto y
 * se dibuja igual: si cada una lo pintara a su manera, el estudiante tendría
 * que volver a aprender a leerlo al cambiar de actividad.
 *
 *   lineas  [{ cuenta, lado, valor }]
 *   totales true añade la fila de sumas, que es justo lo que CU-8 pregunta
 */
export function AsientoEnLineas({ lineas, rotulo = null, acento = FAE.teal, totales = false }) {
  const suma = (lado) => lineas.filter((l) => l.lado === lado).reduce((s, l) => s + l.valor, 0);

  return (
    <div
      data-asiento
      style={{
        padding: "12px 14px", borderRadius: "13px",
        background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)",
      }}
    >
      {rotulo && (
        <p style={{
          margin: "0 0 9px", fontFamily: "Sora, sans-serif", fontSize: "10.5px",
          fontWeight: 700, letterSpacing: "0.16em", color: acento,
        }}>
          {rotulo}
        </p>
      )}
      {lineas.map((l, k) => (
        <div key={`${l.cuenta}-${l.lado}-${k}`} style={{ display: "flex", gap: "8px", alignItems: "baseline", padding: "3px 0" }}>
          <span style={{
            flexShrink: 0, width: "50px", fontFamily: "Sora, sans-serif", fontSize: "10px",
            fontWeight: 700, letterSpacing: "0.08em", color: COLOR_LADO[l.lado],
          }}>
            {l.lado === DEBE ? "DEBE" : "HABER"}
          </span>
          <span style={{ flex: 1, minWidth: 0, fontSize: "13px", lineHeight: 1.35, color: FAE.text }}>{l.cuenta}</span>
          <span style={{ ...CIFRA, flexShrink: 0 }}>{pesos(l.valor)}</span>
        </div>
      ))}
      {totales && (
        <div style={{
          display: "flex", justifyContent: "space-between", gap: "10px",
          borderTop: "1px solid rgba(248,249,250,0.22)", marginTop: "8px", paddingTop: "8px",
        }}>
          <span style={{ ...CIFRA, fontWeight: 700, color: COLOR_LADO[DEBE] }}>{pesos(suma(DEBE))}</span>
          <span style={{ ...CIFRA, fontWeight: 700, color: COLOR_LADO[HABER] }}>{pesos(suma(HABER))}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Los dos lados como par de opciones. Sale tantas veces en este tema que
 * escribirlo en cada actividad sería copiar el mismo gesto cinco veces.
 */
export function ElegirLado({ elegido, correcto = null, onElegir, deshabilitado = false, nombres = null }) {
  const texto = nombres ?? { [DEBE]: "Debe", [HABER]: "Haber" };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
      {[DEBE, HABER].map((lado) => {
        const elegidoEste = elegido === lado;
        const revelado = correcto !== null;
        let borde = "rgba(248,249,250,0.22)";
        let fondo = "rgba(14,27,46,0.5)";
        if (revelado && lado === correcto) { borde = FAE.teal; fondo = "rgba(42,157,143,0.14)"; }
        else if (revelado && elegidoEste) { borde = FAE.coral; fondo = "rgba(231,111,81,0.14)"; }
        else if (elegidoEste) { borde = COLOR_LADO[lado]; }
        return (
          <button
            key={lado}
            type="button"
            disabled={deshabilitado}
            onClick={() => onElegir(lado)}
            style={{
              padding: "13px 10px", borderRadius: "12px", cursor: deshabilitado ? "default" : "pointer",
              background: fondo, border: `1px solid ${borde}`, color: FAE.text,
              fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600,
            }}
          >
            {texto[lado]}
          </button>
        );
      })}
    </div>
  );
}

/**
 * El botón de enviar una respuesta. Mismo gesto que `Avanzar`, pero se apaga
 * mientras la respuesta está incompleta en vez de desaparecer: un botón que
 * aparece de golpe mueve el resto de la pantalla mientras se escribe.
 */
export function Responder({ children, onClick, deshabilitado = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={deshabilitado}
      style={{
        marginTop: "14px", width: "100%", padding: "13px 18px", borderRadius: "999px",
        cursor: deshabilitado ? "default" : "pointer",
        background: deshabilitado ? "rgba(248,249,250,0.07)" : FAE.teal,
        border: "none", color: deshabilitado ? "rgba(248,249,250,0.35)" : "#06202A",
        fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700,
      }}
    >
      {children}
    </button>
  );
}

/** El estado compartido de «una tanda de ítems sorteados», que repiten todas. */
export function useTanda(sortear) {
  const [items, setItems] = useState(sortear);
  const [i, setI] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);
  const detalle = useRef([]);
  const inicio = useRef(Date.now());

  const reiniciar = () => {
    setItems(sortear());
    setI(0); setAciertos(0); setTerminado(false);
    detalle.current = [];
    inicio.current = Date.now();
  };

  const anotar = (item, ok, respuesta = null) => {
    detalle.current.push({ item, ok, intentos: 1, respuesta: ok ? null : respuesta, orden: detalle.current.length + 1 });
  };

  return { items, i, setI, aciertos, setAciertos, terminado, setTerminado, detalle, inicio, reiniciar, anotar };
}
