import type { Handle } from '@sveltejs/kit';
import { wsManager } from '$lib/server/websocket';

let wsInitialized = false;

export const handle: Handle = async ({ event, resolve }) => {
	// Inicializar WebSocket server en el primer request
	if (!wsInitialized && event.platform) {
		const server = (event.platform as any).server;
		if (server) {
			wsManager.initialize(server);
			wsInitialized = true;
			console.log('✅ WebSocket server initialized');
		}
	}

	return resolve(event);
};
