import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

// Tipografía principal: Inter - cuerpo de texto y lectura limpia
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

// Tipografía geométrica complementaria
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  preload: true,
});

// Tipografía de lujo esbelta para alta gama: Cormorant Garamond
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1b263b" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0f17" },
  ],
};

export const metadata: Metadata = {
  title: "WikiApp PRO | Monitor Regional e Inteligencia TDF",
  description: "Plataforma de alta gama para servicios exclusivos, inteligencia estratégica, clima, radio y noticias de Tierra del Fuego.",
  manifest: "/manifest.json",
  applicationName: "WikiApp PRO",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WikiApp PRO",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="WikiApp PRO" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__deferredPwaPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__deferredPwaPrompt = e;
              });
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} ${cormorant.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          {children}
          <PwaInstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
