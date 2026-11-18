import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { BarChart2, Radio, UserRound, Users, PawPrint, ShoppingBag, LogOut, X, ChevronRight } from "lucide-react";
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
import AvatarEstudiante from "../avatar/AvatarEstudiante.jsx";
import IconoCristal from "../shared/IconoCristal.jsx";
import IconoRacha from "../shared/IconoRacha.jsx";
import GoogleSignInButton from "./GoogleSignInButton.jsx";

/*
 * Control de cuenta fijo arriba a la IZQUIERDA (desde el 15-nov; antes a la derecha), en todas las páginas.
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
 * ═══════════ EL ATAJO AL PANEL DOCENTE VIVE DENTRO DEL PANEL (18-nov) ═══════════
 *
 * Hasta el 18 de noviembre un docente tenía además una pastilla teal flotante,
 * «Panel docente», junto a la cuenta (desde 768 px). Mateo reportó que ese
 * globo se quedaba encima estorbando al entrar a otras partes —en el propio
 * panel docente tapaba las tarjetas de «Clase en vivo»—. Ahora el atajo es la
 * PRIMERA opción de la barra lateral, a todos los anchos: dos toques, nada
 * flotando de más, y la cabecera ya no tiene que reservarle hueco.
 *
 * La pregunta de si es docente es la misma de todo el sitio —useAccesoDocente,
 * una llamada por carga compartida con el perfil, el panel y las actividades—,
 * y un invitado no la hace: sin sesión este trozo ni se monta.
 */
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
 * título.
 *
 * ESTUVO EN 76 Y NO ALCANZABA. Esos 76 salían de medir la pastilla con una
 * cifra corta; con cuatro cifras y el sufijo llegaba a 85 y con seis a 102, así
 * que se montaba sobre el título. Ahora el sufijo no sale en vistas con título
 * (ver la regla de abajo), y el peor caso medido es la cifra sola de seis
 * dígitos: 82 px. La reserva son esos 82 más 6 de separación.
 *
 * Si la pastilla vuelve a crecer —otro sufijo, otra cifra, un icono— hay que
 * volver a medir esto. El número de aquí no se deduce del diseño: se mide con
 * la tipografía real sobre el paquete construido.
 */
const RESERVA_MOVIL_COMPACTA = 88;

/*
 * Por debajo de esto ni «FP» cabe al lado del número, y se queda solo la cifra.
 * 360 px es el ancho de un Galaxy A-algo, que es lo que de verdad se ve en el
 * salón; los 320 de un iPhone SE viejo entran de sobra por debajo.
 */
const ANCHO_MINIMO_SUFIJO = 360;

/*
 * Lo que miden las piezas de arriba a la izquierda en escritorio, con la
 * tipografía real (scripts/cuenta/capturas-sidebar.mjs): la cuenta con avatar
 * mide 111 px con «988 FP» y unos 135 con «12.500 FP»; SIN sesión ahí va el
 * botón de Google, que mide 181. Se reserva para el más ancho de los dos —un
 * visitante tampoco puede tener el botón de volver tapado—.
 */
const ANCHO_PASTILLA = 184;

const CSS_CUENTA = `
.fae-gsi-icono { display: none; }
/* Normal aquí, para que la regla que lo esconde viva también en la hoja. */
.fae-cuenta-avatar { display: inline-flex; }
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
  .fae-cabecera-titulo { padding-left: ${RESERVA_MOVIL_COMPACTA}px; }
  /* Las cabeceras sin título llevan la pastilla completa, con avatar. */
  .fae-cabecera { padding-left: ${RESERVA_MOVIL}px; }

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
   * resto son el botón de volver y la reserva de la pastilla—:
   *
   *   · «Inventarios III: descuentos, inventario físico y NIC 2» pedía CUATRO
   *     renglones a 320 px (82 px de cabecera). Con el tope en dos se leía
   *     cortado, y el recorte no avisa: no pone puntos suspensivos, se queda
   *     sin las últimas palabras.
   *   · Hoy (#259 lo acortó a «…descuentos, conteo y NIC 2») pide TRES a 320 y
   *     a 360 —61 px— y DOS a 375. De los diez títulos de Contabilidad, nueve
   *     caben en uno o dos renglones: la fila mide 38–44 px, que es lo que
   *     mide el botón de volver.
   *
   * El tope recorta, no reserva: los títulos cortos siguen ocupando lo que
   * ocupaban. La regla de la casa ya eligió: romper renglón sí, desaparecer no.
   *
   * ═══════════ DECIDIDO: SE QUEDA EN UNA FILA (Xeno, 15 oct.) ═══════════
   *
   * Se midió la alternativa —[volver][pastilla] arriba y el título debajo, a
   * ancho completo— y pierde. Ese título en su propio renglón cabe en dos
   * (41 px), pero la fila de arriba cuesta 44 px SIEMPRE: 85 px para el peor
   * título contra 61 de hoy, y 44 + 20 = 64 para uno de un renglón contra 44.
   * Es decir: gasta más en los nueve títulos que hoy caben, para ahorrar dos
   * renglones en el único que ya no necesita cuatro. La cabecera de una fila
   * es la que menos pantalla le quita al ejercicio.
   *
   * Si un título pasa de tres renglones a 320 px, la salida no es esta hoja:
   * es un título más corto (un nombre de tema es una etiqueta, no una frase).
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
 * ═══════════ EL «FP» SE VA EN TODA VISTA CON TÍTULO, Y ESTO SE MIDIÓ ═══════════
 *
 * Esto quitaba el sufijo solo por debajo de 361 px. Medido el 16 de octubre con
 * la tipografía real a 13 px y 600, sumándole los 28 px de relleno de la
 * pastilla, contra los 76 px que la vista con título le reserva:
 *
 *      FP        solo la cifra        con « FP»
 *     250           53 px               73 px
 *   2.500           65 px               85 px   ← ya no cabe
 *  12.500           74 px               93 px
 * 112.500           82 px              102 px
 *
 * O sea que a 375 px CUALQUIER estudiante con cuatro cifras tapaba el título,
 * y es la mayoría. El número no cede nunca —eso sigue igual—, pero el sufijo
 * sí: en una vista con título el hueco es el título, y «FP» es decoración que
 * el contexto ya dice. Por debajo de 361 ya se iba; ahora se va siempre que la
 * pastilla va compacta, que es exactamente cuando hay título.
 */
.fae-cuenta-compacta .fae-cuenta-sufijo { display: none; }

/*
 * ═══════════ LA CUENTA A LA IZQUIERDA, EL LOGO A LA DERECHA (15-nov) ═══════════
 *
 * Orden de Mateo: la cuenta —y el panel que abre— vive a la izquierda, como en
 * casi toda aplicación; la marca pasa al otro extremo de la cabecera. Se hace
 * aquí, con una regla, y no tocando el orden de veintiséis cabeceras: el logo
 * lleva .fae-cabecera-marca en todas, y «order» + «margin-left: auto» lo
 * mandan al final de su fila. El divisor que lo separaba del botón de volver
 * ya no separa nada y se fue del marcado.
 */
.fae-cabecera-marca { order: 99; margin-left: auto; }

/*
 * Y el hueco, que ahora es a la izquierda. En escritorio la columna de las
 * vistas mide 860 px y la pastilla vive fuera de ella mientras el margen
 * alcance; cuando no, la cabecera se corre lo justo. La cuenta:
 *
 *   inicio de la cabecera = margen + relleno (24)
 *   fin de la pastilla    = 24 + ancho de la pastilla
 *   hueco pedido          = 12
 *
 * Con 860 de columna se sobra un poco en las de 680 o 720; sobrar es correr la
 * cabecera unos píxeles, faltar es pisar el botón de volver. El ancho de las
 * pastillas se midió con la tipografía real: ver scripts/cuenta/.
 */
@media (min-width: ${ANCHO_ESTRECHO + 1}px) {
  .fae-cabecera, .fae-cabecera-titulo {
    padding-left: max(0px, calc(${ANCHO_PASTILLA + 12}px - max(0px, (100vw - 860px) / 2)));
  }
}

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

/* Visible para lectores de pantalla y para nadie más. */
const POSICION_LECTOR = {
  position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px",
  overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0,
};

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL PANEL DE LA CUENTA — una barra lateral que entra desde la izquierda.
 *
 * Hasta el 15 de noviembre era un desplegable de 232 px que caía encima de la
 * página desde la esquina derecha, solo texto. Mateo pidió lo que hace casi
 * cualquier aplicación hoy: la cuenta a la izquierda, un panel que se DESLIZA
 * desde ese borde —no una caja que aparece encima de otra— con el perfil y sus
 * números arriba y un icono por opción. El logo pasa a la derecha de la
 * cabecera, para que cada lado tenga un papel: a la izquierda, tú; a la
 * derecha, la marca.
 *
 * Lo que se cuidó, y por qué:
 *
 *   · ENTRA Y SALE ANIMADO. 360 ms con una curva que frena al final
 *     (cubic-bezier .22,1,.36,1): rápido al arrancar, suave al llegar. Las
 *     opciones entran una detrás de otra, 30 ms de escalón, para que el ojo
 *     las lea como lista. Al cerrar se queda montado lo que dura la salida
 *     (MS_SALIDA) y luego se desmonta.
 *   · CON «REDUCIR MOVIMIENTO» NO SE DESLIZA: aparece y desaparece. La
 *     información es la misma; lo que se quita es el recorrido.
 *   · UN VELO OSCURECE LA PÁGINA y es la forma más grande de cerrar: tocar
 *     fuera. También cierran Escape y la X de arriba (44 px, el mínimo del
 *     dedo según kit.md).
 *   · EL FOCO ENTRA AL PANEL al abrir y vuelve a la pastilla al cerrar, para
 *     quien navega con teclado.
 *   · LOS NÚMEROS VAN EN TRES FICHAS: FP, Cristales y racha, con el cristal
 *     facetado y la llama del sitio —nunca emojis—, cifras tabulares.
 *   · EL PUNTO ÁMBAR DE LA TIENDA sigue igual, con su texto para lectores.
 * ═══════════════════════════════════════════════════════════════════════════
 */
const MS_SALIDA = 260;

const CSS_PANEL = `
@keyframes fae-panel-entra { from { transform: translateX(-104%); } to { transform: none; } }
@keyframes fae-panel-sale { from { transform: none; } to { transform: translateX(-104%); } }
@keyframes fae-velo-entra { from { opacity: 0; } to { opacity: 1; } }
@keyframes fae-velo-sale { from { opacity: 1; } to { opacity: 0; } }
@keyframes fae-opcion-entra { from { opacity: 0; transform: translateX(-14px); } to { opacity: 1; transform: none; } }
.fae-panel-cuenta { animation: fae-panel-entra 360ms cubic-bezier(.22,1,.36,1) both; }
.fae-panel-cuenta.fae-saliendo { animation: fae-panel-sale ${MS_SALIDA}ms cubic-bezier(.55,0,.75,.2) both; }
.fae-velo-cuenta { animation: fae-velo-entra 280ms ease-out both; }
.fae-velo-cuenta.fae-saliendo { animation: fae-velo-sale ${MS_SALIDA}ms ease-in both; }
.fae-panel-cuenta [data-entra] { animation: fae-opcion-entra 320ms cubic-bezier(.22,1,.36,1) both; animation-delay: calc(90ms + var(--i, 0) * 30ms); }
.fae-panel-cuenta.fae-saliendo [data-entra] { animation: none; }
.fae-opcion-cuenta { transition: background-color 160ms ease, color 160ms ease; }
.fae-opcion-cuenta .fae-opcion-icono { transition: background-color 160ms ease, color 160ms ease, transform 200ms cubic-bezier(.22,1,.36,1); }
.fae-opcion-cuenta .fae-opcion-flecha { opacity: 0; transform: translateX(-4px); transition: opacity 160ms ease, transform 200ms ease; }
.fae-opcion-cuenta:hover, .fae-opcion-cuenta:focus-visible { background-color: rgba(248,249,250,0.06); color: #F8F9FA; }
.fae-opcion-cuenta:hover .fae-opcion-icono, .fae-opcion-cuenta:focus-visible .fae-opcion-icono { transform: scale(1.06); }
.fae-opcion-cuenta:hover .fae-opcion-flecha, .fae-opcion-cuenta:focus-visible .fae-opcion-flecha { opacity: 0.55; transform: none; }
.fae-opcion-cuenta:focus-visible, .fae-cerrar-panel:focus-visible { outline: 2px solid ${FAE.teal}; outline-offset: 2px; }
.fae-opcion-salir:hover, .fae-opcion-salir:focus-visible { background-color: rgba(231,111,81,0.10); color: #F4A28C; }
.fae-opcion-salir:hover .fae-opcion-icono, .fae-opcion-salir:focus-visible .fae-opcion-icono { background-color: rgba(231,111,81,0.16); color: #F4A28C; }
.fae-cerrar-panel { transition: background-color 160ms ease; }
.fae-cerrar-panel:hover { background-color: rgba(248,249,250,0.10) !important; }
@media (prefers-reduced-motion: reduce) {
  .fae-panel-cuenta, .fae-panel-cuenta.fae-saliendo, .fae-velo-cuenta, .fae-velo-cuenta.fae-saliendo,
  .fae-panel-cuenta [data-entra] { animation: none; }
  .fae-opcion-cuenta .fae-opcion-icono, .fae-opcion-cuenta .fae-opcion-flecha { transition: none; }
}
`;

/* Cada opción tiene su color de icono: se reconoce de reojo, sin leer. */
const TONOS = {
  vivo: "#E76F51",
  perfil: "#8FB8E8",
  amigos: "#2A9D8F",
  avatar: "#C39BD3",
  tienda: "#E9C46A",
  docente: "#2A9D8F",
  salir: "rgba(248,249,250,0.6)",
};

function Divisor() {
  return (
    <div
      aria-hidden="true"
      style={{ height: "1px", background: "rgba(248,249,250,0.08)", margin: "10px 6px" }}
    />
  );
}

/*
 * Una opción del panel: icono en su pastilla de color, el texto y una flecha
 * que asoma al pasar el ratón. `punto` pinta el aviso ámbar de la Tienda.
 *
 * EL PUNTO NO VA SOLO: lleva su propio texto para lectores de pantalla. Un
 * color sin palabra no informa a quien no lo ve, y aquí además es la única
 * diferencia entre «Tienda» y «Tienda, y hay algo que ya puedes comprar».
 *
 * Ámbar y no coral: el coral significa error en toda la interfaz, y esto es
 * un aviso. El ámbar ya existe en theme.js para exactamente este escalón.
 */
function OpcionMenu({ onClick, icono: Icono, tono, punto = false, salir = false, indice = 0, children }) {
  return (
    <button
      type="button"
      data-opcion-menu
      data-entra
      className={`fae-opcion-cuenta${salir ? " fae-opcion-salir" : ""}`}
      onClick={onClick}
      style={{
        "--i": indice,
        width: "100%", display: "flex", alignItems: "center", gap: "12px",
        textAlign: "left", fontFamily: "Inter, sans-serif", fontSize: "14.5px", fontWeight: 500,
        /* 48 px: por encima de los 44 que un dedo acierta (kit.md). */
        minHeight: "48px", padding: "6px 10px", borderRadius: "12px", cursor: "pointer",
        background: "transparent", border: "none", color: "rgba(248,249,250,0.86)",
      }}
    >
      <span
        className="fae-opcion-icono"
        aria-hidden="true"
        style={{
          width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          backgroundColor: salir ? "rgba(248,249,250,0.06)" : `${tono}1F`,
          color: tono,
        }}
      >
        <Icono size={18} strokeWidth={2} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>{children}</span>
      {punto && (
        <>
          <span
            data-punto-tienda
            aria-hidden="true"
            style={{
              width: "8px", height: "8px", borderRadius: "999px",
              backgroundColor: FAE.ambar, flexShrink: 0,
              boxShadow: `0 0 0 4px ${FAE.ambar}26`,
            }}
          />
          <span style={POSICION_LECTOR}>Hay algo que ya puedes comprar</span>
        </>
      )}
      {!salir && <ChevronRight className="fae-opcion-flecha" size={16} aria-hidden="true" style={{ flexShrink: 0 }} />}
    </button>
  );
}

/* Una de las tres fichas de números del encabezado. */
function Cifra({ valor, etiqueta, icono, indice }) {
  return (
    <div
      data-entra
      style={{
        "--i": indice,
        display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px",
        padding: "10px 10px 9px", borderRadius: "12px", minWidth: 0,
        background: "rgba(248,249,250,0.045)", border: "1px solid rgba(248,249,250,0.08)",
      }}
    >
      <span
        style={{
          display: "inline-flex", alignItems: "center", gap: "5px",
          fontFamily: "Sora, sans-serif", fontSize: "16px", fontWeight: 700, color: FAE.text,
          fontVariantNumeric: "tabular-nums", lineHeight: 1.1, maxWidth: "100%", overflowWrap: "anywhere",
        }}
      >
        {icono}
        {valor}
      </span>
      <span style={{ fontSize: "11.5px", color: "rgba(248,249,250,0.6)", lineHeight: 1.2 }}>{etiqueta}</span>
    </div>
  );
}

/* La pastilla «FP» en ámbar, a la medida de las otras dos insignias. */
function MarcaFP() {
  return (
    <span
      aria-hidden="true"
      style={{
        fontFamily: "Sora, sans-serif", fontSize: "9.5px", fontWeight: 800, letterSpacing: "0.02em",
        color: "#1A2236", background: FAE.ambar, borderRadius: "5px", padding: "2px 4px", lineHeight: 1,
      }}
    >
      FP
    </span>
  );
}

/*
 * ═══════════ SE QUEDA FIJA, Y NUNCA TRANSPARENTE (Xeno, 15 oct.) ═══════════
 *
 * La Célula C reportó que, sin sesión, «Entrar» tapa el texto al bajar. Lo que
 * se vio al medirlo en la página no era que el control esté fijo, sino que
 * estaba HUECO: la pastilla de la cuenta pintaba un 6 % de blanco y el botón de
 * «Entrar» —el que sale cuando la librería de Google no carga: red del salón,
 * bloqueador— no pintaba nada. El texto que pasaba por debajo se leía a través
 * del control, y las dos cosas se estorbaban: «suma de todos» pisado por
 * «Entrar».
 *
 * Fijo se queda, y es deliberado: dentro de una actividad los FP en vivo
 * importan más que la identidad (ver «LA PASTILLA COMPACTA» arriba), y un
 * contador que se va con el scroll deja de ser lo que se mira al acertar. Lo
 * que no puede pasar es que el contenido se lea a través de él. Un control que
 * flota sobre el texto tiene que TAPARLO, no mezclarse con él: tapar un
 * trozo de línea mientras pasa es lo que hace cualquier botón fijo; leer dos
 * textos encimados no lo hace ninguno.
 *
 * NO SE ESCONDE AL BAJAR (Xeno, 24 oct., #349). El 18 de octubre se probó a
 * ocultarla al desplazar y se deshizo: escondía la entrada a la cuenta y el
 * «Entrar», podía esconder la confirmación de FP justo al ganarla, y no
 * arreglaba lo medido —el texto tapado con el scroll DETENIDO—. Eso se arregla
 * en las vistas: en Contabilidad todo destino de un desplazamiento automático
 * lleva `scroll-margin-top: 84px` (FICHA_RESERVA en theme.js, regla
 * .fae-reserva-ficha en global.css).
 * Texto que pasa por debajo mientras se hace scroll sigue siendo aceptable.
 *
 * Por eso toda pieza flotante de este archivo lleva el mismo fondo casi
 * opaco —el del menú que abre, #16233A— y conserva su borde y su desenfoque.
 * El botón de Google de verdad (filled_black) ya es opaco: no se toca.
 */
export const FONDO_FLOTANTE = "rgba(22,35,58,0.97)";

const ENVOLTORIO = {
  position: "fixed",
  top: "clamp(14px, 2.4vh, 24px)",
  /* A la izquierda desde el 15-nov (orden de Mateo): el panel sale de este lado. */
  left: "clamp(14px, 2.4vw, 24px)",
  zIndex: 40,
  /* En los cambios de pantalla se queda quieto en su esquina (movimiento.css). */
  viewTransitionName: "fae-cuenta",
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
        <GoogleSignInButton size="medium" adaptable fondo={FONDO_FLOTANTE} />
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

  /*
   * Abierto es lo que se pidió; montado, lo que se pinta. Al cerrar, el panel
   * se queda MS_SALIDA en pantalla para que se le vea irse, y luego se quita.
   * Con «reducir movimiento» se quita en el acto: no hay salida que mirar.
   */
  const [montado, setMontado] = useState(false);
  const panel = useRef(null);
  const pastillaRef = useRef(null);
  const cerrar = useCallback(() => setAbierto(false), []);

  useEffect(() => {
    if (abierto) { setMontado(true); return undefined; }
    if (!montado) return undefined;
    const quieto = typeof window !== "undefined"
      && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (quieto) { setMontado(false); return undefined; }
    const t = setTimeout(() => setMontado(false), MS_SALIDA);
    return () => clearTimeout(t);
  }, [abierto, montado]);

  /* Escape cierra; el foco entra al panel y, al cerrar, vuelve a la pastilla. */
  useEffect(() => {
    if (!abierto) return undefined;
    const tecla = (e) => { if (e.key === "Escape") setAbierto(false); };
    document.addEventListener("keydown", tecla);
    panel.current?.focus?.({ preventScroll: true });
    /* Con el panel abierto la página de debajo no se desplaza. */
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tecla);
      document.body.style.overflow = antes;
      if (pastillaRef.current && document.activeElement && panel.current?.contains?.(document.activeElement)) {
        pastillaRef.current.focus({ preventScroll: true });
      }
    };
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
  const irAAmigos = () => { setAbierto(false); nav?.irA?.("amigos"); };
  const irATienda = () => { setAbierto(false); nav?.irATienda?.(); };
  /* La clase en vivo: el estudiante entra con el código que proyecta su profesor. */
  const irAClaseEnVivo = () => { setAbierto(false); nav?.irA?.("vivo"); };

  return (
    /* Abierto, el control sube por encima de todo lo flotante (Bruno, avisos). */
    <div style={{ ...ENVOLTORIO, zIndex: montado ? 80 : ENVOLTORIO.zIndex }} ref={caja}>
      <EstiloCuenta />
      <button
        type="button"
        ref={pastillaRef}
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
          background: FONDO_FLOTANTE,
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
          <AvatarEstudiante perfil={perfil} tamano={28} />
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

      {montado && (
        <>
          <style>{CSS_PANEL}</style>
          {/* El velo: oscurece la página y, tocándolo, cierra. */}
          <div
            className={`fae-velo-cuenta${abierto ? "" : " fae-saliendo"}`}
            aria-hidden="true"
            onClick={cerrar}
            style={{
              position: "fixed", inset: 0, zIndex: 0,
              background: "rgba(6,12,24,0.58)",
              backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)",
            }}
          />
          <nav
            ref={panel}
            data-panel-cuenta
            className={`fae-panel-cuenta${abierto ? "" : " fae-saliendo"}`}
            aria-label="Tu cuenta"
            tabIndex={-1}
            style={{
              position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 1,
              width: "min(340px, 88vw)",
              display: "flex", flexDirection: "column",
              background: "linear-gradient(180deg, #1B2B47 0%, #142139 46%, #111C31 100%)",
              borderRight: "1px solid rgba(248,249,250,0.10)",
              borderRadius: "0 22px 22px 0",
              boxShadow: "24px 0 64px rgba(0,0,0,0.45)",
              overflowY: "auto", overscrollBehavior: "contain",
              outline: "none",
            }}
          >
            {/*
              ═══════════ EL ENCABEZADO: QUIÉN ERES Y CUÁNTO LLEVAS ═══════════

              El nombre vive aquí desde que la pastilla pasó a enseñar los FP.
              Debajo, las tres cifras que se miran de reojo. Un brillo teal y
              coral detrás, apenas, para que el encabezado se lea como la
              tarjeta del estudiante y no como una fila más.
            */}
            <div
              style={{
                position: "relative", padding: "18px 16px 16px",
                background: "radial-gradient(120% 90% at 0% 0%, rgba(42,157,143,0.20), transparent 60%), radial-gradient(90% 70% at 100% 0%, rgba(231,111,81,0.12), transparent 65%)",
                borderBottom: "1px solid rgba(248,249,250,0.07)",
              }}
            >
              <button
                type="button"
                className="fae-cerrar-panel"
                onClick={cerrar}
                aria-label="Cerrar el panel de la cuenta"
                style={{
                  position: "absolute", top: "10px", right: "10px",
                  width: "44px", height: "44px", borderRadius: "999px",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(248,249,250,0.05)", border: "none", cursor: "pointer", color: FAE.text,
                }}
              >
                <X size={18} aria-hidden="true" />
              </button>

              {perfil && (
                <div data-ficha-cuenta>
                  <div data-entra style={{ "--i": 0, display: "flex", alignItems: "center", gap: "12px", paddingRight: "44px" }}>
                    <span
                      style={{
                        flexShrink: 0, padding: "3px", borderRadius: "999px",
                        background: `conic-gradient(from 210deg, ${FAE.teal}, ${FAE.ambar}, ${FAE.coral}, ${FAE.teal})`,
                      }}
                    >
                      <span style={{ display: "block", padding: "3px", borderRadius: "999px", background: "#17253F" }}>
                        <AvatarEstudiante perfil={perfil} tamano={52} />
                      </span>
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          fontFamily: "Sora, sans-serif", fontSize: "18px", fontWeight: 700, color: FAE.text,
                          letterSpacing: "-0.02em", lineHeight: 1.15,
                          /* El apodo nunca se corta con «…» (#546, inventario de #573): se parte. */
                          margin: "0 0 4px", overflowWrap: "anywhere",
                        }}
                      >
                        {etiqueta}
                      </p>
                      <button
                        type="button"
                        onClick={irAPerfil}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "2px", padding: 0,
                          background: "none", border: "none", cursor: "pointer",
                          fontSize: "12.5px", fontWeight: 500, color: "#7FD3C7",
                        }}
                      >
                        Ver mi perfil <ChevronRight size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px", marginTop: "16px" }}>
                    <Cifra indice={1} valor={formatoFP(fp)} etiqueta="Puntos FP" icono={<MarcaFP />} />
                    <Cifra indice={2} valor={cristales} etiqueta="Cristales" icono={<IconoCristal tamano={13} />} />
                    <Cifra
                      indice={3}
                      valor={racha}
                      /* «Racha», corto: «días de racha» partía en dos renglones y descuadraba las tres fichas. */
                      etiqueta="Racha"
                      icono={<IconoRacha tamano={15} encendida={racha > 0} />}
                    />
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: "12px 10px", display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
              {/* El atajo al panel docente, primero: ya no flota fuera (18-nov). */}
              {esDocente && (
                <button
                  type="button"
                  className="fae-atajo-menu fae-opcion-cuenta"
                  data-atajo-docente
                  onClick={irAlPanel}
                  aria-label="Panel docente"
                  data-entra
                  style={{
                    "--i": 4,
                    width: "100%", display: "flex", alignItems: "center", gap: "12px", minHeight: "48px",
                    marginBottom: "8px", padding: "6px 10px", borderRadius: "12px", cursor: "pointer",
                    fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600, textAlign: "left",
                    background: "rgba(42,157,143,0.14)", border: `1px solid ${FAE.teal}99`, color: FAE.text,
                  }}
                >
                  <span aria-hidden="true" style={{ width: "34px", height: "34px", borderRadius: "10px", display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(42,157,143,0.22)" }}>
                    <BarChart2 size={18} color={FAE.teal} />
                  </span>
                  Panel docente
                </button>
              )}

              <p data-entra style={{ "--i": 4, margin: "2px 10px 6px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(248,249,250,0.42)" }}>
                Tu espacio
              </p>
              <OpcionMenu indice={5} onClick={irAClaseEnVivo} icono={Radio} tono={TONOS.vivo}>Clase en vivo</OpcionMenu>
              <OpcionMenu indice={6} onClick={irAPerfil} icono={UserRound} tono={TONOS.perfil}>Mi perfil</OpcionMenu>
              <OpcionMenu indice={7} onClick={irAAmigos} icono={Users} tono={TONOS.amigos}>Amigos</OpcionMenu>
              <OpcionMenu indice={8} onClick={irAMiAvatar} icono={PawPrint} tono={TONOS.avatar}>Mi avatar</OpcionMenu>
              <OpcionMenu indice={9} onClick={irATienda} icono={ShoppingBag} tono={TONOS.tienda} punto={punto}>Tienda</OpcionMenu>

              <div style={{ flex: 1, minHeight: "8px" }} />
              <Divisor />

              <OpcionMenu indice={10} salir icono={LogOut} tono={TONOS.salir} onClick={() => { cerrar(); cerrarSesion(); }}>
                Cerrar sesión
              </OpcionMenu>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
