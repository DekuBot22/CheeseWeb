"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/cx";
import { LinkPending } from "@/ui/LinkPending";
import { useWeekScope } from "./WeekScopeProvider";
import { isActive, MAIN_NAV } from "../nav-items";

export function BottomNav() {
  const pathname = usePathname();
  const { withScope } = useWeekScope();
  return (
    <nav
      aria-label="Secciones del panel"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-linea bg-papel pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="flex h-16 items-center gap-1 px-2">
        {MAIN_NAV.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={withScope(href)}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "presionable relative flex h-[3.25rem] flex-col items-center justify-center gap-[3px] rounded-sm text-xs font-medium",
                  active ? "bg-hoja-2 text-tinta" : "text-tinta-3"
                )}
              >
                <Icon width={22} height={22} />
                {label}
                <LinkPending />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
