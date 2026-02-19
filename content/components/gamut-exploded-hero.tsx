"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { generateLandscapeMesh } from "./oklch-gamut-landscape";

const meshData = generateLandscapeMesh();

// Split vertices into hue bands and offset each band along Z
const BAND_COUNT = 8;
const GAP = 0.06; // gap between bands in Z

// Assign each vertex to a hue band based on its Z (hue) coordinate
const bandAssignment = new Int32Array(meshData.positions.length / 3);
const totalVerts = meshData.positions.length / 3;
for (let i = 0; i < totalVerts; i++) {
  const hue = meshData.rawCoords[i][2]; // 0-1
  bandAssignment[i] = Math.min(BAND_COUNT - 1, Math.floor(hue * BAND_COUNT));
}

// Build exploded positions: shift each band's Z by its band index * gap
const explodedPositions = new Float32Array(meshData.positions.length);
for (let i = 0; i < totalVerts; i++) {
  const band = bandAssignment[i];
  explodedPositions[i * 3] = meshData.positions[i * 3];
  explodedPositions[i * 3 + 1] = meshData.positions[i * 3 + 1];
  explodedPositions[i * 3 + 2] = meshData.positions[i * 3 + 2] + band * GAP;
}

// Filter indices: only keep triangles where all 3 verts are in the same band
const filteredIndices: number[] = [];
for (let i = 0; i < meshData.indices.length; i += 3) {
  const a = meshData.indices[i];
  const b = meshData.indices[i + 1];
  const c = meshData.indices[i + 2];
  if (bandAssignment[a] === bandAssignment[b] && bandAssignment[b] === bandAssignment[c]) {
    filteredIndices.push(a, b, c);
  }
}

function ExplodedGamut() {
  const geometry = React.useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(explodedPositions, 3)
    );
    geo.setAttribute("color", new THREE.BufferAttribute(meshData.colors, 3));
    geo.setIndex(filteredIndices);
    geo.center();
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} position={[0, 0.1, 0]}>
      <meshBasicMaterial
        vertexColors
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function GamutExplodedHero() {
  return (
    <Canvas
      camera={{
        position: [1.2, 0.7, 1.8],
        fov: 50,
        near: 0.1,
        far: 10,
      }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent", width: "100%", height: "100%" }}
    >
      <ExplodedGamut />
      <OrbitControls
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.12}
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.0}
      />
    </Canvas>
  );
}
