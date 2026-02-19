import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OKLCH Gamut Visualiser",
  description: "Interactive 3D visualisation of the OKLCH colour space gamut boundary",
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
