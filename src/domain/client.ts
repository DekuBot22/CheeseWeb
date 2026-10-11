export interface Client {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  credit_balance: number;
  created_at: string;
}

// Los clientes se identifican por nombre sin importar mayúsculas ni espacios
// de más: "  Rosa Gómez" y "rosa gómez" son la misma persona.
export function normalizeClientName(name: string): { name: string; key: string } {
  const trimmed = name.trim();
  return { name: trimmed, key: trimmed.toLowerCase() };
}
