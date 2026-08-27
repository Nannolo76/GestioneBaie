import re

with open('src/pages/DashboardAdmin.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r(title: 'Attenzione',\s*message: .*?,\s*confirmLabel: 'OK',\s*isDanger: true,)\s*onConfirm:,
    r\1 isAlert: true, onConfirm:,
    content
)

content = re.sub(
    r(title: 'Conferma Eliminazione',\s*message: .*?,\s*confirmLabel: 'Elimina',\s*isDanger: true,)\s*onConfirm:,
    r\1 isAlert: false, onConfirm:,
    content
)

with open('src/pages/DashboardAdmin.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed DashboardAdmin')
