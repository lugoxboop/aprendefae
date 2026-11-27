/*
 * Los datos del simulador «Arma tu acta» (Gestión de Proyectos, Jane, 27-nov-2026).
 * Los 12 componentes del acta de constitución, tal como los lista la Guía del
 * PMBOK® 6.ª ed. (4.1.3.1, p. 81). Los ids son los mismos del servidor
 * (supabase/functions/simulador/escenarios/gestion-proyectos.js).
 */
export const CAMPOS = [
  { id: "proposito", t: "Propósito del proyecto", a: "Por qué existe: el problema o la oportunidad.", q: "¿Para qué existe tu proyecto? Cuéntame el problema o la oportunidad que atiende y para quién.", pista: "Los domingos la fila daba la vuelta a la cuadra y la gente se iba sin pan.", ok: "dice por qué existe el proyecto (problema u oportunidad) y a quién beneficia" },
  { id: "objetivos", t: "Objetivos medibles y criterios de éxito", a: "Con número y plazo: cómo sabrás que funcionó.", q: "¿Cómo vas a saber que funcionó? Dame al menos un objetivo con número y fecha.", pista: "Vender 300 panes diarios en la sede nueva antes de seis meses.", ok: "al menos un objetivo con una cifra y un plazo", num: true },
  { id: "requisitos", t: "Requisitos de alto nivel", a: "Lo que tiene que cumplir sí o sí.", q: "¿Qué tiene que cumplir tu proyecto sí o sí? Nombra dos o tres condiciones.", pista: "Permiso sanitario aprobado y horno a gas instalado.", ok: "al menos dos condiciones obligatorias" },
  { id: "descripcion", t: "Descripción, límites y entregables clave", a: "Qué entregas y qué queda por fuera.", q: "¿Qué vas a entregar al final, y qué queda por fuera del proyecto?", pista: "Entrego el local adecuado y abierto; no incluye domicilios.", ok: "los entregables clave y al menos un límite (qué no incluye)" },
  { id: "riesgo", t: "Riesgo general del proyecto", a: "Lo que podría tumbarlo.", q: "¿Qué podría tumbar tu proyecto? Piensa en lo más grave.", pista: "Que el permiso sanitario se demore más de dos meses.", ok: "al menos un riesgo concreto" },
  { id: "hitos", t: "Resumen del cronograma de hitos", a: "Inicio, momentos clave y fin, con fechas.", q: "¿Cuándo empieza, qué pasa en el medio y cuándo termina? Ponle fechas o semanas.", pista: "Firma del arriendo: 1 de febrero. Obra lista: 15 de marzo. Apertura: 1 de abril.", ok: "inicio, un hito intermedio y fin, con fechas o semanas", num: true },
  { id: "presupuesto", t: "Recursos financieros preaprobados", a: "La plata ya aprobada, con cifra.", q: "¿Cuánta plata tienes aprobada para el proyecto?", pista: "$40.000.000 de ahorros de la panadería.", ok: "una cifra con moneda, o decir que no hay recursos financieros", num: true },
  { id: "interesados", t: "Lista de interesados clave", a: "Quién lo afecta o se ve afectado.", q: "¿A quién afecta tu proyecto, o quién puede frenarlo? Nombra al menos tres.", pista: "Ramón (panadero), el dueño del local, los vecinos, la secretaría de salud.", ok: "al menos tres personas o grupos" },
  { id: "aprobacion", t: "Requisitos de aprobación", a: "En qué consiste el éxito, quién decide y quién firma.", q: "¿Quién decide si el proyecto salió bien, y quién firma la aprobación?", pista: "Lo aprueba mi socia Carmen cuando la sede abra con permiso al día.", ok: "quién decide si tuvo éxito y quién firma la aprobación" },
  { id: "salida", t: "Criterios de salida", a: "Qué tiene que pasar para cerrarlo o cancelarlo.", q: "¿Qué tiene que pasar para dar por cerrado el proyecto? ¿Y en qué caso lo cancelarías?", pista: "Se cierra al abrir la sede; se cancela si no hay permiso antes de mayo.", ok: "una condición de cierre y una de cancelación" },
  { id: "director", t: "Director del proyecto: responsabilidad y autoridad", a: "Quién dirige y qué puede decidir solo.", q: "¿Quién dirige el proyecto, de qué responde y qué puede decidir sin pedir permiso?", pista: "Yo dirijo; respondo por la apertura; puedo gastar hasta $2.000.000 sin consultar.", ok: "nombre, de qué responde y qué puede decidir solo" },
  { id: "patrocinador", t: "Patrocinador y nivel de autoridad", a: "Quién autoriza el acta y por qué puede.", q: "Por último: ¿quién autoriza el proyecto y pone los recursos? ¿Por qué tiene esa autoridad?", pista: "Carmen, socia mayoritaria: decide sobre el dinero de la panadería.", ok: "quién autoriza y por qué tiene esa autoridad" },
];

export const EJEMPLO = {
  proposito: "Los domingos la fila de la Panadería Pía da la vuelta a la cuadra y muchos clientes se van sin pan. Una segunda sede al otro lado del barrio atiende esa demanda.",
  objetivos: "Vender 300 panes diarios en la sede nueva antes de seis meses de abierta. Éxito: la sede cubre sus costos al sexto mes.",
  requisitos: "Permiso sanitario aprobado; horno a gas instalado; mismas recetas de la sede principal.",
  descripcion: "Entregables: local adecuado, equipado y abierto al público, con dos personas capacitadas. No incluye domicilios ni venta por internet.",
  riesgo: "Que el permiso sanitario se demore más de dos meses y retrase la apertura.",
  hitos: "Firma del arriendo: 1 de febrero. Obra terminada: 15 de marzo. Permiso: 25 de marzo. Apertura: 1 de abril.",
  presupuesto: "$40.000.000 de los ahorros de la panadería.",
  interesados: "Ramón (panadero), Carmen (socia), dueño del local, vecinos del barrio, secretaría de salud.",
  aprobacion: "El éxito es abrir con permiso al día y dentro del presupuesto. Lo decide y firma Carmen.",
  salida: "Se cierra cuando la sede abre al público. Se cancela si no hay permiso sanitario antes del 1 de mayo.",
  director: "Pía. Responde por la apertura a tiempo y en presupuesto; puede gastar hasta $2.000.000 por compra sin consultar.",
  patrocinador: "Carmen, socia mayoritaria: decide sobre el dinero de la panadería.",
};

export const SALUDO = "Hola, soy Pía. Antes de abrir mi segunda panadería tuve que firmar un acta de constitución: sin ella, el proyecto no existía. Ahora armamos la de tu proyecto, componente por componente.\n\nEmpecemos: ¿cómo se llama tu proyecto y para qué existe?";

export const estadoVacio = () => ({
  nombre: "",
  campos: Object.fromEntries(CAMPOS.map((c) => [c.id, { valor: "", estado: "vacio" }])),
  hilo: [{ rol: "companera", texto: SALUDO }],
  paso: 0, intentos: 0, firmas: { patro: "", dir: "" },
});

/** Revisión mínima sin IA (modo guiado y edición directa en la hoja). */
export function revisaLocal(c, v) {
  const t = (v ?? "").trim();
  if (t.length < 12) return false;
  if (c.num && !/\d/.test(t) && !(c.id === "presupuesto" && /sin (recursos|presupuesto|plata|dinero)/i.test(t))) return false;
  if (c.id === "interesados" && t.split(/[,;\n·]+|\sy\s/).filter((x) => x.trim().length > 1).length < 3) return false;
  if (c.id === "requisitos" && t.split(/[,;\n·]+|\sy\s/).filter((x) => x.trim().length > 2).length < 2) return false;
  return true;
}

export const siguienteVacio = (E) => CAMPOS.findIndex((c) => E.campos[c.id].estado !== "listo");

/** Un paso del modo guiado: devuelve el estado nuevo (no muta) y los ids que cambiaron. */
export function pasoGuiado(E0, texto) {
  const E = structuredClone(E0);
  const i = Math.max(0, Math.min(CAMPOS.length - 1, E.paso));
  if (i === 0 && !E.nombre) E.nombre = texto.split(/[.:\n]/)[0].slice(0, 80);
  const c = CAMPOS[i];
  const s = E.campos[c.id];
  s.valor = s.valor && E.intentos ? `${s.valor} ${texto.trim()}` : texto.trim();
  const ok = revisaLocal(c, s.valor);
  s.estado = ok ? "listo" : "incompleto";
  let dice, pista;
  if (!ok && E.intentos < 1) {
    E.intentos += 1;
    dice = `Te falta precisar: ${c.ok}. ¿Me lo completas?`;
  } else {
    E.intentos = 0;
    const j = siguienteVacio(E);
    if (j === -1) { dice = "¡Listo! Los 12 componentes están en el acta. Revísala y, cuando estés de acuerdo, fírmenla tú y tu patrocinador."; E.paso = 12; }
    else { E.paso = j; dice = (ok ? "Anotado. " : "Lo dejo como incompleto; puedes mejorarlo en la hoja. ") + CAMPOS[j].q; pista = CAMPOS[j].pista; }
  }
  E.hilo.push({ rol: "companera", texto: dice, pista });
  return { E, cambiados: [c.id] };
}

export function comoTexto(E) {
  const L = ["ACTA DE CONSTITUCIÓN DEL PROYECTO", E.nombre || "(sin nombre)", ""];
  CAMPOS.forEach((c, i) => L.push(`${i + 1}. ${c.t}`, E.campos[c.id].valor || "(sin llenar)", ""));
  L.push(`Patrocinador: ${E.firmas.patro || "________"}`, `Director del proyecto: ${E.firmas.dir || "________"}`);
  L.push("", "Componentes según la Guía del PMBOK® 6.ª ed., sección 4.1.3.1.");
  return L.join("\n");
}
