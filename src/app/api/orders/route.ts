import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendTelegramMessage } from "@/lib/telegram";
import { toKg, formatCOP } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const clientName = body?.client_name;
  const unit = body?.unit;
  const quantity = Number(body?.quantity);

  if (
    typeof clientName !== "string" ||
    clientName.trim().length < 2 ||
    clientName.trim().length > 100
  ) {
    return NextResponse.json({ error: "Ingresa un nombre válido" }, { status: 400 });
  }

  if (unit !== "kg" && unit !== "lb") {
    return NextResponse.json({ error: "Unidad inválida" }, { status: 400 });
  }

  if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 1000) {
    return NextResponse.json({ error: "Ingresa una cantidad válida" }, { status: 400 });
  }

  const { data: settings, error: settingsError } = await supabaseAdmin
    .from("settings")
    .select("price_per_kg")
    .eq("id", 1)
    .single();

  if (settingsError || !settings) {
    return NextResponse.json(
      { error: "No se pudo obtener el precio actual. Intenta más tarde." },
      { status: 500 }
    );
  }

  const pricePerKg = Number(settings.price_per_kg);
  const total = Math.round(toKg(quantity, unit) * pricePerKg);

  const { data: order, error: insertError } = await supabaseAdmin
    .from("orders")
    .insert({
      client_name: clientName.trim(),
      quantity,
      unit,
      price_per_kg_snapshot: pricePerKg,
      total,
      status: "pendiente",
    })
    .select()
    .single();

  if (insertError || !order) {
    return NextResponse.json({ error: "No se pudo guardar el pedido" }, { status: 500 });
  }

  await sendTelegramMessage(
    "🧀 <b>Nuevo pedido de queso</b>\n\n" +
      `Cliente: ${order.client_name}\n` +
      `Cantidad: ${order.quantity} ${order.unit}\n` +
      `Total: ${formatCOP(order.total)}\n` +
      `Fecha: ${new Date(order.created_at).toLocaleString("es-CO")}`
  );

  return NextResponse.json({ order }, { status: 201 });
}
