import {
  RONDAS_GANADORES, BANCO_CORRIENTE, ESCENARIOS_EXPLICA, CASOS_CRISIS, NOMBRES_RANURA,
} from "../data/juegosPolitica2.js";
import { CASILLAS, CASOS_CADENA, TITULARES, BRECHAS, PREGUNTA_BRECHA } from "../data/juegosPolitica.js";
import {
  BLIPS_RADAR, PREGUNTA_RESCATE, FRAGMENTOS_TRANSMISION, CORRIENTE,
  HIPOTESIS_TRIBUNAL, PREGUNTA_CRITERIO_TRIBUNAL,
} from "../data/icebergActividades.js";
import { CITAS_EXPEDIENTE, NIVELES, DECISIONES, PREGUNTA_DILUVIO } from "../data/arca.js";
import {
  COMUNICADOS, MEDIDAS_LINEA, MEDIDAS_INCIDENCIA, ESCENARIOS,
} from "../data/nova.js";
import { FUERZAS, CASOS as CASOS_ASEDIO } from "../data/asedio.js";
import {
  TERMINOS_ECG, FRAGMENTOS_ECG, REACCIONES, PASOS_TRANSFUSION,
  CASOS_BIOPSIA, CASOS_TRIAGE, CASOS_CIRUGIA, ALERTAS_MONITOR,
} from "../data/demandaAgregadaHacer.js";
import { TEXTO as TEXTO_NODOS } from "../components/mecanicas/MapaCausal.jsx";
import {
  CLASIFICADOR, IMPUESTOS_SELLO, MEDIDAS_FLUJO, PREGUNTA_MULTIPLICADOR, PREGUNTA_AGUJERO,
  CASOS_EXPANSIVA, CASILLAS_PRESUPUESTO, BANCO_DEFICIT,
} from "../data/politicaFiscal.js";
import { MEMORAMAS, CLASIFICACIONES } from "../data/cimientos.js";
import {
  CAMBIOS_ACERCA, CASO_GABINETE, CASO_CONSEJO, RONDAS_AUGE, RONDAS_AJUSTE,
  EXPLICA_PACIENTE, EXPLICA_CONTRIBUYENTE, SALA_ESPERA, COMITE_PRESUPUESTO,
} from "../data/bloquesAvanzados.js";
import {
  MEMORAMA_BANCO_CENTRAL, QUIEN_DECIDE, VOLANTE_DE_LA_TASA, CAJA_DE_HERRAMIENTAS, A_QUIEN_LE_PEGA,
  CADENAS_TRANSMISION, EXPLICA_DEUDOR, CORRIENTE_DECISIONES, EL_REZAGO, DILEMA_BANQUERO,
  DUELO_INSTRUMENTOS, DISENA_RESPUESTA, CASILLAS_RESPUESTA,
} from "../data/politicaMonetaria.js";
import {
  BANCO_IZQUIERDA_O_DERECHA, BANCO_DE_QUE_FAMILIA, BANCO_CUADRO_DINAMICAS,
  BANCO_DEBITA_O_ACREDITA, BANCO_CORRIENTE_DE_CUENTAS,
} from "../contabilidad/bancos.js";
import { SALDO_DE_LA_CUENTA, SIMPLE_O_COMPUESTO, ARMA_EL_ASIENTO, ASIENTO_COMPUESTO, CUADRA_O_NO, balanceDelAsiento, MAYORIZACION, ERROR_ESCONDIDO } from "../data/contabilidadActividades.js";
import { transaccionDe } from "../components/mecanicas/libros/ArmaElAsiento.jsx";
import { transaccionDe as transaccionCompuesta } from "../components/mecanicas/libros/ElAsientoCompuesto.jsx";
import { LAVADO_DE_AUTOS, CALEJA, pesos as pesosContables } from "../data/contabilidad.js";
import { BALANCES as BALANCES_DE_A2, cuentaHistorica } from "../contabilidad/armaElBalance.js";
import { FILAS as FILAS_DE_A3 } from "../contabilidad/cuadroDinamicas.js";
import { transaccionDe as transaccionDeA4 } from "../contabilidad/debitaOAcredita.js";

/* El nombre de cada caso, para desambiguar cuentas que se llaman igual. */
const EMPRESAS = { lavado: LAVADO_DE_AUTOS.empresa, caleja: CALEJA.empresa };

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * DE UN item_id AL ENUNCIADO QUE VIO EL ESTUDIANTE.
 *
 * El panel docente recibe del servidor ids internos —`et2:Evento`, `r3:cRD`,
 * `a:b-vs-c`— y a un profesor eso no le dice nada. Aquí se convierten en el
 * texto de la pregunta.
 *
 * ═══════════ ES LECTURA, NO TRADUCCIÓN ═══════════
 *
 * NO HAY NI UNA COPIA DE NINGÚN ENUNCIADO EN ESTE ARCHIVO. Cada regla busca en
 * el mismo banco del que salió el id y devuelve la cadena que el estudiante vio
 * en pantalla. Si alguien edita `BANCO_CORRIENTE[p1].texto`, el panel cambia en
 * el siguiente render sin que nadie toque nada aquí.
 *
 * Un catálogo de traducciones —un texto corto por ítem, aunque estuviera al
 * lado del banco— habría sido una segunda copia esperando a desincronizarse:
 * nada falla, y el panel enseña un enunciado que ya no existe. Es la misma
 * forma del error del «×100» y de las reglas de alerta muertas.
 *
 * Lo único que estas reglas aportan es la GRAMÁTICA del id: saber que en
 * "quien-gana-quien-pierde" el segmento de antes es la ronda y el de después el
 * personaje. Eso ya lo sabe el id; la regla solo lo deshace.
 *
 * ═══════════ LA TERCERA COPIA DE LA GRAMÁTICA, Y CUÁL ES EL FINAL ═══════════
 *
 * Esa gramática vive hoy en TRES sitios: el componente que construye el id,
 * detalle-ids.test.mjs que lo reconstruye a propósito para que el otro extremo
 * falle si divergen, y este archivo. Tres es una más de las que debería haber,
 * y conviene decirlo en vez de descubrirlo.
 *
 * EL FINAL CORRECTO es que cada mecánica exporte, sobre su propio banco, las
 * dos caras de la misma moneda:
 *
 *     export const idDe = (ronda, personaje) => `${ronda.id}:${personaje.id}`;
 *     export const etiquetaDe = (id) => ...;
 *
 * y que el componente use la primera en vez de construir la plantilla a mano.
 * Entonces la gramática vive una sola vez y esto se queda en un índice de
 * `etiquetaDe` por actividad. Son veintiuna mecánicas y se puede hacer una a
 * una, sin día de corte. No se hizo aquí a propósito: mezclarlo con esto habría
 * puesto un refactor de veintiún archivos dentro de una tarea de panel.
 *
 * ═══════════ LO QUE ESTO NO PUEDE ATRAPAR ═══════════
 *
 * Las dos pruebas de etiquetas-item.test.mjs derivan de los mismos bancos que
 * estas reglas, así que demuestran COHERENCIA, no corrección: si la gramática
 * de un componente se separa de la del test Y de la de aquí a la vez, ninguna
 * prueba lo ve. Lo único que mira la verdad —los ids reales que devuelve el
 * servidor— es el canario de la vista, que enseña el id crudo y lo cuenta en
 * voz alta en vez de dejar un hueco.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * ═══════════ LOS DUELOS Y EL PREFIJO COMPARTIDO ═══════════
 *
 * Salió al mirar el panel, no al diseñarlo. Las tres hipótesis del tribunal
 * empiezan por «El dueño cree que», así que recortar a cuarenta caracteres
 * daba «El dueño cree que basta con que la… vs El dueño cree que su…»: dos
 * veces la misma frase y ni una palabra que distinga un duelo de otro.
 *
 * La solución sale del propio banco: se calcula el arranque que TODAS las
 * opciones comparten y se quita antes de recortar. Si mañana alguien reescribe
 * las hipótesis, el prefijo se recalcula solo; si no comparten nada, esto no
 * hace nada. Cero prosa escrita a mano, que es la regla de todo el módulo.
 *
 * Se exige que el prefijo valga la pena —diez caracteres— porque quitar «El »
 * no aclara nada y sí puede dejar una frase empezando en minúscula.
 */
const MINIMO_PREFIJO = 10;

export function prefijoComun(textos) {
  const lista = textos.filter((t) => typeof t === "string" && t.length > 0);
  if (lista.length < 2) return "";
  let p = lista[0];
  for (const t of lista.slice(1)) {
    let i = 0;
    while (i < p.length && i < t.length && p[i] === t[i]) i++;
    p = p.slice(0, i);
    if (!p) return "";
  }
  /* Hasta el último espacio: cortar a mitad de palabra sería peor que no cortar. */
  const j = p.lastIndexOf(" ");
  if (j <= 0) return "";
  const limpio = p.slice(0, j + 1);
  return limpio.length >= MINIMO_PREFIJO ? limpio : "";
}

/* Quita el arranque compartido, si lo hay y si deja algo detrás. */
function sinPrefijo(texto, prefijo) {
  if (!prefijo || !texto.startsWith(prefijo)) return texto;
  const resto = texto.slice(prefijo.length).trim();
  return resto.length > 0 ? resto : texto;
}

/* Índice id -> campo, para los bancos que son una lista plana. */
const porId = (lista, campo) => Object.fromEntries(lista.map((x) => [x.id, x[campo]]));

/*
 * Los fragmentos de "Explica la política" viven dentro de cada escenario. Se
 * aplanan una vez, al cargar el módulo, y no en cada llamada.
 */
const FRAGMENTOS_EXPLICA = Object.fromEntries(
  ESCENARIOS_EXPLICA.flatMap((e) => (e.fragmentos ?? e.banco ?? []).map((f) => [f.id, f.texto]))
);

/*
 * ═══════════ LAS REGLAS ═══════════
 *
 * Una por actividad, con el mismo contrato: recibe el item_id tal como llegó
 * del servidor y devuelve una cadena, o null si no lo reconoce. Null no es un
 * fallo silencioso: es lo que dispara el canario.
 *
 * Cuando el registro tiene varios campos legibles se elige EL MÁS CORTO QUE
 * IDENTIFIQUE —`nombre` antes que `texto`—, porque esto se lee en una fila de
 * tabla y no en un párrafo.
 */
export const REGLAS = {
  /* ── Ids que ya son clave directa de un banco ── */
  "corriente-titulares": (id) => porId(BANCO_CORRIENTE, "texto")[id] ?? null,
  "corriente-cruzada": (id) => porId(CORRIENTE, "texto")[id] ?? null,
  "radar-profundidad": (id) => porId(BLIPS_RADAR, "texto")[id] ?? null,
  "sala-monitores": (id) => porId(ALERTAS_MONITOR, "texto")[id] ?? null,
  "termometro-reacciones": (id) => porId(REACCIONES, "cambio")[id] ?? null,
  "transmision-superficie": (id) => porId(FRAGMENTOS_TRANSMISION, "texto")[id] ?? null,
  "explica-la-politica": (id) => FRAGMENTOS_EXPLICA[id] ?? null,

  /*
   * En estas dos el id ES el texto: la cámara registra el término preguntado y
   * el arquitecto el nivel del iceberg. No hay nada que buscar, y comprobar que
   * pertenece al banco evita devolver como etiqueta un id que ya no existe.
   */
  "camara-presion": (id) => (typeof id === "string" && id.length > 0 ? id : null),
  "camara-presion-experto": (id) => (typeof id === "string" && id.length > 0 ? id : null),
  "arquitecto-profundidades": (id) => (NIVELES.includes(id) ? id : null),

  /* ── Ids compuestos: contexto + clave ── */
  "quien-gana-quien-pierde": (id) => {
    const [ronda, quien] = String(id).split(":");
    const r = RONDAS_GANADORES.find((x) => x.id === ronda);
    if (!r) return null;
    /* La etapa 2 de cada ronda: si la medida actúa directo o por rebote. */
    if (quien === "directo") return `¿Directo o indirecto? — ${r.medida}`;
    return r.personajes.find((x) => x.id === quien)?.nombre ?? null;
  },

  "arma-grupo-logico": (id) => {
    const [caso, casilla] = String(id).split(":");
    const c = CASOS_CADENA.find((x) => x.id === caso);
    const k = CASILLAS.find((x) => x.id === casilla);
    return c && k ? `${k.nombre} — caso ${c.titulo}` : null;
  },

  "simulador-de-crisis": (id) => {
    const [caso, ranura] = String(id).split(":");
    const c = CASOS_CRISIS.find((x) => x.id === caso);
    const nombre = NOMBRES_RANURA[ranura];
    return c && nombre ? `${nombre} — ${c.titulo ?? c.problema ?? caso}` : null;
  },

  "asedio-estrategico": (id) => {
    const [caso, fuerza] = String(id).split(":");
    const c = CASOS_ASEDIO.find((x) => x.id === caso);
    const f = FUERZAS.find((x) => x.id === fuerza);
    return c && f ? `${f.nombre ?? f.id} — ${c.titulo ?? c.nombre ?? caso}` : null;
  },

  "constructor-mapa-causal": (id) => {
    /* `ref:N0->N1` y `extra:N3->N7`. El prefijo dice si la flecha es del mapa. */
    const [clase, flecha] = String(id).split(":");
    if (!flecha) return null;
    const [de, a] = flecha.split("->");
    const td = TEXTO_NODOS[de];
    const ta = TEXTO_NODOS[a];
    if (!td || !ta) return null;
    return `${td} → ${ta}${clase === "extra" ? " (flecha añadida)" : ""}`;
  },

  "tribunal-profundidad": (id) => {
    if (id === "criterio") return PREGUNTA_CRITERIO_TRIBUNAL;
    const [, par] = String(id).split(":");
    const [a, b] = String(par ?? "").split("-");
    const ha = HIPOTESIS_TRIBUNAL.find((x) => x.id === a);
    const hb = HIPOTESIS_TRIBUNAL.find((x) => x.id === b);
    if (!ha || !hb) return null;
    /*
     * Dos hipótesis enteras en una fila no se leen. Se corta cada lado por su
     * cuenta, y antes se le quita el arranque que las tres comparten: sin eso,
     * los tres duelos salían con el mismo texto.
     */
    const p = prefijoComun(HIPOTESIS_TRIBUNAL.map((h) => h.texto));
    return `${recortar(sinPrefijo(ha.texto, p), 40)} vs ${recortar(sinPrefijo(hb.texto, p), 40)}`;
  },

  "diagnostico-en-vivo": (id) => {
    if (id === "brecha") return PREGUNTA_BRECHA;
    return porId(TITULARES, "texto")[id] ?? null;
  },

  "expediente-rescate": (id) => (id === "diagnostico" ? PREGUNTA_RESCATE : null),

  "proyecto-arca": (id) => {
    /* `etN:` delante, y el resto puede llevar sus propios dos puntos. */
    const [etapa, ...resto] = String(id).split(":");
    const clave = resto.join(":");
    if (etapa === "et1") return porId(CITAS_EXPEDIENTE, "texto")[clave] ?? null;
    if (etapa === "et2") return NIVELES.includes(clave) ? clave : null;
    if (etapa === "et3") {
      const [a, b] = String(clave.replace(/^par:/, "")).split("-");
      const da = DECISIONES.find((x) => x.id === a);
      const db = DECISIONES.find((x) => x.id === b);
      if (!da || !db) return null;
      /* Mismo tratamiento que el tribunal; hoy no comparten arranque y no hace nada. */
      const pd = prefijoComun(DECISIONES.map((x) => x.texto));
      return `${recortar(sinPrefijo(da.texto, pd), 40)} vs ${recortar(sinPrefijo(db.texto, pd), 40)}`;
    }
    if (etapa === "et4") return clave === "momento" ? PREGUNTA_DILUVIO : null;
    return null;
  },

  /*
   * El Comité de NOVA, el segundo desafío. Mismo prefijo `etN:` y misma razón:
   * son cuatro juegos dentro de una actividad, y sin él el panel no sabría de
   * qué etapa viene una fila.
   */
  "comite-nova": (id) => {
    const [etapa, ...resto] = String(id).split(":");
    const clave = resto.join(":");
    if (etapa === "et1") return porId(COMUNICADOS, "texto")[clave] ?? null;
    if (etapa === "et2") return porId(MEDIDAS_LINEA, "texto")[clave] ?? null;
    if (etapa === "et3") {
      /* `m1:gira` — la medida y cuál de sus dos preguntas. */
      const [medidaId, fase] = clave.split(":");
      const medida = MEDIDAS_INCIDENCIA.find((m) => m.id === medidaId);
      if (!medida) return null;
      return `${recortar(medida.titulo, 46)} · ${fase === "gira" ? "quién gira" : "quién lo soporta"}`;
    }
    if (etapa === "et4") {
      /* `a:a1` — el escenario y su decisión. */
      const [escenarioId, decisionId] = clave.split(":");
      const escenario = ESCENARIOS.find((e) => e.id === escenarioId);
      const decision = escenario?.decisiones.find((d) => d.id === decisionId);
      if (!decision) return null;
      return `${escenario.titulo} · ${recortar(decision.pregunta, 46)}`;
    }
    return null;
  },

  /* ── Demanda Agregada ── */
  "electrocardiograma": (id) => {
    const [tipo, resto] = String(id).split(":");
    if (tipo === "def") return porId(TERMINOS_ECG, "nombre")[resto] ?? null;
    if (tipo === "frag") return porId(FRAGMENTOS_ECG, "fragmento")[resto] ?? null;
    return null;
  },

  "banco-transfusiones": (id) => {
    const [ronda, paso] = String(id).split(":");
    const p = PASOS_TRANSFUSION.find((x) => x.id === paso);
    if (!p) return null;
    const ayuda = ronda === "r2" ? "con fórmula" : ronda === "r3" ? "sin ayuda" : null;
    return ayuda ? `${p.rotulo} — ${ayuda}` : null;
  },

  "biopsia-economica": (id) => {
    const [, caso] = String(id).split(":");
    return CASOS_BIOPSIA.find((x) => x.id === caso)?.caso ?? null;
  },

  "triage-emergencias": (id) => {
    const [caso, duelo] = String(id).split(":");
    const c = CASOS_TRIAGE.find((x) => x.id === caso);
    const d = c?.duelos.find((x) => x.id === duelo);
    return c && d ? `${c.medidas[d.par[0]]} vs ${c.medidas[d.par[1]]}` : null;
  },

  "cirugia-reconstruccion": (id) => {
    const [caso, papel] = String(id).split(":");
    const c = CASOS_CIRUGIA.find((x) => x.id === caso);
    if (!c || (papel !== "primero" && papel !== "segundo")) return null;
    const orden = papel === "primero" ? "Primer orden" : "Segundo orden";
    return `${orden} — ${c.caso}`;
  },

  /* ── Política Fiscal ── */
  "clasificador-tesoro": (id) => porId(CLASIFICADOR, "concepto")[id] ?? null,
  "directos-indirectos": (id) => porId(IMPUESTOS_SELLO, "concepto")[id] ?? null,
  "deficit-vs-deuda": (id) => porId(BANCO_DEFICIT, "texto")[id] ?? null,

  "flujo-de-caja": (id) => {
    /* `canal:<medida>` en la etapa 1; `multiplicador`, la etapa 2. */
    if (id === "multiplicador") return PREGUNTA_MULTIPLICADOR;
    const [etapa, medida] = String(id).split(":");
    return etapa === "canal" ? porId(MEDIDAS_FLUJO, "medida")[medida] ?? null : null;
  },

  "agujero-fiscal": (id) => (id === "por-que-renta" ? PREGUNTA_AGUJERO : null),

  "expansiva-contractiva": (id) => {
    const [caso, duelo] = String(id).split(":");
    const c = CASOS_EXPANSIVA.find((x) => x.id === caso);
    const d = c?.duelos.find((x) => x.id === duelo);
    if (!c || !d) return null;
    /* Mismo tratamiento que los otros duelos: cada lado por su cuenta. */
    const [a, b] = d.par.map((letra) => c.medidas[letra]);
    const p = prefijoComun([a, b]);
    return `${recortar(sinPrefijo(a, p), 33)} vs ${recortar(sinPrefijo(b, p), 33)}`;
  },

  "disena-presupuesto": (id) => CASILLAS_PRESUPUESTO.find((x) => x.id === id)?.ayuda ?? null,

  /* ── Los quince de la 0030 ── */
  /* Memorama: el ítem es la pareja, y la pareja se lee como término y definición. */
  "memorama-tesoro": (id) => pareja("memorama-tesoro", id),
  "memorama-corazon": (id) => pareja("memorama-corazon", id),
  "memorama-tesoreria": (id) => pareja("memorama-tesoreria", id),

  "que-rama-es": (id) => porId(CLASIFICACIONES["que-rama-es"].items, "texto")[id] ?? null,
  "cual-componente": (id) => porId(CLASIFICACIONES["cual-componente"].items, "texto")[id] ?? null,
  "cobra-gasta-o-pide": (id) => porId(CLASIFICACIONES["cobra-gasta-o-pide"].items, "texto")[id] ?? null,

  "se-acerca-o-se-aleja": (id) => {
    const f = CAMBIOS_ACERCA.find((x) => x.id === id);
    /* El cambio recortado deja sitio al objetivo: sin él, la fila no dice la pregunta. */
    return f ? `${recortar(f.cambio, 36)} → ${f.objetivo}` : null;
  },

  "expediente-gabinete": (id) => (id === CASO_GABINETE.id ? CASO_GABINETE.pregunta : null),

  "consejo-ministros": (id) => {
    const d = CASO_CONSEJO.duelos.find((x) => x.id === id);
    if (!d) return null;
    const [a, b] = d.par.map((letra) => CASO_CONSEJO.medidas[letra]);
    const p = prefijoComun([a, b]);
    return `${recortar(sinPrefijo(a, p), 33)} vs ${recortar(sinPrefijo(b, p), 33)}`;
  },

  /* El reparto de actores: `<ronda>:<personaje>`, como ¿Quién gana, quién pierde? */
  "quien-beneficia-auge": (id) => actorDe(RONDAS_AUGE, id),
  "quien-afecta-ajuste": (id) => actorDe(RONDAS_AJUSTE, id),

  "explica-paciente": (id) => porId(EXPLICA_PACIENTE.fragmentos, "texto")[id] ?? null,
  "explica-contribuyente": (id) => porId(EXPLICA_CONTRIBUYENTE.fragmentos, "texto")[id] ?? null,

  /* La frontera: cada uno de los catorce datos, relevante o señuelo. */
  "sala-espera-llena": (id) => porId([...SALA_ESPERA.relevantes, ...SALA_ESPERA.senuelos], "texto")[id] ?? null,
  "comite-presupuesto": (id) => porId([...COMITE_PRESUPUESTO.relevantes, ...COMITE_PRESUPUESTO.senuelos], "texto")[id] ?? null,
};

/* ── Política Monetaria (0031) ── */
Object.assign(REGLAS, {
  "memorama-banco-central": (id) => {
    const p = MEMORAMA_BANCO_CENTRAL.pares.find((x) => x.id === id);
    return p ? `${p.termino} — ${p.definicion}` : null;
  },
  "quien-decide-esto": (id) => porId(QUIEN_DECIDE.items, "texto")[id] ?? null,
  "volante-de-la-tasa": (id) => porId(VOLANTE_DE_LA_TASA.escenarios, "texto")[id] ?? null,
  "caja-de-herramientas": (id) => porId(CAJA_DE_HERRAMIENTAS.items, "texto")[id] ?? null,
  "a-quien-le-pega-la-tasa": (id) => actorDe(A_QUIEN_LE_PEGA.rondas, id),
  /* `<cadena>:eslabon-N`: el eslabón que va en esa casilla de esa cadena. */
  "cadena-de-transmision": (id) => {
    const [cadena, casilla] = String(id).split(":");
    const c = CADENAS_TRANSMISION.cadenas.find((x) => x.id === cadena);
    const n = Number(/^eslabon-(\d)$/.exec(casilla ?? "")?.[1]);
    return c && n >= 2 && n <= c.eslabones.length ? c.eslabones[n - 1].texto : null;
  },
  "explicaselo-a-un-deudor": (id) => porId(EXPLICA_DEUDOR.escenarios.flatMap((e) => e.fragmentos), "texto")[id] ?? null,
  "corriente-de-decisiones": (id) => porId(CORRIENTE_DECISIONES.items, "texto")[id] ?? null,
  "el-rezago": (id) => {
    if (id === "cierre") return EL_REZAGO.cierre.pregunta;
    const [caso, hecho] = String(id).split(":");
    return EL_REZAGO.casos.find((x) => x.id === caso)?.hechos.find((h) => h.id === hecho)?.texto ?? null;
  },
  "dilema-banquero-central": (id) => (id === DILEMA_BANQUERO.id ? DILEMA_BANQUERO.pregunta : null),
  "duelo-de-instrumentos": (id) => {
    const [caso, duelo] = String(id).split(":");
    const c = DUELO_INSTRUMENTOS.casos.find((x) => x.id === caso);
    const d = c?.duelos.find((x) => x.id === duelo);
    if (!c || !d) return null;
    const [a, b] = d.par.map((letra) => c.medidas[letra]);
    const p = prefijoComun([a, b]);
    return `${recortar(sinPrefijo(a, p), 33)} vs ${recortar(sinPrefijo(b, p), 33)}`;
  },
  "disena-respuesta-monetaria": (id) => {
    const [caso, casilla] = String(id).split(":");
    const c = DISENA_RESPUESTA.casos.find((x) => x.id === caso);
    const k = CASILLAS_RESPUESTA.find((x) => x.id === casilla);
    return c && k ? `${k.rotulo} — ${c.caso}` : null;
  },

  /*
   * ═══════════ CONTABILIDAD · LAS CUENTAS, EL DEBE Y EL HABER ═══════════
   *
   * Las cinco que ya se juegan. Leen del mismo banco adaptado del que salió el
   * id, así que si mañana cambia un enunciado el panel lo enseña cambiado sin
   * tocar nada aquí.
   *
   * Las otras siete del tema y el desafío todavía no tienen mecánica: están
   * marcadas `pendiente: true` en subjects.js y no pueden emitir ni un ítem.
   * Sus reglas entran con su mecánica, porque es la mecánica la que decide la
   * gramática del id — escribirlas ahora sería adivinarla.
   */
  "cu-izquierda-o-derecha": (id) => porId(BANCO_IZQUIERDA_O_DERECHA.items, "texto")[id] ?? null,
  /*
   * A2 cambió de mecánica: era una lista de doce cuentas sueltas y ahora son
   * dos balances. Los ítems nuevos se llaman `cu2-<banco>-<cuenta>`.
   *
   * LOS VIEJOS SE SIGUEN LEYENDO. Sus filas están en el servidor y el panel
   * tiene que poder decir qué contestó cada estudiante; por eso el contenido
   * conserva la tabla de qué cuenta era cada id antiguo. Sin ella, el docente
   * vería «cu2-05» crudo en las respuestas que ya existen.
   */
  "cu-de-que-familia": (id) => {
    const nueva = BALANCES_DE_A2.flatMap((b) => b.cuentas).find((c) => c.id === id);
    if (nueva) return `${nueva.cuenta} — ${pesosContables(nueva.valor)}`;
    return cuentaHistorica(id);
  },
  /*
   * El cuadro pasó de doce combinaciones sueltas a seis filas, una por
   * familia. Los ids nuevos son las filas; los doce viejos —que ya jugaron
   * estudiantes— se siguen leyendo del banco anterior, igual que en A2.
   */
  "cu-cuadro-dinamicas": (id) => {
    const fila = FILAS_DE_A3.find((f) => f.id === id);
    if (fila) return `${fila.nombre}: ¿qué le hace un débito?`;
    return porId(BANCO_CUADRO_DINAMICAS.items, "texto")[id] ?? null;
  },
  /*
   * Los diez ids son los mismos de siempre —misma transacción, misma cuenta
   * preguntada—, así que las respuestas que ya existen se siguen leyendo. Lo
   * que cambia es que ahora la etiqueta dice también por qué cuenta se
   * preguntó: sin eso, «Compra de contado de una maquinaria» no distingue si
   * la pregunta era por Caja o por Maquinaria.
   */
  "cu-debita-o-acredita": (id) => transaccionDeA4(id) ?? porId(BANCO_DEBITA_O_ACREDITA.items, "texto")[id] ?? null,
  "cu-corriente-de-cuentas": (id) => porId(BANCO_CORRIENTE_DE_CUENTAS.items, "texto")[id] ?? null,

  /*
   * `<cuenta>:saldo` y `<cuenta>:lado`: las dos preguntas de cada cuenta.
   *
   * LA EMPRESA VA EN LA ETIQUETA Y NO SOBRA. Tres ítems del banco son la
   * cuenta «Caja» —la de Lavado de Autos, la de Caleja y la del ejemplo del
   * capítulo— y sin decir de cuál empresa, el profesor vería tres preguntas
   * distintas escritas exactamente igual.
   */
  "cu-saldo-de-la-cuenta": (id) => {
    const [item, que] = String(id).split(":");
    const i = SALDO_DE_LA_CUENTA.items.find((x) => x.id === item);
    if (!i || (que !== "saldo" && que !== "lado")) return null;
    const empresa = i.caso === "capitulo" ? "ejemplo del capítulo" : EMPRESAS[i.caso];
    if (!empresa) return null;
    return `${que === "saldo" ? "Cuánto es el saldo" : "De qué lado va"}: ${i.cuenta} (${empresa})`;
  },

  /*
   * El id es el del ítem y la etiqueta, la transacción que el estudiante tenía
   * delante. Se lee del caso o de las sueltas, según de dónde venga.
   */
  "cu-arma-el-asiento": (id) => {
    const i = ARMA_EL_ASIENTO.items.find((x) => x.id === id);
    return i ? transaccionDe(i).texto : null;
  },

  /*
   * `<asiento>:juicio` y `<asiento>:cifra`. El asiento no tiene enunciado —es
   * el propio asiento lo que se juzga—, así que la etiqueta lo resume.
   *
   * LOS TOTALES VAN DELANTE Y NO SOBRAN. Dos asientos del banco tocan las
   * mismas cuentas y solo se diferencian en una cifra: uno cuadra y el otro
   * no, que es exactamente el par que la actividad quiere contrastar. Con solo
   * los nombres de las cuentas, el profesor vería dos preguntas distintas
   * escritas igual — y encima el recorte a 70 caracteres se come lo que viene
   * después.
   */
  "cu-cuadra-o-no": (id) => {
    const [item, que] = String(id).split(":");
    const a = CUADRA_O_NO.asientos.find((x) => x.id === item);
    if (!a || (que !== "juicio" && que !== "cifra")) return null;
    const b = balanceDelAsiento(a);
    const cuentas = [...a.debe, ...a.haber].map(([c]) => c).join(" / ");
    const pregunta = que === "juicio" ? "Cuadra o no" : "La diferencia";
    return `${pregunta} · ${pesosContables(b.debe)} contra ${pesosContables(b.haber)}: ${cuentas}`;
  },

  /*
   * Dos gramaticas: `<transaccion>:<cuenta>:cuenta|lado` al mayorizar, y
   * `saldo:<cuenta>:cifra|lado` en la segunda fase. El primer trozo distingue
   * las dos sin ambiguedad porque ninguna transaccion se llama "saldo".
   */
  "cu-mayorizacion": (id) => {
    const trozos = String(id).split(":");
    if (trozos.length !== 3) return null;
    const [uno, cuenta, que] = trozos;
    if (uno === "saldo") {
      if (que !== "cifra" && que !== "lado") return null;
      return `${que === "cifra" ? "Cuanto es el saldo" : "De que lado va el saldo"}: ${cuenta}`;
    }
    if (que !== "cuenta" && que !== "lado") return null;
    const t = [...LAVADO_DE_AUTOS.transacciones, ...CALEJA.transacciones].find((x) => x.id === uno);
    if (!t) return null;
    return `${que === "cuenta" ? "A que cuenta va" : "De que lado va"} ${cuenta} — ${t.texto}`;
  },

  /* Igual que CU-6: el id es el del item y la etiqueta, su transaccion. */
  "cu-asiento-compuesto": (id) => {
    const i = ASIENTO_COMPUESTO.items.find((x) => x.id === id);
    return i ? transaccionCompuesta(i).texto : null;
  },

  /*
   * `<transaccion>:clase` y `<transaccion>:cuentas`.
   *
   * LA PREGUNTA VA DELANTE DEL ENUNCIADO, y no es cuestión de estilo: los
   * enunciados de este banco pasan de los 70 caracteres del recorte, así que
   * con la pregunta al final las dos etiquetas del mismo ítem se cortaban en
   * el mismo sitio y el profesor veía dos filas idénticas.
   */
  "cu-simple-o-compuesto": (id) => {
    const [item, que] = String(id).split(":");
    const i = SIMPLE_O_COMPUESTO.items.find((x) => x.id === item);
    if (!i || (que !== "clase" && que !== "cuentas")) return null;
    return `${que === "clase" ? "Simple o compuesto" : "Cuántas cuentas"}: ${i.enunciado}`;
  },

  /*
   * `<caso>:cuenta` y `<caso>:tipo`.
   *
   * LA CUENTA SEMBRADA NO VA EN LA ETIQUETA, aunque cabría. El profesor lee
   * estas filas para saber qué falló, no para resolver el caso; escribir ahí
   * «Hipoteca por pagar» convertiría el panel en la hoja de respuestas de una
   * actividad que sus estudiantes todavía tienen que jugar. Lo que sí va es la
   * transacción, que es de dónde sale el caso y lo identifica sin resolverlo.
   */
  /*
   * El desafío, con el prefijo de etapa que pone el orquestador:
   *
   *   et1:<transaccion>            armar el asiento
   *   et2:<transaccion>:<cuenta>:<lado>   mayorizar un valor
   *   et3:saldo:<cuenta>:cifra|lado       el saldo y su lado
   *   et4:esf:<cuenta>                    dónde va en el estado
   *
   * La etapa va delante en el texto porque el profesor lee estas filas para
   * saber en qué parte del ciclo se le cayó el estudiante, que es la pregunta
   * que el desafío contesta y las doce actividades no.
   */
  "ciclo-completo": (id) => {
    const [etapa, ...resto] = String(id).split(":");
    const clave = resto.join(":");
    const transaccion = (x) => LAVADO_DE_AUTOS.transacciones.find((t) => t.id === x);

    if (etapa === "et1") {
      const t = transaccion(clave);
      return t ? `Diario · ${t.texto}` : null;
    }
    if (etapa === "et2") {
      const [idTransaccion, cuenta, lado] = clave.split(":");
      const t = transaccion(idTransaccion);
      if (!t || !cuenta || !lado) return null;
      return `Mayorizar · ${cuenta} al ${lado} — ${t.texto}`;
    }
    if (etapa === "et3") {
      const [uno, cuenta, que] = clave.split(":");
      if (uno !== "saldo" || (que !== "cifra" && que !== "lado")) return null;
      return `Saldo · ${que === "cifra" ? "cuánto es" : "de qué lado va"}: ${cuenta}`;
    }
    if (etapa === "et4") {
      const [uno, cuenta] = clave.split(":");
      if (uno !== "esf" || !cuenta) return null;
      return `Estado de situación · dónde va ${cuenta}`;
    }
    return null;
  },

  "cu-error-escondido": (id) => {
    const [item, que] = String(id).split(":");
    const c = ERROR_ESCONDIDO.casos.find((x) => x.id === item);
    if (!c || (que !== "cuenta" && que !== "tipo")) return null;
    const t = LAVADO_DE_AUTOS.transacciones.find((x) => x.id === c.transaccion);
    const pregunta = que === "cuenta" ? "Cuál cuenta no cuadra" : "Qué error tiene";
    return `${pregunta} — ${t ? t.texto : c.transaccion}`;
  },
});

/*
 * El Repaso Diario guarda cada ítem con su clave entera —`<actividad>:<item_id>`—,
 * así que su etiqueta es la de la actividad de origen: se parte por el primer
 * «:» y se le pregunta a esa regla. Sin texto propio.
 */
REGLAS["repaso-diario"] = (id) => {
  const texto = String(id);
  const corte = texto.indexOf(":");
  if (corte <= 0) return null;
  const origen = texto.slice(0, corte);
  if (origen === "repaso-diario" || !REGLAS[origen]) return null;
  return REGLAS[origen](texto.slice(corte + 1));
};

function pareja(memorama, id) {
  const p = MEMORAMAS[memorama].pares.find((x) => x.id === id);
  return p ? `${p.termino} — ${p.definicion}` : null;
}

function actorDe(rondas, id) {
  const [ronda, quien] = String(id).split(":");
  return rondas.find((r) => r.id === ronda)?.personajes.find((p) => p.id === quien)?.nombre ?? null;
}

/** Corta por palabras, sin partir una a la mitad. */
export function recortar(texto, tope = 70) {
  if (typeof texto !== "string") return "";
  const t = texto.trim();
  if (t.length <= tope) return t;
  const corte = t.slice(0, tope - 1);
  const espacio = corte.lastIndexOf(" ");
  return (espacio > tope * 0.6 ? corte.slice(0, espacio) : corte).trimEnd() + "…";
}

/**
 * El enunciado de un ítem, o null si no se puede nombrar.
 *
 * Null es una respuesta legítima y el que llama TIENE que tratarla: es lo que
 * pasa con una actividad sin regla todavía, o con un id de un banco que cambió.
 * La vista enseña el id crudo y lo cuenta; lo que no hace nunca es dejar el
 * hueco en blanco.
 */
export function etiquetaDeItem(activityId, itemId, tope = 70) {
  const regla = REGLAS[activityId];
  if (!regla || itemId === null || itemId === undefined) return null;
  let texto = null;
  try {
    texto = regla(itemId);
  } catch {
    /* Un banco a medio migrar no puede tumbar el panel entero. */
    return null;
  }
  if (typeof texto !== "string" || texto.trim() === "") return null;
  return recortar(texto, tope);
}

/** ¿Hay regla para esta actividad? Lo usa la prueba de cobertura. */
export function hayReglaPara(activityId) {
  return Object.prototype.hasOwnProperty.call(REGLAS, activityId);
}
