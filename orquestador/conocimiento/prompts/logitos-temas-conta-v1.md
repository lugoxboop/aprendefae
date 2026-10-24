# Logitos de los cuatro primeros temas de Contabilidad · v1 (Ukyo, 23 oct 2026)

Encargo 3 de Miku/Mateo. Hoy los cuatro comparten la T de cuenta T (el ícono de la materia); los de abajo ya tienen el suyo (T5, T6, T7 en tres temas, repaso del cap. 5). Aquí quedan **al mismo nivel**, dentro del sistema de Xeno (`kit.md`, «El sistema de los identificadores de tema»): 64×64, dibujo dentro de 4…60, contorno de 3 px redondeado, `currentColor`, **un solo elemento** en `var(--fae-acento)` con el único relleno al 16 %, ese mismo es el único que se mueve (una vez, 400 ms, solo transform, `data-mueve` + `--mueve`), sin letras, cifras, coral, teal ni lista prohibida, ≥ 4 px entre trazos en reposo.

Orígenes: [fuente] leído en el repo · [propuesta] decisión de diseño sin medir.

## 1. Reserva de glifos (antes de elegir, para que nadie coincida)

Objetos ya ocupados por identificadores publicados [fuente: `identificadoresDeTema.js`]: título con sello-reloj (T5) · factura con moneda (T6) · cajas del conteo (inventario periódico) · kárdex (permanente) · etiqueta rebajada (descuentos) · mazo de fichas (repaso cap. 5).
Ocupados por íconos de **actividad** [fuente: `iconosActividad.jsx`]: balanza (`Scale`, «quién gana, quién pierde»), medidor, sirena, termómetro, sello, hojas, interruptor, carpeta, regla, represa y los demás de ese archivo.
Por eso **descarto la balanza** para la introducción (chocaría con la actividad de `Scale`) y **no uso fichas sueltas** (las tiene el mazo).

**RESERVO, a nombre de Ukyo, hasta que se fusione la entrada del registro:**

| Tema (clave del registro) | Glifo | Objeto |
|---|---|---|
| `contabilidad/introduccion-contabilidad` | **LibretaYLapiz** | libreta cerrada con un lápiz |
| `contabilidad/cuentas-debe-haber` | **CasilleroDeCuentas** | casillero de 2×2 con una ficha |
| `contabilidad/ingresos-gastos-y-caja` | **CalendarioConCinta** | hoja de calendario con una cinta marcadora |
| `contabilidad/efectivo-caja-menor-bancos` | **CajonDePaso** (Hanayama, ya escrito) | cajón de caja con un billete |

Quien quiera otro objeto para otro tema: que no sea ninguno de esta tabla ni de los listados arriba.

## 2. Qué dice cada uno y por qué ese objeto

| Glifo | Idea del tema | Por qué se entiende de un vistazo |
|---|---|---|
| **LibretaYLapiz** | T1 · el recorrido de un hecho y la ecuación: contabilidad empieza por **anotar** | Es lo primero que haría un tendero al abrir su negocio: abrir la libreta y apuntar. Se lee a 32 px y en gris |
| **CasilleroDeCuentas** | T2 · las dos familias de cuentas, el debe y el haber: **cada cuenta tiene su casilla** | Un casillero de correos: cada cosa va a su lugar. Cuadrícula 2×2 = dos familias × dos lados, sin repetir la T |
| **CalendarioConCinta** | T3 · ingresos, gastos y ajustes: **a qué periodo le toca** | La hoja del mes con su marcador: lo que se causó este mes se queda en este mes aunque se cobre después |
| **CajonDePaso** | T4 · efectivo, caja menor y bancos | El cajón del mostrador: la plata que entra y sale. Es el de Hanayama; lo **adopto** (ver §4) |

## 3. Geometría (coordenadas del viewBox 0 0 64 64)

Quien dibuje copia estas rutas; si una prueba de §5 falla, se ajusta el dibujo, no el sistema. [propuesta]

### LibretaYLapiz (acento: el lápiz; se mueve `translateY(-4px)`, como levantarlo para escribir)
- Libreta: `rect x=6 y=8 width=32 height=48 rx=4`
- Renglones: `M14 22H30` · `M14 32H30` · `M14 42H24`
- Lápiz (acento, relleno 16 %): `M47 16a5 5 0 0 1 10 0V40L52 50L47 40Z` y su virola `M47 24H57`
- Huecos: libreta–lápiz 9 px; lápiz en movimiento llega a y = 7 (margen 4 ✓ con el trazo a 5,5).

### CasilleroDeCuentas (acento: la ficha de la casilla superior derecha; `translateY(-3px)`)
- Marco: `rect x=8 y=10 width=48 height=44 rx=5`
- Divisiones: `M32 10V54` · `M8 32H56`
- Ficha (acento): `rect x=38 y=18 width=12 height=7 rx=2`
- Huecos: ficha–división de abajo 4 px (borde a borde); al subir 3 px queda a 1 px del borde de arriba: **se ve como si saliera de la casilla**, que es la idea, pero hay que verificarlo (§5).
- Tope de movimiento: 3 px (el sistema permite hasta 4).

### CalendarioConCinta (acento: la cinta; `translateY(4px)`, baja como un marcador que se corre al otro periodo)
- Hoja: `rect x=8 y=14 width=48 height=42 rx=5`
- Cabecera: `M8 26H56`
- Anillas: `M20 8V18` · `M44 8V18`
- Renglones: `M18 38H32` · `M18 48H28`
- Cinta (acento, relleno 16 %): `M42 26V41L46.5 37L51 41V26`
- Huecos: renglones–cinta 10 px; cinta–borde derecho 5 px.

### CajonDePaso
Tal cual `src/contabilidad/identificadores/CajonDePaso.jsx`. Billete en el acento, baja 4 px.

## 4. Lo que decido sobre el de Hanayama

**Lo uso**, con una condición medible. Razones: es el objeto exacto del tema (cajón de caja, entrada y salida), respeta el sistema y está escrito. Su riesgo es la **densidad**: billete + cajón + división + rama + dos patas con pies = ocho trazos distintos; a 32 px en gris puede perder la rama. **Condición:** pasa la prueba de §5 a 32 px; si no, se **quitan los pies** (`M9 50v6…` y `M41 50v6…`) y se deja el resto. Reversible y sin tocar el tema.
Además su comentario dice «TODAVÍA NO VA EN EL REGISTRO»; ya no aplica: `IdentificadorDeTema.jsx` pone la regla `transform: var(--mueve)` y su versión de movimiento reducido [fuente]. Al entrar se actualiza ese comentario.

## 5. Prueba de entrega (la del sistema, aplicada a estos cuatro)

1. Los **nueve** de Contabilidad en fila a **32 px y en gris**: ninguna pareja se confunde. Pareja de riesgo: *Casillero* y *Calendario* (los dos son rectángulos con cuadrícula). Los separan las anillas de arriba del calendario y el corte horizontal solo a media altura del casillero; si aun así se confunden a 32 px, el casillero pasa a 3 casillas en columna y sale de la cuadrícula.
2. Se miran a **320 y 375 px** dentro de la tarjeta real.
3. Contraste del trazo (#CBDCF2 en reposo, #F8F9FA con hover) y del acento (ámbar #E9C46A) sobre el fondo real de la tarjeta con `scripts/contraste.mjs` (≥ 3:1) [Xeno no lo midió].
4. Movimiento: un solo elemento, 400 ms, `cubic-bezier(.3,.9,.4,1)`, y con `prefers-reduced-motion` no se mueve nada.

## 6. Cómo entra (una sola integración, sin tocar lo compartido)

- Archivo nuevo: `src/contabilidad/identificadores/identificadoresA.jsx` con `LibretaYLapiz`, `CasilleroDeCuentas`, `CalendarioConCinta` y reexporta `CajonDePaso`.
- Cuatro líneas en `ICONO_POR_TEMA` de `src/data/identificadoresDeTema.js`, con las claves de §1.
- Quien lo construye: la célula dueña de esos temas (quien tenga T1–T4; si hay duda, Yujiro o Erwin). **No se toca** la tarjeta ni la vista del índice.
- **Macroeconomía no se toca** (tiene estudiantes reales).
- Los cuatro temas conservan su ícono de materia hasta que entre la línea del registro: si algo falla, quitar la línea devuelve el estado anterior.

## 7. Deuda

- Pensamiento Estratégico y Macroeconomía siguen con el ícono de materia; no era mi encargo.
- Los nombres de los glifos son propuestas; si la célula prefiere otros, que lo diga en el PR sin cambiar el objeto.
