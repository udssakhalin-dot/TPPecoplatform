import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

interface NewsItem {
  id: number;
  title: string;
  content: string;
  media: MediaItem[];
  is_published: boolean;
  created_at: string;
}

export function AdminNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    content: '', 
    media: [] as MediaItem[],
    is_published: true 
  });
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await api.get('/admin/news');
      setNews(response.data);
    } catch (error) {
      console.error('Failed to fetch news', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNews) {
        await api.put(`/admin/news/${editingNews.id}`, formData);
      } else {
        await api.post('/admin/news', formData);
      }
      setIsModalOpen(false);
      fetchNews();
      resetForm();
    } catch (error) {
      console.error('Failed to save news', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены?')) return;
    try {
      await api.delete(`/admin/news/${id}`);
      fetchNews();
    } catch (error) {
      console.error('Failed to delete news', error);
    }
  };

  const openEdit = (item: NewsItem) => {
    setEditingNews(item);
    setFormData({ 
      title: item.title, 
      content: item.content, 
      media: item.media || [],
      is_published: !!item.is_published 
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingNews(null);
    setFormData({ title: '', content: '', media: [], is_published: true });
    setNewMediaUrl('');
  };

  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setNewMediaUrl(response.data.url);
    } catch (error) {
      console.error('Upload failed', error);
      alert('Ошибка загрузки файла');
    } finally {
      setUploading(false);
    }
  };

  const addMedia = () => {
    if (!newMediaUrl) return;
    setFormData({
      ...formData,
      media: [...formData.media, { type: newMediaType, url: newMediaUrl }]
    });
    setNewMediaUrl('');
  };

  const removeMedia = (index: number) => {
    setFormData({
      ...formData,
      media: formData.media.filter((_, i) => i !== index)
    });
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Управление новостями</h1>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Добавить новость
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-500 text-sm">Заголовок</th>
              <th className="px-6 py-4 font-medium text-slate-500 text-sm">Статус</th>
              <th className="px-6 py-4 font-medium text-slate-500 text-sm">Медиа</th>
              <th className="px-6 py-4 font-medium text-slate-500 text-sm">Дата</th>
              <th className="px-6 py-4 font-medium text-slate-500 text-sm text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {news.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{item.title}</td>
                <td className="px-6 py-4">
                  {item.is_published ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 text-sm bg-emerald-50 px-2 py-1 rounded-full">
                      <Eye className="h-3 w-3" /> Опубликовано
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-500 text-sm bg-slate-100 px-2 py-1 rounded-full">
                      <EyeOff className="h-3 w-3" /> Черновик
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm">
                  {item.media?.length || 0} файлов
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm">
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
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
            {news.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  Новостей пока нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8">
            <h2 className="text-xl font-bold mb-4">{editingNews ? 'Редактировать' : 'Создать'} новость</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Заголовок</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Содержание</label>
                <textarea
                  required
                  rows={5}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                />
              </div>
              
              {/* Media Management */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Фото и Видео</label>
                <div className="space-y-2 mb-3">
                  {formData.media.map((media, index) => (
                    <div key={index} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-xs font-bold uppercase text-slate-500 w-12">{media.type === 'image' ? 'Фото' : 'Видео'}</span>
                      <div className="flex-1 truncate text-sm text-slate-700">{media.url}</div>
                      <button type="button" onClick={() => removeMedia(index)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  <select 
                    className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    value={newMediaType}
                    onChange={(e) => setNewMediaType(e.target.value as 'image' | 'video')}
                  >
                    <option value="image">Фото</option>
                    <option value="video">Видео</option>
                  </select>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="url"
                      placeholder="Ссылка на файл (URL)"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                      value={newMediaUrl}
                      onChange={e => setNewMediaUrl(e.target.value)}
                    />
                    <label className="cursor-pointer px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 flex items-center gap-2 whitespace-nowrap">
                      {uploading ? 'Загрузка...' : 'Загрузить файл'}
                      <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={addMedia}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Добавить
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Вставьте прямую ссылку или загрузите файл с устройства</p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.is_published}
                  onChange={e => setFormData({...formData, is_published: e.target.checked})}
                />
                <label htmlFor="published" className="text-sm text-slate-700">Опубликовать сразу</label>
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
