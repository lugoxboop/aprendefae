# Dos Hacer, estados nuevos · lote T2-4 · Watari → L

Delta sobre `c-t2-1-watari-tres-hacer` y `c-t2-3-watari-figuras.md`. Base: `c-t2-3-mello-auditoria.md` §1.1 y §1.2, `c-t2-1-decisiones-l.md` y `c-t2-3-near-delta.md` (E1 nuevo). Maquetas vivas en el artefacto «Dos Hacer, estados nuevos». «Las que vuelven a cero» no cambia.

## 1. Cuadra por valor

El estudiante VE subir las columnas del debe y del haber hasta su valor cuando comprueba o decide, no mientras teclea.

- **Completar: la figura no calcula al teclear.** La cifra escrita se ve solo en la casilla «Tu cifra». Antes de «Comprobar», el hueco es un tramo fijo de 28 px, punteado y con «?». Mide lo mismo con cualquier cifra (esa es la prueba de geometría C5 de Mello). No hay línea de nivel, y la suma del haber dice «?».
- **Comprobar, a los 0 ms.** El tramo del hueco pasa a la altura de la cifra con scaleY (380 ms, cubic-bezier(.3,.9,.4,1)). Entran la línea de nivel y la suma, y se marca lo que falta o lo que sobra: tramo punteado en coral más la frase de consecuencia.
- **A los 380 ms, el veredicto.** Llegan la pastilla («Correcto» o «No va aquí»), «Iba aquí» con la cifra correcta, el retro de Near y se libera «Seguir». La pausa baja de 0,7 s a 380 ms, como piden Mello y L.
- **Juzgar y encontrar: nada a la vista antes de decidir.** El asiento llega sin fila de sumas y sin columnas. Al decidir entran juntas: primero la fila de sumas y las columnas (que suben con scaleY, 380 ms), luego la consecuencia y luego el veredicto. En encontrar, los renglones son botones de 44 px. Con el acierto, el tramo culpable queda con borde blanco.
- **La frase de consecuencia tiene dos formas.** «Faltan $X en el {lado}: las dos columnas no llegan a la misma altura.» (la de antes) y, cuando la cifra se pasa, «Sobran $X en el haber: su columna pasa la línea del debe.» X sale del dato.
- **Corrección mía de T2-3: el nombre ya no se parte letra a letra.** La columna fija de 6,3 em con overflow-wrap: anywhere partía «Obligaciones financieras» y «Equipo de computación» por la mitad de la palabra a 320 px. Ahora el ancho de cifra se ajusta a la cifra más larga del asiento (--cifra, en ch). Con cifras de más de 8 caracteres (los millones de K1), el nombre va en su propia línea y las cifras debajo, en sus columnas. Medido: 0 palabras partidas.
- **E1 sigue el cambio de Near en T2-3.** Caleja: Cuentas por pagar $10.000 D · Caja $10.000 D. La columna del haber queda vacía y marca «Faltan $20.000 en el haber».

| Tipo | Estados |
|---|---|
| completar | Inicio · Cifra escrita, sin comprobar · 0 ms · consecuencia · 380 ms · error · 380 ms · acierto · Error que se pasa (K1) |
| juzgar | Inicio · 0 ms · consecuencia · 380 ms · error · 380 ms · acierto |
| encontrar | Inicio · 0 ms · consecuencia · 380 ms · error · 380 ms · acierto |

## 2. Del diario al mayor · tipo «revisar» (el punteo)

Consigna de Mello: «El mayor ya está pasado. Toca la línea que no coincide con el diario.» Partida: 3 destino, 2 origen y 2 revisar.

- **Qué ve.** Arriba, el diario completo, sin renglón marcado. Debajo, el mayor ya pasado, en la cuadrícula de 2 × 2. Cada línea de las T es un botón de 44 px de alto, con la fecha encima del monto. La T ya no es botón, porque un botón no puede contener otro.
- **Qué hace al tocar.** Se enciende el renglón del diario de donde salió esa línea. Debajo de la cuadrícula aparece el cotejo, con Diario y Mayor lado a lado y tres filas: Cuenta, Lado y Monto. La fila que no coincide lleva «≠» y borde blanco, y las que coinciden llevan «=». El cotejo trae los datos del renglón, así que se lee aunque el diario haya quedado arriba, fuera de la pantalla.
- **Acierto.** Toca la línea mal pasada: el cotejo muestra el único campo distinto y la frase de lo que pasó, en neutro. El error del libro no es del estudiante, así que no va en coral. Los tres tipos de Mello caben en el mismo cotejo: traspuesta (Monto ≠), cuenta vecina (Cuenta ≠) y lado contrario (Lado ≠).
- **Error.** Toca una línea buena: borde coral, el cotejo con los tres «=» y «Esta línea coincide con su renglón en cuenta, lado y monto». Luego viene el veredicto, con «No va aquí», la línea mal pasada punteada y la pastilla «Iba en la línea punteada», que va en la fila de estado porque dentro del botón de 44 px no cabe.
- **Barajado (H6).** El orden de las cuatro T cambia en cada intento. El orden de las líneas dentro de cada T no cambia, porque va por fecha, como en un mayor de verdad.
- **Lo que no lleva.** No hay saldo ni se elige el lado, como decidiste. La consigna es la de Mello.
- **Datos para Misa.** Cada línea del mayor es { r, cuenta, lado, monto }, donde r es el índice del renglón del diario. Una sola línea por ítem trae un campo distinto de su renglón. El cotejo se calcula comparando y no se escribe a mano. En la línea, la cifra va sin «$»: la T ya es de pesos y así gana ancho.

**Regla del banco:** en «revisar», cifras de hasta 9.999 (5 caracteres sin «$»). Los casos A y B cumplen.

| Estado | Cuadrícula 2 × 2 a 320 | a 375 | Pantalla a 320 |
|---|---|---|---|
| Inicio | 201 | 201 | 701 |
| Error · toca una línea buena | 201 | 201 | 1014 |
| Acierto · cifra traspuesta | 201 | 201 | 1029 |
| Acierto · cuenta vecina | 201 | 201 | 1047 |
| Acierto · lado contrario | 249 | 249 | 1039 |
| Intento 2 · barajado | 201 | 201 | 701 |
| Estrés · 3 por lado | 393 | 393 | 893 |

Botón de línea más angosto: 44 px a 320 y 58 px a 375.

## Medido

- 42 estados a 258 y 313 px. Letra mínima 12 px · botones de menos de 44 px: 0 · fuera de caja o desbordados: 0 · palabras partidas por la mitad: 0.

## CSS del delta (para Misa)

Va sobre lo de T2-3. Cambia el prefijo `.mq` por la raíz de la pieza. No hay componente compartido nuevo.

```css
/* T2-4 · lo nuevo sobre hacer.css */
.mq .hecho { font-size:14px; color:var(--aten); }
.mq .reloj { font:500 12px/1.4 "JetBrains Mono", monospace; color:var(--aten); border:1px dashed rgba(248,249,250,.25); border-radius:8px; padding:6px 8px; }
/* Cuadra por valor */
.mq .bar.fijo { height:28px; flex:none; border:2px dashed var(--neutro); background:transparent; color:var(--texto); font:600 13px/1 "JetBrains Mono", monospace; }
.mq .col.h .bar.tuya { background:var(--ambar); box-shadow:inset 0 0 0 2px var(--texto); }
.mq .col.h .bar.tuya.mal { box-shadow:none; outline:2px solid var(--coral); outline-offset:1px; }
.mq .bar.culpa { outline:2px solid var(--texto); outline-offset:1px; }
.mq .hueco-barra.d { left:8px; right:auto; }
.mq .columnas.entra .pila .bar { transform-origin:bottom; animation:sube 380ms cubic-bezier(.3,.9,.4,1) both; }
@keyframes sube { from { transform:scaleY(0); opacity:0; } to { transform:none; opacity:1; } }
.mq .tucifra { flex:1 1 140px; display:grid; gap:4px; font:500 12px Inter, sans-serif; color:var(--aten); }
.mq .tucifra input { min-width:0; min-height:44px; border-radius:10px; border:1px solid rgba(248,249,250,.35); background:rgba(10,20,34,.45); color:var(--texto); font:600 16px "JetBrains Mono", monospace; padding:0 12px; }
.mq .casilla { align-items:end; }
.mq .escrito > span:first-child { font:500 12px Inter, sans-serif; color:var(--aten); }
.mq .ops.dos { grid-template-columns:repeat(auto-fit, minmax(110px, 1fr)); }
.mq .op.elegida { border:2px solid var(--texto); padding:9px 11px; }
.mq .renbs { display:grid; gap:6px; }
.mq .renb { min-height:44px; display:grid; grid-template-columns:minmax(0,1fr) auto; grid-template-areas:"c c" "l m" "p p"; gap:2px 8px; align-items:center; padding:6px 10px; border-radius:10px; border:1px solid rgba(248,249,250,.35); background:transparent; color:var(--texto); font:500 13px/1.3 Inter, sans-serif; text-align:left; }
.mq .renb .c { grid-area:c; } .mq .renb .l { grid-area:l; font-size:12px; } .mq .renb .m { grid-area:m; } .mq .renb .pas { grid-area:p; justify-self:start; }
.mq .renb.elegida, .mq .renb.bien, .mq .renb.pista { border:2px solid var(--texto); padding:5px 9px; } .mq .renb.pista { border-style:dashed; }
.mq .renb.malb { border:2px solid var(--coral); outline:0; padding:5px 9px; }
.mq .sumas-l { display:grid; grid-template-columns:minmax(0,1fr) auto auto; gap:12px; font-size:13px; font-weight:600; border-top:1px solid rgba(248,249,250,.35); padding-top:6px; }
/* Del diario al mayor · revisar */
.mq .cta.tr { min-height:0; padding:6px; gap:4px; }
.mq .cta.tr .cta-t > span { padding:4px 0 0; gap:4px; } .mq .cta.tr .cta-t > span:first-child { padding-right:3px; } .mq .cta.tr .cta-t > span:last-child { padding-left:3px; }
.mq .lnb { min-height:44px; min-width:0; width:100%; display:grid; align-content:center; justify-items:start; gap:1px; padding:3px 4px; border-radius:6px; border:1px solid rgba(248,249,250,.3); background:transparent; color:var(--texto); text-align:left; }
.mq .lnb small { font:500 12px/1.15 Inter, sans-serif; color:var(--aten); } .mq .lnb .num { font-size:12px; line-height:1.2; }
.mq .lnb.bien { border:2px solid var(--texto); padding:2px 3px; background:rgba(184,196,212,.16); }
.mq .lnb.malb { border:2px solid var(--coral); outline:0; padding:2px 3px; }
.mq .lnb.pista { border:2px dashed var(--texto); padding:2px 3px; }
.mq .cotejo { display:grid; gap:2px; padding:8px; border-radius:8px; background:rgba(184,196,212,.10); }
.mq .cot { display:grid; grid-template-columns:3.6em minmax(0,1fr) 1.2em minmax(0,1fr); gap:4px; align-items:start; font-size:13px; padding:3px 4px; border-radius:6px; overflow-wrap:anywhere; }
.mq .cot.cab { font-size:12px; color:var(--aten); padding-bottom:0; } .mq .cot .k { font-size:12px; color:var(--aten); } .mq .cot .s { text-align:center; font-weight:700; }
.mq .cot.distinto { outline:2px solid var(--texto); outline-offset:-2px; font-weight:600; }
.mq .veredicto-l { display:grid; gap:6px; } .mq .estado-l { display:flex; flex-wrap:wrap; gap:6px; }
@media (prefers-reduced-motion: reduce) { .mq .columnas.entra .pila .bar { animation:none; } }

/* Cuadra por valor · la columna de cifra mide la cifra más larga; el nombre se parte por palabras y, si una no cabe, con guion */
.mq .asiento td:nth-child(2), .mq .asiento td:nth-child(3) { width:calc(var(--cifra, 10) * 1ch + 6px); }
.mq .asiento td:first-child { overflow-wrap:break-word; hyphens:auto; }
/* Con cifras de millones (más de 8 caracteres) el nombre va en su propia línea y las cifras debajo, en sus columnas */
.mq .asiento.apilado, .mq .asiento.apilado tbody { display:grid; }
.mq .asiento.apilado tr { display:grid; grid-template-columns:minmax(0,1fr) calc(var(--cifra) * 1ch + 6px) calc(var(--cifra) * 1ch + 6px); }
.mq .asiento.apilado td { width:auto !important; } .mq .asiento.apilado td:first-child { grid-column:1 / -1; padding-bottom:0; }
.mq .asiento.apilado td:nth-child(2) { grid-column:2; } .mq .asiento.apilado td:nth-child(3) { grid-column:3; }
.mq .asiento.apilado tr.sum td:first-child { grid-column:1; padding-bottom:4px; } .mq .asiento.apilado tr.sum { border-top:1px solid rgba(248,249,250,.35); } .mq .asiento.apilado tr.sum td { border-top:0; }
```
