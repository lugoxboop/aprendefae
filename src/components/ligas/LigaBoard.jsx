import { useCallback, useEffect, useState } from "react";
import { FAE } from "../../theme.js";
import { useAuth } from "../../auth/AuthProvider.jsx";
import { tableroDe, contextoDe, repartir, tieneLigas } from "../../ligas/ligas.js";
import CabeceraLiga from "./CabeceraLiga.jsx";
import BotonAnimo from "../social/BotonAnimo.jsx";
import { estadoDeAnimos } from "../../social/animo.js";

/*
 * Tablero de liga de una materia.
 *
 * Enseña dos cosas distintas y las separa a propósito:
 *
 *   el podio    público. Los primeros de tu grupo, con nombre y FP del ciclo.
 *               Estar arriba se reconoce, y se reconoce delante de todos.
 *   tu puesto   privado. Tu posición exacta la ves solo tú, en tu propia línea.
 *               De los demás que no están en el podio no se dice ni el nombre
 *               ni el número: solo cuántos son.
 *
 * EL PODIO ES LA ZONA DE ASCENSO (0026): quien sale en él subiría si la semana
 * terminara ahora, y el cierre del lunes sube exactamente a esos. Es el 15% de
 * los activos del nivel, mínimo 1: 3 nombres con 17, 1 con 7. No salir en él
 * es lo normal —más del 80%—, y por eso no aparecer no señala a nadie.
 */

const marco = {
  borderRadius: "18px",
  background: "rgba(248,249,250,0.04)",
  border: "1px solid rgba(248,249,250,0.12)",
  padding: "18px 20px",
};

/*
 * Distintivo de podio. Es un número en un cuadrado con acento, la misma
 * gramática que ya usa el ranking: el sitio no usa medallas ni trofeos.
 */
function Puesto({ n, destacado }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "26px",
        height: "26px",
        flexShrink: 0,
        borderRadius: "8px",
        fontFamily: "Sora, sans-serif",
        fontSize: "12.5px",
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
        color: destacado ? FAE.bg : FAE.teal,
        background: destacado ? FAE.teal : "rgba(42,157,143,0.14)",
        border: `1px solid ${FAE.teal}`,
      }}
    >
      {n}
    </span>
  );
}

/*
 * Mientras no se sabe, no hay niveles. Con esto la cabecera dice lo genérico en
 * vez de parpadear un nombre y quitarlo, que es peor que no ponerlo.
 */
const SIN_CONTEXTO = {
  totalNiveles: 0,
  ligaAnterior: null,
  nivelesAnterior: null,
  transicion: null,
  activosReparto: null,
};

export default function LigaBoard({ subjectId }) {
  const { session, pedirCuenta } = useAuth();
  const [estado, setEstado] = useState({ cargando: true, filas: [], error: null });
  const [contexto, setContexto] = useState(SIN_CONTEXTO);
  const [animos, setAnimos] = useState({});

  const cargar = useCallback(async () => {
    if (!tieneLigas(subjectId)) return;
    setEstado((e) => ({ ...e, cargando: true }));
    /*
     * Las dos llamadas van a la vez, no una tras otra: son independientes y
     * encadenarlas sumaría una ida y vuelta a un tablero que ya hace dos.
     */
    const [tablero, ctx] = await Promise.all([tableroDe(subjectId), contextoDe(subjectId)]);
    const { filas, error } = tablero;
    setContexto(ctx.contexto ?? SIN_CONTEXTO);
    setEstado({ cargando: false, filas, error });
    /* Aparte de liga_tablero, para no tocar una función ya asegurada. */
    setAnimos(await estadoDeAnimos((filas ?? []).filter((f) => !f.es_tuyo).map((f) => f.nickname)));
  }, [subjectId]);

  useEffect(() => {
    cargar();
    /* Al volver a la pestaña, por si compitió desde otro dispositivo. */
    const alVolver = () => document.visibilityState === "visible" && cargar();
    document.addEventListener("visibilitychange", alVolver);
    return () => document.removeEventListener("visibilitychange", alVolver);
  }, [cargar, session]);

  if (!tieneLigas(subjectId)) return null;

  const { podio, tuya, enPodio, liga, tamLiga, restantes } = repartir(estado.filas);

  return (
    <section style={marco}>
      {/*
        El nombre del nivel y el texto de la semana salen los dos de aquí, de
        una sola llamada a mensajeSemanal(). Ver CabeceraLiga.jsx.
      */}
      <CabeceraLiga
        liga={liga}
        totalNiveles={contexto.totalNiveles}
        ligaAnterior={contexto.ligaAnterior}
        nivelesAnterior={contexto.nivelesAnterior}
        transicion={contexto.transicion}
        activosReparto={contexto.activosReparto}
        tamLiga={liga ? tamLiga : 0}
      />

      {estado.cargando ? (
        <p style={{ fontSize: "13.5px", color: "rgba(248,249,250,0.5)", margin: 0 }}>Cargando…</p>
      ) : !session ? (
        <>
          <p style={{ fontSize: "13.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.62)", margin: "0 0 12px" }}>
            Las ligas son entre estudiantes con cuenta. Entra para ver la tuya.
          </p>
          <button
            type="button"
            onClick={() => pedirCuenta("ver tu liga")}
            style={{
              fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
              padding: "9px 18px", borderRadius: "999px", cursor: "pointer",
              background: FAE.teal, border: "none", color: FAE.bg,
            }}
          >
            Entrar
          </button>
        </>
      ) : estado.filas.length === 0 ? (
        /*
         * Sin liga todavía: no ha ganado FP en esta materia este ciclo. Se dice
         * qué hace falta, no "no hay datos".
         */
        <p style={{ fontSize: "13.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.62)", margin: 0 }}>
          Completa una actividad de esta materia y entras a competir esta misma semana.
        </p>
      ) : (
        <>
          {/*
            Podio vacío: nadie ha sumado FP todavía, o todos van empatados. Con
            el 28% no pasaba nunca —todos a cero cabían en el corte— y el lunes
            por la mañana la liga entera salía en el podio.
          */}
          {podio.length === 0 && (
            <p style={{ fontSize: "13.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.62)", margin: 0 }}>
              Esta semana todavía nadie se ha separado del grupo.
            </p>
          )}
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            {podio.map((f) => (
              <li
                key={`${f.posicion}-${f.nickname}`}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "8px 10px", borderRadius: "10px",
                  background: f.es_tuyo ? "rgba(42,157,143,0.12)" : "transparent",
                  border: `1px solid ${f.es_tuyo ? "rgba(42,157,143,0.4)" : "transparent"}`,
                }}
              >
                <Puesto n={f.posicion} destacado={f.es_tuyo} />
                <span style={{ flex: 1, minWidth: 0, fontSize: "14px", fontWeight: f.es_tuyo ? 700 : 400, color: FAE.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {f.nickname}{f.es_tuyo ? " · tú" : ""}
                </span>
                <span style={{ fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: FAE.teal }}>
                  {f.fp} FP
                </span>
                {/* Nunca en la fila propia. */}
                {!f.es_tuyo && animos[f.nickname] && (
                  <BotonAnimo apodo={f.nickname} recibidos={animos[f.nickname].recibidos} yaLeDi={animos[f.nickname].yaLeDi} />
                )}
              </li>
            ))}
          </ol>

          {/* De los demás, solo cuántos son. Ni nombres ni puestos. */}
          {restantes > 0 && podio.length > 0 && (
            <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.45)", margin: "12px 0 0" }}>
              y {restantes} estudiante{restantes === 1 ? "" : "s"} más compitiendo esta semana
            </p>
          )}

          {/*
            Tu puesto exacto, solo para ti. Va separado del podio con un divisor
            para que se lea como información propia y no como parte del tablero
            público.
          */}
          {tuya && !enPodio && (
            <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid rgba(248,249,250,0.1)" }}>
              <p style={{ fontSize: "13.5px", lineHeight: 1.5, margin: 0, color: "rgba(248,249,250,0.75)" }}>
                Estás en el puesto{" "}
                <strong style={{ fontFamily: "Sora, sans-serif", color: FAE.text }}>#{tuya.posicion}</strong>{" "}
                de {tamLiga} en tu liga esta semana, con{" "}
                <strong style={{ fontFamily: "Sora, sans-serif", color: FAE.teal }}>{tuya.fp} FP</strong>.
              </p>
              <p style={{ fontSize: "12px", color: "rgba(248,249,250,0.4)", margin: "6px 0 0" }}>
                Solo tú ves esta línea.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
