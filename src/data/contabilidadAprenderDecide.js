/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS DECISIONES DE LA CAPA 4 · «LAS CUENTAS, EL DEBE Y EL HABER».
 *
 * Datos puros, sin React: los pinta CapaCuatroDecide.jsx. Cada pieza trae DOS
 * decisiones de tipo distinto sobre el MISMO caso —una de clasificación y una
 * de consecuencia— porque la misma pregunta sobre otro caso no es una
 * decisión distinta (lectura estricta de D4, Miku 17-oct).
 *
 * `estado(eleccion)` devuelve lo que la figura tiene que mostrar DESPUÉS de
 * esa elección, incluida la mala: el estudiante ve lo que su respuesta
 * implica antes de que le digan si estuvo bien.
 *
 * Cada opción mala lleva su propio `msg`, atado a un error conceptual
 * distinto. No hay un «No va aquí» genérico: si el mensaje no explica cuál
 * confusión delata la opción, la opción está mal escrita.
 *
 * CERO FP: material teórico. Nada de esto llama a registrar_fp.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ───────── 1 · De qué está hecha una cuenta ─────────
 * El caso es el de la pregunta que esta capa ya hacía: movimiento débito de
 * $50, crédito de $30. Primero de qué lado queda el saldo (clasificación);
 * después cuánto es (consecuencia). La figura es la misma cuenta en los dos
 * pasos, y cambia: primero se enciende un lado, después aparece el saldo.
 */
const CASO_A1 = { cuenta: "Una cuenta cualquiera", debitos: [{ valor: 50 }], creditos: [{ valor: 30 }] };

export const DECIDE_A1 = {
  id: "cu-a1-anatomia-de-una-cuenta",
  inicial: { ...CASO_A1, cancelar: false, lado: null },
  decisiones: [
    {
      clave: "lado",
      pregunta: "Esta cuenta tiene movimiento débito de $50 y movimiento crédito de $30. ¿De qué lado queda el saldo?",
      opciones: [
        { id: "debe", t: "En el debe, a la izquierda", correcta: true },
        { id: "haber", t: "En el haber, a la derecha",
          msg: "El saldo no se coloca del lado del movimiento menor. Va del lado que pesó más, y aquí pesó más el débito: $50 contra $30." },
        { id: "cero", t: "En ninguno: la cuenta queda en cero",
          msg: "Los dos movimientos tendrían que ser iguales para cancelarse. $50 contra $30 deja diferencia, y esa diferencia es el saldo." },
      ],
      porque: "El saldo se coloca del lado que tuvo el movimiento mayor, y aquí el mayor es el débito.",
      pista: "Compare los dos movimientos y quédese con el lado del más grande. No importa todavía cuánto es.",
      /*
       * «Queda en cero» no puede dejar la figura igual que estaba: sería la
       * única elección sin consecuencia visible. Así que se cancela de verdad
       * delante del estudiante, y lo que ve contradice lo que dijo: quedan
       * $20 en pie. Las otras dos encienden el lado que eligió.
       */
      estado: (eleccion) => (eleccion === "cero"
        ? { ...CASO_A1, cancelar: true, lado: null }
        : { ...CASO_A1, cancelar: false, lado: eleccion }),
    },
    {
      clave: "cuanto",
      pregunta: "Ya sabe de qué lado. ¿Cuánto es el saldo?",
      opciones: [
        { id: "20", t: "$20", correcta: true },
        { id: "80", t: "$80",
          msg: "Eso es la suma de los dos movimientos. El saldo es la diferencia, no la suma: por eso un lado consume al otro." },
        { id: "50", t: "$50",
          msg: "Ése es el movimiento débito entero, como si el crédito no existiera. Los $30 de la derecha ya consumieron su parte." },
      ],
      porque: "$50 menos $30. La diferencia entre los dos movimientos, del lado del mayor.",
      pista: "Reste el movimiento menor del mayor. Mire la figura: lo que queda en pie después de cancelar.",
      estado: (eleccion) => ({ ...CASO_A1, cancelar: eleccion === "20", lado: "debe" }),
    },
  ],
  cierre: "Eso es todo lo que hace una cuenta: dos lados, dos movimientos y una diferencia que se queda del lado que pesó más.",
};

export const DECIDE_POR_PIEZA = {
  [DECIDE_A1.id]: DECIDE_A1,
};
