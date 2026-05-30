import React from 'react';
import { Home, Route, Package, Users, BarChart3, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const navItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/' },
  { id: 'routes', icon: Route, label: 'Gestión de Rutas', path: '/routes' },
  { id: 'inventory', icon: Package, label: 'PDVs', path: '/pdvs' },
  { id: 'staff', icon: Users, label: 'Personal', path: '/staff' },
  { id: 'reporting', icon: BarChart3, label: 'Reportes KPIs', path: '/reports' },
];

export function Sidebar() {
  return (
    <aside className="w-[64px] bg-white border-r border-brand-gray-border flex flex-col items-center py-4 h-full shrink-0 shadow-sm z-10">
      {/* Logo Placeholder (Small) */}
      <div className="w-10 h-10 bg-brand-blue rounded-lg flex items-center justify-center mb-8 shadow-sm">
        <span className="text-white font-bold text-lg">C</span>
      </div>

      {/* Navigation Icons */}
      <nav className="flex-1 flex flex-col gap-4 w-full px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            title={item.label}
            className={({ isActive }) =>
              clsx(
                "w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-200 group relative",
                isActive 
                  ? "bg-blue-50 text-brand-blue shadow-sm ring-1 ring-blue-100" 
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                
                {/* Tooltip on hover */}
                <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                  {item.label}
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto w-full px-2 flex flex-col gap-2">
        <button className="w-full aspect-square rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
          <Settings size={22} />
        </button>
      </div>
    </aside>
  );
}
