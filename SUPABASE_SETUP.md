# Configuración de Supabase

## 1. Crear Proyecto en Supabase

1. Ve a https://supabase.com y crea una cuenta (puedes usar GitHub)
2. Click en "New Project"
3. Completa los datos:
   - **Name**: `pvp-tournaments` (o el nombre que prefieras)
   - **Database Password**: Genera una contraseña segura y **GUÁRDALA**
   - **Region**: Selecciona la más cercana a tus usuarios (ejemplo: `South America (São Paulo)`)
4. Click en "Create new project" y espera 2-3 minutos

## 2. Obtener las Credenciales

Una vez creado el proyecto:

1. Ve a **Settings** (⚙️ en el menú izquierdo)
2. Click en **API** en el submenú
3. Copia estos dos valores:

   - **Project URL** → Esta es tu `VITE_SUPABASE_URL`
   - **anon/public key** → Esta es tu `VITE_SUPABASE_ANON_KEY`

## 3. Crear la Tabla `rooms`

1. Ve a **SQL Editor** (📝 en el menú izquierdo)
2. Click en **New query**
3. Copia y pega el siguiente SQL:

```sql
-- Crear tabla rooms
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(6) UNIQUE NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 10,
  admin_id TEXT NOT NULL,
  participants JSONB DEFAULT '[]'::jsonb,
  pairs JSONB DEFAULT '[]'::jsonb,
  tournament_started BOOLEAN DEFAULT FALSE,
  tournament_finished BOOLEAN DEFAULT FALSE,
  current_pair_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear índice para búsquedas rápidas por código
CREATE INDEX idx_rooms_code ON rooms(code);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en cada UPDATE
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Política de seguridad: permitir todo por ahora (público)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso público a rooms"
  ON rooms
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Limpiar salas antiguas automáticamente (opcional, después de 24 horas)
CREATE OR REPLACE FUNCTION delete_old_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM rooms
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentación
COMMENT ON TABLE rooms IS 'Salas de torneos PvP efímeras';
COMMENT ON COLUMN rooms.code IS 'Código de 6 caracteres para unirse a la sala';
COMMENT ON COLUMN rooms.participants IS 'Array JSON de participantes con {id, name, avatar, isAdmin, isConnected}';
COMMENT ON COLUMN rooms.pairs IS 'Array JSON de pares con {id, participant1, participant2, winner, isActive}';
```

4. Click en **Run** (▶️)
5. Deberías ver "Success. No rows returned"

## 4. Habilitar Realtime en la Tabla

1. Ve a **Database** → **Replication** (en el menú izquierdo)
2. Busca la tabla `rooms`
3. Activa el toggle en **Enable** (debe ponerse verde)
4. Esto permite que los cambios se transmitan en tiempo real

## 5. Configurar Variables de Entorno

### Para Desarrollo Local

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

Reemplaza los valores con los que copiaste en el paso 2.

### Para Producción (Dokploy)

1. Ve a tu aplicación en Dokploy
2. Navega a **Environment Variables**
3. Agrega estas dos variables:
   - `VITE_SUPABASE_URL` = `https://tu-proyecto.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `tu-anon-key-aqui`
4. Guarda y redeploya

## 6. Instalar Dependencias

```powershell
npm install
```

Esto instalará `@supabase/supabase-js` que ya está en `package.json`.

## 7. Probar Localmente

```powershell
npm run dev
```

Abre http://localhost:5173 y prueba:
- Crear una sala
- Copiar el código
- Abrir en otra pestaña (modo incógnito) y unirte
- Deberías ver actualizaciones en tiempo real

## 8. Desplegar a Producción

```powershell
git add .
git commit -m "feat: migrate to Supabase Realtime"
git push origin main
```

Luego en Dokploy:
1. Click en **Redeploy**
2. Espera a que termine el build
3. Abre https://pvp.jinwoong.me y prueba

## 9. Verificar que Funciona

### En Supabase Dashboard:

1. Ve a **Table Editor** → `rooms`
2. Cuando crees una sala, deberías ver una nueva fila aparecer
3. Cuando agregues participantes, verás que el campo `participants` se actualiza

### En la App:

- ✅ Crear sala genera código de 6 caracteres
- ✅ Unirse a sala funciona con el código
- ✅ Lista de participantes se actualiza en tiempo real
- ✅ Organizar pares funciona
- ✅ Iniciar torneo y marcar ganador funciona
- ✅ Animación de victoria aparece

## Solución de Problemas

### Error: "No se encuentra el módulo @supabase/supabase-js"

```powershell
rm -rf node_modules package-lock.json
npm install
```

### Error: "Invalid API key"

Verifica que copiaste correctamente `VITE_SUPABASE_ANON_KEY` y que tiene el prefijo `eyJ...`

### Error: "relation 'rooms' does not exist"

Vuelve a ejecutar el SQL del paso 3 en Supabase SQL Editor

### Los cambios no se reflejan en tiempo real

1. Verifica que Realtime está habilitado en la tabla `rooms` (paso 4)
2. Abre DevTools → Console y busca errores de Supabase
3. Verifica que `VITE_SUPABASE_URL` es correcta

### Error en TypeScript: "Type 'any' implicitly"

Ejecuta `npm run build` para verificar que no haya errores de tipos reales

## Diferencias vs WebSocket Original

| Característica | WebSocket Original | Supabase Realtime |
|----------------|-------------------|-------------------|
| Infraestructura | Requiere servidor WebSocket en Dokploy | Servicio administrado por Supabase |
| Configuración | Traefik headers, custom server.js | Solo variables de entorno |
| Persistencia | In-memory (se pierde al reiniciar) | PostgreSQL (persiste) |
| Escalabilidad | Limitada a 1 servidor | Automática |
| Debugging | Logs del servidor WebSocket | Dashboard de Supabase |
| Costo | Hosting del servidor | Plan gratuito hasta 500MB DB + 2GB bandwidth |

## Notas de Seguridad

⚠️ **IMPORTANTE**: Las políticas RLS actuales permiten acceso público total. Para producción real, considera:

1. Agregar autenticación de usuarios
2. Restringir permisos por sala/admin
3. Implementar rate limiting
4. Limpiar salas antiguas regularmente

Ejemplo de política más segura:

```sql
-- Solo el admin puede modificar pares y estado del torneo
CREATE POLICY "Solo admin puede modificar torneo"
  ON rooms
  FOR UPDATE
  USING (
    (participants @> jsonb_build_array(
      jsonb_build_object('id', auth.uid(), 'isAdmin', true)
    ))
  );
```

## Recursos

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Postgres JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
