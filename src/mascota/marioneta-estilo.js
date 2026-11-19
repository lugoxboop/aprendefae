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
.mta .mta-cara, .mta .mta-aura, .mta .mta-fuego, .mta .mta-confeti { display: none; }
.mta-quieta .mta-c-tranquila, .mta-tranquila .mta-c-tranquila,
.mta-feliz .mta-c-feliz, .mta-celebra .mta-c-feliz,
.mta-triste .mta-c-triste, .mta-racha .mta-c-racha { display: inline; }

/* Bisagras: dónde gira cada pieza */
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
.mta-feliz .mta-acc-alas, .mta-celebra .mta-acc-alas { animation: mta-aleteo .35s ease-in-out infinite; }
.mta-tranquila .mta-acc-capa { animation: mta-ondea 3.2s ease-in-out infinite; }
.mta-feliz .mta-acc-capa, .mta-celebra .mta-acc-capa, .mta-racha .mta-acc-capa { animation: mta-ondea .9s ease-in-out infinite; }
.mta-tranquila .mta-acc-medalla { animation: mta-pendulo 3.2s ease-in-out infinite; }
.mta-feliz .mta-acc-medalla, .mta-celebra .mta-acc-medalla { animation: mta-pendulo .9s ease-in-out infinite; }
.mta-feliz .mta-acc-jetpack, .mta-celebra .mta-acc-jetpack, .mta-racha .mta-acc-jetpack { animation: mta-motor .18s linear infinite alternate; }

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
@keyframes mta-brazo-arriba-i { 0%,100% { transform: rotate(40deg); } 50% { transform: rotate(150deg); } }
@keyframes mta-brazo-arriba-d { 0%,100% { transform: rotate(-40deg); } 50% { transform: rotate(-150deg); } }
@keyframes mta-brazos-v-i { from { transform: rotate(140deg); } to { transform: rotate(165deg); } }
@keyframes mta-brazos-v-d { from { transform: rotate(-140deg); } to { transform: rotate(-165deg); } }
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
@keyframes mta-chispa { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(-120px); opacity: 0; } }`;

/** Mete el estilo una sola vez en la página (no hace nada fuera del navegador). */
export function asegurarEstiloMarioneta() {
  if (typeof document === "undefined" || document.getElementById("mta-estilo")) return;
  const st = document.createElement("style");
  st.id = "mta-estilo";
  st.textContent = ESTILO_MARIONETA;
  document.head.appendChild(st);
}
