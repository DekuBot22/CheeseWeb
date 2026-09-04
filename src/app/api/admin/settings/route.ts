import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const price = Number(body?.price_per_kg);

  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "Precio inválido" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("settings")
    .update({ price_per_kg: price, updated_at: new Date().toISOString() })
    .eq("id", 1)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "No se pudo actualizar el precio" }, { status: 500 });
  }

  return NextResponse.json({ settings: data });
}
