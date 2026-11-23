# T5 · Política cambiaria — construcción (rama `macro26-lote6`)

Fuente: `disenos/t5-politica-cambiaria.md` (Gen). Código en
`src/macro2026/politica-cambiaria/`; lo común del tema en `comun-pc.jsx`
(balanza del dólar, gráfica del mercado cambiario, dial del cambio real,
imanes, barras aquí/afuera, correa). Los tonos del peso y del dólar en
`comun/monedas.js`. Mascotas de `comun/mascotas.jsx` (nunca personas) y
objetos del kit de `comun/kit.jsx`. Vista previa: `#/macro-2026/<id>`;
`?semilla=N` fija el azar. Publicado directo (lote 6, 2026-11-23 00:22,
hora de Bogotá): Mateo pidió publicar a medida que se termina.

## Casillas

- [x] Textos, catálogo, lo común del tema (`textos.js`, `catalogo.js`, `comun-pc.jsx`, `comun/monedas.js`)
- [x] A1 · La balanza del dólar
- [x] H1 · ¿Quién se apreció?
- [x] A2 · La subasta de dólares
- [x] H2 · Empuja la curva
- [x] A3 · Nominal no es real
- [x] A4 · La tonelada de banano
- [x] H3 · La aguja del real
- [x] H4 · ¿A quién le sirve?
- [x] A5 · Dos tuberías
- [x] A6 · Imanes de capital
- [x] H5 · ¿Aquí o afuera?
- [x] A7 · La correa del dólar
- [x] H6 · Cada hecho a su correa
- [x] Pruebas (`__tests__/t5-textos-y-bancos`, `t5-piezas`, `t5-hacer`)
- [x] Sondas a 320 y 375: 26/26 sin contraste malo, letra ≥ 12 px, toques ≥ 44, sin desborde
- [x] Videos a 320 y 375 (`/mnt/project-files/macro-2026/videos/t5/`, 26)
- [x] Publicación: `PUBLICADAS_T5` con las 13, `subjects.js`, ruta, 0274 en `migrations/`
- [x] Ninguna Hacer va por etapas: `etapas_test.sql` no cambia (su chequeo 2 las cubre)

## Decisiones reversibles tomadas al construir

1. **Conteo de §4.** Se cuenta como palabra todo token con una letra o una
   cifra («%», «−», «+», «≈», «=» sueltos no cuentan; así cuenta Gen). Aun
   así diecisiete pantallas difieren del conteo declarado en una palabra
   (lista exacta en `CONTEO_REAL` de `t5-textos-y-bancos.test.mjs`). Los
   textos quedan como en §2; la prueba exige ≤ 20 y diferencia ≤ 1.
2. **Tonos del peso y del dólar** (`comun/monedas.js`): peso `#8a9cff`
   (--accent-hover) y dólar `#4fc2b2` (--success), nunca coral y siempre
   con su símbolo ($, USD). La prueba mide ≥ 3:1 con el fondo y ≥ 4,5:1 con
   la tinta de las fichas. No chocan con el tono de la rama (#e9c46a).
3. **Modelo de divisas** (A2, H2): Od = 3000 + 20(Q − so), Dd = 5000 −
   20(Q − sd); el cruce da tc 4.000. Cada empujón corre la curva 15. En H2
   se mueven las dos curvas; cuenta la que más se movió (umbral 4); curva y
   dirección puntúan por separado, cada una con su retro. Las asas se
   arrastran o se mueven con ← →.
4. **Mascotas.** A1 P5: escena `exportadora-importadora` (150 px). A2 P1:
   seis mascotas de 120 px con su rol escrito (exportadora «avion»,
   inversionista «monedas», deudor «sobre» / importadora «contenedor»,
   viajero «maleta», deudor «monedas»). El deudor solo va en A2 y en H2
   («pagan su deuda externa»), donde no se pregunta si le va bien o mal;
   nunca en H4, H5 ni A6. Petróleo y café en H2 van como objetos del kit
   (barco, avión de carga) con su rótulo. BanRep en H2: panda autoridad
   «carpeta» (compra) y «grifo» (vende), con el nombre debajo.
5. **H4.** La exportadora («recibe-billete») y la importadora
   («paga-billete») van a 120 px, no a 72: a 320 caben con el pañuelo al
   medio. El pañuelo se arrastra (umbral 36 px), o se toca a quien gana, o
   ← →. El error deja el pañuelo en coral con la retro; se reintenta y
   puntúa solo el primer intento.
6. **H3.** La aguja empieza vacía (sin marcar) y se arrastra sobre el dial
   o se mueve con ← → de a 0,5. Tolerancia ± 0,5. Diagnóstico: signo
   invertido, olvido del nominal u otro, cada uno con su retro; al revisar
   aparece la aguja correcta punteada y el ITCR. El dial va de −6 a +6: un
   signo invertido que se sale (ronda r5: +8) queda en el tope y cuenta
   como «otro».
7. **H5.** No hay consigna general: el encabezado muestra la consigna de
   cada decisión (la de la primera es la de `CONSIGNAS`). Las seis van en
   orden fijo (ahorro y luego crédito). Las barras dan lo calculado
   (ahorro afuera $624 sin cambio; crédito afuera $1.080) con topes 720 y
   1.260. El inversionista va con «monedas» en el ahorro y «ladrillo» en
   el crédito (el deudor se evitó a propósito; «tableta» nunca).
8. **A6 P7.** Bajo la regla en fichas va una línea extra con la cuenta del
   caso: «4 % + 12 % ≈ 16,5 %».
9. **A3 P5.** Tres botones de zona (devaluación, equilibrio, revaluación)
   mueven la aguja y la exportadora («recibe-billete» si gana, «flores» si
   no); «Siguiente» espera devaluación y revaluación.
10. **A5.** Las tuberías son botones: en P2 y P3 se toca la suya y pasan los
    objetos que lleva. P4: IED (árbol con raíces) y capital golondrina
    (pájaro) que se va con «Pasa un trimestre». P6: dos botones de saldo
    que suben o bajan el tanque de reservas.
11. **A7.** Cada régimen es el rastro del tc en el tiempo con un perro
    dibujado en la punta y la correa al dueño (poste, techo y piso, rampa,
    suelto); se reproduce una vez al entrar y con «Otra vez». P4 es la
    escena `viajero-banco-central` a 180 px con los chips perro/dueño. P1:
    panda «carpeta» a 180 px (protagoniza). P8 espera «Flotación sucia».
12. **A1 y A4.** A1 P1 espera las cuatro noticias; P3 y P4 esperan llevar
    el tc a ≥ 4.500 y ≤ 3.800. A4 P4: «Sí le compra» es el error (coral
    con la retro de Gen); P6 es el dial con las dos marcas 0,981 y 1,015.
13. **Etapas.** Ninguna Hacer de T5 va por etapas: `etapas_test.sql` no
    cambia.
14. **Publicado directo** en el mismo cambio: `PUBLICADAS_T5` (las 13),
    `subjects.js`, ruta `politica-cambiaria` (tema nuevo, nunca tuvo vista
    vieja), `FORMATO_MACRO`, etiquetas del panel y la 0274.
