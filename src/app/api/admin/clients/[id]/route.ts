import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  const phone = typeof body?.phone === "string" ? body.phone.trim() || null : undefined;
  const notes = typeof body?.notes === "string" ? body.notes.trim() || null : undefined;

  const update: Record<string, string | null> = {};
  if (phone !== undefined) update.phone = phone;
  if (notes !== undefined) update.notes = notes;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("clients")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "No se pudo actualizar el cliente" }, { status: 500 });
  }

  return NextResponse.json({ client: data });
}
