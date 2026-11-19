import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, LayoutGrid, Crown, Glasses, Shirt, Backpack, X, Sparkles, Check } from "lucide-react";
import { FAE, ANCHO_ESTRECHO } from "../../theme.js";
import Logo from "../Logo.jsx";
import IconoCristal from "../shared/IconoCristal.jsx";
import Mascota from "../Mascota.jsx";
import MeshGradientBackground from "../backgrounds/MeshGradientBackground.jsx";
import Entrada, { EstiloEntrada, entrada } from "../shared/Entrada.jsx";
import { useAuth } from "../../auth/AuthProvider.jsx";
import { marcarVisitada } from "../../tienda/novedades.js";
import { mascotaDe, ACCESORIOS_META, ZONAS_ACCESORIO } from "../../mascota/mascotas.js";
import { chocaCon } from "../../mascota/accesorios-marioneta.js";
import {
  FUENTES, comprarAccesorio, equiparAccesorio, estadoDeAccesorio, faltanParaAccesorio,
  precioDeAccesorio, saldoDe, puestosDe,
} from "../../cristales/cristales.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA TIENDA — VESTIDOR DE VIDEOJUEGO (19-nov).
 *
 * Mateo: «hazlo como una tienda de videojuego, un RPG; que se vea la gran
 * cantidad de cosméticos de una vez, que los precios se entiendan, y que haya
 * un diseñador de avatar como el de Roblox». La versión del 28-oct era una
 * rejilla de dos en dos: a 1280 px se veían DOS accesorios en la primera
 * pantalla (sonda scripts/tienda/capturas-tienda.mjs) y probarse algo exigía
 * comprarlo e ir a «Mi avatar».
 *
 * Lo que hace esta versión:
 *
 *   1. EL VESTIDOR A UN LADO. La mascota grande, sobre un pedestal, siempre a
 *      la vista (fija a la izquierda en escritorio; arriba, y una barrita fija
 *      abajo, en el teléfono). Es lo que se está vistiendo.
 *   2. PROBAR ANTES DE COMPRAR. Tocar cualquier accesorio se lo pone a la
 *      mascota en la vista previa, sin gastar nada. Lo que ya es tuyo se pone
 *      y se quita de verdad (mascota_accesorio_equipar); lo que no, queda
 *      «probándose» con su precio y su botón de comprar al lado de la mascota.
 *      Las ranuras mandan: dos sombreros a la vez no (chocaCon).
 *   3. REJILLA DENSA Y FILTROS. Cartas pequeñas en auto-fill (cinco por fila a
 *      1280), pestañas por zona con su cuenta y un filtro «Me alcanza / Míos».
 *   4. PRECIOS CLAROS. El precio es una ficha grande con el cristal; si no
 *      alcanza, una barra dice cuánto llevas y cuánto falta, en número.
 *   5. RAREZA POR PRECIO. Común, Raro, Épico, Legendario: un borde y un brillo
 *      que salen SOLO del precio. No es un dato nuevo: lo vistoso ya costaba
 *      más (cristales.js); ahora se ve antes de leer el número.
 *
 * Intocado: la compra (comprarAccesorio y su función en la base), los
 * precios, el saldo y los datos del estudiante. Tampoco el encuadre de las
 * piezas sobre la mascota (accesorios-marioneta.js), que va por otro lado.
 *
 * ═══════════ LO QUE SIGUE IGUAL, Y POR QUÉ ═══════════
 *
 * · La tabla de cómo ganar Cristales, entera y sin acordeón: un precio sin la
 *   forma de conseguir el dinero es una pared.
 * · Nada de coral: un accesorio que no alcanzas no es un error, es un precio.
 *   El aviso de una compra fallida va en ámbar.
 * · Teal de texto solo en tres sitios (YaEsTuyo, Ganancia y el rótulo de la
 *   tabla): lo cuenta el trinquete de teal-no-es-texto.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const TARJETA = {
  borderRadius: "18px",
  background: "rgba(29,53,87,0.55)",
  border: "1px solid rgba(248,249,250,0.12)",
  padding: "16px 18px",
};

/* La rareza sale del precio. Colores fuera de coral y del ámbar de alertas. */
const RAREZAS = [
  { id: "comun", nombre: "Común", hasta: 45, rgb: "159,179,200" },
  { id: "raro", nombre: "Raro", hasta: 75, rgb: "111,134,255" },
  { id: "epico", nombre: "Épico", hasta: 110, rgb: "181,123,255" },
  { id: "legendario", nombre: "Legendario", hasta: Infinity, rgb: "255,201,92" },
];
export const rarezaDe = (precio) => RAREZAS.find((r) => precio <= r.hasta);

const ICONO_ZONA = { todo: LayoutGrid, cabeza: Crown, cara: Glasses, cuello: Shirt, espalda: Backpack };
const CORTO = { cabeza: "Cabeza", cara: "Cara", cuello: "Cuello y pecho", espalda: "Espalda" };
const ZONAS = [{ id: "todo", nombre: "Todo" }, ...ZONAS_ACCESORIO.map((z) => ({ ...z, corto: CORTO[z.id] }))];
const FILTROS = [
  { id: "todos", nombre: "Todos" },
  { id: "alcanza", nombre: "Me alcanza" },
  { id: "mios", nombre: "Míos" },
];

/* Lo de la cabeza y la cara se enseña de cerca; lo del cuerpo, entero. */
const verDeCerca = (zona, especie) => zona === "cabeza" || zona === "cara" || (zona === "cuello" && especie !== "conejo");

/* Poner `id` sobre una lista de puestos, quitando lo que choca con él. */
function ponerEn(lista, id) {
  const fuera = new Set(chocaCon(id, lista));
  return [...lista.filter((k) => !fuera.has(k) && k !== id), id];
}

const ESTILO = `
.tnd-layout { display: grid; gap: 22px; grid-template-columns: minmax(0, 1fr); }
@media (min-width: 900px) {
  .tnd-layout { grid-template-columns: 340px minmax(0, 1fr); align-items: start; gap: 28px; }
  .tnd-vestidor { position: sticky; top: 84px; }
  .tnd-barra-movil { display: none !important; }
}
.tnd-rejilla { display: grid; gap: 10px; grid-template-columns: repeat(auto-fill, minmax(138px, 1fr)); }
@media (max-width: 899px) { .tnd-rejilla { grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 8px; } }
@media (max-width: 359px) { .tnd-rejilla { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.tnd-carta { transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
.tnd-carta:hover { transform: translateY(-3px); box-shadow: 0 14px 30px -12px rgba(var(--rz), .55), 0 0 0 1px rgba(var(--rz), .45) inset; }
.tnd-probar { all: unset; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 100%; border-radius: 12px; }
.tnd-probar:focus-visible, .tnd-tab:focus-visible, .tnd-accion:focus-visible { outline: 2px solid ${FAE.text}; outline-offset: 2px; }
.tnd-tabs { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
.tnd-tabs::-webkit-scrollbar { display: none; }
.tnd-pedestal { animation: tnd-brillo 4s ease-in-out infinite; }
@keyframes tnd-brillo { 0%,100% { opacity: .75; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .tnd-carta, .tnd-pedestal { transition: none; animation: none; } .tnd-carta:hover { transform: none; } }
/* La pastilla de la cuenta va fija arriba a la izquierda: en escritorio la
   tienda es ancha y la cabecera empieza donde está la pastilla. */
@media (min-width: ${ANCHO_ESTRECHO + 1}px) {
  .tnd-cabecera { padding-left: max(0px, calc(122px - max(0px, (100vw - 1200px) / 2))); }
}
/* En el teléfono el vestidor se compacta: mascota a la izquierda, lo puesto a
   la derecha, para que los accesorios asomen en la primera pantalla. */
@media (max-width: 899px) {
  .tnd-vestidor-cuerpo { display: grid; grid-template-columns: 132px minmax(0, 1fr); gap: 12px; align-items: center; }
  .tnd-escena { height: 156px !important; }
  .tnd-escena svg[data-mascota] { width: 124px; height: auto; }
  .tnd-solo-escritorio { display: none !important; }
  .tnd-etq-texto { display: none; }
  .tnd-etq { padding: 3px !important; }
}
`;

/* «Ya es tuyo» vive en UN solo sitio: el trinquete de teal cuenta los textos. */
function YaEsTuyo({ genero = "o" }) {
  return <span style={{ fontSize: "11.5px", fontWeight: 600, color: FAE.teal }}>{`Ya es tuy${genero}`}</span>;
}

/* «+N ◆», lo que se GANA. Un solo sitio, por la misma razón. */
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

/* La ficha de precio: el cristal y el número, grandes. */
function FichaPrecio({ precio, alcanza, tamano = 15 }) {
  return (
    <span
      data-precio={precio}
      style={{
        display: "inline-flex", alignItems: "center", gap: "5px",
        padding: "4px 10px 4px 8px", borderRadius: "999px",
        background: alcanza ? "rgba(42,157,143,0.16)" : "rgba(248,249,250,0.06)",
        border: `1px solid ${alcanza ? "rgba(42,157,143,0.45)" : "rgba(248,249,250,0.12)"}`,
      }}
    >
      <IconoCristal tamano={tamano} apagado={!alcanza} />
      <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: `${tamano}px`, color: FAE.text, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
        {precio}
      </span>
    </span>
  );
}

/* Cuánto llevas de lo que cuesta: una barra y el número que falta. */
function BarraFalta({ saldo, precio, faltan, color }) {
  const pct = Math.max(4, Math.min(100, Math.round((saldo / precio) * 100)));
  return (
    <span style={{ display: "block", width: "100%" }}>
      <span style={{ display: "block", height: "5px", borderRadius: "999px", background: "rgba(248,249,250,0.08)", overflow: "hidden" }}>
        <span style={{ display: "block", width: `${pct}%`, height: "100%", borderRadius: "999px", background: `rgba(${color},0.75)` }} />
      </span>
      <span data-faltan={faltan} style={{ display: "block", marginTop: "4px", fontSize: "11px", color: "rgba(248,249,250,0.55)", whiteSpace: "nowrap" }}>
        te faltan {faltan}
      </span>
    </span>
  );
}

function Etiqueta({ children, fondo, color = FAE.bg }) {
  return (
    <span className="tnd-etq" style={{
      flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "3px",
      padding: "2px 7px", borderRadius: "999px", background: fondo, color,
      fontFamily: "Sora, sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.02em",
    }}>
      {children}
    </span>
  );
}

/* La carta de un accesorio: la mascota con él puesto, rareza, precio y acción. */
function Carta({ meta, perfil, puesto, probando, onProbar, onComprar, onPoner, comprando }) {
  const estado = estadoDeAccesorio(perfil, meta.id);
  const comprado = estado === "comprado";
  const alcanza = estado === "alcanzable";
  const precio = precioDeAccesorio(meta.id);
  const rz = rarezaDe(precio);
  const { especie, paleta, ojos } = mascotaDe(perfil);
  const activo = puesto || probando;
  return (
    <div
      data-accesorio={meta.id}
      data-estado={estado}
      data-rareza={rz.id}
      className="tnd-carta"
      style={{
        "--rz": rz.rgb,
        position: "relative", borderRadius: "16px", padding: "10px 10px 10px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "7px", textAlign: "center",
        background: `linear-gradient(180deg, rgba(${rz.rgb},0.16) 0%, rgba(29,53,87,0.62) 46%, rgba(14,27,46,0.78) 100%)`,
        border: "1px solid",
        borderColor: comprado ? FAE.teal : `rgba(${rz.rgb},0.38)`,
        boxShadow: activo ? `0 0 0 2px rgba(${probando ? "248,249,250" : "42,157,143"},0.85), 0 10px 26px -12px rgba(${rz.rgb},0.6)` : "none",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px", width: "100%", minHeight: "20px" }}>
        <span style={{
          fontFamily: "Sora, sans-serif", fontSize: "9.5px", fontWeight: 700, minWidth: 0,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          letterSpacing: "0.1em", textTransform: "uppercase", color: `rgb(${rz.rgb})`,
        }}>
          {rz.nombre}
        </span>
        {puesto && <Etiqueta fondo={FAE.teal}><Check size={10} strokeWidth={3} /><span className="tnd-etq-texto">Puesto</span></Etiqueta>}
        {!puesto && probando && <Etiqueta fondo={FAE.text}><Sparkles size={10} /><span className="tnd-etq-texto">Probando</span></Etiqueta>}
      </span>
      <button
        type="button"
        className="tnd-probar"
        data-probar={meta.id}
        aria-pressed={activo}
        aria-label={comprado ? `${puesto ? "Quitarle" : "Ponerle"} ${meta.nombre}` : `Probarle ${meta.nombre}`}
        onClick={() => (comprado ? onPoner(meta.id, !puesto) : onProbar(meta.id))}
        style={{
          height: "84px",
          background: `radial-gradient(closest-side, rgba(${rz.rgb},0.28), transparent 80%)`,
        }}
      >
        <span style={{ opacity: estado === "falta" ? 0.78 : 1, display: "flex" }}>
          <Mascota especie={especie} paleta={paleta} ojos={ojos} puestos={[meta.id]} tamano={78}
            encuadre={verDeCerca(meta.zona, especie) ? "busto" : "cuerpo"} />
        </span>
      </button>
      <span data-nombre style={{
        fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "12.5px", lineHeight: 1.2,
        width: "100%", minHeight: "30px", display: "flex", alignItems: "center", justifyContent: "center",
        overflowWrap: "anywhere",
      }}>
        {meta.nombre}
      </span>
      {comprado ? (
        <>
          <YaEsTuyo />
          <button
            type="button"
            className="tnd-accion"
            data-poner-accesorio={meta.id}
            onClick={() => onPoner(meta.id, !puesto)}
            style={botonEstilo(puesto ? "suave" : "lleno")}
          >
            {puesto ? "Quitar" : "Ponérselo"}
          </button>
        </>
      ) : (
        <>
          <FichaPrecio precio={precio} alcanza={alcanza} />
          {!alcanza && <BarraFalta saldo={saldoDe(perfil)} precio={precio} faltan={faltanParaAccesorio(perfil, meta.id)} color={rz.rgb} />}
          <button
            type="button"
            className="tnd-accion"
            data-comprar-accesorio={meta.id}
            disabled={!alcanza || comprando === meta.id}
            onClick={() => onComprar(meta.id)}
            style={botonEstilo(alcanza ? "lleno" : "apagado")}
          >
            {comprando === meta.id ? "…" : "Comprar"}
          </button>
        </>
      )}
    </div>
  );
}

function botonEstilo(tipo) {
  return {
    fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700,
    padding: "7px 0", minHeight: "32px", borderRadius: "999px", width: "100%", marginTop: "auto",
    cursor: tipo === "apagado" ? "default" : "pointer",
    border: tipo === "suave" ? "1px solid rgba(248,249,250,0.22)" : "none",
    backgroundColor: tipo === "lleno" ? FAE.teal : tipo === "suave" ? "transparent" : "rgba(248,249,250,0.07)",
    color: tipo === "lleno" ? FAE.bg : tipo === "suave" ? FAE.text : "rgba(248,249,250,0.4)",
  };
}

/* Una fila del vestidor: lo que se lleva o lo que se está probando. */
function FilaLook({ meta, children, onQuitar, etiquetaQuitar }) {
  return (
    <li style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 0", borderTop: "1px solid rgba(248,249,250,0.08)" }}>
      <span style={{ flex: 1, minWidth: 0, fontSize: "13px", lineHeight: 1.3 }}>{meta.nombre}</span>
      {children}
      <button
        type="button"
        onClick={onQuitar}
        aria-label={etiquetaQuitar}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", flexShrink: 0,
          borderRadius: "999px", border: "1px solid rgba(248,249,250,0.16)", background: "transparent", cursor: "pointer", padding: 0,
        }}
      >
        <X size={14} color={FAE.text} />
      </button>
    </li>
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

const META = Object.fromEntries(ACCESORIOS_META.map((a) => [a.id, a]));

/* `onComprar` y `onEquipar` son inyectables: la compra y el equipar de verdad
 * van contra la base, y la pantalla se prueba sin ella. */
export default function TiendaView({ onBack, onComprarAccesorio = comprarAccesorio, onEquiparAccesorio = equiparAccesorio }) {
  const { perfil, session, pedirCuenta, aplicarPerfil, refrescarPerfil } = useAuth();
  const [comprando, setComprando] = useState(null);
  const [error, setError] = useState(null);
  const [zona, setZona] = useState("todo");
  const [filtro, setFiltro] = useState("todos");
  /* Lo que se está probando y todavía no es suyo. Vive solo en la pantalla. */
  const [probando, setProbando] = useState([]);
  /* La barrita del teléfono sale solo cuando el vestidor ya no se ve. */
  const refVestidor = useRef(null);
  const [vestidorVisible, setVestidorVisible] = useState(true);
  useEffect(() => {
    const el = refVestidor.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([e]) => setVestidorVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [perfil != null]);

  /* El saldo se vuelve a leer al entrar: los Cristales de racha los paga el
     servidor sin pasar por el cliente, y un saldo viejo apaga botones. */
  useEffect(() => {
    if (session) refrescarPerfil();
  }, [session, refrescarPerfil]);

  /* Entrar apaga el punto del menú; depende de `perfil` para volver a correr
     cuando llega la fila fresca y después de comprar. */
  useEffect(() => {
    if (session) marcarVisitada(session.user?.id, perfil);
  }, [session, perfil]);

  const puestos = useMemo(() => puestosDe(perfil), [perfil]);
  /* El look de la vista previa: lo puesto de verdad + lo que se está probando. */
  const look = useMemo(() => probando.reduce(ponerEn, puestos), [probando, puestos]);
  const enLook = new Set(look);
  const probandoVisibles = probando.filter((id) => enLook.has(id));

  const probar = (id) => {
    setError(null);
    setProbando((p) => {
      if (p.includes(id)) return p.filter((k) => k !== id);
      const fuera = new Set(chocaCon(id, p));
      return [...p.filter((k) => !fuera.has(k)), id];
    });
  };

  const aplicar = (r) => {
    if (r?.error) { setError(r.error); return false; }
    if (r?.perfil) aplicarPerfil(r.perfil);
    return r?.perfil ?? null;
  };

  /* Poner o quitar algo ya comprado. Al ponerlo, se quita lo de su ranura. */
  const poner = async (id, si, base = puestos) => {
    setError(null);
    if (si) {
      setProbando((p) => p.filter((k) => k !== id && !chocaCon(id, [k]).length));
      for (const otro of chocaCon(id, base)) {
        if (aplicar((await onEquiparAccesorio(otro, false)) ?? {}) === false) return;
      }
    }
    aplicar((await onEquiparAccesorio(id, si)) ?? {});
  };

  const comprar = async (id) => {
    setComprando(id);
    setError(null);
    const r = (await onComprarAccesorio(id)) ?? {};
    setComprando(null);
    const fila = aplicar(r);
    /* Si se lo estaba probando, al comprarlo se le queda puesto. */
    if (fila && probando.includes(id)) {
      setProbando((p) => p.filter((k) => k !== id));
      await poner(id, true, puestosDe(fila));
    }
  };

  const especieDe = perfil ? mascotaDe(perfil) : null;
  const saldo = perfil ? saldoDe(perfil) : 0;
  const totalProbando = probandoVisibles.reduce((s, id) => s + precioDeAccesorio(id), 0);

  const visibles = perfil ? ACCESORIOS_META.filter((a) => {
    if (zona !== "todo" && a.zona !== zona) return false;
    const e = estadoDeAccesorio(perfil, a.id);
    if (filtro === "alcanza") return e === "alcanzable";
    if (filtro === "mios") return e === "comprado";
    return true;
  }) : [];
  const cuentaZona = (z) => ACCESORIOS_META.filter((a) => z === "todo" || a.zona === z).length;

  const escena = (tamano) => (
    <div className="tnd-escena" style={{ position: "relative", height: `${tamano + 40}px`, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <span aria-hidden="true" className="tnd-pedestal" style={{
        position: "absolute", left: "50%", bottom: "6px", transform: "translateX(-50%)",
        width: "78%", height: "34px", borderRadius: "50%",
        background: "radial-gradient(closest-side, rgba(42,157,143,0.55), rgba(42,157,143,0.12) 70%, transparent)",
        boxShadow: "0 0 40px rgba(42,157,143,0.35)",
      }} />
      <span aria-hidden="true" style={{
        position: "absolute", inset: "0 10% 20px", borderRadius: "50%",
        background: "radial-gradient(closest-side, rgba(111,134,255,0.18), transparent)",
      }} />
      <span style={{ position: "relative", marginBottom: "18px", display: "flex" }}>
        <Mascota especie={especieDe.especie} paleta={especieDe.paleta} ojos={especieDe.ojos} puestos={look}
          tamano={tamano} encuadre="cuerpo" animo="tranquila" titulo={`Tu mascota: ${perfil.mascota_nombre || ""}`} />
      </span>
      {probandoVisibles.length > 0 && (
        <span style={{
          position: "absolute", bottom: "0", left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap",
          display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 9px", borderRadius: "999px", background: "rgba(248,249,250,0.12)",
          border: "1px solid rgba(248,249,250,0.22)", fontSize: "11px", fontWeight: 600,
        }}>
          <Sparkles size={11} /> Vista previa
        </span>
      )}
    </div>
  );

  return (
    <div style={{ position: "relative", minHeight: "100vh", backgroundColor: FAE.bg, fontFamily: "Inter, sans-serif", color: FAE.text }}>
      <MeshGradientBackground />
      <EstiloEntrada />
      <style>{ESTILO}</style>
      <div style={{ position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto", padding: "clamp(18px, 3vh, 30px) clamp(16px, 3vw, 28px) 56px" }}>
        <div {...entrada(0, "baja")} className="fae-cabecera tnd-cabecera" style={{ ...entrada(0, "baja").style, display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
          <span className="fae-cabecera-marca"><Logo variant="symbol" size={26} theme="dark" /></span>
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "44px", height: "44px", padding: 0, flexShrink: 0,
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
          <div style={{ ...TARJETA, maxWidth: "620px" }}>
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
        ) : !perfil ? (
          /* La sesión llega antes que el perfil (recarga en #/tienda): un aviso
             en vez de una pantalla en blanco (sonda del 18-nov). */
          <div style={{ ...TARJETA, maxWidth: "620px" }} data-tienda-cargando>
            <p style={{ fontSize: "14.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.7)", margin: 0 }}>
              Cargando tu Tienda…
            </p>
          </div>
        ) : (
          <div className="tnd-layout">
            {/* ── el vestidor ── */}
            <Entrada orden={1} modo="crece" className="tnd-vestidor">
              <aside
                data-escaparate
                ref={refVestidor}
                style={{
                  ...TARJETA, padding: "16px",
                  background: "linear-gradient(180deg, rgba(42,157,143,0.16) 0%, rgba(29,53,87,0.62) 45%, rgba(14,27,46,0.72) 100%)",
                  boxShadow: "0 24px 60px -30px rgba(42,157,143,0.45)",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "10px" }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: "11px", letterSpacing: "0.14em", fontWeight: 700, fontFamily: "Sora, sans-serif", color: "rgba(248,249,250,0.5)", margin: "0 0 2px" }}>
                      VESTIDOR
                    </p>
                    <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", margin: 0, lineHeight: 1.25, overflowWrap: "anywhere" }}>
                      {perfil.mascota_nombre || "Tu mascota"}
                    </p>
                  </div>
                  <span data-saldo style={{
                    display: "inline-flex", alignItems: "center", gap: "6px", flexShrink: 0,
                    padding: "6px 12px 6px 9px", borderRadius: "999px",
                    background: "rgba(14,27,46,0.6)", border: "1px solid rgba(42,157,143,0.45)",
                  }}>
                    <IconoCristal tamano={18} />
                    <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "19px", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{saldo}</span>
                    <span style={{ fontSize: "11.5px", color: "rgba(248,249,250,0.55)" }}>Cristales</span>
                  </span>
                </div>

                <div className="tnd-vestidor-cuerpo">
                {escena(200)}

                {/* Lo que lleva puesto de verdad. */}
                <section data-puestos>
                  <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: 600, color: "rgba(248,249,250,0.7)" }}>Lleva puesto</p>
                  {puestos.length ? (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {puestos.filter((id) => META[id]).map((id) => (
                        <li key={id} style={{
                          display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 3px 3px 10px",
                          borderRadius: "999px", background: "rgba(42,157,143,0.14)", border: "1px solid rgba(42,157,143,0.4)",
                          fontSize: "12px", lineHeight: 1.2,
                        }}>
                          {META[id].nombre}
                          <button
                            type="button"
                            data-quitar-puesto={id}
                            onClick={() => poner(id, false)}
                            aria-label={`Quitarle ${META[id].nombre}`}
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "999px", border: "none", background: "rgba(248,249,250,0.08)", cursor: "pointer", padding: 0 }}
                          >
                            <X size={12} color={FAE.text} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ margin: 0, fontSize: "12.5px", lineHeight: 1.4, color: "rgba(248,249,250,0.5)" }}>Nada todavía. Toca un accesorio para probárselo.</p>
                  )}
                </section>
                </div>

                {/* Lo que se está probando, con su precio y su botón. */}
                {probandoVisibles.length > 0 && (
                  <section data-probando style={{ margin: "12px 0 0" }}>
                    <p style={{ display: "flex", justifyContent: "space-between", margin: "0 0 2px", fontSize: "12px", fontWeight: 600, color: "rgba(248,249,250,0.7)" }}>
                      <span>Probándote</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontVariantNumeric: "tabular-nums" }}>Todo junto: {totalProbando} <IconoCristal tamano={11} /></span>
                    </p>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {probandoVisibles.map((id) => {
                        const alcanza = estadoDeAccesorio(perfil, id) === "alcanzable";
                        return (
                          <FilaLook key={id} meta={META[id]} onQuitar={() => probar(id)} etiquetaQuitar={`Dejar de probar ${META[id].nombre}`}>
                            <FichaPrecio precio={precioDeAccesorio(id)} alcanza={alcanza} tamano={12} />
                            <button
                              type="button"
                              data-comprar-probado={id}
                              disabled={!alcanza || comprando === id}
                              onClick={() => comprar(id)}
                              style={{ ...botonEstilo(alcanza ? "lleno" : "apagado"), width: "auto", padding: "5px 12px", minHeight: "28px", marginTop: 0 }}
                            >
                              {comprando === id ? "…" : alcanza ? "Comprar" : `Faltan ${faltanParaAccesorio(perfil, id)}`}
                            </button>
                          </FilaLook>
                        );
                      })}
                    </ul>
                  </section>
                )}


                <p data-dos-monedas style={{ margin: "14px 0 0", fontSize: "12px", lineHeight: 1.5, color: "rgba(248,249,250,0.55)" }}>
                  Aquí se paga con Cristales. Tus FP no se gastan: miden lo que llevas aprendido.
                </p>
                <ul data-atajos className="tnd-solo-escritorio" style={{ listStyle: "none", display: "flex", gap: "6px", flexWrap: "wrap", padding: 0, margin: "10px 0 0" }}>
                  {FUENTES.filter((f) => ["racha-7", "actividades", "podio"].includes(f.id)).map((f) => (
                    <li key={f.id} style={{
                      display: "flex", alignItems: "center", gap: "5px", flex: "1 1 auto",
                      padding: "5px 10px", borderRadius: "999px",
                      background: "rgba(248,249,250,0.05)", border: "1px solid rgba(248,249,250,0.10)",
                      fontSize: "11px", color: "rgba(248,249,250,0.68)", whiteSpace: "nowrap",
                    }}>
                      {f.id === "racha-7" ? "7 días seguidos" : f.id === "actividades" ? "5 actividades" : "Podio de liga"}
                      <Ganancia cuanto={String(f.cuanto).split(" / ")[0]} tamano={12} />
                    </li>
                  ))}
                </ul>
              </aside>
            </Entrada>

            {/* ── la tienda ── */}
            <div style={{ minWidth: 0 }}>
              <Entrada orden={2} modo="sube">
                <div style={{ marginBottom: "14px" }}>
                  <h2 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(20px, 2.4vw, 26px)", letterSpacing: "-0.02em", margin: "0 0 4px" }}>
                    Accesorios
                  </h2>
                  <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.5, color: "rgba(248,249,250,0.6)" }}>
                    Toca uno para probárselo a {perfil.mascota_nombre || "tu mascota"}. Lo que compres es tuyo para siempre.
                  </p>
                </div>
                <div role="tablist" aria-label="Zonas" className="tnd-tabs" data-zonas style={{ marginBottom: "8px" }}>
                  {ZONAS.map((z) => {
                    const Icono = ICONO_ZONA[z.id];
                    const on = zona === z.id;
                    return (
                      <button
                        key={z.id}
                        type="button"
                        role="tab"
                        aria-selected={on}
                        className="tnd-tab"
                        data-zona={z.id}
                        onClick={() => setZona(z.id)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "6px", flexShrink: 0,
                          padding: "8px 13px", minHeight: "38px", borderRadius: "12px", cursor: "pointer",
                          fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600,
                          border: `1px solid ${on ? "rgba(42,157,143,0.8)" : "rgba(248,249,250,0.12)"}`,
                          background: on ? "linear-gradient(180deg, rgba(42,157,143,0.35), rgba(42,157,143,0.14))" : "rgba(29,53,87,0.5)",
                          color: on ? FAE.text : "rgba(248,249,250,0.72)",
                        }}
                      >
                        <Icono size={15} />
                        {z.corto ?? z.nombre}
                        <span style={{ fontSize: "10.5px", padding: "1px 6px", borderRadius: "999px", background: "rgba(248,249,250,0.1)", fontVariantNumeric: "tabular-nums" }}>
                          {cuentaZona(z.id)}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }} data-filtros>
                  {FILTROS.map((f) => {
                    const on = filtro === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        className="tnd-tab"
                        aria-pressed={on}
                        data-filtro={f.id}
                        onClick={() => setFiltro(f.id)}
                        style={{
                          padding: "5px 12px", minHeight: "30px", borderRadius: "999px", cursor: "pointer",
                          fontSize: "12px", fontWeight: 600,
                          border: `1px solid ${on ? "rgba(248,249,250,0.5)" : "rgba(248,249,250,0.12)"}`,
                          background: on ? "rgba(248,249,250,0.12)" : "transparent",
                          color: on ? FAE.text : "rgba(248,249,250,0.62)",
                        }}
                      >
                        {f.nombre}
                      </button>
                    );
                  })}
                </div>
              </Entrada>

              <Entrada orden={3} modo="sube">
                <div data-accesorios className="tnd-rejilla" style={{ marginBottom: "26px" }}>
                  {visibles.map((a) => (
                    <Carta
                      key={a.id}
                      meta={a}
                      perfil={perfil}
                      puesto={puestos.includes(a.id)}
                      probando={probandoVisibles.includes(a.id)}
                      onProbar={probar}
                      onComprar={comprar}
                      onPoner={poner}
                      comprando={comprando}
                    />
                  ))}
                </div>
                {visibles.length === 0 && (
                  <p data-vacio style={{ ...TARJETA, fontSize: "13.5px", color: "rgba(248,249,250,0.65)", margin: "0 0 26px" }}>
                    {filtro === "mios" ? "Aún no tienes accesorios aquí. Pruébate alguno y cómpralo." : "Nada te alcanza todavía en esta zona. Mira abajo cómo ganar Cristales."}
                  </p>
                )}
              </Entrada>

              {error && (
                <p role="alert" style={{ fontSize: "13px", lineHeight: 1.5, color: FAE.ambar, margin: "0 0 16px" }}>
                  {error}
                </p>
              )}

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
            </div>

            {/* En el teléfono, la mascota baja con el desplazamiento: así se ve
                lo que se prueba sin volver arriba. */}
            <div className="tnd-barra-movil" data-barra-movil aria-hidden={probandoVisibles.length === 0 || vestidorVisible} style={{
              position: "sticky", bottom: "12px", zIndex: 5,
              display: probandoVisibles.length && !vestidorVisible ? "flex" : "none", alignItems: "center", gap: "10px",
              padding: "8px 12px 8px 8px", borderRadius: "18px",
              background: "rgba(14,27,46,0.92)", border: "1px solid rgba(42,157,143,0.5)",
              boxShadow: "0 16px 40px -14px rgba(0,0,0,0.7)", backdropFilter: "blur(10px)",
            }}>
              <span style={{ display: "flex", width: "58px", height: "62px", alignItems: "center", justifyContent: "center", borderRadius: "12px", background: "radial-gradient(closest-side, rgba(42,157,143,0.35), transparent)" }}>
                <Mascota especie={especieDe.especie} paleta={especieDe.paleta} ojos={especieDe.ojos} puestos={look} tamano={58} encuadre="cuerpo" />
              </span>
              <span style={{ flex: 1, minWidth: 0, fontSize: "12.5px", lineHeight: 1.35 }}>
                <span style={{ display: "block", fontWeight: 600 }}>Probándote {probandoVisibles.length}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "rgba(248,249,250,0.6)", fontVariantNumeric: "tabular-nums" }}>Todo junto: {totalProbando} <IconoCristal tamano={11} /> · tienes {saldo}</span>
              </span>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                style={{ ...botonEstilo("suave"), width: "auto", padding: "6px 12px", marginTop: 0 }}
              >
                Ver
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
