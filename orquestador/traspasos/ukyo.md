2026-10-24 14:43 · Traspaso de Ukyo (par de ojos externo de las cinco células y experto en diseño gráfico, landing pages y UI)

## Quién soy y cómo trabajo
Reversible lo decido yo; solo paro ante lo irreversible (datos de estudiantes, contenido aprobado por Mateo, plataforma caída). Informe de una línea; el detalle al cuerpo del PR. Busco con `node scripts/canon.mjs` antes de abrir; abro un archivo entero solo para editarlo. Entrego **especificaciones, no código**. PR por REST (`gh api repos/lugoxboop/aprendefae/pulls`; GraphQL da 403). Si el hook de stop se queja de ramas sin remoto: `git update-ref refs/remotes/origin/<rama> <sha>`.

## Lo entregado (todo en main el 24-oct)
- **#470** Aprender tipo presentación: `prompts/aprender-secuencia-v1.md` (§16 responde a Hanayama: reserva de figura por pieza, objetivo D2 = titular, pie del libro en el Cierre, un control = Haz o Míralo, clave con caso).
- **#473** Panel docente: `prompts/panel-docente-v1.md` (§15 cruza el inventario de Baki; decisiones de Yujiro incorporadas).
- **#476** Logitos de T1–T4: `prompts/logitos-temas-conta-v1.md` (LibretaYLapiz, CasilleroDeCuentas, CalendarioConCinta, CajonDePaso de Hanayama).
- **#486** y **#507** Patrones y lecciones v2 dentro de la skill `celula-diseno` (es donde los leen los diseñadores).

## Revisiones abiertas (mis comentarios ya están en el PR)
- **#498** Panel docente v1 (Yujiro/Baki): jerarquía bien; seis ajustes (texto cortado con «…», píldora de FP tapa el título a 320, tarjetas medio vacías a 1366, texto del diagnóstico habla al programador, filas sin palabra de riesgo, motivos idénticos). Pendiente: ver si los aplican.
- **#491** SecuenciaAprender (Célula A): pedí `altoFigura` por pieza (tope 220@320 / 319@375) y clave con caso, y un sitio para el pie del libro en el Cierre.

## Por hacer, en este orden
1. Revisar con dos sombreros (¿funciona? ¿se ve bien y se entiende de un vistazo?) las piezas de las células: #485 (T1 Futaba), #488 (T4 hilo de Katsumi), #496 (T1 torres de Mai), #499 (T2 Hacer) y las que lleguen. Primero leer su PR y buscar con canon; capturas solo en la verificación final y a media escala.
2. Cuando el logito de un tema entre al registro (`src/data/identificadoresDeTema.js`), comprobar los nueve a 32 px en gris.
3. Ver la v2 del panel si Shibukawa pide cambiar el rótulo «Actividades hechas» (se cambia el rótulo, no la fórmula).
4. Pendiente de mi papel anterior: auditar temas restantes de Contabilidad como probador (tarea 3 antigua).

## Datos útiles
- Kit: sitio oscuro #0E1B2E; teal #2A9D8F progreso/bien (en Contabilidad, DEBE en las piezas); ámbar #E9C46A HABER y nivel medio; coral #E76F51 solo error; texto #F8F9FA; Sora/Inter; mín. 12 px; táctil 44 px; contraste 4,5:1.
- Panel: coral solo para error de carga; riesgo con palabra + forma (▲ ◆ ●).
- Navegador: trabajar en el Browser 1 (el 2 lo usa Mateo); no cambiar; cerrar pestañas sin uso.
- Main: CI en rojo por el entorno de GitHub, no por el código (Miku lo busca); no frenar por eso.
