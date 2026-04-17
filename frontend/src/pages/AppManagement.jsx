import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, RefreshCw, Languages, Upload, Save, Image as ImageIcon, Plus, Package, Eye, Trash2, X, Send, Sparkles, AlertTriangle, Loader2, Zap, Key, Rocket, ExternalLink, CheckCircle } from 'lucide-react';
import { appAPI, listingAPI, graphicAPI, templateAPI, aiAPI, deployAPI } from '../utils/api';
import LanguageSwitcher from '../components/LanguageSwitcher';
import AddAppModal from '../components/AddAppModal';
import PhonePreview from '../components/PhonePreview';
import TranslationManager from '../components/TranslationManager';
import ConfirmDialog from '../components/ConfirmDialog';
import AABUploader from '../components/AABUploader';
import FeedbackWidget from '../components/FeedbackWidget';

export default function AppManagement() {
  const { t } = useTranslation();
  const { serviceAccountId } = useParams();
  const navigate = useNavigate();
  
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showAddApp, setShowAddApp] = useState(false);
  const [newPackageNames, setNewPackageNames] = useState('');
  const [adding, setAdding] = useState(false);
  
  const [language, setLanguage] = useState('en-US');
  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  
  const [translating, setTranslating] = useState(false);
  const [translations, setTranslations] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [showTranslationManager, setShowTranslationManager] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [previewImages, setPreviewImages] = useState({
    icon: null,
    featureGraphic: null,
    screenshots: []
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [savedGraphics, setSavedGraphics] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackTrigger, setFeedbackTrigger] = useState('general');
  
  // AI states
  const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiAdvice, setAiAdvice] = useState([]);
  const [aiTasks, setAiTasks] = useState([]);
  const [aiAutoApplied, setAiAutoApplied] = useState(false);
  
  // Deploy states
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState(null);
  const [contactEmail, setContactEmail] = useState('');
  
  // Error states
  const [submitErrors, setSubmitErrors] = useState([]);

  const aiAnalyze = async (app = null, prompt = '') => {
    const targetApp = app || selectedApp;
    if (!targetApp) return;
    setAiLoading(true);
    setAiResult(null);
    setAiAdvice([]);
    setSubmitErrors([]);
    setAiAutoApplied(false);
    try {
      const res = await aiAPI.analyze({
        package_name: targetApp.package_name,
        service_account_id: parseInt(serviceAccountId),
        groq_api_key: GROQ_API_KEY,
        prompt: prompt || aiPrompt,
        language: language
      });
      if (res.data.success) {
        const data = res.data.data;
        setAiResult(data);
        
        // Avtomatik qo'llash
        if (data.title) setTitle(data.title);
        if (data.short_description) setShortDesc(data.short_description);
        if (data.full_description) setFullDesc(data.full_description);
        setAiAutoApplied(true);
        
        // Maslahatlarni to'plash
        const advice = [];
        if (data.aso_score !== undefined) {
          advice.push(`📊 ASO Ball: ${data.aso_score}/100`);
        }
        if (data.improvements?.length > 0) {
          advice.push(...data.improvements.map(i => `🔧 ${i}`));
        }
        if (data.aso_tips?.length > 0) {
          advice.push(...data.aso_tips.map(t => `🚀 ${t}`));
        }
        if (data.category_suggestion) {
          advice.push(`📂 Kategoriya: ${data.category_suggestion}`);
        }
        if (data.tags?.length > 0) {
          advice.push(`🏷 Tags: ${data.tags.join(', ')}`);
        }
        setAiAdvice(advice);
        
        // Qolgan tasklar
        if (data.remaining_tasks?.length > 0) {
          setAiTasks(data.remaining_tasks);
        } else {
          setAiTasks([]);
        }
        
        setUploadSuccess('🤖 AI listing\'ni avtomatik to\'ldirdi!');
        setTimeout(() => setUploadSuccess(''), 4000);
      } else {
        setSubmitErrors([res.data.error || 'AI javob bermadi']);
      }
    } catch (err) {
      setSubmitErrors([err.response?.data?.detail || 'AI xatosi']);
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiResult = () => {
    if (!aiResult) return;
    if (aiResult.title) setTitle(aiResult.title);
    if (aiResult.short_description) setShortDesc(aiResult.short_description);
    if (aiResult.full_description) setFullDesc(aiResult.full_description);
    setShowAiModal(false);
    setUploadSuccess('🤖 AI natijasi qo\'llanildi!');
    setTimeout(() => setUploadSuccess(''), 3000);
  };

  const fullDeploy = async () => {
    if (!selectedApp || !title.trim()) return;
    setDeploying(true);
    setDeployResult(null);
    setSubmitErrors([]);
    try {
      const res = await deployAPI.fullDeploy({
        package_name: selectedApp.package_name,
        title: title,
        short_description: shortDesc,
        full_description: fullDesc,
        contact_email: contactEmail || 'dev@example.com',
        language: language
      }, serviceAccountId);
      
      setDeployResult(res.data.results);
      if (res.data.results?.errors?.length > 0) {
        setSubmitErrors(res.data.results.errors);
      }
      if (res.data.results?.steps?.length > 0) {
        setUploadSuccess(t('completed'));
        setTimeout(() => setUploadSuccess(''), 5000);
        localStorage.setItem('has_deployed', 'true');
        // Deploy muvaffaqiyatidan keyin NPS so'rash
        setFeedbackTrigger('deploy_success');
        setTimeout(() => setShowFeedback(true), 2000);
      }
    } catch (err) {
      setSubmitErrors([err.response?.data?.detail || err.message]);
    } finally {
      setDeploying(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    if (selectedApp) {
      const loadListing = async () => {
        try {
          const response = await appAPI.getListing(selectedApp.id, language);
          setTitle(response.data.title || '');
          setShortDesc(response.data.short_description || '');
          setFullDesc(response.data.full_description || '');
          
          const sourceMsg = {
            'google_play': `🌐 Google Play (${language})`,
            'draft': ` Draft (${language})`,
            'listing': ` Saqlangan (${language})`
          };
          if (sourceMsg[response.data.source]) {
            setUploadSuccess(sourceMsg[response.data.source]);
            setTimeout(() => setUploadSuccess(''), 3000);
          }
        } catch {
          setTitle('');
          setShortDesc('');
          setFullDesc('');
        }
      };
      loadListing();
    }
  }, [language]);

  const fetchApps = async () => {
    try {
      const response = await appAPI.getAll(serviceAccountId);
      setApps(response.data);
    } catch (error) {
      console.error('Error fetching apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGraphics = async (appId) => {
    try {
      const response = await graphicAPI.getAll(appId);
      setSavedGraphics(response.data);
      // Preview'ga ham o'rnatish
      const icon = response.data.find(g => g.graphic_type === 'icon');
      const feature = response.data.find(g => g.graphic_type === 'featureGraphic');
      const screenshots = response.data.filter(g => g.graphic_type === 'phoneScreenshots');
      // Production da nginx orqali (VITE_API_URL bo'sh), development da API URL ishlatish
      const apiUrl = import.meta.env.VITE_API_URL;
      const baseURL = apiUrl ? apiUrl : window.location.origin;
      setPreviewImages({
        icon: icon ? `${baseURL}${icon.url}` : null,
        featureGraphic: feature ? `${baseURL}${feature.url}` : null,
        screenshots: screenshots.map(s => `${baseURL}${s.url}`)
      });
    } catch (err) {
      console.error('Error fetching graphics:', err);
    }
  };

  const deleteGraphic = async (graphicId, graphicType) => {
    try {
      await graphicAPI.delete(graphicId);
      setSavedGraphics(prev => prev.filter(g => g.id !== graphicId));
      // Preview'dan ham o'chirish
      if (graphicType === 'icon') {
        setPreviewImages(prev => ({ ...prev, icon: null }));
      } else if (graphicType === 'featureGraphic') {
        setPreviewImages(prev => ({ ...prev, featureGraphic: null }));
      } else if (graphicType === 'phoneScreenshots') {
        setPreviewImages(prev => ({
          ...prev,
          screenshots: prev.screenshots.filter((_, i) => {
            const ss = savedGraphics.filter(g => g.graphic_type === 'phoneScreenshots');
            return ss[i]?.id !== graphicId;
          })
        }));
      }
      setUploadSuccess(t('deleted'));
      setTimeout(() => setUploadSuccess(''), 2000);
    } catch (err) {
      alert(t('error') + ': ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleSyncApps = async () => {
    setSyncing(true);
    try {
      await appAPI.sync(serviceAccountId);
      await fetchApps();
    } catch (error) {
      console.error('Error syncing apps:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleAddApps = async () => {
    if (!newPackageNames.trim()) {
      return;
    }

    setAdding(true);
    try {
      const packageNames = newPackageNames
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);

      const response = await appAPI.add(packageNames, serviceAccountId);
      
      let message = '';
      if (response.data.added.length > 0) {
        message += ` ${response.data.added.length} ${t('addedApps')}\n\n`;
        message += `${t('addedAppsList')}:\n${response.data.added.join('\n')}`;
      }
      
      if (response.data.failed.length > 0) {
        if (message) message += '\n\n';
        message += `${response.data.failed.length} ${t('failedApps')}:\n${response.data.failed.join('\n')}\n\n`;
        message += t('checkPermissions');
      }
      
      if (message) {
        alert(message);
      }
      
      if (response.data.added.length > 0) {
        setNewPackageNames('');
        setShowAddApp(false);
        await fetchApps();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message;
      alert(t('error') + ': ' + errorMsg + '\n\n' + t('checkPermissions'));
    } finally {
      setAdding(false);
    }
  };

  const handleTranslate = async () => {
    if (!title || !shortDesc || !fullDesc) {
      alert(t('setupFillAll'));
      return;
    }

    setTranslating(true);
    try {
      const response = await listingAPI.translate({
        title,
        short_description: shortDesc,
        full_description: fullDesc,
        source_language: language
      });
      setTranslations(response.data);
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setTranslating(false);
    }
  };

  const handleUpdateListing = () => {
    if (!selectedApp || !title || !shortDesc || !fullDesc) {
      alert(t('setupFillAll'));
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmAndUpload = async () => {
    setShowConfirmDialog(false);
    setUploading(true);
    setSubmitErrors([]);
    
    try {
      const response = await listingAPI.submitForReview({
        package_name: selectedApp.package_name,
        title: title,
        short_description: shortDesc,
        full_description: fullDesc,
        language: language
      }, serviceAccountId);

      // Tarjimalarni yuborish
      if (translations) {
        for (const [lang, trans] of Object.entries(translations)) {
          try {
            await listingAPI.update({
              package_name: selectedApp.package_name,
              language: lang,
              title: trans.title,
              short_description: trans.short_description,
              full_description: trans.full_description
            }, serviceAccountId);
          } catch (e) {
            console.error(`Translation ${lang} error:`, e);
          }
        }
      }

      const r = response.data?.results;
      let msg = ' Play Market\'ga yuborildi!';
      if (r) {
        const parts = [];
        if (r.listing_updated) parts.push('Listing ');
        if (r.graphics_uploaded > 0) parts.push(`${r.graphics_uploaded} ta rasm `);
        if (r.graphics_failed > 0) parts.push(`${r.graphics_failed} ta rasm ✗`);
        if (r.language_used) parts.push(`Til: ${r.language_used}`);
        if (parts.length) msg += '\n' + parts.join(' | ');
        
        // Google Play xatoliklarini ko'rsatish
        if (r.errors?.length > 0) {
          setSubmitErrors(r.errors);
        }
      }
      setUploadSuccess(msg);
      setTimeout(() => setUploadSuccess(''), 8000);
    } catch (error) {
      console.error('Upload error:', error);
      setSubmitErrors([error.response?.data?.detail || error.message]);
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e, graphicType) => {
    const file = e.target.files[0];
    if (!file || !selectedApp) return;

    // Preview uchun rasm URL yaratish
    const imageUrl = URL.createObjectURL(file);
    if (graphicType === 'icon') {
      setPreviewImages(prev => ({ ...prev, icon: imageUrl }));
    } else if (graphicType === 'featureGraphic') {
      setPreviewImages(prev => ({ ...prev, featureGraphic: imageUrl }));
    } else if (graphicType === 'phoneScreenshots') {
      setPreviewImages(prev => ({ 
        ...prev, 
        screenshots: [...prev.screenshots, imageUrl] 
      }));
    }

    const formData = new FormData();
    formData.append('package_name', selectedApp.package_name);
    formData.append('service_account_id', serviceAccountId);
    formData.append('language', language);
    formData.append('graphic_type', graphicType);
    formData.append('file', file);

    try {
      const response = await graphicAPI.upload(formData);
      const msg = response.data?.message || `${graphicType} ${t('uploadSuccess')}`;
      setUploadSuccess(response.data?.uploaded_to_play ? ` ${msg}` : ` ${msg}`);
      setTimeout(() => setUploadSuccess(''), 3000);
      // Grafiklarni qayta yuklash
      fetchGraphics(selectedApp.id);
    } catch (error) {
      alert(error.response?.data?.detail || t('errorOccurred'));
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedApp) return;
    
    try {
      await listingAPI.saveDraft({
        package_name: selectedApp.package_name,
        language: language,
        title: title,
        short_description: shortDesc,
        full_description: fullDesc
      }, serviceAccountId);
      
      setUploadSuccess(t('saved'));
      setTimeout(() => setUploadSuccess(''), 3000);
    } catch (error) {
      alert(t('error') + ': ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleSaveTemplate = async () => {
    if (!title || !shortDesc || !fullDesc) {
      alert(t('setupFillAll'));
      return;
    }

    const templateName = prompt(t('template') + ':');
    if (!templateName) return;

    try {
      await templateAPI.create({
        name: templateName,
        title: title,
        short_description: shortDesc,
        full_description: fullDesc
      });
      alert(t('saved'));
    } catch (error) {
      alert(t('errorOccurred'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => navigate('/dashboard')} className="btn btn-secondary flex items-center gap-2 text-sm sm:text-base px-2 sm:px-4 py-1.5 sm:py-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t('back')}</span>
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>
              <button
                onClick={() => setShowAddApp(true)}
                className="btn btn-primary flex items-center gap-1 sm:gap-2 text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2"
              >
                <Plus className="w-4 h-4" />
                {t('addApp')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-bold mb-4">{t('selectApp')}</h2>
              <div className="space-y-2">
                {apps.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">{t('noApps')}</p>
                    <button
                      onClick={() => setShowAddApp(true)}
                      className="btn btn-primary flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      {t('addApp')}
                    </button>
                  </div>
                ) : (
                  apps.map((app) => (
                    <button
                      key={app.id}
                      onClick={async () => {
                        // Darhol eski ma'lumotlarni tozalash
                        setTitle('');
                        setShortDesc('');
                        setFullDesc('');
                        setTranslations(null);
                        setSavedGraphics([]);
                        setPreviewImages({ icon: null, featureGraphic: null, screenshots: [] });
                        setSelectedApp(app);
                        setSubmitErrors([]);
                        const appLang = app.default_language || 'en-US';
                        setLanguage(appLang);
                        setLoadingData(true);
                        
                        // Listing va grafiklarni parallel yuklash
                        const listingPromise = appAPI.getListing(app.id, appLang).catch(() => null);
                        const graphicsPromise = graphicAPI.getAll(app.id).catch(() => null);
                        
                        const [listingRes, graphicsRes] = await Promise.all([listingPromise, graphicsPromise]);
                        
                        if (listingRes?.data) {
                          setTitle(listingRes.data.title || '');
                          setShortDesc(listingRes.data.short_description || '');
                          setFullDesc(listingRes.data.full_description || '');
                          
                          const sourceMsg = {
                            'google_play': t('uploadSuccess'),
                            'draft': t('saved'),
                            'listing': t('saved')
                          };
                          if (sourceMsg[listingRes.data.source]) {
                            setUploadSuccess(sourceMsg[listingRes.data.source]);
                            setTimeout(() => setUploadSuccess(''), 3000);
                          }
                        }
                        
                        if (graphicsRes?.data) {
                          setSavedGraphics(graphicsRes.data);
                          const icon = graphicsRes.data.find(g => g.graphic_type === 'icon');
                          const feature = graphicsRes.data.find(g => g.graphic_type === 'featureGraphic');
                          const screenshots = graphicsRes.data.filter(g => g.graphic_type === 'phoneScreenshots');
                          const isDocker = import.meta.env.VITE_API_URL?.includes('backend');
                          const baseURL = isDocker ? window.location.origin : (import.meta.env.VITE_API_URL || 'http://localhost:8000');
                          setPreviewImages({
                            icon: icon ? `${baseURL}${icon.url}` : null,
                            featureGraphic: feature ? `${baseURL}${feature.url}` : null,
                            screenshots: screenshots.map(s => `${baseURL}${s.url}`)
                          });
                        }
                        
                        setLoadingData(false);
                        
                        // AI avtomatik analiz
                        aiAnalyze(app);
                      }}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedApp?.id === app.id
                          ? 'border-black bg-gray-900 text-white'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{app.app_name || app.package_name}</p>
                        {app.status === 'review' && (
                          <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px] font-medium flex-shrink-0">{t('inReview')}</span>
                        )}
                        {app.status === 'live' && (
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium flex-shrink-0">Live</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{app.package_name}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {!selectedApp ? (
              <div className="card text-center py-16">
                <p className="text-gray-500">{t('selectAppLeft')}</p>
              </div>
            ) : loadingData ? (
              <div className="card text-center py-16">
                <RefreshCw className="w-8 h-8 text-black animate-spin mx-auto mb-3" />
                <p className="text-gray-500">{t('dataLoading')}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Ilova nomi va o'chirish */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold">{selectedApp.app_name || selectedApp.package_name}</h2>
                    <p className="text-xs text-gray-500">{selectedApp.package_name}</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!confirm(`"${selectedApp.package_name}" ${t('deleteAppConfirm')}`)) return;
                      try {
                        await appAPI.delete(selectedApp.id);
                        setSelectedApp(null);
                        setTitle(''); setShortDesc(''); setFullDesc('');
                        setSavedGraphics([]);
                        setPreviewImages({ icon: null, featureGraphic: null, screenshots: [] });
                        fetchApps();
                        setUploadSuccess(t('appDeleted'));
                        setTimeout(() => setUploadSuccess(''), 3000);
                      } catch (err) {
                        alert(err.response?.data?.detail || t('deleteError'));
                      }
                    }}
                    className="text-black hover:text-black hover:bg-red-50 p-2 rounded-lg transition"
                    title={t('deleteAppTitle')}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {uploadSuccess && (
                  <div className="bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-lg text-sm">
                    {uploadSuccess}
                  </div>
                )}

                {/* AAB Yuklash */}
                <AABUploader
                  packageName={selectedApp.package_name}
                  serviceAccountId={serviceAccountId}
                  onUploadSuccess={(result) => {
                    setUploadSuccess(`${t('uploadSuccess')}: ${result.version_name} (${result.file_size_mb} MB)`);
                    setTimeout(() => setUploadSuccess(''), 5000);
                  }}
                />

                {/* AI Loading Banner */}
                {aiLoading && (
                  <div className="card bg-white border-black">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                      <div>
                        <p className="font-semibold text-black">{t('aiAnalyzing')}</p>
                        <p className="text-sm text-black">{t('aiAnalyzingDesc')}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Maslahatlar va Qolgan Tasklar */}
                {(aiAdvice.length > 0 || aiTasks.length > 0) && !aiLoading && (
                  <div className="space-y-3">
                    {/* Maslahatlar */}
                    {aiAdvice.length > 0 && (
                      <div className="card bg-white border-amber-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-600" />
                            <span className="font-semibold text-black">{t('aiTips')}</span>
                          </div>
                          <button 
                            onClick={() => { setAiAdvice([]); setAiTasks([]); }} 
                            className="text-amber-400 hover:text-amber-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <ul className="space-y-1.5">
                          {aiAdvice.map((advice, i) => (
                            <li key={i} className="text-sm text-black flex items-start gap-2">
                              <span>{advice}</span>
                            </li>
                          ))}
                        </ul>
                        {aiAutoApplied && (
                          <p className="text-xs text-black mt-3 font-medium"> {t('aiAutoApplied')}</p>
                        )}
                      </div>
                    )}
                    
                    {/* Qolgan Tasklar */}
                    {aiTasks.length > 0 && (
                      <div className="card bg-white border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-black">{t('remainingTasks')}</span>
                          <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-bold">{aiTasks.length}</span>
                        </div>
                        <ul className="space-y-2">
                          {aiTasks.map((task, i) => (
                            <li key={i} className="text-sm text-black flex items-start gap-2">
                              <span className="w-5 h-5 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="card">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold">{t('storeListing')}</h2>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => aiAnalyze()}
                        disabled={!selectedApp || aiLoading}
                        className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg font-medium text-sm hover:bg-neutral-800 transition-all disabled:opacity-50"
                      >
                        {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {t('aiRewrite')}
                      </button>
                      <button
                        onClick={() => setShowAiModal(true)}
                        disabled={!selectedApp}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
                      >
                        <Zap className="w-4 h-4" />
                        {t('settings')}
                      </button>
                    </div>
                  </div>
                  
                  {/* Error Panel */}
                  {submitErrors.length > 0 && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-black" />
                        <span className="font-semibold text-black">{t('errors')}</span>
                        <button onClick={() => setSubmitErrors([])} className="ml-auto text-black hover:text-black">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {submitErrors.map((err, i) => (
                        <p key={i} className="text-sm text-black ml-7">{err}</p>
                      ))}
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('listingLanguage')} {selectedApp?.default_language && <span className="text-xs text-blue-500">(Play: {selectedApp.default_language})</span>}
                      </label>
                      <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input">
                        <option value="en-US">English (US)</option>
                        <option value="en-GB">English (UK)</option>
                        <option value="ru-RU">Русский</option>
                        <option value="uz">O'zbekcha</option>
                        <option value="es-ES">Español</option>
                        <option value="fr-FR">Français</option>
                        <option value="de-DE">Deutsch</option>
                        <option value="tr-TR">Türkçe</option>
                        <option value="ar">العربية</option>
                        <option value="zh-CN">中文</option>
                        <option value="ja-JP">日本語</option>
                        <option value="ko-KR">한국어</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('appTitle')} <span className="text-gray-400">({t('maxChars')} 30)</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value.slice(0, 30))}
                        className="input"
                        placeholder={t('appTitle')}
                        maxLength={30}
                      />
                      <p className="text-xs text-gray-500 mt-1">{title.length}/30</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('shortDescription')} <span className="text-gray-400">({t('maxChars')} 80)</span>
                      </label>
                      <textarea
                        value={shortDesc}
                        onChange={(e) => setShortDesc(e.target.value.slice(0, 80))}
                        className="input"
                        rows={2}
                        placeholder={t('shortDescription')}
                        maxLength={80}
                      />
                      <p className="text-xs text-gray-500 mt-1">{shortDesc.length}/80</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('fullDescription')} <span className="text-gray-400">({t('maxChars')} 4000)</span>
                      </label>
                      <textarea
                        value={fullDesc}
                        onChange={(e) => setFullDesc(e.target.value.slice(0, 4000))}
                        className="input"
                        rows={8}
                        placeholder={t('fullDescription')}
                        maxLength={4000}
                      />
                      <p className="text-xs text-gray-500 mt-1">{fullDesc.length}/4000</p>
                    </div>

                    <div className="flex gap-2 sm:gap-3 flex-wrap">
                      <button
                        onClick={handleTranslate}
                        disabled={translating}
                        className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                      >
                        <Languages className="w-5 h-5" />
                        {translating ? t('translating') : t('translateAction')}
                      </button>
                      {translations && Object.keys(translations).length > 0 && (
                        <button
                          onClick={() => setShowTranslationManager(true)}
                          className="btn bg-black text-white hover:bg-neutral-800 flex items-center gap-2"
                        >
                          <Eye className="w-5 h-5" />
                          {Object.keys(translations).length} {t('langCount')}
                        </button>
                      )}
                      <button
                        onClick={handleSaveDraft}
                        className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Save className="w-5 h-5" />
                        {t('saveDraftBtn')}
                      </button>
                      <button
                        onClick={handleSaveTemplate}
                        className="btn btn-secondary flex items-center gap-2"
                      >
                        <Save className="w-5 h-5" />
                        {t('templateBtn')}
                      </button>
                    </div>

                    {translations && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-gray-900 font-medium">
                           {Object.keys(translations).length} {t('translatedTo')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-xl font-bold mb-6">{t('graphics')}</h2>
                  
                  <div className="space-y-4">
                    {/* Ikonka */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('icon')} (512x512 px)
                      </label>
                      {(() => {
                        const iconGraphic = savedGraphics.find(g => g.graphic_type === 'icon');
                        return iconGraphic ? (
                          <div className="relative inline-block">
                            <img src={iconGraphic.url} alt="Icon" className="w-24 h-24 rounded-lg border border-gray-200 object-cover" />
                            <button
                              onClick={() => deleteGraphic(iconGraphic.id, 'icon')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <label htmlFor="icon-upload" className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 cursor-pointer hover:bg-blue-600 shadow">
                              <RefreshCw className="w-3 h-3" />
                            </label>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <label htmlFor="icon-upload" className="cursor-pointer">
                              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">{t('uploadIcon')}</p>
                            </label>
                          </div>
                        );
                      })()}
                      <input
                        type="file"
                        onChange={(e) => handleImageUpload(e, 'icon')}
                        accept="image/png"
                        className="hidden"
                        id="icon-upload"
                      />
                    </div>

                    {/* Feature Graphic */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('featureGraphic')} (1024x500 px)
                      </label>
                      {(() => {
                        const fgGraphic = savedGraphics.find(g => g.graphic_type === 'featureGraphic');
                        return fgGraphic ? (
                          <div className="relative">
                            <img src={fgGraphic.url} alt="Feature" className="w-full h-32 rounded-lg border border-gray-200 object-cover" />
                            <button
                              onClick={() => deleteGraphic(fgGraphic.id, 'featureGraphic')}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <label htmlFor="feature-upload" className="absolute bottom-2 right-2 bg-blue-500 text-white rounded-full p-1 cursor-pointer hover:bg-blue-600 shadow">
                              <RefreshCw className="w-3 h-3" />
                            </label>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <label htmlFor="feature-upload" className="cursor-pointer">
                              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">{t('uploadFeature')}</p>
                            </label>
                          </div>
                        );
                      })()}
                      <input
                        type="file"
                        onChange={(e) => handleImageUpload(e, 'featureGraphic')}
                        accept="image/png"
                        className="hidden"
                        id="feature-upload"
                      />
                    </div>

                    {/* Skrinshotlar */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('phoneScreenshots')}
                      </label>
                      {(() => {
                        const ssGraphics = savedGraphics.filter(g => g.graphic_type === 'phoneScreenshots');
                        return (
                          <>
                            {ssGraphics.length > 0 && (
                              <div className="flex gap-2 flex-wrap mb-3">
                                {ssGraphics.map((ss) => (
                                  <div key={ss.id} className="relative">
                                    <img src={ss.url} alt="Screenshot" className="w-20 h-36 rounded-lg border border-gray-200 object-cover" />
                                    <button
                                      onClick={() => deleteGraphic(ss.id, 'phoneScreenshots')}
                                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow"
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                              <input
                                type="file"
                                onChange={(e) => handleImageUpload(e, 'phoneScreenshots')}
                                accept="image/png,image/jpeg"
                                className="hidden"
                                id="phone-upload"
                                multiple
                              />
                              <label htmlFor="phone-upload" className="cursor-pointer">
                                <Plus className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                <p className="text-xs text-gray-500">{t('addScreenshot')}</p>
                              </label>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Contact email */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('contactEmail')}</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="input"
                    placeholder="dev@example.com"
                  />
                </div>

                {/* Full Deploy tugma */}
                <button
                  onClick={fullDeploy}
                  disabled={deploying || uploading || !title.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 sm:py-4 bg-black text-white rounded-lg font-medium text-base sm:text-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-2"
                >
                  {deploying ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      {t('deploying')}
                    </>
                  ) : (
                    <>
                      <Rocket className="w-6 h-6" />
                      {t('fullDeploy')}
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-400 text-center mb-4">{t('deployHint')}</p>

                {/* Eski submit tugma */}
                <button
                  onClick={handleUpdateListing}
                  disabled={uploading || deploying || !title.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {t('uploading')}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t('submitListing')}
                    </>
                  )}
                </button>

                {/* Deploy natijalar */}
                {deployResult && (
                  <div className="mt-4 space-y-3">
                    {/* Bajarilgan ishlar */}
                    {deployResult.steps?.length > 0 && (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-gray-900">{t('completed')}</span>
                        </div>
                        <ul className="space-y-1">
                          {deployResult.steps.map((step, i) => (
                            <li key={i} className="text-sm text-gray-700">{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Qo'lda qilish kerak bo'lgan tasklar */}
                    {deployResult.manual_tasks?.length > 0 && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                            <span className="font-semibold text-amber-800">{t('manualTasks')}</span>
                          </div>
                        </div>
                        <ul className="space-y-1.5">
                          {deployResult.manual_tasks.map((task, i) => (
                            <li key={i} className="text-sm text-amber-700">{task}</li>
                          ))}
                        </ul>
                        {deployResult.play_console_url && (
                          <a
                            href={deployResult.play_console_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all"
                          >
                            <ExternalLink className="w-4 h-4" />
                            {t('openPlayConsole')}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Live Preview */}
          {showPreview && selectedApp && (
            <div className="lg:col-span-1">
              <PhonePreview
                title={title}
                shortDesc={shortDesc}
                fullDesc={fullDesc}
                iconUrl={previewImages.icon || selectedApp.icon_url}
                featureGraphic={previewImages.featureGraphic}
                screenshots={previewImages.screenshots}
              />
            </div>
          )}
        </div>
      </div>

      {/* Ilova Qo'shish Modal */}
      {showAddApp && (
        <AddAppModal
          onClose={() => {
            setShowAddApp(false);
            setNewPackageNames('');
          }}
          onAdd={async (packageNames) => {
            console.log('onAdd called in AppManagement, packageNames:', packageNames);
            console.log('serviceAccountId:', serviceAccountId);
            setAdding(true);
            try {
              const pkgList = packageNames
                .split('\n')
                .map(name => name.trim())
                .filter(name => name.length > 0);

              console.log('Calling API with pkgList:', pkgList);
              const response = await appAPI.add(pkgList, serviceAccountId);
              console.log('API response:', response.data);
              
              let message = '';
              if (response.data.added && response.data.added.length > 0) {
                message += ` ${response.data.added.length} ${t('addedApps')}\n\n`;
                message += `${t('addedAppsList')}:\n${response.data.added.join('\n')}`;
              }
              
              if (response.data.failed && response.data.failed.length > 0) {
                if (message) message += '\n\n';
                message += `${response.data.failed.length} ${t('failedApps')}:\n${response.data.failed.join('\n')}\n\n`;
                message += `${t('failedReason')}`;
              }
              
              if (!message) {
                message = `${t('appNotAdded')}\n\n${t('possibleReasons')}:\n`;
                message += `• ${t('alreadyAdded')}\n`;
                message += `• ${t('noSaPermission')}\n`;
                message += `• ${t('wrongPackageName')}`;
              }
              
              alert(message);
              
              setShowAddApp(false);
              fetchApps();
            } catch (error) {
              console.error('Error:', error);
              alert(t('error') + ':\n\n' + (error.response?.data?.detail || error.message));
            } finally {
              setAdding(false);
            }
          }}
          isAdding={adding}
        />
      )}

      {/* Translation Manager Modal */}
      {showTranslationManager && (
        <TranslationManager
          translations={translations}
          onUpdate={(langCode, data) => {
            setTranslations({
              ...translations,
              [langCode]: data
            });
          }}
          onClose={() => setShowTranslationManager(false)}
        />
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <ConfirmDialog
          title={t('confirmSendTitle')}
          message={t('confirmSendMsg')}
          details={[
            `${t('app')}: ${selectedApp?.app_name || selectedApp?.package_name}`,
            `${t('lang')}: ${selectedApp?.default_language || language}`,
            `Title: ${title}`,
            `${t('translations')}: ${translations ? Object.keys(translations).length + ' ' + t('langCount') : t('noTranslations')}`,
          ]}
          type="warning"
          confirmText={t('yesSend')}
          cancelText={t('noCancel')}
          onConfirm={confirmAndUpload}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b bg-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{t('aiFillListing')}</h3>
                    <p className="text-sm text-white/70">{t('aiFillDesc')}</p>
                  </div>
                </div>
                <button onClick={() => setShowAiModal(false)} className="text-white/70 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4">
              {/* API key connected indicator */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-900 font-medium">{t('aiConnected')}</span>
                <span className="text-xs text-gray-500 ml-auto">llama-3.1-8b</span>
              </div>

              {/* Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Zap className="w-4 h-4 inline mr-1" />
                  {t('aiPromptLabel')}
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="input"
                  rows={3}
                  placeholder={t('aiPromptPlaceholder')}
                />
              </div>

              {/* Analyze Button */}
              <button
                onClick={() => aiAnalyze()}
                disabled={aiLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition-all disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('aiAnalyzing')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {t('aiRewriteWithPrompt')}
                  </>
                )}
              </button>

              {/* AI Result */}
              {aiResult && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-black">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-semibold text-sm">{t('aiResult')}</span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div>
                      <span className="text-xs font-medium text-gray-500">Title ({aiResult.title?.length}/30)</span>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{aiResult.title}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Short Description ({aiResult.short_description?.length}/80)</span>
                      <p className="text-sm text-gray-700 mt-0.5">{aiResult.short_description}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Full Description</span>
                      <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap max-h-48 overflow-y-auto">{aiResult.full_description}</p>
                    </div>
                    
                    {aiResult.tags && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">Tags</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {aiResult.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiResult.category_suggestion && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">{t('categoryLabel')}</span>
                        <p className="text-sm text-gray-700 mt-0.5">{aiResult.category_suggestion}</p>
                      </div>
                    )}
                    
                    {aiResult.improvements?.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">{t('recommendations')}</span>
                        <ul className="mt-1 space-y-1">
                          {aiResult.improvements.map((imp, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                              <span className="text-yellow-500 mt-0.5">💡</span>
                              {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Apply Button */}
                  <div className="flex gap-2">
                    <button
                      onClick={applyAiResult}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg font-medium text-sm hover:bg-neutral-800 transition-all"
                    >
                      {t('apply')}
                    </button>
                    <button
                      onClick={aiAnalyze}
                      disabled={aiLoading}
                      className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                      {t('retry')}
                    </button>
                  </div>
                </div>
              )}

              {/* Errors */}
              {submitErrors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  {submitErrors.map((err, i) => (
                    <p key={i} className="text-sm text-black">{err}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <FeedbackWidget
        show={showFeedback}
        onClose={() => setShowFeedback(false)}
        trigger={feedbackTrigger}
        mode="nps"
      />
    </div>
  );
}
