// Variables de Estado de la Aplicación
let map;
let heatLayer;
let markersLayer;
let crimeData = [];
const maxRenderPoints = 5000;

// Configuración de Coordenadas de Localidades
const cityCoords = {
    "ALL": { lat: -54.3000, lng: -67.8000, zoom: 8 }, // Centro provincial
    "Ushuaia": { lat: -54.8019, lng: -68.3029, zoom: 12 },
    "Río Grande": { lat: -53.7850, lng: -67.7000, zoom: 12 },
    "Tolhuin": { lat: -54.5100, lng: -67.1900, zoom: 12 }
};

// Inicialización de la Aplicación al Cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
    initLeafletMap();
    setupEventListeners();
    loadCrimeData();
});

// 1. Inicialización del Mapa Base (Open Source - Leaflet)
function initLeafletMap() {
    console.log("Inicializando mapa táctico de seguridad...");
    
    // Centrar inicialmente en Ushuaia (según requerimiento)
    const initCoords = cityCoords["Ushuaia"];
    map = L.map("map", {
        center: [initCoords.lat, initCoords.lng],
        zoom: initCoords.zoom,
        zoomControl: false
    });

    // Control de zoom en la parte inferior derecha
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Carga de capa base táctica oscura (CartoDB Dark Matter)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Crear capas de datos
    markersLayer = L.layerGroup().addTo(map);
}

// 2. Carga Dinámica de Datos mediante Fetch
async function loadCrimeData() {
    showLoader(true);
    try {
        // Cargar archivo JSON estático de respaldo
        const response = await fetch("./data/tierradelfuego_crimes.json");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        crimeData = data.crimes || [];
        
        console.log(`Datos de auditoría cargados: ${crimeData.length} registros.`);
        updateMetrics(crimeData.length);
        renderLayers();
    } catch (error) {
        console.error("Error al cargar los datos del mapa de calor:", error);
        // Fallback en caso de fallo de red
        loadLocalFallbackData();
    } finally {
        showLoader(false);
    }
}

// Datos de fallback en memoria si el fetch falla en desarrollo local
function loadLocalFallbackData() {
    crimeData = [
        { "id": 1, "city": "Ushuaia", "type": "Ciberdelito", "sub": "Estafa Virtual", "lat": -54.8064, "lng": -68.3072, "weight": 0.8, "desc": "Phishing bancario simulando plataforma BTF" },
        { "id": 2, "city": "Ushuaia", "type": "Ciberdelito", "sub": "Clonación WhatsApp", "lat": -54.8019, "lng": -68.3029, "weight": 0.9, "desc": "Ingeniería social orientada a jubilados" },
        { "id": 3, "city": "Río Grande", "type": "Ciberdelito", "sub": "Fraude Logístico", "lat": -53.7650, "lng": -67.7050, "weight": 0.8, "desc": "Estafas con falsos insumos industriales" },
        { "id": 4, "city": "Tolhuin", "type": "Robo/Hurto", "sub": "Hurto de Leña", "lat": -54.5050, "lng": -67.1850, "weight": 0.5, "desc": "Sustracción de madera acopiada" }
    ];
    updateMetrics(crimeData.length);
    renderLayers();
}

// 3. Configuración y Renderizado Dinámico de las Capas (Heat Layer + Marcadores)
function renderLayers() {
    // Limpiar capas anteriores
    if (heatLayer) {
        map.removeLayer(heatLayer);
    }
    markersLayer.clearLayers();

    // Obtener filtros seleccionados
    const selectedCity = document.getElementById("city-filter").value;
    const selectedCrimeType = document.getElementById("crime-filter").value;
    const radius = parseInt(document.getElementById("radius-slider").value, 10);
    const blur = parseInt(document.getElementById("blur-slider").value, 10);

    // Filtrar datos
    let filtered = crimeData.filter(item => {
        const cityMatch = (selectedCity === "ALL" || item.city === selectedCity);
        const crimeMatch = (selectedCrimeType === "ALL" || item.type === selectedCrimeType);
        return cityMatch && crimeMatch;
    });

    // Aplicar Restricción de Rendimiento (Límite máximo de puntos)
    if (filtered.length > maxRenderPoints) {
        filtered = filtered.slice(0, maxRenderPoints);
    }

    updateRenderMetrics(filtered.length);

    // Preparar puntos para la capa de calor de Leaflet: [lat, lng, weight]
    const heatPoints = filtered.map(item => [item.lat, item.lng, item.weight]);

    // Crear capa de calor
    heatLayer = L.heatLayer(heatPoints, {
        radius: radius,
        blur: blur,
        maxZoom: 15,
        gradient: {
            0.4: 'rgba(59, 130, 246, 0.8)', // Azul
            0.7: 'rgba(234, 88, 12, 0.8)',  // Naranja
            1.0: 'rgba(239, 68, 68, 0.8)'   // Rojo
        }
    }).addTo(map);

    // Añadir marcadores tácticos interactivos y accesibles
    filtered.forEach(item => {
        const marker = L.circleMarker([item.lat, item.lng], {
            radius: 6,
            color: "white",
            weight: 1.5,
            fillColor: getCrimeColor(item.type),
            fillOpacity: 0.95
        });

        // Contenido del popup interactivo
        const popupContent = `
            <div style="font-family: 'Outfit', sans-serif; padding: 4px;">
                <h4 style="margin: 0 0 6px 0; text-transform: uppercase; font-size: 11px; font-weight: 800; border-bottom: 1px solid #333; padding-bottom: 4px; color: ${getCrimeColor(item.type)}">
                    ${item.type} - ${item.sub}
                </h4>
                <p style="margin: 0; font-size: 10px; color: #a1a1aa; line-height: 1.4;">
                    <strong>Localidad:</strong> ${item.city}<br>
                    <strong>Caso:</strong> ${item.desc}<br>
                    <strong>Intensidad:</strong> ${(item.weight * 100).toFixed(0)}%
                </p>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        markersLayer.addLayer(marker);
    });
}

// Función auxiliar para colores tácticos según categoría
function getCrimeColor(type) {
    if (type === "Ciberdelito") return "#3b82f6";   // Azul
    if (type === "Robo/Hurto") return "#ef4444";    // Rojo
    return "#eab308";                               // Amarillo / Orden Público
}

// 4. Listeners para Elementos Interactivos
function setupEventListeners() {
    // Filtros
    document.getElementById("city-filter").addEventListener("change", (e) => {
        const city = e.target.value;
        if (cityCoords[city]) {
            // Re-centrar el mapa según la ciudad
            map.setView([cityCoords[city].lat, cityCoords[city].lng], cityCoords[city].zoom);
        }
        renderLayers();
    });

    document.getElementById("crime-filter").addEventListener("change", () => {
        renderLayers();
    });

    // Sliders de Configuración del Heatmap
    const radiusSlider = document.getElementById("radius-slider");
    const radiusVal = document.getElementById("radius-val");
    radiusSlider.addEventListener("input", (e) => {
        radiusVal.textContent = `${e.target.value}m`;
        renderLayers();
    });

    const blurSlider = document.getElementById("blur-slider");
    const blurVal = document.getElementById("blur-val");
    blurSlider.addEventListener("input", (e) => {
        blurVal.textContent = `${e.target.value}m`;
        renderLayers();
    });
}

// 5. Utilidades de UI y Métricas
function showLoader(show) {
    const loader = document.getElementById("loader");
    if (show) {
        loader.classList.remove("hidden");
        loader.setAttribute("aria-hidden", "false");
    } else {
        loader.classList.add("hidden");
        loader.setAttribute("aria-hidden", "true");
    }
}

function updateMetrics(count) {
    document.getElementById("metric-count").textContent = count;
}

function updateRenderMetrics(count) {
    document.getElementById("metric-render").textContent = count;
}
