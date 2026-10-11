import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { ServiceWorkerRegister } from "@/features/pwa/components/ServiceWorkerRegister";

// La fuente del panel solo se carga en /admin; la página pública no la paga.
const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// El manifest se enlaza SOLO desde /admin: la página pública de pedidos no es instalable.
export const metadata: Metadata = {
  title: { default: "Cuaderno", template: "%s · Cuaderno" },
  manifest: "/cuaderno.webmanifest",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Cuaderno", statusBarStyle: "black-translucent" },
  icons: { icon: "/icons/favicon-32.png", apple: "/icons/apple-touch-icon.png" },
  formatDetection: { telephone: false },
};

// Color de la barra del navegador / de estado del teléfono: el mismo "papel" oscuro del panel.
export const viewport: Viewport = {
  themeColor: "#0f0e0c",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="oscuro" className={`${plex.variable} admin-root flex flex-1 flex-col`}>
      <ServiceWorkerRegister />
      {children}
    </div>
  );
}
