// Compra a la que se le puede ligar un descuento, con lo que aún se puede
// descontar. Vive aquí (y no en server/) porque la usan componentes y servidor.
export interface PurchaseOption {
  id: string;
  label: string;
  date: string;
  remaining: number;
}
