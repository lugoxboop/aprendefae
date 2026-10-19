import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import { porcentaje } from "../../../data/politicaFiscal.js";
import { Opcion, Opciones, Retro, Pulsos, Cierre, Enunciado } from "../corazon/juego.jsx";
import { Avanzar, TEXTO_CIERRE, MarcoMaquinas, RotuloEscenario } from "../bloques/marcos.jsx";
import {
  CLASIFICACION, CONSECUENCIA, ROTULO_TIPO, EJE_TASA, encajeExigido,
  TASA, CASOS_TASA, REPO, CASOS_REPO, ENCAJE, CASOS_ENCAJE,
} from "../../../data/pmInstrumentos.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * POLÍTICA MONETARIA · UN JUEGO POR INSTRUMENTO (Célula A).
 *
 *   LaTasaQueMuerde     tasa de intervención · la ficha se pone en el eje
 *   RepoODefinitiva     OMA con TES          · la mesa mueve títulos y plata
 *   ElFrenoDelEncaje    encaje bancario      · la línea se pone en el tanque
 *
 * Las tres corren sobre el mismo motor —`DosDecisiones`— y se distinguen por
 * su figura. El motor no sabe nada de monetaria: recibe casos con decisiones y
 * una figura que pintar.
 *
 * ═══════════ POR QUÉ LA FIGURA NO EMPIEZA RESUELTA ═══════════
 *
 * La primera decisión de cada caso es una clasificación, y si la figura
 * llegara ya colocada —la ficha de la tasa en su cifra, la línea del encaje en
 * su altura— respondería ella sola la pregunta. Así que llega con la pieza
 * SIN PONER: lo que hace el estudiante al elegir es colocarla, y cada opción
 * la deja en una altura o una posición distinta de las otras dos. Cuando se
 * equivoca, la pieza se queda donde él la puso, marcada, y al lado aparece
 * dónde iba de verdad: la figura nunca guarda un estado falso (D3 de la
 * Célula D) ni enseña la respuesta antes de tiempo (PH8-2).
 *
 * ═══════════ EL ORDEN DE LA TARJETA LO MANDA B1 ═══════════
 *
 * Consigna corta, avance, figura, caso, pregunta, opciones. La regla del
 * instrumento va al PIE y no arriba, porque consigna más regla pasaban de las
 * 40 palabras que la barra de enganche permite antes de la figura. Sigue a la
 * vista toda la partida, que es lo que pedía estar arriba.
 *
 * ═══════════ EL COLOR ═══════════
 *
 * Teal para lo que acierta y para el tramo que frena; coral SOLO en la opción
 * incorrecta y en su devolución; `FAE.node` para la estructura de las figuras
 * —ejes, líneas, fichas sin veredicto— y ámbar solo en el rótulo de escenario.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const NEUTRO = "rgba(203,220,242,0.55)";
const SECUNDARIO = "rgba(248,249,250,0.62)";

/* 12 px es el piso de letra del kit para lo que el estudiante necesita leer. */
const ESTILO_CONSIGNA = { margin: "0 0 10px", fontSize: "14px", lineHeight: 1.5, color: FAE.text };
const ESTILO_REGLA = {
  margin: "16px 0 0", padding: "10px 13px", borderRadius: "12px",
  fontSize: "12.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.82)",
  background: "rgba(248,249,250,0.05)", border: "1px solid rgba(248,249,250,0.14)",
};
const ESTILO_HECHO = { margin: "10px 0 0", fontSize: "13px", lineHeight: 1.55, color: SECUNDARIO };
const ROTULO_FIGURA = { margin: "0 0 6px", fontFamily: SORA, fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", color: SECUNDARIO };
/*
 * El rótulo del tipo de decisión va aquí y no en el `rotulo` de Enunciado, que
 * lo pinta a 10,5 px: esto no es una marca de interfaz como «ÍTEM 2 DE 6», es
 * una instrucción que el estudiante necesita leer, y el piso para eso son
 * 12 px (E6 de la Célula E).
 */
const ROTULO_TIPO_ESTILO = (acento) => ({ margin: "12px 0 6px", fontFamily: SORA, fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: acento });

/*
 * La figura se queda pegada arriba mientras se responde. Sin esto, a 320×568
 * la tarjeta entera no cabe: al calificar, la vista baja a la devolución y la
 * figura —que es lo que acaba de cambiar— se queda fuera de la ventana. Con
 * `sticky` las dos se ven juntas, que es lo que pide D10, sin mover la
 * devolución del sitio que pide E2 (entre lo que se tocó y «Siguiente»).
 */
/* Las lecturas en palabras, para que la banda no informe solo con el color. */
const ROTULO_LECTURA_EJE = { debajo: "debajo de la inflación", igual: "justo en la inflación", encima: "encima de la inflación" };
const ROTULO_LECTURA_TANQUE = { falta: "le falta reserva", justo: "cumple justo", sobra: "le sobra reserva" };

const PEGADA = { position: "sticky", top: 0, zIndex: 2, background: FAE.bg, paddingBottom: "6px" };
const CIFRA_FIGURA = { fontFamily: SORA, fontSize: "13px", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: FAE.text };

/* El marco de toda figura: alto reservado igual en los tres casos de la pieza,
   para que la forma no delate cuál caso viene (D5 de la Célula D). */
const CAJA_FIGURA = {
  position: "relative", boxSizing: "border-box", width: "100%",
  padding: "12px 13px", borderRadius: "14px",
  background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)",
};

/* El tono de una pieza colocada: teal si acertó, coral si no, neutro sin veredicto. */
const tonoDe = (veredicto) => (veredicto === "ok" ? FAE.teal : veredicto === "mal" ? FAE.coral : NEUTRO);

/* ═══════════════════ FIGURA A · EL EJE DE LA TASA ═══════════════════ */

const posEje = (v) => ((v - EJE_TASA.minimo) / (EJE_TASA.maximo - EJE_TASA.minimo)) * 100;

/*
 * ═══════════ LA FICHA LEE LA CIFRA; LA BANDA LEE LA CATEGORÍA ═══════════
 *
 * Antes la ficha de la tasa se colocaba a ±2 puntos de la inflación según la
 * categoría elegida, y eso rompía la fidelidad: en el caso de Junio, con el
 * ACIERTO puesto, la ficha marcaba 8 mientras el hecho de la misma pantalla
 * decía que la tasa estaba en 10 y la devolución decía «diez menos seis da
 * cuatro». La figura afirmaba una cifra falsa, y como el acierto no dibujaba
 * fantasma de corrección, nada la desmentía. Lo encontró el auditor de la A6.
 *
 * Así que la ficha SIEMPRE marca la cifra del caso, y lo que cambia con la
 * opción elegida es una BANDA sobre el eje: el tramo donde el estudiante dijo
 * que caería la tasa. La banda lleva su veredicto en el tono y en el signo, y
 * las tres bandas son tres tramos distintos del eje, así que las tres opciones
 * siguen dejando la figura en estados distintos.
 */
const BANDA_EJE = {
  debajo: (x) => ({ izquierda: 0, ancho: x }),
  igual: (x) => ({ izquierda: Math.max(0, x - 7), ancho: 14 }),
  encima: (x) => ({ izquierda: x, ancho: 100 - x }),
};

function Ficha({ rotulo, valor, izquierda, tono, marca = null, fantasma = false, arriba = false }) {
  return (
    <span
      data-ficha={rotulo}
      data-valor={valor}
      data-izquierda={izquierda.toFixed(1)}
      data-fantasma={fantasma ? "si" : "no"}
      style={{
        position: "absolute", left: `${izquierda}%`, top: 0, transform: "translateX(-50%)",
        display: "flex", flexDirection: arriba ? "column-reverse" : "column", alignItems: "center", gap: "2px",
        whiteSpace: "nowrap", transition: "left 220ms ease",
      }}
    >
      <span style={{ ...CIFRA_FIGURA, fontSize: "12px", color: fantasma ? SECUNDARIO : FAE.text }}>
        {marca ? `${marca} ` : ""}{valor}
      </span>
      <span aria-hidden="true" style={{ width: "2px", height: "14px", background: tono, opacity: fantasma ? 0.6 : 1 }} />
      <span style={{ fontSize: "12px", color: fantasma ? SECUNDARIO : "rgba(248,249,250,0.72)" }}>{rotulo}</span>
    </span>
  );
}

function FiguraTasa({ base, estado, lectura, verdad, veredicto, pendiente }) {
  const hoy = estado ?? base;
  const inflacion = hoy.inflacion;
  /*
   * Con la clasificación sin responder no hay ficha de tasa puesta: ponerla
   * sería contestar la pregunta. En cuanto se responde, la ficha marca la
   * cifra del caso —acierte o falle—, nunca un desplazamiento de categoría.
   */
  const tasa = pendiente ? null : hoy.tasa;
  const tasaVerdad = !verdad || typeof verdad === "string" ? null : verdad.tasa;
  const inflacionVerdad = !verdad || typeof verdad === "string" ? null : verdad.inflacion;
  const frena = tasa !== null && tasa > inflacion;
  const banda = lectura ? BANDA_EJE[lectura](posEje(inflacion)) : null;
  const tono = tonoDe(veredicto);
  const marca = veredicto === "ok" ? "✓" : veredicto === "mal" ? "✗" : "";

  return (
    <div data-figura="tasa" style={{ ...CAJA_FIGURA, height: "150px" }}>
      <p style={ROTULO_FIGURA}>LA DISTANCIA QUE FRENA</p>
      <div style={{ position: "relative", height: "104px" }}>
        {/* la ficha de la inflación, arriba del eje */}
        <span style={{ position: "absolute", left: 0, right: 0, top: 0, height: "46px" }}>
          <Ficha rotulo="inflación" valor={inflacion} izquierda={posEje(inflacion)} tono={NEUTRO} arriba />
          {/*
            Y dónde iba la inflación, si la opción elegida la dejó en otro
            sitio. Hace falta: en el caso de Octubre la consecuencia mueve la
            INFLACIÓN y no la tasa, así que sin este fantasma elegir «sigue
            igual» no movía nada de la figura.
          */}
          {inflacionVerdad !== null && inflacionVerdad !== inflacion && (
            <Ficha rotulo="iba aquí" valor={inflacionVerdad} izquierda={posEje(inflacionVerdad)} tono={FAE.teal} marca="✓" fantasma arriba />
          )}
        </span>
        {/* la banda: el tramo del eje que eligió el estudiante */}
        {banda && (
          <span
            data-banda={lectura}
            data-izquierda={banda.izquierda.toFixed(1)}
            style={{
              position: "absolute", top: "38px", height: "24px", borderRadius: "4px",
              left: `${banda.izquierda}%`, width: `${banda.ancho}%`,
              background: veredicto === "ok" ? "rgba(42,157,143,0.18)" : "rgba(231,111,81,0.16)",
              border: `1px solid ${tono}`, transition: "left 220ms ease, width 220ms ease",
            }}
          />
        )}
        {/* el eje y sus marcas: estructura, así que node y nunca teal ni coral */}
        <span aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: "50px", height: "1.5px", background: "rgba(248,249,250,0.22)" }} />
        {[4, 6, 8, 10, 12, 14].map((v) => (
          <span key={v} aria-hidden="true" data-marca={v} style={{ position: "absolute", left: `${posEje(v)}%`, top: "46px", width: "1px", height: "9px", background: "rgba(248,249,250,0.22)" }} />
        ))}
        {/* el tramo entre las dos fichas: el freno es la distancia, no un número */}
        {tasa !== null && (
          <span
            data-tramo
            data-frena={frena ? "si" : "no"}
            style={{
              position: "absolute", top: "47px", height: "4px", borderRadius: "999px",
              left: `${Math.min(posEje(tasa), posEje(inflacion))}%`,
              width: `${Math.abs(posEje(tasa) - posEje(inflacion))}%`,
              background: frena ? FAE.teal : NEUTRO,
              transition: "left 220ms ease, width 220ms ease",
            }}
          />
        )}
        <span style={{ position: "absolute", left: 0, right: 0, top: "58px", height: "46px" }}>
          {tasa !== null && <Ficha rotulo="tasa" valor={tasa} izquierda={posEje(tasa)} tono={NEUTRO} />}
          {tasaVerdad !== null && tasaVerdad !== tasa && (
            <Ficha rotulo="iba aquí" valor={tasaVerdad} izquierda={posEje(tasaVerdad)} tono={FAE.teal} marca="✓" fantasma />
          )}
        </span>
        {banda && (
          <span data-rotulo-banda style={{ position: "absolute", left: 0, top: "86px", fontSize: "12px", color: tono }}>
            {marca} tu lectura: {ROTULO_LECTURA_EJE[lectura]}
          </span>
        )}
        {tasa === null && (
          <span data-sin-poner style={{ position: "absolute", left: 0, top: "62px", fontSize: "12px", color: SECUNDARIO }}>
            La ficha de la tasa todavía no está puesta.
          </span>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════ FIGURA B · LA MESA DE DINERO ═══════════════════ */

/*
 * Las dos columnas son complementarias a propósito: los cuatro paquetes de TES
 * y los cuatro de plata están siempre en la mesa, y una operación los pasa de
 * un lado al otro. Así se ve que el Banco no reparte nada que no salga de algún
 * sitio, que es justo lo que confunde a quien cree que una OMA «crea» títulos.
 */
const TOTAL_MESA = 4;
const POS_TASA = { "-2": 8, "-1": 29, 0: 50, 1: 71, 2: 92 };

/*
 * Las marcas de «iba así» son geometría, no letras: un recuadro a trazos sobre
 * los TES que debían quedar en esa columna y una muesca a trazos en la barra,
 * a la altura de la plata que debía quedar. Así la figura dice la verdad sin
 * crecer de alto y sin repetir lo que ya dice la devolución.
 */
function Columna({ rotulo, tes, plata, tono, temporal = false, tesVerdad = null, plataVerdad = null }) {
  return (
    <div data-columna={rotulo} style={{ flex: "1 1 0", minWidth: 0 }}>
      <p style={{ margin: "0 0 5px", fontSize: "12px", lineHeight: 1.25, color: SECUNDARIO }}>{rotulo}</p>
      <div data-tes={tes} style={{ position: "relative", display: "flex", gap: "3px", marginBottom: "6px", minHeight: "16px" }}>
        {Array.from({ length: tes }, (_, k) => (
          <span key={k} aria-hidden="true" style={{ width: "12px", height: "16px", borderRadius: "2px", background: "rgba(203,220,242,0.22)", border: `1px ${temporal ? "dashed" : "solid"} ${tono}` }} />
        ))}
        {tesVerdad !== null && tesVerdad !== tes && (
          <span
            aria-hidden="true"
            data-tes-verdad={tesVerdad}
            style={{ position: "absolute", left: "-2px", top: "-2px", width: `${Math.max(tesVerdad * 15, 6)}px`, height: "20px", borderRadius: "3px", border: `1.5px dashed ${FAE.teal}` }}
          />
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span data-plata={plata} style={{ position: "relative", flex: "1 1 auto", height: "10px", borderRadius: "999px", background: "rgba(248,249,250,0.14)" }}>
          {/* La plata prestada con pacto de vuelta va rayada, no llena: se ve que
              está de paso. Es la diferencia entre un repo y una compra, y sin
              esto las dos dejaban la barra idéntica. */}
          <span
            aria-hidden="true"
            data-temporal={temporal ? "si" : "no"}
            style={{
              position: "absolute", left: 0, top: 0, bottom: 0, width: `${(plata / TOTAL_MESA) * 100}%`,
              background: temporal ? `repeating-linear-gradient(115deg, ${tono} 0 4px, rgba(10,20,34,0.55) 4px 8px)` : tono,
              borderRadius: "999px", transition: "width 220ms ease",
            }}
          />
          {plataVerdad !== null && plataVerdad !== plata && (
            <span
              aria-hidden="true"
              data-plata-verdad={plataVerdad}
              style={{ position: "absolute", left: `${(plataVerdad / TOTAL_MESA) * 100}%`, top: "-3px", width: "2px", height: "16px", background: FAE.teal }}
            />
          )}
        </span>
        <span style={{ ...CIFRA_FIGURA, fontSize: "12px" }}>{plata}</span>
      </div>
    </div>
  );
}

function FiguraMesa({ base, estado, verdad, veredicto }) {
  const hoy = estado ?? base;
  const tono = tonoDe(veredicto);
  const tasaDia = hoy.tasaDia ?? 0;
  const v = !verdad || typeof verdad === "string" ? null : verdad;
  const tasaVerdad = v ? v.tasaDia ?? 0 : null;
  return (
    <div data-figura="mesa" style={{ ...CAJA_FIGURA, height: "150px" }}>
      <p style={ROTULO_FIGURA}>TES ARRIBA · PLATA ABAJO</p>
      <div style={{ display: "flex", gap: "12px" }}>
        <Columna rotulo="Banco de la República" tes={hoy.tes} plata={TOTAL_MESA - hoy.plata} tono={tono} temporal={Boolean(hoy.devuelve)}
          tesVerdad={v ? v.tes : null} plataVerdad={v ? TOTAL_MESA - v.plata : null} />
        <Columna rotulo="Bancos comerciales" tes={TOTAL_MESA - hoy.tes} plata={hoy.plata} tono={tono} temporal={Boolean(hoy.devuelve)}
          tesVerdad={v ? TOTAL_MESA - v.tes : null} plataVerdad={v ? v.plata : null} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}>
        <span style={{ fontSize: "12px", color: SECUNDARIO, whiteSpace: "nowrap" }}>Tasa a un día</span>
        <span style={{ position: "relative", flex: "1 1 auto", height: "16px" }}>
          <span aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: "7px", height: "1.5px", background: "rgba(248,249,250,0.22)" }} />
          <span aria-hidden="true" data-tasa-del-banco style={{ position: "absolute", left: "50%", top: 0, width: "2px", height: "16px", background: NEUTRO }} />
          <span
            data-tasa-dia={tasaDia}
            style={{
              position: "absolute", left: `${POS_TASA[String(tasaDia)] ?? 50}%`, top: "3px",
              width: "10px", height: "10px", marginLeft: "-5px", borderRadius: "999px",
              background: tono, transition: "left 220ms ease",
            }}
          />
          {tasaVerdad !== null && tasaVerdad !== tasaDia && (
            <span
              aria-hidden="true"
              data-tasa-dia-verdad={tasaVerdad}
              style={{
                position: "absolute", left: `${POS_TASA[String(tasaVerdad)] ?? 50}%`, top: "1px",
                width: "14px", height: "14px", marginLeft: "-7px", borderRadius: "999px",
                border: `2px solid ${FAE.teal}`, background: "transparent",
              }}
            />
          )}
        </span>
        <span data-devuelve={hoy.devuelve ? "si" : "no"} style={{ fontSize: "12px", color: hoy.devuelve ? FAE.text : SECUNDARIO, whiteSpace: "nowrap" }}>
          {hoy.devuelve ? "se devuelve" : "queda puesto"}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════ FIGURA C · EL TANQUE DEL BANCO ═══════════════════ */

/* El tanque no se escala con los depósitos: con 4.000 arriba, los 60 que
   faltan medirían 2 px y la figura diría «da lo mismo» justo donde se
   pregunta por la diferencia (E11 de la Célula E). La escala es la zona del
   encaje, 0 a 500, y los depósitos van en cifra. */
export const TOPE_TANQUE = 500;
const ALTO_TANQUE = 86;
const TOPE_CREDITO = 400;
const alturaDe = (v) => Math.max(0, Math.min(1, v / TOPE_TANQUE)) * ALTO_TANQUE;

/*
 * MISMO ARREGLO QUE EN EL EJE DE LA TASA, y mismo defecto de origen: la línea
 * del encaje se colocaba a ±22 px del relleno según la categoría elegida, así
 * que con la clasificación ACERTADA no caía en lo exigido —80 px frente a 69
 * en Aurora 1, 47 frente a 55 en Aurora 2—. La figura decía una magnitud que
 * no era. Lo encontró el auditor de la A6.
 *
 * Ahora la línea SIEMPRE cae en lo exigido, con su cifra, y la categoría
 * elegida se dibuja como una BANDA sobre el relleno: por encima si dijo que le
 * falta, pegada si dijo que cumple justo, por debajo si dijo que le sobra.
 * Tres bandas, tres alturas distintas.
 */
const BANDA_TANQUE = {
  falta: (h) => ({ abajo: h, alto: 20 }),
  justo: (h) => ({ abajo: Math.max(0, h - 3), alto: 6 }),
  sobra: (h) => ({ abajo: Math.max(0, h - 20), alto: 20 }),
};

function Linea({ alto, tono, rotulo, fantasma = false }) {
  return (
    <span
      data-linea={fantasma ? "verdad" : "exigido"}
      data-alto={Math.round(alto)}
      style={{
        position: "absolute", left: "-3px", right: "-3px", bottom: `${alto}px`,
        height: 0, borderTop: `2px ${fantasma ? "dashed" : "solid"} ${tono}`,
        transition: "bottom 220ms ease",
      }}
    >
      <span style={{ position: "absolute", left: "100%", bottom: "-8px", marginLeft: "6px", fontSize: "12px", color: fantasma ? SECUNDARIO : FAE.text, whiteSpace: "nowrap" }}>
        {rotulo}
      </span>
    </span>
  );
}

function FiguraTanque({ base, estado, lectura, verdad, veredicto, pendiente }) {
  const hoy = estado ?? base;
  const exigido = encajeExigido(hoy.depositos, hoy.encaje);
  const altoReserva = alturaDe(hoy.reserva);
  const tono = tonoDe(veredicto);
  const marca = veredicto === "ok" ? "✓" : veredicto === "mal" ? "✗" : "";
  /* Sin responder la clasificación, la línea no está puesta: su altura es lo
     que se pregunta. En cuanto se responde, cae en lo exigido y lleva su cifra. */
  const altoLinea = pendiente ? null : alturaDe(exigido);
  const banda = lectura ? BANDA_TANQUE[lectura](altoReserva) : null;
  /* El fantasma solo hace falta donde la verdad no se puede dibujar sola: en
     la consecuencia, que mueve la reserva. En la clasificación la verdad ES la
     línea, y ya está puesta. */
  const reservaVerdad = verdad && typeof verdad !== "string" ? alturaDe(verdad.reserva) : null;

  return (
    <div data-figura="tanque" style={{ ...CAJA_FIGURA, height: "150px" }}>
      <p style={ROTULO_FIGURA}>RESERVA Y CRÉDITO NUEVO</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
        <div style={{ position: "relative", width: "28px", height: `${ALTO_TANQUE}px`, flexShrink: 0, borderLeft: "1.5px solid rgba(248,249,250,0.22)", borderBottom: "1.5px solid rgba(248,249,250,0.22)" }}>
          <span
            data-reserva={hoy.reserva}
            data-alto-reserva={Math.round(altoReserva)}
            style={{ position: "absolute", left: "2px", right: 0, bottom: 0, height: `${altoReserva}px`, background: "rgba(203,220,242,0.28)", border: `1px solid ${NEUTRO}`, transition: "height 220ms ease" }}
          />
          {banda && (
            <span
              data-banda={lectura}
              data-abajo={Math.round(banda.abajo)}
              style={{
                position: "absolute", left: "-5px", right: "-5px", bottom: `${banda.abajo}px`, height: `${banda.alto}px`,
                borderRadius: "3px", border: `1px solid ${tono}`,
                background: veredicto === "ok" ? "rgba(42,157,143,0.18)" : "rgba(231,111,81,0.16)",
                transition: "bottom 220ms ease, height 220ms ease",
              }}
            />
          )}
          {altoLinea !== null && <Linea alto={altoLinea} tono={FAE.text} rotulo={`piden ${exigido}`} />}
          {reservaVerdad !== null && <Linea alto={reservaVerdad} tono={FAE.teal} rotulo={`iba en ${verdad.reserva}`} fantasma />}
        </div>
        <div style={{ flex: "1 1 auto", minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: "12px", lineHeight: 1.4, color: SECUNDARIO }}>
            Depósitos <span style={CIFRA_FIGURA}>{hoy.depositos.toLocaleString("es-CO")}</span> · encaje <span style={CIFRA_FIGURA}>{hoy.encaje} de cada 100</span>
          </p>
          <p style={{ margin: "3px 0 0", fontSize: "12px", color: SECUNDARIO }}>
            Reserva guardada <span data-cifra-reserva style={CIFRA_FIGURA}>{hoy.reserva}</span>
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "7px" }}>
            <span style={{ fontSize: "12px", color: SECUNDARIO, whiteSpace: "nowrap" }}>Presta</span>
            <span data-credito={hoy.credito} style={{ position: "relative", flex: "1 1 auto", height: "10px", borderRadius: "999px", background: "rgba(248,249,250,0.14)", overflow: "hidden" }}>
              <span aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(hoy.credito / TOPE_CREDITO) * 100}%`, background: tono, transition: "width 220ms ease" }} />
            </span>
            <span style={{ ...CIFRA_FIGURA, fontSize: "12px" }}>{hoy.credito}</span>
          </div>
          {banda && (
            <p data-rotulo-banda style={{ margin: "5px 0 0", fontSize: "12px", color: tono }}>
              {marca} tu lectura: {ROTULO_LECTURA_TANQUE[lectura]}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ EL MOTOR DE LAS TRES ═══════════════════ */

/*
 * Las opciones de una CONSECUENCIA se barajan, porque su orden no significa
 * nada. Las de una CLASIFICACIÓN no: son una escala —debajo, igual, encima;
 * falta, justo, sobra— y barajarla la vuelve ilegible. Que la posición no
 * delate la respuesta lo resuelve el banco, no el azar: la correcta cae en la
 * primera casilla en un caso, en la tercera en otro y en la segunda en el
 * tercero.
 */
export const CASOS_POR_TANDA = 3;

/*
 * D8: una segunda tanda no puede ser la misma partida. Cada juego tiene cinco
 * casos y cada tanda sortea TRES, así que cambian los casos, su orden y las
 * respuestas correctas. Antes eran los tres mismos casos en el mismo orden y
 * lo único que se movía era el orden de las opciones de consecuencia: dos
 * tandas eran mecánicamente idénticas, y eso es lo que el auditor midió.
 */
export const sortearCasos = (casos) => barajar(casos).slice(0, CASOS_POR_TANDA);

function itemsDe(casos, elegir = sortearCasos) {
  return elegir(casos).flatMap((caso) =>
    caso.decisiones.map((decision) => ({
      caso,
      decision,
      id: `${caso.id}:${decision.id}`,
      opciones: decision.tipo === CONSECUENCIA ? barajar(decision.opciones) : decision.opciones,
    })),
  );
}

/* `elegirCasos` existe para las pruebas y la sonda: fija la tanda en vez de
   sortearla, que es la única forma de comparar el MISMO ítem tres veces. */
export function DosDecisiones({ ficha, casos, Figura, Marco, rotulo, acento, onCompletar, elegirCasos }) {
  const [items, setItems] = useState(() => itemsDe(casos, elegirCasos));
  const [n, setN] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);
  const detalle = useRef([]);
  const inicio = useRef(Date.now());
  const devolucion = useRef(null);
  const pegada = useRef(null);
  const item = items[n];
  const pct = porcentaje(aciertos, items.length);

  useEffect(() => {
    if (terminado) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]); // eslint-disable-line react-hooks/exhaustive-deps

  /*
   * D10: al calificar, la devolución tiene que quedar ENTERA en la ventana, y
   * además por debajo de la figura pegada. `scrollIntoView({block:"nearest"})`
   * no sabe de la figura pegada y la dejaba medio tapada a 320×568, así que el
   * desplazamiento se calcula: primero se sube lo que falte para que se vea el
   * final, y después se corrige si el principio quedó bajo la figura.
   */
  useEffect(() => {
    if (!elegida) return;
    const el = devolucion.current;
    if (!el || typeof window === "undefined" || !window.scrollBy) return;
    const techo = (pegada.current?.getBoundingClientRect().bottom ?? 0) + 8;
    const falta = el.getBoundingClientRect().bottom - (window.innerHeight - 8);
    if (falta > 0) window.scrollBy(0, falta);
    const tapado = techo - el.getBoundingClientRect().top;
    if (tapado > 0) window.scrollBy(0, -tapado);
  }, [elegida]);

  const responder = (opcion) => {
    if (elegida) return;
    const ok = opcion.id === item.decision.respuesta;
    detalle.current.push({ item: item.id, ok, intentos: 1, respuesta: ok ? null : opcion.id, orden: detalle.current.length + 1 });
    if (ok) setAciertos((x) => x + 1);
    setElegida(opcion);
  };
  const avanzar = () => {
    if (!elegida) return;
    setElegida(null);
    if (n + 1 < items.length) setN(n + 1);
    else setTerminado(true);
  };
  const reiniciar = () => {
    setItems(itemsDe(casos, elegirCasos)); setN(0); setElegida(null); setAciertos(0); setTerminado(false);
    detalle.current = []; inicio.current = Date.now();
  };

  if (terminado) {
    return (
      <Marco rotulo={rotulo} titulo={ficha.nombre} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p data-cierre-texto style={TEXTO_CIERRE}>{ficha.cierre}</p>
        </Cierre>
      </Marco>
    );
  }

  const correcta = item.decision.opciones.find((o) => o.id === item.decision.respuesta);
  const acerto = Boolean(elegida) && elegida.id === item.decision.respuesta;
  const veredicto = !elegida ? null : acerto ? "ok" : "mal";

  return (
    <Marco rotulo={rotulo} titulo={ficha.nombre} acento={acento}>
      <p data-consigna style={ESTILO_CONSIGNA}>{ficha.consigna}</p>
      <div style={{ marginBottom: "10px" }}>
        <Pulsos total={items.length} hechos={n + (elegida ? 1 : 0)} enCurso={n + 1} etiqueta="Decisión" />
      </div>
      <div ref={pegada} style={PEGADA}>
      <Figura
        base={item.caso.base}
        estado={elegida?.estado ?? null}
        lectura={elegida?.lectura ?? null}
        verdad={!elegida || acerto ? null : correcta.estado ?? correcta.lectura ?? null}
        veredicto={veredicto}
        pendiente={item.decision.tipo === CLASIFICACION && !elegida}
      />
      </div>
      <RotuloEscenario />
      <p data-hecho={item.caso.id} style={ESTILO_HECHO}>{item.caso.hecho}</p>
      <div data-decision={item.id} data-tipo={item.decision.tipo}>
        <p data-rotulo-tipo style={ROTULO_TIPO_ESTILO(acento)}>{ROTULO_TIPO[item.decision.tipo]}</p>
        <Enunciado acento={acento}>{item.decision.pregunta}</Enunciado>
      </div>
      <Opciones columnas="repeat(auto-fit, minmax(240px, 1fr))">
        {item.opciones.map((o) => (
          <Opcion
            key={o.id}
            ancho
            deshabilitada={Boolean(elegida)}
            onClick={() => responder(o)}
            estado={!elegida ? null : o.id === elegida.id ? (acerto ? "correcta" : "incorrecta") : o.id === correcta.id ? "revelada" : null}
          >
            {o.nombre}
          </Opcion>
        ))}
      </Opciones>
      <div ref={devolucion}>
        <Retro texto={elegida ? elegida.retro : null} />
      </div>
      {elegida && <Avanzar onClick={avanzar}>{n + 1 === items.length ? "Ver resultado" : "Siguiente"}</Avanzar>}
      <p data-regla style={ESTILO_REGLA}>{ficha.regla}</p>
    </Marco>
  );
}

/* ═══════════════════ LAS TRES, CON SU MARCO ═══════════════════ */

export const LaTasaQueMuerde = ({ onCompletar, elegirCasos }) => (
  <DosDecisiones ficha={TASA} casos={CASOS_TASA} Figura={FiguraTasa} Marco={MarcoMaquinas}
    rotulo="APLICACIÓN" acento={FAE.teal} onCompletar={onCompletar} elegirCasos={elegirCasos} />
);

export const RepoODefinitiva = ({ onCompletar, elegirCasos }) => (
  <DosDecisiones ficha={REPO} casos={CASOS_REPO} Figura={FiguraMesa} Marco={MarcoMaquinas}
    rotulo="ANÁLISIS" acento={FAE.teal} onCompletar={onCompletar} elegirCasos={elegirCasos} />
);

export const ElFrenoDelEncaje = ({ onCompletar, elegirCasos }) => (
  <DosDecisiones ficha={ENCAJE} casos={CASOS_ENCAJE} Figura={FiguraTanque} Marco={MarcoMaquinas}
    rotulo="APLICACIÓN" acento={FAE.teal} onCompletar={onCompletar} elegirCasos={elegirCasos} />
);

/* Para las pruebas: las figuras, con el mismo nombre que su instrumento. */
export { FiguraTasa, FiguraMesa, FiguraTanque, itemsDe, CLASIFICACION, CONSECUENCIA };
