import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://revilo.design";

export const metadata: Metadata = {
  title: { default: "Revilo — Design System Alignment Platform", template: "%s — Revilo" },
  description: "Scan your Figma library against your codebase to find where your design system has drifted. Fix alignment before it becomes technical debt.",
  metadataBase: new URL(BASE_URL),
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: "Revilo — Design System Alignment Platform",
    description: "Scan your Figma library against your codebase to find where your design system has drifted.",
    url: BASE_URL,
    siteName: "Revilo",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Revilo — Design System Alignment Platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Revilo — Design System Alignment Platform",
    description: "Scan your Figma library against your codebase to find where your design system has drifted.",
    images: ["/opengraph-image"],
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
