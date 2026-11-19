import { SUBJECTS } from "../../data/subjects.js";

/*
 * El nombre de una pieza de Aprender, para la ruta y para la cabecera de la
 * secuencia. Sale del catálogo (subjects.js), que es el nombre que Mateo ya
 * aprobó; si la pieza trae su propio título, ese manda. Las piezas que no
 * están en el catálogo como actividad (porque viven dentro de otra) llevan
 * aquí su nombre, tomado de su propio código.
 */
const PROPIOS = {
  "cu0-a1b-ocho-leen-lo-mismo": "Ocho leen lo mismo",
  "t3-a2-el-mes-de-san-calixto": "El mes de San Calixto",
  "t3-a6-lo-que-deja-el-periodo": "Lo que deja el periodo",
};

let catalogo = null;
function nombres() {
  if (catalogo) return catalogo;
  catalogo = new Map();
  for (const materia of Object.values(SUBJECTS)) {
    for (const tema of materia.topics ?? []) {
      for (const a of tema.actividades ?? []) if (a?.id && a?.nombre) catalogo.set(a.id, a.nombre);
    }
  }
  return catalogo;
}

export function tituloDePieza(pieza) {
  if (!pieza) return null;
  return pieza.titulo ?? PROPIOS[pieza.id] ?? nombres().get(pieza.id) ?? null;
}

/* La ruta de una secuencia: [{ id, titulo }] con el nombre de cada pieza. */
export function rutaDe(piezas) {
  return (piezas ?? []).map((p, i) => ({ id: p.id, titulo: tituloDePieza(p) ?? `Pieza ${i + 1}` }));
}
