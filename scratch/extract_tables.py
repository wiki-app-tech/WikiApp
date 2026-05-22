import re
from html.parser import HTMLParser

with open('scratch/raw.html', 'r', encoding='utf-8') as f:
    html = f.read()

class TableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_table = False
        self.in_tr = False
        self.in_td = False
        self.in_th = False
        self.tables = []
        self.current_table = []
        self.current_row = []
        self.current_cell = ""

    def handle_starttag(self, tag, attrs):
        if tag == 'table':
            self.in_table = True
            self.current_table = []
        elif tag == 'tr' and self.in_table:
            self.in_tr = True
            self.current_row = []
        elif tag in ['td', 'th'] and self.in_tr:
            self.in_td = tag == 'td'
            self.in_th = tag == 'th'
            self.current_cell = ""

    def handle_endtag(self, tag):
        if tag == 'table':
            self.in_table = False
            self.tables.append(self.current_table)
        elif tag == 'tr' and self.in_table:
            self.in_tr = False
            self.current_table.append(self.current_row)
        elif tag in ['td', 'th'] and self.in_tr:
            self.in_td = False
            self.in_th = False
            self.current_row.append(self.current_cell.strip())

    def handle_data(self, data):
        if (self.in_td or self.in_th) and self.in_tr:
            self.current_cell += data

parser = TableParser()
parser.feed(html)

print(f"Parsed {len(parser.tables)} tables:")
for i, table in enumerate(parser.tables):
    print(f"\nTABLE {i+1}:")
    for r, row in enumerate(table):
        print(f"  Row {r+1}: {row}")
