import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Building2, FileText, LogOut, Shield, Banknote } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AdminLayout() {
  const { user, logout, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  if (!user || user.role !== 'TPP_ADMIN') {
    return <Navigate to="/login" replace />;
  }

  const navigation = [
    { name: 'Обзор', href: '/admin', icon: LayoutDashboard },
    { name: 'Компании', href: '/admin/companies', icon: Building2 },
    { name: 'Заявки', href: '/admin/requests', icon: FileText },
    { name: 'Новости', href: '/admin/news', icon: FileText },
    { name: 'Меры поддержки', href: '/admin/support', icon: Banknote },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <Shield className="h-8 w-8 text-red-500" />
          <div>
            <div className="font-bold text-lg leading-none">Админ</div>
            <div className="text-xs text-slate-400 mt-1">Панель управления</div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-red-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">
              {user.email[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-medium truncate">{user.email}</div>
              <div className="text-xs text-slate-500">Администратор</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-slate-800">
            {navigation.find(n => n.href === location.pathname)?.name || 'Панель управления'}
          </h1>
          <Link to="/" className="text-sm text-slate-500 hover:text-blue-600">
            Вернуться на сайт
          </Link>
        </header>

        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
