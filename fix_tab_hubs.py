import re

with open('src/components/admin/TabHubs.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# First, find the return (
ret_idx = text.find('  return (\n')
if ret_idx != -1:
    # Everything before return is good.
    prefix = text[:ret_idx]
    # Everything after return is the JSX
    jsx = text[ret_idx + 11:]
    
    # Remove all the rogue )}, <>, </>, {adminTab === 'hubs' && (, etc. to make it clean
    jsx = jsx.replace('    <>\n      {adminTab === \'hubs\' && (\n', '')
    jsx = jsx.replace('      {adminTab === \'hubs\' && (\n', '')
    
    # Remove closing tags for the components
    jsx = jsx.replace('      )}\n    </>\n  );\n};', '')
    jsx = jsx.replace('      )}\n  );\n};', '')
    jsx = jsx.replace('        </div>\n      \n  );\n};', '')
    jsx = jsx.replace('        </div>\n      )}\n    </>\n  );\n};', '')

    # Now let's rebuild the JSX cleanly
    # We have 3 main <div> blocks: Hubs, Modules, Bay Usages
    # Let's split by the comment markers
    parts = jsx.split('{/* --- TAB: MODULI MAGAZZINO --- */}')
    if len(parts) == 2:
        hubs_part = parts[0]
        rest = parts[1]
        
        parts2 = rest.split('{/* --- TAB: USO BAIE --- */}')
        if len(parts2) == 2:
            modules_part = parts2[0]
            bayusages_part = parts2[1]
            
            # Clean up ends of each part
            hubs_part = re.sub(r'\s*}\)\s*$', '', hubs_part.strip())
            hubs_part = re.sub(r'\s*</div>\s*</div>\s*$', '</div></div>', hubs_part.strip())
            
            modules_part = modules_part.replace('{adminTab === \'modules\' && (', '').strip()
            modules_part = re.sub(r'\s*}\)\s*$', '', modules_part.strip())
            modules_part = re.sub(r'\s*</div>\s*</div>\s*$', '</div></div>', modules_part.strip())

            bayusages_part = bayusages_part.replace('{adminTab === \'bayusages\' && (', '').strip()
            bayusages_part = re.sub(r'\s*}\)\s*$', '', bayusages_part.strip())
            bayusages_part = re.sub(r'\s*</div>\s*</div>\s*$', '</div></div>', bayusages_part.strip())
            bayusages_part = re.sub(r'\s*\);\s*};\s*$', '', bayusages_part.strip())

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
            print("Successfully rewritten TabHubs.tsx!")
        else:
            print("Could not split Bay Usages")
    else:
        print("Could not split Modules")
else:
    print("Could not find return")
