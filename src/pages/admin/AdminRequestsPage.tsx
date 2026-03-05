import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Search, Filter, X, Building2, Calendar, Globe, FileText, DollarSign } from 'lucide-react';
import api from '../../services/api';

interface Request {
  id: number;
  title?: string; // B2B
  service_type?: string; // VED
  company_name: string;
  inn?: string;
  type: 'B2B' | 'VED';
  status: 'OPEN' | 'CLOSED' | 'ARCHIVED' | 'NEW' | 'PROCESSING' | 'DONE' | 'REJECTED';
  created_at: string;
  description?: string; // B2B
  product_desc?: string; // VED
  budget?: string; // B2B
  deadline?: string; // B2B
  direction?: 'IMPORT' | 'EXPORT'; // VED
  target_countries?: string[]; // VED
  tags?: string[]; // B2B
}

export function AdminRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'B2B' | 'VED'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/admin/requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch requests', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRequest = async (type: 'B2B' | 'VED', id: number) => {
    try {
      const response = await api.get(`/admin/requests/${type}/${id}`);
      setSelectedRequest(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch request details', error);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedRequest) return;
    try {
      await api.put(`/admin/requests/${selectedRequest.type}/${selectedRequest.id}/status`, { status });
      setIsModalOpen(false);
      fetchRequests(); // Refresh list
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesType = filter === 'ALL' || r.type === filter;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const title = r.title || r.service_type || '';
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) || 
                          r.company_name.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Управление заявками</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск по названию, компании..."
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="border border-slate-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="ALL">Все типы</option>
            <option value="B2B">B2B Запросы</option>
            <option value="VED">ВЭД Заявки</option>
          </select>
          <select
            className="border border-slate-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Все статусы</option>
            <option value="OPEN">Открыта</option>
            <option value="NEW">Новая</option>
            <option value="PROCESSING">В работе</option>
            <option value="DONE">Выполнена</option>
            <option value="CLOSED">Закрыта</option>
            <option value="REJECTED">Отклонена</option>
            <option value="ARCHIVED">Архив</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-500 text-sm">Тип</th>
              <th className="px-6 py-4 font-medium text-slate-500 text-sm">Название / Услуга</th>
              <th className="px-6 py-4 font-medium text-slate-500 text-sm">Компания</th>
              <th className="px-6 py-4 font-medium text-slate-500 text-sm">Статус</th>
              <th className="px-6 py-4 font-medium text-slate-500 text-sm">Дата</th>
              <th className="px-6 py-4 font-medium text-slate-500 text-sm text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredRequests.map((request) => (
              <tr key={`${request.type}-${request.id}`} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    request.type === 'B2B' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {request.type}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {request.title || request.service_type}
                </td>
                <td className="px-6 py-4 text-slate-600 text-sm">{request.company_name}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={request.status} />
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm">
                  {new Date(request.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => handleOpenRequest(request.type, request.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Подробнее
                  </button>
                </td>
              </tr>
            ))}
            {filteredRequests.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  Заявки не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Request Details Modal */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedRequest.type === 'B2B' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {selectedRequest.type}
                  </span>
                  <span className="text-slate-400 text-sm">#{selectedRequest.id}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedRequest.title || selectedRequest.service_type}
                </h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Company Info */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="h-12 w-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-slate-400" />
                </div>
                <div>
                  <div className="font-medium text-slate-900">{selectedRequest.company_name}</div>
                  <div className="text-sm text-slate-500">ИНН: {selectedRequest.inn || 'Не указан'}</div>
                </div>
              </div>

              {/* Details based on type */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">Детали заявки</h3>
                
                {selectedRequest.type === 'B2B' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border border-slate-200 rounded-lg">
                        <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                          <DollarSign className="h-3 w-3" /> Бюджет
                        </div>
                        <div className="font-medium">{selectedRequest.budget || 'Не указан'}</div>
                      </div>
                      <div className="p-3 border border-slate-200 rounded-lg">
                        <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Дедлайн
                        </div>
                        <div className="font-medium">
                          {selectedRequest.deadline ? new Date(selectedRequest.deadline).toLocaleDateString() : 'Не указан'}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 mb-2">Описание</div>
                      <p className="text-slate-700 whitespace-pre-wrap">{selectedRequest.description}</p>
                    </div>
                    {selectedRequest.tags && selectedRequest.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedRequest.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border border-slate-200 rounded-lg">
                        <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                          <Globe className="h-3 w-3" /> Направление
                        </div>
                        <div className="font-medium">
                          {selectedRequest.direction === 'IMPORT' ? 'Импорт' : 'Экспорт'}
                        </div>
                      </div>
                      <div className="p-3 border border-slate-200 rounded-lg">
                        <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                          <Globe className="h-3 w-3" /> Страны
                        </div>
                        <div className="font-medium">
                          {selectedRequest.target_countries?.join(', ') || 'Не указаны'}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 mb-2">Описание товара/услуги</div>
                      <p className="text-slate-700 whitespace-pre-wrap">{selectedRequest.product_desc}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Status Actions */}
              <div className="pt-6 border-t border-slate-100">
                <h3 className="font-semibold text-slate-900 mb-4">Изменить статус</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedRequest.type === 'B2B' ? (
                    <>
                      <StatusButton 
                        current={selectedRequest.status} 
                        target="OPEN" 
                        label="Открыта" 
                        onClick={() => handleUpdateStatus('OPEN')} 
                        color="emerald"
                      />
                      <StatusButton 
                        current={selectedRequest.status} 
                        target="CLOSED" 
                        label="Закрыта" 
                        onClick={() => handleUpdateStatus('CLOSED')} 
                        color="slate"
                      />
                      <StatusButton 
                        current={selectedRequest.status} 
                        target="ARCHIVED" 
                        label="В архив" 
                        onClick={() => handleUpdateStatus('ARCHIVED')} 
                        color="amber"
                      />
                    </>
                  ) : (
                    <>
                      <StatusButton 
                        current={selectedRequest.status} 
                        target="NEW" 
                        label="Новая" 
                        onClick={() => handleUpdateStatus('NEW')} 
                        color="blue"
                      />
                      <StatusButton 
                        current={selectedRequest.status} 
                        target="PROCESSING" 
                        label="В работе" 
                        onClick={() => handleUpdateStatus('PROCESSING')} 
                        color="purple"
                      />
                      <StatusButton 
                        current={selectedRequest.status} 
                        target="DONE" 
                        label="Выполнена" 
                        onClick={() => handleUpdateStatus('DONE')} 
                        color="emerald"
                      />
                      <StatusButton 
                        current={selectedRequest.status} 
                        target="REJECTED" 
                        label="Отклонена" 
                        onClick={() => handleUpdateStatus('REJECTED')} 
                        color="red"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    OPEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CLOSED: 'bg-slate-50 text-slate-700 border-slate-200',
    ARCHIVED: 'bg-amber-50 text-amber-700 border-amber-200',
    NEW: 'bg-blue-50 text-blue-700 border-blue-200',
    PROCESSING: 'bg-purple-50 text-purple-700 border-purple-200',
    DONE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
  };

  const labels: Record<string, string> = {
    OPEN: 'Открыта',
    CLOSED: 'Закрыта',
    ARCHIVED: 'Архив',
    NEW: 'Новая',
    PROCESSING: 'В работе',
    DONE: 'Выполнена',
    REJECTED: 'Отклонена',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
      {labels[status] || status}
    </span>
  );
}

function StatusButton({ current, target, label, onClick, color }: any) {
  const isActive = current === target;
  const colors: Record<string, string> = {
    emerald: isActive ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50',
    slate: isActive ? 'bg-slate-600 text-white' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50',
    amber: isActive ? 'bg-amber-600 text-white' : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50',
    blue: isActive ? 'bg-blue-600 text-white' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50',
    purple: isActive ? 'bg-purple-600 text-white' : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50',
    red: isActive ? 'bg-red-600 text-white' : 'bg-white text-red-700 border-red-200 hover:bg-red-50',
  };

  return (
    <button
      onClick={onClick}
      disabled={isActive}
      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${colors[color]}`}
    >
      {isActive && <CheckCircle className="h-4 w-4 inline mr-2" />}
      {label}
    </button>
  );
}
