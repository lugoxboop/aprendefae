import { calcularFP, TIEMPO_MINIMO_MS } from "../motor.js";

const LENTO = 999_999; // por encima de cualquier mínimo: no activa la defensa de tiempo
let fallos = 0;
const filas = [];

const check = (nombre, esperado, obtenido) => {
  const pasa = esperado === obtenido;
  if (!pasa) fallos++;
  filas.push({ regla: nombre, esperado, obtenido, resultado: pasa ? "PASA" : "FALLA" });
};

const fp = (p) => calcularFP({ duracionMs: LENTO, ...p }).fp;

// --- Puntos base por dificultad (exploratoria, primera vez, sin prisa) ---
check("base fácil = 10",   10, fp({ dificultad: "facil",   modalidad: "exploratoria" }));
check("base medio = 25",   25, fp({ dificultad: "medio",   modalidad: "exploratoria" }));
check("base difícil = 50", 50, fp({ dificultad: "dificil", modalidad: "exploratoria" }));
check("base experto = 90", 90, fp({ dificultad: "experto", modalidad: "exploratoria" }));

// --- Exploratoria: 100% por completar, sin importar aciertos ---
check("exploratoria ignora aciertos", 50,
  fp({ dificultad: "dificil", modalidad: "exploratoria", aciertos: 0 }));

// --- Evaluativa: escala con aciertos, piso 50% ---
check("evaluativa 100% aciertos", 50, fp({ dificultad: "dificil", modalidad: "evaluativa", aciertos: 1 }));
check("evaluativa 80% aciertos",  40, fp({ dificultad: "dificil", modalidad: "evaluativa", aciertos: 0.8 }));
check("evaluativa 60% aciertos",  30, fp({ dificultad: "dificil", modalidad: "evaluativa", aciertos: 0.6 }));
check("evaluativa 20% cae al piso 50%", 25, fp({ dificultad: "dificil", modalidad: "evaluativa", aciertos: 0.2 }));
check("evaluativa 0% cae al piso 50%",  25, fp({ dificultad: "dificil", modalidad: "evaluativa", aciertos: 0 }));

// --- Defensa de tiempo: por debajo del mínimo, 60% ---
check("fácil por debajo del mínimo -> 60%", 6,
  calcularFP({ dificultad: "facil", modalidad: "exploratoria", duracionMs: TIEMPO_MINIMO_MS.facil - 1 }).fp);
check("fácil justo en el mínimo -> completo", 10,
  calcularFP({ dificultad: "facil", modalidad: "exploratoria", duracionMs: TIEMPO_MINIMO_MS.facil }).fp);
check("sin dato de tiempo -> no penaliza", 10,
  calcularFP({ dificultad: "facil", modalidad: "exploratoria" }).fp);
check("experto rápido -> 60% de 90", 54,
  calcularFP({ dificultad: "experto", modalidad: "exploratoria", duracionMs: 1000 }).fp);

// --- Repeticiones: 1ª completa, siguientes 3 al 20%, de la 4ª en adelante 0 ---
check("1ª vez (0 previas) -> 100%", 50, fp({ dificultad: "dificil", modalidad: "exploratoria", repeticionesPrevias: 0 }));
check("repetición 1 -> 20%",        10, fp({ dificultad: "dificil", modalidad: "exploratoria", repeticionesPrevias: 1 }));
check("repetición 2 -> 20%",        10, fp({ dificultad: "dificil", modalidad: "exploratoria", repeticionesPrevias: 2 }));
check("repetición 3 -> 20%",        10, fp({ dificultad: "dificil", modalidad: "exploratoria", repeticionesPrevias: 3 }));
check("repetición 4 -> 0",           0, fp({ dificultad: "dificil", modalidad: "exploratoria", repeticionesPrevias: 4 }));
check("repetición 9 -> 0",           0, fp({ dificultad: "dificil", modalidad: "exploratoria", repeticionesPrevias: 9 }));

// --- Combinaciones: los tres factores se multiplican ---
// 90 * 0.8 (aciertos) = 72 -> *0.6 (rápido) = 43.2 -> *0.2 (repetición) = 8.64 -> redondea 9
check("experto evaluativa 80% + rápido + 1 repetición = 9", 9,
  calcularFP({ dificultad: "experto", modalidad: "evaluativa", aciertos: 0.8, duracionMs: 10, repeticionesPrevias: 1 }).fp);

// --- Caso real conectado: Iceberg, exploratoria fácil, primera vez, sin prisa ---
check("Iceberg (exploratoria/fácil/1ª vez) = 10", 10,
  calcularFP({ dificultad: "facil", modalidad: "exploratoria", duracionMs: 60_000, repeticionesPrevias: 0 }).fp);

// --- Entradas inválidas deben fallar ruidosamente ---
try { calcularFP({ dificultad: "imposible", modalidad: "exploratoria" }); check("dificultad inválida lanza", true, false); }
catch { check("dificultad inválida lanza", true, true); }
try { calcularFP({ dificultad: "facil", modalidad: "inventada" }); check("modalidad inválida lanza", true, false); }
catch { check("modalidad inválida lanza", true, true); }

console.table(filas);
console.log(fallos === 0 ? `\nTodas las reglas PASAN (${filas.length} chequeos).` : `\n${fallos} FALLAN.`);
process.exit(fallos === 0 ? 0 : 1);
