import React from 'react';
import { BarChart3, MapPin, Users, Package } from 'lucide-react';

export function EmptyDashboard() {
  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h2>
        <p className="text-sm text-slate-500 mt-1">Operational snapshot for CampoRuta.</p>
      </div>

      {/* Metric Cards Skeleton/Placeholder */}
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
            {/* Small decorative progress bar line */}
            <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${stat.highlight ? 'bg-brand-red w-1/4' : 'bg-brand-blue w-3/4'}`} 
              />
            </div>
          </div>
        ))}
      </div>

      {/* Two columns layout for future content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Column (60%) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-brand-gray-border shadow-sm flex flex-col p-5">
          <h3 className="text-base font-bold text-slate-800 mb-4">Active Field Staff</h3>
          <div className="flex-1 border-2 border-dashed border-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-sm">
            [ Espacio para la tabla de personal ]
          </div>
        </div>

        {/* Right Column (40%) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-brand-gray-border shadow-sm flex flex-col p-5">
          <h3 className="text-base font-bold text-slate-800 mb-4">Live Activity</h3>
          <div className="flex-1 border-2 border-dashed border-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-sm">
            [ Espacio para el feed en vivo ]
          </div>
        </div>

      </div>
    </div>
  );
}
