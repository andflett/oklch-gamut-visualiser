"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { generateLandscapeMesh } from "./oklch-gamut-landscape";
import { ResponsiveFov } from "./responsive-fov";

// Generate both sRGB and P3 gamut meshes.
// The P3 gamut extends further in chroma for saturated reds, greens, and cyans.
const srgbData = generateLandscapeMesh(0.02);

// For Display P3, we scan the P3 cube edges and convert through OKLCH.
// We approximate P3 by using the wider range: P3 primaries in linear light
// are a superset of sRGB, so the gamut boundary is further out in chroma.
import { converter } from "culori";

const toOklch = converter("oklch");

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function boostSaturation(
  r: number,
  g: number,
  b: number,
  amount = 0.15
): [number, number, number] {
  const avg = (r + g + b) / 3;
  return [
    Math.min(1, Math.max(0, avg + (r - avg) * (1 + amount))),
    Math.min(1, Math.max(0, avg + (g - avg) * (1 + amount))),
    Math.min(1, Math.max(0, avg + (b - avg) * (1 + amount))),
  ];
}

const C_MAX = 0.37;

function onEdge(r: number, g: number, b: number): boolean {
  return r === 0 || g === 0 || b === 0 || r > 0.99 || g > 0.99 || b > 0.99;
}

// Generate P3 gamut boundary using Display P3 colour space
function generateP3Mesh(step = 0.02) {
  const coords: [number, number, number][] = [];
  const vertColors: [number, number, number][] = [];

  for (let r = 0; r <= 1; r += step) {
    for (let g = 0; g <= 1; g += step) {
      for (let b = 0; b <= 1; b += step) {
        if (onEdge(r, g, b)) {
          // Use Display P3 colour space
          const oklch = toOklch({ mode: "p3", r, g, b });
          if (oklch && oklch.h !== undefined && !isNaN(oklch.h)) {
            coords.push([
              oklch.l,
              (oklch.c / C_MAX) * 0.8,
              oklch.h / 360,
            ]);
            vertColors.push([r, g, b]);
          }
        }
      }
    }
  }

  const totalVerts = coords.length;
  const positions = new Float32Array(totalVerts * 3);
  const colors = new Float32Array(totalVerts * 3);

  for (let i = 0; i < totalVerts; i++) {
    positions[i * 3] = coords[i][0];
    positions[i * 3 + 1] = coords[i][1];
    positions[i * 3 + 2] = coords[i][2];

    // Tint P3-only colours with a subtle cyan/green to distinguish
    const [br, bg, bb] = boostSaturation(
      vertColors[i][0],
      vertColors[i][1],
      vertColors[i][2]
    );
    colors[i * 3] = srgbToLinear(br);
    colors[i * 3 + 1] = srgbToLinear(bg);
    colors[i * 3 + 2] = srgbToLinear(bb);
  }

  return { positions, colors };
}

const p3Data = generateP3Mesh();

function P3vsSRGBGamut() {
  const { srgbGeo, p3Geo } = React.useMemo(() => {
    // sRGB as semi-transparent surface
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(srgbData.positions, 3)
    );
    sGeo.setAttribute("color", new THREE.BufferAttribute(srgbData.colors, 3));
    sGeo.setIndex(Array.from(srgbData.indices));
    sGeo.center();
    sGeo.computeVertexNormals();

    // P3 as point cloud extending beyond
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(p3Data.positions, 3)
    );
    pGeo.setAttribute("color", new THREE.BufferAttribute(p3Data.colors, 3));
    pGeo.center();

    return { srgbGeo: sGeo, p3Geo: pGeo };
  }, []);

  return (
    <group position={[0, 0.1, 0]}>
      {/* sRGB inner gamut — semi-transparent solid */}
      <mesh geometry={srgbGeo}>
        <meshBasicMaterial
          vertexColors
          side={THREE.DoubleSide}
          transparent
          opacity={0.25}
        />
      </mesh>
      {/* P3 outer gamut — point cloud showing the extended range */}
      <points geometry={p3Geo}>
        <pointsMaterial vertexColors size={0.004} sizeAttenuation />
      </points>
    </group>
  );
}

export function GamutP3Hero() {
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
      <P3vsSRGBGamut />
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
