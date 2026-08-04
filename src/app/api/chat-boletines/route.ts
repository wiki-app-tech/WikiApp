import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getEmbedding, askGemini } from '@/services/geminiService';

// Ruta al índice de embeddings
const INDEX_FILE = path.join(process.cwd(), 'public', 'data', 'bulletin_embeddings.json');

// Función para calcular la similitud coseno (producto punto para vectores normalizados)
function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
}

export async function POST(req: NextRequest) {
  try {
    const { query, publisher } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'La consulta (query) es requerida y debe ser un texto.' }, { status: 400 });
    }

    // 1. Verificar si existe el archivo de embeddings
    if (!fs.existsSync(INDEX_FILE)) {
      return NextResponse.json({
        answer: 'Lo siento, la base de datos de boletines no ha sido inicializada. Por favor, coloca archivos PDF en la carpeta `public/bulletins/` y ejecuta el script `node scripts/index-bulletins.mjs` para poder realizar consultas.',
        sources: []
      });
    }

    // 2. Cargar base de datos vectorial local
    const indexContent = fs.readFileSync(INDEX_FILE, 'utf8');
    const chunks: any[] = JSON.parse(indexContent);

    if (chunks.length === 0) {
      return NextResponse.json({
        answer: 'La base de datos de boletines está vacía. Por favor, indexa algunos documentos PDF para comenzar.',
        sources: []
      });
    }

    // 3. Generar embedding de la consulta del usuario
    console.log(`Generating embedding for query: "${query}"`);
    const queryVector = await getEmbedding(query);

    // 4. Búsqueda vectorial local: Calcular similitud coseno
    let scoredChunks = chunks.map(chunk => {
      const similarity = calculateCosineSimilarity(queryVector, chunk.embedding);
      return { ...chunk, similarity };
    });

    // 5. Aplicar filtro de organismo/editor si se especifica
    if (publisher && publisher !== 'all' && publisher !== 'provincia') {
      scoredChunks = scoredChunks.filter(c => c.publisher === publisher);
    }

    // 6. Ordenar por relevancia y tomar los 5 mejores resultados
    scoredChunks.sort((a, b) => b.similarity - a.similarity);
    
    // Filtrar resultados por un umbral razonable para evitar emparejamientos basura (ej. > 0.4)
    const threshold = 0.35;
    const relevantChunks = scoredChunks.filter(c => c.similarity > threshold).slice(0, 5);

    if (relevantChunks.length === 0) {
      return NextResponse.json({
        answer: 'Lo siento, no encontré fragmentos de boletines oficiales que sean suficientemente relevantes para responder a tu consulta.',
        sources: []
      });
    }

    // 7. Construir contexto a partir de los fragmentos recuperados
    const contextText = relevantChunks
      .map((c, idx) => `[Resultado ${idx + 1}] Boletín: ${c.numero} | Organismo: ${c.publisher} | Fecha: ${c.fecha} | Página Estimada: ${c.pageEstimate}\nContenido: ${c.text}`)
      .join('\n\n');

    // 8. Enviar contexto e instrucción al LLM usando Gemini
    console.log('Sending context to Gemini LLM...');
    const replyText = await askGemini(query, contextText);

    // 9. Extraer fuentes únicas y devolver respuesta
    const sources = relevantChunks.map(c => ({
      id: c.bulletinId,
      numero: c.numero,
      publisher: c.publisher,
      fecha: c.fecha,
      pagina: c.pageEstimate,
      score: Math.round(c.similarity * 100)
    }));

    // Eliminar duplicados de fuentes basadas en bulletinId y pageEstimate
    const uniqueSources = sources.filter((value, index, self) =>
      self.findIndex(s => s.id === value.id && s.pagina === value.pagina) === index
    );

    return NextResponse.json({
      answer: replyText,
      sources: uniqueSources
    });

  } catch (error: any) {
    console.error('Error en API chat-boletines:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
