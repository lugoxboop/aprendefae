import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { DEBE, HABER, COLOR_LADO, pesos } from "../../../data/contabilidad.js";
import { TEXTO_ATENUADO } from "../../../data/contabilidadIntro.js";
import { MarcaVeredicto } from "./marcaVeredicto.jsx";
import { Volumen, FAMILIAS } from "../../../estilo/volumen.jsx";

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
        /*
         * 12 px, por lo mismo que en AsientoEnLineas: esto NO es una cejilla,
         * es la cabecera de la columna, y tapándola se pierde cuál es cuál.
         * Y además el lado se dice aquí dos veces —con la palabra y con el
         * color—, así que a 10,5 la palabra deja de leerse y queda el color
         * solo, que es justo lo que no puede pasar (kit.md).
         *
         * Se me había escapado: arreglé las líneas del asiento y dejé las
         * columnas de la cuenta T, que dicen exactamente lo mismo.
         */
        margin: "0 0 6px", fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700,
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
   *
   * Pero el borde teal o coral, solo, no dice nada en blanco y negro: miden lo
   * mismo (1,07:1). Por eso la corrección lleva además su marca —✓ o ✗— al
   * final del campo. Aquí el color SÍ puede ser teal y coral (una cifra no es
   * un lado del asiento), y la forma es lo que sobrevive sin color.
   */
  const borde = estado === "correcta" ? FAE.text : estado === "incorrecta" ? FAE.coral : "rgba(248,249,250,0.22)";

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
      {estado === "correcta" && (
        <span style={{ display: "flex", alignItems: "center" }}>
          <MarcaVeredicto bien color={FAE.text} etiqueta="Cifra correcta" />
        </span>
      )}
      {estado === "incorrecta" && (
        <span style={{ display: "flex", alignItems: "center" }}>
          <MarcaVeredicto bien={false} color={FAE.coral} etiqueta="Cifra incorrecta" />
        </span>
      )}
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
          {/*
            12 px, no 10. La Célula C midió las 44 piezas de T7 a 320 px y
            encontró este rótulo entre los textos por debajo de 12. Importa
            más de lo que parece: el lado de la línea se dice con la PALABRA
            y con el color, y a 10 px la palabra deja de leerse — entonces el
            único aviso que queda es el color, que es justo lo que no puede
            pasar (ver la revisión de daltonismo en kit.md).

            Y `minWidth` en vez de `width`: a 12 px «HABER» mide 47,5 de los
            50 que había fijos. Intenté comprobar que también cupiera si Sora
            no carga y la medición me dio el MISMO número en cuatro
            tipografías distintas — o sea, que la sustitución no ocurría y la
            comprobación no comprobaba nada. En vez de apostar a una medida
            que no pude validar, el ancho deja de ser un techo: si alguna vez
            no cabe, empuja en lugar de recortar, y el nombre de la cuenta de
            al lado ya sabe encogerse (`flex: 1, minWidth: 0`).
          */}
          <span style={{
            flexShrink: 0, minWidth: "50px", fontFamily: "Sora, sans-serif", fontSize: "12px",
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
/*
 * ═══════════ EL VEREDICTO SE DICE CON FORMA, NO SOLO CON EL BORDE ═══════════
 *
 * Corregido, el lado bueno lleva ✓ y el lado que el estudiante eligió mal lleva
 * ✗. Antes el veredicto iba solo en el matiz del borde —teal el bueno, coral el
 * malo— y esos dos tonos miden lo mismo en gris (1,07:1): quien no los
 * distingue veía DOS botones iguales y no sabía cuál era la respuesta.
 *
 * Y el lado bueno ya no se pinta de teal para decir «bien». Teal es el debe:
 * un haber correcto salía con el color del debe, justo cuando se le decía al
 * estudiante que había acertado. El acierto conserva el tono de SU lado, el
 * borde se engrosa (sin mover el botón: es una sombra interior) y la palomita
 * es la señal. El error sí conserva el coral, que no significa ningún lado.
 */
export function ElegirLado({ elegido, correcto = null, onElegir, deshabilitado = false, nombres = null }) {
  const texto = nombres ?? { [DEBE]: "Debe", [HABER]: "Haber" };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
      {[DEBE, HABER].map((lado) => {
        const elegidoEste = elegido === lado;
        const revelado = correcto !== null;
        const esBueno = revelado && lado === correcto;
        const esMalo = revelado && !esBueno && elegidoEste;
        let borde = "rgba(248,249,250,0.22)";
        let fondo = "rgba(14,27,46,0.5)";
        if (esBueno) { borde = COLOR_LADO[lado]; fondo = `${COLOR_LADO[lado]}24`; }
        else if (esMalo) { borde = FAE.coral; fondo = "rgba(231,111,81,0.14)"; }
        else if (elegidoEste) { borde = COLOR_LADO[lado]; }
        return (
          <button
            key={lado}
            type="button"
            disabled={deshabilitado}
            onClick={() => onElegir(lado)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              padding: "13px 10px", borderRadius: "12px", cursor: deshabilitado ? "default" : "pointer",
              background: fondo, border: `1px solid ${borde}`, color: FAE.text,
              boxShadow: esBueno || esMalo ? `inset 0 0 0 1px ${borde}` : "none",
              fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600,
            }}
          >
            {esBueno && <MarcaVeredicto bien color={COLOR_LADO[lado]} etiqueta="Lado correcto" />}
            {esMalo && <MarcaVeredicto bien={false} color={FAE.coral} etiqueta="Tu respuesta, incorrecta" />}
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
/*
 * Apagado, el texto va en #A8B6C8 sólido (el texto atenuado de Contabilidad);
 * lo tenue lo pone el fondo. Antes iba al 35 % y medía 2,6:1. `colorApagado`
 * queda para quien necesite otro.
 */
/*
 * VOLUMEN (#560): cara teal sobre canto #1D6B61 de 4 px, y se hunde al
 * pulsar. El texto sigue en #06202A, oscuro (Erwin): el blanco sobre teal no
 * llega a 4,5:1. Deshabilitado no se hunde y el canto no se pinta, pero el
 * alto se reserva igual, para que habilitarlo no mueva nada.
 */
export function Responder({ children, onClick, deshabilitado = false, colorApagado = TEXTO_ATENUADO }) {
  return (
    <Volumen canto={deshabilitado ? "transparent" : FAMILIAS.teal.canto} quieto={deshabilitado} estilo={{ marginTop: "14px" }}>
      <button
        type="button"
        onClick={onClick}
        disabled={deshabilitado}
        style={{
          width: "100%", padding: "13px 18px", borderRadius: "999px",
          cursor: deshabilitado ? "default" : "pointer",
          background: deshabilitado ? "rgba(248,249,250,0.07)" : FAE.teal,
          border: "none", color: deshabilitado ? colorApagado : "#06202A",
          fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700,
        }}
      >
        {children}
      </button>
    </Volumen>
  );
}

/*
 * ═══════════ RELOJES QUE SE PUEDEN CONGELAR ═══════════
 *
 * `despues(ms, fn)` es un setTimeout con memoria: mientras `pausado` es
 * verdadero, cada reloj pendiente se detiene y guarda lo que le faltaba, y al
 * soltarlo sigue desde ahí — no vuelve a empezar ni se salta nada. Lo pide
 * «Así se juega»: «Pausar» congela también lo que el componente tenía en
 * marcha, como la cascada de puntos que se apagan en T1-8. Fuera de la demo
 * `pausado` es siempre falso y esto es un setTimeout y nada más.
 */
export function useRelojes(pausado = false) {
  const pendientes = useRef([]);
  const congelado = useRef(pausado);

  const arrancar = (p) => {
    p.fin = Date.now() + p.resta;
    p.id = setTimeout(() => {
      pendientes.current = pendientes.current.filter((x) => x !== p);
      p.fn();
    }, p.resta);
  };
  const despues = (ms, fn) => {
    const p = { fn, resta: ms, id: null, fin: 0 };
    pendientes.current.push(p);
    if (!congelado.current) arrancar(p);
  };
  const limpiar = () => {
    pendientes.current.forEach((p) => clearTimeout(p.id));
    pendientes.current = [];
  };

  useEffect(() => {
    congelado.current = pausado;
    for (const p of pendientes.current) {
      if (pausado && p.id != null) {
        clearTimeout(p.id);
        p.id = null;
        p.resta = Math.max(0, p.fin - Date.now());
      } else if (!pausado && p.id == null) {
        arrancar(p);
      }
    }
  }, [pausado]);
  useEffect(() => () => limpiar(), []);

  return { despues, limpiar };
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
