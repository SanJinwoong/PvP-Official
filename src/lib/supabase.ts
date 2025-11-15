import { createClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';

// Use process.env in server, globalThis in browser
const getEnvVar = (key: string): string => {
	if (browser) {
		return (globalThis as any)[key] || '';
	}
	return process.env[key] || '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
	console.warn('⚠️ Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	realtime: {
		params: {
			eventsPerSecond: 10
		}
	}
});
