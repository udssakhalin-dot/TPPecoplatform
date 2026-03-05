import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Globe, FileText, ArrowRight } from 'lucide-react';
import api from '../../services/api';

export function DashboardPage() {
  const [stats, setStats] = useState({
    views: 0,
    requests: 0,
    ved_status: 'inactive'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Обзор</h1>
        <div className="flex gap-2">
          <Link 
            to="/dashboard/b2b/new" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center gap-2"
          >
            <Briefcase className="h-4 w-4" />
            Создать B2B запрос
          </Link>
          <Link 
            to="/dashboard/ved/new" 
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            Подать ВЭД заявку
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Просмотры профиля" 
          value={stats.views} 
          trend="+12%" 
          icon={<FileText className="h-5 w-5 text-blue-600" />}
        />
        <StatCard 
          title="Активные запросы" 
          value={stats.requests} 
          trend="0" 
          icon={<Briefcase className="h-5 w-5 text-purple-600" />}
        />
        <StatCard 
          title="Статус ВЭД" 
          value={stats.ved_status === 'active' ? 'Активен' : 'Неактивен'} 
          trend="" 
          icon={<Globe className="h-5 w-5 text-emerald-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Последние уведомления</h3>
          <div className="space-y-4">
            <NotificationItem 
              title="Новый отклик на B2B запрос" 
              time="2 часа назад" 
              type="info"
            />
            <NotificationItem 
              title="Ваш профиль прошел модерацию" 
              time="1 день назад" 
              type="success"
            />
            <NotificationItem 
              title="Обновите данные о компании" 
              time="3 дня назад" 
              type="warning"
            />
          </div>
          <button className="w-full mt-4 py-2 text-sm text-slate-500 hover:text-slate-700 font-medium border-t border-slate-100">
            Показать все
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Рекомендуемые действия</h3>
          <div className="space-y-3">
            <ActionItem 
              title="Заполните профиль на 100%" 
              desc="Добавьте логотип и описание, чтобы повысить доверие."
              link="/dashboard/profile"
            />
            <ActionItem 
              title="Подключите тариф Партнер" 
              desc="Получите доступ к контактам и ВЭД сервисам."
              link="/dashboard/subscription"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      </div>
      <div className="flex items-end gap-2">
        <div className="text-3xl font-bold text-slate-900">{value}</div>
        {trend && <div className="text-sm font-medium text-emerald-600 mb-1">{trend}</div>}
      </div>
    </div>
  );
}

function NotificationItem({ title, time, type }: any) {
  const colors = {
    info: 'bg-blue-50 text-blue-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
  };
  return (
    <div className="flex items-start gap-3">
      <div className={`w-2 h-2 mt-2 rounded-full ${type === 'info' ? 'bg-blue-500' : type === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      <div>
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{time}</p>
      </div>
    </div>
  );
}

function ActionItem({ title, desc, link }: any) {
  return (
    <Link to={link} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors group">
      <div>
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
    </Link>
  );
}
