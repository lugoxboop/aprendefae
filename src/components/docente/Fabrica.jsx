import { useEffect, useRef, useState } from "react";
import { Plus, Sparkles, FileText, X, ShieldCheck, Eye, Check, Trash2 } from "lucide-react";
import { FAE } from "../../theme.js";
import { supabase } from "../../lib/supabase.js";
import { V1, tarjetaV1, notaV1, volverV1 } from "./estiloV1.js";
import { MAX_ARCHIVOS, FASE, revisar, formatearPeso, encargar, misBorradores, cambiarEstado } from "../../docente/fabrica.js";
import Robot, { CSS_ROBOT } from "../../bruno/Robot.jsx";
import FermiTrabajando, { CSS_FERMI, DURACION_UNA_PASADA_MS } from "./FermiTrabajando.jsx";
import EscenaGenerada, { CSS_ESCENA } from "../mecanicas/maquinas/EscenaGenerada.jsx";
import { EstiloEntrada, entrada } from "../shared/Entrada.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA FÁBRICA — el profesor crea sus propias actividades
 *
 * Encargo de Mateo (1-nov). Rehecha la misma tarde: la primera versión era
 * correcta y aburrida —tres párrafos de instrucciones, dos botones de texto
 * gris y ni un color—. Su palabra fue «ruido visual», y tenía razón: cuando
 * hay que explicar tanto, normalmente es que la pantalla no se explica sola.
 *
 * ═══════════ LO QUE SE QUITÓ, Y QUÉ OCUPÓ SU SITIO ═══════════
 *
 *   El párrafo de instrucciones  →  tres ejemplos que se tocan y escriben
 *                                   solos. Nadie lee cómo se usa una caja de
 *                                   texto; sí mira qué escribió otro.
 *   «Adjuntar archivo»           →  un «+». Lo pidió Mateo y es lo correcto:
 *                                   el botón no necesita decir qué hace si el
 *                                   signo ya lo dice.
 *   El aviso de que no se guarda →  una línea con su escudo. Sigue estando,
 *                                   porque es una promesa, pero deja de ser
 *                                   un párrafo.
 *   Dos botones grises           →  uno teal con su varita. En una pantalla
 *                                   hay una sola acción principal, y que se
 *                                   note cuál es ahorra más que un texto.
 *
 * ═══════════ EL COLOR DICE EL ESTADO, NO DECORA ═══════════
 *
 * Teal para lo publicado y para la única acción que crea algo. Gris para lo
 * que todavía es borrador. Nada más: el panel es una herramienta de trabajo y
 * un color que no significa nada es ruido con otro nombre.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Tres encargos de verdad, de los que un profesor de la facultad escribiría. */
const EJEMPLOS = [
  "Del capítulo 3, con ejemplos en pesos",
  "Gasto contra pago, que ahí se enredan",
  "Repaso de lo que falló en el parcial",
];

/*
 * `cliente` entra por parámetro y no se importa a secas para poder montar esta
 * pantalla sin base: con un cliente de mentira se la puede fotografiar con
 * borradores dentro y medirla a 320 px, que es como se encontró que el «+»
 * medía lo que tiene que medir. En el panel se usa el de verdad y nadie lo pasa.
 */
export default function Fabrica({ materia, nombreMateria, onVolver, cliente = supabase }) {
  const [mensaje, setMensaje] = useState("");
  const [archivos, setArchivos] = useState([]);
  const [trabajando, setTrabajando] = useState(false);
  const [fase, setFase] = useState(FASE.leyendo);
  const [aviso, setAviso] = useState(null);
  const [borradores, setBorradores] = useState([]);
  const [abierto, setAbierto] = useState(null);
  const [encima, setEncima] = useState(false);
  /* El saludo es de una sola vez; el parpadeo, uno por lote que llega. */
  const [saludo, setSaludo] = useState(true);
  const [parpadeo, setParpadeo] = useState(0);
  /* `campoArchivos` y no `entrada`: ese nombre ya es el de la función de
     animación de la casa, y llamarlo igual la tapaba dentro del componente. */
  const campoArchivos = useRef(null);

  const cargar = async () => {
    const r = await misBorradores(cliente, materia);
    if (r.ok) setBorradores(r.borradores);
  };
  useEffect(() => { cargar(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [materia]);
  /* El saludo se apaga al acabar para que no vuelva a dispararse con cada
     repintado: es un «hola», no un tic. */
  useEffect(() => {
    const t = setTimeout(() => setSaludo(false), 700);
    return () => clearTimeout(t);
  }, []);

  const recibir = (lista) => {
    const malo = revisar([...archivos, ...Array.from(lista ?? [])]);
    if (malo) { setAviso({ tipo: "error", texto: malo }); return; }
    setAviso(null);
    setArchivos((a) => [...a, ...Array.from(lista ?? [])]);
  };

  const enviar = async () => {
    if (trabajando) return;
    setTrabajando(true);
    setFase(FASE.leyendo);
    /* El aviso de espera se fue: lo decía todo en una línea («dame menos de un
       minuto») y había dejado de ser verdad. Ahora lo cuenta Fermi, con la
       fase en la que va y el reloj corriendo. */
    setAviso(null);
    const r = await encargar(cliente, { materia, mensaje, archivos, avisar: (f) => setFase(f) });
    setTrabajando(false);
    if (!r.ok) { setAviso({ tipo: "error", texto: r.motivo }); return; }
    /* Si alguna actividad se cayó se dice, en vez de celebrar un número que no
       cuadra con lo que el profesor pidió. */
    const base = r.creadas === 1 ? "Lista una. Léela antes de publicar." : `Listas ${r.creadas}. Léelas antes de publicar.`;
    setAviso({ tipo: "bien", texto: r.fallos?.length ? `${base} Una no salió y la puedes volver a pedir.` : base });
    setParpadeo((n) => n + 1);
    setMensaje("");
    setArchivos([]);
    if (campoArchivos.current) campoArchivos.current.value = "";
    await cargar();
  };

  const marcar = async (id, estado) => {
    const r = await cambiarEstado(cliente, id, estado);
    if (r.ok) { setAbierto(null); await cargar(); }
  };

  const puede = Boolean(mensaje.trim() || archivos.length) && !trabajando;

  return (
    <section data-vista="fabrica">
      <style>{CSS}</style>
      <style>{CSS_ROBOT}</style>
      <style>{CSS_FERMI}</style>
      <style>{CSS_ESCENA}</style>
      <EstiloEntrada />
      <button type="button" style={volverV1} onClick={onVolver} data-volver>‹ Volver al resumen</button>

      {/*
        * ── CABECERA ──────────────────────────────────────────────────
        *
        * El robot de Bruno, no un icono. Es el mismo que ya le contesta al
        * estudiante, y ponerlo aquí dice sin una palabra quién va a hacer el
        * trabajo. Saluda al entrar, mira a los lados mientras crea y parpadea
        * cuando termina: tres estados, ninguno en bucle, que es la regla.
        */}
      <div {...entrada(0, "baja")} style={{ ...entrada(0, "baja").style, display: "flex", alignItems: "center", gap: "12px", margin: "4px 0 16px" }}>
        <span className={saludo ? "fae-bruno-saluda" : undefined} style={{ flexShrink: 0, display: "block" }}>
          <Robot tamano={42} estado={trabajando ? "pensando" : "quieto"} parpadeo={parpadeo} />
        </span>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "18px", fontWeight: 700, color: FAE.text }}>
            Crear actividades
          </h2>
          <p style={{ ...notaV1, fontSize: "13px" }}>Fermi las arma con tu material, para {nombreMateria || materia}</p>
        </div>
      </div>

      {/* ── EL ENCARGO ───────────────────────────────────────────────── */}
      <div
        {...entrada(1, "sube")}
        className={`fab-caja${encima ? " fab-caja--encima" : ""} ${entrada(1, "sube").className ?? ""}`}
        style={entrada(1, "sube").style}
        onDragOver={(e) => { e.preventDefault(); setEncima(true); }}
        onDragLeave={() => setEncima(false)}
        onDrop={(e) => { e.preventDefault(); setEncima(false); recibir(e.dataTransfer?.files); }}
        data-fabrica-encargo
      >
        <textarea
          id="fabrica-mensaje"
          className="fab-campo"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value.slice(0, 4000))}
          rows={3}
          aria-label="Qué quieres que haga"
          placeholder="¿Qué quieres que salga? Escríbelo aquí, o suelta tu PDF."
        />

        {archivos.length > 0 && (
          <ul className="fab-adjuntos">
            {archivos.map((a, i) => (
              <li key={`${a.name}-${i}`} className="fab-chip">
                <FileText size={14} color={FAE.teal} aria-hidden="true" />
                <span className="fab-chip__nombre">{a.name}</span>
                <span className="fab-chip__peso">{formatearPeso(a.size)}</span>
                <button
                  type="button"
                  className="fab-chip__x"
                  onClick={() => setArchivos((x) => x.filter((_, k) => k !== i))}
                  aria-label={`Quitar ${a.name}`}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="fab-barra">
          <input
            ref={campoArchivos}
            id="fabrica-archivos"
            type="file"
            multiple
            accept=".pdf,.txt,.md,.csv,application/pdf,text/plain,text/markdown,text/csv"
            onChange={(e) => recibir(e.target.files)}
            style={{ display: "none" }}
          />
          {/* El «+» que pidió Mateo: el signo dice lo que hacía la etiqueta. */}
          <label htmlFor="fabrica-archivos" className="fab-mas" title={`Adjuntar PDF o texto · hasta ${MAX_ARCHIVOS}`}>
            <Plus size={20} aria-hidden="true" />
            <span className="fab-solo-lector">Adjuntar archivo</span>
          </label>

          <span style={{ flex: 1 }} />

          <button type="button" onClick={enviar} disabled={!puede} className="fab-crear" data-crear>
            <Sparkles size={16} aria-hidden="true" />
            {trabajando ? "Creando…" : "Crear"}
          </button>
        </div>
      </div>

      {/*
        * ── FERMI, TRABAJANDO ─────────────────────────────────────────
        *
        * Ocupa el sitio de los ejemplos mientras dura el encargo: en esa
        * franja no hay nada más que mirar, y así la pantalla no da un salto
        * al aparecer. Los ejemplos vuelven solos cuando termina.
        */}
      {trabajando && <FermiTrabajando fase={fase} duracion={DURACION_UNA_PASADA_MS * 5} />}

      {/* ── LOS EJEMPLOS, EN VEZ DE INSTRUCCIONES ────────────────────── */}
      {!mensaje && !trabajando && (
        <div {...entrada(2, "sube")} className={`fab-ejemplos ${entrada(2, "sube").className ?? ""}`} style={entrada(2, "sube").style}>
          {EJEMPLOS.map((e) => (
            <button key={e} type="button" className="fab-ejemplo" onClick={() => setMensaje(e)}>
              {e}
            </button>
          ))}
        </div>
      )}

      <p {...entrada(3, "pie")} className={`fab-promesa ${entrada(3, "pie").className ?? ""}`} style={entrada(3, "pie").style}>
        <ShieldCheck size={14} color={FAE.teal} aria-hidden="true" />
        Tu archivo no se guarda. Se usa para crearlas y se descarta.
      </p>

      {aviso && (
        <p
          role={aviso.tipo === "error" ? "alert" : "status"}
          className="fab-aviso"
          /* El acierto NO va en teal: el teal rellena y contornea, nunca
             escribe (trinquete de toda la plataforma). Va en el azul claro de
             la casa, que sí es color de letra. */
          style={{ color: aviso.tipo === "error" ? FAE.coral : aviso.tipo === "bien" ? FAE.node : V1.texto2 }}
        >
          {aviso.texto}
        </p>
      )}

      {/* ── LOS BORRADORES ───────────────────────────────────────────── */}
      {borradores.length > 0 && (
        <ul className="fab-lista">
          {borradores.map((b, i) => {
            const publicada = b.estado === "publicada";
            /* Entran en fila, como las tarjetas de la portada: se leen como
               una lista que se arma, no como un bloque que aparece. */
            const e = entrada(4 + Math.min(i, 5), "crece");
            return (
              <li
                key={b.id}
                {...e}
                className={`fab-tarjeta${publicada ? " fab-tarjeta--viva" : ""} ${e.className ?? ""}`}
                style={e.style}
                data-borrador={b.id}
              >
                <div className="fab-tarjeta__fila">
                  <span className={`fab-punto${publicada ? " fab-punto--viva" : ""}`} aria-hidden="true" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="fab-tarjeta__titulo">{b.titulo}</p>
                    {/*
                      * El resumen va en la tarjeta cerrada, no dentro. Es lo
                      * que el profesor necesita para decidir si abre o
                      * descarta, y antes no estaba: la tarjeta decía el tema
                      * —que él ya conoce, es el suyo— y no qué va a hacer el
                      * estudiante, que es lo único que le sirve para escoger.
                      */}
                    {b.pieza?.resumen && (
                      /* Tres renglones cerrada y entera abierta. Mateo pidió
                         las dos cosas —saber de qué va la actividad y menos
                         texto— y no se contradicen: la primera frase cuenta
                         el qué, y el detalle se despliega si lo quiere. */
                      <p className={`fab-tarjeta__resumen${abierto === b.id ? " fab-tarjeta__resumen--entera" : ""}`}>
                        {b.pieza.resumen}
                      </p>
                    )}
                    <p className="fab-tarjeta__meta">{fichaDe(b, publicada)}</p>
                  </div>
                  <button
                    type="button"
                    className="fab-icono"
                    onClick={() => setAbierto(abierto === b.id ? null : b.id)}
                    aria-label={abierto === b.id ? `Cerrar ${b.titulo}` : `Leer ${b.titulo}`}
                    aria-expanded={abierto === b.id}
                    data-leer
                  >
                    {abierto === b.id ? <X size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                  </button>
                </div>

                {abierto === b.id && (
                  <>
                    <Vista pieza={b.pieza} />
                    <div className="fab-acciones">
                      {!publicada && (
                        <button type="button" onClick={() => marcar(b.id, "publicada")} className="fab-crear" data-publicar>
                          <Check size={16} aria-hidden="true" />
                          Publicar
                        </button>
                      )}
                      <button type="button" onClick={() => marcar(b.id, "descartada")} className="fab-icono fab-icono--fuera" aria-label={`Descartar ${b.titulo}`} data-descartar>
                        <Trash2 size={17} aria-hidden="true" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/* La actividad entera, para leerla antes de decidir. Sin rótulos en mayúscula:
   la jerarquía ya la dan el tamaño y el espacio. */
/*
 * La línea de datos duros de una tarjeta. Una sola, y con lo que de verdad
 * cambia una decisión: cuánto dura y si paga.
 *
 * Lo de los puntos es una pregunta que hace todo profesor y la respuesta aquí
 * es «ninguno»: las piezas de Aprender son material de estudio y el canon las
 * deja fuera del catálogo de FP a propósito —sin dificultad y sin modalidad,
 * equivocarse no puede costar—. Decirlo en la tarjeta es mejor que dejar que
 * lo descubra después de publicar.
 */
export function fichaDe(borrador, publicada) {
  const p = borrador?.pieza;
  const partes = [publicada ? "Publicada" : "Borrador"];
  if (p?.pasos?.length) partes.push(`${p.pasos.length} pasos`);
  if (p?.nombres?.length) partes.push(`${p.nombres.length} términos`);
  partes.push("Sin puntos");
  return partes.join(" · ");
}

/*
 * ═══════════ LA VISTA PREVIA ═══════════
 *
 * Tercera versión. La primera volcaba la pieza como texto; la segunda le puso
 * la figura y los pasos vivos. Mateo, 3-nov, sobre la segunda: «me mandas
 * mucho párrafo, no queremos contaminación visual, pongamos el texto al
 * mínimo».
 *
 * Tenía razón otra vez, y el error era de criterio: estaba enseñando la pieza
 * ENTERA, cuando lo que el profesor necesita es juzgarla. Para juzgarla hace
 * falta ver la figura y comprobar que cada paso enciende lo que dice. Las
 * definiciones de los términos y la respuesta de referencia son correctas o
 * no, pero no se juzgan de un vistazo — y ocupaban la mitad de la pantalla.
 *
 * Así que ahora se abre con lo que se juzga, y lo demás se despliega si lo
 * pide. La regla que uso: lo que se mira va visible, lo que se lee va dentro.
 */
function Vista({ pieza }) {
  const [paso, setPaso] = useState(0);
  const [verTerminos, setVerTerminos] = useState(false);
  const [verRespuesta, setVerRespuesta] = useState(false);
  if (!pieza) return null;

  const pasos = pieza.pasos ?? [];
  const actual = pasos[Math.min(paso, Math.max(0, pasos.length - 1))];
  const nombres = pieza.nombres ?? [];

  return (
    <div className="fab-vista" data-vista-borrador>
      {pieza.escena && (
        <div className="fab-escena">
          <EscenaGenerada escena={pieza.escena} resaltar={actual?.resaltar ?? []} />
        </div>
      )}

      {/* Los pasos son botones: tocar uno enciende su parte de la figura. Es
          la única forma de comprobar que cada paso de verdad señala algo. */}
      <ol className="fab-pasos" data-pasos-vivos={pieza.escena ? "" : undefined}>
        {pasos.map((p, i) => (
          <li key={i}>
            {pieza.escena ? (
              <button
                type="button"
                className={`fab-paso${i === paso ? " fab-paso--vivo" : ""}`}
                onClick={() => setPaso(i)}
                aria-current={i === paso || undefined}
              >
                {p.texto}
              </button>
            ) : p.texto}
          </li>
        ))}
      </ol>

      <p className="fab-pregunta">{pieza.pregunta}</p>

      <div className="fab-pliegues">
        {nombres.length > 0 && (
          <button type="button" className="fab-pliegue" onClick={() => setVerTerminos((v) => !v)} aria-expanded={verTerminos}>
            {verTerminos ? "Ocultar" : "Ver"} los {nombres.length} términos
          </button>
        )}
        {pieza.respuesta && (
          <button type="button" className="fab-pliegue" onClick={() => setVerRespuesta((v) => !v)} aria-expanded={verRespuesta}>
            {verRespuesta ? "Ocultar" : "Ver"} la respuesta
          </button>
        )}
      </div>

      {verTerminos && (
        <ul className="fab-terminos">
          {nombres.map((n, i) => (
            <li key={i}><strong>{n.termino}</strong> {n.definicion}</li>
          ))}
        </ul>
      )}
      {verRespuesta && <p className="fab-respuesta">{pieza.respuesta}</p>}
    </div>
  );
}

/*
 * El estilo va en una hoja y no en línea: aquí hay estados —el foco del campo,
 * el hover del «+», la caja encendida mientras se arrastra un archivo— que el
 * estilo en línea no sabe expresar, y eran justo lo que le faltaba.
 */
const CSS = `
.fab-tarjeta__resumen {
  margin: 6px 0 0; font-family: Inter, sans-serif; font-size: 13px; line-height: 1.55;
  color: rgba(248,249,250,0.80);
  display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden;
}
.fab-tarjeta__resumen--entera { -webkit-line-clamp: unset; overflow: visible; }
.fab-pliegues { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.fab-pliegue {
  min-height: 34px; padding: 7px 12px;
  border: 1px solid rgba(248,249,250,0.14); border-radius: 999px;
  background: transparent; color: rgba(248,249,250,0.72);
  font-family: Sora, sans-serif; font-size: 12px; cursor: pointer;
  transition: border-color 160ms ease, color 160ms ease;
}
.fab-pliegue:hover { border-color: rgba(42,157,143,0.55); color: ${FAE.text}; }
.fab-pliegue::after { content: ""; display: block; }

.fab-escena {
  padding: 14px 10px; border-radius: 14px;
  border: 1px solid rgba(248,249,250,0.08); background: rgba(14,27,46,0.55);
}
.fab-pasos[data-pasos-vivos] { list-style: none; padding: 0; margin: 12px 0 0; counter-reset: paso; }
.fab-pasos[data-pasos-vivos] li { counter-increment: paso; }
.fab-paso {
  display: flex; gap: 10px; width: 100%; text-align: left;
  /* 44 px de alto mínimo: es un control, y los controles del sitio se tocan
     con el pulgar. */
  min-height: 44px; align-items: center;
  padding: 9px 12px; margin: 0 0 6px;
  border: 1px solid transparent; border-radius: 10px;
  background: rgba(248,249,250,0.04); color: rgba(248,249,250,0.78);
  font-family: Inter, sans-serif; font-size: 13px; line-height: 1.5;
  cursor: pointer; transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
}
.fab-paso::before {
  content: counter(paso); flex-shrink: 0;
  width: 20px; height: 20px; border-radius: 50%;
  display: grid; place-items: center;
  font-family: Sora, sans-serif; font-size: 11px; font-weight: 700;
  background: rgba(248,249,250,0.10); color: rgba(248,249,250,0.72);
}
.fab-paso:hover { background: rgba(248,249,250,0.07); color: ${FAE.text}; }
.fab-paso--vivo {
  border-color: rgba(42,157,143,0.55); background: rgba(42,157,143,0.12); color: ${FAE.text};
}
.fab-paso--vivo::before { background: ${FAE.teal}; color: #06202A; }

.fab-solo-lector { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

.fab-caja {
  border-radius: 18px; padding: 6px 6px 6px;
  background: rgba(10,20,34,0.45);
  border: 1px solid rgba(248,249,250,0.16);
  transition: border-color 180ms ease, background 180ms ease;
}
.fab-caja:focus-within { border-color: rgba(42,157,143,0.65); }
.fab-caja--encima { border-color: ${FAE.teal}; background: rgba(42,157,143,0.08); border-style: dashed; }

.fab-campo {
  width: 100%; box-sizing: border-box; display: block; resize: vertical; min-height: 86px;
  padding: 12px 12px 4px; background: transparent; border: none; outline: none;
  color: ${FAE.text}; font-family: Inter, sans-serif; font-size: 16px; line-height: 1.5;
}
.fab-campo::placeholder { color: rgba(248,249,250,0.52); }

.fab-adjuntos { list-style: none; margin: 4px 0 0; padding: 0 8px; display: flex; flex-wrap: wrap; gap: 6px; }
.fab-chip {
  display: inline-flex; align-items: center; gap: 7px; max-width: 100%;
  padding: 5px 5px 5px 10px; border-radius: 999px;
  background: rgba(42,157,143,0.12); border: 1px solid rgba(42,157,143,0.34);
  font-size: 12.5px; color: ${FAE.text};
}
.fab-chip__nombre { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px; }
.fab-chip__peso { color: rgba(248,249,250,0.62); font-size: 11.5px; }
.fab-chip__x {
  display: grid; place-items: center; width: 22px; height: 22px; padding: 0; position: relative;
  border-radius: 999px; border: none; background: rgba(248,249,250,0.10); color: rgba(248,249,250,0.75); cursor: pointer;
}
/* El blanco de toque llega a 44 sin agrandar el dibujo. */
.fab-chip__x::after { content: ""; position: absolute; top: 50%; left: 50%; width: 44px; height: 44px; transform: translate(-50%, -50%); }

.fab-barra { display: flex; align-items: center; gap: 10px; padding: 6px 6px 0; }

.fab-mas {
  display: grid; place-items: center; width: 44px; height: 44px; flex-shrink: 0;
  border-radius: 14px; cursor: pointer;
  background: rgba(248,249,250,0.06); border: 1px solid rgba(248,249,250,0.18);
  color: rgba(248,249,250,0.82);
  transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
}
/* Al pasar por encima: el relleno y el contorno se tiñen de teal y el signo
   se pone blanco. El «+» NO se pinta de teal: el trinquete de la plataforma
   no distingue un icono de una letra, y tiene razón en no fiarse. */
.fab-mas:hover { background: rgba(42,157,143,0.14); border-color: rgba(42,157,143,0.6); color: ${FAE.text}; }

.fab-crear {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  min-height: 44px; padding: 0 20px; border-radius: 999px; border: none; cursor: pointer;
  background: ${FAE.teal}; color: #06202A;
  font-family: Sora, sans-serif; font-size: 14.5px; font-weight: 700;
  transition: filter 180ms ease, transform 180ms ease;
}
.fab-crear:hover:not(:disabled) { filter: brightness(1.08); }
.fab-crear:active:not(:disabled) { transform: translateY(1px); }
.fab-crear:disabled { background: rgba(248,249,250,0.10); color: rgba(248,249,250,0.62); cursor: not-allowed; }

.fab-ejemplos { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.fab-ejemplo {
  min-height: 36px; padding: 0 14px; border-radius: 999px; cursor: pointer;
  background: transparent; border: 1px dashed rgba(248,249,250,0.26);
  color: rgba(248,249,250,0.78); font-family: Inter, sans-serif; font-size: 12.5px;
  position: relative; transition: border-color 180ms ease, color 180ms ease;
}
.fab-ejemplo::after { content: ""; position: absolute; top: 50%; left: 0; width: 100%; height: 44px; transform: translateY(-50%); }
.fab-ejemplo:hover { border-color: rgba(42,157,143,0.7); color: ${FAE.text}; }

.fab-promesa { display: flex; align-items: center; gap: 7px; margin: 14px 0 0; font-size: 12.5px; color: rgba(248,249,250,0.6); }
.fab-aviso { margin: 12px 0 0; font-size: 13.5px; line-height: 1.45; }

.fab-lista { list-style: none; margin: 26px 0 28px; padding: 0; display: grid; gap: 10px; }
.fab-tarjeta {
  border-radius: 16px; padding: 13px 14px;
  background: rgba(248,249,250,0.04); border: 1px solid rgba(248,249,250,0.12);
}
.fab-tarjeta--viva { border-color: rgba(42,157,143,0.42); background: rgba(42,157,143,0.06); }
/* Arriba y no al centro: con el resumen en la tarjeta, el punto y el ojo
   quedaban flotando a mitad del párrafo, lejos del título al que pertenecen. */
.fab-tarjeta__fila { display: flex; align-items: flex-start; gap: 11px; }
.fab-tarjeta__fila > .fab-punto { margin-top: 7px; }
.fab-punto { width: 8px; height: 8px; border-radius: 999px; flex-shrink: 0; background: rgba(248,249,250,0.32); }
.fab-punto--viva { background: ${FAE.teal}; box-shadow: 0 0 0 4px rgba(42,157,143,0.18); }
.fab-tarjeta__titulo { margin: 0; font-family: Sora, sans-serif; font-size: 14.5px; font-weight: 700; color: ${FAE.text}; }
.fab-tarjeta__meta { margin: 2px 0 0; font-size: 12.5px; color: rgba(248,249,250,0.62); }

.fab-icono {
  display: grid; place-items: center; width: 44px; height: 44px; flex-shrink: 0; padding: 0;
  border-radius: 999px; cursor: pointer;
  background: rgba(248,249,250,0.06); border: 1px solid rgba(248,249,250,0.16); color: rgba(248,249,250,0.82);
  transition: background 180ms ease, color 180ms ease, border-color 180ms ease;
}
.fab-icono:hover { background: rgba(248,249,250,0.11); color: ${FAE.text}; }
.fab-icono--fuera:hover { border-color: rgba(231,111,81,0.6); color: ${FAE.coral}; }

.fab-acciones { display: flex; align-items: center; gap: 10px; margin-top: 14px; }

.fab-vista { margin-top: 13px; padding-top: 13px; border-top: 1px solid rgba(248,249,250,0.12); }
.fab-objetivo { margin: 0 0 12px; font-size: 13.5px; line-height: 1.5; color: ${FAE.node}; }
.fab-terminos { list-style: none; margin: 0 0 14px; padding: 0; display: grid; gap: 7px; }
.fab-terminos li { font-size: 13.5px; line-height: 1.5; color: rgba(248,249,250,0.82); padding-left: 12px; border-left: 2px solid rgba(42,157,143,0.4); }
.fab-terminos strong { color: ${FAE.text}; }
.fab-pasos { margin: 0 0 14px; padding-left: 20px; display: grid; gap: 6px; }
.fab-pasos li { font-size: 13.5px; line-height: 1.5; color: rgba(248,249,250,0.82); }
.fab-pregunta { margin: 0 0 8px; font-size: 14px; line-height: 1.5; font-weight: 600; color: ${FAE.text}; }
.fab-respuesta {
  margin: 0; padding: 10px 12px; border-radius: 12px; font-size: 13.5px; line-height: 1.55;
  color: rgba(248,249,250,0.84); background: rgba(42,157,143,0.08); border-left: 3px solid ${FAE.teal};
}

@media (prefers-reduced-motion: reduce) {
  .fab-caja, .fab-mas, .fab-crear, .fab-ejemplo, .fab-icono { transition: none; }
  .fab-crear:active:not(:disabled) { transform: none; }
}
`;
