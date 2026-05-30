import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, CheckCircle2, AlertTriangle, Clock, ChevronRight, Package, MapPin, Search, MoreVertical } from 'lucide-react';
import clsx from 'clsx';

// --- MOCK DATA ---
const activeStaff = [
  { id: 1, name: 'Carlos Méndez', region: 'Santa Cruz (Norte)', pdv: 'SCZ-MKT-042', status: 'Online', avatar: 'CM' },
  { id: 2, name: 'Ana Rodriguez', region: 'La Paz (Sopocachi)', pdv: 'LPZ-SUP-011', status: 'Online', avatar: 'AR' },
  { id: 3, name: 'Roberto Chura', region: 'Cochabamba (Cala Cala)', pdv: 'CBBA-MIN-089', status: 'Break', avatar: 'RC' },
  { id: 4, name: 'Lucía Vargas', region: 'El Alto (Ceja)', pdv: 'EL-ALT-005', status: 'Online', avatar: 'LV' },
];

const liveActivity = [
  { id: 1, type: 'complete', title: 'Route Complete: Route #442', desc: 'Carlos Méndez finalized all 12 PDVs in North SCZ.', time: '2 mins ago', icon: CheckCircle2, color: 'text-brand-blue' },
  { id: 2, type: 'alert', title: 'Out of Stock Alert', desc: "Ana Rodriguez reported OOS for 'Aceite Fino' at LPZ-SUP-011.", time: '15 mins ago', icon: AlertTriangle, color: 'text-brand-red' },
  { id: 3, type: 'login', title: 'Staff Login', desc: 'Roberto Chura started shift in Cochabamba region.', time: '45 mins ago', icon: MapPin, color: 'text-slate-500' },
];

const pdvRegister = [
  { id: 'SCZ-MKT-1022', name: 'Tienda Doña Maria', market: 'Mercado Abasto, SCZ', category: 'Minorista', lastVisit: 'Today, 10:45 AM', status: 'Visited' },
  { id: 'LPZ-SUP-0451', name: 'Hipermaxi Los Pinos', market: 'Calacoto, LPZ', category: 'Supermercado', lastVisit: 'Yesterday', status: 'Pending' },
  { id: 'CBBA-CAN-331', name: 'Distribuidora El Valle', market: 'La Cancha, CBBA', category: 'Mayorista', lastVisit: '2 days ago', status: 'Blocked' },
  { id: 'ALT-TRX-9021', name: 'Mini Market 16 de Julio', market: 'Feria 16 de Julio, EL ALT', category: 'Minorista', lastVisit: 'Scheduled Today', status: 'Planned' },
];

const kpiData = [
  { title: 'Visitas Completadas', value: '1,248', change: '+4.2%', trend: 'up', icon: CheckCircle2, color: 'bg-blue-600' },
  { title: 'Personal Activo', value: '42', change: 'de 45', trend: 'up', icon: Users, color: 'bg-indigo-600' },
  { title: 'Incidencias', value: '7', change: '3 Críticas', trend: 'down', icon: Package, color: 'bg-rose-500' },
  { title: 'Cobertura', value: '88.5%', change: '+1.1%', trend: 'up', icon: MapPin, color: 'bg-emerald-500' },
];

const chartData = [
  { name: 'Norte', completadas: 400, pendientes: 240 },
  { name: 'Sur', completadas: 300, pendientes: 139 },
  { name: 'Este', completadas: 200, pendientes: 980 },
  { name: 'Oeste', completadas: 278, pendientes: 390 },
];

export function Dashboard() {
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
                {activeStaff.map(staff => (
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
              {liveActivity.map(act => (
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
              {pdvRegister.map((pdv, index) => {
                let statusColor = '';
                if (pdv.status === 'Visited') statusColor = 'bg-brand-blue';
                if (pdv.status === 'Pending') statusColor = 'bg-yellow-500';
                if (pdv.status === 'Blocked') statusColor = 'bg-brand-red';
                if (pdv.status === 'Planned') statusColor = 'bg-slate-400';

                return (
                  <tr key={index} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-brand-blue">{pdv.id}</td>
                    <td className="px-5 py-4 font-medium text-slate-800 dark:text-slate-200">{pdv.name}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{pdv.market}</td>
                    <td className="px-5 py-4">
                      <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-600 transition-colors">
                        {pdv.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${statusColor}`} />
                        <span className={clsx(
                          "font-medium",
                          pdv.status === 'Blocked' && "text-brand-red",
                          pdv.status === 'Pending' && "text-yellow-600 dark:text-yellow-500",
                          pdv.status === 'Visited' && "text-brand-blue",
                          pdv.status === 'Planned' && "text-slate-500 dark:text-slate-400"
                        )}>{pdv.status}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
