import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { FAE } from "../../theme.js";
import Logo from "../Logo.jsx";
import IconoCristal from "../shared/IconoCristal.jsx";
import Avatar from "../avatar/Avatar.jsx";
import Entrada, { EstiloEntrada, entrada } from "../shared/Entrada.jsx";
import { useAuth } from "../../auth/AuthProvider.jsx";
import { marcarVisitada } from "../../tienda/novedades.js";
import {
  combinacionDe, ETIQUETA_NIVEL, NIVELES, NOMBRE_NIVEL, NOMBRE_FORMA, NOMBRE_PALETA,
  PALETA_COMPARACION, PALETTES, leyenda,
} from "../../avatar/generador.js";
import {
  FORMAS_COMPRABLES, FUENTES, PALETAS_COMPRABLES,
  comprarNivel, comprarPieza, estadoDeNivel, estadoDePieza, faltanPara, faltanParaPieza,
  precioDe, precioDePieza, saldoDe,
} from "../../cristales/cristales.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA TIENDA.
 *
 * ═══════════ LO QUE CAMBIÓ EL 28-OCT, Y POR QUÉ ═══════════
 *
 * Mateo: «la distribución es muy tosca y torpe, no es llamativa». Tenía
 * razón, y el diagnóstico es concreto: eran NUEVE tarjetas anchas idénticas
 * apiladas en una columna de 4.600 px, con la figura a 56 px perdida al lado
 * de tres líneas de texto. Todo pesaba igual, así que nada destacaba, y lo
 * primero que se veía al entrar era una tabla de precios en vez del producto.
 *
 * Lo que hace esta versión, en orden:
 *
 *   1. UN ESCAPARATE ARRIBA. Lo primero es el avatar propio, grande, con su
 *      nombre. Se está comprando para ÉL: enseñarlo antes que nada es la
 *      diferencia entre una tienda y un formulario de precios.
 *   2. REJILLA, NO COLUMNA. Las piezas van de dos en dos con la figura a 76
 *      px y el texto debajo. La página pasa de 4.600 px a poco más de 2.000,
 *      y se compara de un vistazo en vez de desplazándose.
 *   3. LOS CUATRO NIVELES JUNTOS, incluido el I que ya es tuyo. Es una
 *      progresión: enseñar solo los tres que faltan esconde de dónde sales.
 *   4. LA ENTRADA ESCALONADA, con el mismo sistema de la portada.
 *
 * ═══════════ LA TABLA DE CÓMO GANAR SIGUE A LA VISTA ═══════════
 *
 * No detrás de un acordeón —eso sigue prohibido: un precio sin la forma de
 * conseguir el dinero es una pared—, pero ya no se come la primera pantalla.
 * Arriba van las tres fuentes más rápidas en una línea, junto al saldo; la
 * tabla completa, al final y entera. Así nunca hay un precio sin su camino y
 * lo primero que se ve es lo que se vende.
 *
 * ═══════════ Y NADA DE CORAL ═══════════
 *
 * En todo el sitio el coral significa error. Un nivel que todavía no alcanzas
 * no es un error: es un precio. Va en gris atenuado, diciendo exactamente
 * cuántos Cristales faltan —un número, no un «insuficiente»—. Teal solo para
 * lo que ya es tuyo y para el botón de lo que sí alcanzas.
 *
 * La única excepción es la MUESTRA de una paleta a la venta: Ascua y Arrecife
 * llevan coral porque el coral es lo que se está vendiendo. La prueba exime
 * el propio [data-muestra] y nada más.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const TARJETA = {
  borderRadius: "16px",
  background: "rgba(29,53,87,0.55)",
  border: "1px solid rgba(248,249,250,0.12)",
  padding: "16px 18px",
};

const ETIQUETA = { fontSize: "12.5px", color: "rgba(248,249,250,0.5)", margin: "0 0 4px" };
const NUMERO = {
  fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "30px", margin: 0,
  color: FAE.text, fontVariantNumeric: "tabular-nums", lineHeight: 1.05,
};

const RUBRO = {
  fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700,
  letterSpacing: "0.14em", color: "rgba(248,249,250,0.5)", margin: "0 0 4px",
};
const PIE_RUBRO = { fontSize: "12.5px", lineHeight: 1.45, color: "rgba(248,249,250,0.5)", margin: "0 0 12px" };

/* Dos columnas a cualquier ancho del teléfono: a 320 cada celda queda en 136 px. */
const REJILLA = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" };

/*
 * «Ya es tuyo» vive en UN solo sitio y lo comparten las tres tarjetas. No es
 * por ahorrar líneas: el trinquete del teal cuenta cuántos textos en teal
 * tiene cada archivo, y duplicar el literal lo subiría. Un segundo texto en
 * teal es una regresión aunque sea copia del primero.
 */
function YaEsTuyo({ genero = "o" }) {
  return <span style={{ fontSize: "12px", color: FAE.teal }}>{`Ya es tuy${genero}`}</span>;
}

/*
 * «+N ◆», lo que se GANA. Un solo sitio, usado por la franja de atajos y por
 * la tabla de abajo. Igual que con «Ya es tuyo», no es por ahorrar líneas: el
 * trinquete cuenta los textos en teal por archivo, y el mismo dato escrito
 * dos veces contaría dos.
 */
function Ganancia({ cuanto, tamano = 14 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
      <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: `${tamano}px`, color: FAE.teal, fontVariantNumeric: "tabular-nums" }}>
        +{cuanto}
      </span>
      <IconoCristal tamano={tamano - 1} />
    </span>
  );
}

/* El precio con su cristal, o cuánto falta. El mismo pie para todo lo que se vende. */
function Precio({ precio, faltan, alcanza }) {
  return (
    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", flexWrap: "wrap", fontSize: "12px", color: "rgba(248,249,250,0.6)" }}>
      <IconoCristal tamano={11} apagado={!alcanza} />
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{precio}</span>
      {!alcanza && (
        <span data-faltan={faltan} style={{ color: "rgba(248,249,250,0.45)", whiteSpace: "nowrap" }}>
          · te faltan {faltan}
        </span>
      )}
    </span>
  );
}

function Boton({ alcanza, ocupado, onClick, ...resto }) {
  return (
    <button
      type="button"
      {...resto}
      disabled={!alcanza || ocupado}
      onClick={onClick}
      style={{
        fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600,
        padding: "8px 0", borderRadius: "999px", border: "none", width: "100%",
        cursor: alcanza && !ocupado ? "pointer" : "default",
        backgroundColor: alcanza ? FAE.teal : "rgba(248,249,250,0.08)",
        color: alcanza ? FAE.bg : "rgba(248,249,250,0.4)",
      }}
    >
      {ocupado ? "…" : "Desbloquear"}
    </button>
  );
}

/*
 * La celda de la rejilla. Una sola para niveles, formas y paletas: el
 * estudiante no tiene por qué aprender tres lenguajes dentro de la misma
 * pantalla, y lo único que cambia entre las tres es qué se enseña arriba.
 */
function Celda({ figura, titulo, pie, estado, children, ...resto }) {
  const comprado = estado === "comprado";
  return (
    <div
      {...resto}
      data-estado={estado}
      style={{
        ...TARJETA,
        padding: "14px 10px 12px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center",
        /* Teal pleno y no atenuado: en una rejilla de cuatro, lo que ya es
           tuyo tiene que distinguirse de un vistazo y sin leer. */
        borderColor: comprado ? FAE.teal : "rgba(248,249,250,0.12)",
        background: comprado ? "rgba(42,157,143,0.10)" : TARJETA.background,
        opacity: estado === "falta" ? 0.66 : 1,
      }}
    >
      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "76px" }}>{figura}</span>
      <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "13.5px", lineHeight: 1.25 }}>{titulo}</span>
      {pie}
      {children}
    </div>
  );
}

function CeldaNivel({ nivel, perfil, onComprar, comprando }) {
  const { forma, paleta } = combinacionDe(perfil);
  /* El I no se compra: es de todos desde el primer día. */
  const estado = nivel === 1 ? "comprado" : estadoDeNivel(perfil, nivel);
  const alcanza = estado === "alcanzable";
  return (
    <Celda
      data-nivel={nivel}
      estado={estado}
      figura={<Avatar forma={forma} paleta={paleta} nivel={nivel} tamano={72} />}
      titulo={`${ETIQUETA_NIVEL(nivel)} · ${NOMBRE_NIVEL[nivel]}`}
      pie={estado === "comprado"
        ? <YaEsTuyo />
        : <Precio precio={precioDe(nivel)} faltan={faltanPara(perfil, nivel)} alcanza={alcanza} />}
    >
      {estado !== "comprado" && (
        <Boton data-comprar={nivel} alcanza={alcanza} ocupado={comprando === nivel} onClick={() => onComprar(nivel)} />
      )}
    </Celda>
  );
}

/*
 * La celda de una pieza. Lo que se enseña arriba depende de qué se vende:
 *
 *   forma    la figura en la paleta de COMPARACIÓN, el gris de las
 *            miniaturas del selector. Se vende una geometría, no un color, y
 *            pintarla en teal haría creer que el teal viene incluido.
 *   paleta   solo el degradado, sin figura. Al revés, por la misma razón.
 */
function CeldaPieza({ tipo, clave, perfil, onComprar, comprando }) {
  const estado = estadoDePieza(perfil, tipo, clave);
  const alcanza = estado === "alcanzable";
  const id = `${tipo}-${clave}`;
  return (
    <Celda
      data-pieza={id}
      estado={estado}
      figura={tipo === "forma" ? (
        <Avatar forma={clave} paleta={PALETA_COMPARACION} nivel={2} tamano={72} />
      ) : (
        <span
          aria-hidden="true"
          data-muestra={clave}
          style={{
            width: "66px", height: "66px", borderRadius: "18px", display: "block",
            background: `linear-gradient(135deg, ${PALETTES[clave].c1} 0%, ${PALETTES[clave].c2} 100%)`,
            border: "1px solid rgba(248,249,250,0.14)",
          }}
        />
      )}
      titulo={tipo === "forma" ? NOMBRE_FORMA[clave] : NOMBRE_PALETA[clave]}
      pie={estado === "comprado"
        ? <YaEsTuyo genero="a" />
        : <Precio precio={precioDePieza(tipo, clave)} faltan={faltanParaPieza(perfil, tipo, clave)} alcanza={alcanza} />}
    >
      {estado !== "comprado" && (
        <Boton data-comprar-pieza={id} alcanza={alcanza} ocupado={comprando === id} onClick={() => onComprar(tipo, clave)} />
      )}
    </Celda>
  );
}

function Fuente({ fuente }) {
  return (
    <li
      data-fuente={fuente.id}
      style={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px",
        padding: "10px 0", borderTop: "1px solid rgba(248,249,250,0.08)",
      }}
    >
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontSize: "13.5px", lineHeight: 1.4 }}>{fuente.que}</span>
        {fuente.nota && (
          <span style={{ display: "block", fontSize: "11.5px", lineHeight: 1.4, color: "rgba(248,249,250,0.45)", marginTop: "2px" }}>
            {fuente.nota}
          </span>
        )}
      </span>
      <Ganancia cuanto={fuente.cuanto} />
    </li>
  );
}

/* `onComprar` es inyectable por la misma razón que `onGuardar` en el selector:
 * la compra de verdad va contra la base y la pantalla se prueba sin ella. */
export default function TiendaView({ onBack, onComprar = comprarNivel, onComprarPieza = comprarPieza }) {
  const { perfil, session, pedirCuenta, aplicarPerfil, refrescarPerfil } = useAuth();
  const [comprando, setComprando] = useState(null);
  const [error, setError] = useState(null);

  /*
   * El saldo se vuelve a leer al entrar. Los Cristales de un hito de racha o de
   * cinco actividades los paga el servidor dentro de registrar_fp, sin pasar por
   * el cliente: la fila en memoria puede ser de antes de esa partida, y aquí es
   * justo donde un saldo viejo se convierte en un botón apagado que debería
   * estar encendido.
   */
  useEffect(() => {
    if (session) refrescarPerfil();
  }, [session, refrescarPerfil]);

  /*
   * ═══════════ ENTRAR APAGA EL PUNTO DEL MENÚ ═══════════
   *
   * Depende de `perfil` y no solo de `session` a propósito: así vuelve a
   * correr cuando llega la fila fresca del efecto de arriba, y también después
   * de comprar. Marcar con el saldo viejo daría por visto un nivel que el
   * estudiante todavía no ve alcanzable, y entonces el aviso no volvería a
   * salir el día que el saldo nuevo lo destapara.
   */
  useEffect(() => {
    if (session) marcarVisitada(session.user?.id, perfil);
  }, [session, perfil]);

  const comprar = async (nivel) => {
    setComprando(nivel);
    setError(null);
    const { perfil: fila, error: err } = (await onComprar(nivel)) ?? {};
    setComprando(null);
    if (err) setError(err);
    else if (fila) aplicarPerfil(fila);
  };

  const comprarLaPieza = async (tipo, clave) => {
    setComprando(`${tipo}-${clave}`);
    setError(null);
    const { perfil: fila, error: err } = (await onComprarPieza(tipo, clave)) ?? {};
    setComprando(null);
    if (err) setError(err);
    else if (fila) aplicarPerfil(fila);
  };

  const combo = combinacionDe(perfil);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: FAE.bg,
        fontFamily: "Inter, sans-serif",
        color: FAE.text,
        backgroundImage: "radial-gradient(circle at 50% -10%, rgba(42,157,143,0.16), transparent 55%)",
      }}
    >
      <EstiloEntrada />
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "clamp(18px, 3vh, 30px) 24px 56px" }}>
        <div {...entrada(0, "baja")} style={{ ...entrada(0, "baja").style, display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
          <Logo variant="symbol" size={26} theme="dark" />
          <span aria-hidden="true" style={{ width: "1px", height: "22px", backgroundColor: "rgba(248,249,250,0.16)", margin: "0 4px" }} />
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", padding: "8px",
              borderRadius: "999px", background: "rgba(248,249,250,0.06)",
              border: "1px solid rgba(248,249,250,0.14)", cursor: "pointer",
            }}
          >
            <ChevronLeft size={20} color={FAE.text} />
          </button>
          <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em", margin: 0, lineHeight: 1 }}>
            Tienda
          </h1>
        </div>

        {!session ? (
          <div style={TARJETA}>
            <p style={{ fontSize: "14.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.7)", margin: "0 0 12px" }}>
              Entra para ver tus Cristales y lo que puedes desbloquear.
            </p>
            <button
              type="button"
              onClick={() => pedirCuenta("ver la Tienda")}
              style={{
                fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 600,
                padding: "10px 18px", borderRadius: "999px", border: "none",
                cursor: "pointer", backgroundColor: FAE.teal, color: FAE.bg,
              }}
            >
              Entrar
            </button>
          </div>
        ) : (
          <>
            {/*
              ── el escaparate ──

              El avatar propio, grande y antes que nada. Es para él para lo que
              se compra; enseñarlo primero es la diferencia entre una tienda y
              una lista de precios. El saldo va al lado, no en una tarjeta
              aparte que se comía media pantalla.
            */}
            <Entrada orden={1} modo="crece">
              <div
                data-escaparate
                style={{
                  ...TARJETA, display: "flex", alignItems: "center", gap: "16px", marginBottom: "10px",
                  background: "linear-gradient(135deg, rgba(42,157,143,0.14) 0%, rgba(29,53,87,0.55) 60%)",
                }}
              >
                <Avatar perfil={perfil} tamano={84} />
                <div style={{ minWidth: 0 }}>
                  <p style={ETIQUETA}>Tu avatar</p>
                  <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "14.5px", margin: "0 0 10px", lineHeight: 1.3 }}>
                    {leyenda(combo)}
                  </p>
                  <span data-saldo style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
                    <IconoCristal tamano={20} />
                    <span style={{ ...NUMERO, fontSize: "22px" }}>{saldoDe(perfil)}</span>
                    <span style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.5)" }}>Cristales</span>
                  </span>
                </div>
              </div>
            </Entrada>

            {/*
              Las tres fuentes más rápidas, en una franja. La tabla entera sigue
              abajo y sin acordeón: esto no la sustituye, la adelanta.
            */}
            <Entrada orden={2} modo="sube">
              <ul
                data-atajos
                style={{
                  listStyle: "none", display: "flex", gap: "8px", flexWrap: "wrap",
                  padding: 0, margin: "0 0 26px",
                }}
              >
                {FUENTES.filter((f) => ["racha-7", "actividades", "podio"].includes(f.id)).map((f) => (
                  <li
                    key={f.id}
                    style={{
                      display: "flex", alignItems: "center", gap: "5px", flex: "1 1 auto",
                      padding: "7px 11px", borderRadius: "999px",
                      background: "rgba(248,249,250,0.05)", border: "1px solid rgba(248,249,250,0.10)",
                      fontSize: "11.5px", color: "rgba(248,249,250,0.68)", whiteSpace: "nowrap",
                    }}
                  >
                    {f.id === "racha-7" ? "7 días seguidos" : f.id === "actividades" ? "5 actividades" : "Podio de liga"}
                    <Ganancia cuanto={String(f.cuanto).split(" / ")[0]} tamano={12} />
                  </li>
                ))}
              </ul>
            </Entrada>

            {/* ── los cuatro niveles, el I incluido ── */}
            <Entrada orden={3} modo="sube">
              <h2 style={RUBRO}>NIVEL DE DETALLE</h2>
              <p style={PIE_RUBRO}>
                Cuánto se dibuja tu avatar. Cada nivel suma algo al anterior y se queda para siempre, también
                si cambias de forma o de paleta.
              </p>
              <div data-niveles style={{ ...REJILLA, marginBottom: "26px" }}>
                {NIVELES.map((n) => (
                  <CeldaNivel key={n} nivel={n} perfil={perfil} onComprar={comprar} comprando={comprando} />
                ))}
              </div>
            </Entrada>

            {/* ── las formas ── */}
            <Entrada orden={4} modo="sube">
              <h2 style={RUBRO}>FORMAS</h2>
              <p style={PIE_RUBRO}>Geometrías nuevas. Las cinco de siempre siguen siendo tuyas y no se compran.</p>
              <div data-formas style={{ ...REJILLA, marginBottom: "26px" }}>
                {FORMAS_COMPRABLES.map((f) => (
                  <CeldaPieza key={f} tipo="forma" clave={f} perfil={perfil} onComprar={comprarLaPieza} comprando={comprando} />
                ))}
              </div>
            </Entrada>

            {/* ── las paletas ── */}
            <Entrada orden={5} modo="sube">
              <h2 style={RUBRO}>PALETAS</h2>
              <p style={PIE_RUBRO}>Los dos pares de color que faltaban. Van con cualquier forma y con cualquier nivel.</p>
              <div data-paletas style={{ ...REJILLA, marginBottom: "30px" }}>
                {PALETAS_COMPRABLES.map((p) => (
                  <CeldaPieza key={p} tipo="paleta" clave={p} perfil={perfil} onComprar={comprarLaPieza} comprando={comprando} />
                ))}
              </div>
            </Entrada>

            {/* ── cómo se ganan, entera y sin acordeón ── */}
            <Entrada orden={6} modo="fondo">
              <section data-como-ganar style={TARJETA}>
                <h2 style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: FAE.teal, margin: "0 0 6px" }}>
                  CÓMO GANAR CRISTALES
                </h2>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {FUENTES.map((f) => <Fuente key={f.id} fuente={f} />)}
                </ul>
              </section>
            </Entrada>

            {error && (
              <p role="alert" style={{ fontSize: "13px", lineHeight: 1.5, color: FAE.ambar, margin: "16px 0 0" }}>
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
