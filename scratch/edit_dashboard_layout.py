import os

file_path = 'src/components/Dashboard.tsx'

with open(file_path, 'rb') as f:
    content = f.read()

uses_crlf = b'\r\n' in content
content_lf = content.replace(b'\r\n', b'\n')

def to_bytes(s):
    return s.encode('utf-8')

# 1. Imports
old_imports = to_bytes("import { LayoutDashboard, Compass, Settings, Bookmark, Search, Cloud, ChevronRight, LayoutGrid, List, LayoutTemplate, X, ExternalLink, Plus, BookmarkCheck, Share2, MoreHorizontal, CheckCircle2, PlayCircle, Flame, Send, MessageCircle, Map, MapPin, Car, ShieldAlert, Anchor, Plane, FileText, Bell, ShieldCheck, TrendingUp, Shield, ListFilter, Radio, Sun, Moon } from 'lucide-react';")
new_imports = to_bytes("import { LayoutDashboard, Compass, Settings, Bookmark, Search, Cloud, ChevronRight, LayoutGrid, List, LayoutTemplate, X, ExternalLink, Plus, BookmarkCheck, Share2, MoreHorizontal, CheckCircle2, PlayCircle, Flame, Send, MessageCircle, Map, MapPin, Car, ShieldAlert, Anchor, Plane, FileText, Bell, ShieldCheck, TrendingUp, Shield, ListFilter, Radio, Sun, Moon, Globe, Flag, ChevronDown } from 'lucide-react';")

if old_imports in content_lf:
    print("Imports block found!")
    content_lf = content_lf.replace(old_imports, new_imports)
else:
    print("Imports block NOT found!")

# 2. States
old_active_cat = to_bytes("const [activeCategory, setActiveCategory] = useState<string>('all');")
new_active_cat = to_bytes("const [activeCategory, setActiveCategory] = useState<string>('all');\n  const [isCoverageDropdownOpen, setIsCoverageDropdownOpen] = useState(false);")

if old_active_cat in content_lf:
    print("activeCategory state definition found!")
    content_lf = content_lf.replace(old_active_cat, new_active_cat)
else:
    print("activeCategory state definition NOT found!")

# 3. Fixed Tabs
old_fixed_tabs = to_bytes('''                    {/* PESTAÑAS GEOGRÁFICAS FIJAS */}
                    {activeTab === 'home' && (
                        <div className="flex bg-slate-100/50 dark:bg-black/40 p-1 rounded-[1.25rem] border border-slate-200 dark:border-white/5 items-center overflow-x-auto scrollbar-hide">
                            {[
                                { id: 'all', label: 'Panorama' },
                                { id: 'internacional', label: 'Global' },
                                { id: 'nacional', label: 'Nacional' },
                                { id: 'provincial', label: 'Provincial' }
                            ].map((item) => (
                                <button 
                                key={item.id} 
                                onClick={() => setActiveCategory(item.id)}
                                className={`px-4 md:px-7 py-2 md:py-2.5 rounded-[1rem] text-[10px] md:text-[11px] font-black uppercase tracking-tight transition-all duration-300 whitespace-nowrap ${activeCategory === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'}`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )}''')

new_dropdown_tabs = to_bytes('''                    {/* DROPDOWN DE COBERTURA GEOGRÁFICA INTERACTIVO & RESPONSIVO */}
                    {activeTab === 'home' && (
                        <div className="relative">
                            <button
                                onClick={() => setIsCoverageDropdownOpen(!isCoverageDropdownOpen)}
                                className="flex items-center gap-2.5 px-4 py-3.5 bg-slate-100/80 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 hover:bg-slate-200/55 dark:hover:bg-white/[0.04] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                                {activeCategory === 'all' && <LayoutGrid className="w-4 h-4 text-blue-500" />}
                                {activeCategory === 'internacional' && <Globe className="w-4 h-4 text-orange-500" />}
                                {activeCategory === 'nacional' && <Flag className="w-4 h-4 text-sky-500" />}
                                {activeCategory === 'provincial' && <Map className="w-4 h-4 text-emerald-500" />}
                                
                                <span className="font-sans tracking-wide">
                                    Cobertura: {
                                        activeCategory === 'all' ? 'Panorama' :
                                        activeCategory === 'internacional' ? 'Global' :
                                        activeCategory === 'nacional' ? 'Nacional' : 'Provincial'
                                    }
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isCoverageDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            <AnimatePresence>
                                {isCoverageDropdownOpen && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-30" 
                                            onClick={() => setIsCoverageDropdownOpen(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute left-0 mt-2 w-72 bg-white/95 dark:bg-[#0c0c0c]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-40 flex flex-col gap-1"
                                        >
                                            {[
                                                { id: 'all', label: 'Panorama', desc: 'Todo el universo de noticias', icon: LayoutGrid, color: 'text-blue-500 bg-blue-500/10' },
                                                { id: 'internacional', label: 'Global', desc: 'Cobertura internacional y exterior', icon: Globe, color: 'text-orange-500 bg-orange-500/10' },
                                                { id: 'nacional', label: 'Nacional', desc: 'Noticias de toda Argentina', icon: Flag, color: 'text-sky-500 bg-sky-500/10' },
                                                { id: 'provincial', label: 'Provincial', desc: 'Sucesos de Tierra del Fuego', icon: Map, color: 'text-emerald-500 bg-emerald-500/10' }
                                            ].map((item) => {
                                                const Icon = item.icon;
                                                const isSelected = activeCategory === item.id;
                                                return (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => {
                                                            setActiveCategory(item.id);
                                                            setIsCoverageDropdownOpen(false);
                                                        }}
                                                        className={`flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                                                            isSelected 
                                                                ? 'bg-blue-650 text-white shadow-md' 
                                                                : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-gray-300'
                                                        }`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/20 text-white' : item.color}`}>
                                                            <Icon className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-[11px] font-black uppercase tracking-wider leading-none">{item.label}</span>
                                                            <span className={`text-[9px] mt-1 leading-normal ${isSelected ? 'text-blue-100' : 'text-slate-450 dark:text-gray-500'}`}>{item.desc}</span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    )}''')

if old_fixed_tabs in content_lf:
    print("Fixed tabs block found!")
    content_lf = content_lf.replace(old_fixed_tabs, new_dropdown_tabs)
else:
    print("Fixed tabs block NOT found!")

# 4. List View Render
old_list_render = to_bytes('''                                        // VIEW: LIST
                                        if (viewMode === 'list') return (
                                            <motion.div 
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                                key={article.id} 
                                                onClick={() => setSelectedArticle(article)}
                                                className={`group flex flex-col sm:flex-row sm:items-center px-6 ${density === 'compact' ? 'py-3' : 'py-5'} border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.03] cursor-pointer transition-all border-l-4 border-l-transparent hover:border-l-blue-600 relative overflow-hidden`}
                                            >
                                                {/* Reading Indicator Placeholder */}
                                                <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-600/0 group-hover:bg-blue-600/20 transition-all"></div>
                                                
                                                <div className={`hidden sm:flex ${density === 'compact' ? 'w-10' : 'w-12'} shrink-0 items-center justify-center`}>
                                                    <div className={`${density === 'compact' ? 'w-8 h-8 rounded-lg' : 'w-10 h-10 rounded-xl'} flex items-center justify-center transition-all ${isVid ? 'bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white' : 'bg-blue-500/10 text-blue-500 group-hover:bg-blue-600 group-hover:text-white'}`}>
                                                        {isVid ? <PlayCircle className={density === 'compact' ? 'w-4 h-4' : 'w-5 h-5'} /> : <FileText className={density === 'compact' ? 'w-4 h-4' : 'w-5 h-5'} />}
                                                    </div>
                                                </div>
                                                <div className={`flex-1 min-w-0 px-4 ${density === 'compact' ? 'space-y-0.5' : 'space-y-1.5'}`}>
                                                    <h3 className={`${density === 'compact' ? 'text-[13px]' : 'text-[15px]'} font-bold text-slate-850 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug transition-colors font-display`}>
                                                        {article.title}
                                                    </h3>
                                                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                                                       <span className="text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded">{sourceName}</span>
                                                       <span className="text-slate-400 dark:text-gray-500 font-mono">{getRelativeTime(article.pubDate)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mt-3 sm:mt-0 shrink-0 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                    <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + article.link)}`, '_blank'); }} className={`${density === 'compact' ? 'p-2' : 'p-2.5'} bg-slate-100 dark:bg-white/5 hover:bg-green-500/20 text-slate-500 dark:text-gray-400 hover:text-green-500 rounded-xl transition-all`}><MessageCircle className="w-4 h-4" /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); window.open(`https://t.me/share/url?url=${encodeURIComponent(article.link)}&text=${encodeURIComponent(article.title)}`, '_blank'); }} className={`${density === 'compact' ? 'p-2' : 'p-2.5'} bg-slate-100 dark:bg-white/5 hover:bg-blue-500/20 text-slate-500 dark:text-gray-400 hover:text-blue-400 rounded-xl transition-all`}><Send className="w-4 h-4" /></button>
                                                </div>
                                            </motion.div>
                                         );''')

new_list_render = to_bytes('''                                        // VIEW: LIST
                                        if (viewMode === 'list') {
                                            if (density === 'compact') {
                                                return (
                                                    <motion.div 
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 10 }}
                                                        key={article.id} 
                                                        onClick={() => setSelectedArticle(article)}
                                                        className="group flex items-center justify-between px-6 py-2.5 border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.03] cursor-pointer transition-all border-l-4 border-l-transparent hover:border-l-blue-600 relative overflow-hidden"
                                                    >
                                                        <div className="flex-1 min-w-0 pr-4">
                                                            <h3 className="text-[12.5px] font-bold text-slate-800 dark:text-gray-150 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug transition-colors font-display">
                                                                {article.title}
                                                            </h3>
                                                        </div>
                                                        <div className="shrink-0 flex items-center gap-3">
                                                            <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded">{sourceName}</span>
                                                        </div>
                                                    </motion.div>
                                                );
                                            } else {
                                                return (
                                                    <motion.div 
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 10 }}
                                                        key={article.id} 
                                                        onClick={() => setSelectedArticle(article)}
                                                        className="group flex flex-col sm:flex-row gap-5 px-6 py-5 border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.03] cursor-pointer transition-all border-l-4 border-l-transparent hover:border-l-blue-600 relative overflow-hidden"
                                                    >
                                                        {article.thumbnail && (
                                                            <div className="w-full sm:w-28 h-20 shrink-0 overflow-hidden rounded-xl relative shadow-md">
                                                                <img src={article.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                                                               <span className="text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded">{sourceName}</span>
                                                               <span className="text-slate-400 dark:text-gray-500 font-mono">{getRelativeTime(article.pubDate)}</span>
                                                            </div>
                                                            <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug font-display">
                                                                {article.title}
                                                            </h3>
                                                            {article.description && (
                                                                <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                                                    {stripHtml(article.description)}
                                                                </p>
                                                            )}
                                                            <p className="text-[11px] text-slate-400 dark:text-gray-500 line-clamp-2 italic border-t border-slate-100 dark:border-white/5 pt-1.5 mt-1">
                                                                Desarrollo: {stripHtml(article.description || 'Esta nota está disponible de forma completa en el portal de origen.')}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-3 sm:mt-0 shrink-0 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                            <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + article.link)}`, '_blank'); }} className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-green-500/20 text-slate-500 dark:text-gray-400 hover:text-green-500 rounded-xl transition-all"><MessageCircle className="w-4 h-4" /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); window.open(`https://t.me/share/url?url=${encodeURIComponent(article.link)}&text=${encodeURIComponent(article.title)}`, '_blank'); }} className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-blue-500/20 text-slate-500 dark:text-gray-400 hover:text-blue-400 rounded-xl transition-all"><Send className="w-4 h-4" /></button>
                                                        </div>
                                                    </motion.div>
                                                );
                                            }
                                        }''')

# Flexibly resolve class names inside list view
list_target = b"if (viewMode === 'list') return ("
if list_target in content_lf:
    print("Found direct list_target!")
    # Find the end of the return statement block (the first absolute ending `);` of the list block)
    list_start_idx = content_lf.find(list_target)
    list_end_idx = content_lf.find(b'''                                         );''', list_start_idx)
    if list_end_idx != -1:
        # replace block
        content_lf = content_lf[:list_start_idx] + new_list_render + content_lf[list_end_idx + len(b'''                                         );'''):]
        print("Replaced list render using indices!")

# 5. Grid View Render
old_grid_render = to_bytes('''                                        // VIEW: GRID
                                        if (viewMode === 'grid') return (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                whileHover={{ y: -5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                key={article.id} 
                                                onClick={() => setSelectedArticle(article)}
                                                className={`group relative w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-pointer flex flex-col`}
                                            >
                                                {article.thumbnail && (
                                                    <div className="aspect-[16/10] overflow-hidden relative">
                                                        <img src={article.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent opacity-60"></div>
                                                        {isVid && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className={`${density === 'compact' ? 'w-10 h-10' : 'w-14 h-14'} rounded-full bg-red-600/20 backdrop-blur-xl flex items-center justify-center border border-red-500/30 group-hover:scale-110 transition-transform`}>
                                                                    <PlayCircle className={density === 'compact' ? 'w-6 h-6' : 'w-8 h-8'} text-white />
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="absolute top-4 left-4">
                                                            <span className="text-[9px] font-black text-white uppercase tracking-widest bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">{sourceName}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {!article.thumbnail && (
                                                    <div className={`aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-black flex items-center justify-center`}>
                                                        <FileText className={`${density === 'compact' ? 'w-8 h-8' : 'w-10 h-10'} text-slate-300 dark:text-slate-800`} />
                                                    </div>
                                                )}
                                                <div className={`${density === 'compact' ? 'p-4' : 'p-6'} flex flex-col flex-1 gap-3`}>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-widest font-mono">{getRelativeTime(article.pubDate)}</span>
                                                        <Bookmark className="w-3.5 h-3.5 text-slate-300 dark:text-gray-700 hover:text-blue-500 transition-colors" />
                                                    </div>
                                                    <h3 className={`${density === 'compact' ? 'text-[13px]' : 'text-[15px]'} font-bold text-slate-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-tight line-clamp-3 transition-colors font-display`}>
                                                        {article.title}
                                                    </h3>
                                                </div>
                                                <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 bg-white dark:bg-black/80 backdrop-blur-xl p-2 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl">
                                                    <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + article.link)}`, '_blank'); }} className="p-2 hover:bg-green-500/20 text-slate-600 dark:text-gray-400 hover:text-green-500 rounded-lg transition-all"><MessageCircle className="w-4 h-4" /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); window.open(`https://t.me/share/url?url=${encodeURIComponent(article.link)}&text=${encodeURIComponent(article.title)}`, '_blank'); }} className="p-2 hover:bg-blue-500/20 text-slate-600 dark:text-gray-400 hover:text-blue-450 rounded-lg transition-all"><Send className="w-4 h-4" /></button>
                                                </div>
                                            </motion.div>
                                        );''')

new_grid_render = to_bytes('''                                        // VIEW: GRID
                                        if (viewMode === 'grid') {
                                            if (density === 'compact') {
                                                return (
                                                    <motion.div 
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        key={article.id} 
                                                        onClick={() => setSelectedArticle(article)}
                                                        className="group relative w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm border border-slate-200 dark:border-white/5 rounded-2xl hover:border-blue-500/50 p-4 transition-all cursor-pointer flex flex-col justify-between min-h-[100px]"
                                                    >
                                                        <h3 className="text-[12.5px] font-bold text-slate-800 dark:text-gray-150 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug line-clamp-3 transition-colors font-display">
                                                            {article.title}
                                                        </h3>
                                                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-white/5">
                                                            <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-500/10 px-1.5 py-0.5 rounded">{sourceName}</span>
                                                            <span className="text-[9px] text-slate-400 dark:text-gray-500 font-mono">{getRelativeTime(article.pubDate)}</span>
                                                        </div>
                                                    </motion.div>
                                                );
                                            } else {
                                                return (
                                                    <motion.div 
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        whileHover={{ y: -4 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        key={article.id} 
                                                        onClick={() => setSelectedArticle(article)}
                                                        className="group relative w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer flex flex-col"
                                                    >
                                                        {article.thumbnail ? (
                                                            <div className="aspect-[16/10] overflow-hidden relative">
                                                                <img src={article.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent opacity-60"></div>
                                                                <div className="absolute top-4 left-4">
                                                                    <span className="text-[9px] font-black text-white uppercase tracking-widest bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">{sourceName}</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-black flex items-center justify-center">
                                                                <FileText className="w-10 h-10 text-slate-300 dark:text-slate-800" />
                                                            </div>
                                                        )}
                                                        <div className="p-5 flex flex-col flex-1 gap-2.5">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[9px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-widest font-mono">{getRelativeTime(article.pubDate)}</span>
                                                                <Bookmark className="w-3.5 h-3.5 text-slate-300 dark:text-gray-700 hover:text-blue-500 transition-colors" />
                                                            </div>
                                                            <h3 className="text-sm font-bold text-slate-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug line-clamp-2 transition-colors font-display">
                                                                {article.title}
                                                            </h3>
                                                            {article.description && (
                                                                <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                                                    {stripHtml(article.description)}
                                                                </p>
                                                            )}
                                                            <p className="text-[10px] text-slate-400 dark:text-gray-550 line-clamp-2 italic border-t border-slate-100 dark:border-white/5 pt-2 mt-1">
                                                                Desarrollo: {stripHtml(article.description || 'Consulte el informe completo en el enlace del portal original.')}
                                                            </p>
                                                        </div>
                                                        <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 bg-white dark:bg-black/80 backdrop-blur-xl p-2 rounded-xl border border-slate-200 dark:border-white/10 shadow-xl">
                                                            <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + article.link)}`, '_blank'); }} className="p-2 hover:bg-green-500/20 text-slate-600 dark:text-gray-400 hover:text-green-500 rounded-lg transition-all"><MessageCircle className="w-4 h-4" /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); window.open(`https://t.me/share/url?url=${encodeURIComponent(article.link)}&text=${encodeURIComponent(article.title)}`, '_blank'); }} className="p-2 hover:bg-blue-500/20 text-slate-600 dark:text-gray-400 hover:text-blue-400 rounded-lg transition-all"><Send className="w-4 h-4" /></button>
                                                        </div>
                                                    </motion.div>
                                                );
                                            }
                                        }''')

grid_target = b"if (viewMode === 'grid') return ("
if grid_target in content_lf:
    print("Found direct grid_target!")
    grid_start_idx = content_lf.find(grid_target)
    grid_end_idx = content_lf.find(b'''                                        );''', grid_start_idx)
    if grid_end_idx != -1:
        content_lf = content_lf[:grid_start_idx] + new_grid_render + content_lf[grid_end_idx + len(b'''                                        );'''):]
        print("Replaced grid render using indices!")

# 6. Magazine View Render
old_magazine_render = to_bytes('''                                        // VIEW: MAGAZINE
                                        if (viewMode === 'magazine') return (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 30 }}
                                                key={article.id} 
                                                onClick={() => setSelectedArticle(article)}
                                                className="group flex flex-col lg:flex-row gap-8 md:gap-12 p-6 md:p-10 border-b border-slate-200 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-all cursor-pointer relative overflow-hidden"
                                            >
                                                <div className="w-full lg:w-[450px] aspect-[16/10] lg:h-[280px] shrink-0 overflow-hidden rounded-[2.5rem] relative shadow-2xl">
                                                    <img src={article.thumbnail || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=600'} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                                    {isVid && (
                                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                                                            <PlayCircle className="w-10 h-10 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col flex-1 justify-center gap-6">
                                                    <div className="flex items-center gap-4">
                                                       <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.25em] font-mono">{sourceName}</span>
                                                       <div className="w-1.5 h-1.5 rounded-full bg-slate-350 dark:bg-slate-700"></div>
                                                       <span className="text-[11px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest font-mono">{getRelativeTime(article.pubDate)}</span>
                                                    </div>
                                                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-[1.05] tracking-tight transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 font-display">
                                                        {article.title}
                                                    </h3>
                                                    <p className="text-[17px] text-slate-650 dark:text-gray-405 line-clamp-3 leading-relaxed font-medium max-w-3xl">
                                                        {stripHtml(article.description || '').slice(0, 300)}...
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className="text-[12px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest border-b-2 border-blue-600/20 group-hover:border-blue-600 transition-all pb-1">Seguir leyendo</span>
                                                        <div className="flex items-center gap-3 ml-auto opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                            <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + article.link)}`, '_blank'); }} className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-green-500/20 text-slate-600 dark:text-gray-400 hover:text-green-500 rounded-2xl transition-all border border-slate-200 dark:border-white/5" title="Compartir en WhatsApp"><MessageCircle className="w-5 h-5" /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); window.open(`https://t.me/share/url?url=${encodeURIComponent(article.link)}&text=${encodeURIComponent(article.title)}`, '_blank'); }} className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-blue-500/20 text-slate-600 dark:text-gray-400 hover:text-blue-400 rounded-2xl transition-all border border-slate-200 dark:border-white/5" title="Compartir en Telegram"><Send className="w-5 h-5" /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );''')

new_magazine_render = to_bytes('''                                        // VIEW: MAGAZINE
                                        if (viewMode === 'magazine') {
                                            if (density === 'compact') {
                                                return (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 15 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 15 }}
                                                        key={article.id} 
                                                        onClick={() => setSelectedArticle(article)}
                                                        className="group flex flex-col sm:flex-row gap-5 p-5 border-b border-slate-200 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-all cursor-pointer relative overflow-hidden"
                                                    >
                                                        {article.thumbnail && (
                                                            <div className="w-full sm:w-40 aspect-[16/10] shrink-0 overflow-hidden rounded-2xl relative shadow-md">
                                                                <img src={article.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col justify-center gap-2 flex-1">
                                                            <div className="flex items-center gap-3">
                                                               <span className="text-[10px] font-black text-blue-650 dark:text-blue-400 uppercase tracking-wider bg-blue-500/5 px-2 py-0.5 rounded">{sourceName}</span>
                                                               <span className="text-[10px] text-slate-400 dark:text-gray-500 font-mono">{getRelativeTime(article.pubDate)}</span>
                                                            </div>
                                                            <h3 className="text-base font-bold text-slate-850 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-display">
                                                                {article.title}
                                                            </h3>
                                                        </div>
                                                    </motion.div>
                                                );
                                            } else {
                                                return (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 30 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 30 }}
                                                        key={article.id} 
                                                        onClick={() => setSelectedArticle(article)}
                                                        className="group flex flex-col lg:flex-row gap-8 md:gap-12 p-6 md:p-10 border-b border-slate-200 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-all cursor-pointer relative overflow-hidden"
                                                    >
                                                        <div className="w-full lg:w-[450px] aspect-[16/10] lg:h-[280px] shrink-0 overflow-hidden rounded-[2.5rem] relative shadow-2xl">
                                                            <img src={article.thumbnail || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=600'} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]" />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                                            {isVid && (
                                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                                                                    <PlayCircle className="w-10 h-10 text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col flex-1 justify-center gap-5">
                                                            <div className="flex items-center gap-4">
                                                               <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.25em] font-mono">{sourceName}</span>
                                                               <div className="w-1.5 h-1.5 rounded-full bg-slate-350 dark:bg-slate-700"></div>
                                                               <span className="text-[11px] font-bold text-slate-550 dark:text-gray-500 uppercase tracking-widest font-mono">{getRelativeTime(article.pubDate)}</span>
                                                            </div>
                                                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 font-display">
                                                                {article.title}
                                                            </h3>
                                                            {article.description && (
                                                                <div className="text-sm font-semibold text-slate-550 dark:text-gray-400 border-l-2 border-slate-300 dark:border-white/10 pl-3 italic">
                                                                    Subtítulo: {stripHtml(article.description).slice(0, 160)}...
                                                                </div>
                                                            )}
                                                            <p className="text-[15px] text-slate-650 dark:text-gray-300 leading-relaxed font-medium max-w-3xl">
                                                                Desarrollo: {stripHtml(article.description || '') || 'Esta noticia está disponible íntegramente a través de los canales de la agencia emisora. Haga clic en Seguir leyendo para visualizar el artículo completo en su portal original.'}
                                                            </p>
                                                            <div className="flex items-center gap-4 mt-2">
                                                                <span className="text-[12px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest border-b-2 border-blue-600/20 group-hover:border-blue-600 transition-all pb-1">Seguir leyendo</span>
                                                                <div className="flex items-center gap-3 ml-auto opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                                    <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + article.link)}`, '_blank'); }} className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-green-500/20 text-slate-600 dark:text-gray-400 hover:text-green-500 rounded-2xl transition-all border border-slate-200 dark:border-white/5" title="Compartir en WhatsApp"><MessageCircle className="w-5 h-5" /></button>
                                                                    <button onClick={(e) => { e.stopPropagation(); window.open(`https://t.me/share/url?url=${encodeURIComponent(article.link)}&text=${encodeURIComponent(article.title)}`, '_blank'); }} className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-blue-500/20 text-slate-600 dark:text-gray-400 hover:text-blue-405 rounded-2xl transition-all border border-slate-200 dark:border-white/5" title="Compartir en Telegram"><Send className="w-5 h-5" /></button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            }
                                        }''')

magazine_target = b"if (viewMode === 'magazine') return ("
if magazine_target in content_lf:
    print("Found direct magazine_target!")
    mag_start_idx = content_lf.find(magazine_target)
    mag_end_idx = content_lf.find(b'''                                        );''', mag_start_idx)
    if mag_end_idx != -1:
        content_lf = content_lf[:mag_start_idx] + new_magazine_render + content_lf[mag_end_idx + len(b'''                                        );'''):]
        print("Replaced magazine render using indices!")

if uses_crlf:
    final_content = content_lf.replace(b'\n', b'\r\n')
else:
    final_content = content_lf

with open(file_path, 'wb') as f:
    f.write(final_content)

print("Modification complete!")
