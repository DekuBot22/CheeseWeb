import { handle, ok } from "@/server/http";
import { getWeekFigures } from "@/features/reports/server/get-week-figures";

// Ganancia y por cobrar de cada semana de la lista del selector (solo lectura).
export const GET = handle(async () => ok({ figures: await getWeekFigures() }));
