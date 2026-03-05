import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Briefcase, Calendar, DollarSign, User, Mail, Phone, MapPin } from 'lucide-react';
import api from '../services/api';
import { B2BRequest } from '../types';

export function B2BRequestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<B2BRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await api.get(`/b2b/requests/${id}`);
        setRequest(response.data);
      } catch (error) {
        console.error('Failed to fetch request details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  if (loading) return <div className="text-center py-12">Загрузка...</div>;
  if (!request) return <div className="text-center py-12">Запрос не найден</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link to="/b2b" className="text-slate-500 hover:text-blue-600 mb-4 inline-block">&larr; Вернуться к списку</Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                request.request_type === 'BUY' ? 'bg-emerald-100 text-emerald-700' :
                request.request_type === 'SELL' ? 'bg-blue-100 text-blue-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {request.request_type === 'BUY' ? 'Закупка' : request.request_type === 'SELL' ? 'Продажа' : 'Партнерство'}
              </span>
              <span className="text-sm text-slate-500">Опубликовано {new Date(request.created_at).toLocaleDateString()}</span>
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 mb-6">{request.title}</h1>
            
            <div className="prose prose-slate max-w-none mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Описание запроса</h3>
              <p className="text-slate-600 whitespace-pre-wrap">{request.description}</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {request.tags && request.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
              {request.budget && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Бюджет</p>
                    <p className="text-lg font-semibold text-slate-900">{request.budget} ₽</p>
                  </div>
                </div>
              )}
              {request.deadline && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Срок действия</p>
                    <p className="text-lg font-semibold text-slate-900">до {new Date(request.deadline).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Информация о компании</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-slate-900">{request.company_name}</p>
                <p className="text-xs text-slate-500">ИНН: {request.inn}</p>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span className="text-sm">Южно-Сахалинск</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="text-sm">contact@company.com</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Phone className="h-4 w-4 text-slate-400" />
                <span className="text-sm">+7 (999) 123-45-67</span>
              </div>
            </div>

            <button className="w-full mt-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
              Откликнуться на запрос
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
