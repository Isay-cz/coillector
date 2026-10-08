export const LITROS_ERROR = "Ingresa una cantidad entre 0.01 y 1000 litros (máx. 2 decimales).";

/** Valida litros con las mismas reglas que la BD: > 0, ≤ 1000, máximo 2 decimales. */
export function parseLitros(raw: string): { value: number | null; error: string | null } {
  const text = raw.trim().replace(",", ".");
  if (!text) return { value: null, error: LITROS_ERROR };
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return { value: null, error: LITROS_ERROR };
  const value = Number(text);
  if (!Number.isFinite(value) || value <= 0 || value > 1000) return { value: null, error: LITROS_ERROR };
  return { value, error: null };
}

export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function validatePhone(raw: string, { required = true } = {}): string | null {
  const digits = normalizePhone(raw);
  if (!digits) return required ? "Ingresa tu teléfono a 10 dígitos." : null;
  if (digits.length !== 10) return "El teléfono debe tener 10 dígitos.";
  return null;
}

export function validateEmail(raw: string): string | null {
  const v = raw.trim();
  if (!v) return "Ingresa tu correo.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Revisa el formato del correo.";
  return null;
}

export function validatePassword(raw: string): string | null {
  if (raw.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  return null;
}

export function validateRequired(raw: string, label: string): string | null {
  return raw.trim() ? null : `${label} es obligatorio.`;
}

export const NOTAS_MAX = 280;
