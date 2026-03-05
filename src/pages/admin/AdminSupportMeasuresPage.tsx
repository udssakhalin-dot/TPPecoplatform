import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Banknote, GraduationCap, Percent, Building2 } from 'lucide-react';
import api from '../../services/api';

interface SupportMeasure {
  id: number;
  title: string;
  description: string;
  type: 'SUBSIDY' | 'GRANT' | 'LOAN' | 'EDUCATION';
  amount?: string;
  provider: string;
  deadline?: string;
  created_at: string;
}

export function AdminSupportMeasuresPage() {
  const [measures, setMeasures] = useState<SupportMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeasure, setEditingMeasure] = useState<SupportMeasure | null>(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    type: 'SUBSIDY',
    amount: '',
    provider: '',
    deadline: ''
  });

  useEffect(() => {
    fetchMeasures();
  }, []);

  const fetchMeasures = async () => {
    try {
      const response = await api.get('/support-measures');
      setMeasures(response.data);
    } catch (error) {
      console.error('Failed to fetch support measures', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMeasure) {
        await api.put(`/admin/support-measures/${editingMeasure.id}`, formData);
      } else {
        await api.post('/admin/support-measures', formData);
      }
      setIsModalOpen(false);
      fetchMeasures();
      resetForm();
    } catch (error) {
      console.error('Failed to save support measure', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены?')) return;
    try {
      await api.delete(`/admin/support-measures/${id}`);
      fetchMeasures();
    } catch (error) {
      console.error('Failed to delete support measure', error);
    }
  };

  const openEdit = (item: SupportMeasure) => {
    setEditingMeasure(item);
    setFormData({ 
      title: item.title, 
      description: item.description, 
      type: item.type,
      amount: item.amount || '',
      provider: item.provider,
      deadline: item.deadline || ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingMeasure(null);
    setFormData({ 
      title: '', 
      description: '', 
      type: 'SUBSIDY',
      amount: '',
      provider: '',
      deadline: ''
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'SUBSIDY': return 'Субсидия';
      case 'GRANT': return 'Грант';
      case 'LOAN': return 'Кредит';
      case 'EDUCATION': return 'Обучение';
      default: return type;
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Меры поддержки</h1>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Добавить меру
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-500 text-sm">Название</th>
              <th className="px-6 py-4 font-medium text-slate-500 text-sm">Тип</th>
              <th className="px-6 py-4 font-medium text-slate-500 text-sm">Сумма</th>
              <th className="px-6 py-4 font-medium text-slate-500 text-sm">Провайдер</th>
              <th className="px-6 py-4 font-medium text-slate-500 text-sm">Срок</th>
              <th className="px-6 py-4 font-medium text-slate-500 text-sm text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {measures.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{item.title}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 text-slate-700 text-sm bg-slate-100 px-2 py-1 rounded-full">
                    {getTypeLabel(item.type)}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm">{item.amount || '-'}</td>
                <td className="px-6 py-4 text-slate-500 text-sm">{item.provider}</td>
                <td className="px-6 py-4 text-slate-500 text-sm">{item.deadline || 'Бессрочно'}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {measures.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  Мер поддержки пока нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 my-8">
            <h2 className="text-xl font-bold mb-4">{editingMeasure ? 'Редактировать' : 'Создать'} меру поддержки</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Название</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Описание</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Тип</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="SUBSIDY">Субсидия</option>
                    <option value="GRANT">Грант</option>
                    <option value="LOAN">Кредит</option>
                    <option value="EDUCATION">Обучение</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Сумма (необязательно)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    placeholder="например, до 1 млн ₽"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Провайдер</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    value={formData.provider}
                    onChange={e => setFormData({...formData, provider: e.target.value})}
                    placeholder="например, Минэкономразвития"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Срок (необязательно)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    value={formData.deadline}
                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                    placeholder="например, 31.12.2024"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
