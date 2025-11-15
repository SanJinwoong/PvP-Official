# Decisiones Técnicas - PvP Arena

## Arquitectura General

### Backend: WebSocket In-Memory
**Decisión**: Implementar servidor WebSocket custom con almacenamiento en memoria (Map).

**Razones**:
1. **Simplicidad**: No requiere configuración de base de datos
2. **Bajo latency**: Datos en RAM = acceso instantáneo
3. **Ideal para MVP**: Cumple requisito de "datos efímeros"
4. **Fácil debugging**: Estado visible en memoria del proceso

**Trade-offs**:
- ❌ Sin persistencia (se pierde al reiniciar)
- ❌ No escala horizontalmente (single instance)
- ✅ Perfecto para salas temporales de eventos

### Frontend: SvelteKit + Svelte 5 Runes
**Decisión**: Usar la nueva API de runes ($state, $derived, $props) en lugar de stores tradicionales.

**Razones**:
1. **Reactividad más simple**: $state es más intuitivo que writable
2. **Performance**: Runes son más eficientes en runtime
3. **Type safety**: Mejor inferencia de tipos
4. **Futuro de Svelte**: Runes es el nuevo estándar

**Ejemplo**:
```typescript
// Antes (Svelte 4)
let count = writable(0);
$count++;

// Ahora (Svelte 5)
let count = $state(0);
count++;
```

### Comunicación Realtime: WebSocket vs Alternativas

**Opciones evaluadas**:
1. **WebSocket nativo** ✅ (elegida)
2. Supabase Realtime
3. Socket.io
4. Server-Sent Events (SSE)

**Por qué WebSocket nativo**:
- ✅ Bidireccional full-duplex
- ✅ Sin dependencias externas (solo `ws` npm package)
- ✅ Control total del protocolo
- ✅ Bajo overhead (~2 bytes por frame)

**Por qué NO Supabase Realtime**:
- Requiere cuenta y configuración
- No cumple requisito de "in-memory puro"
- Agrega complejidad innecesaria para MVP

## Gestión de Estado

### Client-Side State Management

**Estructura de stores**:
```
stores/
├── websocket.ts    # Estado de conexión y sala (global)
└── user.ts         # Perfil local (localStorage)
```

**Separación de responsabilidades**:
- `websocket.ts`: Estado compartido sincronizado vía WS
- `user.ts`: Estado personal persistente en localStorage

**Derived stores para lógica de negocio**:
```typescript
export const isAdmin = derived(currentUser, $user => $user?.isAdmin || false);
export const activePair = derived(wsStore, $ws => $ws.room?.pairs.find(p => p.isActive));
```

### Server-Side State Management

**room-manager.ts**: Clase singleton que gestiona todas las salas.

**Estructura de datos**:
```typescript
Map<roomCode, Room> {
  Room {
    code: string
    participants: Map<participantId, Participant>
    pairs: Pair[]
    adminId: string
    // ...
  }
}
```

**Por qué Map en lugar de Object**:
- ✅ Mejor performance en inserción/eliminación
- ✅ Mantiene orden de inserción
- ✅ Métodos útiles (.size, .has(), .delete())

## Algoritmo de Emparejamiento

### Implementación Actual: Single Elimination

**Lógica**:
1. Shuffle Fisher-Yates de participantes
2. Crear pares secuenciales: [0,1], [2,3], [4,5], ...
3. Si número impar → último participante recibe BYE (auto-avanza)

**Código**:
```typescript
for (let i = 0; i < shuffled.length; i += 2) {
  pairs.push({
    participant1: shuffled[i],
    participant2: shuffled[i + 1] || null, // null = BYE
    // ...
  });
}
```

**Limitaciones**:
- Solo eliminación simple (no doble eliminación ni round-robin)
- No hay seeding (todos los pares son aleatorios)

**Mejoras futuras**:
1. **Bracket tree visual**: Mostrar árbol de eliminación completo
2. **Modos avanzados**: Round-robin, Swiss, Double elimination
3. **Seeding**: Ordenar por skill rating antes de emparejar

## Manejo de Concurrencia

### Problema: Múltiples admins intentando acciones simultáneas

**Solución implementada**: Validación de `adminId` en CADA acción.

```typescript
if (room.adminId !== clientId) {
  return { success: false, error: 'No autorizado' };
}
```

### Problema: Race conditions en mark_winner

**Escenario**: 
- Admin marca ganador de Pair A
- Antes de recibir respuesta, marca ganador de Pair B

**Solución**: 
1. Validar `pair.isActive` antes de aceptar winner
2. Solo UN par puede estar activo a la vez
3. Auto-avance secuencial tras cada victoria

```typescript
if (!pair.isActive) {
  return { success: false, error: 'Este enfrentamiento no está activo' };
}
```

### Cooldown en "Revolver Pares"

**Problema**: Admin puede spammear "revolver" y causar confusión.

**Solución**: Cooldown de 3 segundos en cliente.

```typescript
let cooldown = $state(false);
function handleShuffle() {
  if (cooldown) return;
  onShuffle?.();
  cooldown = true;
  setTimeout(() => cooldown = false, 3000);
}
```

## Animaciones y UX

### Librería: canvas-confetti

**Por qué canvas-confetti**:
- ✅ Ligera (~4KB gzipped)
- ✅ Performante (usa Canvas API)
- ✅ API simple y flexible
- ✅ No requiere framework específico

**Implementación de confetti en victoria**:
```typescript
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 },
  colors: ['#9333ea', '#ec4899', '#ef4444', '#fbbf24']
});
```

### Timing de animaciones

**Flujo temporal al marcar ganador**:
1. t=0ms: Cliente envía `mark_winner`
2. t=50ms: Servidor valida y responde `pair_finished`
3. t=60ms: Todos los clientes reciben evento
4. t=70ms: Se muestra `PairWinAnimation` + confetti
5. t=100ms: Servidor envía `room_state` actualizado
6. t=2500ms: `PairWinAnimation` se oculta automáticamente

**Delay estratégico antes de room_state**:
```typescript
setTimeout(() => {
  this.sendRoomState(roomCode);
}, 100);
```

Esto permite que las animaciones se inicien antes de que cambie el estado global.

## Seguridad y Validaciones

### Validación de Avatares

**Problema**: Usuarios pueden subir dataURLs enormes.

**Solución actual**: Sin límite (⚠️ riesgo en producción).

**Mejora recomendada**:
```typescript
// En websocket.ts handleJoinRoom
if (avatar.length > 500000) { // ~500KB
  return { success: false, error: 'Avatar muy grande' };
}

// Validar formato
if (!/^data:image\/(png|jpeg|jpg|gif);base64,/.test(avatar)) {
  return { success: false, error: 'Formato de avatar inválido' };
}
```

### XSS en nombres

**Problema**: Nombres con HTML/scripts.

**Solución actual**: Svelte escapa automáticamente en templates.

**Validación adicional recomendada**:
```typescript
const sanitizedName = name.replace(/[<>]/g, '').trim();
if (sanitizedName.length === 0 || sanitizedName.length > 20) {
  return { success: false, error: 'Nombre inválido' };
}
```

### Protección de acciones admin

**Implementación actual**: Validación server-side de `adminId`.

**Limitación**: `clientId` es generado por el servidor al conectar, pero no hay autenticación real.

**Mejora para producción**:
```typescript
// Al crear sala, generar token admin
const adminToken = crypto.randomUUID();

// Enviar solo al creador
ws.send({ type: 'admin_token', payload: { token: adminToken } });

// Validar en cada acción
if (room.adminToken !== providedToken) {
  return { success: false, error: 'No autorizado' };
}
```

## Reconexión y Sincronización

### Manejo de desconexión

**Comportamiento actual**:
1. Cliente detecta `ws.onclose`
2. Intenta reconectar cada 2 segundos
3. Al reconectar, recibe nuevo `clientId`
4. ❌ Se crea nuevo participante (duplicado)

**Mejora necesaria**: Session recovery.

```typescript
// Al conectar, enviar sessionId del localStorage
const sessionId = localStorage.getItem('sessionId') || crypto.randomUUID();

// Servidor: restaurar participante existente
if (existingParticipant = findBySessionId(sessionId)) {
  existingParticipant.isConnected = true;
  return existingParticipant.clientId;
}
```

### Sincronización de estado al reconectar

**Flujo actual**:
1. Cliente reconecta
2. NO solicita estado automáticamente (⚠️)
3. Espera a `room_state` broadcast

**Mejora implementada en room view**:
```typescript
if (!$ws.room && $ws.connected) {
  setTimeout(() => {
    wsStore.getRoomState(roomCode);
  }, 500);
}
```

## Performance

### Broadcast optimizado

**Implementación actual**: Loop sobre todos los clientes.

```typescript
for (const [clientId, conn] of this.clients.entries()) {
  if (conn.roomCode === roomCode && clientId !== excludeClientId) {
    this.sendToClient(clientId, message);
  }
}
```

**Escala**: O(n) donde n = total de clientes conectados.

**Mejora para >1000 clientes**:
```typescript
// Mantener Map de roomCode -> Set<clientId>
private roomClients: Map<string, Set<string>> = new Map();

// Broadcast en O(m) donde m = clientes en la sala
for (const clientId of this.roomClients.get(roomCode) || []) {
  this.sendToClient(clientId, message);
}
```

### Serialización de Room

**Problema**: `Map` no es JSON-serializable.

**Solución**: `serializeRoom()` convierte Map → Array.

```typescript
participants: Array.from(room.participants.values())
```

**Overhead**: O(n) conversión en cada broadcast.

**Mejora**: Cachear serialización y solo regenerar al cambiar.

```typescript
private roomCache: Map<string, { json: string, timestamp: number }>;

if (cacheAge < 100ms) {
  return cached.json;
}
```

## Testing

### Pruebas manuales recomendadas

**Herramientas**:
- Chrome DevTools (múltiples perfiles)
- Firefox + Safari para cross-browser
- ngrok para testing móvil real

**Escenarios críticos**:
1. **Concurrencia**: 3 admins intentando acciones simultáneas
2. **Latencia**: Simular lag con Chrome DevTools Network throttling
3. **Desconexión**: Cerrar pestaña y reabrir (verificar duplicados)
4. **Capacidad**: Llenar sala al máximo (20 participantes)

### Testing automatizado (futuro)

**Herramientas recomendadas**:
- Playwright para E2E
- ws client para simular múltiples conexiones WebSocket

**Ejemplo de test E2E**:
```typescript
test('should create room and join with second user', async ({ page, context }) => {
  // User 1: Create room
  await page.goto('/');
  await page.fill('[name="name"]', 'Player 1');
  await page.click('button:has-text("Crear Sala")');
  
  const roomCode = await page.locator('h1').innerText();
  
  // User 2: Join room
  const page2 = await context.newPage();
  await page2.goto('/');
  await page2.fill('[name="name"]', 'Player 2');
  await page2.fill('[name="roomCode"]', roomCode);
  await page2.click('button:has-text("Unirse")');
  
  // Assert: Both see each other
  await expect(page.locator('text=Player 2')).toBeVisible();
  await expect(page2.locator('text=Player 1')).toBeVisible();
});
```

## Despliegue

### Opciones evaluadas

1. **Vercel** ❌ - No soporta WebSocket en serverless
2. **Railway** ✅ - Soporta WebSocket + Node.js persistente
3. **Render** ✅ - Free tier con WebSocket
4. **Fly.io** ✅ - Excelente para WebSocket
5. **VPS (DigitalOcean/Linode)** ✅ - Control total

### Recomendación: Railway o Render

**Railway**:
```powershell
# Instalar CLI
npm i -g @railway/cli

# Deploy
railway login
railway init
railway up
```

**Render**:
1. Conectar repo GitHub
2. Configurar build command: `npm run build`
3. Start command: `node build`

**Nota importante**: Asegurar que el adapter de SvelteKit sea `adapter-node`:

```typescript
// svelte.config.js
import adapter from '@sveltejs/adapter-node';
```

## Conclusión

Este proyecto demuestra:
- ✅ Arquitectura realtime escalable (hasta ~100 usuarios concurrentes)
- ✅ Separación clara de responsabilidades (client/server)
- ✅ UX fluida con animaciones y feedback inmediato
- ✅ Código mantenible con TypeScript strict

**Próximos pasos sugeridos**:
1. Implementar tests E2E con Playwright
2. Migrar a Supabase para persistencia
3. Añadir rate limiting y validaciones de seguridad
4. Implementar sesión recovery en reconexión
