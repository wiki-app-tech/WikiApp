import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || 'dummy_key';
console.log('Using API key:', apiKey === 'dummy_key' ? 'DUMMY' : 'PROVIDED');

try {
  const ai = new GoogleGenAI({ apiKey });
  console.log('SDK initialized successfully.');
  
  // Test if embedContent is a valid method
  if (ai.models && typeof ai.models.embedContent === 'function') {
    console.log('ai.models.embedContent is available');
  } else {
    console.log('ai.models.embedContent is NOT available');
  }

  if (ai.models && typeof ai.models.generateContent === 'function') {
    console.log('ai.models.generateContent is available');
  } else {
    console.log('ai.models.generateContent is NOT available');
  }
} catch (error) {
  console.error('Error during test:', error);
}
