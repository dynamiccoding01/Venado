import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, CheckCircle2, AlertTriangle, Clock, ChevronRight, Package, MapPin, Search, MoreVertical, Activity } from 'lucide-react';
import clsx from 'clsx';
import { API, createWebSocket } from '../api/client';

// --- MOCK DATA FALLBACKS ---
const chartData = [
  { name: 'Norte', completadas: 400, pendientes: 240 },
  { name: 'Sur', completadas: 300, pendientes: 139 },
  { name: 'Este', completadas: 200, pendientes: 980 },
  { name: 'Oeste', completadas: 278, pendientes: 390 },
];

export function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [liveActivity, setLiveActivity] = useState([]);
  const [activeStaff, setActiveStaff] = useState([]);

  useEffect(() => {
    // 1. Fetch Metrics
    API.getMetrics().then(data => setMetrics(data)).catch(console.error);

    // 2. Connect Supervisor WebSocket
    const ws = createWebSocket('/ws/supervisor/2');
    ws.onopen = () => console.log('Supervisor WS Connected');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.reponedores) {
        // Map WS reponedores to activeStaff format
        const staffList = data.reponedores.map(rep => ({
          id: rep.id,
          name: `Reponedor ${rep.id}`, // Backend solo manda ID, en prod cruzar con tabla usuarios
          region: 'En ruta',
          pdv: rep.pdv_actual || 'Ruta libre',
          status: rep.estado === 'activo' ? 'Online' : 'Offline',
          avatar: `R${rep.id}`
        }));
        setActiveStaff(staffList);
      }
      
      // Check for broadcast events
      if (data.type) {
        setLiveActivity(prev => {
          const newAct = {
            id: Date.now(),
            title: `Evento: ${data.type}`,
            desc: JSON.stringify(data.payload),
            time: 'Recién',
            icon: Activity,
            color: 'text-brand-blue'
          };
          return [newAct, ...prev].slice(0, 5); // Keep last 5
        });
      }
    };
    
    return () => ws.close();
  }, []);

  const kpiData = metrics ? [
    { title: 'Visitas Completadas', value: metrics.visitas_completadas, change: `${metrics.eficiencia_ruta_pct}% efic.`, trend: 'up', icon: CheckCircle2, color: 'bg-blue-600' },
    { title: 'Visitas Pendientes', value: metrics.visitas_pendientes, change: `${metrics.visitas_canceladas} Canceladas`, trend: 'down', icon: Clock, color: 'bg-yellow-500' },
    { title: 'Total Rutas', value: metrics.total_rutas, change: 'Hoy', trend: 'up', icon: MapPin, color: 'bg-indigo-600' },
    { title: 'Eficiencia Global', value: `${metrics.eficiencia_ruta_pct}%`, change: '+1.1%', trend: 'up', icon: Activity, color: 'bg-emerald-500' },
  ] : [
    // Loading skeleton or empty states
    { title: 'Cargando...', value: '-', change: '-', trend: 'up', icon: CheckCircle2, color: 'bg-slate-400' },
    { title: 'Cargando...', value: '-', change: '-', trend: 'up', icon: Clock, color: 'bg-slate-400' },
    { title: 'Cargando...', value: '-', change: '-', trend: 'up', icon: MapPin, color: 'bg-slate-400' },
    { title: 'Cargando...', value: '-', change: '-', trend: 'up', icon: Activity, color: 'bg-slate-400' },
  ];
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="flex flex-col gap-6 pb-8 h-full overflow-y-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Title */}
      <motion.div variants={itemVariants} className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight transition-colors">Dashboard Supervisor</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Gestión proactiva de la operación diaria.</p>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-brand-gray-border dark:border-slate-700 shadow-sm transition-colors">
          <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></span>
          Live Data
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <motion.div 
            key={index} 
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-brand-gray-border dark:border-slate-700 shadow-sm flex items-center justify-between transition-colors cursor-pointer"
          >
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.title}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{kpi.value}</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  kpi.trend === 'up' ? 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400' : 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {kpi.change}
                </span>
              </div>
            </div>
            <div className={`p-3 rounded-xl ${kpi.color} text-white shadow-sm`}>
              <kpi.icon size={20} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* 60% / 40% Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (60%) - Active Field Staff */}
        <motion.div variants={itemVariants} className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-xl border border-brand-gray-border dark:border-slate-700 shadow-sm flex flex-col transition-colors">
          <div className="p-5 border-b border-brand-gray-border dark:border-slate-700 flex justify-between items-center transition-colors">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Personal Activo en Campo</h3>
            <button className="text-brand-blue text-sm font-medium hover:underline">Ver en Mapa</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-brand-gray-border dark:border-slate-700 transition-colors">
                  <th className="px-5 py-3">Reponedor</th>
                  <th className="px-5 py-3">Región</th>
                  <th className="px-5 py-3">PDV Actual</th>
                  <th className="px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {activeStaff.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-5 py-4 text-center text-slate-500">Esperando conexión de reponedores...</td>
                  </tr>
                ) : activeStaff.map(staff => (
                  <tr key={staff.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                        {staff.avatar}
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{staff.name}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{staff.region}</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500 dark:text-slate-500">{staff.pdv}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          "w-2 h-2 rounded-full", 
                          staff.status === 'Online' ? 'bg-brand-blue' : 'bg-yellow-500'
                        )} />
                        <span className={staff.status === 'Break' ? 'text-yellow-600 dark:text-yellow-500' : 'text-slate-700 dark:text-slate-300'}>
                          {staff.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Right Column (40%) - Live Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-xl border border-brand-gray-border dark:border-slate-700 shadow-sm flex flex-col transition-colors">
          <div className="p-5 border-b border-brand-gray-border dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Alertas Recientes</h3>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red"></span>
            </span>
          </div>
          <div className="p-5 flex-1 overflow-y-auto">
            <div className="relative border-l border-slate-200 dark:border-slate-600 ml-3 space-y-6">
              {liveActivity.length === 0 ? (
                <p className="text-slate-500 text-sm italic pl-4">No hay actividad reciente. Escuchando servidor...</p>
              ) : liveActivity.map(act => (
                <div key={act.id} className="relative pl-6">
                  {/* Timeline Dot */}
                  <div className="absolute -left-3 top-0.5 bg-white dark:bg-slate-800 p-1 rounded-full ring-1 ring-slate-200 dark:ring-slate-600 transition-colors">
                    <act.icon size={14} className={act.color} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{act.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{act.desc}</p>
                    <span className="text-xs text-slate-400 mt-2 block">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>

      {/* Bottom Section - PDV Register */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl border border-brand-gray-border dark:border-slate-700 shadow-sm flex flex-col transition-colors">
        <div className="p-5 border-b border-brand-gray-border dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Puntos de Venta (Resumen)</h3>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="text" placeholder="Buscar PDV..." className="pl-8 pr-3 py-1.5 bg-transparent border border-slate-200 dark:border-slate-600 dark:text-white rounded text-sm focus:ring-1 focus:ring-brand-blue outline-none transition-colors" />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-brand-gray-border dark:border-slate-700 transition-colors">
                <th className="px-5 py-3">Código PDV</th>
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Mercado / Área</th>
                <th className="px-5 py-3">Categoría</th>
                <th className="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr>
                <td colSpan="5" className="px-5 py-8 text-center text-slate-500">
                  Integraremos esta tabla en el próximo paso con datos de rutas...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
