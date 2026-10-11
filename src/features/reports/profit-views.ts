// Períodos de la pantalla Ganancias: una semana, las últimas 12 o todo el tiempo.
export const PROFIT_VIEWS = ["semana", "12", "todo"] as const;
export type ProfitView = (typeof PROFIT_VIEWS)[number];
