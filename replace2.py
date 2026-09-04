import re

def balance_divs(text, start_index):
    open_divs = 0
    i = start_index
    while i < len(text):
        if text[i:i+4] == '<div':
            open_divs += 1
        elif text[i:i+6] == '</div>':
            open_divs -= 1
            if open_divs == 0:
                return i + 6
        i += 1
    return -1

with open('src/pages/MonitorYard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

if 'DraggableModal' not in content:
    content = re.sub(r'(import React.*?\n)', r'\1import { DraggableModal } from ''../components/ui/DraggableModal'';\n', content)

def replace_modal(content, condition, open_var, onclose_code, title_code, width_class, header_class):
    # Find start
    pattern = condition + r' && \(\s*<div className="fixed inset-0'
    match = re.search(pattern, content)
    if not match:
        return content
    
    start_idx = match.start()
    
    # Find the closing tag of the <div className="fixed inset-0...
    div_start = content.find('<div className="fixed inset-0', start_idx)
    div_end = balance_divs(content, div_start)
    
    if div_end == -1:
        return content
        
    original_block = content[div_start:div_end]
    
    # Extract the header closing tag position
    header_start = original_block.find('<div className="bg-gradient-to-r')
    header_end = balance_divs(original_block, header_start)
    
    if header_start == -1 or header_end == -1:
        return content
        
    # The content of the modal is everything after header_end and before the last two </div>
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

# 1. Modifica Spedizione
content = replace_modal(content, 
    r'\{isNewShipmentModalOpen', 
    'isNewShipmentModalOpen', 
    '() => { resetShipmentForm(); setIsNewShipmentModalOpen(false); }', 
    'shipmentFormId ? "Modifica Spedizione Manuale" : "Nuovo Viaggio / Inserimento Spedizioni"', 
    'max-w-5xl lg:max-w-6xl', 
    'bg-gradient-to-r from-orange-500 to-amber-600')

# 2. Check-in Note
content = replace_modal(content, 
    r'\{checkInBooking', 
    '!!checkInBooking', 
    '() => setCheckInBooking(null)', 
    '"Gestione Documenti / Check-in: " + checkInBooking.shipmentId', 
    'max-w-3xl', 
    'bg-gradient-to-r from-emerald-500 to-teal-600')

# 3. Dettaglio Baia
content = replace_modal(content, 
    r'\{activeBayDetail', 
    '!!activeBayDetail', 
    '() => setActiveBayDetail(null)', 
    '"Gestione Baia: " + activeBayDetail.bay.name', 
    'max-w-4xl', 
    'bg-gradient-to-r from-slate-700 to-slate-900')

# 4. Importazione
content = replace_modal(content, 
    r'\{isImportShipmentModalOpen', 
    'isImportShipmentModalOpen', 
    '() => setIsImportShipmentModalOpen(false)', 
    '"Importazione Massiva Spedizioni"', 
    'max-w-3xl', 
    'bg-gradient-to-r from-blue-500 to-indigo-600')

# 5. Risoluzione Rapida Routing
content = replace_modal(content, 
    r'\{isQuickResolutionModalOpen', 
    'isQuickResolutionModalOpen', 
    '() => setIsQuickResolutionModalOpen(false)', 
    '"Risoluzione Rapida Routing (Multipla)"', 
    'max-w-4xl', 
    'bg-gradient-to-r from-purple-500 to-pink-600')

# 6. Risoluzione Anomalia
content = replace_modal(content, 
    r'\{activeResolveAnomalyId', 
    '!!activeResolveAnomalyId', 
    '() => setActiveResolveAnomalyId(null)', 
    '"Risoluzione Anomalia"', 
    'max-w-2xl', 
    'bg-gradient-to-r from-red-500 to-rose-600')

with open('src/pages/MonitorYard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
