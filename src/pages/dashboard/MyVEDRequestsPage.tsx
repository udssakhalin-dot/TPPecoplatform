import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Globe, FileText, Truck, Award, Languages, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';

interface VEDRequest {
  id: number;
  service_type: string;
  direction: string;
  target_countries: string[];
  product_desc: string;
  status: string;
  created_at: string;
}

export function MyVEDRequestsPage() {
  const [requests, setRequests] = useState<VEDRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/ved/my-requests');
        setRequests(response.data);
      } catch (error) {
        console.error('Failed to fetch my VED requests', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'CONSULTATION': return <Globe className="h-5 w-5 text-blue-600" />;
      case 'EXPORT_SUPPORT': return <Award className="h-5 w-5 text-emerald-600" />;
      case 'TRANSLATION': return <Languages className="h-5 w-5 text-purple-600" />;
      case 'LOGISTICS': return <Truck className="h-5 w-5 text-amber-600" />;
      case 'CERTIFICATION': return <FileText className="h-5 w-5 text-indigo-600" />;
      default: return <Globe className="h-5 w-5 text-slate-600" />;
    }
  };

  const getServiceLabel = (type: string) => {
    switch (type) {
      case 'CONSULTATION': return 'Консультация';
      case 'EXPORT_SUPPORT': return 'Экспорт';
      case 'TRANSLATION': return 'Перевод';
      case 'LOGISTICS': return 'Логистика';
      case 'CERTIFICATION': return 'Сертификация';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW': return <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold"><Clock className="h-3 w-3" /> НОВАЯ</span>;
      case 'PROCESSING': return <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-bold"><Clock className="h-3 w-3" /> В РАБОТЕ</span>;
      case 'DONE': return <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-bold"><CheckCircle className="h-3 w-3" /> ГОТОВО</span>;
      case 'REJECTED': return <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-bold"><XCircle className="h-3 w-3" /> ОТКЛОНЕНО</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Мои заявки на ВЭД</h1>
        <Link 
          to="/dashboard/ved/new" 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Новая заявка
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Загрузка...</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {requests.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {requests.map((req) => (
                <div key={req.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        {getServiceIcon(req.service_type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{getServiceLabel(req.service_type)}</h3>
                        <p className="text-xs text-slate-500">Создано {new Date(req.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
                    <div>
                      <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Направление</span>
                      {req.direction === 'EXPORT' ? 'Экспорт' : 'Импорт'}
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Целевые страны</span>
                      {req.target_countries && req.target_countries.length > 0 ? req.target_countries.join(', ') : '—'}
                    </div>
                    <div className="md:col-span-2">
                      <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Описание</span>
                      <p className="line-clamp-2">{req.product_desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <Globe className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">Заявок пока нет</h3>
              <p className="text-slate-500 mb-6">Оставьте заявку на поддержку экспорта, логистику или переводы.</p>
              <Link 
                to="/dashboard/ved/new" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Оформить заявку
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
