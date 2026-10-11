import {
  IconClients,
  IconHome,
  IconOrders,
  IconProfits,
  IconPurchases,
  IconSettings,
} from "@/ui/icons";

export interface NavItem {
  href: string;
  label: string;
  Icon: typeof IconHome;
}

// Para agregar una sección al panel: una línea aquí y su carpeta en app/admin/(panel)/.
export const MAIN_NAV: NavItem[] = [
  { href: "/admin", label: "Inicio", Icon: IconHome },
  { href: "/admin/pedidos", label: "Pedidos", Icon: IconOrders },
  { href: "/admin/clientes", label: "Clientes", Icon: IconClients },
  { href: "/admin/compras", label: "Compras", Icon: IconPurchases },
  { href: "/admin/ganancias", label: "Ganancias", Icon: IconProfits },
];

export const SETTINGS_NAV: NavItem = { href: "/admin/ajustes", label: "Ajustes", Icon: IconSettings };

export function isActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}
