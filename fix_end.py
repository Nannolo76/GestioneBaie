with open('src/components/admin/TabHubs.tsx', 'r') as f:
    text = f.read()

text = text.replace('        </div>\n      \n  );\n};', '        </div>\n      )}\n    </>\n  );\n};')

# Also fix the second replace if I broke it
text = text.replace('      )}\n\n      {/* --- TAB: MODULI', '      )}\n\n      {/* --- TAB: MODULI') # wait, that one probably matched.

with open('src/components/admin/TabHubs.tsx', 'w') as f:
    f.write(text)
