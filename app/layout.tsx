import type { Metadata } from "next";
import { Geist, Geist_Mono, Unbounded, Silkscreen } from "next/font/google";
import "./globals.css";
import { DevTools } from "@/components/dev/DevTools";
import { MotionProvider } from "@/components/motion/MotionProvider";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});
const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
});
const silkscreen = Silkscreen({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-silkscreen",
});

export const metadata: Metadata = {
  title: "E-Cell KCCEMSR · Build Mode",
  description:
    "Entrepreneurship Cell, K.C. College of Engineering and Management Studies and Research, Thane. Site rebuild in progress.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${unbounded.variable} ${silkscreen.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <MotionProvider>{children}</MotionProvider>
        {process.env.NODE_ENV === "development" && <DevTools />}
      </body>
    </html>
  );
}
