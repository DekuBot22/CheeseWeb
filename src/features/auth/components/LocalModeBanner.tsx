import { IconUnlock } from "@/ui/icons";

// Franja de aviso mientras el panel está sin contraseña (ADMIN_AUTH=off en el PC).
export function LocalModeBanner() {
  return (
    <div
      role="status"
      className="flex min-h-8 items-center justify-center gap-2 border-b border-aviso-borde bg-aviso-bg px-3 text-center text-xs font-semibold text-aviso"
    >
      <IconUnlock width={14} height={14} />
      Sin contraseña (modo local) — solo funciona en este PC
    </div>
  );
}
