import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function MainLayout() {
  return (
    <div className="flex flex-col-reverse md:flex-row h-[100dvh] w-full overflow-hidden bg-slate-50 dark:bg-dark-bg text-slate-800 dark:text-slate-100 font-sans transition-colors duration-500">
      {/* Left Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Navigation */}
        <Header />
        
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="mx-auto max-w-7xl h-full flex flex-col">
             {/* The current route component will be rendered here */}
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
