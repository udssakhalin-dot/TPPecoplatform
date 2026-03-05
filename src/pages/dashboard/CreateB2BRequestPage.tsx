import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export function CreateB2BRequestPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    request_type: 'BUY',
    deadline: '',
    budget: '',
    tags: ''
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
      await api.post('/b2b/requests', {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(t => t),
        budget: formData.budget ? parseFloat(formData.budget) : null
      });
      navigate('/dashboard/b2b');
    } catch (err: any) {
      console.error('Failed to create request', err);
      setError('Ошибка создания запроса. Пожалуйста, проверьте данные.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Создание B2B запроса</h1>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Заголовок запроса</label>
            <input
              type="text"
              name="title"
              required
              className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Например: Закупка строительных материалов"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Тип запроса</label>
            <select
              name="request_type"
              className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
              value={formData.request_type}
              onChange={handleChange}
            >
              <option value="BUY">Закупка (Поиск поставщика)</option>
              <option value="SELL">Продажа (Поиск покупателя)</option>
              <option value="PARTNERSHIP">Партнерство / Кооперация</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Описание</label>
            <textarea
              name="description"
              rows={5}
              required
              className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Подробно опишите, что вам требуется..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Бюджет (₽)</label>
              <input
                type="number"
                name="budget"
                className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Необязательно"
                value={formData.budget}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Срок действия (Дедлайн)</label>
              <input
                type="date"
                name="deadline"
                className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Теги (через запятую)</label>
            <input
              type="text"
              name="tags"
              className="w-full rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Стройматериалы, Опт, Срочно"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard/b2b')}
              className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-50 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-70 transition-colors"
            >
              {loading ? 'Публикация...' : 'Опубликовать запрос'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
