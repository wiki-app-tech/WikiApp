import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse/lib/pdf-parse.js'; // Importación segura para ESM
import { GoogleGenAI } from '@google/genai';

// Cargar variables de entorno si existe .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1].trim();
      let val = (match[2] || '').trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  });
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('❌ ERROR: GEMINI_API_KEY no está configurada en el entorno o en .env.local');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const INPUT_DIR = path.join(process.cwd(), 'public', 'bulletins');
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'data', 'bulletin_embeddings.json');

// Asegurar que existan los directorios
if (!fs.existsSync(INPUT_DIR)) {
  fs.mkdirSync(INPUT_DIR, { recursive: true });
  console.log(`📁 Creado directorio para colocar PDFs en: ${INPUT_DIR}`);
}

async function getEmbedding(text) {
  const response = await ai.models.embedContent({
    model: 'text-embedding-004',
    contents: text,
  });
  return response.embeddings[0].values;
}

// Función simple para fragmentar texto
function chunkText(text, maxLength = 1000, overlap = 150) {
  const sentences = text.replace(/\s+/g, ' ').split(/(?<=[.?!])\s+/);
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxLength) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      // Mantener solapamiento buscando las últimas oraciones
      const words = currentChunk.split(' ');
      const overlapText = words.slice(-Math.ceil(overlap / 6)).join(' '); // Aprox. 6 caracteres por palabra
      currentChunk = overlapText + ' ' + sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}

async function processPDF(filePath, metadata) {
  console.log(`📄 Procesando archivo: ${path.basename(filePath)}...`);
  const dataBuffer = fs.readFileSync(filePath);
  
  try {
    const data = await pdf(dataBuffer);
    console.log(`✅ Extracción de texto exitosa (${data.numpages} páginas)`);
    
    const chunks = chunkText(data.text);
    console.log(`✂️ Texto dividido en ${chunks.length} fragmentos.`);
    
    const processedChunks = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];
      console.log(`⏳ Generando embedding para fragmento ${i + 1}/${chunks.length}...`);
      
      const embedding = await getEmbedding(chunkText);
      
      processedChunks.push({
        id: `${metadata.id}-chunk-${i}`,
        bulletinId: metadata.id,
        numero: metadata.numero,
        publisher: metadata.publisher,
        fecha: metadata.fecha,
        tema: metadata.tema,
        text: chunkText,
        embedding: embedding,
        pageEstimate: Math.min(metadata.pages, Math.ceil((i + 1) * (data.numpages / chunks.length))) // Estimación de página
      });
      
      // Espera de cortesía para evitar rate limit de API gratuita
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    return processedChunks;
  } catch (error) {
    console.error(`❌ Error al procesar ${path.basename(filePath)}:`, error);
    return [];
  }
}

async function run() {
  console.log('🚀 Iniciando indexación de Boletines Oficiales...');
  
  // Buscar archivos PDF en public/bulletins
  const files = fs.readdirSync(INPUT_DIR).filter(file => file.endsWith('.pdf'));
  if (files.length === 0) {
    console.log('ℹ️ No se encontraron archivos PDF en public/bulletins.');
    console.log('💡 Por favor, coloca tus archivos PDF allí y vuelve a ejecutar este script.');
    return;
  }

  // Cargar índice existente para no perder datos si los hay
  let existingIndex = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      existingIndex = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
      console.log(`📚 Cargado índice existente con ${existingIndex.length} fragmentos.`);
    } catch (e) {
      console.warn('⚠️ No se pudo parsear el índice anterior, se creará uno nuevo.');
    }
  }

  const newChunks = [];
  
  for (const filename of files) {
    // Intentar deducir metadatos a partir del nombre del archivo (ejemplo: 'provincia_3610_2026-06-12_decretos.pdf')
    // Si no coincide, usaremos valores por defecto
    const nameWithoutExt = path.basename(filename, '.pdf');
    const parts = nameWithoutExt.split('_');
    
    const id = nameWithoutExt.toLowerCase();
    
    // Si ya está indexado este archivo, saltarlo para ahorrar llamadas API
    if (existingIndex.some(chunk => chunk.bulletinId === id)) {
      console.log(`⏭️ El archivo ${filename} ya está indexado. Saltando.`);
      continue;
    }

    const publisher = parts[0] || 'provincia';
    const numero = parts[1] ? `Boletín N° ${parts[1]}` : `Boletín Sin Número (${nameWithoutExt})`;
    const fecha = parts[2] || new Date().toISOString().split('T')[0];
    const tema = parts[3] || 'General';

    const metadata = {
      id,
      numero,
      publisher,
      fecha,
      tema,
      pages: 1
    };

    const chunks = await processPDF(path.join(INPUT_DIR, filename), metadata);
    newChunks.push(...chunks);
  }

  if (newChunks.length > 0) {
    const finalIndex = [...existingIndex, ...newChunks];
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalIndex, null, 2), 'utf8');
    console.log(`\n🎉 ¡Indexación completa!`);
    console.log(`💾 Base de datos vectorial guardada en: ${OUTPUT_FILE}`);
    console.log(`📈 Total de fragmentos indexados: ${finalIndex.length}`);
  } else {
    console.log('\nℹ️ No se agregaron nuevos fragmentos al índice.');
  }
}

run().catch(console.error);
