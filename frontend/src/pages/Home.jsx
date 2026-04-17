import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Lock, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal nav — language icon + Get Started */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex justify-between items-center h-14">
            <span className="text-sm font-semibold tracking-tight text-gray-900">{t('appName')}</span>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link to="/register" className="btn btn-primary text-sm px-5 py-2">
                {t('homeGetStarted')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero — big, spacious, confident */}
      <section className="pt-32 sm:pt-44 pb-20 sm:pb-32 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto animate-fade-in-up">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-[1.08] text-balance">
            {t('homeTitle')}
          </h1>
          <p className="mt-6 sm:mt-8 text-lg sm:text-xl text-gray-500 max-w-2xl leading-relaxed">
            {t('homeSubtitle')}
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-start gap-3">
            <Link
              to="/quick-start"
              className="inline-flex items-center gap-2 text-base px-7 py-3.5 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 active:scale-[0.98] transition-all"
            >
              {t('homeTestDrive')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-base px-7 py-3.5 text-gray-600 hover:text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-all"
            >
              {t('login')}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-400">{t('homeTestDriveHint')}</p>
        </div>
      </section>

      {/* Thin divider */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="h-px bg-gray-100"></div>
      </div>

      {/* Features — no boxes, just clean typography */}
      <section className="py-20 sm:py-28 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            <div className="animate-fade-in-delay-1">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 mb-4">
                <Zap className="w-5 h-5 text-gray-900" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('homeFeature1Title')}</h3>
              <p className="text-gray-500 leading-relaxed text-[15px]">
                {t('homeFeature1Desc')}
              </p>
            </div>

            <div className="animate-fade-in-delay-2">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 mb-4">
                <Shield className="w-5 h-5 text-gray-900" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('homeFeature2Title')}</h3>
              <p className="text-gray-500 leading-relaxed text-[15px]">
                {t('homeFeature2Desc')}
              </p>
            </div>

            <div className="animate-fade-in-delay-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 mb-4">
                <Lock className="w-5 h-5 text-gray-900" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('homeFeature3Title')}</h3>
              <p className="text-gray-500 leading-relaxed text-[15px]">
                {t('homeFeature3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Thin divider */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="h-px bg-gray-100"></div>
      </div>

      {/* Bottom CTA */}
      <section className="py-20 sm:py-28 px-5 sm:px-8">
        <div className="max-w-2xl mx-auto text-center animate-fade-in-delay-4">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight text-balance">
            {t('homeCTA')}
          </h2>
          <p className="mt-4 text-gray-500 text-lg">{t('homeFreeDesc')}</p>
          <Link
            to="/register"
            className="mt-8 inline-flex items-center gap-2 text-base px-7 py-3.5 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 active:scale-[0.98] transition-all"
          >
            {t('homeGetStarted')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xs text-gray-400">{t('homePowered')}</span>
          <span className="text-xs text-gray-400">{t('homeFree')}</span>
        </div>
      </footer>
    </div>
  );
}
