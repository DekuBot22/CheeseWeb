import type { NextRequest } from "next/server";
import { ValidationError } from "@/server/errors";
import { handle } from "@/server/http";
import { buildExportWorkbook } from "@/features/reports/server/build-export-workbook";
import { getExportData } from "@/features/reports/server/get-export-data";

const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const GET = handle(async (request: NextRequest) => {
  const params = request.nextUrl.searchParams;
  const startParam = params.get("start");
  const endParam = params.get("end");

  const start = startParam ? new Date(startParam) : new Date(0);
  const end = endParam ? new Date(endParam) : new Date();
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new ValidationError("Rango de fechas inválido");
  }

  const data = await getExportData(start, end);
  const file = await buildExportWorkbook(data);

  return new Response(file as BodyInit, {
    headers: {
      "Content-Type": XLSX,
      "Content-Disposition": `attachment; filename="quesoweb-${data.startDate}-a-${data.endDate}.xlsx"`,
    },
  });
});
