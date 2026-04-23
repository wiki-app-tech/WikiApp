import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Intentamos obtener las alertas actuales del SMN
    const res = await fetch('https://ws.smn.gob.ar/alerts/type/AL', { 
      next: { revalidate: 300 }, // 5 minutos de cache
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!res.ok) {
        // Si falla la API del SMN, devolvemos un array vacío para no romper la UI
        return NextResponse.json([]);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Alerts Proxy Error:', error);
    return NextResponse.json([]);
  }
}
