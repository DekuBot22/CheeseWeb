export type Unit = "kg" | "lb";
export type CheeseType = "duro" | "semi" | "blando";
export type SaltLevel = "alto" | "intermedio" | "bajo";
export type OrderStatus = "pendiente" | "completado";

export interface Settings {
  id: number;
  price_per_kg: number;
  updated_at: string;
}

export interface Order {
  id: string;
  client_name: string;
  quantity: number;
  unit: Unit;
  cheese_type: CheeseType;
  salt_level: SaltLevel;
  price_per_kg_snapshot: number;
  total: number;
  status: OrderStatus;
  created_at: string;
}
