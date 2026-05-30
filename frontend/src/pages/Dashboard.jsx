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
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight transition-colors">Dashboard Supervisor</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 transition-colors">Gestión proactiva de la operación diaria.</p>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2 glass-panel px-4 py-2 rounded-2xl shadow-sm transition-all hover:scale-105">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-blue animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
          <span className="font-bold tracking-wide text-xs uppercase">Live Data</span>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiData.map((kpi, index) => (
          <motion.div 
            key={index} 
            variants={itemVariants}
            className="glass-card p-6 rounded-3xl flex items-center justify-between hover-lift cursor-pointer group"
          >
            <div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">{kpi.title}</p>
              <div className="flex items-baseline gap-3">
                <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter group-hover:text-brand-blue transition-colors duration-300">{kpi.value}</p>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-lg ${
                  kpi.trend === 'up' ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400' : 'text-amber-700 bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400'
                }`}>
                  {kpi.change}
                </span>
              </div>
            </div>
            <div className={`p-4 rounded-2xl ${kpi.color} text-white shadow-lg transform transition-transform group-hover:scale-110`}>
              <kpi.icon size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* 60% / 40% Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (60%) - Active Field Staff */}
        <motion.div variants={itemVariants} className="lg:col-span-7 glass-card rounded-3xl flex flex-col transition-colors overflow-hidden">
          <div className="p-6 border-b border-slate-200/50 dark:border-white/5 flex justify-between items-center bg-white/40 dark:bg-dark-bg/20">
            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Personal Activo en Campo</h3>
            <button className="text-brand-blue text-sm font-bold hover:underline bg-brand-blue/10 px-3 py-1.5 rounded-xl">Ver en Mapa</button>
          </div>
          
          <div className="overflow-x-auto p-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200/50 dark:border-white/5 transition-colors">
                  <th className="px-5 py-4">Reponedor</th>
                  <th className="px-5 py-4">Región</th>
                  <th className="px-5 py-4">PDV Actual</th>
                  <th className="px-5 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {activeStaff.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-5 py-8 text-center text-slate-500 font-medium">Esperando conexión de reponedores...</td>
                  </tr>
                ) : activeStaff.map(staff => (
                  <tr key={staff.id} className="border-b border-slate-100/50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-dark-card/50 transition-colors group">
                    <td className="px-5 py-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-white shadow-sm transform group-hover:scale-105 transition-transform">
                        {staff.avatar}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{staff.name}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-medium">{staff.region}</td>
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">{staff.pdv}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          "w-2.5 h-2.5 rounded-full shadow-sm", 
                          staff.status === 'Online' ? 'bg-brand-blue shadow-brand-blue/50' : 'bg-amber-500 shadow-amber-500/50'
                        )} />
                        <span className={clsx("font-bold text-xs uppercase tracking-wider", staff.status === 'Break' ? 'text-amber-600 dark:text-amber-500' : 'text-slate-700 dark:text-slate-300')}>
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
        <motion.div variants={itemVariants} className="lg:col-span-5 glass-card rounded-3xl flex flex-col transition-colors overflow-hidden">
          <div className="p-6 border-b border-slate-200/50 dark:border-white/5 flex justify-between items-center bg-white/40 dark:bg-dark-bg/20">
            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Alertas Recientes</h3>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-red shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
            </span>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="relative border-l-2 border-slate-200/50 dark:border-white/10 ml-4 space-y-8">
              {liveActivity.length === 0 ? (
                <p className="text-slate-500 text-sm font-medium italic pl-5">No hay actividad reciente. Escuchando servidor...</p>
              ) : liveActivity.map(act => (
                <div key={act.id} className="relative pl-8 group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[17px] top-0.5 bg-white dark:bg-dark-card p-1.5 rounded-full ring-4 ring-slate-50 dark:ring-dark-bg shadow-sm transition-transform group-hover:scale-110">
                    <act.icon size={16} className={act.color} />
                  </div>
                  <div className="glass-panel p-4 rounded-2xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{act.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{act.desc}</p>
                    <span className="text-xs font-bold text-brand-blue mt-2 block">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>

      {/* Bottom Section - PDV Register */}
      <motion.div variants={itemVariants} className="glass-card rounded-3xl flex flex-col transition-colors overflow-hidden">
        <div className="p-6 border-b border-slate-200/50 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-dark-bg/20">
          <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Puntos de Venta (Resumen)</h3>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Buscar PDV..." className="pl-10 pr-4 py-2 glass-panel rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-blue/50 outline-none transition-colors w-64" />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200/50 dark:border-white/5 transition-colors">
                <th className="px-5 py-4">Código PDV</th>
                <th className="px-5 py-4">Nombre</th>
                <th className="px-5 py-4">Mercado / Área</th>
                <th className="px-5 py-4">Categoría</th>
                <th className="px-5 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr>
                <td colSpan="5" className="px-5 py-12 text-center text-slate-500 font-medium">
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
