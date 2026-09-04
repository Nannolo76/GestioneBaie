def check_brackets(text, section_name):
    open_braces = text.count('{')
    close_braces = text.count('}')
    open_parens = text.count('(')
    close_parens = text.count(')')
    open_angles = text.count('<')
    close_angles = text.count('>')
    
    print(f"[{section_name}]")
    print(f"Braces: {open_braces} - {close_braces} (diff {open_braces - close_braces})")
    print(f"Parens: {open_parens} - {close_parens} (diff {open_parens - close_parens})")
    print(f"Angles: {open_angles} - {close_angles} (diff {open_angles - close_angles})")
    print()

with open('src/components/admin/TabHubs.tsx', 'r') as f:
    text = f.read()

ret = text.find('  return (\n')
prefix = text[:ret]
jsx = text[ret:]

parts = jsx.split('{/* --- TAB: MODULI MAGAZZINO --- */}')
hubs = parts[0]
rest = parts[1] if len(parts) > 1 else ''

parts2 = rest.split('{/* --- TAB: USO BAIE --- */}')
mods = parts2[0] if len(parts2) > 0 else ''
bayes = parts2[1] if len(parts2) > 1 else ''

check_brackets(prefix, "PREFIX (Before Return)")
check_brackets(hubs, "HUBS")
check_brackets(mods, "MODULES")
check_brackets(bayes, "BAY USAGES")
