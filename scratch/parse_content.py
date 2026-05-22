import re

with open('scratch/raw.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Busquemos texto visible o bloques de texto
# Limpiamos el HTML para quedarnos con el texto principal
# Buscamos dónde aparecen palabras clave como Ushuaia, Rio Grande, Tolhuin
keywords = ['ushuaia', 'tolhuin', 'grande', 'farmacia']

print("Keyword occurrences (around matches):")
for kw in keywords:
    matches = [m.start() for m in re.finditer(kw, html, re.IGNORECASE)]
    print(f"Keyword '{kw}': {len(matches)} matches")
    if matches:
        # Mostramos los primeros 3 contextos
        for idx in matches[:3]:
            start = max(0, idx - 50)
            end = min(len(html), idx + 100)
            context = html[start:end].replace('\n', ' ').strip()
            print(f"  - [{idx}]: ... {context} ...")

# Busquemos si hay tablas
tables = re.findall(r'<table[^>]*>.*?</table>', html, re.DOTALL)
print(f"\nTables found: {len(tables)}")

# Busquemos si hay archivos PDF o imágenes que puedan contener la info
img_tags = re.findall(r'<img[^>]*>', html)
print(f"\nImages found: {len(img_tags)}")
for img in img_tags:
    if 'farmacia' in img.lower() or 'turno' in img.lower() or 'wp-content/uploads' in img.lower():
        print("  -", img)
