with open('src/components/Dashboard.tsx', 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f, 1):
        if 'activeTab ===' in line:
            print(f"{idx}: {line.strip()}")
