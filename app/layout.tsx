import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/toaster";
import { SWRegister } from "@/components/sw-register";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Coillector · Tu aceite usado vale", template: "%s · Coillector" },
  description:
    "Recicla el aceite de cocina usado de tu negocio en segundos. Coillector conecta a vendedores de comida de CDMX con recolectores: del aceite al combustible.",
  applicationName: "Coillector",
  appleWebApp: { capable: true, title: "Coillector", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  other: { "apple-mobile-web-app-capable": "yes" },
  openGraph: {
    title: "Coillector · Tu aceite usado vale",
    description: "Recicla el aceite de cocina usado de tu negocio en segundos.",
    locale: "es_MX",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1F3D2B" },
    { media: "(prefers-color-scheme: dark)", color: "#17241C" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
        <SWRegister />
      </body>
    </html>
  );
}
