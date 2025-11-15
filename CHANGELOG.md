# Changelog

Todos los cambios notables en este proyecto serán documentados aquí.

## [1.0.0] - 2025-11-14

### Agregado
- ✅ Sistema completo de salas PvP efímeras en memoria
- ✅ Servidor WebSocket con gestión de conexiones en tiempo real
- ✅ Página principal con perfil personalizable (avatar + nombre)
- ✅ Componente de subida de avatar con preview
- ✅ Flujo de creación de salas con código único de 6 caracteres
- ✅ Flujo de unión a salas existentes
- ✅ Vista de sala con lista de participantes en tiempo real
- ✅ Sistema de roles (Admin vs Participantes)
- ✅ Algoritmo de emparejamiento aleatorio con soporte para BYE
- ✅ Controles de administrador:
  - Organizar enfrentamientos
  - Revolver pares (con cooldown de 3s)
  - Empezar torneo
  - Marcar ganadores
- ✅ Vista de brackets con estado visual de enfrentamientos
- ✅ Animaciones de celebración con confetti (canvas-confetti)
- ✅ Animación específica al marcar ganador de un par
- ✅ Pantalla final de ganador con trofeo y celebración
- ✅ Podio con top 3 participantes
- ✅ Sincronización en tiempo real entre todos los clientes
- ✅ Manejo de errores con notificaciones toast
- ✅ Diseño responsive mobile-first con Tailwind CSS 4
- ✅ Reconexión automática de WebSocket
- ✅ Persistencia local del perfil de usuario (localStorage)

### Documentación
- ✅ README completo con:
  - Guía de instalación y ejecución
  - Instrucciones de uso para usuarios y administradores
  - Documentación de eventos WebSocket
  - Escenarios de prueba manual
  - Notas de seguridad y recomendaciones
  - Roadmap de mejoras futuras
  - Guía de migración a Supabase
- ✅ TECHNICAL_DECISIONS.md con decisiones arquitectónicas
- ✅ DEPLOYMENT.md con guías de despliegue en múltiples plataformas

### Técnico
- Stack: SvelteKit 2 + Svelte 5 (runes)
- Backend: Node.js + ws (WebSocket)
- Estilos: Tailwind CSS 4
- Animaciones: canvas-confetti
- Build: Vite 7
- Adapter: adapter-node (para despliegue)

### Limitaciones Conocidas
- Los datos son volátiles (se pierden al reiniciar el servidor)
- Sin autenticación real de usuarios
- Sin rate limiting en conexiones WebSocket
- Sin validación de tamaño de avatares
- El admin asignado automáticamente al abandonar el creador no recibe notificación visual

### Seguridad
- Validación server-side de roles (admin vs participante)
- Validación de capacidad de sala
- Validación de ganadores en pares activos
- Cooldown en acción "revolver pares"
- Svelte escapa automáticamente contenido en templates (protección XSS)

---

## Próximas Versiones Planeadas

### [1.1.0] - Mejoras de UX
- [ ] Sistema de brackets visuales tipo árbol
- [ ] Chat de sala en tiempo real
- [ ] Sonidos de efectos para acciones
- [ ] Temas personalizables (dark mode)

### [1.2.0] - Persistencia
- [ ] Migración a Supabase Realtime
- [ ] Historial de torneos
- [ ] Estadísticas de usuario (victorias/derrotas)
- [ ] Sistema de recuperación de sesión

### [1.3.0] - Modos Avanzados
- [ ] Torneo round-robin (todos contra todos)
- [ ] Doble eliminación
- [ ] Seeding de participantes por skill rating

### [2.0.0] - Producción
- [ ] Autenticación de usuarios (OAuth)
- [ ] Rate limiting
- [ ] Validación de avatares (tamaño/formato)
- [ ] Tokens ephemeral para admin
- [ ] Monitoreo y analytics
- [ ] Tests E2E automatizados

---

**Formato del Changelog**: Basado en [Keep a Changelog](https://keepachangelog.com/)  
**Versionado**: Semántico [SemVer](https://semver.org/)
