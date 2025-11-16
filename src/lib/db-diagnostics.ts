/**
 * Script de diagnóstico y limpieza manual de base de datos
 * Úsalo cuando sospeches que hay datos basura acumulados
 */

import { supabase } from './supabase';

export async function getDatabaseStats() {
	try {
		// Contar todas las salas
		const { count: totalRooms, error: countError } = await supabase
			.from('rooms')
			.select('*', { count: 'exact', head: true });

		if (countError) throw countError;

		// Obtener salas con detalles
		const { data: allRooms, error: roomsError } = await supabase
			.from('rooms')
			.select('code, created_at, updated_at, participants, max_participants')
			.order('updated_at', { ascending: false });

		if (roomsError) throw roomsError;

		const now = new Date();
		const stats = {
			total: totalRooms || 0,
			active: 0,      // Actualizadas en últimos 10 min
			stale: 0,       // 10-60 min sin actividad
			dead: 0,        // +1 hora sin actividad
			ancient: 0,     // +24 horas
			rooms: allRooms || []
		};

		allRooms?.forEach(room => {
			const updated = new Date(room.updated_at);
			const minutesAgo = (now.getTime() - updated.getTime()) / 1000 / 60;

			if (minutesAgo < 10) stats.active++;
			else if (minutesAgo < 60) stats.stale++;
			else if (minutesAgo < 1440) stats.dead++;
			else stats.ancient++;
		});

		return stats;
	} catch (error) {
		console.error('Error obteniendo estadísticas:', error);
		throw error;
	}
}

export async function cleanupOldRooms(olderThanMinutes: number = 10) {
	try {
		const cutoffTime = new Date();
		cutoffTime.setMinutes(cutoffTime.getMinutes() - olderThanMinutes);

		const { data, error } = await supabase
			.from('rooms')
			.delete()
			.lt('updated_at', cutoffTime.toISOString())
			.select();

		if (error) throw error;

		return {
			success: true,
			cleaned: data?.length || 0,
			rooms: data || []
		};
	} catch (error) {
		console.error('Error limpiando salas:', error);
		throw error;
	}
}

export async function deleteAllRooms() {
	try {
		const { data, error } = await supabase
			.from('rooms')
			.delete()
			.neq('code', 'IMPOSSIBLE_CODE_THAT_NEVER_EXISTS') // Hack para eliminar todo
			.select();

		if (error) throw error;

		return {
			success: true,
			deleted: data?.length || 0
		};
	} catch (error) {
		console.error('Error eliminando todas las salas:', error);
		throw error;
	}
}

export async function getRoomDetails(code: string) {
	try {
		const { data, error } = await supabase
			.from('rooms')
			.select('*')
			.eq('code', code)
			.single();

		if (error) throw error;
		return data;
	} catch (error) {
		console.error('Error obteniendo detalles de sala:', error);
		throw error;
	}
}
