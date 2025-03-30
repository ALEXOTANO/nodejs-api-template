import { createClient } from "@supabase/supabase-js";

export const SupabaseService = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_ADMIN_KEY as string
);
