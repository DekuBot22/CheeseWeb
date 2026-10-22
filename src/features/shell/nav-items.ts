import {
  IconCharts,
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

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const INICIO: NavItem = { href: "/admin", label: "Inicio", Icon: IconHome };
const PEDIDOS: NavItem = { href: "/admin/pedidos", label: "Pedidos", Icon: IconOrders };
const CLIENTES: NavItem = { href: "/admin/clientes", label: "Clientes", Icon: IconClients };
const COMPRAS: NavItem = { href: "/admin/compras", label: "Compras", Icon: IconPurchases };
const GANANCIAS: NavItem = { href: "/admin/ganancias", label: "Ganancias", Icon: IconProfits };
const GRAFICAS: NavItem = { href: "/admin/ganancias/graficas", label: "Gráficas", Icon: IconCharts };
export const SETTINGS_NAV: NavItem = { href: "/admin/ajustes", label: "Ajustes", Icon: IconSettings };

// Barra inferior del móvil: Gráficas no cabe (Ajustes y Salir van en la barra superior).
export const MAIN_NAV: NavItem[] = [INICIO, PEDIDOS, CLIENTES, COMPRAS, GANANCIAS];

// Menú lateral: las mismas secciones, agrupadas.
// Para agregar una sección al panel: una línea aquí y su carpeta en app/admin/(panel)/.
export const SIDEBAR_GROUPS: NavGroup[] = [
  { label: "Día a día", items: [INICIO, PEDIDOS, CLIENTES] },
  { label: "Cuentas", items: [COMPRAS, GANANCIAS, GRAFICAS] },
  { label: "Sistema", items: [SETTINGS_NAV] },
];

// Gráficas cuelga de /admin/ganancias: sin esta regla las dos se verían activas a la vez.
export function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  if (href === GANANCIAS.href) {
    return pathname.startsWith(href) && !pathname.startsWith(GRAFICAS.href);
  }
  return pathname.startsWith(href);
}
