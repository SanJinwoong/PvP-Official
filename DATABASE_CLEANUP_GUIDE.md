# 🔧 Guía Rápida: Solución a Base de Datos Llena

## 🚨 ¿Qué Pasó?

El error **"AbortError: The operation was aborted"** (code 20) significa que Supabase tardó más de 30 segundos en responder. Esto pasa cuando hay **demasiadas salas acumuladas** que consumen recursos.

---

## ✅ SOLUCIÓN INMEDIATA (1 minuto)

### Opción 1: Botón Flotante Morado 🟣

1. Ve a **pvp.jinwoong.me**
2. Mira la **esquina inferior izquierda**
3. Click en el **botón morado flotante** (ícono de base de datos)
4. Click en **"🧹 Limpiar salas >5 minutos"**
5. ✅ ¡Listo! Intenta crear sala de nuevo

### Opción 2: URL Directa

Abre: **[pvp.jinwoong.me/db-stats](https://pvp.jinwoong.me/db-stats)**

---

## 📊 ¿Qué Verás en el Diagnóstico?

```
📊 Estadísticas:
┌─────────┬──────────┬─────────┬────────┬──────────┐
│  Total  │  Activas │  Stale  │  Dead  │  Ancient │
│   125   │    8     │   15    │   45   │    57    │
│         │  <10min  │ 10-60m  │ 1-24hr │   >24hr  │
└─────────┴──────────┴─────────┴────────┴──────────┘
```

### 🚦 Códigos de Color:
- 🟢 **Verde (Activas)**: Salas en uso ahora
- 🟡 **Amarillo (Stale)**: Hace 10-60 minutos
- 🔴 **Rojo (Dead)**: Hace 1-24 horas
- 🟣 **Morado (Ancient)**: Hace más de 24 horas

---

## 🧹 Opciones de Limpieza

### 1. **Limpiar >5 minutos** (Recomendado)
- Elimina salas abandonadas recientes
- Libera recursos sin afectar nadie
- **Usa esto primero**

### 2. **Limpiar >60 minutos** (Conservador)
- Solo elimina salas muy viejas
- Más seguro si tienes dudas

### 3. **Limpiar >24 horas** (Ancient)
- Solo elimina salas de días anteriores
- Muy conservador

### 4. **⚠️ ELIMINAR TODO** (Emergencia)
- **CUIDADO**: Elimina TODAS las salas
- Úsalo solo si nada más funciona
- Pedirá confirmación 2 veces

---

## 🤖 Limpieza Automática

El sistema **ya limpia automáticamente**:
- ✅ Cada **5 minutos** en background
- ✅ Cuando **falla create/join** (primer retry)
- ✅ Elimina salas con **>5 minutos** de inactividad

**Pero** si tienes muchas pruebas recientes (cientos de salas), la automática no alcanza.

---

## 🔍 ¿Por Qué Pasó Esto?

```
Muchas pruebas con amigos (20+ personas)
  ↓
Salas creadas y abandonadas
  ↓
Base de datos acumula 100+ salas
  ↓
Supabase FREE tier se satura
  ↓
Queries tardan >30s
  ↓
AbortError (timeout)
```

---

## 📈 ¿Cuándo Limpiar?

### 🟢 TODO BIEN (No hacer nada)
- Total: <20 salas
- Activas: mayoría
- Ancient: 0-5

### 🟡 CONSIDERA LIMPIAR
- Total: 20-50 salas
- Stale/Dead: >10
- Ancient: >5

### 🔴 LIMPIAR AHORA
- Total: >50 salas
- Dead: >20
- Ancient: >10
- **Síntoma**: Errores al crear salas

### 🚨 EMERGENCIA
- Total: >100 salas
- No puedes crear salas ni con retry
- **Acción**: Eliminar todo y empezar limpio

---

## 💡 Tips para Evitar el Problema

### ✅ DO (Hacer):
1. **Limpia después de sesiones de prueba** con muchos amigos
2. **Usa /db-stats** antes de eventos grandes
3. **Cierra salas** cuando terminen (botón "Salir")
4. **Monitorea** si tienes >30 salas total

### ❌ DON'T (No hacer):
1. ~~Crear 20+ salas de prueba sin limpiar~~
2. ~~Dejar salas abiertas por días~~
3. ~~Ignorar el botón morado de diagnóstico~~
4. ~~Hacer muchas pruebas sin monitorear~~

---

## 🆘 Comandos Útiles

### Ver Estadísticas (API):
```bash
curl https://pvp.jinwoong.me/api/db-stats
```

### Limpiar >60 minutos (API):
```bash
curl -X POST "https://pvp.jinwoong.me/api/db-stats?action=cleanup&minutes=60"
```

### Limpiar >5 minutos (API):
```bash
curl -X POST "https://pvp.jinwoong.me/api/db-stats?action=cleanup&minutes=5"
```

### Eliminar TODO (API - PELIGRO):
```bash
curl -X POST "https://pvp.jinwoong.me/api/db-stats?action=deleteAll"
```

---

## 🎯 Checklist Post-Problema

Después de limpiar, verifica:

- [ ] Refresh la página (Ctrl+F5)
- [ ] Abre /db-stats y verifica Total <20
- [ ] Intenta crear sala de nuevo
- [ ] Funciona en <5 segundos
- [ ] No sale error de timeout
- [ ] Amigos pueden unirse sin problemas

---

## 🚀 Upgrade Path (Futuro)

Si el problema **persiste** incluso con limpieza:

### Opción 1: Supabase Pro ($25/mes)
- +5x performance
- +10x límites
- Sin timeouts
- **Recomendado** si usas con >50 personas regularmente

### Opción 2: Auto-Cleanup Más Agresivo
- Cambiar threshold: 5min → **2min**
- Cleanup interval: 5min → **1min**
- Archivo: `src/routes/api/cleanup/+server.ts`

### Opción 3: Database Indexing
```sql
-- Ejecutar en Supabase SQL Editor
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_rooms_updated_at ON rooms(updated_at);
```

---

## 📞 FAQ

**P: ¿Perderé salas activas si limpio?**
R: No. "Limpiar >5 minutos" solo elimina salas sin actividad por más de 5 minutos.

**P: ¿Cada cuánto debo limpiar?**
R: Después de cada sesión de pruebas con >10 personas. O cuando veas >50 salas en /db-stats.

**P: ¿El botón morado qué hace?**
R: Te lleva a /db-stats donde ves estadísticas y puedes limpiar manualmente.

**P: ¿La limpieza automática no debería ser suficiente?**
R: Sí, PERO si haces 50+ salas de prueba en 10 minutos, se acumulan más rápido de lo que el auto-cleanup elimina.

**P: ¿Puedo eliminar una sala específica?**
R: Por ahora no (feature futuro). Usa las opciones de limpieza por tiempo.

**P: ¿Afecta a usuarios normales?**
R: No. Los usuarios solo ven "Sala XXXX" y cuando sales, la sala queda inactiva para cleanup automático.

---

## 🎉 Resumen de 30 Segundos

1. **Problema**: Base de datos llena → Timeout
2. **Solución**: Click botón morado → Limpiar >5 min
3. **Prevención**: Limpia después de pruebas grandes
4. **Monitor**: pvp.jinwoong.me/db-stats
5. **Automático**: Sistema limpia cada 5 min

**¡Listo para usar de nuevo!** 🚀
