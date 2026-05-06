
import sys

path = 'src/components/Dashboard.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Try to find the problematic area and fix it
# We want to find </motion.div> followed by two ); and replace it with one );
import re
# Look for </motion.div> followed by any whitespace, then ); then any whitespace, then );
new_content = re.sub(r'</motion\.div>\s*\);\s*\);', '</motion.div>\n                                         );', content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)
