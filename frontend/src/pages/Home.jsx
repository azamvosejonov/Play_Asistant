import { Link } from 'react-router-dom';
import { Rocket, Shield, Zap, ArrowRight } from 'lucide-react';
import logo from '../assets/logo.png';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import BetaBadge from '../components/BetaBadge';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src={logo} alt="NexusDeploy" className="w-10 h-10 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl" />
              <span className="text-base sm:text-xl font-bold">{t('appName')}</span>
              <BetaBadge />
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>
              <Link to="/login" className="btn btn-secondary text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2">
                {t('login')}
              </Link>
              <Link to="/register" className="btn btn-primary text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2">
                {t('register')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20">
        <div className="text-center mb-10 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            {t('homeTitle')}
          </h1>
          <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto">
            {t('homeSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link to="/register" className="btn btn-primary flex items-center gap-2 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto justify-center">
              {t('register')}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto text-center">
              {t('login')}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mb-10 sm:mb-16">
          <div className="card text-center p-5 sm:p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
              <Rocket className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">{t('homeFeature1Title')}</h3>
            <p className="text-gray-600">
              {t('homeFeature1Desc')}
            </p>
          </div>

          <div className="card text-center p-5 sm:p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4">
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">{t('homeFeature2Title')}</h3>
            <p className="text-gray-600">
              {t('homeFeature2Desc')}
            </p>
          </div>

          <div className="card text-center p-5 sm:p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">{t('homeFeature3Title')}</h3>
            <p className="text-gray-600">
              {t('homeFeature3Desc')}
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-500 text-sm">
            {t('homePowered')}
          </p>
        </div>
      </div>
    </div>
  );
}
