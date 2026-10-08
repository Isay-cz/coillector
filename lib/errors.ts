type ErrorLike = { message?: string; details?: string | null; code?: string; hint?: string | null } | null | undefined;

const GENERIC = "Algo salió mal. Intenta de nuevo.";

/** Traduce errores de Postgres/RLS a mensajes amigables en español. */
export function friendlyDbError(error: ErrorLike): string {
  const text = `${error?.message ?? ""} ${error?.details ?? ""} ${error?.hint ?? ""}`;

  if (/confirmaciones_solicitud_id_key/.test(text) || (error?.code === "23505" && /confirmaciones/.test(text))) {
    return "Esta solicitud ya fue confirmada.";
  }
  if (/confirmaciones_calidad_apta_check/.test(text)) {
    return "Solo se pueden registrar entregas que cumplan la calidad mínima.";
  }
  if (/_litros_\w*_check/.test(text)) {
    return "Ingresa una cantidad entre 0.01 y 1000 litros (máx. 2 decimales).";
  }
  if (/Solo una cuenta de recolector puede confirmar entregas/.test(text)) {
    return "Necesitas una cuenta de recolector para confirmar.";
  }
  if (/row-level security/i.test(text)) {
    return "No tienes permiso para esta acción. Revisa tu sesión.";
  }
  if (/solicitudes_notas_len/.test(text)) return "Las notas pueden tener máximo 280 caracteres.";
  if (/solicitudes_(nombre_comercio|direccion)_check/.test(text)) {
    return "El nombre del comercio y la dirección no pueden estar vacíos.";
  }
  if (/Failed to fetch|NetworkError|Load failed/i.test(text)) {
    return "Sin conexión. Revisa tu internet e intenta de nuevo.";
  }

  console.error("[Coillector] Error de Supabase:", error);
  return GENERIC;
}

/** Traduce errores de Supabase Auth. */
export function friendlyAuthError(error: ErrorLike): string {
  const text = error?.message ?? "";
  const code = error?.code ?? "";

  if (code === "signup_disabled" || code === "email_provider_disabled" || /Signups not allowed|signups are disabled/i.test(text)) {
    return "El registro de cuentas nuevas está desactivado por ahora. Entra con una cuenta demo.";
  }
  if (code === "invalid_credentials" || /Invalid login credentials/i.test(text)) {
    return "Correo o contraseña incorrectos.";
  }
  if (code === "email_not_confirmed" || /Email not confirmed/i.test(text)) {
    return "Confirma tu correo antes de entrar (revisa tu bandeja de entrada).";
  }
  if (code === "user_already_exists" || /already registered|already exists/i.test(text)) {
    return "Ya existe una cuenta con este correo. Inicia sesión.";
  }
  if (code === "weak_password" || /Password should/i.test(text)) {
    return "La contraseña es muy débil. Usa al menos 8 caracteres.";
  }
  if (code === "over_email_send_rate_limit" || /rate limit/i.test(text)) {
    return "Demasiados intentos. Espera unos minutos o entra con una cuenta demo.";
  }
  if (code === "email_address_invalid" || /invalid.*email|email.*invalid/i.test(text)) {
    return "Ese correo no es válido. Usa otro.";
  }
  if (/Failed to fetch|NetworkError|Load failed/i.test(text)) {
    return "Sin conexión. Revisa tu internet e intenta de nuevo.";
  }

  console.error("[Coillector] Error de autenticación:", error);
  return GENERIC;
}
