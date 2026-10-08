import type { TableRow, ViewRow } from "@/lib/database.types";

export type Rol = "vendedor" | "recolector";
export type Perfil = TableRow<"users">;
export type SolicitudEstado = ViewRow<"solicitudes_estado">;
export type ResumenPublico = ViewRow<"resumen_publico">;
export type RecoleccionDia = ViewRow<"recolecciones_por_dia">;
export type ResumenUsuario = ViewRow<"resumen_mvp_vista">;
export type EstadoPago = "pendiente" | "simulado_ok" | "error";

export function homeForRole(rol: string | null | undefined): string {
  return rol === "recolector" ? "/recolector" : "/vendedor";
}

export function isRecolectada(s: Pick<SolicitudEstado, "confirmacion_id">) {
  return s.confirmacion_id != null;
}

/** Solo acepta rutas internas para evitar redirecciones abiertas. */
export function safeNext(next: string | null | undefined): string | null {
  if (!next) return null;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}

export function isUuid(value: string | null | undefined): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value ?? "");
}
