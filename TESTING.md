# Testing Guide - PvP Arena

Guía detallada para realizar pruebas manuales del sistema.

## Configuración de Entorno de Pruebas

### Requisitos
- Navegadores: Chrome, Firefox, Safari
- Múltiples pestañas/ventanas o dispositivos
- Conexión a internet estable

### Iniciar Servidor
```powershell
npm run dev
```

Servidor disponible en: `http://localhost:5173`

---

## Test Suite 1: Flujo Básico de Usuario

### ✅ Test 1.1: Configuración de Perfil

**Objetivo**: Verificar que el usuario puede configurar su perfil

**Pasos**:
1. Abrir `http://localhost:5173`
2. Hacer clic en el avatar circular
3. Seleccionar imagen desde el sistema de archivos
4. Verificar que aparece el preview
5. Ingresar nombre "Jugador 1"
6. Verificar que el nombre se muestra correctamente

**Resultado Esperado**:
- ✅ Avatar se actualiza con la imagen seleccionada
- ✅ Nombre aparece debajo del avatar
- ✅ Cambios se persisten al recargar la página (localStorage)

---

### ✅ Test 1.2: Crear Sala

**Objetivo**: Verificar la creación de sala

**Pasos**:
1. Con perfil configurado, clic en "🎮 Crear Sala"
2. En el modal, ingresar máximo de participantes: 4
3. Clic en "Crear"
4. Observar redirección a `/room/{CODE}`

**Resultado Esperado**:
- ✅ Se genera código de 6 caracteres (ej: "ABC123")
- ✅ Usuario aparece en lista de participantes con corona 👑
- ✅ Muestra "Participantes (1/4)"

---

### ✅ Test 1.3: Unirse a Sala

**Objetivo**: Verificar que otros usuarios pueden unirse

**Pasos**:
1. Copiar código de sala del Test 1.2
2. Abrir nueva pestaña en `http://localhost:5173`
3. Configurar perfil con nombre "Jugador 2"
4. Clic en "🚪 Unirse a Sala"
5. Ingresar código copiado
6. Clic en "Unirse"

**Resultado Esperado**:
- ✅ Redirección a la misma sala
- ✅ Ambas pestañas muestran 2 participantes
- ✅ Sincronización en tiempo real
- ✅ Jugador 1 ve a Jugador 2 aparecer instantáneamente

---

## Test Suite 2: Sistema de Torneo

### ✅ Test 2.1: Organizar Enfrentamientos

**Preparación**: Tener sala con 4 participantes (abrir 4 pestañas)

**Pasos**:
1. En pestaña del admin (Jugador 1), clic "🎲 Organizar Enfrentamientos"
2. Observar sección de enfrentamientos

**Resultado Esperado**:
- ✅ Se crean 2 pares de enfrentamientos
- ✅ Cada par muestra "Participante A vs Participante B"
- ✅ Todos los participantes ven los mismos pares
- ✅ Pares son aleatorios (diferentes cada vez)

---

### ✅ Test 2.2: Revolver Pares

**Preparación**: Test 2.1 completado

**Pasos**:
1. Como admin, clic "🔀 Revolver Pares"
2. Observar cambios en enfrentamientos
3. Intentar hacer clic nuevamente

**Resultado Esperado**:
- ✅ Pares se reorganizan aleatoriamente
- ✅ Botón se deshabilita por 3 segundos (cooldown)
- ✅ Muestra texto "⏳ Espera..."
- ✅ Todos los clientes ven los nuevos pares

---

### ✅ Test 2.3: Empezar Torneo

**Preparación**: Pares organizados

**Pasos**:
1. Como admin, clic "🚀 Empezar Torneo"
2. Observar el primer enfrentamiento

**Resultado Esperado**:
- ✅ Primer par se resalta en morado/purple
- ✅ Aparece texto "⏳ En progreso"
- ✅ Admin ve botones "Ganador" junto a cada participante del par activo
- ✅ Otros pares quedan en gris

---

### ✅ Test 2.4: Marcar Ganador

**Preparación**: Torneo iniciado

**Pasos**:
1. Como admin, en el par activo, clic "Ganador" en uno de los participantes
2. Observar animación
3. Observar siguiente enfrentamiento

**Resultado Esperado**:
- ✅ Explosión de confetti aparece en TODAS las pestañas
- ✅ Aparece modal pequeño mostrando al ganador por ~2.5 segundos
- ✅ El ganador se marca con 🏆 en su card
- ✅ El par activo cambia al siguiente automáticamente
- ✅ El nuevo par se resalta en morado

---

### ✅ Test 2.5: Finalizar Torneo

**Preparación**: Marcar ganadores de todos los pares

**Pasos**:
1. Marcar ganador del último par
2. Observar pantalla final

**Resultado Esperado**:
- ✅ Aparece pantalla full con "¡GANADOR!"
- ✅ Muestra avatar grande del ganador
- ✅ Explosión masiva de confetti
- ✅ Estrellas animadas
- ✅ Podio muestra top 3 con medallas (🥇🥈🥉)
- ✅ Contador de victorias para cada uno

---

## Test Suite 3: Edge Cases

### ✅ Test 3.1: Número Impar de Participantes

**Pasos**:
1. Crear sala con 3 participantes
2. Organizar enfrentamientos
3. Observar los pares

**Resultado Esperado**:
- ✅ Se crea 1 par normal
- ✅ El tercer participante tiene "BYE - Pasa automáticamente"
- ✅ Al empezar torneo, el participante con BYE avanza solo
- ✅ El siguiente par se activa inmediatamente

---

### ✅ Test 3.2: Sala Llena

**Pasos**:
1. Crear sala con máximo 2 participantes
2. Unir 2 participantes
3. Intentar unir un 3er participante

**Resultado Esperado**:
- ✅ Aparece notificación de error "❌ Sala llena"
- ✅ El 3er participante NO entra a la sala
- ✅ Los 2 participantes existentes no se ven afectados

---

### ✅ Test 3.3: Código de Sala Inválido

**Pasos**:
1. Intentar unirse con código "INVALID"
2. Observar error

**Resultado Esperado**:
- ✅ Aparece notificación "❌ Sala no encontrada"
- ✅ Usuario permanece en home

---

### ✅ Test 3.4: Admin Abandona Sala

**Pasos**:
1. Crear sala con admin + 2 participantes
2. Admin hace clic en "🚪 Salir"
3. Observar en pestañas de otros participantes

**Resultado Esperado**:
- ✅ Admin desaparece de lista de participantes
- ✅ Primer participante restante recibe corona 👑 (nuevo admin)
- ✅ Nuevo admin puede usar controles de admin
- ✅ Sala NO se elimina

---

### ✅ Test 3.5: Todos Abandonan Sala

**Pasos**:
1. Crear sala con 2 participantes
2. Ambos hacen clic en "Salir"
3. Intentar acceder al código de sala nuevamente

**Resultado Esperado**:
- ✅ Sala se elimina del servidor
- ✅ Al intentar entrar con el código, error "Sala no encontrada"

---

## Test Suite 4: Sincronización en Tiempo Real

### ✅ Test 4.1: Participante se Une Durante Torneo

**Preparación**: Torneo en progreso con 1 par pendiente

**Pasos**:
1. Nueva pestaña intenta unirse a la sala
2. Observar mensaje

**Resultado Esperado**:
- ✅ Aparece error "El torneo ya comenzó"
- ✅ No puede unirse

---

### ✅ Test 4.2: Reconexión de WebSocket

**Pasos**:
1. Estar en una sala activa
2. Abrir DevTools → Network → WS
3. Simular desconexión (cerrar WS)
4. Observar comportamiento

**Resultado Esperado**:
- ✅ Cliente detecta desconexión
- ✅ Intenta reconectar automáticamente cada 2 segundos
- ✅ Al reconectar, solicita estado de sala
- ✅ Estado se sincroniza correctamente

---

### ✅ Test 4.3: Múltiples Acciones Simultáneas

**Pasos**:
1. Como admin, clic rápido múltiples veces en "Revolver Pares"
2. Observar comportamiento

**Resultado Esperado**:
- ✅ Solo la primera acción se procesa
- ✅ Botón se deshabilita (cooldown)
- ✅ No hay duplicación de eventos

---

## Test Suite 5: Responsividad

### ✅ Test 5.1: Mobile (375px width)

**Pasos**:
1. Abrir DevTools → Device Toolbar
2. Seleccionar iPhone SE (375px)
3. Navegar por home y sala

**Resultado Esperado**:
- ✅ Layout se adapta a pantalla pequeña
- ✅ Botones son accesibles con el pulgar
- ✅ Texto legible (no muy pequeño)
- ✅ Avatar no se deforma

---

### ✅ Test 5.2: Tablet (768px)

**Pasos**:
1. Simular iPad (768px)
2. Navegar por sala

**Resultado Esperado**:
- ✅ Lista de participantes visible
- ✅ Brackets ocupan espacio restante
- ✅ No hay overflow horizontal

---

### ✅ Test 5.3: Desktop (1920px)

**Pasos**:
1. Vista en pantalla grande
2. Observar distribución

**Resultado Esperado**:
- ✅ 3 columnas (si hay espacio)
- ✅ Contenido centrado (max-width)
- ✅ No se estira excesivamente

---

## Test Suite 6: Performance

### ✅ Test 6.1: Sala con 20 Participantes

**Pasos**:
1. Crear sala con máx. 20 participantes
2. Abrir 20 pestañas y unir a todos
3. Organizar enfrentamientos
4. Observar lag/performance

**Resultado Esperado**:
- ✅ No hay lag significativo (<100ms)
- ✅ Animaciones fluidas
- ✅ WebSocket maneja broadcast sin problemas

---

### ✅ Test 6.2: Confetti en Múltiples Clientes

**Pasos**:
1. Sala con 5+ participantes
2. Marcar ganador
3. Observar animación en todas las pestañas

**Resultado Esperado**:
- ✅ Confetti se reproduce sin lags
- ✅ No afecta interactividad del resto de la UI
- ✅ Se limpia correctamente tras 3 segundos

---

## Matriz de Compatibilidad de Navegadores

| Feature | Chrome | Firefox | Safari | Edge | Mobile Safari | Mobile Chrome |
|---------|--------|---------|--------|------|---------------|---------------|
| WebSocket | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| Upload Avatar | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| Confetti | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Responsive | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Leyenda**:
- ✅ Funciona perfectamente
- ⚠️ Funciona con limitaciones menores
- ❌ No funciona

---

## Checklist de Pruebas Pre-Deploy

Antes de hacer deploy a producción, verificar:

- [ ] Test Suite 1 (Flujo Básico) ✅
- [ ] Test Suite 2 (Sistema de Torneo) ✅
- [ ] Test Suite 3 (Edge Cases) ✅
- [ ] Test Suite 4 (Sincronización) ✅
- [ ] Test Suite 5 (Responsividad) ✅
- [ ] Test Suite 6 (Performance) ✅
- [ ] Sin errores en consola
- [ ] Sin warnings de compilación
- [ ] Build exitoso (`npm run build`)
- [ ] Preview del build funciona (`npm run preview`)

---

## Reportar Bugs Encontrados

Si encuentras un bug durante las pruebas, documenta:

1. **Test que falló**: Ej. "Test 2.4 - Marcar Ganador"
2. **Comportamiento esperado vs actual**
3. **Pasos exactos para reproducir**
4. **Screenshots o video** (si aplica)
5. **Navegador y versión**
6. **Logs de consola** (si hay errores)

Formato de reporte:
```markdown
## Bug: [Título]

**Test**: Test 2.4 - Marcar Ganador

**Esperado**: Confetti aparece en todas las pestañas

**Actual**: Solo aparece en pestaña del admin

**Reproducir**:
1. Crear sala con 2 participantes
2. Organizar y empezar torneo
3. Marcar ganador
4. Observar pestaña del participante

**Navegador**: Chrome 120.0 en Windows 11

**Logs**:
```
Error: WebSocket send failed
```
