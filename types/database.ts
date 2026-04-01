// types/database.ts
// Auto-generate the full version with: npx supabase gen types typescript --local

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
        Insert: Omit<Database["public"]["Tables"]["members"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["members"]["Insert"]>;
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
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "id" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
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
        Insert: Omit<Database["public"]["Tables"]["workshops"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["workshops"]["Insert"]>;
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
        Insert: Omit<Database["public"]["Tables"]["attendance"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["attendance"]["Insert"]>;
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
        Insert: Omit<Database["public"]["Tables"]["badges"]["Row"], "id" | "earned_at">;
        Update: Partial<Database["public"]["Tables"]["badges"]["Insert"]>;
      };
      endorsements: {
        Row: {
          id: string;
          endorser_id: string;
          endorsed_id: string;
          skill: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["endorsements"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["endorsements"]["Insert"]>;
      };
      connections: {
        Row: {
          id: string;
          member_a_id: string;
          member_b_id: string;
          connected_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["connections"]["Row"], "id" | "connected_at">;
        Update: never;
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
        Insert: Omit<Database["public"]["Tables"]["invite_tokens"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["invite_tokens"]["Insert"]>;
      };
      site_config: {
        Row: {
          key: string;
          value: string | null;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: Database["public"]["Tables"]["site_config"]["Row"];
        Update: Partial<Database["public"]["Tables"]["site_config"]["Row"]>;
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
        Insert: Omit<Database["public"]["Tables"]["xp_transactions"]["Row"], "id" | "created_at">;
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_lead: { Args: Record<string, never>; Returns: boolean };
      get_my_role: { Args: Record<string, never>; Returns: string };
    };
    Enums: Record<string, never>;
  };
};
