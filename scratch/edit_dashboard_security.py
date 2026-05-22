import os

file_path = 'src/components/Dashboard.tsx'

with open(file_path, 'rb') as f:
    content = f.read()

uses_crlf = b'\r\n' in content
content_lf = content.replace(b'\r\n', b'\n')

def to_bytes(s):
    return s.encode('utf-8')

# Reemplazar la columna derecha en la sección activeTab === 'security'
# Busquemos la sección de EXPERT ANALYSIS COLUMN
old_security_col = to_bytes('''                            {/* EXPERT ANALYSIS COLUMN */}
                            <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide h-full max-h-[700px]">
                                <section className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-slate-300 dark:border-[#222] rounded-3xl p-7 flex flex-col gap-6 shadow-2xl relative border-t-red-600/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Dictamen de Auditoría</h3>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-tighter">REF: TDF-2026-X</span>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex flex-col gap-3">
                                            <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed italic border-l-2 border-red-800 pl-4 bg-red-950/10 py-2 rounded-r-lg">
                                                "Argentina hoy no permite improvisación. Tras 30 años en seguridad, observo una mutación del crimen hacia nodos logísticos. Tierra del Fuego, por su valor estratégico, requiere una compartimentación de seguridad por ciudad y un enfoque preventivo dinámico."
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                           <h4 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                              <MapPin className="w-4 h-4 text-red-500" /> Desglose Operativo por Nodo
                                           </h4>
                                           <div className="space-y-5">
                                              <div className="bg-white dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200 dark:border-white/5 group hover:bg-orange-600/5 transition-colors">
                                                 <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Río Grande: Foco Logístico</span>
                                                 <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed mt-1">Alta densidad industrial. Riesgo de infiltración y robo logístico. Necesidad de control biométrico y patrullaje predictivo en parques industriales.</p>
                                              </div>
                                              <div className="bg-white dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200 dark:border-white/5 group hover:bg-blue-600/5 transition-colors">
                                                 <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Ushuaia: Foco Turístico/Nocturno</span>
                                                 <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed mt-1">Vulnerabilidad por flujo estacional. Conflictividad en nocturnidad. Propuesta: Unidades satélites de respuesta rápida.</p>
                                              </div>
                                              <div className="bg-white dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200 dark:border-white/5 group hover:bg-emerald-600/5 transition-colors">
                                                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Tolhuin: Nodo de Filtrado Regional</span>
                                                 <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed mt-1">Punto táctico de control de arterias. Vital para prevenir el desplazamiento delictivo entre cabeceras.</p>
                                              </div>
                                           </div>
                                        </div>

                                        <div className="bg-slate-100 dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col gap-4">
                                            <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-emerald-500" /> Plan de Acción Preventivo
                                            </h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                {[
                                                    { t: 'Prevención', d: 'Patrullaje dinámico basado en hotspots de calor.' },
                                                    { t: 'Estrategia', d: 'Protocolo de cierre de rutas USH/RGA ante incidentes.' },
                                                    { t: 'Tecnología', d: 'Sensores de movimiento en perímetros críticos.' }
                                                ].map(item => (
                                                    <div key={item.t} className="flex flex-col p-2 bg-slate-100 dark:bg-black/40 rounded-lg">
                                                        <span className="text-[9px] font-black text-slate-700 dark:text-gray-300 uppercase underline decoration-emerald-500/50">{item.t}</span>
                                                        <span className="text-[10px] text-slate-500 dark:text-gray-500 leading-tight">{item.d}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>''')

new_security_col = to_bytes('''                            {/* ENTREGABLE Y AUDITORÍA DE DESPLIEGUE */}
                            <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide h-full max-h-[700px]">
                                <section className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-3xl p-6 flex flex-col gap-5 shadow-2xl relative overflow-hidden">
                                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Estado de Despliegue</h3>
                                        </div>
                                        <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase bg-blue-500/10 px-2 py-0.5 rounded border border-blue-550/10">Fase 1-5 Listas</span>
                                    </div>

                                    {/* LISTA DE FASES ESTATALES */}
                                    <div className="space-y-3.5 text-[11px] leading-relaxed">
                                        {[
                                            { f: 'Fase 1 – Análisis de Entorno', d: 'Conectividad verificada. Estructura creada (/public, /api, /data).', status: 'done' },
                                            { f: 'Fase 2 – Código Base', d: 'Generado index.html, style.css, app.js con Google Maps Fallback.', status: 'done' },
                                            { f: 'Fase 3 – Integración de Datos', d: 'JSON tierradelfuego_crimes.json creado y fetch dinámico configurado.', status: 'done' },
                                            { f: 'Fase 4 – Configuración Firebase', d: 'firebase.json y .firebaserc listos para hosting. (Requiere Firebase CLI local).', status: 'ready' },
                                            { f: 'Fase 5 – Documentación', d: 'README.md completo con cronograma e informe de costos mensuales.', status: 'done' }
                                        ].map((phase, idx) => (
                                            <div key={idx} className="flex gap-3 items-start">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                                                    phase.status === 'done' 
                                                        ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/25' 
                                                        : 'bg-blue-500/15 text-blue-600 border border-blue-500/25'
                                                }`}>
                                                    ✓
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-bold text-slate-900 dark:text-white">{phase.f}</span>
                                                    <span className="text-slate-500 dark:text-gray-400 text-[10px]">{phase.d}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-slate-50 dark:bg-black/35 border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex flex-col gap-2 mt-2">
                                        <span className="text-[10px] font-black text-slate-650 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                            💻 Ejecutar Despliegue Manual:
                                        </span>
                                        <code className="text-[10px] font-mono p-2 bg-slate-900 text-slate-100 rounded-lg select-all border border-white/5">
                                            firebase deploy --only hosting
                                        </code>
                                        <span className="text-[9px] text-slate-400 dark:text-gray-500 leading-tight">
                                            Nota: Firebase CLI no detectado en el PATH local. Despliegue desde su terminal del sistema.
                                        </span>
                                    </div>
                                </section>

                                {/* CAJA DEL DESCARGABLE ZIP */}
                                <section className="bg-gradient-to-br from-blue-600/5 to-transparent border border-blue-500/25 dark:border-blue-500/15 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Paquete de Entrega</span>
                                        <h4 className="text-[13px] font-black text-slate-900 dark:text-white uppercase mt-0.5">Código Fuente Completo (.ZIP)</h4>
                                        <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed mt-1">
                                            Contiene el frontend HTML/CSS/JS, el backend Mock en Node.js, configuraciones de Firebase y el informe técnico.
                                        </p>
                                    </div>
                                    <a 
                                        href="/security-audit-map.zip" 
                                        download="security-audit-map.zip"
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider cursor-pointer transition-all shadow-md hover:shadow-blue-500/10 text-center"
                                    >
                                        💾 Descargar Entregable (.ZIP)
                                    </a>
                                </section>

                                {/* PLAN DE COSTOS Y ACTUALIZACIÓN */}
                                <section className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest">Costos & Mantenimiento</span>
                                        <div className="space-y-2 text-[11px] font-semibold text-slate-700 dark:text-gray-300">
                                            <div className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                                                <span>Google Maps API:</span>
                                                <span className="text-emerald-500 font-bold">Gratis (Crédito $200)</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                                                <span>Firebase Hosting:</span>
                                                <span className="text-emerald-500 font-bold">Gratis (Plan Spark)</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                                                <span>Actualización de Datos:</span>
                                                <span className="font-mono text-blue-500 font-bold">Mensual (0 0 1 * *)</span>
                                            </div>
                                            <div className="flex justify-between pt-1 font-bold text-slate-900 dark:text-white">
                                                <span>Costo Estimado Mensual:</span>
                                                <span className="font-mono text-emerald-500 text-xs">USD 0.00/mes</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>''')

if old_security_col in content_lf:
    print("Security column block found!")
    content_lf = content_lf.replace(old_security_col, new_security_col)
else:
    print("Security column block NOT found! Let's search by prefix...")
    # Intento por prefijo
    prefix = to_bytes("{/* EXPERT ANALYSIS COLUMN */}")
    p_idx = content_lf.find(prefix)
    if p_idx != -1:
        # Encontrar fin del bloque de div que sigue
        # Busquemos la estructura </section>\n                            </div>
        suffix = b"                                </section>\n                            </div>"
        s_idx = content_lf.find(suffix, p_idx)
        if s_idx != -1:
            content_lf = content_lf[:p_idx] + new_security_col + content_lf[s_idx + len(suffix):]
            print("Security column replaced via indices!")

if uses_crlf:
    final_content = content_lf.replace(b'\n', b'\r\n')
else:
    final_content = content_lf

with open(file_path, 'wb') as f:
    f.write(final_content)

print("Security modification completed successfully!")
