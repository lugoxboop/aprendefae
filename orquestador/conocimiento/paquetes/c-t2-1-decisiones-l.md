# Lote T2-1 · decisiones de L (23-oct-2026)

Entregas del lote, copiadas en esta carpeta:
- Near: `c-t2-1-near-lote.md`, con el hilo de las 5 Aprender en slides, tres Hacer nuevas y los subtemas.
- Watari: `c-t2-1-watari-tres-hacer.html`, con la forma de tres Hacer nuevas y maquetas medidas a 320 y 375 px.
- Mello: `c-t2-1-mello-linea-base.md`, con la línea base de las Aprender y los criterios S1-S13 y H1-H10.
- Misa: #471, con el inventario, la línea base de las sondas y #482 (subtemas, en borrador).

Todo lo de abajo se puede deshacer, y lo decide L con la vara de Mateo.

## 1. Las tres Hacer nuevas: manda la forma de Watari

Near lo dejó dicho («si choca, manda la de Watari y yo ajusto los bancos»). Los ids de Near (`cu-pasalo-al-mayor`, `cu-se-queda-o-se-cierra`, `cu-la-linea-que-falta`) **no se usan**.

| Orden | id | Nombre | Nivel | Subtema |
|---|---|---|---|---|
| 8.º | `cu-cuadra-por-valor` | Cuadra por valor | Medio · 25 FP | Partida doble: igualdad del debe y el haber |
| 9.º | `cu-del-diario-al-mayor` | Del diario al mayor | Medio · 25 FP | Libro mayor y mayorización |
| 10.º | `cu-las-que-vuelven-a-cero` | Las que vuelven a cero | Fácil · 10 FP | [regla] por `clase`: real → Clasificación de cuentas reales · nominal → Clasificación de cuentas nominales |

Las tres van antes de El Ciclo Completo. Ninguna reusa los cinco ids retirados en la 0043.

**Bancos, sobre la forma de Watari y con los criterios de Mello (H1-H10):**
- **Cuadra por valor.** De 6 a 8 casos (3 de completar, 2 de juzgar y de 1 a 3 de encontrar), con las tres trampas de Watari. En juzgar y encontrar entran los cuatro errores que pide Mello: monto traspuesto (la diferencia es divisible por 9), valor llevado al lado contrario, renglón omitido y renglón duplicado. Los asientos de N-3 (Lavado ene-03, ene-04, ene-12 y los dos de cu10) son la base del tipo completar.
- **Del diario al mayor.** Usa el caso de Lavado del 2 al 12 de enero (CORTE_SET_A) que Near ya verificó, recortado al tope de Watari: 4 cuentas y 7 renglones por caso. Lleva sus dos tipos, destino y origen. El saldo queda fuera: lo practica «El saldo de la cuenta», como decidió Watari, y con eso se cubre el error de Mello «saldo del lado del último movimiento».
- **Las que vuelven a cero.** Es binaria, como la diseñó Watari: «Vuelve a cero en el cierre» o «Pasa al mes siguiente con su saldo». La familia (ingreso, gasto o costo) se nombra en el retro, no en una segunda pregunta. Entran como ítems las trampas de Near (Cuentas por cobrar, Documentos por pagar) y las de Mello (lo pagado por anticipado es activo y un cobro es Caja). La cuenta se llama «Costo de ventas», como en T2.

## 2. Aprender en slides: el hilo de Near, con los criterios S1-S13 de Mello

- Cada pieza abre con una slide de **objetivo** de una oración (S1). Near no la traía.
- Nunca más de **2 slides seguidas de solo leer** (S3), y en cada pieza aparecen las dos confusiones de S9.
- **P3·1:** sale la fecha «5 de mayo». El repo no la trae y no se inventan datos. Queda «Caleja hace dos registros…».
- Los datos nuevos van en `src/data/contabilidadAprenderSlides.js`. Los objetos de CuatroCapas no se tocan, y `textual: true` queda letra por letra.
- La forma (la cáscara de las slides) espera el patrón de Ukyo y el componente compartido de Erwin.

## 3. Subtemas del Repaso Diario

Queda la lista cerrada de 12 de Near, con los ids de la tabla de arriba. El módulo es `src/data/contabilidadT2Subtemas.js` (#482). `src/repaso/*` lo conecta Erwin. Los nombres de las etapas del desafío son los que ya trae `DESAFIO.pesos[].subtema`, y ningún campo `subtema` existente cambia de nombre.

## 4. Parada anunciada

Las tres Hacer necesitan su fila en el catálogo de FP del servidor. La migración solo agrega filas y va en el rango de la Célula C (desde la 0116). Correrla en producción no lo decide la célula: cuando el PR esté listo, va por issue `miku` a Erwin y a Mateo. Es la única parada del plan.
