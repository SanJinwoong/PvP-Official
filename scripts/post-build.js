import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const indexPath = join(process.cwd(), 'build', 'index.js');
let content = readFileSync(indexPath, 'utf-8');

// Agregar import del setHttpServer al inicio
const importStatement = `import { setHttpServer } from './server/chunks/hooks.server.js';\n`;

// Buscar donde se crea el servidor HTTP y agregar la inicialización
const serverCreation = content.includes('createServer(')
	? content.replace(
			/const\s+server\s*=\s*createServer\(([^)]+)\);/,
			`const server = createServer($1);\nsetHttpServer(server);`
	  )
	: content.replace(
			/httpServer\.listen/,
			`setHttpServer(httpServer);\nhttpServer.listen`
	  );

// Si no encontró createServer, buscar httpServer
const finalContent = serverCreation.includes('setHttpServer')
	? importStatement + serverCreation
	: content;

if (finalContent !== content) {
	writeFileSync(indexPath, finalContent);
	console.log('✅ WebSocket initialization added to build/index.js');
} else {
	console.log('⚠️  Could not modify index.js - manual WebSocket setup may be needed');
}
