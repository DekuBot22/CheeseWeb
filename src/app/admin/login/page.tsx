import { LoginForm } from "@/features/auth/components/LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 border-l-2 border-acento/25 pl-4">
          <h1 className="font-display text-3xl font-semibold text-tinta">Cuaderno</h1>
          <p className="text-sm text-tinta-2">Contabilidad del queso. Solo para el dueño.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
