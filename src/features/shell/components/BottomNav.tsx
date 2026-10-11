"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/cx";
import { isActive, MAIN_NAV } from "../nav-items";

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Secciones del panel"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-linea bg-hoja/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {MAIN_NAV.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "flex min-h-16 flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium",
                  active ? "text-acento" : "text-tinta-2"
                )}
              >
                <span
                  className={cx("flex h-7 w-12 items-center justify-center rounded-full", active && "bg-acento-suave")}
                >
                  <Icon />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
