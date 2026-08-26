# 🚀 Guía de Despliegue en la Nube para Hackathon

## 📋 Resumen
- **Frontend:** Vercel (Gratis, automático)
- **Backend:** Railway (Gratis con créditos, automático)
- **Base de datos:** MongoDB Atlas (Gratis)
- **Tiempo total:** 15-20 minutos

---

## 1️⃣ Configurar MongoDB Atlas (Base de Datos)

### Paso 1: Crear cuenta
1. Ir a https://www.mongodb.com/cloud/atlas
2. Sign up (puedes usar GitHub)
3. Crear organización

### Paso 2: Crear cluster
1. Click en "Create" → "Database"
2. Seleccionar plan **FREE** (M0)
3. Seleccionar región (ej: AWS - Virginia)
4. Click "Create"
5. Esperar a que se cree (2-3 minutos)

### Paso 3: Obtener connection string
1. En la página del cluster, click en "Connect"
2. Seleccionar "Drivers"
3. Copiar la connection string:
   ```
   mongodb+srv://usuario:password@cluster.mongodb.net/mantenimiento?retryWrites=true&w=majority
   ```
4. Reemplazar `usuario` y `password` con credenciales nuevas

**Guarda esta URL, la necesitarás para Railway**

---

## 2️⃣ Desplegar Backend en Railway

### Paso 1: Crear cuenta
1. Ir a https://railway.app
2. Sign up con GitHub
3. Autorizar acceso al repositorio

### Paso 2: Crear nuevo proyecto
1. Click en "New Project"
2. Seleccionar "Deploy from GitHub repo"
3. Seleccionar tu repositorio: `mantenimiento-industrial`

### Paso 3: Configurar
1. Railway detectará que es Node.js
2. Click en el proyecto que se creó
3. Ir a "Settings" → "Environment"
4. Agregar variables:

```
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/mantenimiento?retryWrites=true&w=majority
JWT_SECRET=tu_secret_jwt_muy_seguro_aqui
PORT=5000
NODE_ENV=production
```

### Paso 4: Esperar deploy
1. Railway deploya automáticamente
2. Ir a "Deployments" para ver estado
3. Esperar a que diga "Success"

### Paso 5: Obtener URL del backend
1. En el proyecto, ir a "Settings"
2. En "Service" buscar "Public Networking"
3. Copiar la URL (algo como: `https://mantenimiento-industrial-production.up.railway.app`)

**Guarda esta URL, la necesitarás para Vercel**

---

## 3️⃣ Desplegar Frontend en Vercel

### Paso 1: Crear cuenta
1. Ir a https://vercel.com
2. Sign up con GitHub
3. Autorizar acceso

### Paso 2: Import proyecto
1. Click en "Add New..." → "Project"
2. Seleccionar tu repositorio
3. Vercel detectará que es Vite React
4. Click "Import"

### Paso 3: Configurar variables de entorno
1. Antes de hacer click en "Deploy", ir a "Environment Variables"
2. Agregar:
   ```
   Name: VITE_API_URL
   Value: https://tu-backend-en-railway.up.railway.app
   Scopes: Production, Preview, Development
   ```

3. Click "Save"

### Paso 4: Deploy
1. Click en "Deploy"
2. Esperar a que termine (2-5 minutos)
3. Vercel te dará una URL pública

---

## ✅ Verificación

Una vez desplegados:

1. **Abrir URL de Vercel**
2. Intentar login con:
   - Email: `admin@test.com`
   - Password: `password123`

3. Si funciona: ¡Listo para hackathon! 🎉

---

## 🔗 URLs Finales

Después del despliegue tendrás:

- **Frontend:** `https://tu-proyecto.vercel.app`
- **Backend:** `https://tu-proyecto-production.up.railway.app`
- **Base de datos:** MongoDB Atlas Cloud

---

## 💡 Notas Importantes

✅ Ambas plataformas tienen **auto-deploy**: cada vez que hagas push a main, se actualiza automáticamente

✅ Vercel es **gratis** para proyectos públicos

✅ Railway da **$5/mes gratis** (suficiente para hackathon)

✅ MongoDB Atlas **siempre gratis** para el tier M0

✅ **No necesitas tarjeta de crédito** si usas los planes gratis

---

## 🆘 Troubleshooting

### "La aplicación crashea segundos después de arrancar en Railway"

Este es el problema más común. Railway no encuentra el punto de entrada del servidor.

**Solución:**

1. **Verifica que exista `Procfile` en la carpeta `backend/`:**
   ```
   backend/
   ├── Procfile          ← Debe existir
   ├── server.js
   ├── package.json
   └── ...
   ```

2. **Si no existe, créalo:**

   **Linux/macOS:**
   ```bash
   echo "web: node server.js" > backend/Procfile
   ```

   **Windows (PowerShell):**
   ```powershell
   @"
web: node server.js
"@ | Out-File -Encoding UTF8 backend/Procfile
   ```

3. **Verifica que exista `railway.json` en la raíz:**
   ```
   mantenimiento-industrial/
   ├── railway.json      ← Debe existir
   ├── backend/
   ├── frontend/
   └── ...
   ```

4. **Si no existe, créalo:**

   **Linux/macOS:**
   ```bash
   cat > railway.json << EOF
{
  "services": [
    {
      "name": "backend",
      "root": "backend",
      "startCommand": "npm start"
    }
  ]
}
EOF
   ```

   **Windows (PowerShell):**
   ```powershell
   @"
{
  "services": [
    {
      "name": "backend",
      "root": "backend",
      "startCommand": "npm start"
    }
  ]
}
"@ | Out-File -Encoding UTF8 railway.json
   ```

5. **Push los cambios a GitHub:**
   ```bash
   git add backend/Procfile railway.json
   git commit -m "Add Railway configuration files"
   git push
   ```

6. **En Railway, redeploy:**
   - Ve a "Deployments"
   - Click en el deploy que falló
   - Click en "Redeploy"
   - Espera a que termine

### "MongoDB connection error en Railway"

**Causa:** La IP de Railway no está permitida en MongoDB Atlas

**Solución:**

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click en tu cluster
3. Ir a "Network Access"
4. Click en "Add IP Address"
5. Seleccionar "Allow access from anywhere" (0.0.0.0/0)
6. Click "Confirm"

**⚠️ Nota:** Esto es seguro porque estás usando autenticación (usuario/password) en la conexión.

### "Error: Cannot find module 'express'" en Railway

**Causa:** Las dependencias no se instalaron

**Solución:**

En Railway, asegúrate de que:
1. `NODE_ENV=production` está configurado
2. El archivo `package.json` está en la carpeta correcta (`backend/`)
3. No hay un `.gitignore` que excluya `package.json`

Verifica en Railway:
- Ve a "Settings" → "Environment"
- Busca `NODE_ENV` y asegúrate de que sea `production`

### "Logs no aparecen en Railway"

**Causa:** Los logs van a stdout pero Railway no los captura

**Solución en `server.js`:**

Asegúrate de que está usando `console.log` (no ficheros):

```javascript
console.log(`Servidor ejecutándose en puerto ${PORT}`);
console.log(`MongoDB conectado`);
```

### "Frontend no conecta al backend en Railway"

**Causa:** `VITE_API_URL` es incorrecto o no está configurado

**Solución en Vercel:**

1. Ve a tu proyecto en Vercel
2. Click en "Settings" → "Environment Variables"
3. Busca `VITE_API_URL`
4. Verifica que sea exactamente la URL de tu backend en Railway:
   ```
   https://tu-backend-railway-url.up.railway.app
   ```
   (Sin `/api` al final)

5. Si cambias la variable, redeploy:
   - Ve a "Deployments"
   - Click en "..." → "Redeploy"

### "Error: connect ECONNREFUSED" en logs

**Causa:** El backend no está respondiendo a peticiones

**Solución:**

1. Verifica que `server.js` esté escuchando en todas las interfaces:
   ```javascript
   app.listen(PORT, '0.0.0.0', () => {
     console.log(`Servidor ejecutándose en puerto ${PORT}`);
   });
   ```

2. No uses `localhost` o `127.0.0.1` (solo funciona localmente)

3. Asegúrate de que `PORT` esté configurado en Railway Environment Variables

### "CORS error" en el navegador

**Causa:** El backend no acepta requests desde Vercel

**Solución en `server.js`:**

Verifica que CORS esté configurado correctamente:

```javascript
import cors from 'cors';

app.use(cors({
  origin: '*', // Permite cualquier origen (para hackathon)
  credentials: true
}));
```

### "Seed data no se crea automáticamente"

El seed se ejecuta solo localmente. Para crear datos en Railway:

1. Ve a Railway → Tu backend
2. Click en "Console"
3. Ejecuta:
   ```bash
   npm run seed
   ```

---

## 📋 Checklist Final Antes de Hackathon

- [ ] `Procfile` existe en `backend/`
- [ ] `railway.json` existe en la raíz
- [ ] MongoDB Atlas tiene acceso permitido (0.0.0.0/0)
- [ ] Variables de entorno en Railway están correctas
- [ ] Variables de entorno en Vercel están correctas
- [ ] Frontend conecta exitosamente al backend
- [ ] Puedo hacer login en la aplicación
- [ ] Los datos se guardos correctamente (crear un ticket de prueba)
- [ ] Los logs de Railway no muestran errores
- [ ] La URL de Vercel funciona en incógnito/privado
