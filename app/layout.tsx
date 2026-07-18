import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { StarsBackground } from "@/components/ui/stars-background";
import { Navigation } from "@/components/navigation";

export const metadata: Metadata = {
  title: "NEBULA — Planet Intelligence Dashboard",
  description:
    "A premium, AI-powered science dashboard combining live space exploration, astronomy, Earth events, and scientific discoveries into one immersive experience.",
  keywords: [
    "space",
    "astronomy",
    "NASA",
    "SpaceX",
    "earthquakes",
    "ISS",
    "asteroids",
    "solar",
    "science",
    "dashboard",
  ],
  authors: [{ name: "NEBULA" }],
  openGraph: {
    title: "NEBULA — Planet Intelligence Dashboard",
    description:
      "Live space exploration, astronomy, Earth events & AI-generated daily planet reports.",
    type: "website",
    siteName: "NEBULA",
  },
  twitter: {
    card: "summary_large_image",
    title: "NEBULA — Planet Intelligence Dashboard",
    description:
      "Live space exploration, astronomy, Earth events & AI-generated daily planet reports.",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,300;1,6..72,400;1,6..72,500&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "NEBULA",
              description:
                "Planet Intelligence Dashboard — Live space & Earth data",
              applicationCategory: "Science",
              operatingSystem: "Web Browser",
            }),
          }}
        />
      </head>
      <body className="antialiased selection:bg-white/20 selection:text-white">
        {/* Subtle Background Glows */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="glow-blob glow-blue w-[800px] h-[800px] top-[-200px] left-[-200px]" />
          <div className="glow-amber w-[600px] h-[600px] bottom-[-100px] right-[-100px] glow-blob" />
        </div>
        
        <Providers>
          <div className="relative z-10 min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
