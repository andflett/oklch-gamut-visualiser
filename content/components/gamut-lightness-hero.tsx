"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { generateLandscapeMesh } from "./oklch-gamut-landscape";
import { ResponsiveFov } from "./responsive-fov";

const meshData = generateLandscapeMesh();

// Colour each vertex purely by its lightness value (L), ignoring hue and chroma.
// This produces a black-to-white gradient that shows how OKLCH's perceptual
// lightness axis is independent of colour.
const lightnessColors = new Float32Array(meshData.colors.length);
const totalVerts = meshData.positions.length / 3;
for (let i = 0; i < totalVerts; i++) {
  const l = meshData.rawCoords[i][0]; // lightness 0-1
  // Convert to linear for Three.js colour management
  const linear = Math.pow(l, 2.2);
  lightnessColors[i * 3] = linear;
  lightnessColors[i * 3 + 1] = linear;
  lightnessColors[i * 3 + 2] = linear;
}

function LightnessGamut() {
  const geometry = React.useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(meshData.positions, 3)
    );
    geo.setAttribute(
      "color",
      new THREE.BufferAttribute(lightnessColors, 3)
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

export function GamutLightnessHero() {
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
      <LightnessGamut />
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
