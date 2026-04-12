import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Users, Package, BarChart3, MessageSquare, Shield, 
  Trash2, Ban, Check, ChevronRight, Send, Clock, AlertCircle,
  CheckCircle, XCircle, RefreshCw, Eye, X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { adminAPI, supportAPI } from '../utils/api';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function AdminPanel() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [apps, setApps] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const res = await adminAPI.getStats();
        setStats(res.data);
      } else if (activeTab === 'users') {
        const res = await adminAPI.getUsers();
        setUsers(res.data);
      } else if (activeTab === 'apps') {
        const res = await adminAPI.getApps();
        setApps(res.data);
      } else if (activeTab === 'support') {
        const res = await supportAPI.getTickets();
        setTickets(res.data);
      }
    } catch (err) {
      console.error('Admin data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openTicket = async (ticketId) => {
    try {
      const res = await supportAPI.getTicket(ticketId);
      setSelectedTicket(res.data);
      setTicketMessages(res.data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const sendReply = async () => {
    if (!newReply.trim() || !selectedTicket) return;
    try {
      await supportAPI.addMessage(selectedTicket.id, newReply);
      setNewReply('');
      openTicket(selectedTicket.id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateTicketStatus = async (ticketId, status) => {
    try {
      await supportAPI.updateStatus(ticketId, status);
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => ({ ...prev, status }));
      }
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleUserActive = async (userId, currentActive) => {
    try {
      await adminAPI.updateUser(userId, { is_active: !currentActive });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm(t('deleteAppConfirm'))) return;
    try {
      await adminAPI.deleteUser(userId);
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || t('error'));
    }
  };

  const tabs = [
    { id: 'dashboard', label: t('dashboard'), icon: BarChart3 },
    { id: 'users', label: t('adminUsers'), icon: Users },
    { id: 'apps', label: t('adminApps'), icon: Package },
    { id: 'support', label: t('support'), icon: MessageSquare },
  ];

  const statusColors = {
    open: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-600',
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Shield className="w-6 h-6 text-purple-600" />
              <span className="text-xl font-bold text-purple-900">{t('adminPanel')}</span>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-56 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSelectedTicket(null); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${
                    activeTab === tab.id 
                      ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-600' 
                      : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                  {tab.id === 'support' && stats?.open_tickets > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{stats.open_tickets}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : (
              <>
                {/* Dashboard */}
                {activeTab === 'dashboard' && stats && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">{t('dashboard')}</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {[
                        { label: t('adminUsers'), value: stats.total_users, icon: Users, color: 'blue' },
                        { label: t('adminApps'), value: stats.total_apps, icon: Package, color: 'green' },
                        { label: t('serviceAccounts'), value: stats.total_service_accounts, icon: Shield, color: 'purple' },
                        { label: t('adminOpenTickets'), value: stats.open_tickets, icon: MessageSquare, color: 'red' },
                      ].map((item, i) => (
                        <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <item.icon className={`w-8 h-8 text-${item.color}-500`} />
                            <span className="text-3xl font-bold">{item.value}</span>
                          </div>
                          <p className="text-sm text-gray-500">{item.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { label: t('adminNewUsers'), value: stats.new_users_week },
                        { label: t('adminListings'), value: stats.total_listings },
                        { label: t('graphics'), value: stats.total_graphics },
                        { label: t('adminDraftApps'), value: stats.draft_apps },
                        { label: t('adminReviewApps'), value: stats.review_apps },
                        { label: t('adminAllTickets'), value: stats.total_tickets },
                      ].map((item, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                          <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                          <p className="text-2xl font-bold">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Users */}
                {activeTab === 'users' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">{t('adminUsers')} ({users.length})</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{t('adminRole')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Accounts</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Apps</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{t('adminDate')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{t('adminAction')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">{u.id}</td>
                              <td className="px-4 py-3 text-sm font-medium">{u.email}</td>
                              <td className="px-4 py-3">
                                {u.is_admin ? (
                                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">Admin</span>
                                ) : (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">User</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm">{u.service_accounts}</td>
                              <td className="px-4 py-3 text-sm">{u.apps}</td>
                              <td className="px-4 py-3 text-xs text-gray-500">{u.created_at?.slice(0, 10)}</td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => toggleUserActive(u.id, u.is_active)}
                                    className={`p-1.5 rounded-lg ${u.is_active ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                    title={u.is_active ? 'Bloklash' : 'Faollashtirish'}
                                  >
                                    {u.is_active ? <Check className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                  </button>
                                  {!u.is_admin && (
                                    <button onClick={() => deleteUser(u.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100" title="O'chirish">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Apps */}
                {activeTab === 'apps' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">{t('adminApps')} ({apps.length})</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Package</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{t('adminName')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">AAB</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{t('graphics')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{t('adminOwner')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {apps.map(a => (
                            <tr key={a.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-mono text-xs">{a.package_name}</td>
                              <td className="px-4 py-3 text-sm font-medium">{a.app_name}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                  a.status === 'review' ? 'bg-yellow-100 text-yellow-700' : 
                                  a.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                }`}>{a.status}</span>
                              </td>
                              <td className="px-4 py-3">
                                {a.has_aab ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-300" />}
                              </td>
                              <td className="px-4 py-3 text-sm">{a.graphics}</td>
                              <td className="px-4 py-3 text-xs text-gray-500">{a.owner_email}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Support */}
                {activeTab === 'support' && (
                  <div className="flex gap-4 h-[calc(100vh-180px)]">
                    {/* Ticket list */}
                    <div className={`${selectedTicket ? 'w-80' : 'w-full'} flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col`}>
                      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-semibold text-sm">{t('support')} ({tickets.length})</h3>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        {tickets.length === 0 ? (
                          <div className="p-8 text-center text-gray-400">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>{t('noTickets')}</p>
                          </div>
                        ) : (
                          tickets.map(ticket => (
                            <button
                              key={ticket.id}
                              onClick={() => openTicket(ticket.id)}
                              className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-all ${
                                selectedTicket?.id === ticket.id ? 'bg-purple-50 border-l-4 border-l-purple-600' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-sm truncate flex-1">{ticket.subject}</span>
                                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full font-semibold ${statusColors[ticket.status]}`}>{ticket.status}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{ticket.user_email}</span>
                                <span>•</span>
                                <span className={`px-1.5 py-0.5 rounded ${priorityColors[ticket.priority]}`}>{ticket.priority}</span>
                                <span>•</span>
                                <span>{ticket.message_count} {t('message')}</span>
                              </div>
                              {ticket.last_message && (
                                <p className="text-xs text-gray-400 mt-1 truncate">
                                  {ticket.last_message_admin ? '👨‍💼 ' : '👤 '}{ticket.last_message}
                                </p>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Chat */}
                    {selectedTicket && (
                      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                        {/* Chat header */}
                        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-sm">{selectedTicket.subject}</h3>
                            <p className="text-xs text-gray-500">{selectedTicket.user_email} • {selectedTicket.category}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedTicket.status}
                              onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                              className="text-xs border rounded-lg px-2 py-1"
                            >
                              <option value="open">Open</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                            <button onClick={() => setSelectedTicket(null)} className="p-1 hover:bg-gray-200 rounded">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                          {ticketMessages.map(m => (
                            <div key={m.id} className={`flex ${m.is_admin ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                m.is_admin 
                                  ? 'bg-purple-600 text-white rounded-br-md' 
                                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
                              }`}>
                                <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                                <p className={`text-xs mt-1 ${m.is_admin ? 'text-purple-200' : 'text-gray-400'}`}>
                                  {m.sender_name} • {new Date(m.created_at).toLocaleString('uz-UZ')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Reply input */}
                        <div className="p-3 border-t border-gray-200 bg-gray-50">
                          <div className="flex gap-2">
                            <input
                              value={newReply}
                              onChange={(e) => setNewReply(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendReply()}
                              placeholder={t('writeMessage')}
                              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button
                              onClick={sendReply}
                              disabled={!newReply.trim()}
                              className="px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
