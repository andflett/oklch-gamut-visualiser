/**
 * OKLCH gamut landscape mesh — generates the sRGB gamut boundary surface
 * using the same approach as oklch.com's 3D model.
 *
 * Instead of the cylindrical representation, this creates a flat "mountain
 * range" landscape where:
 *   X = Lightness (0-1)
 *   Y = Chroma (height / elevation)
 *   Z = Hue (0-1, mapped from 0-360)
 *
 * The mesh is built by brute-force scanning the RGB cube edges and
 * triangulating with Delaunay on the L-H plane.
 *
 * Reference: https://oklch.com/?3d
 */

// @ts-ignore
import Delaunator from "delaunator";
import { converter } from "culori";

const toOklch = converter("oklch");

const C_MAX = 0.37;

// Boost saturation by pushing each channel away from the average
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

// Convert sRGB channel to linear RGB so Three.js color management produces correct output
function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function onGamutEdge(r: number, g: number, b: number): boolean {
  return r === 0 || g === 0 || b === 0 || r > 0.99 || g > 0.99 || b > 0.99;
}

export interface LandscapeMeshData {
  positions: Float32Array;
  colors: Float32Array;
  indices: Uint32Array;
  /** Raw coordinates: [lightness, chroma (scaled), hue (0-1)] per vertex */
  rawCoords: [number, number, number][];
  /** Raw sRGB vertex colours before boost/linearisation */
  rawColors: [number, number, number][];
}

export function generateLandscapeMesh(step = 0.01): LandscapeMeshData {
  const coords: [number, number, number][] = [];
  const vertColors: [number, number, number][] = [];

  // Brute-force scan of the RGB cube, keeping only gamut-edge points
  for (let r = 0; r <= 1; r += step) {
    for (let g = 0; g <= 1; g += step) {
      for (let b = 0; b <= 1; b += step) {
        if (onGamutEdge(r, g, b)) {
          const oklch = toOklch({ mode: "rgb", r, g, b });
          if (oklch && oklch.h !== undefined && !isNaN(oklch.h)) {
            coords.push([
              oklch.l,                  // X = lightness
              (oklch.c / C_MAX) * 0.8,  // Y = chroma (scaled up for height)
              oklch.h / 360,            // Z = hue (normalized)
            ]);
            vertColors.push([r, g, b]);
          }
        }
      }
    }
  }

  // Bounding corner vertices to close the triangulation at the base plane
  const bounds: [number, number, number][] = [
    [0, 0, 0],
    [0, 0, 1],
    [1, 0, 0],
    [1, 0, 1],
  ];
  for (const b of bounds) {
    coords.push(b);
    vertColors.push([b[0], b[0], b[0]]); // grayscale based on lightness
  }

  // Build typed arrays
  const totalVerts = coords.length;
  const positions = new Float32Array(totalVerts * 3);
  const colors = new Float32Array(totalVerts * 3);

  for (let i = 0; i < totalVerts; i++) {
    positions[i * 3] = coords[i][0];
    positions[i * 3 + 1] = coords[i][1];
    positions[i * 3 + 2] = coords[i][2];

    const [br, bg, bb] = boostSaturation(
      vertColors[i][0],
      vertColors[i][1],
      vertColors[i][2]
    );
    colors[i * 3] = srgbToLinear(br);
    colors[i * 3 + 1] = srgbToLinear(bg);
    colors[i * 3 + 2] = srgbToLinear(bb);
  }

  // Delaunay triangulation on X-Z plane (lightness × hue)
  const flatCoords = coords.map((c) => [c[0], c[2]]);
  const delaunay = Delaunator.from(flatCoords);
  const indices = new Uint32Array(delaunay.triangles);

  return { positions, colors, indices, rawCoords: coords, rawColors: vertColors };
}
