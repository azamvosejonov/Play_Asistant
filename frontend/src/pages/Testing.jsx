import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Users, Send, Link as LinkIcon, TestTube, CheckCircle, AlertCircle, Copy, Package, ShieldX, Star, Download, MessageSquare, BarChart3, Lock, RefreshCw, Loader2 } from 'lucide-react';
import { appAPI, testingAPI } from '../utils/api';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Testing() {
  const { t } = useTranslation();
  const { serviceAccountId } = useParams();
  const navigate = useNavigate();

  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);

  // Track status
  const [trackStatus, setTrackStatus] = useState(null);
  const [checkingTrack, setCheckingTrack] = useState(false);
  const [trackError, setTrackError] = useState('');

  // Tester
  const [emails, setEmails] = useState('');
  const [track, setTrack] = useState('internal');
  const [addingTesters, setAddingTesters] = useState(false);

  // Release
  const [releaseNotes, setReleaseNotes] = useState('');
  const [creatingRelease, setCreatingRelease] = useState(false);

  // Link
  const [testLink, setTestLink] = useState('');
  const [loadingLink, setLoadingLink] = useState(false);

  // Stats
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Tab
  const [activeTab, setActiveTab] = useState('testers');

  // Messages
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    if (selectedApp) {
      checkTrackStatus();
    }
  }, [selectedApp]);

  const fetchApps = async () => {
    try {
      const response = await appAPI.getAll(serviceAccountId);
      setApps(response.data);
      if (response.data.length > 0) {
        setSelectedApp(response.data[0]);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkTrackStatus = async () => {
    if (!selectedApp) return;
    setCheckingTrack(true);
    setTrackError('');
    setTrackStatus(null);
    try {
      const response = await testingAPI.getTrackStatus(
        selectedApp.package_name, serviceAccountId
      );
      setTrackStatus(response.data);
      if (!response.data.test_allowed) {
        setTrackError(response.data.error || 'Test ruxsati yo\'q');
      }
    } catch (err) {
      const detail = err.response?.data?.detail || 'Xatolik yuz berdi';
      setTrackError(detail);
      setTrackStatus(null);
    } finally {
      setCheckingTrack(false);
    }
  };

  const fetchStats = async () => {
    if (!selectedApp) return;
    setLoadingStats(true);
    try {
      const response = await testingAPI.getStats(
        selectedApp.package_name, serviceAccountId
      );
      setStats(response.data);
    } catch (err) {
      console.error('Stats error:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleAddTesters = async () => {
    if (!emails.trim() || !selectedApp) return;
    setAddingTesters(true);
    setError('');
    setSuccess('');
    try {
      const emailList = emails.split('\n').map(e => e.trim()).filter(e => e);
      const response = await testingAPI.addTesters(
        selectedApp.package_name, emailList, track, serviceAccountId
      );
      setSuccess(`✅ ${emailList.length} ta tester qo'shildi!`);
      if (response.data.test_link) setTestLink(response.data.test_link);
      setEmails('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Xatolik yuz berdi');
    } finally {
      setAddingTesters(false);
    }
  };

  const handleCreateRelease = async () => {
    if (!releaseNotes.trim() || !selectedApp) return;
    setCreatingRelease(true);
    setError('');
    setSuccess('');
    try {
      const response = await testingAPI.createRelease(
        selectedApp.package_name, track, releaseNotes, serviceAccountId
      );
      setSuccess('✅ Test release yaratildi!');
      if (response.data.test_link) setTestLink(response.data.test_link);
      checkTrackStatus();
    } catch (err) {
      setError(err.response?.data?.detail || 'Xatolik yuz berdi');
    } finally {
      setCreatingRelease(false);
    }
  };

  const handleGetLink = async () => {
    if (!selectedApp) return;
    setLoadingLink(true);
    try {
      const response = await testingAPI.getLink(
        selectedApp.package_name, track, serviceAccountId
      );
      setTestLink(response.data.test_link);
    } catch (err) {
      setError(err.response?.data?.detail || 'Xatolik yuz berdi');
    } finally {
      setLoadingLink(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(testLink);
    setSuccess('✅ Link nusxalandi!');
    setTimeout(() => setSuccess(''), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
      </div>
    );
  }

  const testAllowed = trackStatus?.test_allowed === true;
  const showNotAllowed = !checkingTrack && trackStatus && !testAllowed;
  const showContent = !checkingTrack && testAllowed;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate(`/apps/${serviceAccountId}`)}
                className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{t('back')}</span>
              </button>
              <div className="h-5 w-px bg-gray-200"></div>
              <div className="flex items-center gap-2">
                <TestTube className="w-5 h-5 text-purple-600" />
                <h1 className="text-base sm:text-lg font-bold text-gray-900">{t('testing')}</h1>
              </div>
            </div>
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Messages */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-green-800">{success}</p>
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  Ilovalar
                </h2>
              </div>
              <div className="p-2 max-h-[400px] overflow-y-auto">
                {apps.length === 0 ? (
                  <p className="text-gray-400 text-xs p-3 text-center">{t('noApps')}</p>
                ) : (
                  apps.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => {
                        setSelectedApp(app);
                        setTestLink('');
                        setTrackStatus(null);
                        setTrackError('');
                        setStats(null);
                        setSuccess('');
                        setError('');
                      }}
                      className={`w-full text-left p-2.5 rounded-lg transition-all text-sm mb-1 ${
                        selectedApp?.id === app.id
                          ? 'bg-purple-50 border border-purple-200 shadow-sm'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <p className="font-medium truncate text-xs text-gray-900">{app.app_name || app.package_name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{app.package_name}</p>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Track Status Panel */}
            {selectedApp && !checkingTrack && trackStatus && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Track Holati</h2>
                  <button onClick={checkTrackStatus} className="text-purple-500 hover:text-purple-700">
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
                <div className="p-3 space-y-2">
                  {['internal', 'alpha', 'beta', 'production'].map((tr) => {
                    const info = trackStatus.tracks?.[tr];
                    const hasActive = info?.has_active;
                    const labels = { internal: 'Internal', alpha: 'Closed', beta: 'Open', production: 'Production' };
                    return (
                      <div key={tr} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{labels[tr]}</span>
                        {hasActive ? (
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium">Active</span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded text-[10px]">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Content */}
          <div className="lg:col-span-4">
            {!selectedApp ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-16 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">{t('selectAppLeft')}</p>
              </div>
            ) : checkingTrack ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-16 text-center">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Track holati tekshirilmoqda...</p>
                <p className="text-gray-400 text-xs mt-1">{selectedApp.package_name}</p>
              </div>
            ) : trackError && !testAllowed ? (
              /* Test ruxsati yo'q */
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-12 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Test Ruxsati Yo'q</h2>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
                  Bu ilova uchun Play Console'da test track sozlanmagan. Quyidagi qadamlarni bajaring:
                </p>
                <div className="bg-gray-50 rounded-lg p-5 max-w-sm mx-auto text-left space-y-2">
                  {[
                    'Play Console\'ga kiring',
                    'Ilovangizni tanlang',
                    'Testing → Internal testing ochish',
                    'Tester ro\'yxati yarating',
                    'AAB faylni yuklang va release chiqaring'
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-sm text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
                {trackError && (
                  <p className="mt-4 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded inline-block">{trackError}</p>
                )}
                <button
                  onClick={checkTrackStatus}
                  className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Qayta tekshirish
                </button>
              </div>
            ) : testAllowed ? (
              <>
                {/* Tabs */}
                <div className="flex gap-1 mb-5 bg-white rounded-lg p-1 shadow-sm border border-gray-100">
                  {[
                    { id: 'testers', label: 'Testerlar', icon: Users, color: 'blue' },
                    { id: 'release', label: 'Release', icon: Send, color: 'green' },
                    { id: 'link', label: 'Test Link', icon: LinkIcon, color: 'purple' },
                    { id: 'stats', label: 'Statistika', icon: BarChart3, color: 'orange' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        if (tab.id === 'stats' && !stats) fetchStats();
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab: Testers */}
                {activeTab === 'testers' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-gray-900">Testerlar Qo'shish</h2>
                        <p className="text-xs text-gray-400">Testerlar Play Market orqali ilovani yuklab test qiladi</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Track</label>
                      <select
                        value={track}
                        onChange={(e) => setTrack(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      >
                        <option value="internal">Internal Testing (Ichki)</option>
                        <option value="alpha">Closed Testing (Yopiq)</option>
                        <option value="beta">Open Testing (Ochiq)</option>
                      </select>
                    </div>

                    <textarea
                      value={emails}
                      onChange={(e) => setEmails(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none font-mono text-sm bg-gray-50"
                      rows={5}
                      placeholder={"test1@gmail.com\ntest2@gmail.com"}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      {emails.split('\n').filter(e => e.trim()).length} ta email
                    </p>
                    <button
                      onClick={handleAddTesters}
                      disabled={addingTesters || !emails.trim()}
                      className="mt-3 w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm flex items-center justify-center gap-2"
                    >
                      {addingTesters ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                      {addingTesters ? 'Qo\'shilmoqda...' : 'Tester Qo\'shish'}
                    </button>
                  </div>
                )}

                {/* Tab: Release */}
                {activeTab === 'release' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Send className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-gray-900">Test Release</h2>
                        <p className="text-xs text-gray-400">AAB faylni test track'iga yuborish</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Track</label>
                      <select
                        value={track}
                        onChange={(e) => setTrack(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      >
                        <option value="internal">Internal Testing</option>
                        <option value="alpha">Closed Testing</option>
                        <option value="beta">Open Testing</option>
                      </select>
                    </div>

                    <textarea
                      value={releaseNotes}
                      onChange={(e) => setReleaseNotes(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm bg-gray-50"
                      rows={4}
                      placeholder={"Yangiliklar:\n- Bug fixes\n- Yangi funksiyalar"}
                    />
                    <button
                      onClick={handleCreateRelease}
                      disabled={creatingRelease || !releaseNotes.trim()}
                      className="mt-3 w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm flex items-center justify-center gap-2"
                    >
                      {creatingRelease ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {creatingRelease ? 'Yaratilmoqda...' : 'Release Yuborish'}
                    </button>
                  </div>
                )}

                {/* Tab: Test Link */}
                {activeTab === 'link' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <LinkIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-gray-900">Test Link</h2>
                        <p className="text-xs text-gray-400">Testerlarga yuboring — Play Market'dan yuklaydi</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Track</label>
                      <select
                        value={track}
                        onChange={(e) => { setTrack(e.target.value); setTestLink(''); }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      >
                        <option value="internal">Internal Testing</option>
                        <option value="alpha">Closed Testing</option>
                        <option value="beta">Open Testing</option>
                      </select>
                    </div>

                    {testLink ? (
                      <div className="space-y-3">
                        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                          <p className="text-[10px] text-purple-500 mb-1.5 font-medium uppercase tracking-wider">Test Link</p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={testLink}
                              readOnly
                              className="flex-1 px-3 py-2 bg-white border border-purple-200 rounded-lg text-xs font-mono"
                            />
                            <button onClick={copyLink} className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <a
                          href={testLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-sm text-center"
                        >
                          Play Market'da Ochish →
                        </a>
                      </div>
                    ) : (
                      <button
                        onClick={handleGetLink}
                        disabled={loadingLink}
                        className="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition font-medium text-sm flex items-center justify-center gap-2"
                      >
                        {loadingLink ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                        {loadingLink ? 'Yuklanmoqda...' : 'Test Link Olish'}
                      </button>
                    )}

                    <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-3">
                      <p className="text-xs text-amber-700">
                        <strong>Eslatma:</strong> Tester linkni ochib "Tester bo'lish" tugmasini bosishi va keyin ilovani yuklab olishi kerak.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab: Statistics */}
                {activeTab === 'stats' && (
                  <div className="space-y-4">
                    {loadingStats ? (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-12 text-center">
                        <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">Statistika yuklanmoqda...</p>
                      </div>
                    ) : stats ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            { label: 'Reyting', value: stats.average_rating || '—', sub: '/5', icon: Star, color: 'yellow' },
                            { label: 'Sharhlar', value: stats.total_reviews || 0, sub: '', icon: MessageSquare, color: 'blue' },
                            { label: 'Track\'lar', value: trackStatus ? Object.values(trackStatus.tracks || {}).filter(t => t.has_active).length : '—', sub: ' active', icon: Download, color: 'green' },
                          ].map((card, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <card.icon className={`w-4 h-4 text-${card.color}-500`} />
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">{card.label}</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">
                                {card.value}<span className="text-sm text-gray-400">{card.sub}</span>
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-blue-500" />
                              So'nggi Sharhlar
                            </h3>
                            <button onClick={fetchStats} className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1">
                              <RefreshCw className="w-3 h-3" /> Yangilash
                            </button>
                          </div>
                          {stats.reviews && stats.reviews.length > 0 ? (
                            <div className="space-y-2">
                              {stats.reviews.map((review, idx) => (
                                <div key={idx} className="border border-gray-100 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-xs text-gray-900">{review.author}</span>
                                    <div className="flex">
                                      {[1,2,3,4,5].map((s) => (
                                        <Star key={s} className={`w-2.5 h-2.5 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-600">{review.text || 'Sharh matni yo\'q'}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                              <p className="text-gray-400 text-xs">Hozircha sharhlar yo'q</p>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-12 text-center">
                        <BarChart3 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm mb-4">Statistikani ko'rish</p>
                        <button onClick={fetchStats} className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                          Yuklash
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
