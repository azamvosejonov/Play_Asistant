import { useState } from 'react';
import { Globe, Check, Edit2, X, Loader } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'uz', name: 'O\'zbekcha', flag: '🇺🇿' },
];

export default function TranslationManager({ translations, onUpdate, onClose }) {
  const [editingLang, setEditingLang] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [filter, setFilter] = useState('');

  const filteredLanguages = LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(filter.toLowerCase()) ||
    lang.code.toLowerCase().includes(filter.toLowerCase())
  );

  const handleEdit = (langCode) => {
    setEditingLang(langCode);
    setEditedData(translations[langCode] || {});
  };

  const handleSave = (langCode) => {
    onUpdate(langCode, editedData);
    setEditingLang(null);
  };

  const handleCancel = () => {
    setEditingLang(null);
    setEditedData({});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl h-[95vh] sm:h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
              <Globe className="w-6 h-6 text-primary-600" />
              Tarjimalarni Boshqarish
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {Object.keys(translations || {}).length} ta til tarjimasi
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 sm:p-6 border-b">
          <input
            type="text"
            placeholder="Tilni qidirish..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Translations List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLanguages.map((lang) => {
              const translation = translations?.[lang.code];
              const isEditing = editingLang === lang.code;

              return (
                <div
                  key={lang.code}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    translation
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-white'
                  } ${isEditing ? 'ring-2 ring-primary-500' : ''}`}
                >
                  {/* Language Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{lang.flag}</span>
                      <div>
                        <h3 className="font-semibold">{lang.name}</h3>
                        <p className="text-xs text-gray-500">{lang.code}</p>
                      </div>
                    </div>
                    {translation && !isEditing && (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                  </div>

                  {/* Translation Content */}
                  {isEditing ? (
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-medium text-gray-700">Title</label>
                        <input
                          type="text"
                          value={editedData.title || ''}
                          onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
                          className="w-full px-2 py-1 text-sm border rounded mt-1"
                          maxLength={30}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Short Description</label>
                        <textarea
                          value={editedData.short_description || ''}
                          onChange={(e) => setEditedData({ ...editedData, short_description: e.target.value })}
                          className="w-full px-2 py-1 text-sm border rounded mt-1"
                          rows={2}
                          maxLength={80}
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleSave(lang.code)}
                          className="flex-1 bg-green-600 text-white text-xs py-1.5 rounded hover:bg-green-700"
                        >
                          Saqlash
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex-1 bg-gray-200 text-gray-700 text-xs py-1.5 rounded hover:bg-gray-300"
                        >
                          Bekor
                        </button>
                      </div>
                    </div>
                  ) : translation ? (
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-gray-500">Title</p>
                        <p className="text-sm font-medium truncate">{translation.title}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Short Desc</p>
                        <p className="text-xs text-gray-700 line-clamp-2">{translation.short_description}</p>
                      </div>
                      <button
                        onClick={() => handleEdit(lang.code)}
                        className="w-full bg-primary-600 text-white text-xs py-1.5 rounded hover:bg-primary-700 flex items-center justify-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Tahrirlash
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-xs text-gray-400 mb-2">Tarjima yo'q</p>
                      <button
                        onClick={() => handleEdit(lang.code)}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        + Qo'shish
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            ✅ {Object.keys(translations || {}).length} / {LANGUAGES.length} til to'ldirilgan
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
          >
            Tayyor
          </button>
        </div>
      </div>
    </div>
  );
}
