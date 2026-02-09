# 🔄 Sistema de Actualización Automática de RSS

Este documento describe cómo funciona el sistema de actualización automática de noticias RSS en WikiApp.

## 📋 Descripción General

El sistema implementa **3 niveles de actualización automática**:

### 1️⃣ Actualización del Servidor (GitHub Actions)
- **Frecuencia**: Cada 15 minutos
- **Ubicación**: `.github/workflows/update-feeds.yml`
- **Proceso**:
  1. GitHub Actions ejecuta el workflow automáticamente
  2. Descarga las últimas noticias de todos los feeds RSS configurados
  3. Actualiza `public/data/articles.json`
  4. Hace commit y push de los cambios

### 2️⃣ Auto-Refresh en el Cliente
- **Frecuencia**: Cada 5 minutos
- **Ubicación**: `src/hooks/useAutoRefresh.ts`
- **Proceso**:
  1. El navegador verifica automáticamente si hay nuevos datos
  2. Descarga `articles.json` actualizado sin recargar la página
  3. Actualiza la interfaz con las nuevas noticias

### 3️⃣ Indicador Visual
- **Componente**: `src/components/RefreshIndicator.tsx`
- **Muestra**:
  - Última actualización (hace X minutos)
  - Estado de actualización en tiempo real
  - Indicador visual (punto verde/azul)

## 🚀 Configuración

### Cambiar Frecuencia de Actualización del Servidor

Edita `.github/workflows/update-feeds.yml`:

```yaml
on:
  schedule:
    - cron: '*/15 * * * *'  # Cada 15 minutos
```

Opciones comunes:
- `*/5 * * * *` - Cada 5 minutos
- `*/10 * * * *` - Cada 10 minutos
- `*/30 * * * *` - Cada 30 minutos
- `0 * * * *` - Cada hora

### Cambiar Frecuencia de Auto-Refresh del Cliente

Edita `src/components/Dashboard.tsx`:

```typescript
const { lastUpdate } = useAutoRefresh(refreshArticles, {
    interval: 5 * 60 * 1000, // 5 minutos en milisegundos
    enabled: true
});
```

## 📁 Estructura de Archivos

```
WikiApp/
├── .github/workflows/
│   └── update-feeds.yml          # Workflow de GitHub Actions
├── scripts/
│   ├── fetch-rss.mjs             # Script de descarga de RSS
│   └── update-all.mjs            # Script maestro de actualización
├── src/
│   ├── hooks/
│   │   └── useAutoRefresh.ts     # Hook de auto-refresh
│   └── components/
│       ├── Dashboard.tsx         # Componente principal (usa auto-refresh)
│       └── RefreshIndicator.tsx  # Indicador visual de actualización
└── public/data/
    ├── articles.json             # Artículos RSS (actualizado automáticamente)
    ├── feeds.json                # Configuración de feeds
    └── meta.json                 # Metadatos de actualización
```

## 🛠️ Scripts Disponibles

### Actualizar Manualmente

```bash
# Actualizar solo RSS
node scripts/fetch-rss.mjs

# Actualizar todos los datos
node scripts/update-all.mjs
```

### Ejecutar Workflow Manualmente

1. Ve a GitHub → Actions
2. Selecciona "Update RSS Feeds"
3. Click en "Run workflow"

## 📊 Monitoreo

### Ver Última Actualización

El indicador en la interfaz muestra:
- ✅ **Verde**: Datos actualizados recientemente
- 🔵 **Azul pulsante**: Actualizando en este momento

### Verificar Logs de GitHub Actions

1. Ve a tu repositorio en GitHub
2. Click en "Actions"
3. Selecciona el workflow "Update RSS Feeds"
4. Revisa los logs de ejecución

## 🔧 Solución de Problemas

### Las noticias no se actualizan

1. **Verifica GitHub Actions**:
   - Ve a Actions en GitHub
   - Revisa si hay errores en las ejecuciones

2. **Verifica permisos**:
   - GitHub Actions necesita permisos de escritura
   - Settings → Actions → General → Workflow permissions
   - Selecciona "Read and write permissions"

3. **Verifica feeds RSS**:
   - Asegúrate que las URLs en `feeds.json` sean válidas
   - Prueba ejecutar `node scripts/fetch-rss.mjs` localmente

### El auto-refresh no funciona en el navegador

1. Abre la consola del navegador (F12)
2. Busca errores relacionados con fetch
3. Verifica que `public/data/articles.json` sea accesible

## 📝 Agregar Nuevos Feeds RSS

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

El sistema automáticamente comenzará a incluir este feed en las próximas actualizaciones.

## 🎯 Mejores Prácticas

1. **No actualizar demasiado frecuente**: Respeta los servidores RSS
2. **Monitorear uso de GitHub Actions**: Hay límites mensuales
3. **Cachear en el cliente**: El hook ya implementa esto
4. **Manejar errores**: Los scripts ya tienen manejo de errores básico

## 📈 Próximas Mejoras

- [ ] Notificaciones push cuando hay nuevas noticias
- [ ] Actualización diferencial (solo nuevos artículos)
- [ ] Soporte para webhooks de feeds
- [ ] Dashboard de estadísticas de actualización
- [ ] Retry automático en caso de fallo

## 🤝 Contribuir

Si encuentras problemas o tienes sugerencias, por favor:
1. Abre un issue en GitHub
2. Describe el problema o mejora
3. Incluye logs si es relevante
