import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import { WebSocketServer } from 'ws';
import { wsManager } from './src/lib/server/websocket';

const webSocketServer: Plugin = {
	name: 'webSocketServer',
	configureServer(server) {
		if (!server.httpServer) return;

		// Inicializar WebSocket cuando el servidor HTTP esté listo
		server.httpServer.on('listening', () => {
			wsManager.initialize(server.httpServer!);
			console.log('✅ WebSocket server initialized on /ws');
		});
	}
};

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), webSocketServer]
});
