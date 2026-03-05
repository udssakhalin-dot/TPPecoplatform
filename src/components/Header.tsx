import { Link } from 'react-router-dom';
import { Menu, X, User, Search, LogOut } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-3 font-bold text-xl text-slate-900">
            <div className="h-10 w-16 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
              ТПП
            </div>
            <span className="hidden sm:inline-block tracking-tight">ТЕРРИТОРИЯ БИЗНЕСА</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/registry" className="hover:text-blue-600 transition-colors">Реестр компаний</Link>
          <Link to="/b2b" className="hover:text-blue-600 transition-colors">B2B Кооперация</Link>
          <Link to="/ved" className="hover:text-blue-600 transition-colors">ВЭД</Link>
          <Link to="/support" className="hover:text-blue-600 transition-colors">Меры поддержки</Link>
        </nav>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors" aria-label="Search">
            <Search className="h-5 w-5 text-slate-600" />
          </button>
          
          {user ? (
            <div className="hidden md:flex items-center gap-4">
              <Link to="/dashboard" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">
                {user.email}
              </Link>
              <button 
                onClick={logout}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-600"
                title="Выйти"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              <User className="h-4 w-4" />
              <span>Войти</span>
            </Link>
          )}

          <button 
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white p-4 space-y-4">
          <nav className="flex flex-col gap-4 text-base font-medium text-slate-600">
            <Link to="/registry" className="block py-2 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Реестр компаний</Link>
            <Link to="/b2b" className="block py-2 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>B2B Кооперация</Link>
            <Link to="/ved" className="block py-2 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>ВЭД</Link>
            <Link to="/support" className="block py-2 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Меры поддержки</Link>
            
            {user ? (
              <div className="pt-4 border-t border-slate-100">
                <div className="text-sm text-slate-500 mb-2">{user.email}</div>
                <button 
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="flex items-center gap-2 py-2 text-red-600 font-semibold"
                >
                  <LogOut className="h-5 w-5" />
                  Выйти
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 py-2 text-blue-600 font-semibold" onClick={() => setIsMenuOpen(false)}>
                <User className="h-5 w-5" />
                Войти в кабинет
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
