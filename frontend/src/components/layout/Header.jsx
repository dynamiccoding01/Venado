import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
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
    <header className="h-[64px] bg-white border-b border-brand-gray-border flex items-center justify-between px-6 shrink-0 z-10 relative">
      
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
                    : "text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-200"
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
        {/* Search Bar */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search operational data..." 
            className="pl-9 pr-4 py-1.5 w-64 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
          />
        </div>

        {/* Action Buttons */}
        <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
          <Bell size={20} />
          {/* Notification Badge */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-red rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden ring-2 ring-white shadow-sm group-hover:ring-slate-100 transition-all">
            <img src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff" alt="User Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
}
