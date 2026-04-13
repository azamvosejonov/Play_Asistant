import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, LogOut, Settings, Shield } from 'lucide-react';
import logo from '../assets/logo.png';
import { serviceAccountAPI } from '../utils/api';
import LanguageSwitcher from '../components/LanguageSwitcher';
import BetaBadge from '../components/BetaBadge';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <img src={logo} alt="NexusDeploy" className="w-20 h-20 rounded-2xl" />
                <span className="text-xl font-bold">{t('appName')}</span>
                <BetaBadge />
              </div>
              <button onClick={handleLogout} className="btn btn-secondary flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                {t('logout')}
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
              <Settings className="w-10 h-10 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4">{t('welcome')}!</h1>
            <p className="text-gray-600 mb-8">
              {t('noServiceAccounts')}
            </p>
            <button
              onClick={() => navigate('/setup')}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t('addServiceAccount')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src={logo} alt="NexusDeploy" className="w-20 h-20 rounded-2xl" />
              <span className="text-xl font-bold">{t('appName')}</span>
              <BetaBadge />
            </div>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <button onClick={() => navigate('/admin')} className="btn flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700">
                  <Shield className="w-4 h-4" />
                  {t('adminPanel')}
                </button>
              )}
              <button onClick={() => navigate('/setup')} className="btn btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {t('newAccount')}
              </button>
              <button onClick={handleLogout} className="btn btn-secondary flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t('serviceAccounts')}</h1>
          <LanguageSwitcher />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/apps/${account.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden">
                    <img src={logo} alt="NexusDeploy" className="w-20 h-20" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{account.name}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(account.created_at).toLocaleDateString('uz-UZ')}
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => navigate(`/apps/${account.id}`)}
                className="btn btn-primary w-full"
              >
                {t('manageApps')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
