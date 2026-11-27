# Guía de estilo de imágenes (Gemini)

Para que todas las imágenes que pidan a Gemini **Gen y los generales (Miku,
Erwin, Magno)** salgan **coherentes entre sí**. Es la referencia fija: antes de
pedir una imagen, el agente lee esta guía y la cumple; cuando cierra la
descripción definitiva de un personaje, la **anota aquí** para que la próxima
vez salga igual.

## Flujo (cualquier agente)
Gen y los generales pueden pedirle imágenes a Gemini desde el navegador de los
agentes, sin que Mateo descargue nada:
1. **Pide** en Gemini con una descripción precisa + el **estilo bloqueado** de
   esta guía (misma paleta de marca, mismo trazo, misma descripción por
   personaje), para que todas salgan iguales.
2. **Mascotas que se animan:** pídelas **por partes** (cabeza, cuerpo, patas,
   cola) o en varias poses, con fondo transparente o liso, **no una foto**.
3. **Descarga** desde Gemini, saca la imagen de `Descargas/Imagenes-agentes`,
   **revísala** (que se vea bien y respete el estilo) y **súbela** al proyecto
   con un nombre claro.
4. Si **Gemini falla** o la página cambia: reintenta 2 veces; si sigue, avisa en
   una línea y sigue con otra tarea.
5. En lo **animado**, se mantiene la regla de evidencia visual (video a 320 y
   375 px, verificador aparte).

## Reglas fijas para todas las imágenes
- **Paleta:** la del kit de marca (`orquestador/conocimiento/marca-planck.md`):
  grafito `#121418`, azul `#2747F5` (claro) / `#6F86FF` (oscuro); **coral solo
  para error**, nunca de relleno. Nada de clichés de gamificación (trofeos,
  coronas, cofres, gemas).
- **Trazo:** el mismo estilo de línea y acabado en todas (defínelo una vez abajo
  y no lo cambies entre personajes).
- **Fondo:** transparente o liso, **nunca una foto o una escena cargada**.
- **Fidelidad:** una imagen nunca puede implicar algo conceptualmente falso del
  tema (regla del Kit).

## Mascotas que se animan (marionetas)
Las 7 especies son marionetas de piezas (ver `src/mascota/marionetas.js`): se
animan por partes. Por eso, para una mascota:
- Pide el personaje **por partes** (cabeza, cuerpo, patas, cola) **o** en varias
  poses, con **fondo transparente o liso** — **no una sola foto**.
- Cada parte/pose debe encajar con las demás (misma escala, mismo trazo, misma
  paleta de la especie).

### Caras en capas: ojos, nariz y boca (23-nov)
Cada cara se arma con capas sueltas sobre la **cabeza sin rasgos**: ojos (por
ánimo), **una sola nariz** (`nariz.webp`, la misma en todos los ánimos, va
encima de la boca) y boca (por ánimo, **sin nariz**). Nunca pedir ni usar una
pieza que traiga la cara entera o una boca con la nariz pintada: al cambiar de
ánimo se ven dos narices o dos bocas (el error del hámster). Al pedir a Gemini:
«cabeza SIN ojos, SIN nariz y SIN boca; nariz sola; bocas SIN nariz». Si lo que
devuelve cambia la cabeza o el trazo, las piezas se recortan del arte original
con `scripts/mascotas/separar-caras.py` (así se hizo el 23-nov; la hoja de
Gemini del hámster quedó en `public/mascotas/origen-gemini/hamster-piezas-cara.webp`).

### Las 7 especies
Panda · conejo · hurón · zorro · gato · perro · hámster.

La descripción visual exacta de cada especie (proporciones, pelaje, rasgos)
vive hoy en `src/mascota/marionetas.js` y `public/mascotas/`. Aquí Gen deja, por
especie, la **descripción bloqueada** que le pasa a Gemini (una vez la fija),
para que no cambie entre pedidos:

| Especie | Descripción bloqueada para Gemini (Gen la llena al fijarla) |
|---|---|
| Panda |  |
| Conejo |  |
| Hurón |  |
| Zorro |  |
| Gato |  |
| Perro |  |
| Hámster |  |

## Elenco de mascotas de Macroeconomía 2026 (orden de Mateo, 23-nov, 02:38)

**Manda sobre el elenco de personas de abajo.** Mateo: las personas se sienten
muy serias; los Aprender se explican con las mascotas y sus interacciones.
Los objetos (lupa, flechas, celulares…) se conservan.

Reglas:
- Cada mascota lleva **siempre** su rol escrito debajo («Empresario»), porque el
  rol objetivo es lo que importa, no el animal.
- **Tierno sí, infantil no:** cara tranquila (`animo="quieta"` o
  `"tranquila"`), sin corazones, sin diminutivos en el texto. Son universitarios.
- Tamaño: **nunca menos de 120 px** de alto; si protagoniza, 180 px o más.
- En código se usa la marioneta: `<Mascota especie="zorro" puestos={["corbata"]} animo="quieta" tamano={160} />`.
  Las imágenes de situación (abajo) se usan cuando la escena pide un objeto en
  la mano o una acción que la marioneta no hace.

| Rol | Especie | Accesorio (marioneta) | Temas |
|---|---|---|---|
| Empresario | zorro | `corbata` | T1 |
| Analista | gato | `gafas` | T1 |
| Autoridad económica / banco central | panda | `traje` | T2, T4 |
| Profesor | perro | `corbatin` | T3 |
| Familia | conejo ×2 + conejo pequeño | — | T3 |
| Inversionista | hurón | `corbata` | T3, T5 |
| Exportadora de flores | hámster | `gorra` | T5 |
| Importadora de celulares | conejo | `casco` | T5 |
| Viajero | perro | `mochila` | T5 |
| Quien paga deuda externa | zorro | `corbatin` | T5 |

Dentro de un mismo tema ninguna especie repite rol salvo la familia.

### Origen y archivos
- Chat de Gemini **«Chibi Fox Model Sheet»**: ahí nacieron las 7 mascotas. Sus
  32 imágenes (hojas de modelo, piezas, brazos, cuerpos, caras) quedan en
  `public/mascotas/origen-gemini/` como referencia y para recortar piezas nuevas.
- Situaciones de macro: `public/macro2026/mascotas/<rol>-<accion>.png`, pedidas
  en ese mismo chat para que el estilo no cambie.

### Situaciones ya hechas (23-nov, 36 piezas, WebP transparente, 440–560 px de alto)
En `public/macro2026/mascotas/`:
- **empresario** (zorro, corbata): carrito, periodico, explica.
- **analista** (gato, gafas): libreta, lupa, grafica.
- **autoridad** (panda, saco y corbata): timon, grifo (salen monedas), carpeta.
- **profesor** (perro, corbatín): pregunta, pizarra, libro.
- **familia** (conejos): mercado, alcancia, recibo.
- **inversionista** (hurón, corbata): tableta, ladrillo, monedas.
- **exportadora** (hámster, gorra): flores, avion, recibe-billete.
- **importadora** (conejo, casco): celulares, contenedor, paga-billete.
- **viajero** (perro, mochila): maleta, cambio, avion.
- **deudor** (zorro, corbatín gris): sobre, monedas, balanza. Ojo: la cara salió algo
  pensativa; no usarla donde la pregunta sea si al deudor le va bien o mal.
- **interaccion-**: analista-empresario, autoridad-empresario,
  inversionista-empresario, exportadora-importadora, viajero-banco-central,
  familia-carrito.

Ojo con `analista-grafica` (barras que suben) y `inversionista-tableta` (línea
que sube): no ponerlas donde la respuesta sea «baja».

### Cómo se pide una situación (pegar en ese chat)
> HOJA DE SITUACIONES. Este mismo <especie> chibi exacto de esta conversación
> (mismo estilo, mismos colores, mismo contorno negro grueso), con <accesorio>.
> Tres poses separadas en una fila, de cuerpo entero: <acción 1>; <acción 2>;
> <acción 3>. Expresión tranquila, boca pequeña, sin lágrimas ni corazones.
> Accesorios y objetos en azul #2747F5, azul claro #6F86FF y gris azulado
> #C9D1E4. Sin texto, sin letras, sin números. Fondo blanco liso, sin suelo ni
> sombra, mucho espacio entre poses.

## Elenco de personas de Macroeconomía 2026 (fijado por Gen el 23-nov, **reemplazado por las mascotas**)

Los personajes de las piezas `da26-`, `pe26-`, `pf26-`, `pm26-` y `pc26-`.
Sus nombres dicen **qué son**, nunca qué opinan: por eso la cara es
**neutra** (sin sonrisa ni ceño). Una expresión podría regalar la respuesta.

### Estilo bloqueado (se pega igual al inicio de cada pedido)
> Ilustración vectorial plana de un solo personaje, de cuerpo entero, de pie y
> de frente, ligeramente de tres cuartos. Proporciones adultas realistas pero
> simplificadas (cabeza = 1/7 del cuerpo), universitario, nada infantil.
> Contorno uniforme y redondeado de grosor medio en azul muy oscuro #121418.
> Rellenos planos, sin degradados, sin sombras, sin texturas. Paleta
> restringida: azul #2747F5, azul claro #6F86FF, gris azulado #C9D1E4, blanco
> #FFFFFF, piel en tonos planos variados. Sin rojo ni coral. Expresión facial
> neutra y tranquila, boca recta, sin sonrisa ni ceño. Sin texto, sin logos,
> sin marcas. Fondo blanco liso #FFFFFF, sin suelo ni sombra proyectada, con
> margen alrededor. Formato cuadrado.

Gen quita el fondo blanco al revisar y guarda un PNG transparente. El blanco
del personaje no se pierde porque queda encerrado por el contorno.

### Descripción bloqueada por personaje (se agrega tras el estilo)
| Archivo | Personaje | Descripción para Gemini | Dónde aparece |
|---|---|---|---|
| `empresario.png` | El empresario | Hombre de unos 45 años, camisa azul #2747F5 remangada y pantalón gris azulado. Sostiene un periódico doblado bajo el brazo. | T1 H4 |
| `analista.png` | La analista | Mujer de unos 30 años, cabello recogido, blazer azul claro #6F86FF y blusa blanca. Sostiene una libreta abierta y un lápiz. | T1 H5 |
| `autoridad-economica.png` | La autoridad económica | Persona de unos 50 años, de género ambiguo, traje sobrio gris azulado y corbata azul #2747F5. Sostiene una carpeta cerrada. | T2 A5 |
| `profesor.png` | El profesor | Hombre de unos 55 años con gafas, suéter azul #2747F5 sobre camisa blanca. Una mano levantada, como quien hace una pregunta. | T3 H |
| `familia.png` | Familia | Una madre, un padre y una niña de unos 8 años, de pie juntos. Ropa casual en azul, azul claro y blanco. | T3 A |
| `inversionista.png` | Inversionista | Mujer de unos 40 años, traje azul #2747F5, sostiene una tableta. | T3 A, T5 |
| `exportadora-flores.png` | Exportadora de flores | Mujer de unos 35 años, delantal azul claro #6F86FF, carga una caja de cartón abierta con flores blancas y azules. | T5 H4, T5 A |
| `importadora-celulares.png` | Importadora de celulares | Hombre de unos 30 años, chaqueta gris azulada, carga una caja de cartón con celulares. | T5 H4, T5 A |
| `viajero.png` | Viajero | Persona joven con mochila y maleta de ruedas azul #2747F5. | T5 A |
| `deudor-externo.png` | Quien paga deuda externa | Hombre de unos 50 años, camisa blanca y corbata azul, sostiene un sobre grande. | T5 A |

Se guardan en `public/macro2026/personajes/`. Pesan como máximo 120 KB cada
uno y miden 512 × 512 px.


### Tamaños mínimos (orden de Mateo, 23-nov: «quedan muy chiquitas»)
- **Nunca a 72 px.** Si el espacio es compacto, va el **busto** (`personajes/busto/`, 384 px) a 120 px como mínimo, o 140 px desde 375.
- Si el personaje protagoniza la pantalla, va de **cuerpo entero a 180 px de alto como mínimo**, sin disco.
- La familia va siempre de cuerpo entero.

### Kit de animación (Gemini, 23-nov)
Las piezas salen de hojas de recursos, todas con el mismo estilo, y se recortan con fondo transparente.
- `public/macro2026/objetos/`, 36 piezas:
  - **Demanda agregada:** carrito, bolsa-mercado, fabrica, edificio-gobierno, barco, billetes.
  - **Política económica:** termometro, caja-herramientas, llave-inglesa, escalera, lupa, engranajes.
  - **Fiscal:** alcancia, recibo, carretera, hospital, escuela, balanza.
  - **Monetaria:** banco-central, boveda, grifo, billetes-alas, ancla, cajero.
  - **Cambiaria:** billete-dolar, moneda, avion-carga, contenedor, celular, flores.
  - **Transiciones:** flecha-curva, flecha-arriba, flecha-abajo, nube, reloj-arena, bombilla.
- `public/macro2026/personajes/poses/`, para animar entradas y pasos:
  - empresario-camina, empresario-lee, empresario-senala;
  - analista-camina, analista-escribe, analista-senala;
  - autoridad-sube, autoridad-camina, autoridad-tarjeta.

Cómo se piden más: «HOJA DE RECURSOS» con el bloque de estilo, seis objetos separados en una cuadrícula de 3 × 2 con mucho espacio blanco y fondo blanco liso. Para las poses: «HOJA DE POSES» del mismo personaje, tres poses en fila. Los objetos miden unos 270 px de origen. Si una pieza va a mostrarse a más de 270 px, se pide sola, en grande.

## Objetos ilustrados (paso 6, orden de Mateo del 25-nov)
Todo objeto del visual que no sea mascota se pide a Gemini y se integra; nada
de rectángulos o líneas a mano como protagonistas. El kit plano de 36 objetos
(arriba) queda para iconos pequeños; lo grande y protagonista sale de aquí.
- **Chat de Gemini «Frasco de Vidrio»** (25-nov): ahí nacen. Se pide uno por
  imagen, grande, y en el mismo chat para que el estilo no cambie.
- **Estilo bloqueado** (se pega al inicio): «Ilustración de UN solo objeto para
  un juego educativo móvil. Estilo cartoon de juego móvil, a juego con mascotas
  chibi: contorno oscuro grueso, sombreado suave, brillos blancos. Colores: azul
  #2747F5, azul claro #6F86FF, gris azulado #C9D1E4. Sin texto, sin letras, sin
  números. Fondo verde croma plano #00FF00 que llena toda la imagen, sin sombra
  ni suelo. Objeto completo centrado con margen amplio.»
- **Si Gemini responde «soy un modelo de lenguaje»** (pasa tras unas 7
  imágenes en un chat): chat nuevo, estilo bloqueado completo al inicio.
- **Un objeto en varios colores** (los buzones por tributo): se pide en gris
  claro y se tiñe con `scripts/ilustrados/tenir.py entrada salida #rrggbb`.
- **Lo que se llena en vivo** (agua, mercurio, compras): pedir el recipiente
  VACÍO y de vidrio o rejilla abierta («se ve el fondo a través»). En la pieza:
  el objeto detrás, lo que se llena en medio y una segunda copia del objeto
  encima al 30–40 % para que los brillos queden por delante.
- **Recorte:** verde croma a alfa (clave por dominancia del verde, con quita de
  derrame), recorte al contenido y WebP con alfa; el vidrio se vuelve neutro
  azulado (si queda verdoso parece lleno). Original en
  `/mnt/project-files/macro-2026/ilustrados-origen/`.
- **Dónde:** `public/macro2026/ilustrados/<id>.webp`, registrado con sus medidas
  en `src/macro2026/comun/ilustrados.jsx` (la prueba las mide).
- **Revisión:** cada imagen se mira sola sobre el fondo navy antes de usarla; si
  algo se ve raro o deforme, se regenera.

Hechos (lote 1): frasco-banco, termometro-vidrio, grifo, casa-aire,
tanque-estado, carrito-mercado, manguera. (Lote 2): balanza-pie,
balanza-brazo, fajo-pesos, billete-usd, moneda-oro, iman, nube-tormenta,
balde, casa-pais, globo, arbol-raices, golondrina, deposito-reservas,
caja-bananos, candado.
Gestión de Proyectos lote 1: cinta-transportadora, bandeja-madera, sobre-carta,
reloj-arena, escritorio-madera, carpeta-abierta, sello-goma, puente-tablones,
letrero-luminoso, tablero-corcho, celular, plano-enrollado, porton-madera,
archivador-cajones, calendario-pared, conmutador, telefono-antiguo, cafetera-goteo,
puente-grietas, camion-cafe, puente-reforzado, puente-nuevo, carpeta-documento,
memorando-clip, sobre-boleto, bodega, archivador-metalico, tablero-organigrama,
dial-radio, bolsa-dinero, edificio-oficinas, portapapeles, timon, en
public/gestion-proyectos/ilustrados/ (originales: 11 hojas en
/mnt/project-files/gestion-proyectos/ilustrados-origen/).
- **Hojas:** varios objetos en una fila con mucho espacio verde entre ellos; se
  cortan con `scripts/ilustrados/hoja.py` (también guarda las cajas).
- **Objetos verdes** (hojas de árbol, billete verde): el recorte los come. Se
  rellenan con `rellenar.py` desde el original (`-` conserva el color; un
  `#rrggbb` lo retiñe, así el billete de dólar quedó en el tono DÓLAR).
- **Gemini se niega** a «billete tipo dólar»: pedir «billete de juguete».

## Dónde quedan las imágenes
- Gemini descarga a la carpeta **Descargas/Imagenes-agentes** del computador.
- Gen revisa la imagen (que se vea bien y respete esta guía) y la sube al
  proyecto con un **nombre claro** (p. ej. `panda-cabeza.png`, `zorro-pose-saludo.png`).
- **Derechos de autor:** a este repositorio (público) van las imágenes propias
  generadas; nunca los originales de terceros.
