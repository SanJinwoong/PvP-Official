/**
 * ENDPOINT DE DIAGNÓSTICO DE BASE DE DATOS
 * 
 * Uso:
 * - GET /api/db-stats → Ver estadísticas
 * - POST /api/db-stats?action=cleanup&minutes=60 → Limpiar salas >60min
 * - POST /api/db-stats?action=deleteAll → ELIMINAR TODO (usar con cuidado)
 */

import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getDatabaseStats, cleanupOldRooms, deleteAllRooms } from '$lib/db-diagnostics';

export const GET = async () => {
	try {
		const stats = await getDatabaseStats();
		
		return json({
			success: true,
			stats,
			message: `📊 Total: ${stats.total} salas | ✅ Activas: ${stats.active} | ⚠️ Stale: ${stats.stale} | 💀 Dead: ${stats.dead} | 🪦 Ancient: ${stats.ancient}`
		});
	} catch (error: any) {
		return json({
			success: false,
			error: error.message
		}, { status: 500 });
	}
};

export const POST = async ({ url }: RequestEvent) => {
	try {
		const action = url.searchParams.get('action');

		if (action === 'cleanup') {
			const minutes = parseInt(url.searchParams.get('minutes') || '10');
			const result = await cleanupOldRooms(minutes);
			
			return json({
				...result,
				message: `🧹 Eliminadas ${result.cleaned} salas con más de ${minutes} minutos de inactividad`
			});
		}

		if (action === 'deleteAll') {
			const result = await deleteAllRooms();
			
			return json({
				...result,
				message: `⚠️ ELIMINADAS TODAS LAS SALAS (${result.deleted} salas)`
			});
		}

		return json({
			success: false,
			error: 'Acción no válida. Usa: cleanup o deleteAll'
		}, { status: 400 });

	} catch (error: any) {
		return json({
			success: false,
			error: error.message
		}, { status: 500 });
	}
};
