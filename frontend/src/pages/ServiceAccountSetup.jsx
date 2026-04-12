import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, CheckCircle, XCircle, FileJson } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { serviceAccountAPI } from '../utils/api';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function ServiceAccountSetup() {
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.json')) {
        setError('Faqat JSON fayl yuklash mumkin');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !file) {
      setError('Barcha maydonlarni to\'ldiring');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('file', file);

      await serviceAccountAPI.upload(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button onClick={() => navigate('/dashboard')} className="btn btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('back')}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="card">
          <h1 className="text-3xl font-bold mb-2">{t('setupTitle')}</h1>
          <p className="text-gray-600 mb-8">
            {t('setupDesc')}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {t('setupSuccess')}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('setupAccountName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Masalan: Asosiy Account"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('setupJsonKey')}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <FileJson className="w-12 h-12 text-green-600" />
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{t('setupChangeFile')}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-12 h-12 text-gray-400" />
                      <p className="text-sm font-medium text-gray-900">{t('setupUploadJson')}</p>
                      <p className="text-xs text-gray-500">{t('setupDragDrop')}</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Qanday qilib JSON kalit olish mumkin?</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Google Cloud Console'ga kiring</li>
                <li>Yangi loyiha yarating yoki mavjudini tanlang</li>
                <li>Google Play Android Developer API'ni yoqing</li>
                <li>Service Account yarating va JSON kalitni yuklab oling</li>
                <li>Play Console'da API access bo'limida accountga ruxsat bering</li>
              </ol>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              {loading ? t('loading') : success ? t('success') : t('setupTitle')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
