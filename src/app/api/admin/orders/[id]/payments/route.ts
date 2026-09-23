import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { PaymentStatus } from "@/lib/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const amount = Number(body?.amount);
  const method =
    typeof body?.method === "string" && body.method.trim() ? body.method.trim() : null;

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Ingresa un monto válido" }, { status: 400 });
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  const remaining = Math.max(order.total - order.amount_paid, 0);
  const appliedToOrder = Math.min(amount, remaining);
  const creditToAdd = amount - appliedToOrder;
  const newAmountPaid = order.amount_paid + appliedToOrder;

  let paymentStatus: PaymentStatus = "debe";
  if (newAmountPaid + 0.01 >= order.total) paymentStatus = "pagado";
  else if (newAmountPaid > 0) paymentStatus = "parcial";

  const { error: paymentError } = await supabaseAdmin
    .from("payments")
    .insert({ order_id: id, amount, method });

  if (paymentError) {
    return NextResponse.json({ error: "No se pudo registrar el abono" }, { status: 500 });
  }

  const { data: updatedOrder, error: updateError } = await supabaseAdmin
    .from("orders")
    .update({ amount_paid: newAmountPaid, payment_status: paymentStatus })
    .eq("id", id)
    .select()
    .single();

  if (updateError || !updatedOrder) {
    return NextResponse.json({ error: "No se pudo actualizar el pedido" }, { status: 500 });
  }

  if (creditToAdd > 0 && order.client_id) {
    const { data: client } = await supabaseAdmin
      .from("clients")
      .select("credit_balance")
      .eq("id", order.client_id)
      .single();

    if (client) {
      await supabaseAdmin
        .from("clients")
        .update({ credit_balance: Number(client.credit_balance) + creditToAdd })
        .eq("id", order.client_id);
    }
  }

  return NextResponse.json({ order: updatedOrder, creditAdded: creditToAdd });
}
