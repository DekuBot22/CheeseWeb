export interface Purchase {
  id: string;
  purchase_date: string;
  kg: number;
  total_cost: number;
  description: string | null;
  created_at: string;
}

export interface ProviderPayment {
  id: string;
  payment_date: string;
  amount: number;
  method: string | null;
  notes: string | null;
  created_at: string;
}
