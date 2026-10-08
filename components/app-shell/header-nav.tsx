"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Rol } from "@/lib/types";
import { NAV_ITEMS, isActive } from "./nav-items";
import { NavIcon } from "./nav-icon";

/** Navegación en el header para pantallas medianas y grandes. */
export function HeaderNav({ rol }: { rol: Rol }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navegación principal" className="hidden md:block">
      <ul className="flex items-center gap-1">
        {NAV_ITEMS[rol]
          .filter((i) => i.key !== "perfil")
          .map((item) => {
            const active = isActive(pathname, item);
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors duration-150",
                    active ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <NavIcon name={item.key} className="size-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
      </ul>
    </nav>
  );
}
