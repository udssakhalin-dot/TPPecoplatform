import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

export function CreateVEDRequestPage() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    service_type: searchParams.get('type') || 'CONSULTATION',
    direction: 'EXPORT',
    target_countries: '',
    product_desc: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/ved/requests', {
        ...formData,
        target_countries: formData.target_countries.split(',').map(c => c.trim()).filter(c => c)
      });
      navigate('/dashboard/ved');
    } catch (err: any) {
      console.error('Failed to create VED request', err);
      setError('Ошибка создания заявки. Пожалуйста, проверьте данные.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Новая заявка на ВЭД услуги</h1>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Тип услуги</label>
            <select
              name="service_type"
              className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
              value={formData.service_type}
              onChange={handleChange}
            >
              <option value="CONSULTATION">Консультация по ВЭД</option>
              <option value="EXPORT_SUPPORT">Поддержка экспорта</option>
              <option value="TRANSLATION">Переводы и адаптация</option>
              <option value="LOGISTICS">Логистика</option>
              <option value="CERTIFICATION">Сертификация</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Направление</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="direction"
                  value="EXPORT"
                  checked={formData.direction === 'EXPORT'}
                  onChange={handleChange}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700">Экспорт</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="direction"
                  value="IMPORT"
                  checked={formData.direction === 'IMPORT'}
                  onChange={handleChange}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700">Импорт</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Целевые страны (через запятую)</label>
            <input
              type="text"
              name="target_countries"
              className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Китай, Япония, Южная Корея"
              value={formData.target_countries}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Описание продукции / услуги</label>
            <textarea
              name="product_desc"
              rows={5}
              required
              className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Опишите вашу продукцию, объемы, текущую ситуацию и что именно требуется..."
              value={formData.product_desc}
              onChange={handleChange}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard/ved')}
              className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-50 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-70 transition-colors"
            >
              {loading ? 'Отправка...' : 'Отправить заявку'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
