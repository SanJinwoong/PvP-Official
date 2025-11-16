import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

/**
 * API endpoint para limpiar salas inactivas
 * Se ejecuta automáticamente cada 5 minutos (configurable en cron job)
 */
export const GET: RequestHandler = async () => {
	try {
		// Obtener todas las salas
		const { data: rooms, error } = await supabase
			.from('rooms')
			.select('*');

		if (error) {
			return json({ success: false, error: error.message }, { status: 500 });
		}

		if (!rooms || rooms.length === 0) {
			return json({ success: true, cleaned: 0, message: 'No hay salas para limpiar' });
		}

		const now = Date.now();
		const INACTIVE_THRESHOLD = 10 * 60 * 1000; // 10 minutos de inactividad
		let cleanedCount = 0;

		for (const room of rooms) {
			const roomUpdatedAt = new Date(room.updated_at).getTime();
			const inactiveTime = now - roomUpdatedAt;

			// Eliminar salas inactivas por más de 10 minutos
			if (inactiveTime > INACTIVE_THRESHOLD) {
				await supabase
					.from('rooms')
					.delete()
					.eq('code', room.code);
				
				cleanedCount++;
				console.log(`🗑️ Sala ${room.code} eliminada por inactividad (${Math.round(inactiveTime / 60000)} min)`);
			}
		}

		return json({ 
			success: true, 
			cleaned: cleanedCount,
			message: `${cleanedCount} salas eliminadas por inactividad`
		});
	} catch (err) {
		console.error('Error en cleanup:', err);
		return json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
	}
};

/**
 * Endpoint POST para forzar limpieza manual
 */
export const POST: RequestHandler = async () => {
	return GET({} as any);
};
