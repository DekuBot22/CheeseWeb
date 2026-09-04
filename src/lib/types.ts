export type Unit = "kg" | "lb";
export type CheeseType = "duro" | "semi" | "blando";
export type SaltLevel = "alto" | "intermedio" | "bajo";
export type OrderStatus = "pendiente" | "completado";
export type PaymentStatus = "debe" | "parcial" | "pagado";

export interface Settings {
  id: number;
  price_per_kg: number;
  cost_per_kg: number;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  credit_balance: number;
  created_at: string;
}

export interface Order {
  id: string;
  client_id: string | null;
  client_name: string;
  quantity: number;
  unit: Unit;
  cheese_type: CheeseType;
  salt_level: SaltLevel;
  price_per_kg_snapshot: number;
  cost_per_kg_snapshot: number;
  total: number;
  amount_paid: number;
  payment_status: PaymentStatus;
  status: OrderStatus;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: string | null;
  created_at: string;
}
