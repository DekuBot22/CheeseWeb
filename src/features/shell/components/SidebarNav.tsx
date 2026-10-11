"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/cx";
import { LinkPending } from "@/ui/LinkPending";
import { isActive, MAIN_NAV, SETTINGS_NAV } from "../nav-items";

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Secciones del panel" className="flex flex-col gap-1">
      {[...MAIN_NAV, SETTINGS_NAV].map(({ href, label, Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "relative flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-(--dur-rapida)",
              active ? "bg-acento-suave text-acento" : "text-tinta-2 hover:bg-hoja-2 hover:text-tinta"
            )}
          >
            <Icon />
            {label}
            <LinkPending />
          </Link>
        );
      })}
    </nav>
  );
}
