from deep_translator import GoogleTranslator
from typing import Dict, List

SUPPORTED_LANGUAGES = [
    'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh-CN', 'zh-TW',
    'ar', 'hi', 'bn', 'pa', 'te', 'mr', 'ta', 'gu', 'kn', 'ml',
    'th', 'vi', 'id', 'ms', 'tl', 'tr', 'pl', 'uk', 'ro', 'nl', 'el',
    'cs', 'sv', 'da', 'fi', 'no', 'hu', 'iw', 'fa', 'ur', 'sw', 'af',
    'am', 'az', 'be', 'bg', 'ca', 'hr', 'et', 'ka', 'is', 'kk', 'ky',
    'lo', 'lv', 'lt', 'mk', 'mn', 'ne', 'ps', 'si', 'sk', 'sl', 'sq',
    'sr', 'uz', 'zu'
]

class TranslationService:
    def __init__(self):
        pass
    
    def translate_text(self, text: str, source_lang: str, target_lang: str) -> str:
        try:
            if source_lang == target_lang or not text:
                return text
            
            result = GoogleTranslator(source=source_lang, target=target_lang).translate(text)
            return result or text
        except Exception as e:
            print(f"Translation error: {e}")
            return text
    
    def translate_to_all_languages(self, text: str, source_lang: str = 'en') -> Dict[str, str]:
        translations = {source_lang: text}
        
        for lang in SUPPORTED_LANGUAGES:
            if lang != source_lang:
                try:
                    translated = self.translate_text(text, source_lang, lang)
                    translations[lang] = translated
                except Exception as e:
                    print(f"Error translating to {lang}: {e}")
                    translations[lang] = text
        
        return translations
    
    def translate_listing(self, title: str, short_desc: str, full_desc: str, 
                         source_lang: str = 'en') -> Dict[str, Dict]:
        result = {}
        
        for lang in SUPPORTED_LANGUAGES:
            try:
                translated_title = self.translate_text(title, source_lang, lang)[:30]
                translated_short = self.translate_text(short_desc, source_lang, lang)[:80]
                translated_full = self.translate_text(full_desc, source_lang, lang)[:4000]
                
                result[lang] = {
                    'title': translated_title,
                    'short_description': translated_short,
                    'full_description': translated_full
                }
            except Exception as e:
                print(f"Error translating listing to {lang}: {e}")
                result[lang] = {
                    'title': title[:30],
                    'short_description': short_desc[:80],
                    'full_description': full_desc[:4000]
                }
        
        return result
