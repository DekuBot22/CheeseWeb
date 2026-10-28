"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/cx";
import { LinkPending } from "@/ui/LinkPending";
import { useWeekScope } from "./WeekScopeProvider";
import { isActive, SIDEBAR_GROUPS } from "../nav-items";

export function SidebarNav() {
  const pathname = usePathname();
  const { withScope } = useWeekScope();
  return (
    <nav aria-label="Secciones del panel" className="flex flex-col gap-6">
      {SIDEBAR_GROUPS.map(({ label, items }) => (
        <div key={label} className="flex flex-col gap-0.5">
          <p className="pb-1 pl-3 text-xs font-medium text-tinta-3">{label}</p>
          {items.map(({ href, label: itemLabel, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={withScope(href)}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "relative flex h-9 items-center gap-2.5 rounded-sm px-3 text-sm font-medium transition-colors duration-(--dur-rapida)",
                  active ? "bg-hoja-2 text-tinta" : "text-tinta-2 hover:bg-hoja hover:text-tinta"
                )}
              >
                <Icon />
                {itemLabel}
                <LinkPending />
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
