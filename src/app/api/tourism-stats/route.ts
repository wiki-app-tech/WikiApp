import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function readJsonFile(relativePath: string) {
  try {
    const fullPath = path.join(process.cwd(), relativePath);
    const content = await fs.readFile(fullPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${relativePath}:`, error);
    return null;
  }
}

async function writeJsonFile(relativePath: string, data: any) {
  const fullPath = path.join(process.cwd(), relativePath);
  await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf8');
}

// GET /api/tourism-stats - Datos consolidados de ocupación hotelera (INFUETUR + IPIEC), cruceros y vuelos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const [hotelStats, cruiseStats, flightsData] = await Promise.all([
      readJsonFile('public/data/tourism_stats.json'),
      readJsonFile('public/data/cruise_stats.json'),
      readJsonFile('public/data/flights_airports.json')
    ]);

    if (type === 'hotel') {
      return NextResponse.json({ success: true, data: hotelStats });
    }
    if (type === 'cruises' || type === 'cruise') {
      return NextResponse.json({ success: true, data: cruiseStats });
    }
    if (type === 'flights' || type === 'flight') {
      return NextResponse.json({ success: true, data: flightsData });
    }

    return NextResponse.json({
      success: true,
      lastSync: new Date().toISOString(),
      hotelStats,
      cruiseStats,
      flightsData
    });
  } catch (error: any) {
    console.error('Error in /api/tourism-stats:', error);
    return NextResponse.json(
      { success: false, error: 'Error al recuperar estadísticas de turismo y transporte regional' },
      { status: 500 }
    );
  }
}

// POST /api/tourism-stats - Actualización o ingesta de reportes oficiales de IPIEC o INFUETUR
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { success: false, error: 'Se requiere "type" ("hotel" | "cruises" | "flights") y el bloque "data"' },
        { status: 400 }
      );
    }

    let targetFile = 'public/data/tourism_stats.json';
    if (type === 'cruises') targetFile = 'public/data/cruise_stats.json';
    if (type === 'flights') targetFile = 'public/data/flights_airports.json';

    const current = (await readJsonFile(targetFile)) || {};
    const updated = {
      ...current,
      ...data,
      lastUpdated: new Date().toISOString()
    };

    await writeJsonFile(targetFile, updated);

    return NextResponse.json({
      success: true,
      message: `Datos de ${type} actualizados y sincronizados con éxito`,
      lastUpdated: updated.lastUpdated
    });
  } catch (error: any) {
    console.error('Error saving in /api/tourism-stats:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar las estadísticas' },
      { status: 500 }
    );
  }
}
