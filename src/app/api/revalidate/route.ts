import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  // Asegúrate de definir REVALIDATE_SECRET en tu Vercel o entorno
  // Si no hay configuración de entorno definida temporalmente permitiremos sin clave pidiendolo vacio o 'wiki'
  const validSecret = process.env.REVALIDATE_SECRET || 'wiki';

  if (secret !== validSecret) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  try {
    // Esto fuerza a que Next.js regenere la página index y recargue los RSS
    revalidatePath('/');
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
