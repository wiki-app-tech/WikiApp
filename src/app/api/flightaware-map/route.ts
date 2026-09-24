import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const res = await fetch('https://es.flightaware.com/live/map', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`FlightAware fetch error: ${res.status}`);
    }

    let html = await res.text();

    // 1. Inyectar base href para que recursos relativos carguen de FlightAware
    html = html.replace('<head>', '<head><base href="https://es.flightaware.com/">');

    // 2. Reemplazar defaultExtent para centrar inmediatamente en Tierra del Fuego
    // Bounding Box Mercator de Tierra del Fuego / Canal Beagle
    const tdfExtentRegex = /"defaultExtent":\s*\[[^\]]+\]/;
    html = html.replace(
      tdfExtentRegex,
      '"defaultExtent":[-7848024,-7518704,-7291427,-6891042]'
    );

    // 3. Estilos CSS limpios: solo el mapa de tráfico aéreo, sin banners, publicidad ni cabeceras
    const cleanStylesAndScripts = `
      <style>
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          overflow: hidden !important;
          background: #0a0d14 !important;
        }
        /* Ocultar elementos sobrantes y anuncios */
        #Ad, .adthrive, [id*="ad"], [id*="Ad"], [class*="ad-"], [class*="Ad-"],
        .upsell, .header, #header, #footer, footer, nav,
        #onetrust-consent-sdk, .ot-sdk-container, .breadcrumbs {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        #mapContainer, #map {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 10 !important;
          background: #0a0d14 !important;
        }
      </style>
      <script>
        // Asegurar recentrado automático sobre Tierra del Fuego al inicializar FAMap
        window.addEventListener('load', function() {
          if (typeof FAMap_1_promise !== 'undefined' && FAMap_1_promise && FAMap_1_promise.then) {
            FAMap_1_promise.then(function(mapInstance) {
              if (mapInstance && typeof mapInstance.zoomToExtent === 'function') {
                mapInstance.zoomToExtent([-7848024, -7518704, -7291427, -6891042]);
              }
            }).catch(function(e) { console.warn('FAMap init handled:', e); });
          }
        });
      </script>
    `;

    html = html.replace('</head>', `${cleanStylesAndScripts}</head>`);

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // Asegurar que no haya restricciones de X-Frame-Options para que el iframe se muestre limpio
        'Cache-Control': 'public, max-age=60, s-maxage=120',
      },
    });
  } catch (error: any) {
    console.error('Error proxying FlightAware map:', error);
    // En caso de fallo de red remoto, fallback a vista directa limpia
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { margin:0; background:#0b0e14; color:#fff; font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; }
            a { color:#38bdf8; font-weight:bold; }
          </style>
        </head>
        <body>
          <p>Conectando con el radar FlightAware de Tierra del Fuego...</p>
          <a href="https://es.flightaware.com/live/airport/SAWH" target="_blank">Abrir en FlightAware Oficial</a>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}
