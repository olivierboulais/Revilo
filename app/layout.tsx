import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Revilo — Design System Alignment Platform",
  description: "Scan your Figma library against your codebase to find where your design system has drifted. Fix alignment before it becomes technical debt.",
  openGraph: {
    title: "Revilo — Design System Alignment Platform",
    description: "Scan your Figma library against your codebase to find where your design system has drifted.",
    url: "https://revilo-three.vercel.app",
    siteName: "Revilo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Revilo — Design System Alignment Platform",
    description: "Scan your Figma library against your codebase to find where your design system has drifted.",
  },
  icons: {
    icon: "/favicon.svg",
  },
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
      <body className="min-h-full flex flex-col"><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}
