import type { Metadata } from "next";
import "./globals.css";
import { MotionProvider } from "@/components/motion/MotionProvider";

const SITE_TITLE = "e-cell · kccemsr, thane.";
const SITE_DESCRIPTION =
  "the entrepreneurship cell of k.c. college of engineering, thane. we help students turn ideas into ventures.";

// Icons and share images come from app/favicon.ico, icon.png, apple-icon.png,
// opengraph-image.png and twitter-image.png (Next.js file conventions).
export const metadata: Metadata = {
  metadataBase: new URL("https://kcecell.org"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "KC E-Cell",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
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
