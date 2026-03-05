import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Play } from 'lucide-react';
import api from '../services/api';

export function NewsDetailsPage() {
  const { id } = useParams();
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/news/${id}`)
      .then(res => {
        const data = res.data;
        if (typeof data.media === 'string') {
          data.media = JSON.parse(data.media);
        }
        setNews(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  if (!news) return <div className="min-h-screen flex items-center justify-center">Новость не найдена</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Вернуться на главную
        </Link>

        <article className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="p-8 md:p-12 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
              <Calendar className="h-4 w-4" />
              {new Date(news.created_at).toLocaleDateString()}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              {news.title}
            </h1>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            <div className="prose prose-slate max-w-none mb-12 whitespace-pre-wrap text-slate-700 leading-relaxed">
              {news.content}
            </div>

            {/* Media Gallery */}
            {news.media && news.media.length > 0 && (
              <div className="space-y-8">
                <h3 className="text-xl font-bold text-slate-900">Фото и видео материалы</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {news.media.map((item: any, index: number) => (
                    <div key={index} className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                      {item.type === 'video' ? (
                        <div className="aspect-video relative group">
                          {item.url.includes('youtube') || item.url.includes('youtu.be') ? (
                             <iframe 
                               src={item.url.replace('watch?v=', 'embed/')} 
                               className="w-full h-full" 
                               allowFullScreen 
                               title={`Video ${index}`}
                             />
                          ) : (
                            <video src={item.url} controls className="w-full h-full object-cover" />
                          )}
                        </div>
                      ) : (
                        <img 
                          src={item.url} 
                          alt={`Gallery ${index}`} 
                          className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Legacy Image Fallback */}
            {(!news.media || news.media.length === 0) && news.image_url && (
              <div className="mt-8 rounded-xl overflow-hidden border border-slate-200">
                <img src={news.image_url} alt={news.title} className="w-full h-auto" />
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
