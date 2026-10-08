"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Rol } from "@/lib/types";
import { NAV_ITEMS, isActive } from "./nav-items";
import { NavIcon } from "./nav-icon";

export function BottomNav({ rol }: { rol: Rol }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-safe backdrop-blur supports-[backdrop-filter]:bg-card/85 md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {NAV_ITEMS[rol].map((item) => {
          const active = isActive(pathname, item);
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors duration-150",
                  active ? "text-primary dark:text-amber" : "text-muted hover:text-ink",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-150",
                    active && "bg-amber-soft",
                  )}
                >
                  <NavIcon name={item.key} className="size-[22px]" />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
