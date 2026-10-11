import { CHEESE_TYPE_LABELS, SALT_LEVEL_LABELS } from "@/domain/catalog";
import { remainingOf, type Order } from "@/domain/order";
import { formatDateShort } from "@/lib/format";
import { Money } from "@/ui/Money";
import type { Column } from "@/ui/DataTable";
import { PaymentBadge } from "./OrderBadges";
import { ClientLink, PayButton, StatusToggle } from "./OrderRowCells";

interface Options {
  showClient: boolean;
  updatingId: string | null;
  onToggle: (order: Order) => void;
  onPay: (order: Order) => void;
}

// Columnas de la tabla de pedidos en escritorio.
export function buildOrderColumns({ showClient, updatingId, onToggle, onPay }: Options): Column<Order>[] {
  const client: Column<Order> = { key: "cliente", header: "Cliente", cell: (o) => <ClientLink order={o} /> };

  return [
    { key: "fecha", header: "Fecha", cell: (o) => <span className="num text-tinta-2">{formatDateShort(o.created_at)}</span> },
    ...(showClient ? [client] : []),
    { key: "cant", header: "Cantidad", cell: (o) => <span className="num">{o.quantity} {o.unit}</span> },
    {
      key: "queso",
      header: "Queso",
      cell: (o) => (
        <span className="text-tinta-2">
          {CHEESE_TYPE_LABELS[o.cheese_type]} · {SALT_LEVEL_LABELS[o.salt_level]}
        </span>
      ),
    },
    { key: "total", header: "Total", align: "right", cell: (o) => <Money value={Number(o.total)} /> },
    { key: "pagado", header: "Pagado", align: "right", cell: (o) => <Money value={Number(o.amount_paid)} tone="cobrado" /> },
    {
      key: "saldo",
      header: "Saldo",
      align: "right",
      cell: (o) =>
        remainingOf(o) > 0 ? (
          <Money value={remainingOf(o)} tone="debe" className="font-semibold" />
        ) : (
          <span className="text-tinta-3">—</span>
        ),
    },
    {
      key: "estado",
      header: "Estado",
      cell: (o) => <StatusToggle order={o} disabled={updatingId === o.id} onToggle={onToggle} />,
    },
    { key: "pago", header: "Pago", cell: (o) => <PaymentBadge status={o.payment_status} /> },
    { key: "acc", header: "", cell: (o) => <PayButton order={o} onPay={onPay} /> },
  ];
}
