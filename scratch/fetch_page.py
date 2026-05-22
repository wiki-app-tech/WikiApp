import urllib.request
import re

url = "https://www.airelibre.com.ar/farmacias-de-turnos-en-tierra-del-fuego/"

req = urllib.request.Request(
    url, 
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
)

try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8', errors='ignore')
        
    print(f"Page fetched successfully! Size: {len(html)} bytes")
    
    # Busquemos todos los iframes
    iframes = re.findall(r'<iframe[^>]*src=["\']([^"\']+)["\']', html)
    print("\nIFRAMES FOUND:")
    for iframe in iframes:
        print("  -", iframe)
        
    # Busquemos todos los enlaces externos
    links = re.findall(r'<a[^>]*href=["\']([^"\']+)["\']', html)
    print("\nEXTERNAL LINKS (filtered):")
    for link in links:
        if 'farmacia' in link or 'turno' in link or 'google' in link or 'drive' in link:
            print("  -", link)
            
    # Guardar body text o partes relevantes
    with open('scratch/raw.html', 'w', encoding='utf-8') as f:
        f.write(html)
        
except Exception as e:
    print("Error:", e)
