import { NextResponse } from 'next/server';

// Datos de respaldo reales (Mayo 2026) obtenidos de la web de Aire Libre
const FALLBACK_PHARMACIES = {
  rio_grande: [
    { dia: 'Viernes', fecha: '01', nombre: 'DEL PUEBLO', direccion: 'Av. Belgrano 566', telefono: 'Tel. 421287', horario: 'Viernes 9 hs a sábado 9 hs' },
    { dia: 'Sábado', fecha: '02', nombre: 'ANDORRA RIO GRANDE', direccion: 'Española 686', telefono: 'Tel. 433364 – Cel. 2964-629239', horario: 'Sábado 9 hs a domingo 9 hs' },
    { dia: 'Domingo', fecha: '03', nombre: 'AUTOFARMA IV', direccion: 'Pellegrini 414', telefono: 'Cel. 2964-699708', horario: 'Domingo 9 hs a lunes 9 hs' },
    { dia: 'Lunes', fecha: '04', nombre: 'MORENO', direccion: 'Luisa Rosso 412', telefono: 'Cel. 2964-696121', horario: 'Lunes 9 hs a martes 9 hs' },
    { dia: 'Martes', fecha: '05', nombre: 'AUTOFARMA I', direccion: 'Av. Belgrano 2500', telefono: 'Tel. 421673 – Cel. 2964-699710', horario: 'Martes 9 hs a miércoles 9 hs' },
    { dia: 'Miércoles', fecha: '06', nombre: 'RIBERA', direccion: 'Olascoaga 391', telefono: 'Tel. 421666 – Cel. 2964-482200', horario: 'Miércoles 9 hs a jueves 9 hs' },
    { dia: 'Jueves', fecha: '07', nombre: 'AUTOFARMA II', direccion: 'Av. San Martín 130', telefono: 'Tel. 421112 – Cel. 2964-699709', horario: 'Jueves 9 hs a viernes 9 hs' },
    { dia: 'Viernes', fecha: '08', nombre: 'AUTOFARMA III', direccion: 'Pellegrini 698', telefono: 'Tel. 424269 – Cel. 2964-699707', horario: 'Viernes 9 hs a sábado 9 hs' },
    { dia: 'Sábado', fecha: '09', nombre: 'LA AUTO / MARGARITA', direccion: 'Av. San Martín 805 / El Esquilador 174', telefono: 'Tel. 433606 / Cel. 2964-500300', horario: 'Sábado 9 hs a domingo 9 hs' },
    { dia: 'Domingo', fecha: '10', nombre: 'DEL SUR', direccion: '20 de Junio 793', telefono: 'Tel. 425691 – Cel. 2964-413261', horario: 'Domingo 9 hs a lunes 9 hs' },
    { dia: 'Lunes', fecha: '11', nombre: 'MORENO', direccion: 'Luisa Rosso 412', telefono: 'Cel. 2964-696121', horario: 'Lunes 9 hs a martes 9 hs' },
    { dia: 'Martes', fecha: '12', nombre: 'DE LA BAHIA', direccion: 'Bilbao 1049', telefono: 'Tel. 421787 – Cel. 2964-550557', horario: 'Martes 9 hs a miércoles 9 hs' },
    { dia: 'Miércoles', fecha: '13', nombre: 'FARMACIA DEL PUEBLO II', direccion: 'Av. Elcano 750', telefono: 'Tel. 431050', horario: 'Miércoles 9 hs a jueves 9 hs' },
    { dia: 'Jueves', fecha: '14', nombre: 'POSADAS', direccion: 'Posadas 547', telefono: 'Tel. 300379 – Cel. 2964-593148', horario: 'Jueves 9 hs a viernes 9 hs' },
    { dia: 'Viernes', fecha: '15', nombre: 'DEL SUR', direccion: '20 de Junio 793', telefono: 'Tel. 425691 – Cel. 2964-413261', horario: 'Viernes 9 hs a sábado 9 hs' },
    { dia: 'Sábado', fecha: '16', nombre: 'FARMATOTAL DE LA ROTONDA', direccion: 'San Martín 1557', telefono: 'Cel. 2964-617823', horario: 'Sábado 9 hs a domingo 9 hs' },
    { dia: 'Domingo', fecha: '17', nombre: 'FARMALINK', direccion: 'Av. Belgrano 1475', telefono: 'Cel. 2964-599980', horario: 'Domingo 9 hs a lunes 9 hs' },
    { dia: 'Lunes', fecha: '18', nombre: 'MORENO', direccion: 'Luisa Rosso 412', telefono: 'Cel. 2964-696121', horario: 'Lunes 9 hs a martes 9 hs' },
    { dia: 'Martes', height: '19', nombre: 'DEL PUEBLO', direccion: 'Av. Belgrano 566', telefono: 'Tel. 421287', horario: 'Martes 9 hs a miércoles 9 hs' },
    { dia: 'Miércoles', fecha: '20', nombre: 'ANDORRA RIO GRANDE', direccion: 'Española 686', telefono: 'Tel. 433364 – Cel. 2964-629239', horario: 'Miércoles 9 hs a jueves 9 hs' },
    { dia: 'Jueves', fecha: '21', nombre: 'AUTOFARMA IV', direccion: 'Pellegrini 414', telefono: 'Cel. 2964-699708', horario: 'Jueves 9 hs a viernes 9 hs' },
    { dia: 'Viernes', fecha: '22', nombre: 'AUTOFARMA I', direccion: 'Av. Belgrano 2500', telefono: 'Tel. 421673 – Cel. 2964-699710', horario: 'Viernes 9 hs a sábado 9 hs' },
    { dia: 'Sábado', fecha: '23', nombre: 'RIBERA', direccion: 'Olascoaga 391', telefono: 'Tel. 421666 – Cel. 2964-482200', horario: 'Sábado 9 hs a domingo 9 hs' },
    { dia: 'Domingo', fecha: '24', nombre: 'AUTOFARMA II', direccion: 'Av. San Martín 130', telefono: 'Tel. 421112 – Cel. 2964-699709', horario: 'Domingo 9 hs a lunes 9 hs' },
    { dia: 'Lunes', fecha: '25', nombre: 'AUTOFARMA III', direccion: 'Pellegrini 698', telefono: 'Tel. 424269 – Cel. 2964-699707', horario: 'Lunes 9 hs a martes 9 hs' },
    { dia: 'Martes', fecha: '26', nombre: 'LA AUTO / MARGARITA', direccion: 'Av. San Martín 805 / El Esquilador 174', telefono: 'Tel. 433606 / Cel. 2964-500300', horario: 'Martes 9 hs a miércoles 9 hs' },
    { dia: 'Miércoles', fecha: '27', nombre: 'POSADAS', direccion: 'Posadas 547', telefono: 'Tel. 300379 – Cel. 2964-593148', horario: 'Miércoles 9 hs a jueves 9 hs' },
    { dia: 'Jueves', fecha: '28', nombre: 'DE LA BAHIA', direccion: 'Bilbao 1049', telefono: 'Tel. 421787 – Cel. 2964-550557', horario: 'Jueves 9 hs a viernes 9 hs' },
    { dia: 'Viernes', fecha: '29', nombre: 'DEL SUR', direccion: '20 de Junio 793', telefono: 'Tel. 425691 – Cel. 2964-413261', horario: 'Viernes 9 hs a sábado 9 hs' },
    { dia: 'Sábado', fecha: '30', nombre: 'FARMATOTAL DE LA ROTONDA', direccion: 'San Martín 1557', telefono: 'Cel. 2964-617823', horario: 'Sábado 9 hs a domingo 9 hs' },
    { dia: 'Domingo', fecha: '31', nombre: 'MORENO', direccion: 'Luisa Rosso 412', telefono: 'Cel. 2964-696121', horario: 'Domingo 9 hs a lunes 9 hs' }
  ],
  tolhuin: [
    { dia: 'Viernes', fecha: '01', nombre: 'FARMATOTAL', direccion: 'Av. de los Selknam 173', telefono: 'CEL. 15501211', horario: 'Viernes 10 hs a Sábado 10 hs' },
    { dia: 'Sábado', fecha: '02', nombre: 'TOLHUIN', direccion: 'Lucas Bridge 245', telefono: 'CEL. 15489646', horario: 'Sábado 10 hs a Domingo 10 hs' },
    { dia: 'Domingo', fecha: '03', nombre: 'TOLHUIN', direccion: 'Lucas Bridge 245', telefono: 'CEL. 15489646', horario: 'Domingo 10 hs a Lunes 10 hs' },
    { dia: 'Lunes', fecha: '04', nombre: 'TOLHUIN', direccion: 'Lucas Bridge 245', telefono: 'CEL. 15489646', horario: 'Lunes 10 hs a Martes 10 hs' },
    { dia: 'Martes', fecha: '05', nombre: 'TOLHUIN', direccion: 'Lucas Bridge 245', telefono: 'CEL. 15489646', horario: 'Martes 10 hs a Miércoles 10 hs' },
    { dia: 'Miércoles', fecha: '06', nombre: 'TOLHUIN', direccion: 'Lucas Bridge 245', telefono: 'CEL. 15489646', horario: 'Miércoles 10 hs a Jueves 10 hs' },
    { dia: 'Jueves', fecha: '07', nombre: 'TOLHUIN', direccion: 'Lucas Bridge 245', telefono: 'CEL. 15489646', horario: 'Jueves 10 hs a Viernes 10 hs' },
    { dia: 'Viernes', fecha: '08', nombre: 'TOLHUIN', direccion: 'Lucas Bridge 245', telefono: 'CEL. 15489646', horario: 'Viernes 10 hs a Sábado 10 hs' },
    { dia: 'Sábado', fecha: '09', nombre: 'TOLHUIN', direccion: 'Lucas Bridge 245', telefono: 'CEL. 15489646', horario: 'Sábado 10 hs a Domingo 10 hs' },
    { dia: 'Domingo', fecha: '10', nombre: 'TOLHUIN', direccion: 'Lucas Bridge 245', telefono: 'CEL. 15489646', horario: 'Domingo 10 hs a Lunes 10 hs' },
    { dia: 'Lunes', fecha: '11', nombre: 'FARMATOTAL', direccion: 'Av. de los Selknam 173', telefono: 'CEL. 15501211', horario: 'Lunes 10 hs a Martes 10 hs' },
    { dia: 'Martes', fecha: '12', nombre: 'FARMATOTAL', direccion: 'Av. de los Selknam 173', telefono: 'CEL. 15501211', horario: 'Martes 10 hs a Miércoles 10 hs' },
    { dia: 'Miércoles', fecha: '13', nombre: 'FARMATOTAL', direccion: 'Av. de los Selknam 173', telefono: 'CEL. 15501211', horario: 'Miércoles 10 hs a Jueves 10 hs' },
    { dia: 'Jueves', fecha: '14', nombre: 'FARMATOTAL', direccion: 'Av. de los Selknam 173', telefono: 'CEL. 15501211', horario: 'Jueves 10 hs a Viernes 10 hs' },
    { dia: 'Viernes', fecha: '15', nombre: 'FARMATOTAL', direccion: 'Av. de los Selknam 173', telefono: 'CEL. 15501211', horario: 'Viernes 10 hs a Sábado 10 hs' },
    { dia: 'Sábado', fecha: '16', nombre: 'FARMATOTAL', direccion: 'Av. de los Selknam 173', telefono: 'CEL. 15501211', horario: 'Sábado 10 hs a Domingo 10 hs' },
    { dia: 'Domingo', fecha: '17', nombre: 'FARMATOTAL', direccion: 'Av. de los Selknam 173', telefono: 'CEL. 15501211', horario: 'Domingo 10 hs a Lunes 10 hs' },
    { dia: 'Lunes', fecha: '18', nombre: 'TOLHUIN', direccion: 'Lucas Bridge 245', telefono: 'CEL. 15489646', horario: 'Lunes 10 hs a Martes 10 hs' },
    { dia: 'Martes', fecha: '19', nombre: 'TOLHUIN', direccion: 'Lucas Bridge 245', telefono: 'CEL. 15489646', horario: 'Martes 10 hs a Miércoles 10 hs' },
    { dia: 'Miércoles', fecha: '20', nombre: 'TOLHUIN', direccion: 'Lucas Bridge 245', telefono: 'CEL. 15489646', horario: 'Miércoles 10 hs a Jueves 10 hs' },
    { dia: 'Jueves', fecha: '21', nombre: 'TOLHUIN', direccion: 'Lucas Bridge 245', telefono: 'CEL. 15489646', horario: 'Jueves 10 hs a Viernes 10 hs' },
    { dia: 'Viernes', fecha: '22', nombre: 'TOLHUIN', direccion: 'Lucas Bridge 245', telefono: 'CEL. 15489646', horario: 'Viernes 10 hs a Sábado 10 hs' },
    { dia: 'Sábado', fecha: '23', nombre: 'TOLHUIN', direccion: 'Lucas Bridge 245', telefono: 'CEL. 15489646', horario: 'Sábado 10 hs a Domingo 10 hs' },
    { dia: 'Domingo', fecha: '24', nombre: 'TOLHUIN', direccion: 'Lucas Bridge 245', telefono: 'CEL. 15489646', horario: 'Domingo 10 hs a Lunes 10 hs' },
    { dia: 'Lunes', fecha: '25', nombre: 'FARMATOTAL', direccion: 'Av. de los Selknam 173', telefono: 'CEL. 15501211', horario: 'Lunes 10 hs a Martes 10 hs' },
    { dia: 'Martes', fecha: '26', nombre: 'FARMATOTAL', direccion: 'Av. de los Selknam 173', telefono: 'CEL. 15501211', horario: 'Martes 10 hs a Miércoles 10 hs' },
    { dia: 'Miércoles', fecha: '27', nombre: 'FARMATOTAL', direccion: 'Av. de los Selknam 173', telefono: 'CEL. 15501211', horario: 'Miércoles 10 hs a Jueves 10 hs' },
    { dia: 'Jueves', fecha: '28', nombre: 'FARMATOTAL', direccion: 'Av. de los Selknam 173', telefono: 'CEL. 15501211', horario: 'Jueves 10 hs a Viernes 10 hs' },
    { dia: 'Viernes', fecha: '29', nombre: 'FARMATOTAL', direccion: 'Av. de los Selknam 173', telefono: 'CEL. 15501211', horario: 'Viernes 10 hs a Sábado 10 hs' },
    { dia: 'Sábado', fecha: '30', nombre: 'FARMATOTAL', direccion: 'Av. de los Selknam 173', telefono: 'CEL. 15501211', horario: 'Sábado 10 hs a Domingo 10 hs' },
    { dia: 'Domingo', fecha: '31', nombre: 'FARMATOTAL', direccion: 'Av. de los Selknam 173', telefono: 'CEL. 15501211', horario: 'Domingo 10 hs a Lunes 10 hs' }
  ],
  ushuaia: [
    { dia: 'Viernes', fecha: '01', nombre: 'SAN MARTÍN suc. Kuanip', direccion: 'Kuanip 1372', telefono: '2901-514774', horario: 'Viernes 9 hs a sábado 9 hs' },
    { dia: 'Sábado', fecha: '02', nombre: 'SAN FRANCISCO', direccion: 'Gobernador Paz 1095', telefono: '422449', horario: 'Sábado 9 hs a domingo 9 hs' },
    { dia: 'Domingo', fecha: '03', nombre: 'AUSTRAL / ANDINA', direccion: 'Pioneros Fueguinos 4350 / San Martín 638', telefono: '433101 / 423431', horario: 'Domingo 9 hs a lunes 9 hs' },
    { dia: 'Lunes', fecha: '04', nombre: 'LA BANCARIA', direccion: 'Maipú 333', telefono: '434004', horario: 'Lunes 9 hs a martes 9 hs' },
    { dia: 'Martes', fecha: '05', nombre: 'USHUAIA', direccion: 'Kuanip 540', telefono: '431053', horario: 'Martes 9 hs a miércoles 9 hs' },
    { dia: 'Miércoles', fecha: '06', nombre: 'SALK Suc. Centro', direccion: 'San Martín 931', telefono: '424090', horario: 'Miércoles 9 hs a jueves 9 hs' },
    { dia: 'Jueves', fecha: '07', nombre: 'ALEM', direccion: 'Leandro Alem 2654', telefono: '425045', horario: 'Jueves 9 hs a viernes 9 hs' },
    { dia: 'Viernes', fecha: '08', nombre: 'SALK Suc. Jainén', direccion: 'Jainén 152', telefono: '432268', horario: 'Viernes 9 hs a sábado 9 hs' },
    { dia: 'Sábado', fecha: '09', nombre: 'AUTOFARMA II', direccion: 'Kuanip 776', telefono: '644119', horario: 'Sábado 9 hs a domingo 9 hs' },
    { dia: 'Domingo', fecha: '10', nombre: 'FARMATOTAL', direccion: 'Avda. Magallanes 856', telefono: '2901-484509', horario: 'Domingo 9 hs a lunes 9 hs' },
    { dia: 'Lunes', fecha: '11', nombre: 'ACIGAMI', direccion: 'Facundo Quiroga 1668', telefono: '2901 449416', horario: 'Lunes 9 hs a martes 9 hs' },
    { dia: 'Martes', fecha: '12', nombre: 'DEL SOLIER (GSM)', direccion: 'Transporte Patagonia 92', telefono: '2901-657811', horario: 'Martes 9 hs a miércoles 9 hs' },
    { dia: 'Miércoles', fecha: '13', nombre: 'SAN MARTÍN Centro', direccion: 'San Martín 1241', telefono: '2901-514398', horario: 'Miércoles 9 hs a jueves 9 hs' },
    { dia: 'Jueves', fecha: '14', nombre: 'USHUAIA DEL PIPO', direccion: 'De la Estancia 2496', telefono: '2901-413121', horario: 'Jueves 9 hs a viernes 9 hs' },
    { dia: 'Viernes', fecha: '15', nombre: 'SAN MARTÍN Mirador de Andorra', direccion: 'Soldado Aguirre 2496', telefono: '2901-542420', horario: 'Viernes 9 hs a sábado 9 hs' },
    { dia: 'Sábado', fecha: '16', nombre: 'BAHÍA', direccion: 'San Martín 1533', telefono: '436262', horario: 'Sábado 9 hs a domingo 9 hs' },
    { dia: 'Domingo', fecha: '17', nombre: 'FARMAMET', direccion: '12 de Octubre 1298', telefono: '15557200', horario: 'Domingo 9 hs a lunes 9 hs' },
    { dia: 'Lunes', fecha: '18', nombre: 'AUTOFARMA / ANDINA SUR', direccion: 'San Martín 1336 / Hipólito Irigoyen 1832', telefono: '433808 / 445888', horario: 'Lunes 9 hs a martes 9 hs' },
    { dia: 'Martes', fecha: '19', nombre: 'ECONOFARMA', direccion: 'Leandro Alem Nº 1407', telefono: '2901-488722', horario: 'Martes 9 hs a miércoles 9 hs' },
    { dia: 'Miércoles', fecha: '20', nombre: 'SALK LUGONES', direccion: 'Leopoldo Lugones 1895', telefono: '422797', horario: 'Miércoles 9 hs a jueves 9 hs' },
    { dia: 'Jueves', fecha: '21', nombre: 'SAN MARTÍN suc. Kuanip', direccion: 'Kuanip 1372', telefono: '2901-514774', horario: 'Jueves 9 hs a viernes 9 hs' },
    { dia: 'Viernes', fecha: '22', nombre: 'SAN FRANCISCO', direccion: 'Gobernador Paz 1095', telefono: '422449', horario: 'Viernes 9 hs a sábado 9 hs' },
    { dia: 'Sábado', fecha: '23', nombre: 'ANDINA', direccion: 'San Martín 638', telefono: '423431', horario: 'Sábado 9 hs a domingo 9 hs' },
    { dia: 'Domingo', fecha: '24', nombre: 'LA BANCARIA', direccion: 'Maipú 333', telefono: '434004', horario: 'Domingo 9 hs a lunes 9 hs' },
    { dia: 'Lunes', fecha: '25', nombre: 'USHUAIA', direccion: 'Kuanip 540', telefono: '431053', horario: 'Lunes 9 hs a martes 9 hs' },
    { dia: 'Martes', fecha: '26', nombre: 'SALK Suc. Centro', direccion: 'San Martín 931', telefono: '424090', horario: 'Martes 9 hs a miércoles 9 hs' },
    { dia: 'Miércoles', fecha: '27', nombre: 'ALEM', direccion: 'Leandro Alem 2654', telefono: '425045', horario: 'Miércoles 9 hs a jueves 9 hs' },
    { dia: 'Jueves', fecha: '28', nombre: 'SALK Suc. Jainén', direccion: 'Jainén 152', telefono: '432268', horario: 'Jueves 9 hs a viernes 9 hs' },
    { dia: 'Viernes', fecha: '29', nombre: 'AUTOFARMA II', direccion: 'Kuanip 776', telefono: '644119', horario: 'Viernes 9 hs a sábado 9 hs' },
    { dia: 'Sábado', fecha: '30', nombre: 'FARMATOTAL', direccion: 'Avda. Magallanes 856', telefono: '2901-484509', horario: 'Sábado 9 hs a domingo 9 hs' },
    { dia: 'Domingo', fecha: '31', nombre: 'ACIGAMI', direccion: 'Facundo Quiroga 1668', telefono: '2901 449416', horario: 'Domingo 9 hs a lunes 9 hs' }
  ]
};

// Parser de tabla HTML simple usando Regex
function parseTables(html: string) {
  const tables: string[][][] = [];
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const tdRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;

  let tableMatch;
  while ((tableMatch = tableRegex.exec(html)) !== null) {
    const tableHtml = tableMatch[1];
    const parsedTable: string[][] = [];
    let trMatch;
    
    while ((trMatch = trRegex.exec(tableHtml)) !== null) {
      const trHtml = trMatch[1];
      const parsedRow: string[] = [];
      let tdMatch;
      
      while ((tdMatch = tdRegex.exec(trHtml)) !== null) {
        // Limpiar tags HTML y decodificar entidades básicas
        let cellText = tdMatch[1]
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/gi, ' ')
          .replace(/&#8211;/g, '–')
          .replace(/&#8217;/g, "'")
          .replace(/&oacute;/gi, 'ó')
          .replace(/&iacute;/gi, 'í')
          .replace(/&aacute;/gi, 'á')
          .replace(/&eacute;/gi, 'é')
          .replace(/&uacute;/gi, 'ú')
          .replace(/&ntilde;/gi, 'ñ')
          .replace(/\s+/g, ' ')
          .trim();
        parsedRow.push(cellText);
      }
      if (parsedRow.length > 0) {
        parsedTable.push(parsedRow);
      }
    }
    if (parsedTable.length > 0) {
      tables.push(parsedTable);
    }
  }
  return tables;
}

export async function GET() {
  try {
    const response = await fetch('https://www.airelibre.com.ar/farmacias-de-turnos-en-tierra-del-fuego/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      next: { revalidate: 3600 } // Caché por 1 hora
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const tables = parseTables(html);

    if (tables.length < 3) {
      throw new Error('Not enough tables found on page');
    }

    // Tabla 1: Río Grande, Tabla 2: Tolhuin, Tabla 3: Ushuaia
    const parseCityTable = (table: string[][]) => {
      // Ignorar cabecera
      const rows = table.slice(1);
      return rows.map(row => {
        if (row.length < 5) return null;
        return {
          dia: row[0],
          fecha: row[1],
          nombre: row[2],
          direccion: row[3],
          telefono: row[4],
          horario: row[5] || 'Turno diario'
        };
      }).filter(Boolean);
    };

    const rioGrandeData = parseCityTable(tables[0]);
    const tolhuinData = parseCityTable(tables[1]);
    const ushuaiaData = parseCityTable(tables[2]);

    if (!rioGrandeData.length || !tolhuinData.length || !ushuaiaData.length) {
      throw new Error('Parsed tables are empty or malformed');
    }

    return NextResponse.json({
      rio_grande: rioGrandeData,
      tolhuin: tolhuinData,
      ushuaia: ushuaiaData,
      source: 'web'
    });

  } catch (error) {
    console.error('Error fetching/parsing pharmacies, using fallback data:', error);
    return NextResponse.json({
      ...FALLBACK_PHARMACIES,
      source: 'fallback'
    });
  }
}
