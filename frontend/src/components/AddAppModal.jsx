import { useState } from 'react';
import { Plus, X, HelpCircle } from 'lucide-react';

export default function AddAppModal({ onClose, onAdd, isAdding }) {
  const [packageNames, setPackageNames] = useState('');
  const [showHelp, setShowHelp] = useState(true);

  const handleAdd = () => {
    console.log('handleAdd called, packageNames:', packageNames);
    if (!packageNames.trim()) {
      alert('Package name kiriting!');
      return;
    }
    console.log('Calling onAdd with:', packageNames);
    onAdd(packageNames);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">📱 Ilova Qo'shish</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Help Section */}
        {showHelp && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Package Name Qanday Topish?</h3>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Yashirish
              </button>
            </div>
            
            <div className="space-y-3 text-sm text-blue-800">
              <div>
                <p className="font-medium mb-2">🔹 Play Console'dan:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>https://play.google.com/console ga kiring</li>
                  <li>Ilovangizni tanlang</li>
                  <li>Dashboard → Package name'ni ko'chirib oling</li>
                </ol>
              </div>

              <div className="bg-white bg-opacity-50 rounded-lg p-3">
                <p className="font-medium mb-1">📋 Misol:</p>
                <div className="font-mono text-xs bg-white rounded p-2 space-y-1">
                  <div>✅ com.azam.filmtop</div>
                  <div>✅ uz.azam.fokus</div>
                  <div>✅ uz.azam.gymium</div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="font-medium text-red-900 mb-1">⚠️ Diqqat:</p>
                <ul className="list-disc list-inside space-y-1 text-red-800">
                  <li>Package name AYNAN to'g'ri yozing</li>
                  <li>Kichik harf ishlatiladi (lowercase)</li>
                  <li>Bo'sh joy bo'lmasligi kerak</li>
                </ul>
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
            Yo'riqnomani ko'rsatish
          </button>
        )}

        {/* Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Package Name'lar
            <span className="text-gray-500 ml-2">(har bir qatorda bitta)</span>
          </label>
          <textarea
            value={packageNames}
            onChange={(e) => setPackageNames(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-mono text-sm"
            rows={8}
            placeholder="com.azam.filmtop&#10;uz.azam.fokus&#10;uz.azam.gymium"
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 Ko'p ilova qo'shish uchun har birini yangi qatorga yozing
          </p>
        </div>

        {/* Example */}
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">📝 Namuna:</p>
          <pre className="text-xs text-gray-600 bg-white rounded p-3 overflow-x-auto">
com.example.myapp
uz.company.application
org.developer.game
          </pre>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-all font-medium"
            disabled={isAdding}
          >
            Bekor qilish
          </button>
          <button
            onClick={handleAdd}
            disabled={isAdding || !packageNames.trim()}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {isAdding ? 'Qo\'shilmoqda...' : 'Qo\'shish'}
          </button>
        </div>
      </div>
    </div>
  );
}
