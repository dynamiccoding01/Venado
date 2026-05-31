import React, { useState, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function MainLayout() {
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastScrollY = useRef(0);

  const handleScroll = (e) => {
    const currentScrollY = e.target.scrollTop;
    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      setIsScrollingDown(true);
    } else if (currentScrollY < lastScrollY.current) {
      setIsScrollingDown(false);
    }
    lastScrollY.current = currentScrollY;
  };
  return (
    <div className="flex flex-col-reverse md:flex-row h-[100dvh] w-full overflow-hidden bg-slate-50 dark:bg-dark-bg text-slate-800 dark:text-slate-100 font-sans transition-colors duration-500">
      {/* Left Sidebar */}
      <Sidebar hidden={isScrollingDown} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Navigation */}
        <Header hidden={isScrollingDown} />
        
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth" onScroll={handleScroll}>
          <div className="mx-auto max-w-7xl h-full flex flex-col">
             {/* The current route component will be rendered here */}
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
