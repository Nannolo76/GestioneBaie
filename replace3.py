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

with open('src/pages/MonitorYard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

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
    header_start = original_block.find('<div className="bg-gradient-to-r')
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
    r'\{activeResolveAnomalyId', 
    '!!activeResolveAnomalyId', 
    '() => setActiveResolveAnomalyId(null)', 
    '"Risoluzione Anomalia"', 
    'max-w-2xl', 
    'bg-gradient-to-r from-red-500 to-rose-600')

content = replace_modal(content, 
    r'\{checkInBooking', 
    '!!checkInBooking', 
    '() => setCheckInBooking(null)', 
    '"Gestione Documenti / Check-in: " + checkInBooking.shipmentId', 
    'max-w-3xl', 
    'bg-gradient-to-r from-emerald-500 to-teal-600')

content = replace_modal(content, 
    r'\{activeBayDetail', 
    '!!activeBayDetail', 
    '() => setActiveBayDetail(null)', 
    '"Gestione Baia: " + activeBayDetail.bay.name', 
    'max-w-4xl lg:max-w-6xl', 
    'bg-gradient-to-r from-slate-700 to-slate-900')

content = replace_modal(content, 
    r'\{isImportShipmentModalOpen', 
    'isImportShipmentModalOpen', 
    '() => setIsImportShipmentModalOpen(false)', 
    '"Importazione Massiva Spedizioni"', 
    'max-w-3xl', 
    'bg-gradient-to-r from-blue-500 to-indigo-600')

content = replace_modal(content, 
    r'\{isQuickResolutionModalOpen', 
    'isQuickResolutionModalOpen', 
    '() => setIsQuickResolutionModalOpen(false)', 
    '"Risoluzione Rapida Routing (Multipla)"', 
    'max-w-4xl lg:max-w-6xl', 
    'bg-gradient-to-r from-purple-500 to-pink-600')

with open('src/pages/MonitorYard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
