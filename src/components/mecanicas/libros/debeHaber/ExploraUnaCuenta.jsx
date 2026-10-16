import { useState } from "react";
import { FAE } from "../../../../theme.js";
import { DEBE, HABER, pesos } from "../../../../data/contabilidad.js";
import { PIEZA_DEBE_Y_HABER, CUENTAS_DE_LA_EXPLORACION } from "../../../../data/contabilidadDebeHaber.js";
import { cuentaExplorable } from "../../../../contabilidad/debeHaber.js";
import { cancelacion } from "../../../../contabilidad/cancelacion.js";
import { CuentaDeValor, Ficha, FichaEnVuelo, EstilosDeVerbos, useArrastre } from "../verbos.jsx";
import { TONO_ROTULO, MarcadorDeSaldo } from "./piezasDebeHaber.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CAPA 3 · «AHORA PRUEBE USTED».
 *
 * UNA sola cuenta a la vez, con su ▲ siempre visible, y fichas que se sueltan
 * en cualquiera de los dos lados. La ficha NO se duplica: cae en una cuenta y
 * en ninguna más.
 *
 * ═══════════ LOS DOS AVISOS QUE NO SE QUITAN ═══════════
 *
 * El primero está porque la pieza enseña una cuenta por dentro, y una cuenta
 * por dentro es media contabilidad: sin el aviso, el estudiante sale creyendo
 * que una operación toca una sola cuenta.
 *
 * El segundo está porque la regla del capítulo dice QUÉ pasa con gastos e
 * ingresos pero no POR QUÉ, y sin el porqué el estudiante memoriza otra fila
 * más — que es exactamente el hábito que esta pieza viene a romper.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const E = PIEZA_DEBE_Y_HABER.exploracion;

const AVISO = {
  margin: "10px 0 0", padding: "9px 11px", borderRadius: "11px",
  fontSize: "12px", lineHeight: 1.5, color: "rgba(248,249,250,0.7)",
  background: "rgba(61,90,128,0.16)", border: "1px solid rgba(61,90,128,0.5)",
};

export default function ExploraUnaCuenta() {
  const [nombre, setNombre] = useState(CUENTAS_DE_LA_EXPLORACION[0]);
  const [debitos, setDebitos] = useState([]);
  const [creditos, setCreditos] = useState([]);
  const [ultima, setUltima] = useState(null);

  const ficha = cuentaExplorable(nombre);

  /* El saldo de partida entra como un movimiento más, del lado que le toca. */
  const inicial = ficha.inicial.valor > 0
    ? [{ valor: ficha.inicial.valor }]
    : [];
  const enDebe = [...(ficha.inicial.lado === DEBE ? inicial : []), ...debitos];
  const enHaber = [...(ficha.inicial.lado === HABER ? inicial : []), ...creditos];
  const c = cancelacion(enDebe, enHaber);

  const arrastre = useArrastre({
    onSoltar: (valor, destino) => {
      if (destino === DEBE) setDebitos((xs) => [...xs, { valor }]);
      else if (destino === HABER) setCreditos((xs) => [...xs, { valor }]);
      else return;
      setUltima(valor);
    },
  });

  const vaciar = () => { setDebitos([]); setCreditos([]); setUltima(null); arrastre.limpiar(); };
  const cambiarCuenta = (n) => { setNombre(n); vaciar(); };

  const tocado = debitos.length > 0 || creditos.length > 0;

  /*
   * ═══════════ EL TECLADO NO ES UN CAMINO DE SEGUNDA ═══════════
   *
   * Con una ficha tomada, ← la suelta en el debe y → en el haber. Es el mismo
   * gesto que arrastrar, dicho con las dos teclas que ya significan izquierda
   * y derecha — que es, literalmente, lo que esta pieza enseña que son el
   * debe y el haber.
   */
  const alTeclear = (e) => {
    if (arrastre.tomada == null) return;
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    arrastre.soltarEn(e.key === "ArrowLeft" ? DEBE : HABER);
  };

  /* En el selector, ↑ y ↓ recorren las cuatro cuentas, como un grupo de radio. */
  const alTeclearSelector = (e) => {
    const cuales = CUENTAS_DE_LA_EXPLORACION;
    const k = cuales.indexOf(nombre);
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      cambiarCuenta(cuales[(k + 1) % cuales.length]);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      cambiarCuenta(cuales[(k - 1 + cuales.length) % cuales.length]);
    }
  };

  return (
    <div data-capa3-debe-haber>
      <EstilosDeVerbos />
      {/*
        El contorno de foco, en navy y de 2 px, en todo lo enfocable de la
        pieza. El anillo que pone el navegador por defecto se pierde sobre un
        fondo oscuro.
      */}
      <style>{`
        [data-capa3-debe-haber] :focus-visible,
        [data-capa2-debe-haber] :focus-visible,
        [data-capa4-debe-haber] :focus-visible {
          outline: 2px solid #3D5A80;
          outline-offset: 2px;
        }
      `}</style>

      {/* El selector: cuatro cuentas, una familia cada una. */}
      <div role="radiogroup" aria-label="Cuenta a explorar" onKeyDown={alTeclearSelector} style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "7px", marginBottom: "12px",
      }}>
        {CUENTAS_DE_LA_EXPLORACION.map((n) => {
          const f = cuentaExplorable(n);
          const elegida = n === nombre;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={elegida}
              data-cuenta-opcion={n}
              onClick={() => cambiarCuenta(n)}
              style={{
                padding: "8px 9px", borderRadius: "10px", cursor: "pointer", textAlign: "left",
                background: elegida ? "rgba(248,249,250,0.07)" : "transparent",
                border: `1px solid ${elegida ? FAE.text : "rgba(248,249,250,0.2)"}`,
                color: FAE.text, fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 600,
                lineHeight: 1.25,
              }}
            >
              {n}
              <span style={{
                display: "block", marginTop: "2px", fontSize: "10px", fontWeight: 700,
                letterSpacing: "0.08em", color: TONO_ROTULO[f.triangulo],
              }}>
                ▲ {f.triangulo === DEBE ? "DEBE" : "HABER"}
              </span>
            </button>
          );
        })}
      </div>

      {/*
        La transición al cambiar de cuenta la da React al remontar: el ▲ se
        reubica al lado de la familia nueva porque sale de CRECE_POR, no de
        una lista aparte que hubiera que mantener.
      */}
      <CuentaDeValor
        key={nombre}
        cuenta={nombre}
        debitos={enDebe}
        creditos={enHaber}
        cancelar
        destinos
        tomada={arrastre.tomada}
        onSoltar={arrastre.soltarEn}
        recien={ultima}
        triangulo={ficha.triangulo}
        flechas
        tonoRotulo={TONO_ROTULO}
        alto={118}
      />
      <MarcadorDeSaldo lado={c.lado} cifra={c.saldo} />

      <p style={{
        /* 12 px: es la instrucción del gesto, no un rótulo (kit.md, piso de la letra). */
        margin: "12px 0 8px", fontFamily: "Sora, sans-serif", fontSize: "12px",
        fontWeight: 700, letterSpacing: "0.14em", color: "rgba(248,249,250,0.5)",
      }}>
        {tocado ? "SUELTA MÁS FICHAS DONDE QUIERAS" : E.invitacion.toUpperCase()}
      </p>
      <div onKeyDown={alTeclear} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
        {E.fichas.map((v) => (
          <Ficha
            key={v}
            valor={v}
            lado={ficha.triangulo}
            tomada={arrastre.tomada === v}
            onClick={() => arrastre.tocar(v)}
            gestos={arrastre.gestos(v)}
            etiqueta={`Tomar ${pesos(v)}. Con la ficha tomada, flecha izquierda la suelta en el debe y flecha derecha en el haber.`}
          />
        ))}
      </div>
      <FichaEnVuelo valor={arrastre.tomada ?? 0} lado={ficha.triangulo} puntero={arrastre.puntero} />

      {tocado && (
        <button
          type="button"
          onClick={vaciar}
          style={{
            marginTop: "9px", width: "100%", padding: "8px", borderRadius: "999px", cursor: "pointer",
            background: "transparent", border: "1px solid rgba(248,249,250,0.22)",
            color: "rgba(248,249,250,0.7)", fontFamily: "Sora, sans-serif", fontSize: "12.5px",
          }}
        >
          Volver al inicio
        </button>
      )}

      <p data-aviso-contrapartida style={AVISO}>{E.avisoContrapartida}</p>
      <p data-linea-gastos style={AVISO}>{E.lineaGastosIngresos}</p>
    </div>
  );
}
