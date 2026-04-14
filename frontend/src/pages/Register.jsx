import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import logo from '../assets/logo.png';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../utils/api';
import LanguageSwitcher from '../components/LanguageSwitcher';
import BetaBadge from '../components/BetaBadge';

export default function Register({ onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Parollar mos emas');
      return;
    }

    if (password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register(email, password);
      localStorage.setItem('token', response.data.access_token);
      const adminFlag = response.data.is_admin || false;
      onRegister();
      navigate(adminFlag ? '/admin' : '/setup');
    } catch (err) {
      setError(err.response?.data?.detail || 'Ro\'yxatdan o\'tish xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8">
          <img src={logo} alt="NexusDeploy" className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl mb-3 sm:mb-4 mx-auto" />
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('appName')}</h1>
            <BetaBadge />
          </div>
          <p className="text-gray-600 mt-2">{t('automate')}</p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold mb-6">{t('register')}</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="sizning@email.uz"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('confirm')} {t('password').toLowerCase()}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              {loading ? t('loading') : t('register')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('haveAccount')}{' '}
              <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">
                {t('login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
