import { useContext, useEffect, useState } from "react";
import { FAE } from "../../theme.js";
import { actividadDe, itemsDe } from "../../docente/datos.js";
import { BANDAS, bandaDe, CORTE_BAJO } from "../../docente/bandas.js";
import { etiquetaDeItem } from "../../docente/etiquetasItem.js";
import { NavigationContext } from "../../navigation.js";
import { vistaDeTema } from "../../ruta.js";
import { ubicacionDeActividad } from "../../data/subjects.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * RENDIMIENTO POR ACTIVIDAD — cómo le fue al grupo en UNA actividad concreta.
 *
 * Todo lo demás del panel agrega por persona: quién se descuelga, cómo le va a
 * cada uno. Esto responde la otra pregunta sin tener que cruzar el curso.
 *
 * ═══════════ ENSAMBLAJE, NO VOCABULARIO NUEVO ═══════════
 *
 * Las tarjetas son las de CabeceraResumen —mismo talle, mismo rótulo, misma
 * cifra, mismo pie—. Las barras son las de AVANCE POR TEMA: pista de 6 px,
 * relleno redondeado, misma transición. La tira de color de un ítem con muchos
 * fallos es la de BloqueAlertas: 3 px a la izquierda, nunca un icono.
 *
 * LO QUE NO SE ENCONTRÓ: el encargo pedía para el diagnóstico "el mismo
 * lenguaje visual que el desglose de la evaluación final de Demanda Agregada".
 * Ese desglose NO EXISTE. La Ronda Final de DA-Learn eran dos preguntas de
 * quiz para el estudiante, sin ninguna vista de desglose, y se borró entera
 * con el simulador en el commit anterior. En su lugar se usa el tratamiento
 * de filas del historial de DetalleEstudiante, que es lo más parecido que hay
 * vivo en este mismo panel: nombre a la izquierda, cifra tabular, matiz
 * apagado a la derecha.
 *
 * ═══════════ EL COLOR NUNCA VA SOLO ═══════════
 *
 * Cada banda lleva su nombre y su rango en números. Cada ítem dice "N de M
 * fallaron" en texto. La finalización en cero dice "nadie de tu grupo todavía"
 * con palabras. Quien no distinga ámbar de coral lee lo mismo.
 *
 * ═══════════ Y NINGÚN UMBRAL NUEVO ═══════════
 *
 * El acierto medio se colorea con bandaDe(), que son los DOS cortes que el
 * sitio ya usa —85 de Destacados y 60 de la alerta ámbar—, no una escala
 * inventada para esta pantalla.
 *
 * La finalización no tiene corte, porque el proyecto no tiene ninguno para
 * ella y no se inventa uno aquí: solo se marca en ámbar el caso del CERO, que
 * no necesita escala para leerse. Un 3 de 12 se enseña en tono neutro con su
 * denominador al lado, y es el docente quien juzga si es poco.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const tarjeta = {
  padding: "14px 16px",
  borderRadius: "14px",
  background: `${FAE.navy}59`,
  border: "1px solid rgba(248,249,250,0.12)",
  minWidth: 0,
};
const rotulo = { margin: "0 0 6px", fontSize: "11px", letterSpacing: "0.06em", color: "rgba(248,249,250,0.5)" };
const cifra = { margin: 0, fontFamily: "Sora, sans-serif", fontSize: "28px", fontWeight: 700, fontVariantNumeric: "tabular-nums", lineHeight: 1 };
const pie = { margin: "6px 0 0", fontSize: "11.5px", lineHeight: 1.4, color: "rgba(248,249,250,0.55)" };
const nota = { margin: 0, fontSize: "12.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.58)" };

const COLOR_BANDA = Object.fromEntries(BANDAS.map((b) => [b.id, b.color]));

/* Milisegundos a algo que se lee. Nunca "204000 ms". */
function duracion(ms) {
  const n = Number(ms);
  if (!Number.isFinite(n) || n <= 0) return "—";
  const s = Math.round(n / 1000);
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return s % 60 === 0 ? `${m} min` : `${m} min ${s % 60} s`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

function fechaCorta(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "long" });
}

/*
 * ═══════════ EL ITEM SE NOMBRA LEYENDO SU BANCO ═══════════
 *
 * Aquí se enseñaba el id crudo —`et2:Evento`, `r3:cRD`— partido por su prefijo.
 * Para un profesor eso es ruido, y el diagnóstico por pregunta es justo la
 * parte que se lleva a clase.
 *
 * etiquetaDeItem() devuelve el enunciado que vio el estudiante, LEÍDO del mismo
 * banco del que salió el id. No hay catálogo de traducciones y por tanto no hay
 * segunda copia que pueda desincronizarse.
 *
 * Cuando no puede nombrarlo devuelve null, y eso NO se maquilla: se enseña el
 * id crudo y se cuenta arriba. Ver el canario, más abajo.
 */

/*
 * ═══════════ QUÉ FALLÓ, DICHO CON PRECISIÓN ═══════════
 *
 * Aquí había un solo aviso —"no está disponible todavía"— para cualquier error.
 * Era indistinguible de «se rompió», y ese «todavía» afirmaba una causa concreta
 * —que la migración no ha corrido— que casi nunca es la verdadera. Costó diez
 * minutos de diagnóstico a ciegas la primera vez que se usó de verdad.
 *
 * Los tres códigos que se pueden distinguir, y por qué importan:
 *
 *   PGRST202  PostgREST no encuentra la función. O la migración no corrió, o
 *             corrió hace un momento y su caché de esquema todavía no se ha
 *             recargado — se recarga sola, así que la salida es esperar y
 *             volver a cargar. Es la única causa transitoria de las tres.
 *   42501     Permiso denegado. O la cuenta no es docente, o no lo es de ESTA
 *             materia. No se arregla recargando.
 *   cualquier PGRST203, un fallo de red, un timeout. No se adivina la causa:
 *   otro      se enseña el código y se dice que no se pudo cargar.
 *
 * Ninguna de las tres promete nada que no se sepa. Y todas enseñan el código,
 * porque el objetivo no es que el docente entienda el error, sino que pueda
 * mandarlo sin tener que abrir nada.
 */
function explicarFallo(error) {
  const code = error?.code ?? null;
  if (code === "PGRST202") {
    return {
      titulo: "El servidor todavía no ve esta consulta",
      cuerpo:
        "Si la migración 0021 acaba de correr, PostgREST tarda un momento en recargar su " +
        "caché de esquema y lo hace solo. Espera un minuto y vuelve a cargar la página. Si " +
        "sigue igual pasados unos minutos, la migración no llegó a aplicarse.",
    };
  }
  if (code === "42501") {
    return {
      titulo: "Sin permiso para esta consulta",
      cuerpo:
        "Tu cuenta no está autorizada para ver el rendimiento de esta materia. Recargar no " +
        "lo cambia: el acceso se habilita correo por correo, y por materia.",
    };
  }
  return {
    titulo: "No se pudo cargar el rendimiento por actividad",
    cuerpo:
      "El resto del panel sigue funcionando. Si se repite, manda el código de abajo: dice " +
      "exactamente qué respondió el servidor.",
  };
}
/* Una barra de banda. Misma pista y mismo relleno que AVANCE POR TEMA. */
function BarraBanda({ banda, n, total }) {
  const pct = total > 0 ? (n / total) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, color: banda.color }}>
            {banda.nombre}
          </span>
          <span style={{ fontSize: "11.5px", color: "rgba(248,249,250,0.45)" }}>{banda.detalle}</span>
        </div>
        <div style={{ height: "6px", borderRadius: "999px", background: "rgba(248,249,250,0.1)", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: banda.color, borderRadius: "999px", transition: "width 300ms ease" }} />
        </div>
      </div>
      <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "13px", fontVariantNumeric: "tabular-nums", color: "rgba(248,249,250,0.7)", whiteSpace: "nowrap" }}>
        {n} {n === 1 ? "estudiante" : "estudiantes"}
      </p>
    </div>
  );
}

export default function VistaRendimiento({ subjectId, actividad, nombreMateria }) {
  /*
   * Sin actividad no hay nada que pedir ni que pintar. El panel ya no la monta
   * en ese estado, pero el componente no debe depender de que quien lo use se
   * acuerde: el hook de abajo lee actividad.id y una llamada sin prop tumbaba
   * el árbol entero en vez de no pintar nada.
   */
  const id = actividad?.id ?? null;
  const nav = useContext(NavigationContext);
  const [datos, setDatos] = useState(null);      // null = cargando
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let vivo = true;
    setDatos(null);
    setItems([]);
    setError(null);

    if (!id) return undefined;

    actividadDe(subjectId, id).then(({ actividad: a, error }) => {
      if (!vivo) return;
      setDatos(a);
      setError(error);
    });
    /*
     * El diagnóstico va en su propia llamada y no bloquea las cifras: si
     * panel_items falla o devuelve vacío, las tarjetas de arriba se ven igual.
     */
    itemsDe(subjectId, id).then(({ items }) => {
      if (vivo) setItems(items);
    });
    return () => { vivo = false; };
  }, [subjectId, id]);

  if (!id) return null;

  if (error) {
    const { titulo, cuerpo } = explicarFallo(error);
    return (
      <div style={{ ...tarjeta, maxWidth: "62ch" }}>
        <p style={{ margin: "0 0 5px", fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 600, color: FAE.ambar }}>
          {titulo}
        </p>
        <p style={nota}>{cuerpo}</p>
        {/*
          * El código, en pequeño y siempre. Con una captura de pantalla basta
          * para saber qué pasó, sin pedirle a nadie que abra la consola.
          */}
        <p style={{ margin: "8px 0 0", fontSize: "11px", color: "rgba(248,249,250,0.4)" }}>
          Código: {error.code ?? "sin código"}
          {error.message ? ` · ${error.message}` : ""}
        </p>
      </div>
    );
  }

  if (datos === null) {
    return <p style={{ margin: 0, fontSize: "13px", color: "rgba(248,249,250,0.5)" }}>Cargando…</p>;
  }

  const intentos = Number(datos.intentos ?? 0);
  const completaron = Number(datos.completaron ?? 0);
  const grupoTotal = Number(datos.grupo_total ?? 0);
  const enGrupo = Number(datos.en_grupo ?? 0);
  const evaluativa = datos.modality === "evaluativa";

  /*
   * ═══════════ EL DENOMINADOR ES EL GRUPO CURADO, Y LO DICE ═══════════
   *
   * Con grupo armado, la finalización habla de él: "3 de 12 de tu grupo". Sin
   * grupo, ese denominador no existe y no se inventa uno — se enseña cuántos
   * lo terminaron en total y se dice que aún no hay grupo, que es la misma
   * convención que el resto del panel.
   */
  const hayGrupo = grupoTotal > 0;
  const finalizacion = hayGrupo ? enGrupo : completaron;
  const nadieDelGrupo = hayGrupo && enGrupo === 0;

  if (intentos === 0) {
    return (
      <div style={{ ...tarjeta, maxWidth: "62ch" }}>
        <p style={{ margin: "0 0 4px", fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 600, color: FAE.text }}>
          {actividad.nombre}
        </p>
        <p style={nota}>
          Nadie ha registrado todavía esta actividad{hayGrupo ? ", ni dentro ni fuera de tu grupo" : ""}. En
          cuanto alguien la termine, aquí aparecerán su finalización, su distribución y su diagnóstico.
        </p>
      </div>
    );
  }

  /*
   * A qué vista lleva la vuelta. Sale de subjects.js y ruta.js, no de una lista
   * escrita aquí: si el enlace no sabe a dónde ir, no se pinta.
   */
  const enlaceAlTema = nav?.irA
    ? vistaDeTema(ubicacionDeActividad(id)?.temaId ?? "", "hacer")
    : null;

  const conDetalle = Number(datos.intentos_con_detalle ?? 0);
  /* Cuántos ítems reales no se pudieron nombrar. Lo usa el canario. */
  const sinNombrar = items.filter((it) => !etiquetaDeItem(actividad.id, it.item_id)).length;
  const coberturaTotal = conDetalle >= intentos;
  const desde = fechaCorta(datos.detalle_desde);
  const bandaMedia = bandaDe(datos.pct_medio);

  return (
    <div>
      {/* ── Quién es esta actividad ── */}
      <div style={{ marginBottom: "14px" }}>
        <h3 style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(17px, 2.4vw, 20px)", fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 4px", color: FAE.text }}>
          {actividad.nombre}
        </h3>
        <p style={{ margin: 0, fontSize: "12.5px", color: "rgba(248,249,250,0.5)" }}>
          {actividad.tema} · {nombreMateria}
          {datos.difficulty && <> · {datos.difficulty}</>}
          {" · "}
          {evaluativa ? "evaluativa" : "exploratoria"}
        </p>

        {/*
          * ═══════════ EL CAMINO DE VUELTA, Y HASTA DÓNDE LLEGA ═══════════
          *
          * Lleva al TEMA de la actividad, no a la actividad. La diferencia es
          * real y conviene que se lea en el propio texto del enlace: cuál nodo
          * está abierto dentro de un tema no vive en la URL todavía —eso es A2,
          * pendiente— así que el docente aterriza en el camino y toca el nodo.
          *
          * Se podría haber forzado pasando el nodo inicial a las cinco vistas de
          * tema, pero cada una tendría que comprobar que el nodo recibido es
          * suyo y volver al camino si no; son cinco ediciones con cuidado, no un
          * añadido. Con el tercer segmento del hash ya puesto, A2 es más barato
          * que antes y ese es su sitio.
          */}
        {enlaceAlTema && (
          <button
            type="button"
            onClick={() => nav.irA(enlaceAlTema, "hacer")}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              marginTop: "8px", padding: 0, background: "transparent", border: "none",
              cursor: "pointer", color: FAE.teal, fontFamily: "Inter, sans-serif", fontSize: "12.5px",
              textDecorationLine: "underline", textUnderlineOffset: "3px",
              textDecorationColor: `${FAE.teal}66`,
            }}
          >
            Ir al camino de este tema
          </button>
        )}
      </div>

      {/* ── Las cifras, en el formato de tarjeta del resumen ejecutivo ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "12px" }}>
        <div style={tarjeta}>
          <p style={rotulo}>LA TERMINARON</p>
          <p style={{ ...cifra, color: nadieDelGrupo ? FAE.ambar : FAE.text }}>{finalizacion}</p>
          <p style={pie}>
            {hayGrupo
              ? `de ${grupoTotal} de tu grupo`
              : "estudiantes con actividad en la materia — todavía sin grupo armado"}
            {/* El caso del cero se dice con palabras, no solo con el ámbar. */}
            {nadieDelGrupo && (
              <span style={{ color: FAE.ambar }}> · nadie de tu grupo todavía</span>
            )}
          </p>
        </div>

        {/*
          * En exploratoria no se pinta la tarjeta de acierto. El servidor
          * devuelve pct_medio en null a propósito —el quiz deja reintentar
          * hasta acertar y el porcentaje mediría constancia— y una tarjeta con
          * un guion invita a leerla como "todavía no", que es otra cosa.
          */}
        {evaluativa && (
          <div style={tarjeta}>
            <p style={rotulo}>ACIERTO MEDIO</p>
            <p style={{ ...cifra, color: bandaMedia ? COLOR_BANDA[bandaMedia] : FAE.text }}>
              {datos.pct_medio === null || datos.pct_medio === undefined
                ? "—"
                : `${Math.round(Number(datos.pct_medio))}%`}
            </p>
            <p style={pie}>
              {/* El tono va acompañado de la palabra de su banda. */}
              {bandaMedia
                ? `Banda ${BANDAS.find((b) => b.id === bandaMedia).nombre.toLowerCase()} · mejor intento de cada estudiante`
                : "Mejor intento de cada estudiante"}
            </p>
          </div>
        )}

        <div style={tarjeta}>
          <p style={rotulo}>TIEMPO MEDIO</p>
          <p style={{ ...cifra, color: FAE.text }}>{duracion(datos.duracion_media_ms)}</p>
          <p style={pie}>Sobre {intentos} {intentos === 1 ? "intento" : "intentos"}</p>
        </div>

        <div style={tarjeta}>
          <p style={rotulo}>FP MEDIO</p>
          <p style={{ ...cifra, color: FAE.teal }}>
            {datos.fp_medio === null || datos.fp_medio === undefined ? "—" : Math.round(Number(datos.fp_medio))}
          </p>
          <p style={pie}>Por intento registrado</p>
        </div>
      </div>

      {/* ── La distribución, solo si es evaluativa ── */}
      {evaluativa && (
        <div style={{ marginTop: "20px" }}>
          <p style={{ ...rotulo, marginBottom: "10px" }}>DISTRIBUCIÓN POR BANDAS</p>

          {datos.distribucion_visible ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {BANDAS.map((b) => (
                <BarraBanda
                  key={b.id}
                  banda={b}
                  n={Number(datos[b.campo] ?? 0)}
                  total={completaron}
                />
              ))}
            </div>
          ) : (
            /*
              * El umbral de celda lo decide el SERVIDOR: si alguna banda no
              * vacía tiene menos de tres estudiantes, los tres recuentos vienen
              * en null y ni siquiera llegan al navegador. Aquí solo se explica.
              */
            <div style={{ ...tarjeta, maxWidth: "62ch" }}>
              <p style={nota}>
                La distribución no se muestra: con este número de estudiantes, alguna de las bandas
                tendría una o dos personas y señalaría a alguien. El acierto medio de arriba sí es
                seguro porque no separa a nadie.
              </p>
            </div>
          )}
        </div>
      )}

      {/*
        * ── El diagnóstico por pregunta ──
        *
        * TRES SALIDAS DISTINTAS, Y CADA UNA DICE LO SUYO:
        *
        *   · La actividad no tiene ítems  → la sección NO SE PINTA. Lo declara
        *     subjects.js, no se deduce de que la lista venga vacía.
        *   · Hay ítems pero pocos intentos → sección con la razón escrita.
        *   · Hay diagnóstico               → las filas, y la nota de cobertura
        *     si el detalle no cubre todos los intentos.
        */}
      {!actividad.sinItems && (
        <div style={{ marginTop: "22px" }}>
          <p style={{ ...rotulo, marginBottom: "10px" }}>DIAGNÓSTICO POR PREGUNTA</p>

          {items.length === 0 ? (
            <div style={{ ...tarjeta, maxWidth: "62ch" }}>
              <p style={nota}>
                {conDetalle === 0
                  ? "Todavía no hay ni un intento con detalle guardado de esta actividad, así que no hay nada que diagnosticar. Las partidas anteriores a la instrumentación no lo guardaron."
                  : `Hace falta un mínimo de 5 intentos con detalle guardado y hay ${conDetalle}. Por debajo de eso no es un diagnóstico: es lo que le pasó a dos o tres personas, y cambiar una actividad por eso es peor que no tener la sección.`}
              </p>
            </div>
          ) : (
            <>
              {/*
                * La nota de cobertura DESAPARECE cuando el detalle cubre todos
                * los intentos: una nota permanente que siempre dice lo mismo se
                * deja de leer, y entonces ya no avisa el día que importa.
                */}
              {!coberturaTotal && (
                <p style={{ ...nota, margin: "-2px 0 12px", maxWidth: "62ch", color: "rgba(248,249,250,0.5)" }}>
                  Cubre {conDetalle} de {intentos} intentos
                  {desde ? `, desde el ${desde}` : ""}. Lo anterior se jugó antes de que la actividad
                  guardara el detalle.
                </p>
              )}

              {/*
                * ═══════════ EL CANARIO ═══════════
                *
                * Los ids de aquí son los REALES, los que devolvió el servidor.
                * Es la única verdad disponible: las pruebas de etiquetas derivan
                * de los mismos bancos que las reglas, así que demuestran
                * coherencia y no corrección — si la gramática de un componente
                * se separa de las otras dos a la vez, ninguna prueba lo ve.
                *
                * Por eso esto no deja un hueco en blanco: dice cuántos no supo
                * nombrar. Un docente que lo vea puede reportarlo, y ese aviso es
                * lo único que separa este fallo del modo del «×100» —nada falla
                * y el panel enseña otra cosa—.
                */}
              {sinNombrar > 0 && (
                <p style={{ ...nota, margin: "0 0 10px", color: FAE.ambar }}>
                  {sinNombrar === 1
                    ? "1 de estas preguntas no se pudo nombrar y sale con su id interno."
                    : `${sinNombrar} de estas preguntas no se pudieron nombrar y salen con su id interno.`}
                  {" "}Avísanos: es un fallo nuestro, no un dato raro.
                </p>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                {items.map((it) => {
                  const pctFallo = Number(it.pct_fallo ?? 0);
                  /*
                   * El mismo corte de siempre, leído del otro lado: fallar más
                   * del 40% es acertar menos del 60, que es el umbral de la
                   * alerta ámbar del panel. No es una escala nueva.
                   */
                  const grave = pctFallo > 100 - CORTE_BAJO;
                  const color = grave ? FAE.coral : pctFallo >= 25 ? FAE.ambar : "rgba(248,249,250,0.25)";
                  const etiqueta = etiquetaDeItem(actividad.id, it.item_id);
                  return (
                    <div
                      key={it.item_id}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: "10px",
                        padding: "9px 0", borderBottom: "1px solid rgba(248,249,250,0.07)",
                      }}
                    >
                      {/* Tira de color, como en las alertas. Nunca un icono. */}
                      <span aria-hidden="true" style={{ width: "3px", alignSelf: "stretch", borderRadius: "2px", background: color, flexShrink: 0 }} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ margin: 0, fontSize: "13px", color: "rgba(248,249,250,0.85)", wordBreak: "break-word" }}>
                          {etiqueta ?? (
                            /* Sin nombre: el id crudo, marcado como lo que es. */
                            <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "12px", color: FAE.ambar }}>
                              {it.item_id}
                            </span>
                          )}
                        </p>
                        {/* Qué contestaron en su lugar: lo único accionable de aquí. */}
                        {it.respuesta_top && (
                          <p style={{ margin: "3px 0 0", fontSize: "11.5px", lineHeight: 1.45, color: "rgba(248,249,250,0.5)" }}>
                            Se equivocan sobre todo con «{it.respuesta_top}» ({it.respuesta_top_veces}{" "}
                            {Number(it.respuesta_top_veces) === 1 ? "vez" : "veces"})
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: grave ? FAE.coral : FAE.text }}>
                          {Math.round(pctFallo)}%
                        </p>
                        {/* El porcentaje nunca va solo: debajo, los dos números. */}
                        <p style={{ margin: "2px 0 0", fontSize: "11px", color: "rgba(248,249,250,0.45)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                          {it.fallos} de {it.veces} fallaron
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
