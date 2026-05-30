import React from 'react';
import { Home, Route, Package, Users, BarChart3, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import logo from '../../assets/logo.jpg';

const navItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/' },
  { id: 'routes', icon: Route, label: 'Gestión de Rutas', path: '/routes' },
  { id: 'inventory', icon: Package, label: 'PDVs', path: '/pdvs' },
  { id: 'staff', icon: Users, label: 'Personal', path: '/staff' },
  { id: 'reporting', icon: BarChart3, label: 'Reportes KPIs', path: '/reports' },
];

export function Sidebar() {
  const userStr = localStorage.getItem('user');
  let userRole = null;
  if (userStr) {
    const parsed = JSON.parse(userStr);
    userRole = parsed.usuario?.id_rol || parsed.id_rol;
  }

  // Filtrar ítems de navegación por rol
  const visibleNavItems = navItems.filter(item => {
    // Si es admin (1), ve todo.
    // Si es supervisor (2), no ve staff.
    if (userRole === 2 && item.id === 'staff') return false;
    return true;
  });

  return (
    <aside className="w-[80px] glass-panel border-r border-slate-200/50 dark:border-white/5 flex flex-col items-center py-6 h-full shrink-0 z-30 transition-colors duration-500">
      {/* Logo */}
      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-brand-blue/30 transform transition-transform hover:scale-105 overflow-hidden p-1">
        <img src={logo} alt="Venado" className="w-full h-full object-contain" />
      </div>

      {/* Navigation Icons */}
      <nav className="flex-1 flex flex-col gap-5 w-full px-3">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                "w-full aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 group relative",
                isActive 
                  ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/40 scale-105" 
                  : "text-slate-400 hover:bg-slate-100/50 dark:hover:bg-dark-card hover:text-slate-700 dark:hover:text-slate-200 hover:scale-105"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} className={clsx("transition-transform duration-300", isActive && "scale-110")} />
                
                {/* Tooltip on hover */}
                <div className="absolute left-16 bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50 pointer-events-none shadow-xl transform translate-x-2 group-hover:translate-x-0">
                  {item.label}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 dark:bg-white rotate-45"></div>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
