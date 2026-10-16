import { HOJA_N3, EJEMPLO_N3 } from "../../../../data/contabilidadT5_n3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N3 · LA HOJA DE REVISIÓN (la figura que crece, C8) Y EL EJEMPLO
 * RESUELTO («Así se juega»).
 *
 * PROVISIONAL PARA WATARI: la forma es suya y todavía no llega. Esta es una
 * versión funcional y sobria con los tonos del kárdex de T7-2 (navy, texto
 * claro, gris azulado, rayas finas). Sin teal ni ámbar.
 *
 * La hoja: una tabla de dos columnas, «Caso» y «Acción» (la D de Near), que
 * gana una fila con cada caso resuelto: el caso y la acción que le hacía
 * falta. Empieza sin filas. El orden fijo de Mello (N3-4) evita que dos
 * casos con la misma acción queden seguidos.
 *
 * El ejemplo: el caso del fondo fiduciario ya resuelto, con su acción y su
 * nota. No se toca ni da puntos; sale encima del primer caso.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const P = { texto: "#F8F9FA", texto2: "#A8B6C8", borde: "#B8C4D4", raya: "#33445E" };

const CSS = `
.n3hj { width: 100%; border-collapse: collapse; table-layout: fixed; font-family: "Inter", sans-serif; color: ${P.texto}; }
.n3hj th { font: 500 12px/1.3 "Inter", sans-serif; color: ${P.texto2}; text-align: left; padding: 4px 6px 6px; border-bottom: 1px solid ${P.borde}; }
.n3hj th:first-child { width: 62%; }
.n3hj td { font: 400 13px/1.45 "Inter", sans-serif; vertical-align: top; padding: 8px 6px; border-bottom: 1px solid ${P.raya}; overflow-wrap: break-word; }
.n3hj td:last-child { font-weight: 600; }
.n3ej { margin: 0 0 12px; padding: 10px 12px; border-radius: 11px; border: 1px dashed rgba(184,196,212,0.45); }
.n3ej-rot { margin: 0 0 4px; font: 700 12px/1.3 "Sora", "Inter", sans-serif; letter-spacing: .08em; color: ${P.texto2}; text-transform: uppercase; }
.n3ej p { margin: 0; font: 400 14px/1.45 "Inter", sans-serif; color: ${P.texto}; }
.n3ej-resp { display: flex; align-items: center; gap: 8px; margin: 6px 0 !important; font-weight: 600 !important; }
.n3ej-nota { color: ${P.texto2} !important; font-size: 13px !important; }
`;

/** items: los casos en su orden; resueltos: los ids ya resueltos. */
export default function HojaRevisionN3({ items, resueltos }) {
  const filas = items.filter((it) => resueltos.includes(it.id));
  return (
    <div data-hoja-n3>
      <style>{CSS}</style>
      <table className="n3hj">
        <thead><tr><th scope="col">{HOJA_N3.caso}</th><th scope="col">{HOJA_N3.accion}</th></tr></thead>
        <tbody>
          {filas.map((it) => (
            <tr key={it.id} data-fila={it.id}>
              <td data-celda="caso">{it.pregunta}</td>
              <td data-celda="accion">{it.correcta}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* El ejemplo resuelto, solo sobre el primer caso. */
export function EjemploN3({ i }) {
  if (i !== 0) return null;
  return (
    <section className="n3ej" data-ejemplo-n3 aria-label={EJEMPLO_N3.rotulo}>
      <style>{CSS}</style>
      <p className="n3ej-rot" aria-hidden="true">{EJEMPLO_N3.rotulo}</p>
      <p data-ejemplo-pregunta>{EJEMPLO_N3.pregunta}</p>
      <p className="n3ej-resp" data-ejemplo-respuesta>
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" style={{ flexShrink: 0 }}>
          <circle cx="9" cy="9" r="7.5" fill="none" stroke={P.texto} strokeWidth="2" />
          <path d="M5.4 9.3 L7.9 11.7 L12.6 6.6" fill="none" stroke={P.texto} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{EJEMPLO_N3.correcta}</span>
      </p>
      <p className="n3ej-nota" data-ejemplo-nota>{EJEMPLO_N3.nota}</p>
    </section>
  );
}
