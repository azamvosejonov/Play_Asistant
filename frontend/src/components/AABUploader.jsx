import { useState } from 'react';
import { Upload, File, CheckCircle, AlertCircle, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AABUploader({ packageName, serviceAccountId, onUploadSuccess }) {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.aab')) {
        setError(t('invalidPackage'));
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError(t('selectFile'));
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('package_name', packageName);
    formData.append('service_account_id', serviceAccountId);

    try {
      const response = await fetch('http://localhost:8000/api/apps/upload-aab', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Yuklashda xatolik');
      }

      const result = await response.json();
      setUploadResult(result);
      
      // Reset form
      setFile(null);
      
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Package className="w-6 h-6 text-primary-600" />
        <h3 className="text-lg font-bold text-black">{t('aabUpload')}</h3>
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-green-800 mb-2">✅ Muvaffaqiyatli yuklandi!</p>
              <div className="text-sm text-green-700 space-y-1">
                <p>📦 Fayl: {uploadResult.filename}</p>
                <p>🔢 Version Code: {uploadResult.version_code || 'N/A'} {uploadResult.auto_detected && '(avtomatik)'}</p>
                <p>📝 Version Name: {uploadResult.version_name || 'N/A'}</p>
                <p>💾 Hajm: {uploadResult.file_size_mb} MB</p>
                {uploadResult.package_validated && (
                  <p className="text-green-600 font-medium">✓ Package name tasdiqlandi</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            {t('aabUpload')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="file"
              accept=".aab"
              onChange={handleFileChange}
              className="hidden"
              id="aab-upload"
            />
            <label
              htmlFor="aab-upload"
              className="flex items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all"
            >
              {file ? (
                <>
                  <File className="w-8 h-8 text-primary-600" />
                  <div className="text-center">
                    <p className="font-medium text-primary-700">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400" />
                  <div className="text-center">
                    <p className="font-medium text-black">{t('selectFile')}</p>
                    <p className="text-xs text-black mt-1">
                      {t('upload')}
                    </p>
                  </div>
                </>
              )}
            </label>
          </div>
          <p className="text-xs text-black mt-2">
            💡 {t('aabUpload')}
          </p>
        </div>


        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              {t('uploading')}
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              {t('upload')}
            </>
          )}
        </button>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-black">
            <strong>📌 {t('note')}:</strong>
            <br />
            • {t('versionAutoDetect')}
            <br />
            • {t('packageAutoCheck')}
            <br />
            • {t('versionCodeRule')}
            <br />
            • {t('aabBuildNote')}
          </p>
        </div>
      </div>
    </div>
  );
}
