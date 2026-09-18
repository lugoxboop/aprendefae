import { useId } from "react";
import { ajustarAlTamano, combinacionDe, computeAvatarProps, leyenda } from "../../avatar/generador.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL AVATAR, DIBUJADO.
 *
 * Diez capas en un orden fijo —el del kit— sobre un viewBox de 200×200. Todo lo
 * que decide qué se pinta sale de computeAvatarProps(); aquí no hay ni una
 * regla de aspecto propia, salvo el retiro del halo y las cuerdas por debajo de
 * 40 px, que también vive en el generador (ajustarAlTamano).
 *
 * ═══════════ UN ID DE DEGRADADO POR INSTANCIA ═══════════
 *
 * Los ids de <defs> son GLOBALES al documento, no locales al SVG. Con un id
 * fijo, la lista del ranking —doce avatares en una pantalla— pintaría los doce
 * con el degradado del primero: el navegador resuelve url(#g) contra el primer
 * elemento con ese id, sea de otro SVG o no. useId() da uno distinto por
 * instancia montada, y avatar.test.mjs monta tres avatares y comprueba que no
 * comparten ninguno.
 *
 * Los tamaños de uso son 96 (perfil), 56 (superficies medianas) y 36 y 24
 * (ranking y liga), estos dos ya por debajo del umbral de detalle.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const TAMANOS = { perfil: 96, medio: 56, ranking: 36, liga: 24 };

/**
 * @param {object} p
 * @param {string} [p.forma]    clave de SHAPES
 * @param {string} [p.paleta]   clave de PALETTES ('comparacion' solo desde el selector)
 * @param {number} [p.nivel]    1-4
 * @param {object} [p.perfil]   alternativa a los tres de arriba: la fila del perfil
 * @param {number} [p.tamano]   px del lado
 * @param {string} [p.titulo]   texto accesible; sin él, el avatar es decorativo
 */
export default function Avatar({
  forma, paleta, nivel, perfil = null, tamano = TAMANOS.perfil, titulo = null, style = null, ...resto
}) {
  const base = perfil ? combinacionDe(perfil) : null;
  const f = forma ?? base?.forma ?? "decaedro";
  const pal = paleta ?? base?.paleta ?? "nocturno";
  const niv = nivel ?? base?.nivel ?? 1;

  const bruto = computeAvatarProps(f, pal, niv);
  const a = ajustarAlTamano(bruto, tamano);

  /* Los dos ids, distintos por instancia. El de React trae dos puntos: fuera. */
  const semilla = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const idCuerpo = `av-${semilla}-cuerpo`;
  const idBrillo = `av-${semilla}-brillo`;

  return (
    <svg
      viewBox="0 0 200 200"
      width={tamano}
      height={tamano}
      role={titulo ? "img" : undefined}
      aria-hidden={titulo ? undefined : "true"}
      aria-label={titulo ?? undefined}
      data-avatar={`${f}-${pal}-${niv}`}
      style={{ display: "block", overflow: "visible", ...(style ?? {}) }}
      {...resto}
    >
      <defs>
        <linearGradient id={idCuerpo} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={a.c1} />
          <stop offset="100%" stopColor={a.c2} />
        </linearGradient>
        {a.showGloss && (
          <radialGradient id={idBrillo} cx="30%" cy="24%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        )}
      </defs>

      {/* 2. el halo del nivel IV: dos anillos concéntricos, fuera de la figura */}
      {a.showHalo && (
        <g data-halo>
          <circle cx="100" cy="100" r="96" fill="none" stroke={a.ring} strokeOpacity="0.4" strokeWidth="1" />
          <circle cx="100" cy="100" r="91" fill="none" stroke={a.ring} strokeOpacity="0.16" strokeWidth="3.5" />
        </g>
      )}

      {/* 3. el cuerpo */}
      <polygon
        data-cuerpo
        points={a.pts}
        fill={a.bodyFill ? `url(#${idCuerpo})` : "none"}
        stroke={a.stroke}
        strokeWidth={a.sw}
        strokeLinejoin="round"
      />

      {/* 4. las facetas del facetado (nivel III y IV) */}
      {a.facets.map((c, i) => (
        <polygon key={`f${i}`} points={c.pts} fill="#FFFFFF" fillOpacity={c.op} />
      ))}

      {/* 5. las cuerdas internas (nivel IV, y solo a 40 px o más) */}
      {a.chords.map((c, i) => (
        <line key={`c${i}`} data-cuerda x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} stroke={a.chordColor} opacity="0.3" strokeWidth="0.7" />
      ))}

      {/* 6. los radios desde el centro (desde el nivel II) */}
      {a.spokes.map((s, i) => (
        <line key={`r${i}`} x1="100" y1="100" x2={s.x} y2={s.y} stroke={a.chordColor} opacity="0.34" strokeWidth="0.9" />
      ))}

      {/* 7. el polígono interior */}
      <polygon
        points={a.insetPts}
        fill={a.insetFill}
        stroke={a.insetStroke}
        strokeOpacity={a.insetOp}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />

      {/* 8. el lustre del nivel IV, por encima de la geometría y debajo de los nodos */}
      {a.showGloss && <polygon points={a.pts} fill={`url(#${idBrillo})`} />}

      {/* 9. los nodos de cada vértice */}
      {a.nodes.map((n, i) => (
        <circle key={`n${i}`} cx={n.x} cy={n.y} r={n.r} fill={a.node} />
      ))}

      {/* 10. el núcleo */}
      {a.showCore && <circle cx="100" cy="100" r={a.coreR} fill={a.node} />}
    </svg>
  );
}

/** El avatar de un perfil, con su combinación dicha en texto para lectores de pantalla. */
export function AvatarDePerfil({ perfil, tamano = TAMANOS.perfil, ...resto }) {
  const c = combinacionDe(perfil);
  return <Avatar {...c} tamano={tamano} titulo={`Tu avatar: ${leyenda(c)}`} {...resto} />;
}
