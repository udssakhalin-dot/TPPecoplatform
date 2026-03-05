import { useState, useEffect } from 'react';
import { Lock, Bell, Save, Send, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'password' | 'notifications' | 'telegram'>('password');
  
  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStatus, setPasswordStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState({
    email_news: true,
    email_b2b: true,
    push_status: true
  });
  const [notificationStatus, setNotificationStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [notificationLoading, setNotificationLoading] = useState(false);

  // Telegram State
  const [telegramStatus, setTelegramStatus] = useState<{connected: boolean, username?: string} | null>(null);
  const [telegramCode, setTelegramCode] = useState<string | null>(null);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
    fetchTelegramStatus();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/auth/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const fetchTelegramStatus = async () => {
    try {
      const response = await api.get('/auth/telegram/status');
      setTelegramStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch telegram status', error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Новые пароли не совпадают' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Пароль должен быть не менее 6 символов' });
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordStatus({ type: 'success', message: 'Пароль успешно изменен' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setPasswordStatus({ 
        type: 'error', 
        message: error.response?.data?.error || 'Ошибка при смене пароля' 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleNotificationSave = async () => {
    setNotificationLoading(true);
    setNotificationStatus(null);
    try {
      await api.put('/auth/notifications', notifications);
      setNotificationStatus({ type: 'success', message: 'Настройки уведомлений сохранены' });
    } catch (error) {
      setNotificationStatus({ type: 'error', message: 'Ошибка сохранения настроек' });
    } finally {
      setNotificationLoading(false);
    }
  };

  const generateTelegramCode = async () => {
    setTelegramLoading(true);
    try {
      const response = await api.post('/auth/telegram/generate-code');
      setTelegramCode(response.data.code);
    } catch (error) {
      console.error('Failed to generate code', error);
    } finally {
      setTelegramLoading(false);
    }
  };

  const unlinkTelegram = async () => {
    if (!confirm('Вы уверены, что хотите отключить уведомления в Telegram?')) return;
    setTelegramLoading(true);
    try {
      await api.post('/auth/telegram/unlink');
      setTelegramStatus({ connected: false });
      setTelegramCode(null);
    } catch (error) {
      console.error('Failed to unlink', error);
    } finally {
      setTelegramLoading(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      await api.post('/auth/telegram/test-notification');
      alert('Тестовое уведомление отправлено! Проверьте ваш Telegram.');
    } catch (error) {
      alert('Ошибка отправки уведомления');
    }
  };

  const simulateTelegramConnection = async () => {
    if (!telegramCode) return;
    setSimulationStatus('connecting');
    try {
      // Simulate user sending /start <code> to bot
      await api.post('/debug/simulate-telegram', {
        code: telegramCode,
        chat_id: 123456789, // Mock chat ID
        username: 'demo_user' // Mock username
      });
      
      // Wait a bit and refresh status
      setTimeout(() => {
        fetchTelegramStatus();
        setTelegramCode(null);
        setSimulationStatus('success');
        setTimeout(() => setSimulationStatus(null), 3000);
      }, 1000);
    } catch (error) {
      setSimulationStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Настройки аккаунта</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setActiveTab('password')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                activeTab === 'password' 
                  ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600' 
                  : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
              }`}
            >
              <Lock className="h-5 w-5" />
              Безопасность
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                activeTab === 'notifications' 
                  ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600' 
                  : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
              }`}
            >
              <Bell className="h-5 w-5" />
              Уведомления
            </button>
            <button
              onClick={() => setActiveTab('telegram')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                activeTab === 'telegram' 
                  ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600' 
                  : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
              }`}
            >
              <Send className="h-5 w-5" />
              Telegram
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'password' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Смена пароля</h2>
              
              {passwordStatus && (
                <div className={`p-4 rounded-lg mb-6 ${
                  passwordStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {passwordStatus.message}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Текущий пароль</label>
                  <input
                    type="password"
                    required
                    className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Новый пароль</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Подтвердите новый пароль</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-70 transition-colors flex items-center gap-2"
                  >
                    {passwordLoading ? 'Сохранение...' : (
                      <>
                        <Save className="h-4 w-4" />
                        Обновить пароль
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Настройки уведомлений</h2>

              {notificationStatus && (
                <div className={`p-4 rounded-lg mb-6 ${
                  notificationStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {notificationStatus.message}
                </div>
              )}

              <div className="space-y-6 max-w-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900">Новости платформы</h3>
                    <p className="text-sm text-slate-500">Получать дайджест новостей и мероприятий на email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={notifications.email_news}
                      onChange={(e) => setNotifications({...notifications, email_news: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900">B2B Запросы</h3>
                    <p className="text-sm text-slate-500">Уведомления о новых запросах в вашей отрасли</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={notifications.email_b2b}
                      onChange={(e) => setNotifications({...notifications, email_b2b: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900">Статусы заявок</h3>
                    <p className="text-sm text-slate-500">Push-уведомления об изменении статуса ваших заявок</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={notifications.push_status}
                      onChange={(e) => setNotifications({...notifications, push_status: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleNotificationSave}
                    disabled={notificationLoading}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-70 transition-colors flex items-center gap-2"
                  >
                    {notificationLoading ? 'Сохранение...' : (
                      <>
                        <Save className="h-4 w-4" />
                        Сохранить настройки
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'telegram' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Интеграция с Telegram</h2>

              {telegramStatus?.connected ? (
                <div className="space-y-6">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex items-start gap-4">
                    <CheckCircle className="h-8 w-8 text-emerald-600 shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold text-emerald-900 mb-1">Аккаунт подключен</h3>
                      <p className="text-emerald-700">
                        Вы получаете уведомления в Telegram как 
                        <span className="font-bold"> @{telegramStatus.username || 'user'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={sendTestNotification}
                      className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Bell className="h-4 w-4" />
                      Отправить тестовое уведомление
                    </button>
                    <button
                      onClick={unlinkTelegram}
                      disabled={telegramLoading}
                      className="px-6 py-2 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Отключить
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-slate-600">
                    Подключите Telegram-бота, чтобы получать мгновенные уведомления о статусе ваших заявок и новых B2B запросах.
                  </p>

                  {!telegramCode ? (
                    <button
                      onClick={generateTelegramCode}
                      disabled={telegramLoading}
                      className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className={`h-5 w-5 ${telegramLoading ? 'animate-spin' : ''}`} />
                      Сгенерировать код подключения
                    </button>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                      <h3 className="font-bold text-slate-900 mb-4">Инструкция по подключению:</h3>
                      <ol className="list-decimal list-inside space-y-3 text-slate-700 mb-6">
                        <li>Откройте нашего бота <a href="#" className="text-blue-600 font-bold hover:underline">@SakhalinBusinessBot</a></li>
                        <li>Нажмите кнопку <strong>Start</strong> или отправьте команду <code className="bg-slate-200 px-2 py-1 rounded">/start</code></li>
                        <li>Отправьте боту этот код:</li>
                      </ol>

                      <div className="text-4xl font-mono font-bold text-center tracking-widest text-slate-900 bg-white border border-slate-300 rounded-xl py-4 mb-6 select-all">
                        {telegramCode}
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="text-center text-sm text-slate-500">
                          Ожидаем подключения...
                        </div>
                        
                        {/* Demo Simulation Button */}
                        <div className="border-t border-slate-200 pt-4 mt-2">
                          <p className="text-xs text-slate-400 mb-2 text-center uppercase font-bold">Демо режим</p>
                          <button
                            onClick={simulateTelegramConnection}
                            disabled={simulationStatus === 'connecting' || simulationStatus === 'success'}
                            className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                              simulationStatus === 'success' 
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            {simulationStatus === 'connecting' ? 'Имитация подключения...' : 
                             simulationStatus === 'success' ? 'Успешно подключено!' : 
                             'Симулировать отправку кода в бот'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
