# Iconos de MediosWikiApp

## 📥 Instrucciones para Agregar el Icono

### Paso 1: Descargar el Icono de Flaticon

1. Visita: https://www.flaticon.es/icono-gratis/content-marketing_8456668
2. Click en "Descargar gratis"
3. Selecciona formato: **PNG**
4. Selecciona tamaño: **512px** o mayor
5. Guarda el archivo aquí como: `medioswikiapp-icon.png`

### Paso 2: Generar Favicons

Usa un generador online como:
- https://realfavicongenerator.net/
- https://favicon.io/

Sube `medioswikiapp-icon.png` y descarga el paquete completo.

### Paso 3: Colocar los Archivos

Coloca estos archivos en el directorio `public/`:

```
public/
├── favicon.ico
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png
├── android-chrome-192x192.png
└── android-chrome-512x512.png
```

### Paso 4: Actualizar el Layout

El código ya está preparado para usar los favicons automáticamente.

## 🎨 Logo SVG Actual

Mientras tanto, la aplicación usa un logo SVG personalizado:
- Archivo: `src/components/MediosWikiAppLogo.tsx`
- Diseño: Megáfono con ondas de sonido
- Colores: Gradiente azul (#3B82F6 → #1E40AF)
