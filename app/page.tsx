"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Info, Move, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

const VIEWS = [
  {
    key: "surface",
    label: "Surface",
    description:
      "The sRGB gamut boundary rendered as a translucent triangulated surface with a point cloud overlay. The shape of this landscape reveals how the maximum achievable chroma varies across hue and lightness.",
  },
  {
    key: "scattered",
    label: "Scattered",
    description:
      "Each gamut-edge sample randomly offset from the surface, creating a cloud of colour particles. The density of points shows where the gamut boundary is densely sampled by the brute-force RGB scan.",
  },
  {
    key: "wireframe",
    label: "Wireframe",
    description:
      "The Delaunay triangulation edges that form the gamut surface. This shows the underlying mesh structure, triangulated on the lightness-hue plane with chroma as the elevation.",
  },
  {
    key: "heatmap",
    label: "Heatmap",
    description:
      "The gamut surface coloured by chroma intensity rather than the actual colour. Blue regions have low chroma (near grey), while red and white peaks show where sRGB can produce the most saturated colours.",
  },
  {
    key: "lightness",
    label: "Lightness",
    description:
      "The surface coloured solely by its OKLCH lightness value (L), from black to white. This demonstrates how OKLCH cleanly separates perceived brightness from hue and chroma, a key advantage over HSL.",
  },
  {
    key: "constantL",
    label: "L Slices",
    description:
      "Cross-sections at fixed lightness levels (L = 0.3, 0.5, 0.7, 0.85). At any given brightness, the maximum chroma varies dramatically by hue. Yellows and greens peak much higher than blues and purples.",
  },
  {
    key: "p3",
    label: "P3 vs sRGB",
    description:
      "The sRGB gamut (translucent surface) overlaid with the Display P3 gamut (outer point cloud). The points extending beyond the surface are colours only reachable on wide-gamut displays, particularly vivid reds, greens, and cyans.",
  },
  {
    key: "solid",
    label: "Solid",
    description:
      "The gamut boundary as an opaque surface coloured by the actual sRGB values at each point. This is the most direct representation of what the full range of displayable colours looks like in OKLCH coordinates.",
  },
] as const;

type ViewKey = (typeof VIEWS)[number]["key"];

function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Loader2 className="size-5 text-slate-500 animate-spin" />
    </div>
  );
}

const ColorTokenGeneratorScatteredHero = dynamic(
  () =>
    import(
      "@/content/components/color-token-generator-scattered-hero"
    ).then((m) => m.ColorTokenGeneratorScatteredHero),
  { ssr: false, loading: LoadingSpinner }
);

const ColorTokenGeneratorMixedHero = dynamic(
  () =>
    import(
      "@/content/components/color-token-generator-mixed-hero"
    ).then((m) => m.ColorTokenGeneratorMixedHero),
  { ssr: false, loading: LoadingSpinner }
);

const ColorTokenGeneratorSolidHero = dynamic(
  () =>
    import(
      "@/content/components/color-token-generator-solid-hero"
    ).then((m) => m.ColorTokenGeneratorSolidHero),
  { ssr: false, loading: LoadingSpinner }
);

const GamutWireframeHero = dynamic(
  () =>
    import("@/content/components/gamut-wireframe-hero").then(
      (m) => m.GamutWireframeHero
    ),
  { ssr: false, loading: LoadingSpinner }
);

const GamutHeatmapHero = dynamic(
  () =>
    import("@/content/components/gamut-heatmap-hero").then(
      (m) => m.GamutHeatmapHero
    ),
  { ssr: false, loading: LoadingSpinner }
);

const GamutLightnessHero = dynamic(
  () =>
    import("@/content/components/gamut-lightness-hero").then(
      (m) => m.GamutLightnessHero
    ),
  { ssr: false, loading: LoadingSpinner }
);

const GamutConstantLHero = dynamic(
  () =>
    import("@/content/components/gamut-constant-l-hero").then(
      (m) => m.GamutConstantLHero
    ),
  { ssr: false, loading: LoadingSpinner }
);

const GamutP3Hero = dynamic(
  () =>
    import("@/content/components/gamut-p3-hero").then(
      (m) => m.GamutP3Hero
    ),
  { ssr: false, loading: LoadingSpinner }
);

const viewComponents: Record<ViewKey, React.ComponentType> = {
  surface: ColorTokenGeneratorMixedHero,
  scattered: ColorTokenGeneratorScatteredHero,
  wireframe: GamutWireframeHero,
  heatmap: GamutHeatmapHero,
  lightness: GamutLightnessHero,
  constantL: GamutConstantLHero,
  p3: GamutP3Hero,
  solid: ColorTokenGeneratorSolidHero,
};

export default function Page() {
  const [activeView, setActiveView] = React.useState<ViewKey>("surface");
  const ActiveComponent = viewComponents[activeView];
  const activeViewData = VIEWS.find((v) => v.key === activeView)!;

  const activeIndex = VIEWS.findIndex((v) => v.key === activeView);
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const [pillStyle, setPillStyle] = React.useState<React.CSSProperties>({});

  React.useEffect(() => {
    const el = tabRefs.current[activeIndex];
    if (el) {
      setPillStyle({
        width: el.offsetWidth,
        transform: `translateX(${el.offsetLeft}px)`,
      });
    }
  }, [activeIndex]);

  return (
    <div className="h-dvh w-dvw overflow-hidden bg-slate-950">
      {/* Visualisation */}
      <div className="absolute inset-0">
        <ActiveComponent />
      </div>

      {/* Pill tabs — top centre */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="relative flex items-center rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 p-0.5">
          {/* Sliding pill indicator */}
          <div
            className="absolute top-0.5 left-0 h-[calc(100%-4px)] rounded-full bg-white shadow-sm transition-all duration-300 ease-out"
            style={pillStyle}
          />

          {VIEWS.map(({ key, label }, i) => (
            <button
              key={key}
              ref={(el) => { tabRefs.current[i] = el; }}
              onClick={() => setActiveView(key)}
              className={`
                relative z-10 cursor-pointer px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200
                ${
                  activeView === key
                    ? "text-slate-900"
                    : "text-slate-400 hover:text-white"
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom-right controls */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
        <a
          href="https://www.flett.cc/projects/color-token-generator"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 backdrop-blur-sm transition-colors"
        >
          flett.cc
        </a>

        <Popover>
          <PopoverTrigger asChild>
            <button
              className="cursor-pointer p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 backdrop-blur-sm transition-colors"
              aria-label="About this visualisation"
            >
              <Info size={16} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="end"
            className="max-w-xs text-sm border-none rounded-sm shadow-xl"
          >
            <p className="font-medium mb-1">{activeViewData.label}</p>
            <p>{activeViewData.description}</p>
            <p className="flex mt-3 items-center gap-1.5 text-xs text-slate-400">
              <Move size={12} />
              <span>Drag to rotate</span>
            </p>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
