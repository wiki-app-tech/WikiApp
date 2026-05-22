const fs = require('fs');
const path = require('path');

/**
 * Endpoint API para consultar delitos de Tierra del Fuego de forma dinámica.
 * Diseñado para entornos Node.js / Vercel Serverless / Firebase Functions.
 */
module.exports = (req, res) => {
    // Permitir CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/json');

    try {
        const dataPath = path.join(__dirname, '..', 'data', 'tierradelfuego_crimes.json');
        
        if (!fs.existsSync(dataPath)) {
            return res.status(404).json({ error: "Archivo de datos no encontrado." });
        }

        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(rawData);
        
        let filteredCrimes = data.crimes || [];

        // Filtro por Ciudad
        const { city, type } = req.query;
        if (city && city !== 'ALL') {
            filteredCrimes = filteredCrimes.filter(c => c.city.toLowerCase() === city.toLowerCase());
        }

        // Filtro por Tipo de Delito
        if (type && type !== 'ALL') {
            filteredCrimes = filteredCrimes.filter(c => c.type.toLowerCase() === type.toLowerCase());
        }

        return res.status(200).json({
            metadata: {
                ...data.metadata,
                filtered_records: filteredCrimes.length,
                timestamp: new Date().toISOString()
            },
            crimes: filteredCrimes
        });

    } catch (error) {
        console.error("Error en Endpoint /api/crimes:", error);
        return res.status(500).json({ error: "Error interno del servidor al procesar la auditoría." });
    }
};
