import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Search, Filter, X, Building2, Globe, MapPin, FileText } from 'lucide-react';
import api from '../../services/api';

interface Company {
  id: number;
  full_name: string;
  inn: string;
  status: 'VERIFIED' | 'BLOCKED' | 'ON_MODERATION';
  owner_email: string;
  created_at: string;
  is_tpp_member: boolean;
  has_quality_mark: boolean;
  profile?: {
    description?: string;
    website?: string;
    city?: string;
    industry_code?: string;
    tags?: string; // JSON string
  };
}

export function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'VERIFIED' | 'BLOCKED' | 'ON_MODERATION'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/admin/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Failed to fetch companies', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCompany = async (id: number) => {
    try {
      const response = await api.get(`/admin/companies/${id}`);
      setSelectedCompany(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch company details', error);
    }
  };

  const updateStatus = async (id: number, status: 'VERIFIED' | 'BLOCKED') => {
    if (!confirm(`Вы уверены, что хотите изменить статус на ${status}?`)) return;

    try {
      await api.put(`/admin/companies/${id}/status`, { status });
      setCompanies(companies.map(c => c.id === id ? { ...c, status } : c));
      if (selectedCompany && selectedCompany.id === id) {
        setSelectedCompany({ ...selectedCompany, status });
      }
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Ошибка обновления статуса');
    }
  };

  const toggleFlag = async (id: number, flag: 'is_tpp_member' | 'has_quality_mark', value: boolean) => {
    try {
      await api.put(`/admin/companies/${id}/flags`, { [flag]: value });
      
      // Update local state
      setCompanies(companies.map(c => c.id === id ? { ...c, [flag]: value } : c));
      if (selectedCompany && selectedCompany.id === id) {
        setSelectedCompany({ ...selectedCompany, [flag]: value });
      }
    } catch (error) {
      console.error('Failed to update flag', error);
      alert('Ошибка обновления статуса');
    }
  };

  const filteredCompanies = companies.filter(c => {
    const matchesFilter = filter === 'ALL' || c.status === filter;
    const matchesSearch = c.full_name.toLowerCase().includes(search.toLowerCase()) || 
                          c.inn.includes(search) || 
                          c.owner_email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Управление компаниями</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск по названию, ИНН..."
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
            <option value="ALL">Все статусы</option>
            <option value="ON_MODERATION">На модерации</option>
            <option value="VERIFIED">Активные</option>
            <option value="BLOCKED">Заблокированные</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-500 text-sm">Компания</th>
              <th className="px-6 py-4 font-medium text-slate-500 text-sm">ИНН</th>
              <th className="px-6 py-4 font-medium text-slate-500 text-sm">Владелец</th>
              <th className="px-6 py-4 font-medium text-slate-500 text-sm">Статус</th>
              <th className="px-6 py-4 font-medium text-slate-500 text-sm text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredCompanies.map((company) => (
              <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{company.full_name}</td>
                <td className="px-6 py-4 text-slate-600 font-mono text-sm">{company.inn}</td>
                <td className="px-6 py-4 text-slate-600 text-sm">{company.owner_email}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    company.status === 'VERIFIED' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : company.status === 'BLOCKED' 
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {company.status === 'VERIFIED' && <CheckCircle className="h-3 w-3" />}
                    {company.status === 'BLOCKED' && <XCircle className="h-3 w-3" />}
                    {company.status === 'ON_MODERATION' && <Clock className="h-3 w-3" />}
                    {company.status === 'VERIFIED' ? 'Активен' : 
                     company.status === 'BLOCKED' ? 'Заблокирован' : 'На проверке'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => handleOpenCompany(company.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Подробнее
                  </button>
                </td>
              </tr>
            ))}
            {filteredCompanies.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  Компании не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Company Details Modal */}
      {isModalOpen && selectedCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedCompany.status === 'VERIFIED' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : selectedCompany.status === 'BLOCKED' 
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedCompany.status === 'VERIFIED' ? 'Активен' : 
                     selectedCompany.status === 'BLOCKED' ? 'Заблокирован' : 'На проверке'}
                  </span>
                  <span className="text-slate-400 text-sm">ID: {selectedCompany.id}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedCompany.full_name}
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
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="text-xs text-slate-500 mb-1">ИНН</div>
                  <div className="font-mono font-medium text-slate-900">{selectedCompany.inn}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="text-xs text-slate-500 mb-1">Email владельца</div>
                  <div className="font-medium text-slate-900">{selectedCompany.owner_email}</div>
                </div>
              </div>

              {/* Flags */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                <h3 className="font-semibold text-slate-900 text-sm">Особые статусы</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Член Торгово-промышленной палаты</span>
                  <button 
                    onClick={() => toggleFlag(selectedCompany.id, 'is_tpp_member', !selectedCompany.is_tpp_member)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${selectedCompany.is_tpp_member ? 'bg-blue-600' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${selectedCompany.is_tpp_member ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Знак качества "Сахалин"</span>
                  <button 
                    onClick={() => toggleFlag(selectedCompany.id, 'has_quality_mark', !selectedCompany.has_quality_mark)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${selectedCompany.has_quality_mark ? 'bg-orange-500' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${selectedCompany.has_quality_mark ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">Данные профиля</h3>
                
                {selectedCompany.profile ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedCompany.profile.city && (
                        <div className="flex items-center gap-2 text-slate-700">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          {selectedCompany.profile.city}
                        </div>
                      )}
                      {selectedCompany.profile.website && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <Globe className="h-4 w-4 text-blue-400" />
                          <a href={selectedCompany.profile.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {selectedCompany.profile.website}
                          </a>
                        </div>
                      )}
                    </div>
                    
                    {selectedCompany.profile.description && (
                      <div>
                        <div className="text-sm text-slate-500 mb-2">Описание деятельности</div>
                        <p className="text-slate-700 whitespace-pre-wrap">{selectedCompany.profile.description}</p>
                      </div>
                    )}

                    {selectedCompany.profile.tags && (
                      <div>
                        <div className="text-sm text-slate-500 mb-2">Теги</div>
                        <div className="flex flex-wrap gap-2">
                          {JSON.parse(selectedCompany.profile.tags || '[]').map((tag: string) => (
                            <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-slate-500 italic">Профиль еще не заполнен</div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-slate-100 flex gap-3">
                {selectedCompany.status !== 'VERIFIED' && (
                  <button
                    onClick={() => updateStatus(selectedCompany.id, 'VERIFIED')}
                    className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Одобрить компанию
                  </button>
                )}
                {selectedCompany.status !== 'BLOCKED' && (
                  <button
                    onClick={() => updateStatus(selectedCompany.id, 'BLOCKED')}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Заблокировать
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
