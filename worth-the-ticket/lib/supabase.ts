import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      reviews: {
        Row: import("@/types").Review;
        Insert: Omit<import("@/types").Review, "id" | "created_at">;
        Update: Partial<Omit<import("@/types").Review, "id" | "created_at">>;
      };
      generated_content: {
        Row: import("@/types").GeneratedContent;
        Insert: Omit<
          import("@/types").GeneratedContent,
          "id" | "created_at"
        >;
        Update: Partial<
          Omit<import("@/types").GeneratedContent, "id" | "created_at">
        >;
      };
      analytics: {
        Row: import("@/types").Analytics;
        Insert: Omit<import("@/types").Analytics, "id" | "created_at">;
        Update: Partial<Omit<import("@/types").Analytics, "id" | "created_at">>;
      };
      content_calendar: {
        Row: import("@/types").ContentCalendar;
        Insert: Omit<import("@/types").ContentCalendar, "id" | "created_at">;
        Update: Partial<
          Omit<import("@/types").ContentCalendar, "id" | "created_at">
        >;
      };
      post_ideas: {
        Row: import("@/types").PostIdea;
        Insert: Omit<import("@/types").PostIdea, "id" | "created_at">;
        Update: Partial<Omit<import("@/types").PostIdea, "id" | "created_at">>;
      };
    };
  };
};
