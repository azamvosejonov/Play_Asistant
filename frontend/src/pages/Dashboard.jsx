import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, LogOut, Settings, Shield, ArrowRight, ChevronRight } from 'lucide-react';
import { serviceAccountAPI } from '../utils/api';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Dashboard({ isAdmin }) {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await serviceAccountAPI.getAll();
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-5 sm:px-8">
            <div className="flex justify-between items-center h-14">
              <span className="text-sm font-semibold tracking-tight text-gray-900">{t('appName')}</span>
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <button onClick={handleLogout} className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all">
                  <LogOut className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-xl mx-auto px-5 py-16 sm:py-24 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">{t('welcome')}</h1>
          <p className="text-gray-500 mt-2 text-lg">{t('qsDashboardSubtitle')}</p>

          <div className="mt-10">
            <button
              onClick={() => navigate('/setup')}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left group"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{t('qsDashboardSetup')}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{t('qsDashboardSetupDesc')}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="flex justify-between items-center h-14">
            <span className="text-sm font-semibold tracking-tight text-gray-900">{t('appName')}</span>
            <div className="flex items-center gap-1.5">
              {isAdmin && (
                <button onClick={() => navigate('/admin')} className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all" title={t('adminPanel')}>
                  <Shield className="w-[18px] h-[18px]" />
                </button>
              )}
              <LanguageSwitcher />
              <button onClick={() => navigate('/setup')} className="btn btn-primary flex items-center gap-1.5 text-sm px-4 py-1.5 ml-1">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{t('newAccount')}</span>
              </button>
              <button onClick={handleLogout} className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all">
                <LogOut className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">{t('serviceAccounts')}</h1>

        <div className="space-y-2">
          {accounts.map((account) => (
            <button
              key={account.id}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left group"
              onClick={() => navigate(`/apps/${account.id}`)}
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Settings className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{account.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(account.created_at).toLocaleDateString('uz-UZ')}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
