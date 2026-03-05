import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Briefcase, Calendar, DollarSign } from 'lucide-react';
import api from '../services/api';
import { B2BRequest } from '../types';

export function B2BRequestsPage() {
  const [requests, setRequests] = useState<B2BRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/b2b/requests');
        setRequests(response.data);
      } catch (error) {
        console.error('Failed to fetch B2B requests', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          req.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || req.request_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">B2B Кооперация</h1>
          <p className="text-slate-600 mt-2">Актуальные запросы на поставку товаров и услуг</p>
        </div>
        <Link 
          to="/dashboard/b2b/new" 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
        >
          <Briefcase className="h-4 w-4" />
          Разместить запрос
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Поиск по запросам..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-slate-400" />
          <select 
            className="rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500 py-2 pl-3 pr-10"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">Все типы</option>
            <option value="BUY">Закупка</option>
            <option value="SELL">Продажа</option>
            <option value="PARTNERSHIP">Партнерство</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Загрузка запросов...</div>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
              <div key={req.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      req.request_type === 'BUY' ? 'bg-emerald-100 text-emerald-700' :
                      req.request_type === 'SELL' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {req.request_type === 'BUY' ? 'ЗАКУПКА' : req.request_type === 'SELL' ? 'ПРОДАЖА' : 'ПАРТНЕРСТВО'}
                    </span>
                    <span className="text-sm text-slate-500">{new Date(req.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">{req.budget ? `${req.budget} ₽` : 'Бюджет не указан'}</span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  <Link to={`/b2b/${req.id}`} className="hover:text-blue-600 transition-colors">
                    {req.title}
                  </Link>
                </h3>
                
                <p className="text-slate-600 mb-4 line-clamp-2">{req.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span>{req.company_name || 'Компания скрыта'}</span>
                    </div>
                    {req.deadline && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>до {new Date(req.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <Link 
                    to={`/b2b/${req.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Подробнее &rarr;
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-500">Запросов не найдено</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
