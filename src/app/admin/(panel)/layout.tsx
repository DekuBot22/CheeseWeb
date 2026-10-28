import { headers } from "next/headers";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { BottomNav } from "@/features/shell/components/BottomNav";
import { ScopedLink } from "@/features/shell/components/ScopedLink";
import { WeekScopeBanner } from "@/features/shell/components/WeekScopeBanner";
import { WeekScopeMobile } from "@/features/shell/components/WeekScopeMobile";
import { WeekScopeProvider } from "@/features/shell/components/WeekScopeProvider";
import { WeekScopeSidebar } from "@/features/shell/components/WeekScopeSidebar";
import { getWeekScopeData } from "@/features/weeks/server/get-week-scope-data";
import { BrandMark } from "@/features/shell/components/BrandMark";
import { SettingsLink } from "@/features/shell/components/SettingsLink";
import { SidebarNav } from "@/features/shell/components/SidebarNav";
import { Toast } from "@/ui/Toast";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  // El proxy marca esta cabecera cuando la auth está apagada (modo local): sin sesión, no hay "Salir".
  const localMode = (await headers()).get("x-admin-auth") === "off";
  const { cal, firstDay } = await getWeekScopeData();

  return (
    <WeekScopeProvider cal={cal} firstDay={firstDay}>
      <div className="min-h-dvh md:grid md:grid-cols-[15rem_1fr]">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-sm focus:bg-hoja focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-flota"
        >
          Saltar al contenido
        </a>

        {/* Desde tablet (768 px): menú lateral plano con la marca arriba y "Cerrar sesión" abajo. */}
        <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-r border-linea px-4 py-5 md:flex">
          <ScopedLink href="/admin" className="pl-2">
            <BrandMark subtitle="Contabilidad del queso" />
          </ScopedLink>
          <WeekScopeSidebar firstDay={firstDay} />
          <div className="flex-1">
            <SidebarNav />
          </div>
          {!localMode && <LogoutButton />}
        </aside>

        {/* Móvil: barra superior + navegación inferior. */}
        <header className="sticky top-0 z-20 flex min-h-14 items-center justify-between border-b border-linea bg-papel pl-4 pr-2 pt-[env(safe-area-inset-top)] md:hidden">
          <ScopedLink href="/admin">
            <BrandMark compact />
          </ScopedLink>
          <WeekScopeMobile />
          <div className="flex items-center">
            <SettingsLink />
            {!localMode && <LogoutButton iconOnly />}
          </div>
        </header>

        <main
          id="contenido"
          className="mx-auto w-full max-w-[1200px] px-4 py-6 pb-[calc(9rem+env(safe-area-inset-bottom))] md:px-8 md:py-8 md:pb-8"
        >
          <WeekScopeBanner />
          {children}
        </main>

        <BottomNav />
        <Toast />
      </div>
    </WeekScopeProvider>
  );
}
