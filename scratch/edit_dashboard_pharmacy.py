import os

file_path = 'src/components/Dashboard.tsx'

with open(file_path, 'rb') as f:
    content = f.read()

# Guardar si usa CRLF
uses_crlf = b'\r\n' in content

# Normalizar a LF
content_lf = content.replace(b'\r\n', b'\n')

# 1. Inserción de estados y hooks de farmacias
# Buscamos el final del useEffect del reloj de sincronización
target_use_effect_end = b'''    const interval = setInterval(() => {
      setSyncTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, [setTheme]);'''

use_effect_end_idx = content_lf.find(target_use_effect_end)

if use_effect_end_idx != -1:
    print("useEffect block found!")
    insert_position = use_effect_end_idx + len(target_use_effect_end)
    
    pharmacy_hooks = '''

  const [pharmacies, setPharmacies] = useState<{ rio_grande: any[], tolhuin: any[], ushuaia: any[] } | null>(null);
  const [selectedPharmacyCity, setSelectedPharmacyCity] = useState<'ushuaia' | 'rio_grande' | 'tolhuin'>('ushuaia');
  const [activePharmacyIndex, setActivePharmacyIndex] = useState(0);

  // Obtener farmacias
  useEffect(() => {
    fetch('/api/pharmacies')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setPharmacies({
            rio_grande: data.rio_grande || [],
            tolhuin: data.tolhuin || [],
            ushuaia: data.ushuaia || []
          });
        }
      })
      .catch(err => console.error("Error fetching pharmacies:", err));
  }, []);

  // Rotación del carrusel cada 5 segundos
  useEffect(() => {
    if (!pharmacies) return;
    const interval = setInterval(() => {
      setActivePharmacyIndex(prev => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, [pharmacies, selectedPharmacyCity]);

  const getVisiblePharmacies = (cityKey: 'ushuaia' | 'rio_grande' | 'tolhuin') => {
    if (!pharmacies || !pharmacies[cityKey] || pharmacies[cityKey].length === 0) return [];
    const list = pharmacies[cityKey];
    const todayNum = new Date().getDate();
    const todayIndex = list.findIndex(p => parseInt(p.fecha) === todayNum);
    const startIndex = todayIndex === -1 ? 0 : todayIndex;
    
    const visible = [];
    for (let i = 0; i < 4; i++) {
      const idx = (startIndex + i) % list.length;
      visible.push(list[idx]);
    }
    return visible;
  };'''.encode('utf-8')
    
    content_lf = content_lf[:insert_position] + pharmacy_hooks + content_lf[insert_position:]
else:
    print("useEffect block NOT found!")

# 2. Inserción de la tarjeta del carrusel de farmacias debajo del estado de ruta
target_routes_card_end = b'''                                        <a href="https://www.facebook.com/direccionprovincialdevialidadTDF/?locale=es_LA" target="_blank" rel="noopener noreferrer" className="mt-auto pt-3 border-t border-slate-300 dark:border-[#222] flex items-center justify-between text-[10px] uppercase font-bold text-orange-400 hover:text-orange-300 transition-colors">
                                            Fuente: Vialidad Pcial <ExternalLink className="w-3 h-3"/>
                                        </a>
                                    </div>

                                </div>
                            </div>'''

routes_card_end_idx = content_lf.find(target_routes_card_end)

if routes_card_end_idx != -1:
    print("Routes card end block found!")
    insert_card_position = routes_card_end_idx + len(target_routes_card_end)
    
    pharmacy_card_jsx = '''

                            {/* TARJETA DE FARMACIAS DE TURNO (UX PREMIUM & AUTO-UPDATE) */}
                            <div className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
                                <div className="flex items-center justify-between text-slate-700 dark:text-gray-300">
                                    <h2 className="text-[13px] font-bold tracking-wide flex items-center gap-2">
                                        <Plus className="w-4 h-4 text-emerald-500" />
                                        Farmacias de Turno
                                    </h2>
                                    <div className="flex gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/5">
                                        {(['ushuaia', 'rio_grande', 'tolhuin'] as const).map(city => (
                                            <button
                                                key={city}
                                                onClick={() => {
                                                    setSelectedPharmacyCity(city);
                                                    setActivePharmacyIndex(0);
                                                }}
                                                className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg transition-all ${
                                                    selectedPharmacyCity === city
                                                        ? 'bg-blue-600 text-white shadow-md'
                                                        : 'text-slate-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-500/10'
                                                }`}
                                            >
                                                {city === 'rio_grande' ? 'R. Grande' : city}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {pharmacies ? (
                                    <div className="relative min-h-[140px] flex flex-col">
                                        <AnimatePresence mode="wait">
                                            {(() => {
                                                const visibleList = getVisiblePharmacies(selectedPharmacyCity);
                                                const pharmacy = visibleList[activePharmacyIndex];
                                                if (!pharmacy) return null;

                                                const isToday = parseInt(pharmacy.fecha) === new Date().getDate();
                                                const formattedCityName = selectedPharmacyCity === 'ushuaia' ? 'Ushuaia' : selectedPharmacyCity === 'rio_grande' ? 'Río Grande' : 'Tolhuin';

                                                return (
                                                    <motion.div
                                                        key={`${selectedPharmacyCity}-${activePharmacyIndex}`}
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="bg-slate-100 dark:bg-[#161616]/40 backdrop-blur-md border border-slate-300 dark:border-[#222] rounded-2xl p-4 flex flex-col gap-2 relative shadow-sm"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                                                isToday
                                                                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-pulse'
                                                                    : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-gray-400'
                                                            }`}>
                                                                {isToday ? 'Hoy de Turno' : `${pharmacy.dia} ${pharmacy.fecha}`}
                                                            </span>
                                                            <span className="text-[9px] font-bold text-slate-500 dark:text-gray-500">
                                                                {pharmacy.horario}
                                                            </span>
                                                        </div>

                                                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase mt-1">
                                                            {pharmacy.nombre}
                                                        </h3>

                                                        {/* Dirección Interactiva para GPS */}
                                                        <a
                                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Farmacia ${pharmacy.nombre}, ${pharmacy.direccion}, ${formattedCityName}, Tierra del Fuego`)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit group mt-1"
                                                        >
                                                            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 group-hover:scale-110 transition-transform" />
                                                            <span className="underline underline-offset-2 decoration-dotted group-hover:decoration-solid">{pharmacy.direccion}</span>
                                                        </a>

                                                        {/* Teléfonos Interactivos */}
                                                        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-white/5">
                                                            {(() => {
                                                                const rawPhones = pharmacy.telefono;
                                                                const cleanPhones = rawPhones.replace(/(Tel\.|Cel\.|CEL\.)/gi, '').trim();
                                                                const phoneParts = cleanPhones.split(/[\\/\\–]/).map((p: string) => p.trim()).filter(Boolean);
                                                                
                                                                return phoneParts.map((phone: string, idx: number) => {
                                                                    const telLink = phone.replace(/[^\\d+]/g, '');
                                                                    return (
                                                                        <a
                                                                            key={idx}
                                                                            href={`tel:${telLink}`}
                                                                            className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-emerald-500/20 transition-all cursor-pointer"
                                                                        >
                                                                            <svg className="w-3.5 h-3.5 shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                                                            </svg>
                                                                            Llamar: {phone}
                                                                        </a>
                                                                    );
                                                                });
                                                            })()}
                                                        </div>
                                                    </motion.div>
                                                );
                                            })()}
                                        </AnimatePresence>

                                        {/* Indicadores de carrusel */}
                                        <div className="flex justify-center gap-1.5 mt-3">
                                            {[0, 1, 2, 3].map(idx => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setActivePharmacyIndex(idx)}
                                                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                                                        activePharmacyIndex === idx
                                                            ? 'bg-blue-600 w-3'
                                                            : 'bg-slate-300 dark:bg-[#333]'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-[140px] flex flex-col items-center justify-center bg-slate-100 dark:bg-[#161616]/40 rounded-2xl border border-slate-300 dark:border-[#222]">
                                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-[10px] uppercase font-black text-slate-500 dark:text-gray-500 tracking-wider mt-3">Sincronizando farmacias...</span>
                                    </div>
                                )}
                            </div>'''.encode('utf-8')
    
    content_lf = content_lf[:insert_card_position] + pharmacy_card_jsx + content_lf[insert_card_position:]
else:
    print("Routes card end block NOT found!")

# Restaurar CRLF si se usaba originalmente
if uses_crlf:
    final_content = content_lf.replace(b'\n', b'\r\n')
else:
    final_content = content_lf

with open(file_path, 'wb') as f:
    f.write(final_content)

print("Modification complete!")
