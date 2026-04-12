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
      setError('Email kiriting!');
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

      setSuccess(`✅ ${emailList.length} ta tester qo'shildi!`);
      setTestLink(response.data.test_link);
      setEmails('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRelease = async () => {
    if (!releaseNotes.trim()) {
      setError('Release notes kiriting!');
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

      setSuccess('✅ Test release yaratildi!');
      setTestLink(response.data.test_link);
    } catch (err) {
      setError(err.response?.data?.detail || 'Xatolik yuz berdi');
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
      setError(err.response?.data?.detail || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(testLink);
    setSuccess('✅ Link nusxalandi!');
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <div className="bg-white rounded-lg border-2 border-purple-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <TestTube className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-bold text-purple-900">Testing</h3>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 font-medium">{error}</p>
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
          <option value="internal">Internal Testing (Ichki test)</option>
          <option value="alpha">Closed Testing (Yopiq test)</option>
          <option value="beta">Open Testing (Ochiq test)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Internal: Eng tez, 100 tagacha tester
        </p>
      </div>

      {/* Add Testers */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-blue-900">1. Testerlar Qo'shish</h4>
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
          {loading ? 'Qo\'shilmoqda...' : 'Testerlarni Qo\'shish'}
        </button>
      </div>

      {/* Create Release */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-2 mb-3">
          <Send className="w-5 h-5 text-green-600" />
          <h4 className="font-semibold text-green-900">2. Test Release Yaratish</h4>
        </div>
        <textarea
          value={releaseNotes}
          onChange={(e) => setReleaseNotes(e.target.value)}
          className="input mb-3"
          rows={3}
          placeholder="Release notes (masalan: Bug fixes, yangi funksiyalar...)"
        />
        <button
          onClick={handleCreateRelease}
          disabled={loading || !releaseNotes.trim()}
          className="btn bg-green-600 text-white hover:bg-green-700 w-full flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          {loading ? 'Yaratilmoqda...' : 'Release Yaratish'}
        </button>
      </div>

      {/* Test Link */}
      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
        <div className="flex items-center gap-2 mb-3">
          <LinkIcon className="w-5 h-5 text-purple-600" />
          <h4 className="font-semibold text-purple-900">3. Test Link</h4>
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
                Nusxa
              </button>
            </div>
            <a
              href={testLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-purple-600 text-white hover:bg-purple-700 w-full flex items-center justify-center gap-2"
            >
              <LinkIcon className="w-5 h-5" />
              Test Linkini Ochish
            </a>
          </div>
        ) : (
          <button
            onClick={handleGetLink}
            disabled={loading}
            className="btn btn-secondary w-full flex items-center justify-center gap-2"
          >
            <LinkIcon className="w-5 h-5" />
            {loading ? 'Yuklanmoqda...' : 'Link Olish'}
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h4 className="font-semibold text-yellow-900 mb-2">📝 Qo'llanma:</h4>
        <ol className="text-sm text-yellow-800 space-y-1">
          <li>1️⃣ Testerlar email'larini kiriting (har birini yangi qatorga)</li>
          <li>2️⃣ "Testerlarni Qo'shish" bosing</li>
          <li>3️⃣ Release notes yozing</li>
          <li>4️⃣ "Release Yaratish" bosing</li>
          <li>5️⃣ Test linkni testerlar bilan bo'lishing!</li>
        </ol>
      </div>
    </div>
  );
}
