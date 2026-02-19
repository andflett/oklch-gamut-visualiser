"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { generateLandscapeMesh } from "./oklch-gamut-landscape";
import { ResponsiveFov } from "./responsive-fov";

const meshData = generateLandscapeMesh();

const scatteredPositions = new Float32Array(meshData.positions.length);
for (let i = 0; i < meshData.positions.length; i += 3) {
  scatteredPositions[i] = meshData.positions[i] + (Math.random() - 0.5) * 0.03;
  scatteredPositions[i + 1] =
    meshData.positions[i + 1] + (Math.random() - 0.5) * 0.03;
  scatteredPositions[i + 2] =
    meshData.positions[i + 2] + (Math.random() - 0.5) * 0.03;
}

function ScatteredGamutCloud() {
  const geometry = React.useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(scatteredPositions, 3)
    );
    geo.setAttribute("color", new THREE.BufferAttribute(meshData.colors, 3));
    geo.center();
    return geo;
  }, []);

  return (
    <points geometry={geometry} position={[0, 0.1, 0]}>
      <pointsMaterial vertexColors size={0.005} sizeAttenuation />
    </points>
  );
}

export function ColorTokenGeneratorScatteredHero() {
  return (
    <Canvas
      camera={{
        position: [1.3, 0.9, 1.2],
        fov: 50,
        near: 0.1,
        far: 10,
      }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent", width: "100%", height: "100%" }}
    >
      <ResponsiveFov />
      <ScatteredGamutCloud />
      <OrbitControls
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.12}
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.5}
      />
    </Canvas>
  );
}
