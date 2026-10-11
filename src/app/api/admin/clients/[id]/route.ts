import { ValidationError } from "@/server/errors";
import { handle, ok, parseJson } from "@/server/http";
import { updateClientSchema } from "@/features/clients/schemas";
import { updateClient } from "@/features/clients/server/clients.repo";

type Context = { params: Promise<{ id: string }> };

export const PATCH = handle<Context>(async (request, { params }) => {
  const { id } = await params;
  const { phone, notes } = await parseJson(request, updateClientSchema);

  const fields: { phone?: string | null; notes?: string | null } = {};
  if (phone !== undefined) fields.phone = phone;
  if (notes !== undefined) fields.notes = notes;
  if (Object.keys(fields).length === 0) throw new ValidationError("Nada que actualizar");

  return ok({ client: await updateClient(id, fields) });
});
