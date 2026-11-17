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

// ---------------------------------------------------------------------------
// Identificador de acceso: celular o correo.
// Sin proveedor de SMS, un celular se guarda en Supabase Auth como un correo
// técnico `<10 dígitos>@tel.coillector.app` (no recibe correos).

export const DOMINIO_TELEFONO = "tel.coillector.app";

export type Identificador =
  | { tipo: "telefono"; email: string; telefono: string; error: null }
  | { tipo: "correo"; email: string; telefono: null; error: null }
  | { tipo: null; email: null; telefono: null; error: string };

/** Acepta "55 1234 5678", "+52 55 1234 5678", "5215512345678" o un correo. */
export function parseIdentificador(raw: string): Identificador {
  const v = raw.trim();
  if (!v) return { tipo: null, email: null, telefono: null, error: "Escribe tu celular o tu correo." };
  if (v.includes("@")) {
    const error = validateEmail(v);
    return error
      ? { tipo: null, email: null, telefono: null, error }
      : { tipo: "correo", email: v.toLowerCase(), telefono: null, error: null };
  }
  if (/[a-z]/i.test(v)) return { tipo: null, email: null, telefono: null, error: "Escribe un celular de 10 dígitos o un correo válido." };
  let digits = normalizePhone(v);
  if (digits.length === 13 && digits.startsWith("521")) digits = digits.slice(3);
  if (digits.length === 12 && digits.startsWith("52")) digits = digits.slice(2);
  if (digits.length !== 10) return { tipo: null, email: null, telefono: null, error: "El celular debe tener 10 dígitos." };
  return { tipo: "telefono", email: `${digits}@${DOMINIO_TELEFONO}`, telefono: digits, error: null };
}

/** Para mostrar: el celular si la cuenta se creó con celular, si no el correo. */
export function contactoVisible(email: string): { tipo: "telefono" | "correo"; valor: string } {
  const m = email.match(new RegExp(`^(\\d{10})@${DOMINIO_TELEFONO.replace(/\./g, "\\.")}$`));
  if (m) return { tipo: "telefono", valor: `${m[1].slice(0, 2)} ${m[1].slice(2, 6)} ${m[1].slice(6)}` };
  return { tipo: "correo", valor: email };
}
