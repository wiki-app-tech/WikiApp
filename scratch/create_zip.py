import os
import zipfile

def zipdir(path, ziph):
    # ziph is zipfile.ZipFile object
    for root, dirs, files in os.walk(path):
        for file in files:
            # Create a relative path to keep structure inside zip clean
            abs_path = os.path.join(root, file)
            rel_path = os.path.relpath(abs_path, os.path.join(path, '..'))
            ziph.write(abs_path, rel_path)

if __name__ == '__main__':
    source_dir = 'security-audit-map'
    output_zip = 'public/security-audit-map.zip'
    
    print(f"Comprimiendo '{source_dir}' en '{output_zip}'...")
    
    # Ensure public folder exists
    os.makedirs('public', exist_ok=True)
    
    zipf = zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED)
    zipdir(source_dir, zipf)
    zipf.close()
    
    print("Archivo ZIP creado exitosamente en la carpeta public.")
