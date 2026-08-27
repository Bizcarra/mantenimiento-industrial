# Guía de Contribución

Esta guía te ayudará a contribuir al proyecto de manera efectiva.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** v16+ ([descargar](https://nodejs.org/))
- **npm** v8+
- **MongoDB** local o en la nube ([descargar](https://www.mongodb.com/try/download/community))
- **Git** ([descargar](https://git-scm.com/))

---

## 🚀 Configuración Inicial

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/mantenimiento-industrial.git
cd mantenimiento-industrial
```

### 2. Instalar dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configurar variables de entorno

Crea los archivos `.env` en backend y frontend usando los `.env.example` como referencia.

**Backend `.env`:**
```env
MONGODB_URI=mongodb://localhost:27017/mantenimiento
JWT_SECRET=tu_secret_jwt_muy_seguro_aqui
PORT=5000
NODE_ENV=development
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5000
```

### 4. Inicializar base de datos

```bash
cd backend
npm run seed -- --confirm-reset-local-data
```

---

## 🔄 Flujo de Trabajo Git

### Estructura de Ramas

```
main            → Código en producción (protegida)
develop         → Rama de desarrollo principal
feature/*       → Nuevas funcionalidades
bugfix/*        → Corrección de bugs
hotfix/*        → Correcciones urgentes en producción
```

### Crear una Nueva Funcionalidad

```bash
# 1. Actualiza develop
git checkout develop
git pull origin develop

# 2. Crea tu rama
git checkout -b feature/nombre-descriptivo

# 3. Trabaja en tu código
# ... haz tus cambios ...

# 4. Commit con mensaje descriptivo
git add .
git commit -m "feat: descripción clara del cambio"

# 5. Push a tu rama
git push origin feature/nombre-descriptivo

# 6. Crea Pull Request en GitHub
# (desde la interfaz web de GitHub)
```

---

## 📝 Convención de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Nuevas funcionalidades
git commit -m "feat: agregar filtro por fecha en tickets"

# Correcciones de bugs
git commit -m "fix: corregir error de validación en login"

# Documentación
git commit -m "docs: actualizar README con nuevas instrucciones"

# Estilos (formato, espacios, etc.)
git commit -m "style: aplicar formato consistente en componentes"

# Refactoring (sin cambiar funcionalidad)
git commit -m "refactor: simplificar lógica de autenticación"

# Tests
git commit -m "test: agregar tests unitarios para middleware"

# Configuración o dependencias
git commit -m "chore: actualizar dependencias de seguridad"
```

---

## 🧪 Testing

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm test
```

---

## 🎨 Estándares de Código

### JavaScript/React

- Usa ES6+ features (arrow functions, destructuring, template literals)
- Nombres descriptivos en español para variables/funciones de negocio
- CSS Modules para estilos en React
- Evita código duplicado (DRY principle)

**Ejemplo:**

```javascript
// ✅ Bueno
const obtenerTicketsPorEstado = (tickets, estado) => {
  return tickets.filter(ticket => ticket.estado === estado);
};

// ❌ Evitar
function getT(t, s) {
  return t.filter(x => x.estado === s);
}
```

### Estructura de Archivos

```
backend/
  routes/       → Endpoints API
  models/       → Esquemas Mongoose
  middleware/   → Lógica intermedia (auth, validation)
  config/       → Configuración (DB, etc.)

frontend/
  src/
    pages/      → Páginas principales
    components/ → Componentes reutilizables
    context/    → Estado global (Context API)
    services/   → API calls
```

---

## 🔍 Code Review

Antes de crear un Pull Request:

1. **Auto-revisión**: Lee tu código como si fueras otro developer
2. **Tests**: Asegúrate que todos los tests pasen
3. **Lint**: Verifica que no haya errores de sintaxis
4. **Funcionalidad**: Prueba tu cambio en desarrollo local
5. **Documentación**: Actualiza README si es necesario

### Checklist para PR

- [ ] El código compila sin errores
- [ ] Los tests pasan
- [ ] Agregué tests para nueva funcionalidad
- [ ] Actualicé la documentación si era necesario
- [ ] Seguí la convención de commits
- [ ] Mi branch está actualizada con develop
- [ ] No hay conflictos con develop

---

## 🐛 Reportar Bugs

Si encuentras un bug:

1. Verifica que no exista un issue similar
2. Crea un nuevo issue con:
   - Título descriptivo
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots (si aplica)
   - Entorno (OS, Node version, etc.)

---

## 💡 Sugerir Mejoras

Para proponer nuevas funcionalidades:

1. Crea un issue con label `enhancement`
2. Describe el problema que resuelve
3. Propón una solución
4. Espera feedback del equipo antes de implementar

---

## 🚢 Despliegue

El despliegue se realiza automáticamente cuando se hace merge a `main`.

### Backend
- Plataforma: Railway / Render
- Variable: `MONGODB_URI` debe apuntar a MongoDB Atlas

### Frontend
- Plataforma: Vercel / Netlify
- Variable: `VITE_API_URL` debe apuntar al backend en producción

---

## 📞 Ayuda

Si tienes dudas:

1. Revisa la [documentación](README.md)
2. Busca en issues existentes
3. Pregunta en el canal de desarrollo del equipo
4. Crea un issue con label `question`

---

## 📄 Licencia

Este proyecto es privado. Todo el código es propiedad del equipo de desarrollo.

---

¡Gracias por contribuir! 🎉
