import { useState } from 'react';
import { Plus, X, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AddAppModal({ onClose, onAdd, isAdding }) {
  const { t } = useTranslation();
  const [packageNames, setPackageNames] = useState('');
  const [showHelp, setShowHelp] = useState(true);

  const handleAdd = () => {
    console.log('handleAdd called, packageNames:', packageNames);
    if (!packageNames.trim()) {
      alert(t('invalidPackage'));
      return;
    }
    console.log('Calling onAdd with:', packageNames);
    onAdd(packageNames);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">{t('addAppTitle')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Help Section */}
        {showHelp && (
          <div className="mb-4 sm:mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Package Name</h3>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                {t('close')}
              </button>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="font-mono text-xs space-y-1">
                  <div>com.azam.filmtop</div>
                  <div>uz.azam.fokus</div>
                  <div>uz.azam.gymium</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!showHelp && (
          <button
            onClick={() => setShowHelp(true)}
            className="mb-4 text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
          >
            <HelpCircle className="w-4 h-4" />
            {t('note')}
          </button>
        )}

        {/* Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Package Names
            <span className="text-gray-500 ml-2">({t('addAppDesc')})</span>
          </label>
          <textarea
            value={packageNames}
            onChange={(e) => setPackageNames(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-mono text-sm"
            rows={8}
            placeholder="com.azam.filmtop&#10;uz.azam.fokus&#10;uz.azam.gymium"
          />
          <p className="text-xs text-gray-500 mt-2">
            {t('addAppDesc')}
          </p>
        </div>

        {/* Example */}
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">{t('note')}:</p>
          <pre className="text-xs text-gray-600 bg-white rounded p-3 overflow-x-auto">
com.example.myapp
uz.company.application
org.developer.game
          </pre>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end flex-col sm:flex-row">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-all font-medium"
            disabled={isAdding}
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleAdd}
            disabled={isAdding || !packageNames.trim()}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {isAdding ? t('addingApp') : t('addBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
