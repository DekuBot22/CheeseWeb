"use client";

import { useRouter } from "next/navigation";
import { IconLogout } from "@/ui/icons";
import { cx } from "@/lib/cx";

export function LogoutButton({ iconOnly = false }: { iconOnly?: boolean }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      aria-label="Cerrar sesión"
      className={cx(
        "flex items-center gap-3 rounded-md text-sm font-medium text-tinta-2 hover:bg-hoja-2 hover:text-tinta",
        iconOnly ? "h-11 w-11 justify-center" : "h-10 w-full px-3"
      )}
    >
      <IconLogout />
      {!iconOnly && "Cerrar sesión"}
    </button>
  );
}
