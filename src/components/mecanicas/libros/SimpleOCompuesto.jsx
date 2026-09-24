import { useEffect, useState } from "react";
import { barajar } from "../../../utils/barajar.js";
import { porcentaje } from "../../../data/politicaFiscal.js";
import { SIMPLE_O_COMPUESTO } from "../../../data/contabilidadActividades.js";
import { Opcion, Opciones, Retro, Pulsos, Cierre, Enunciado } from "../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../bloques/marcos.jsx";
import { Responder, useTanda } from "./piezas.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CU-7 · ¿SIMPLE O COMPUESTO? — Análisis · Difícil.
 *
 * Una transacción y dos preguntas: qué clase de asiento es y cuántas cuentas
 * toca. Seis por partida, dos decisiones cada una: doce.
 *
 * ═══════════ POR QUÉ SE PREGUNTA TAMBIÉN EL NÚMERO ═══════════
 *
 * Porque «simple o compuesto» se puede acertar por instinto —«suena
 * complicado, será compuesto»— y contar no. El número es la prueba de que se
 * hizo el trabajo, y es donde se rompe la trampa del capítulo: tres socios que
 * aportan a la misma cuenta de patrimonio siguen siendo DOS cuentas. Quien
 * conteste «compuesto, 3» ahí está contando gente.
 *
 * Las dos preguntas se responden juntas y se corrigen juntas, pero cuentan por
 * separado: acertar la clase y errar el número deja constancia de las dos
 * cosas en el detalle del docente, `<item>:clase` y `<item>:cuentas`.
 *
 * ═══════════ EL NÚMERO SE OFRECE, NO SE ESCRIBE ═══════════
 *
 * Son dos, tres o cuatro cuentas y nunca más —lo dice el banco entero—, así
 * que tres botones dicen la verdad y le ahorran a un estudiante en el bus
 * abrir el teclado para escribir un dígito.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** Los números que el banco usa de verdad, en orden. Ni inventados ni fijos. */
export const NUMEROS = [...new Set(SIMPLE_O_COMPUESTO.items.map((i) => i.cuentas))].sort((a, b) => a - b);

/*
 * La devolución sale de la ficha y se elige por lo que el estudiante hizo:
 *
 *   clase mal, y dijo «compuesto» contando personas   compuestoPorPersonas
 *   clase mal, y era compuesto de verdad              simpleSiendoCompuesto
 *   clase bien y número mal                           numeroEquivocado
 *
 * PENDIENTE DE GEN — `reglaGeneral` SE QUEDA SIN USAR. Es el cuarto texto de
 * error de la ficha: «un asiento compuesto sigue cumpliendo la partida doble;
 * lo que cuadra son los totales, no el número de cuentas». Dice algo distinto
 * de `simpleSiendoCompuesto`, pero las dos responden exactamente al mismo
 * error del estudiante —dijo simple y era compuesto— y desde lo que él tocó no
 * hay forma de saber cuál de las dos confusiones tuvo. Elegir una por mi
 * cuenta, o pegar las dos, sería decidir contenido. Queda reportado.
 */
export function retroDe(item, clase, cuentas) {
  const claseOk = clase === item.categoria;
  const cuentasOk = cuentas === item.cuentas;
  const e = SIMPLE_O_COMPUESTO.errores;

  let texto;
  if (claseOk && cuentasOk) {
    texto = item.acierto;
  } else if (!claseOk && clase === "compuesto") {
    /* Dijo compuesto y era simple: la trampa de contar gente en vez de cuentas. */
    texto = e.compuestoPorPersonas;
  } else if (!claseOk) {
    texto = e.simpleSiendoCompuesto;
  } else {
    texto = e.numeroEquivocado.replace("{cuentas}", String(item.cuentas));
  }
  return { texto, claseOk, cuentasOk };
}

export default function SimpleOCompuesto({ Marco, rotulo, titulo, acento, onCompletar }) {
  const sortear = () => barajar(SIMPLE_O_COMPUESTO.items).slice(0, SIMPLE_O_COMPUESTO.porPartida);
  const t = useTanda(sortear);

  const [clase, setClase] = useState(null);
  const [cuentas, setCuentas] = useState(null);
  const [retro, setRetro] = useState(null);

  const item = t.items[t.i];
  const decisiones = t.items.length * 2;
  const pct = porcentaje(t.aciertos, decisiones);

  useEffect(() => {
    if (t.terminado) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);

  const responder = () => {
    if (retro || !clase || !cuentas) return;
    const r = retroDe(item, clase, cuentas);
    t.anotar(`${item.id}:clase`, r.claseOk, r.claseOk ? null : clase);
    t.anotar(`${item.id}:cuentas`, r.cuentasOk, r.cuentasOk ? null : String(cuentas));
    t.setAciertos((n) => n + (r.claseOk ? 1 : 0) + (r.cuentasOk ? 1 : 0));
    setRetro(r);
  };

  const avanzar = () => {
    setRetro(null); setClase(null); setCuentas(null);
    if (t.i + 1 < t.items.length) t.setI(t.i + 1);
    else t.setTerminado(true);
  };

  const reiniciar = () => { t.reiniciar(); setRetro(null); setClase(null); setCuentas(null); };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>{t.aciertos} de {decisiones} respuestas bien — clase y número de cuentas de seis transacciones.</p>
        </Cierre>
      </Marco>
    );
  }

  const rotuloPregunta = {
    margin: "16px 0 8px", fontFamily: "Sora, sans-serif", fontSize: "10.5px",
    fontWeight: 700, letterSpacing: "0.16em", color: acento,
  };

  /*
   * El mismo vocabulario visual que el resto del sitio: la buena se marca
   * `correcta` si se eligió y `revelada` —«era esta»— si no; la que se tocó
   * estando mal, `incorrecta`.
   */
  const estadoDe = (elegida, valor, correcto) => {
    if (!retro) return elegida === valor ? "elegida" : null;
    if (valor === correcto) return elegida === correcto ? "correcta" : "revelada";
    if (valor === elegida) return "incorrecta";
    return null;
  };

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={t.items.length} hechos={t.i + (retro ? 1 : 0)} etiqueta="Transacción" />
      </div>

      <Enunciado rotulo="LA TRANSACCIÓN" acento={acento}>{item.enunciado}</Enunciado>

      <p style={rotuloPregunta}>¿QUÉ CLASE DE ASIENTO ES?</p>
      <Opciones columnas="repeat(auto-fit, minmax(150px, 1fr))">
        {SIMPLE_O_COMPUESTO.categorias.map((c) => (
          <Opcion
            key={c.id}
            ancho
            deshabilitada={Boolean(retro)}
            onClick={() => setClase(c.id)}
            estado={estadoDe(clase, c.id, item.categoria)}
          >
            {c.nombre}
          </Opcion>
        ))}
      </Opciones>

      <p style={rotuloPregunta}>¿CUÁNTAS CUENTAS TOCA?</p>
      {/*
        Rejilla propia y no `Opciones`, que impone un piso de 170 px por
        columna. Ese piso existe para que un texto largo no salga en tres
        renglones, y tiene razón — pero un dígito no es un texto largo: con él,
        «2», «3» y «4» ocupaban tres filas enteras del teléfono para decir tres
        caracteres, y empujaban la devolución fuera de la pantalla.
      */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${NUMEROS.length}, 1fr)`, gap: "10px", marginTop: "14px" }}>
        {NUMEROS.map((n) => (
          <Opcion
            key={n}
            ancho
            deshabilitada={Boolean(retro)}
            onClick={() => setCuentas(n)}
            estado={estadoDe(cuentas, n, item.cuentas)}
          >
            {n}
          </Opcion>
        ))}
      </div>

      {retro && <Retro texto={retro.texto} />}

      {!retro
        ? <Responder onClick={responder} deshabilitado={!clase || !cuentas}>Responder</Responder>
        : (
          <Responder onClick={avanzar}>
            {t.i + 1 === t.items.length ? "Ver resultado" : "Siguiente transacción"}
          </Responder>
        )}

      {!retro && (!clase || !cuentas) && (
        <p style={{ margin: "9px 0 0", fontSize: "12.5px", color: "rgba(248,249,250,0.45)", textAlign: "center" }}>
          Responde las dos: la clase y el número de cuentas.
        </p>
      )}
    </Marco>
  );
}
