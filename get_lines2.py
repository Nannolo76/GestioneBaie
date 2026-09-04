import re

def balance_divs(text, start_index):
    open_divs = 0
    # Use regex to find all <div and </div tags
    pos = start_index
    while pos < len(text):
        next_open = text.find('<div', pos)
        next_close = text.find('</div', pos)
        
        if next_open == -1 and next_close == -1:
            break
            
        if next_open != -1 and (next_close == -1 or next_open < next_close):
            # Check if self-closing
            end_bracket = text.find('>', next_open)
            if end_bracket != -1 and text[end_bracket-1] != '/':
                open_divs += 1
            pos = next_open + 4
        else:
            open_divs -= 1
            if open_divs == 0:
                return text.find('>', next_close) + 1
            pos = next_close + 5
    return -1

def get_line_num(text, index):
    return text.count('\n', 0, index) + 1

with open('src/pages/MonitorYard.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

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
