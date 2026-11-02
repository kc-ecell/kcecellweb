import type { Metadata } from "next";
import "./globals.css";
import { MotionProvider } from "@/components/motion/MotionProvider";

export const metadata: Metadata = {
  title: "e-cell · kccemsr, thane.",
  description:
    "the entrepreneurship cell of k.c. college of engineering, thane. we help students turn ideas into ventures.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let DevTools: React.ComponentType | null = null;
  if (process.env.NODE_ENV === "development") {
    const devMod = await import("@/components/dev/DevTools");
    DevTools = devMod.DevTools;
  }

  return (
    <html lang="en" className="min-h-full antialiased">
      <body className="flex min-h-full flex-col">
        <MotionProvider>{children}</MotionProvider>
        {DevTools && <DevTools />}
      </body>
    </html>
  );
}
