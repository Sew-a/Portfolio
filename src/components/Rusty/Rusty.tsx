import { Canvas } from "@react-three/fiber";
import RustyModel from "./RustyModel";
import type { RustyProps } from "./types";

/** Rusty, the robot from the rusty-companion project, live in 3D with his clips, poses and canvas face. */
export default function Rusty({
  mood,
  clip = null,
  facing = 0,
  viewHeight = 3.2,
  className,
  onLoad,
  onClipEnd,
}: RustyProps) {
  return (
    <Canvas className={className} flat dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
      <RustyModel
        mood={mood}
        clip={clip}
        facing={facing}
        viewHeight={viewHeight}
        onLoad={onLoad}
        onClipEnd={onClipEnd}
      />
    </Canvas>
  );
}
