import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, CheckCircle, XCircle, FileJson, ExternalLink, Info } from 'lucide-react';
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
        setError(t('setupOnlyJson'));
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
      setError(t('setupFillAll'));
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
      setError(err.response?.data?.detail || t('setupError'));
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
                placeholder={t('setupPlaceholder')}
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

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                <Info className="w-5 h-5" />
                {t('setupHowToGet')}
              </h3>

              {/* Step 1 */}
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">{t('guideStep1Title')}</p>
                    <p className="text-sm text-blue-700 mt-1">{t('guideStep1Desc')}</p>
                    <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 underline">
                      console.cloud.google.com <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">{t('guideStep2Title')}</p>
                    <p className="text-sm text-blue-700 mt-1">{t('guideStep2Desc')}</p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">{t('guideStep3Title')}</p>
                    <p className="text-sm text-blue-700 mt-1">{t('guideStep3Desc')}</p>
                    <a href="https://console.cloud.google.com/apis/library/androidpublisher.googleapis.com" target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 underline">
                      Google Play Android Developer API <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">{t('guideStep4Title')}</p>
                    <p className="text-sm text-blue-700 mt-1">{t('guideStep4Desc')}</p>
                    <a href="https://console.cloud.google.com/iam-admin/serviceaccounts" target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 underline">
                      IAM & Admin → Service Accounts <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">5</span>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">{t('guideStep5Title')}</p>
                    <p className="text-sm text-blue-700 mt-1">{t('guideStep5Desc')}</p>
                  </div>
                </div>
              </div>

              {/* Step 6 */}
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">6</span>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">{t('guideStep6Title')}</p>
                    <p className="text-sm text-blue-700 mt-1">{t('guideStep6Desc')}</p>
                    <a href="https://play.google.com/console/developers" target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 underline">
                      Play Console → API access <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Step 7 */}
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <span className="bg-green-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">7</span>
                  <div className="flex-1">
                    <p className="font-semibold text-green-800">{t('guideStep7Title')}</p>
                    <p className="text-sm text-green-700 mt-1">{t('guideStep7Desc')}</p>
                  </div>
                </div>
              </div>

              {/* Important notes */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-amber-900 text-sm mb-2">{t('guideNotesTitle')}</h4>
                <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                  <li>{t('guideNote1')}</li>
                  <li>{t('guideNote2')}</li>
                  <li>{t('guideNote3')}</li>
                </ul>
              </div>
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
