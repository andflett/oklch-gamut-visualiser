import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { PerspectiveCamera } from "three";

const BASE_FOV = 50;
const PORTRAIT_FOV = 72;
const BREAKPOINT = 1; // aspect ratio threshold

/**
 * Place inside <Canvas> to widen FOV on portrait / narrow viewports
 * so the scene isn't cropped on mobile.
 */
export function ResponsiveFov() {
  const { camera, size } = useThree();

  useEffect(() => {
    const aspect = size.width / size.height;
    const fov = aspect < BREAKPOINT ? PORTRAIT_FOV : BASE_FOV;
    if (camera instanceof PerspectiveCamera) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }, [camera, size]);

  return null;
}
