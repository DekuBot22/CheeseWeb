"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useWeekScope } from "./WeekScopeProvider";

// Link del panel que conserva la semana elegida. Si el enlace ya trae `semana`, se respeta.
export function ScopedLink({ href, ...props }: Omit<ComponentProps<typeof Link>, "href"> & { href: string }) {
  const { withScope } = useWeekScope();
  return <Link href={withScope(href)} {...props} />;
}
