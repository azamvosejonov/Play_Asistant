import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Loader2, CheckCircle, Eye, EyeOff, ArrowLeft, RefreshCw, Zap, Upload, Image as ImageIcon, X, Plus, Trash2 } from 'lucide-react';
import { aiAPI, feedbackAPI, serviceAccountAPI, deployAPI } from '../utils/api';
import PhonePreview from '../components/PhonePreview';
import FeedbackWidget from '../components/FeedbackWidget';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function QuickStart({ isAuthenticated = false }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
  
  // Step tracking: 1 = enter info, 2 = show result, 3 = prompt for JSON
  const [step, setStep] = useState(1);
  
  // Step 1 inputs
  const [appName, setAppName] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [language, setLanguage] = useState('en-US');
  
  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  
  // Step 2 result
  const [result, setResult] = useState(null);
  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [tags, setTags] = useState([]);
  const [category, setCategory] = useState('');
  const [asoScore, setAsoScore] = useState(0);
  const [asoTips, setAsoTips] = useState([]);
  const [showPreview, setShowPreview] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Rasmlar
  const [iconFile, setIconFile] = useState(null); // data URL
  const [featureGraphic, setFeatureGraphic] = useState(null); // data URL
  const [screenshots, setScreenshots] = useState([]); // data URL array
  
  // Service account & deploy state
  const [serviceAccounts, setServiceAccounts] = useState([]);
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState(null);
  const [deployError, setDeployError] = useState('');
  const [jsonUploading, setJsonUploading] = useState(false);
  const [jsonError, setJsonError] = useState('');
  const [jsonName, setJsonName] = useState('');

  // Rasm yuklash funksiyasi
  const handleImageFile = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      if (type === 'icon') setIconFile(dataUrl);
      else if (type === 'feature') setFeatureGraphic(dataUrl);
      else if (type === 'screenshot') {
        setScreenshots(prev => prev.length < 8 ? [...prev, dataUrl] : prev);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // reset input
  };

  const removeScreenshot = (index) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  // Login qilgandan keyin qaytib kelganda — saqlangan ma'lumotlarni tiklash
  useEffect(() => {
    const saved = localStorage.getItem('quickstart_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setAppName(data.appName || '');
        setTitle(data.title || '');
        setShortDesc(data.shortDesc || '');
        setFullDesc(data.fullDesc || '');
        setTags(data.tags || []);
        setCategory(data.category || '');
        setLanguage(data.language || 'en-US');
        setIconFile(data.iconFile || null);
        setFeatureGraphic(data.featureGraphic || null);
        setScreenshots(data.screenshots || []);
        setResult(data);
        if (data.title) {
          setStep(2);
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    // Agar foydalanuvchi tizimga kirgan bo'lsa — service account bormi tekshirish
    if (isAuthenticated) {
      serviceAccountAPI.getAll().then(res => {
        setServiceAccounts(res.data || []);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  // Deploy qilish (agar service account mavjud bo'lsa)
  const handleDirectDeploy = async (accountId) => {
    setDeploying(true);
    setDeployError('');
    setDeployResult(null);
    try {
      const res = await deployAPI.fullDeploy({
        package_name: appName,
        title: title,
        short_description: shortDesc,
        full_description: fullDesc,
        contact_email: 'dev@example.com',
        language: language
      }, accountId);
      setDeployResult(res.data.results);
      localStorage.removeItem('quickstart_data');
      localStorage.setItem('has_deployed', 'true');
    } catch (err) {
      setDeployError(err.response?.data?.detail || err.message);
    } finally {
      setDeploying(false);
    }
  };

  // JSON faylni shu sahifada yuklash
  const handleJsonUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      setJsonError(t('qsJsonOnlyJson'));
      return;
    }
    setJsonUploading(true);
    setJsonError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', jsonName || file.name.replace('.json', ''));
      await serviceAccountAPI.upload(formData);
      // Qayta yuklash
      const res = await serviceAccountAPI.getAll();
      setServiceAccounts(res.data || []);
    } catch (err) {
      setJsonError(err.response?.data?.detail || t('qsJsonUploadError'));
    } finally {
      setJsonUploading(false);
      e.target.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!appName.trim()) return;
    
    setAiLoading(true);
    setAiError('');
    
    try {
      const res = await aiAPI.quickGenerate({
        app_name: appName,
        app_description: appDescription,
        language: language,
        groq_api_key: GROQ_API_KEY
      });
      
      if (res.data.success) {
        const data = res.data.data;
        setResult(data);
        setTitle(data.title || '');
        setShortDesc(data.short_description || '');
        setFullDesc(data.full_description || '');
        setTags(data.tags || []);
        setCategory(data.category_suggestion || '');
        setAsoScore(data.aso_score || 0);
        setAsoTips(data.aso_tips || []);
        setStep(2);
        // 3 soniya keyin feedback so'rash
        setTimeout(() => setShowFeedback(true), 3000);
      } else {
        setAiError(res.data.error || t('qsAiError'));
      }
    } catch (err) {
      setAiError(err.response?.data?.detail || t('qsAiError'));
    } finally {
      setAiLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const res = await aiAPI.quickGenerate({
        app_name: appName,
        app_description: appDescription,
        language: language,
        groq_api_key: GROQ_API_KEY
      });
      if (res.data.success) {
        const data = res.data.data;
        setResult(data);
        setTitle(data.title || '');
        setShortDesc(data.short_description || '');
        setFullDesc(data.full_description || '');
        setTags(data.tags || []);
        setCategory(data.category_suggestion || '');
        setAsoScore(data.aso_score || 0);
        setAsoTips(data.aso_tips || []);
      }
    } catch (err) {
      setAiError(err.response?.data?.detail || t('qsAiError'));
    } finally {
      setAiLoading(false);
    }
  };

  const handleDeployClick = () => {
    // Save the generated data to localStorage so it can be used after login/setup
    localStorage.setItem('quickstart_data', JSON.stringify({
      title, shortDesc, fullDesc, tags, category, language, appName,
      iconFile, featureGraphic, screenshots
    }));
    if (!isAuthenticated) {
      // Login qilmagan — ro'yxatdan o'tish sahifasiga yo'naltirish
      navigate('/register');
      return;
    }
    setStep(3);
  };

  // STEP 1: Enter app name and description
  if (step === 1) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')} className="btn btn-secondary flex items-center gap-2 text-sm">
                <ArrowLeft className="w-4 h-4" />
                {t('back')}
              </button>
              <LanguageSwitcher />
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 py-8 sm:py-16">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              {t('qsTitle')}
            </h1>
            <p className="text-lg text-gray-600 max-w-lg mx-auto">
              {t('qsSubtitle')}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <span className="text-sm font-medium text-black">{t('qsStep1Label')}</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <span className="text-sm text-gray-400">{t('qsStep2Label')}</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <span className="text-sm text-gray-400">{t('qsStep3Label')}</span>
            </div>
          </div>

          {/* Form */}
          <div className="card p-6 sm:p-8">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('qsAppName')} <span className="text-black">*</span>
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="input text-lg"
                  placeholder={t('qsAppNamePlaceholder')}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('qsAppDesc')}
                </label>
                <textarea
                  value={appDescription}
                  onChange={(e) => setAppDescription(e.target.value)}
                  className="input"
                  rows={4}
                  placeholder={t('qsAppDescPlaceholder')}
                />
                <p className="text-xs text-gray-400 mt-1">{t('qsAppDescHint')}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('listingLanguage')}
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

              {aiError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {aiError}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={!appName.trim() || aiLoading}
                className="w-full flex items-center justify-center gap-3 py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    {t('qsGenerating')}
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    {t('qsGenerateBtn')}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Motivational hint */}
          <p className="text-center text-sm text-gray-400 mt-6">
            {t('qsHint')}
          </p>
        </div>
      </div>
    );
  }

  // STEP 2: Show result + "Deploy to Play?" CTA
  if (step === 2) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button onClick={() => setStep(1)} className="btn btn-secondary flex items-center gap-2 text-sm">
                <ArrowLeft className="w-4 h-4" />
                {t('back')}
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="btn btn-secondary flex items-center gap-2 text-sm"
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span className="hidden sm:inline">{t('livePreview')}</span>
                </button>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-black">{t('qsStep1Label')}</span>
            </div>
            <div className="w-8 h-0.5 bg-black"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <span className="text-sm font-medium text-black">{t('qsStep2Label')}</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <span className="text-sm text-gray-400">{t('qsStep3Label')}</span>
            </div>
          </div>

          {/* Success banner */}
          <div className="border border-gray-200 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-gray-900" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">{t('qsResultTitle')}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{t('qsResultSubtitle')}</p>
              </div>
              {asoScore > 0 && (
                <div className="hidden sm:flex flex-col items-center">
                  <div className="text-2xl font-bold text-gray-900">{asoScore}</div>
                  <div className="text-xs text-gray-500">ASO Score</div>
                </div>
              )}
            </div>
          </div>

          <div className={`grid grid-cols-1 ${showPreview ? 'lg:grid-cols-3' : 'lg:grid-cols-1 max-w-3xl mx-auto'} gap-6`}>
            {/* Editable listing */}
            <div className={showPreview ? 'lg:col-span-2' : ''}>
              <div className="card p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">{t('storeListing')}</h3>
                  <button
                    onClick={handleRegenerate}
                    disabled={aiLoading}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all disabled:opacity-50"
                  >
                    {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {t('qsRegenerate')}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('appTitle')} <span className="text-gray-400">({title.length}/30)</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, 30))}
                    className="input"
                    maxLength={30}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('shortDescription')} <span className="text-gray-400">({shortDesc.length}/80)</span>
                  </label>
                  <textarea
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value.slice(0, 80))}
                    className="input"
                    rows={2}
                    maxLength={80}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('fullDescription')} <span className="text-gray-400">({fullDesc.length}/4000)</span>
                  </label>
                  <textarea
                    value={fullDesc}
                    onChange={(e) => setFullDesc(e.target.value.slice(0, 4000))}
                    className="input"
                    rows={10}
                    maxLength={4000}
                  />
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category */}
                {category && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">{t('categoryLabel')}:</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">{category}</span>
                  </div>
                )}

                {/* Rasmlar yuklash */}
                <div className="border-t border-gray-100 pt-5">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-black" />
                    {t('qsImages')}
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {/* Icon */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('qsIcon')} <span className="text-gray-400">(512×512)</span>
                      </label>
                      {iconFile ? (
                        <div className="relative w-24 h-24 group">
                          <img src={iconFile} alt="Icon" className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-200" />
                          <button onClick={() => setIconFile(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all">
                          <Plus className="w-6 h-6 text-gray-400" />
                          <span className="text-xs text-gray-400 mt-1">PNG</span>
                          <input type="file" accept="image/png" onChange={(e) => handleImageFile(e, 'icon')} className="hidden" />
                        </label>
                      )}
                    </div>

                    {/* Feature Graphic */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('qsFeatureGraphic')} <span className="text-gray-400">(1024×500)</span>
                      </label>
                      {featureGraphic ? (
                        <div className="relative group">
                          <img src={featureGraphic} alt="Feature" className="w-full h-24 rounded-xl object-cover border-2 border-gray-200" />
                          <button onClick={() => setFeatureGraphic(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all">
                          <Plus className="w-6 h-6 text-gray-400" />
                          <span className="text-xs text-gray-400 mt-1">PNG</span>
                          <input type="file" accept="image/png" onChange={(e) => handleImageFile(e, 'feature')} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Screenshots */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('qsScreenshots')} <span className="text-gray-400">({screenshots.length}/8)</span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {screenshots.map((ss, i) => (
                        <div key={i} className="relative w-16 h-28 group flex-shrink-0">
                          <img src={ss} alt={`Screenshot ${i+1}`} className="w-16 h-28 rounded-lg object-cover border-2 border-gray-200" />
                          <button onClick={() => removeScreenshot(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {screenshots.length < 8 && (
                        <label className="flex flex-col items-center justify-center w-16 h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all flex-shrink-0">
                          <Plus className="w-5 h-5 text-gray-400" />
                          <span className="text-[10px] text-gray-400 mt-1">PNG/JPG</span>
                          <input type="file" accept="image/png,image/jpeg" onChange={(e) => handleImageFile(e, 'screenshot')} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* ASO Tips */}
                {asoTips.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-amber-600" />
                      <span className="font-semibold text-amber-800">{t('aiTips')}</span>
                    </div>
                    <ul className="space-y-1">
                      {asoTips.map((tip, i) => (
                        <li key={i} className="text-sm text-amber-700">• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {aiError}
                  </div>
                )}
              </div>

              {/* Deploy CTA */}
              <div className="mt-6 border border-gray-200 rounded-xl p-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t('qsDeployQuestion')}
                  </h3>
                  <p className="text-gray-500 mb-6 text-sm">
                    {t('qsDeployHint')}
                  </p>
                  <button
                    onClick={handleDeployClick}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition-all"
                  >
                    {t('qsDeployBtn')}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="lg:col-span-1">
                <PhonePreview
                  title={title}
                  shortDesc={shortDesc}
                  fullDesc={fullDesc}
                  iconUrl={iconFile}
                  featureGraphic={featureGraphic}
                  screenshots={screenshots}
                />
              </div>
            )}
          </div>
        </div>

        <FeedbackWidget
          show={showFeedback}
          onClose={() => setShowFeedback(false)}
          trigger="quickstart"
          mode="emoji"
        />
      </div>
    );
  }

  // STEP 3: Deploy yoki JSON ulash
  if (step === 3) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button onClick={() => setStep(2)} className="btn btn-secondary flex items-center gap-2 text-sm">
                <ArrowLeft className="w-4 h-4" />
                {t('back')}
              </button>
              <LanguageSwitcher />
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-black">{t('qsStep1Label')}</span>
            </div>
            <div className="w-8 h-0.5 bg-black"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-black">{t('qsStep2Label')}</span>
            </div>
            <div className="w-8 h-0.5 bg-black"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <span className="text-sm font-medium text-black">{t('qsStep3Label')}</span>
            </div>
          </div>

          {/* Summary of what's ready */}
          <div className="border border-gray-200 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-5 h-5 text-gray-900" />
              <span className="font-semibold text-gray-900">{t('qsReadyTitle')}</span>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p>{t('appTitle')}: <span className="text-gray-900 font-medium">{title}</span></p>
              <p>{t('shortDescription')}: <span className="text-gray-900 font-medium">{shortDesc.slice(0, 40)}...</span></p>
              <p>{t('fullDescription')}: <span className="text-gray-900 font-medium">{fullDesc.length} {t('qsChars')}</span></p>
              {iconFile && <p>{t('qsIcon')}</p>}
              {featureGraphic && <p>{t('qsFeatureGraphic')}</p>}
              {screenshots.length > 0 && <p>{t('qsScreenshots')}: <span className="text-gray-900 font-medium">{screenshots.length}</span></p>}
            </div>
          </div>

          {/* Deploy natijasi */}
          {deployResult && (
            <div className="border border-gray-200 rounded-xl p-5 mb-6 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-gray-900" />
                <span className="font-semibold text-gray-900">{t('completed')}</span>
              </div>
              {deployResult.steps?.map((s, i) => (
                <p key={i} className="text-sm text-gray-600">{s}</p>
              ))}
              <button onClick={() => { localStorage.removeItem('quickstart_data'); navigate('/dashboard'); }}
                className="mt-4 w-full py-3 bg-black hover:bg-neutral-800 text-white rounded-lg font-medium transition-all">
                {t('dashboard')} →
              </button>
            </div>
          )}

          {deployError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-700">{deployError}</p>
            </div>
          )}

          {/* Agar service account mavjud — to'g'ridan-to'g'ri deploy */}
          {!deployResult && serviceAccounts.length > 0 && (
            <div className="card p-6 sm:p-8 mb-4">
              <div className="text-center mb-5">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {t('qsDeployReady')}
                </h2>
                <p className="text-gray-600 text-sm">
                  {t('qsDeployReadyDesc')}
                </p>
              </div>

              <div className="space-y-3">
                {serviceAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => handleDirectDeploy(acc.id)}
                    disabled={deploying}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition-all disabled:opacity-50"
                  >
                    {deploying ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <ArrowRight className="w-5 h-5" />
                    )}
                    {deploying ? t('loading') : `Deploy → ${acc.name}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* JSON ulash — agar service account yo'q bo'lsa */}
          {!deployResult && serviceAccounts.length === 0 && (
            <div className="card p-6 sm:p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {t('qsJsonTitle')}
                </h2>
                <p className="text-gray-600">
                  {t('qsJsonSubtitle')}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('qsJsonName')}
                  </label>
                  <input
                    type="text"
                    value={jsonName}
                    onChange={(e) => setJsonName(e.target.value)}
                    className="input"
                    placeholder={t('qsJsonNamePlaceholder')}
                  />
                </div>

                {jsonError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {jsonError}
                  </div>
                )}

                <label className={`w-full flex items-center justify-center gap-2 py-3.5 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition-all cursor-pointer ${jsonUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {jsonUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                  {jsonUploading ? t('loading') : t('qsJsonBtn')}
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleJsonUpload}
                    className="hidden"
                    disabled={jsonUploading}
                  />
                </label>
              </div>

              <p className="text-center text-xs text-gray-400 mt-4">
                {t('qsJsonHint')}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
}
