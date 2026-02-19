"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Info, Move } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { generateLandscapeMesh } from "./oklch-gamut-landscape";

const CARD_SHADOW = `
  0 1px 2px rgba(0, 0, 0, 0.3),
  0 2px 4px rgba(0, 0, 0, 0.25),
  0 4px 8px rgba(0, 0, 0, 0.2),
  0 8px 16px rgba(0, 0, 0, 0.15)
`;

// Pre-compute mesh data at module level
const meshData = generateLandscapeMesh();

function MixedGamutSurface() {
  const { meshGeo, pointsGeo } = React.useMemo(() => {
    // Solid mesh geometry (with indices for triangulated surface)
    const mGeo = new THREE.BufferGeometry();
    mGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(meshData.positions, 3)
    );
    mGeo.setAttribute("color", new THREE.BufferAttribute(meshData.colors, 3));
    mGeo.setIndex(Array.from(meshData.indices));
    mGeo.center();
    mGeo.computeVertexNormals();

    // Point cloud geometry (same data, no indices)
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(meshData.positions, 3)
    );
    pGeo.setAttribute("color", new THREE.BufferAttribute(meshData.colors, 3));
    pGeo.center();

    return { meshGeo: mGeo, pointsGeo: pGeo };
  }, []);

  return (
    <group position={[0, 0.1, 0]}>
      <mesh geometry={meshGeo}>
        <meshBasicMaterial
          vertexColors
          side={THREE.DoubleSide}
          transparent
          opacity={0.3}
        />
      </mesh>
      <points geometry={pointsGeo}>
        <pointsMaterial vertexColors size={0.002} sizeAttenuation />
      </points>
    </group>
  );
}

export function ColorTokenGeneratorMixedHero() {
  return (
    <div
      className="w-full h-full flex items-center justify-center p-3 md:p-8"
      style={{ backgroundColor: "#324158" }}
    >
      <div
        className="relative bg-slate-900 rounded-xl border border-slate-700 overflow-hidden h-[80%]"
        style={{
          boxShadow: CARD_SHADOW,
          aspectRatio: "1 / 1",
        }}
      >
        <Canvas
          camera={{
            position: [1, 0.5, 1.7],
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
          <MixedGamutSurface />
          <OrbitControls
            target={[0, -0.02, 0]}
            enableDamping
            dampingFactor={0.12}
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={-1.5}
          />
        </Canvas>

        <Popover>
          <PopoverTrigger asChild>
            <button
              className="cursor-pointer absolute bottom-2 right-2 p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
              aria-label="About this visualization"
            >
              <Info size={16} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="end"
            className="max-w-xs text-sm border-none rounded-sm shadow-xl"
          >
            <p className="font-medium mb-1">OKLCH Gamut Landscape</p>
            <p className="">
              A 3D visualization of the OKLCH color space gamut boundary,
              showing the full range of colors displayable on screen mapped
              across lightness, chroma, and hue axes.
            </p>
            <p className="flex mt-3 items-center gap-1.5 text-xs text-background/80">
              <Move size={12} />
              <span>Drag to rotate</span>
            </p>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
