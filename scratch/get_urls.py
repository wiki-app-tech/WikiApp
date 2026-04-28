import urllib.request
import re

urls = [
    'https://www.radios-argentinas.org/radio-provincia-999',
    'https://www.radios-argentinas.org/radio-argentina-ushuaia',
    'https://www.radios-argentinas.org/fm-fuego',
    'https://www.radios-argentinas.org/estacion-del-siglo',
    'https://www.radios-argentinas.org/fm-ushuaia',
    'https://www.radios-argentinas.org/aire-libre-fm',
    'https://www.radiofmcentro.com/',
    'https://www.radiofueguina.com/en-vivo/',
    'https://onlineradiobox.com/ar/lra24/',
    'https://onlineradiobox.com/ar/cadenafm/?cs=ar.lra24'
]

headers = {'User-Agent': 'Mozilla/5.0'}

for u in urls:
    try:
        req = urllib.request.Request(u, headers=headers)
        html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
        
        # Look for HTML5 audio tags, or m3u8/mp3 links
        streams = re.findall(r'(https?://[^\s\"\'<>]+(?:\.mp3|\.aac|\.m3u8|/stream|/live|8000|8080|9037|8192|8130)[^\s\"\'<>]*)', html)
        
        # Look specifically for <source src="..."
        sources = re.findall(r'<source\s+[^>]*src=[\"\']([^\"\']+)[\"\']', html)
        
        # Online radio box data-stream
        orb_streams = re.findall(r'data-stream=[\"\']([^\"\']+)[\"\']', html)
        
        # Radios-argentinas specific
        ra_streams = re.findall(r'data-radio-url=[\"\']([^\"\']+)[\"\']', html)
        
        all_streams = set(streams + sources + orb_streams + ra_streams)
        print(f'{u}: {list(all_streams)}')
    except Exception as e:
        print(f'{u}: Error {e}')
