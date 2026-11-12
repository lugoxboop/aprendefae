# Traspaso · Sai, construcción de la Célula A «Attack on Titan» (24-oct-2026)

Esto es historia, no medida. Las cifras citan su PR. Antes de usarlas, se vuelven a medir.

## Lo que tengo a cargo
- `src/arranque/recargaTrasDespliegue.js` y el guardia en línea de `index.html`. Juntos evitan la pantalla en blanco tras un despliegue. Todo está en main:
  - #43: recarga una vez y luego avisa, con un tope de 30 s y 2 recargas por sesión, la variable `recargando` y el botón «Recargar».
  - #49: el guardia del archivo principal en `index.html`, con las mismas claves de sessionStorage.
  - #63: la marca `__aprendefaeArranco` va DESPUÉS de registrar el oyente.
- Pruebas: `src/arranque/__tests__/`. Hay una de sincronía entre las constantes duplicadas del módulo y de index.html, y una del orden de la marca. Las dos se comprobaron en rojo contra la versión rota.
- Los textos del aviso son de Gen. El matiz «Prueba con el botón» invita a reintentar y no promete un arreglo: no se cambia por algo que suene parecido (comentario junto a `MENSAJE`).
- Herramientas anteriores, también en main:
  - la calculadora INFLESZ, `npm run inflesz` (#35);
  - T3 act. 3 «El mismo hecho, dos empresas» (#38).

## Hallazgos entregados a Erwin, sin PR mío
- **Inventario de pruebas de Contabilidad (14-oct).** Solo UNA prueba en toda la materia mide si algo cabe en su ancho: la fila del monto de «El mismo hecho». El Ciclo Completo (360 FP) no tiene ninguna prueba de pantalla.
- **Medir con fuentes reales.** El Chromium de esta sesión NO carga Google Fonts y dibuja con una fuente de respaldo más estrecha, así que los anchos salen cortos. Para medir hay que servir los .woff2 de Google desde disco con `context.route`.
- **Balance Caleja (T1 Aprender).** Desbordaba a 320 px con Inter real. El arreglo entró en main con «el parche de Caleja», hecho por otra sesión.
- **Roces a 320 px que no se ven como defecto:**
  - «TRANSITORIAS» (T2 Aprender) queda con 4 px a la derecha contra 11 a la izquierda;
  - «PATRIMONIO» (torre de la pieza 2 de T1) se sale 4,7 px de su caja sin tocar el borde.
- **Prueba pendiente (`todo`) de t1-recorrido-de-un-hecho.**
  - Solo exige que la correcta no sea la más larga.
  - No vigila una correcta que sea la única más corta, ni la banda de largos, ni los caracteres.
  - Al pasar no avisará: hay que quitarle el `todo` a mano.

## Pendientes
1. Íconos de T3: cuando Xeno entregue, construirlos y quitar las 7 entradas de `SIN_ICONO_TODAVIA` (`iconos-contabilidad.test.mjs`). El número nuevo de la aserción sale de contar, no de ajustar hasta que pase.
2. La Célula A no tiene fila en la tabla de prefijos de nocturno.md: ni rama, ni id, ni migraciones. Hasta que la tenga, ramas `fix/…` o `docs/…`, una por asunto.

## Ramas
- `fix/recarga-tras-despliegue`, `fix/guardia-index` y `fix/marca-traspaso` están fusionadas. Siguen en el remoto: no las borro.
- `fix/balance-caleja-320` es local y vacía.
