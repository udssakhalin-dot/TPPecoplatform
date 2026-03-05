import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Briefcase, Globe, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Обзор', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Профиль компании', href: '/dashboard/profile', icon: User },
    { name: 'B2B Запросы', href: '/dashboard/b2b', icon: Briefcase },
    { name: 'ВЭД Заявки', href: '/dashboard/ved', icon: Globe },
    { name: 'Подписка', href: '/dashboard/subscription', icon: FileText },
    { name: 'Настройки', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-3 font-bold text-xl text-slate-900">
            <div className="h-10 w-16 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
              ТПП
            </div>
            <span className="text-sm font-bold tracking-tight">КАБИНЕТ</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-blue-600" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
              {user?.email?.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">Моя Компания</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
