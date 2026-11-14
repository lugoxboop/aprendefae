import { cuerpoMascota } from "../mascota/mascotas.js";

/*
 * La mascota, pintada. Hermana de Avatar.jsx: el mismo papel —la cara del
 * estudiante— pero con criatura en vez de figura.
 *
 * Se puede llamar de dos formas, como Avatar:
 *   <Mascota especie="perro" puestos={["gafas"]} />   suelta, para el selector
 *   <Mascota perfil={perfil} />                        desde la fila del perfil
 *
 * El dibujo sale de cuerpoMascota() (src/mascota/mascotas.js), la única fuente.
 * Sin especie no pinta nada: un perfil sin mascota todavía usa el Avatar, no un
 * hueco. El SVG es estático y de la casa, así que va por dangerouslySetInnerHTML
 * sin riesgo —no entra texto de nadie—.
 */
export default function Mascota({ especie, perfil, puestos, paleta, ojos, tamano = 96, titulo, style = null, ...resto }) {
  const esp = especie ?? perfil?.mascota_especie ?? null;
  if (!esp) return null;
  const pal = paleta ?? perfil?.mascota_paleta ?? null;
  const oj = ojos ?? perfil?.mascota_ojos ?? null;
  /* Los accesorios puestos: los explícitos, o —si se pintó desde el perfil— los
     que la fila trae en mascota_puestos. */
  const pst = Array.isArray(puestos) ? puestos : (Array.isArray(perfil?.mascota_puestos) ? perfil.mascota_puestos : []);

  const accesible = titulo
    ? { role: "img", "aria-label": titulo }
    : { "aria-hidden": "true" };

  return (
    <svg
      width={tamano}
      height={Math.round((tamano * 150) / 140)}
      viewBox="0 0 140 150"
      data-mascota={esp}
      data-paleta={pal || "natural"}
      data-ojos={oj || "natural"}
      style={{ display: "block", ...(style ?? {}) }}
      {...accesible}
      {...resto}
      dangerouslySetInnerHTML={{ __html: cuerpoMascota(esp, { puestos: pst, paleta: pal, ojos: oj }) }}
    />
  );
}
