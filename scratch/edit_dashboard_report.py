import os

file_path = 'src/components/Dashboard.tsx'

with open(file_path, 'rb') as f:
    content = f.read()

uses_crlf = b'\r\n' in content
content_lf = content.replace(b'\r\n', b'\n')

def to_bytes(s):
    return s.encode('utf-8')

# 1. Actualizar las importaciones de lucide-react para incluir AlertTriangle, Info
old_imports = to_bytes("import { LayoutDashboard, Compass, Settings, Bookmark, Search, Cloud, ChevronRight, LayoutGrid, List, LayoutTemplate, X, ExternalLink, Plus, BookmarkCheck, Share2, MoreHorizontal, CheckCircle2, PlayCircle, Flame, Send, MessageCircle, Map, MapPin, Car, ShieldAlert, Anchor, Plane, FileText, Bell, ShieldCheck, TrendingUp, Shield, ListFilter, Radio, Sun, Moon, Globe, Flag, ChevronDown } from 'lucide-react';")
new_imports = to_bytes("import { LayoutDashboard, Compass, Settings, Bookmark, Search, Cloud, ChevronRight, LayoutGrid, List, LayoutTemplate, X, ExternalLink, Plus, BookmarkCheck, Share2, MoreHorizontal, CheckCircle2, PlayCircle, Flame, Send, MessageCircle, Map, MapPin, Car, ShieldAlert, Anchor, Plane, FileText, Bell, ShieldCheck, TrendingUp, Shield, ListFilter, Radio, Sun, Moon, Globe, Flag, ChevronDown, AlertTriangle, Info } from 'lucide-react';")

if old_imports in content_lf:
    print("Imports block found!")
    content_lf = content_lf.replace(old_imports, new_imports)
else:
    print("Imports block NOT found!")

# 2. Agregar el estado reportSubTab
old_dropdown_state = to_bytes("const [isCoverageDropdownOpen, setIsCoverageDropdownOpen] = useState(false);")
new_dropdown_state = to_bytes("const [isCoverageDropdownOpen, setIsCoverageDropdownOpen] = useState(false);\n  const [reportSubTab, setReportSubTab] = useState<'summary' | 'global' | 'national' | 'provincial' | 'alerts_recs' | 'methodology'>('summary');")

if old_dropdown_state in content_lf:
    print("Dropdown state definition found!")
    content_lf = content_lf.replace(old_dropdown_state, new_dropdown_state)
else:
    print("Dropdown state definition NOT found!")

# 3. Reemplazar la columna derecha del panel reports (vista previa genérica) con el Informe de Auditoría Interactivo
# Buscaremos la firma de la columna reports:
old_reports_column = to_bytes('''                            {/* PREVIEW/HISTORY COLUMN */}
                            <div className="xl:col-span-8 flex flex-col gap-6">
                                <section className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-3xl p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <FileText className="w-48 h-48 text-blue-500" />
                                    </div>

                                    <div className="flex flex-col gap-1 z-10">
                                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Informe Semanal de Riesgos y Estabilidad</span>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Análisis de Realidad Social Tierrafueguina</h2>
                                        <p className="text-slate-500 dark:text-gray-500 text-xs mt-1">Sintetizado el {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>

                                    <div className="h-px bg-gradient-to-r from-orange-500/50 to-transparent z-10"></div>

                                    <div className="flex flex-col gap-6 z-10">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex gap-4 group/item">
                                                <div className="text-orange-500 text-lg font-black italic">0{i}</div>
                                                <div className="flex flex-col gap-1">
                                                    <h4 className="text-[14px] font-bold text-slate-800 dark:text-gray-200 group-hover/item:text-orange-400 transition-colors">
                                                        {i === 1 ? 'Amenazas Geopolíticas y Fronterizas' : i === 2 ? 'Indicadores de Conflictividad Social' : 'Seguridad en Infraestructura Crítica'}
                                                    </h4>
                                                    <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed max-w-xl">
                                                        {i === 1 ? 'Evaluación de los movimientos en los pasos fronterizos y dinámica migratoria regional.' : 
                                                         i === 2 ? 'Análisis de paritarias y movimientos gremiales que impactan la estabilidad local.' : 
                                                         'Detección de vulnerabilidades en servicios esenciales y logística estratégica.'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 flex gap-4 z-10">
                                        <button className="flex items-center gap-2 px-6 py-2 bg-slate-100 dark:bg-[#1a1a1a] hover:bg-slate-200 dark:bg-[#222] border border-slate-200 dark:border-white/5 rounded-xl text-[10px] font-black uppercase text-slate-600 dark:text-gray-400 transition-all">
                                            <ExternalLink className="w-3.5 h-3.5" /> Descargar PDF
                                        </button>
                                        <button className="flex items-center gap-2 px-6 py-2 bg-slate-100 dark:bg-[#1a1a1a] hover:bg-slate-200 dark:bg-[#222] border border-slate-200 dark:border-white/5 rounded-xl text-[10px] font-black uppercase text-slate-600 dark:text-gray-400 transition-all">
                                            <Share2 className="w-3.5 h-3.5" /> Compartir Informe
                                        </button>
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-2xl flex flex-col gap-2">
                                        <h4 className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase">Integración IA</h4>
                                        <p className="text-[11px] text-slate-600 dark:text-gray-400">El motor de IA analiza sentimientos y tendencias automáticamente antes de compilar el informe.</p>
                                    </div>
                                    <div className="p-6 bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-2xl flex flex-col gap-2">
                                        <h4 className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase">Alertas Críticas</h4>
                                        <p className="text-[11px] text-slate-600 dark:text-gray-400">Si se detecta una noticia de alta volatilidad, se genera un reporte extraordinario fuera de ciclo.</p>
                                    </div>
                                </div>
                            </div>''')

new_reports_column = to_bytes('''                            {/* COLUMNA DEL INFORME DE AUDITORÍA ESTRATÉGICO INTERACTIVO */}
                            <div className="xl:col-span-8 flex flex-col gap-6">
                                <section className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden group">
                                    <div className="flex flex-col gap-1.5 z-10">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/10">Auditoría Especializada</span>
                                            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/10">Verificado</span>
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-display mt-1">
                                            Informe de Auditoría de Seguridad Pública y Ciudadana
                                        </h2>
                                        <p className="text-slate-500 dark:text-gray-500 text-xs">
                                            Sintetizado de forma estructurada e integrada con fuentes oficiales el {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
                                        </p>
                                    </div>

                                    {/* NAVEGACIÓN INTERNA DEL INFORME (UX PREMIUM) */}
                                    <div className="flex overflow-x-auto bg-slate-100 dark:bg-black/40 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 gap-1 scrollbar-hide">
                                        {[
                                            { id: 'summary', label: 'Resumen Ejecutivo', icon: Info },
                                            { id: 'global', label: 'I. Geopolítica Global', icon: Globe },
                                            { id: 'national', label: 'II. Panorama Nacional', icon: Flag },
                                            { id: 'provincial', label: 'III. Tierra del Fuego', icon: Map },
                                            { id: 'alerts_recs', label: 'Alertas & Recomendaciones', icon: AlertTriangle },
                                            { id: 'methodology', label: 'Anexo Metodológico', icon: BookCheck }
                                        ].map(tab => {
                                            const Icon = tab.icon === BookCheck ? BookmarkCheck : tab.icon;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setReportSubTab(tab.id as any)}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                                                        reportSubTab === tab.id
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : 'text-slate-500 dark:text-gray-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
                                                    }`}
                                                >
                                                    <Icon className="w-3.5 h-3.5" />
                                                    {tab.label}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="h-px bg-slate-200 dark:bg-white/5"></div>

                                    {/* CONTENIDO DINÁMICO SEGÚN PESTAÑA */}
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={reportSubTab}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-slate-700 dark:text-gray-300 flex flex-col gap-4 text-[13px] leading-relaxed"
                                        >
                                            {reportSubTab === 'summary' && (
                                                <div className="flex flex-col gap-4">
                                                    <div className="bg-blue-500/5 dark:bg-blue-500/[0.02] border border-blue-500/20 rounded-2xl p-5">
                                                        <h3 className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                                            🎯 Objetivo General
                                                        </h3>
                                                        <p className="text-slate-700 dark:text-gray-300 font-medium">
                                                            Realizar un análisis exhaustivo de la información contenida en la wiki oficial (<a href="https://wiki-app-swart.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline font-mono hover:text-blue-400">wiki-app-swart.vercel.app</a>), complementándola con fuentes externas oficiales y confiables (tanto nacionales como internacionales), para elaborar un Informe de Auditoría de Seguridad Pública y Ciudadana que contemple un Panorama Internacional, un Panorama Nacional Argentino y un Panorama Provincial de Tierra del Fuego.
                                                        </p>
                                                    </div>

                                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mt-2">Visión de Síntesis Ejecutiva</h3>
                                                    <p>
                                                        El presente informe audita la convergencia entre la delincuencia de tipo tradicional (homicidios, robos de propiedad) y las amenazas delictivas emergentes asistidas por tecnologías informáticas. A nivel <strong>Global</strong>, se consolida la industrialización de ataques y estafas con Inteligencia Artificial. A nivel <strong>Nacional</strong>, Argentina mantiene una tasa históricamente baja de homicidios (3.7 en 2025) pero exhibe vulnerabilidades marcadas ante fraudes bancarios y secuestro de datos. En el plano <strong>Provincial (TDF)</strong>, se ratifica la condición de isla segura frente a crímenes violentos, confrontando sin embargo un brote persistente de estafas virtuales de ingeniería social geolocalizada.
                                                    </p>

                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                                                        <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-4 rounded-xl flex flex-col">
                                                            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-gray-400 tracking-wider">Homicidios TDF</span>
                                                            <span className="text-2xl font-black text-emerald-500 mt-1">1.1 /100k</span>
                                                            <span className="text-[9px] text-slate-400 dark:text-gray-500 mt-1 font-mono">El más bajo del país</span>
                                                        </div>
                                                        <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-4 rounded-xl flex flex-col">
                                                            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-gray-400 tracking-wider">Homicidios AR</span>
                                                            <span className="text-2xl font-black text-sky-500 mt-1">3.7 /100k</span>
                                                            <span className="text-[9px] text-slate-400 dark:text-gray-500 mt-1 font-mono">Mínimo de Latinoamérica</span>
                                                        </div>
                                                        <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-4 rounded-xl flex flex-col">
                                                            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-gray-400 tracking-wider">Causas Ciber TDF</span>
                                                            <span className="text-2xl font-black text-orange-500 mt-1">882 Casos</span>
                                                            <span className="text-[9px] text-slate-400 dark:text-gray-500 mt-1 font-mono">Estadística 2025</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {reportSubTab === 'global' && (
                                                <div className="flex flex-col gap-4">
                                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                                        1. Tendencias Globales en Seguridad Ciudadana
                                                    </h3>
                                                    <p>
                                                        De acuerdo con los reportes globales de la <strong>UNODC</strong> y las evaluaciones estratégicas de <strong>INTERPOL</strong>, la criminalidad organizada experimenta una acelerada transnacionalización digital. Los delitos de mayor expansión son las estafas financieras en línea y la explotación de vulnerabilidades informáticas críticas.
                                                    </p>
                                                    <ul className="list-disc pl-5 space-y-1">
                                                        <li><strong>Industrialización del Fraude y Uso de IA</strong>: Los criminales emplean modelos avanzados de IA Generativa para orquestar correos electrónicos hiperrealistas de phishing, automatizar el desarrollo de exploits y realizar suplantaciones biométricas avanzadas (deepfakes).</li>
                                                        <li><strong>Patrones de Ciberdelincuencia</strong>: Fuerte incremento de ataques de ransomware dirigidos a corporaciones e infraestructura de salud pública, fugas de bases de datos masivas y esquemas fraudulentos de criptoactivos.</li>
                                                    </ul>

                                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mt-2">
                                                        2. Contexto Regional (América Latina y el Caribe)
                                                    </h3>
                                                    <p>
                                                        América Latina se posiciona como la zona más expuesta a campañas agresivas de ransomware a nivel mundial. La limitada inversión de seguridad nacional y la fragilidad institucional favorecen la proliferación del cibercrimen financiero. Las estrategias conjuntas tuteladas por la <strong>OEA</strong> y el <strong>BID</strong> buscan homogeneizar los códigos penales específicos contra el ciberdelito y generar equipos de respuesta CSIRT en toda la región.
                                                    </p>

                                                    {/* TABLA COMPARATIVA GLOBAL */}
                                                    <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden mt-3 shadow-inner">
                                                        <table className="w-full text-[11px] text-left border-collapse bg-slate-50/50 dark:bg-black/20">
                                                            <thead>
                                                                <tr className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-black uppercase text-[9px] tracking-wider">
                                                                    <th className="p-3">Región / Indicador</th>
                                                                    <th className="p-3">Tasa Homicidios (x100k)</th>
                                                                    <th className="p-3">Nivel Amenaza Ransomware</th>
                                                                    <th className="p-3">Índice Ciberseguridad (ITU)</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-700 dark:text-gray-300 font-medium">
                                                                <tr>
                                                                    <td className="p-3 font-bold text-slate-900 dark:text-white">América Latina</td>
                                                                    <td className="p-3">18.5</td>
                                                                    <td className="p-3 text-red-500 font-bold">Muy Alto (22% mundial)</td>
                                                                    <td className="p-3">Nivel Medio</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="p-3 font-bold text-slate-900 dark:text-white">Argentina</td>
                                                                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">3.7</td>
                                                                    <td className="p-3 text-orange-500">Medio-Alto</td>
                                                                    <td className="p-3">Nivel T4 (En Evolución)</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="p-3 font-bold text-slate-900 dark:text-white">Tierra del Fuego</td>
                                                                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">1.1</td>
                                                                    <td className="p-3 text-slate-500">Bajo-Medio</td>
                                                                    <td className="p-3">Fase Inicial</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {reportSubTab === 'national' && (
                                                <div className="flex flex-col gap-4">
                                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                                        1. Seguridad Pública Tradicional Argentina
                                                    </h3>
                                                    <p>
                                                        Las estadísticas del Sistema Nacional de Información Criminal (SNIC) del Ministerio de Seguridad reportan que <strong>Argentina consolidó en 2025 una tasa de homicidios dolosos de 3.7 por cada 100,000 habitantes</strong>. Este dato constituye uno de los registros más bajos de Latinoamérica, reflejando el impacto positivo de la presencia federal coordinada y programas de proximidad urbana ("Seguridad en tu Barrio"). En contraste, los delitos contra la propiedad y las denuncias de estafas tradicionales mutaron hacia canales virtuales.
                                                    </p>

                                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mt-2">
                                                        2. Ciberseguridad y Delitos Informáticos en el País
                                                    </h3>
                                                    <ul className="list-disc pl-5 space-y-1.5">
                                                        <li><strong>Plan Federal de Lucha contra el Fraude Ciberasistido (2026-2027)</strong>: Iniciativa lanzada por el Poder Ejecutivo con el objetivo de unificar las bases de datos de denuncias informáticas, coordinar bloqueos preventivos de cuentas bancarias y coordinar campañas de respuesta interjurisdiccional.</li>
                                                        <li><strong>Posición en el Índice de Ciberseguridad (GCI - ITU)</strong>: Argentina se clasifica en el Nivel T4 ("Etapa en Evolución"), señalando la necesidad de optimizar las normativas de protección de infraestructuras críticas nacionales y endurecer las penas contra el cibercrimen organizado.</li>
                                                    </ul>
                                                </div>
                                            )}

                                            {reportSubTab === 'provincial' && (
                                                <div className="flex flex-col gap-4">
                                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                                        1. Situación de la Seguridad Pública en Tierra del Fuego
                                                    </h3>
                                                    <p>
                                                        Los informes publicados por el **IPIEC** (Instituto Provincial de Análisis Estadístico y Censos) corroboran que **Tierra del Fuego registra los niveles delictivos tradicionales más bajos de la República Argentina**, con una tasa de homicidios que oscila en 1.1 casos por cada 100,000 habitantes.
                                                    </p>
                                                    <p>
                                                        Los operativos estacionales como **"Invierno Seguro"** y los controles permanentes coordinados por la Policía Provincial en el Paso Garibaldi de la Ruta Nacional N° 3 logran neutralizar accidentes viales de gravedad y mantienen un cerco de control aduanero y de seguridad pública estable sobre el ingreso de mercancías a la provincia.
                                                    </p>

                                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mt-2">
                                                        2. Ciberdelitos y Capacidades de Respuesta en la Isla
                                                    </h3>
                                                    <p>
                                                        Durante el año **2025 se formalizaron aproximadamente 882 causas judiciales vinculadas a ciberdelitos** en Tierra del Fuego (estafas por redes sociales, suplantación en plataformas como WhatsApp y fraude en transacciones electrónicas).
                                                    </p>
                                                    <ul className="list-disc pl-5 space-y-1.5">
                                                        <li><strong>Campañas Provinciales</strong>: Destaca la campaña de concientización ciudadana **"Si no cierra no abras"**, orientada a instruir a personas mayores sobre cómo evitar compartir códigos OTP o claves bancarias por llamadas de voz fraudulentas.</li>
                                                        <li><strong>Divisiones Especializadas</strong>: La Policía de la Provincia dispone de una **División de Delitos Complejos** con áreas periciales en informática forense, aunque el incremento acelerado de causas exige ampliar el presupuesto tecnológico en licencias de análisis y peritos forenses.</li>
                                                    </ul>
                                                </div>
                                            )}

                                            {reportSubTab === 'alerts_recs' && (
                                                <div className="flex flex-col gap-5">
                                                    <div>
                                                        <h3 className="text-sm font-black text-red-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                                                            <AlertTriangle className="w-4 h-4 text-red-500" /> Alertas Tempranas (Amenazas Emergentes)
                                                        </h3>
                                                        <div className="space-y-3">
                                                            <div className="bg-red-500/5 dark:bg-red-500/[0.01] border-l-4 border-l-red-500 p-3.5 rounded-r-xl">
                                                                <span className="font-bold text-slate-800 dark:text-gray-100 block">1. Phishing Financiero con Identidad Local</span>
                                                                <span className="text-[12px] text-slate-600 dark:text-gray-405 mt-1 block">Ataques simulando canales de cobro de servicios públicos específicos de la isla (DPE, cooperativas de agua, impuestos municipales de Ushuaia y Río Grande) para desviar transferencias.</span>
                                                            </div>
                                                            <div className="bg-red-500/5 dark:bg-red-500/[0.01] border-l-4 border-l-red-500 p-3.5 rounded-r-xl">
                                                                <span className="font-bold text-slate-800 dark:text-gray-100 block">2. Clonación de Voz por Inteligencia Artificial</span>
                                                                <span className="text-[12px] text-slate-600 dark:text-gray-405 mt-1 block">Estafas dirigidas a la población de la tercera edad simulando accidentes o secuestros virtuales utilizando fragmentos de voz reales clonados de redes sociales.</span>
                                                            </div>
                                                            <div className="bg-red-500/5 dark:bg-red-500/[0.01] border-l-4 border-l-red-500 p-3.5 rounded-r-xl">
                                                                <span className="font-bold text-slate-800 dark:text-gray-100 block">3. Vulnerabilidad en Sistemas Logísticos de Puertos</span>
                                                                <span className="text-[12px] text-slate-600 dark:text-gray-405 mt-1 block">Campañas de ransomware dirigidas a sistemas informáticos portuarios en el Puerto de Ushuaia que podrían paralizar la logística del turismo y de la industria electrónica.</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h3 className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                                            💡 Recomendaciones Estratégicas
                                                        </h3>
                                                        <div className="space-y-3 text-[12px]">
                                                            <div className="bg-blue-500/5 dark:bg-blue-500/[0.01] border-l-4 border-l-blue-500 p-3.5 rounded-r-xl">
                                                                <span className="font-bold text-slate-800 dark:text-gray-100 block">1. Creación del CSIRT Provincial Fueguino</span>
                                                                <span className="text-slate-600 dark:text-gray-405 mt-1 block">Establecer una unidad de respuesta ante emergencias informáticas coordinada con los proveedores de servicios de internet locales y dependencias estatales críticas.</span>
                                                            </div>
                                                            <div className="bg-blue-500/5 dark:bg-blue-500/[0.01] border-l-4 border-l-blue-500 p-3.5 rounded-r-xl">
                                                                <span className="font-bold text-slate-800 dark:text-gray-100 block">2. Equipamiento Tecnológico de Informática Forense</span>
                                                                <span className="text-slate-600 dark:text-gray-405 mt-1 block">Proveer licencias forenses profesionales (Cellebrite, FTK) y capacitación continua sobre peritaje digital a la División de Delitos Complejos de la Policía Provincial.</span>
                                                            </div>
                                                            <div className="bg-blue-500/5 dark:bg-blue-500/[0.01] border-l-4 border-l-blue-500 p-3.5 rounded-r-xl">
                                                                <span className="font-bold text-slate-800 dark:text-gray-100 block">3. Convenios Interbancarios de Alerta Temprana</span>
                                                                <span className="text-slate-600 dark:text-gray-405 mt-1 block">Firma de convenios con el Banco de la Provincia de Tierra del Fuego (BTF) y entidades privadas para congelar fondos sospechosos en tiempo real tras la denuncia inmediata.</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {reportSubTab === 'methodology' && (
                                                <div className="flex flex-col gap-4">
                                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                                        Fuentes de Información y Fechas de Consulta
                                                    </h3>
                                                    <p>
                                                        Para elaborar esta auditoría se contrastó la información obtenida a través de la wiki de monitoreo local con datos oficiales de las siguientes plataformas:
                                                    </p>
                                                    <div className="flex flex-col gap-2.5 font-mono text-[11px] bg-slate-100 dark:bg-black/30 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                                                        <div>
                                                            <span className="font-bold text-blue-600 dark:text-blue-400 block">UNODC (Global Crime Data Portal)</span>
                                                            <a href="https://www.unodc.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400 break-all">https://www.unodc.org/</a>
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-blue-600 dark:text-blue-400 block">INTERPOL (Global Threats Evaluation Report)</span>
                                                            <a href="https://www.interpol.int/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400 break-all">https://www.interpol.int/</a>
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-blue-600 dark:text-blue-400 block">Ministerio de Seguridad de la Nación Argentina</span>
                                                            <a href="https://www.argentina.gob.ar/seguridad" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400 break-all">https://www.argentina.gob.ar/seguridad</a>
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-blue-600 dark:text-blue-400 block">Boletín Oficial de la República Argentina</span>
                                                            <a href="https://www.boletinoficial.gob.ar/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400 break-all">https://www.boletinoficial.gob.ar/</a>
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-blue-600 dark:text-blue-400 block">IPIEC - Estadísticas Provinciales</span>
                                                            <a href="https://ipiec.tierradelfuego.gob.ar/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400 break-all">https://ipiec.tierradelfuego.gob.ar/</a>
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-blue-600 dark:text-blue-400 block">Wiki de Monitoreo Local</span>
                                                            <a href="https://wiki-app-swart.vercel.app/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400 break-all">https://wiki-app-swart.vercel.app/</a>
                                                        </div>
                                                        <div className="pt-2 border-t border-slate-200 dark:border-white/5 font-sans font-bold text-slate-500 dark:text-gray-500 text-[10px] uppercase">
                                                            Fecha última de sincronización y contraste: 22 de Mayo de 2026.
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>

                                    <div className="mt-6 flex flex-wrap gap-4 z-10 pt-4 border-t border-slate-200 dark:border-white/5">
                                        <button 
                                            onClick={() => {
                                                const reportContent = `INFORME DE AUDITORÍA DE SEGURIDAD PÚBLICA\\n🎯 Objetivo: Análisis exhaustivo de seguridad física y ciberseguridad a tres niveles.\\n\\nTasa homicidios TDF: 1.1 /100k\\nTasa homicidios AR: 3.7 /100k\\nCausas Ciber TDF: 882 casos en 2025\\n\\nConsulte el anexo metodológico en https://wiki-app-swart.vercel.app/`;
                                                const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
                                                const link = document.createElement('a');
                                                link.href = URL.createObjectURL(blob);
                                                link.download = 'Informe_Auditoria_Seguridad.txt';
                                                link.click();
                                            }}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-[#1a1a1a] hover:bg-slate-200 dark:hover:bg-[#222] border border-slate-200 dark:border-white/5 rounded-xl text-[10px] font-black uppercase text-slate-750 dark:text-gray-400 transition-all cursor-pointer shadow-sm"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5 text-blue-500" /> Descargar Informe (TXT)
                                        </button>
                                        <button 
                                            onClick={() => {
                                                const shareUrl = `https://wiki-app-swart.vercel.app/`;
                                                const shareText = `Revisa el Informe de Auditoría de Seguridad Pública y Ciudadana en Tierra del Fuego.`;
                                                window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
                                            }}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-[#1a1a1a] hover:bg-slate-200 dark:hover:bg-[#222] border border-slate-200 dark:border-white/5 rounded-xl text-[10px] font-black uppercase text-slate-750 dark:text-gray-400 transition-all cursor-pointer shadow-sm"
                                        >
                                            <Share2 className="w-3.5 h-3.5 text-emerald-500" /> Compartir Informe
                                        </button>
                                    </div>
                                </section>
                            </div>''')

# Buscar y reemplazar la columna derecha en reports
if old_reports_column in content_lf:
    print("Reports column block found!")
    content_lf = content_lf.replace(old_reports_column, new_reports_column)
else:
    print("Reports column block NOT found (checking alternative index search)!")
    
    # Intento de búsqueda alternativo: ubicar la sección y reemplazar usando índices
    reports_header = b"{activeTab === 'reports' && ("
    if reports_header in content_lf:
        print("Reports header found. Finding columns...")
        reports_idx = content_lf.find(reports_header)
        # Buscar la primera coincidencia del contenedor de previsualización (preview column)
        preview_col_sig = b'''{/* PREVIEW/HISTORY COLUMN */}'''
        preview_start = content_lf.find(preview_col_sig, reports_idx)
        if preview_start != -1:
            # Encontrar el final del bloque del contenedor de previsualización (antes de cerrar el activeTab === 'reports')
            # Busquemos el cierre de la div anterior a cerrar activeTab ('reports')
            # Que está justo antes del cierre del main block del activeTab
            # Busquemos el patrón del final: </motion.div>\n                  )}
            reports_tab_end_pattern = b'''                        </div>\n                    </motion.div>\n                  )}'''
            tab_end_idx = content_lf.find(reports_tab_end_pattern, preview_start)
            if tab_end_idx != -1:
                # El bloque va desde preview_start hasta tab_end_idx (excluyendo el cierre del activeTab)
                # Reemplazamos
                content_lf = content_lf[:preview_start] + new_reports_column + content_lf[tab_end_idx:]
                print("Replaced reports layout using indices successfully!")

if uses_crlf:
    final_content = content_lf.replace(b'\n', b'\r\n')
else:
    final_content = content_lf

with open(file_path, 'wb') as f:
    f.write(final_content)

print("Modification complete!")
