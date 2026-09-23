import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const paymentDate = String(body?.payment_date ?? "");
  const amount = Number(body?.amount);
  const method = body?.method ? String(body.method).slice(0, 50) : null;
  const notes = body?.notes ? String(body.notes).slice(0, 300) : null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(paymentDate)) {
    return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("provider_payments")
    .insert({
      payment_date: paymentDate,
      amount,
      method,
      notes,
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "No se pudo registrar el pago" }, { status: 500 });
  }

  return NextResponse.json({ payment: data }, { status: 201 });
}
