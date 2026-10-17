import { useState } from "react";
import { FAE } from "../../../theme.js";
import {
  DEBE, HABER, COLOR_LADO, NOMBRE_TIPO, REALES, TRANSITORIAS, pesos,
  LAVADO_DE_AUTOS,
} from "../../../data/contabilidad.js";
import { CAJA_DEL_CAPITULO } from "../../../data/contabilidadActividades.js";
import { CAPA4_POR_PIEZA } from "./cuentas/decideCuentas.jsx";
import { EscenaFamilias } from "./familiasEnCajones.jsx";
import { inclinacionDe } from "../../../contabilidad/balanza.js";
import {
  CuentaDeValor, Balanza, Ficha, EstilosDeVerbos, useArrastre, FichaEnVuelo,
} from "./verbos.jsx";
import MesaDeDosCasos from "./debeHaber/MesaDeDosCasos.jsx";
import ExploraUnaCuenta from "./debeHaber/ExploraUnaCuenta.jsx";
import EnUnaFrase from "./debeHaber/EnUnaFrase.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS ESCENAS DE LAS CUATRO PIEZAS DE APRENDER.
 *
 * La capa 2 de cada pieza —«mírelo funcionar»— y su capa 3 —la exploración
 * libre—. Las dos usan LOS MISMOS TRES VERBOS que las doce actividades, y esa
 * es toda la idea: lo que el estudiante ve aquí explicado es literalmente lo
 * mismo que va a manipular después. Si la cancelación de la pieza 1 se
 * dibujara distinto que la de El Saldo de la Cuenta, tendría que aprenderla
 * dos veces.
 *
 * Cada escena recibe `resaltar`, que es el `paso.resaltar` de su pieza, y
 * decide qué enseñar. El texto de cada paso vive en el contenido, no aquí.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ROTULO = {
  margin: "0 0 8px", fontFamily: "Sora, sans-serif", fontSize: "10px",
  fontWeight: 700, letterSpacing: "0.14em", color: "#A8B6C8",
};

const CIFRA = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontVariantNumeric: "tabular-nums",
};

/* ═══════════════ 1 · DE QUÉ ESTÁ HECHA UNA CUENTA ═══════════════ */

/*
 * La cuenta SE CONSTRUYE delante del estudiante en vez de aparecer hecha y
 * resaltarse por partes:
 *
 *   encabezado  la T no estaba y ahora está: nombre y raya, nada dentro
 *   debe        cae una ficha a la izquierda — el lado se nombra PORQUE algo
 *               cayó ahí, no antes
 *   haber       cae otra a la derecha
 *   saldo       entran las tres cifras reales de la Caja del capítulo y la de
 *               150 consume su porción de la izquierda. Es la MISMA animación
 *               que El Saldo de la Cuenta: aquí se ve explicada y allí se usa.
 */
const EJEMPLO = { debe: 1000, otroDebe: 500, haber: 150 };

export function EscenaAnatomia({ resaltar }) {
  const debitos = resaltar === "saldo"
    ? CAJA_DEL_CAPITULO.debitos
    : (resaltar === "debe" || resaltar === "haber" ? [{ valor: EJEMPLO.debe }] : []);
  const creditos = resaltar === "saldo"
    ? CAJA_DEL_CAPITULO.creditos
    : (resaltar === "haber" ? [{ valor: EJEMPLO.haber }] : []);

  return (
    <div>
      <EstilosDeVerbos />
      <CuentaDeValor
        cuenta="Caja"
        debitos={debitos}
        creditos={creditos}
        cancelar={resaltar === "saldo"}
        resaltar={resaltar === "debe" ? DEBE : resaltar === "haber" ? HABER : null}
        recien={resaltar === "debe" ? EJEMPLO.debe : resaltar === "haber" ? EJEMPLO.haber : null}
        alto={112}
      />
      {resaltar === "saldo" && (
        <p style={{ margin: "10px 0 0", fontSize: "12.5px", color: "rgba(248,249,250,0.6)", textAlign: "center" }}>
          Los {pesos(EJEMPLO.haber)} de la derecha consumen su parte de la izquierda. Lo que queda en pie es el saldo.
        </p>
      )}
    </div>
  );
}

/** Capa 3: una cuenta vacía donde soltar fichas y ver moverse el saldo. */
export function ExploraCuenta() {
  const [debitos, setDebitos] = useState([]);
  const [creditos, setCreditos] = useState([]);
  const [ultima, setUltima] = useState(null);
  const valores = [100, 250, 500];

  const arrastre = useArrastre({
    onSoltar: (valor, destino) => {
      if (destino === DEBE) setDebitos((xs) => [...xs, { valor }]);
      else if (destino === HABER) setCreditos((xs) => [...xs, { valor }]);
      setUltima(valor);
    },
  });

  return (
    <div>
      <EstilosDeVerbos />
      <CuentaDeValor
        cuenta="Una cuenta cualquiera"
        debitos={debitos}
        creditos={creditos}
        cancelar
        destinos
        tomada={arrastre.tomada}
        onSoltar={arrastre.soltarEn}
        recien={ultima}
        alto={110}
      />
      <p style={{ ...ROTULO, marginTop: "12px" }}>SUELTE FICHAS Y MIRE EL SALDO</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
        {valores.map((v) => (
          <Ficha
            key={v}
            valor={v}
            lado={DEBE}
            tomada={arrastre.tomada === v}
            onClick={() => arrastre.tocar(v)}
            gestos={arrastre.gestos(v)}
            etiqueta={`Tomar ${pesos(v)}`}
          />
        ))}
      </div>
      {(debitos.length > 0 || creditos.length > 0) && (
        <button
          type="button"
          onClick={() => { setDebitos([]); setCreditos([]); setUltima(null); arrastre.limpiar(); }}
          style={{
            marginTop: "10px", width: "100%", padding: "8px", borderRadius: "999px", cursor: "pointer",
            background: "transparent", border: "1px solid rgba(248,249,250,0.22)",
            color: "rgba(248,249,250,0.7)", fontFamily: "Sora, sans-serif", fontSize: "12.5px",
          }}
        >
          Vaciar la cuenta
        </button>
      )}
      <FichaEnVuelo valor={arrastre.tomada ?? 0} lado={DEBE} puntero={arrastre.puntero} />
    </div>
  );
}

/* ═══════════════ 2 · LAS DOS FAMILIAS ═══════════════ */

/*
 * Los dos cajones viven en `familiasEnCajones.jsx`, no aquí: la capa 4 de
 * esta pieza también los pinta, y la capa 4 se arma en `decideCuentas.jsx`,
 * que es lo que este archivo importa arriba. Con la escena dentro, los dos
 * archivos se habrían importado en círculo. Se reexporta para que nadie que
 * ya la usaba tenga que buscarla.
 */
export { EscenaFamilias };

/** Capa 3: cerrar el año a voluntad y verlo otra vez. */
export function ExploraCierre() {
  const [cerrado, setCerrado] = useState(false);
  return (
    <div>
      {/* «ambas» no es un paso del contenido: es la mesa repartida sin nadie
          señalado, que es como la exploración debe empezar. */}
      <EscenaFamilias resaltar={cerrado ? "cierre" : "ambas"} />
      <button
        type="button"
        onClick={() => setCerrado((c) => !c)}
        style={{
          marginTop: "12px", width: "100%", padding: "10px", borderRadius: "999px", cursor: "pointer",
          background: cerrado ? "transparent" : FAE.teal,
          border: cerrado ? "1px solid rgba(248,249,250,0.22)" : "none",
          color: cerrado ? "rgba(248,249,250,0.7)" : "#06202A",
          fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 700,
        }}
      >
        {cerrado ? "Abrir el año nuevo" : "Cerrar el año"}
      </button>
    </div>
  );
}

/* ═══════════════ 3 · LA PARTIDA DOBLE ═══════════════ */

/*
 * La balanza de la ecuación. Los cuatro primeros pasos la mueven; el quinto
 * apila cada familia sobre su platillo, y ahí la regla de seis filas se
 * convierte en «de qué platillo cuelga cada familia», que es una sola cosa
 * que recordar en vez de seis.
 */
const IZQUIERDA = [NOMBRE_TIPO.activo, NOMBRE_TIPO.gasto, NOMBRE_TIPO.costo];
const DERECHA = [NOMBRE_TIPO.pasivo, NOMBRE_TIPO.patrimonio, NOMBRE_TIPO.ingreso];

/*
 * ═══════════ LOS PLATILLOS LLEVAN PESO, NO SOLO RÓTULO ═══════════
 *
 * El paso 1 dice «nivelada» y el paso 3 dice «vuelve a nivelarse»: si los dos
 * dibujaran una balanza recta y vacía, serían la misma pantalla y el tercer
 * paso no enseñaría nada. Lo que los distingue es EL PESO — cero contra cero
 * no es lo mismo que cinco mil contra cinco mil—, así que los platillos
 * cargan la cifra y la inclinación SE CALCULA de lo que cargan, en vez de
 * venir escrita paso por paso.
 *
 * La cifra es la de la primera transacción del capítulo, que además es
 * exactamente esta historia: entra un activo y algo lo compensa.
 */
const APORTE = LAVADO_DE_AUTOS.transacciones[0].asiento.debe[0][1];

const CARGA = {
  nivelada: { debe: 0, haber: 0 },
  inclinada: { debe: APORTE, haber: 0 },
  compensada: { debe: APORTE, haber: APORTE },
  dinamicas: { debe: APORTE, haber: APORTE },
  "dos-grupos": { debe: APORTE, haber: APORTE },
};

export function EscenaPartidaDoble({ resaltar }) {
  const carga = CARGA[resaltar] ?? CARGA.nivelada;
  const inclinacion = inclinacionDe(carga.debe, carga.haber);
  const conFamilias = resaltar === "dos-grupos";

  const platillo = (rotulo, monto, lado) => (
    <span style={{ display: "block", lineHeight: 1.35 }}>
      <span style={{ display: "block", fontFamily: "Sora, sans-serif", fontSize: "9.5px", letterSpacing: "0.08em", opacity: 0.75 }}>
        {rotulo}
      </span>
      <span data-peso={lado} style={{ display: "block", fontSize: "12px" }}>{pesos(monto)}</span>
    </span>
  );

  const pila = (familias, lado) => (
    <span style={{ display: "block", lineHeight: 1.4 }}>
      {familias.map((f) => (
        /* 12 px: son las líneas del estado, que el estudiante lee. */
        <span key={f} className="fae-cae" style={{ display: "block", fontSize: "12px", color: COLOR_LADO[lado] }}>
          {f}
        </span>
      ))}
    </span>
  );

  return (
    <div>
      <EstilosDeVerbos />
      <Balanza
        inclinacion={inclinacion}
        izquierda={conFamilias ? pila(IZQUIERDA, DEBE) : platillo("ACTIVOS", carga.debe, DEBE)}
        derecha={conFamilias ? pila(DERECHA, HABER) : platillo("PASIVO + PATRIMONIO", carga.haber, HABER)}
        etiqueta={inclinacion === 0 ? "La ecuación está en equilibrio" : "La ecuación se desequilibró"}
      />
      {resaltar === "dinamicas" && (
        <div style={{ marginTop: "10px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {[[DEBE, "Un débito"], [HABER, "Un crédito"]].map(([lado, titulo]) => (
            <div key={lado} style={{
              padding: "9px 10px", borderRadius: "11px",
              background: "rgba(10,20,34,0.45)", border: `1px solid ${COLOR_LADO[lado]}55`,
            }}>
              <p style={{ ...ROTULO, color: COLOR_LADO[lado], marginBottom: "5px" }}>{titulo.toUpperCase()}</p>
              <p style={{ margin: 0, fontSize: "11.5px", lineHeight: 1.45, color: FAE.text }}>
                En un activo, <strong>suma</strong>. En un pasivo, <strong>resta</strong>.
              </p>
            </div>
          ))}
        </div>
      )}
      {conFamilias && (
        <p style={{ margin: "10px 0 0", fontSize: "12.5px", color: "rgba(248,249,250,0.6)", textAlign: "center" }}>
          Dos grupos, no seis filas: uno cuelga de la izquierda y el otro de la derecha.
        </p>
      )}
    </div>
  );
}

/** Capa 3: cargar los dos platillos y ver la balanza buscar su sitio. */
export function ExploraBalanza() {
  const [debe, setDebe] = useState(0);
  const [haber, setHaber] = useState(0);
  const inclinacion = inclinacionDe(debe, haber);

  const boton = (texto, onClick, lado) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1, padding: "9px 6px", borderRadius: "10px", cursor: "pointer",
        background: `${COLOR_LADO[lado]}1A`, border: `1px solid ${COLOR_LADO[lado]}`,
        color: COLOR_LADO[lado], fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700,
      }}
    >
      {texto}
    </button>
  );

  return (
    <div>
      <Balanza
        inclinacion={inclinacion}
        izquierda={pesos(debe)}
        derecha={pesos(haber)}
        etiqueta={inclinacion === 0 && debe > 0 ? "Nivelada" : "Inclinada"}
      />
      <p style={{ ...ROTULO, marginTop: "10px" }}>CARGUE LOS PLATILLOS</p>
      <div style={{ display: "flex", gap: "8px" }}>
        {boton("+500 al debe", () => setDebe((d) => d + 500), DEBE)}
        {boton("+500 al haber", () => setHaber((h) => h + 500), HABER)}
      </div>
      {(debe > 0 || haber > 0) && (
        <button
          type="button"
          onClick={() => { setDebe(0); setHaber(0); }}
          style={{
            marginTop: "9px", width: "100%", padding: "8px", borderRadius: "999px", cursor: "pointer",
            background: "transparent", border: "1px solid rgba(248,249,250,0.22)",
            color: "rgba(248,249,250,0.7)", fontFamily: "Sora, sans-serif", fontSize: "12.5px",
          }}
        >
          Vaciar los dos
        </button>
      )}
    </div>
  );
}

/* ═══════════════ 4 · DEL DIARIO AL MAYOR ═══════════════ */

/*
 * ═══════════ EL DIARIO NO SE VACÍA NUNCA ═══════════
 *
 * El capítulo lo prohíbe explícitamente: no se altera, no se corrige, no se
 * borra ni se tacha un asiento ya registrado. Así que el dato no se va del
 * diario: SE REPLICA. El renglón se queda entero y legible y recibe su marca
 * de mayorizado al costado, que es la columna de referencia de la contabilidad
 * de verdad.
 *
 * Lo que enseña: el mismo hecho vive en dos libros, ordenado de dos formas, y
 * ninguno reemplaza al otro. Vaciar el diario enseñaría exactamente lo
 * contrario, y la capa 1 de esta misma pieza ya dice que son «los mismos datos,
 * dos ordenamientos».
 */
const DEL_DIARIO = LAVADO_DE_AUTOS.transacciones[0];

export function EscenaDiarioMayor({ resaltar }) {
  const conAsiento = resaltar !== "hoja-vacia";
  const mayorizado = resaltar === "mayorizar" || resaltar === "dos-vistas";

  const lineas = [
    ...DEL_DIARIO.asiento.debe.map(([cuenta, valor]) => ({ cuenta, valor, lado: DEBE })),
    ...DEL_DIARIO.asiento.haber.map(([cuenta, valor]) => ({ cuenta, valor, lado: HABER })),
  ];

  return (
    <div>
      <EstilosDeVerbos />
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* El diario. Entero y legible SIEMPRE, con o sin marca. */}
        <div data-diario style={{
          padding: "11px 12px", borderRadius: "12px",
          background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.14)",
        }}>
          <p style={ROTULO}>LIBRO DIARIO</p>
          {!conAsiento
            ? <p style={{ margin: 0, fontSize: "12px", color: "#A8B6C8" }}>— hoja en blanco —</p>
            : lineas.map((l, k) => (
              <div key={`${l.cuenta}-${l.lado}`} className="fae-cae" style={{
                display: "flex", gap: "8px", alignItems: "baseline", padding: "2px 0",
                marginLeft: l.lado === HABER ? "16px" : 0,
              }}>
                <span style={{ flex: 1, minWidth: 0, fontSize: "12px", color: FAE.text }}>{l.cuenta}</span>
                <span style={{ ...CIFRA, fontSize: "12px", color: COLOR_LADO[l.lado] }}>{pesos(l.valor)}</span>
                {/* La marca de referencia: el renglón ya pasó al mayor y sigue aquí. */}
                <span data-marca={mayorizado ? "si" : "no"} style={{
                  width: "16px", textAlign: "center", fontSize: "11px",
                  color: mayorizado ? FAE.teal : "rgba(248,249,250,0.2)",
                }}>
                  {mayorizado ? "✓" : "·"}
                </span>
              </div>
            ))}
          {conAsiento && (
            <p style={{ margin: "6px 0 0", fontSize: "10.5px", color: "#A8B6C8" }}>
              {mayorizado ? "✓ = mayorizado. El renglón se queda: nada se borra." : "La acreditada va corrida a la derecha."}
            </p>
          )}
        </div>

        {mayorizado && (
          <>
            <div aria-hidden="true" style={{ textAlign: "center", color: FAE.teal, fontSize: "15px", lineHeight: 1 }}>↓</div>
            <div className="fae-cae">
              <CuentaDeValor
                cuenta={lineas[0].cuenta}
                debitos={lineas.filter((l) => l.lado === DEBE).map((l) => ({ valor: l.valor }))}
                creditos={[]}
                alto={78}
              />
            </div>
            {resaltar === "dos-vistas" && (
              <p style={{ margin: 0, fontSize: "12.5px", color: "rgba(248,249,250,0.6)", textAlign: "center" }}>
                El mismo hecho en dos libros. El diario ordena por fecha; el mayor, por cuenta.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** Capa 3: mayorizar los renglones uno a uno y ver que el diario sigue entero. */
export function ExploraMayorizar() {
  const [hechos, setHechos] = useState(0);
  const pasos = ["hoja-vacia", "asiento", "mayorizar", "dos-vistas"];
  return (
    <div>
      <EscenaDiarioMayor resaltar={pasos[hechos]} />
      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        <button
          type="button"
          disabled={hechos === 0}
          onClick={() => setHechos((h) => Math.max(0, h - 1))}
          style={{
            flex: 1, padding: "9px", borderRadius: "999px", cursor: hechos === 0 ? "default" : "pointer",
            background: "transparent", border: "1px solid rgba(248,249,250,0.22)",
            color: hechos === 0 ? "rgba(248,249,250,0.3)" : "rgba(248,249,250,0.75)",
            fontFamily: "Sora, sans-serif", fontSize: "12.5px",
          }}
        >
          Atrás
        </button>
        <button
          type="button"
          disabled={hechos === pasos.length - 1}
          onClick={() => setHechos((h) => Math.min(pasos.length - 1, h + 1))}
          style={{
            flex: 1, padding: "9px", borderRadius: "999px",
            cursor: hechos === pasos.length - 1 ? "default" : "pointer",
            background: hechos === pasos.length - 1 ? "rgba(248,249,250,0.07)" : FAE.teal,
            border: "none",
            color: hechos === pasos.length - 1 ? "rgba(248,249,250,0.35)" : "#06202A",
            fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 700,
          }}
        >
          Adelante
        </button>
      </div>
    </div>
  );
}

/*
 * Cada pieza, emparejada con lo que dibuja.
 *
 * Cuatro traen `Escena` —una función de `resaltar`, que es el paso a paso del
 * marco compartido— y una trae `Capa2` y `Capa4` propias: «El debe y el
 * haber» necesita cinco segmentos que se detienen y un selector con
 * devolución, y eso no cabe en el paso a paso sin desfigurarlo para las otras.
 */
export const ESCENAS = {
  /*
   * Las cuatro piezas del paso a paso ya deciden en su capa 4; «El debe y el
   * haber» trae la suya propia porque su capa 2 también es propia. Quien no
   * tenga entrada en CAPA4_POR_PIEZA conserva la capa 4 de siempre, con su
   * pregunta abierta y su respuesta de referencia.
   */
  "cu-a1-anatomia-de-una-cuenta": { Escena: EscenaAnatomia, Exploracion: ExploraCuenta, Capa4: CAPA4_POR_PIEZA["cu-a1-anatomia-de-una-cuenta"] },
  "cu-a2-dos-familias": { Escena: EscenaFamilias, Exploracion: ExploraCierre, Capa4: CAPA4_POR_PIEZA["cu-a2-dos-familias"] },
  "cu-a5-debe-y-haber": { Capa2: MesaDeDosCasos, Exploracion: ExploraUnaCuenta, Capa4: EnUnaFrase },
  "cu-a3-partida-doble": { Escena: EscenaPartidaDoble, Exploracion: ExploraBalanza, Capa4: CAPA4_POR_PIEZA["cu-a3-partida-doble"] },
  "cu-a4-diario-y-mayor": { Escena: EscenaDiarioMayor, Exploracion: ExploraMayorizar, Capa4: CAPA4_POR_PIEZA["cu-a4-diario-y-mayor"] },
};

/* Para que nadie use REALES y TRANSITORIAS sin que el contenido lo sepa. */
export const FAMILIAS_DEL_CAJON = { reales: REALES, transitorias: TRANSITORIAS };
