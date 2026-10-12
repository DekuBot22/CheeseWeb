import { isCronRequest } from "@/server/cron-auth";
import { handle, ok } from "@/server/http";
import { sendDailyBackup } from "@/features/reports/server/send-backup";

// El respaldo arma un Excel y un JSON: puede tardar más que una consulta normal.
export const maxDuration = 60;

// Lo llama el cron de Vercel (vercel.json) una vez al día. Esta ruta NO está bajo
// /api/admin (no hay cookie): se protege sola con CRON_SECRET.
export const GET = handle(async (request) => {
  if (!isCronRequest(request)) return ok({ error: "No autorizado" }, 401);
  return ok(await sendDailyBackup());
});
