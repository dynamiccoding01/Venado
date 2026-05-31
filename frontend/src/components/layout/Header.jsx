import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, Settings, Moon, Sun, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import logo from '../../assets/logo.jpg';
import { useTheme } from '../../context/ThemeContext';
import { API } from '../../api/client';

export function Header() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        if (userData.token) {
          await API.logoutUsuario(userData.token);
        }
      }
    } catch (error) {
      console.error('Error on logout:', error);
    } finally {
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <header className="glass-header h-16 md:h-20 flex items-center justify-between px-4 md:px-8 shrink-0 z-20 relative transition-all duration-300 ease-in-out">
      {/* Left side: Mobile Logo */}
      <div className="flex items-center h-full">
        {/* Mobile Logo */}
        <div className="w-10 h-10 bg-white rounded-xl flex md:hidden items-center justify-center shadow-md overflow-hidden p-1">
          <img src={logo} alt="Venado" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Right side: Search, Notifications, Profile */}
      <div className="flex items-center gap-2 md:gap-5 flex-1 justify-end ml-4">
        
        {/* Search */}
        <div className="relative w-full max-w-[140px] sm:max-w-[200px] lg:max-w-[320px]">
          <Search className="absolute left-2.5 md:left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="w-full pl-8 md:pl-11 pr-3 md:pr-4 py-2 md:py-2.5 bg-slate-100/50 dark:bg-dark-card/50 border border-slate-200 dark:border-dark-border rounded-xl md:rounded-2xl text-xs md:text-sm font-medium text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-dark-card focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all duration-300 shadow-sm"
          />
        </div>

        
        {/* Action Buttons */}
        <button className="relative p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-border rounded-xl transition-all duration-300 hover:scale-105 active:scale-95">
          <Bell size={22} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-brand-red rounded-full ring-2 ring-white dark:ring-dark-bg animate-pulse"></span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative pl-5 border-l border-slate-200 dark:border-dark-border" ref={dropdownRef}>
          <div 
            className="flex items-center gap-3 cursor-pointer group px-2 py-1 rounded-2xl hover:bg-slate-50 dark:hover:bg-dark-card/50 transition-all duration-300"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-blue transition-colors">Admin Venado</p>
              <p className="text-[10px] font-bold text-brand-blue uppercase tracking-wider">Supervisor Nacional</p>
            </div>
            <div className={clsx(
              "w-11 h-11 rounded-xl overflow-hidden ring-2 shadow-lg transition-all duration-300",
              isProfileOpen ? "ring-brand-blue shadow-brand-blue/30 scale-105" : "ring-slate-200 dark:ring-dark-border group-hover:ring-brand-blue/50"
            )}>
              <img src="https://ui-avatars.com/api/?name=Admin+Venado&background=3b82f6&color=fff&rounded=false" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Menú Flotante */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-4 w-64 glass-card rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 border border-slate-200/50 dark:border-white/10 shadow-2xl">
              <div className="p-2 flex flex-col gap-1">
                <Link 
                  to="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-border rounded-xl transition-colors w-full text-left"
                >
                  <User size={18} className="text-slate-400" /> Mi perfil
                </Link>
                <Link 
                  to="/settings" 
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-border rounded-xl transition-colors w-full text-left"
                >
                  <Settings size={18} className="text-slate-400" /> Ajustes
                </Link>
                <button 
                  onClick={() => { toggleDarkMode(); }}
                  className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-border rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Sun size={18} className={clsx("text-amber-500", isDarkMode ? "block" : "hidden")} />
                    <Moon size={18} className={clsx("text-slate-400", isDarkMode ? "hidden" : "block")} />
                    <span>Tema {isDarkMode ? "Claro" : "Oscuro"}</span>
                  </div>
                </button>
                <div className="h-px bg-slate-100 dark:bg-dark-border my-1 mx-3"></div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-brand-red hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors w-full text-left"
                >
                  <LogOut size={18} /> Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
