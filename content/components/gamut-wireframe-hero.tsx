"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { generateLandscapeMesh } from "./oklch-gamut-landscape";

const meshData = generateLandscapeMesh();

function WireframeGamut() {
  const geometry = React.useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(meshData.positions, 3)
    );
    geo.setAttribute("color", new THREE.BufferAttribute(meshData.colors, 3));
    geo.setIndex(Array.from(meshData.indices));
    geo.center();
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} position={[0, 0.1, 0]}>
      <meshBasicMaterial
        vertexColors
        wireframe
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

export function GamutWireframeHero() {
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
      <WireframeGamut />
      <OrbitControls
        target={[0, -0.02, 0]}
        enableDamping
        dampingFactor={0.12}
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={-1.2}
      />
    </Canvas>
  );
}
