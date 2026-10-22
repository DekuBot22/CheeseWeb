import Link from "next/link";
import { SETTINGS_NAV } from "../nav-items";

export function SettingsLink() {
  const { href, label, Icon } = SETTINGS_NAV;
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-sm text-tinta-2 hover:bg-hoja-2 hover:text-tinta"
    >
      <Icon width={20} height={20} />
    </Link>
  );
}
