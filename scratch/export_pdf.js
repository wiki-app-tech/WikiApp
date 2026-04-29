const fs = require('fs');
const path = require('path');

// Read the markdown file
const mdPath = 'C:\\Users\\54290\\Documents\\Actigravity\\WikiApp\\borrador_manual.md';
const mdContent = fs.readFileSync(mdPath, 'utf8');

// Fix image paths to file:// URIs
const fixedContent = mdContent.replace(
  /!\[([^\]]*)\]\(([^)]+)\)/g,
  (match, alt, imgPath) => {
    const normalizedPath = imgPath.replace(/\\/g, '/');
    return `![${alt}](file:///${normalizedPath})`;
  }
);

// ──────────────────────────────────────────
// DESIGN SYSTEM: Swiss Editorial × Minimal
// Inspiration: Monocle Magazine, Helvetica
// documentary, government black books
// ──────────────────────────────────────────
const CSS = `
  /* ─── FONTS ─── */
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;700&family=Space+Mono:wght@400;700&display=swap');

  /* ─── RESET ─── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ─── TOKENS ─── */
  :root {
    --ink:       #0d0d12;
    --ink-2:     #2a2a35;
    --ink-3:     #5a5a70;
    --rule:      #d4d4dc;
    --paper:     #fafaf8;
    --accent:    #0f1b3d;
    --accent-2:  #c8102e;   /* thin red — classification mark */
    --gold:      #b8924a;
    --space-xs:  4px;
    --space-s:   8px;
    --space-m:   16px;
    --space-l:   32px;
    --space-xl:  56px;
    --space-2xl: 80px;
  }

  /* ─── BODY ─── */
  html { font-size: 10.5pt; }

  body {
    font-family: 'DM Sans', system-ui, sans-serif;
    font-weight: 400;
    line-height: 1.75;
    color: var(--ink);
    background: var(--paper);
    -webkit-font-smoothing: antialiased;
  }

  /* ─── PAGE GEOMETRY ─── */
  .page-wrap {
    width: 210mm;
    margin: 0 auto;
  }

  /* ─── COVER ─── */
  .cover {
    width: 210mm;
    height: 297mm;
    display: flex;
    flex-direction: column;
    background: var(--accent);
    padding: 18mm 18mm 14mm 18mm;
    page-break-after: always;
    position: relative;
    overflow: hidden;
  }

  /* geometric ornament */
  .cover::before {
    content: '';
    position: absolute;
    right: -40mm;
    top: -40mm;
    width: 160mm;
    height: 160mm;
    border: 0.5mm solid rgba(255,255,255,0.06);
    border-radius: 50%;
  }
  .cover::after {
    content: '';
    position: absolute;
    right: -20mm;
    top: -20mm;
    width: 100mm;
    height: 100mm;
    border: 0.5mm solid rgba(255,255,255,0.08);
    border-radius: 50%;
  }

  .cover-stamp {
    display: inline-block;
    border: 0.3mm solid var(--accent-2);
    color: var(--accent-2);
    font-family: 'Space Mono', monospace;
    font-size: 6.5pt;
    letter-spacing: 0.25em;
    padding: 3px 10px;
    width: max-content;
    margin-bottom: var(--space-2xl);
  }

  .cover-eyebrow {
    font-family: 'Space Mono', monospace;
    font-size: 6pt;
    letter-spacing: 0.3em;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    margin-bottom: var(--space-m);
  }

  .cover h1 {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 36pt;
    font-weight: 400;
    line-height: 1.1;
    color: #ffffff;
    max-width: 140mm;
    margin-bottom: var(--space-xl);
    letter-spacing: -0.5px;
  }

  .cover-rule {
    width: 16mm;
    height: 0.5mm;
    background: var(--accent-2);
    margin-bottom: var(--space-l);
  }

  .cover-meta {
    margin-top: auto;
    border-top: 0.2mm solid rgba(255,255,255,0.12);
    padding-top: var(--space-m);
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .cover-meta-left {
    font-family: 'Space Mono', monospace;
    font-size: 7pt;
    color: rgba(255,255,255,0.45);
    line-height: 1.9;
    letter-spacing: 0.05em;
  }

  .cover-version {
    font-family: 'Space Mono', monospace;
    font-size: 7pt;
    color: rgba(255,255,255,0.25);
  }

  /* ─── BODY PAGES ─── */
  .body-page {
    padding: 20mm 18mm 18mm 22mm;
    page-break-after: always;
  }

  /* ─── RUNNING HEADER ─── */
  .running-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 4mm;
    border-bottom: 0.2mm solid var(--rule);
    margin-bottom: 12mm;
  }
  .running-header span {
    font-family: 'Space Mono', monospace;
    font-size: 6.5pt;
    letter-spacing: 0.2em;
    color: var(--ink-3);
    text-transform: uppercase;
  }
  .running-header .chapter-num {
    color: var(--accent-2);
  }

  /* ─── CHAPTER OPENER ─── */
  .chapter-opener {
    display: flex;
    flex-direction: column;
    gap: 6mm;
    margin-bottom: 14mm;
    padding-bottom: 10mm;
    border-bottom: 0.5mm solid var(--ink);
  }

  .chapter-num-display {
    font-family: 'Space Mono', monospace;
    font-size: 7pt;
    letter-spacing: 0.35em;
    color: var(--accent-2);
    text-transform: uppercase;
  }

  h2 {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 26pt;
    font-weight: 400;
    color: var(--accent);
    line-height: 1.1;
    letter-spacing: -0.3px;
    page-break-before: always;
    margin: 0;
  }

  /* ─── SECTION HEADERS ─── */
  h3 {
    font-family: 'DM Sans', sans-serif;
    font-size: 9.5pt;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
    margin: 11mm 0 4mm 0;
    padding-bottom: 2mm;
    border-bottom: 0.2mm solid var(--rule);
  }

  h4 {
    font-family: 'DM Sans', sans-serif;
    font-size: 9pt;
    font-weight: 500;
    color: var(--ink-2);
    margin: 7mm 0 2mm 0;
    font-style: italic;
  }

  /* ─── BODY TEXT ─── */
  p {
    font-size: 10.5pt;
    line-height: 1.8;
    color: var(--ink-2);
    margin-bottom: 4mm;
    text-align: justify;
    hyphens: auto;
  }

  /* ─── LISTS ─── */
  ul, ol {
    margin: 3mm 0 5mm 6mm;
    padding-left: 5mm;
  }

  li {
    font-size: 10.5pt;
    line-height: 1.75;
    color: var(--ink-2);
    margin-bottom: 2mm;
    padding-left: 2mm;
  }

  ul li::marker { color: var(--accent-2); font-size: 8pt; }
  ol li::marker { 
    font-family: 'Space Mono', monospace; 
    font-size: 8pt; 
    color: var(--ink-3); 
    font-weight: 700;
  }

  /* ─── STRONG ─── */
  strong { font-weight: 700; color: var(--ink); }
  em { color: var(--ink-3); font-style: italic; }

  /* ─── CODE ─── */
  code {
    font-family: 'Space Mono', monospace;
    font-size: 8.5pt;
    color: var(--accent);
    background: rgba(15,27,61,0.06);
    padding: 1px 6px;
    border-radius: 2px;
    border: 0.2mm solid rgba(15,27,61,0.12);
  }

  /* ─── CALLOUT / BLOCKQUOTE ─── */
  blockquote {
    margin: 7mm 0;
    padding: 5mm 7mm 5mm 10mm;
    border-left: 2.5px solid var(--accent-2);
    background: rgba(200,16,46,0.03);
  }

  blockquote p {
    font-size: 9.5pt;
    line-height: 1.65;
    color: var(--ink-2);
    font-style: italic;
    margin: 0;
    text-align: left;
  }

  /* ─── RULE ─── */
  hr {
    border: none;
    border-top: 0.2mm solid var(--rule);
    margin: 9mm 0;
  }

  /* ─── IMAGES ─── */
  figure {
    margin: 8mm 0;
    page-break-inside: avoid;
  }

  figure img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 3px;
    filter: contrast(1.03) brightness(0.97);
  }

  figcaption {
    margin-top: 3mm;
    font-family: 'Space Mono', monospace;
    font-size: 7pt;
    color: var(--ink-3);
    letter-spacing: 0.08em;
    padding-top: 2mm;
    border-top: 0.2mm solid var(--rule);
  }

  /* ─── TOC ─── */
  .toc-page {
    padding: 20mm 18mm 18mm 22mm;
    page-break-after: always;
  }

  .toc-title {
    font-family: 'Space Mono', monospace;
    font-size: 7pt;
    letter-spacing: 0.3em;
    color: var(--ink-3);
    text-transform: uppercase;
    margin-bottom: 10mm;
    padding-bottom: 4mm;
    border-bottom: 0.5mm solid var(--ink);
  }

  .toc-entry {
    display: flex;
    align-items: baseline;
    gap: 4mm;
    margin-bottom: 4mm;
    padding-bottom: 4mm;
    border-bottom: 0.15mm solid var(--rule);
  }

  .toc-num {
    font-family: 'Space Mono', monospace;
    font-size: 7pt;
    color: var(--accent-2);
    min-width: 8mm;
    letter-spacing: 0.05em;
  }

  .toc-name {
    font-family: 'DM Sans', sans-serif;
    font-size: 10.5pt;
    font-weight: 500;
    color: var(--accent);
    flex: 1;
  }

  /* ─── REFERENCES ─── */
  .references-section p {
    font-size: 9pt;
    line-height: 1.65;
    margin-bottom: 4mm;
    padding-left: 8mm;
    text-indent: -8mm;
    color: var(--ink-3);
    text-align: left;
  }

  /* ─── PRINT ─── */
  @page {
    size: A4;
    margin: 0;
  }

  @media print {
    .cover { page-break-after: always; }
    h2 { page-break-before: always; }
    figure, blockquote { page-break-inside: avoid; }
    body { background: white; }
  }
`;

// ──────────────────────────────────────────
// BUILD HTML
// ──────────────────────────────────────────

const chapters = [
  { num: 'I',    title: 'Conceptos Básicos' },
  { num: 'II',   title: 'Técnicas y Tácticas de Ejecución' },
  { num: 'III',  title: 'Planeamiento' },
  { num: 'IV',   title: 'Estudio de Emplazamiento' },
  { num: 'V',    title: 'Bases Legales' },
  { num: 'VI',   title: 'Prevención y Bioseguridad' },
  { num: 'VII',  title: 'RCP para Custodia VIP' },
  { num: 'VIII', title: 'Conducción Segura y Evasiva' },
];

const tocHTML = `
<div class="toc-page">
  <div class="toc-title">Tabla de Contenido</div>
  ${chapters.map((c, i) => `
  <div class="toc-entry">
    <span class="toc-num">CAP.${c.num}</span>
    <span class="toc-name">${c.title}</span>
  </div>`).join('')}
  <div class="toc-entry" style="margin-top:6mm">
    <span class="toc-num" style="color:var(--ink-3)">REF.</span>
    <span class="toc-name" style="color:var(--ink-3)">Referencias</span>
  </div>
</div>`;

const coverHTML = `
<div class="cover">
  <div class="cover-stamp">CONFIDENCIAL · USO EXCLUSIVO OFICIAL</div>
  <div class="cover-eyebrow">Policía de Tierra del Fuego · Unidad de Protección</div>
  <h1>Manual de Protección y Seguridad para Dignatarios</h1>
  <div class="cover-rule"></div>
  <div class="cover-meta">
    <div class="cover-meta-left">
      Dirección General de Seguridad<br>
      Tierra del Fuego, Argentina<br>
      Fecha de emisión: 29 de abril de 2026
    </div>
    <div class="cover-version">Ed. 2026 · v1.0</div>
  </div>
</div>`;

function convertMarkdown(md) {
  let lines = md.split('\n');
  let html = '';
  let inUl = false, inOl = false;
  let chapterCount = 0;

  const closeList = () => {
    if (inUl) { html += '</ul>\n'; inUl = false; }
    if (inOl) { html += '</ol>\n'; inOl = false; }
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Skip HTML comments
    if (line.trim().startsWith('<!--')) {
      while (i < lines.length && !lines[i].includes('-->')) i++;
      continue;
    }

    // Images → figure
    if (/^!\[/.test(line)) {
      closeList();
      const m = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (m) {
        html += `<figure><img src="${m[2]}" alt="${m[1]}" /><figcaption>${m[1]}</figcaption></figure>\n`;
      }
      continue;
    }

    // H2 – Chapter header
    if (/^## /.test(line)) {
      closeList();
      chapterCount++;
      const title = line.replace(/^## /, '').replace(/^Capítulo [IVXLC]+ - /, '').replace(/^Capítulo [IVXLC]+ · /, '');
      const chapNum = chapters[chapterCount - 1]?.num || '';
      const isRef = line.toLowerCase().includes('referencias');
      if (isRef) {
        html += `<div class="body-page references-section"><div class="running-header"><span>Manual de Protección · 2026</span><span class="chapter-num">Referencias</span></div><div class="chapter-opener"><div class="chapter-num-display">Bibliografía</div><h2>${line.replace(/^## /, '')}</h2></div>\n`;
      } else {
        html += `<div class="body-page"><div class="running-header"><span>Manual de Protección · 2026</span><span class="chapter-num">Cap. ${chapNum}</span></div><div class="chapter-opener"><div class="chapter-num-display">Capítulo ${chapNum}</div><h2>${title}</h2></div>\n`;
      }
      continue;
    }

    // H3
    if (/^### /.test(line)) {
      closeList();
      html += `<h3>${line.replace(/^### /, '')}</h3>\n`;
      continue;
    }

    // H4
    if (/^#### /.test(line)) {
      closeList();
      html += `<h4>${line.replace(/^#### /, '')}</h4>\n`;
      continue;
    }

    // Blockquote
    if (/^> /.test(line)) {
      closeList();
      html += `<blockquote><p>${inline(line.replace(/^> /, ''))}</p></blockquote>\n`;
      continue;
    }

    // HR
    if (/^---$/.test(line.trim())) {
      closeList();
      html += '<hr>\n';
      continue;
    }

    // Checkbox list
    if (/^- \[[ x]\]/.test(line)) {
      if (!inUl) { html += '<ul>\n'; inUl = true; }
      const checked = line.includes('[x]');
      html += `<li>${checked ? '☑' : '☐'} ${inline(line.replace(/^- \[[ x]\] /, ''))}</li>\n`;
      continue;
    }

    // Unordered list
    if (/^[*-] /.test(line)) {
      if (inOl) { html += '</ol>\n'; inOl = false; }
      if (!inUl) { html += '<ul>\n'; inUl = true; }
      html += `<li>${inline(line.replace(/^[*-] /, ''))}</li>\n`;
      continue;
    }

    // Ordered list
    if (/^\d+\. /.test(line)) {
      if (inUl) { html += '</ul>\n'; inUl = false; }
      if (!inOl) { html += '<ol>\n'; inOl = true; }
      html += `<li>${inline(line.replace(/^\d+\. /, ''))}</li>\n`;
      continue;
    }

    closeList();

    // Skip TOC / bracket lines
    if (/^\[TOC\]/.test(line) || /^\[Contenido pendiente/.test(line)) continue;

    // Empty line closes div if needed
    if (line.trim() === '') {
      html += '\n';
      continue;
    }

    // Paragraph
    html += `<p>${inline(line)}</p>\n`;
  }

  closeList();
  // Close any open body-page divs
  html += '</div>';
  return html;
}

function inline(text) {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%"/>')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

const bodyHTML = convertMarkdown(fixedContent);

const fullHTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Manual de Protección y Seguridad para Dignatarios — Policía de Tierra del Fuego</title>
  <meta name="description" content="Manual operativo integral para protección de dignatarios. Uso exclusivo oficial.">
  <style>${CSS}</style>
</head>
<body>
<div class="page-wrap">
  ${coverHTML}
  ${tocHTML}
  ${bodyHTML}
</div>
</body>
</html>`;

const outPath = 'C:\\Users\\54290\\Documents\\Actigravity\\WikiApp\\manual_vip.html';
fs.writeFileSync(outPath, fullHTML, 'utf8');
console.log('✅  Archivo generado en:', outPath);
console.log('👉  Abrelo en Chrome/Edge → Ctrl+P → Guardar como PDF → A4, sin márgenes, con gráficos de fondo.');
