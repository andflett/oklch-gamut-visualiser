import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OKLCH Colour Space — Interactive 3D Explorer",
  description:
    "Explore the OKLCH colour space in 3D. Visualise the sRGB boundary as a solid surface, heatmap, lightness map, or P3 vs sRGB comparison — built with Three.js and React Three Fiber.",
  keywords: [
    "OKLCH",
    "colour space",
    "color space",
    "3D visualisation",
    "sRGB",
    "Display P3",
    "Three.js",
    "React Three Fiber",
    "colour theory",
    "perceptual colour",
    "CSS colors",
    "web colours",
    "oklch.space",
  ],
  openGraph: {
    title: "OKLCH Colour Space",
    description:
      "Interactive 3D visualisation of the OKLCH colour space — surface, heatmap, lightness, P3 vs sRGB, and more.",
    type: "website",
    siteName: "OKLCH Colour Space",
  },
  twitter: {
    card: "summary_large_image",
    title: "OKLCH Colour Space",
    description:
      "Explore the OKLCH colour space in 3D. Seven interactive views showing how lightness, chroma, and hue relate across colour spaces.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
