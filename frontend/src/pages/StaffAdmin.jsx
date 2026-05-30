import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, BatteryFull, BatteryMedium, BatteryLow, Smartphone, Car, Bike, PersonStanding } from 'lucide-react';
import clsx from 'clsx';
import { createWebSocket } from '../api/client';

export function StaffAdmin() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    const ws = createWebSocket('/ws/supervisor/2');
    
    ws.onopen = () => console.log('StaffAdmin WS Connected');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.reponedores) {
        const mappedStaff = data.reponedores.map(rep => ({
          id: `USR-00${rep.id}`,
          name: `Reponedor ${rep.id}`,
          role: 'Reponedor',
          region: rep.pdv_actual ? `PDV: ${rep.pdv_actual}` : 'En Tránsito',
          status: rep.estado === 'activo' ? 'Online' : rep.estado === 'sin_señal' ? 'Break' : 'Offline',
          battery: rep.estado === 'activo' ? Math.floor(Math.random() * 40) + 60 : null, // Simulated battery
          vehicle: 'pie', 
          lastSeen: rep.ultimo_update || 'Desconocido'
        }));
        
        // Always include a supervisor for variety
        const supervisor = { id: 'SUP-001', name: 'Carlos Admin', role: 'Supervisor', region: 'Oficina Central', status: 'Online', battery: 100, vehicle: 'auto', lastSeen: 'Justo ahora' };

        setStaffList([supervisor, ...mappedStaff]);
      }
    };
    
    return () => ws.close();
  }, []);

  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'Todos' || staff.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getVehicleIcon = (vehicle) => {
    switch (vehicle) {
      case 'auto': return <Car size={16} className="text-slate-500" />;
      case 'moto': return <Bike size={16} className="text-slate-500" />;
      case 'pie': return <PersonStanding size={16} className="text-slate-500" />;
      default: return null;
    }
  };

  const getBatteryIcon = (level) => {
    if (level === null) return null;
    if (level > 60) return <BatteryFull size={16} className="text-brand-blue" />;
    if (level > 20) return <BatteryMedium size={16} className="text-yellow-500" />;
    return <BatteryLow size={16} className="text-brand-red" />;
  };

  return (
    <div className="flex flex-col gap-6 pb-8 h-full animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Gestión de Personal</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Supervisa y administra al equipo de campo y oficina.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-brand-blue hover:bg-brand-blue-hover text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-blue/30 transition-all hover:scale-105 active:scale-95">
            <Plus size={18} strokeWidth={3} />
            Nuevo Miembro
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-6 rounded-3xl flex items-center gap-5 hover-lift cursor-pointer group">
          <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 dark:bg-brand-blue/20 flex items-center justify-center text-brand-blue font-black text-2xl group-hover:scale-110 transition-transform">
            {staffList.filter(s => s.status === 'Online').length}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Activos en Campo</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">Conectados ahora mismo</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-3xl flex items-center gap-5 hover-lift cursor-pointer group">
          <div className="w-14 h-14 rounded-2xl bg-brand-red/10 dark:bg-brand-red/20 flex items-center justify-center text-brand-red font-black text-2xl group-hover:scale-110 transition-transform">
            {staffList.filter(s => s.battery !== null && s.battery < 20).length}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Batería Crítica</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">Equipos que requieren atención</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-3xl flex items-center gap-5 hover-lift cursor-pointer group">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-white font-black text-2xl group-hover:scale-110 transition-transform">
            {staffList.length}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Personal</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">Plantilla completa</p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="glass-card rounded-3xl flex flex-col flex-1 min-h-0 overflow-hidden">
        
        {/* Filters */}
        <div className="p-6 border-b border-slate-200/50 dark:border-white/5 flex flex-wrap gap-4 items-end bg-white/40 dark:bg-dark-bg/20">
          <div className="flex-1 min-w-[250px]">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Búsqueda rápida</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre del trabajador..." 
                className="w-full pl-10 pr-4 py-2.5 glass-panel rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-blue/50 outline-none transition-all" 
              />
            </div>
          </div>
          <div className="w-48">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Rol</label>
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full glass-panel rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none cursor-pointer appearance-none"
            >
              <option value="Todos" className="text-slate-800">Todos los roles</option>
              <option value="Reponedor" className="text-slate-800">Reponedores</option>
              <option value="Supervisor" className="text-slate-800">Supervisores</option>
            </select>
          </div>
          <button className="glass-panel text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-dark-card transition-colors flex items-center gap-2 h-[44px]">
            <Filter size={18} /> Más filtros
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1 p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200/50 dark:border-white/5">
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol y Región</th>
                <th className="px-6 py-4 text-center">Estado de Red</th>
                <th className="px-6 py-4 text-center">Dispositivo</th>
                <th className="px-6 py-4 text-center">Movilidad</th>
                <th className="px-6 py-4 text-right">Opciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="border-b border-slate-100/50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-dark-card/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center font-black text-slate-700 dark:text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{staff.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{staff.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-700 dark:text-slate-200">{staff.role}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{staff.region}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center">
                      <span className={clsx(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm",
                        staff.status === 'Online' ? "bg-brand-blue/10 text-brand-blue" : 
                        staff.status === 'Break' ? "bg-amber-500/10 text-amber-500" : 
                        "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400"
                      )}>
                        <span className={clsx("w-2 h-2 rounded-full", 
                          staff.status === 'Online' ? "bg-brand-blue shadow-[0_0_8px_rgba(59,130,246,0.8)]" : 
                          staff.status === 'Break' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" : 
                          "bg-slate-400"
                        )}></span>
                        {staff.status}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1.5">{staff.lastSeen}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {staff.battery !== null ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5">
                          {getBatteryIcon(staff.battery)}
                          <span className={clsx(
                            "font-bold",
                            staff.battery < 20 ? "text-brand-red" : "text-slate-700 dark:text-slate-200"
                          )}>{staff.battery}%</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">App v3.0.1</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 text-xs flex justify-center">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {staff.vehicle ? (
                         <div className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center transform group-hover:scale-110 transition-transform">
                            {getVehicleIcon(staff.vehicle)}
                         </div>
                      ) : <span className="text-slate-400 dark:text-slate-600">-</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 dark:text-slate-500 hover:text-brand-blue dark:hover:text-brand-blue p-2 rounded-xl hover:bg-brand-blue/10 transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
