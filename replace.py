import re

with open('src/pages/MonitorYard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

p1_start = re.compile(
    r'\{isNewShipmentModalOpen && \(\s*<div className="fixed inset-0.*?<div className="bg-white.*?<div className="bg-gradient-to-r.*?<h3.*?>\s*(.*?)\s*</h3>\s*<button\s*onClick=\{([^}]+)\}.*?</button>\s*</div>',
    re.DOTALL
)
p2_start = re.compile(
    r'\{checkInBooking && \(\s*<div className="fixed inset-0.*?<div className="bg-white.*?<div className="bg-gradient-to-r.*?<h3.*?>\s*(.*?)\s*</h3>\s*<button\s*onClick=\{([^}]+)\}.*?</button>\s*</div>',
    re.DOTALL
)
p3_start = re.compile(
    r'\{activeBayDetail && \(\s*<div className="fixed inset-0.*?<div className="bg-white.*?<div className="bg-gradient-to-r.*?<h3.*?>\s*(.*?)\s*</h3>\s*<button\s*onClick=\{([^}]+)\}.*?</button>\s*</div>',
    re.DOTALL
)
p4_start = re.compile(
    r'\{isImportShipmentModalOpen && \(\s*<div className="fixed inset-0.*?<div className="bg-white.*?<div className="bg-gradient-to-r.*?<h3.*?>\s*(.*?)\s*</h3>\s*<button\s*onClick=\{([^}]+)\}.*?</button>\s*</div>',
    re.DOTALL
)
p5_start = re.compile(
    r'\{isQuickResolutionModalOpen && \(\s*<div className="fixed inset-0.*?<div className="bg-white.*?<div className="bg-gradient-to-r.*?<h3.*?>\s*(.*?)\s*</h3>\s*<button\s*onClick=\{([^}]+)\}.*?</button>\s*</div>',
    re.DOTALL
)
p6_start = re.compile(
    r'\{activeResolveAnomalyId && \(\s*<div className="fixed inset-0.*?<div className="bg-white.*?<div className="bg-gradient-to-r.*?<h3.*?>\s*(.*?)\s*</h3>\s*<button\s*onClick=\{([^}]+)\}.*?</button>\s*</div>',
    re.DOTALL
)

print(f"Match 1: {bool(p1_start.search(content))}")
print(f"Match 2: {bool(p2_start.search(content))}")
print(f"Match 3: {bool(p3_start.search(content))}")
print(f"Match 4: {bool(p4_start.search(content))}")
print(f"Match 5: {bool(p5_start.search(content))}")
print(f"Match 6: {bool(p6_start.search(content))}")
