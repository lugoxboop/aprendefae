/*
 * GESTIÓN DE PROYECTOS · EL ELENCO (orquestador/conocimiento/gestion-proyectos/
 * elenco.md). Las mismas marionetas de la plataforma (<Mascota>), con su
 * accesorio; el rol va SIEMPRE escrito debajo. Nombre = posición objetiva.
 * Nunca menos de 120 px de alto; 180 px o más cuando protagoniza.
 */
import Mascota from "../../components/Mascota.jsx";

export const ELENCO = {
  tu: { especie: "zorro", puestos: ["corbata"], rol: "Tú · Director(a)" },
  patrocinadora: { especie: "panda", puestos: ["traje"], rol: "Patrocinadora" },
  gerente: { especie: "gato", puestos: ["gafas"], rol: "Gerente funcional" },
  equipo: { especie: "hamster", puestos: ["casco"], rol: "Equipo del proyecto" },
  pmo: { especie: "perro", puestos: ["corbatin"], rol: "PMO" },
  practicante: { especie: "huron", puestos: ["gorra"], rol: "Practicante" },
  cliente: { especie: "conejo", puestos: [], rol: "Cliente" },
};

export const ALTO_MINIMO = 120;

/** Un personaje del elenco a `alto` px (la figura), con su rol debajo. */
export function Personaje({ quien, alto = 140, animo = "quieta", rotulo = true, className = "", style = null }) {
  const p = ELENCO[quien];
  if (!p) return null;
  const h = Math.max(ALTO_MINIMO, alto);
  /* <Mascota> mide tamano × 150/140 de alto. */
  const tamano = Math.round((h * 140) / 150);
  return (
    <figure className={`gp-personaje ${className}`} data-personaje={quien} data-alto={h} style={{ margin: 0, ...style }}>
      <Mascota especie={p.especie} puestos={p.puestos} tamano={tamano} animo={animo} encuadre="cuerpo" titulo={p.rol} />
      {rotulo && <figcaption className="gp-rol">{p.rol}</figcaption>}
    </figure>
  );
}
