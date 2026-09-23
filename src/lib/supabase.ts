import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Faltan las variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY"
  );
}

// Este cliente usa la service role key y solo debe importarse desde
// código de servidor (route handlers / server components). El navegador
// nunca habla directamente con Supabase.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});
