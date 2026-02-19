"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { generateLandscapeMesh } from "./oklch-gamut-landscape";

const meshData = generateLandscapeMesh();

// Subsample to ~every 3rd point for a more spaced-out look
const stride = 3;
const totalOriginal = meshData.positions.length / 3;
const sampledCount = Math.ceil(totalOriginal / stride);
const sampledPositions = new Float32Array(sampledCount * 3);
const sampledColors = new Float32Array(sampledCount * 3);
let si = 0;
for (let i = 0; i < totalOriginal; i += stride) {
  sampledPositions[si * 3] = meshData.positions[i * 3];
  sampledPositions[si * 3 + 1] = meshData.positions[i * 3 + 1];
  sampledPositions[si * 3 + 2] = meshData.positions[i * 3 + 2];
  sampledColors[si * 3] = meshData.colors[i * 3];
  sampledColors[si * 3 + 1] = meshData.colors[i * 3 + 1];
  sampledColors[si * 3 + 2] = meshData.colors[i * 3 + 2];
  si++;
}

function LandscapeGamutCloud() {
  const geometry = React.useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(sampledPositions, 3)
    );
    geo.setAttribute("color", new THREE.BufferAttribute(sampledColors, 3));
    geo.center();
    return geo;
  }, []);

  return (
    <points geometry={geometry} position={[0, 0.1, 0]}>
      <pointsMaterial vertexColors size={0.012} sizeAttenuation />
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
