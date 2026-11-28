/*
 * GESTIÓN DE PROYECTOS · MOTOR «DECIDIR»: un ítem que se lleva a un destino.
 *
 * Es la mecánica de casi todas las Hacer de los caps. 1 y 2: clasificar en la
 * cinta (H01), apostar termina / sigue (H02), sellar (H03), poner el tablón
 * en el puente (H04), clavar en el corcho (H05), tirar de una palanca (H07),
 * abrir el cajón (H08), conectar la clavija (H09), bajar por la cafetera
 * (H10), pesar en la balanza (H12), guardar en el archivador (H15), dar la
 * insignia (H18) y las preguntas de cada micro. Lo que cambia es la ESCENA,
 * que da cada pieza (fondo, objeto protagonista, objetos de los destinos,
 * animación de acierto y lo que se dibuja encima con `encima(estado)`).
 *
 * Reglas (diseño §0): arrastrar, o tocar la tarjeta y luego el destino, o
 * teclado (la tarjeta y los destinos son botones). Error: rebote, borde coral,
 * retro y segundo intento sin puntaje; si el segundo también yerra, el ítem va
 * solo a su destino con la retro a la vista. Acierto: encaja y el destino
 * reacciona con la animación de la pieza. Coral solo para el error.
 *
 * Lote 6 (c11 H08, predecir y revelar): con `paso.apuesta` cualquier destino
 * vale, no hay coral ni puntos (0 ítems, preparar.js); la nota de la apuesta
 * (`retros[destino]` si no es la `clave`) se lee junto al revelado, y el
 * destino elegido pasa a los pasos que siguen.
 */
import { useEffect, useRef, useState } from "react";
import { Boton, Retro } from "../../../macro2026/comun/ui.jsx";
import { useArrastre } from "../../../macro2026/comun/arrastre.js";
import { retroDe } from "../preparar.js";
import { Personaje } from "../elenco.jsx";
import { Objeto } from "../objetos.jsx";

const ESPERA_BIEN = 900;
const ESPERA_MAL = 2600;

function Destino({ d, cfg, props, estado, recibe, marca, disabled, apuesta = false }) {
  const Icono = cfg?.icono ?? null;
  return (
    <button
      type="button"
      className="gp-destino"
      data-destino-id={d.id}
      data-estado={estado ?? undefined}
      data-recibe={recibe ? "1" : undefined}
      data-forma={cfg?.forma ?? undefined}
      disabled={disabled}
      {...props}
    >
      {cfg?.forma === "clavija" && <span className="gp-foco" aria-hidden="true" />}
      {cfg?.objeto && <Objeto id={cfg.objeto} alto={cfg.alto ?? 44} />}
      <span className="gp-destino-nombre">{Icono && <Icono className="gp-icono" size={18} strokeWidth={2.4} aria-hidden="true" />}<span className="gp-destino-txt">{d.nombre}</span></span>
      {d.pista && !marca && <small>{d.pista}</small>}
      {marca && <span className="gp-marca" data-apuesta={apuesta ? "1" : undefined}>{marca}</span>}
    </button>
  );
}

export default function Decidir({ paso, escena = {}, estadoEtapa = null, alTerminar }) {
  const [intento, setIntento] = useState(1);
  const [encaja, setEncaja] = useState(null);
  const [retro, setRetro] = useState(null);
  const [mal, setMal] = useState(null);
  const [golpes, setGolpes] = useState(0);
  const [listo, setListo] = useState(null);
  const [ultimo, setUltimo] = useState(null);
  const [nota, setNota] = useState(null);
  const detalle = useRef([]);
  const reloj = useRef(null);
  useEffect(() => () => clearTimeout(reloj.current), []);

  const pausa = Boolean(paso.revela || paso.despues || paso.apuesta);
  const terminar = (ok) => {
    const res = { detalle: detalle.current, puntos: ok ? 1 : 0, destino: paso.clave };
    if (pausa) { setListo(res); return; }
    reloj.current = setTimeout(() => alTerminar(res), ok ? ESPERA_BIEN : ESPERA_MAL);
  };

  const soltar = (id, destino) => {
    if (encaja || id !== paso.id) return;
    setUltimo(destino);
    if (paso.apuesta) {
      setEncaja(destino);
      setNota(destino === paso.clave ? null : retroDe(paso, destino));
      setListo({ detalle: [], puntos: 0, destino });
      return;
    }
    if (destino === paso.clave) {
      if (intento === 1) detalle.current = [{ item: paso.id, ok: true, subtemas: paso.subtemas }];
      setRetro(null);
      setEncaja(destino);
      terminar(intento === 1);
      return;
    }
    setRetro(retroDe(paso, destino));
    setMal(destino);
    setGolpes((g) => g + 1);
    setTimeout(() => setMal(null), 320);
    if (intento === 1) {
      detalle.current = [{ item: paso.id, ok: false, subtemas: paso.subtemas, respuesta: destino }];
      setIntento(2);
    } else {
      setEncaja(paso.clave);
      terminar(false);
    }
  };

  const { contenedor, pieza, destino } = useArrastre({ alSoltar: soltar, activo: !encaja });
  const destinos = paso.destinos ?? [];
  const cfgDe = (id) => escena.destinos?.[id] ?? escena.destinos?.["*"] ?? null;
  const conTarjeta = Boolean(paso.texto);
  const estado = { paso, encaja, intento, mal, ultimo, revelado: Boolean(encaja), etapa: estadoEtapa };
  const obj = paso.objeto ? { id: paso.objeto } : escena.objetoDe?.(paso) ?? escena.objeto ?? null;
  /* Lote 2: un paso puede traer su propio personaje (`paso.mesa`), p. ej. el practicante en un micro. */
  const quien = escena.mesa === false ? null : paso.mesa ?? escena.mesa ?? "tu";
  const nombreDe = (id) => destinos.find((d) => d.id === id)?.nombre ?? id;
  const disposicion = escena.disposicion ?? (destinos.length === 3 ? "fila3" : destinos.length > 3 && destinos.length <= 4 ? "rejilla" : destinos.length === 5 ? "palancas" : "rejilla");

  return (
    <div ref={contenedor} data-paso-id={paso.id} data-motor="decidir">
      <div className="gp-visual" data-visual={escena.nombre ?? "escena"} data-anim={escena.anim ?? "cae"}
        style={{ "--gp-a": escena.fondo?.[0], "--gp-b": escena.fondo?.[1], "--gp-acento": escena.acento, "--gp-luz": escena.luz }}>
        {escena.antes?.(estado)}
        <div className="gp-mesa">
          {quien && <Personaje quien={quien} alto={124} animo={encaja && intento === 1 ? "feliz" : "quieta"} />}
          <div className="gp-centro">
            {paso.contexto && <p className="gp-contexto" data-contexto-paso>{paso.contexto}</p>}
            {conTarjeta && (
              <button
                type="button"
                key={`${paso.id}-${golpes}`}
                className={`gp-tarjeta da26-entra${retro && !encaja ? " da26-tiembla" : ""}`}
                data-tarjeta={paso.id}
                data-estado={mal ? "mal" : undefined}
                data-sale={encaja && escena.sale !== false ? "1" : undefined}
                aria-label={`${paso.texto}. Toca la tarjeta y luego un destino, o arrástrala.`}
                {...pieza(paso.id)}
              >
                {paso.letra && <span className="gp-tarjeta-letra" aria-hidden="true">{paso.letra}</span>}
                {paso.texto}
                {escena.sello && encaja && <span className="gp-sello-marca" aria-hidden="true">{nombreDe(encaja)}</span>}
              </button>
            )}
            {obj?.id && (
              <div className="gp-protagonista" data-lugar={obj.lugar ?? "bajo"} style={escena.objetoEstilo?.(estado) ?? undefined}>
                <Objeto id={obj.id} alto={obj.alto ?? 84} />
              </div>
            )}
          </div>
        </div>
        {escena.encima?.(estado)}
        <div className="gp-destinos" data-disposicion={disposicion} role="group" aria-label="Destinos">
          {destinos.map((d) => (
            <Destino
              key={d.id}
              d={d}
              cfg={cfgDe(d.id)}
              props={destino(d.id, conTarjeta ? null : paso.id)}
              estado={mal === d.id ? "mal" : encaja === d.id ? "bien" : null}
              recibe={encaja === d.id}
              marca={encaja === d.id ? (paso.apuesta ? "Tu apuesta" : d.acierto ?? "Aquí va") : null}
              apuesta={Boolean(paso.apuesta)}
              disabled={Boolean(encaja) && encaja !== d.id}
            />
          ))}
        </div>
        {escena.despues?.(estado)}
      </div>
      <Retro estado="mal" key={`r${golpes}`}>{retro}</Retro>
      {listo && (
        <>
          {paso.despues && <p className="da26-retro da26-entra" data-estado="bien" data-despues>{paso.despues}</p>}
          {nota && <p className="da26-retro da26-entra" data-nota-apuesta>{nota}</p>}
          <div className="gp-pie"><Boton primario onClick={() => alTerminar(listo)} data-seguir>Seguir</Boton></div>
        </>
      )}
    </div>
  );
}
