# 🗺️ Centro de Seguridad TDF - Mapa de Calor de Delitos

Aplicación interactiva y responsiva para visualizar la concentración de delitos tradicionales y ciberdelitos en Tierra del Fuego (Ushuaia, Río Grande y Tolhuin), basado en las estadísticas del IPIEC 2025.

---

## 📂 Estructura del Proyecto

```bash
/security-audit-map
├── /api
│   └── crimes.js                # Endpoint API de backend (Node/Serverless)
├── /data
│   └── tierradelfuego_crimes.json # Dataset JSON estático de respaldo
├── /public
│   ├── /data
│   │   └── tierradelfuego_crimes.json # Copia para carga estática en cliente
│   ├── app.js                   # Lógica del mapa base (Leaflet) e interactividad
│   ├── index.html               # Interfaz de usuario responsiva y accesible
│   └── style.css                # Estilos del mapa de calor (Premium Dark)
├── .firebaserc                  # Configuración del proyecto de Firebase
└── firebase.json                # Configuración de reglas de Firebase Hosting
```

---

## 🛠️ Configuración y Despliegue

### Requisitos Previos
1. Instalar la CLI de Firebase en su sistema:
   ```bash
   npm install -g firebase-tools
   ```

### Despliegue en Firebase Hosting (Paso a Paso)
1. Abra una terminal en el directorio del sub-proyecto:
   ```bash
   cd security-audit-map
   ```
2. Inicie sesión en su cuenta de Firebase:
   ```bash
   firebase login
   ```
3. Vincule el directorio a su proyecto de Firebase (opcional si desea cambiar el ID de `.firebaserc`):
   ```bash
   firebase use --add
   ```
4. Despliegue el sitio estático:
   ```bash
   firebase deploy --only hosting
   ```
5. Tras completarse el comando, se le proporcionará el enlace de acceso público:
   `https://tdf-security-heatmap.web.app` o `https://tdf-security-heatmap.firebaseapp.com`.

---

## 🔑 Credenciales e Integración de Google Maps API

Si desea cambiar la capa base de Leaflet por Google Maps JavaScript API con la biblioteca `visualization` para la capa de calor nativa:

1. Genere una API Key en [Google Cloud Console](https://console.cloud.google.com/).
2. **Restricción de Seguridad Crítica (Recomendado)**:
   - Acceda a las configuraciones de la API Key.
   - En **Restricciones de aplicación**, seleccione **Sitios web (referentes HTTP)**.
   - Añada los dominios autorizados para evitar el uso no autorizado de su clave:
     - `https://tdf-security-heatmap.web.app/*`
     - `https://tdf-security-heatmap.firebaseapp.com/*`
     - `http://localhost:3000/*` (para desarrollo local)
3. Modifique la importación en `index.html` reemplazando los scripts de Leaflet por:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=SU_API_KEY&libraries=visualization&callback=initMap" async defer></script>
   ```

---

## 📅 Cronograma y Automatización de Actualizaciones

Dado que los reportes de seguridad del IPIEC se consolidan mensualmente, se sugiere programar la actualización de datos mediante un script automatizado que extraiga el JSON y lo actualice en Firebase:

### Tarea programada sugerida (Crontab)
Para ejecutar un script actualizador el primer día de cada mes a las 00:00:
```cron
0 0 1 * * /usr/bin/python3 /path/to/update_crime_data.py && cd /path/to/security-audit-map && /usr/local/bin/firebase deploy --only hosting
```

---

## 💰 Estimación de Costos Mensuales (USD)

### 1. API de Google Maps (Maps JavaScript API & Heatmap Visualization)
Google otorga un crédito mensual gratuito de **USD 200**, el cual cubre la gran mayoría de casos de uso de nivel medio.

| Volumen de Carga mensual | Tarifa por 1,000 solicitudes | Costo Total Estimado | Saldo Final con Crédito |
| :--- | :---: | :---: | :---: |
| **0 a 28,000 cargas** | USD 7.00 | USD 0.00 - 196.00 | **USD 0.00 (Gratuito)** |
| **50,000 cargas** | USD 7.00 | USD 350.00 | **USD 150.00** |
| **100,000 cargas** | USD 7.00 | USD 700.00 | **USD 500.00** |

*Nota: Con Leaflet como capa base de desarrollo, el costo de mapas es de **USD 0.00**.*

### 2. Firebase Hosting
Firebase ofrece un plan gratuito (Spark Plan) extremadamente generoso.

| Servicio | Límite Gratuito (Spark) | Costo por exceso (Blaze Plan) | Costo Estimado (Tráfico Normal) |
| :--- | :--- | :--- | :--- |
| **Almacenamiento** | 10 GB | USD 0.026 por GB | **USD 0.00** |
| **Transferencia de datos** | 360 MB al día (~10 GB/mes) | USD 0.15 por GB | **USD 0.00** |

**Costo Mensual Estimado Total (Uso Típico): USD 0.00** (cubierto en su totalidad por los créditos de Google Cloud y el plan gratuito de Firebase Hosting).
