import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, CheckCircle, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Company } from '../types';

interface CompanyWithProfile extends Company {
  city?: string;
  industry_code?: string;
  logo_url?: string;
  description?: string;
}

export function RegistryPage() {
  const [companies, setCompanies] = useState<CompanyWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await api.get('/companies');
        setCompanies(response.data);
      } catch (error) {
        console.error('Failed to fetch companies', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(c => 
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.inn.includes(searchTerm)
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Реестр компаний</h1>
          <p className="text-slate-600">Проверенные поставщики и партнеры Сахалинской области</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Поиск по названию или ИНН..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Загрузка реестра...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {company.logo_url ? (
                    <img src={company.logo_url} alt={company.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="h-6 w-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-900">{company.full_name}</h3>
                    {company.status === 'VERIFIED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                        <CheckCircle className="h-3 w-3" /> Проверено ТПП
                      </span>
                    )}
                    {company.is_tpp_member && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                        Член ТПП
                      </span>
                    )}
                    {company.has_quality_mark && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
                        Знак качества
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    {company.city && (
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {company.city}</span>
                    )}
                    <span>ИНН: {company.inn}</span>
                    {company.industry_code && (
                      <span>ОКВЭД: {company.industry_code}</span>
                    )}
                  </div>
                  {company.description && (
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2 max-w-2xl">
                      {company.description}
                    </p>
                  )}
                </div>
              </div>
              <Link 
                to={`/companies/${company.id}`} // Note: This page might not exist yet, but link is correct
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-sm whitespace-nowrap self-start md:self-center"
              >
                Подробнее
              </Link>
            </div>
          ))}
          {filteredCompanies.length === 0 && (
            <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">
              Компании не найдены
            </div>
          )}
        </div>
      )}
    </div>
  );
}
