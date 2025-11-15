# ✅ Migración a Supabase Completada

## 🎉 ¿Qué se hizo?

Se migró exitosamente el sistema de WebSocket in-memory a **Supabase Realtime** para resolver los problemas de conexión en producción.

### Archivos Modificados

1. **`src/lib/stores/websocket.ts`** (reescrito completamente)
   - Eliminado: WebSocket nativo con conexión manual
   - Agregado: Supabase Realtime con postgres_changes
   - Mismas funciones: createRoom, joinRoom, organizePairs, shufflePairs, startTournament, markWinner
   - API compatible: Los componentes siguen funcionando igual

2. **`src/lib/supabase.ts`** (nuevo)
   - Cliente de Supabase inicializado
   - Configuración de Realtime con rate limiting

3. **`package.json`**
   - Removido: `ws`, `express`, `polka`
   - Agregado: `@supabase/supabase-js@^2.47.10`

4. **`.env.example`**
   - Removido: `NODE_ENV`, `PORT`, `ORIGIN`
   - Agregado: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

5. **`README.md`**
   - Actualizado con instrucciones de Supabase
   - Enfatizado que ahora hay persistencia

6. **`src/routes/+page.svelte`** y **`src/routes/room/[code]/+page.svelte`**
   - Removido: llamadas a `wsStore.connect()` (ya no necesarias)
   - Removido: `wsStore.getRoomState()` (ahora se suscribe automáticamente)

### Archivos Nuevos

- **`SUPABASE_SETUP.md`** - Guía paso a paso para configurar Supabase (schema SQL incluido)
- **`NEXT_STEPS.md`** - Este archivo

---

## 🚀 PRÓXIMOS PASOS (DEBES HACERLOS TÚ)

### 1️⃣ Crear Proyecto en Supabase (5 minutos)

Sigue la guía completa en **`SUPABASE_SETUP.md`**, pero aquí el resumen:

1. **Ve a** https://supabase.com
2. **Crea una cuenta** (puedes usar GitHub)
3. **New Project**:
   - Name: `pvp-tournaments`
   - Database Password: genera una y **GUÁRDALA**
   - Region: `South America (São Paulo)` (o la más cercana)
4. **Espera 2-3 minutos** a que se cree el proyecto

### 2️⃣ Copiar Credenciales

Una vez creado:

1. Ve a **Settings** ⚙️ → **API**
2. Copia estos valores:
   - **Project URL** → `https://abc123xyz.supabase.co`
   - **anon/public key** → `eyJhbGc...` (un token JWT largo)

### 3️⃣ Ejecutar SQL en Supabase

1. Ve a **SQL Editor** 📝 en Supabase
2. Click **New query**
3. Copia y pega el SQL completo de `SUPABASE_SETUP.md` (sección 3)
4. Click **Run** ▶️
5. Deberías ver "Success. No rows returned"

### 4️⃣ Habilitar Realtime

1. Ve a **Database** → **Replication**
2. Busca la tabla `rooms`
3. Activa el toggle **Enable** (debe ponerse verde ✅)

### 5️⃣ Crear Archivo `.env`

En la raíz del proyecto (`C:\Users\ed_li\my-pvp`), crea un archivo `.env`:

```env
VITE_SUPABASE_URL=https://abc123xyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

Reemplaza con tus valores del paso 2.

### 6️⃣ Probar Localmente

```powershell
npm run dev
```

1. Abre http://localhost:5173
2. Crea una sala
3. Abre otra pestaña en modo incógnito
4. Únete con el código
5. **Deberías ver actualizaciones en tiempo real** ✨

### 7️⃣ Verificar en Supabase Dashboard

1. Ve a **Table Editor** en Supabase
2. Selecciona la tabla `rooms`
3. Deberías ver una fila con:
   - `code`: el código de tu sala (ej. `A3K9F2`)
   - `participants`: JSON con tus participantes
   - `admin_id`: tu clientId

### 8️⃣ Actualizar Variables en Dokploy

1. Ve a tu aplicación en Dokploy
2. Navega a **Environment Variables**
3. Agrega:
   - `VITE_SUPABASE_URL` = `https://tu-proyecto.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `tu-anon-key`
4. **Guarda**

### 9️⃣ Hacer Commit y Push

```powershell
git add .
git commit -m "feat: migrate to Supabase Realtime for production reliability"
git push origin main
```

### 🔟 Redeploy en Dokploy

1. Ve a tu aplicación en Dokploy
2. Click **Redeploy**
3. Espera a que termine el build (2-3 minutos)
4. Abre https://pvp.jinwoong.me
5. **PRUEBA**:
   - Crear sala desde tu PC
   - Unirte desde tu celular con el código
   - Deberías ver actualizaciones en tiempo real 🎉

---

## 🔍 Cómo Verificar que Funciona

### ✅ Indicadores de Éxito

1. **En Desarrollo (localhost)**:
   - No ves errores en la consola del navegador
   - Al crear una sala, aparece el código
   - Al unirte desde otra pestaña, ambos ven la lista de participantes
   - Puedes organizar pares y ver los cambios en ambas pestañas

2. **En Supabase Dashboard**:
   - Tabla `rooms` tiene filas cuando creas salas
   - El campo `participants` se actualiza al unirte
   - El campo `pairs` se llena al organizar pares

3. **En Producción (Dokploy)**:
   - https://pvp.jinwoong.me carga sin errores
   - Puedes crear salas desde un dispositivo
   - Puedes unirte desde otro dispositivo con el código
   - Los cambios se sincronizan en tiempo real

### ❌ Qué Hacer si NO Funciona

#### Error: "No se encuentra el módulo @supabase/supabase-js"

```powershell
rm -rf node_modules package-lock.json
npm install
```

#### Error: "Invalid API key"

- Verifica que `VITE_SUPABASE_ANON_KEY` tiene el prefijo `eyJ...`
- Revisa que no haya espacios al inicio/final en `.env`
- El anon key debe ser el **público**, no el service_role key

#### Error: "relation 'rooms' does not exist"

- Vuelve a ejecutar el SQL del paso 3 en Supabase SQL Editor
- Verifica que estás en el proyecto correcto

#### Los cambios no se reflejan en tiempo real

1. **Verifica Realtime**: Database → Replication → `rooms` debe estar verde
2. **Abre DevTools**: Console → busca errores de Supabase
3. **Verifica URL**: `VITE_SUPABASE_URL` debe ser exacta (sin espacios ni `/` al final)

#### Build falla en Dokploy

- Verifica que las variables de entorno estén guardadas
- Verifica que `package.json` tiene `@supabase/supabase-js`
- Revisa los logs de build en Dokploy

---

## 📊 Diferencias vs WebSocket Original

| Aspecto | WebSocket In-Memory | Supabase Realtime |
|---------|---------------------|-------------------|
| **Configuración** | Custom server, Traefik headers | Solo variables de entorno |
| **Persistencia** | ❌ Se pierde al reiniciar | ✅ PostgreSQL |
| **Escalabilidad** | Limitada a 1 servidor | Automática |
| **Debugging** | Logs del servidor | Dashboard visual |
| **Infraestructura** | Requiere WebSocket endpoint | Servicio administrado |
| **Costo** | Hosting del servidor | Gratis hasta 500MB DB |
| **Complejidad** | Alta (6 intentos fallidos) | Baja (solo setup inicial) |

---

## 🎯 Por Qué Supabase es Mejor para Producción

1. **Sin configuración de infraestructura**: No necesitas configurar Traefik, reverse proxy, WebSocket headers, etc.
2. **Servicio administrado**: Supabase se encarga de la escalabilidad, backups, y uptime
3. **Persistencia**: Las salas sobreviven reinicios del servidor
4. **Debugging fácil**: Dashboard visual para ver exactamente qué datos hay en la DB
5. **Usado por profesionales**: Empresas como Kahoot, Gartic Phone usan servicios similares (Firebase, PubNub, Supabase)

---

## 📚 Recursos Útiles

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Guía completa paso a paso
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)

---

## 🆘 Si Necesitas Ayuda

1. **Revisa los logs**: DevTools Console + Supabase Logs
2. **Verifica credenciales**: `.env` local y Dokploy environment variables
3. **Comprueba Realtime**: Database → Replication debe estar verde
4. **Mira la tabla**: Table Editor → `rooms` debe tener datos

Si después de seguir todos los pasos aún tienes problemas, avísame con:
- El error exacto que ves
- Screenshots del error
- Logs de Dokploy (si aplica)
