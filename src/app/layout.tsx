/**
 * Root Layout
 * Sets up global font styles, theming, and context providers for the app.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { HeroUIProvider } from "@heroui/react";
import "./globals.css";

// Google Fonts Configuration
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Page Metadata
export const metadata: Metadata = {
  title: "Order Overview",
  description: "Frontend Challenge App",
};

// Root Layout Component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Wrap entire app with HeroUI provider for consistent UI styling */}
        <HeroUIProvider>{children}</HeroUIProvider>
      </body>
    </html>
  );
}
