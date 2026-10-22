import { headers } from "next/headers";
import Link from "next/link";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { BottomNav } from "@/features/shell/components/BottomNav";
import { BrandMark } from "@/features/shell/components/BrandMark";
import { SettingsLink } from "@/features/shell/components/SettingsLink";
import { SidebarNav } from "@/features/shell/components/SidebarNav";
import { Toast } from "@/ui/Toast";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  // El proxy marca esta cabecera cuando la auth está apagada (modo local): sin sesión, no hay "Salir".
  const localMode = (await headers()).get("x-admin-auth") === "off";

  return (
    <>
      <div className="min-h-dvh md:grid md:grid-cols-[15rem_1fr]">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-sm focus:bg-hoja focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-flota"
        >
          Saltar al contenido
        </a>

        {/* Desde tablet (768 px): menú lateral plano con la marca arriba y "Cerrar sesión" abajo. */}
        <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-r border-linea px-4 py-5 md:flex">
          <Link href="/admin" className="pl-2">
            <BrandMark subtitle="Contabilidad del queso" />
          </Link>
          <div className="flex-1">
            <SidebarNav />
          </div>
          {!localMode && <LogoutButton />}
        </aside>

        {/* Móvil: barra superior + navegación inferior. */}
        <header className="sticky top-0 z-20 flex min-h-14 items-center justify-between border-b border-linea bg-papel pl-4 pr-2 pt-[env(safe-area-inset-top)] md:hidden">
          <Link href="/admin">
            <BrandMark />
          </Link>
          <div className="flex items-center">
            <SettingsLink />
            {!localMode && <LogoutButton iconOnly />}
          </div>
        </header>

        <main
          id="contenido"
          className="mx-auto w-full max-w-[1200px] px-4 py-6 pb-[calc(9rem+env(safe-area-inset-bottom))] md:px-8 md:py-8 md:pb-8"
        >
          {children}
        </main>

        <BottomNav />
        <Toast />
      </div>
    </>
  );
}
