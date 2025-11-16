import { createClient } from '@supabase/supabase-js';

// Supabase public credentials (safe to expose)
const supabaseUrl = 'https://tqkqshhhyjihfmmcefii.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxa3FzaGhoeWppaGZtbWNlZmlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODE4MjUsImV4cCI6MjA3ODc1NzgyNX0.Fylcogs9jDyyDbqBSbXxausfAhSwmxhsLqVNIcNzXbI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	realtime: {
		params: {
			eventsPerSecond: 10
		}
	},
	global: {
		headers: {
			'x-client-info': 'pvp-arena',
			'Prefer': 'return=minimal' // Menos datos en respuesta
		},
		fetch: (url, options = {}) => {
			// Timeout más generoso: 30s para free tier
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 30000);
			
			return fetch(url, {
				...options,
				signal: controller.signal
			}).finally(() => clearTimeout(timeoutId));
		}
	},
	db: {
		schema: 'public'
	},
	auth: {
		persistSession: false,
		autoRefreshToken: false,
		detectSessionInUrl: false
	}
});
