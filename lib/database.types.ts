// Generado desde Supabase (proyecto ydedlgstgrvuppnqhsdu). No editar a mano.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      confirmaciones: {
        Row: {
          calidad_apta: boolean;
          created_at: string;
          error_pago: string | null;
          estado_pago: string;
          id: string;
          importe_mxn: number | null;
          litros_reales: number;
          recolector_id: string;
          referencia_pago: string | null;
          solicitud_id: string;
          tarifa_demo: number;
        };
        Insert: {
          calidad_apta: boolean;
          created_at?: string;
          error_pago?: string | null;
          estado_pago?: string;
          id?: string;
          importe_mxn?: number | null;
          litros_reales: number;
          recolector_id?: string;
          referencia_pago?: string | null;
          solicitud_id: string;
          tarifa_demo?: number;
        };
        Update: {
          calidad_apta?: boolean;
          created_at?: string;
          error_pago?: string | null;
          estado_pago?: string;
          id?: string;
          importe_mxn?: number | null;
          litros_reales?: number;
          recolector_id?: string;
          referencia_pago?: string | null;
          solicitud_id?: string;
          tarifa_demo?: number;
        };
        Relationships: [];
      };
      solicitudes: {
        Row: {
          created_at: string;
          direccion: string;
          id: string;
          litros_estimados: number;
          nombre_comercio: string;
          notas: string | null;
          telefono_contacto: string | null;
          vendedor_id: string;
          zona: string;
        };
        Insert: {
          created_at?: string;
          direccion: string;
          id?: string;
          litros_estimados: number;
          nombre_comercio: string;
          notas?: string | null;
          telefono_contacto?: string | null;
          vendedor_id?: string;
          zona?: string;
        };
        Update: {
          created_at?: string;
          direccion?: string;
          id?: string;
          litros_estimados?: number;
          nombre_comercio?: string;
          notas?: string | null;
          telefono_contacto?: string | null;
          vendedor_id?: string;
          zona?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          created_at: string;
          direccion: string | null;
          email: string;
          empresa: string | null;
          id: string;
          nombre: string | null;
          nombre_comercio: string | null;
          rol: string;
          telefono: string | null;
        };
        Insert: {
          created_at?: string;
          direccion?: string | null;
          email: string;
          empresa?: string | null;
          id: string;
          nombre?: string | null;
          nombre_comercio?: string | null;
          rol: string;
          telefono?: string | null;
        };
        Update: {
          created_at?: string;
          direccion?: string | null;
          email?: string;
          empresa?: string | null;
          id?: string;
          nombre?: string | null;
          nombre_comercio?: string | null;
          rol?: string;
          telefono?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      recolecciones_por_dia: {
        Row: {
          dia: string | null;
          importe_mxn: number | null;
          litros: number | null;
          recolecciones: number | null;
        };
        Relationships: [];
      };
      resumen_mvp_vista: {
        Row: {
          estimacion_agua_l: number | null;
          litros_recolectados: number | null;
          recompensa_simulada_mxn: number | null;
        };
        Relationships: [];
      };
      resumen_publico: {
        Row: {
          estimacion_agua_l: number | null;
          litros_recolectados: number | null;
          pendientes: number | null;
          recolecciones: number | null;
          recolectores: number | null;
          recompensa_simulada_mxn: number | null;
          solicitudes_totales: number | null;
          vendedores: number | null;
        };
        Relationships: [];
      };
      solicitudes_estado: {
        Row: {
          calidad_apta: boolean | null;
          confirmacion_id: string | null;
          confirmada_at: string | null;
          created_at: string | null;
          direccion: string | null;
          error_pago: string | null;
          estado_pago: string | null;
          estado_pago_texto: string | null;
          estado_recoleccion: string | null;
          id: string | null;
          importe_mxn: number | null;
          litros_estimados: number | null;
          litros_reales: number | null;
          nombre_comercio: string | null;
          notas: string | null;
          recolector_id: string | null;
          referencia_pago: string | null;
          telefono_contacto: string | null;
          vendedor_id: string | null;
          zona: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      mi_rol: { Args: never; Returns: string };
      resumen_mvp: {
        Args: never;
        Returns: {
          estimacion_agua_l: number;
          litros_recolectados: number;
          recompensa_simulada_mxn: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database["public"];

export type TableRow<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];
export type ViewRow<T extends keyof PublicSchema["Views"]> =
  PublicSchema["Views"][T]["Row"];
