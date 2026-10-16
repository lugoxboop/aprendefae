import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { BarChart2 } from "lucide-react";
import { FAE, ANCHO_ESTRECHO } from "../../theme.js";
import { useAuth } from "../../auth/AuthProvider.jsx";
import { NavigationContext } from "../../navigation.js";
import { rachaVigente } from "../../fp/racha.js";
import { escucharFP } from "../../fp/aviso.js";
import { DURACION_CONTEO_MS, valorEnProgreso } from "../../fp/conteo.js";
import { formatoFP } from "../../utils/formato.js";
import { saldoDe } from "../../cristales/cristales.js";
import { puntoDeTienda } from "../../tienda/novedades.js";
import { useAccesoDocente, recordadoComoDocente } from "../../docente/useAccesoDocente.js";
import Avatar from "../avatar/Avatar.jsx";
import IconoCristal from "../shared/IconoCristal.jsx";
import IconoRacha from "../shared/IconoRacha.jsx";
import GoogleSignInButton from "./GoogleSignInButton.jsx";

/*
 * Control de cuenta fijo arriba a la derecha, en todas las páginas.
 *
 * Sin sesión muestra el botón oficial de Google; con sesión, el apodo y la
 * salida.
 *
 * ═══════════ EN MÓVIL SE ENCOGE, Y POR QUÉ ═══════════
 *
 * La nota de antes decía que era "el espejo del logo" y que no estorbaba a las
 * cabeceras. En escritorio es verdad. A 375 px no lo era: la pastilla "Acceder
 * con Google" medía 181×32 y, medida vista por vista, tapaba el título de LAS
 * ONCE —el h1 de cada tema, "Tu perfil", "Panel docente"— y, en la portada,
 * 171 px del propio logo. Lo veía cada estudiante que entraba desde el
 * teléfono, en cada pantalla, desde el primer día.
 *
 * Sin sesión, por debajo de ANCHO_ESTRECHO el botón de Google pasa a su forma
 * de icono —oficial, lo dibuja su librería—, de 40×40, que es el mínimo cómodo
 * para el dedo.
 *
 * CON SESIÓN YA NO ES UN CÍRCULO CON LA INICIAL. La pastilla enseña el avatar
 * y los FP, y tiene dos formas:
 *
 *   completa   avatar + «12.500 FP». En escritorio siempre, y en el teléfono
 *              en las vistas sin título en la cabecera (portada, perfil).
 *   compacta   solo «12.500 FP», sin avatar, en el teléfono y en las vistas
 *              CON título. Por debajo de ANCHO_MINIMO_SUFIJO se queda el
 *              número solo. Es el mismo botón —mismo fondo, mismo borde, mismo
 *              menú— encogido; nunca desaparece.
 *
 * Quién es «con título» no lo adivina esta pastilla: se pinta fuera del árbol
 * de la vista, así que no tiene a su alrededor nada que mirar. Lo dice App con
 * la prop `conTitulo`, desde una lista de vistas que vive allí.
 *
 * ═══════════ LO DECIDE EL CSS, NO JAVASCRIPT ═══════════
 *
 * Una media query elige la forma. Se intentó primero midiendo la ventana con
 * JavaScript y falló de tres maneras distintas, todas medidas: el ancho pasaba
 * por un valor transitorio al cargar y el control se quedaba en círculo en
 * escritorio; al girar, el aviso llegaba antes que la media query y el botón
 * iba un paso atrasado; y los temporizadores de respaldo se congelan con la
 * pestaña en segundo plano. El CSS lo evalúa el navegador en cada pintado.
 *
 * ═══════════ Y EL HUECO QUE RESERVA ═══════════
 *
 * Encoger no bastó: el control todavía tapaba el título largo de Pensamiento
 * Sistémico y la etiqueta de Demanda Agregada. Así que las filas de cabecera
 * con título llevan la clase `fae-cabecera-titulo`, y la regla vive AQUÍ,
 * junto al elemento que necesita el hueco: si el control cambia de tamaño, su
 * reserva cambia en el mismo archivo.
 *
 * Esa misma clase es la que trae el HEADER COMPACTO entero —sin logo, sin
 * divisor, con el título truncando el último—. Su orden de cesión está escrito
 * en el bloque de CSS de abajo, que es donde se aplica.
 *
 * ═══════════ EL ATAJO AL PANEL DOCENTE, Y POR QUÉ NO SIEMPRE ES PASTILLA ═══════════
 *
 * Un docente tiene una segunda pastilla, teal, a la izquierda de la cuenta:
 * «Panel docente», un toque y se está dentro. Pero solo desde ANCHO_ATAJO.
 * Medido con la pastilla real puesta en su sitio, en las doce vistas:
 *
 *   · A 375 px no cabe de ninguna forma. La completa (147 px) tapaba el título
 *     en diez de las doce; solo el icono (40 px), la insignia «Hacer /
 *     Aprender» en seis temas y el título de Pensamiento Sistémico. Ensanchar
 *     la reserva no lo arregla: la fila no encoge por debajo de su contenido y
 *     se sigue metiendo debajo, y en Iceberg y Porter el título salta de línea
 *     y todo baja 13,4 px. Debajo del círculo tapaba «El camino de este tema».
 *   · Por encima de ANCHO_ESTRECHO la cuenta es la pastilla con el apodo, sin
 *     reserva. La cabecera más larga —Demanda Agregada, con «Hacer»— llega a
 *     343 px del borde de su columna, y el apodo admite 20 letras: con uno de
 *     20 (200 px de pastilla) la pareja deja de tocarla a partir de unos 740 px.
 *     De ahí el corte en 768.
 *
 * Por debajo, el atajo es la primera opción del menú de la cuenta: dos toques
 * en vez de tres —cuenta, perfil, buscar el bloque— y ni un píxel en la
 * cabecera. Lo elige una media query, como todo lo de este archivo.
 *
 * La pregunta de si es docente es la misma de todo el sitio —useAccesoDocente,
 * una llamada por carga compartida con el perfil, el panel y las actividades—,
 * y un invitado no la hace: sin sesión este trozo ni se monta.
 */
/*
 * El corte del círculo, ANCHO_ESTRECHO, vive en theme.js: es el mismo en que el
 * camino pasa a su forma de teléfono. Este otro solo le importa a este control.
 */
const ANCHO_ATAJO = 768;

/*
 * El hueco que la pastilla reserva en la cabecera de un tema, en el teléfono.
 *
 * Eran 40 px, cuando la pastilla se encogía a un círculo con la inicial. Ahora
 * lleva avatar (28) + separación (8) + el número de FP, así que ocupa más y la
 * reserva sube con ella. Medido a 375 px con el número más largo que se puede
 * tener hoy —cinco cifras, «12.500»—: la pastilla llega a 104 px de ancho, y la
 * reserva la deja separada del título.
 *
 * Vive aquí, junto al control, por la misma razón de siempre: si la pastilla
 * cambia de tamaño, su reserva cambia en el mismo archivo.
 */
const RESERVA_MOVIL = 112;

/*
 * Y el hueco cuando la pastilla va compacta —sin avatar— en una vista con
 * título. Medido: 76 px de pastilla + los 14 que la separan del borde, menos
 * los 24 de relleno que la página ya tiene, redondeado hacia arriba.
 */
const RESERVA_MOVIL_COMPACTA = 76;

/*
 * Por debajo de esto ni «FP» cabe al lado del número, y se queda solo la cifra.
 * 360 px es el ancho de un Galaxy A-algo, que es lo que de verdad se ve en el
 * salón; los 320 de un iPhone SE viejo entran de sobra por debajo.
 */
const ANCHO_MINIMO_SUFIJO = 360;

const CSS_CUENTA = `
.fae-gsi-icono { display: none; }
/* Normal aquí, para que la regla que lo esconde viva también en la hoja. */
.fae-cuenta-avatar { display: inline-flex; }
.fae-atajo-pastilla { display: inline-flex; position: relative; }
/*
 * El blanco de toque, sin tocar el dibujo: 44 px de alto y de ancho como
 * mínimo, centrados sobre la pastilla de 40. Si la pastilla ya es más grande,
 * el max() no la encoge. (Sin comillas invertidas aquí dentro: esto va en una
 * plantilla de CSS y una comilla invertida la cierra.)
 */
.fae-atajo-pastilla::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: max(100%, 44px);
  height: max(100%, 44px);
  transform: translate(-50%, -50%);
}
.fae-atajo-menu { display: none; }
@media (max-width: ${ANCHO_ATAJO - 1}px) {
  .fae-atajo-pastilla { display: none; }
  .fae-atajo-menu { display: flex; }
}
@media (max-width: ${ANCHO_ESTRECHO}px) {
  /*
   * ═══════════════════════════════════════════════════════════════════════
   * EL HEADER COMPACTO — tres elementos y nada más:
   *
   *     [← volver]   Título de la actividad            [1.200 FP]
   *
   * Vale para CUALQUIER vista con título en la cabecera, no solo las de
   * actividad: también el índice de materia. Se marca con
   * .fae-cabecera-titulo, y el orden en que las cosas ceden lo fijó Xeno:
   *
   *   1. el divisor, siempre
   *   2. el logo, porque el botón de volver ya cubre la salida
   *      —salvo en .fae-sin-volver, donde el logo ES la salida—
   *   3. la insignia, que ya salió del header en el JSX, a todos los anchos
   *   4. la pastilla, que pierde el avatar y se queda con el número
   *   5. y SOLO ENTONCES el título trunca, si todavía hace falta
   *
   * Antes de esto el título se quedaba con 33 px a 375 y «Política Fiscal»
   * se leía «P…». Medido después: 200 px, y entra entero.
   * ═══════════════════════════════════════════════════════════════════════
   */
  .fae-cabecera-titulo .fae-cabecera-marca { display: none; }
  .fae-cabecera-titulo.fae-sin-volver .fae-cabecera-marca { display: inline-flex; }

  /*
   * La reserva sube o baja con la pastilla: compacta ocupa ~76 px, así que
   * hace falta menos hueco que con el avatar puesto.
   */
  .fae-cabecera-titulo { padding-right: ${RESERVA_MOVIL_COMPACTA}px; }

  /*
   * Solo el título encoge. «min-width: 0» es imprescindible —un hijo flex no
   * baja de su contenido sin él— y sin eso el título empujaría a los otros en
   * vez de truncarse. El botón de volver no se toca: una flecha a medias no
   * se puede pulsar.
   */
  .fae-cabecera-titulo > * { flex-shrink: 0; }
  /*
   * DOS RENGLONES ANTES QUE PUNTOS SUSPENSIVOS.
   *
   * Esto truncaba a una línea, y a 320 px «Las cuentas, el debe y el haber»
   * se leía «Las cuentas, el debe…» e «Ingresos, gastos y ajustes» quedaba a
   * medias. El orden de Xeno de arriba —qué cede primero— sigue intacto: el
   * título sigue siendo lo ÚLTIMO que cede. Lo que cambia es cómo cede: en
   * vez de perder palabras, usa un segundo renglón.
   *
   * Tres células llegaron a esto por su cuenta y lo resolvieron cada una con
   * estilos propios en su vista (T4, T6, T7). Tres rodeos para el mismo
   * defecto: puesto aquí, los tres sobran, y las vistas que nadie ha tocado
   * —«las cuentas» e «ingresos, gastos y ajustes»— dejan de cortar sin que
   * nadie más tenga que enterarse.
   *
   * EL TOPE ES CUATRO, Y ESTUVO EN DOS HASTA QUE SE MIDIÓ.
   *
   * Tiene que haber tope: sin ninguno, un título larguísimo empujaría la
   * pantalla hacia abajo y la cabecera dejaría de ser una cabecera. Pero el
   * número no se deduce, se mide. Medido a 320 px sobre el paquete construido,
   * con el hueco real que le queda al título —164 px de los 320, porque el
   * resto son el botón de volver y la reserva de la pastilla—, y con los diez
   * títulos que existen hoy en Contabilidad:
   *
   *   · ocho entran en uno o dos renglones;
   *   · «Inventarios III: descuentos, inventario físico y NIC 2» pide CUATRO
   *     a 320 px, tres a 360 y dos a 375.
   *
   * Con el tope en dos, ese título se leía cortado. Y el recorte no avisa: no
   * pone puntos suspensivos, simplemente se queda sin las últimas palabras.
   * Un estudiante en un teléfono de 320 px leía «…inventario» y no sabía que
   * faltaba «físico y NIC 2».
   *
   * Cuatro renglones los usa solo quien los necesita: el tope recorta, no
   * reserva, así que los otros nueve títulos siguen ocupando lo que ocupaban.
   * El coste es una cabecera de 82 px en UNA vista de diez, a UN ancho, contra
   * perder palabras en la principal señal de orientación de la pantalla. La
   * regla de la casa ya eligió: romper renglón sí, desaparecer no.
   *
   * SE PUEDE HACER MEJOR, y no toca a esta hoja: medido, ese título en su
   * propio renglón a ancho completo entra en dos (41 px). Eso mueve el orden
   * de cesión de la cabecera, que es de Xeno; queda dicho y no bloquea esto.
   *
   * SI ENTRA UN TÍTULO MÁS LARGO, hay que volver a medir. Esto no se deduce
   * del CSS: scripts/t7/medir-titulo-320.mjs y la sonda de títulos.
   */
  .fae-cabecera-titulo > h1 {
    flex-shrink: 1;
    min-width: 0;
    white-space: normal;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    /*
     * Lo único que los siete rodeos en línea tenían y esta regla no:
     * overflow-wrap. Sin él, una palabra más ancha que la cabecera —un título
     * sin espacios donde partir— se sale por el lado en vez de partirse, y el
     * recorte de dos renglones no la alcanza. Con "anywhere" parte donde haga
     * falta, que es mejor que salirse.
     *
     * Las siete vistas lo tenían porque cada una tropezó con lo mismo. Sube
     * aquí para que la octava no tenga que tropezar.
     *
     * (Sin comillas invertidas en este comentario: está DENTRO de la plantilla
     * de CSS, y una comilla invertida la cierra. El repertorio no lo nota —lee
     * este archivo como texto— y solo lo caza la compilación.)
     */
    overflow-wrap: anywhere;
  }

  .fae-gsi-ancho { display: none; }
  .fae-gsi-icono { display: block; }

  /*
   * ═══════════ LA PASTILLA COMPACTA ═══════════
   *
   * Solo en vistas CON título: el avatar se va y queda el número con su «FP»
   * en peso ligero. No desaparece ni cambia de forma —mismo fondo, mismo
   * borde, mismo menú al tocarla—: se encoge.
   *
   * Que el avatar salga del header dentro de una actividad es deliberado: ahí
   * los FP en vivo importan más que la identidad, y el avatar sigue entero en
   * el perfil, la portada, el ranking y las ligas.
   */
  .fae-cuenta-compacta .fae-cuenta-avatar { display: none; }
  .fae-cuenta-compacta { padding-left: 14px !important; }
  .fae-cuenta-compacta .fae-cuenta-sufijo { font-weight: 400; opacity: 0.66; }
}

/*
 * Y si ni con eso cabe —pantallas de 320 px, que existen— el número se queda
 * solo. Es lo último que cede, y nunca cede del todo: la lectura de FP no
 * desaparece en ningún ancho.
 */
@media (max-width: ${ANCHO_MINIMO_SUFIJO}px) {
  .fae-cuenta-compacta .fae-cuenta-sufijo { display: none; }
}
@keyframes fae-atajo-entra { from { opacity: 0; transform: translateX(6px); } to { opacity: 1; transform: none; } }
.fae-atajo-entra { animation: fae-atajo-entra 0.2s ease-out; }
@media (prefers-reduced-motion: reduce) { .fae-atajo-entra { animation: none; } }
`;
const EstiloCuenta = () => <style>{CSS_CUENTA}</style>;

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS FP DE LA PASTILLA, Y POR QUÉ SUBEN CONTANDO.
 *
 * ═══════════ DE DÓNDE SALE EL NÚMERO ═══════════
 *
 * De dos sitios que se suman, y hace falta que sean dos:
 *
 *   · profiles.points, que es la verdad, pero se lee UNA VEZ al abrir sesión.
 *     Terminar una actividad no lo vuelve a leer.
 *   · el canal de FP (fp/aviso.js), que emite DESPUÉS de que el servidor
 *     confirmó la escritura. Nunca se cuenta un punto que la base no tenga.
 *
 * Así que se enseña `points + lo ganado desde que se leyó`. Y en cuanto el
 * perfil trae un total nuevo —al recargar, o si alguien lo refresca— el
 * acumulado vuelve a cero: ese total ya lo incluye, y sumarlo otra vez lo
 * contaría dos veces.
 *
 * ═══════════ SOLO SE ANIMA LO QUE SE GANA ═══════════
 *
 * Al abrir la página el número aparece puesto, sin contar desde cero: ahí no se
 * ha ganado nada, solo se ha leído. El conteo es la confirmación de un FP
 * nuevo, y va con el aviso «+X FP» que ya sale en la esquina.
 *
 * Con «reducir movimiento» no se cuenta: el número salta al valor nuevo. La
 * información es la misma; lo que se quita es el recorrido.
 * ═══════════════════════════════════════════════════════════════════════════
 */
function useContadorFP(base) {
  const [mostrado, setMostrado] = useState(base);
  /* Lo ganado en esta sesión, aparte del total que trajo el perfil. */
  const ganado = useRef(0);
  const animacion = useRef(0);
  const actual = useRef(base);

  const fijar = useCallback((v) => {
    actual.current = v;
    setMostrado(v);
  }, []);

  /* El perfil manda: su total se pone sin animar, y reinicia lo acumulado. */
  useEffect(() => {
    ganado.current = 0;
    fijar(base);
  }, [base, fijar]);

  useEffect(() => {
    const dejar = escucharFP(({ fp }) => {
      const suma = Math.round(Number(fp) || 0);
      if (suma <= 0) return; // una repetición paga 0: no hay nada que contar
      ganado.current += suma;
      const destino = actual.current + suma;

      const quieto = typeof window !== "undefined"
        && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      if (quieto || typeof requestAnimationFrame !== "function") {
        fijar(destino);
        return;
      }

      cancelAnimationFrame(animacion.current);
      const desde = actual.current;
      let inicio = null;
      const paso = (t) => {
        if (inicio === null) inicio = t;
        const progreso = (t - inicio) / DURACION_CONTEO_MS;
        fijar(valorEnProgreso(desde, destino, progreso));
        if (progreso < 1) animacion.current = requestAnimationFrame(paso);
      };
      animacion.current = requestAnimationFrame(paso);
    });
    return () => {
      dejar();
      cancelAnimationFrame(animacion.current);
    };
  }, [fijar]);

  return mostrado;
}

/* Las dos piezas repetidas del menú, para que sus medidas se toquen en un sitio. */
function Divisor() {
  return (
    <div
      aria-hidden="true"
      style={{ height: "1px", background: "rgba(248,249,250,0.10)", margin: "6px 4px" }}
    />
  );
}

/*
 * Una opción del menú. `punto` pinta el aviso ámbar de la Tienda.
 *
 * EL PUNTO NO VA SOLO: lleva su propio texto para lectores de pantalla. Un
 * color sin palabra no informa a quien no lo ve, y aquí además es la única
 * diferencia entre «Tienda» y «Tienda, y hay algo que ya puedes comprar».
 *
 * Ámbar y no coral, y esto no es una excepción a la regla del sitio: el coral
 * significa error en toda la interfaz, y esto no es un error — es un aviso. El
 * ámbar ya existe en theme.js para exactamente este escalón.
 */
function OpcionMenu({ onClick, punto = false, children }) {
  return (
    <button
      type="button"
      data-opcion-menu
      onClick={onClick}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: "8px",
        textAlign: "left", fontFamily: "Inter, sans-serif", fontSize: "13.5px",
        /* 44 px, el mínimo que un dedo acierta (kit.md). Estaba en 40. Ocupa el
           ancho entero del menú, así que crecer solo hace el menú 4 px más alto
           por opción y no mueve nada de lado. */
        minHeight: "44px", padding: "9px 10px", borderRadius: "9px", cursor: "pointer",
        background: "transparent", border: "none", color: "rgba(248,249,250,0.8)",
      }}
    >
      {children}
      {punto && (
        <>
          <span
            data-punto-tienda
            aria-hidden="true"
            style={{
              width: "7px", height: "7px", borderRadius: "999px",
              backgroundColor: FAE.ambar, flexShrink: 0,
            }}
          />
          <span style={POSICION_LECTOR}>Hay algo que ya puedes comprar</span>
        </>
      )}
    </button>
  );
}

/* Visible para lectores de pantalla y para nadie más. */
const POSICION_LECTOR = {
  position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px",
  overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0,
};

const ENVOLTORIO = {
  position: "fixed",
  top: "clamp(14px, 2.4vh, 24px)",
  right: "clamp(14px, 2.4vw, 24px)",
  zIndex: 40,
};

export default function AccountControl({ conTitulo = false }) {
  const { disponible, cargando, perfil, session, cerrarSesion } = useAuth();

  /* Sin credenciales configuradas no se anuncia un login que no existe. */
  if (!disponible) return null;

  /* Mientras se resuelve la sesión guardada no se parpadea entre estados. */
  if (cargando) {
    return (
      <>
        <EstiloCuenta />
        <div style={{ ...ENVOLTORIO, width: "1px", height: "1px" }} />
      </>
    );
  }

  if (!session) {
    return (
      <div style={ENVOLTORIO}>
        <EstiloCuenta />
        <GoogleSignInButton size="medium" adaptable />
      </div>
    );
  }

  /* Una por cuenta: si se entra con otra, el atajo vuelve a decidir desde cero. */
  return <ConSesion key={session.user.id} usuarioId={session.user.id} perfil={perfil} cerrarSesion={cerrarSesion} conTitulo={conTitulo} />;
}

function ConSesion({ usuarioId, perfil, cerrarSesion, conTitulo = false }) {
  const nav = useContext(NavigationContext);
  const [abierto, setAbierto] = useState(false);
  const caja = useRef(null);

  /*
   * ═══════════ QUE NO APAREZCA TARDE ═══════════
   *
   * La respuesta del servidor llega un momento después que la sesión, y un
   * botón que asoma cuando la cuenta ya está pintada se lee como algo roto. Si
   * este navegador ya vio al servidor confirmar a ESTA cuenta como docente, el
   * atajo sale a la vez que la cuenta y la respuesta solo lo confirma —o lo
   * quita, si se le retiró el acceso—. La primera vez no hay nada que
   * recordar: entonces entra con un fundido corto, que se lee como intención.
   */
  const acceso = useAccesoDocente();
  const [presumido] = useState(() => recordadoComoDocente(usuarioId));
  const esDocente = acceso.pendiente ? presumido : acceso.esDocente;
  const [estabaAlMontar] = useState(esDocente);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e) => { if (caja.current && !caja.current.contains(e.target)) setAbierto(false); };
    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, [abierto]);

  /* Con sesión pero sin perfil, el diálogo de apodo ya está encima. */
  const etiqueta = perfil?.nickname ?? "Tu cuenta";

  const fp = useContadorFP(Math.max(0, Math.floor(Number(perfil?.points) || 0)));
  const cristales = saldoDe(perfil);
  const racha = rachaVigente(perfil);

  /*
   * El punto de la Tienda se vuelve a calcular cada vez que se ABRE el menú, y
   * no una vez al montar: entre una apertura y la siguiente el estudiante pudo
   * entrar a la Tienda —y entonces ya no hay novedad— o ganar Cristales. Leer
   * localStorage al abrir cuesta nada y siempre dice la verdad.
   */
  const [punto, setPunto] = useState(false);
  useEffect(() => {
    if (abierto) setPunto(puntoDeTienda(usuarioId, perfil));
  }, [abierto, usuarioId, perfil]);

  /* La misma ruta con estado en el hash que usa el atajo de cada actividad. */
  const irAlPanel = () => { setAbierto(false); nav?.irA?.("docente"); };
  const irAPerfil = () => { setAbierto(false); nav?.irAPerfil?.(); };
  /* Directo a la sección del avatar, sin pasar por apodo y nombre real. */
  const irAMiAvatar = () => { setAbierto(false); nav?.irA?.("perfil", null, "avatar"); };
  const irATienda = () => { setAbierto(false); nav?.irATienda?.(); };

  return (
    <div style={ENVOLTORIO} ref={caja}>
      <EstiloCuenta />
      {esDocente && (
        <button
          type="button"
          className={`fae-atajo-pastilla${estabaAlMontar ? "" : " fae-atajo-entra"}`}
          onClick={irAlPanel}
          aria-label="Panel docente"
          style={{
            /*
             * Fuera del flujo, a la izquierda de la cuenta: su llegada no mueve
             * la pastilla de la cuenta ni un píxel, ni para el docente ni para
             * nadie. La pastilla que se ve lleva el relleno y la letra de la de
             * la cuenta, así que mide lo mismo que ella: dos pastillas de
             * distinta altura en la misma fila se leen como un error.
             *
             * SON 40 DE DIBUJO Y 44 DE TOQUE. Este comentario decía que 40 era
             * «el mínimo para el dedo», y el mínimo es 44 (kit.md). Subir la
             * caja a 44 rompería lo de arriba —dejaría de medir lo que la
             * pastilla de la cuenta—, así que el toque lo da un ::after de
             * max(100%, 44px) centrado, en la hoja de abajo: el dibujo no se
             * mueve y el dedo acierta. Es la misma solución que el logo y la X
             * del diálogo.
             */
            position: "absolute",
            right: "calc(100% + 8px)",
            top: 0,
            bottom: 0,
            margin: "auto 0",
            height: "40px",
            alignItems: "center",
            padding: 0,
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "8px 14px",
              borderRadius: "999px",
              whiteSpace: "nowrap",
              fontFamily: "Sora, sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              color: FAE.text,
              /* El teal del bloque del perfil, a la intensidad de la pastilla de la cuenta. */
              background: "rgba(42,157,143,0.14)",
              border: `1px solid ${FAE.teal}99`,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <BarChart2 size={15} color={FAE.teal} aria-hidden="true" />
            Panel docente
          </span>
        </button>
      )}
      <button
        type="button"
        className={`fae-cuenta-boton${conTitulo ? " fae-cuenta-compacta" : ""}`}
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        /*
         * El nombre ya no se ve en la pastilla —vive en la cabecera del menú—
         * así que aquí es donde queda para quien no ve la pantalla, junto con
         * los FP escritos con su unidad, que en el teléfono tampoco se pintan.
         */
        aria-label={`Tu cuenta: ${etiqueta}, ${formatoFP(fp)} FP`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          fontFamily: "Sora, sans-serif",
          fontSize: "13px",
          fontWeight: 600,
          padding: "8px 14px",
          borderRadius: "999px",
          cursor: "pointer",
          background: "rgba(248,249,250,0.06)",
          border: "1px solid rgba(248,249,250,0.16)",
          color: FAE.text,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        {/*
          El avatar sustituye a la inicial en un círculo: es la figura que el
          estudiante eligió, y la misma que sale en el ranking y en la liga.
        */}
        {/*
          El avatar va envuelto, y no es un adorno del marcado: Avatar se pinta
          con `display: block` en su style inline, y un estilo inline gana a
          cualquier regla de hoja. Sin esta envoltura —que no lleva style— la
          pastilla compacta no podría esconderlo sin recurrir a !important.
        */}
        <span className="fae-cuenta-avatar" style={{ flexShrink: 0 }}>
          <Avatar perfil={perfil} tamano={28} />
        </span>
        {/*
          Y los FP, que es lo que esta pastilla viene a enseñar en todas las
          páginas. El número lleva tabular-nums para que no baile de ancho
          mientras cuenta: sin eso, cada cifra que cambia mueve la pastilla.
        */}
        <span
          data-fp-pastilla
          style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}
        >
          {formatoFP(fp)}
          <span className="fae-cuenta-sufijo">{" FP"}</span>
        </span>
      </button>

      {abierto && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0, minWidth: "232px",
            borderRadius: "14px", background: "#16233A",
            border: "1px solid rgba(248,249,250,0.14)", padding: "8px",
            boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
          }}
        >
          {/* Donde la pastilla no cabe, el atajo va aquí, primero. */}
          {esDocente && (
            <button
              type="button"
              className="fae-atajo-menu"
              onClick={irAlPanel}
              aria-label="Panel docente"
              style={{
                width: "100%", alignItems: "center", gap: "8px", minHeight: "44px",
                marginBottom: "6px", padding: "0 10px", borderRadius: "9px", cursor: "pointer",
                fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 600, textAlign: "left",
                background: "rgba(42,157,143,0.14)", border: `1px solid ${FAE.teal}99`, color: FAE.text,
              }}
            >
              <BarChart2 size={16} color={FAE.teal} aria-hidden="true" />
              Panel docente
            </button>
          )}
          {/*
            ═══════════ LA FICHA DE IDENTIDAD ═══════════

            El nombre del estudiante vive AQUÍ desde que la pastilla pasó a
            enseñar los FP. Debajo, las tres cifras que se miran de reojo:
            FP, Cristales y racha. El cristal es el icono facetado del sitio,
            nunca un emoji: es el mismo que se ve en la Tienda y en el perfil.
          */}
          {perfil && (
            <div
              data-ficha-cuenta
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 10px 10px" }}
            >
              <Avatar perfil={perfil} tamano={40} style={{ flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600, color: FAE.text,
                    margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}
                >
                  {etiqueta}
                </p>
                <p
                  style={{
                    display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap",
                    fontSize: "12.5px", color: "rgba(248,249,250,0.72)", margin: 0,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  <span>{formatoFP(fp)} FP</span>
                  <span aria-hidden="true" style={{ opacity: 0.45 }}>·</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                    {cristales}
                    <IconoCristal tamano={11} />
                  </span>
                  <span aria-hidden="true" style={{ opacity: 0.45 }}>·</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                    <IconoRacha tamano={13} encendida={racha > 0} />
                    {racha === 1 ? "1 día" : `${racha} días`}
                  </span>
                </p>
              </div>
            </div>
          )}

          <Divisor />

          <OpcionMenu onClick={irAPerfil}>Mi perfil</OpcionMenu>
          <OpcionMenu onClick={irAMiAvatar}>Mi avatar</OpcionMenu>
          <OpcionMenu onClick={irATienda} punto={punto}>Tienda</OpcionMenu>

          <Divisor />

          <OpcionMenu onClick={() => { setAbierto(false); cerrarSesion(); }}>Cerrar sesión</OpcionMenu>
        </div>
      )}
    </div>
  );
}
