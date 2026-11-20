/*
 * (Va como texto JS y no como .css para que las pruebas de Node, que importan
 * los componentes, no tropiecen con un import de estilos.)
 *
 * El movimiento de las marionetas (src/mascota/marionetas.js).
 * El ánimo es una clase en el <svg>: .mta-tranquila, .mta-feliz, .mta-celebra,
 * .mta-triste, .mta-racha. .mta-quieta es la pose neutra sin movimiento: la que
 * se usa en listas (ranking, selector, tienda), donde muchas a la vez cansan.
 */
export const ESTILO_MARIONETA = `.mta * { transform-box: fill-box; }
.mta .mta-cara, .mta .mta-aura, .mta .mta-fuego, .mta .mta-confeti,
.mta .mta-notas, .mta .mta-corazones, .mta .mta-estrellas,
.mta .mta-obj, .mta .mta-birrete { display: none; }
.mta-quieta .mta-c-tranquila, .mta-tranquila .mta-c-tranquila,
.mta-feliz .mta-c-feliz, .mta-baila .mta-c-feliz, .mta-saltitos .mta-c-feliz,
.mta-triste .mta-c-triste, .mta-racha .mta-c-racha { display: inline; }
/* Las caras nuevas (CARAS y CARA_DE_FESTEJO en marionetas.js) */
.mta-canta .mta-c-canta, .mta-karaoke .mta-c-canta,
.mta-campeon .mta-c-estrellas, .mta-celebra .mta-c-estrellas,
.mta-graduado .mta-c-risa, .mta-porra .mta-c-risa,
.mta-fiesta .mta-c-guino, .mta-saluda .mta-c-guino,
.mta-globo .mta-c-corazones, .mta-colita .mta-c-corazones { display: inline; }
/* Cada objeto sale solo en su festejo */
.mta-karaoke .mta-obj-karaoke, .mta-campeon .mta-obj-campeon, .mta-fiesta .mta-obj-fiesta,
.mta-globo .mta-obj-globo, .mta-porra .mta-obj-porra, .mta-graduado .mta-birrete { display: inline; }

/* Bisagras: dónde gira cada pieza.
   Los brazos están dibujados colgando: girados más de ~50° se ven postizos
   (Mateo, 19-nov: «los brazos están como disconformes, bájalos»). */
.mta .mta-cola { transform-origin: 5% 85%; }
.mta .mta-brazo-i { transform-origin: 90% 8%; }
.mta .mta-brazo-d { transform-origin: 10% 8%; }
.mta .mta-oreja-i { transform-origin: 70% 95%; }
.mta .mta-oreja-d { transform-origin: 30% 95%; }
.mta .mta-cabeza { transform-origin: 50% 95%; }
.mta .mta-cuerpo, .mta .mta-todo { transform-origin: 50% 100%; }
.mta .mta-sombra { transform-origin: 50% 50%; }

/* Orejas caídas (perro): giran desde arriba y, tristes, se pegan a la cara */
.mta-sp-perro .mta-oreja-i { transform-origin: 60% 8%; }
.mta-sp-perro .mta-oreja-d { transform-origin: 40% 8%; }
.mta-sp-perro.mta-triste .mta-oreja-i { transform: rotate(-10deg); }
.mta-sp-perro.mta-triste .mta-oreja-d { transform: rotate(10deg); }

/* TRANQUILA: respira, parpadea, mueve la cola */
.mta-tranquila .mta-cuerpo { animation: mta-respira 3.2s ease-in-out infinite; }
.mta-tranquila .mta-cabeza { animation: mta-cabecea 3.2s ease-in-out infinite; }
.mta-tranquila .mta-ojos { animation: mta-parpadeo 4s infinite; transform-origin: 50% 50%; }
.mta-tranquila .mta-cola { animation: mta-cola-lenta 3s ease-in-out infinite; }
.mta-tranquila .mta-oreja-d { animation: mta-oreja-tic 6s ease-in-out infinite; }

/* FELIZ: salta con rebote, agita los brazos */
.mta-feliz .mta-todo { animation: mta-salto .9s cubic-bezier(.3,0,.5,1) infinite; }
.mta-feliz .mta-sombra { animation: mta-sombra .9s cubic-bezier(.3,0,.5,1) infinite; }
.mta-feliz .mta-brazo-i { animation: mta-brazo-arriba-i .9s ease-in-out infinite; }
.mta-feliz .mta-brazo-d { animation: mta-brazo-arriba-d .9s ease-in-out infinite; }
.mta-feliz .mta-cola { animation: mta-cola-rapida .3s ease-in-out infinite; }
.mta-feliz .mta-cabeza { animation: mta-ladea .9s ease-in-out infinite; }

/* CELEBRA: salto grande con giro, brazos arriba, confeti */
.mta-celebra .mta-todo { animation: mta-super-salto 1.6s cubic-bezier(.3,0,.4,1) infinite; transform-origin: 50% 55%; }
.mta-celebra .mta-sombra { animation: mta-sombra-grande 1.6s cubic-bezier(.3,0,.4,1) infinite; }
.mta-celebra .mta-brazo-i { animation: mta-brazos-v-i .4s ease-in-out infinite alternate; }
.mta-celebra .mta-brazo-d { animation: mta-brazos-v-d .4s ease-in-out infinite alternate; }
.mta-celebra .mta-cola { animation: mta-cola-rapida .25s ease-in-out infinite; }
.mta-celebra .mta-confeti { display: inline; }
.mta-celebra .mta-confeti > * { animation: mta-cae 1.6s linear infinite; transform-origin: 50% 50%; }
.mta-confeti > :nth-child(2) { animation-delay: .3s; }
.mta-confeti > :nth-child(3) { animation-delay: .8s; }
.mta-confeti > :nth-child(4) { animation-delay: .5s; }
.mta-confeti > :nth-child(5) { animation-delay: 1.1s; }
.mta-confeti > :nth-child(6) { animation-delay: .2s; }
.mta-confeti > :nth-child(7) { animation-delay: 1.3s; }
.mta-confeti > :nth-child(8) { animation-delay: .9s; }
.mta-confeti > :nth-child(9) { animation-delay: 1.4s; }
.mta-confeti > :nth-child(10) { animation-delay: .6s; }

/* ═══ LOS FESTEJOS DE CIERRE (FESTEJOS en marionetas.js) ═══ */

/* COLITA: menea la cola a toda velocidad y el cuerpo entero con ella; corazones */
.mta-colita .mta-todo { animation: mta-menea .76s ease-in-out infinite; }
.mta-colita .mta-sombra { animation: mta-sombra-menea .38s ease-in-out infinite; }
.mta-colita .mta-cola { animation: mta-cola-loca .19s ease-in-out infinite; }
.mta-colita .mta-cabeza { animation: mta-ladea-tierno 1.52s ease-in-out infinite; }
.mta-colita .mta-oreja-i { animation: mta-oreja-rebote-i .38s ease-in-out infinite; }
.mta-colita .mta-oreja-d { animation: mta-oreja-rebote-d .38s ease-in-out infinite; }
.mta-colita .mta-brazo-i { animation: mta-patita-i .38s ease-in-out infinite alternate; }
.mta-colita .mta-brazo-d { animation: mta-patita-d .38s ease-in-out infinite alternate-reverse; }
.mta-colita .mta-corazones { display: inline; }

/* BAILA: de lado a lado con bajadita, un brazo arriba y luego el otro; notas */
.mta-baila .mta-todo { animation: mta-baile 1.2s ease-in-out infinite; }
.mta-baila .mta-sombra { animation: mta-baile-sombra 1.2s ease-in-out infinite; }
.mta-baila .mta-brazo-i { animation: mta-baile-brazo-i 1.2s ease-in-out infinite; }
.mta-baila .mta-brazo-d { animation: mta-baile-brazo-d 1.2s ease-in-out infinite; }
.mta-baila .mta-cabeza { animation: mta-baile-cabeza .6s ease-in-out infinite alternate; }
.mta-baila .mta-cola { animation: mta-cola-rapida .3s ease-in-out infinite; }
.mta-baila .mta-oreja-i { animation: mta-oreja-rebote-i .6s ease-in-out infinite; }
.mta-baila .mta-oreja-d { animation: mta-oreja-rebote-d .6s ease-in-out infinite; }
.mta-baila .mta-notas { display: inline; }

/* CANTA: se mece, cabeza en alto, un brazo abierto al público y el otro al pecho; notas */
.mta-canta .mta-todo { animation: mta-mece 2.4s ease-in-out infinite; }
.mta-canta .mta-cabeza { animation: mta-canta-cabeza 1.2s ease-in-out infinite; }
.mta-canta .mta-brazo-d { animation: mta-canta-brazo 2.4s ease-in-out infinite; }
.mta-canta .mta-brazo-i { animation: mta-canta-pecho 2.4s ease-in-out infinite; }
.mta-canta .mta-cola { animation: mta-cola-lenta 1.2s ease-in-out infinite; }
.mta-canta .mta-notas { display: inline; }

/* SALTITOS: brinquitos cortos y seguidos, orejas que rebotan; estrellas */
.mta-saltitos .mta-todo { animation: mta-saltito .52s cubic-bezier(.3,0,.5,1) infinite; }
.mta-saltitos .mta-sombra { animation: mta-sombra .52s cubic-bezier(.3,0,.5,1) infinite; }
.mta-saltitos .mta-brazo-i { animation: mta-patita-i .26s ease-in-out infinite alternate; }
.mta-saltitos .mta-brazo-d { animation: mta-patita-d .26s ease-in-out infinite alternate; }
.mta-saltitos .mta-oreja-i { animation: mta-oreja-rebote-i .52s ease-in-out infinite; }
.mta-saltitos .mta-oreja-d { animation: mta-oreja-rebote-d .52s ease-in-out infinite; }
.mta-saltitos .mta-cola { animation: mta-cola-loca .26s ease-in-out infinite; }
.mta-saltitos .mta-estrellas { display: inline; }

/* SALUDA: agita la patita, ladea la cabeza y de vez en cuando da un brinco; corazones */
.mta-saluda .mta-todo { animation: mta-brinco 1.8s cubic-bezier(.3,0,.5,1) infinite; }
.mta-saluda .mta-sombra { animation: mta-sombra-brinco 1.8s cubic-bezier(.3,0,.5,1) infinite; }
.mta-saluda .mta-brazo-d { animation: mta-saludo .9s ease-in-out infinite; }
.mta-saluda .mta-brazo-i { animation: mta-patita-i 1.8s ease-in-out infinite alternate; }
.mta-saluda .mta-cabeza { animation: mta-ladea-tierno 1.8s ease-in-out infinite; }
.mta-saluda .mta-cola { animation: mta-cola-rapida .3s ease-in-out infinite; }
.mta-saluda .mta-corazones { display: inline; }

/* ═══ FESTEJOS CON OBJETO (20-nov) ═══ */

/* KARAOKE: se mece con el micrófono en alto, cabeza que canta; notas */
.mta-karaoke .mta-todo { animation: mta-mece 2.4s ease-in-out infinite; }
.mta-karaoke .mta-cabeza { animation: mta-canta-cabeza 1.2s ease-in-out infinite; }
.mta-karaoke .mta-brazo-d { animation: mta-micro 1.2s ease-in-out infinite; }
.mta-karaoke .mta-brazo-i { animation: mta-canta-pecho 2.4s ease-in-out infinite; }
.mta-karaoke .mta-cola { animation: mta-cola-lenta 1.2s ease-in-out infinite; }
.mta-karaoke .mta-notas { display: inline; }

/* CAMPEÓN: trofeo arriba, brinquitos de orgullo; estrellas */
.mta-campeon .mta-todo { animation: mta-saltito .7s cubic-bezier(.3,0,.5,1) infinite; }
.mta-campeon .mta-sombra { animation: mta-sombra .7s cubic-bezier(.3,0,.5,1) infinite; }
.mta-campeon .mta-brazo-i { animation: mta-trofeo .7s ease-in-out infinite; }
.mta-campeon .mta-brazo-d { animation: mta-patita-d .35s ease-in-out infinite alternate; }
.mta-campeon .mta-pz-trofeo { animation: mta-brilla .7s ease-in-out infinite; transform-origin: 50% 90%; }
.mta-campeon .mta-cola { animation: mta-cola-loca .35s ease-in-out infinite; }
.mta-campeon .mta-estrellas { display: inline; }

/* GRADUADO: lanza el birrete, que gira en el aire y vuelve a la cabeza; confeti */
.mta-graduado .mta-todo { animation: mta-brinco 2s cubic-bezier(.3,0,.5,1) infinite; }
.mta-graduado .mta-sombra { animation: mta-sombra-brinco 2s cubic-bezier(.3,0,.5,1) infinite; }
.mta-graduado .mta-birrete-vuela { animation: mta-birrete 2s cubic-bezier(.35,0,.45,1) infinite; transform-origin: 50% 50%; }
.mta-graduado .mta-brazo-i { animation: mta-lanza-i 2s ease-in-out infinite; }
.mta-graduado .mta-brazo-d { animation: mta-lanza-d 2s ease-in-out infinite; }
.mta-graduado .mta-cola { animation: mta-cola-rapida .3s ease-in-out infinite; }
.mta-graduado .mta-confeti { display: inline; }
.mta-graduado .mta-confeti > * { animation: mta-cae 2s linear infinite; transform-origin: 50% 50%; }

/* FIESTA: baila soplando el cornetín, que se estira y se enrolla; confeti */
.mta-fiesta .mta-todo { animation: mta-baile 1.2s ease-in-out infinite; }
.mta-fiesta .mta-sombra { animation: mta-baile-sombra 1.2s ease-in-out infinite; }
.mta-fiesta .mta-brazo-d { animation: mta-sopla 1.2s ease-in-out infinite; }
.mta-fiesta .mta-brazo-i { animation: mta-patita-i .6s ease-in-out infinite alternate; }
.mta-fiesta .mta-pz-cornetin { animation: mta-cornetin .6s ease-in-out infinite; transform-origin: 10% 90%; }
.mta-fiesta .mta-cabeza { animation: mta-baile-cabeza .6s ease-in-out infinite alternate; }
.mta-fiesta .mta-cola { animation: mta-cola-rapida .3s ease-in-out infinite; }
.mta-fiesta .mta-confeti { display: inline; }
.mta-fiesta .mta-confeti > * { animation: mta-cae 2.2s linear infinite; transform-origin: 50% 50%; }

/* GLOBO: se mece suave con su globo, que flota y tira de la cuerda; corazones */
.mta-globo .mta-todo { animation: mta-mece 3s ease-in-out infinite; }
.mta-globo .mta-brazo-i { animation: mta-sostiene 3s ease-in-out infinite; }
.mta-globo .mta-brazo-d { animation: mta-patita-d 1.5s ease-in-out infinite alternate; }
.mta-globo .mta-pz-globo { animation: mta-flota 1.5s ease-in-out infinite; transform-origin: 56% 99%; }
.mta-globo .mta-cabeza { animation: mta-ladea-tierno 3s ease-in-out infinite; }
.mta-globo .mta-cola { animation: mta-cola-lenta 1.5s ease-in-out infinite; }
.mta-globo .mta-corazones { display: inline; }

/* PORRA: brinca agitando la maraca y la banderita; estrellas */
.mta-porra .mta-todo { animation: mta-saltito .6s cubic-bezier(.3,0,.5,1) infinite; }
.mta-porra .mta-sombra { animation: mta-sombra .6s cubic-bezier(.3,0,.5,1) infinite; }
.mta-porra .mta-brazo-d { animation: mta-agita-d .3s ease-in-out infinite alternate; }
.mta-porra .mta-brazo-i { animation: mta-agita-i .6s ease-in-out infinite alternate; }
.mta-porra .mta-pz-maraca { animation: mta-maraca .15s ease-in-out infinite alternate; transform-origin: 30% 86%; }
.mta-porra .mta-pz-banderita { animation: mta-ondea-bandera .6s ease-in-out infinite alternate; transform-origin: 8% 90%; }
.mta-porra .mta-cola { animation: mta-cola-loca .3s ease-in-out infinite; }
.mta-porra .mta-estrellas { display: inline; }

/* La voltereta (celebra) también suelta estrellas */
.mta-celebra .mta-estrellas { display: inline; }

/* Los adornos que flotan */
.mta .mta-nota, .mta .mta-corazon, .mta .mta-estrella { transform-origin: 50% 50%; }
.mta-notas .mta-nota { animation: mta-nota 2.4s ease-out infinite; }
.mta-notas > :nth-child(2) .mta-nota { animation-delay: .8s; }
.mta-notas > :nth-child(3) .mta-nota { animation-delay: 1.6s; }
.mta-corazones .mta-corazon { animation: mta-corazon 2.1s ease-out infinite; }
.mta-corazones > :nth-child(2) .mta-corazon { animation-delay: .7s; }
.mta-corazones > :nth-child(3) .mta-corazon { animation-delay: 1.4s; }
.mta-estrellas .mta-estrella { animation: mta-estrella 1.3s ease-in-out infinite; }
.mta-estrellas > :nth-child(2) .mta-estrella { animation-delay: .45s; }
.mta-estrellas > :nth-child(3) .mta-estrella { animation-delay: .9s; }
.mta-estrellas > :nth-child(4) .mta-estrella { animation-delay: .2s; }
.mta-estrellas > :nth-child(5) .mta-estrella { animation-delay: .65s; }
.mta-estrellas > :nth-child(6) .mta-estrella { animation-delay: 1.1s; }

/* TRISTE: cabeza gacha, orejas caídas, lágrima */
.mta-triste .mta-cuerpo { animation: mta-respira-lento 4.5s ease-in-out infinite; }
.mta-triste .mta-cabeza { transform: translateY(14px) rotate(-4deg); transition: transform .6s; }
.mta-triste .mta-oreja-i { transform: rotate(-38deg); transition: transform .6s; }
.mta-triste .mta-oreja-d { transform: rotate(38deg); transition: transform .6s; }
.mta-triste .mta-cola { transform: rotate(22deg); transition: transform .6s; }
.mta-triste .mta-brazo-i { transform: rotate(-6deg); }
.mta-triste .mta-lagrima { animation: mta-lagrima 2.2s ease-in infinite; transform-origin: 50% 0%; }

/* RACHA: aura, llamas sobre la cabeza, puño arriba */
.mta-racha .mta-aura { display: inline; animation: mta-aura 1.1s ease-in-out infinite; transform-origin: 50% 50%; }
.mta-racha .mta-fuego { display: inline; }
.mta-racha .mta-llama-1 { animation: mta-llama .5s ease-in-out infinite alternate; transform-origin: 50% 100%; }
.mta-racha .mta-llama-2 { animation: mta-llama .42s ease-in-out infinite alternate-reverse; transform-origin: 50% 100%; }
.mta-racha .mta-llama-3 { animation: mta-llama .55s ease-in-out infinite alternate; transform-origin: 50% 100%; }
.mta-racha .mta-brazo-d { animation: mta-puno 1.1s ease-in-out infinite; }
.mta-racha .mta-todo { animation: mta-firme 1.1s ease-in-out infinite; }
.mta-racha .mta-cola { animation: mta-cola-lenta 1.1s ease-in-out infinite; }
.mta-racha .mta-chispas circle { animation: mta-chispa 1.4s ease-out infinite; }
.mta-chispas circle:nth-child(1) { animation-delay: .2s; }
.mta-chispas circle:nth-child(2) { animation-delay: .7s; }
.mta-chispas circle:nth-child(3) { animation-delay: 1s; }
.mta-chispas circle:nth-child(4) { animation-delay: .4s; }
.mta-chispas circle:nth-child(5) { animation-delay: 1.2s; }

/* ACCESORIOS: los que cuelgan o vuelan se mueven solos cuando la mascota no está quieta */
.mta .mta-acc-alas { transform-origin: 50% 60%; }
.mta .mta-acc-capa { transform-origin: 50% 0%; }
.mta .mta-acc-medalla { transform-origin: 50% 0%; }
.mta-tranquila .mta-acc-alas, .mta-racha .mta-acc-alas { animation: mta-aleteo 1.6s ease-in-out infinite; }
.mta-feliz .mta-acc-alas, .mta-celebra .mta-acc-alas, .mta-colita .mta-acc-alas, .mta-baila .mta-acc-alas, .mta-canta .mta-acc-alas, .mta-saltitos .mta-acc-alas, .mta-saluda .mta-acc-alas, .mta-karaoke .mta-acc-alas, .mta-campeon .mta-acc-alas, .mta-graduado .mta-acc-alas, .mta-fiesta .mta-acc-alas, .mta-globo .mta-acc-alas, .mta-porra .mta-acc-alas { animation: mta-aleteo .35s ease-in-out infinite; }
.mta-tranquila .mta-acc-capa { animation: mta-ondea 3.2s ease-in-out infinite; }
.mta-feliz .mta-acc-capa, .mta-celebra .mta-acc-capa, .mta-racha .mta-acc-capa, .mta-colita .mta-acc-capa, .mta-baila .mta-acc-capa, .mta-canta .mta-acc-capa, .mta-saltitos .mta-acc-capa, .mta-saluda .mta-acc-capa, .mta-karaoke .mta-acc-capa, .mta-campeon .mta-acc-capa, .mta-graduado .mta-acc-capa, .mta-fiesta .mta-acc-capa, .mta-globo .mta-acc-capa, .mta-porra .mta-acc-capa { animation: mta-ondea .9s ease-in-out infinite; }
.mta-tranquila .mta-acc-medalla { animation: mta-pendulo 3.2s ease-in-out infinite; }
.mta-feliz .mta-acc-medalla, .mta-celebra .mta-acc-medalla, .mta-colita .mta-acc-medalla, .mta-baila .mta-acc-medalla, .mta-canta .mta-acc-medalla, .mta-saltitos .mta-acc-medalla, .mta-saluda .mta-acc-medalla, .mta-karaoke .mta-acc-medalla, .mta-campeon .mta-acc-medalla, .mta-graduado .mta-acc-medalla, .mta-fiesta .mta-acc-medalla, .mta-globo .mta-acc-medalla, .mta-porra .mta-acc-medalla { animation: mta-pendulo .9s ease-in-out infinite; }
.mta-feliz .mta-acc-jetpack, .mta-celebra .mta-acc-jetpack, .mta-racha .mta-acc-jetpack, .mta-colita .mta-acc-jetpack, .mta-baila .mta-acc-jetpack, .mta-saltitos .mta-acc-jetpack, .mta-saluda .mta-acc-jetpack { animation: mta-motor .18s linear infinite alternate; }

@media (prefers-reduced-motion: reduce) {
  .mta * { animation: none !important; transition: none !important; }
}

@keyframes mta-respira { 0%,100% { transform: scale(1,1); } 50% { transform: scale(1.015,1.03); } }
@keyframes mta-respira-lento { 0%,100% { transform: scale(1,1); } 50% { transform: scale(1.01,.985); } }
@keyframes mta-cabecea { 0%,100% { transform: translateY(0); } 50% { transform: translateY(4px); } }
@keyframes mta-parpadeo { 0%,92%,100% { transform: scaleY(1); } 95% { transform: scaleY(.08); } }
@keyframes mta-cola-lenta { 0%,100% { transform: rotate(-4deg); } 50% { transform: rotate(6deg); } }
@keyframes mta-cola-rapida { 0%,100% { transform: rotate(-10deg); } 50% { transform: rotate(12deg); } }
@keyframes mta-oreja-tic { 0%,80%,90%,100% { transform: rotate(0); } 85% { transform: rotate(14deg); } }
@keyframes mta-salto { 0% { transform: translateY(0) scale(1.08,.9); } 12% { transform: translateY(0) scale(.94,1.08); } 45% { transform: translateY(-70px) scale(.98,1.03); } 80% { transform: translateY(0) scale(1,1); } 88% { transform: translateY(0) scale(1.1,.88); } 100% { transform: translateY(0) scale(1.08,.9); } }
@keyframes mta-sombra { 0%,80%,100% { transform: scale(1); opacity: .28; } 45% { transform: scale(.6); opacity: .12; } }
@keyframes mta-super-salto { 0% { transform: translateY(0) scale(1.1,.88) rotate(0); } 10% { transform: translateY(0) scale(.92,1.1) rotate(0); } 45% { transform: translateY(-130px) scale(1,1) rotate(-180deg); } 75% { transform: translateY(0) scale(1,1) rotate(-360deg); } 82% { transform: translateY(0) scale(1.12,.86) rotate(-360deg); } 100% { transform: translateY(0) scale(1,1) rotate(-360deg); } }
@keyframes mta-sombra-grande { 0%,75%,100% { transform: scale(1); opacity: .28; } 45% { transform: scale(.45); opacity: .08; } }
@keyframes mta-brazo-arriba-i { 0%,100% { transform: rotate(8deg); } 50% { transform: rotate(40deg); } }
@keyframes mta-brazo-arriba-d { 0%,100% { transform: rotate(-8deg); } 50% { transform: rotate(-40deg); } }
@keyframes mta-brazos-v-i { from { transform: rotate(20deg); } to { transform: rotate(48deg); } }
@keyframes mta-brazos-v-d { from { transform: rotate(-20deg); } to { transform: rotate(-48deg); } }
@keyframes mta-ladea { 0%,100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
@keyframes mta-lagrima { 0% { transform: translateY(0) scale(.3); opacity: 0; } 15% { transform: translateY(0) scale(1); opacity: 1; } 80% { transform: translateY(60px) scale(1); opacity: 1; } 100% { transform: translateY(75px) scale(.8); opacity: 0; } }
@keyframes mta-aura { 0%,100% { transform: scale(.95); opacity: .55; } 50% { transform: scale(1.06); opacity: .9; } }
@keyframes mta-llama { from { transform: scale(.92,1) skewX(-4deg); } to { transform: scale(1.06,1.14) skewX(5deg); } }
@keyframes mta-puno { 0%,100% { transform: rotate(-120deg); } 50% { transform: rotate(-160deg); } }
@keyframes mta-firme { 0%,100% { transform: scale(1,1); } 50% { transform: scale(1.02,1.035); } }
@keyframes mta-cae { 0% { transform: translateY(-40px) rotate(0); opacity: 0; } 10% { opacity: 1; } 100% { transform: translateY(520px) rotate(540deg); opacity: 0; } }
@keyframes mta-aleteo { 0%,100% { transform: scaleX(1); } 50% { transform: scaleX(.82); } }
@keyframes mta-ondea { 0%,100% { transform: skewX(0) scaleY(1); } 50% { transform: skewX(4deg) scaleY(1.04); } }
@keyframes mta-pendulo { 0%,100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
@keyframes mta-motor { from { transform: translateY(0); } to { transform: translateY(3px); } }
@keyframes mta-menea { 0%,100% { transform: translateY(0) rotate(-4deg) scale(1.03,.97); } 25% { transform: translateY(-16px) rotate(0) scale(.98,1.03); } 50% { transform: translateY(0) rotate(4deg) scale(1.03,.97); } 75% { transform: translateY(-16px) rotate(0) scale(.98,1.03); } }
@keyframes mta-sombra-menea { 0%,100% { transform: scale(1); opacity: .28; } 50% { transform: scale(.8); opacity: .18; } }
@keyframes mta-cola-loca { 0%,100% { transform: rotate(-26deg); } 50% { transform: rotate(28deg); } }
@keyframes mta-ladea-tierno { 0%,100% { transform: rotate(-8deg); } 50% { transform: rotate(8deg); } }
@keyframes mta-oreja-rebote-i { 0%,100% { transform: rotate(0); } 50% { transform: rotate(-12deg); } }
@keyframes mta-oreja-rebote-d { 0%,100% { transform: rotate(0); } 50% { transform: rotate(12deg); } }
@keyframes mta-patita-i { from { transform: rotate(6deg); } to { transform: rotate(24deg); } }
@keyframes mta-patita-d { from { transform: rotate(-6deg); } to { transform: rotate(-24deg); } }
@keyframes mta-baile { 0%,100% { transform: translate(0,0) rotate(0); } 25% { transform: translate(-24px,8px) rotate(-8deg) scale(1.03,.96); } 50% { transform: translate(0,-18px) rotate(0) scale(.97,1.04); } 75% { transform: translate(24px,8px) rotate(8deg) scale(1.03,.96); } }
@keyframes mta-baile-sombra { 0%,50%,100% { transform: translateX(0) scale(1); } 25% { transform: translateX(-24px) scale(1.05); } 75% { transform: translateX(24px) scale(1.05); } }
@keyframes mta-baile-brazo-i { 0%,50%,100% { transform: rotate(8deg); } 25% { transform: rotate(48deg); } 75% { transform: rotate(18deg); } }
@keyframes mta-baile-brazo-d { 0%,50%,100% { transform: rotate(-8deg); } 25% { transform: rotate(-18deg); } 75% { transform: rotate(-48deg); } }
@keyframes mta-baile-cabeza { from { transform: rotate(-9deg); } to { transform: rotate(9deg); } }
@keyframes mta-mece { 0%,100% { transform: translateX(-6px) rotate(-4deg); } 50% { transform: translateX(6px) rotate(4deg); } }
@keyframes mta-canta-cabeza { 0%,100% { transform: rotate(-5deg) translateY(0); } 50% { transform: rotate(-11deg) translateY(-8px); } }
@keyframes mta-canta-brazo { 0%,100% { transform: rotate(-30deg); } 50% { transform: rotate(-50deg); } }
@keyframes mta-canta-pecho { 0%,100% { transform: rotate(10deg); } 50% { transform: rotate(20deg); } }
@keyframes mta-saltito { 0% { transform: translateY(0) scale(1.08,.9); } 15% { transform: translateY(0) scale(.95,1.07); } 50% { transform: translateY(-46px) scale(.99,1.02); } 85% { transform: translateY(0) scale(1,1); } 100% { transform: translateY(0) scale(1.08,.9); } }
@keyframes mta-brinco { 0%,55%,100% { transform: translateY(0) scale(1,1); } 62% { transform: translateY(0) scale(1.07,.92); } 75% { transform: translateY(-40px) scale(.97,1.04); } 88% { transform: translateY(0) scale(1.06,.93); } 94% { transform: translateY(0) scale(1,1); } }
@keyframes mta-sombra-brinco { 0%,62%,88%,100% { transform: scale(1); opacity: .28; } 75% { transform: scale(.7); opacity: .14; } }
@keyframes mta-saludo { 0%,50%,100% { transform: rotate(-30deg); } 25%,75% { transform: rotate(-58deg); } }
@keyframes mta-micro { 0%,100% { transform: rotate(-40deg); } 50% { transform: rotate(-46deg); } }
@keyframes mta-trofeo { 0%,100% { transform: rotate(40deg); } 50% { transform: rotate(48deg); } }
@keyframes mta-brilla { 0%,100% { transform: rotate(-4deg) scale(1); } 50% { transform: rotate(4deg) scale(1.08); } }
@keyframes mta-birrete { 0%,8% { transform: translateY(0) rotate(0); } 45% { transform: translateY(-230px) rotate(-200deg); } 52% { transform: translateY(-245px) rotate(-260deg); } 88% { transform: translateY(0) rotate(-360deg); } 92% { transform: translateY(5px) rotate(-360deg) scale(1.06,.94); } 100% { transform: translateY(0) rotate(-360deg); } }
@keyframes mta-lanza-i { 0%,100% { transform: rotate(8deg); } 20%,40% { transform: rotate(46deg); } 70% { transform: rotate(14deg); } }
@keyframes mta-lanza-d { 0%,100% { transform: rotate(-8deg); } 20%,40% { transform: rotate(-46deg); } 70% { transform: rotate(-14deg); } }
@keyframes mta-sopla { 0%,100% { transform: rotate(-36deg); } 50% { transform: rotate(-44deg); } }
@keyframes mta-cornetin { 0%,100% { transform: scale(.82,1); } 40%,60% { transform: scale(1.12,1.04); } }
@keyframes mta-sostiene { 0%,100% { transform: rotate(28deg); } 50% { transform: rotate(34deg); } }
@keyframes mta-flota { 0%,100% { transform: rotate(-5deg) translateY(0); } 50% { transform: rotate(5deg) translateY(-6px); } }
@keyframes mta-agita-d { from { transform: rotate(-30deg); } to { transform: rotate(-44deg); } }
@keyframes mta-agita-i { from { transform: rotate(26deg); } to { transform: rotate(40deg); } }
@keyframes mta-maraca { from { transform: rotate(-10deg); } to { transform: rotate(10deg); } }
@keyframes mta-ondea-bandera { from { transform: rotate(-8deg) skewY(-3deg); } to { transform: rotate(8deg) skewY(3deg); } }
@keyframes mta-nota { 0% { transform: translate(0,0) rotate(-12deg) scale(.3); opacity: 0; } 15% { transform: translate(12px,-26px) rotate(8deg) scale(1); opacity: 1; } 50% { transform: translate(-14px,-100px) rotate(-8deg) scale(1); } 85% { opacity: 1; } 100% { transform: translate(16px,-190px) rotate(12deg) scale(.85); opacity: 0; } }
@keyframes mta-corazon { 0% { transform: translateY(0) scale(0); opacity: 0; } 15% { transform: translateY(-6px) scale(1.25); opacity: 1; } 28% { transform: translateY(-14px) scale(1); } 80% { opacity: 1; } 100% { transform: translateY(-130px) scale(.85); opacity: 0; } }
@keyframes mta-estrella { 0%,100% { transform: scale(0) rotate(0); opacity: 0; } 45% { transform: scale(1.25) rotate(80deg); opacity: 1; } 70% { transform: scale(1) rotate(130deg); opacity: 1; } }
@keyframes mta-chispa { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(-120px); opacity: 0; } }`;

/** Mete el estilo una sola vez en la página (no hace nada fuera del navegador). */
export function asegurarEstiloMarioneta() {
  if (typeof document === "undefined" || document.getElementById("mta-estilo")) return;
  const st = document.createElement("style");
  st.id = "mta-estilo";
  st.textContent = ESTILO_MARIONETA;
  document.head.appendChild(st);
}
