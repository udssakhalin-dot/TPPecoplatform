import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Calendar, DollarSign, Edit, Trash2, Eye } from 'lucide-react';
import api from '../../services/api';
import { B2BRequest } from '../../types';

export function MyB2BRequestsPage() {
  const [requests, setRequests] = useState<B2BRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/b2b/my-requests');
        setRequests(response.data);
      } catch (error) {
        console.error('Failed to fetch my B2B requests', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Мои B2B Запросы</h1>
        <Link 
          to="/dashboard/b2b/new" 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center gap-2"
        >
          <Briefcase className="h-4 w-4" />
          Создать запрос
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Загрузка...</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {requests.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {requests.map((req) => (
                <div key={req.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        req.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' :
                        req.status === 'CLOSED' ? 'bg-slate-100 text-slate-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {req.status === 'OPEN' ? 'АКТИВЕН' : req.status === 'CLOSED' ? 'ЗАКРЫТ' : 'АРХИВ'}
                      </span>
                      <span className="text-xs text-slate-500">{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">{req.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {req.request_type === 'BUY' ? 'Закупка' : req.request_type === 'SELL' ? 'Продажа' : 'Партнерство'}
                      </span>
                      {req.budget && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {req.budget} ₽
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link 
                      to={`/b2b/${req.id}`} 
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Просмотр"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
                    <button 
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Редактировать"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button 
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <Briefcase className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">У вас пока нет запросов</h3>
              <p className="text-slate-500 mb-6">Создайте свой первый запрос, чтобы найти партнеров или поставщиков.</p>
              <Link 
                to="/dashboard/b2b/new" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Создать запрос
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
