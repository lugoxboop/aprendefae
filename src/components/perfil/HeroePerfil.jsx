import { useEffect, useRef, useState } from "react";
import { ArrowRight, Flame, Award, Pencil } from "lucide-react";
import AvatarEstudiante from "../avatar/AvatarEstudiante.jsx";
import Medalla from "../shared/Medalla.jsx";
import { ESPECIES, razasDe, mascotaDe } from "../../mascota/mascotas.js";
import { AVISO_AVATAR } from "./avisoAvatar.js";
import { FilaMuestras, useColorMascota } from "./SeccionMascota.jsx";
import { mejoresGanadas } from "./Medallas.jsx";
import { FAE } from "../../theme.js";

/*
 * La cabecera de «Tu perfil» (rediseño del 20-nov). Antes: una bolita con la
 * mascota en busto, el apodo y tres líneas de texto gris; la mascota de cuerpo
 * entero vivía más abajo, en otra tarjeta, repetida. Ahora es un escenario:
 *
 *   · la mascota de cuerpo entero sobre su pedestal de luz, con sus
 *     accesorios. Se mueve según el día: con racha encendida (3+) lleva su
 *     fuego; si no, respira tranquila. Al pasar por encima salta, y al
 *     cambiarle el color celebra. Tocarla abre Editar perfil (el atajo de
 *     siempre: lo que se toca para cambiar algo es la cosa misma);
 *   · el apodo en grande, pastillas de racha y medallas, el color del pelaje
 *     a un toque (sin abrir nada) y el botón de editar;
 *   · la vitrina: las mejores medallas ganadas, en la repisa de abajo.
 */
export default function HeroePerfil({ perfil, racha = 0, medallas, aviso, onDescartarAviso, onEditar }) {
  const { paleta, elegir, error } = useColorMascota(perfil);
  const [encima, setEncima] = useState(false);
  const [festejo, setFestejo] = useState(false);
  const reloj = useRef(null);
  useEffect(() => () => clearTimeout(reloj.current), []);

  const tieneMascota = Boolean(perfil?.mascota_especie);
  const { especie } = mascotaDe(perfil);
  const nombreEspecie = ESPECIES.find((e) => e.id === especie)?.nombre ?? "";
  const nombreMascota = perfil?.mascota_nombre || null;

  const animo = festejo ? "celebra" : encima ? "feliz" : racha >= 3 ? "racha" : "tranquila";

  const cambiarColor = async (id) => {
    const ok = await elegir(id);
    if (ok) {
      setFestejo(true);
      clearTimeout(reloj.current);
      reloj.current = setTimeout(() => setFestejo(false), 1800);
    }
  };

  const ganadas = medallas?.cargando ? null : (medallas?.medallas ?? []).filter((m) => m.obtenida);
  const vitrina = ganadas ? mejoresGanadas(medallas.medallas, 4) : [];

  return (
    <section className="fae-pf-tarjeta fae-pf-heroe" data-heroe-perfil aria-label="Tu perfil">
      <span className="fae-pf-luz" aria-hidden="true" />
      <span className="fae-pf-rayos" aria-hidden="true" />

      <div className="fae-pf-heroe-grid">
        <div className="fae-pf-escenario">
          <button
            type="button"
            data-abrir-avatar
            className="fae-pf-mascota"
            onClick={onEditar}
            onMouseEnter={() => setEncima(true)}
            onMouseLeave={() => setEncima(false)}
            aria-label="Editar tu perfil"
          >
            <span className="fae-pf-pedestal" aria-hidden="true" />
            <AvatarEstudiante perfil={{ ...perfil, mascota_paleta: paleta }} tamano={168} animo={animo} encuadre="cuerpo" />
            <span className="fae-pf-lapiz" aria-hidden="true"><Pencil size={15} strokeWidth={2.4} /></span>
          </button>
          {tieneMascota && (
            <span className="fae-pf-nombre-mascota" data-nombre-mascota>
              {nombreMascota ? `${nombreMascota} · ${nombreEspecie}` : nombreEspecie}
            </span>
          )}
        </div>

        <div className="fae-pf-datos fae-pf-entra">
          <div>
            <p className="fae-pf-ceja">Tu perfil</p>
            <h2 data-apodo className="fae-pf-apodo" style={(perfil?.nickname ?? "").length > 12 ? { fontSize: "clamp(22px, 5.4vw, 32px)" } : undefined}>{perfil?.nickname ?? "Tu cuenta"}</h2>
          </div>

          <div className="fae-pf-pastillas">
            <span className={`fae-pf-pastilla${racha > 0 ? " fae-pf-pastilla--fuego" : ""}`} data-pastilla-racha>
              <Flame size={14} strokeWidth={2.4} aria-hidden="true" />
              {racha > 0 ? `${racha} ${racha === 1 ? "día" : "días"} de racha` : "Sin racha hoy"}
            </span>
            {ganadas && (
              <span className="fae-pf-pastilla" data-pastilla-medallas>
                <Award size={14} strokeWidth={2.4} aria-hidden="true" color={FAE.teal} />
                {ganadas.length} {ganadas.length === 1 ? "medalla" : "medallas"}
              </span>
            )}
          </div>

          <p data-nombre-real className="fae-pf-real">
            En los rankings te ven como <b style={{ color: "#F8F9FA", fontWeight: 600 }}>{perfil?.nickname ?? "tu apodo"}</b>.
            {" "}Tu nombre real, {perfil?.full_name || "sin escribir"}, solo lo ve tu profesor.
          </p>

          {aviso && (
            <p data-aviso-avatar className="fae-pf-aviso">
              {AVISO_AVATAR}
              <button
                type="button"
                data-descartar-aviso
                onClick={onDescartarAviso}
                style={{ background: "transparent", border: "none", padding: "4px 2px", cursor: "pointer", fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 700, color: "#86E0C3" }}
              >
                Entendido
              </button>
            </p>
          )}

          {/* El color, a un toque: pinta ya y la mascota celebra. */}
          {tieneMascota && (
            <div className="fae-pf-colores" data-colores-heroe>
              <p className="fae-pf-sub">Color de {nombreMascota || "tu mascota"}</p>
              <FilaMuestras etiqueta={`Color de ${nombreMascota || "tu mascota"}`} conEtiqueta={false} items={razasDe(especie, paleta)} valor={paleta} onElegir={cambiarColor} attr="data-color" />
              {error && <p role="alert" style={{ fontSize: "13px", color: FAE.ambar, margin: 0 }}>{error}</p>}
            </div>
          )}

          <div className="fae-pf-botones">
            <button type="button" data-editar-perfil-boton className="fae-pf-primario" onClick={onEditar}>
              Editar perfil
              <ArrowRight size={17} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {ganadas && (
        <div className="fae-pf-vitrina" data-vitrina>
          <p className="fae-pf-ceja" style={{ textAlign: "center", fontSize: "10.5px" }}>
            {vitrina.length ? "Tus mejores medallas" : "Tu vitrina"}
          </p>
          {vitrina.length ? (
            <div className="fae-pf-vitrina-fila">
              {vitrina.map((m) => (
                <div key={m.id} className="fae-pf-vitrina-item">
                  <span style={{ position: "relative", lineHeight: 0 }}>
                    <Medalla nivel={m.nivel} icono={m.icono} numero={m.numero} obtenida tamano={48} />
                    <span className="fae-pf-brillo" aria-hidden="true" />
                  </span>
                  <p>{m.titulo}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="fae-pf-vacio">Aquí se lucen tus medallas. La primera llega al completar tu primera actividad.</p>
          )}
        </div>
      )}
    </section>
  );
}
