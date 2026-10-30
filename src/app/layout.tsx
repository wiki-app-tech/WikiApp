import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

// Única familia tipográfica sans-serif con soporte de números tabulares en tres pesos: 400, 600 y 700
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0f4c81",
};

export const metadata: Metadata = {
  title: "WikiApp TDF — Información al día",
  description:
    "Portal público de información al día de Tierra del Fuego (Fin del Mundo): estado de Ruta Nacional 3, alertas de Defensa Civil, farmacias de turno y noticias de Ushuaia, Río Grande y Tolhuin.",
  manifest: "/manifest.json",
  applicationName: "WikiApp TDF",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WikiApp TDF",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
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
    <html lang="es" className="light" style={{ colorScheme: "light" }} suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="WikiApp TDF" />
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
      <body className={`${inter.variable} font-sans antialiased tabular-nums`}>
        <ThemeProvider>
          {children}
          <PwaInstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
