// Confirmación que ve el cliente después de enviar su pedido.
export function OrderSuccess({
  clientName,
  summary,
  onReset,
}: {
  clientName: string;
  summary: string;
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm">
      <div className="mb-2 text-4xl">✅</div>
      <h2 className="font-display text-lg font-semibold text-emerald-900">¡Pedido enviado!</h2>
      <p className="mt-1 text-sm text-emerald-800">
        Gracias {clientName}, tu pedido de {summary} fue recibido. Te contactaremos para confirmarlo.
      </p>
      <button
        onClick={onReset}
        className="mt-4 text-sm font-medium text-emerald-700 underline underline-offset-2"
      >
        Hacer otro pedido
      </button>
    </div>
  );
}
