/*
 * T2 A1 · «¿Lo arregla él o llama al mecánico?» (pe26-a1-mecanico). Una idea: autorregulación frente a
 * intervención externa; la política económica es la intervención del Estado cuando el mercado falla (y el Estado también puede fallar).
 */
import { Mascota, Sombra, Placa, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Obj, Cartel, Gigante, Destello, Flecha, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.35, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.5, 0.4, 0.4, 0.4] });
const { S, E, W, c } = T;

const M = {
  vara: W(1, "vara", 0.3), el: W(1, "él", 0.55), mecanico: W(1, "mecánico", 0.85),
  capo: W(2, "capó", 0.3), tuerca: W(2, "tuerca", 0.55), arranca: W(2, "arranca", 0.9),
  auto: W(3, "autorregulación", 0.2),
  humo: W(4, "humo", 0.2), llama: W(4, "llama", 0.75), grua: W(4, "grúa", 0.9),
  externa: W(5, "intervención", 0.2),
  igual: W(6, "igual", 0.3), solo: W(6, "solo", 0.9),
  sobran: W(7, "sobran", 0.2), baja: W(7, "baja", 0.45), vende: W(7, "vende", 0.85),
  falla: W(8, "falla", 0.25), crisis: W(8, "crisis", 0.4), empleo: W(8, "empleo", 0.9),
  estado: W(9, "Estado", 0.2), politica: W(9, "política", 0.85),
  ojo: W(10, "Ojo", 0.1), equivoca: W(10, "equivoca", 0.4), fallar: W(10, "fallar", 0.9),
  quien: W(11, "quién", 0.5), cuando: W(11, "cuándo", 0.8),
  sigue: S(12) + 0.1,
};

const PLANOS = [
  { tipo: "via", desde: 0 },
  { tipo: "puesto", desde: S(6) - 0.3, entra: "barrido" },
  { tipo: "crisis", desde: S(8) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(11) - 0.3, entra: "zoom" },
];

/* humo: bocanadas que suben desde (x, y) */
function Humo({ t, t0, x, y, color = "#3A3A3A", n = 6 }) {
  if (t < t0) return null;
  return [...Array(n)].map((_, k) => {
    const p = ((t - t0) * 0.6 + k / n) % 1;
    return <div key={k} style={{ position: "absolute", left: x - 60 + 40 * Math.sin(k * 2 + t) * p, top: y - 520 * p, width: 120 + 160 * p, height: 120 + 160 * p, borderRadius: "50%", background: color, opacity: 0.8 * (1 - p), transform: "translate(-20%, -50%)" }} />;
  });
}

/* ═════ 1-5 · El carro varado ═════ */
function Via({ t }) {
  const segunda = t > S(4) - 0.4;
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [
    { a: 0.2, b: E(1), s: 1.15, x: 540, y: 1120 },
    { a: M.arranca - 0.2, b: M.arranca + 0.8, s: 1.0, x: 540, y: 968 },
    { a: S(4) - 0.3, b: S(4) + 0.6, s: 1.15, x: 540, y: 1120 },
    { a: M.grua - 0.5, b: M.grua + 0.6, s: 1.0, x: 540, y: 968 },
  ]);
  /* primera vez: el carro arranca y se va; segunda: vuelve, echa humo y llega la grúa */
  const vase = segunda ? 0 : sale(rampa(t, M.arranca, 1.4));
  const vuelve = segunda ? sale(rampa(t, S(4) - 0.4, 0.8)) : 1;
  const cx = segunda ? lerp(-500, 560, vuelve) : lerp(560, 1500, vase);
  const grua = rampa(t, M.grua - 0.6, 1.2);
  const tira = rampa(t, S(5) + 0.6, 2.5);
  const llave = rampa(t, M.tuerca - 0.3, 0.3) * (1 - rampa(t, M.arranca, 0.3));
  const fin1 = rampa(t, M.auto - 0.1, 0.35) * (1 - rampa(t, S(4) - 0.6, 0.3));
  const fin2 = rampa(t, M.externa - 0.1, 0.35);
  return (
    <Escena cam={cam} fondo="art/carretera.jpg">
      {segunda && <Humo t={t} t0={M.humo - 0.2} x={cx + lerp(0, 600, tira)} y={1200} />}
      {grua > 0 && <Obj src="macro2026/ilustrados/grua.webp" x={lerp(1500, 860, sale(grua)) + 600 * sale(tira)} y={1250} w={560} espejo />}
      <Obj src="macro2026/ilustrados/carro-varado.webp" x={cx + 600 * sale(tira)} y={1330} w={560} giro={vase > 0 ? -2 : 0} />
      <Obj src="macro2026/objetos/llave-inglesa.png" x={cx - 120} y={1180} w={150} giro={-30 + 40 * Math.sin(t * 12)} op={llave} />
      <Sombra x={segunda ? 200 : lerp(300, 200, vase)} y={1690} w={260} />
      <Mascota esp="zorro-corbata" x={segunda ? 200 : lerp(330, 200, vase)} y={1695} alto={520} t={t}
        cara={segunda ? (t > M.grua ? "tranquila" : "triste") : t > M.arranca ? "feliz" : "tranquila"}
        bd={segunda ? -90 * rampa(t, M.llama - 0.3, 0.3) * (1 - rampa(t, M.grua, 0.3)) : -60 * llave}
        salto={segunda ? 0 : 40 * pulso(t, M.arranca + 0.2, 0.5)} semilla={3} />
      {segunda && <Obj src="macro2026/objetos/celular.png" x={250} y={1200} w={90} op={rampa(t, M.llama - 0.3, 0.3) * (1 - rampa(t, M.grua, 0.3))} />}
      <Placa x={220} y={1060} nombre="Bruno" rol="Conductor" p={rampa(t, 0.4, 0.35) * (1 - rampa(t, S(2), 0.3))} />
      <Gigante x={540} y={600} txt="?" p={rampa(t, M.el - 0.2, 0.35) * (1 - rampa(t, S(2) - 0.2, 0.3))} tam={300} giro={8} />
      <Cartel x={540} y={520} txt="Autorregulación" p={fin1} tam={72} fondo={COLOR.VERDE} color="#fff" />
      <Cartel x={540} y={650} txt="se corrige desde adentro" p={fin1 * rampa(t, M.auto + 0.6, 0.35)} tam={46} />
      <Cartel x={540} y={520} txt="Intervención externa" p={fin2} tam={68} fondo={COLOR.CORAL} color="#fff" />
      <Cartel x={540} y={650} txt="alguien de afuera corrige" p={fin2 * rampa(t, M.externa + 0.6, 0.35)} tam={46} />
    </Escena>
  );
}

/* ═════ 6-7 · El mercado se ajusta solo: los mangos de Rufo ═════ */
function Puesto({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1050 }, [{ a: M.vende - 0.5, b: E(7), s: 1.0, x: 540, y: 968 }]);
  const baja = rampa(t, M.baja - 0.2, 0.4);
  const vende = rampa(t, M.vende - 0.4, 1.4);
  const n = Math.round(lerp(9, 0, vende));
  const precio = lerp(3000, 1500, sale(baja));
  return (
    <Escena cam={cam} fondo="art/puesto.jpg">
      <Cartel x={540} y={420} txt="El mercado se ajusta solo" p={rampa(t, M.solo - 0.2, 0.35) * (1 - rampa(t, M.baja, 0.3))} tam={60} fondo={COLOR.VERDE} color="#fff" />
      {[...Array(n)].map((_, k) => <Obj key={k} src="art/mango.png" x={640 + (k % 3) * 95} y={1340 - Math.floor(k / 3) * 70} w={110} giro={k * 17} />)}
      <Cartel x={790} y={1080} txt={"$" + Math.round(precio).toLocaleString("es-CO")} p={rampa(t, M.sobran - 0.3, 0.35)} tam={70} fondo={baja > 0 ? COLOR.VERDE : CREMA} color={baja > 0 ? "#fff" : TINTA} giro={-4} />
      <Gigante x={970} y={1050} txt="↓" p={baja} tam={140} color={COLOR.VERDE} />
      {vende > 0.2 && [0, 1, 2].map((k) => (
        <Mascota key={k} esp={["conejo", "perro", "hamster"][k]} x={lerp(1300, 760 - k * 30, sale(rampa(t, M.vende - 0.6 + k * 0.3, 0.8)))} y={1560} alto={360} t={t} cara="feliz" semilla={k + 4} espejo />
      ))}
      <Sombra x={330} y={1690} w={280} />
      <Mascota esp="huron" x={330} y={1695} alto={520} t={t} cara={vende > 0.8 ? "feliz" : baja > 0 ? "tranquila" : "triste"} bd={-60 * pulso(t, M.baja - 0.2, 0.8)} semilla={1} />
      <Placa x={330} y={1050} nombre="Rufo" rol="Vendedor" p={rampa(t, M.sobran - 0.4, 0.35)} />
      <Cartel x={790} y={1530} txt="¡Vendido!" p={rampa(t, E(7) - 0.4, 0.35)} tam={60} fondo={MANGO} />
    </Escena>
  );
}

/* ═════ 8-10 · La crisis, el Estado como mecánico, y su error ═════ */
function Crisis({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9) - 0.2, b: S(9) + 0.8, s: 1.1, x: 600, y: 1100 }, { a: S(10) - 0.2, b: S(10) + 0.6, s: 1.2, x: 640, y: 1150 }]);
  const nubes = rampa(t, M.crisis - 0.6, 0.8);
  const mei = rampa(t, M.estado - 0.4, 0.9);
  const resbala = pulso(t, M.equivoca - 0.1, 0.8);
  const gente = [[130, "conejo"], [300, "perro"], [470, "gato"]];
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro={`saturate(${1 - 0.6 * nubes}) brightness(${1 - 0.25 * nubes})`}>
      {[0, 1, 2].map((k) => <Obj key={k} src="macro2026/ilustrados/nube-tormenta.webp" x={lerp(-300 + k * 300, 200 + k * 340, sale(nubes))} y={260 + 50 * k + 10 * Math.sin(t * 1.4 + k)} w={420} op={nubes * (1 - 0.6 * rampa(t, M.politica, 1.0))} />)}
      <Cartel x={540} y={520} txt="CRISIS" p={rampa(t, M.crisis - 0.1, 0.35) * (1 - rampa(t, S(9), 0.3))} tam={100} fondo={COLOR.CORAL} color="#fff" giro={-3} />
      <Obj src="macro2026/ilustrados/fabrica.webp" x={860} y={880} w={320} filtro={`grayscale(${nubes})`} />
      <Cartel x={860} y={730} txt="CERRADO" p={rampa(t, M.falla, 0.35)} tam={46} fondo={TINTA} color="#fff" giro={6} />
      {gente.map(([x, esp], k) => (
        <div key={k}>
          <Sombra x={x} y={1690} w={180} />
          <Mascota esp={esp} x={x} y={1695} alto={340} t={t} cara={t > M.politica + 1 ? "tranquila" : "triste"} orejas={-6} semilla={k + 4} />
        </div>
      ))}
      <Cartel x={300} y={1260} txt="sin empleo" p={rampa(t, M.empleo - 0.3, 0.35) * (1 - rampa(t, M.politica + 0.6, 0.3))} tam={52} fondo={CREMA} />
      {mei > 0 && (
        <>
          <Sombra x={lerp(1300, 720, sale(mei))} y={1690} w={280} />
          <Mascota esp="panda-traje" x={lerp(1300, 720, sale(mei))} y={1695} alto={540} t={t} cara={resbala > 0.2 ? "racha" : "feliz"} bd={-70} ladeo={-8 * resbala} semilla={4} espejo />
          <Obj src="macro2026/ilustrados/caja-herramientas.webp" x={lerp(1450, 900, sale(mei))} y={1600} w={200} />
          <Obj src="macro2026/objetos/llave-inglesa.png" x={lerp(1200, 600, sale(mei)) - 200 * resbala} y={1180 - 260 * resbala} w={150} giro={-40 + 300 * resbala} />
          <Placa x={lerp(1300, 720, sale(mei))} y={1040} nombre="El Estado" rol="el mecánico" p={rampa(t, M.estado, 0.35)} />
        </>
      )}
      <Destello x={720} y={1300} r={420} p={rampa(t, M.politica - 0.2, 0.7)} />
      <Cartel x={540} y={520} txt="Política económica" p={rampa(t, M.politica - 0.2, 0.35) * (1 - rampa(t, M.ojo - 0.2, 0.3))} tam={72} fondo={MANGO} />
      <Cartel x={540} y={520} txt="¡El Estado también falla!" p={rampa(t, M.fallar - 0.3, 0.35)} tam={60} fondo={COLOR.CORAL} color="#fff" />
      <Gigante x={480} y={900} txt="¡ups!" p={rampa(t, M.equivoca, 0.3) * (1 - rampa(t, M.fallar - 0.4, 0.3))} tam={140} color={COLOR.CORAL} giro={-8} />
    </Escena>
  );
}

/* ═════ 11-12 · ¿Quién y cuándo? ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 1000 }, [{ a: S(11) - 0.3, b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  const quien = rampa(t, M.quien - 0.2, 0.4), cuando = rampa(t, M.cuando - 0.2, 0.4), sigue = rampa(t, M.sigue, 0.6);
  return (
    <Escena cam={cam} fondo="art/carretera.jpg" filtro="blur(5px)" velo={0.25}>
      <div style={{ opacity: 1 - sigue }}>
        <Cartel x={300} y={700} txt="¿quién?" p={quien} tam={90} fondo={CREMA} giro={-5} />
        <Cartel x={780} y={700} txt="¿cuándo?" p={cuando} tam={90} fondo={MANGO} giro={5} />
        <Obj src="macro2026/ilustrados/caja-herramientas.webp" x={300} y={1000} w={260} esc={rebote(quien)} />
        <Obj src="macro2026/objetos/reloj-arena.png" x={780} y={1000} w={200} esc={rebote(cuando)} giro={180 * rampa(t, M.cuando + 0.4, 0.8)} />
      </div>
      {sigue > 0 && (
        <>
          <Obj src="macro2026/ilustrados/termometro-vidrio.webp" x={540} y={950} w={260} esc={rebote(sigue)} />
          <Cartel x={540} y={560} txt="¿Qué enferma a la economía?" p={rampa(t, M.sigue + 0.3, 0.35)} tam={54} fondo={COLOR.CORAL} color="#fff" />
        </>
      )}
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "via") return <Via t={t} />;
  if (p.tipo === "puesto") return <Puesto t={t} />;
  if (p.tipo === "crisis") return <Crisis t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(0.1, "viento", 0.35); fx(M.vara, "crujido", 0.5); fx(M.el - 0.2, "pop", 0.45);
PLANOS.slice(1).forEach((p) => p.entra?.startsWith("barrido") && fx(p.desde - 0.05, "barrido", 0.35));
fx(M.capo, "golpe", 0.35); fx(M.tuerca - 0.3, "crujido", 0.5); fx(M.arranca, "camion", 0.55); fx(M.arranca + 0.3, "bocina", 0.4);
fx(M.auto - 0.1, "campana", 0.45);
fx(S(4) - 0.4, "camion", 0.4); fx(M.humo - 0.2, "trueno", 0.35); fx(M.llama - 0.3, "ding", 0.4); fx(M.grua - 0.6, "grua", 0.5);
fx(M.externa - 0.1, "pop", 0.45);
fx(M.sobran - 0.3, "letrero", 0.5); fx(M.baja - 0.2, "baja", 0.45); fx(M.vende - 0.4, "pasos", 0.45); fx(M.vende + 0.6, "monedas", 0.5);
fx(M.crisis - 0.6, "trueno", 0.5); fx(M.falla, "sello", 0.45);
fx(M.estado - 0.4, "pasos", 0.45); fx(M.politica - 0.2, "campana", 0.5);
fx(M.equivoca - 0.1, "whoosh", 0.45); fx(M.equivoca + 0.4, "golpe", 0.5);
fx(M.quien - 0.2, "pop", 0.45); fx(M.cuando - 0.2, "pop", 0.45);
fx(M.sigue, "burbuja", 0.45); fx(E(12) + 0.1, "ding-doble", 0.45);

const ARTE = ["art/carretera.jpg", "art/puesto.jpg", "art/ciudad.jpg", "art/mango.png", "macro2026/ilustrados/carro-varado.webp", "macro2026/ilustrados/grua.webp", "macro2026/objetos/llave-inglesa.png", "macro2026/ilustrados/caja-herramientas.webp", "macro2026/objetos/reloj-arena.png", "macro2026/ilustrados/termometro-vidrio.webp", "macro2026/ilustrados/fabrica.webp", "macro2026/ilustrados/nube-tormenta.webp"];
const CLAVE = /^(autorregulación|intervención|externa|mecánico|mercado|solo|falla|política|económica|Estado|fallar|cuándo|quién)[.,:?…!¡]*$/i;

export const DURACION = T.DURACION_S;
export const B1 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/pe26-a1-mecanico.mp3" sinSonido={sinSonido} />
);
