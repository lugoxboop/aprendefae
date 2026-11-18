import { cuerpoMascota, esIlustrada, dibujoIlustrado, tinteDe } from "../mascota/mascotas.js";
import { svgMarioneta, tieneMarioneta, ANIMOS } from "../mascota/marionetas.js";
import { asegurarEstiloMarioneta } from "../mascota/marioneta-estilo.js";

/*
 * La mascota, pintada. Hermana de Avatar.jsx: el mismo papel —la cara del
 * estudiante— pero con criatura en vez de figura.
 *
 * Se puede llamar de dos formas, como Avatar:
 *   <Mascota especie="perro" puestos={["gafas"]} />   suelta, para el selector
 *   <Mascota perfil={perfil} />                        desde la fila del perfil
 *
 * Las seis especies ya son MARIONETAS (src/mascota/marionetas.js): piezas
 * ilustradas que se mueven por ánimo. `animo` elige el movimiento
 * —tranquila, feliz, celebra, triste, racha— y por defecto es «quieta»: la pose
 * neutra sin movimiento, para listas donde muchas mascotas a la vez cansan.
 * Si una especie no tuviera marioneta, cae al dibujo de cuerpoMascota().
 * Sin especie no pinta nada: un perfil sin mascota todavía usa el Avatar, no un
 * hueco. El SVG es estático y de la casa, así que va por dangerouslySetInnerHTML
 * sin riesgo —no entra texto de nadie—.
 */
export default function Mascota({ especie, perfil, puestos, paleta, ojos, tamano = 96, titulo, animo = "quieta", style = null, ...resto }) {
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

  /*
   * MARIONETA: el mismo recuadro que siempre (ancho × alto 150/140), así nada
   * de la página se mueve; la figura se ajusta dentro. overflow visible para
   * que el salto y las llamas no se corten (el busto sí se recorta).
   * Hasta 64 px se encuadra el busto (cabeza y hombros): de cuerpo entero, la
   * cara quedaría diminuta en una fila del ranking.
   * Los accesorios y el color de ojos aún no se pintan sobre las marionetas.
   */
  if (tieneMarioneta(esp)) {
    asegurarEstiloMarioneta();
    /* El id del filtro sale de especie + paleta: dos mascotas iguales comparten
       un filtro idéntico, y el HTML no cambia entre un pintado y otro. */
    const busto = tamano <= 64;
    const { viewBox, inner } = svgMarioneta(esp, { tinte: tinteDe(pal), uid: `${esp}-${pal || "natural"}`, busto });
    const mov = ANIMOS.includes(animo) ? animo : "quieta";
    return (
      <svg
        width={tamano}
        height={Math.round((tamano * 150) / 140)}
        viewBox={viewBox}
        className={`mta mta-sp-${esp} mta-${mov}`}
        data-mascota={esp}
        data-paleta={pal || "natural"}
        data-animo={mov}
        style={{ display: "block", overflow: busto ? "hidden" : "visible", ...(style ?? {}) }}
        {...accesible}
        {...resto}
        dangerouslySetInnerHTML={{ __html: inner }}
      />
    );
  }

  /*
   * Especie ILUSTRADA: su dibujo sale del asset recoloreado, con su propio
   * viewBox y proporción. Los accesorios no se pintan sobre la ilustración
   * todavía (están dibujados para la geometría vieja); se reactivarán luego.
   */
  if (esIlustrada(esp)) {
    const { viewBox, inner } = dibujoIlustrado(esp, pal);
    const [, , vbW, vbH] = viewBox.split(/\s+/).map(Number);
    return (
      <svg
        width={tamano}
        height={Math.round((tamano * (vbH || 1)) / (vbW || 1))}
        viewBox={viewBox}
        data-mascota={esp}
        data-paleta={pal || "natural"}
        style={{ display: "block", ...(style ?? {}) }}
        {...accesible}
        {...resto}
        dangerouslySetInnerHTML={{ __html: inner }}
      />
    );
  }

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
