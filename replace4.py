import re

def balance_divs(text, start_index):
    open_divs = 0
    pos = start_index
    while pos < len(text):
        next_open = text.find('<div', pos)
        next_close = text.find('</div', pos)
        
        if next_open == -1 and next_close == -1:
            break
            
        if next_open != -1 and (next_close == -1 or next_open < next_close):
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

with open('src/pages/DashboardAdmin.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

if 'DraggableModal' not in content:
    content = re.sub(r'(import React.*?\n)', r'\1import { DraggableModal } from ''../components/ui/DraggableModal'';\n', content)


def replace_modal(content, condition, open_var, onclose_code, title_code, width_class, header_class):
    pattern = condition + r' && \(\s*<div className="fixed inset-0'
    match = re.search(pattern, content)
    if not match:
        return content
    
    start_idx = match.start()
    div_start = content.find('<div className="fixed inset-0', start_idx)
    div_end = balance_divs(content, div_start)
    
    if div_end == -1:
        return content
        
    original_block = content[div_start:div_end]
    header_start = original_block.find('<div className="bg-slate-900')
    header_end = balance_divs(original_block, header_start)
    
    if header_start == -1 or header_end == -1:
        return content
        
    inner_content = original_block[header_end:original_block.rfind('</div>', 0, original_block.rfind('</div>'))]
    
    new_block = f'''<DraggableModal
          isOpen={{{open_var}}}
          onClose={{{onclose_code}}}
          title={{{title_code}}}
          width="{width_class}"
          headerClassName="{header_class}"
        >
          {inner_content.strip()}
        </DraggableModal>'''
        
    return content[:div_start] + new_block + content[div_end:]

content = replace_modal(content, 
    r'\{editingItem', 
    '!!editingItem', 
    '() => setEditingItem(null)', 
    '"Modifica Elemento"', 
    'max-w-md w-full', 
    'bg-slate-900 text-[#11BCEC]')

with open('src/pages/DashboardAdmin.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
