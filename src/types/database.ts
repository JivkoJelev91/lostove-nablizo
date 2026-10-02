export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.18';
  };
  public: {
    Tables: {
      equipment: {
        Row: {
          icon: string | null;
          id: string;
          name: string;
        };
        Insert: {
          icon?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          icon?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      favorites: {
        Row: {
          created_at: string;
          spot_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          spot_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          spot_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'favorites_spot_id_fkey';
            columns: ['spot_id'];
            isOneToOne: false;
            referencedRelation: 'spots';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'favorites_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      photos: {
        Row: {
          created_at: string;
          height: number;
          id: string;
          size: number;
          spot_id: string;
          storage_path: string;
          user_id: string;
          width: number;
        };
        Insert: {
          created_at?: string;
          height: number;
          id?: string;
          size: number;
          spot_id: string;
          storage_path: string;
          user_id: string;
          width: number;
        };
        Update: {
          created_at?: string;
          height?: number;
          id?: string;
          size?: number;
          spot_id?: string;
          storage_path?: string;
          user_id?: string;
          width?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'photos_spot_id_fkey';
            columns: ['spot_id'];
            isOneToOne: false;
            referencedRelation: 'spots';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'photos_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          id: string;
          username: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          id: string;
          username: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          id?: string;
          username?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          reason: string;
          spot_id: string;
          status: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          reason: string;
          spot_id: string;
          status?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          reason?: string;
          spot_id?: string;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reports_spot_id_fkey';
            columns: ['spot_id'];
            isOneToOne: false;
            referencedRelation: 'spots';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      reviews: {
        Row: {
          comment: string | null;
          created_at: string;
          id: string;
          rating: number;
          spot_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          rating: number;
          spot_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          rating?: number;
          spot_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reviews_spot_id_fkey';
            columns: ['spot_id'];
            isOneToOne: false;
            referencedRelation: 'spots';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      spot_equipment: {
        Row: {
          condition: string;
          equipment_id: string;
          quantity: number;
          spot_id: string;
        };
        Insert: {
          condition?: string;
          equipment_id: string;
          quantity?: number;
          spot_id: string;
        };
        Update: {
          condition?: string;
          equipment_id?: string;
          quantity?: number;
          spot_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'spot_equipment_equipment_id_fkey';
            columns: ['equipment_id'];
            isOneToOne: false;
            referencedRelation: 'equipment';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'spot_equipment_spot_id_fkey';
            columns: ['spot_id'];
            isOneToOne: false;
            referencedRelation: 'spots';
            referencedColumns: ['id'];
          },
        ];
      };
      spot_verifications: {
        Row: {
          created_at: string;
          id: string;
          spot_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          spot_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          spot_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'spot_verifications_spot_id_fkey';
            columns: ['spot_id'];
            isOneToOne: false;
            referencedRelation: 'spots';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'spot_verifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      spots: {
        Row: {
          city: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          id: string;
          latitude: number;
          longitude: number;
          name: string;
          osm_id: number | null;
          osm_type: string | null;
          rating_average: number;
          rating_count: number;
          source: string;
          status: string;
          updated_at: string;
          verification_source: string | null;
          verified_at: string | null;
          verified_by: string | null;
        };
        Insert: {
          city?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          latitude: number;
          longitude: number;
          name: string;
          osm_id?: number | null;
          osm_type?: string | null;
          rating_average?: number;
          rating_count?: number;
          source?: string;
          status?: string;
          updated_at?: string;
          verification_source?: string | null;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Update: {
          city?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          latitude?: number;
          longitude?: number;
          name?: string;
          osm_id?: number | null;
          osm_type?: string | null;
          rating_average?: number;
          rating_count?: number;
          source?: string;
          status?: string;
          updated_at?: string;
          verification_source?: string | null;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'spots_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'spots_verified_by_fkey';
            columns: ['verified_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_profile_id: { Args: never; Returns: string };
      is_moderator: { Args: never; Returns: boolean };
      moderate_spot: {
        Args: {
          p_spot_id: string;
          p_status: string;
        };
        Returns: undefined;
      };
      // Hand-maintained until the migration is applied and `pnpm db:types` can regenerate this
      // file. The shape is what the generator emits for a `returns table` function: Args named
      // after the parameters, Returns an array of the result columns.
      nearby_spots: {
        Args: {
          p_latitude: number;
          p_longitude: number;
          p_radius_m: number;
        };
        Returns: {
          city: string | null;
          created_by: string | null;
          description: string | null;
          distance_m: number;
          id: string;
          latitude: number;
          longitude: number;
          name: string;
          photos: Json;
          rating_average: number;
          rating_count: number;
          spot_equipment: Json;
          status: string;
          verification_source: string | null;
          verified_at: string | null;
        }[];
      };
      recompute_spot_rating: {
        Args: { target_spot_id: string };
        Returns: undefined;
      };
      search_spots: {
        Args: {
          p_query: string;
          p_limit?: number;
        };
        Returns: {
          city: string | null;
          created_by: string | null;
          description: string | null;
          id: string;
          latitude: number;
          longitude: number;
          name: string;
          photos: Json;
          rating_average: number;
          rating_count: number;
          spot_equipment: Json;
          status: string;
          verification_source: string | null;
          verified_at: string | null;
        }[];
      };
      verify_spot: {
        Args: { p_spot_id: string };
        Returns: undefined;
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
