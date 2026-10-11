import { headers } from "next/headers";
import Link from "next/link";
import { LocalModeBanner } from "@/features/auth/components/LocalModeBanner";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { BottomNav } from "@/features/shell/components/BottomNav";
import { SettingsLink } from "@/features/shell/components/SettingsLink";
import { SidebarNav } from "@/features/shell/components/SidebarNav";
import { formatWeekLabel } from "@/lib/format";
import { weekRange } from "@/domain/week";
import { Toast } from "@/ui/Toast";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const { start, end } = weekRange();
  // El proxy marca esta cabecera cuando la auth está apagada (modo local).
  const localMode = (await headers()).get("x-admin-auth") === "off";

  return (
    <>
      {localMode && <LocalModeBanner />}
      <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-hoja focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-flota"
        >
          Saltar al contenido
        </a>

        {/* Escritorio: sidebar con el "margen" del cuaderno. */}
        <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-r-2 border-acento/25 px-4 py-6 lg:flex">
          <div>
            <Link href="/admin" className="font-display text-2xl font-semibold text-tinta">
              Cuaderno
            </Link>
            <p className="text-xs text-tinta-3">Contabilidad del queso</p>
          </div>
          <div className="rounded-md border border-linea bg-hoja px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-tinta-3">Semana</p>
            <p className="num text-sm font-semibold text-tinta">{formatWeekLabel(start, end)}</p>
          </div>
          <div className="flex-1">
            <SidebarNav />
          </div>
          {!localMode && <LogoutButton />}
        </aside>

        {/* Móvil: barra superior + navegación inferior. */}
        <header className="sticky top-0 z-20 flex min-h-14 items-center justify-between border-b border-linea bg-papel px-4 pt-[env(safe-area-inset-top)] lg:hidden">
          <Link href="/admin" className="font-display text-xl font-semibold text-tinta">
            Cuaderno
          </Link>
          <div className="flex items-center">
            <SettingsLink />
            {!localMode && <LogoutButton iconOnly />}
          </div>
        </header>

        <main
          id="contenido"
          className="mx-auto w-full max-w-[1200px] px-4 py-6 pb-[calc(7rem+env(safe-area-inset-bottom))] lg:px-8 lg:py-8 lg:pb-8"
        >
          {children}
        </main>

        <BottomNav />
        <Toast />
      </div>
    </>
  );
}
