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
import * as gp05 from "./videos/gp05/Video.jsx";
import * as gp06 from "./videos/gp06/Video.jsx";
import * as gp07 from "./videos/gp07/Video.jsx";
import * as gp08 from "./videos/gp08/Video.jsx";
import * as gp09 from "./videos/gp09/Video.jsx";
import * as gp10 from "./videos/gp10/Video.jsx";
import * as gp11 from "./videos/gp11/Video.jsx";
import * as gp12 from "./videos/gp12/Video.jsx";
import * as gp13 from "./videos/gp13/Video.jsx";
import * as gp14 from "./videos/gp14/Video.jsx";
import * as gp15 from "./videos/gp15/Video.jsx";
import * as gp16 from "./videos/gp16/Video.jsx";
import * as gp17 from "./videos/gp17/Video.jsx";
import * as gp18 from "./videos/gp18/Video.jsx";
import * as gp19 from "./videos/gp19/Video.jsx";
import * as gp20 from "./videos/gp20/Video.jsx";
import * as gp21 from "./videos/gp21/Video.jsx";
import * as gp22 from "./videos/gp22/Video.jsx";
import * as gp23 from "./videos/gp23/Video.jsx";
import * as gp24 from "./videos/gp24/Video.jsx";
import { Pia } from "./retratos/Pia.jsx";
const FPS = 30;
const V = [["A1", a1.A1, a1.DURACION], ["A2", a2.A2, a2.DURACION], ["A3", a3.A3, a3.DURACION], ["A4", a4.A4, a4.DURACION], ["A5", a5.A5, a5.DURACION], ["A6", a6.A6, a6.DURACION], ["B1", b1.B1, b1.DURACION], ["B2", b2.B2, b2.DURACION], ["B3", b3.B3, b3.DURACION], ["GP01", gp01.GP01, gp01.DURACION], ["GP02", gp02.GP02, gp02.DURACION], ["GP03", gp03.GP03, gp03.DURACION], ["GP04", gp04.GP04, gp04.DURACION], ["GP05", gp05.GP05, gp05.DURACION], ["GP06", gp06.GP06, gp06.DURACION], ["GP07", gp07.GP07, gp07.DURACION], ["GP08", gp08.GP08, gp08.DURACION], ["GP09", gp09.GP09, gp09.DURACION], ["GP10", gp10.GP10, gp10.DURACION], ["GP11", gp11.GP11, gp11.DURACION], ["GP12", gp12.GP12, gp12.DURACION], ["GP13", gp13.GP13, gp13.DURACION], ["GP14", gp14.GP14, gp14.DURACION], ["GP15", gp15.GP15, gp15.DURACION], ["GP16", gp16.GP16, gp16.DURACION], ["GP17", gp17.GP17, gp17.DURACION], ["GP18", gp18.GP18, gp18.DURACION], ["GP19", gp19.GP19, gp19.DURACION], ["GP20", gp20.GP20, gp20.DURACION], ["GP21", gp21.GP21, gp21.DURACION], ["GP22", gp22.GP22, gp22.DURACION], ["GP23", gp23.GP23, gp23.DURACION], ["GP24", gp24.GP24, gp24.DURACION]];
const Root = () => (<>{V.map(([id, C, d]) => (
  <Composition key={id} id={id} component={C} durationInFrames={Math.round(d * FPS)} fps={FPS} width={1080} height={1920} defaultProps={{ sinSonido: false }} />
))}
  <Composition id="PiaRetrato" component={Pia} durationInFrames={1} fps={FPS} width={600} height={800} defaultProps={{ pose: "tranquila" }} />
</>);
registerRoot(Root);
