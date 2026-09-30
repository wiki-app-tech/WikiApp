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

    // 1. Inyectar <base href="https://osirisai.live/" target="_self"> para cargar recursos y mantener navegación interna
    html = html.replace(
      '<head>',
      `<head>
      <base href="https://osirisai.live/" target="_self">
      <script>
        // Prevenir redirecciones externas o intentos de salir del marco
        try {
          window.onbeforeunload = null;
          document.addEventListener('click', function(e) {
            var el = e.target.closest('a');
            if (el) {
              if (el.target === '_top' || el.target === '_blank' || el.target === '_parent') {
                el.target = '_self';
              }
            }
          }, true);
        } catch(e) {}
      </script>`
    );

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
        <head><meta charset="utf-8"><title>OSIRIS Conexión</title></head>
        <body style="background:#02050e;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;">
          <div style="padding:20px;max-width:420px;border:1px solid rgba(6,182,212,0.2);border-radius:16px;background:rgba(8,13,26,0.8);">
            <h2 style="color:#06b6d4;font-size:16px;margin:0 0 8px;">Vista Táctica Global OSIRIS</h2>
            <p style="color:#94a3b8;font-size:12px;margin:0 0 16px;">Sincronizando flujo de datos satelitales, buques y sensores con el backend...</p>
            <button onclick="window.location.reload()" style="padding:8px 18px;background:#0891b2;color:#fff;border:none;border-radius:8px;font-weight:bold;font-size:12px;cursor:pointer;">Reintentar Conexión</button>
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
