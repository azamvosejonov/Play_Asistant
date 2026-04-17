import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send, AlertCircle } from 'lucide-react';
import { feedbackAPI } from '../utils/api';

/**
 * ExitIntentPopup — Foydalanuvchi saytdan foydalanmasdan chiqib ketayotganda chiqadi.
 * Sichqoncha ekran tepasiga yursa (exit intent) yoki tab yopilayotganda ko'rinadi.
 * 
 * Faqat login qilmagan YOKI login qilib, JSON yuklamagan foydalanuvchilarga ko'rinadi.
 */
export default function ExitIntentPopup() {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [otherText, setOtherText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reasons = [
    { id: 'no_json', label: t('exitNoJson') },
    { id: 'no_trust', label: t('exitNoTrust') },
    { id: 'unclear', label: t('exitUnclear') },
    { id: 'just_looking', label: t('exitJustLooking') },
  ];

  useEffect(() => {
    // Agar allaqachon ko'rsatilgan bo'lsa, qayta ko'rsatmaslik
    const alreadyShown = sessionStorage.getItem('exit_intent_shown');
    if (alreadyShown) return;

    const handleMouseLeave = (e) => {
      // Faqat ekran tepasiga chiqqanda
      if (e.clientY <= 5 && !sessionStorage.getItem('exit_intent_shown')) {
        // Login qilinganmi tekshirish — agar foydalanuvchi hali foydalanmagan bo'lsa
        const token = localStorage.getItem('token');
        const hasUsedApp = localStorage.getItem('quickstart_data') || localStorage.getItem('has_deployed');
        
        // Foydalanmagan yoki login qilmaganlarni ko'rsatish
        if (!hasUsedApp) {
          setShow(true);
          sessionStorage.setItem('exit_intent_shown', 'true');
        }
      }
    };

    // beforeunload ham ushlab olish
    const handleBeforeUnload = () => {
      if (!sessionStorage.getItem('exit_intent_shown')) {
        const token = localStorage.getItem('token');
        const hasUsedApp = localStorage.getItem('quickstart_data') || localStorage.getItem('has_deployed');
        if (!hasUsedApp) {
          // beforeunload'da popup ko'rsatib bo'lmaydi, lekin beacon yuborish mumkin
          const data = JSON.stringify({
            feedback_type: 'exit_intent',
            reason: 'page_close',
            trigger: 'exit',
            page: window.location.pathname
          });
          navigator.sendBeacon('/api/feedback/anonymous', new Blob([data], { type: 'application/json' }));
        }
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleSubmit = async () => {
    if (!selectedReason) return;
    
    try {
      const token = localStorage.getItem('token');
      const apiCall = token ? feedbackAPI.submit : feedbackAPI.submitAnonymous;
      
      await apiCall({
        feedback_type: 'exit_intent',
        reason: selectedReason === 'other' ? otherText : selectedReason,
        trigger: 'exit',
        page: window.location.pathname
      });
      setSubmitted(true);
      setTimeout(() => setShow(false), 2000);
    } catch (err) {
      console.error('Exit intent error:', err);
      setShow(false);
    }
  };

  if (!show) return null;

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3"><AlertCircle className="w-6 h-6 text-gray-900" /></div>
          <h3 className="text-lg font-bold text-gray-900">{t('exitThanks')}</h3>
          <p className="text-gray-500 text-sm mt-1">{t('exitThanksDesc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t('exitTitle')}</h3>
              <p className="text-sm text-gray-500">{t('exitSubtitle')}</p>
            </div>
          </div>
          <button onClick={() => setShow(false)} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {reasons.map((reason) => (
            <button
              key={reason.id}
              onClick={() => setSelectedReason(reason.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                selectedReason === reason.id
                  ? 'border-gray-900 bg-gray-50 text-gray-900'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {reason.label}
            </button>
          ))}
        </div>

        {/* Optional comment */}
        <textarea
          value={otherText}
          onChange={(e) => setOtherText(e.target.value)}
          placeholder={t('exitOtherPlaceholder')}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-1 focus:ring-black mb-4"
          rows={2}
        />

        <div className="flex gap-3">
          <button
            onClick={() => setShow(false)}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all text-sm"
          >
            {t('exitClose')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedReason}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-neutral-800 disabled:opacity-50 transition-all text-sm"
          >
            <Send className="w-4 h-4" />
            {t('fbSubmit')}
          </button>
        </div>
      </div>
    </div>
  );
}
