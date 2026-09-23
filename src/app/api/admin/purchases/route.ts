import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const purchaseDate = String(body?.purchase_date ?? "");
  const kg = Number(body?.kg);
  const totalCost = Number(body?.total_cost);
  const description = body?.description ? String(body.description).slice(0, 300) : null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(purchaseDate)) {
    return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
  }
  if (!Number.isFinite(kg) || kg <= 0) {
    return NextResponse.json({ error: "Cantidad (kg) inválida" }, { status: 400 });
  }
  if (!Number.isFinite(totalCost) || totalCost < 0) {
    return NextResponse.json({ error: "Costo total inválido" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("purchases")
    .insert({
      purchase_date: purchaseDate,
      kg,
      total_cost: totalCost,
      description,
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "No se pudo registrar la compra" }, { status: 500 });
  }

  return NextResponse.json({ purchase: data }, { status: 201 });
}
