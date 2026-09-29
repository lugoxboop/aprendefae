import { useEffect, useState } from "react";
import { barajar } from "../../../utils/barajar.js";
import { porcentaje } from "../../../data/politicaFiscal.js";
import { DEBE, HABER, COLOR_LADO, NOMBRE_TIPO, CRECE_POR, pesos } from "../../../data/contabilidad.js";
import { Opcion, Opciones, Retro, Pulsos, Cierre, Enunciado } from "../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../bloques/marcos.jsx";
import { Responder, useTanda } from "./piezas.jsx";
import { CuentaDeValor, EstilosDeVerbos } from "./verbos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PREDECIR LA BARRA — la mecánica de El Cuadro de Dinámicas (CU-3).
 *
 * Una cuenta con un SALDO PREVIO a la vista, una ficha que va a caer del lado
 * que dice el enunciado, y una sola pregunta hecha ANTES de que nada se mueva:
 * ¿sube o baja?
 *
 * ═══════════ PREDECIR Y DESPUÉS VER ═══════════
 *
 * Es el patrón de predicción-revelación, y el orden es lo único que importa.
 * Si la ficha cayera primero, la respuesta estaría en la pantalla y la
 * actividad mediría leer una barra. Preguntando antes, el estudiante tiene que
 * sacar la regla de la cabeza — y después la ve cumplirse o fallar, que es
 * cuando una regla se aprende.
 *
 * ═══════════ EL SALDO PREVIO VIVE DEL LADO NATURAL DE SU FAMILIA ═══════════
 *
 * Siempre, y se deriva de las dos reglas en vez de escribirse: una cuenta de
 * activo con saldo previo al haber sería una cuenta rara, y aquí lo que se
 * enseña es el caso normal. La ficha cae del lado que diga la combinación, y
 * de ahí sale si engorda el saldo o lo consume.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Las dos cifras del rediseño: el saldo que ya está y la ficha que cae. */
export const SALDO_PREVIO = 500;
export const VALOR_FICHA = 200;

export const SUBE = "sube";
export const BAJA = "baja";

export const PREDICCIONES = [
  { id: SUBE, nombre: "Sube" },
  { id: BAJA, nombre: "Baja" },
];

/**
 * El estado de una combinación: dónde vive el saldo previo, de qué lado cae la
 * ficha, y en cuánto queda la cuenta. Todo derivado de las dos reglas.
 */
export function escenaDe(combinacion) {
  const ladoDelSaldo = CRECE_POR[combinacion.tipo];
  const mismoLado = combinacion.lado === ladoDelSaldo;
  return {
    ladoDelSaldo,
    ladoQueCae: combinacion.lado,
    mismoLado,
    /* Cae del mismo lado: engorda. Del contrario: consume. */
    resultado: mismoLado ? SALDO_PREVIO + VALOR_FICHA : SALDO_PREVIO - VALOR_FICHA,
    esperado: mismoLado ? SUBE : BAJA,
  };
}

export default function PredecirLaBarra({ banco, Marco, rotulo, titulo, acento, onCompletar }) {
  const sortear = () => barajar(banco.items).slice(0, banco.porPartida);
  const t = useTanda(sortear);
  const [prediccion, setPrediccion] = useState(null);
  const [retro, setRetro] = useState(null);

  const item = t.items[t.i];
  const escena = escenaDe(item);
  const pct = porcentaje(t.aciertos, t.items.length);

  useEffect(() => {
    if (t.terminado) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);

  const responder = () => {
    if (retro || !prediccion) return;
    const r = banco.evaluar(item, prediccion, escena);
    t.anotar(item.id, r.ok, r.ok ? null : prediccion);
    if (r.ok) t.setAciertos((n) => n + 1);
    setRetro(r);
  };

  const avanzar = () => {
    setRetro(null); setPrediccion(null);
    if (t.i + 1 < t.items.length) t.setI(t.i + 1);
    else t.setTerminado(true);
  };

  const reiniciar = () => { t.reiniciar(); setRetro(null); setPrediccion(null); };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>{t.aciertos} de {t.items.length} predicciones acertadas.</p>
        </Cierre>
      </Marco>
    );
  }

  /*
   * ANTES de responder solo está el saldo previo. DESPUÉS entra la ficha, del
   * lado que dice la combinación, y la cancelación deja en pie el resultado.
   * La ficha no aparece antes por nada del mundo: sería enseñar la respuesta.
   */
  const previo = [{ valor: SALDO_PREVIO }];
  const cae = retro ? [{ valor: VALOR_FICHA }] : [];
  const debitos = escena.ladoDelSaldo === DEBE
    ? (escena.ladoQueCae === DEBE ? [...previo, ...cae] : previo)
    : (escena.ladoQueCae === DEBE ? cae : []);
  const creditos = escena.ladoDelSaldo === HABER
    ? (escena.ladoQueCae === HABER ? [...previo, ...cae] : previo)
    : (escena.ladoQueCae === HABER ? cae : []);

  const rotuloPregunta = {
    margin: "16px 0 8px", fontFamily: "Sora, sans-serif", fontSize: "10.5px",
    fontWeight: 700, letterSpacing: "0.16em", color: acento,
  };

  const estadoDe = (valor) => {
    if (!retro) return prediccion === valor ? "elegida" : null;
    if (valor === escena.esperado) return prediccion === valor ? "correcta" : "revelada";
    if (valor === prediccion) return "incorrecta";
    return null;
  };

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <EstilosDeVerbos />
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={t.items.length} hechos={t.i + (retro ? 1 : 0)} enCurso={t.i + 1} etiqueta="Combinación" />
      </div>

      <Enunciado rotulo="LO QUE VA A PASAR" acento={acento}>
        {`${escena.ladoQueCae === DEBE ? "Un débito" : "Un crédito"} de ${pesos(VALOR_FICHA)} en una cuenta de ${NOMBRE_TIPO[item.tipo]}`}
      </Enunciado>

      <div style={{ marginTop: "14px" }}>
        <CuentaDeValor
          cuenta={`Cuenta de ${NOMBRE_TIPO[item.tipo]}`}
          debitos={debitos}
          creditos={creditos}
          cancelar={Boolean(retro)}
          recien={retro ? VALOR_FICHA : null}
          resaltar={retro ? null : escena.ladoDelSaldo}
        />
      </div>

      {!retro && (
        <p style={{ margin: "10px 0 0", fontSize: "12.5px", color: "rgba(248,249,250,0.5)", textAlign: "center" }}>
          El saldo está en {escena.ladoDelSaldo === DEBE ? "el debe" : "el haber"}, donde vive el de su familia.
        </p>
      )}

      <p style={rotuloPregunta}>ANTES DE QUE CAIGA: ¿LA BARRA SUBE O BAJA?</p>
      <Opciones columnas="repeat(auto-fit, minmax(150px, 1fr))">
        {PREDICCIONES.map((p) => (
          <Opcion
            key={p.id}
            ancho
            deshabilitada={Boolean(retro)}
            onClick={() => setPrediccion(p.id)}
            estado={estadoDe(p.id)}
          >
            {p.nombre}
          </Opcion>
        ))}
      </Opciones>

      {retro && (
        <>
          <p style={{
            margin: "12px 0 0", textAlign: "center",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            fontSize: "14px", fontWeight: 700, color: COLOR_LADO[escena.ladoDelSaldo],
          }}>
            {pesos(SALDO_PREVIO)} → {pesos(escena.resultado)}
          </p>
          <Retro texto={retro.texto} />
        </>
      )}

      {!retro
        ? <Responder onClick={responder} deshabilitado={!prediccion}>Soltar la ficha</Responder>
        : (
          <Responder onClick={avanzar}>
            {t.i + 1 === t.items.length ? "Ver resultado" : "Siguiente"}
          </Responder>
        )}

      {!retro && !prediccion && (
        <p style={{ margin: "9px 0 0", fontSize: "12.5px", color: "rgba(248,249,250,0.45)", textAlign: "center" }}>
          Diga qué va a pasar antes de soltarla.
        </p>
      )}
    </Marco>
  );
}
