import { useState, useEffect } from 'react';
import { Check, Star, Shield, Zap } from 'lucide-react';
import api from '../../services/api';

interface Subscription {
  plan_type: 'NONE' | 'PARTICIPANT' | 'PARTNER' | 'STRATEGIC';
  is_active: boolean;
}

const PLANS = [
  {
    id: 'PARTICIPANT',
    title: 'Резидент',
    price: 'Бесплатно',
    description: 'Базовое присутствие в реестре для членов ТПП',
    icon: <Shield className="h-8 w-8 text-slate-400" />,
    features: [
      'Статус "Член ТПП"',
      'Базовая карточка компании',
      'Отображение в общем реестре',
      'Доступ к новостям региона'
    ],
    buttonText: 'Ваш текущий статус'
  },
  {
    id: 'PARTNER',
    title: 'Бизнес',
    price: '50 000 ₽ / год',
    description: 'Инструменты для активных продаж и поиска партнеров',
    icon: <Star className="h-8 w-8 text-blue-600" />,
    features: [
      'Всё, что в тарифе "Резидент"',
      'Витрина товаров и услуг (до 50 позиций)',
      'Подача и отклик на B2B заявки',
      'Расширенная аналитика просмотров',
      'Приоритетное размещение в каталоге'
    ],
    recommended: true,
    buttonText: 'Подключить возможности'
  },
  {
    id: 'STRATEGIC',
    title: 'Лидер',
    price: '150 000 ₽ / год',
    description: 'Максимальное влияние, экспорт и продвижение бренда',
    icon: <Zap className="h-8 w-8 text-amber-500" />,
    features: [
      'Всё, что в тарифе "Бизнес"',
      'Персональный менеджер поддержки',
      'Брендирование профиля (видео, файлы)',
      'Рекламный баннер на главной странице',
      'Доступ к базе инвест-проектов'
    ],
    buttonText: 'Оставить заявку'
  }
];

export function SubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState<string>('NONE');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState('');

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await api.get('/company/subscription');
      setCurrentPlan(response.data.plan_type);
    } catch (error) {
      console.error('Failed to fetch subscription', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (planId === currentPlan) return;
    
    // For "Leader" plan, we might want to open a modal or contact form instead of direct upgrade
    // But for now, we keep the direct upgrade logic for the prototype
    setProcessing(planId);
    try {
      await api.post('/company/subscription', { plan_type: planId });
      setCurrentPlan(planId);
    } catch (error) {
      console.error('Failed to update subscription', error);
    } finally {
      setProcessing('');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Загрузка...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">Тарифные планы</h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Превратите членство в ТПП в реальный инструмент роста. 
          Выбирайте тариф, который соответствует амбициям вашего бизнеса.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isProcessing = processing === plan.id;

          return (
            <div 
              key={plan.id} 
              className={`relative bg-white rounded-2xl transition-all duration-300 flex flex-col ${
                plan.recommended 
                  ? 'border-2 border-blue-600 shadow-xl scale-105 z-10' 
                  : 'border border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide shadow-sm">
                  Выбор бизнеса
                </div>
              )}

              <div className="p-8 border-b border-slate-100">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-xl ${plan.recommended ? 'bg-blue-50' : 'bg-slate-50'}`}>
                    {plan.icon}
                  </div>
                  {isCurrent && (
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
                      Текущий план
                    </span>
                  )}
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.title}</h3>
                <p className="text-slate-500 min-h-[48px]">{plan.description}</p>
              </div>

              <div className="p-8 bg-slate-50/50 flex-1">
                <div className="mb-8">
                  <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className={`mt-1 rounded-full p-0.5 ${plan.recommended ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-sm text-slate-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrent || !!processing}
                  className={`w-full py-4 rounded-xl font-bold transition-all ${
                    isCurrent
                      ? 'bg-slate-200 text-slate-500 cursor-default'
                      : plan.recommended
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30'
                      : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900'
                  }`}
                >
                  {isProcessing ? 'Обработка...' : isCurrent ? 'Ваш текущий план' : plan.buttonText}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">Нужна помощь с выбором?</h2>
            <p className="text-slate-300 text-lg">
              Наши эксперты помогут подобрать оптимальный тариф и расскажут, 
              как получить максимум от членства в ТПП Сахалин.
            </p>
          </div>
          <button className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap">
            Связаться с менеджером
          </button>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
