/**
 * Cliente de limpieza automática de salas
 * Se ejecuta periódicamente para mantener la base de datos limpia
 */

let cleanupInterval: ReturnType<typeof setInterval> | null = null;

export function startAutoCleanup() {
	if (typeof window === 'undefined') return;

	// Limpiar cada 5 minutos
	cleanupInterval = setInterval(async () => {
		try {
			const response = await fetch('/api/cleanup');
			const data = await response.json();
			
			if (data.success && data.cleaned > 0) {
				console.log(`🧹 Auto-cleanup: ${data.cleaned} salas eliminadas`);
			}
		} catch (err) {
			console.error('Error en auto-cleanup:', err);
		}
	}, 5 * 60 * 1000); // 5 minutos
}

export function stopAutoCleanup() {
	if (cleanupInterval) {
		clearInterval(cleanupInterval);
		cleanupInterval = null;
	}
}
