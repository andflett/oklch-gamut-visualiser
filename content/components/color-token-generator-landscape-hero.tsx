"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { generateLandscapeMesh } from "./oklch-gamut-landscape";

const CARD_SHADOW = `
  0 1px 2px rgba(0, 0, 0, 0.3),
  0 2px 4px rgba(0, 0, 0, 0.25),
  0 4px 8px rgba(0, 0, 0, 0.2),
  0 8px 16px rgba(0, 0, 0, 0.15)
`;

// Pre-compute mesh data at module level (runs once on import)
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
    <div
      className="w-full h-full flex items-center justify-center p-8"
      style={{ backgroundColor: "#324158" }}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        style={{
          boxShadow: CARD_SHADOW,
          aspectRatio: "5 / 4",
        }}
      >
        <Canvas
          camera={{
            position: [1.5, 0.9, 1.2],
            fov: 50,
            near: 0.1,
            far: 10,
          }}
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: true,
          }}
          style={{ background: "transparent" }}
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
      </div>
    </div>
  );
}
