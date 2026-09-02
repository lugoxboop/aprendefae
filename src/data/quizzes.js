export const QUIZZES = {
  consumo: [
    {
      question: "Cuando te llega plata extra —un bono, un regalo, un fin de semana trabajado— ¿qué es lo más probable que hagas?",
      options: [
        { id: "a", label: "Gasto absolutamente todo, no dejo nada guardado", correct: false, feedback: "Confunde MPC con gastar el 100% — el error más común del tema." },
        { id: "b", label: "Gasto una parte y guardo el resto", correct: true },
        { id: "c", label: "Guardo todo, no gasto nada", correct: false },
        { id: "d", label: "Depende del clima ese día", correct: false },
      ],
    },
    {
      question: "Un estudiante no tiene ingresos este mes, pero igual paga arriendo y come. ¿De dónde sale ese consumo si no tiene renta?",
      options: [
        { id: "a", label: "Es imposible consumir sin renta", correct: false, feedback: "Ignora que el consumo autónomo es, por definición, independiente de la renta." },
        { id: "b", label: "Existe un consumo autónomo — gasta con ahorros, ayuda familiar o crédito, sin importar si hay renta o no", correct: true },
        { id: "c", label: "Ese gasto no cuenta para la Demanda Agregada", correct: false },
        { id: "d", label: "Solo puede pasar si recibe un subsidio ese mes", correct: false },
      ],
    },
    {
      question: "El gobierno aumenta las transferencias a las familias más pobres. ¿Cómo entra ese dinero en la fórmula del consumo?",
      options: [
        { id: "a", label: "Se trata como un tipo de consumo autónomo aparte", correct: false, feedback: "La trampa clásica — las transferencias no son 'autónomas', entran dentro del paréntesis junto con la renta." },
        { id: "b", label: "No afecta el consumo, solo el ahorro", correct: false },
        { id: "c", label: "Se suma a la renta, como si fuera otro ingreso más, y sobre esa suma total se aplica la MPC", correct: true },
        { id: "d", label: "Solo afecta si la familia decide ahorrarlo", correct: false },
      ],
    },
    {
      question: "Si el gobierno sube los impuestos directos por igual a todos, ¿a quién le golpea más el consumo?",
      options: [
        { id: "a", label: "A quien gana mucho, porque paga más impuestos en pesos", correct: false, feedback: "Confunde 'paga más en pesos absolutos' con 'le afecta más proporcionalmente'." },
        { id: "b", label: "A quien gana poco, porque ya gasta casi toda su renta disponible (MPC más alta)", correct: true },
        { id: "c", label: "A ambos exactamente igual", correct: false },
        { id: "d", label: "A ninguno, los impuestos no tocan el consumo", correct: false },
      ],
    },
    {
      question: "Dos personas reciben el mismo aumento de sueldo. Una tiene MPC = 0.9 y la otra MPC = 0.3. ¿Quién impulsa más el consumo total de la economía?",
      options: [
        { id: "a", label: "La de MPC = 0.3, porque ahorra más y eso fortalece la economía", correct: false, feedback: "Invierte la lógica — más ahorro significa MENOS impulso al consumo, no más." },
        { id: "b", label: "La de MPC = 0.9, porque gasta una proporción mayor de cada peso extra", correct: true },
        { id: "c", label: "Da igual, ambas afectan el consumo por igual", correct: false },
        { id: "d", label: "Ninguna, el consumo no depende de la MPC sino solo de la renta total", correct: false },
      ],
    },
  ],
  inversion: [
    {
      question: "Un emprendedor decide meterle capital a su negocio porque cree firmemente en la idea, sin revisar la tasa de interés. Ese tipo de inversión es:",
      options: [
        { id: "a", label: "Inversión sensible a la tasa de interés", correct: false, feedback: "Justo lo contrario — la inversión autónoma es la que NO depende de la tasa." },
        { id: "b", label: "Inversión autónoma", correct: true },
        { id: "c", label: "Inversión inducida por la renta", correct: false },
        { id: "d", label: "Gasto público disfrazado", correct: false },
      ],
    },
    {
      question: "El Banco de la República baja las tasas de interés. ¿Qué pasa con la decisión de un empresario que quiere pedir crédito?",
      options: [
        { id: "a", label: "Invierte exactamente lo mismo, la tasa no le importa", correct: false },
        { id: "b", label: "Se motiva a pedir más crédito, pero su confianza en el negocio sigue siendo un factor aparte", correct: true },
        { id: "c", label: "Automáticamente duplica su inversión", correct: false, feedback: "Ignora que la parte autónoma de la inversión sigue existiendo, independiente de la tasa." },
        { id: "d", label: "Deja de invertir porque desconfía de tasas bajas", correct: false },
      ],
    },
    {
      question: "Dos empresarios enfrentan la misma subida de tasa. Uno frena su inversión drásticamente, el otro casi ni la mueve. ¿Qué explica la diferencia?",
      options: [
        { id: "a", label: "Uno tiene más plata que el otro", correct: false, feedback: "Mete una variable (riqueza) que no es la que explica la sensibilidad a la tasa." },
        { id: "b", label: "Tienen distinta sensibilidad (elasticidad) a la tasa de interés", correct: true },
        { id: "c", label: "Uno paga más impuestos que el otro", correct: false },
        { id: "d", label: "La diferencia se debe al tipo de cambio, no a la tasa", correct: false },
      ],
    },
    {
      question: "Una empresa reduce su inversión no por la tasa, sino por incertidumbre política. ¿Qué componente de la inversión está afectando esa incertidumbre?",
      options: [
        { id: "a", label: "La parte sensible a la tasa de interés", correct: false, feedback: "Confunde el canal de tasa de interés con el canal de expectativas, que son independientes." },
        { id: "b", label: "La inversión autónoma (expectativas y confianza)", correct: true },
        { id: "c", label: "Ninguno, la incertidumbre no afecta la inversión", correct: false },
        { id: "d", label: "Solo afecta si también sube la tasa de interés", correct: false },
      ],
    },
    {
      question: "Si la tasa sube mucho pero un empresario tiene bajísima sensibilidad a la tasa, ¿qué le pasa a su inversión?",
      options: [
        { id: "a", label: "Cae drásticamente, como a cualquiera", correct: false, feedback: "Asume que todos los empresarios reaccionan igual ante la tasa, ignorando que la sensibilidad varía." },
        { id: "b", label: "Cae poco, porque su inversión depende más de otros factores que de la tasa", correct: true },
        { id: "c", label: "Sube, porque tasas altas siempre motivan a invertir más", correct: false },
        { id: "d", label: "Se vuelve cero automáticamente", correct: false },
      ],
    },
  ],
  gasto: [
    {
      question: "El Gobierno anuncia que construirá más colegios públicos. No le alcanzan los impuestos recaudados. ¿Qué hace?",
      options: [
        { id: "a", label: "Cancela la obra hasta recaudar más", correct: false, feedback: "Es el error central del tema — creer que G está limitado por los ingresos fiscales." },
        { id: "b", label: "Reduce el proyecto a la mitad automáticamente", correct: false },
        { id: "c", label: "Sigue adelante y se endeuda para cubrir la diferencia", correct: true },
        { id: "d", label: "Le pide la plata prestada directamente a los ciudadanos", correct: false },
      ],
    },
    {
      question: "Si la economía crece mucho y el gobierno recauda más de lo esperado, ¿el gasto público sube automáticamente por eso?",
      options: [
        { id: "a", label: "Sí, siempre sube en proporción a lo recaudado", correct: false, feedback: "Confunde una decisión política con una consecuencia automática de recaudar más." },
        { id: "b", label: "No necesariamente — el gobierno decide cuánto gastar, independientemente de cuánto recaude", correct: true },
        { id: "c", label: "Solo sube si lo recaudado supera cierto umbral legal", correct: false },
        { id: "d", label: "Baja, porque ya no necesita gastar tanto", correct: false },
      ],
    },
    {
      question: "¿Cuál frase describe mejor por qué el gasto público se llama \"autónomo\"?",
      options: [
        { id: "a", label: "Porque siempre es la misma cifra cada año", correct: false, feedback: "'Autónomo' no significa constante en el tiempo, significa independiente de otras variables económicas." },
        { id: "b", label: "Porque solo lo controla el Banco de la República", correct: false },
        { id: "c", label: "Porque no está determinado por variables como la renta, la tasa o los impuestos — es una decisión política", correct: true },
        { id: "d", label: "Porque no puede cambiar nunca", correct: false },
      ],
    },
    {
      question: "Un país entra en recesión: caen consumo e inversión privada. ¿Qué suele pasar con el gasto público en ese escenario?",
      options: [
        { id: "a", label: "Cae en la misma proporción que el consumo y la inversión", correct: false, feedback: "Asume que G reacciona igual que C e I ante el ciclo económico, cuando su característica central es justo lo contrario." },
        { id: "b", label: "Puede mantenerse o incluso subir, porque no depende de que caigan los ingresos privados o fiscales", correct: true },
        { id: "c", label: "Desaparece por completo hasta que la economía se recupere", correct: false },
        { id: "d", label: "Se ajusta automáticamente a lo que recaude ese mes", correct: false },
      ],
    },
    {
      question: "¿Qué diferencia principal hay entre cómo gasta una familia y cómo gasta el Estado?",
      options: [
        { id: "a", label: "Ninguna, ambos gastan según lo que ganan ese mes", correct: false },
        { id: "b", label: "La familia está limitada por sus ingresos; el Estado puede gastar más de lo que recauda, endeudándose", correct: true },
        { id: "c", label: "El Estado siempre gasta menos de lo que recauda", correct: false },
        { id: "d", label: "La familia puede endeudarse indefinidamente, el Estado no", correct: false, feedback: "Invierte completamente la lógica de restricción presupuestaria entre ambos actores." },
      ],
    },
  ],
  xn: [
    {
      question: "Un caficultor colombiano vende a EE.UU. El dólar sube fuerte, y el comprador gringo sigue pagando lo mismo en dólares de siempre. ¿Cómo le va al caficultor?",
      options: [
        { id: "a", label: "Le perjudica, ahora sus costos suben", correct: false, feedback: "Confunde el efecto sobre el exportador con el efecto sobre quien importa (son opuestos)." },
        { id: "b", label: "No cambia nada para él", correct: false },
        { id: "c", label: "Le conviene: recibe más pesos por la misma venta en dólares", correct: true },
        { id: "d", label: "Le conviene solo si también sube sus precios en dólares", correct: false },
      ],
    },
    {
      question: "El dólar baja fuertemente. ¿Qué le pasa a alguien que quiere comprar un celular importado?",
      options: [
        { id: "a", label: "Le sale más caro", correct: false, feedback: "Invierte la relación básica entre tipo de cambio bajo y precio de lo importado." },
        { id: "b", label: "Le sale más barato", correct: true },
        { id: "c", label: "No cambia el precio", correct: false },
        { id: "d", label: "Depende solo de la marca del celular", correct: false },
      ],
    },
    {
      question: "Si el dólar sube, ¿qué pasa simultáneamente con las exportaciones (X) y las importaciones (M)?",
      options: [
        { id: "a", label: "Ambas suben", correct: false },
        { id: "b", label: "Ambas bajan", correct: false },
        { id: "c", label: "X sube (exportar es más rentable) y M baja (importar es más caro)", correct: true },
        { id: "d", label: "X baja y M sube", correct: false, feedback: "Invierte completamente ambos efectos del tipo de cambio." },
      ],
    },
    {
      question: 'Un compañero dice: "Si el dólar sube, la economía siempre mejora porque exportamos más." ¿Qué le falta considerar?',
      options: [
        { id: "a", label: "Nada, tiene toda la razón", correct: false },
        { id: "b", label: "Que el dólar alto en realidad reduce las exportaciones", correct: false, feedback: "Invierte la relación correcta entre tipo de cambio y exportaciones." },
        { id: "c", label: "Que también encarece lo importado y no todo lo que sube la DA es automáticamente bueno", correct: true },
        { id: "d", label: "Que el tipo de cambio no afecta para nada la demanda agregada", correct: false },
      ],
    },
    {
      question: "Si Colombia crece mucho este año (sube el PIB), ¿eso significa automáticamente que exportamos más?",
      options: [
        { id: "a", label: "Sí, siempre que crece el PIB suben las exportaciones", correct: false, feedback: "Confunde el motor de XN (tipo de cambio) con el motor de C (renta) — el error de mezclar componentes." },
        { id: "b", label: "No necesariamente — las exportaciones netas dependen principalmente del tipo de cambio, no del nivel de renta del país", correct: true },
        { id: "c", label: "Solo si el crecimiento viene del sector exportador", correct: false },
        { id: "d", label: "Sí, porque más PIB siempre significa un dólar más alto", correct: false },
      ],
    },
  ],
  finalQ1: {
    question: "La economía se pone mala: suben los impuestos, los empresarios pierden confianza y el Banco sube las tasas de interés. ¿Cuál componente de la DA se ve MENOS golpeado?",
    options: [
      { id: "a", label: "Consumo, porque la gente siempre necesita comer", correct: false, feedback: "El consumo SÍ se ve afectado (vía impuestos e ingreso disponible) — solo el autónomo se mantiene, no el total." },
      { id: "b", label: "Inversión, porque los empresarios se adaptan rápido", correct: false },
      { id: "c", label: "Gasto Público, porque no depende de impuestos, confianza ni tasas", correct: true },
      { id: "d", label: "Exportaciones Netas, porque el dólar siempre compensa", correct: false },
    ],
  },
  finalQ2: {
    question: 'Un compañero dice: "Si el dólar sube, la economía siempre mejora porque exportamos más." ¿Qué le falta considerar?',
    options: [
      { id: "a", label: "Nada, tiene toda la razón", correct: false },
      { id: "b", label: "Que el dólar alto en realidad reduce las exportaciones", correct: false, feedback: "Invierte la relación correcta entre tipo de cambio y exportaciones." },
      { id: "c", label: "Que también encarece lo importado (inflación) y no todo lo que sube DA es automáticamente bueno", correct: true },
      { id: "d", label: "Que el tipo de cambio no afecta para nada la demanda agregada", correct: false },
    ],
  },
};
