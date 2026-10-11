import { KG_PER_LB } from "./units";

// Ganancia de una unidad (por libra o por kilo, lo que se pase) y su margen
// sobre el precio. Ejemplo: precio 13.000, costo 11.000 → gana 2.000 (15,4 %).
export function unitProfit(price: number, cost: number) {
  const ganancia = price - cost;
  return { ganancia, margen: price > 0 ? (ganancia / price) * 100 : 0 };
}

// Ganancia real por libra de un período: ganancia ÷ libras vendidas.
// null cuando no se vendió nada (no hay a qué repartirla).
export function profitPerLb(profit: number, kgSold: number): number | null {
  return kgSold > 0 ? profit / (kgSold / KG_PER_LB) : null;
}
