# Tablas de posiciones · Banda de decoración y catálogo de las tres materias (Hanayama, 24 oct 2026, v3)

> Lo pasó Yujiro al repo, tal cual, desde el chat de Hanayama (claude.ai/chat/930849c0-7d5d-431e-a1b2-30f3e19b19dc), porque su sesión no puede hacer push. Las piezas están en `piezas/` y el medidor en `scripts/decoracion/medir-tablas-hanayama.mjs`. El banco (`scripts/decoracion/harness-ranking/`) solo existe en su copia: quien construya monta el suyo con los casos de `CASOS` del medidor.

Esta v3 sustituye a la v1 y a la v2. Por orden de Mateo (vía Miku y Yujiro) entran **las tres materias** y **todas sus tablas**:
- `RankingFP` en el índice de cada tema;
- el ranking general del perfil;
- `LigaBoard`, que hoy solo se activa en Pensamiento Estratégico.

Ya no hay opt-in por materia: es **una sola versión**, y solo cambian las piezas según la materia. La forma (banda, tope de 3 bucles, Fae) es la de Ukyo en `vida-visual-v1.md` (PR #545, §5 y §7). La decoración **se agrega**: no se quita ni se cambia nada de lo que ya hay en las tablas.

**De dónde salen las cifras** [fuente]:
- Medí yo, el 24-oct, en Chromium (Playwright 1.63) con Inter y Sora de fontsource 5.3.0, sobre main 3723377.
- Monté `RankingFP` y `LigaBoard` tal cual, en la columna del índice del tema (relleno lateral de 24 px y caja de máx. 560). La del perfil es de máx. 680 y da el mismo ancho a 320 y a 375.
- Las filas son de mentira y van al tope real:
  - apodos de 20 caracteres, que es el límite del esquema (`0001_profiles.sql`);
  - FP de cinco cifras y tu puesto en el 127;
  - una liga de 17 con 3 en el podio y tú en el 14;
  - el botón de ánimo forzado en las filas ajenas.
- Banco: `scripts/decoracion/harness-ranking/`. Medidor: `BANDA=1 node scripts/decoracion/medir-tablas-hanayama.mjs`.
- Viewports: 320×568 y 375×667.

**Coordenadas.**
- Lo de cada tabla va relativo a la esquina superior izquierda de su tarjeta.
- Lo de la banda va relativo a la banda misma.
- La tarjeta mide **272 de ancho a 320** y **327 a 375**.
- El contenido empieza en x = 17 en `RankingFP` (16 de relleno y 1 de borde) y en x = 21 en `LigaBoard` (20 y 1).

## Reserva

Las piezas **1 a 11**, con Fae en sus tres poses, quedan **dibujadas y reservadas por Hanayama**. La 11 es nueva: la torre de Estratégico. Están en `piezas/` y su SVG va al final de este archivo. Nadie más las dibuja.

---

## 0. Paradas y alcance

- ⛔ **Son componentes compartidos**: `RankingFP`, `LigaBoard`, `TopicIndexView` y `PerfilView` son de Erwin. `CabeceraLiga` e `InsigniaLiga` **no se tocan**: la banda va en `LigaBoard`, después de la `<header>`.
- **Los dos únicos sitios donde se montan** (grep del 24-oct): `TopicIndexView.jsx`, l. 230-231 (las dos tablas) y `PerfilView.jsx`, l. 307 (el ranking general).
- **La entrada a los componentes es una sola**: `decoracion = { piezas, bucle, fae }`.
  - Sin ella, la tabla pinta lo de hoy. Así las pruebas que ya existen, que la montan sin la entrada, no cambian.
  - Las dos vistas siempre la pasan.
- **Macroeconomía** sigue congelada salvo esta decoración, que pidió Mateo.

## 1. La banda, medida en todas las tablas [fuente, con `BANDA=1`]

**Decisión: la banda va después de la cabecera de cada tabla y antes de lo que esa cabecera presenta**: las pestañas del ranking, o el podio y los mensajes de la liga. Lleva 14 px por debajo.
- En `RankingFP` la banda queda entre la nota y las pestañas. Las pestañas cambian la lista, así que se quedan pegadas a ella.
- En `LigaBoard` la banda queda entre la `<header>` (rótulo, insignia, nombre, mensaje y línea de ascenso) y el podio.

| Tabla | Banda a 320 (ancho × alto) | Banda a 375 |
|---|---|---|
| `RankingFP` (las tres materias y el perfil) | 238 × 56 | 293 × 72 |
| `LigaBoard` | 230 × 56 | 285 × 72 |

Comprobado en todos los casos de abajo:
- La banda no toca ningún texto ni control: es un bloque propio dentro del flujo.
- No aparece barra horizontal en ningún caso.

### 1.1 `RankingFP`: dónde cae la banda (y) y cuánto mide la tarjeta con ella (320 / 375)

| Materia (título y nota) | Título | y de la banda |
|---|---|---|
| Contabilidad o Macroeconomía («Solo esta materia») | 1 renglón (24) | 86 / 86 |
| **Pensamiento Estratégico** («Ranking de Pensamiento Estratégico») | **2 renglones (48) a 320**, 1 a 375 | **110** / 86 |
| Perfil («Ranking general», «Todas las materias») | 1 renglón; a 375 la nota sube a la línea del título | 86 / **55** |

| Estado | Conta y Macro | Estratégico | Perfil |
|---|---|---|---|
| Sin sesión | 350 / 358 | 374 / 358 | 350 / 327 |
| 0 jugadores | 294 / 302 | 318 / 302 | 294 / 271 |
| 1 jugador | 308 / 317 | 332 / 317 | 308 / 286 |
| 3 jugadores | 428 / 437 | 452 / 437 | 428 / 406 |
| 10 jugadores | 848 / 857 | 872 / 857 | 848 / 826 |
| 10 + tú en el puesto 127 | 940 / 949 | 964 / 949 | 940 / 918 |

La banda suma **70 px a 320 y 86 a 375** a cualquier tarjeta de ranking (56 o 72 de banda más 14).

### 1.2 `LigaBoard` (Estratégico): y de la banda / alto de la tarjeta

| Estado de la liga | 320 | 375 |
|---|---|---|
| Sin sesión | 117 / 297 | 117 / 313 |
| Sin liga todavía (sin FP en el ciclo) | 97 / 249 | 78 / 225 |
| Un solo nivel («Tu grupo esta semana», sin insignia) | 121 / 507 | 78 / 461 |
| Normal, con nombre e insignia | 117 / 503 | 117 / 500 |
| Con la línea de ascenso | 144 / 530 | 144 / 527 |
| **Semana de reparto** (recuadro largo) | **384** / 769 | **324** / 707 |
| Semana de Élite | 304 / 689 | 244 / 627 |

- **La liga crece igual**: 70 a 320 y 86 a 375.
- **En la semana de reparto**, la cabecera mide 351 a 320 y la banda cae debajo, bien lejos del título. Así queda, y está bien: la banda nunca va **dentro** de la cabecera ni corta el recuadro que hay que leer entero.

### 1.3 Las dos tablas juntas (índice de Estratégico): sí se ven las dos bandas a la vez

En el índice de Estratégico la liga va arriba y el ranking 16 px debajo. Medido, en coordenadas de página:

| | Banda de la liga | Banda del ranking | Distancia de borde a borde |
|---|---|---|---|
| 320 | 141 a 197 | 653 a 709 | 568 = el alto exacto de la ventana |
| 375 | 141 a 213 | 626 a 698 | 557 < 667: **caben las dos en pantalla** |

Con 3 piezas en bucle en cada banda serían 6 visibles: el doble del tope de la §7.

**Decisión: una sola banda en bucle por página.**
- Si en la página hay una `LigaBoard`, esa banda corre.
- La del `RankingFP` de debajo va con `bucle: false`: sus piezas quedan en su pose quieta.
- La vista lo decide al montar las dos. Es la única vista que monta las dos.

**Fae, una sola vez por página.** En el índice de Estratégico va en la banda de la liga (tu grupo) y no en la del ranking. Dos mascotas en la misma pantalla se leen como dos personajes.

### 1.4 Dónde va cada pieza dentro de la banda

| | 320 | 375 |
|---|---|---|
| Tamaño en pantalla de las 3 piezas | 32 | 40 |
| Pieza A (x, y de reposo) | 12, 14 | 16, 18 |
| Pieza B | 74, 22 | 92, 28 |
| Pieza C | 136, 8 | 168, 10 |
| Fae | 44 px, pegada a la derecha, y = 6 | 44 px, pegada a la derecha, y = 14 |

- **La regla de holgura.** Con la flotación de −6 px todo queda dentro de la banda: a 320 el tope más bajo es 8 − 6 = 2 y el fondo más alto 22 + 32 = 54 ≤ 56; a 375, 10 − 6 = 4 y 28 + 40 = 68 ≤ 72 [calculado].
- **Sitio para Fae.** La pieza C termina en x = 168 (a 320) o 208 (a 375). Fae empieza a la derecha:
  - en el ranking, en x = 194 a 320 y x = 249 a 375;
  - en la liga, en x = 186 a 320 y x = 241 a 375.

  Siempre quedan 18 px o más de aire.
- **La banda lleva `overflow: hidden`**: es el sobre del movimiento.

### 1.5 Fae no cabe «junto a tú»: va en la banda

Medido con tu apodo de 20 caracteres (170 px de texto):
- En el ranking, la caja de tu apodo mide **47-56 px a 320** y **102-111 a 375**.
- En la liga, todos los apodos del podio salen cortados también a 375 (3 de 3).

Fae, a 28 px como mínimo, le quitaría a tu nombre la mitad de lo que le queda. **Decisión** (reversible, ratificada por Ukyo en #567): Fae va en el extremo derecho de la banda.

> **Corrección del 25-oct (Ukyo en #567; pose elegida por Hanayama).** Fae **no codifica dónde estás tú**: la banda es `aria-hidden`, así que lo que dijera su pose no le llegaría al lector de pantalla. Además, las tres poses se distinguen solo un 15-33 % entre sí. Por eso Fae lleva **una sola pose, «saluda», en todas las tablas y todos los estados**. Es la única que no dice nada de tu resultado: «celebra» felicitaría también al último, y «mira» se lee como espera o como desatención. Además tiene la silueta más clara. `10-fae-celebra.svg` y `10-fae-mira.svg` quedan en `piezas/` como reserva, sin uso.

## 2. Qué lleva cada estado

| Tabla y estado | ¿Banda? | Piezas | Fae (siempre «saluda» desde el 25-oct; la columna queda de historia) |
|---|---|---|---|
| Ranking · sin sesión | sí | 3 | saluda |
| Ranking · 0 jugadores | **sí** | 3 | mira |
| Ranking · tú sin FP en el periodo | sí | 3 | saluda |
| Ranking · tú en el top 3 (1 o 3 jugadores) | sí | 3 | celebra |
| Ranking · tú del 4.º al 10.º, o fuera del top | sí | 3 | mira |
| Ranking · cargando o error | sí, **quieta** | 3, en pose de reposo | no va |
| Liga · sin sesión | sí | 3 | saluda |
| Liga · sin liga todavía | sí | 3 | saluda |
| Liga · tú en el podio (zona de ascenso) | sí | 3 | celebra |
| Liga · tú fuera del podio («Estás en el puesto #…») | sí | 3 | mira |
| Liga · semana de reparto o de Élite | sí | 3 | mira |
| Ranking debajo de una liga (índice de Estratégico) | sí, **quieta** | 3, en pose de reposo | no va (está en la liga) |

- **Con 0 jugadores hay banda**: es el estado que más se siente muerto, y cabe (294 a 320).
- **Con el error no va Fae**: una cara contenta pegada a «No se pudo cargar el ranking» sería un mensaje equivocado.
- **Fae no cambia de pose** (corrección del 25-oct, §1.5): es «saluda» siempre que va. Sigue sin ir en el error ni en el ranking que va debajo de una liga.
- **Al cambiar de pestaña** la banda no se vuelve a montar: no hay entrada nueva.

## 3. Las piezas de cada tabla

**Decisión: las tres piezas de una banda comparten un solo movimiento**, «flota». Lo pide la §5.3 (un solo juego de keyframes por pantalla). El giro del billete y del clip entra por una variable, así que sigue siendo un solo juego:

```css
@keyframes vv-flota {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50%      { transform: translateY(var(--vv-alto, -6px)) rotate(var(--vv-giro, 0deg)); }
}
.vv-pieza { animation: vv-flota var(--vv-dur) cubic-bezier(.3,.9,.4,1) var(--vv-retardo) infinite; }
```

| Tabla | A (3.600 ms, retardo 0, −6 px) | B (5.100, 900, −5) | C (7.200, 1.700, −6) |
|---|---|---|---|
| Ranking · **Macroeconomía** | 1 · Tetraedro | 6 · Flecha de tendencia | 5 · Billete (`--vv-giro: 3deg`) |
| Ranking · **Contabilidad** | 2 · Cubo | 7 · Libro entreabierto | 8 · Clip (`--vv-giro: 6deg`) |
| Ranking y liga · **Pensamiento Estratégico** | 1 · Tetraedro | 2 · Cubo | **11 · Torre de ajedrez (nueva)** |
| Ranking general del perfil | 6 · Flecha (Macro) | 7 · Libro (Conta) | 11 · Torre (Estratégico) |

**Por qué Estratégico necesita una pieza propia.**
- Las comunes que flotan son dos (1 y 2). La tercera común, la chispa (3), es de pulso y no se mezcla.
- Con solo comunes, Estratégico no tendría nada suyo.
- **La torre** es de la misma familia que el fondo de la materia, que es una escena de ajedrez (`ChessBackground`, en `FondoMateria`), así que se lee como de la casa y no como un adorno más.
- No choca con nada: busqué en el código «ajedrez», «torre», «chess», «rook» y «castle», y solo aparece el fondo. Ningún identificador ni ícono de actividad la usa.

**El perfil mezcla las tres materias**, así que lleva un objeto de cada una.

**Fuera de las combinaciones** quedan dibujadas y reservadas: la chispa (3, pulso), la moneda (4, gira) y el sello (9, pulso). Solo entran si las tres piezas de una banda comparten ese mismo movimiento.

⛔ **El sello hexagonal (9) no va nunca en `LigaBoard` ni en Estratégico.** La insignia de la liga es un hexágono (el nivel Emergente, con los vértices de `Medalla.jsx`), y estaría a 40 px. Tampoco va junto a una medalla de logro.

**Las cinco condiciones de la §7** van tal cual:
- pausa con `IntersectionObserver` sobre la banda y con `visibilitychange`;
- pose de reposo con `shouldRenderStatic()`, tanto con movimiento reducido como en gama baja;
- solo `transform`;
- sin `will-change` permanente.

Con la tabla llena, al bajar hasta tu fila la banda sale de la pantalla y se pausa. La pose quieta es la de reposo (y = 0, giro 0), y todas las piezas se entienden quietas.

## 4. Color y contraste

- **El trazo efectivo**, #CBDCF2 al 0,45 sobre la tarjeta (rgba(248,249,250,.04) sobre #0E1B2E = #172436), da **#68778B y 3,43:1** [calculado con la fórmula WCAG]. Pasa el 3:1 de lo que no es texto.
- **Un solo color en todas las piezas** (§5.1): nada de coral, teal ni ámbar.
- La liga ya usa teal en el puesto, en los FP y en el ascenso. Por eso las piezas no lo llevan: no se mezclan con esa información.

## 5. Avisos (de las tablas, no de la decoración; son de Erwin)

1. **Los nombres se cortan.**
   - En el ranking, a 320 todos los apodos salen cortados (10 de 10), y con el botón de ánimo el apodo ajeno queda en 0 px: no se ve ningún nombre.
   - A 375 salen cortados 7 de 10.
   - En la liga, 3 de 3 a 320 y a 375.
   - Tu propio apodo de 20 caracteres se ve en 47-56 px de sus 170 a 320.
2. **Las pestañas del ranking a 320** miden 262 en un contenido de 238 y se salen 7 px de la tarjeta. Además «De semestre» parte en dos renglones.
3. **El botón de ánimo mide 27 px de alto**, en el ranking y en la liga.
4. **El «Entrar» de la liga** no tiene `minHeight: 44px`, que el del ranking sí tiene. No lo medí aparte.
5. **Colores fuera de rol**:
   - el coral del número 1 del ranking y del contador de ánimo es coral fuera de error;
   - el teal del 2.º y 3.º puesto y de tu fila, en Contabilidad, choca con su papel de Debe.
6. **Para Ukyo**:
   - «Fae junto a tú» no cabe en la fila: va en la banda (§1.5);
   - en el índice de Estratégico se ven dos bandas a la vez: corre una sola (§1.3);
   - el sello hexagonal choca con la insignia de liga (§3).

## 6. Lo que no verifiqué

- No medí en un teléfono real, ni con los fondos animados detrás (la escena 3D de ajedrez de Estratégico es la más pesada), ni el coste de CPU de la banda (lo midió Ukyo, §10).
- La banda la inserté en el banco con la medida exacta. No está construida dentro de los componentes.
- Los estados «Cargando…» y error de las dos tablas no los medí. Tienen un renglón de texto, como el estado vacío [supuesto].
- Por encima de 375 px no está especificado.
- Las piezas las vi renderizadas a 32 y 44 px sobre la tarjeta (`hoja.png`, solo en mi copia), y las bandas de ejemplo de Estratégico y Contabilidad. No las probé con una persona.

## 7. Las piezas (SVG; los archivos están en `piezas/`)

Todas con la misma cabecera:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40" fill="none" stroke="#CBDCF2" stroke-opacity="0.45" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
```

| # | Archivo | Materia · movimiento | Cuerpo |
|---|---|---|---|
| 1 | `01-tetraedro.svg` | las tres · flota | `<path d="M20 5L6 30L21 36L34 29Z M20 5L21 36 M6 30L34 29"/>` |
| 2 | `02-cubo.svg` | las tres · flota | `<path d="M7 14h19v19H7Z M14 7h19v19H14Z M7 14l7-7 M26 14l7-7 M26 33l7-7 M7 33l7-7"/>` |
| 3 | `03-chispa.svg` | las tres · pulso (reserva) | `<path d="M20 4C21 15 25 19 36 20C25 21 21 25 20 36C19 25 15 21 4 20C15 19 19 15 20 4Z"/>` |
| 4 | `04-moneda.svg` | Macro · gira (reserva) | `<circle cx="20" cy="20" r="14"/><circle cx="20" cy="20" r="10"/>` (sin raya adentro: con ella se leía «1») |
| 5 | `05-billete.svg` | Macro · flota + 3° | `<rect x="5" y="12" width="30" height="16" rx="2"/><circle cx="20" cy="20" r="4"/><path d="M9 16h3 M28 24h3"/>` |
| 6 | `06-flecha.svg` | Macro · flota | `<path d="M5 31L14 22L20 27L33 13 M25 13h8v8"/>` |
| 7 | `07-libro.svg` | Conta · flota | `<path d="M20 12C15 9 9 9 5 11V31C9 29 15 29 20 32C25 29 31 29 35 31V11C31 9 25 9 20 12Z M20 12V32"/>` |
| 8 | `08-clip.svg` | Conta · flota + 6° | `<path d="M26 14V28a6 6 0 0 1-12 0V10a4 4 0 0 1 8 0V27a2 2 0 0 1-4 0V14"/>` |
| 9 | `09-sello.svg` | Conta · pulso (reserva; nunca en la liga) | `<path d="M20 6L32 13V27L20 34L8 27V13Z M14 17h12 M14 20.5h12 M16 24h8"/>` |
| 10 | `10-fae-saluda.svg` | las tres · estática | `<circle cx="20" cy="10" r="6"/><rect x="14" y="19" width="12" height="16" rx="6"/><path d="M18 9.5h.01 M22 9.5h.01 M26 23L31 15 M14 24L10 29"/>` |
| 10 | `10-fae-celebra.svg` | las tres · estática | `<circle cx="20" cy="10" r="6"/><rect x="14" y="19" width="12" height="16" rx="6"/><path d="M18 9.5h.01 M22 9.5h.01 M14 23L9 15 M26 23L31 15"/>` |
| 10 | `10-fae-mira.svg` | las tres · estática | `<circle cx="20" cy="10" r="6"/><rect x="14" y="19" width="12" height="16" rx="6"/><path d="M20 10h.01 M24 10h.01 M14 24L11 30 M26 24L29 30"/>` |
| 11 | `11-torre.svg` | Estratégico · flota (nueva) | `<path d="M12 9h3v3h3.5V9h3v3H25V9h3v8H12Z M14 17L15.5 30H24.5L26 17 M11 30h18v4H11Z"/>` |

- **Los ojos de Fae** son trazos de 0,01 px con punta redonda: dan un punto de 1,5 px sin usar relleno.
- **La pose «mira»** lleva los ojos corridos a la derecha.
