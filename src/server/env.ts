import "server-only";
import { z } from "zod";

const schema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ADMIN_PASSWORD: z.string().min(1),
  // Modo "sin contraseña" solo para trabajar en el PC: ver features/auth/auth-mode.ts.
  ADMIN_AUTH: z.string().optional(),
  NODE_ENV: z.string().optional(),
  VERCEL: z.string().optional(),
  // El aviso por Telegram es opcional: sin estas dos el pedido se guarda igual.
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
  // Secreto del cron de Vercel (respaldo diario). Sin él, esa ruta responde siempre 401.
  CRON_SECRET: z.string().min(16).optional(),
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

// Variables de entorno validadas. Es perezoso (se valida al primer uso) para
// que `next build` funcione sin secretos; `instrumentation.ts` lo llama al
// arrancar el servidor para fallar pronto si algo falta.
export function env(): Env {
  if (cached) return cached;
  const result = schema.safeParse(process.env);
  if (!result.success) {
    // Solo los nombres, nunca los valores.
    const names = [...new Set(result.error.issues.map((i) => i.path.join(".")))];
    throw new Error(`Variables de entorno faltantes o inválidas: ${names.join(", ")}`);
  }
  cached = result.data;
  return cached;
}
