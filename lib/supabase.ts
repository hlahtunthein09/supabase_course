import { createClient } from "@supabase/supabase-js";

// The ! operator is TypeScript's non-null assertion — 
// it tells TypeScript "I'm sure this is a string, not undefined."
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export  const supabase = createClient(supabaseUrl, supabaseAnonKey);