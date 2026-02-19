"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Info, Move, ExternalLink, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

const VIEWS = [
  { key: "solid", label: "Solid" },
  { key: "surface", label: "Surface" },
  { key: "points", label: "Point Cloud" },
  { key: "scattered", label: "Scattered" },
] as const;

type ViewKey = (typeof VIEWS)[number]["key"];

function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Loader2 className="size-5 text-slate-500 animate-spin" />
    </div>
  );
}

const ColorTokenGeneratorLandscapeHero = dynamic(
  () =>
    import(
      "@/content/components/color-token-generator-landscape-hero"
    ).then((m) => m.ColorTokenGeneratorLandscapeHero),
  { ssr: false, loading: LoadingSpinner }
);

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

const viewComponents: Record<ViewKey, React.ComponentType> = {
  solid: ColorTokenGeneratorSolidHero,
  surface: ColorTokenGeneratorMixedHero,
  points: ColorTokenGeneratorLandscapeHero,
  scattered: ColorTokenGeneratorScatteredHero,
};

export default function Page() {
  const [activeView, setActiveView] = React.useState<ViewKey>("solid");
  const ActiveComponent = viewComponents[activeView];

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
          href="https://flett.cc"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 backdrop-blur-sm transition-colors"
        >
          flett.cc
          <ExternalLink size={12} />
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
            <p className="font-medium mb-1">OKLCH Gamut Landscape</p>
            <p>
              A 3D visualisation of the OKLCH colour space gamut boundary,
              showing the full range of colours displayable on screen mapped
              across lightness, chroma, and hue axes.
            </p>
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
