import { GoogleGenAI } from "@google/genai";
import { RouteInfo } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
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
            2.  No te limites a repetir los datos. Interpreta la situación general (ej. "la situación es complicada en la Ruta J", "la Ruta 3 está mayormente despejada").
            3.  El tono debe ser directo y preventivo.
            4.  Finaliza SIEMPRE con una recomendación de seguridad clara y accionable para los conductores, basada en la combinación de los informes.

            **Ejemplo de formato de salida:**
            "Para la ${routeName}, Vialidad informa que [resumen de estados], mientras que Defensa Civil advierte sobre [mencionar alerta principal]. En resumen, se recomienda [acción concreta como 'postergar el viaje si no es esencial' o 'circular con extrema precaución y cubiertas de invierno']."
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating road status summary with Gemini:", error);
        return "No se pudo generar el resumen inteligente. Por favor, intente más tarde.";
    }
};

export const generateNewsSummary = async (articles: { title: string; source: string }[]): Promise<string> => {
    try {
        const articlesText = articles.map(a => `- "${a.title}" (Fuente: ${a.source})`).join('\n');

        const prompt = `
            Eres un analista de noticias y editor jefe. Tu tarea es leer una lista de titulares de noticias recientes de varios medios de una misma región y sintetizar los temas más importantes del día.

            **Instrucciones:**
            1.  **Analiza los siguientes titulares:**
                ${articlesText}
            2.  **Identifica los 3 a 5 temas principales** que se repiten o que parecen ser los más significativos.
            3.  **Redacta un resumen conciso** en formato de "Lectura Rápida". Utiliza viñetas (formato markdown, usa '*' para cada punto) para cada tema principal.
            4.  **El tono debe ser objetivo y neutral**, como un briefing de noticias.
            5.  **No inventes información.** Basa tu resumen únicamente en la información implícita en los titulares proporcionados.
            6.  El resumen debe estar en español.

            **Formato de Salida Esperado:**
            *   **Tema Principal 1:** Breve descripción del tema basada en los titulares.
            *   **Tema Principal 2:** Breve descripción del tema basada en los titulares.
            *   **Tema Principal 3:** Breve descripción del tema basada en los titulares.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating news summary with Gemini:", error);
        return "No se pudo generar la lectura rápida. Por favor, intente más tarde.";
    }
};