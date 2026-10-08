import type { Rol } from "@/lib/types";

export type NavItemKey = "solicitudes" | "nueva" | "impacto" | "perfil" | "pendientes" | "escanear" | "historial";

export type NavItem = { key: NavItemKey; href: string; label: string; exact?: boolean };

export const NAV_ITEMS: Record<Rol, NavItem[]> = {
  vendedor: [
    { key: "solicitudes", href: "/vendedor", label: "Solicitudes", exact: true },
    { key: "nueva", href: "/vendedor/nueva", label: "Nueva" },
    { key: "impacto", href: "/dashboard", label: "Impacto" },
    { key: "perfil", href: "/perfil", label: "Perfil" },
  ],
  recolector: [
    { key: "pendientes", href: "/recolector", label: "Pendientes", exact: true },
    { key: "escanear", href: "/recolector/escanear", label: "Escanear" },
    { key: "historial", href: "/recolector/historial", label: "Historial" },
    { key: "perfil", href: "/perfil", label: "Perfil" },
  ],
};

export function isActive(pathname: string, item: NavItem) {
  if (item.exact) {
    // "/vendedor" también cubre el detalle de una solicitud.
    return pathname === item.href || pathname.startsWith(`${item.href}/solicitud`);
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
