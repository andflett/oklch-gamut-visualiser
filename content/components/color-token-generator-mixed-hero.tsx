"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { generateLandscapeMesh } from "./oklch-gamut-landscape";
import { ResponsiveFov } from "./responsive-fov";

const meshData = generateLandscapeMesh();

function MixedGamutSurface() {
  const { meshGeo, pointsGeo } = React.useMemo(() => {
    const mGeo = new THREE.BufferGeometry();
    mGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(meshData.positions, 3)
    );
    mGeo.setAttribute("color", new THREE.BufferAttribute(meshData.colors, 3));
    mGeo.setIndex(Array.from(meshData.indices));
    mGeo.center();
    mGeo.computeVertexNormals();

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
  );
}
