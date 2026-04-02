// types/database.ts
// Supabase Database type with Relationships for postgrest-js v2

export type Database = {
  public: {
    Tables: {
      members: {
        Row: {
          id: string;
          uid: string;
          email: string;
          full_name: string;
          role: "Lead" | "Core" | "Member" | "Alumni";
          batch_year: number | null;
          invite_token: string | null;
          invited_by: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          uid: string;
          email: string;
          full_name: string;
          role: "Lead" | "Core" | "Member" | "Alumni";
          batch_year?: number | null;
          invite_token?: string | null;
          invited_by?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          uid?: string;
          email?: string;
          full_name?: string;
          role?: "Lead" | "Core" | "Member" | "Alumni";
          batch_year?: number | null;
          invite_token?: string | null;
          invited_by?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          member_id: string;
          bio: string | null;
          github_url: string | null;
          linkedin_url: string | null;
          portfolio_url: string | null;
          avatar_url: string | null;
          visibility_mode: "public" | "networking" | "ghost";
          archetype_primary: string | null;
          archetype_secondary: string | null;
          skills_raw: string[];
          xp_total: number;
          streak_count: number;
          streak_last_date: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          bio?: string | null;
          github_url?: string | null;
          linkedin_url?: string | null;
          portfolio_url?: string | null;
          avatar_url?: string | null;
          visibility_mode?: "public" | "networking" | "ghost";
          archetype_primary?: string | null;
          archetype_secondary?: string | null;
          skills_raw?: string[];
          xp_total?: number;
          streak_count?: number;
          streak_last_date?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          bio?: string | null;
          github_url?: string | null;
          linkedin_url?: string | null;
          portfolio_url?: string | null;
          avatar_url?: string | null;
          visibility_mode?: "public" | "networking" | "ghost";
          archetype_primary?: string | null;
          archetype_secondary?: string | null;
          skills_raw?: string[];
          xp_total?: number;
          streak_count?: number;
          streak_last_date?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: true;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      workshops: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          workshop_date: string;
          location: string | null;
          lead_id: string | null;
          required_skills: string[];
          xp_reward: number;
          late_xp_reward: number;
          max_attendees: number | null;
          resources_url: string | null;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          workshop_date: string;
          location?: string | null;
          lead_id?: string | null;
          required_skills?: string[];
          xp_reward?: number;
          late_xp_reward?: number;
          max_attendees?: number | null;
          resources_url?: string | null;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          workshop_date?: string;
          location?: string | null;
          lead_id?: string | null;
          required_skills?: string[];
          xp_reward?: number;
          late_xp_reward?: number;
          max_attendees?: number | null;
          resources_url?: string | null;
          is_published?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workshops_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      attendance: {
        Row: {
          id: string;
          member_id: string;
          workshop_id: string;
          checked_in_at: string;
          is_late: boolean;
          xp_earned: number;
        };
        Insert: {
          id?: string;
          member_id: string;
          workshop_id: string;
          checked_in_at: string;
          is_late?: boolean;
          xp_earned?: number;
        };
        Update: {
          id?: string;
          member_id?: string;
          workshop_id?: string;
          checked_in_at?: string;
          is_late?: boolean;
          xp_earned?: number;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_workshop_id_fkey";
            columns: ["workshop_id"];
            isOneToOne: false;
            referencedRelation: "workshops";
            referencedColumns: ["id"];
          },
        ];
      };
      badges: {
        Row: {
          id: string;
          member_id: string;
          badge_type: string;
          badge_name: string;
          category: "workshop" | "building" | "community" | "networking" | "special" | "secret";
          is_secret: boolean;
          earned_at: string;
          context: string | null;
        };
        Insert: {
          id?: string;
          member_id: string;
          badge_type: string;
          badge_name: string;
          category: "workshop" | "building" | "community" | "networking" | "special" | "secret";
          is_secret?: boolean;
          earned_at?: string;
          context?: string | null;
        };
        Update: {
          id?: string;
          member_id?: string;
          badge_type?: string;
          badge_name?: string;
          category?: "workshop" | "building" | "community" | "networking" | "special" | "secret";
          is_secret?: boolean;
          earned_at?: string;
          context?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "badges_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      endorsements: {
        Row: {
          id: string;
          endorser_id: string;
          endorsed_id: string;
          skill: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          endorser_id: string;
          endorsed_id: string;
          skill: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          endorser_id?: string;
          endorsed_id?: string;
          skill?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "endorsements_endorser_id_fkey";
            columns: ["endorser_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "endorsements_endorsed_id_fkey";
            columns: ["endorsed_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      connections: {
        Row: {
          id: string;
          member_a_id: string;
          member_b_id: string;
          connected_at: string;
        };
        Insert: {
          id?: string;
          member_a_id: string;
          member_b_id: string;
          connected_at?: string;
        };
        Update: {
          id?: string;
          member_a_id?: string;
          member_b_id?: string;
          connected_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "connections_member_a_id_fkey";
            columns: ["member_a_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "connections_member_b_id_fkey";
            columns: ["member_b_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      invite_tokens: {
        Row: {
          id: string;
          token: string;
          email: string | null;
          created_by: string | null;
          used_at: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          token: string;
          email?: string | null;
          created_by?: string | null;
          used_at?: string | null;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          token?: string;
          email?: string | null;
          created_by?: string | null;
          used_at?: string | null;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invite_tokens_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      site_config: {
        Row: {
          key: string;
          value: string | null;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "site_config_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      xp_transactions: {
        Row: {
          id: string;
          member_id: string;
          amount: number;
          reason: string;
          reference_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          amount: number;
          reason: string;
          reference_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          amount?: number;
          reason?: string;
          reference_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "xp_transactions_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_lead: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      get_my_role: {
        Args: Record<string, never>;
        Returns: string;
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

// Helper types for use across the app
export type Member = Database["public"]["Tables"]["members"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Workshop = Database["public"]["Tables"]["workshops"]["Row"];
export type Attendance = Database["public"]["Tables"]["attendance"]["Row"];
export type Badge = Database["public"]["Tables"]["badges"]["Row"];
export type Endorsement = Database["public"]["Tables"]["endorsements"]["Row"];
export type XPTransaction = Database["public"]["Tables"]["xp_transactions"]["Row"];
export type InviteToken = Database["public"]["Tables"]["invite_tokens"]["Row"];
