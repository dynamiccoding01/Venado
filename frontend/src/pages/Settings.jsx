import React from 'react';
import { Moon, Sun, Monitor, Bell, Lock, Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';

export function Settings() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className="flex flex-col gap-6 h-full pb-8 dark:text-slate-200 transition-colors duration-300">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight transition-colors">Ajustes del Sistema</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Personaliza tu experiencia y la configuración de la plataforma.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Menú lateral de Ajustes */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl border border-brand-gray-border dark:border-slate-700 shadow-sm p-4 transition-colors">
          <ul className="flex flex-col gap-1">
            <li>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 dark:bg-brand-blue/20 text-brand-blue font-bold text-sm transition-colors">
                <Monitor size={18} /> Apariencia
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium text-sm transition-colors">
                <Bell size={18} /> Notificaciones
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium text-sm transition-colors">
                <Lock size={18} /> Privacidad y Seguridad
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium text-sm transition-colors">
                <Globe size={18} /> Idioma y Región
              </button>
            </li>
          </ul>
        </div>

        {/* Panel Principal de Configuración */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Sección de Tema */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-brand-gray-border dark:border-slate-700 shadow-sm p-6 transition-colors">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Tema de la Interfaz</h3>
            
            <div className="flex flex-col sm:flex-row gap-4">
              
              {/* Opción Claro */}
              <button 
                onClick={() => isDarkMode && toggleDarkMode()}
                className={clsx(
                  "flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3",
                  !isDarkMode ? "border-brand-blue bg-blue-50/50 dark:bg-transparent" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                )}
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <Sun size={24} />
                </div>
                <span className={clsx("font-bold text-sm", !isDarkMode ? "text-brand-blue" : "text-slate-600 dark:text-slate-400")}>Modo Claro</span>
              </button>

              {/* Opción Oscuro */}
              <button 
                onClick={() => !isDarkMode && toggleDarkMode()}
                className={clsx(
                  "flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3",
                  isDarkMode ? "border-brand-blue bg-slate-900" : "border-slate-200 hover:border-slate-300"
                )}
              >
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-blue-400">
                  <Moon size={24} />
                </div>
                <span className={clsx("font-bold text-sm", isDarkMode ? "text-brand-blue" : "text-slate-600")}>Modo Oscuro</span>
              </button>

            </div>
          </div>

          {/* Más ajustes de apariencia (Placeholders) */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-brand-gray-border dark:border-slate-700 shadow-sm p-6 transition-colors">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Accesibilidad visual</h3>
            
            <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700">
              <div>
                <p className="font-bold text-slate-800 dark:text-white text-sm">Animaciones fluidas</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Activar transiciones y micro-animaciones en botones y modales.</p>
              </div>
              {/* Toggle Switch Simulado */}
              <div className="w-11 h-6 bg-brand-blue rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <p className="font-bold text-slate-800 dark:text-white text-sm">Alta densidad de datos</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Reducir el espaciado en las tablas para ver más registros a la vez.</p>
              </div>
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
