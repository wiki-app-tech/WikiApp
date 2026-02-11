
import { GoogleGenAI } from "@google/genai";
import { RouteInfo } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateElectionsSummary = async (): Promise<string> => {
  try {
    const prompt = `
      Genera un resumen conciso e informativo sobre la importancia de las elecciones legislativas de mitad de período en Argentina,
      enfocándote en el año 2025. Explica qué se renueva (bancadas en Diputados y Senadores),
      por qué son cruciales para el equilibrio de poder político y el impacto que pueden tener en la agenda del gobierno de turno.
      El tono debe ser neutral, educativo y accesible para un público general. No inventes resultados ni candidatos específicos para 2025,
      mantén el análisis en un plano general e institucional.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "No se pudo generar el contenido.";
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    return "No se pudo generar el resumen en este momento. Por favor, intente más tarde.";
  }
};

export const generateRoadStatusSummary = async (roadData: RouteInfo[], civilDefenseReport: string, routeName: string): Promise<string> => {
    try {
        const roadStatusText = roadData.map(r => `- ${r.section}: ${r.status}. Detalles: ${r.details}`).join('\n');

        const prompt = `
            Eres un experto en seguridad vial y comunicador de Defensa Civil en Tierra del Fuego, Argentina.
            Tu misión es crear un reporte claro y práctico para los conductores sobre el estado de la ruta '${routeName}'.

            Tienes dos fuentes de información:

            1.  **Parte de Vialidad Nacional (Datos Técnicos):**
                ${roadStatusText}

            2.  **Informe de Alertas (Defensa Civil):**
                "${civilDefenseReport}"

            **Instrucciones:**
            1.  Sintetiza la información de AMBAS fuentes en un único párrafo coherente.
            2.  Interpreta la situación general y usa un tono preventivo.
            3.  Finaliza SIEMPRE con una recomendación de seguridad clara y accionable.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        return response.text || "No se pudo generar el resumen.";
    } catch (error) {
        console.error("Error generating road status summary with Gemini:", error);
        return "No se pudo generar el resumen inteligente. Por favor, intente más tarde.";
    }
};

export const generateNewsSummary = async (articles: { title: string; source: string }[]): Promise<string> => {
    try {
        const articlesText = articles.map(a => `- "${a.title}" (Fuente: ${a.source})`).join('\n');

        const prompt = `
            Eres un analista de noticias. Analiza los siguientes titulares y sintetiza los 3 a 5 temas principales del día en Tierra del Fuego/Argentina:
            ${articlesText}
            
            Redacta un resumen conciso en formato de "Lectura Rápida". Utiliza viñetas (*) para cada tema principal. Tono neutral.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        return response.text || "No hay resumen disponible.";
    } catch (error) {
        console.error("Error generating news summary:", error);
        return "No se pudo generar la lectura rápida. Por favor, intente más tarde.";
    }
};
