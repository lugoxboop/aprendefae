import { registerRoot, Composition } from "remotion";
import { LeyDemanda, DURACION_S, FPS } from "./LeyDemanda.jsx";

const Root = () => (
  <Composition
    id="LeyDemanda"
    component={LeyDemanda}
    durationInFrames={Math.round(DURACION_S * FPS)}
    fps={FPS}
    width={1080}
    height={1920}
  />
);

registerRoot(Root);
