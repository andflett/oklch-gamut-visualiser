"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { generateLandscapeMesh } from "./oklch-gamut-landscape";

const meshData = generateLandscapeMesh();

// Show cross-sections at fixed lightness values.
// Each slice is a band of points at a given L, revealing how maximum chroma
// varies dramatically by hue — yellows/greens peak much higher than blues.
const SLICES = [0.3, 0.5, 0.7, 0.85];
const BAND_WIDTH = 0.03; // how wide each lightness band is

const totalVerts = meshData.positions.length / 3;

interface SliceData {
  positions: Float32Array;
  colors: Float32Array;
  indices: number[];
}

const slices: SliceData[] = SLICES.map((targetL) => {
  // Find vertices within the lightness band
  const vertexMap = new Map<number, number>(); // original index -> new index
  const pos: number[] = [];
  const col: number[] = [];

  for (let i = 0; i < totalVerts; i++) {
    const l = meshData.rawCoords[i][0];
    if (Math.abs(l - targetL) <= BAND_WIDTH) {
      const newIdx = pos.length / 3;
      vertexMap.set(i, newIdx);
      pos.push(
        meshData.positions[i * 3],
        meshData.positions[i * 3 + 1],
        meshData.positions[i * 3 + 2]
      );
      col.push(
        meshData.colors[i * 3],
        meshData.colors[i * 3 + 1],
        meshData.colors[i * 3 + 2]
      );
    }
  }

  // Filter triangles where all 3 vertices are in this slice
  const indices: number[] = [];
  for (let i = 0; i < meshData.indices.length; i += 3) {
    const a = vertexMap.get(meshData.indices[i]);
    const b = vertexMap.get(meshData.indices[i + 1]);
    const c = vertexMap.get(meshData.indices[i + 2]);
    if (a !== undefined && b !== undefined && c !== undefined) {
      indices.push(a, b, c);
    }
  }

  return {
    positions: new Float32Array(pos),
    colors: new Float32Array(col),
    indices,
  };
});

function ConstantLightnessSlices() {
  const geometries = React.useMemo(() => {
    return slices.map((slice) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute(
        "position",
        new THREE.BufferAttribute(slice.positions, 3)
      );
      geo.setAttribute(
        "color",
        new THREE.BufferAttribute(slice.colors, 3)
      );
      if (slice.indices.length > 0) {
        geo.setIndex(slice.indices);
      }
      geo.center();
      geo.computeVertexNormals();
      return geo;
    });
  }, []);

  return (
    <group position={[0, 0.1, 0]}>
      {geometries.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshBasicMaterial
            vertexColors
            side={THREE.DoubleSide}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
    </group>
  );
}

export function GamutConstantLHero() {
  return (
    <Canvas
      camera={{
        position: [1.2, 0.8, 1.5],
        fov: 50,
        near: 0.1,
        far: 10,
      }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent", width: "100%", height: "100%" }}
    >
      <ConstantLightnessSlices />
      <OrbitControls
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.12}
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.2}
      />
    </Canvas>
  );
}
