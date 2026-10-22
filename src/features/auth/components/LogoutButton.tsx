"use client";

import { useRouter } from "next/navigation";
import { IconLogout } from "@/ui/icons";

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
      className={
        iconOnly
          ? "flex h-11 w-11 items-center justify-center rounded-sm text-tinta-2 hover:bg-hoja-2 hover:text-tinta"
          : "pl-2 text-left text-[0.8125rem]/[1.125rem] text-tinta-3 hover:text-tinta"
      }
    >
      {iconOnly ? <IconLogout /> : "Cerrar sesión"}
    </button>
  );
}
