# 📰 MediosWikiApp

**Tu centro de noticias personalizado con feeds RSS en tiempo real**

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8?style=flat-square&logo=tailwind-css)

## ✨ Características

- 🔄 **Actualización Automática**: Los feeds RSS se actualizan cada 15 minutos vía GitHub Actions
- 🎨 **Diseño Premium**: Interfaz moderna con glassmorphism y animaciones suaves
- 📱 **Responsive**: Optimizado para móvil, tablet y desktop
- 🌙 **Modo Oscuro**: Diseño elegante con esquema de colores oscuros
- 📊 **Múltiples Vistas**: Lista, Tarjetas y Magazine
- 🔍 **Búsqueda Avanzada**: Filtra por feeds, categorías y palabras clave
- ⚡ **Alto Rendimiento**: Lazy loading, virtualización y optimización ISR
- 🌐 **Multi-fuente**: Soporta RSS, Atom y feeds de redes sociales
- 📖 **Vista de Lectura**: Lector integrado con navegación entre artículos
- 🌤️ **Widgets**: Clima, estado de rutas, efemérides

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 20.x o superior
- npm, yarn, pnpm o bun

### Instalación

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd WikiApp

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
MediosWikiApp/
├── .github/workflows/       # GitHub Actions para auto-actualización
├── docs/                    # Documentación
│   ├── AUTO_REFRESH.md     # Sistema de actualización automática
│   ├── BRANDING_UPDATE.md  # Guía de branding
│   └── SYSTEM_DIAGRAM.txt  # Diagrama del sistema
├── public/
│   ├── data/               # Datos JSON (feeds, artículos, etc.)
│   └── icons/              # Iconos y favicons
├── scripts/
│   ├── fetch-rss.mjs       # Script de descarga RSS
│   └── update-all.mjs      # Script maestro de actualización
├── src/
│   ├── app/                # Rutas de Next.js
│   ├── components/         # Componentes React
│   ├── hooks/              # Custom hooks
│   └── types/              # Definiciones TypeScript
└── package.json
```

## 🔄 Sistema de Actualización Automática

MediosWikiApp cuenta con un sistema de actualización en 3 niveles:

### Nivel 1: Servidor (GitHub Actions)
- **Frecuencia**: Cada 15 minutos
- **Proceso**: Descarga feeds RSS → Actualiza `articles.json` → Commit automático

### Nivel 2: Cliente (Navegador)
- **Frecuencia**: Cada 5 minutos
- **Proceso**: Verifica nuevos datos → Actualiza UI sin recargar

### Nivel 3: Indicador Visual
- Muestra última actualización en tiempo real
- Estados: Actualizado (🟢) / Actualizando (🔵)

📖 **Documentación completa**: [docs/AUTO_REFRESH.md](docs/AUTO_REFRESH.md)

## 🎨 Personalización

### Agregar Nuevos Feeds RSS

Edita `public/data/feeds.json`:

```json
{
  "id": "nuevo-feed",
  "name": "Nombre del Feed",
  "url": "https://ejemplo.com/rss",
  "category": "categoría",
  "type": "rss"
}
```

### Cambiar Frecuencia de Actualización

**Servidor** (`.github/workflows/update-feeds.yml`):
```yaml
schedule:
  - cron: '*/15 * * * *'  # Cada 15 minutos
```

**Cliente** (`src/components/Dashboard.tsx`):
```typescript
interval: 5 * 60 * 1000  // 5 minutos
```

### Personalizar Logo

El logo actual es un SVG en `src/components/MediosWikiAppLogo.tsx`.

Para usar un icono personalizado:
1. Descarga tu icono en PNG (512x512px)
2. Genera favicons en https://realfavicongenerator.net/
3. Coloca los archivos en `public/`

📖 **Guía completa**: [docs/BRANDING_UPDATE.md](docs/BRANDING_UPDATE.md)

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint

# Actualizar feeds manualmente
node scripts/fetch-rss.mjs

# Actualizar todos los datos
node scripts/update-all.mjs
```

## 🌐 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno (si las hay)
3. Despliega automáticamente con cada push

### GitHub Actions

El proyecto incluye un workflow que:
- Actualiza los feeds cada 15 minutos
- Hace commit automático de los cambios
- Dispara un nuevo deploy en Vercel

**Importante**: Asegúrate de habilitar permisos de escritura en GitHub Actions:
- Settings → Actions → General → Workflow permissions
- Selecciona "Read and write permissions"

## 📊 Stack Tecnológico

- **Framework**: Next.js 16.1.6 (App Router)
- **UI**: React 19.2.3
- **Estilos**: Tailwind CSS 4.x
- **TypeScript**: 5.x
- **RSS Parser**: rss-parser 3.13.0
- **Fuentes**: Inter (Google Fonts)

## 🎯 Características Destacadas

### Vista de Lectura
- Lector integrado estilo Inoreader
- Navegación entre artículos (← →)
- Resumen con IA (mock)
- Compartir en redes sociales

### Múltiples Layouts
- **Lista**: Compacta, solo texto
- **Tarjetas**: Con imágenes grandes (default)
- **Magazine**: Híbrido, estilo revista

### Widgets Integrados
- **Clima**: 5 ciudades de Tierra del Fuego
- **Estado de Rutas**: RN3 y complementarias
- **Reloj**: Hora local en tiempo real

## 📝 Licencia

Este proyecto es de código abierto. Consulta el archivo LICENSE para más detalles.

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Para preguntas o sugerencias, abre un issue en GitHub.

---

**Hecho con ❤️ para mantener informada a la comunidad**
