import os

file_path = 'src/components/Dashboard.tsx'

with open(file_path, 'rb') as f:
    content = f.read()

# Guardar si usa CRLF
uses_crlf = b'\r\n' in content

# Normalizar a LF
content_lf = content.replace(b'\r\n', b'\n')

# 1. Reemplazo del header
# El bloque inicia con:
# <div className="hidden sm:flex items-center gap-2 text-[10px]
# y termina con:
# <button className="p-2 md:p-2.5 text-slate-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"><Settings className="w-5 h-5" /></button>
#                     </div>
#                 </div>

target_header_start = b'<div className="hidden sm:flex items-center gap-2 text-[10px]'
target_header_end = b'<Settings className="w-5 h-5" /></button>\n                    </div>\n                </div>'

header_start_idx = content_lf.find(target_header_start)
header_end_idx = content_lf.find(target_header_end)

if header_start_idx != -1 and header_end_idx != -1:
    header_end_idx += len(target_header_end)
    print("Header block found!")
    
    header_replacement = '''<div className="flex items-center gap-3 bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200 dark:border-white/5 shadow-sm">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest border-r border-slate-200 dark:border-white/10 pr-3">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Sincronización <span className="text-emerald-500 ml-1">Estable</span>
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest leading-none">Estado del Sistema</span>
                            <span className="text-[10px] font-bold text-slate-700 dark:text-gray-300 leading-tight">
                                Sincronizado: {syncTime || '...'}
                            </span>
                        </div>
                    </div>
                </div>'''.encode('utf-8')
    
    content_lf = content_lf[:header_start_idx] + header_replacement + content_lf[header_end_idx:]
else:
    print(f"Header indexes: start={header_start_idx}, end={header_end_idx}")

# Restaurar CRLF si se usaba originalmente
if uses_crlf:
    final_content = content_lf.replace(b'\n', b'\r\n')
else:
    final_content = content_lf

with open(file_path, 'wb') as f:
    f.write(final_content)

print("Modification complete!")
