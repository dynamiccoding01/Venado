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
    <div className="flex flex-col gap-6 pb-8 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Gestión de Personal</h2>
          <p className="text-sm text-slate-500 mt-1">Supervisa y administra al equipo de campo y oficina.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-brand-blue hover:bg-brand-blue-hover text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors">
            <Plus size={16} />
            Nuevo Miembro
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-brand-gray-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-brand-blue font-bold text-xl">
            {staffList.filter(s => s.status === 'Online').length}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Activos en Campo</p>
            <p className="text-sm font-medium text-slate-700">Conectados ahora mismo</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-brand-gray-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-brand-red font-bold text-xl">
            {staffList.filter(s => s.battery !== null && s.battery < 20).length}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Batería Crítica</p>
            <p className="text-sm font-medium text-slate-700">Equipos que requieren atención</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-brand-gray-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xl">
            {staffList.length}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Personal</p>
            <p className="text-sm font-medium text-slate-700">Plantilla completa</p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl border border-brand-gray-border shadow-sm flex flex-col flex-1 min-h-0">
        
        {/* Filters */}
        <div className="p-4 border-b border-brand-gray-border flex flex-wrap gap-4 items-end bg-slate-50/50 rounded-t-xl">
          <div className="flex-1 min-w-[250px]">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Búsqueda rápida</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre del trabajador..." 
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-brand-blue outline-none" 
              />
            </div>
          </div>
          <div className="w-48">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Rol</label>
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none bg-white cursor-pointer"
            >
              <option value="Todos">Todos los roles</option>
              <option value="Reponedor">Reponedores</option>
              <option value="Supervisor">Supervisores</option>
            </select>
          </div>
          <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 h-[38px]">
            <Filter size={16} /> Más filtros
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-brand-gray-border">
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
                <tr key={staff.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{staff.name}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{staff.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-700">{staff.role}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{staff.region}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center">
                      <span className={clsx(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
                        staff.status === 'Online' ? "bg-blue-50 text-brand-blue" : 
                        staff.status === 'Break' ? "bg-yellow-50 text-yellow-600" : 
                        "bg-slate-100 text-slate-500"
                      )}>
                        <span className={clsx("w-2 h-2 rounded-full", 
                          staff.status === 'Online' ? "bg-brand-blue" : 
                          staff.status === 'Break' ? "bg-yellow-500" : 
                          "bg-slate-400"
                        )}></span>
                        {staff.status}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">{staff.lastSeen}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {staff.battery !== null ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5">
                          {getBatteryIcon(staff.battery)}
                          <span className={clsx(
                            "font-bold",
                            staff.battery < 20 ? "text-brand-red" : "text-slate-700"
                          )}>{staff.battery}%</span>
                        </div>
                        <span className="text-[10px] text-slate-400">App v3.0.1</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs flex justify-center">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {staff.vehicle ? (
                         <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                            {getVehicleIcon(staff.vehicle)}
                         </div>
                      ) : <span className="text-slate-400">-</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-brand-blue p-2 rounded-lg transition-colors">
                      <MoreVertical size={18} />
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
