"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { generateLandscapeMesh } from "./oklch-gamut-landscape";
import { ResponsiveFov } from "./responsive-fov";

const meshData = generateLandscapeMesh();

// Build heatmap colours based on chroma (Y coordinate = scaled chroma)
const heatmapColors = new Float32Array(meshData.colors.length);
const totalVerts = meshData.positions.length / 3;

for (let i = 0; i < totalVerts; i++) {
  const chroma = meshData.positions[i * 3 + 1]; // Y = chroma (0 to ~0.8)
  const t = Math.min(1, chroma / 0.7); // normalise to 0-1

  // Cool-to-hot gradient: deep blue → cyan → green → yellow → red → white
  let r: number, g: number, b: number;
  if (t < 0.2) {
    const s = t / 0.2;
    r = 0.05;
    g = 0.05 + s * 0.3;
    b = 0.3 + s * 0.4;
  } else if (t < 0.4) {
    const s = (t - 0.2) / 0.2;
    r = 0.05;
    g = 0.35 + s * 0.45;
    b = 0.7 - s * 0.4;
  } else if (t < 0.6) {
    const s = (t - 0.4) / 0.2;
    r = 0.05 + s * 0.85;
    g = 0.8 - s * 0.1;
    b = 0.3 - s * 0.25;
  } else if (t < 0.8) {
    const s = (t - 0.6) / 0.2;
    r = 0.9 + s * 0.1;
    g = 0.7 - s * 0.5;
    b = 0.05;
  } else {
    const s = (t - 0.8) / 0.2;
    r = 1.0;
    g = 0.2 + s * 0.8;
    b = s * 1.0;
  }

  // Convert to linear
  heatmapColors[i * 3] = Math.pow(r, 2.2);
  heatmapColors[i * 3 + 1] = Math.pow(g, 2.2);
  heatmapColors[i * 3 + 2] = Math.pow(b, 2.2);
}

function HeatmapGamut() {
  const geometry = React.useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(meshData.positions, 3)
    );
    geo.setAttribute(
      "color",
      new THREE.BufferAttribute(heatmapColors, 3)
    );
    geo.setIndex(Array.from(meshData.indices));
    geo.center();
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} position={[0, 0.1, 0]}>
      <meshBasicMaterial vertexColors side={THREE.DoubleSide} />
    </mesh>
  );
}

export function GamutHeatmapHero() {
  return (
    <Canvas
      camera={{
        position: [1, 0.5, 1.7],
        fov: 50,
        near: 0.1,
        far: 10,
      }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent", width: "100%", height: "100%" }}
    >
      <ResponsiveFov />
      <HeatmapGamut />
      <OrbitControls
        target={[0, -0.02, 0]}
        enableDamping
        dampingFactor={0.12}
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={-1.0}
      />
    </Canvas>
  );
}
