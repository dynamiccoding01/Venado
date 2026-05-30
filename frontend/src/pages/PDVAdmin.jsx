import React from 'react';
import { Search, Plus, Download, Edit2, ArrowRightLeft } from 'lucide-react';
import clsx from 'clsx';

// --- MOCK DATA ---
const pdvList = [
  { id: 'GV-4920-X', name: 'Mini Market Los Olivos', address: 'Av. Principal 123, Sector 4', market: 'Metropolitana', category: 'Retail', priority: 'Alta', assigned: 'C. Ramírez', days: [1, 2, 4, 5], freq: '3/7' },
  { id: 'GV-8821-M', name: 'Distribuidora El Sol', address: 'Calle Comercio 88, Zona Industrial', market: 'Norte Coast', category: 'Mayorista', priority: 'Media', assigned: 'J. Guzmán', days: [2, 4], freq: '2/7' },
  { id: 'GV-1029-B', name: 'Bodega San Francisco', address: 'Pasaje Los Pinos 45, Urbanización Real', market: 'Sur Sierra', category: 'Bodega', priority: 'Baja', assigned: 'M. Torres', days: [5], freq: '1/7' },
  { id: 'GV-6632-L', name: 'Hotel Vista Linda', address: 'Malecón de la Reserva 450', market: 'Metropolitana', category: 'Horeca', priority: 'Alta', assigned: 'A. Vargas', days: [1, 2, 3, 4, 5], freq: '5/7' },
];

const daysOfWeek = [
  { letter: 'L', val: 1 }, { letter: 'M', val: 2 }, { letter: 'X', val: 3 },
  { letter: 'J', val: 4 }, { letter: 'V', val: 5 }, { letter: 'S', val: 6 }, { letter: 'D', val: 7 }
];

export function PDVAdmin() {
  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Administración de Puntos de Venta (PDV)</h2>
          <p className="text-sm text-slate-500 mt-1">Gestiona y asigna la red de distribución regional.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Download size={16} />
            Exportar
          </button>
          <button className="bg-brand-blue hover:bg-brand-blue-hover text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Plus size={16} />
            Nuevo PDV
          </button>
        </div>
      </div>

      {/* Tarjetas de Resumen Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-brand-gray-border shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Total PDV</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">1,284</span>
            <span className="text-xs font-medium text-brand-blue">+12 este mes</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-brand-gray-border shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Visitas Pendientes</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">432</span>
            <span className="text-xs font-medium text-brand-red">14 retrasadas</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-brand-gray-border shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Staff Activo</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">48</span>
            <span className="text-xs font-medium text-slate-500">Repartidores</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-brand-gray-border shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Cobertura Mensual</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">94.2%</span>
          </div>
          <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-blue w-[94.2%]" />
          </div>
        </div>
      </div>

      {/* Contenedor Principal (Filtros + Tabla) */}
      <div className="bg-white rounded-xl border border-brand-gray-border shadow-sm flex flex-col flex-1 min-h-0">
        
        {/* Barra de Filtros */}
        <div className="p-4 border-b border-brand-gray-border flex flex-wrap gap-4 items-end bg-slate-50/50 rounded-t-xl">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Búsqueda rápida</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Nombre PDV o Código GV..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-brand-blue outline-none" />
            </div>
          </div>
          <div className="w-48">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Categoría</label>
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
              <option>Todas las categorías</option>
            </select>
          </div>
          <div className="w-48">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Prioridad</label>
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
              <option>Cualquier prioridad</option>
            </select>
          </div>
          <div className="w-48">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Mercado / Zona</label>
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
              <option>Todos los mercados</option>
            </select>
          </div>
        </div>

        {/* Tabla de Alta Densidad */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-brand-gray-border">
                <th className="px-5 py-4 w-32">Código GV</th>
                <th className="px-5 py-4">Punto de Venta</th>
                <th className="px-5 py-4">Mercado</th>
                <th className="px-5 py-4 text-center">Categoría</th>
                <th className="px-5 py-4 text-center">Prioridad</th>
                <th className="px-5 py-4">Asignado</th>
                <th className="px-5 py-4 text-center">Días de Visita</th>
                <th className="px-5 py-4 text-center w-24">Frec.</th>
                <th className="px-5 py-4 text-right w-40">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {pdvList.map((pdv, i) => {
                
                // Mapeo de prioridad a nuestros colores corporativos
                let priorityColor = "text-slate-600 bg-slate-100";
                if (pdv.priority === 'Alta') priorityColor = "text-brand-red bg-red-50";
                if (pdv.priority === 'Media') priorityColor = "text-brand-blue bg-blue-50";

                return (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                    {/* Código GV */}
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-brand-blue whitespace-nowrap">
                      {pdv.id}
                    </td>
                    
                    {/* Nombre y Dirección */}
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800">{pdv.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{pdv.address}</p>
                    </td>
                    
                    {/* Mercado */}
                    <td className="px-5 py-4 text-slate-600 font-medium">
                      {pdv.market}
                    </td>
                    
                    {/* Categoría Badge */}
                    <td className="px-5 py-4 text-center">
                      <span className="inline-block border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                        {pdv.category}
                      </span>
                    </td>
                    
                    {/* Prioridad Pill */}
                    <td className="px-5 py-4 text-center">
                      <span className={clsx("inline-block text-xs font-bold px-2 py-1 rounded-full", priorityColor)}>
                        {pdv.priority}
                      </span>
                    </td>
                    
                    {/* Staff Asignado */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                          {pdv.assigned.split(' ')[1].charAt(0)}
                        </div>
                        <span className="text-slate-700 text-sm whitespace-nowrap">{pdv.assigned}</span>
                      </div>
                    </td>
                    
                    {/* Días de Visita (Micro-chips) */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        {daysOfWeek.map(day => {
                          const isActive = pdv.days.includes(day.val);
                          return (
                            <div 
                              key={day.val}
                              className={clsx(
                                "w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold transition-colors",
                                isActive ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-400"
                              )}
                            >
                              {day.letter}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    
                    {/* Frecuencia */}
                    <td className="px-5 py-4 text-center text-slate-500 font-medium text-xs">
                      {pdv.freq}
                    </td>
                    
                    {/* Acciones Inline */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="flex items-center gap-1 text-slate-400 hover:text-brand-blue transition-colors text-xs font-medium">
                          <Edit2 size={14} /> Editar
                        </button>
                        <button className="flex items-center gap-1 text-slate-400 hover:text-slate-700 transition-colors text-xs font-medium">
                          <ArrowRightLeft size={14} /> Reasignar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Paginación */}
        <div className="p-4 border-t border-brand-gray-border flex justify-between items-center text-sm text-slate-500 bg-slate-50/50 rounded-b-xl">
          <span>Mostrando 1-4 de 1,284 registros</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 border border-slate-200 rounded hover:bg-white bg-slate-50">&lt;</button>
            <button className="px-3 py-1.5 border border-brand-blue bg-brand-blue text-white rounded shadow-sm">1</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded hover:bg-white bg-slate-50">2</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded hover:bg-white bg-slate-50">3</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded hover:bg-white bg-slate-50">&gt;</button>
          </div>
        </div>

      </div>
    </div>
  );
}
