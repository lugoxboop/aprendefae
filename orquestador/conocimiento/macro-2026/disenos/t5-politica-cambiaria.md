# T5 · Política cambiaria — plan y especificación completa (Gen, 2026-11-22)

Fuente única: `fichas/5-politica-cambiaria.md`. **Tema nuevo** en la plataforma:
id `politica-cambiaria`, título «Política cambiaria», va después de Política monetaria.
Ids: `pc26-…`.

## 0. Reglas comunes

Valen TODAS las de `t1-demanda-agregada.md` §0 y los íconos de rama de `t2` §0
(la cambiaria: billete de dólar con flecha doble). Además:
- **tc = pesos por un dólar.** tc ↑ ⇒ el peso se deprecia (devalúa) y el dólar se aprecia.
  Se usan los sinónimos del profesor (depreciación = devaluación, apreciación = revaluación);
  la primera vez se escriben los dos juntos: «se deprecia (se devalúa)».
- **Peso y dólar con dos tonos fijos** en todo el tema (`src/macro2026/comun/monedas.js`),
  nunca coral; siempre con su símbolo ($ y USD) además del color.
- **Casos y cifras** (verificados por cálculo, `python` en la sesión de diseño):
  banano (d. 12): costo $2.127.250/t; tc $3.175; USD 670; con inflación 5 % aquí, 1,5 %
  allá y dólar +1,5 %: precio necesario USD 693,10 frente a USD 680,05 de mercado
  (ITCR 0,981); con dólar +5 %: USD 670,00 (ITCR 1,015).
  Ahorro (d. 22): $600 millones, tc $3.757, 9 % aquí y 4 % allá: aquí $654 M; allá, con
  revaluación 15,61 %, $526,6 M; con devaluación 12 %, $698,9 M.
  Crédito (d. 22): $1.000 millones, tc $3.175, 15 % aquí y 8 % allá: aquí se pagan
  $1.150 M; allá, con revaluación 15,61 %, $911,4 M; con devaluación 12 %, $1.209,6 M.
- **No se usan** los ejemplos de la d. 14 con 6 % y 2 % como si fueran del banano (ficha
  §10.1); se usan como ítems sueltos del atajo. Del calzado (d. 16) solo se usa el ITCR de f),
  porque falta el tipo de cambio inicial.

## 1. Plan del tema

| # | id | Tipo | Nombre | Mecánica | Subtemas | Dific. | FP |
|---|---|---|---|---|---|---|---|
| 1 | pc26-a1-balanza | Aprender | La balanza del dólar | Simulador (platos) | pc-contexto, pc-aprecia-deprecia | — | 0 |
| 2 | pc26-h1-quien-aprecia | Hacer | ¿Quién se apreció? | Microdesafíos encadenados | pc-aprecia-deprecia | Fácil | 10 × % |
| 3 | pc26-a2-subasta | Aprender | La subasta de dólares | Simulador de la gráfica | pc-mercado | — | 0 |
| 4 | pc26-h2-empuja-curva | Hacer | Empuja la curva | Predecir y revelar en la gráfica | pc-mercado, pc-flujos-capital, pc-objetivos-instrumentos | Medio | 25 × % |
| 5 | pc26-a3-nominal-real | Aprender | Nominal no es real | Simulador con tres palancas | pc-nominal-real, pc-itcr | — | 0 |
| 6 | pc26-a4-banano | Aprender | La tonelada de banano | Caso guiado con predicción | pc-itcr | — | 0 |
| 7 | pc26-h3-aguja | Hacer | La aguja del real | Simulador de dial (precisión) | pc-itcr, pc-nominal-real | Difícil | 50 × % |
| 8 | pc26-h4-a-quien-sirve | Hacer | ¿A quién le sirve? | Comparar con movimiento (tira y afloja) | pc-impactos, pc-nominal-real | Medio | 25 × % |
| 9 | pc26-a5-tuberias | Aprender | Dos tuberías | Explorar un flujo | pc-balanza-pagos | — | 0 |
| 10 | pc26-a6-imanes | Aprender | Imanes de capital | Simulador + predicción | pc-flujos-capital | — | 0 |
| 11 | pc26-h5-donde-ahorro | Hacer | ¿Aquí o afuera? | Escenario con decisiones ramificadas | pc-flujos-capital | Difícil | 50 × % |
| 12 | pc26-a7-correa | Aprender | La correa del dólar | Animaciones comparadas | pc-objetivos-instrumentos, pc-regimenes | — | 0 |
| 13 | pc26-h6-correa | Hacer | Cada hecho a su correa | Arrastrar y clasificar | pc-regimenes | Medio | 25 × % |

**Variedad:** 6 Hacer, 6 mecánicas distintas. Ninguna A-B-C-D.
**Respaldo:** A4 y H5 son **casos resueltos que se desvanecen** (worked examples → práctica):
reduce la carga cognitiva en cálculos de varios pasos (Sweller). H3 pide estimar en un dial
continuo: **práctica de recuperación con precisión** y retroalimentación graduada (criterio
propio). H4 confronta los dos lados de una misma noticia: **contraste de casos**.

**Lo que corrijo del material (para Mateo, una línea):** la d. 14 usa variaciones que no son
las del caso del banano; las preguntas b) y d) del banano se repiten; al calzado le falta el
tipo de cambio inicial.

---

## 2. Especificación pieza por pieza

### A1 · La balanza del dólar (`pc26-a1-balanza`)
**Gancho visual:** una balanza de mostrador: en un plato un billete de USD 1, en el otro
montoncitos de pesos de $100 (dibujados como pilas). Cuantos más montones hacen falta para
equilibrar, más débil el peso.

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | Noticias flotando (pandemia, guerras, FED, petróleo) que empujan la balanza un poco al tocarlas. | «Guerras, petróleo o la FED: todo mueve el precio del dólar en pesos.» |
| 2 | Balanza equilibrada con USD 1 y $4.000. | «El tipo de cambio es cuántos pesos das por un dólar.» |
| 3 | Deslizador tc 3.500–5.000 (paso 50). Llevarlo a 4.500: se agregan pilas; el peso se encoge y el dólar crece visualmente. Rótulos: «el peso se deprecia (se devalúa)» · «el dólar se aprecia (se revalúa)». | «Si das más pesos por el mismo dólar, el peso perdió valor: se deprecia.» |
| 4 | Llevarlo a 3.800: se quitan pilas; los rótulos se invierten. | «Si das menos pesos, el peso ganó valor: se aprecia. El dólar, al revés.» |
| 5 | Dos espejos lado a lado: «peso ↓ = dólar ↑» y «peso ↑ = dólar ↓». | «Cada movimiento tiene dos caras: si uno se aprecia, el otro se deprecia.» |

### H1 · ¿Quién se apreció? (`pc26-h1-quien-aprecia`, Fácil, 10 FP × %)
**Consigna:** «Marca qué le pasó al peso y qué al dólar.» (9)
**Figura:** la balanza de A1 pasa del tc inicial al final (animación). Debajo, dos
interruptores: «Peso: se aprecia / se deprecia» y «Dólar: se aprecia / se deprecia».
«Revisar»: cada interruptor bien puesto queda con ✓; el errado, coral y retro.
**Partida:** 5 de 6. Puntaje = interruptores correctos / 10.

| # | De → a (pesos por dólar) | Peso · Dólar |
|---|---|---|
| 1 | 4.000 → 4.500 | se deprecia · se aprecia |
| 2 | 4.000 → 3.800 | se aprecia · se deprecia |
| 3 | 4.329,90 → 4.100 | se aprecia · se deprecia |
| 4 | 3.175 → 3.333,75 | se deprecia · se aprecia |
| 5 | 3.757 → 4.208 | se deprecia · se aprecia |
| 6 | 3.757 → 3.171 | se aprecia · se deprecia |

Retro (el constructor inserta las cifras del ítem en {a}, {b} y {dif}):
- Peso errado cuando el tc sube: «De {a} a {b}: das {dif} pesos más por dólar. El peso vale menos.»
- Peso errado cuando el tc baja: «De {a} a {b}: das {dif} pesos menos. El peso vale más.»
- Dólar errado cuando el tc sube: «El dólar ahora compra más pesos: se aprecia.»
- Dólar errado cuando el tc baja: «El dólar ahora compra menos pesos: se deprecia.»
Subtema: `pc-aprecia-deprecia`.

### A2 · La subasta de dólares (`pc26-a2-subasta`)
**Gancho visual:** la gráfica oferta–demanda de divisas con dos filas de personajes a los
lados: los que traen dólares (exportador, inversionista extranjero, quien trae un crédito
de afuera) empujan la curva de oferta; los que piden dólares (importador, viajero, quien
paga deuda externa) empujan la de demanda. Eje vertical «tc», horizontal «Dólares».

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | Las dos filas de personajes, sin gráfica. Tocar cada uno muestra si trae o pide dólares. | «El mercado cambiario reúne a quienes traen dólares y a quienes los necesitan.» |
| 2 | Aparecen las curvas Od (sube) y Dd (baja) y su cruce tc₁. | «Donde se cruzan la oferta y la demanda de dólares, sale el tipo de cambio.» |
| 3 | Tocar «Llegan inversionistas»: la fila de oferta crece, Od se corre a la derecha y tc baja. | «Más dólares llegando: el dólar se abarata y el peso se aprecia.» |
| 4 | Tocar «Importamos más»: la fila de demanda crece, Dd a la derecha, tc sube. | «Más gente pidiendo dólares: el dólar se encarece y el peso se deprecia.» |

### H2 · Empuja la curva (`pc26-h2-empuja-curva`, Medio, 25 FP × %)
**Consigna:** «Empuja la curva que cambia, hacia donde crees.» (8)
**Figura:** la gráfica de A2 con un asa en cada curva (arrastre horizontal). «Revelar»: la
curva correcta se mueve, el personaje que causa el cambio entra a su fila y una flecha
indica si tc sube o baja. Se califican: qué curva y hacia dónde. **Partida:** 6 de 8.
Puntaje = criterios correctos / 12.

| # | Suceso | Curva · Dirección (tc) | Retro si yerra la curva · la dirección |
|---|---|---|---|
| 1 | Llegan inversionistas extranjeros a comprar empresas colombianas. | Oferta · derecha (↓) | «Ellos traen dólares: cambia la oferta.» · «Llegan más dólares: la oferta crece.» |
| 2 | Los importadores compran más mercancía afuera. | Demanda · derecha (↑) | «Ellos necesitan dólares: cambia la demanda.» · «Piden más dólares: la demanda crece.» |
| 3 | Sube el precio del petróleo que vende Colombia. | Oferta · derecha (↓) | «Las exportaciones traen dólares: oferta.» · «Más dólares por cada barril: la oferta crece.» |
| 4 | Empresas colombianas pagan su deuda externa. | Demanda · derecha (↑) | «Para pagar afuera necesitan dólares: demanda.» · «Compran más dólares: la demanda crece.» |
| 5 | El BanRep compra dólares en el mercado. | Demanda · derecha (↑) | «El BanRep compra: se suma a la demanda.» · «Un comprador más: la demanda crece y el dólar sube.» |
| 6 | El BanRep vende dólares de sus reservas. | Oferta · derecha (↓) | «El BanRep vende: se suma a la oferta.» · «Más dólares a la venta: la oferta crece.» |
| 7 | Caen las exportaciones de café. | Oferta · izquierda (↑) | «El café trae dólares: cambia la oferta.» · «Menos exportaciones, menos dólares: la oferta cae.» |
| 8 | Los colombianos viajan menos al exterior. | Demanda · izquierda (↓) | «Los viajeros piden dólares: cambia la demanda.» · «Menos viajes, menos dólares pedidos: la demanda cae.» |

Subtemas: `pc-mercado` todos; 1 y 4 además `pc-flujos-capital`; 5 y 6 `pc-objetivos-instrumentos`.

### A3 · Nominal no es real (`pc26-a3-nominal-real`)
**Gancho visual:** una aguja de tablero con tres zonas: «Revaluación real», «Equilibrio»,
«Devaluación real». Tres palancas debajo la mueven.

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | Un cartel con «$4.329,90 · 16 de abril de 2025». | «El tipo de cambio nominal es el precio del dólar hoy, en pesos corrientes.» |
| 2 | El cartel se pone sobre dos termómetros: «inflación aquí» e «inflación afuera». | «El real ajusta ese precio por las inflaciones de los dos países.» |
| 3 | Tres palancas: «Inflación de afuera» 0–8 %, «Inflación de aquí» 0–8 %, «Variación del nominal» −6 % a +8 % (paso 0,5). La aguja marca Δtcr en vivo. | «Mueve las tres palancas y mira hacia dónde se va la aguja.» |
| 4 | La fórmula se arma con los colores de cada palanca. | «Atajo: Δtcr ≈ (inflación de afuera − inflación de aquí) + variación del nominal.» |
| 5 | La aguja en cada zona con un exportador que sonríe o no (gesto neutro, sin emoji). | «Positivo: devaluación real, el exportador gana. Negativo: revaluación real, pierde.» |
| 6 | Junto a la aguja aparece la cifra ITCR = (1 + Δtcn)(1 + ΔPx)/(1 + ΔPn) en vivo. | «El ITCR lo calcula con índices: mayor que 1, devaluación real; menor, revaluación.» |

### A4 · La tonelada de banano (`pc26-a4-banano`)
**Gancho visual:** una tonelada de banano con etiqueta de precio en dólares que se compara
con la etiqueta de la góndola de un supermercado en EE. UU.; si la del banano es mayor, el
carrito del comprador pasa de largo.

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | Caja de banano «Tropical Fruits» y un comprador «US Foods». | «Tropical Fruits vende banano a US Foods. Producir una tonelada cuesta $2.127.250.» |
| 2 | Animación: los pesos pasan por la balanza de A1 (tc 3.175) y salen USD 670. Igual etiqueta en la góndola. | «Con el dólar a $3.175, ese costo son USD 670: justo el precio de mercado.» |
| 3 | Un calendario pasa un año; el termómetro de Colombia sube 5 %, el de EE. UU. 1,5 %, y el tc sube 1,5 %. | «Pasa un año: inflación aquí 5 %, allá 1,5 %. El dólar sube 1,5 %.» |
| 4 | Predecir: botones «Sí le compra» / «No le compra». Revelar: etiqueta banano USD 693,10 frente a góndola USD 680,05; el carrito pasa de largo. Retro: «Sí»: «Su precio quedó por encima del de mercado.»; «No»: «Eso: los costos subieron más que el dólar.» | «¿US Foods le sigue comprando? Apuesta.» |
| 5 | El tc del año sube 5 % en vez de 1,5 %: la etiqueta baja a USD 670,00, por debajo de 680,05; el carrito se detiene. | «Si el dólar sube 5 %, el precio necesario baja a USD 670: vuelve a vender.» |
| 6 | La aguja de A3 marca los dos casos: ITCR 0,981 (revaluación real) y 1,015 (devaluación real). | «Un dólar más caro no basta: importa cuánto sube frente a las dos inflaciones.» |

### H3 · La aguja del real (`pc26-h3-aguja`, Difícil, 50 FP × %)
**Consigna:** «Lleva la aguja al cambio real y di quién gana.» (10)
**Figura:** el dial de A3 de −6 % a +6 % (paso 0,5), con las tres cifras de la ronda en
fichas (inflación de afuera, de aquí, variación del nominal). Paso 1: arrastrar la aguja.
Paso 2: interruptor «El exportador colombiano: gana / pierde / igual». «Revisar»: la aguja
correcta se dibuja como fantasma; se muestra el ITCR de la ronda.
**Partida:** 4 de 6. Puntaje = criterios correctos / 8. Tolerancia de la aguja ± 0,5.

| # | Afuera · Aquí · Nominal | Δtcr (atajo) · ITCR | Exportador |
|---|---|---|---|
| 1 | 1,5 % · 5 % · +6 % | +2,5 % · 1,025 | gana |
| 2 | 1,5 % · 5 % · +2 % | −1,5 % · 0,986 | pierde |
| 3 | 1,5 % · 5 % · +1,5 % (banano) | −2 % · 0,981 | pierde |
| 4 | 1,5 % · 5 % · +5 % (banano) | +1,5 % · 1,015 | gana |
| 5 | 5 % (Brasil) · 7 % · +6 % (calzado) | +4 % · 1,040 | gana |
| 6 | 3 % · 3 % · 0 % | 0 % · 1,000 | igual |

Retro de la aguja (el constructor elige según el error):
- Signo de las inflaciones invertido (respuesta = (aquí − afuera) + nominal): «Es inflación de afuera MENOS la de aquí, y luego el nominal.»
- Olvidó el nominal (respuesta = afuera − aquí): «Falta sumar la variación del nominal.»
- Otro error: «Revisa la suma: (afuera − aquí) + nominal = {resultado}.»
Retro del interruptor: devaluación real → «Devaluación real: lo nuestro sale más barato afuera. Gana.» ·
revaluación real → «Revaluación real: lo nuestro se encarece afuera. Pierde.» ·
equilibrio → «Sin cambio real, su competitividad queda igual.»
Subtema: `pc-itcr`, `pc-nominal-real`.

### H4 · ¿A quién le sirve? (`pc26-h4-a-quien-sirve`, Medio, 25 FP × %)
**Consigna:** «Tira la cuerda hacia quien sale ganando.» (7)
**Figura:** un tira y afloja: a la izquierda «Exportadora de flores», a la derecha
«Importadora de celulares», una cuerda con un pañuelo al centro. La tarjeta de la noticia
arriba. Arrastrar el pañuelo hacia un lado (o tocar el personaje). Acierto: el personaje
tira y el otro se desliza un paso. Error: el pañuelo vuelve, borde coral, retro.
**Partida:** 6 de 8. Puntaje = aciertos al primer intento / 6.

| # | Noticia | Gana | Retro si elige al otro |
|---|---|---|---|
| 1 | El peso se devalúa 10 %. | Exportadora | «Cada dólar que vende le da más pesos.» |
| 2 | El peso se revalúa 8 %. | Importadora | «Con peso fuerte, los celulares de afuera salen más baratos.» |
| 3 | Devaluación real: el ITCR pasa a 1,04. | Exportadora | «ITCR mayor que 1: lo nuestro se abarata afuera.» |
| 4 | Revaluación real: el ITCR queda en 0,98. | Importadora | «ITCR menor que 1: lo importado se abarata aquí.» |
| 5 | El dólar baja de $4.000 a $3.800. | Importadora | «Necesita menos pesos para pagar cada dólar.» |
| 6 | El dólar sube de $4.000 a $4.500. | Exportadora | «Recibe 500 pesos más por cada dólar vendido.» |
| 7 | Sube la inflación en Colombia y el dólar no se mueve. | Importadora | «Inflación aquí sin dólar más caro: revaluación real.» |
| 8 | Sube la inflación en EE. UU. y el dólar no se mueve. | Exportadora | «Afuera todo sube y lo nuestro no: devaluación real.» |

Subtema: `pc-impactos`; 3, 4, 7 y 8 además `pc-nominal-real`.

### A5 · Dos tuberías (`pc26-a5-tuberias`)
**Gancho visual:** un país como una casa con dos tuberías al exterior —una de bienes y
servicios, otra de dinero— que desembocan en un tanque de reservas internacionales.

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | La casa con las dos tuberías y el tanque. | «La balanza de pagos anota todo lo que el país transa con el exterior.» |
| 2 | Tocar la tubería de arriba: pasan cajas (bienes), maletas (servicios) y sobres (transferencias). | «Cuenta corriente: bienes, servicios y transferencias.» |
| 3 | Tocar la de abajo: pasan inversiones y préstamos. | «Cuenta de capital: inversión extranjera y deuda externa.» |
| 4 | Dos íconos dentro de la tubería de capital: un árbol con raíces (IED) que se queda y un pájaro (golondrina) que entra y sale. Botón «Pasa un trimestre»: el pájaro se va. | «La IED se queda produciendo. El capital golondrina entra y sale buscando rendimiento.» |
| 5 | La ecuación BP = X(tc) − M(tc, Y) + F(i) con cada término unido a su tubería. | «BP = X(tc) − M(tc, Y) + F(i). Lo que entra y sale mueve el dólar.» |
| 6 | El tanque sube o baja según el saldo. | «El saldo final cambia las reservas internacionales del país.» |

### A6 · Imanes de capital (`pc26-a6-imanes`)
**Gancho visual:** dos países como imanes; las monedas de capital vuelan hacia el que atrae
más; una nube de tormenta (riesgo) las espanta.

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | Dos imanes «Colombia» y «EE. UU.» con monedas entre ellos. | «El capital va adonde gana más, con menos riesgo.» |
| 2 | Deslizadores «tasa aquí» y «tasa allá» (0–16 %): las monedas se inclinan hacia la tasa mayor. | «Una tasa de interés más alta atrae capital.» |
| 3 | Botón «Sube el riesgo» sobre un país: aparece una nube y las monedas se alejan. | «Más riesgo lo espanta.» |
| 4 | Una cuesta aparece bajo el país de tasa alta (su moneda se deprecia) y algunas monedas ruedan de vuelta. | «Y el movimiento del tipo de cambio puede borrar la ganancia de la tasa.» |
| 5 | Predecir con el caso del ahorro: «Aquí» / «Afuera». Revelar: aquí $654 millones; afuera, sin cambio del dólar, menos. Retro: «Aquí»: «Eso: 9 % le gana a 4 % si el dólar no se mueve.»; «Afuera»: «Si el dólar no cambia, 9 % le gana a 4 %.» | «Ahorras $600 millones un año: 9 % aquí o 4 % en EE. UU.» |
| 6 | Barra que crece: si el peso se devalúa 12 %, el ahorro de afuera vale $698,9 millones, más que $654. | «Pero si el peso se devalúa 12 %, el ahorro de afuera vale $698,9 millones.» |
| 7 | Resumen visual: tasa de allá + devaluación del peso ≈ lo que rinde afuera. | «Regla práctica: lo que rinde afuera ≈ la tasa de allá + la devaluación del peso.» |

Nota: la regla de la P7 es criterio propio derivado de los casos del profesor (ficha §5).

### H5 · ¿Aquí o afuera? (`pc26-h5-donde-ahorro`, Difícil, 50 FP × %)
**Consigna de cada decisión** (≤ 12 palabras, abajo).
**Figura:** los imanes de A6 y una calculadora visual que muestra el resultado en pesos tras
cada decisión (barras de dos colores, aquí y afuera). **Dos casos seguidos**, cada uno con
tres decisiones; cada decisión se califica. Tras decidir, se revela el resultado con la cifra.
Puntaje = decisiones correctas / 6.

**Caso 1 · Ahorro de $600 millones** (tc $3.757; 9 % aquí; 4 % allá)
| Decisión | Consigna | Correcta | Revelado | Retro si yerra |
|---|---|---|---|---|
| 1 | «Sin cambios en el dólar: ¿dónde ahorras?» | Aquí | Aquí $654 M | «Con el dólar quieto, 9 % le gana a 4 %.» |
| 2 | «El peso se revalúa 15,61 %. ¿Dónde ahorras?» | Aquí | Afuera $526,6 M · aquí $654 M | «Con peso fuerte, tus dólares valen menos pesos al volver.» |
| 3 | «El peso se devalúa 12 %. ¿Dónde ahorras?» | Afuera | Afuera $698,9 M · aquí $654 M | «La devaluación suma: afuera rinde cerca de 16,5 %.» |

**Caso 2 · Crédito de $1.000 millones** (tc $3.175; 15 % aquí; 8 % allá)
| Decisión | Consigna | Correcta | Revelado | Retro si yerra |
|---|---|---|---|---|
| 4 | «Sin cambios en el dólar: ¿dónde te prestas?» | Afuera | Afuera pagas menos que $1.150 M | «Con el dólar quieto, 8 % cuesta menos que 15 %.» |
| 5 | «El peso se revalúa 15,61 %. ¿Dónde te prestas?» | Afuera | Afuera $911,4 M · aquí $1.150 M | «Peso fuerte: necesitas menos pesos para pagar los dólares.» |
| 6 | «El peso se devalúa 12 %. ¿Dónde te prestas?» | Aquí | Afuera $1.209,6 M · aquí $1.150 M | «Con devaluación, la deuda en dólares sale más cara: cerca de 21 %.» |

Tras cada caso, una línea de cierre: Caso 1 «El capital se va afuera cuando se espera devaluación.» (10) ·
Caso 2 «Endeudarse en dólares es apostar a que el peso no se devalúe.» (12).
Subtema: `pc-flujos-capital`.

### A7 · La correa del dólar (`pc26-a7-correa`)
**Gancho visual:** el tipo de cambio como un perro que pasea, y el BanRep como su dueño;
cada régimen es una forma de llevar la correa. Cuatro animaciones cortas, sin bucle.

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | El BanRep con dos metas: una balanza quieta (estabilidad) y una balanza de pagos en cero. | «El BanRep busca estabilidad cambiaria y equilibrio en la balanza de pagos.» |
| 2 | Dos baldes: «compra dólares» y «vende dólares». | «Su herramienta principal: comprar o vender dólares en el mercado.» |
| 3 | Tocar «compra»: el tanque de reservas sube y el tc sube. Tocar «vende»: al revés. | «Comprar dólares sube su precio y suma reservas. Vender hace lo contrario.» |
| 4 | El perro (tc) y el dueño (BanRep). | «El régimen cambiario es la forma de llevar al dólar. Como pasear un perro.» |
| 5 | Fijo: el perro atado a un poste; un letrero «6,96 bolivianos por dólar». | «Fijo: atado a un poste. Bolivia: 6,96 bolivianos por dólar.» |
| 6 | Banda: correa de largo limitado entre dos líneas (techo y piso); al tocar una, el dueño jala. | «Banda: correa de largo limitado. Colombia la usó de 1990 a 1999.» |
| 7 | Gota a gota: el perro sube una rampa a paso fijo. | «Gota a gota: sube a paso fijo por una rampa anunciada.» |
| 8 | Flexible: el perro suelto; botón «Flotación sucia»: el dueño a veces lo jala. | «Flexible: suelto, lo mueve el mercado. Si el BanRep a veces jala, es flotación sucia.» |
| 9 | Dos íconos más: un candado (controles cambiarios) y dos etiquetas de precio distintas (tipos diferenciales). | «Otros instrumentos: controles cambiarios y tipos de cambio diferenciales.» |

### H6 · Cada hecho a su correa (`pc26-h6-correa`, Medio, 25 FP × %)
**Consigna:** «Arrastra cada hecho al régimen que describe.» (7)
**Figura:** las cuatro correas de A7 en miniatura (fijo, banda, gota a gota, flexible) como
destinos. Acierto: el perro de esa correa hace su animación. Error: rebota, borde coral, retro
del par. **Partida:** 6 de 8. Puntaje = aciertos al primer intento / 6.

| # | Hecho | Régimen |
|---|---|---|
| 1 | Bolivia mantiene 6,96 bolivianos por dólar. | Fijo |
| 2 | En Colombia, de 1990 a 1999, el dólar se movía entre un techo y un piso. | Banda |
| 3 | Se anuncia una devaluación anual y se aplica en pequeñas dosis continuas. | Gota a gota |
| 4 | Desde 1999, en Colombia el precio del dólar lo pone el mercado. | Flexible |
| 5 | El banco central defiende una sola paridad. | Fijo |
| 6 | El banco central interviene cuando el dólar toca un límite. | Banda |
| 7 | Manda el mercado, pero el banco central a veces compra o vende. | Flexible |
| 8 | Mini-devaluaciones continuas, a un ritmo conocido. | Gota a gota |

Retro por par (verdadero → elegido):
| Verdadero → | Fijo | Banda | Gota a gota | Flexible |
|---|---|---|---|---|
| **Fijo** | — | «No hay corredor: es una sola paridad.» | «No sube a paso fijo: no se mueve.» | «El mercado no lo mueve: está atado.» |
| **Banda** | «Se mueve, pero entre techo y piso.» | — | «No sube a ritmo fijo: flota dentro del corredor.» | «Tiene límites que el banco defiende.» |
| **Gota a gota** | «Sí se mueve: un poco cada día.» | «No hay techo ni piso: hay un ritmo anunciado.» | — | «El ritmo lo anuncia el banco, no el mercado.» |
| **Flexible** | «No hay paridad que defender: manda el mercado.» | «No hay corredor: flota libre.» | «No hay ritmo anunciado: lo pone el mercado.» | — |

Subtema: `pc-regimenes`.

---

## 3. Autoevaluación contra el Kit

| Dimensión | Nivel esperado | Por qué |
|---|---|---|
| Prerrequisitos | Pasa | Rastreable a d. 2–29; cifras de casos verificadas por cálculo; sin clichés. |
| D1 | Avanzado | 10 subtemas; los casos del profesor (banano, ahorro, crédito) entran completos. |
| D2 | Avanzado | Comprender (A1–A7), aplicar con cálculo (H3), analizar ganadores (H4), decidir con riesgo (H5). |
| D3 | Avanzado | Retro de la aguja diagnostica el tipo de error. |
| D4 | Avanzado | Balanza, subasta, aguja, etiquetas, tira y afloja, imanes, perro. |
| D6 | Avanzado | Retro por ítem o por par; ninguna genérica. |
| D7 | Avanzado (a medir) | Dial y gráfica a 320; tira y afloja en horizontal cabe a 320 con personajes de 72 px. |
| D8 | Avanzado | Bancos mayores que la partida; H5 son dos casos con 6 decisiones. |
| D9 | Avanzado | Ninguno de estos ganchos aparece en T1–T4. |
| D11 | Avanzado | Tonos fijos de peso y dólar en las 13 piezas. |
| D13 | Medio | ≤ 12 palabras. |

## 4. Conteo de palabras
Aprender (≤ 20): A1 13 · 10 · 14 · 13 · 13 — A2 13 · 14 · 11 · 12 — A3 14 · 11 · 11 · 12 · 11 · 13 —
A4 12 · 14 · 12 · 6 · 15 · 13 — A5 13 · 6 · 8 · 13 · 14 · 9 — A6 9 · 7 · 4 · 13 · 12 · 14 · 14 —
A7 12 · 10 · 12 · 13 · 10 · 12 · 11 · 16 · 9.
Consignas (≤ 12): H1 9 · H2 8 · H3 10 · H4 7 · H5 ≤ 9 por decisión · H6 7.
