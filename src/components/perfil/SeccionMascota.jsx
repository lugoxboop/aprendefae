import { useContext, useEffect, useState } from "react";
import { PawPrint, Palette, Eye, Ruler, Crown, Pencil, ShoppingBag, RotateCcw } from "lucide-react";
import { FAE } from "../../theme.js";
import { NavigationContext } from "../../navigation.js";
import { useAuthOpcional } from "../../auth/AuthProvider.jsx";
import Mascota from "../Mascota.jsx";
import {
  ESPECIES, OJOS_MASCOTA, ACCESORIOS_META, ZONAS_ACCESORIO, COMPLEXIONES, CABEZAS,
  mascotaDe, razasDe, nombreRaza, ajustesDe, irisDe,
} from "../../mascota/mascotas.js";
import { accesoriosDe, puestosDe } from "../../cristales/cristales.js";
import { chocaCon } from "../../mascota/accesorios-marioneta.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL EDITOR DE LA MASCOTA («Mi avatar»), rehecho el 21-nov como el vestidor de
 * un videojuego (Mateo: «inspírate en el personalizador de Roblox; el avatar
 * a la izquierda y a la derecha las modificaciones»).
 *
 *   · IZQUIERDA, el escenario: la mascota grande sobre su luz, con su nombre
 *     (se edita ahí mismo), su ficha («Perro · Rottweiler») y botones para
 *     verla moverse. En escritorio se queda fija mientras se baja el panel.
 *   · DERECHA, el panel por pestañas: Animal, Raza, Ojos, Cuerpo, Accesorios.
 *     Cada opción es una tarjeta que ENSEÑA el resultado —la raza con la
 *     mascota ya pintada de ese pelaje—, no un puntito de color sin nombre.
 *   · En teléfono, el escenario va arriba y las pestañas se deslizan.
 *
 * Cada toque pinta primero y guarda después; si la base dice que no, vuelve a
 * lo de antes y lo dice en palabras. Sin botón de guardar.
 *
 * Lo que escribe: mascota_elegir (especie y nombre), mascota_personalizar
 * (raza), mascota_ojos_elegir (ojos), mascota_ajustar (cuerpo, 0174) y
 * mascota_accesorio_equipar (accesorios).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const sub = { fontSize: "12.5px", color: "rgba(248,249,250,0.55)", margin: "0 0 9px" };

/* La fila de muestras redondas: la usa la cabecera del perfil (HeroePerfil). */
export function FilaMuestras({ etiqueta, items, valor, onElegir, attr, conEtiqueta = true }) {
  return (
    <>
      {conEtiqueta && <p style={{ ...sub, marginTop: "14px" }}>{etiqueta}</p>}
      <div role="radiogroup" aria-label={etiqueta} style={{ display: "flex", flexWrap: "wrap", gap: "9px" }}>
        {items.map((it) => {
          const sel = valor === it.id;
          return (
            <button
              key={it.id}
              type="button"
              role="radio"
              aria-checked={sel}
              aria-label={it.nombre}
              title={it.nombre}
              {...{ [attr]: it.id }}
              onClick={() => onElegir(it.id)}
              style={{
                width: "32px", height: "32px", borderRadius: "999px", cursor: "pointer", padding: 0,
                background: it.muestra,
                border: sel ? `2.5px solid ${FAE.text}` : "2.5px solid rgba(248,249,250,0.18)",
                boxShadow: sel ? `0 0 0 2px ${FAE.teal}` : "none",
              }}
            />
          );
        })}
      </div>
    </>
  );
}

/*
 * El color del pelaje con pintado optimista: pinta ya, guarda después y, si la
 * base dice que no, vuelve al de antes. Lo usa la cabecera del perfil.
 */
export function useColorMascota(perfil) {
  const auth = useAuthOpcional();
  const [paleta, setPaleta] = useState(() => perfil?.mascota_paleta ?? "natural");
  const [error, setError] = useState(null);
  const elegir = async (id) => {
    if (id === paleta) return false;
    const antes = paleta;
    setPaleta(id);
    setError(null);
    const { error: err } = (await auth?.personalizarMascota?.(id)) ?? {};
    if (err) { setPaleta(antes); setError(err); return false; }
    return true;
  };
  return { paleta, elegir, error };
}

const PESTANAS = [
  { id: "animal", nombre: "Animal", Icono: PawPrint },
  { id: "raza", nombre: "Raza", Icono: Palette },
  { id: "ojos", nombre: "Ojos", Icono: Eye },
  { id: "cuerpo", nombre: "Cuerpo", Icono: Ruler },
  { id: "accesorios", nombre: "Accesorios", corto: "Extras", Icono: Crown },
];

const POSES = [
  { id: "tranquila", nombre: "Quieta" },
  { id: "feliz", nombre: "Feliz" },
  { id: "saluda", nombre: "Saluda" },
  { id: "baila", nombre: "Baila" },
];

/* El ojo dibujado de la muestra: iris del color, pupila y brillo. */
function MuestraOjo({ id }) {
  const bicolor = id === "bicolor";
  const iris = id === "natural" ? "#6a4020" : irisDe(id);
  const ojo = (c) => (
    <span className="fae-ed-ojo" style={{ background: `radial-gradient(circle at 50% 55%, #120c08 0 27%, ${c} 29% 66%, #1b130e 70%)` }}>
      <i />
    </span>
  );
  return (
    <span className="fae-ed-ojos" aria-hidden="true">
      {ojo(bicolor ? irisDe("azul") : iris)}
      {ojo(bicolor ? "#8A5A2B" : iris)}
    </span>
  );
}

/* La silueta de la complexión o la cabeza, para el paso de la regla. */
function Silueta({ tipo, valor }) {
  if (tipo === "complexion") {
    const w = 14 + (valor + 2) * 3.5;
    return (
      <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true">
        <circle cx="20" cy="10" r="6.5" fill="currentColor" />
        <rect x={20 - w / 2} y="17" width={w} height="20" rx={w / 2.3} fill="currentColor" />
      </svg>
    );
  }
  const r = 6 + (valor + 2) * 1.6;
  return (
    <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true">
      <rect x="13" y="24" width="14" height="14" rx="6" fill="currentColor" opacity=".55" />
      <circle cx="20" cy={25 - r} r={r} fill="currentColor" />
    </svg>
  );
}

const CSS = `
.fae-ed{display:grid;grid-template-columns:minmax(260px,360px) minmax(0,1fr);gap:22px;align-items:start}
.fae-ed-escenario{position:sticky;top:16px;border-radius:24px;padding:18px 18px 16px;overflow:hidden;
  background:radial-gradient(120% 70% at 50% 18%,rgba(var(--ed-tono),.38),rgba(var(--ed-tono),.08) 55%,rgba(14,27,46,.2) 80%),linear-gradient(180deg,rgba(29,53,87,.75),rgba(14,27,46,.9));
  border:1px solid rgba(248,249,250,.13);box-shadow:0 18px 40px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.08)}
.fae-ed-escenario::after{content:"";position:absolute;left:12%;right:12%;bottom:118px;height:34px;border-radius:50%;
  background:radial-gradient(closest-side,rgba(255,255,255,.16),rgba(255,255,255,0));pointer-events:none}
.fae-ed-figura{display:flex;justify-content:center;position:relative;z-index:1;padding-top:6px}
.fae-ed-figura svg{width:min(100%,290px);height:auto}
.fae-ed-poses{display:flex;gap:6px;justify-content:center;margin:8px 0 14px;position:relative;z-index:1;flex-wrap:wrap}
.fae-ed-pose{font:600 12px Sora,sans-serif;color:#C9D4E3;background:rgba(14,27,46,.55);border:1px solid rgba(248,249,250,.16);border-radius:999px;padding:7px 12px;min-height:34px;cursor:pointer}
.fae-ed-pose[aria-pressed=true]{background:${FAE.text};color:${FAE.bg};border-color:transparent}
.fae-ed-nombre{position:relative;z-index:1;display:flex;align-items:center;gap:8px;background:rgba(14,27,46,.6);border:1px solid rgba(248,249,250,.16);border-radius:14px;padding:0 12px}
.fae-ed-nombre:focus-within{border-color:${FAE.teal};box-shadow:0 0 0 3px rgba(42,157,143,.25)}
.fae-ed-nombre input{flex:1;min-width:0;min-height:46px;background:transparent;border:none;outline:none;color:${FAE.text};font:700 19px Sora,sans-serif;letter-spacing:-.01em}
.fae-ed-ficha{position:relative;z-index:1;margin:10px 2px 0;font-size:13px;color:#A8B6C8;display:flex;flex-wrap:wrap;gap:6px}
.fae-ed-ficha span{background:rgba(248,249,250,.07);border:1px solid rgba(248,249,250,.1);padding:4px 10px;border-radius:999px}
.fae-ed-panel{border-radius:24px;background:rgba(14,27,46,.55);border:1px solid rgba(248,249,250,.12);box-shadow:0 18px 40px rgba(0,0,0,.25);overflow:hidden;min-width:0}
.fae-ed-tabs{display:flex;gap:4px;padding:8px;background:rgba(0,0,0,.18);border-bottom:1px solid rgba(248,249,250,.08);overflow-x:auto;scrollbar-width:none}
.fae-ed-tabs::-webkit-scrollbar{display:none}
.fae-ed-tab{flex:1 0 auto;display:flex;flex-direction:column;align-items:center;gap:4px;padding:9px 12px 8px;min-width:74px;border-radius:14px;border:none;background:transparent;color:#93A3B8;cursor:pointer;font:700 12px Sora,sans-serif;transition:background .15s,color .15s}
.fae-ed-tab:hover{background:rgba(248,249,250,.06);color:${FAE.text}}
.fae-ed-tab[aria-selected=true]{background:rgba(42,157,143,.16);color:${FAE.text};box-shadow:inset 0 0 0 1.5px rgba(42,157,143,.7)}
.fae-ed-cuerpo{padding:18px}
.fae-ed-corto{display:none}
.fae-ed-titulo{font:700 16px Sora,sans-serif;letter-spacing:-.01em;margin:0 0 4px;color:${FAE.text}}
.fae-ed-ayuda{font-size:13px;line-height:1.5;color:rgba(248,249,250,.6);margin:0 0 14px}
.fae-ed-rejilla{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:10px}
.fae-ed-carta{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 6px 10px;border-radius:16px;cursor:pointer;
  background:linear-gradient(180deg,rgba(248,249,250,.07),rgba(248,249,250,.03));border:2px solid rgba(248,249,250,.1);color:${FAE.text};transition:transform .15s,border-color .15s,background .15s}
.fae-ed-carta:hover{transform:translateY(-2px);border-color:rgba(248,249,250,.28)}
.fae-ed-carta[aria-checked=true],.fae-ed-carta[aria-pressed=true]{border-color:${FAE.teal};background:linear-gradient(180deg,rgba(42,157,143,.22),rgba(42,157,143,.06))}
.fae-ed-carta b{font:700 12.5px Sora,sans-serif;text-align:center;line-height:1.25}
.fae-ed-carta small{font-size:11px;color:#93A3B8;text-align:center;line-height:1.3}
.fae-ed-marca{position:absolute;top:6px;right:6px;width:20px;height:20px;border-radius:999px;background:${FAE.teal};color:#06202A;font:800 12px/20px Sora,sans-serif;text-align:center}
.fae-ed-ojos{display:flex;gap:6px;padding:12px 0 8px}
.fae-ed-ojo{position:relative;width:30px;height:30px;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.4)}
.fae-ed-ojo i{position:absolute;top:6px;left:8px;width:8px;height:8px;border-radius:50%;background:#fff}
.fae-ed-regla{margin-bottom:20px}
.fae-ed-regla-cab{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px}
.fae-ed-regla-cab strong{font:700 14px Sora,sans-serif;color:${FAE.text}}
.fae-ed-regla-cab span{font:700 13px Sora,sans-serif;color:#A8B6C8}
.fae-ed-pasos{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;padding:6px;border-radius:16px;background:rgba(0,0,0,.2)}
.fae-ed-paso{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 2px 7px;border-radius:12px;border:none;background:transparent;color:#7E8EA5;cursor:pointer;font:600 11px Sora,sans-serif}
.fae-ed-paso:hover{color:${FAE.text};background:rgba(248,249,250,.05)}
.fae-ed-paso[aria-checked=true]{background:${FAE.text};color:${FAE.bg}}
.fae-ed-boton:disabled{opacity:.45;cursor:default}
.fae-ed-boton{display:inline-flex;align-items:center;gap:7px;min-height:40px;padding:0 16px;border-radius:999px;border:1px solid rgba(248,249,250,.2);background:rgba(248,249,250,.05);color:${FAE.text};font:600 13px Sora,sans-serif;cursor:pointer}
.fae-ed-zona{font:700 11px Sora,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#93A3B8;margin:0 0 8px}
.fae-ed-grupo+.fae-ed-grupo{margin-top:18px}
.fae-ed-acc{width:62px;height:62px;object-fit:contain;margin:4px 0 2px;filter:drop-shadow(0 3px 5px rgba(0,0,0,.35))}
.fae-ed-vacio{text-align:center;padding:22px 10px;border:1.5px dashed rgba(248,249,250,.16);border-radius:16px;color:rgba(248,249,250,.7);font-size:13.5px;line-height:1.5}
.fae-ed-error{font-size:13px;line-height:1.5;color:${FAE.ambar};margin:12px 0 0}
@media (max-width:760px){
  .fae-ed{grid-template-columns:1fr;gap:14px}
  .fae-ed-escenario{position:relative;top:0;padding:12px 14px 14px}
  .fae-ed-escenario::after{bottom:112px}
  .fae-ed-figura svg{width:min(62vw,210px)}
  .fae-ed-cuerpo{padding:14px}
  .fae-ed-rejilla{grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px}
  .fae-ed-tabs{display:grid;grid-template-columns:repeat(auto-fit,minmax(0,1fr));padding:6px;gap:2px}
  .fae-ed-tab{min-width:0;padding:8px 2px 7px;font-size:11px}
  .fae-ed-corto{display:inline}
  .fae-ed-largo{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
}
@media (prefers-reduced-motion:reduce){.fae-ed-carta,.fae-ed-tab{transition:none}.fae-ed-carta:hover{transform:none}}
`;

/* «r, g, b» de un color #rrggbb, para teñir la luz del escenario. */
const rgb = (h) => (/^#[0-9a-f]{6}$/i.test(h) ? [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(",") : "42,157,143");

export default function SeccionMascota({ perfil: perfilProp = null, completo = false }) {
  const auth = useAuthOpcional();
  const nav = useContext(NavigationContext);
  const perfil = perfilProp ?? auth?.perfil ?? null;
  /* La especie de arranque: la elegida o la de fábrica, para que el editor
     NUNCA salga vacío. */
  const base = perfil ? mascotaDe(perfil) : null;
  const [especie, setEspecie] = useState(() => perfil?.mascota_especie ?? base?.especie ?? null);
  const [nombre, setNombre] = useState(() => perfil?.mascota_nombre ?? "");
  const [paleta, setPaleta] = useState(() => perfil?.mascota_paleta ?? "natural");
  const [ojos, setOjos] = useState(() => perfil?.mascota_ojos ?? "natural");
  const [cuerpo, setCuerpo] = useState(() => ajustesDe(perfil));
  const [pestana, setPestana] = useState(completo ? "animal" : "raza");
  const [pose, setPose] = useState("tranquila");
  const [error, setError] = useState(null);

  /* Si el perfil llega (o cambia) después de montar —la primera pintada puede
     ser la de antes de leer la base—, el editor se pone al día con él. */
  const pEsp = perfil?.mascota_especie ?? base?.especie ?? null;
  const pNom = perfil?.mascota_nombre ?? "";
  const pPal = perfil?.mascota_paleta ?? "natural";
  const pOjos = perfil?.mascota_ojos ?? "natural";
  const pCpx = perfil?.mascota_complexion ?? 0;
  const pCab = perfil?.mascota_cabeza ?? 0;
  useEffect(() => { setEspecie(pEsp); }, [pEsp]);
  useEffect(() => { setNombre(pNom); }, [pNom]);
  useEffect(() => { setPaleta(pPal); }, [pPal]);
  useEffect(() => { setOjos(pOjos); }, [pOjos]);
  useEffect(() => { setCuerpo(ajustesDe({ mascota_complexion: pCpx, mascota_cabeza: pCab })); }, [pCpx, pCab]);

  if (!perfil || (!completo && !perfil.mascota_especie)) return null;

  const guardarCon = async (antes, poner, llamada) => {
    setError(null);
    const { error: err } = (await llamada()) ?? {};
    if (err) { poner(antes); setError(err); }
  };

  const elegirRaza = (id) => {
    if (id === paleta) return;
    const antes = paleta;
    setPaleta(id);
    guardarCon(antes, setPaleta, () => auth?.personalizarMascota?.(id));
  };

  const elegirOjos = (id) => {
    if (id === ojos) return;
    const antes = ojos;
    setOjos(id);
    guardarCon(antes, setOjos, () => auth?.cambiarOjos?.(id));
  };

  const ajustar = (campo, valor) => {
    if (cuerpo[campo] === valor) return;
    const antes = cuerpo;
    const nuevo = { ...cuerpo, [campo]: valor };
    setCuerpo(nuevo);
    guardarCon(antes, setCuerpo, () => auth?.ajustarMascota?.(nuevo.complexion, nuevo.cabeza));
  };

  const restablecerCuerpo = () => {
    if (!cuerpo.complexion && !cuerpo.cabeza) return;
    const antes = cuerpo;
    setCuerpo({ complexion: 0, cabeza: 0 });
    guardarCon(antes, setCuerpo, () => auth?.ajustarMascota?.(0, 0));
  };

  /* Cambiar de especie conservando nombre, color y ojos (mascota_elegir, 0160). */
  const elegirEspecie = (id) => {
    if (id === especie) return;
    const nom = (nombre || "").trim();
    if (!nom) { setError("Primero ponle un nombre a tu mascota."); return; }
    const antes = especie;
    setEspecie(id);
    guardarCon(antes, setEspecie, () => auth?.elegirMascota?.(id, nom, paleta));
  };

  /* Poner o quitar un accesorio ya comprado; dos en el mismo sitio, no. */
  const tieneAcc = accesoriosDe(perfil);
  const puestosAcc = new Set(puestosDe(perfil));
  const toggleAccesorio = async (clave) => {
    setError(null);
    const poner = !puestosAcc.has(clave);
    if (poner) {
      for (const otro of chocaCon(clave, [...puestosAcc])) {
        const { error: e1 } = (await auth?.equiparAccesorio?.(otro, false)) ?? {};
        if (e1) { setError(e1); return; }
      }
    }
    const { error: err } = (await auth?.equiparAccesorio?.(clave, poner)) ?? {};
    if (err) setError(err);
  };

  const guardarNombre = async () => {
    const nom = (nombre || "").trim();
    if (!nom || nom === (perfil.mascota_nombre || "")) return;
    setError(null);
    const { error: err } = (await auth?.elegirMascota?.(especie, nom, paleta)) ?? {};
    if (err) { setNombre(perfil.mascota_nombre || ""); setError(err); }
  };

  const razas = razasDe(especie, paleta);
  const raza = razas.find((r) => r.id === paleta) ?? razas[0];
  const nombreEspecie = ESPECIES.find((e) => e.id === especie)?.nombre ?? "";
  const pestanas = completo ? PESTANAS : PESTANAS.filter((p) => p.id !== "animal");
  const comp = COMPLEXIONES.find((c) => c.valor === cuerpo.complexion)?.nombre;
  const cab = CABEZAS.find((c) => c.valor === cuerpo.cabeza)?.nombre;
  /* Lo que comparten todas las miniaturas: la mascota tal como va. */
  const comoVa = { especie, paleta, ojos, complexion: cuerpo.complexion, cabeza: cuerpo.cabeza };

  return (
    <div className="fae-ed" data-seccion-mascota style={{ "--ed-tono": rgb(raza?.muestra) }}>
      <style>{CSS}</style>

      {/* ── El escenario ─────────────────────────────────────────────── */}
      <div className="fae-ed-escenario" data-escenario>
        <div className="fae-ed-figura">
          <Mascota
            {...comoVa}
            perfil={perfil}
            tamano={290}
            encuadre="cuerpo"
            animo={pose}
            titulo={`Tu mascota: ${nombre || nombreEspecie}`}
          />
        </div>
        <div className="fae-ed-poses" role="group" aria-label="Ver a tu mascota">
          {POSES.map((p) => (
            <button key={p.id} type="button" className="fae-ed-pose" aria-pressed={pose === p.id} data-pose={p.id} onClick={() => setPose(p.id)}>
              {p.nombre}
            </button>
          ))}
        </div>
        {completo ? (
          <label className="fae-ed-nombre" htmlFor="editar-mascota-nombre">
            <input
              id="editar-mascota-nombre"
              aria-label="Nombre de tu mascota"
              placeholder="Ponle nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onBlur={guardarNombre}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); } }}
              maxLength={16}
            />
            <Pencil size={16} color="#93A3B8" aria-hidden="true" />
          </label>
        ) : (
          <p style={{ position: "relative", zIndex: 1, fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "19px", margin: "0 2px", color: FAE.text, overflowWrap: "anywhere" }}>
            {nombre || "Tu mascota"}
          </p>
        )}
        <div className="fae-ed-ficha" data-ficha>
          <span>{nombreEspecie}{raza ? ` · ${raza.nombre}` : ""}</span>
          <span>Ojos {(OJOS_MASCOTA.find((o) => o.id === ojos)?.nombre ?? "Café").toLowerCase()}</span>
          {(cuerpo.complexion !== 0 || cuerpo.cabeza !== 0) && <span>{[cuerpo.complexion ? comp : null, cuerpo.cabeza ? `cabeza ${cab.toLowerCase()}` : null].filter(Boolean).join(" · ")}</span>}
        </div>
      </div>

      {/* ── El panel de pestañas ─────────────────────────────────────── */}
      <div className="fae-ed-panel">
        <div className="fae-ed-tabs" role="tablist" aria-label="Qué quieres cambiar">
          {pestanas.map(({ id, nombre: n, corto, Icono }) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`ed-tab-${id}`}
              aria-controls="ed-cuerpo"
              aria-selected={pestana === id}
              className="fae-ed-tab"
              data-pestana={id}
              onClick={() => setPestana(id)}
            >
              <Icono size={19} strokeWidth={2.2} aria-hidden="true" />
              {corto ? (<><span className="fae-ed-largo">{n}</span><span className="fae-ed-corto" aria-hidden="true">{corto}</span></>) : n}
            </button>
          ))}
        </div>

        <div className="fae-ed-cuerpo" id="ed-cuerpo" role="tabpanel" aria-labelledby={`ed-tab-${pestana}`}>
          {pestana === "animal" && (
            <>
              <p className="fae-ed-titulo">Elige tu animal</p>
              <p className="fae-ed-ayuda">Conserva su nombre, su color y sus accesorios.</p>
              <div className="fae-ed-rejilla" role="radiogroup" aria-label="Especie de tu mascota">
                {ESPECIES.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    role="radio"
                    aria-checked={especie === e.id}
                    className="fae-ed-carta"
                    data-especie={e.id}
                    aria-label={`${e.nombre} · ${e.rasgo}`}
                    onClick={() => elegirEspecie(e.id)}
                  >
                    {especie === e.id && <span className="fae-ed-marca" aria-hidden="true">✓</span>}
                    <Mascota especie={e.id} paleta="natural" ojos={ojos} tamano={84} encuadre="busto" />
                    <b>{e.nombre}</b>
                    <small>{e.rasgo}</small>
                  </button>
                ))}
              </div>
            </>
          )}

          {pestana === "raza" && (
            <>
              <p className="fae-ed-titulo">Raza y pelaje de tu {nombreEspecie.toLowerCase()}</p>
              <p className="fae-ed-ayuda">Colores de razas de verdad: cada una con su lomo, su panza y su hocico.</p>
              <div className="fae-ed-rejilla" role="radiogroup" aria-label="Raza de tu mascota">
                {razas.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    role="radio"
                    aria-checked={paleta === r.id}
                    className="fae-ed-carta"
                    data-color={r.id}
                    aria-label={`${r.nombre}: ${r.detalle}`}
                    onClick={() => elegirRaza(r.id)}
                  >
                    {paleta === r.id && <span className="fae-ed-marca" aria-hidden="true">✓</span>}
                    <Mascota {...comoVa} paleta={r.id} tamano={84} encuadre="busto" />
                    <b>{r.nombre}</b>
                    <small>{r.detalle}</small>
                  </button>
                ))}
              </div>
            </>
          )}

          {pestana === "ojos" && (
            <>
              <p className="fae-ed-titulo">Color de ojos</p>
              <p className="fae-ed-ayuda">
                {especie === "huron"
                  ? "El hurón lleva los ojos dentro de su antifaz: por ahora se quedan como vienen."
                  : "Colores reales de animales. «Uno de cada color» es la heterocromía de los huskies y algunos gatos."}
              </p>
              <div className="fae-ed-rejilla" role="radiogroup" aria-label="Color de ojos">
                {OJOS_MASCOTA.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={ojos === o.id}
                    className="fae-ed-carta"
                    data-ojos={o.id}
                    aria-label={o.nombre}
                    disabled={especie === "huron"}
                    style={especie === "huron" ? { opacity: 0.45, cursor: "default" } : undefined}
                    onClick={() => elegirOjos(o.id)}
                  >
                    {ojos === o.id && <span className="fae-ed-marca" aria-hidden="true">✓</span>}
                    <MuestraOjo id={o.id} />
                    <b>{o.nombre}</b>
                  </button>
                ))}
              </div>
            </>
          )}

          {pestana === "cuerpo" && (
            <>
              <p className="fae-ed-titulo">Su cuerpo</p>
              <p className="fae-ed-ayuda">Hazlo más gordito o más flaquito, y elige el tamaño de su cabeza.</p>
              {[
                ["complexion", "Complexión", COMPLEXIONES],
                ["cabeza", "Cabeza", CABEZAS],
              ].map(([campo, titulo, pasos]) => (
                <div key={campo} className="fae-ed-regla" data-ajuste={campo}>
                  <div className="fae-ed-regla-cab">
                    <strong>{titulo}</strong>
                    <span>{pasos.find((p) => p.valor === cuerpo[campo])?.nombre}</span>
                  </div>
                  <div className="fae-ed-pasos" role="radiogroup" aria-label={titulo}>
                    {pasos.map((p) => (
                      <button
                        key={p.valor}
                        type="button"
                        role="radio"
                        aria-checked={cuerpo[campo] === p.valor}
                        className="fae-ed-paso"
                        data-valor={p.valor}
                        onClick={() => ajustar(campo, p.valor)}
                      >
                        <Silueta tipo={campo} valor={p.valor} />
                        {p.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button type="button" className="fae-ed-boton" onClick={restablecerCuerpo} disabled={!cuerpo.complexion && !cuerpo.cabeza}>
                <RotateCcw size={15} aria-hidden="true" /> Como venía
              </button>
            </>
          )}

          {pestana === "accesorios" && (
            <>
              <p className="fae-ed-titulo">Tus accesorios</p>
              <p className="fae-ed-ayuda">Toca para ponértelo o quitártelo. Uno por sitio: el sombrero nuevo reemplaza al anterior.</p>
              {tieneAcc.length === 0 ? (
                <div className="fae-ed-vacio">
                  Todavía no tienes accesorios. Consíguelos en la Tienda con tus cristales.
                  <div style={{ marginTop: "12px" }}>
                    <button type="button" className="fae-ed-boton" onClick={() => nav?.irATienda?.()}>
                      <ShoppingBag size={15} aria-hidden="true" /> Ir a la Tienda
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {ZONAS_ACCESORIO.map((z) => {
                    const mios = ACCESORIOS_META.filter((a) => a.zona === z.id && tieneAcc.includes(a.id));
                    if (!mios.length) return null;
                    return (
                      <div key={z.id} className="fae-ed-grupo">
                        <p className="fae-ed-zona">{z.nombre}</p>
                        <div className="fae-ed-rejilla">
                          {mios.map((a) => {
                            const on = puestosAcc.has(a.id);
                            return (
                              <button key={a.id} type="button" aria-pressed={on} className="fae-ed-carta" data-accesorio={a.id} onClick={() => toggleAccesorio(a.id)}>
                                {on && <span className="fae-ed-marca" aria-hidden="true">✓</span>}
                                <img className="fae-ed-acc" src={`/mascotas/accesorios/${a.id}.webp`} alt="" loading="lazy" />
                                <b>{a.nombre}</b>
                                <small>{on ? "Puesto" : "Ponérselo"}</small>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ marginTop: "16px" }}>
                    <button type="button" className="fae-ed-boton" onClick={() => nav?.irATienda?.()}>
                      <ShoppingBag size={15} aria-hidden="true" /> Ver más en la Tienda
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {error && <p role="alert" className="fae-ed-error">{error}</p>}
        </div>
      </div>
    </div>
  );
}
