"use client";

import dynamic from "next/dynamic";

const ColorTokenGeneratorLandscapeHero = dynamic(
  () =>
    import(
      "@/content/components/color-token-generator-landscape-hero"
    ).then((m) => m.ColorTokenGeneratorLandscapeHero),
  { ssr: false }
);

const ColorTokenGeneratorScatteredHero = dynamic(
  () =>
    import(
      "@/content/components/color-token-generator-scattered-hero"
    ).then((m) => m.ColorTokenGeneratorScatteredHero),
  { ssr: false }
);

const ColorTokenGeneratorMixedHero = dynamic(
  () =>
    import(
      "@/content/components/color-token-generator-mixed-hero"
    ).then((m) => m.ColorTokenGeneratorMixedHero),
  { ssr: false }
);

export default function TestOklchPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <h1 className="text-2xl font-bold text-white mb-8">
        OKLCH Gamut Hero Variants
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div>
          <h2 className="text-sm font-medium text-slate-400 mb-3">
            1. Point Cloud
          </h2>
          <div className="aspect-square">
            <ColorTokenGeneratorLandscapeHero />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-medium text-slate-400 mb-3">
            2. Scattered Particles
          </h2>
          <div className="aspect-square">
            <ColorTokenGeneratorScatteredHero />
          </div>
        </div>
      </div>
      <div className="aspect-square w-[540px] h-[540px] mt-8">
        <ColorTokenGeneratorMixedHero />
      </div>
    </div>
  );
}
