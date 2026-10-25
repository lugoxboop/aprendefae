# Auditoría T2-11 · el delta de #548 contra mi T2-9 §1 y §2

Mello → L · 25 de octubre de 2026. Revisé #548 en `e65b062` en una sola pasada.

**Qué miré:**
- **El diff de T2.** Comparé `41ae301..e65b062` solo en `t2/` y `contabilidadT2Secuencia.js`. El resto del diff viene de la mezcla con main.
- **Pruebas.** `t2-secuencia` y `secuencia` dan 105 de 105.
- **Build temporal** con la bandera encendida, fuera del repo. Lo recorrí con `medir-t2-sec.mjs` a 320 px: 176 estados, con las fuentes reales y capturas a media escala.

## Veredicto: **FALLA**

Fallan dos de los nueve puntos, y en los dos la culpa es mía: Misa aplicó al pie de la letra lo que yo prescribí en T2-9, y no funciona en pantalla. Probé el arreglo de los dos sobre el mismo build y funciona (§3).

| Punto del delta | Estado |
|---|---|
| Lote A · el ayudante único de barajado | **PASA** |
| Lote B · el pie de página en los cinco cierres | **FALLA**: está en los datos, pero no se pinta |
| P1 · Caja y el cierre desde los datos | **PASA** |
| P3 · el porqué de «a la derecha», el préstamo y P3·3 | **PASA** |
| P4 · «Aplicar la regla» | **PASA** |
| P4 · las palabras se parten por palabra | **FALLA**: siguen partidas a 320 |
| P5·5 sin la orden repetida | **PASA** |
| Sin `PENDIENTE_DE_REVISION` | **PASA** |

## 1 · Lo que pasa

- **Lote A.**
  - `useBarajado` y `enOrden` en `secuenciaComun.jsx` barajan una vez con `utils/barajar.js` y guardan `orden` en el estado de la pantalla.
  - Se usan justo en las nueve pantallas de mi tabla (9 llamadas).
  - No tocan debe y haber, las casas, los platillos, los cajones «Sigue» y «Vuelve a cero» ni las predicciones.
  - En P2·7, `fichaActual` sigue el orden barajado, y el índice sigue siendo el de la lista original. Así las devoluciones nombran la cuenta correcta.
  - La prueba lo verifica por pantalla: el orden se guarda, la figura lo pinta, y ni un re-render, ni un error, ni recargar lo cambian. Otra visita baraja de nuevo. También comprueba que las pantallas barajadas son las de mi tabla.
  - En el build, P4·6 y P4·8 salieron con otro orden (§4).
- **P1.** `CAJA` sale de `DE_QUE_ESTA_HECHA.ejemplo`, y el cierre de `P1_TEXTOS.cierre.cuenta`. El nombre accesible de la figura también se arma con esas cifras.
- **P3.**
  - `porqueDerecha` es mi texto, letra por letra, y `devolucionPorQue` lo da solo a «vive a la derecha». Lo comparé con el índice de la lista original, así que barajar no lo desordena.
  - El préstamo sale de `cu6-pagare`: el monto es 500, y la Caja de antes es el saldo inicial de Caja (1.500) menos el pagaré. Da 1.000, que coincide con el texto.
  - La ficha de $100 sale de `pruebaTu.fichas[0]`.
  - P3·3 quedó sin su primera oración.
- **P4.** El control dice «Aplicar la regla». Lo lee de `P4_TEXTOS.partidaDoble.control` y se ve en el build.
- **P5·5.** El apoyo ya no repite la orden.
- **Comentarios.** No queda ningún `PENDIENTE_DE_REVISION` ni «ESCRITO POR CLAUDE» en T2. Los reemplazan comentarios que dicen quién aprobó cada texto.
- **No hay regresiones a 320:**
  - 0 problemas de contraste, 0 textos de menos de 12 px y 0 objetivos de menos de 44 px;
  - sin desplazamiento lateral, 0 errores de JS y la ficha no tapa nada;
  - las figuras siguen dentro de su alto;
  - ninguna pantalla pasa de 40 palabras.

## 2 · Lo que falla, y por qué es mío

### Lote B · el pie no se pinta

- **Qué se ve.** En el build, los cinco cierres no muestran «Basado en el libro…».
- **Por qué.** `SecuenciaAprender.jsx` pinta la razón solo mientras la pantalla espera una respuesta (`espera ? pantalla.razon : …`). Un cierre nunca espera, así que la razón queda vacía; en P1 dice «Paso 1 de 1». Misa puso `razon` en los cinco cierres, que es lo que yo pedí en T2-9 §1, sin haber verificado que el contenedor la pinta en un cierre.
- **Por qué la prueba no lo vio.** Lee `pantalla.razon` de los datos, no lo que se pinta.

### P4 · las palabras siguen partidas a 320

- **Qué se ve.** En el Chromium de la medición, «Equipo de comput|ación» (P4·2 y P4·3) y «Flota y equipo de transport|e» (P4·8 y P4·9) se siguen partiendo, ahora sin guion.
- **Por qué.** `overflow-wrap: break-word` igual corta dentro de la palabra cuando no cabe. Y `hyphens: auto` depende de que el navegador traiga el diccionario de español, y este no lo trae. Era mi receta de T2-9.
- **Por qué no cabe.** El nombre comparte la fila con la cifra y le quedan unos 69 px. «computación» mide unos 72.

## 3 · Lo mínimo, ya probado

Apliqué los dos cambios sobre `e65b062` en mi build temporal y lo recorrí entero otra vez a 320:
- Los cinco pies se ven: en P1, después del paso.
- Ninguna palabra se parte.
- Las cinco figuras siguen dentro de su alto: P1 182/183, P2 166/171, P3 178/180, P4 175/181 y P5 194/197.
- 0 problemas de contraste, de texto de menos de 12 px y de objetivos de menos de 44 px.

1. **El pie (una línea en lo compartido, `SecuenciaAprender.jsx`):**
   ```js
   const razon = espera
     ? pantalla.razon
     : totalPasos > 0 && dados < totalPasos
       ? `Paso ${dados + 1} de ${totalPasos}`
       : pantalla.tipo === "cierre" ? (pantalla.razon ?? null) : null;
   ```
   - **Por qué en lo compartido.** El contrato pone el pie en la zona de razón del cierre (§16 b), así que es el contenedor el que no lo cumple.
   - **Por qué no dentro de la figura.** Ya lo probé: en P1 la figura se pasa de su alto (190/183).
   - **Quién lo hace.** El archivo es de Erwin, y #536 ya lo abre. Como la bandera no se enciende antes de #536, puede ir ahí sin retrasar nada.
   - **La prueba.** En #548, la prueba del lote B se queda como está (datos). La que comprueba que el pie se pinta va con esa línea, en #536.
2. **P4 · `Renglon` (tres cambios en `secuenciaP4.jsx`, de la célula):**
   - la fila pasa a `flexWrap: "wrap"` con `gap: "0 4px"`;
   - el nombre lleva `flex: "1 1 0"`, `minWidth: "min-content"` y `overflowWrap: "normal"`, en lugar de `minWidth: 0`, `break-word` y `hyphens`;
   - la cifra lleva `marginLeft: "auto"`.

   **Cómo queda.** El nombre se encoge hasta su palabra más larga. Solo si esa palabra y la cifra no caben juntas, la cifra baja a la línea siguiente, alineada a la derecha.

   **Lo probé.** «Hipoteca por pagar» sigue en una fila con su cifra, y P4·6 no crece (175/181).

   **La prueba de P4.** Hoy busca las propiedades CSS de mi receta. Debe pasar a buscar `minWidth: "min-content"` y que no haya `break-word` ni `anywhere`. La medición la cierra con capturas (§4).

**Una decisión mía sobre S2, reversible.** Con el pie, el cierre de P3 suma 45 palabras visibles. El pie es una cita de fuente, como «Escenario simulado», no texto que se lee para aprender. Lo dejo fuera del tope de 40 palabras.

**En resumen:**
- **#548 pasa cuando entre el cambio 2.**
- **El cambio 1 es una condición para encender la bandera**, y va en #536.

## 4 · Capturas (320 px, a media escala)

Tal como está `e65b062`: los cierres sin pie y las palabras partidas en P4.

![e65b062](capturas/delta-320.png)

Con los dos cambios de §3 aplicados en el build temporal: los pies a la vista, las palabras enteras y las opciones de P4·6 y P4·8 barajadas.

![con el arreglo](capturas/con-arreglo-320.png)
