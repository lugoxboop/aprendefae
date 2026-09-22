import { useContext, useState } from "react";
import { FAE } from "../../theme.js";
import Avatar from "../avatar/Avatar.jsx";
import IconoCristal from "../shared/IconoCristal.jsx";
import { NavigationContext } from "../../navigation.js";
import { useAuthOpcional } from "../../auth/AuthProvider.jsx";
import {
  FORMAS, NIVELES, NIVEL_COMPARACION, NOMBRE_FORMA, NOMBRE_NIVEL, NOMBRE_PALETA,
  PALETAS, PALETA_COMPARACION, PALETTES, ETIQUETA_NIVEL, combinacionDe, leyenda,
} from "../../avatar/generador.js";
import { estaDesbloqueado, guardarAvatar, precioDe } from "../../cristales/cristales.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL SELECTOR DE AVATAR — la sección que «Editar perfil» tenía reservada.
 *
 * ═══════════ LA VISTA PREVIA NO SE MUEVE ═══════════
 *
 * Mismo sitio y mismo tamaño en las tres pestañas. Si cambiara de tamaño al
 * pasar de «Forma» a «Nivel», comparar dos opciones obligaría a recordar cómo
 * era la anterior: se compara lo que está quieto.
 *
 * ═══════════ CADA TOQUE GUARDA, Y NO HAY BOTÓN DE GUARDAR ═══════════
 *
 * La confirmación es la vista previa cambiando. Un «guardado ✓» sobre un cambio
 * que ya se ve es ruido, y un botón de guardar obligaría a un estado
 * intermedio inválido —la pantalla enseñando una cosa y la base otra— que es
 * exactamente lo que aquí no puede pasar: el avatar sale en el ranking.
 *
 * El toque pinta primero y guarda después; si la base dice que no, se vuelve a
 * lo que había y se dice en palabras. Nunca se queda enseñando algo que no se
 * guardó.
 *
 * ═══════════ EL ANILLO ES TEAL EN LAS TRES PESTAÑAS ═══════════
 *
 * Nunca coral: coral es error en todo el sitio, y elegir una forma no es un
 * error. Y nunca un check ni un cambio de tamaño: el anillo no mueve la
 * rejilla, y por tanto no desplaza lo que el ojo estaba comparando.
 *
 * ═══════════ UN NIVEL BLOQUEADO SE VE, ATENUADO ═══════════
 *
 * Con su precio. Tocarlo lleva a la Tienda, que es donde se compra: el selector
 * no cobra nada. Saber qué falta es la mitad de para qué sirve enseñarlo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const PESTANAS = [
  { id: "forma", titulo: "Forma" },
  { id: "paleta", titulo: "Paleta" },
  { id: "nivel", titulo: "Nivel" },
];

/* El anillo de la selección activa. 2,5 px de teal, sin check y sin crecer. */
const ANILLO_ACTIVO = `2.5px solid ${FAE.teal}`;
const ANILLO_QUIETO = "2.5px solid rgba(248,249,250,0.14)";

const CSS = `
.fae-avatar-sel { display: grid; gap: 18px; grid-template-columns: 1fr; align-items: start; }
.fae-avatar-sel__rejilla { display: grid; grid-template-columns: repeat(auto-fit, minmax(84px, 1fr)); gap: 10px; }
@media (min-width: 640px) {
  .fae-avatar-sel { grid-template-columns: 220px 1fr; gap: 22px; }
}
`;

function Pastilla({ activa, children, ...resto }) {
  return (
    <button
      type="button"
      {...resto}
      style={{
        fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600,
        padding: "8px 16px", borderRadius: "999px", cursor: "pointer",
        border: activa ? `1px solid ${FAE.teal}` : "1px solid rgba(248,249,250,0.18)",
        background: activa ? "rgba(42,157,143,0.16)" : "transparent",
        color: activa ? FAE.teal : "rgba(248,249,250,0.66)",
      }}
    >
      {children}
    </button>
  );
}

/* Una celda de la rejilla: el anillo va en el envoltorio, no en el dibujo. */
function Celda({ activa, etiqueta, atenuada = false, children, ...resto }) {
  return (
    <button
      type="button"
      {...resto}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
        padding: "10px 6px", borderRadius: "14px", cursor: "pointer",
        border: activa ? ANILLO_ACTIVO : ANILLO_QUIETO,
        background: activa ? "rgba(42,157,143,0.10)" : "rgba(29,53,87,0.45)",
        color: FAE.text, font: "inherit", opacity: atenuada ? 0.55 : 1,
      }}
    >
      {children}
      <span style={{ fontSize: "11.5px", lineHeight: 1.25, textAlign: "center", color: "rgba(248,249,250,0.72)" }}>
        {etiqueta}
      </span>
    </button>
  );
}

export default function SeccionAvatar({ perfil: perfilProp = null, onGuardar = guardarAvatar }) {
  /* Opcional: el panel de «Editar perfil» se monta suelto en sus pruebas. */
  const auth = useAuthOpcional();
  const nav = useContext(NavigationContext);
  const perfil = perfilProp ?? auth?.perfil ?? null;

  /*
   * La combinación que se enseña. Sale del perfil y se adelanta al toque: la
   * vista previa no espera a la red. El perfil de verdad lo actualiza
   * aplicarPerfil() con la fila que devuelve la base.
   */
  const [combo, setCombo] = useState(() => combinacionDe(perfil));
  const [pestana, setPestana] = useState("forma");
  const [error, setError] = useState(null);

  const elegir = async (cambio) => {
    const antes = combo;
    const ahora = { ...combo, ...cambio };
    setCombo(ahora);
    setError(null);
    const { perfil: fila, error: err } = await onGuardar({
      forma: cambio.forma ?? null,
      paleta: cambio.paleta ?? null,
      nivel: cambio.nivel ?? null,
    });
    if (err) {
      setCombo(antes);
      setError(err);
      return;
    }
    if (fila) auth?.aplicarPerfil?.(fila);
  };

  const irATienda = () => nav?.irATienda?.();

  return (
    <div data-selector-avatar>
      <style>{CSS}</style>
      <div className="fae-avatar-sel">
        {/* ── la vista previa, fija ── */}
        {/*
          ═══════════ LA LUZ DE LA TARJETA NO ES EL HALO DEL NIVEL IV ═══════════

          Esto es un tratamiento de FONDO DE LA TARJETA: una luz radial suave
          detrás de donde se para el avatar, para que la figura tenga sobre qué
          recortarse mientras se elige. Se ve en CUALQUIER nivel, incluido el I.

          El halo del Nivel IV es otra cosa: son dos anillos dibujados DENTRO
          del SVG, con el color de la paleta, y son la recompensa de ese nivel
          —salen en el ranking, en la liga y en todas partes—. Esta luz no sale
          del selector y no premia nada. Si se fundieran, el Nivel IV dejaría de
          tener algo propio que enseñar.
        */}
        <div
          data-vista-previa
          style={{
            borderRadius: "16px",
            background: [
              "radial-gradient(circle at 50% 40%, rgba(248,249,250,0.10) 0%, rgba(248,249,250,0.04) 38%, rgba(248,249,250,0) 68%)",
              "rgba(29,53,87,0.55)",
            ].join(", "),
            border: "1px solid rgba(248,249,250,0.12)", padding: "16px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
          }}
        >
          <div style={{ width: "176px", height: "176px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Avatar {...combo} tamano={176} titulo={`Tu avatar: ${leyenda(combo)}`} />
          </div>
          <p data-leyenda style={{ fontSize: "13px", color: "rgba(248,249,250,0.72)", margin: 0, textAlign: "center" }}>
            {leyenda(combo)}
          </p>
        </div>

        {/* ── las tres pestañas ── */}
        <div>
          <div role="tablist" aria-label="Qué del avatar se cambia" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
            {PESTANAS.map((p) => (
              <Pastilla
                key={p.id}
                role="tab"
                data-pestana={p.id}
                aria-selected={pestana === p.id}
                activa={pestana === p.id}
                onClick={() => setPestana(p.id)}
              >
                {p.titulo}
              </Pastilla>
            ))}
          </div>

          {pestana === "forma" && (
            <div className="fae-avatar-sel__rejilla" data-opciones="forma">
              {FORMAS.map((f) => (
                <Celda
                  key={f}
                  data-opcion={f}
                  aria-pressed={combo.forma === f}
                  activa={combo.forma === f}
                  etiqueta={NOMBRE_FORMA[f]}
                  onClick={() => elegir({ forma: f })}
                >
                  {/*
                    Las cinco en gris y en nivel II: aquí se compara la
                    geometría, y con la paleta puesta se elegiría por color.
                  */}
                  <Avatar forma={f} paleta={PALETA_COMPARACION} nivel={NIVEL_COMPARACION} tamano={56} />
                </Celda>
              ))}
            </div>
          )}

          {pestana === "paleta" && (
            <div className="fae-avatar-sel__rejilla" data-opciones="paleta">
              {PALETAS.map((p) => (
                <Celda
                  key={p}
                  data-opcion={p}
                  aria-pressed={combo.paleta === p}
                  activa={combo.paleta === p}
                  etiqueta={NOMBRE_PALETA[p]}
                  onClick={() => elegir({ paleta: p })}
                >
                  {/* Solo el degradado: sin geometría, para que se compare el color. */}
                  <span
                    aria-hidden="true"
                    data-muestra={p}
                    style={{
                      width: "50px", height: "50px", borderRadius: "999px", display: "block",
                      background: `linear-gradient(135deg, ${PALETTES[p].c1} 0%, ${PALETTES[p].c2} 100%)`,
                    }}
                  />
                </Celda>
              ))}
            </div>
          )}

          {pestana === "nivel" && (
            <>
              <div className="fae-avatar-sel__rejilla" data-opciones="nivel">
                {NIVELES.map((n) => {
                  const libre = n === 1 || estaDesbloqueado(perfil, n);
                  return (
                    <Celda
                      key={n}
                      data-opcion={n}
                      data-bloqueado={libre ? undefined : "si"}
                      aria-pressed={combo.nivel === n}
                      activa={combo.nivel === n}
                      atenuada={!libre}
                      etiqueta={`${ETIQUETA_NIVEL(n)} · ${NOMBRE_NIVEL[n]}`}
                      onClick={() => (libre ? elegir({ nivel: n }) : irATienda())}
                    >
                      <Avatar forma={combo.forma} paleta={combo.paleta} nivel={n} tamano={56} />
                      {!libre && (
                        <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11.5px", color: "rgba(248,249,250,0.6)" }}>
                          <IconoCristal tamano={11} apagado />
                          <span style={{ fontVariantNumeric: "tabular-nums" }}>{precioDe(n)}</span>
                        </span>
                      )}
                    </Celda>
                  );
                })}
              </div>
              <button
                type="button"
                data-ir-tienda
                onClick={irATienda}
                style={{
                  marginTop: "12px", background: "transparent", border: "none", padding: 0,
                  cursor: "pointer", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, color: FAE.teal,
                }}
              >
                Desbloquear más niveles →
              </button>
            </>
          )}

          {error && (
            <p role="alert" style={{ fontSize: "13px", lineHeight: 1.5, color: FAE.ambar, margin: "14px 0 0" }}>
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
