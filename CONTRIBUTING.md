# Guía de Contribución

¡Gracias por tu interés en contribuir a PvP Arena! 🎮

## Cómo Contribuir

### Reportar Bugs 🐛

Si encuentras un bug, por favor abre un issue con:

1. **Título descriptivo**: Ej. "WebSocket no reconecta en Safari iOS"
2. **Pasos para reproducir**:
   ```
   1. Abrir sala en Safari iOS
   2. Perder conexión a internet
   3. Recuperar conexión
   4. El WS no reconecta automáticamente
   ```
3. **Comportamiento esperado**: "Debería reconectar automáticamente"
4. **Comportamiento actual**: "Queda desconectado indefinidamente"
5. **Entorno**:
   - OS: iOS 16.5
   - Navegador: Safari 16.5
   - Versión del proyecto: 1.0.0

### Proponer Nuevas Features ✨

Antes de trabajar en una nueva feature:

1. Revisa el [CHANGELOG.md](CHANGELOG.md) para ver si ya está planeada
2. Abre un issue de tipo "Feature Request" con:
   - Descripción de la feature
   - Por qué sería útil
   - Mockups o ejemplos (si aplica)
3. Espera feedback antes de comenzar a codear

### Pull Requests

#### Antes de enviar un PR

1. **Fork el repositorio**
2. **Crea una rama feature**:
   ```bash
   git checkout -b feature/nombre-descriptivo
   ```
3. **Desarrolla tu feature**
4. **Prueba manualmente**:
   - Ejecuta `npm run dev`
   - Prueba en múltiples pestañas/dispositivos
   - Verifica que no haya errores en consola
5. **Verifica el build**:
   ```bash
   npm run build
   ```
6. **Commit con mensajes claros**:
   ```bash
   git commit -m "feat: añadir chat de sala en tiempo real"
   ```

#### Formato de commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Formato, espacios, etc. (sin cambios de código)
- `refactor:` Refactorización sin cambios funcionales
- `perf:` Mejoras de performance
- `test:` Añadir o modificar tests
- `chore:` Tareas de mantenimiento

**Ejemplos**:
```bash
feat: añadir modo de torneo round-robin
fix: corregir reconexión de WebSocket en Safari
docs: actualizar README con instrucciones de despliegue
refactor: simplificar lógica de emparejamiento
```

#### Estructura del PR

**Título**: Mismo formato que commits

**Descripción**:
```markdown
## Qué cambia
- Añade sistema de chat en tiempo real
- Nuevo componente ChatPanel.svelte
- Eventos WS: send_message, message_received

## Por qué
Los usuarios solicitaron poder comunicarse durante torneos.

## Cómo probar
1. Crear sala
2. Unir otro participante
3. Enviar mensajes desde ambas pestañas
4. Verificar sincronización

## Screenshots
[Adjuntar screenshots si aplica]

## Checklist
- [x] Probado en Chrome/Firefox/Safari
- [x] Build exitoso (`npm run build`)
- [x] Documentación actualizada
- [x] Sin errores en consola
```

### Estándares de Código

#### TypeScript

```typescript
// ✅ Bueno: Tipos explícitos
interface Props {
  name: string;
  onSubmit?: () => void;
}

// ❌ Malo: Any implícito
function handleData(data) {
  // ...
}
```

#### Svelte 5 Runes

```typescript
// ✅ Bueno: Usar runes
let count = $state(0);
let doubled = $derived(count * 2);

// ❌ Malo: Usar stores viejas
let count = writable(0);
```

#### Nombres

```typescript
// ✅ Bueno: Descriptivos
function createRoomWithParticipants() { }
let isAdminUser = $state(false);

// ❌ Malo: Abreviaciones
function crtRm() { }
let isA = $state(false);
```

#### Componentes Svelte

```svelte
<!-- ✅ Bueno: Props tipadas con interface -->
<script lang="ts">
  interface Props {
    title: string;
    onClick?: () => void;
  }
  
  let { title, onClick }: Props = $props();
</script>

<!-- ❌ Malo: Props sin tipos -->
<script>
  export let title;
  export let onClick;
</script>
```

### Arquitectura

#### Separación de responsabilidades

- **`/components`**: Componentes reutilizables de UI
- **`/stores`**: Estado global y lógica de negocio
- **`/server`**: Lógica de servidor (WebSocket, room manager)
- **`/routes`**: Páginas de SvelteKit

#### Principios

1. **Un componente, una responsabilidad**
   - `AvatarUpload.svelte` solo maneja upload de avatar
   - `ParticipantList.svelte` solo muestra lista

2. **Lógica en stores, no en componentes**
   ```typescript
   // ✅ Bueno: Lógica en store
   export const isAdmin = derived(currentUser, $user => $user?.isAdmin);
   
   // ❌ Malo: Lógica en componente
   let isAdmin = $state($currentUser?.isAdmin);
   ```

3. **Validación server-side SIEMPRE**
   ```typescript
   // ✅ Bueno: Validar en servidor
   if (room.adminId !== clientId) {
     return { success: false, error: 'No autorizado' };
   }
   
   // ❌ Malo: Solo validar en cliente
   {#if $isAdmin}
     <button onclick={startTournament}>Empezar</button>
   {/if}
   ```

### Testing

Por ahora no hay tests automatizados, pero al contribuir:

1. **Prueba manual exhaustiva**:
   - Múltiples pestañas (mínimo 3)
   - Diferentes navegadores
   - Dispositivos móviles reales si es posible

2. **Escenarios edge case**:
   - ¿Qué pasa si un usuario se desconecta a mitad del torneo?
   - ¿Qué pasa con sala de 1 solo participante?
   - ¿Qué pasa si el admin abandona?

3. **Performance**:
   - ¿Funciona con 20 participantes?
   - ¿Hay lags en animaciones?

### Documentación

Si tu PR añade features, actualiza:

- **README.md**: Si cambia cómo se usa la app
- **TECHNICAL_DECISIONS.md**: Si cambias arquitectura
- **CHANGELOG.md**: Añadir en sección "Unreleased"

### Estilo de Código

Usamos:
- **Prettier** para formato
- **ESLint** para linting

Antes de commit:
```bash
npm run format
npm run lint
```

### Revisión de PRs

Los PRs serán revisados considerando:

1. ✅ **Funcionalidad**: ¿Hace lo que dice?
2. ✅ **Código limpio**: ¿Es legible y mantenible?
3. ✅ **Performance**: ¿Introduce lags?
4. ✅ **Seguridad**: ¿Valida correctamente en servidor?
5. ✅ **Documentación**: ¿Está documentado?

### Comunicación

- **Issues**: Para bugs y features
- **Discussions**: Para preguntas generales
- **PR comments**: Para feedback específico de código

### Licencia

Al contribuir, aceptas que tu código se licencie bajo MIT License.

---

## Primeros Pasos para Nuevos Colaboradores

### Issues "good first issue"

Busca issues etiquetados con `good first issue` para comenzar:

- Mejorar mensajes de error
- Añadir validaciones
- Mejorar estilos CSS
- Actualizar documentación

### Necesitas ayuda?

No dudes en:
- Comentar en el issue
- Preguntar en el PR
- Abrir una discussion

---

¡Gracias por hacer PvP Arena mejor! 🚀
