import { Link } from 'react-router-dom';
import { Globe, FileText, Truck, Award, Languages, ArrowRight } from 'lucide-react';

export function VEDServicesPage() {
  const services = [
    {
      id: 'CONSULTATION',
      title: 'Консультации по ВЭД',
      description: 'Экспертная помощь в вопросах таможенного оформления, логистики и валютного контроля.',
      icon: <Globe className="h-8 w-8 text-blue-600" />,
      color: 'bg-blue-50'
    },
    {
      id: 'EXPORT_SUPPORT',
      title: 'Поддержка экспорта',
      description: 'Поиск иностранных партнеров, размещение на международных маркетплейсах.',
      icon: <Award className="h-8 w-8 text-emerald-600" />,
      color: 'bg-emerald-50'
    },
    {
      id: 'TRANSLATION',
      title: 'Переводы и адаптация',
      description: 'Профессиональный перевод документации и адаптация маркетинговых материалов.',
      icon: <Languages className="h-8 w-8 text-purple-600" />,
      color: 'bg-purple-50'
    },
    {
      id: 'LOGISTICS',
      title: 'Логистика',
      description: 'Помощь в организации международных перевозок и выборе оптимальных маршрутов.',
      icon: <Truck className="h-8 w-8 text-amber-600" />,
      color: 'bg-amber-50'
    },
    {
      id: 'CERTIFICATION',
      title: 'Сертификация',
      description: 'Содействие в получении необходимых сертификатов для экспорта продукции.',
      icon: <FileText className="h-8 w-8 text-indigo-600" />,
      color: 'bg-indigo-50'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">ВЭД Сервисы</h1>
        <p className="text-lg text-slate-600">
          Комплексная поддержка вашего бизнеса при выходе на международные рынки. 
          Мы помогаем на всех этапах: от поиска партнеров до логистики.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {services.map((service) => (
          <div key={service.id} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-16 h-16 ${service.color} rounded-xl flex items-center justify-center mb-6`}>
              {service.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
            <p className="text-slate-600 mb-6">{service.description}</p>
            <Link 
              to={`/dashboard/ved/new?type=${service.id}`}
              className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700"
            >
              Оставить заявку <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Готовы выйти на новый уровень?</h2>
        <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
          Зарегистрируйтесь в личном кабинете, чтобы получить доступ ко всем сервисам и отслеживать статус ваших заявок.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/register" 
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors"
          >
            Стать участником
          </Link>
          <Link 
            to="/login" 
            className="px-8 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm"
          >
            Войти в кабинет
          </Link>
        </div>
      </div>
    </div>
  );
}
