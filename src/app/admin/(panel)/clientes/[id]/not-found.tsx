import { ButtonLink } from "@/ui/Button";
import { EmptyState } from "@/ui/EmptyState";

export default function ClientNotFound() {
  return (
    <EmptyState
      title="No encontré ese cliente"
      description="Puede que el enlace sea viejo o que el cliente ya no exista."
      action={<ButtonLink href="/admin/clientes">Ver todos los clientes</ButtonLink>}
    />
  );
}
