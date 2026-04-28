import fs from 'fs';

function processFile(filepath) {
    if (!fs.existsSync(filepath)) return;
    let content = fs.readFileSync(filepath, 'utf8');

    // Replacements for backgrounds
    content = content.replace(/bg-\[\#070707\]/g, 'bg-slate-50 dark:bg-[#070707]');
    content = content.replace(/bg-\[\#0c0c0c\]/g, 'bg-white dark:bg-[#0c0c0c]');
    content = content.replace(/bg-\[\#111\]/g, 'bg-white dark:bg-[#111]');
    content = content.replace(/bg-\[\#0e0e0e\]/g, 'bg-white dark:bg-[#0e0e0e]');
    content = content.replace(/bg-\[\#121212\]/g, 'bg-white dark:bg-[#121212]');
    content = content.replace(/bg-\[\#161616\]/g, 'bg-slate-100 dark:bg-[#161616]');
    content = content.replace(/bg-\[\#1a1a1a\]/g, 'bg-slate-100 dark:bg-[#1a1a1a]');
    content = content.replace(/bg-\[\#222\]/g, 'bg-slate-200 dark:bg-[#222]');
    content = content.replace(/bg-\[\#0a0a0a\]/g, 'bg-slate-50 dark:bg-[#0a0a0a]');
    content = content.replace(/bg-black\/40/g, 'bg-slate-100 dark:bg-black/40');
    content = content.replace(/bg-black\/50/g, 'bg-slate-100/80 dark:bg-black/50');
    content = content.replace(/bg-white\/\[0\.02\]/g, 'bg-white dark:bg-white/[0.02]');
    content = content.replace(/bg-white\/\[0\.03\]/g, 'bg-slate-50 dark:bg-white/[0.03]');
    content = content.replace(/bg-white\/\[0\.04\]/g, 'bg-slate-100 dark:bg-white/[0.04]');
    content = content.replace(/bg-white\/5/g, 'bg-slate-100 dark:bg-white/5');
    content = content.replace(/bg-white\/10/g, 'bg-slate-200 dark:bg-white/10');

    // Text colors
    content = content.replace(/text-\[\#e0e0e0\]/g, 'text-slate-800 dark:text-[#e0e0e0]');
    content = content.replace(/text-white/g, 'text-slate-900 dark:text-white');
    content = content.replace(/text-gray-200/g, 'text-slate-800 dark:text-gray-200');
    content = content.replace(/text-gray-300/g, 'text-slate-700 dark:text-gray-300');
    content = content.replace(/text-gray-400/g, 'text-slate-600 dark:text-gray-400');
    content = content.replace(/text-gray-500/g, 'text-slate-500 dark:text-gray-500');

    // Border colors
    content = content.replace(/border-\[\#1a1a1a\]/g, 'border-slate-200 dark:border-[#1a1a1a]');
    content = content.replace(/border-\[\#1f1f1f\]/g, 'border-slate-200 dark:border-[#1f1f1f]');
    content = content.replace(/border-\[\#222\]/g, 'border-slate-300 dark:border-[#222]');
    content = content.replace(/border-\[\#333\]/g, 'border-slate-300 dark:border-[#333]');
    content = content.replace(/border-white\/5/g, 'border-slate-200 dark:border-white/5');
    content = content.replace(/border-white\/10/g, 'border-slate-300 dark:border-white/10');

    // Deduplicate dark classes that might have been created
    content = content.replace(/dark:bg-\[\#070707\] dark:bg-\[\#070707\]/g, 'dark:bg-[#070707]');
    content = content.replace(/dark:text-slate-900 dark:text-white/g, 'dark:text-white');

    fs.writeFileSync(filepath, content, 'utf8');
}

processFile('src/components/Dashboard.tsx');
processFile('src/components/WeatherDashboard.tsx');
processFile('src/components/RadioDashboard.tsx');
processFile('src/components/SecurityHeatMap.tsx');
processFile('src/components/WeatherAlertMap.tsx');
