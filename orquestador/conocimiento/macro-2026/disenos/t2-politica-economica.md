# T2 · Política económica — plan y especificación completa (Gen, 2026-11-22)

Fuente única: `fichas/2-politica-economica.md` (incluye el anexo con los 43 enunciados).
Tema id: `politica-economica`. Ids de piezas: `pe26-…`.

## 0. Reglas comunes

Valen TODAS las de `t1-demanda-agregada.md` §0 (texto, B1, coral solo error, movimiento,
deslizadores, arrastrar con tocar-tocar y teclado, gráficas, celular 320/375, sorteo y
orden aleatorio, subtema por ítem, FP una vez, sin clichés). Además:

- **Las ramas se identifican por ícono + tono** (fijados en `src/macro2026/comun/ramas.js`):
  fiscal = alcancía con moneda; monetaria = moneda con «%»; cambiaria = billete de dólar
  con flecha doble; comercial = contenedor. Cuatro tonos Planck distintos de los de
  C/I/G/XN de T1 y nunca coral. Cada rama lleva siempre su nombre escrito junto al ícono.
- **La escalera de seis peldaños** (Problema → Objetivo → Estrategia → Instrumento →
  Medida → Meta) es la figura común de A5, H1, H2 y H4: seis peldaños de abajo arriba,
  cada uno con su rótulo; misma forma en las cuatro piezas. Un solo componente
  `Escalera.jsx`.
- **Cifras de Colombia que se usan** (d. 8–9, sin fecha exacta en la fuente, se rotulan
  «dato de clase»): inflación 6 %, desempleo 8,1 %, crecimiento 2,6 % (fin de 2025),
  déficit comercial US$ 8.198,7 millones, Gini 0,54. **No se usa** el déficit fiscal de
  9,4 % (parece errado; aviso a Mateo).
- **La clave de clasificación de los 43 enunciados es mía** (la ficha lo marca como criterio
  propio). Va tal cual abajo; si el profesor tiene otra, se cambia en un solo archivo de datos.

## 1. Plan del tema

| # | id | Tipo | Nombre | Mecánica | Subtemas | Dific. | FP |
|---|---|---|---|---|---|---|---|
| 1 | pe26-a1-mecanico | Aprender | ¿Mecánico o te arreglas solo? | Tocar y revelar + cadena animada | pe-autorregulacion, pe-problemas | — | 0 |
| 2 | pe26-a2-fiebre | Aprender | La economía con fiebre | Explorar un flujo circular animado | pe-problemas | — | 0 |
| 3 | pe26-a3-problema-resuelto | Aprender | El problema, resuelto | Voltear tarjetas | pe-objetivos | — | 0 |
| 4 | pe26-h3-cables | Hacer | Conecta los cables | Emparejar con movimiento | pe-ramas, pe-da-ramas | Medio | 25 × % |
| 5 | pe26-a4-perillas | Aprender | Las perillas de la demanda | Simulador con controles | pe-ramas, pe-da-ramas | — | 0 |
| 6 | pe26-a5-escalera | Aprender | La escalera de la política | Construir (ordenar al final) | pe-ambitos | — | 0 |
| 7 | pe26-h1-seis-cajones | Hacer | Seis peldaños | Arrastrar y clasificar | pe-ambitos | Medio | 25 × % |
| 8 | pe26-h2-grupo-logico | Hacer | Arma el grupo lógico | Construir cadena (3 etapas) | pe-ambitos, pe-taller | Difícil | 50 × 3 = 150 × % |
| 9 | pe26-h4-expediente | Hacer | El peldaño que no encaja | Encontrar el error | pe-ambitos, pe-taller | Difícil | 50 × % |
| 10 | pe26-h5-dos-fiebres | Hacer | Un paciente, dos fiebres | Escenario ramificado | pe-da-ramas, pe-objetivos, pe-ramas | Medio | 25 (exploratorio) |

**Variedad:** 5 Hacer con 5 mecánicas distintas; ninguna de selección múltiple como mecánica
principal (H5 elige entre tres caminos, pero cada decisión mueve tres medidores y abre una rama).
**Respaldo:** A1 usa la analogía del profesor (carro/médico): **aprendizaje por analogía**
con un dominio conocido. A5 + H1 + H2 + H4 son la misma estructura practicada de cuatro
formas: **práctica intercalada y recuperación**. H4 es **detección de errores**, que obliga
a explicitar la regla (criterio propio apoyado en literatura de «errores ejemplares»).
H5 es exploratorio: **aprendizaje por consecuencias**; su valor es ver el choque de
objetivos (d. 13), no acertar. Criterio propio.

---

## 2. Especificación pieza por pieza

### A1 · ¿Mecánico o te arreglas solo? (`pe26-a1-mecanico`)
**Gancho visual:** un carro varado echando humo, con dos salidas: una caja de herramientas
(izquierda) y una grúa hacia un taller (derecha).

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | Carro varado. Acción: tocar la caja (el conductor abre el capó y aprieta una tuerca) y tocar la grúa (llega el mecánico). «Siguiente» se habilita al tocar las dos. | «Se te vara el carro. ¿Lo arreglas tú o llamas al mecánico?» |
| 2 | Bajo cada salida aparece su rótulo: «Autorregulación» (caja) e «Intervención externa» (grúa). | «Arreglarlo tú es autorregulación. Llamar al mecánico es intervención externa.» |
| 3 | El carro se convierte en un circuito de la economía; la caja pasa a ser una mano «Mercado» y la grúa un edificio «Estado». Tocar cada uno repite su animación. | «La economía igual: a veces el mercado se ajusta solo; a veces interviene el Estado.» |
| 4 | Cadena de cuatro nodos que se revelan al tocar cada uno: «Mercado perfecto» → «Fallos del mercado» → «Política económica» → «¿Fallos del Estado?». El último aparece con un signo de pregunta que parpadea una vez (no en bucle). | «Cuando el mercado falla, el Estado interviene. Pero el Estado también puede fallar.» |

### A2 · La economía con fiebre (`pe26-a2-fiebre`)
**Gancho visual:** el flujo circular (hogares, empresas, mercado de bienes, mercado de
factores, Estado, exterior) como un cuerpo con termómetro; puntos de dinero circulan
por las flechas; «virus» con forma de su problema pegados a cada parte.

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | Flujo circular con puntos que circulan (una vuelta al entrar, luego quietos; botón «Ver circular» repite). | «La economía es un circuito: hogares, empresas, Estado y exterior se pasan dinero.» |
| 2 | Aparecen cinco virus. Tocar cada uno abre su ficha (ver tabla). El termómetro sube un grado con cada virus abierto. | «Cuando el circuito enferma, aparecen problemas económicos. Toca cada virus.» |
| 3 | Tres íconos fuera del circuito: balanza desigual, puerta cerrada a un bien, chimenea. Tocar cada uno abre su ficha. | «Hay más: desigualdad, mala asignación de recursos y daño ambiental.» |
| 4 | Todos los virus se alinean y apuntan a un maletín «Política económica». | «Los problemas económicos son el origen de la política económica.» |

Fichas de los virus (≤ 12 palabras de descripción + cifra):
| Virus (dónde) | Forma | Descripción | Cifra «dato de clase» |
|---|---|---|---|
| Inflación (mercado de bienes) | etiqueta de precio con flecha arriba | «Suben los precios en general.» | 6 % |
| Desempleo (hogares) | silla de trabajo vacía | «Gente que busca trabajo y no lo encuentra.» | 8,1 % |
| Recesión (mercado de factores) | fábrica con chimenea apagada | «Caen la producción, el ingreso y el empleo.» | crecimiento 2,6 % (fin de 2025) |
| Déficit fiscal (Estado) | alcancía con hueco | «El Estado gasta más de lo que recauda.» | — |
| Déficit externo (exterior) | barco que llega más cargado que el que sale | «Importamos más de lo que exportamos.» | US$ 8.198,7 millones |
| Desigualdad | balanza desigual | «Mucho ingreso en pocas manos. Se mide con el Gini.» | Gini 0,54 |
| Mala asignación de recursos | puerta cerrada a un bien | «Acceso excesivo a unos bienes; otros excluyen a muchos.» | — |
| Daño ambiental | chimenea con humo | «Producir o consumir contamina el ambiente.» | — |

### A3 · El problema, resuelto (`pe26-a3-problema-resuelto`)
**Gancho visual:** tarjetas con el virus de A2 que, al voltearse, muestran el mismo
dibujo «curado» (la silla ocupada, la alcancía sellada).

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | Una tarjeta «Desempleo» (silla vacía). Acción: tocar; se voltea a «Reducir el desempleo» (silla ocupada). | «Un objetivo es un problema escrito como si ya estuviera resuelto.» |
| 2 | Cinco tarjetas boca arriba: «Inflación, desempleo, déficits», «Desigualdad», «Mala asignación», «Poco crecimiento», «Daño ambiental». Tocar cada una la voltea a su objetivo: «Estabilizar la economía», «Redistribuir la renta», «Asignar bien los recursos», «Crecimiento económico», «Sostenibilidad ambiental». | «Voltea cada problema y mira en qué objetivo se convierte.» |
| 3 | Cuatro tarjetas (inflación, desempleo, déficit fiscal, déficit externo) se funden en una sola «Estabilización». | «Cuatro problemas comparten un objetivo: estabilizar. Inflación, desempleo, déficit fiscal y déficit externo.» |

### H3 · Conecta los cables (`pe26-h3-cables`, Medio, 25 FP × %)
**Consigna:** «Conecta cada instrumento con la rama que lo usa.» (9)
**Figura:** arriba, la «máquina de la DA» de A4 en miniatura (la ecuación con sus perillas);
abajo-izquierda, los enchufes de instrumentos; abajo-derecha, cuatro tomas con el ícono y
el nombre de cada rama. Se arrastra el cable desde el enchufe a una toma (o tocar-tocar).
Acierto: el cable se tensa, se ilumina en el tono de la rama y en la máquina late el término
que esa rama mueve (fiscal → TR, t, G; monetaria → i; cambiaria y comercial → XN).
Error: el cable se suelta y cae, borde coral, retro; segundo intento sin puntaje.
**Partida:** 8 instrumentos sorteados de 9. Puntaje = aciertos al primer intento / 8.

| Instrumento | Rama | Retro si lo conecta a… |
|---|---|---|
| Impuestos | Fiscal | Monetaria: «Los impuestos son finanzas públicas, no moneda.» · Cambiaria: «No fijan el precio del dólar: son ingresos del Estado.» · Comercial: «Son impuestos internos; los del comercio exterior son aranceles.» |
| Gasto público | Fiscal | Monetaria: «Gastar es decisión del Gobierno, no del banco central.» · Cambiaria: «No mueve el dólar directamente: es gasto del Estado.» · Comercial: «Es gasto interno del Gobierno, no comercio exterior.» |
| Deuda pública | Fiscal | Monetaria: «La deuda financia al Gobierno: es fiscal.» · Cambiaria: «Endeudarse es financiar el gasto público, no fijar el dólar.» · Comercial: «No regula exportaciones ni importaciones: financia al Estado.» |
| Tasa de interés de referencia | Monetaria | Fiscal: «La fija el Banco de la República, no el Gobierno.» · Cambiaria: «Afecta al dólar, pero es herramienta monetaria.» · Comercial: «No es un arancel: es el precio del crédito.» |
| Operaciones de mercado abierto | Monetaria | Fiscal: «Las hace el banco central para mover el dinero.» · Cambiaria: «Compran y venden títulos, no dólares.» · Comercial: «No tocan el comercio exterior: ajustan la liquidez.» |
| Encaje bancario | Monetaria | Fiscal: «Es la reserva que exige el banco central a los bancos.» · Cambiaria: «No es un precio del dólar: limita el crédito.» · Comercial: «No regula importaciones: regula cuánto prestan los bancos.» |
| Régimen cambiario | Cambiaria | Fiscal: «Define cómo se fija el dólar, no impuestos.» · Monetaria: «Es la regla del precio del dólar: cambiaria.» · Comercial: «No es un arancel: es la regla del tipo de cambio.» |
| Intervención del mercado cambiario | Cambiaria | Fiscal: «Comprar o vender dólares no es gasto público.» · Monetaria: «Se interviene el mercado de dólares: rama cambiaria.» · Comercial: «No grava importaciones: mueve el precio del dólar.» |
| Aranceles | Comercial | Fiscal: «Recaudan, pero su fin es regular importaciones: comercial.» · Monetaria: «No es una tasa de interés: grava lo importado.» · Cambiaria: «No fijan el dólar: encarecen un producto importado.» |

Subtema de todos: `pe-ramas`; además `pe-da-ramas`.
Celular: a 320 px enchufes en columna a la izquierda (≥ 48 px de alto) y tomas en columna a
la derecha; la máquina se reduce a una franja de 80 px arriba.

### A4 · Las perillas de la demanda (`pe26-a4-perillas`)
**Gancho visual:** la ecuación de la DA de T1 montada como una consola con perillas
físicas del tono de su rama, y una aguja «Y» que se mueve. Usa `modelo-da.js` de T1.

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | Cuatro especialistas con su ícono (fiscal, monetaria, cambiaria, comercial). Tocar cada uno despliega sus herramientas (fiscal: impuestos, gasto público, subsidios; monetaria: emisión, crédito, tasas de interés; cambiaria: precio del dólar, intervención del mercado; comercial: aranceles, subsidios, inversión extranjera). | «El Estado tiene cuatro ramas clásicas de política: fiscal, monetaria, cambiaria y comercial.» |
| 2 | La ecuación `DA = C̄ + c(Y + TR − tY) + Ī − b·i + G + XN` con perillas sobre TR, t y G (fiscal), i (monetaria) y XN (cambiaria y comercial). Tocar una perilla resalta su rama. | «Cada rama gira una perilla distinta de la demanda agregada.» |
| 3 | Tres perillas operables (deslizadores circulares o lineales): G 100–400, i 2–14 %, XN −50–150. La aguja Y₀ se mueve en vivo con el modelo de T1. | «Gira las perillas y mira cómo cambia la producción, Y.» |
| 4 | Se habilita la perilla t (0–40 %); junto a la aguja, un altavoz «× multiplicador» crece o se encoge. | «La fiscal tiene una perilla extra: t también cambia el multiplicador.» |
| 5 | Alrededor de la consola aparecen íconos sectoriales: agro, industria, mipymes, ciencia y tecnología, competitividad. Tocar cada uno muestra su nombre. | «Además hay políticas sectoriales: agro, industria, mipymes, ciencia y competitividad.» |

### A5 · La escalera de la política (`pe26-a5-escalera`)
**Gancho visual:** la escalera de seis peldaños; un personaje («La autoridad económica»,
silueta neutra) sube un peldaño por pantalla y deja una tarjeta del ejemplo del profesor (d. 18).

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | Escalera vacía con los seis rótulos. Tocar un rótulo lo resalta. | «Toda política sube seis peldaños: problema, objetivo, estrategia, instrumento, medida y meta.» |
| 2 | Peldaño 1 + tarjeta «Desempleo del 14 %». | «Problema: lo que está mal. Desempleo del 14 %.» |
| 3 | Peldaño 2 + «Reducir el desempleo». | «Objetivo: el problema resuelto, sin cifras. Reducir el desempleo.» |
| 4 | Peldaño 3 + «Política fiscal» (con su ícono). | «Estrategia: la rama elegida. Política fiscal.» |
| 5 | Peldaño 4 + «Impuesto de renta a empresas». | «Instrumento: la herramienta de esa rama. Impuesto de renta a empresas.» |
| 6 | Peldaño 5 + «Bajarlo del 32 % al 28 %». | «Medida: qué se hace con la herramienta. Bajarlo del 32 % al 28 %.» |
| 7 | Peldaño 6 + «Desempleo del 14 % al 12 % en doce meses». | «Meta: el objetivo con cifra y plazo. Desempleo del 14 % al 12 % en doce meses.» |
| 8 | Las seis tarjetas se barajan al pie; arrastrarlas a su peldaño. Error: la tarjeta baja y el peldaño correcto parpadea una vez (sin puntaje, es Aprender). | «Los seis juntos forman un grupo lógico. Ordénalos en la escalera.» |
| 9 | Dos tarjetas lado a lado: «Reducir el desempleo» y «Del 14 % al 12 % en doce meses»; la cifra y el plazo se subrayan. | «Ojo: el objetivo no lleva número; la meta sí, y con plazo.» |

### H1 · Seis peldaños (`pe26-h1-seis-cajones`, Medio, 25 FP × %)
**Consigna:** «Arrastra cada enunciado a su peldaño.» (6)
**Figura:** la escalera; el enunciado cae como tarjeta. Acierto: encaja y el peldaño se
ilumina; error: rebota, borde coral, retro del par (verdadero → elegido), segundo intento
sin puntaje. **Partida:** 12 enunciados, 2 por peldaño, sorteados del banco de 42.
Puntaje = aciertos al primer intento / 12.

**Banco y clave** (números del anexo de la ficha 2; el 32 no entra, repite el 18):
- Problema: 6, 14, 24, 26, 28, 34, 36, 42
- Objetivo: 1, 5, 16, 30, 31, 37, 39, 40
- Estrategia: 2, 11, 18, 41
- Instrumento: 4, 13, 20, 22, 33, 35
- Medida: 8, 9, 15, 17, 23, 27, 29, 38
- Meta: 3, 7, 10, 12, 19, 21, 25, 43

**Retro por par (verdadero → donde lo puso):**
| Verdadero → | Problema | Objetivo | Estrategia | Instrumento | Medida | Meta |
|---|---|---|---|---|---|---|
| **Problema** | — | «Describe algo que ya pasa; un objetivo dice lo que se quiere.» | «No nombra una rama: describe lo que está mal.» | «No es una herramienta: es una situación que preocupa.» | «Nadie actúa aquí: cuenta lo que está pasando.» | «La cifra es la situación actual, no lo que se quiere lograr.» |
| **Objetivo** | «Habla de lo que se quiere lograr, no de lo que está mal.» | — | «No nombra una rama: dice qué se quiere lograr.» | «No es una herramienta: es un propósito.» | «No dice qué se hace con una herramienta: dice el propósito.» | «No trae cifra ni plazo: es objetivo, no meta.» |
| **Estrategia** | «Nombra una rama de política, no algo que está mal.» | «Es la rama elegida, no el propósito.» | — | «Es la rama completa; los instrumentos son sus herramientas.» | «No hay acción concreta: solo el nombre de la rama.» | «No trae cifra: es el nombre de una rama.» |
| **Instrumento** | «Es una herramienta, no una situación.» | «Es la herramienta, no el propósito.» | «Es una herramienta dentro de una rama, no la rama.» | — | «Falta el verbo: la medida dice qué se hace con ella.» | «No hay cifra ni plazo: es solo la herramienta.» |
| **Medida** | «Describe una acción de la autoridad, no algo que está mal.» | «Dice qué se hace con una herramienta, no el propósito.» | «Es una acción concreta, no el nombre de una rama.» | «Tiene verbo y dirección: usa la herramienta, es medida.» | — | «La cifra es de la herramienta, no del resultado buscado.» |
| **Meta** | «Dice adónde se quiere llegar, no solo cómo está.» | «Tiene cifra y plazo: eso la vuelve meta.» | «Es un resultado con cifra, no una rama.» | «Es un resultado cuantificado, no una herramienta.» | «La cifra es del resultado, no de la herramienta usada.» | — |

Subtema: `pe-ambitos` (todos) y `pe-taller`.
Celular: a 320 px los peldaños miden el ancho completo y ≥ 48 px de alto; el enunciado
más largo (el 27, 19 palabras) cabe en la tarjeta en 4 renglones a 14 px. Medirlo.

### H2 · Arma el grupo lógico (`pe26-h2-grupo-logico`, Difícil, 50 × 3 = 150 FP × %)
**Consigna:** «Completa la escalera: elige la tarjeta de cada peldaño.» (9)
**Figura:** la escalera con el Problema ya puesto abajo. Para el peldaño siguiente aparecen
3 tarjetas en orden aleatorio (1 coherente, 2 distractoras). El estudiante arrastra una al
peldaño (o la toca). Correcta: encaja, el personaje sube un peldaño. Distractora: la tarjeta
cae por el hueco de la escalera, borde coral, su retro; el estudiante elige de nuevo entre
las dos que quedan (ese peldaño ya no puntúa). Al llegar a Meta, la escalera completa se
ilumina de abajo arriba (6 × 120 ms) con una bandera «Grupo lógico».
**Partida:** 3 grupos (= 3 etapas) sorteados de 7. Puntaje = peldaños correctos al primer
intento / 15. Números = enunciados del anexo.

| Grupo | Peldaño | Correcta | Distractora 1 → retro | Distractora 2 → retro |
|---|---|---|---|---|
| **G1 Inflación** (P: 6) | Objetivo | 40 | 39 → «El problema es de precios, no de empleo.» | 16 → «Devaluar no ataca la subida de precios.» |
| | Estrategia | 18 | 2 → «La política comercial no controla los precios internos.» | 41 → «Se busca enfriar la demanda; eso lo hace la monetaria.» |
| | Instrumento | 4 | 33 → «Los aranceles son comerciales, no monetarios.» | 20 → «Los subsidios no son herramienta monetaria.» |
| | Medida | 27 | 38 → «Bajar la tasa calienta la demanda y sube precios.» | 9 → «Comprar dólares es cambiario, no la tasa.» |
| | Meta | 21 | 25 → «La meta debe medir la inflación, no el desempleo.» | 10 → «La meta debe medir precios, no inversión.» |
| **G2 Peso fortalecido** (P: 14) | Objetivo | 16 | 5 → «El peso ya está fuerte: frenar la devaluación sobra.» | 40 → «El problema es el precio del dólar, no la inflación.» |
| | Estrategia | 41 | 11 → «El precio del dólar se maneja con política cambiaria.» | 2 → «La comercial usa aranceles; aquí se mueve el dólar.» |
| | Instrumento | 22 | 4 → «La tasa es monetaria; aquí se interviene el mercado cambiario.» | 13 → «Los impuestos son fiscales, no cambiarios.» |
| | Medida | 9 | 29 → «Vender dólares los abarata más: el peso se fortalece aún más.» | 17 → «Subir aranceles es comercial, no cambiario.» |
| | Meta | 12 | 3 → «Que el dólar baje es lo contrario de lo buscado.» | 7 → «La meta debe medir el tipo de cambio.» |
| **G3 Peso devaluado** (P: 24) | Objetivo | 5 | 16 → «El peso ya se devaluó: promoverlo lo empeora.» | 37 → «El problema es el dólar, no el déficit fiscal.» |
| | Estrategia | 41 | 18 → «El mercado de dólares es terreno cambiario.» | 2 → «Los aranceles no frenan la devaluación directamente.» |
| | Instrumento | 22 | 33 → «Los aranceles son comerciales; aquí se interviene el mercado cambiario.» | 35 → «El gasto público es fiscal, no cambiario.» |
| | Medida | 29 | 9 → «Comprar dólares los encarece más: acelera la devaluación.» | 8 → «Bajar impuestos es fiscal, no cambiario.» |
| | Meta | 3 | 12 → «Que el dólar suba es lo contrario de lo buscado.» | 21 → «La meta debe medir el tipo de cambio.» |
| **G4 Inversión cae** (P: 36) | Objetivo | 1 | 40 → «El problema es la inversión, no los precios.» | 37 → «El problema es la inversión, no el déficit.» |
| | Estrategia | 18 | 41 → «La tasa de interés es monetaria, no cambiaria.» | 2 → «La comercial no abarata el crédito.» |
| | Instrumento | 4 | 22 → «Intervenir el dólar no abarata el crédito.» | 33 → «Los aranceles no mueven el costo del crédito.» |
| | Medida | 38 | 27 → «Subir la tasa encarece el crédito: frena la inversión.» | 29 → «Vender dólares es cambiario, no mueve la tasa.» |
| | Meta | 10 | 21 → «La meta debe medir la inversión, no la inflación.» | 19 → «La meta debe medir la inversión, no el déficit.» |
| **G5 Déficit fiscal** (P: 42) | Objetivo | 37 | 30 → «El hueco es del Estado, no del comercio exterior.» | 39 → «El problema es el déficit, no el desempleo.» |
| | Estrategia | 11 | 18 → «Las finanzas públicas son terreno fiscal.» | 41 → «El dólar no cierra el hueco del presupuesto.» |
| | Instrumento | 35 | 4 → «La tasa es monetaria; el hueco se cierra con gasto o impuestos.» | 22 → «Intervenir el dólar no cierra el déficit.» |
| | Medida | 15 | 8 → «Bajar impuestos reduce el recaudo: agranda el déficit.» | 23 → «Subsidiar es gastar más: agranda el déficit.» |
| | Meta | 19 | 10 → «La meta debe medir el déficit, no la inversión.» | 12 → «La meta debe medir el déficit, no el dólar.» |
| **G6 Acero chino** (P: 28) | Objetivo | 31 | 16 → «Devaluar no apunta al acero chino en particular.» | 40 → «El problema es de importaciones, no de precios.» |
| | Estrategia | 2 | 18 → «La tasa no frena un producto importado puntual.» | 41 → «El dólar afecta todas las importaciones, no solo el acero.» |
| | Instrumento | 33 | 4 → «La tasa es monetaria; el acero se frena con aranceles.» | 35 → «El gasto público no frena importaciones.» |
| | Medida | 17 | 23 → «Subsidiar aguacate no frena el acero chino.» | 38 → «Bajar la tasa es monetario, no comercial.» |
| | Meta | 43 | 7 → «La meta debe medir importaciones de acero, no exportaciones.» | 19 → «La meta debe medir el acero, no el déficit.» |
| **G7 Desempleo** (P: 34) | Objetivo | 39 | 5 → «El problema es el empleo, no el dólar.» | 31 → «El problema es el empleo, no las importaciones.» |
| | Estrategia | 11 | 41 → «El ejemplo de clase usa impuestos: estrategia fiscal.» | 2 → «La comercial no es la vía de este grupo.» |
| | Instrumento | 13 | 33 → «Los aranceles son comerciales; aquí van los impuestos.» | 22 → «Intervenir el dólar es cambiario, no fiscal.» |
| | Medida | 8 | 17 → «Subir aranceles es comercial, no fiscal.» | 29 → «Vender dólares es cambiario, no fiscal.» |
| | Meta | 25 | 21 → «La meta debe medir el desempleo, no la inflación.» | 3 → «La meta debe medir el desempleo, no el dólar.» |

Nota de diseño: ninguna distractora es coherente con el grupo (se revisó que la monetaria
no aparezca como distractora en G7, ni la fiscal en G4 y G6, porque podrían defenderse).
Subtema: `pe-ambitos`, `pe-taller`; G1 y G4 además `pe-ramas`.
Celular: a 320 px la escalera ocupa la parte superior (peldaños de 36 px, el actual
ampliado a 48 px); las tres tarjetas van debajo en columna.

### H4 · El peldaño que no encaja (`pe26-h4-expediente`, Difícil, 50 FP × %)
**Consigna:** «Toca el peldaño que no encaja.» (6)
**Figura:** una escalera completa de seis tarjetas, con una incoherente. Tocar la errada:
la tarjeta se desprende, cae, y sube en su lugar la corrección con su explicación
(≤ 15 palabras). Tocar una coherente: borde coral breve, su retro, queda marcada ✓; se
sigue buscando (la escalera solo puntúa si se acierta al primer toque).
**Partida:** 4 escaleras sorteadas de 5. Puntaje = escaleras al primer toque / 4.

| Escalera | Peldaños (✗ = la que no encaja) | Retro al tocar una coherente | Corrección y explicación |
|---|---|---|---|
| E1 | P 6 · O 40 · E 18 · I 4 · ✗M 38 · Meta 21 | P «Los precios disparados son el problema.» · O «Controlar la inflación es el problema resuelto.» · E «La tasa es de la política monetaria.» · I «Con la tasa se enfría la demanda.» · Meta «Tiene cifra y plazo: es la meta.» | Sube el 27. «Bajar la tasa calienta la demanda y empuja los precios arriba.» |
| E2 | P 42 · O 37 · E 11 · ✗I 4 · M 15 · Meta 19 | P «Un déficit que crece es lo que está mal.» · O «Reducirlo es el problema resuelto.» · E «Las finanzas públicas son terreno fiscal.» · M «Recortar gasto cierra el hueco.» · Meta «Un punto del PIB a fin de año: cifra y plazo.» | Sube el 35. «La tasa es monetaria; recortar gasto usa el gasto público.» |
| E3 | P 24 · O 5 · E 41 · I 22 · ✗M 9 · Meta 3 | P «El peso perdió valor: ese es el problema.» · O «Frenarla es el problema resuelto.» · E «El precio del dólar es terreno cambiario.» · I «Intervenir el mercado es la herramienta.» · Meta «El dólar bajando con cifra: es la meta.» | Sube el 29. «Comprar dólares los encarece más; para frenar, hay que venderlos.» |
| E4 | P 28 · O 31 · E 2 · I 33 · M 17 · ✗Meta «Reducir las importaciones de acero» | P «El acero chino inundando es el problema.» · O «Controlarlas es el problema resuelto.» · E «Aranceles y comercio exterior: política comercial.» · I «El arancel es la herramienta.» · M «Subirlo con cifra es la medida.» | Sube el 43. «Sin cifra ni plazo es objetivo, no meta.» |
| E5 | P 34 · O 39 · ✗E 4 · I 13 · M 8 · Meta 25 | P «Desempleo del 23 % es lo que está mal.» · O «Reducirlo es el problema resuelto.» · I «Los impuestos son la herramienta fiscal.» · M «Bajarlos a empresas es la acción.» · Meta «Del 23 % al 20 % en un año.» | Sube el 11. «La tasa es un instrumento; la estrategia es la rama: política fiscal.» |

### H5 · Un paciente, dos fiebres (`pe26-h5-dos-fiebres`, Medio, 25 FP exploratorio)
**Gancho visual:** el cuerpo-circuito de A2 con tres medidores grandes de 5 rayas:
**Precios**, **Producción** y **Déficit fiscal**. Cada decisión mueve las rayas con animación
(280 ms por raya). Un mapa de 9 finales se va llenando (se guarda por estudiante).
**Inicio:** Precios 4/5, Producción 2/5, Déficit 3/5. Texto de entrada (≤ 12):
«Precios altos y la inversión cayendo. Tú decides el tratamiento.» (10)
**Paso 1 — consigna:** «Eres el Banco de la República. ¿Qué haces con la tasa?» (10)
| Opción | Efecto | Narración (≤ 15) |
|---|---|---|
| Subir la tasa | Precios −1, Producción −1 | «Los precios se calman, pero las grúas se detienen.» |
| Bajar la tasa | Precios +1, Producción +1 | «Las grúas vuelven, pero el termómetro de precios sube.» |
| Dejarla igual | — | «Ni frío ni calor: los dos problemas siguen.» |
**Paso 2 — consigna:** «Eres el Gobierno. ¿Qué haces con el gasto público?» (9)
| Opción | Efecto | Narración |
|---|---|---|
| Subirlo | Producción +1, Precios +1, Déficit +1 | «Más demanda: más producción, más precios y más déficit.» |
| Recortarlo | Producción −1, Precios −1, Déficit −1 | «Menos demanda: se calman los precios y el déficit, cae la producción.» |
| Dejarlo igual | — | «El Gobierno no mueve su perilla.» |
Los medidores se recortan a 1–5.
**Finales** (lectura bajo los medidores, ≤ 15 palabras):
| Paso 1 + Paso 2 | Medidores finales (P, Y, D) | Lectura |
|---|---|---|
| Subir + Subir | 4, 2, 4 | «Una rama frena y otra acelera: se anulan y crece el déficit.» |
| Subir + Recortar | 2, 1, 2 | «Precios a raya y menos déficit, pero la producción toca fondo.» |
| Subir + Igual | 3, 1, 3 | «Precios más calmados, producción más débil.» |
| Bajar + Subir | 5, 4, 4 | «Producción arriba, pero precios y déficit al máximo.» |
| Bajar + Recortar | 4, 2, 2 | «Se compensan: todo vuelve al inicio, con menos déficit.» |
| Bajar + Igual | 5, 3, 3 | «La producción mejora a costa de más inflación.» |
| Igual + Subir | 5, 3, 4 | «Más producción, pero más precios y más déficit.» |
| Igual + Recortar | 3, 1, 2 | «Menos precios y déficit, pero menos producción.» |
| Igual + Igual | 4, 2, 3 | «Sin tratamiento, la fiebre y la caída siguen ahí.» |
**Cierre** (todas): «Ningún remedio sale gratis. Por eso las políticas se coordinan.» (10) y botón
«Probar otro tratamiento». FP completo al ver el primer final; los demás no suman.
Fidelidad: los efectos siguen el modelo de DA del curso (inflación = exceso de DA, d. 8;
tasa → inversión; G → DA y déficit). Es cualitativo; no se muestran cifras inventadas.
Subtema: paso 1 `pe-ramas` (monetaria), paso 2 `pe-ramas` (fiscal), cierre `pe-da-ramas`, `pe-objetivos`.

---

## 3. Autoevaluación contra el Kit

| Dimensión | Nivel esperado | Por qué |
|---|---|---|
| Prerrequisitos | Pasa | Rastreable a d. 7–19 y al taller; se omite la cifra dudosa del déficit; sin clichés. |
| D1 | Avanzado | Cubre los 8 subtemas; el taller se convierte en 3 piezas. |
| D2 | Avanzado | Comprender (A1–A5), clasificar (H1, H3), construir (H2), evaluar (H4), decidir con costos (H5). |
| D3 | Avanzado | Retro específica por par o por tarjeta; corrección explicada en H4. |
| D4 | Avanzado | Cada decisión mueve algo con significado (escalera, cables, medidores). |
| D5 | Avanzado | Tokens Planck; íconos de rama consistentes. |
| D6 | Avanzado | Ninguna retro genérica: 30 pares en H1, 70 en H2, 27 en H3, 30 en H4. |
| D7 | Avanzado (a medir) | Enunciado más largo (27) medido a 320. |
| D8 | Avanzado | H1 sortea 12 de 42; H2 3 de 7; H4 4 de 5; H5 nueve finales. |
| D9 | Avanzado | Carro y grúa, cuerpo-circuito con virus, tarjetas que se curan, cables, escalera, medidores. |
| D11 | Avanzado | Íconos de rama + escalera común con el mismo significado en 4 piezas. |
| D13 | Medio | Verbos de acción, ≤ 12 palabras. |

## 4. Conteo de palabras
Aprender (≤ 20): A1 12 · 10 · 15 · 13 — A2 13 · 10 · 10 · 10 — A3 12 · 10 · 13 —
A4 13 · 10 · 10 · 11 · 10 — A5 12 · 8 · 9 · 6 · 11 · 13 · 16 · 11 · 12.
Consignas Hacer (≤ 12): H1 6 · H2 9 · H3 9 · H4 6 · H5 10, 10, 9.
