import re

with open('src/components/admin/TabHubs.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# The file contains 3 sections that I need to extract.
# Section 1: from eturn ( to )} before Moduli
# Section 2: from {adminTab === 'modules' to )} before Uso Baie
# Section 3: from {adminTab === 'bayusages' to )} before the end

ret_idx = text.find('  return (\n')
if ret_idx == -1:
    print("Could not find return")
    exit(1)

prefix = text[:ret_idx]
jsx = text[ret_idx + 11:]

parts = jsx.split('{/* --- TAB: MODULI MAGAZZINO --- */}')
hubs_part = parts[0]
rest = parts[1]

parts2 = rest.split('{/* --- TAB: USO BAIE --- */}')
modules_part = parts2[0]
bayusages_part = parts2[1]

# Clean up Hubs
# Hubs part starts with <div... and ends with </div>\n      )}
hubs_part = hubs_part.strip()
if hubs_part.endswith(')}'):
    hubs_part = hubs_part[:-2].strip()

# Clean up Modules
modules_part = modules_part.strip()
if modules_part.startswith("{adminTab === 'modules' && ("):
    modules_part = modules_part[len("{adminTab === 'modules' && ("):].strip()
if modules_part.endswith(')}'):
    modules_part = modules_part[:-2].strip()

# Clean up Bay Usages
bayusages_part = bayusages_part.strip()
if bayusages_part.startswith("{adminTab === 'bayusages' && ("):
    bayusages_part = bayusages_part[len("{adminTab === 'bayusages' && ("):].strip()
if bayusages_part.endswith('};\n'):
    bayusages_part = bayusages_part[:-3].strip()
if bayusages_part.endswith(');'):
    bayusages_part = bayusages_part[:-2].strip()
if bayusages_part.endswith('}'):
    bayusages_part = bayusages_part[:-1].strip()
# Sometimes there's a trailing ) or } from the rogue closes
if bayusages_part.endswith(')'):
    bayusages_part = bayusages_part[:-1].strip()

new_jsx = f'''  return (
    <>
      {{adminTab === 'hubs' && (
        {hubs_part}
      )}}

      {{/* --- TAB: MODULI MAGAZZINO --- */}}
      {{adminTab === 'modules' && (
        {modules_part}
      )}}

      {{/* --- TAB: USO BAIE --- */}}
      {{adminTab === 'bayusages' && (
        {bayusages_part}
      )}}
    </>
  );
}};
'''

with open('src/components/admin/TabHubs.tsx', 'w', encoding='utf-8') as f:
    f.write(prefix + new_jsx)

print("Rewritten successfully")
