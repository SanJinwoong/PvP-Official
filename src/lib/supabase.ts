import { createClient } from '@supabase/supabase-js';

// Supabase public credentials (safe to expose)
const supabaseUrl = 'https://tqkqshhhyjihfmmcefii.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxa3FzaGhoeWppaGZtbWNlZmlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE2MjA3ODYsImV4cCI6MjA0NzE5Njc4Nn0.m0BKAZ5Dz8pD-HUZuOWZlIgFoGfQkO8yb_N9N2Qe12Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	realtime: {
		params: {
			eventsPerSecond: 10
		}
	}
});
