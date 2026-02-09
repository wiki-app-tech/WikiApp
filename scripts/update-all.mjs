#!/usr/bin/env node
/**
 * Master Update Script
 * Actualiza todos los datos de la aplicación:
 * - RSS Feeds
 * - Clima (si hay API configurada)
 * - Efemérides
 * - Otros datos dinámicos
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runScript(scriptPath, name) {
    log(`\n🔄 Ejecutando: ${name}...`, 'blue');
    try {
        const module = await import(scriptPath);
        log(`✅ ${name} completado`, 'green');
        return true;
    } catch (error) {
        log(`❌ Error en ${name}: ${error.message}`, 'red');
        return false;
    }
}

async function updateTimestamp() {
    const metaPath = path.join(process.cwd(), 'public/data/meta.json');
    const meta = {
        lastUpdate: new Date().toISOString(),
        version: '1.0.0',
        autoRefreshEnabled: true,
    };

    try {
        await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));
        log('📝 Timestamp actualizado', 'green');
    } catch (error) {
        log(`⚠️  No se pudo actualizar timestamp: ${error.message}`, 'yellow');
    }
}

async function main() {
    log('╔════════════════════════════════════════╗', 'blue');
    log('║   WikiApp - Actualización Automática  ║', 'blue');
    log('╚════════════════════════════════════════╝', 'blue');

    const startTime = Date.now();

    // Ejecutar scripts de actualización
    const results = [];

    // 1. Actualizar RSS Feeds (principal)
    results.push(await runScript('./fetch-rss.mjs', 'RSS Feeds'));

    // 2. Actualizar timestamp
    await updateTimestamp();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    log('\n' + '═'.repeat(40), 'blue');
    const successful = results.filter(r => r).length;
    const total = results.length;

    if (successful === total) {
        log(`✨ Actualización completada exitosamente en ${duration}s`, 'green');
    } else {
        log(`⚠️  Actualización parcial: ${successful}/${total} exitosos en ${duration}s`, 'yellow');
    }
    log('═'.repeat(40), 'blue');
}

main().catch(error => {
    log(`\n💥 Error fatal: ${error.message}`, 'red');
    process.exit(1);
});
