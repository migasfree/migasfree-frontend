import os
import time
import polib
from deep_translator import GoogleTranslator

def translate_po(file_path, lang_code):
    print(f"Processing {file_path} into language: {lang_code}")
    po = polib.pofile(file_path)
    
    translator = GoogleTranslator(source='en', target=lang_code)
    
    translated_count = 0
    
    # Process both untranslated and fuzzy entries
    entries_to_translate = po.untranslated_entries() + po.fuzzy_entries()
    
    for entry in entries_to_translate:
        if not entry.msgid:
            continue
        try:
            translated = translator.translate(entry.msgid)
            if translated:
                entry.msgstr = translated
                
                # Remove fuzzy flag if it exists
                if 'fuzzy' in entry.flags:
                    entry.flags.remove('fuzzy')
                    
                translated_count += 1
                print(f"[{lang_code}] '{entry.msgid}' -> '{translated}'")
                time.sleep(0.5)
        except Exception as e:
            print(f"Error translating '{entry.msgid}': {e}")
            
    if translated_count > 0:
        po.save()
        print(f"Saved {translated_count} translations to {file_path}")
    else:
        print(f"No new translations needed for {file_path}")

def main():
    target_dir = os.path.join(os.getcwd(), "src", "i18n")
    
    lang_mapping = {
        'es_ES.po': 'es',
        'ca_ES.po': 'ca',
        'eu_ES.po': 'eu',
        'gl_ES.po': 'gl',
        'fr_FR.po': 'fr'
    }
    
    for filename, lang_code in lang_mapping.items():
        file_path = os.path.join(target_dir, filename)
        if os.path.exists(file_path):
            translate_po(file_path, lang_code)
        else:
            print(f"Warning: {file_path} does not exist.")

if __name__ == '__main__':
    main()
