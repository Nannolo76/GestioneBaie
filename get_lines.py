import re

def get_line_num(text, index):
    return text.count('\n', 0, index) + 1

with open('src/pages/MonitorYard.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

def balance_divs(text, start_index):
    open_divs = 0
    i = start_index
    while i < len(text):
        if text[i:i+4] == '<div':
            open_divs += 1
        elif text[i:i+6] == '</div':
            open_divs -= 1
            if open_divs == 0:
                return i + 6
        i += 1
    return -1

patterns = [
    r'\{activeResolveAnomalyId &&',
    r'\{checkInBooking &&',
    r'\{activeBayDetail &&',
    r'\{isImportShipmentModalOpen &&',
    r'\{isQuickResolutionModalOpen &&'
]

for p in patterns:
    match = re.search(p, text)
    if match:
        start_idx = match.start()
        div_start = text.find('<div className="fixed', start_idx)
        if div_start != -1:
            end_idx = balance_divs(text, div_start)
            print(f"{p}: Start line {get_line_num(text, start_idx)}, End line {get_line_num(text, end_idx)}")
