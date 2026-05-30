import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, Settings, Moon, Sun, LogOut } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import clsx from 'clsx';
import { useTheme } from '../../context/ThemeContext';

const topNavLinks = [
  { id: 'dashboard', label: 'Dashboard', path: '/' },
  { id: 'routes', label: 'Routes', path: '/routes' },
  { id: 'inventory', label: 'Inventory', path: '/pdvs' },
  { id: 'staff', label: 'Staff', path: '/staff' },
  { id: 'reporting', label: 'Reporting', path: '/reports' },
];

export function Header() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar el dropdown al hacer clic fuera
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
    <header className="bg-white dark:bg-slate-800 border-b border-brand-gray-border dark:border-slate-700 h-16 flex items-center justify-between px-6 shrink-0 z-10 relative transition-colors duration-300">
      
      {/* Left side: Brand Name & Tabs */}
      <div className="flex items-center h-full">
        <div className="flex items-center gap-2 mr-8">
          <h1 className="text-xl font-bold text-brand-blue tracking-tight">CampoRuta</h1>
        </div>
        
        {/* Top Navigation Tabs */}
        <nav className="hidden md:flex h-full gap-1 items-end">
          {topNavLinks.map((link) => (
            <NavLink
              key={link.id}
              to={link.path}
              className={({ isActive }) =>
                clsx(
                  "px-4 py-4 text-sm font-medium transition-colors border-b-2",
                  isActive 
                    ? "text-brand-blue border-brand-blue" 
                    : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-white hover:border-slate-200 dark:hover:border-slate-600"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Right side: Search, Notifications, Profile */}
      <div className="flex items-center gap-4">
        
        {/* Búsqueda Global */}
        <div className="relative w-64 hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar PDV, reponedor..." 
            className="w-full pl-10 pr-4 py-1.5 bg-slate-100 dark:bg-slate-700 border-transparent rounded-lg text-sm text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-600 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-colors"
          />
        </div>

        {/* Action Buttons */}
        <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors">
          <Bell size={20} />
          {/* Notification Badge */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-red rounded-full ring-2 ring-white dark:ring-slate-800"></span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative pl-4 border-l border-slate-200 dark:border-slate-600" ref={dropdownRef}>
          
          {/* Avatar Area (Clickable) */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-800 dark:text-white">Admin Venado</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Supervisor Nacional</p>
            </div>
            <div className={clsx(
              "w-9 h-9 rounded-full bg-slate-200 overflow-hidden ring-2 shadow-sm transition-all",
              isProfileOpen ? "ring-brand-blue/50" : "ring-slate-100 dark:ring-slate-700 group-hover:ring-brand-blue/30"
            )}>
              <img src="https://ui-avatars.com/api/?name=Admin+Venado&background=2563eb&color=fff" alt="User Avatar" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Menú Flotante */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2 flex flex-col gap-1">
                
                <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors w-full text-left">
                  <User size={16} /> Mi perfil
                </button>

                <Link 
                  to="/settings" 
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors w-full text-left"
                >
                  <Settings size={16} /> Ajustes
                </Link>
                
                <button 
                  onClick={() => {
                    toggleDarkMode();
                  }}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isDarkMode ? <Sun size={16} /> : <Moon size={16} />} 
                    Cambiar tema
                  </div>
                </button>
                
                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2"></div>
                
                <button 
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors w-full text-left"
                >
                  <LogOut size={16} /> Finalizar la sesión
                </button>

              </div>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
