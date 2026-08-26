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

### "La aplicación no conecta al backend"
- Verifica que `VITE_API_URL` esté correctamente en Vercel
- Verifica que el backend en Railway esté corriendo (ve a Deployments)

### "Error de autenticación"
- Verifica que `JWT_SECRET` sea igual en backend local y en Railway
- Si cambias `JWT_SECRET` en Railway, tendrás que logout y login de nuevo

### "MongoDB connection error"
- Verifica la `MONGODB_URI` en Railway
- Verifica que tu IP esté permitida en MongoDB Atlas (Network Access)

---

## 📱 Para la Hackathon

Comparte estos links:
- ✅ URL de Vercel (para los jueces)
- ✅ GitHub repo (para código)
- ✅ Demo credentials (email/password)

¡Mucho éxito en la hackathon! 🚀
