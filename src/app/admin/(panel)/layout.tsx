import AdminNav from "@/components/admin/AdminNav";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-zinc-900">Panel de administrador 🧀</h1>
        <LogoutButton />
      </div>
      <div className="mb-6">
        <AdminNav />
      </div>
      {children}
    </div>
  );
}
