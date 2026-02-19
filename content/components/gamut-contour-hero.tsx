"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";
import { generateLandscapeMesh } from "./oklch-gamut-landscape";

const meshData = generateLandscapeMesh();

// Bucket vertices into lightness slices
const SLICE_COUNT = 16;
const sliceBuckets: { positions: number[]; colors: number[] }[] = Array.from(
  { length: SLICE_COUNT },
  () => ({ positions: [], colors: [] })
);

const totalVerts = meshData.positions.length / 3;
for (let i = 0; i < totalVerts; i++) {
  const l = meshData.rawCoords[i][0]; // lightness 0-1
  const bucket = Math.min(
    SLICE_COUNT - 1,
    Math.floor(l * SLICE_COUNT)
  );
  sliceBuckets[bucket].positions.push(
    meshData.positions[i * 3],
    meshData.positions[i * 3 + 1],
    meshData.positions[i * 3 + 2]
  );
  sliceBuckets[bucket].colors.push(
    meshData.colors[i * 3],
    meshData.colors[i * 3 + 1],
    meshData.colors[i * 3 + 2]
  );
}

// For each slice, sort points by hue (Z coord) to form a contour line
const sliceData = sliceBuckets
  .map((bucket) => {
    const count = bucket.positions.length / 3;
    if (count < 2) return null;

    const pts: { x: number; y: number; z: number; r: number; g: number; b: number }[] = [];
    for (let i = 0; i < count; i++) {
      pts.push({
        x: bucket.positions[i * 3],
        y: bucket.positions[i * 3 + 1],
        z: bucket.positions[i * 3 + 2],
        r: bucket.colors[i * 3],
        g: bucket.colors[i * 3 + 1],
        b: bucket.colors[i * 3 + 2],
      });
    }
    pts.sort((a, b) => a.z - b.z);

    const points: [number, number, number][] = pts.map((p) => [p.x, p.y, p.z]);
    const colors: [number, number, number][] = pts.map((p) => [p.r, p.g, p.b]);
    return { points, colors };
  })
  .filter((s): s is NonNullable<typeof s> => s !== null);

// Compute the center offset so we can manually center (Line doesn't support geo.center())
const allPoints = sliceData.flatMap((s) => s.points);
const center = new THREE.Vector3();
for (const [x, y, z] of allPoints) {
  center.x += x;
  center.y += y;
  center.z += z;
}
center.divideScalar(allPoints.length);

const centeredSliceData = sliceData.map((slice) => ({
  points: slice.points.map(
    ([x, y, z]) => [x - center.x, y - center.y, z - center.z] as [number, number, number]
  ),
  colors: slice.colors,
}));

function ContourSlices() {
  return (
    <group position={[0, 0.1, 0]}>
      {centeredSliceData.map((slice, i) => (
        <Line
          key={i}
          points={slice.points}
          vertexColors={slice.colors.map(
            ([r, g, b]) => new THREE.Color(r, g, b)
          )}
          lineWidth={1.5}
        />
      ))}
    </group>
  );
}

export function GamutContourHero() {
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
      <ContourSlices />
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
