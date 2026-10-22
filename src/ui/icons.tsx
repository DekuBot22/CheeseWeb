import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconSearch = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </Icon>
);
export const IconPlus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);
export const IconChevronLeft = (p: IconProps) => (
  <Icon {...p}>
    <path d="m14.5 6-6 6 6 6" />
  </Icon>
);
export const IconChevronRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="m9.5 6 6 6-6 6" />
  </Icon>
);
export const IconClose = (p: IconProps) => (
  <Icon {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Icon>
);
export const IconDownload = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 4v11M7.5 11 12 15.5 16.5 11M5 20h14" />
  </Icon>
);
export const IconUnlock = (p: IconProps) => (
  <Icon {...p}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 7.5-2" />
  </Icon>
);

// Íconos del menú (tomados del diseño "Bodega sobria"): rejilla de 18 px y trazo de 1,75.
// Tamaño por defecto 18; el menú inferior los pide a 22 y la barra superior a 20.
function NavIcon({ children, ...props }: IconProps) {
  return (
    <Icon viewBox="0 0 18 18" width={18} height={18} strokeWidth={1.75} {...props}>
      {children}
    </Icon>
  );
}

export const IconHome = (p: IconProps) => (
  <NavIcon {...p}>
    <path d="M2.25 6.75 9 1.5l6.75 5.25V15a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5V6.75Z" />
    <path d="M6.75 16.5V9h4.5v7.5" />
  </NavIcon>
);
export const IconOrders = (p: IconProps) => (
  <NavIcon {...p}>
    <path d="M6.75 1.5h4.5c.414 0 .75.336.75.75v1.5a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 6 3.75v-1.5a.75.75 0 0 1 .75-.75Z" />
    <path d="M12 3h1.5A1.5 1.5 0 0 1 15 4.5V15a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 3 15V4.5A1.5 1.5 0 0 1 4.5 3H6" />
    <path d="M9 8.25h3M9 12h3M6 8.25h.0075M6 12h.0075" />
  </NavIcon>
);
export const IconClients = (p: IconProps) => (
  <NavIcon {...p}>
    <path d="M12 15.75v-1.5a3 3 0 0 0-3-3H4.5a3 3 0 0 0-3 3v1.5" />
    <path d="M9.75 5.25a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path d="M16.5 15.75v-1.5a3 3 0 0 0-2.25-2.9025M12 2.3475a3 3 0 0 1 0 5.8125" />
  </NavIcon>
);
export const IconPurchases = (p: IconProps) => (
  <NavIcon {...p}>
    <path d="M4.5 1.5 2.25 4.5V15a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5V4.5l-2.25-3h-9Z" />
    <path d="M2.25 4.5h13.5" />
    <path d="M12 7.5a3 3 0 0 1-6 0" />
  </NavIcon>
);
export const IconProfits = (p: IconProps) => (
  <NavIcon {...p}>
    <path d="m16.5 5.25-6.375 6.375L6.375 7.875 1.5 12.75" />
    <path d="M12 5.25h4.5v4.5" />
  </NavIcon>
);
export const IconCharts = (p: IconProps) => (
  <NavIcon {...p}>
    <path d="M2.25 2.25v13.5h13.5" />
    <path d="M13.5 12.75v-6M9.75 12.75v-9M6 12.75V10.5" />
  </NavIcon>
);
export const IconSettings = (p: IconProps) => (
  <NavIcon {...p}>
    <path d="M15.75 3H10.5M7.5 3H2.25M15.75 9H9M6 9H2.25M15.75 15H12M9 15H2.25" />
    <path d="M10.5 1.5v3M6 7.5v3M12 13.5v3" />
  </NavIcon>
);
export const IconLogout = (p: IconProps) => (
  <NavIcon viewBox="0 0 20 20" width={20} height={20} {...p}>
    <path d="M7.5 17.5H4.167A1.667 1.667 0 0 1 2.5 15.833V4.167A1.667 1.667 0 0 1 4.167 2.5H7.5" />
    <path d="m13.333 14.167 4.167-4.167-4.167-4.167M17.5 10h-10" />
  </NavIcon>
);
