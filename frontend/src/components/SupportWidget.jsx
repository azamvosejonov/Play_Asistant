import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Plus, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supportAPI } from '../utils/api';

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('list'); // list, chat, new
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [newBody, setNewBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEnd = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) loadTickets();
  }, [isOpen]);

  useEffect(() => {
    if (messagesEnd.current) {
      messagesEnd.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadTickets = async () => {
    try {
      const res = await supportAPI.getTickets();
      setTickets(res.data);
      const open = res.data.filter(t => t.status !== 'closed' && t.last_message_admin).length;
      setUnread(open);
    } catch (err) {
      console.error(err);
    }
  };

  const openTicket = async (ticket) => {
    setLoading(true);
    try {
      const res = await supportAPI.getTicket(ticket.id);
      setSelectedTicket(res.data);
      setMessages(res.data.messages || []);
      setView('chat');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    try {
      await supportAPI.addMessage(selectedTicket.id, newMessage);
      setNewMessage('');
      const res = await supportAPI.getTicket(selectedTicket.id);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const createTicket = async () => {
    if (!newSubject.trim() || !newBody.trim()) return;
    setLoading(true);
    try {
      const res = await supportAPI.createTicket({
        subject: newSubject,
        category: newCategory,
        priority: 'medium',
        message: newBody
      });
      setNewSubject('');
      setNewBody('');
      setNewCategory('general');
      await loadTickets();
      // Ochish
      const ticketRes = await supportAPI.getTicket(res.data.id);
      setSelectedTicket(ticketRes.data);
      setMessages(ticketRes.data.messages || []);
      setView('chat');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusLabels = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 bg-black text-white rounded-full shadow-xl hover:bg-neutral-800 transition-all flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{unread}</span>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 z-50 w-full sm:w-96 h-full sm:h-[520px] bg-white sm:rounded-2xl shadow-2xl sm:border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {view !== 'list' && (
                <button onClick={() => { setView('list'); setSelectedTicket(null); }} className="p-1 hover:bg-neutral-800 rounded">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <MessageSquare className="w-5 h-5" />
              <span className="font-semibold">
                {view === 'list' ? t('supportCenter') : view === 'new' ? t('newTicket') : selectedTicket?.subject}
              </span>
            </div>
          </div>

          {/* List view */}
          {view === 'list' && (
            <div className="flex-1 overflow-y-auto">
              <button
                onClick={() => setView('new')}
                className="w-full flex items-center gap-3 px-4 py-3 text-black font-semibold hover:bg-gray-50 border-b border-gray-100"
              >
                <Plus className="w-5 h-5" />
                {t('newTicket')}
              </button>
              {tickets.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  {t('noTickets')}
                </div>
              ) : (
                tickets.map(ticket => (
                  <button
                    key={ticket.id}
                    onClick={() => openTicket(ticket)}
                    className="w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">{ticket.subject}</span>
                      <span className="text-xs">{statusLabels[ticket.status]}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 truncate">{ticket.last_message || t('noTickets')}</p>
                  </button>
                ))
              )}
            </div>
          )}

          {/* New ticket */}
          {view === 'new' && (
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('subject')}</label>
                <input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder={t('subject')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('category')}</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="general">{t('general')}</option>
                  <option value="bug">{t('bug')}</option>
                  <option value="feature">{t('feature')}</option>
                  <option value="billing">{t('billing')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('message')}</label>
                <textarea
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder={t('writeMessage')}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <button
                onClick={createTicket}
                disabled={!newSubject.trim() || !newBody.trim() || loading}
                className="w-full py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-neutral-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {t('send')}
              </button>
            </div>
          )}

          {/* Chat view */}
          {view === 'chat' && selectedTicket && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.is_admin ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${
                      m.is_admin 
                        ? 'bg-gray-100 text-gray-800 rounded-bl-md' 
                        : 'bg-black text-white rounded-br-md'
                    }`}>
                      {m.is_admin && <p className="text-xs font-semibold text-gray-500 mb-0.5">Admin</p>}
                      <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                      <p className={`text-xs mt-1 ${m.is_admin ? 'text-gray-400' : 'text-black'}`}>
                        {new Date(m.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEnd} />
              </div>

              {selectedTicket.status !== 'closed' && (
                <div className="p-3 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder={t('writeMessage')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="px-3 py-2 bg-black text-white rounded-xl hover:bg-neutral-800 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
