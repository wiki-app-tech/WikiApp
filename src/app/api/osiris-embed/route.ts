import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const layers = searchParams.get('layers') || 'maritime,satellites,cctv,cctv_previews,live_news,earthquakes,fires,weather,radiation,infrastructure,global_incidents,cables,sdk_sea,sdk_naval';

    const upstreamUrl = `https://osirisai.live/?layers=${encodeURIComponent(layers)}`;
    const res = await fetch(upstreamUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`OSIRIS upstream HTTP ${res.status}`);
    }

    let html = await res.text();

    // 1. Inyectar <base href="https://osirisai.live/"> para cargar todos los chunks y recursos estáticos
    html = html.replace('<head>', '<head><base href="https://osirisai.live/">');

    // 2. Modificar el título para integrarlo en WikiApp
    html = html.replace(
      '<title>',
      '<title>OSIRIS Global Tactical Intel | '
    );

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // Omitimos intencionalmente X-Frame-Options y Content-Security-Policy para permitir iframe local
      },
    });
  } catch (err: any) {
    console.error('Error in /api/osiris-embed:', err);
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><title>OSIRIS Error</title></head>
        <body style="background:#02050e;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;">
          <div>
            <h2 style="color:#06b6d4;">Cargando OSIRIS Global Tactical Map</h2>
            <p style="color:#94a3b8;font-size:13px;">No se pudo establecer conexión directa con el servidor proxy. Puedes abrir la plataforma directamente:</p>
            <a href="https://osirisai.live/" target="_blank" style="display:inline-block;margin-top:10px;padding:8px 16px;background:#0891b2;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:12px;">Abrir OSIRIS Web Oficial</a>
          </div>
        </body>
      </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }
}
