import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Users, Briefcase, ShieldCheck } from 'lucide-react';
import { useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

export function HomePage() {
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    api.get('/news')
      .then(res => {
        if (Array.isArray(res.data)) {
          setNews(res.data);
        } else {
          console.error('News response is not an array:', res.data);
          setNews([]);
        }
      })
      .catch(err => {
        console.error('Failed to fetch news:', err);
        setNews([]);
      });
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              ТЕРРИТОРИЯ БИЗНЕСА <span className="text-blue-500">САХАЛИН</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Официальная цифровая экосистема для поиска партнеров, выхода на экспорт и взаимодействия с государством.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/register" 
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
              >
                Разместить компанию <ArrowRight className="h-5 w-5" />
              </Link>
              <Link 
                to="/registry" 
                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold rounded-xl transition-all border border-white/10"
              >
                Найти партнера
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<ShieldCheck className="h-8 w-8 text-blue-600" />}
              title="Проверено ТПП"
              description="Реестр надежных поставщиков, прошедших верификацию Палаты."
              to="/registry"
            />
            <FeatureCard 
              icon={<Globe className="h-8 w-8 text-emerald-600" />}
              title="ВЭД Возможности"
              description="Прямой выход на рынки АТР, поиск партнеров в Китае и Вьетнаме."
              to="/ved"
            />
            <FeatureCard 
              icon={<Briefcase className="h-8 w-8 text-purple-600" />}
              title="B2B Кооперация"
              description="Биржа субконтрактов и инвестиционных проектов региона."
              to="/b2b"
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-orange-600" />}
              title="GR Коммуникации"
              description="Прямой диалог с институтами развития и органами власти."
              to="/support"
            />
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Новости и события</h2>
            <Link to="/news" className="text-blue-600 font-medium hover:text-blue-700">Все новости</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {news.map((item: any) => (
              <Link to={`/news/${item.id}`} key={item.id} className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="aspect-video bg-slate-200 overflow-hidden relative">
                  {item.media && item.media.length > 0 ? (
                    item.media[0].type === 'video' ? (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                    ) : (
                      <img src={item.media[0].url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )
                  ) : item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                      <Globe className="h-12 w-12 opacity-20" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-900">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 line-clamp-3 text-sm leading-relaxed">
                    {item.content}
                  </p>
                </div>
              </Link>
            ))}
            {news.length === 0 && (
              <div className="col-span-3 text-center py-12 text-slate-500">
                Новости загружаются...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Платформа в цифрах</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem value="500+" label="Компаний в реестре" />
            <StatItem value="120" label="Активных B2B запросов" />
            <StatItem value="45" label="Экспортных контрактов" />
            <StatItem value="12" label="Стран-партнеров" />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, to }: { icon: ReactNode, title: string, description: string, to: string }) {
  return (
    <Link to={to} className="block p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all hover:bg-white hover:border-blue-100 group">
      <div className="mb-4 p-3 bg-white rounded-xl w-fit shadow-sm border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50 transition-colors">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </Link>
  );
}

function StatItem({ value, label }: { value: string, label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold text-blue-600 mb-2">{value}</div>
      <div className="text-slate-600 font-medium">{label}</div>
    </div>
  );
}
