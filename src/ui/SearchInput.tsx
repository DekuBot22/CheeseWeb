"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IconSearch } from "./icons";

// Búsqueda que escribe ?q= en la URL (con espera de 250 ms) para que el
// filtrado ocurra en el servidor y el botón "atrás" funcione.
export function SearchInput({ placeholder = "Buscar…", label }: { placeholder?: string; label: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  function onChange(next: string) {
    setValue(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const sp = new URLSearchParams(params.toString());
      if (next.trim()) sp.set("q", next.trim());
      else sp.delete("q");
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }, 250);
  }

  return (
    <div className="relative">
      <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tinta-3" />
      <input
        type="search"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-sm border border-linea-fuerte bg-hoja caret-acento pl-10 pr-3 text-sm text-tinta placeholder:text-tinta-3 md:w-72"
      />
    </div>
  );
}
