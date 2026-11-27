/*
 * Gestión de Proyectos · GP-04 «La grieta que manda» (gp04-grieta-que-manda).
 * Una idea: los proyectos nacen de factores que empujan a la organización; la guía
 * los agrupa en cuatro categorías (G p. 9–10): requisitos regulatorios, legales o
 * sociales; peticiones de los interesados; estrategias de negocio o tecnológicas;
 * crear, mejorar o reparar productos, procesos o servicios.
 * Decisión (27-nov): el video NO empareja cada caso con un factor (las «X» de la
 * Tabla 1-1 no se pueden verificar en el texto extraído); lo hace el estudiante.
 */
import { Mascota, Sombra, Placa, Globo, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Destello, Pizarra, Tiza, TrazoTiza, Flecha, Pan, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Local, Tachon, Puente, Grieta, Precio, Documento, Ficha, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.35, 0.35, 0.3, 0.3, 0.3, 0.3, 0.35, 0.35, 0.3, 0.3, 0.35, 0.4] });
const { S, E, W } = T;

const M = {
  gerente: W(1, "gerente.", 0.45), decide2: W(1, "decide", 0.7, 1), grieta: W(1, "grieta.", 0.95),
  puente2: W(2, "puente", 0.2), grietas: W(2, "grietas;", 0.45), municipio: W(2, "municipio", 0.65), repararlo: W(2, "repararlo.", 0.95),
  enfrente: W(3, "enfrente", 0.55), baja: W(3, "baja", 0.75), precios: W(3, "precios.", 0.95),
  costos: W(4, "costos,", 0.5), pierde: W(4, "pierde", 0.75), clientes: W(4, "clientes.", 0.95),
  vecinos: W(5, "vecinos", 0.3), gluten: W(5, "gluten.", 0.95),
  norma: W(6, "norma", 0.25), exige: W(6, "exige", 0.45), etiquetar: W(6, "etiquetar", 0.6), vende6: W(6, "vende.", 0.95),
  cuatro7: W(7, "Cuatro", 0.1), empujones: W(7, "empujones", 0.25), nacer: W(7, "nacer", 0.8), proyecto7: W(7, "proyecto.", 0.95),
  guia: W(8, "guía", 0.2), factores: W(8, "factores.", 0.95),
  legales: W(9, "legales", 0.25), satisfacer: W(9, "Satisfacer", 0.55), interesados: W(9, "interesados.", 0.95),
  estrategia: W(10, "estrategia", 0.25), tecnologia: W(10, "tecnología.", 0.4), crear: W(10, "Crear,", 0.5), productos: W(10, "productos", 0.85),
  detras: W(11, "Detrás", 0.1), varios: W(11, "varios.", 0.95),
  clasifica: W(12, "clasifica:", 0.2), nacer12: W(12, "nacer", 0.7), proyecto12: W(12, "proyecto?", 0.95),
};

const PLANOS = [
  { tipo: "gerente", desde: 0 },
  { tipo: "puente", desde: S(2) - 0.3, entra: "destello" },
  { tipo: "precios", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "vecinos", desde: S(5) - 0.3, entra: "barrido" },
  { tipo: "norma", desde: S(6) - 0.3, entra: "barrido-izq" },
  { tipo: "empujones", desde: S(7) - 0.3, entra: "zoom" },
  { tipo: "pizarra", desde: S(8) - 0.3, entra: "zoom" },
  { tipo: "empujones", desde: S(11) - 0.3, entra: "zoom" },
  { tipo: "cierre", desde: S(12) - 0.25, entra: "zoom" },
];

const CASOS = [["🌉", "la grieta"], ["🏷️", "precios"], ["🌾", "sin gluten"], ["📜", "la norma"]];

/* ═════ 1 · No lo decide el gerente: lo decide una grieta ═════ */
function Gerente({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 960 }, [{ a: 0.2, b: M.grieta - 0.4, s: 1.0, x: 540, y: 968 }]);
  const pG = rampa(t, M.grieta - 0.45, 0.35);
  const temblor = pulso(t, M.grieta - 0.45, 0.5) * 14 * Math.sin(t * 80);
  return (
    <Escena cam={{ ...cam, x: cam.x + temblor }} fondo="art/oficina.jpg">
      {/* el escritorio del gerente */}
      <Mascota esp="zorro-corbata" x={540} y={1440} alto={600} t={t} cara={t > M.grieta - 0.3 ? "triste" : "tranquila"} bd={-70 * pulso(t, 0.3, 1.2)} cab={t > M.grieta - 0.3 ? 6 : 0} semilla={7} />
      <div style={{ position: "absolute", left: 160, top: 1260, width: 760, height: 260, background: "linear-gradient(#8A5A35,#6E4528)", border: `8px solid ${TINTA}`, borderRadius: 18 }} />
      <Placa x={540} y={600} nombre="El gerente" rol="¿decide él?" p={rampa(t, 0.3, 0.35) * (1 - rampa(t, M.grieta - 0.5, 0.3))} color={COLOR.CORAL} />
      <Gigante x={850} y={520} txt="?" p={rampa(t, M.gerente - 0.3, 0.35) * (1 - rampa(t, M.grieta - 0.5, 0.3))} tam={180} giro={10} />
      <Grieta p={pG} grosor={20} puntos={[[-20, 520], [180, 600], [260, 760], [430, 820], [520, 980], [700, 1040], [780, 1240], [960, 1300], [1100, 1440]]} />
      <Cartel x={540} y={420} txt="una grieta" p={rampa(t, M.grieta - 0.2, 0.35)} tam={92} fondo={ROJO} color="#fff" giro={-4} />
    </Escena>
  );
}

/* ═════ 2 · El puente del barrio y el municipio ═════ */
function PuenteEsc({ t }) {
  const cam = mover(t, { s: 1.2, x: 540, y: 1000 }, [{ a: S(2), b: M.grietas + 0.3, s: 1.35, x: 540, y: 1000 }, { a: M.municipio - 0.4, b: E(2), s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/carretera.jpg">
      <Puente x={540} y={980} w={900} avance={1} grietas={rampa(t, M.grietas - 0.4, 0.9)} t={t} />
      {[200, 880].map((x, k) => <Gigante key={x} x={x} y={1180} txt="🚧" p={rampa(t, M.repararlo - 0.6 + k * 0.15, 0.35)} tam={130} />)}
      <Cartel x={540} y={480} txt="hay que repararlo" p={rampa(t, M.repararlo - 0.5, 0.35)} tam={70} fondo={MANGO} />
      <Sombra x={800} y={1500} w={240} />
      <Mascota esp="panda-traje" x={lerp(1250, 800, sale(rampa(t, M.municipio - 0.6, 0.6)))} y={1505} alto={460} t={t} cara="tranquila" bd={-60 * pulso(t, M.repararlo - 0.5, 1)} semilla={4} espejo />
      <Placa x={800} y={1000} nombre="Municipio" p={rampa(t, M.municipio - 0.2, 0.35)} color={AZUL} />
    </Escena>
  );
}

/* ═════ 3–4 · La de enfrente baja precios; Pía tiene que bajar costos ═════ */
function Precios({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4) - 0.2, b: E(4), s: 1.05, x: 500, y: 1020 }]);
  const tachar = rampa(t, M.baja - 0.2, 0.3);
  return (
    <Escena cam={cam} fondo="art/calle.jpg">
      <div style={{ position: "absolute", left: 0, top: 0, transform: "scale(.7)", transformOrigin: "780px 1180px" }}>
        <Local x={780} y={1180} w={460} alto={1} toldo={1} letrero={1} nombre="Enfrente" t={t} />
      </div>
      <Precio x={780} y={560} txt="$3.000" p={rampa(t, M.enfrente - 0.3, 0.35)} tachado={tachar} />
      <Precio x={820} y={720} txt="$2.000" p={rampa(t, M.precios - 0.4, 0.35)} fondo={MANGO} giro={6} />
      <Gigante x={960} y={650} txt="↓" p={rampa(t, M.precios - 0.3, 0.35)} tam={160} color={ROJO} />
      <Cartel x={300} y={560} txt="bajar costos" p={rampa(t, M.costos - 0.4, 0.35)} tam={72} fondo={MANGO} giro={-4} />
      <Cartel x={300} y={720} txt="o pierde clientes" p={rampa(t, M.pierde - 0.3, 0.35)} tam={56} fondo={ROJO} color="#fff" giro={3} />
      <Sombra x={280} y={1500} w={260} />
      <Mascota esp="hamster-gorra" x={280} y={1505} alto={520} t={t} cara={t > M.baja ? "triste" : "tranquila"} cab={t > M.baja ? 8 : 0} bi={-60 * pulso(t, M.costos - 0.5, 1.1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 5 · Los vecinos piden pan sin gluten ═════ */
function Vecinos({ t }) {
  const cam = mover(t, { s: 1.05, x: 540, y: 960 }, [{ a: S(5), b: E(5) + 0.3, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg">
      <Globo x={330} y={300} w={640} h={420} p={rampa(t, M.vecinos, 0.4)} cola="izq">
        <div style={{ position: "absolute", left: 0, top: 0, width: 640, height: 420, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 64, color: TINTA, textAlign: "center", lineHeight: 1.15 }}>
          <div>🌾🚫<br />¿pan sin gluten?</div>
        </div>
      </Globo>
      {["conejo", "gato", "huron"].map((esp, k) => {
        const p = rampa(t, M.vecinos - 0.4 + k * 0.15, 0.4);
        if (p <= 0) return null;
        return (
          <div key={esp}>
            <Sombra x={220 + k * 190} y={1500} w={190} />
            <Mascota esp={esp} x={220 + k * 190} y={1505} alto={380 * rebote(Math.min(1, p))} t={t} cara="feliz" bd={-60 * pulso(t, M.gluten - 0.6 + k * 0.1, 0.9)} semilla={k + 2} />
          </div>
        );
      })}
      <Sombra x={900} y={1500} w={220} />
      <Mascota esp="hamster-gorra" x={900} y={1505} alto={440} t={t} cara="tranquila" cab={-8 * pulso(t, M.gluten - 0.4, 1)} semilla={3} espejo />
    </Escena>
  );
}

/* ═════ 6 · La norma nueva: etiquetar todo ═════ */
function Norma({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: M.etiquetar - 0.3, b: E(6) + 0.3, s: 1.08, x: 540, y: 1050 }]);
  const pD = rampa(t, M.norma - 0.4, 0.4);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg">
      <Documento x={540} y={600} w={420} p={pD} titulo="NORMA" sello={rampa(t, M.exige - 0.2, 0.3)} giro={-3} />
      {[0, 1, 2].map((k) => {
        const p = rampa(t, M.etiquetar - 0.2 + k * 0.2, 0.35);
        return (
          <div key={k}>
            <Pan x={260 + k * 280} y={1150} w={240} giro={-6 + k * 6} />
            {p > 0 && <div style={{ position: "absolute", left: 260 + k * 280 - 80, top: 1040, width: 160, height: 92, background: "#fff", border: `6px solid ${TINTA}`, borderRadius: 10, transform: `scale(${rebote(p)}) rotate(${-8 + k * 8}deg)`, fontFamily: "Sora", fontWeight: 800, fontSize: 30, color: TINTA, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", lineHeight: 1.05 }}>ingred.<br />precio</div>}
          </div>
        );
      })}
      <Sombra x={860} y={1500} w={230} />
      <Mascota esp="hamster-gorra" x={860} y={1505} alto={440} t={t} cara={t > M.vende6 - 0.4 ? "triste" : "tranquila"} bd={-60 * pulso(t, M.etiquetar - 0.3, 1.2)} semilla={3} espejo />
    </Escena>
  );
}

/* ═════ 7 y 11 · Cuatro empujones alrededor de un proyecto ═════ */
function Empujones({ t, fin = false }) {
  const t0 = fin ? S(11) : S(7);
  const cam = mover(t, { s: 1.05, x: 540, y: 940 }, [{ a: t0, b: t0 + 1.5, s: 1.0, x: 540, y: 968 }]);
  const pos = [[230, 470], [850, 470], [230, 1230], [850, 1230]];
  const giro = fin ? (t - S(11)) * 0.3 : 0;
  const pCaja = rampa(t, fin ? S(11) - 0.2 : M.nacer - 0.4, 0.4);
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(6px)" velo={0.25}>
      <Destello x={540} y={850} r={360} p={rampa(t, fin ? M.varios - 0.8 : M.nacer - 0.3, 0.9)} />
      {CASOS.map(([ic, txt], k) => {
        const [x0, y0] = pos[k];
        const a = Math.atan2(y0 - 850, x0 - 540) + giro, r = Math.hypot(x0 - 540, y0 - 850) * (fin ? 0.85 : 1);
        const x = 540 + r * Math.cos(a), y = 850 + r * Math.sin(a);
        const p = rampa(t, (fin ? S(11) - 0.2 : M.cuatro7 - 0.3) + k * 0.15, 0.4);
        return (
          <div key={k}>
            <Flecha x0={x} y0={y} x1={lerp(x, 540, 0.5)} y1={lerp(y, 850, 0.5)} p={rampa(t, (fin ? S(11) : M.empujones) + k * 0.12, 0.35)} color={COLOR.CORAL} grosor={20} />
            <Ficha x={x} y={y + 40} w={250} icono={ic} txt={txt} p={p} />
          </div>
        );
      })}
      <Ficha x={540} y={910} w={300} icono="🌱" txt="proyecto" p={pCaja} fondo={MANGO} />
      {fin && <Cartel x={540} y={1480} txt="uno, o varios" p={rampa(t, M.varios - 0.6, 0.35)} tam={70} fondo={CREMA} giro={-2} />}
    </Escena>
  );
}

/* ═════ 8–10 · La guía: cuatro factores ═════ */
function Factores({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10) - 0.2, b: E(10), s: 1.03, x: 540, y: 1010 }]);
  const items = [
    [M.legales - 0.3, "Cumplir requisitos", "legales o sociales"],
    [M.satisfacer - 0.2, "Satisfacer a los", "interesados"],
    [M.estrategia - 0.4, "Cambiar la estrategia", "o la tecnología"],
    [M.crear - 0.2, "Crear, mejorar o reparar", "productos y servicios"],
  ];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.15}>
      <Pizarra x={50} y={200} w={980} h={1290}>
        <Tiza x={460} y={30} txt="4 factores" p={rampa(t, M.factores - 0.6, 0.5)} tam={120} centro color={MANGO} />
        <Tiza x={460} y={170} txt="según la guía" p={rampa(t, M.guia - 0.2, 0.5)} tam={56} centro color="#9FE0B4" />
        {items.map(([t0, a, b], k) => (
          <div key={k}>
            <Tiza x={40} y={290 + k * 230} txt={`${k + 1}.`} p={rampa(t, t0, 0.3)} tam={80} color={MANGO} />
            <Tiza x={120} y={290 + k * 230} txt={a} p={rampa(t, t0, 0.5)} tam={72} />
            <Tiza x={120} y={375 + k * 230} txt={b} p={rampa(t, t0 + 0.35, 0.5)} tam={72} />
          </div>
        ))}
      </Pizarra>
    </Escena>
  );
}

/* ═════ 12 · Ahora clasifica ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(12), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(6px)" velo={0.25}>
      {CASOS.map(([ic, txt], k) => (
        <Ficha key={k} x={170 + k * 247} y={600} w={220} icono={ic} txt={txt} p={rampa(t, M.clasifica - 0.3 + k * 0.12, 0.4)} giro={k % 2 ? 4 : -4} />
      ))}
      <Gigante x={540} y={860} txt="?" p={rampa(t, M.nacer12 - 0.4, 0.35)} tam={200} color={MANGO} giro={-6 + 6 * Math.sin(t * 4)} />
      <Sombra x={540} y={1530} w={300} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={560} t={t} cara="guino" bi={-60 * pulso(t, M.clasifica - 0.4, 1.2)} salto={40 * pulso(t, M.proyecto12 - 0.2, 0.5)} semilla={3} />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gerente") return <Gerente t={t} />;
  if (p.tipo === "puente") return <PuenteEsc t={t} />;
  if (p.tipo === "precios") return <Precios t={t} />;
  if (p.tipo === "vecinos") return <Vecinos t={t} />;
  if (p.tipo === "norma") return <Norma t={t} />;
  if (p.tipo === "empujones") return <Empujones t={t} fin={t > S(11) - 0.5} />;
  if (p.tipo === "pizarra") return <Factores t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(0.3, "pop", 0.35); fx(M.gerente - 0.3, "pop-suave", 0.35); fx(M.grieta - 0.45, "crujido", 0.6); fx(M.grieta - 0.2, "golpe", 0.4);
fx(S(2) - 0.3, "whoosh", 0.4); fx(M.grietas - 0.4, "crujido", 0.45); fx(M.municipio - 0.6, "pasos", 0.35); fx(M.repararlo - 0.6, "toc", 0.35); fx(M.repararlo - 0.45, "toc", 0.35);
fx(S(3) - 0.3, "whoosh", 0.4); fx(M.enfrente - 0.3, "pop", 0.35); fx(M.baja - 0.2, "baja", 0.4); fx(M.precios - 0.4, "pop", 0.4);
fx(M.costos - 0.4, "pop-suave", 0.35); fx(M.pierde - 0.3, "toc-grave", 0.4);
fx(S(5) - 0.3, "whoosh", 0.4); fx(M.vecinos, "burbuja", 0.4); fx(M.gluten - 0.5, "pop-suave", 0.3);
fx(S(6) - 0.3, "whoosh", 0.4); fx(M.norma - 0.4, "papel", 0.4); fx(M.exige - 0.2, "sello", 0.5);
[0, 1, 2].forEach((k) => fx(M.etiquetar - 0.2 + k * 0.2, "pop-suave", 0.3));
fx(S(7) - 0.3, "barrido-lento", 0.35); [0, 1, 2, 3].forEach((k) => fx(M.cuatro7 - 0.3 + k * 0.15, "pop", 0.3)); fx(M.nacer - 0.4, "campana", 0.4);
fx(S(8) - 0.3, "barrido-lento", 0.35); fx(M.guia - 0.2, "tiza", 0.35); fx(M.factores - 0.6, "tiza-larga", 0.4);
[M.legales - 0.3, M.satisfacer - 0.2, M.estrategia - 0.4, M.crear - 0.2].forEach((w) => fx(w, "tiza", 0.35));
fx(S(11) - 0.3, "whoosh", 0.35); fx(M.varios - 0.6, "ding", 0.35);
[0, 1, 2, 3].forEach((k) => fx(M.clasifica - 0.3 + k * 0.12, "pop-suave", 0.3)); fx(E(12) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/oficina.jpg", "art/carretera.jpg", "art/calle.jpg", "art/panaderia.jpg", "art/ciudad.jpg"];
const CLAVE = /^(grieta|grieta\.|factores|factores\.|legales|sociales\.|interesados\.|estrategia|tecnología\.|productos|servicios\.|empujones|proyecto|proyecto\.|proyecto\?)[.,:?…!¡]*$/i;

export const DURACION = T.DURACION_S;
export const GP04 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp04-grieta-que-manda.mp3" sinSonido={sinSonido} />
);
