import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OKLCH Gamut Visualiser — Interactive 3D Colour Space Explorer",
  description:
    "Explore the OKLCH colour space in 3D. Visualise the sRGB gamut boundary as a solid surface, scattered particles, or point cloud — built with Three.js and React Three Fiber.",
  keywords: [
    "OKLCH",
    "colour space",
    "color space",
    "gamut",
    "3D visualisation",
    "sRGB",
    "Three.js",
    "React Three Fiber",
    "colour theory",
    "perceptual colour",
    "CSS colors",
    "web colours",
  ],
  openGraph: {
    title: "OKLCH Gamut Visualiser",
    description:
      "Interactive 3D visualisation of the OKLCH colour space gamut boundary — surface, point cloud, and scattered particle views.",
    type: "website",
    siteName: "OKLCH Gamut Visualiser",
  },
  twitter: {
    card: "summary_large_image",
    title: "OKLCH Gamut Visualiser",
    description:
      "Explore the OKLCH colour space in 3D. Visualise the sRGB gamut boundary as a solid surface, scattered particles, or point cloud.",
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
