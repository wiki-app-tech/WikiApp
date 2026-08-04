import { GoogleGenAI } from '@google/genai';

// Inicializar el cliente SDK de Google GenAI
// Se asume que GEMINI_API_KEY está configurada en las variables de entorno (.env.local)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

/**
 * Genera un vector numérico (embedding) para un bloque de texto dado.
 * Utiliza el modelo 'text-embedding-004' (dimensión 768).
 */
export async function getEmbedding(text: string): Promise<number[]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno.');
  }

  try {
    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: text,
    });

    if (response.embeddings && response.embeddings[0] && response.embeddings[0].values) {
      return response.embeddings[0].values;
    }
    
    throw new Error('La respuesta de embeddings no contiene valores.');
  } catch (error) {
    console.error('Error al generar embedding con Gemini:', error);
    throw error;
  }
}

/**
 * Genera una respuesta basada en un prompt y un contexto proporcionado (RAG).
 * Utiliza el modelo 'gemini-1.5-flash' o 'gemini-2.5-flash' por su velocidad y bajo costo.
 */
export async function askGemini(prompt: string, context: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno.');
  }

  try {
    const systemInstruction = `
      Eres el Asistente Legal e Inteligente de la Provincia de Tierra del Fuego. 
      Tu objetivo es responder de forma precisa, clara y útil a la consulta del usuario basándote ÚNICAMENTE en el contexto de los Boletines Oficiales que se te provee.
      
      Reglas críticas:
      1. Si el contexto provisto no contiene la información para responder la pregunta, responde explícitamente: "Lo siento, no encontré información sobre ese tema en los boletines oficiales disponibles."
      2. No inventes leyes, decretos, resoluciones, números ni fechas.
      3. Cita obligatoriamente el número de boletín, la fecha y la página (o sección) correspondiente en cada afirmación que hagas.
      4. Responde siempre en idioma español, con un tono formal, profesional e institucional.
    `;

    const fullPrompt = `
      CONTEXTO DE BOLETINES OFICIALES:
      ${context}

      --------------------------------------------------
      CONSULTA DEL USUARIO:
      ${prompt}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1, // Baja temperatura para reducir alucinaciones y ser más factual
      }
    });

    if (response.text) {
      return response.text;
    }

    throw new Error('No se generó texto en la respuesta de Gemini.');
  } catch (error) {
    console.error('Error al consultar a Gemini:', error);
    throw error;
  }
}
