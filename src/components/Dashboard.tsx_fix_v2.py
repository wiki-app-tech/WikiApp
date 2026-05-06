
path = 'src/components/Dashboard.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Line 509 is at index 508
# We want it to be '                                         );\n'
lines[508] = '                                         );\n'

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
