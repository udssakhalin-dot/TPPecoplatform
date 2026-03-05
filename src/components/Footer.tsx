import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <h3 className="text-white font-bold text-lg">ТПП Сахалин</h3>
          <p className="text-sm leading-relaxed">
            Официальная цифровая деловая экосистема Торгово-промышленной палаты Сахалинской области.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-4">Платформа</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/registry" className="hover:text-white transition-colors">Реестр компаний</Link></li>
            <li><Link to="/b2b" className="hover:text-white transition-colors">B2B Запросы</Link></li>
            <li><Link to="/ved" className="hover:text-white transition-colors">ВЭД Сервисы</Link></li>
            <li><Link to="/tariffs" className="hover:text-white transition-colors">Тарифы</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Документы</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/terms" className="hover:text-white transition-colors">Пользовательское соглашение</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition-colors">Политика конфиденциальности</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">О проекте</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Контакты</h4>
          <ul className="space-y-2 text-sm">
            <li>г. Южно-Сахалинск, Коммунистический пр., 31</li>
            <li>+7 (4242) 23-00-05</li>
            <li>sakhalin@tpprf.ru</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} ТПП Сахалинской области. Все права защищены.
      </div>
    </footer>
  );
}
