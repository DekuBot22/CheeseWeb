"use client";

import Link from "next/link";
import { SETTINGS_NAV } from "../nav-items";
import { useWeekScope } from "./WeekScopeProvider";

export function SettingsLink() {
  const { href, label, Icon } = SETTINGS_NAV;
  const { withScope } = useWeekScope();
  return (
    <Link
      href={withScope(href)}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-sm text-tinta-2 hover:bg-hoja-2 hover:text-tinta"
    >
      <Icon width={20} height={20} />
    </Link>
  );
}
