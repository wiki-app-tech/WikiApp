import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Obtenemos las alertas actuales directamente desde el origen del Servicio Meteorológico Nacional (SMN)
    const res = await fetch('https://ws.smn.gob.ar/alerts/type/AL', { 
      cache: 'no-store',
      signal: AbortSignal.timeout(7000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
        return NextResponse.json([]);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Alerts Origin Proxy Error:', error);
    return NextResponse.json([]);
  }
}
