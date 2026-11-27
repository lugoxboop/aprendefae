import { registerRoot, Composition } from "remotion";
import * as a1 from "./videos/a1/Video.jsx";
import * as a2 from "./videos/a2/Video.jsx";
import * as a3 from "./videos/a3/Video.jsx";
import * as a4 from "./videos/a4/Video.jsx";
import * as a5 from "./videos/a5/Video.jsx";
import * as a6 from "./videos/a6/Video.jsx";
import * as b1 from "./videos/b1/Video.jsx";
import * as b2 from "./videos/b2/Video.jsx";
import * as b3 from "./videos/b3/Video.jsx";
import * as gp01 from "./videos/gp01/Video.jsx";
import * as gp02 from "./videos/gp02/Video.jsx";
import * as gp03 from "./videos/gp03/Video.jsx";
import * as gp04 from "./videos/gp04/Video.jsx";
import { Pia } from "./retratos/Pia.jsx";
const FPS = 30;
const V = [["A1", a1.A1, a1.DURACION], ["A2", a2.A2, a2.DURACION], ["A3", a3.A3, a3.DURACION], ["A4", a4.A4, a4.DURACION], ["A5", a5.A5, a5.DURACION], ["A6", a6.A6, a6.DURACION], ["B1", b1.B1, b1.DURACION], ["B2", b2.B2, b2.DURACION], ["B3", b3.B3, b3.DURACION], ["GP01", gp01.GP01, gp01.DURACION], ["GP02", gp02.GP02, gp02.DURACION], ["GP03", gp03.GP03, gp03.DURACION], ["GP04", gp04.GP04, gp04.DURACION]];
const Root = () => (<>{V.map(([id, C, d]) => (
  <Composition key={id} id={id} component={C} durationInFrames={Math.round(d * FPS)} fps={FPS} width={1080} height={1920} defaultProps={{ sinSonido: false }} />
))}
  <Composition id="PiaRetrato" component={Pia} durationInFrames={1} fps={FPS} width={600} height={800} defaultProps={{ pose: "tranquila" }} />
</>);
registerRoot(Root);
