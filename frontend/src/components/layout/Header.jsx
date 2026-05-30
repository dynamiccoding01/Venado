import React from 'react';
import { Search, Bell } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const topNavLinks = [
  { id: 'dashboard', label: 'Dashboard', path: '/' },
  { id: 'routes', label: 'Routes', path: '/routes' },
  { id: 'inventory', label: 'Inventory', path: '/pdvs' },
  { id: 'staff', label: 'Staff', path: '/staff' },
  { id: 'reporting', label: 'Reporting', path: '/reports' },
];

export function Header() {
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

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-600 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-800 dark:text-white">Admin Venado</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Supervisor Nacional</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden ring-2 ring-slate-100 dark:ring-slate-700 shadow-sm group-hover:ring-brand-blue/50 transition-all">
            <img src="https://ui-avatars.com/api/?name=Admin+Venado&background=2563eb&color=fff" alt="User Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
}
