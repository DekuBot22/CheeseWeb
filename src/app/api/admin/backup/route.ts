import { handle, ok } from "@/server/http";
import { sendDailyBackup } from "@/features/reports/server/send-backup";

export const maxDuration = 60;

// Botón "Enviar respaldo ahora" de Ajustes (protegido por la sesión del panel).
export const POST = handle(async () => ok(await sendDailyBackup()));
