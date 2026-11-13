import Mascota from "../Mascota.jsx";
import { mascotaDe } from "../../mascota/mascotas.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CARA DEL ESTUDIANTE, en las pantallas donde se le ve a él —ranking, ligas,
 * perfil, la cuenta—: su mascota.
 *
 * Antes, esos sitios pintaban la figura geométrica (Avatar por perfil). Ahora
 * pintan la mascota: la que el estudiante eligió, o —si todavía no ha elegido—
 * una de fábrica, estable, derivada de su identidad (mascotaDe). Nadie se queda
 * sin cara, y nadie ve la figura vieja en estas pantallas.
 *
 * La TIENDA de figuras no pasa por aquí: sigue usando Avatar con forma/paleta/
 * nivel, porque ahí el objeto a mostrar y comprar ES la figura.
 *
 * Es solo de pintar: no lee ni escribe la base. La mascota de fábrica se calcula
 * en el cliente y no toca la fila del estudiante.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export default function AvatarEstudiante({ perfil, tamano = 56, titulo = null, style = null, ...resto }) {
  const { especie, paleta, ojos } = mascotaDe(perfil);
  return (
    <Mascota
      especie={especie}
      paleta={paleta}
      ojos={ojos}
      tamano={tamano}
      titulo={titulo}
      style={style}
      {...resto}
    />
  );
}
