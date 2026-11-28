/*
 * Gestión de Proyectos · GP-55 «Don Tito se queja» (gp55-gestionar-involucramiento).
 * Una idea: Gestionar el Involucramiento de los Interesados es comunicarse y trabajar con los interesados
 * para satisfacer sus necesidades y expectativas, abordar los incidentes y fomentar la participación
 * adecuada; incrementa el apoyo y minimiza la resistencia (13.3, p. 523). Retroalimentación, por ejemplo:
 * conversaciones, reuniones, informes del avance, encuestas (13.3.2.2); gestión de conflictos, negociación,
 * conciencia cultural y política (13.3.2.3); reglas básicas (13.3.2.4); reuniones (13.3.2.5); solicitudes de
 * cambio (13.3.3.1, p. 528–529).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Dicho, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, {
  extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3],
  manual: {
    3: ["Gestionar el involucramiento de los interesados", "es comunicarse y trabajar con ellos", "para satisfacer sus necesidades y expectativas,", "abordar los incidentes", "y fomentar su participación adecuada."],
    5: ["Primero, escuchar:", "la retroalimentación se recoge, por ejemplo,", "en conversaciones, reuniones,", "informes de avance y encuestas."],
  },
});
const { S, E, W } = T;

const M = {
  apoya: W(1, "apoya", 0.25), queja: W(1, "queja", 0.75), ruido: W(1, "ruido.", 0.97),
  lado: W(2, "lado?", 0.95),
  gestionar: W(3, "Gestionar", 0.03), comunicarse: W(3, "comunicarse", 0.3), satisfacer: W(3, "satisfacer", 0.5), incidentes3: W(3, "incidentes", 0.75), participacion: W(3, "participación", 0.92),
  apoyo4: W(4, "apoyo", 0.45), resistencia: W(4, "resistencia.", 0.97),
  escuchar: W(5, "escuchar:", 0.1), conversaciones: W(5, "conversaciones,", 0.55), reuniones5: W(5, "reuniones,", 0.65), informes: W(5, "informes", 0.75), encuestas: W(5, "encuestas.", 0.97),
  conflictos: W(6, "conflictos,", 0.4), negociacion: W(6, "negociación", 0.6), cultural: W(6, "cultural", 0.8), politica: W(6, "política.", 0.97),
  negocia: W(7, "negocia", 0.15), baja: W(7, "baja", 0.6), ocho: W(7, "ocho.", 0.97),
  reglas: W(8, "reglas", 0.1), comporten: W(8, "comporten", 0.7),
  reuniones9: W(9, "reuniones", 0.2), resolver: W(9, "resolver", 0.5), decisiones: W(9, "decisiones.", 0.97),
  alcance: W(10, "alcance,", 0.45), solicitud: W(10, "solicitud", 0.8),
  toca: W(11, "toca:", 0.15), queja11: W(11, "queja,", 0.55), escucharias: W(11, "escucharías.", 0.97),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "escuchar", desde: S(5) - 0.3, entra: "zoom" },
  { tipo: "habilidades", desde: S(6) - 0.3, entra: "barrido-izq" },
  { tipo: "reglas", desde: S(8) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* ═════ 1–2 · Ahora se queja ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  const pQ = rampa(t, M.queja - 0.3, 0.3);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      <Cartel x={300} y={260} txt="👍 ya apoya" p={rampa(t, M.apoya - 0.3, 0.3)} tam={44} fondo="#E3F6EC" giro={-2} />
      <Dicho x={460} y={300} w={520} h={200} p={pQ} colaX={800}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 44 }}>🔊 ¡mucho ruido!</div>
      </Dicho>
      <Gigante x={300 + 10 * Math.sin(t * 14) * pQ} y={520} txt="🎶" p={rampa(t, M.ruido - 0.4, 0.3)} tam={120} />
      <Cartel x={540} y={830} txt="¿cómo se mantiene de tu lado?" p={rampa(t, M.lado - 0.6, 0.3)} tam={40} fondo="#DDE3FF" giro={1} />
      <Sombra x={260} y={1510} w={190} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={330} t={t} cara={t > M.queja ? "tranquila" : "feliz"} semilla={3} />
      <Sombra x={820} y={1510} w={200} />
      <Mascota esp="perro-mochila" x={820} y={1515} alto={370} t={t} cara={t > M.queja ? "triste" : "feliz"} cab={-6 * pulso(t, M.queja, 1.5)} semilla={5} espejo />
    </Escena>
  );
}

/* ═════ 3–4 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(4) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const C = [[M.comunicarse, "💬 comunicarse y trabajar con ellos"], [M.satisfacer, "🧺 satisfacer necesidades y expectativas"], [M.incidentes3, "🧯 abordar los incidentes"], [M.participacion, "🙋 fomentar su participación"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={200} txt="gestionar el involucramiento de los interesados" p={rampa(t, M.gestionar - 0.3, 0.35)} tam={34} fondo={MANGO} />
      {C.map(([tw, txt], k) => <Cartel key={k} x={540} y={340 + k * 120} txt={txt} p={rampa(t, tw - 0.4, 0.3)} tam={34} fondo={CREMA} giro={[-1, 1, -1, 1][k]} />)}
      <Cartel x={300} y={870} txt="⬆️ más apoyo" p={rampa(t, M.apoyo4 - 0.3, 0.3)} tam={40} fondo="#E3F6EC" giro={-2} />
      <Cartel x={780} y={870} txt="⬇️ menos resistencia" p={rampa(t, M.resistencia - 0.5, 0.3)} tam={38} fondo="#FFE1D8" giro={2} />
      <Sombra x={540} y={1510} w={190} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 5 · Escuchar ═════ */
function Escuchar({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(5), b: E(5) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const R = [[M.conversaciones, "🗣️ conversaciones"], [M.reuniones5, "👥 reuniones"], [M.informes, "📊 informes de avance"], [M.encuestas, "📝 encuestas"]];
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(7px)" velo={0.3}>
      <Gigante x={540} y={260} txt="👂" p={rampa(t, M.escuchar - 0.3, 0.35)} tam={150} />
      <Cartel x={540} y={420} txt="retroalimentación, por ejemplo:" p={rampa(t, M.conversaciones - 1.2, 0.3)} tam={40} fondo={MANGO} />
      {R.map(([tw, txt], k) => <Cartel key={k} x={k % 2 ? 780 : 300} y={570 + Math.floor(k / 2) * 130} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={38} fondo={CREMA} giro={[-2, 2, 1, -1][k]} />)}
      <Sombra x={260} y={1510} w={180} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={300} t={t} cara="feliz" cab={6 * Math.sin(t * 2)} semilla={3} />
      <Sombra x={820} y={1510} w={180} />
      <Mascota esp="perro-mochila" x={820} y={1515} alto={320} t={t} cara="tranquila" semilla={5} espejo />
    </Escena>
  );
}

/* ═════ 6–7 · Habilidades y la negociación ═════ */
function Habilidades({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7), b: E(7) + 0.3, s: 1.04, x: 540, y: 990 }]);
  const H = [[M.conflictos, "🧯 gestión de conflictos"], [M.negociacion, "🤝 negociación"], [M.cultural, "🌎 conciencia cultural"], [M.politica, "🏛️ conciencia política"]];
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      {H.map(([tw, txt], k) => <Cartel key={k} x={k % 2 ? 780 : 300} y={200 + Math.floor(k / 2) * 125} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={36} fondo={CREMA} giro={[-2, 2, 1, -1][k]} />)}
      <Cartel x={540} y={540} txt="🤝 Pía negocia con Don Tito" p={rampa(t, M.negocia - 0.3, 0.3)} tam={42} fondo={MANGO} giro={-1} />
      <Cartel x={540} y={680} txt="🔉 música más baja después de las 8" p={rampa(t, M.baja - 0.3, 0.3)} tam={38} fondo="#E3F6EC" giro={1} />
      <Gigante x={540} y={850} txt="✅" p={rampa(t, M.ocho - 0.3, 0.35)} tam={110} />
      <Sombra x={300} y={1520} w={190} />
      <Mascota esp="hamster-gorra" x={300} y={1525} alto={320} t={t} cara="feliz" bi={-40 * pulso(t, M.negocia, 1.2)} semilla={3} />
      <Sombra x={780} y={1520} w={200} />
      <Mascota esp="perro-mochila" x={780} y={1525} alto={350} t={t} cara={t > M.ocho - 0.3 ? "feliz" : "tranquila"} salto={30 * pulso(t, M.ocho, 0.5)} semilla={5} espejo />
    </Escena>
  );
}

/* ═════ 8–10 · Reglas, reuniones y cambios ═════ */
function Reglas({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9), b: E(10) + 0.3, s: 1.02, x: 540, y: 960 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Documento x={270} y={330} w={290} p={rampa(t, M.reglas - 0.4, 0.4)} titulo="reglas básicas" letra={40} giro={-3} />
      <Cartel x={770} y={260} txt="cómo se espera" p={rampa(t, M.comporten - 0.6, 0.3)} tam={34} fondo="#FFFDF7" giro={2} />
      <Cartel x={770} y={350} txt="que se comporten" p={rampa(t, M.comporten - 0.3, 0.3)} tam={34} fondo="#FFFDF7" giro={-1} />
      <Cartel x={770} y={450} txt="👥 equipo e interesados" p={rampa(t, M.comporten, 0.3)} tam={32} fondo={CREMA} giro={1} />
      <Cartel x={540} y={680} txt="👥 reuniones" p={rampa(t, M.reuniones9 - 0.3, 0.3)} tam={44} fondo={MANGO} giro={-1} />
      <Cartel x={300} y={800} txt="🧯 resolver incidentes" p={rampa(t, M.resolver - 0.3, 0.3)} tam={36} fondo={CREMA} giro={-2} />
      <Cartel x={790} y={800} txt="⚖️ tomar decisiones" p={rampa(t, M.decisiones - 0.5, 0.3)} tam={36} fondo={CREMA} giro={2} />
      <Cartel x={540} y={980} txt="🔁 ¿cambia el alcance? → solicitud de cambio" p={rampa(t, M.alcance - 0.3, 0.3)} tam={32} fondo="#DDE3FF" giro={-1} />
      <Sombra x={180} y={1530} w={140} />
      <Mascota esp="hamster-gorra" x={180} y={1535} alto={240} t={t} cara="feliz" semilla={3} />
      <Sombra x={900} y={1530} w={140} />
      <Mascota esp="perro-mochila" x={900} y={1535} alto={240} t={t} cara="feliz" semilla={5} espejo />
    </Escena>
  );
}

/* ═════ 11 · Tu interesado ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={270} txt="⚡ tu interesado" p={rampa(t, M.toca - 0.2, 0.35)} tam={56} fondo={MANGO} />
      <Cartel x={540} y={430} txt="😤 se queja de: ________" p={rampa(t, M.queja11 - 0.3, 0.3)} tam={42} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={560} txt="👂 cómo lo escucho: ________" p={rampa(t, M.escucharias - 0.6, 0.3)} tam={40} fondo={CREMA} giro={1} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.escucharias, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-mochila" x={790} y={1535} alto={370} t={t} cara="feliz" semilla={5} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "escuchar") return <Escuchar t={t} />;
  if (p.tipo === "habilidades") return <Habilidades t={t} />;
  if (p.tipo === "reglas") return <Reglas t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.apoya - 0.3, "pop", 0.25); fx(M.queja - 0.3, "bocina", 0.2); fx(M.lado - 0.6, "pop-suave", 0.22);
fx(S(3) - 0.3, "whoosh", 0.4); [M.comunicarse, M.satisfacer, M.incidentes3, M.participacion].forEach((w) => fx(w - 0.4, "pop", 0.2)); fx(M.apoyo4 - 0.3, "ding", 0.22);
fx(S(5) - 0.3, "whoosh", 0.4); [M.conversaciones, M.reuniones5, M.informes, M.encuestas].forEach((w) => fx(w - 0.3, "pop-suave", 0.2));
fx(S(6) - 0.3, "whoosh", 0.4); [M.conflictos, M.negociacion, M.cultural, M.politica].forEach((w) => fx(w - 0.3, "pop", 0.2)); fx(M.ocho - 0.3, "ding", 0.3);
fx(S(8) - 0.3, "whoosh", 0.4); fx(M.reglas - 0.4, "papel", 0.3); [M.reuniones9, M.resolver, M.decisiones, M.alcance].forEach((w) => fx(w - 0.3, "pop-suave", 0.2));
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg"];
const CLAVE = /^(involucramiento|interesados|interesado|retroalimentación|negociación|negocia|reglas|reuniones|apoyo|resistencia)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP55 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp55-gestionar-involucramiento.mp3" sinSonido={sinSonido} />
);
