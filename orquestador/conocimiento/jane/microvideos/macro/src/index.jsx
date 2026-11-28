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
import * as gp25 from "./videos/gp25/Video.jsx";
import * as gp26 from "./videos/gp26/Video.jsx";
import * as gp27 from "./videos/gp27/Video.jsx";
import * as gp28 from "./videos/gp28/Video.jsx";
import * as gp29 from "./videos/gp29/Video.jsx";
import * as gp30 from "./videos/gp30/Video.jsx";
import * as gp31 from "./videos/gp31/Video.jsx";
import * as gp32 from "./videos/gp32/Video.jsx";
import * as gp33 from "./videos/gp33/Video.jsx";
import * as gp34 from "./videos/gp34/Video.jsx";
import * as gp35 from "./videos/gp35/Video.jsx";
import * as gp36 from "./videos/gp36/Video.jsx";
import * as gp37 from "./videos/gp37/Video.jsx";
import * as gp38 from "./videos/gp38/Video.jsx";
import * as gp39 from "./videos/gp39/Video.jsx";
import * as gp40 from "./videos/gp40/Video.jsx";
import * as gp41 from "./videos/gp41/Video.jsx";
import * as gp42 from "./videos/gp42/Video.jsx";
import * as gp43 from "./videos/gp43/Video.jsx";
import * as gp44 from "./videos/gp44/Video.jsx";
import * as gp45 from "./videos/gp45/Video.jsx";
import * as gp46 from "./videos/gp46/Video.jsx";
import * as gp47 from "./videos/gp47/Video.jsx";
import * as gp48 from "./videos/gp48/Video.jsx";
import * as gp49 from "./videos/gp49/Video.jsx";
import * as gp50 from "./videos/gp50/Video.jsx";
import * as gp51 from "./videos/gp51/Video.jsx";
import * as gp52 from "./videos/gp52/Video.jsx";
import * as gp53 from "./videos/gp53/Video.jsx";
import * as gp54 from "./videos/gp54/Video.jsx";
import * as gp55 from "./videos/gp55/Video.jsx";
import * as gp56 from "./videos/gp56/Video.jsx";
import * as gp57 from "./videos/gp57/Video.jsx";
import * as gp58 from "./videos/gp58/Video.jsx";
import * as gp59 from "./videos/gp59/Video.jsx";
import * as gp60 from "./videos/gp60/Video.jsx";
import * as gp61 from "./videos/gp61/Video.jsx";
import * as gp62 from "./videos/gp62/Video.jsx";
import * as gp63 from "./videos/gp63/Video.jsx";
import * as gp64 from "./videos/gp64/Video.jsx";
import * as gp65 from "./videos/gp65/Video.jsx";
import * as gp66 from "./videos/gp66/Video.jsx";
import * as gp67 from "./videos/gp67/Video.jsx";
import * as gp68 from "./videos/gp68/Video.jsx";
import { Pia } from "./retratos/Pia.jsx";
const FPS = 30;
const V = [["A1", a1.A1, a1.DURACION], ["A2", a2.A2, a2.DURACION], ["A3", a3.A3, a3.DURACION], ["A4", a4.A4, a4.DURACION], ["A5", a5.A5, a5.DURACION], ["A6", a6.A6, a6.DURACION], ["B1", b1.B1, b1.DURACION], ["B2", b2.B2, b2.DURACION], ["B3", b3.B3, b3.DURACION], ["GP01", gp01.GP01, gp01.DURACION], ["GP02", gp02.GP02, gp02.DURACION], ["GP03", gp03.GP03, gp03.DURACION], ["GP04", gp04.GP04, gp04.DURACION], ["GP05", gp05.GP05, gp05.DURACION], ["GP06", gp06.GP06, gp06.DURACION], ["GP07", gp07.GP07, gp07.DURACION], ["GP08", gp08.GP08, gp08.DURACION], ["GP09", gp09.GP09, gp09.DURACION], ["GP10", gp10.GP10, gp10.DURACION], ["GP11", gp11.GP11, gp11.DURACION], ["GP12", gp12.GP12, gp12.DURACION], ["GP13", gp13.GP13, gp13.DURACION], ["GP14", gp14.GP14, gp14.DURACION], ["GP15", gp15.GP15, gp15.DURACION], ["GP16", gp16.GP16, gp16.DURACION], ["GP17", gp17.GP17, gp17.DURACION], ["GP18", gp18.GP18, gp18.DURACION], ["GP19", gp19.GP19, gp19.DURACION], ["GP20", gp20.GP20, gp20.DURACION], ["GP21", gp21.GP21, gp21.DURACION], ["GP22", gp22.GP22, gp22.DURACION], ["GP23", gp23.GP23, gp23.DURACION], ["GP24", gp24.GP24, gp24.DURACION], ["GP25", gp25.GP25, gp25.DURACION], ["GP26", gp26.GP26, gp26.DURACION], ["GP27", gp27.GP27, gp27.DURACION], ["GP28", gp28.GP28, gp28.DURACION], ["GP29", gp29.GP29, gp29.DURACION], ["GP30", gp30.GP30, gp30.DURACION], ["GP31", gp31.GP31, gp31.DURACION], ["GP32", gp32.GP32, gp32.DURACION], ["GP33", gp33.GP33, gp33.DURACION], ["GP34", gp34.GP34, gp34.DURACION], ["GP35", gp35.GP35, gp35.DURACION], ["GP36", gp36.GP36, gp36.DURACION], ["GP37", gp37.GP37, gp37.DURACION], ["GP38", gp38.GP38, gp38.DURACION], ["GP39", gp39.GP39, gp39.DURACION], ["GP40", gp40.GP40, gp40.DURACION], ["GP41", gp41.GP41, gp41.DURACION], ["GP42", gp42.GP42, gp42.DURACION], ["GP43", gp43.GP43, gp43.DURACION], ["GP44", gp44.GP44, gp44.DURACION], ["GP45", gp45.GP45, gp45.DURACION], ["GP46", gp46.GP46, gp46.DURACION], ["GP47", gp47.GP47, gp47.DURACION], ["GP48", gp48.GP48, gp48.DURACION], ["GP49", gp49.GP49, gp49.DURACION], ["GP50", gp50.GP50, gp50.DURACION], ["GP51", gp51.GP51, gp51.DURACION], ["GP52", gp52.GP52, gp52.DURACION],
  ["GP53", gp53.GP53, gp53.DURACION],
  ["GP54", gp54.GP54, gp54.DURACION],
  ["GP55", gp55.GP55, gp55.DURACION],
  ["GP56", gp56.GP56, gp56.DURACION],
  ["GP57", gp57.GP57, gp57.DURACION],
  ["GP58", gp58.GP58, gp58.DURACION],
  ["GP59", gp59.GP59, gp59.DURACION],
  ["GP60", gp60.GP60, gp60.DURACION],
  ["GP61", gp61.GP61, gp61.DURACION],
  ["GP62", gp62.GP62, gp62.DURACION],
  ["GP63", gp63.GP63, gp63.DURACION],
  ["GP64", gp64.GP64, gp64.DURACION],
  ["GP65", gp65.GP65, gp65.DURACION],
  ["GP66", gp66.GP66, gp66.DURACION],
  ["GP67", gp67.GP67, gp67.DURACION],
  ["GP68", gp68.GP68, gp68.DURACION]];
const Root = () => (<>{V.map(([id, C, d]) => (
  <Composition key={id} id={id} component={C} durationInFrames={Math.round(d * FPS)} fps={FPS} width={1080} height={1920} defaultProps={{ sinSonido: false }} />
))}
  <Composition id="PiaRetrato" component={Pia} durationInFrames={1} fps={FPS} width={600} height={800} defaultProps={{ pose: "tranquila" }} />
</>);
registerRoot(Root);
