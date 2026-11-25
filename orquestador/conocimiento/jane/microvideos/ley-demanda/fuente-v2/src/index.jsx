import { registerRoot, Composition } from "remotion";
import { ElMangoDeToby } from "./Video.jsx";
import { DURACION_S, FPS } from "./tiempo.js";

const Root = () => (
  <Composition id="ElMangoDeToby" component={ElMangoDeToby} durationInFrames={Math.round(DURACION_S * FPS)} fps={FPS} width={1080} height={1920} defaultProps={{ sinSonido: false }} />
);
registerRoot(Root);
