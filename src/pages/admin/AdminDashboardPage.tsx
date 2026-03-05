import { useState, useEffect } from 'react';
import { Users, Building2, FileText, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    companies: 0,
    requests: 0,
    pending_companies: 0,
    recent_activity: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm text-slate-500 font-medium">Пользователей</div>
            <div className="text-2xl font-bold text-slate-900">{stats.users}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm text-slate-500 font-medium">Компаний</div>
            <div className="text-2xl font-bold text-slate-900">{stats.companies}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm text-slate-500 font-medium">На модерации</div>
            <div className="text-2xl font-bold text-slate-900">{stats.pending_companies}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm text-slate-500 font-medium">Заявок (B2B/ВЭД)</div>
            <div className="text-2xl font-bold text-slate-900">{stats.requests}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Последняя активность</h2>
          <div className="space-y-4">
            {stats.recent_activity.length === 0 ? (
              <p className="text-slate-500 text-sm">Нет активности</p>
            ) : (
              stats.recent_activity.map((item: any, index: number) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className={`mt-1 w-2 h-2 rounded-full ${
                    item.type === 'COMPANY' ? 'bg-emerald-500' :
                    item.type === 'B2B' ? 'bg-blue-500' : 'bg-purple-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {item.type === 'COMPANY' ? `Новая компания: ${item.full_name}` :
                       item.type === 'B2B' ? `B2B Запрос: ${item.title}` :
                       `ВЭД Заявка: ${item.title}`}
                    </p>
                    {item.company_name && (
                      <p className="text-xs text-slate-500">от {item.company_name}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Быстрые действия</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left group">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-2 group-hover:bg-blue-200 transition-colors">
                <FileText className="h-4 w-4" />
              </div>
              <div className="font-medium text-slate-900">Новости</div>
              <div className="text-xs text-slate-500">Добавить новость</div>
            </button>
            <button className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left group">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-2 group-hover:bg-emerald-200 transition-colors">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="font-medium text-slate-900">Компании</div>
              <div className="text-xs text-slate-500">Проверить новые</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
