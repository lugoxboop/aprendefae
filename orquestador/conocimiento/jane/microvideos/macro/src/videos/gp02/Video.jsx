/*
 * Gestión de Proyectos · GP-02 «El puente que dura cien años» (gp02-puente-cien-anos).
 * Una idea: temporal = principio y fin definidos, no corta duración; el proyecto
 * termina al lograr sus objetivos o al no poder lograrlos, sin plata, sin necesidad
 * o sin recursos (G p. 5). Lo que entrega puede durar mucho más que el proyecto.
 */
import { Mascota, Sombra, Placa, Globo, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Destello, Pizarra, Tiza, TrazoTiza, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Calendario, Local, Tachon, Puente, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.35, 0.3, 0.25, 0.3, 0.35, 0.3, 0.3, 0.35, 0.3, 0.25, 0.35, 0.4] });
const { S, E, W } = T;

const M = {
  cuanto: W(1, "Cuánto", 0.1), meses: W(1, "meses,", 0.6), dirias: W(1, "dirías", 0.8),
  obra: W(2, "obra", 0.2), puente2: W(2, "puente", 0.4), cuatro: W(2, "cuatro", 0.7), anos2: W(2, "años.", 0.9),
  durar: W(3, "durar", 0.5), cien: W(3, "cien.", 0.9),
  ciertas: W(4, "ciertas,", 0.25), proyecto4: W(4, "proyecto", 0.5), entrega: W(4, "entrega", 0.7), mismo4: W(4, "mismo.", 0.95),
  pia5: W(5, "Pía", 0.2), sede: W(5, "sede", 0.6), listo: W(5, "listo.", 0.95),
  mitad: W(6, "mitad", 0.2), dueno: W(6, "dueño", 0.5), vende: W(6, "vende.", 0.95),
  abrir: W(7, "abrir.", 0.4), parar: W(7, "parar.", 0.95),
  fracaso: W(8, "Fracasó", 0.15), termino: W(8, "Terminó,", 0.6), mismo8: W(8, "mismo.", 0.95),
  termina9: W(9, "termina", 0.3), logra: W(9, "logra", 0.6), objetivos: W(9, "objetivos…", 0.9),
  puede: W(10, "puede", 0.15), plata: W(10, "plata,", 0.45), falta: W(10, "falta", 0.7), recursos: W(10, "recursos.", 0.95),
  temporal: W(11, "temporal:", 0.15), principio: W(11, "principio", 0.4), fin11: W(11, "fin", 0.55), dure: W(11, "dure", 0.8),
  toca: W(12, "toca:", 0.15), termino12: W(12, "terminó", 0.5), proyectos12: W(12, "proyectos?", 0.95),
};

const PLANOS = [
  { tipo: "pregunta", desde: 0 },
  { tipo: "puente", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "barras", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "sede", desde: S(5) - 0.3, entra: "barrido" },
  { tipo: "termino", desde: S(8) - 0.3, entra: "destello" },
  { tipo: "pizarra", desde: S(9) - 0.3, entra: "zoom" },
  { tipo: "temporal", desde: S(11) - 0.3, entra: "barrido-izq" },
  { tipo: "cierre", desde: S(12) - 0.25, entra: "zoom" },
];

/* ═════ 1 · ¿Cuánto dura un proyecto? ═════ */
function Pregunta({ t }) {
  const cam = mover(t, { s: 1.12, x: 540, y: 900 }, [{ a: 0.2, b: E(1) + 0.4, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(3px)" velo={0.1}>
      <Gigante x={540} y={360} txt="¿?" p={rampa(t, 0.05, 0.35)} tam={230} color={MANGO} giro={-6 + 4 * Math.sin(t * 3)} />
      <Calendario x={300} y={760} w={300} t={t} vel={rampa(t, M.cuanto, 0.2) > 0 ? 9 : 0} />
      <Cartel x={760} y={720} txt="¿pocos meses?" p={rampa(t, M.meses - 0.35, 0.35)} tam={62} giro={4} />
      <Sombra x={760} y={1500} w={280} />
      <Mascota esp="hamster-gorra" x={760} y={1505} alto={560} t={t} cara="tranquila" cab={-8 * pulso(t, M.dirias - 0.4, 1)} bi={-50 * pulso(t, M.meses - 0.3, 1.1)} semilla={3} espejo />
      <Placa x={760} y={850} nombre="Pía" rol="Dueña de la panadería" p={rampa(t, 0.4, 0.35) * (1 - rampa(t, E(1) - 0.2, 0.3))} />
    </Escena>
  );
}

/* ═════ 2–3 · Un puente: 4 años de obra, 100 años de uso ═════ */
function PuenteEsc({ t }) {
  const cam = mover(t, { s: 1.15, x: 540, y: 1000 }, [
    { a: S(2), b: E(2), s: 1.05, x: 540, y: 980 },
    { a: S(3) - 0.2, b: E(3) + 0.3, s: 0.95, x: 540, y: 968 },
  ]);
  const avance = rampa(t, M.obra - 0.2, M.anos2 - M.obra + 0.2);
  const anos = Math.min(4, Math.max(1, Math.ceil(4 * avance)));
  const pCien = rampa(t, M.cien - 0.5, 0.5);
  const cien = Math.round(lerp(4, 100, sale(rampa(t, M.durar - 0.2, M.cien - M.durar + 0.2))));
  const fueraObra = 1 - rampa(t, S(3) - 0.2, 0.3);
  return (
    <Escena cam={cam} fondo="art/carretera.jpg">
      <Puente x={540} y={980} w={900} avance={avance} andamio={(1 - rampa(t, M.anos2 - 0.2, 0.4)) * rampa(t, M.obra, 0.3)} autos={rampa(t, S(3) - 0.3, 0.6)} t={t} />
      <div style={{ opacity: fueraObra }}>
        <Cartel x={540} y={420} txt={`obra: ${anos} ${anos === 1 ? "año" : "años"}`} p={rampa(t, M.puente2 - 0.3, 0.35)} tam={80} fondo={MANGO} giro={-3} />
      </div>
      {t > S(3) - 0.3 && (
        <>
          <Cartel x={540} y={420} txt={`puente: ${cien} años`} p={rampa(t, S(3) - 0.3, 0.35)} tam={80} fondo={COLOR.VERDE} color="#fff" giro={3} />
          <Destello x={540} y={420} r={360} p={pCien} />
        </>
      )}
      <Sombra x={200} y={1500} w={230} />
      <Mascota esp="perro-mochila" x={200} y={1505} alto={430} t={t} cara={t > M.cien - 0.4 ? "estrellas" : "tranquila"} bi={-60 * pulso(t, M.cuatro - 0.4, 1)} semilla={9} />
      <Placa x={200} y={950} nombre="Ramón" rol="Panadero" p={rampa(t, S(2) + 0.2, 0.35) * (1 - rampa(t, S(3), 0.3))} color={COLOR.CORAL} />
    </Escena>
  );
}

/* ═════ 4 · Dos barras: el proyecto y lo que entrega ═════ */
function Barras({ t }) {
  const cam = mover(t, { s: 1.05, x: 540, y: 900 }, [{ a: S(4), b: E(4), s: 1.0, x: 540, y: 900 }]);
  const pP = rampa(t, M.proyecto4 - 0.3, 0.6), pE = rampa(t, M.entrega - 0.3, 1.4);
  return (
    <Escena cam={cam} fondo="art/carretera.jpg" filtro="blur(7px)" velo={0.3}>
      <Gigante x={330} y={330} txt="✓" p={rampa(t, M.ciertas - 0.6, 0.35)} tam={170} color={COLOR.VERDE} />
      <Gigante x={750} y={330} txt="✓" p={rampa(t, M.ciertas - 0.4, 0.35)} tam={170} color={COLOR.VERDE} />
      {/* barra del proyecto: corta */}
      <Cartel x={290} y={530} txt="el proyecto" p={pP} tam={66} />
      {pP > 0 && <div style={{ position: "absolute", left: 110, top: 610, width: 240 * sale(pP), height: 110, background: MANGO, border: `8px solid ${TINTA}`, borderRadius: 18 }} />}
      <Cartel x={500} y={665} txt="4 años" p={rampa(t, M.proyecto4, 0.35)} tam={60} fondo={CREMA} />
      {/* barra de lo que entrega: larguísima */}
      <Cartel x={350} y={850} txt="lo que entrega" p={rampa(t, M.entrega - 0.3, 0.35)} tam={66} />
      {pE > 0 && <div style={{ position: "absolute", left: 110, top: 930, width: 860 * sale(pE), height: 110, background: COLOR.VERDE, border: `8px solid ${TINTA}`, borderRadius: 18 }} />}
      <Cartel x={800} y={1120} txt="100 años" p={rampa(t, M.entrega + 0.8, 0.35)} tam={60} fondo={CREMA} />
      <div style={{ opacity: rampa(t, M.entrega - 0.2, 0.4) }}>
        <Puente x={540} y={1300} w={760} avance={1} autos={1} t={t} />
      </div>
    </Escena>
  );
}

/* ═════ 5–7 · La segunda sede de Pía: el dueño vende el local ═════ */
function Sede({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [
    { a: S(6) - 0.2, b: S(6) + 0.6, s: 1.12, x: 640, y: 940 },
    { a: S(7) - 0.2, b: E(7), s: 1.18, x: 520, y: 1050 },
  ]);
  const alto = rampa(t, M.pia5, M.mitad - M.pia5 + 0.1) * 0.55;
  const pVende = rampa(t, M.vende - 0.4, 0.4);
  const pAlto = rampa(t, M.parar - 0.5, 0.4);
  const triste = t > M.vende - 0.2;
  return (
    <Escena cam={cam} fondo="art/obra.jpg">
      <div style={{ filter: `grayscale(${0.8 * rampa(t, M.abrir - 0.4, 0.6)})` }}>
        <Local x={540} y={1180} w={520} alto={alto} t={t} />
      </div>
      <Calendario x={860} y={420} w={220} t={t} alfiler={[rampa(t, M.sede - 0.3, 0.35), 0]} />
      <Cartel x={420} y={470} txt="✓ todo listo" p={rampa(t, M.listo - 0.4, 0.35) * (1 - rampa(t, S(6) - 0.1, 0.3))} tam={62} fondo={COLOR.VERDE} color="#fff" giro={-3} />
      {/* el dueño del local y su letrero de VENDIDO */}
      {t > S(6) - 0.3 && (
        <>
          <Sombra x={880} y={1500} w={230} />
          <Mascota esp="zorro-corbata" x={lerp(1250, 880, sale(rampa(t, M.mitad - 0.2, 0.6)))} y={1505} alto={480} t={t} cara="feliz" bd={-60 * pulso(t, M.vende - 0.6, 1)} semilla={7} espejo />
          <Placa x={880} y={1080} nombre="El dueño" rol="del local" p={rampa(t, M.dueno - 0.2, 0.35) * (1 - rampa(t, S(7) + 0.4, 0.3))} color={COLOR.CORAL} />
          <div style={{ position: "absolute", left: 610, top: 1060, transform: `translate(-50%,-50%) rotate(-10deg) scale(${lerp(2.4, 1, sale(pVende))})`, opacity: Math.min(1, pVende * 3), border: `12px solid ${ROJO}`, color: ROJO, background: "rgba(255,255,255,.9)", fontFamily: "Sora", fontWeight: 800, fontSize: 84, padding: "6px 30px", borderRadius: 18 }}>VENDIDO</div>
        </>
      )}
      <Gigante x={250} y={560} txt="✋" p={pAlto} tam={170} />
      <Cartel x={250} y={740} txt="parar" p={rampa(t, M.parar - 0.3, 0.35)} tam={70} fondo={ROJO} color="#fff" />
      <Sombra x={220} y={1500} w={260} />
      <Mascota esp="hamster-gorra" x={220} y={1505} alto={500} t={t} cara={triste ? "triste" : "feliz"} cab={triste ? 8 : 0} bd={-80 * pulso(t, M.pia5 - 0.2, 1.2)} bi={-70 * pulso(t, M.parar - 0.6, 1.2)} semilla={3} />
    </Escena>
  );
}

/* ═════ 8 · ¿Fracasó? Terminó ═════ */
function Termino({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 900 }, [{ a: S(8), b: E(8), s: 1.0, x: 540, y: 950 }]);
  const pF = rampa(t, M.fracaso - 0.3, 0.35);
  return (
    <Escena cam={cam} fondo="art/obra.jpg" filtro="blur(6px)" velo={0.2}>
      <Cartel x={540} y={400} txt="¿fracasó?" p={pF} tam={96} />
      <Tachon x={540} y={400} w={560} p={rampa(t, M.termino - 0.2, 0.3)} />
      <Calendario x={540} y={830} w={380} t={t} alfiler={[1, rampa(t, M.termino - 0.2, 0.35)]} sello={rampa(t, M.termino, 0.3)} hoja="TERMINÓ" />
      <Sombra x={830} y={1500} w={240} />
      <Mascota esp="hamster-gorra" x={830} y={1505} alto={470} t={t} cara={t > M.mismo8 - 0.5 ? "guino" : "tranquila"} cab={-6} bd={-60 * pulso(t, M.mismo8 - 0.7, 1.1)} semilla={3} espejo />
    </Escena>
  );
}

/* ═════ 9–10 · Cuándo termina un proyecto, en la pizarra ═════ */
function PizarraFin({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10) - 0.2, b: E(10), s: 1.04, x: 540, y: 1000 }]);
  const items = [
    [M.puede, "ya no puede lograrlos", "✗"],
    [M.plata, "se acaba la plata", "$"],
    [M.falta, "ya no hace falta", "–"],
    [M.recursos, "faltan recursos", "…"],
  ];
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(7px)" velo={0.15}>
      <Pizarra x={60} y={220} w={960} h={1220}>
        <Tiza x={450} y={30} txt="Termina cuando…" p={rampa(t, M.termina9 - 0.2, 0.6)} tam={104} centro color={MANGO} />
        <Tiza x={70} y={220} txt="✓ logra sus objetivos" p={rampa(t, M.logra - 0.2, 0.7)} tam={90} color="#9FE0B4" />
        <TrazoTiza d="M 60 340 L 840 340" p={rampa(t, S(10) - 0.3, 0.4)} w={5} punteado />
        <Tiza x={70} y={370} txt="o…" p={rampa(t, S(10) - 0.2, 0.3)} tam={70} color="#FF9B95" />
        {items.map(([tw, txt], k) => (
          <Tiza key={k} x={110} y={480 + k * 150} txt={"• " + txt} p={rampa(t, tw - 0.25, 0.55)} tam={86} />
        ))}
      </Pizarra>
      <Destello x={540} y={330} r={300} p={rampa(t, M.termina9 - 0.1, 0.8)} />
    </Escena>
  );
}

/* ═════ 11 · Temporal: principio y fin, dure lo que dure ═════ */
function Temporal({ t }) {
  const cam = mover(t, { s: 1.06, x: 540, y: 940 }, [{ a: S(11), b: E(11), s: 1.0, x: 540, y: 968 }]);
  const linea = (y, x1, txt, t0, color) => (
    <>
      <TrazoTiza d={`M 140 ${y} L ${x1} ${y}`} p={rampa(t, t0, 0.6)} w={12} color={color} />
      <TrazoTiza d={`M 140 ${y - 40} L 140 ${y + 40}`} p={rampa(t, M.principio - 0.2, 0.25)} w={14} color="#9FE0B4" />
      <TrazoTiza d={`M ${x1} ${y - 40} L ${x1} ${y + 40}`} p={rampa(t, M.fin11 - 0.2, 0.25)} w={14} color="#FF9B95" />
      <Tiza x={(140 + x1) / 2} y={y + 55} txt={txt} p={rampa(t, M.dure - 0.3 + (x1 > 500 ? 0.3 : 0), 0.4)} tam={80} centro />
    </>
  );
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(7px)" velo={0.15}>
      <Pizarra x={60} y={260} w={960} h={1060}>
        <Tiza x={450} y={30} txt="temporal" p={rampa(t, M.temporal - 0.25, 0.5)} tam={130} centro color={MANGO} />
        <Tiza x={80} y={240} txt="inicio" p={rampa(t, M.principio - 0.2, 0.3)} tam={56} color="#9FE0B4" />
        <Tiza x={700} y={240} txt="fin" p={rampa(t, M.fin11 - 0.2, 0.3)} tam={56} color="#FF9B95" />
        {linea(440, 400, "4 meses", M.principio - 0.1)}
        {linea(760, 840, "4 años", M.principio + 0.1)}
      </Pizarra>
    </Escena>
  );
}

/* ═════ 12 · Ahora te toca ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(12), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(6px)" velo={0.25}>
      <div style={{ position: "absolute", left: 0, top: 0, opacity: rampa(t, M.termino12 - 0.6, 0.4), transform: `scale(${rebote(rampa(t, M.termino12 - 0.6, 0.5))})`, transformOrigin: "270px 600px" }}>
        <Puente x={270} y={560} w={380} avance={1} t={t} />
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, opacity: rampa(t, M.termino12 - 0.3, 0.4) }}>
        <Local x={810} y={720} w={300} alto={0.55} t={t} />
      </div>
      <Gigante x={270} y={380} txt="?" p={rampa(t, M.proyectos12 - 0.6, 0.35)} tam={150} color={MANGO} giro={-8} />
      <Gigante x={810} y={380} txt="?" p={rampa(t, M.proyectos12 - 0.4, 0.35)} tam={150} color={MANGO} giro={8} />
      <Sombra x={540} y={1530} w={300} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={600} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.proyectos12 - 0.2, 0.5)} semilla={3} />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "pregunta") return <Pregunta t={t} />;
  if (p.tipo === "puente") return <PuenteEsc t={t} />;
  if (p.tipo === "barras") return <Barras t={t} />;
  if (p.tipo === "sede") return <Sede t={t} />;
  if (p.tipo === "termino") return <Termino t={t} />;
  if (p.tipo === "pizarra") return <PizarraFin t={t} />;
  if (p.tipo === "temporal") return <Temporal t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(0.05, "pop", 0.4); fx(M.cuanto, "papel", 0.35); fx(M.meses - 0.35, "pop-suave", 0.35);
fx(S(2) - 0.3, "whoosh", 0.4); fx(M.obra - 0.1, "grua", 0.3); fx(M.cuatro - 0.2, "toc", 0.4); fx(M.anos2 - 0.2, "golpe", 0.3);
fx(S(3) - 0.3, "desliza", 0.35); fx(M.cien - 0.5, "campana", 0.4);
fx(S(4) - 0.3, "barrido-lento", 0.35); fx(M.ciertas - 0.6, "ding", 0.3); fx(M.ciertas - 0.4, "ding", 0.3); fx(M.proyecto4 - 0.3, "desliza", 0.3); fx(M.entrega - 0.3, "desliza", 0.35);
fx(S(5) - 0.3, "whoosh", 0.4); fx(M.sede - 0.3, "toc", 0.4); fx(M.listo - 0.4, "ding", 0.35);
fx(M.mitad - 0.2, "pasos", 0.35); fx(M.vende - 0.4, "sello", 0.5); fx(M.abrir - 0.4, "eco", 0.3); fx(M.parar - 0.5, "toc-grave", 0.45);
fx(S(8) - 0.3, "whoosh", 0.35); fx(M.fracaso - 0.3, "pop", 0.4); fx(M.termino - 0.2, "toc", 0.4); fx(M.termino, "sello", 0.5);
fx(S(9) - 0.3, "barrido-lento", 0.35); fx(M.termina9 - 0.2, "tiza-larga", 0.4); fx(M.logra - 0.2, "ding", 0.3);
[M.puede, M.plata, M.falta, M.recursos].forEach((w) => fx(w - 0.25, "tiza", 0.35));
fx(S(11) - 0.3, "whoosh", 0.4); fx(M.temporal - 0.25, "tiza-larga", 0.4); fx(M.principio - 0.2, "toc", 0.35); fx(M.fin11 - 0.2, "toc", 0.35);
fx(M.termino12 - 0.6, "pop", 0.35); fx(M.termino12 - 0.3, "pop", 0.35); fx(E(12) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/ciudad.jpg", "art/carretera.jpg", "art/obra.jpg", "art/panaderia.jpg"];
const CLAVE = /^(temporal|temporal:|terminó|terminó,|termina|objetivos…|proyecto|principio|fin)[.,:?…!¡]*$/i;

export const DURACION = T.DURACION_S;
export const GP02 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp02-puente-cien-anos.mp3" sinSonido={sinSonido} />
);
