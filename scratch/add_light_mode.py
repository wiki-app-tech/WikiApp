import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replacements for backgrounds
    content = re.sub(r'bg-\[\#070707\]', r'bg-slate-50 dark:bg-[#070707]', content)
    content = re.sub(r'bg-\[\#0c0c0c\]', r'bg-white dark:bg-[#0c0c0c]', content)
    content = re.sub(r'bg-\[\#111\]', r'bg-white dark:bg-[#111]', content)
    content = re.sub(r'bg-\[\#0e0e0e\]', r'bg-white dark:bg-[#0e0e0e]', content)
    content = re.sub(r'bg-\[\#121212\]', r'bg-white dark:bg-[#121212]', content)
    content = re.sub(r'bg-\[\#161616\]', r'bg-slate-100 dark:bg-[#161616]', content)
    content = re.sub(r'bg-\[\#1a1a1a\]', r'bg-slate-100 dark:bg-[#1a1a1a]', content)
    content = re.sub(r'bg-\[\#222\]', r'bg-slate-200 dark:bg-[#222]', content)
    content = re.sub(r'bg-\[\#0a0a0a\]', r'bg-slate-50 dark:bg-[#0a0a0a]', content)
    content = re.sub(r'bg-black/40', r'bg-slate-100 dark:bg-black/40', content)
    content = re.sub(r'bg-black/50', r'bg-slate-100/80 dark:bg-black/50', content)
    content = re.sub(r'bg-white/\[0\.02\]', r'bg-white dark:bg-white/[0.02]', content)
    content = re.sub(r'bg-white/\[0\.03\]', r'bg-slate-50 dark:bg-white/[0.03]', content)
    content = re.sub(r'bg-white/\[0\.04\]', r'bg-slate-100 dark:bg-white/[0.04]', content)
    content = re.sub(r'bg-white/5', r'bg-slate-100 dark:bg-white/5', content)
    content = re.sub(r'bg-white/10', r'bg-slate-200 dark:bg-white/10', content)

    # Text colors
    content = re.sub(r'text-\[\#e0e0e0\]', r'text-slate-800 dark:text-[#e0e0e0]', content)
    content = re.sub(r'text-white', r'text-slate-900 dark:text-white', content)
    content = re.sub(r'text-gray-200', r'text-slate-800 dark:text-gray-200', content)
    content = re.sub(r'text-gray-300', r'text-slate-700 dark:text-gray-300', content)
    content = re.sub(r'text-gray-400', r'text-slate-600 dark:text-gray-400', content)
    content = re.sub(r'text-gray-500', r'text-slate-500 dark:text-gray-500', content)

    # Border colors
    content = re.sub(r'border-\[\#1a1a1a\]', r'border-slate-200 dark:border-[#1a1a1a]', content)
    content = re.sub(r'border-\[\#1f1f1f\]', r'border-slate-200 dark:border-[#1f1f1f]', content)
    content = re.sub(r'border-\[\#222\]', r'border-slate-300 dark:border-[#222]', content)
    content = re.sub(r'border-\[\#333\]', r'border-slate-300 dark:border-[#333]', content)
    content = re.sub(r'border-white/5', r'border-slate-200 dark:border-white/5', content)
    content = re.sub(r'border-white/10', r'border-slate-300 dark:border-white/10', content)

    # Deduplicate dark classes that might have been created
    content = re.sub(r'dark:bg-\[\#070707\] dark:bg-\[\#070707\]', r'dark:bg-[#070707]', content)
    content = re.sub(r'dark:text-slate-900 dark:text-white', r'dark:text-white', content) # edge case

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

process_file('src/components/Dashboard.tsx')
process_file('src/components/WeatherDashboard.tsx')
process_file('src/components/RadioDashboard.tsx')
process_file('src/components/SecurityHeatMap.tsx')
process_file('src/components/WeatherAlertMap.tsx')
