import { createClient } from '@supabase/supabase-js';

// Supabase public credentials (safe to expose)
const supabaseUrl = 'https://tqkqshhhyjihfmmcefii.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxa3FzaGhoeWppaGZtbWNlZmlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODE4MjUsImV4cCI6MjA3ODc1NzgyNX0.Fylcogs9jDyyDbqBSbXxausfAhSwmxhsLqVNIcNzXbI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	realtime: {
		params: {
			eventsPerSecond: 10
		}
	}
});
