file_path = r"c:\Users\54290\Documents\Actigravity\WikiApp\src\components\Dashboard.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

start_line = 1954  # 0-indexed is line 1955
end_line = 1972    # 0-indexed is line 1973

print("Verifying button target block:")
for idx in range(start_line, end_line):
    print(f"{idx+1}: {repr(lines[idx])}")

replacement = [
    '                                                <button \n',
    '                                                    onClick={() => { \n',
    "                                                        setCarouselSlide(prev => prev === 'ships' ? 'flights' : 'ships'); \n",
    '                                                        setIsAutoCycle(false); \n',
    '                                                    }} \n',
    '                                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-[#1a1a1a] transition-all border border-slate-200 dark:border-white/10 cursor-pointer" \n',
    '                                                > \n',
    '                                                    <ChevronRight className="w-3.5 h-3.5 text-slate-655 dark:text-gray-400 transform rotate-180" /> \n',
    '                                                </button> \n',
    '                                                <button \n',
    '                                                    onClick={() => { \n',
    "                                                        setCarouselSlide(prev => prev === 'ships' ? 'flights' : 'ships'); \n",
    '                                                        setIsAutoCycle(false); \n',
    '                                                    }} \n',
    '                                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-[#1a1a1a] transition-all border border-slate-200 dark:border-white/10 cursor-pointer" \n',
    '                                                > \n',
    '                                                    <ChevronRight className="w-3.5 h-3.5 text-slate-655 dark:text-gray-400" /> \n',
    '                                                </button>\n'
]

lines[start_line:end_line] = replacement

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(lines)

print("Success: Navigation buttons replaced using exact line slicing.")
