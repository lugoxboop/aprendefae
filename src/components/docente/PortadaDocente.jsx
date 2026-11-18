import { useContext } from "react";
import {
  Activity, ArrowRight, BarChart2, ChevronRight, Eye, ListChecks, Radio, Sparkles, Star, Users,
} from "lucide-react";
import { NavigationContext } from "../../navigation.js";
import { NIVEL } from "../../docente/alertas.js";
import { CARD_SHELL } from "../SubjectCard.jsx";
import { LucesTema, TONOS, variablesDeTono } from "../shared/TarjetaTema.jsx";
import MarcaNivel, { NIVEL_MARCA } from "./MarcaNivel.jsx";
import { V1 } from "./estiloV1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA PORTADA DEL PANEL DOCENTE, REHECHA (Mateo, 18 nov.: «la estructura es muy
 * arcaica, no se entiende; quiero algo más sencillo y ameno»).
 *
 * Antes la primera pantalla eran nueve bloques de texto con el mismo peso:
 * dos llamados, un párrafo de tres oraciones, tres tarjetas de cifras, un
 * gráfico con su lista y otra lista de personas. Todo a la vez, nada primero.
 *
 * Ahora son TRES pisos, cada uno con una sola pregunta:
 *
 *   1. ¿CÓMO VA MI CLASE?   El saludo, una frase grande y tres cifras que se
 *                           tocan (avance, a quién mirar, quién va muy bien).
 *   2. ¿A QUIÉN MIRO HOY?   Las tres personas más urgentes, en filas como las
 *                           del menú de la cuenta: nombre, qué le pasa, flecha.
 *   3. ¿QUÉ QUIERO HACER?   Seis tarjetas grandes con la misma pieza que las
 *                           tarjetas de temas (#686): pastilla de color,
 *                           rótulo, título grande, una línea y la flecha.
 *
 * Lo que había en la portada vieja no se pierde: cada cosa vive a un toque,
 * en su vista (el gráfico de esfuerzo, el avance por tema, las alertas, la
 * lista de actividades). Las cifras salen de las mismas funciones: solo cambia
 * dónde están. No hay escrituras nuevas (P8) ni coral fuera del error (P6).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS_PORTADA = `
@keyframes pdp-sube { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes pdp-entra { from { opacity: 0; transform: translateX(-14px); } to { opacity: 1; transform: none; } }
@keyframes pdp-barra { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.pdp-sube { animation: pdp-sube 460ms cubic-bezier(.22,1,.36,1) both; animation-delay: calc(var(--i, 0) * 70ms); }
.pdp-entra { animation: pdp-entra 360ms cubic-bezier(.22,1,.36,1) both; animation-delay: calc(160ms + var(--i, 0) * 40ms); }

.pdp-hero {
  position: relative; overflow: hidden; isolation: isolate;
  padding: clamp(20px, 3vw, 30px); border-radius: 24px;
  background:
    radial-gradient(120% 120% at 0% 0%, rgba(42,157,143,0.22), transparent 55%),
    radial-gradient(90% 90% at 100% 0%, rgba(139,124,246,0.16), transparent 60%),
    linear-gradient(180deg, #1B2B47 0%, #142139 100%);
  border: 1px solid rgba(248,249,250,0.10);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 60px -28px rgba(0,0,0,0.8);
}
.pdp-hero__linea { position: absolute; top: 0; left: 10%; right: 10%; height: 1px; background: linear-gradient(90deg, transparent, rgba(42,157,143,0.9), transparent); opacity: .6; }
.pdp-rotulo { margin: 0 0 8px; font-family: Sora, sans-serif; font-weight: 700; font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: #7FD3C7; }
.pdp-titular { margin: 0; font-family: Sora, sans-serif; font-weight: 700; font-size: clamp(24px, 3.4vw, 34px); line-height: 1.12; letter-spacing: -.025em; color: #F8F9FA; max-width: 22ch; }
.pdp-sub { margin: 10px 0 0; font-size: 15px; line-height: 1.5; color: rgba(248,249,250,0.74); max-width: 56ch; }

.pdp-cifras { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 10px; margin-top: 22px; }
/* En el teléfono las tres caben en fila: el icono sube sobre la cifra y la flecha se va (toda la ficha es el botón). */
@media (max-width: 559px) {
  .pdp-cifras { gap: 8px; margin-top: 18px; }
  .pdp-cifra { padding: 12px 10px 11px; gap: 6px; }
  .pdp-cifra__cabeza { flex-direction: column; align-items: flex-start; gap: 8px; }
  .pdp-cifra__flecha { display: none; }
  .pdp-cifra__valor { font-size: 24px; }
  .pdp-cifra__etiqueta { font-size: 12px; }
}
.pdp-cifra {
  display: flex; flex-direction: column; align-items: flex-start; gap: 6px; min-width: 0; min-height: 44px;
  padding: 14px 14px 13px; border-radius: 16px; text-align: left; font: inherit; color: #F8F9FA; cursor: pointer;
  background: rgba(248,249,250,0.05); border: 1px solid rgba(248,249,250,0.10);
  transition: background-color 200ms ease, border-color 200ms ease, transform 260ms cubic-bezier(.22,1,.36,1);
}
.pdp-cifra:hover, .pdp-cifra:focus-visible { background: rgba(var(--c),0.12); border-color: rgba(var(--c),0.55); transform: translateY(-2px); }
.pdp-cifra:focus-visible { outline: 2px solid #F8F9FA; outline-offset: 2px; }
.pdp-cifra__cabeza { display: flex; align-items: center; gap: 10px; width: 100%; }
.pdp-cifra__icono { width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: rgba(var(--c),0.18); color: rgb(var(--c)); transition: transform 260ms cubic-bezier(.34,1.56,.64,1); }
.pdp-cifra:hover .pdp-cifra__icono { transform: rotate(-6deg) scale(1.08); }
.pdp-cifra__valor { font-family: Sora, sans-serif; font-size: 30px; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums; letter-spacing: -.02em; }
.pdp-cifra__flecha { margin-left: auto; opacity: .45; transition: opacity 200ms ease, transform 200ms ease; }
.pdp-cifra:hover .pdp-cifra__flecha { opacity: .9; transform: translateX(2px); }
.pdp-cifra__etiqueta { font-size: 13px; line-height: 1.35; color: rgba(248,249,250,0.74); }
.pdp-barra { width: 100%; height: 6px; border-radius: 999px; background: rgba(248,249,250,0.10); overflow: hidden; margin-top: 2px; }
.pdp-barra > span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #2A9D8F, #7FD3C7); transform-origin: left; animation: pdp-barra 900ms cubic-bezier(.22,1,.36,1) 300ms both; }

.pdp-seccion { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin: 30px 2px 12px; }
.pdp-seccion h2 { margin: 0; font-family: Sora, sans-serif; font-size: 19px; font-weight: 700; letter-spacing: -.015em; color: #F8F9FA; }
.pdp-seccion p { margin: 0; font-size: 13px; color: ${V1.texto2}; }

.pdp-hoy { padding: 8px; border-radius: 20px; background: linear-gradient(180deg, #1C2939, #18243A); border: 1px solid rgba(248,249,250,0.08); box-shadow: 0 14px 36px -20px rgba(0,0,0,0.7); }
.pdp-fila {
  width: 100%; display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 8px 10px; border-radius: 14px;
  text-align: left; font: inherit; color: #F8F9FA; background: transparent; border: none; cursor: pointer;
  transition: background-color 160ms ease;
}
.pdp-fila + .pdp-fila { box-shadow: inset 0 1px 0 rgba(248,249,250,0.06); }
.pdp-fila:hover, .pdp-fila:focus-visible { background: rgba(248,249,250,0.06); }
.pdp-fila:focus-visible { outline: 2px solid #F8F9FA; outline-offset: -2px; }
.pdp-inicial { width: 40px; height: 40px; border-radius: 999px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; font-family: Sora, sans-serif; font-weight: 700; font-size: 15px; color: #0E1B2E; }
.pdp-fila__flecha { flex-shrink: 0; opacity: .4; transform: translateX(-3px); transition: opacity 160ms ease, transform 200ms ease; }
.pdp-fila:hover .pdp-fila__flecha, .pdp-fila:focus-visible .pdp-fila__flecha { opacity: .9; transform: none; }
.pdp-ver-todos {
  display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; min-height: 44px; margin-top: 4px;
  border-radius: 12px; border: none; cursor: pointer; font-family: Sora, sans-serif; font-size: 13.5px; font-weight: 600;
  color: #E7C8F0; background: rgba(195,155,211,0.10); transition: background-color 160ms ease;
}
.pdp-ver-todos:hover, .pdp-ver-todos:focus-visible { background: rgba(195,155,211,0.18); }

.pdp-rejilla { display: grid; grid-template-columns: minmax(0,1fr); gap: 14px; }
@media (min-width: 640px) { .pdp-rejilla { grid-template-columns: repeat(2, minmax(0,1fr)); gap: 16px; } }
.pdp-herramienta { text-align: left; font: inherit; color: #F8F9FA; width: 100%; }
.pdp-herramienta:disabled { cursor: default !important; opacity: .55; }
.pdp-herramienta:disabled:hover { transform: none; }
.pdp-herramienta .fae-tema__titulo { font-size: clamp(22px, 2.4vw, 28px); }
.pdp-herramienta:focus-visible { outline: 2px solid #F8F9FA; outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .pdp-sube, .pdp-entra, .pdp-barra > span { animation: none; }
  .pdp-cifra, .pdp-cifra:hover, .pdp-cifra:focus-visible { transform: none; transition: none; }
  .pdp-cifra:hover .pdp-cifra__icono { transform: none; }
}
`;

const nombreDe = (e) => e.full_name?.trim() || e.nickname?.trim() || "Sin nombre";
const inicialDe = (e) => nombreDe(e).charAt(0).toUpperCase();
/* El círculo de la inicial toma el color de su nivel; la forma (MarcaNivel) dice lo mismo sin color. */
const COLOR_NIVEL = { [NIVEL.URGENTE]: "#E9C46A", [NIVEL.ATENCION]: "#C39BD3", [NIVEL.INFO]: "#8FB8E8" };
const MARCA = { [NIVEL.URGENTE]: NIVEL_MARCA.URGENTE, [NIVEL.ATENCION]: NIVEL_MARCA.ATENCION, [NIVEL.INFO]: NIVEL_MARCA.INFO };

function Cifra({ i, rgb, icono: Icono, valor, etiqueta, onClick, barra = null, ...resto }) {
  return (
    <button type="button" className="pdp-cifra pdp-sube" onClick={onClick} style={{ "--i": i, "--c": rgb }} {...resto}>
      <span className="pdp-cifra__cabeza">
        <span className="pdp-cifra__icono" aria-hidden="true"><Icono size={17} strokeWidth={2.2} /></span>
        <span className="pdp-cifra__valor">{valor}</span>
        <ChevronRight className="pdp-cifra__flecha" size={18} aria-hidden="true" />
      </span>
      {barra != null && <span className="pdp-barra" aria-hidden="true"><span style={{ width: `${Math.max(2, Math.min(100, barra))}%` }} /></span>}
      <span className="pdp-cifra__etiqueta">{etiqueta}</span>
    </button>
  );
}

/* Una tarjeta grande, hecha con la misma pieza que las tarjetas de temas. */
function Herramienta({ i, tono, Glifo, rotulo, titulo, linea, onClick, disabled = false, ...resto }) {
  return (
    <button
      type="button"
      className="fae-card fae-tema pdp-herramienta pdp-sube"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...CARD_SHELL,
        ...variablesDeTono(TONOS[tono]),
        "--i": i,
        minHeight: "clamp(170px, 22vh, 210px)",
        display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "22px", cursor: "pointer",
      }}
      {...resto}
    >
      <LucesTema Glifo={Glifo} />
      <div className="fae-tema__fila">
        <span className="fae-tema__pastilla" aria-hidden="true">
          <span className="fae-tema__pastilla-anillo" />
          <Glifo size={28} strokeWidth={2} focusable="false" />
        </span>
      </div>
      <div className="fae-tema__pie">
        <p className="fae-tema__rotulo">{rotulo}</p>
        <h3 className="fae-tema__titulo">{titulo}</h3>
        <div className="fae-tema__base">
          <p className="fae-tema__conteo">{linea}</p>
          <span className="fae-tema__flecha" aria-hidden="true"><ArrowRight size={20} strokeWidth={2.4} focusable="false" /></span>
        </div>
      </div>
    </button>
  );
}

export default function PortadaDocente({
  materia, nombreMateria, sinEstudiantes, nCohorte, activos, avance, riesgo, destacados, estadoPeor,
  nActividades, aviso, desdeTuVisita, ir, irActividad,
}) {
  const nav = useContext(NavigationContext);
  const singular = nCohorte === 1;
  const urgentes = riesgo.filter((f) => f.principal.nivel === NIVEL.URGENTE).length;
  const primeros = riesgo.slice(0, 3);
  const peor = estadoPeor.peor;

  const titular = sinEstudiantes
    ? "Tu clase todavía no ha empezado"
    : singular
      ? (activos > 0 ? "Tu estudiante trabajó este ciclo" : "Tu estudiante no ha entrado este ciclo")
      : `${activos} de ${nCohorte} estudiantes trabajaron este ciclo`;
  const sub = sinEstudiantes
    ? "Aún no hay nada que mostrar. Cuando tu clase haga su primera actividad, la verás aquí. Mientras tanto, ya puedes preparar material."
    : riesgo.length === 0
      ? "Nadie necesita atención especial ahora mismo. Buena señal."
      : urgentes > 0
        ? `${urgentes === 1 ? "Hay 1 caso" : `Hay ${urgentes} casos`} para atender hoy. Empieza por ${urgentes === 1 ? "él" : "ellos"}: están abajo.`
        : `${riesgo.length === 1 ? "Hay 1 estudiante" : `Hay ${riesgo.length} estudiantes`} para mirar con calma esta semana.`;

  const lineaActividades = estadoPeor.cargando
    ? "Midiendo cómo les fue…"
    : peor
      ? <>Costó más: {peor.nombre} · <span data-cifra="peor-pct">{Math.round(peor.cifras.pct)}%</span> de acierto</>
      : `${nActividades} actividades para revisar`;

  return (
    <div className="pd3-portada">
      <style>{CSS_PORTADA}</style>
      {aviso}

      {/* ═══ PISO 1 · ¿CÓMO VA MI CLASE? ═══ */}
      <section className="pdp-hero pdp-sube" style={{ "--i": 0 }} data-bloque="b1" data-vacio={sinEstudiantes || undefined} aria-labelledby="pdp-titular">
        <span className="pdp-hero__linea" aria-hidden="true" />
        <p className="pdp-rotulo">Hoy en {nombreMateria}</p>
        <p id="pdp-titular" className="pdp-titular">{titular}</p>
        <p className="pdp-sub">{sub}</p>
        {!sinEstudiantes && (
          <div className="pdp-cifras">
            <Cifra
              i={1} rgb="42,157,143" icono={BarChart2}
              valor={avance === null ? "—" : <span data-cifra="avance">{Math.round(avance)}%</span>}
              barra={avance}
              etiqueta={singular ? "Avance de tu estudiante, por temas" : "Avance de la clase, por temas"}
              onClick={() => ir({ tipo: "clase" })}
              data-ir="clase"
            />
            <Cifra
              i={2} rgb="195,155,211" icono={Eye}
              valor={<span data-cifra="a-mirar">{riesgo.length}</span>}
              etiqueta={riesgo.length === 1 ? "Necesita que lo mires" : "Necesitan que los mires"}
              onClick={() => ir({ tipo: "riesgo" })}
              data-ver-atencion
            />
            <Cifra
              i={3} rgb="233,196,106" icono={Star}
              valor={<span data-cifra="destacados">{destacados}</span>}
              etiqueta={destacados === 1 ? "Va muy bien" : "Van muy bien"}
              onClick={() => ir({ tipo: "atencion" })}
              data-ver-destacados
            />
          </div>
        )}
      </section>

      {/* ═══ PISO 2 · ¿A QUIÉN MIRO HOY? ═══ */}
      {!sinEstudiantes && primeros.length > 0 && (
        <>
          <div className="pdp-seccion pdp-sube" style={{ "--i": 4 }}>
            <h2>Para hoy</h2>
            <p>Por urgencia, no por nombre</p>
          </div>
          <section className="pdp-hoy pdp-sube" style={{ "--i": 5 }} data-bloque="riesgo" aria-label="A quién mirar hoy">
            {primeros.map((f, k) => (
              <button
                key={f.estudiante.user_id}
                type="button"
                className="pdp-fila pdp-entra"
                style={{ "--i": k }}
                onClick={() => ir({ tipo: "estudiante", id: f.estudiante.user_id, desde: "inicio" })}
                data-diagnostico={f.principal.id}
                data-atencion
              >
                <span className="pdp-inicial" aria-hidden="true" style={{ background: COLOR_NIVEL[f.principal.nivel] ?? "#8FB8E8" }}>{inicialDe(f.estudiante)}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="pd1-nombre" style={{ display: "block", fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 600 }}>{nombreDe(f.estudiante)}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px", fontSize: "13px", color: "rgba(248,249,250,0.74)" }}>
                    <MarcaNivel nivel={MARCA[f.principal.nivel]} />
                    {f.principal.nombre}
                  </span>
                </span>
                <ChevronRight className="pdp-fila__flecha" size={18} aria-hidden="true" />
              </button>
            ))}
            <button type="button" className="pdp-ver-todos" onClick={() => ir({ tipo: "riesgo" })} data-ver-riesgo>
              {riesgo.length > primeros.length ? `Ver los ${riesgo.length} y ajustar los avisos` : "Ajustar cuándo quiero que me avise"}
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </section>
        </>
      )}

      {/* ═══ PISO 3 · ¿QUÉ QUIERO HACER? ═══ */}
      <div className="pdp-seccion pdp-sube" style={{ "--i": 6 }}>
        <h2>¿Qué quieres hacer?</h2>
      </div>
      <nav className="pdp-rejilla" aria-label="Vistas del panel">
        <Herramienta
          i={7} tono="rosa" Glifo={Eye} rotulo="Seguimiento" titulo="A quién mirar"
          linea={sinEstudiantes ? "Se abre con la primera actividad" : riesgo.length === 0 ? "Nadie lo necesita ahora" : `${riesgo.length} con algo que revisar`}
          onClick={() => ir({ tipo: "riesgo" })} disabled={sinEstudiantes} data-ir="riesgo"
        />
        <Herramienta
          i={8} tono="cielo" Glifo={Users} rotulo="Tu grupo" titulo="Mis estudiantes"
          linea={sinEstudiantes ? "Se abre con la primera actividad" : `${nCohorte} ${singular ? "estudiante" : "estudiantes"} · ${activos} activos`}
          onClick={() => ir({ tipo: "estudiantes" })} disabled={sinEstudiantes} data-ir="estudiantes"
        />
        <Herramienta
          i={9} tono="violeta" Glifo={ListChecks} rotulo="Resultados" titulo="Actividades"
          linea={sinEstudiantes ? "Se abre con la primera actividad" : lineaActividades}
          onClick={() => (peor ? irActividad(peor.id) : ir({ tipo: "actividades", actividad: null }))}
          disabled={sinEstudiantes} data-ir="actividades" data-peor={peor?.id}
        />
        <Herramienta
          i={10} tono="indigo" Glifo={Activity} rotulo="Cómo trabajan" titulo="Esfuerzo y resultado"
          linea={sinEstudiantes ? "Se abre con la primera actividad" : "Quién se esfuerza y aún así falla"}
          onClick={() => ir({ tipo: "esfuerzo" })} disabled={sinEstudiantes} data-ir="esfuerzo"
        />
        <Herramienta
          i={11} tono="menta" Glifo={Sparkles} rotulo="Preparar material" titulo="Crear actividades"
          linea="Sube tu capítulo y te armo tres"
          onClick={() => ir({ tipo: "fabrica" })} data-ir="fabrica" data-llamado-fabrica
        />
        <Herramienta
          i={12} tono="ambar" Glifo={Radio} rotulo="En el salón" titulo="Clase en vivo"
          linea="Proyecta un código y que todos respondan"
          onClick={() => nav?.irA?.("vivo-profesor", null, materia)} data-ir="vivo" data-llamado-vivo
        />
      </nav>

      {desdeTuVisita && <div className="pdp-sube" style={{ "--i": 13, marginTop: "16px" }}>{desdeTuVisita}</div>}
    </div>
  );
}

