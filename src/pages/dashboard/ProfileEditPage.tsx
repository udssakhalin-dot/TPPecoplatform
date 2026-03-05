import { useState, useEffect, FormEvent } from 'react';
import api from '../../services/api';
import { Company, CompanyProfile } from '../../types';

export function ProfileEditPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [profile, setProfile] = useState<Partial<CompanyProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/company/my-profile');
        setCompany(response.data);
        setProfile(response.data.profile || {});
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/company/my-profile', profile);
      setMessage('Профиль успешно обновлен');
    } catch (error) {
      console.error('Failed to save profile', error);
      setMessage('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Редактирование профиля</h1>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{company?.full_name}</h2>
            <p className="text-sm text-slate-500">ИНН: {company?.inn}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${company?.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {company?.status === 'VERIFIED' ? 'Проверено' : 'На модерации'}
          </span>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {message && (
            <div className={`p-4 rounded-lg text-sm ${message.includes('Ошибка') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {message}
            </div>
          )}

          <div className="space-y-6">
            <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Контактная информация</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Город</label>
                <input
                  type="text"
                  className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                  value={profile.city || ''}
                  onChange={e => setProfile({...profile, city: e.target.value})}
                  placeholder="Южно-Сахалинск"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Адрес</label>
                <input
                  type="text"
                  className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                  value={profile.address || ''}
                  onChange={e => setProfile({...profile, address: e.target.value})}
                  placeholder="ул. Ленина, 123, оф. 45"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Телефон</label>
                <input
                  type="tel"
                  className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                  value={profile.phone || ''}
                  onChange={e => setProfile({...profile, phone: e.target.value})}
                  placeholder="+7 (4242) 12-34-56"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email (публичный)</label>
                <input
                  type="email"
                  className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                  value={profile.email || ''}
                  onChange={e => setProfile({...profile, email: e.target.value})}
                  placeholder="info@company.ru"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Веб-сайт</label>
                <input
                  type="url"
                  className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                  value={profile.website || ''}
                  onChange={e => setProfile({...profile, website: e.target.value})}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <h3 className="text-lg font-medium text-slate-900 border-b pb-2 pt-4">О компании</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Генеральный директор</label>
                <input
                  type="text"
                  className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                  value={profile.ceo_name || ''}
                  onChange={e => setProfile({...profile, ceo_name: e.target.value})}
                  placeholder="Иванов Иван Иванович"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Отрасль (ОКВЭД)</label>
                <input
                  type="text"
                  className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                  value={profile.industry_code || ''}
                  onChange={e => setProfile({...profile, industry_code: e.target.value})}
                  placeholder="Например: 05.11 Рыболовство морское"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Количество сотрудников</label>
                <input
                  type="number"
                  className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                  value={profile.employees_count || ''}
                  onChange={e => setProfile({...profile, employees_count: parseInt(e.target.value) || undefined})}
                  placeholder="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Год основания</label>
                <input
                  type="number"
                  className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                  value={profile.founding_year || ''}
                  onChange={e => setProfile({...profile, founding_year: parseInt(e.target.value) || undefined})}
                  placeholder="2010"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Годовой оборот</label>
                <input
                  type="text"
                  className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                  value={profile.annual_turnover || ''}
                  onChange={e => setProfile({...profile, annual_turnover: e.target.value})}
                  placeholder="100-500 млн ₽"
                />
              </div>
            </div>

            <h3 className="text-lg font-medium text-slate-900 border-b pb-2 pt-4">Описание</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Описание деятельности</label>
              <textarea
                rows={4}
                className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                value={profile.description || ''}
                onChange={e => setProfile({...profile, description: e.target.value})}
                placeholder="Расскажите о вашей деятельности, продукции и услугах..."
              />
              <p className="mt-1 text-xs text-slate-500">Краткое описание будет отображаться в реестре.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Теги (через запятую)</label>
              <input
                type="text"
                className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                value={Array.isArray(profile.tags) ? profile.tags.join(', ') : profile.tags || ''}
                onChange={e => setProfile({...profile, tags: e.target.value.split(',').map(t => t.trim())})}
                placeholder="Экспорт, Логистика, Рыба"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-70 transition-colors"
            >
              {saving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
