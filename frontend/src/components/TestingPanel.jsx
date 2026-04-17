import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Send, Link as LinkIcon, TestTube, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import axios from 'axios';

export default function TestingPanel({ selectedApp, serviceAccountId }) {
  const { t } = useTranslation();
  const [emails, setEmails] = useState('');
  const [track, setTrack] = useState('internal');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [testLink, setTestLink] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleAddTesters = async () => {
    if (!emails.trim()) {
      setError(t('invalidEmail'));
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const emailList = emails.split('\n').map(e => e.trim()).filter(e => e);
      
      const response = await axios.post(
        '/api/testing/add-testers',
        {
          package_name: selectedApp.package_name,
          emails: emailList,
          track: track
        },
        {
          params: { service_account_id: serviceAccountId }
        }
      );

      setSuccess(` ${emailList.length} ${t('testersAdded')}`);
      setTestLink(response.data.test_link);
      setEmails('');
    } catch (err) {
      setError(err.response?.data?.detail || t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRelease = async () => {
    if (!releaseNotes.trim()) {
      setError(t('required'));
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        '/api/testing/create-release',
        null,
        {
          params: {
            package_name: selectedApp.package_name,
            track: track,
            release_notes: releaseNotes,
            service_account_id: serviceAccountId
          }
        }
      );

      setSuccess(t('releaseCreated'));
      setTestLink(response.data.test_link);
    } catch (err) {
      setError(err.response?.data?.detail || t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleGetLink = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/testing/link', {
        params: {
          package_name: selectedApp.package_name,
          track: track,
          service_account_id: serviceAccountId
        }
      });

      setTestLink(response.data.test_link);
    } catch (err) {
      setError(err.response?.data?.detail || t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(testLink);
    setSuccess(t('linkCopied'));
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <TestTube className="w-6 h-6 text-gray-900" />
        <h3 className="text-xl font-bold text-gray-900">{t('testingTitle')}</h3>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-gray-900" />
            <p className="text-gray-900 font-medium">{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Track Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Track
        </label>
        <select
          value={track}
          onChange={(e) => setTrack(e.target.value)}
          className="input"
        >
          <option value="internal">{t('internalTesting')}</option>
          <option value="alpha">{t('closedTesting')}</option>
          <option value="beta">{t('openTesting')}</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Internal: max 100 testers
        </p>
      </div>

      {/* Add Testers */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-blue-900">1. {t('addTestersTitle')}</h4>
        </div>
        <textarea
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          className="input mb-3"
          rows={4}
          placeholder="test1@gmail.com&#10;test2@gmail.com&#10;test3@gmail.com"
        />
        <button
          onClick={handleAddTesters}
          disabled={loading || !emails.trim()}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          <Users className="w-5 h-5" />
          {loading ? t('addingTesters') : t('addTestersBtn')}
        </button>
      </div>

      {/* Create Release */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Send className="w-5 h-5 text-gray-900" />
          <h4 className="font-semibold text-gray-900">2. {t('createReleaseTitle')}</h4>
        </div>
        <textarea
          value={releaseNotes}
          onChange={(e) => setReleaseNotes(e.target.value)}
          className="input mb-3"
          rows={3}
          placeholder={t('releaseNotesPlaceholder')}
        />
        <button
          onClick={handleCreateRelease}
          disabled={loading || !releaseNotes.trim()}
          className="btn bg-black text-white hover:bg-neutral-800 w-full flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          {loading ? t('creatingRelease') : t('createReleaseBtn')}
        </button>
      </div>

      {/* Test Link */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <LinkIcon className="w-5 h-5 text-gray-900" />
          <h4 className="font-semibold text-gray-900">3. {t('testLinkSection')}</h4>
        </div>
        
        {testLink ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={testLink}
                readOnly
                className="input flex-1 text-sm"
              />
              <button
                onClick={copyLink}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                {t('copyBtn')}
              </button>
            </div>
            <a
              href={testLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-black text-white hover:bg-neutral-800 w-full flex items-center justify-center gap-2"
            >
              <LinkIcon className="w-5 h-5" />
              {t('openTestLink')}
            </a>
          </div>
        ) : (
          <button
            onClick={handleGetLink}
            disabled={loading}
            className="btn btn-secondary w-full flex items-center justify-center gap-2"
          >
            <LinkIcon className="w-5 h-5" />
            {loading ? t('loading') : t('getLinkBtn')}
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h4 className="font-semibold text-yellow-900 mb-2">{t('note')}:</h4>
        <ol className="text-sm text-yellow-800 space-y-1">
          <li>1. {t('addTestersLabel')}</li>
          <li>2. {t('addTestersBtn')}</li>
          <li>3. {t('testReleaseDesc')}</li>
          <li>4. {t('createReleaseBtn')}</li>
          <li>5. {t('getLinkBtn')}</li>
        </ol>
      </div>
    </div>
  );
}
