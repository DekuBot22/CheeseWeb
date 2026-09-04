import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendTelegramMessage } from "@/lib/telegram";
import {
  toKg,
  formatCOP,
  CHEESE_TYPE_LABELS,
  SALT_LEVEL_LABELS,
} from "@/lib/constants";
import type { CheeseType, SaltLevel } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const clientName = body?.client_name;
  const unit = body?.unit;
  const cheeseType = body?.cheese_type;
  const saltLevel = body?.salt_level;
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

  if (!["duro", "semi", "blando"].includes(cheeseType)) {
    return NextResponse.json({ error: "Elige un tipo de queso válido" }, { status: 400 });
  }

  if (!["alto", "intermedio", "bajo"].includes(saltLevel)) {
    return NextResponse.json({ error: "Elige un nivel de sal válido" }, { status: 400 });
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
      cheese_type: cheeseType,
      salt_level: saltLevel,
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
      `Tipo: ${CHEESE_TYPE_LABELS[order.cheese_type as CheeseType]}\n` +
      `Sal: ${SALT_LEVEL_LABELS[order.salt_level as SaltLevel]}\n` +
      `Total: ${formatCOP(order.total)}\n` +
      `Fecha: ${new Date(order.created_at).toLocaleString("es-CO")}`
  );

  return NextResponse.json({ order }, { status: 201 });
}
