"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { generateLandscapeMesh } from "./oklch-gamut-landscape";

const meshData = generateLandscapeMesh();

function LandscapeGamutCloud() {
  const geometry = React.useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(meshData.positions, 3)
    );
    geo.setAttribute("color", new THREE.BufferAttribute(meshData.colors, 3));
    geo.center();
    return geo;
  }, []);

  return (
    <points geometry={geometry} position={[0, 0.1, 0]}>
      <pointsMaterial vertexColors size={0.006} sizeAttenuation />
    </points>
  );
}

export function ColorTokenGeneratorLandscapeHero() {
  return (
    <Canvas
      camera={{
        position: [1.5, 0.9, 1.2],
        fov: 50,
        near: 0.1,
        far: 10,
      }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent", width: "100%", height: "100%" }}
    >
      <LandscapeGamutCloud />
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
