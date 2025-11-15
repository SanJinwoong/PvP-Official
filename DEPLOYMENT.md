# Guía de Despliegue - PvP Arena

## Opción 1: Railway (Recomendada)

### Paso 1: Preparar el proyecto

Asegúrate de que `svelte.config.js` use `adapter-node`:

```javascript
import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter()
  }
};
```

### Paso 2: Deploy con Railway

```powershell
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Inicializar proyecto
railway init

# Deploy
railway up
```

Railway detectará automáticamente el proyecto Node.js y ejecutará:
- Build: `npm run build`
- Start: `node build`

### Paso 3: Configurar dominio (opcional)

1. Ve a tu proyecto en Railway dashboard
2. Settings → Domains → Generate domain
3. Tu app estará en `https://tu-proyecto.up.railway.app`

---

## Opción 2: Render

### Paso 1: Conectar GitHub

1. Push tu código a GitHub
2. Ve a [render.com](https://render.com)
3. New → Web Service
4. Conecta tu repositorio

### Paso 2: Configurar servicio

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
node build
```

**Environment:**
- Node.js

### Paso 3: Deploy

Render automáticamente desplegará en cada push a main.

---

## Opción 3: VPS (DigitalOcean, Linode, etc.)

### Paso 1: Configurar servidor

```bash
# Conectar vía SSH
ssh root@tu-ip

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 para gestión de procesos
npm install -g pm2
```

### Paso 2: Subir código

```powershell
# En local: crear build
npm run build

# Subir a servidor (usa SCP o Git)
scp -r build package.json package-lock.json root@tu-ip:/var/www/pvp-arena/
```

### Paso 3: Ejecutar con PM2

```bash
# En servidor
cd /var/www/pvp-arena
npm install --production

# Iniciar con PM2
pm2 start build/index.js --name pvp-arena

# Configurar auto-restart
pm2 startup
pm2 save
```

### Paso 4: Configurar Nginx (opcional)

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Opción 4: Fly.io

### Paso 1: Instalar Fly CLI

```powershell
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

### Paso 2: Login y crear app

```powershell
fly auth login
fly launch
```

### Paso 3: Configurar `fly.toml`

```toml
app = "pvp-arena"

[build]
  builder = "heroku/buildpacks:20"

[env]
  PORT = "8080"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1

[[http_service.concurrency]]
  type = "connections"
  hard_limit = 1000
  soft_limit = 500
```

### Paso 4: Deploy

```powershell
fly deploy
```

---

## Verificación Post-Deploy

### 1. Verificar WebSocket

Abre DevTools → Network → WS y verifica que la conexión WebSocket se establece correctamente.

URL esperada:
- Desarrollo: `ws://localhost:5173/ws`
- Producción: `wss://tu-dominio.com/ws`

### 2. Prueba de múltiples clientes

Abre la app en 2 dispositivos diferentes y verifica sincronización en tiempo real.

### 3. Logs

**Railway/Render:**
Ver logs en el dashboard

**PM2:**
```bash
pm2 logs pvp-arena
```

**Fly.io:**
```powershell
fly logs
```

---

## Variables de Entorno (Opcional)

Si necesitas configurar puerto o host:

```env
# .env
PORT=3000
HOST=0.0.0.0
```

**Railway/Render:** Añadir en Settings → Environment Variables

**PM2:**
```bash
pm2 start build/index.js --name pvp-arena --env production
```

---

## SSL/HTTPS

### Railway/Render/Fly.io
✅ SSL automático incluido

### VPS con Nginx
Usa Certbot para Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

---

## Monitoreo

### Uptime Monitoring
- [UptimeRobot](https://uptimerobot.com) (gratis)
- [Pingdom](https://pingdom.com)

### Performance
- New Relic (APM)
- Datadog

### Logs
- Logtail
- Papertrail

---

## Troubleshooting

### ❌ WebSocket no conecta

**Síntoma:** Error en consola "WebSocket connection failed"

**Solución:**
1. Verificar que el protocolo sea `wss://` en producción
2. Revisar configuración de proxy/load balancer
3. Asegurar que el puerto WebSocket esté expuesto

### ❌ Build falla

**Síntoma:** Error en deploy "Build failed"

**Soluciones:**
1. Verificar que `adapter-node` esté en `devDependencies`
2. Ejecutar `npm run build` localmente para ver errores
3. Revisar que `package.json` tenga todos los scripts

### ❌ La app reinicia constantemente

**Síntoma:** Logs muestran crashes repetidos

**Soluciones:**
1. Revisar errores en logs
2. Verificar que el puerto esté correctamente configurado
3. Asegurar que las dependencias estén instaladas

---

## Costos Estimados

| Servicio | Plan | Costo/mes | WebSocket | Notas |
|----------|------|-----------|-----------|-------|
| Railway | Hobby | $5 (500h) | ✅ | Recomendado para MVP |
| Render | Free | $0 | ✅ | Duerme tras 15min inactividad |
| Fly.io | Free | $0 | ✅ | 3 VMs pequeñas gratis |
| DigitalOcean | Droplet | $6 | ✅ | Más control, más trabajo |

**Recomendación:** Railway para producción, Render para demos.
