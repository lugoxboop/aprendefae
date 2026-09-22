import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { FAE } from "../../theme.js";
import Logo from "../Logo.jsx";
import IconoCristal from "../shared/IconoCristal.jsx";
import Avatar from "../avatar/Avatar.jsx";
import { useAuth } from "../../auth/AuthProvider.jsx";
import { marcarVisitada } from "../../tienda/novedades.js";
import { combinacionDe, ETIQUETA_NIVEL, NOMBRE_NIVEL } from "../../avatar/generador.js";
import {
  FUENTES, NIVELES_COMPRABLES, comprarNivel, estadoDeNivel, faltanPara, precioDe, saldoDe,
} from "../../cristales/cristales.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA TIENDA.
 *
 * Tres bloques, de arriba abajo: el saldo, cómo se gana y qué se puede comprar.
 *
 * ═══════════ LA TABLA DE CÓMO GANAR VA SIEMPRE A LA VISTA ═══════════
 *
 * No detrás de un acordeón ni de un «¿cómo consigo Cristales?». Un precio sin
 * la forma de conseguir el dinero es una pared, y esconder la tabla convierte
 * la Tienda en una lista de cosas que no puedes tener.
 *
 * ═══════════ Y NADA DE CORAL ═══════════
 *
 * En todo el sitio el coral significa error. Un nivel que todavía no alcanzas
 * no es un error: es un precio. Va en gris atenuado, diciendo exactamente
 * cuántos Cristales faltan —un número, no un «insuficiente»—. Teal solo para lo
 * que ya es tuyo y para el botón de lo que sí alcanzas.
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
      <span style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
        <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "14px", color: FAE.teal, fontVariantNumeric: "tabular-nums" }}>
          +{fuente.cuanto}
        </span>
        <IconoCristal tamano={13} />
      </span>
    </li>
  );
}

function TarjetaNivel({ nivel, perfil, onComprar, comprando }) {
  const { forma, paleta } = combinacionDe(perfil);
  const estado = estadoDeNivel(perfil, nivel);
  const faltan = faltanPara(perfil, nivel);
  const precio = precioDe(nivel);
  const comprado = estado === "comprado";
  const alcanza = estado === "alcanzable";

  return (
    <div
      data-nivel={nivel}
      data-estado={estado}
      style={{
        ...TARJETA,
        /*
         * A 375 px no caben la miniatura, el nombre con su precio y el botón en
         * una sola fila sin partir «te faltan 225» por la mitad. Con flexWrap y
         * una base de 140 px para el texto, el botón baja a su propia línea en
         * el teléfono y se queda al lado en cuanto hay sitio.
         */
        display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap",
        borderColor: comprado ? FAE.teal : "rgba(248,249,250,0.12)",
        background: comprado ? "rgba(42,157,143,0.10)" : TARJETA.background,
        opacity: estado === "falta" ? 0.62 : 1,
      }}
    >
      <Avatar forma={forma} paleta={paleta} nivel={nivel} tamano={56} />

      <div style={{ flex: "1 1 140px", minWidth: 0 }}>
        <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "15px", margin: "0 0 2px" }}>
          {ETIQUETA_NIVEL(nivel)} · {NOMBRE_NIVEL[nivel]}
        </p>
        {comprado ? (
          <p style={{ fontSize: "12.5px", color: FAE.teal, margin: 0 }}>Ya es tuyo</p>
        ) : (
          <p style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap", fontSize: "12.5px", color: "rgba(248,249,250,0.6)", margin: 0 }}>
            <IconoCristal tamano={12} apagado={!alcanza} />
            <span style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{precio}</span>
            {!alcanza && (
              <span data-faltan={faltan} style={{ color: "rgba(248,249,250,0.5)", whiteSpace: "nowrap" }}>
                · te faltan {faltan}
              </span>
            )}
          </p>
        )}
      </div>

      {!comprado && (
        <button
          type="button"
          data-comprar={nivel}
          disabled={!alcanza || Boolean(comprando)}
          onClick={() => onComprar(nivel)}
          style={{
            fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
            padding: "9px 15px", borderRadius: "999px", border: "none",
            flexShrink: 0, marginLeft: "auto",
            cursor: alcanza && !comprando ? "pointer" : "default",
            backgroundColor: alcanza ? FAE.teal : "rgba(248,249,250,0.08)",
            color: alcanza ? FAE.bg : "rgba(248,249,250,0.4)",
          }}
        >
          {comprando === nivel ? "…" : "Desbloquear"}
        </button>
      )}
    </div>
  );
}

/* `onComprar` es inyectable por la misma razón que `onGuardar` en el selector:
 * la compra de verdad va contra la base y la pantalla se prueba sin ella. */
export default function TiendaView({ onBack, onComprar = comprarNivel }) {
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
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "clamp(18px, 3vh, 30px) 24px 56px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "26px" }}>
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
            {/* ── el saldo ── */}
            <div data-saldo style={{ ...TARJETA, display: "flex", alignItems: "center", gap: "14px", marginBottom: "22px" }}>
              <IconoCristal tamano={30} />
              <div>
                <p style={ETIQUETA}>Cristales</p>
                <p style={NUMERO}>{saldoDe(perfil)}</p>
              </div>
            </div>

            {/* ── cómo se ganan ── */}
            <section data-como-ganar style={{ ...TARJETA, marginBottom: "22px" }}>
              <h2 style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: FAE.teal, margin: "0 0 6px" }}>
                CÓMO GANAR CRISTALES
              </h2>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {FUENTES.map((f) => <Fuente key={f.id} fuente={f} />)}
              </ul>
            </section>

            {/* ── lo que se puede comprar ── */}
            <h2 style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: "rgba(248,249,250,0.5)", margin: "0 0 12px" }}>
              DISPONIBLE
            </h2>
            <p style={{ fontSize: "13px", lineHeight: 1.5, color: "rgba(248,249,250,0.55)", margin: "0 0 14px" }}>
              Niveles de detalle para tu avatar. Se compran en el orden que quieras, son para siempre y no se
              pierden al cambiar de forma o de paleta.
            </p>
            <div style={{ display: "grid", gap: "12px" }}>
              {NIVELES_COMPRABLES.map((n) => (
                <TarjetaNivel key={n} nivel={n} perfil={perfil} onComprar={comprar} comprando={comprando} />
              ))}
            </div>

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
