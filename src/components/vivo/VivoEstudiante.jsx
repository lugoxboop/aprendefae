import { useEffect, useRef, useState } from "react";
import { ChevronLeft, LogIn, Check, X as Equis, Clock } from "lucide-react";
import { useAuthOpcional } from "../../auth/AuthProvider.jsx";
import { unirse, responder, leerPodio, limpiarCodigo, mensajeDeError, restanteMs, LETRAS } from "../../vivo/datos.js";
import { useSala, useReloj } from "../../vivo/useSala.js";
import { CSS_VIVO, V, COLORES } from "../../vivo/estilo.js";
import { Enunciado, Opciones, Reloj, Podio, miles } from "./piezas.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CLASE EN VIVO — EL CELULAR DEL ESTUDIANTE (fase 1, encargo de Mateo, 4-nov)
 *
 * Una sola cosa por pantalla: el código, la espera, la pregunta, cómo le fue,
 * el podio. El tablero del profesor es lo que se mira; el celular es el mando.
 * Por eso aquí la pregunta va pequeña y las opciones grandes.
 *
 * El código puede llegar en la dirección (#/vivo/123456): entra solo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function VivoEstudiante({ codigoInicial = null, onBack }) {
  const auth = useAuthOpcional();
  const conSesion = Boolean(auth?.session);
  const [codigo, setCodigo] = useState(limpiarCodigo(codigoInicial));
  const [inicial, setInicial] = useState(null);
  const [entrando, setEntrando] = useState(false);
  const [error, setError] = useState(null);
  const intentado = useRef(false);

  const entrar = async (c = codigo) => {
    const limpio = limpiarCodigo(c);
    if (limpio.length !== 6 || entrando) return;
    setEntrando(true); setError(null);
    const { data, error: e } = await unirse(limpio);
    setEntrando(false);
    if (e) { setError(mensajeDeError(e)); return; }
    setInicial(data);
  };

  /* Con el código en la dirección y sesión puesta, se entra sin tocar nada. */
  useEffect(() => {
    if (!intentado.current && conSesion && limpiarCodigo(codigoInicial).length === 6) {
      intentado.current = true;
      entrar(codigoInicial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conSesion, codigoInicial]);

  return (
    <div className="vivo" data-vivo="estudiante">
      <style>{CSS_VIVO}</style>
      <div className="vivo-marco" style={{ maxWidth: "560px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "44px" }}>
          <button type="button" className="vivo-boton vivo-boton--suave" onClick={onBack} style={{ minHeight: "44px", padding: "0 16px" }}>
            <ChevronLeft size={18} aria-hidden="true" /> Salir
          </button>
        </div>
        {inicial ? (
          <Jugar inicial={inicial} onBack={onBack} />
        ) : (
          <section className="vivo-entra" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <span className="vivo-cejilla">Clase en vivo</span>
            <h1 className="vivo-titulo" style={{ fontSize: "clamp(26px, 7vw, 34px)" }}>Entra a la clase de tu profesor</h1>
            {!conSesion ? (
              <div className="vivo-tarjeta" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <p className="vivo-nota">Para entrar necesitas tu cuenta: así tu profesor sabe que estuviste.</p>
                <div>
                  <button type="button" className="vivo-boton" onClick={() => auth?.pedirCuenta?.("Inicia sesión para entrar a la clase en vivo.")}>
                    <LogIn size={18} aria-hidden="true" /> Iniciar sesión
                  </button>
                </div>
              </div>
            ) : (
              <form className="vivo-tarjeta" style={{ display: "flex", flexDirection: "column", gap: "14px" }}
                onSubmit={(e) => { e.preventDefault(); entrar(); }}>
                <label htmlFor="vivo-codigo" className="vivo-nota">Escribe el código que está en el tablero</label>
                <input id="vivo-codigo" className="vivo-campo" inputMode="numeric" autoComplete="one-time-code" placeholder="000000"
                  value={codigo} onChange={(e) => setCodigo(limpiarCodigo(e.target.value))} maxLength={7} data-vivo-campo-codigo />
                {error && <p className="vivo-nota" role="alert" style={{ color: V.coral }}>{error}</p>}
                <button type="submit" className="vivo-boton" disabled={codigo.length !== 6 || entrando} data-vivo-entrar style={{ minHeight: "54px" }}>
                  {entrando ? "Entrando…" : "Entrar"}
                </button>
              </form>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function Jugar({ inicial, onBack }) {
  const { estado, refrescar, desfase } = useSala(inicial.sala_id, { inicial });
  const [elegida, setElegida] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [podio, setPodio] = useState(null);
  const fase = estado?.estado;
  const ahora = useReloj(fase === "pregunta", 200);
  const restante = restanteMs(estado, desfase.current, ahora);

  /* Una pregunta nueva borra la elección anterior; si ya había respondido (recargó), la recupera. */
  useEffect(() => { setElegida(estado?.mi_respuesta?.opcion ?? null); setAviso(null); }, [estado?.indice]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (fase !== "final" && fase !== "resultados") return;
    leerPodio(inicial.sala_id, 3).then(({ data }) => data && setPodio(data));
  }, [fase, estado?.indice, inicial.sala_id]);

  const elegir = async (opcion) => {
    if (elegida || fase !== "pregunta") return;
    setElegida(opcion);
    const { data, error } = await responder(inicial.sala_id, estado.indice, opcion);
    if (error) { setElegida(null); setAviso(mensajeDeError(error)); return; }
    if (!data?.aceptada) {
      /* Si no contó, no se muestra «enviada». Solo una repetida (ya había una antes) se queda marcada. */
      if (data?.motivo !== "repetida") setElegida(null);
      if (data?.motivo === "tiempo" || data?.motivo === "cerrada") setAviso("Se acabó el tiempo de esta pregunta.");
      refrescar();
    }
  };

  if (!estado) return <p className="vivo-nota">Cargando…</p>;

  if (fase === "espera") {
    return (
      <section style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px", paddingTop: "24px" }} data-vivo-fase="espera">
        <span className="vivo-pop" style={{ width: "72px", height: "72px", borderRadius: "999px", background: "rgba(42,157,143,0.18)", border: `2px solid ${V.teal}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Check size={34} color={V.teal} aria-hidden="true" />
        </span>
        <h2 className="vivo-titulo vivo-entra" style={{ fontSize: "28px" }}>¡Estás adentro!</h2>
        <p className="vivo-nota vivo-entra-2">{estado.titulo}. Espera a que tu profesor empiece y mira el tablero.</p>
        <p className="vivo-nota vivo-entra-3" style={{ color: V.dato }}>{estado.participantes} {estado.participantes === 1 ? "persona adentro" : "personas adentro"}</p>
      </section>
    );
  }

  if (fase === "pregunta") {
    const sinTiempo = restante <= 0 && !elegida;
    return (
      <section key={estado.indice} style={{ display: "flex", flexDirection: "column", gap: "16px" }} data-vivo-fase="pregunta">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "10px" }}>
          <span className="vivo-cejilla">Pregunta {estado.indice + 1} de {estado.total}</span>
          <span style={{ color: V.dato, fontSize: "13px", fontVariantNumeric: "tabular-nums" }}>{miles(estado.mis_puntos)} puntos</span>
        </div>
        <Reloj restante={restante} duracion={estado.duracion_s} />
        <div className="vivo-entra"><Enunciado pregunta={estado.pregunta} /></div>
        {elegida ? (
          <div className="vivo-tarjeta vivo-pop" style={{ display: "flex", alignItems: "center", gap: "14px" }} data-vivo-enviada>
            <LetraDe pregunta={estado.pregunta} id={elegida} />
            <div>
              <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "18px" }}>Respuesta enviada</p>
              <p className="vivo-nota">Mira el tablero: cuando se cierre la pregunta sabrás si acertaste.</p>
            </div>
          </div>
        ) : sinTiempo ? (
          <div className="vivo-tarjeta vivo-pop" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Clock size={24} color={V.ambar} aria-hidden="true" />
            <p className="vivo-nota" style={{ color: V.texto }}>Se acabó el tiempo de esta pregunta.</p>
          </div>
        ) : (
          <Opciones pregunta={estado.pregunta} alElegir={elegir} elegida={elegida} />
        )}
        {aviso && <p className="vivo-nota" role="alert" style={{ color: V.ambar }}>{aviso}</p>}
      </section>
    );
  }

  if (fase === "resultados") {
    const mia = estado.mi_respuesta;
    const acerto = mia?.correcta === true;
    return (
      <section key={`r${estado.indice}`} style={{ display: "flex", flexDirection: "column", gap: "16px" }} data-vivo-fase="resultados">
        <div className="vivo-tarjeta vivo-pop" style={{ display: "flex", alignItems: "center", gap: "14px",
          borderColor: !mia ? V.linea : acerto ? V.teal : "rgba(231,111,81,0.55)", background: !mia ? V.panel : acerto ? "rgba(42,157,143,0.14)" : "rgba(231,111,81,0.10)" }} data-vivo-veredicto={!mia ? "sin" : acerto ? "bien" : "mal"}>
          <span style={{ flex: "none", width: "48px", height: "48px", borderRadius: "999px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: !mia ? V.panel2 : acerto ? V.teal : V.coral }}>
            {!mia ? <Clock size={24} color={V.texto} aria-hidden="true" /> : acerto ? <Check size={26} color="#06202A" aria-hidden="true" /> : <Equis size={26} color="#0B1626" aria-hidden="true" />}
          </span>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "21px" }}>
              {!mia ? "No alcanzaste a responder" : acerto ? `¡Correcto! +${miles(mia.puntos)}` : "Esta vez no"}
            </p>
            <p className="vivo-nota">Llevas {miles(estado.mis_puntos)} puntos{podio?.mio ? ` · vas de ${podio.mio.puesto}.º` : ""}</p>
          </div>
        </div>
        <Opciones pregunta={estado.pregunta} elegida={mia?.opcion ?? null} correcta={estado.correcta} />
        <p className="vivo-nota" style={{ textAlign: "center", color: V.dato }}>Espera la siguiente pregunta…</p>
      </section>
    );
  }

  if (fase === "final") {
    return (
      <section style={{ display: "flex", flexDirection: "column", gap: "18px", alignItems: "center", textAlign: "center" }} data-vivo-fase="final">
        <h2 className="vivo-titulo vivo-entra" style={{ fontSize: "28px" }}>¡Terminamos!</h2>
        {podio?.mio && (
          <div className="vivo-tarjeta vivo-pop" style={{ width: "100%" }} data-vivo-mi-puesto>
            <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "40px", lineHeight: 1.1 }}>{podio.mio.puesto}.º</p>
            <p className="vivo-nota">{miles(podio.mio.puntos)} puntos · {podio.mio.aciertos} de {estado.total} aciertos</p>
          </div>
        )}
        <Podio lista={podio?.podio ?? []} />
      </section>
    );
  }

  return (
    <section className="vivo-tarjeta vivo-entra" style={{ display: "flex", flexDirection: "column", gap: "14px" }} data-vivo-fase="cerrada">
      <h2 className="vivo-titulo" style={{ fontSize: "24px" }}>La clase terminó</h2>
      <p className="vivo-nota">Gracias por participar. Tu asistencia quedó registrada.</p>
      <div><button type="button" className="vivo-boton" onClick={onBack}>Volver al inicio</button></div>
    </section>
  );
}

function LetraDe({ pregunta, id }) {
  const k = pregunta?.opciones?.findIndex((o) => o.id === id) ?? -1;
  if (k < 0) return null;
  return (
    <span className="vivo-letra" aria-hidden="true" style={{ background: COLORES[k % COLORES.length], width: "48px", height: "48px", fontSize: "22px" }}>{LETRAS[k]}</span>
  );
}
