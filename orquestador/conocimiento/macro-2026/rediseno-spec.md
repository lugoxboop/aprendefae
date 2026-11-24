# Rediseño Macro 2026 con el checklist de 5 — especificación (Gen, 24-nov)

Base: la auditoría `rediseno-checklist.md` (50 de 59 piezas en prioridad) y
el canon `checklist-actividad.md`. No se rehace ninguna mecánica: se agrega
**escena, papel, contexto y mascota grande** encima de lo que ya funciona.

**Propiedad.** `src/macro2026/comun/` nació en este hilo para Macro 2026 (no
es lo compartido de Erwin, que vive en `src/components/`). Se toca sin issue.

## 1. El componente nuevo: `comun/Escenario.jsx`

Una franja de escena que va **arriba** de toda pieza, antes de la pregunta.

```
<Escenario tema="plaza" hora="tarde" lado="izq"
  mascota={{ id: "familia", pose: "alcancia" }}
  rol="Eres el asesor financiero de una familia…"
  contexto="Llegó la quincena…" compacto={false} />
```

- **Fondo de escena propio** (punto 5). Un `tema` por tema de la materia,
  con siluetas planas en SVG en línea (sin imágenes nuevas) sobre un
  degradado; la `hora` cambia el degradado para que dos piezas del mismo tema
  no se vean iguales:
  | tema | Tema | Siluetas | Acento (del kit, nunca coral) |
  |---|---|---|---|
  | `plaza` | T1 Demanda agregada | toldos de mercado, faroles | ámbar |
  | `despacho` | T2 Política económica | ventanal con ciudad, escritorio | turquesa |
  | `hacienda` | T3 Fiscal | fachada con columnas, pila de papeles | violeta |
  | `boveda` | T4 Monetaria | puerta de bóveda redonda, barras | dorado |
  | `puerto` | T5 Cambiaria | contenedores apilados, avión lejano | azul verdoso |
  `hora`: `manana` · `dia` · `tarde` · `noche` (cuatro degradados del navy).
- **Mascota** (punto 4) de pie sobre el «piso» de la escena, al `lado`
  indicado, con su rótulo de rol (`MascotaRol`). **180 px** en modo normal;
  **120 px** en modo `compacto`. Entra con un fundido + subida de 12 px en
  300 ms; nada si `prefers-reduced-motion`.
- **Tu papel** (punto 3): chip tipo gafete con la etiqueta «TU PAPEL» y la
  frase del rol (≤ 15 palabras).
- **Contexto** (punto 2): franja tipo nota/titular con la situación
  (≤ 30 palabras). Va antes de la pregunta, nunca después.
- Modo **`compacto`** (rondas de Hacer): alto total ≤ 150 px, mascota de
  120 px a un lado y el mini contexto de una línea al otro. Sin chip de rol
  (ya se vio en la tarjeta de inicio). El mini contexto es **por pregunta**.
- A 320 px: texto a la derecha de la mascota si cabe; si no, debajo. Nada se
  corta ni hace scroll horizontal.
- `MarcoAprender` / `MarcoHacer` reciben una prop `escena` y la pintan
  arriba; la pregunta queda en su propia tarjeta debajo (la tarjeta conserva
  `SUPERFICIE`, el fondo de escena es solo de la franja).

**Dónde va:**
- Aprender: escena completa en P1. P2 en adelante: compacta con «Sigues
  siendo …» solo si la pantalla cambia de situación; si no, sin escena.
- Hacer: escena completa en la tarjeta de inicio y compacta en cada ronda,
  con su mini contexto (patrón de la tabla, columna «Por ronda»).

**Datos:** un mapa `ESCENAS` en cada `textos.js` (id → tema, hora, lado,
mascota, rol, contexto, porRonda). Así el texto se mide en pruebas.

**Pruebas nuevas** (`escenas.test.mjs`): cada id de `PUBLICADAS_T1…T5` tiene
escena; rol ≤ 15 palabras; contexto ≤ 30; mini contexto ≤ 12; mascota
existente en `MASCOTAS`; dos piezas seguidas del mismo tema no repiten
`hora` + `lado`.

## 2. Contenido por pieza

Mascota = `id/pose`. Tamaño 180 en la escena completa salvo que se diga.
«(actual)» = el contexto ya existe en la pieza: se mueve a la franja.

### T1 · Demanda agregada — tema `plaza`
| id | hora·lado | Mascota | Tu papel | Contexto | Por ronda |
|---|---|---|---|---|---|
| da26-a1-carrito | dia·izq | familia/mercado | Te contratan en el DANE para medir cuánto compra el país entero. | Fin de mes: familias, empresas, Gobierno y extranjeros compran a la vez. Todo cabe en un solo carrito. | — |
| da26-a2-vaso-renta | tarde·der | familia/alcancia | Eres el asesor financiero de una familia que acaba de recibir su sueldo. | Llegó la quincena. Una parte se va al mercado y otra se guarda en la alcancía. | — |
| da26-a3-columpio-tasa | manana·izq | escena analista-empresario | Eres el analista de una fábrica que quiere comprar una máquina a crédito. | La empresa quiere crecer, pero la máquina se paga con préstamo. El banco acaba de anunciar su tasa. | — |
| da26-a4-no-miran-renta | dia·der | autoridad-economica/carpeta | Te contratan en el Ministerio de Hacienda para revisar el presupuesto. | Este año la renta del país subió, pero el presupuesto del Gobierno ya estaba aprobado desde diciembre. | — |
| da26-a5-bisagra-ascensor | noche·izq | analista/grafica | Eres el analista que dibuja la economía para el noticiero. | El noticiero quiere mostrar en una gráfica cómo cambian las compras del país cuando sube la renta. | — |
| da26-a6-eco-multiplicador | tarde·izq | autoridad-economica/grifo | Te contratan en el Ministerio de Transporte para estimar el efecto de una obra. | (actual) El Gobierno gasta 100 en una vía. | — |
| da26-h1-llena-carrito | dia·der | analista/libreta | Te contratan en el DANE para clasificar las compras del país. | Llegaron los recibos del mes. Cada compra la hizo alguien: familias, empresas, Gobierno o extranjeros. | «Recibo nuevo sobre tu escritorio:» |
| da26-h2-arma-formula | manana·der | profesor/pizarra | Eres el economista que arma la ecuación para el informe del Banco. | El informe necesita una sola cuenta con todo lo que compra el país. | consumo: «Primero, las familias: ¿de qué depende su gasto?» · inversión: «Ahora las empresas: ¿de qué depende invertir?» · DA: «Falta juntar todo en una cuenta.» |
| da26-h3-gira-o-sube | noche·der | analista/lupa | Eres el analista que actualiza la gráfica cada vez que llega una noticia. | La gráfica de la demanda agregada está en pantalla. Cada noticia puede moverla o girarla. | «Noticia de hoy:» + suceso |
| da26-h4-empresario | tarde·der | empresario/periodico | Eres el asesor del empresario: explícale qué le pasa a su negocio. | (actual) el titular de la ronda. | el titular |
| da26-h5-libreta | manana·izq | analista/libreta | Te contratan para revisar la libreta del analista antes de publicarla. | El analista anotó paso a paso un cambio en la economía. Una línea tiene un error. | «Página nueva de la libreta:» |
| da26-h6-meta | noche·izq | autoridad-economica/timon | Eres el ministro de Hacienda: lleva la producción a la meta. | (actual) `e.contexto` de la etapa. | `e.contexto` |

### T2 · Política económica — tema `despacho`
| id | hora·lado | Mascota | Tu papel | Contexto | Por ronda |
|---|---|---|---|---|---|
| pe26-a1-mecanico | dia·izq | profesor/pregunta | Imagina que eres el mecánico de la economía de un país. | (actual) Se te vara el carro. ¿Lo arreglas tú o llamas al mecánico? | — |
| pe26-a2-fiebre | manana·der | analista/lupa | Te contratan como médico de la economía: detecta la fiebre. | Hogares, empresas, Estado y exterior se pasan dinero todo el día. A veces el circuito se enferma. | — |
| pe26-a3-problema-resuelto | tarde·izq | autoridad-economica/carpeta | Eres el asesor del DNP que redacta los objetivos del plan. | El país tiene un problema: los precios suben demasiado. El plan debe decir a dónde quiere llegar. | — |
| pe26-a4-perillas | noche·der | autoridad-economica/timon | Te sientas frente al tablero de control del Estado. | La economía necesita un ajuste. El Estado tiene cuatro perillas y cada una la maneja un equipo distinto. | — |
| pe26-a5-escalera | dia·der | profesor/pizarra | Eres el asesor que arma, paso a paso, una política para el Gobierno. | El Gobierno quiere bajar la inflación. Antes de actuar, el plan tiene que subir seis peldaños. | — (la escalera conserva su panda) |
| pe26-h1-seis-cajones | manana·izq | analista/libreta | Te contratan en el DNP para ordenar el plan contra la inflación. | Te llegaron las notas sueltas del plan. Cada una va en un peldaño de la escalera. | «Nota suelta del plan:» |
| pe26-h2-grupo-logico | tarde·der | autoridad-economica/carpeta | Eres el asesor que completa la política antes de presentarla al ministro. | A la escalera le faltan tarjetas. El ministro la revisa en una hora. | «Tema de la reunión:» + grupo |
| pe26-h3-cables | noche·izq | profesor/libro | Eres el técnico que conecta cada herramienta con el equipo que la usa. | El Estado tiene muchas herramientas, pero cada una la maneja una sola rama de política. | «Herramienta sin conectar:» |
| pe26-h4-expediente | dia·izq | analista/lupa | Te contratan como auditor de políticas del Gobierno. | Llegó el expediente de una política. Alguien coló un peldaño que no pertenece a esta escalera. | «Expediente nuevo:» |
| pe26-h5-dos-fiebres | tarde·izq | autoridad-economica/timon (fiebre 1) · /grifo (fiebre 2) | (actual) Eres el Banco de la República. / Eres el Gobierno. | (actual) `ENTRADA_H5` | la lectura del paso |

### T3 · Política fiscal — tema `hacienda`
| id | hora·lado | Mascota | Tu papel | Contexto | Por ronda |
|---|---|---|---|---|---|
| pf26-a1-lupa | dia·der | analista/lupa | Eres el analista que revisa la política fiscal con una lupa de seis caras. | El Gobierno presentó su plan de impuestos y gasto. Antes de opinar, hay que mirarlo por todos los lados. | — |
| pf26-a2-buzones | manana·izq | familia/recibo | Te contratan en la DIAN para clasificar lo que entra al Estado. | Cada día llegan pagos al Estado: el IVA de un café, un peaje, el aporte a salud. | — |
| pf26-a3-cajeros | tarde·der | familia/mercado | Trabajas en la DIAN y atiendes dos ventanillas distintas. | A una ventanilla llega quien declara su renta; a la otra, quien compra un celular con IVA. | — |
| pf26-a4-tanque | noche·izq | autoridad-economica/grifo | Te contratan para cuidar el tanque del presupuesto nacional. | Este año entraron tributos y préstamos. Salieron pagos de funcionamiento, inversión y deuda. | — |
| pf26-a5-balanza | dia·izq | autoridad-economica/timon | Eres el asesor del ministro: dile qué hace cada perilla. | El ministro tiene tres perillas fiscales y quiere saber cómo mueve cada una la demanda. | — (los impactos conservan su mascota de 180) |
| pf26-h1-moneda | manana·der | familia/alcancia | Trabajas en la DIAN: cada pago entra a su buzón. | Abriste la ventanilla. Los pagos del día llegan uno por uno. | «Siguiente pago:» |
| pf26-h2-cajero | tarde·izq | empresario/explica | Eres el jefe de cajeros de la DIAN. | Cada tributo se cobra en una caja: la de directos o la de indirectos. | «Llega un tributo:» |
| pf26-h3-factura | noche·der | profesor/pregunta (sube a 180) | Eres el asistente del profesor; él te muestra un documento real. | (actual) el documento | la línea tocada |
| pf26-h4-expande | dia·der | autoridad-economica/carpeta | Eres el asesor del ministro de Hacienda. | Llega una medida nueva. Di si expande o contrae, y por dónde entra a la demanda. | «Medida sobre la mesa:» |
| pf26-h5-montanas | manana·izq | deudor-externo/sobre | Te contratan como analista de deuda pública del Ministerio de Hacienda. | La deuda de Colombia es una cordillera: una montaña interna y otra externa. | la consigna actual de cada reto |
| pf26-h6-memo | tarde·der | empresario/periodico | Te contratan como asesor de NOVA S. A. para revisar su memo. | (actual) el memo de la gerencia | — |

### T4 · Política monetaria — tema `boveda`
| id | hora·lado | Mascota | Tu papel | Contexto | Por ronda |
|---|---|---|---|---|---|
| pm26-a1-billetera | dia·izq | empresario/carrito | Eres el nuevo analista del Banco de la República. | Primer día: tu jefe te pide explicar para qué sirve el dinero en la economía. | — |
| pm26-a2-ventanilla | manana·der | autoridad-economica (la actual de 180) | Trabajas en la ventanilla del Banco de la República. | Un banco pide billetes nuevos. Solo una entidad en Colombia puede emitirlos. | — |
| pm26-a3-cascada | tarde·izq | familia/alcancia | Eres el analista que sigue el viaje de un depósito por los bancos. | (actual) Llevas 1.000 pesos al banco. | — |
| pm26-a4-cajas | noche·der | analista/libreta | Te contratan en el BanRep para contar todo el dinero del país. | Hay efectivo en bolsillos, reservas en bóvedas y depósitos en bancos. Hay que ordenarlo en cajas. | — |
| pm26-a5-precio-dinero | dia·der | profesor/pizarra | Eres el analista que explica de dónde sale la tasa de interés. | En la reunión de la Junta preguntan: ¿de dónde sale el precio del dinero? | — |
| pm26-a6-palancas | manana·izq | autoridad-economica/timon | Te sientas en la Junta Directiva del BanRep. | La Junta tiene tres palancas para regular el dinero y el crédito. | — |
| pm26-a7-termostato | tarde·der | autoridad-economica/grifo | Eres el encargado del termostato de la economía. | (actual) Inflación alta es una casa caliente. | — |
| pm26-h1-entra-sale | noche·izq | analista/libreta | Eres el analista del BanRep que vigila el dinero en circulación. | Cada operación del Banco mueve la base monetaria. Anota qué sube y qué baja. | «Operación de hoy:» |
| pm26-h2-cascada-meta | dia·izq | autoridad-economica/carpeta | Te contratan para ajustar el encaje y llegar a la meta de dinero. | La Junta fijó una meta de dinero total. Tú solo mueves el encaje. | «La Junta pide:» + meta |
| pm26-h3-cajas | manana·der | inversionista/monedas | Eres el contador del dinero del BanRep. | Te llegan cosas sueltas: billetes, cuentas, CDT. Cada una va en su primera caja. | «Llega a tu mesa:» |
| pm26-h4-mueve-tasa | tarde·izq | analista/lupa | Eres el analista que actualiza la gráfica del mercado de dinero. | La gráfica de oferta y demanda de dinero está en pantalla. Cada noticia mueve una curva. | «Noticia de hoy:» + suceso |
| pm26-h5-junta | noche·der | autoridad-economica/timon (sube a 180) | Ahora eres miembro de la Junta del BanRep: tú decides. | (actual) la lectura de la ronda | la lectura |
| pm26-h6-domino | dia·der | profesor/libro | Eres el analista que explica cómo se propaga una decisión del BanRep. | La Junta acaba de decidir. Ordena cómo cae cada ficha en la economía. | «Decisión:» + nombre de la cadena |

### T5 · Política cambiaria — tema `puerto`
| id | hora·lado | Mascota | Tu papel | Contexto | Por ronda |
|---|---|---|---|---|---|
| pc26-a1-balanza | dia·izq | viajero/cambio | Te contratan como analista de una casa de cambio. | (actual) las cuatro noticias | — |
| pc26-a2-subasta | manana·der | (las seis actuales en P1) | Eres el subastador del mercado de dólares. | Unos llegan con dólares para vender; otros necesitan comprarlos. Tú juntas a los dos. | — |
| pc26-a3-nominal-real | tarde·izq | exportadora-flores/flores | Eres el asesor de la exportadora de flores. | (actual) el cartel del 16 de abril de 2025 | — |
| pc26-a4-banano | noche·der | exportadora-flores/avion | Te contratan como asesor de Tropical Fruits. | (actual) Tropical Fruits vende banano a US Foods. | — |
| pc26-a5-tuberias | dia·der | analista/libreta | Te contratan para llevar las cuentas del país con el exterior. | Este año entraron dólares por exportaciones e inversión, y salieron por importaciones y deudas. | — |
| pc26-a6-imanes | manana·izq | inversionista/monedas | Eres el asesor de un inversionista que tiene ahorros. | Tu cliente puede dejar su plata en Colombia o llevarla afuera. Quiere entender qué la atrae. | — |
| pc26-a7-correa | tarde·der | autoridad-economica (la actual de 180) | Te sientas en la Junta del BanRep a cuidar el dólar. | El dólar se movió fuerte esta semana. La Junta decide cuánto dejarlo moverse. | — |
| pc26-h1-quien-aprecia | noche·izq | viajero/cambio | Eres el analista que lee el tablero de la casa de cambio. | El tablero muestra el dólar de antes y el de ahora. Di quién ganó valor. | «El tablero cambió:» + cifras |
| pc26-h2-empuja-curva | dia·izq | analista/lupa | Eres el analista que mueve la gráfica del dólar cuando llega una noticia. | La gráfica de oferta y demanda de dólares está en pantalla. Cada noticia empuja una curva. | «Noticia de hoy:» + suceso |
| pc26-h3-aguja | manana·der | exportadora-flores/flores (sube a 180) | Eres el asesor de la exportadora: dile si este año ganó. | Cambiaron el dólar y los precios aquí y allá. Lleva la aguja al cambio real. | las tres cifras + la nota actual |
| pc26-h4-a-quien-sirve | tarde·izq | (las dos actuales; suben a 150 c/u) | Eres el asesor de dos empresas: dile a cada una quién gana. | (actual) la noticia | la noticia |
| pc26-h5-donde-ahorro | noche·der | inversionista/monedas (sube a 180) | Eres el asesor financiero del inversionista. | (actual) el caso | el caso |
| pc26-h6-correa | dia·der | viajero/maleta | Te contratan para clasificar cómo cada país maneja su moneda. | Cada país amarra su moneda de una forma: fija, suelta o a medias. | «País de hoy:» |

## 3. Cuidados
- Los tonos (`hora`) son navy: el texto sigue en contraste AA. Medirlo.
- `analista/grafica` (sube) solo en da26-a5, donde la DA sí crece con la
  renta. Nunca donde la respuesta sea «baja».
- Rondas: la mascota compacta no puede tapar la gráfica ni el área de
  arrastre. Si no cabe a 320 px, la mascota va a la izquierda de la franja
  y el mini contexto a la derecha, con la gráfica debajo.
- Datos de estudiantes: no se toca ningún id, puntaje ni migración. Es solo
  presentación.

## 4. Lotes
1. `Escenario.jsx` + T1 (12 piezas). Video a 320 y 375 de 3 piezas.
2. T2 + T3. 3. T4 + T5. Cada lote: PR, CI, fusión, despliegue, video.
4. Gemini: escenas dobles que falten (p. ej. analista + autoridad en la
   Junta) para reemplazar poses repetidas en una segunda pasada.
