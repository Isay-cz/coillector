import { BarChart3, ClipboardList, History, ListChecks, PlusCircle, ScanLine, UserRound } from "lucide-react";
import type { NavItemKey } from "./nav-items";

const ICONS = {
  solicitudes: ListChecks,
  nueva: PlusCircle,
  impacto: BarChart3,
  perfil: UserRound,
  pendientes: ClipboardList,
  escanear: ScanLine,
  historial: History,
} satisfies Record<NavItemKey, unknown>;

export function NavIcon({ name, className }: { name: NavItemKey; className?: string }) {
  const Icon = ICONS[name];
  return <Icon className={className} aria-hidden />;
}
