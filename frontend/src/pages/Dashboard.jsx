import React, { useState } from 'react';
import { 
  MapPin, 
  Users, 
  Package, 
  BarChart3, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  Filter, 
  MoreVertical 
} from 'lucide-react';
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
  { id: 2, type: 'alert', title: 'Out of Stock Alert', desc: "Ana Rodriguez reported OOS for 'Aceite Fino' at LPZ-SUP-011.", time: '15 mins ago', icon: AlertCircle, color: 'text-brand-red' },
  { id: 3, type: 'login', title: 'Staff Login', desc: 'Roberto Chura started shift in Cochabamba region.', time: '45 mins ago', icon: MapPin, color: 'text-slate-500' },
];

const pdvRegister = [
  { id: 'SCZ-MKT-1022', name: 'Tienda Doña Maria', market: 'Mercado Abasto, SCZ', category: 'Minorista', lastVisit: 'Today, 10:45 AM', status: 'Visited' },
  { id: 'LPZ-SUP-0451', name: 'Hipermaxi Los Pinos', market: 'Calacoto, LPZ', category: 'Supermercado', lastVisit: 'Yesterday', status: 'Pending' },
  { id: 'CBBA-CAN-331', name: 'Distribuidora El Valle', market: 'La Cancha, CBBA', category: 'Mayorista', lastVisit: '2 days ago', status: 'Blocked' },
  { id: 'ALT-TRX-9021', name: 'Mini Market 16 de Julio', market: 'Feria 16 de Julio, EL ALT', category: 'Minorista', lastVisit: 'Scheduled Today', status: 'Planned' },
];

export function Dashboard() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Page Title */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Supervisor</h2>
          <p className="text-sm text-slate-500 mt-1">Gestión proactiva de la operación diaria.</p>
        </div>
        <div className="text-sm text-slate-500 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-brand-gray-border shadow-sm">
          <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></span>
          Live Data
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Visitas Completadas', value: '1,248', desc: '+4.2%', icon: MapPin },
          { label: 'Personal Activo', value: '42', desc: 'de 45 total', icon: Users },
          { label: 'Incidencias Pendientes', value: '7', desc: '3 Críticas', icon: Package, highlight: true },
          { label: 'Cobertura Diaria', value: '88.5%', desc: '+1.1%', icon: BarChart3 },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-brand-gray-border shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</span>
              <stat.icon size={16} className={stat.highlight ? "text-brand-red" : "text-slate-400"} />
            </div>
            <div className="flex items-baseline gap-2 mt-auto">
              <span className="text-3xl font-bold text-slate-800 tracking-tight">{stat.value}</span>
              <span className={`text-xs font-medium ${stat.highlight ? 'text-brand-red' : 'text-slate-500'}`}>
                {stat.desc}
              </span>
            </div>
            {/* ProgressBar */}
            <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className={clsx("h-full rounded-full", stat.highlight ? 'bg-brand-red w-[25%]' : 'bg-brand-blue w-[75%]')} />
            </div>
          </div>
        ))}
      </div>

      {/* 60% / 40% Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (60%) - Active Field Staff */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-brand-gray-border shadow-sm flex flex-col">
          <div className="p-5 border-b border-brand-gray-border flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-800">Active Field Staff</h3>
            <button className="text-brand-blue text-sm font-medium hover:underline">Ver en Mapa</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-brand-gray-border">
                  <th className="px-5 py-3">Reponedor</th>
                  <th className="px-5 py-3">Región</th>
                  <th className="px-5 py-3">PDV Actual</th>
                  <th className="px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {activeStaff.map(staff => (
                  <tr key={staff.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {staff.avatar}
                      </div>
                      <span className="font-medium text-slate-800">{staff.name}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{staff.region}</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{staff.pdv}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          "w-2 h-2 rounded-full", 
                          staff.status === 'Online' ? 'bg-brand-blue' : 'bg-yellow-500'
                        )} />
                        <span className={staff.status === 'Break' ? 'text-yellow-600' : 'text-slate-700'}>
                          {staff.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (40%) - Live Activity */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-brand-gray-border shadow-sm flex flex-col">
          <div className="p-5 border-b border-brand-gray-border">
            <h3 className="text-base font-bold text-slate-800">Live Activity</h3>
          </div>
          <div className="p-5 flex-1 overflow-y-auto">
            <div className="relative border-l border-slate-200 ml-3 space-y-6">
              {liveActivity.map(act => (
                <div key={act.id} className="relative pl-6">
                  {/* Timeline Dot */}
                  <div className="absolute -left-3 top-0.5 bg-white p-1 rounded-full ring-1 ring-slate-200">
                    <act.icon size={14} className={act.color} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{act.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{act.desc}</p>
                    <span className="text-xs text-slate-400 mt-2 block">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Section - PDV Register */}
      <div className="bg-white rounded-xl border border-brand-gray-border shadow-sm flex flex-col">
        <div className="p-5 border-b border-brand-gray-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-base font-bold text-slate-800">Point of Sale (PDV) Register</h3>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="text" placeholder="Buscar PDV..." className="pl-8 pr-3 py-1.5 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-brand-blue outline-none" />
            </div>
            <select className="border border-slate-200 rounded px-3 py-1.5 text-sm outline-none bg-white">
              <option>All Markets</option>
            </select>
            <select className="border border-slate-200 rounded px-3 py-1.5 text-sm outline-none bg-white">
              <option>Category</option>
            </select>
            <button className="bg-brand-blue hover:bg-brand-blue-hover text-white px-4 py-1.5 rounded text-sm font-medium transition-colors">
              Aplicar Filtros
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-brand-gray-border">
                <th className="px-5 py-3">Código PDV</th>
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Mercado / Área</th>
                <th className="px-5 py-3">Categoría</th>
                <th className="px-5 py-3">Última Visita</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acción</th>
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
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-brand-blue">{pdv.id}</td>
                    <td className="px-5 py-4 font-medium text-slate-800">{pdv.name}</td>
                    <td className="px-5 py-4 text-slate-600">{pdv.market}</td>
                    <td className="px-5 py-4">
                      <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded border border-slate-200">
                        {pdv.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">{pdv.lastVisit}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${statusColor}`} />
                        <span className={clsx(
                          "font-medium",
                          pdv.status === 'Blocked' && "text-brand-red",
                          pdv.status === 'Pending' && "text-yellow-600",
                          pdv.status === 'Visited' && "text-brand-blue",
                          pdv.status === 'Planned' && "text-slate-500"
                        )}>{pdv.status}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right text-slate-400 hover:text-slate-700 cursor-pointer">
                      <button className="p-1 hover:bg-slate-100 rounded">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="p-4 border-t border-brand-gray-border flex justify-between items-center text-sm text-slate-500">
          <span>Mostrando 4 de 422 PDVs</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">&lt;</button>
            <button className="px-3 py-1 border border-brand-blue bg-brand-blue text-white rounded">1</button>
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">2</button>
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">3</button>
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
