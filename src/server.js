import { handler } from '../build/handler.js';
import polka from 'polka';
import { createServer } from 'http';

const app = polka();

// SvelteKit handler
app.use(handler);

const httpServer = createServer(app.handler);

// Inicializar WebSocket dinámicamente
import('../build/server/chunks/websocket.js').then(async (websocketModule) => {
	const { wsManager } = websocketModule;
	if (wsManager && wsManager.initialize) {
		wsManager.initialize(httpServer);
		console.log('✅ WebSocket server initialized on /ws');
	}
}).catch(err => {
	console.error('⚠️ Could not initialize WebSocket:', err.message);
});

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
	console.log(`🚀 Server running on port ${port}`);
});
