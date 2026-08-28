import { createClient } from '@supabase/supabase-js';
import { publishableKey, supabaseUrl } from "@craudioviz/platform-sdk";

const SUPABASE_URL = supabaseUrl();
const supabaseAnonKey = publishableKey();

export const supabase = createClient(SUPABASE_URL, supabaseAnonKey);
