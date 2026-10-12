// Cuántas semanas muestra la página de gráficas (parámetro ?semanas=). La primera es la de por defecto.
export const CHART_WEEKS = ["12", "8", "26"] as const;
export type ChartWeeks = (typeof CHART_WEEKS)[number];
