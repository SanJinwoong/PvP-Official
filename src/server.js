import { handler } from './handler.js';
import express from 'express';
import { createServer } from 'http';
import { wsManager } from './server/websocket.js';

const app = express();
const server = createServer(app);

// Inicializar WebSocket
wsManager.initialize(server);
console.log('✅ WebSocket server initialized on /ws');

// SvelteKit handler
app.use(handler);

const port = process.env.PORT || 3000;
server.listen(port, () => {
	console.log(`🚀 Server running on port ${port}`);
});
