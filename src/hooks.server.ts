import type { Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { wsManager } from '$lib/server/websocket';
import type { Server } from 'http';

// Variable global para almacenar el servidor HTTP
let httpServer: Server | null = null;

export function setHttpServer(server: Server) {
	httpServer = server;
	if (!building) {
		wsManager.initialize(server);
		console.log('✅ WebSocket initialized from hooks');
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	return resolve(event);
};
