# 📚 Guía: Subir Proyecto a GitHub

## Paso 1: Crear repositorio en GitHub

1. Ve a [github.com](https://github.com)
2. Haz clic en el **+** (arriba a la derecha) → **New repository**
3. Rellena los datos:
   - **Repository name:** `mantenimiento-industrial`
   - **Description:** Sistema de Gestión de Mantenimiento Industrial (MVP)
   - **Visibility:** Private (si es privado) o Public (si es público)
   - **Initialize repository:** NO marques nada (ya tenemos commits)

4. Haz clic en **Create repository**

---

## Paso 2: Conectar repositorio local con GitHub

Después de crear el repo en GitHub, verás instrucciones. Ejecuta en tu terminal:

```bash
cd "/home/bizcarra/Escritorio/Plataforma Web"

# Agregar remoto
git remote add origin https://github.com/TU_USUARIO/mantenimiento-industrial.git

# Renombrar rama (opcional, pero recomendado cambiar a 'main')
git branch -M main

# Pushear el código
git push -u origin main
```

**Reemplaza `TU_USUARIO` con tu usuario de GitHub**

---

## Paso 3: Crear rama de desarrollo

Es buena práctica tener una rama `develop` para trabajo en equipo:

```bash
# Crear rama develop
git checkout -b develop

# Pushear rama develop
git push -u origin develop
```

---

## Paso 4: Proteger ramas (Recomendado)

Para evitar que alguien pushee directamente a `main`:

1. Ve a tu repositorio en GitHub
2. Settings → Branches
3. Haz clic en **Add rule**
4. Branch name pattern: `main`
5. Marca las opciones:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging (opcional)
   - ✅ Restrict who can push to matching branches

6. Haz clic en **Create**

---

## Paso 5: Invitar compañeros

### Opción A: Como Colaboradores

1. Ve a tu repositorio → **Settings** → **Collaborators**
2. Haz clic en **Add people**
3. Escribe el usuario de GitHub de tu compañero
4. Selecciona permiso: **Maintain** (para que pueda hacer merge)
5. Envía invitación

### Opción B: En una Organización (Más profesional)

1. Crea una organización en GitHub
2. Agrega el repositorio a la organización
3. Invita compañeros como miembros
4. Asigna roles (Owner, Maintainer, Member)

---

## Paso 6: Clonar en máquina del compañero

Tus compañeros pueden ahora clonar:

```bash
# Clonar repositorio
git clone https://github.com/TU_USUARIO/mantenimiento-industrial.git
cd mantenimiento-industrial

# Cambiar a rama develop (para trabajar)
git checkout develop

# Instalar dependencias
cd backend && npm install
cd ../frontend && npm install

# Crear archivos .env
cd ../backend
cp .env.example .env

cd ../frontend
cp .env.example .env.local

# Ejecutar proyecto
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

---

## 🔄 Flujo de Trabajo en Equipo

### Cada miembro hace esto para trabajar:

```bash
# 1. Asegurarse que develop está actualizado
git checkout develop
git pull origin develop

# 2. Crear rama de feature
git checkout -b feature/mi-funcionalidad

# 3. Trabajar en la rama
# ... editar archivos ...

# 4. Hacer commits
git add .
git commit -m "feat: descripción del cambio"

# 5. Pushear a GitHub
git push origin feature/mi-funcionalidad

# 6. En GitHub: Crear Pull Request
#    - Ir a https://github.com/TU_USUARIO/mantenimiento-industrial
#    - Haz clic en "Pull Requests"
#    - Haz clic en "New Pull Request"
#    - Selecciona tu rama
#    - Describe los cambios
#    - Haz clic en "Create Pull Request"

# 7. Esperar review y aprobación

# 8. Merge (el admin lo hace)
```

---

## 📋 Estructura de Ramas Recomendada

```
main (rama principal - código de producción)
  ↑
develop (rama de desarrollo - donde se integra todo)
  ↑
feature/* (ramas de features)
  ├─ feature/login-mejorado
  ├─ feature/reportes
  └─ feature/notificaciones

bugfix/* (ramas de correcciones)
  ├─ bugfix/validacion-email
  └─ bugfix/error-dashboard

hotfix/* (correcciones críticas de producción)
  └─ hotfix/seguridad-critica
```

---

## 🤝 Para que tus Compañeros Trabajen Contigo

### 1. Compañero A: Clonar y configurar

```bash
git clone https://github.com/TU_USUARIO/mantenimiento-industrial.git
cd mantenimiento-industrial
git checkout develop
npm install  # en backend y frontend
```

### 2. Compañero A: Crear rama para su feature

```bash
git checkout -b feature/nueva-funcionalidad
# ... trabajar ...
git push origin feature/nueva-funcionalidad
```

### 3. Compañero A: Crear Pull Request en GitHub

### 4. Tú (Owner): Revisar y hacer merge

```bash
# En tu máquina
git checkout develop
git pull origin develop
# Revisar cambios en GitHub y hacer merge
# O hacer merge local:
git merge feature/nueva-funcionalidad
git push origin develop
```

### 5. Compañero A: Actualizar su rama develop

```bash
git checkout develop
git pull origin develop
```

---

## ⚠️ Errores Comunes y Soluciones

### Error: "fatal: 'origin' does not appear to be a 'git' repository"

```bash
# Significa que no agregaste el remoto
git remote add origin https://github.com/TU_USUARIO/mantenimiento-industrial.git
git push -u origin main
```

### Error: "Permission denied (publickey)"

```bash
# Necesitas configurar SSH
# Ve a https://github.com/settings/keys
# Sigue las instrucciones para agregar tu clave SSH

# O usa HTTPS en lugar de SSH
git remote set-url origin https://github.com/TU_USUARIO/mantenimiento-industrial.git
```

### Error: "conflicts" al hacer merge

```bash
# Resuelve conflictos manualmente
# Abre los archivos con <<< >>> >>>
# Elige qué código mantener
git add .
git commit -m "Resolver conflictos"
git push origin feature/nombre
```

### Compañero: "Your branch is behind... You need to pull"

```bash
git pull origin develop
```

---

## 🔐 Seguridad: No Commitar Archivos Sensibles

Asegúrate de que `.gitignore` incluya:

```
# Archivos locales
.env
.env.local
.env.*.local

# node_modules
node_modules/

# Archivos de OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Logs
*.log
npm-debug.log*

# Build
dist/
build/
```

**✅ Verificar**: Los archivos `.env` **NO** deben estar commitados.

---

## 📈 Flujo Típico de un Sprint

### Lunes: Planificación
1. Crear ramas para cada feature
2. Cada compañero se asigna una rama

### Durante la semana: Desarrollo
1. Cada compañero trabaja en su rama
2. Pushea cambios regularmente
3. Pide reviews a compañeros

### Viernes: Integración
1. Hacer Pull Request a `develop`
2. Revisar y mergear
3. Testear en `develop`
4. Mergear a `main` si está listo

---

## 🚀 Comandos Útiles

```bash
# Ver estado
git status

# Ver commits
git log --oneline

# Ver ramas
git branch -a

# Ver diferencias
git diff

# Deshacer cambios (sin commitear)
git checkout -- archivo.txt

# Descartar commits locales (CUIDADO)
git reset --hard origin/develop

# Stash (guardar cambios temporalmente)
git stash
git stash pop

# Ver historia de un archivo
git log -p archivo.txt

# Amend último commit (antes de pushear)
git commit --amend --no-edit
```

---

## 📞 Ayuda Rápida

| Problema | Comando |
|----------|---------|
| Ver estado | `git status` |
| Crear rama | `git checkout -b feature/nombre` |
| Cambiar rama | `git checkout develop` |
| Hacer commit | `git commit -m "mensaje"` |
| Pushear | `git push origin rama` |
| Actualizar | `git pull origin rama` |
| Ver diferencias | `git diff` |
| Deshacer cambios | `git checkout -- archivo` |

---

## ✅ Checklist Final

- [ ] Creé repositorio en GitHub
- [ ] Agregué remoto a mi máquina
- [ ] Pusheé código a GitHub
- [ ] Creé rama `develop`
- [ ] Protegí rama `main`
- [ ] Invité compañeros
- [ ] Los compañeros pueden clonar
- [ ] Los compañeros pueden crear ramas
- [ ] `.env` no está commitado
- [ ] `.gitignore` está configurado

---

## 📚 Recursos Útiles

- [Git Docs](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Oh My Git!](https://ohmygit.org/) - Tutorial interactivo
- [Git Cheat Sheet](https://github.github.com/training-kit/downloads/github-git-cheat-sheet.pdf)

---

**¡Listo! Tu proyecto está en GitHub y tus compañeros pueden colaborar.** 🎉
