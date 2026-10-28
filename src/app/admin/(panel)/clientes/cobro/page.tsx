import Link from "next/link";
import { formatCOP, formatMonth, plural } from "@/lib/format";
import { CollectionList } from "@/features/clients/components/CollectionList";
import { CollectionMonthPicker } from "@/features/clients/components/CollectionMonthPicker";
import { getMonthlyCollection } from "@/features/clients/server/get-monthly-collection";
import { PageHeader } from "@/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function CobroDelMesPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const { mes } = await searchParams;
  const { month, current, months, rows, total, earlierTotal } = await getMonthlyCollection(mes);

  return (
    <div>
      <PageHeader
        title="Cobro del mes"
        subtitle={
          rows.length === 0
            ? `Lo que falta cobrar de los pedidos de ${formatMonth(month)}`
            : `${formatCOP(total)} por cobrar de ${formatMonth(month)} · ${plural(rows.length, "cliente")}`
        }
        actions={
          <Link href="/admin/clientes" className="text-[0.8125rem] font-semibold text-acento hover:underline">
            ← Clientes
          </Link>
        }
      />
      <CollectionMonthPicker month={month} months={months} current={current} />
      {earlierTotal > 0 && (
        <p className="mb-3 text-[0.8125rem]/[1.125rem] text-tinta-2">
          Además hay {formatCOP(earlierTotal)} de meses anteriores. Se ven al volver a un mes pasado con las flechas.
        </p>
      )}
      <CollectionList rows={rows} month={month} />
    </div>
  );
}
