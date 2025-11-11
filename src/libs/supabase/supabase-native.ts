import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabaseNative = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
   persistSession: true,               // keep session across app launches
    autoRefreshToken: true,             // refresh in background
    storage: AsyncStorage,              // RN storage (critical)
    detectSessionInUrl: false,          // not using web hash/redirect in RN
    flowType: 'pkce',              
  },
});
