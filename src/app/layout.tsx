import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

// Tipografía principal: Inter - perfecta para cuerpo de texto
// Variable font para mejor rendimiento y control tipográfico
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

// Tipografía para títulos: Outfit - moderna y geométrica
// Tendencia 2026: combinación de fuentes con personalidad
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "MediosWikiApp | Panel de Noticias Premium",
  description: "Dashboard RSS de alto rendimiento para noticias en tiempo real de Tierra del Fuego.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

