import { LoginForm } from "@/features/auth/components/LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-[23.75rem]">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span
            aria-hidden="true"
            className="flex size-11 items-center justify-center rounded-md border border-linea bg-hoja-3 text-xl/7 font-semibold text-tinta"
          >
            C
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl/7 font-semibold tracking-[-0.015em] text-tinta">Cuaderno</h1>
            <p className="text-[0.8125rem]/[1.125rem] text-tinta-2">Contabilidad del queso. Solo para el dueño.</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
