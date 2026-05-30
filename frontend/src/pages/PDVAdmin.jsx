import React, { useState, useMemo } from 'react';
import { Search, Plus, Download, Edit2, ArrowRightLeft, Save } from 'lucide-react';
import clsx from 'clsx';
import { Modal } from '../components/common/Modal';

// --- INITIAL MOCK DATA ---
const initialPdvList = [
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
  // Estado de los datos
  const [pdvs, setPdvs] = useState(initialPdvList);
  
  // Estados de Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [priorityFilter, setPriorityFilter] = useState('Todas');

  // Estado del Modal "Nuevo PDV"
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado del Formulario
  const [newPdv, setNewPdv] = useState({
    name: '', address: '', market: 'Metropolitana', category: 'Retail', priority: 'Media', days: []
  });

  // Lógica de Filtrado Local
  const filteredPdvs = useMemo(() => {
    return pdvs.filter(pdv => {
      const matchesSearch = pdv.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            pdv.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'Todas' || pdv.category === categoryFilter;
      const matchesPriority = priorityFilter === 'Todas' || pdv.priority === priorityFilter;
      
      return matchesSearch && matchesCategory && matchesPriority;
    });
  }, [pdvs, searchQuery, categoryFilter, priorityFilter]);

  // Lógica para alternar selección de días en el formulario
  const toggleDay = (dayVal) => {
    setNewPdv(prev => ({
      ...prev,
      days: prev.days.includes(dayVal) 
        ? prev.days.filter(d => d !== dayVal) 
        : [...prev.days, dayVal].sort()
    }));
  };

  // Lógica para guardar un Nuevo PDV localmente
  const handleSavePdv = (e) => {
    e.preventDefault();
    const generatedId = `GV-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
    
    const newEntry = {
      id: generatedId,
      name: newPdv.name,
      address: newPdv.address,
      market: newPdv.market,
      category: newPdv.category,
      priority: newPdv.priority,
      assigned: 'Sin Asignar',
      days: newPdv.days,
      freq: `${newPdv.days.length}/7`
    };

    setPdvs([newEntry, ...pdvs]);
    setIsModalOpen(false);
    
    // Limpiar formulario
    setNewPdv({ name: '', address: '', market: 'Metropolitana', category: 'Retail', priority: 'Media', days: [] });
  };

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
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-blue hover:bg-brand-blue-hover text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
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
            <span className="text-2xl font-bold text-slate-800">{pdvs.length}</span>
          </div>
        </div>
        {/* Mostrando resultados filtrados para dar un feedback dinámico */}
        <div className="bg-white p-4 rounded-xl border border-brand-gray-border shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Resultados</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-brand-blue">{filteredPdvs.length}</span>
            <span className="text-xs font-medium text-slate-500">filtrados</span>
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
        
        {/* Barra de Filtros interactiva */}
        <div className="p-4 border-b border-brand-gray-border flex flex-wrap gap-4 items-end bg-slate-50/50 rounded-t-xl">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Búsqueda rápida</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre PDV o Código GV..." 
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-brand-blue outline-none" 
              />
            </div>
          </div>
          <div className="w-48">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Categoría</label>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none bg-white cursor-pointer"
            >
              <option value="Todas">Todas las categorías</option>
              <option value="Retail">Retail</option>
              <option value="Mayorista">Mayorista</option>
              <option value="Bodega">Bodega</option>
              <option value="Horeca">Horeca</option>
            </select>
          </div>
          <div className="w-48">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Prioridad</label>
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none bg-white cursor-pointer"
            >
              <option value="Todas">Cualquier prioridad</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
        </div>

        {/* Tabla de Alta Densidad */}
        <div className="overflow-x-auto flex-1">
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
              {filteredPdvs.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-5 py-10 text-center text-slate-500">
                    No se encontraron resultados para los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredPdvs.map((pdv, i) => {
                  let priorityColor = "text-slate-600 bg-slate-100";
                  if (pdv.priority === 'Alta') priorityColor = "text-brand-red bg-red-50";
                  if (pdv.priority === 'Media') priorityColor = "text-brand-blue bg-blue-50";

                  return (
                    <tr key={pdv.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-brand-blue whitespace-nowrap">{pdv.id}</td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800">{pdv.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{pdv.address}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium">{pdv.market}</td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-block border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                          {pdv.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={clsx("inline-block text-xs font-bold px-2 py-1 rounded-full", priorityColor)}>
                          {pdv.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                            {pdv.assigned.charAt(0)}
                          </div>
                          <span className={clsx("text-sm whitespace-nowrap font-medium", pdv.assigned === 'Sin Asignar' ? "text-slate-400 italic" : "text-slate-700")}>
                            {pdv.assigned}
                          </span>
                        </div>
                      </td>
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
                      <td className="px-5 py-4 text-center text-slate-500 font-medium text-xs">{pdv.freq}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="flex items-center gap-1 text-slate-400 hover:text-brand-blue transition-colors text-xs font-medium">
                            <Edit2 size={14} />
                          </button>
                          <button className="flex items-center gap-1 text-slate-400 hover:text-slate-700 transition-colors text-xs font-medium">
                            <ArrowRightLeft size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Paginación */}
        <div className="p-4 border-t border-brand-gray-border flex justify-between items-center text-sm text-slate-500 bg-slate-50/50 rounded-b-xl">
          <span>Mostrando {filteredPdvs.length} registros</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 border border-slate-200 rounded hover:bg-white bg-slate-50 opacity-50 cursor-not-allowed">&lt;</button>
            <button className="px-3 py-1.5 border border-brand-blue bg-brand-blue text-white rounded shadow-sm">1</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded hover:bg-white bg-slate-50 opacity-50 cursor-not-allowed">&gt;</button>
          </div>
        </div>

      </div>

      {/* MODAL: Nuevo PDV */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Nuevo PDV">
        <form onSubmit={handleSavePdv} className="flex flex-col gap-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nombre */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Nombre del Local</label>
              <input 
                type="text" required
                value={newPdv.name} onChange={e => setNewPdv({...newPdv, name: e.target.value})}
                placeholder="Ej. Micromercado San Juan" 
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
              />
            </div>
            
            {/* Dirección */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Dirección / Referencia</label>
              <input 
                type="text" required
                value={newPdv.address} onChange={e => setNewPdv({...newPdv, address: e.target.value})}
                placeholder="Calle o avenida principal..." 
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
              />
            </div>

            {/* Mercado */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Mercado / Zona</label>
              <select 
                value={newPdv.market} onChange={e => setNewPdv({...newPdv, market: e.target.value})}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue cursor-pointer"
              >
                <option value="Metropolitana">Metropolitana</option>
                <option value="Norte Coast">Norte Coast</option>
                <option value="Sur Sierra">Sur Sierra</option>
              </select>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Categoría</label>
              <select 
                value={newPdv.category} onChange={e => setNewPdv({...newPdv, category: e.target.value})}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue cursor-pointer"
              >
                <option value="Retail">Retail</option>
                <option value="Mayorista">Mayorista</option>
                <option value="Bodega">Bodega</option>
                <option value="Horeca">Horeca</option>
              </select>
            </div>

            {/* Prioridad */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Nivel de Prioridad</label>
              <div className="flex gap-2">
                {['Alta', 'Media', 'Baja'].map(pri => (
                  <button
                    key={pri} type="button"
                    onClick={() => setNewPdv({...newPdv, priority: pri})}
                    className={clsx(
                      "flex-1 py-2 border rounded-lg text-sm font-bold transition-colors",
                      newPdv.priority === pri && pri === 'Alta' ? "bg-red-50 border-brand-red text-brand-red" :
                      newPdv.priority === pri && pri === 'Media' ? "bg-blue-50 border-brand-blue text-brand-blue" :
                      newPdv.priority === pri && pri === 'Baja' ? "bg-slate-100 border-slate-400 text-slate-700" :
                      "border-slate-200 text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    {pri}
                  </button>
                ))}
              </div>
            </div>

            {/* Días de Visita */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Frecuencia de Visita</label>
              <div className="flex justify-between">
                {daysOfWeek.map(day => {
                  const isActive = newPdv.days.includes(day.val);
                  return (
                    <button
                      key={day.val} type="button"
                      onClick={() => toggleDay(day.val)}
                      className={clsx(
                        "w-9 h-9 rounded-lg font-bold text-xs transition-colors border",
                        isActive ? "bg-brand-blue border-brand-blue text-white shadow-sm transform scale-105" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                      )}
                    >
                      {day.letter}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 text-right">
                {newPdv.days.length} días seleccionados
              </p>
            </div>
          </div>

          {/* Footer del Formulario */}
          <div className="mt-6 pt-5 border-t border-slate-200 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={newPdv.days.length === 0}
              className={clsx(
                "px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm",
                newPdv.days.length === 0 
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                  : "bg-brand-blue text-white hover:bg-brand-blue-hover"
              )}
            >
              <Save size={16} />
              Guardar PDV
            </button>
          </div>
          
        </form>
      </Modal>

    </div>
  );
}
