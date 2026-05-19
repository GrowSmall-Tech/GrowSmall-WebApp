import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import { AuthSync } from "@/providers/auth-sync";
import { Toaster } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "GrowSmall",
  description: "Shark Tank style startup investment platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={inter.variable}
      suppressHydrationWarning
      style={{ colorScheme: "light" }}
    >
      <body suppressHydrationWarning>
        <AuthSync>{children}</AuthSync>
        <Toaster />
      </body>
    </html>
  );
}
