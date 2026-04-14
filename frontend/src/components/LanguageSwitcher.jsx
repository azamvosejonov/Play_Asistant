import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'uz', name: "O'zbekcha", flag: '🇺🇿' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('language', code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all"
      >
        <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        <span className="text-xl sm:text-2xl">{currentLanguage.flag}</span>
        <span className="hidden sm:inline font-medium text-gray-700">{currentLanguage.name}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 sm:w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-96 overflow-y-auto">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-all ${
                  i18n.language === lang.code ? 'bg-primary-100 border-l-4 border-primary-600' : ''
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className={`font-medium ${
                  i18n.language === lang.code ? 'text-primary-700' : 'text-gray-700'
                }`}>
                  {lang.name}
                </span>
                {i18n.language === lang.code && (
                  <span className="ml-auto text-primary-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
