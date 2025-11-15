# 🚀 Quick Start - PvP Arena

Guía rápida para comenzar a usar el sistema PvP Arena en menos de 5 minutos.

---

## ⚡ Inicio Rápido (Desarrollo)

### 1. Instalar
```powershell
npm install
```

### 2. Ejecutar
```powershell
npm run dev
```

### 3. Abrir
Navega a: **http://localhost:5173**

### 4. ¡Jugar!
- Configura tu avatar y nombre
- Haz clic en "Crear Sala"
- Comparte el código con otros
- ¡Organiza tu primer torneo!

---

## 📖 ¿Primera vez?

### Probar Solo (Modo Demo)

1. Abre **3 pestañas** del navegador
2. En la **Pestaña 1**: Crear sala como "Jugador 1"
3. En la **Pestaña 2**: Unirse como "Jugador 2"
4. En la **Pestaña 3**: Unirse como "Jugador 3"
5. Volver a **Pestaña 1** (admin):
   - Clic "Organizar Enfrentamientos"
   - Clic "Empezar Torneo"
   - Marca ganadores con los botones "Ganador"
6. ¡Observa las animaciones y confetti! 🎉

---

## 🎯 Flujos Principales

### Como Admin (Creador de Sala)

```
Home
 ↓
Configurar Perfil (avatar + nombre)
 ↓
Clic "Crear Sala"
 ↓
Definir máximo de participantes
 ↓
Copiar código de sala → Compartir
 ↓
Esperar a que se unan participantes
 ↓
"Organizar Enfrentamientos" → Genera pares aleatorios
 ↓
(Opcional) "Revolver Pares" → Cambia emparejamientos
 ↓
"Empezar Torneo" → Activa primer enfrentamiento
 ↓
Para cada enfrentamiento:
  - Observar quién gana
  - Clic "Ganador" junto al ganador
  - Ver animación 🎊
  - Siguiente enfrentamiento se activa automáticamente
 ↓
Último enfrentamiento → Pantalla de GANADOR FINAL 🏆
```

### Como Participante

```
Home
 ↓
Configurar Perfil (avatar + nombre)
 ↓
Clic "Unirse a Sala"
 ↓
Ingresar código de 6 caracteres
 ↓
Entrar a sala
 ↓
Esperar a que admin organice
 ↓
Esperar a que admin inicie torneo
 ↓
Ver enfrentamientos en tiempo real
 ↓
Disfrutar animaciones cuando se marcan ganadores
 ↓
Ver ganador final en el podio
```

---

## 🎨 Personalización

### Cambiar Avatar
- Clic en el círculo de avatar
- Selecciona imagen desde tu computadora
- Formatos soportados: JPG, PNG, GIF
- Se guarda automáticamente en tu navegador

### Cambiar Nombre
- Escribe directamente en el campo de nombre
- Máximo 20 caracteres
- Se guarda automáticamente

---

## 🔧 Comandos Útiles

```powershell
# Desarrollo (con hot reload)
npm run dev

# Verificar código
npm run check

# Formatear código
npm run format

# Linting
npm run lint

# Build de producción
npm run build

# Preview del build
npm run preview

# Tests E2E (opcional)
npm run test:e2e
```

---

## 📱 Uso Móvil

### Configurar para acceso en red local

1. Ejecutar con `--host`:
```powershell
npm run dev -- --host
```

2. Vite mostrará algo como:
```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
```

3. Desde tu móvil, navega a: `http://192.168.1.100:5173`

**Nota**: Asegúrate de que móvil y PC están en la misma red WiFi.

---

## 🐛 Troubleshooting Rápido

### ❌ Error: "Cannot find module"
**Solución**:
```powershell
rm -rf node_modules
npm install
```

### ❌ WebSocket no conecta
**Verificar**:
1. ¿El servidor está corriendo? (`npm run dev`)
2. Abre DevTools → Console → ¿Hay errores?
3. DevTools → Network → WS → ¿Se establece conexión?

**Solución**:
- Recargar página (Ctrl+R)
- Reiniciar servidor

### ❌ Avatar no se carga
**Verificar**:
- ¿El archivo es una imagen válida?
- ¿El tamaño es menor a 5MB?

**Solución**:
- Prueba con otra imagen
- Reduce tamaño/calidad de la imagen

### ❌ "Sala no encontrada"
**Causas**:
- Código incorrecto (verifica mayúsculas/minúsculas)
- La sala fue eliminada (todos los participantes salieron)
- El servidor se reinició (datos volátiles)

---

## 📚 Documentación Completa

- **README.md**: Documentación completa del proyecto
- **TECHNICAL_DECISIONS.md**: Decisiones arquitectónicas
- **DEPLOYMENT.md**: Guías de despliegue en producción
- **TESTING.md**: Casos de prueba detallados
- **CONTRIBUTING.md**: Guía para colaboradores

---

## 💡 Tips y Trucos

### Organización de Torneos Presenciales

1. **Proyecta en pantalla grande**: La sala en modo presentación
2. **Un dispositivo por participante**: Cada uno con su móvil
3. **Admin en PC**: Para mejor control
4. **Comparte código vía QR**: Usa un generador de QR online

### Torneos Remotos

1. **Comparte en videollamada**: Código de sala por chat
2. **Admin comparte pantalla**: Para que todos vean los brackets
3. **Comunicación por voz**: Discord/Zoom para coordinar

### Mejores Prácticas

- ✅ Sube avatares antes de comenzar
- ✅ Verifica número de participantes correcto
- ✅ Prueba "Organizar" antes de "Empezar"
- ✅ Usa "Revolver" si los pares no te convencen
- ✅ Espera a que la animación termine antes de marcar otro ganador

---

## 🎮 Modos de Juego Sugeridos

### 1. Torneo Clásico
- **Participantes**: 8
- **Formato**: Eliminación simple
- **Duración**: ~15 min

### 2. Torneo Rápido
- **Participantes**: 4
- **Formato**: Eliminación simple
- **Duración**: ~5 min

### 3. Battle Royale
- **Participantes**: 16-20
- **Formato**: Eliminación simple
- **Duración**: ~30 min

---

## 🆘 Soporte

¿Problemas? ¿Preguntas?

1. **Revisa** [TESTING.md](TESTING.md) para casos de prueba
2. **Busca** en Issues de GitHub
3. **Abre** un nuevo Issue con detalles

---

## 🚀 Próximos Pasos

Una vez familiarizado:

1. Lee [README.md](README.md) para detalles completos
2. Revisa [DEPLOYMENT.md](DEPLOYMENT.md) para producción
3. Contribuye en [GitHub](https://github.com/tu-repo)

---

**¡A jugar! 🎮⚔️**
