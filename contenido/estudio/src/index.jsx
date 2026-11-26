import { registerRoot, Composition } from "remotion";
import * as p01 from "./piezas/prueba-01/Video.jsx";
import * as corr from "./piezas/corrientazo/Video.jsx";
import * as capa from "./piezas/capacitar/Video.jsx";
import * as subr from "./piezas/subrayar/Video.jsx";
import * as repa from "./piezas/repartir/Video.jsx";
import * as musi from "./piezas/musica/Video.jsx";
const FPS = 30;
const V = [["prueba-01", p01.Prueba01, p01.DURACION], ["corrientazo", corr.Corrientazo, corr.DURACION], ["capacitar", capa.Capacitar, capa.DURACION], ["subrayar", subr.Subrayar, subr.DURACION], ["repartir", repa.Repartir, repa.DURACION], ["musica", musi.Musica, musi.DURACION]];
const Root = () => (<>{V.map(([id, C, d]) => (
  <Composition key={id} id={id} component={C} durationInFrames={Math.round(d * FPS)} fps={FPS} width={1080} height={1920} defaultProps={{ sinSonido: false, zonas: false }} />
))}</>);
registerRoot(Root);
