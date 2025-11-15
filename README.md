# ⚔️ PvP Arena - Sistema de Torneos Efímeros

Sistema de salas PvP en tiempo real con gestión de torneos, enfrentamientos y animaciones de victoria. Los datos son **volátiles** y se almacenan únicamente en memoria, perdiéndose al reiniciar el servidor.

![Status](https://img.shields.io/badge/status-production--ready-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🎯 Características Principales

- ✨ **Sistema de Salas Efímero**: Creación y unión a salas con códigos únicos (máx. 20 participantes)
- 👤 **Perfiles Personalizados**: Avatar (upload local → dataURL) + nombre personalizable
- 🎮 **Gestión de Torneos**: Organización automática de enfrentamientos con algoritmo de emparejamiento
- ⚡ **Tiempo Real**: Sincronización instantánea vía WebSocket entre todos los clientes
- 👑 **Roles Diferenciados**: Admin (creador) vs Participantes con permisos específicos
- 🎉 **Animaciones de Premio**: Confetti, efectos visuales y celebraciones al marcar ganadores
- 🏆 **Podio Final**: Pantalla de celebración con el ganador del torneo
- 📱 **Diseño Responsive**: Mobile-first, optimizado para móviles y tablets

## ⚠️ IMPORTANTE: Datos Volátiles

**Los datos se almacenan ÚNICAMENTE en memoria del servidor.**

- ❌ No hay base de datos
- ❌ No hay persistencia
- ❌ Al reiniciar el servidor se pierden TODAS las salas y datos
- ✅ Ideal para eventos efímeros y sesiones temporales

## 🚀 Instalación y Ejecución

### Requisitos Previos

- Node.js 18+ 
- npm o pnpm

### Paso 1: Instalar Dependencias

```powershell
npm install
```

### Paso 2: Ejecutar en Desarrollo

```powershell
npm run dev
```

El servidor se iniciará en `http://localhost:5173` (o el puerto asignado por Vite).

### Paso 3: Abrir en el Navegador

Abre múltiples pestañas/dispositivos en:
```
http://localhost:5173
```

## 🏗️ Construcción para Producción

```powershell
# Generar build optimizado
npm run build

# Ejecutar preview del build
npm run preview
```

## 📋 Variables de Entorno

Este proyecto **NO requiere** variables de entorno para funcionar. Todo está configurado por defecto para desarrollo local.

### (Opcional) Configuración Avanzada

Si deseas personalizar el comportamiento del WebSocket o servidor, puedes crear un archivo `.env`:

```env
# Puerto personalizado (opcional)
PORT=3000

# Host (opcional)
HOST=0.0.0.0
```

## 🎮 Guía de Uso

### Para Usuarios

#### 1. Configurar Perfil
- Haz clic en el avatar circular para subir tu foto
- Ingresa tu nombre (máx. 20 caracteres)

#### 2. Crear Sala (Admin)
1. Clic en **"🎮 Crear Sala"**
2. Define el número máximo de participantes (2-20)
3. Comparte el código generado con otros jugadores

#### 3. Unirse a Sala
1. Clic en **"🚪 Unirse a Sala"**
2. Ingresa el código de 6 caracteres
3. ¡Listo! Verás la sala en tiempo real

### Para Administradores

#### Organizar Torneo
1. Espera a que se unan suficientes participantes
2. Clic en **"🎲 Organizar Enfrentamientos"** → genera pares aleatorios
3. (Opcional) Usa **"🔀 Revolver Pares"** para re-barajar (cooldown: 3s)
4. Clic en **"🚀 Empezar Torneo"**

#### Durante el Torneo
1. Observa el enfrentamiento activo (resaltado en morado)
2. Cuando haya un ganador, haz clic en el botón **"Ganador"** junto al participante
3. Se reproduce animación de celebración
4. El siguiente enfrentamiento se activa automáticamente
5. Al finalizar, aparece la pantalla de **GANADOR FINAL** 🏆

## 🗂️ Estructura del Proyecto

```
my-pvp/
├── src/
│   ├── lib/
│   │   ├── components/         # Componentes Svelte
│   │   │   ├── AvatarUpload.svelte
│   │   │   ├── ParticipantList.svelte
│   │   │   ├── BracketView.svelte
│   │   │   ├── AdminControls.svelte
│   │   │   ├── WinAnimation.svelte
│   │   │   └── PairWinAnimation.svelte
│   │   ├── stores/             # Stores de Svelte
│   │   │   ├── websocket.ts   # WebSocket store + eventos
│   │   │   └── user.ts        # Perfil del usuario (localStorage)
│   │   └── server/             # Lógica del servidor
│   │       ├── room-manager.ts # Gestión de salas en memoria
│   │       └── websocket.ts   # Servidor WebSocket
│   ├── routes/
│   │   ├── +page.svelte       # Home (crear/unirse)
│   │   └── room/[code]/
│   │       └── +page.svelte   # Vista de sala
│   └── hooks.server.ts        # Hooks de SvelteKit
├── vite.config.ts             # Configuración Vite + WebSocket
├── package.json
└── README.md
```

## 🔌 Eventos WebSocket Documentados

### Cliente → Servidor

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `create_room` | `{ maxParticipants, name, avatar }` | Crear nueva sala |
| `join_room` | `{ code, name, avatar }` | Unirse a sala existente |
| `leave_room` | `{}` | Abandonar sala actual |
| `organize_pairs` | `{ roomCode }` | Generar enfrentamientos |
| `shuffle_pairs` | `{ roomCode }` | Re-barajar enfrentamientos |
| `start_tournament` | `{ roomCode }` | Iniciar torneo |
| `mark_winner` | `{ roomCode, pairId, winnerId }` | Marcar ganador de un par |
| `get_room_state` | `{ roomCode }` | Solicitar estado completo |

### Servidor → Cliente

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `connected` | `{ clientId }` | Confirmación de conexión |
| `room_created` | `{ room }` | Sala creada exitosamente |
| `room_joined` | `{ room }` | Unión exitosa a sala |
| `room_state` | `{ room }` | Estado completo de la sala |
| `participant_joined` | `{ participantId }` | Nuevo participante |
| `participant_left` | `{ participantId }` | Participante abandonó |
| `pairs_updated` | `{ pairs }` | Enfrentamientos actualizados |
| `tournament_started` | `{}` | Torneo iniciado |
| `pair_finished` | `{ pair, winnerId }` | Enfrentamiento finalizado |
| `error` | `{ message }` | Error operacional |

## 🧪 Escenarios de Prueba Manual

### Test 1: Flujo Básico de Sala
1. Abrir `http://localhost:5173` en 3 pestañas
2. En pestaña 1: configurar perfil → crear sala con máx. 4 participantes
3. Copiar código de sala
4. En pestañas 2 y 3: unirse con el código
5. ✅ Verificar que las 3 pestañas muestren los 3 participantes en tiempo real

### Test 2: Organización de Torneo
1. En pestaña 1 (admin): clic "Organizar Enfrentamientos"
2. ✅ Verificar que todos vean los pares generados
3. Clic "Revolver Pares"
4. ✅ Verificar cooldown de 3 segundos
5. ✅ Verificar que los pares cambien en todas las pestañas

### Test 3: Torneo Completo
1. Admin: "Empezar Torneo"
2. ✅ Verificar que el primer par se resalta en morado
3. Admin: marcar ganador del par activo
4. ✅ Verificar animación de confetti en TODAS las pestañas
5. ✅ Verificar que el siguiente par se active automáticamente
6. Completar todos los pares
7. ✅ Verificar pantalla final de GANADOR con trofeo

### Test 4: Manejo de BYE (número impar)
1. Crear sala con 3 participantes
2. Organizar enfrentamientos
3. ✅ Verificar que un participante tenga "BYE - Pasa automáticamente"
4. Empezar torneo
5. ✅ Verificar que el participante con BYE avance automáticamente

### Test 5: Sala Llena
1. Crear sala con máx. 2 participantes
2. Unir 2 participantes
3. Intentar unir un 3er participante
4. ✅ Verificar mensaje de error "Sala llena"

### Test 6: Validaciones de Admin
1. Unirse como participante (no admin)
2. Intentar usar controles de admin vía consola/DevTools
3. ✅ Verificar que el servidor rechace acciones no autorizadas

## 🔒 Seguridad

### Implementación Actual
- ✅ Validación de roles (admin vs participante) en el servidor
- ✅ Validación de capacidad de sala
- ✅ Validación de ganadores en pares activos
- ✅ Protección contra spam con cooldown en "Revolver"

### Limitaciones Conocidas
- ⚠️ No hay autenticación de usuarios (IDs de cliente volátiles)
- ⚠️ Los códigos de sala son públicos (6 caracteres alfanuméricos)
- ⚠️ Sin rate limiting en conexiones WebSocket

### Recomendaciones para Producción

#### 1. Tokens Ephemeral para Admin
```typescript
// Generar token al crear sala
const adminToken = crypto.randomUUID();
// Verificar en cada acción admin
if (session.token !== adminToken) throw new Error('No autorizado');
```

#### 2. Rate Limiting
```typescript
// Implementar con express-rate-limit o similar
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({ windowMs: 60000, max: 100 });
```

#### 3. Validación de Avatares
```typescript
// Validar tamaño de dataURL (max 500KB)
if (avatar.length > 500000) throw new Error('Avatar muy grande');
// Sanitizar contenido
const isValidDataURL = /^data:image\/(png|jpeg|jpg|gif);base64,/.test(avatar);
```

## 📈 Mejoras Opcionales (Roadmap)

### Alta Prioridad
1. **Persistencia con Supabase** ⭐⭐⭐
   - Migrar `room-manager.ts` a usar Supabase Realtime
   - Mantener historial de torneos y estadísticas
   - Implementación: Crear tabla `rooms`, `participants`, `pairs`

2. **Sistema de Brackets Visuales** ⭐⭐⭐
   - Mostrar árbol de eliminación tipo torneo
   - Biblioteca recomendada: `react-tournament-bracket` (adaptar a Svelte)

3. **Chat de Sala** ⭐⭐
   - Añadir mensajes en tiempo real entre participantes
   - Evento WS: `send_message`, `message_received`

### Media Prioridad
4. **Modos de Torneo** ⭐⭐
   - Round-robin (todos contra todos)
   - Doble eliminación
   - Configuración en modal de crear sala

5. **Historial de Victorias** ⭐
   - Persistir estadísticas por usuario (nombre + localStorage ID)
   - Mostrar en perfil: partidas ganadas, perdidas, winrate

### Baja Prioridad
6. **Temas Personalizables** ⭐
   - Dark mode
   - Temas por torneo (deportes, gaming, etc.)

7. **Sonidos de Efectos** ⭐
   - Sonido al marcar ganador
   - Música de victoria final
   - Configuración on/off en settings

8. **Compartir Resultados** ⭐
   - Generar imagen PNG del podio final
   - Botón "Compartir en redes sociales"

## 🔄 Migración a Persistencia (Supabase)

### Paso 1: Configurar Supabase

```powershell
npm install @supabase/supabase-js
```

### Paso 2: Crear Tablas

```sql
-- Tabla de salas
CREATE TABLE rooms (
  code TEXT PRIMARY KEY,
  max_participants INTEGER,
  admin_id TEXT,
  tournament_started BOOLEAN DEFAULT FALSE,
  tournament_finished BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de participantes
CREATE TABLE participants (
  id TEXT PRIMARY KEY,
  room_code TEXT REFERENCES rooms(code) ON DELETE CASCADE,
  name TEXT,
  avatar TEXT,
  is_admin BOOLEAN,
  joined_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de enfrentamientos
CREATE TABLE pairs (
  id TEXT PRIMARY KEY,
  room_code TEXT REFERENCES rooms(code) ON DELETE CASCADE,
  participant1_id TEXT,
  participant2_id TEXT,
  winner_id TEXT,
  is_active BOOLEAN,
  pair_order INTEGER
);
```

### Paso 3: Adaptar `room-manager.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

// Ejemplo: crear sala
async createRoom(maxParticipants: number, adminId: string, adminName: string, adminAvatar: string) {
  const code = this.generateRoomCode();
  
  const { data: room } = await supabase.from('rooms').insert({
    code,
    max_participants: maxParticipants,
    admin_id: adminId
  }).single();
  
  await supabase.from('participants').insert({
    id: adminId,
    room_code: code,
    name: adminName,
    avatar: adminAvatar,
    is_admin: true
  });
  
  return room;
}
```

### Paso 4: Usar Supabase Realtime

```typescript
// Suscribirse a cambios en tiempo real
supabase
  .channel(`room:${roomCode}`)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, (payload) => {
    // Broadcast a clientes WS
  })
  .subscribe();
```

## 🛠️ Stack Tecnológico

- **Frontend**: SvelteKit 2 (Svelte 5 con runes)
- **Estilos**: Tailwind CSS 4
- **WebSocket**: ws (Node.js)
- **Animaciones**: canvas-confetti
- **Build**: Vite 7
- **TypeScript**: Strict mode

## 🤝 Contribuciones

Este es un proyecto educativo/demostración. Para contribuir:

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - usa libremente para proyectos personales y comerciales.

## 🐛 Problemas Conocidos

- [ ] En Safari iOS, el upload de avatares puede tener delay en preview
- [ ] Si el admin abandona, el nuevo admin asignado no recibe notificación visual inmediata
- [ ] Confetti puede causar lag en dispositivos antiguos (>50 partículas)

## 📞 Soporte

Para reportar bugs o solicitar features, abre un issue en GitHub.

---

**Desarrollado con ⚡ por la comunidad de SvelteKit**

¡Disfruta de tus torneos PvP! 🎮⚔️

