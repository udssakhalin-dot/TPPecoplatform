import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Globe, Phone, Mail, Building2, Users, Calendar, DollarSign, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { Company, CompanyProfile } from '../types';

interface CompanyDetails extends Company {
  profile?: CompanyProfile;
}

export function CompanyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await api.get(`/companies/${id}`);
        setCompany(response.data);
      } catch (error) {
        console.error('Failed to fetch company details', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCompany();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Загрузка...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Компания не найдена</h1>
        <Link to="/registry" className="text-blue-600 hover:underline">Вернуться в реестр</Link>
      </div>
    );
  }

  const { profile } = company;

  return (
    <div className="container mx-auto px-4 py-12">
      <Link to="/registry" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Назад в реестр
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 bg-slate-50">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 bg-white rounded-xl border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {profile?.logo_url ? (
                <img src={profile.logo_url} alt={company.full_name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="h-10 w-10 text-slate-300" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">{company.full_name}</h1>
                {company.status === 'VERIFIED' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                    <CheckCircle className="h-4 w-4" /> Проверено ТПП
                  </span>
                )}
                {company.is_tpp_member && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                    Член ТПП
                  </span>
                )}
                {company.has_quality_mark && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-sm font-medium">
                    Знак качества
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-6 text-slate-600 mt-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm bg-slate-200 px-2 py-0.5 rounded">ИНН {company.inn}</span>
                </div>
                {profile?.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {profile.city}
                  </div>
                )}
                {profile?.industry_code && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    {profile.industry_code}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* Main Content */}
          <div className="lg:col-span-2 p-8 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">О компании</h2>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {profile?.description || 'Описание отсутствует'}
              </p>
            </section>

            {profile?.tags && profile.tags.length > 0 && (
              <section>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Сферы деятельности</h3>
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(profile.tags as any || '[]').map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile?.ceo_name && (
                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="text-xs text-slate-500 mb-1">Генеральный директор</div>
                  <div className="font-medium text-slate-900">{profile.ceo_name}</div>
                </div>
              )}
              {profile?.employees_count && (
                <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-500 opacity-20" />
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Сотрудников</div>
                    <div className="font-medium text-slate-900">{profile.employees_count} чел.</div>
                  </div>
                </div>
              )}
              {profile?.founding_year && (
                <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-blue-500 opacity-20" />
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Год основания</div>
                    <div className="font-medium text-slate-900">{profile.founding_year}</div>
                  </div>
                </div>
              )}
              {profile?.annual_turnover && (
                <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-blue-500 opacity-20" />
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Годовой оборот</div>
                    <div className="font-medium text-slate-900">{profile.annual_turnover}</div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="p-8 bg-slate-50/50 space-y-6">
            <h3 className="font-bold text-slate-900">Контакты</h3>
            
            <div className="space-y-4">
              {profile?.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">Телефон</div>
                    <a href={`tel:${profile.phone}`} className="text-blue-600 hover:underline font-medium">
                      {profile.phone}
                    </a>
                  </div>
                </div>
              )}

              {profile?.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">Email</div>
                    <a href={`mailto:${profile.email}`} className="text-blue-600 hover:underline font-medium">
                      {profile.email}
                    </a>
                  </div>
                </div>
              )}

              {profile?.website && (
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">Веб-сайт</div>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium break-all">
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
              )}

              {profile?.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">Адрес</div>
                    <span className="text-slate-900">
                      {profile.address}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-200">
              <button className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
                Связаться с компанией
              </button>
              <p className="text-xs text-center text-slate-500 mt-3">
                Запрос будет отправлен представителю компании
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
