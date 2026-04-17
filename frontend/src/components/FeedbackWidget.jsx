import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send, Gift, ThumbsDown, Minus, ThumbsUp, Check } from 'lucide-react';
import { feedbackAPI } from '../utils/api';

/**
 * FeedbackWidget — 2 xil rejimda ishlaydi:
 * 1. "emoji" — 3 ta emoji (️  ) — success momentlarida chiqadi
 * 2. "nps" — 0-10 gacha ball — deploy/translate muvaffaqiyatidan keyin
 * 
 * Props:
 * - show: boolean
 * - onClose: () => void
 * - trigger: string (deploy_success, translate_success, quickstart, etc.)
 * - mode: "emoji" | "nps" (default: "emoji")
 */
export default function FeedbackWidget({ show, onClose, trigger = 'general', mode = 'emoji' }) {
  const { t } = useTranslation();
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [npsScore, setNpsScore] = useState(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!show) return null;

  const emojis = [
    { value: 1, Icon: ThumbsDown, label: t('fbBad') },
    { value: 2, Icon: Minus, label: t('fbOk') },
    { value: 3, Icon: ThumbsUp, label: t('fbGreat') },
  ];

  const handleSubmit = async () => {
    if (mode === 'emoji' && !selectedEmoji) return;
    if (mode === 'nps' && npsScore === null) return;
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const apiCall = token ? feedbackAPI.submit : feedbackAPI.submitAnonymous;
      await apiCall({
        feedback_type: mode,
        rating: mode === 'emoji' ? selectedEmoji : npsScore,
        comment: comment || null,
        trigger,
        page: window.location.pathname
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setSelectedEmoji(null);
        setNpsScore(null);
        setComment('');
      }, 2500);
    } catch (err) {
      console.error('Feedback error:', err);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  // Thank you state
  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center" onClick={e => e.stopPropagation()}>
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3"><Check className="w-6 h-6 text-gray-900" /></div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t('fbThanks')}</h3>
          <p className="text-gray-500 text-sm">{t('fbThanksDesc')}</p>
          <p className="mt-3 text-xs text-gray-400">{t('fbReward')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">{t('fbTitle')}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {mode === 'emoji' && (
          <>
            <p className="text-gray-600 text-sm mb-5">{t('fbEmojiQuestion')}</p>
            <div className="flex items-center justify-center gap-4 mb-5">
              {emojis.map((e) => (
                <button
                  key={e.value}
                  onClick={() => setSelectedEmoji(e.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                    selectedEmoji === e.value
                      ? 'bg-gray-100 ring-1 ring-gray-900'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <e.Icon className={`w-6 h-6 ${selectedEmoji === e.value ? 'text-gray-900' : 'text-gray-400'}`} />
                  <span className="text-xs text-gray-500 font-medium">{e.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {mode === 'nps' && (
          <>
            <p className="text-gray-600 text-sm mb-4">{t('fbNpsQuestion')}</p>
            <div className="grid grid-cols-11 gap-1 mb-2">
              {[0,1,2,3,4,5,6,7,8,9,10].map((n) => (
                <button
                  key={n}
                  onClick={() => setNpsScore(n)}
                  className={`py-2 rounded-lg text-sm font-bold transition-all ${
                    npsScore === n
                      ? n <= 6 ? 'bg-red-500 text-white scale-110' : n <= 8 ? 'bg-yellow-500 text-white scale-110' : 'bg-green-500 text-white scale-110'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mb-4 px-1">
              <span>{t('fbNpsLow')}</span>
              <span>{t('fbNpsHigh')}</span>
            </div>
          </>
        )}

        {/* Optional comment */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('fbCommentPlaceholder')}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-1 focus:ring-black mb-4"
          rows={2}
        />

        <button
          onClick={handleSubmit}
          disabled={submitting || (mode === 'emoji' && !selectedEmoji) || (mode === 'nps' && npsScore === null)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-black text-white rounded-xl font-semibold hover:bg-neutral-800 disabled:opacity-50 transition-all"
        >
          <Send className="w-4 h-4" />
          {t('fbSubmit')}
        </button>

        {/* Incentive hint */}
        <p className="text-center text-xs text-gray-400 mt-3">
          {t('fbIncentive')}
        </p>
      </div>
    </div>
  );
}
