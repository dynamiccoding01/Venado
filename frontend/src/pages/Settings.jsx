import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Monitor, Bell, Lock, Globe, User, Shield, Smartphone } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';

export function Settings() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('appearance');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const tabs = [
    { id: 'profile', icon: User, label: 'Perfil' },
    { id: 'appearance', icon: Monitor, label: 'Apariencia' },
    { id: 'notifications', icon: Bell, label: 'Notificaciones' },
    { id: 'security', icon: Shield, label: 'Seguridad' },
  ];

  return (
    <motion.div 
      className="flex flex-col gap-6 h-full pb-8 overflow-y-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      
      {/* Premium Header */}
      <motion.div variants={itemVariants} className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-brand-blue to-indigo-600 p-8 shadow-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 text-white">
          <h2 className="text-3xl font-black tracking-tight">Ajustes del Sistema</h2>
          <p className="text-blue-100 mt-2 font-medium">Personaliza tu entorno de trabajo y preferencias.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Menú Lateral de Ajustes */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-brand-gray-border dark:border-slate-700 shadow-sm p-3 sticky top-0 transition-colors">
            <nav className="flex flex-col gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all",
                    activeTab === tab.id 
                      ? "bg-blue-50 dark:bg-brand-blue/20 text-brand-blue" 
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200"
                  )}
                >
                  <tab.icon size={18} className={clsx(activeTab === tab.id ? "text-brand-blue" : "")} /> 
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Panel Principal */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          
          {/* SECCIÓN DE APARIENCIA */}
          {activeTab === 'appearance' && (
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl border border-brand-gray-border dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
              
              <div className="p-6 border-b border-brand-gray-border dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Tema de la Interfaz</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Elige cómo quieres que luzca CampoRuta.</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Claro */}
                  <div 
                    onClick={() => isDarkMode && toggleDarkMode()}
                    className={clsx(
                      "cursor-pointer group relative overflow-hidden rounded-2xl border-2 transition-all p-6",
                      !isDarkMode ? "border-brand-blue bg-blue-50/30 dark:bg-brand-blue/10" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    )}
                  >
                    <div className={clsx("absolute top-4 right-4 w-3 h-3 bg-brand-blue rounded-full", isDarkMode ? "hidden" : "block")}></div>
                    <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-amber-500 mb-4 transition-transform group-hover:scale-110">
                      <Sun size={28} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white">Modo Claro</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Aspecto clásico y luminoso. Ideal para trabajar de día.</p>
                  </div>

                  {/* Oscuro */}
                  <div 
                    onClick={() => !isDarkMode && toggleDarkMode()}
                    className={clsx(
                      "cursor-pointer group relative overflow-hidden rounded-2xl border-2 transition-all p-6",
                      isDarkMode ? "border-brand-blue bg-slate-900" : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <div className={clsx("absolute top-4 right-4 w-3 h-3 bg-brand-blue rounded-full", isDarkMode ? "block" : "hidden")}></div>
                    <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 mb-4 shadow-inner transition-transform group-hover:scale-110">
                      <Moon size={28} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white">Modo Oscuro</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Reduce la fatiga visual. Ahorra batería en móviles.</p>
                  </div>
                </div>
              </div>

              {/* Toggles extra */}
              <div className="px-6 pb-6">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-brand-blue">
                        <Smartphone size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white text-sm">Modo Compacto</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Reduce el tamaño de las tablas y tarjetas.</p>
                      </div>
                    </div>
                    {/* Toggle Switch */}
                    <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-pointer transition-colors">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all"></div>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* OTRAS SECCIONES (Placeholders hermosos) */}
          {activeTab !== 'appearance' && (
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl border border-brand-gray-border dark:border-slate-700 shadow-sm p-12 flex flex-col items-center justify-center text-center transition-colors">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-6">
                {activeTab === 'profile' ? <User size={40} /> : activeTab === 'notifications' ? <Bell size={40} /> : <Shield size={40} />}
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Configuración de {tabs.find(t => t.id === activeTab).label}</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm">Esta sección de ajustes estará disponible en la próxima actualización del sistema.</p>
            </motion.div>
          )}

        </div>
      </div>
    </motion.div>
  );
}
