import React, { useState, useEffect } from 'react';
import { Search, Plus, Save, Package } from 'lucide-react';
import clsx from 'clsx';
import { API } from '../api/client';
import { Modal } from '../components/common/Modal';

export function CategoriasAdmin() {
  const [categorias, setCategorias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    criterio_clasificacion: '',
    tiempo_promedio_visita_min: 15,
    perfil_atencion: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await API.getCategorias();
      setCategorias(data || []);
    } catch (e) {
      console.error("Error loading categorias", e);
    } finally {
      setIsLoading(false);
    }
  };

  const openNewModal = () => {
    setFormData({ nombre: '', criterio_clasificacion: '', tiempo_promedio_visita_min: 15, perfil_atencion: '' });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nombre: formData.nombre,
        criterio_clasificacion: formData.criterio_clasificacion,
        tiempo_promedio_visita_min: parseInt(formData.tiempo_promedio_visita_min) || 15,
        perfil_atencion: formData.perfil_atencion,
        activo: true
      };
      const created = await API.crearCategoria(payload);
      setCategorias([created, ...categorias]);
      setIsModalOpen(false);
    } catch (error) {
      alert("Error al guardar la categoría.");
      console.error(error);
    }
  };

  const filteredData = categorias.filter(c => c.nombre?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2 transition-colors">
            <Package className="text-brand-blue" />
            Administración de Categorías
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Gestiona los tipos de clientes y sus perfiles de atención.</p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-brand-blue hover:bg-brand-blue-hover text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={16} /> Nueva Categoría
        </button>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border shadow-sm flex flex-col flex-1 min-h-0 transition-colors duration-300">
        <div className="p-4 border-b border-slate-200 dark:border-dark-border flex bg-slate-50/50 dark:bg-slate-800/30 rounded-t-xl transition-colors">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
            <input 
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar categoría..." 
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-brand-blue outline-none transition-colors" 
            />
          </div>
        </div>

        <div className="overflow-x-auto flex-1 p-4">
          {isLoading ? (
            <div className="text-center text-slate-500 dark:text-slate-400 py-10">Cargando categorías...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-700 transition-colors">
                  <th className="px-4 py-3 rounded-tl-lg">ID</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Criterio</th>
                  <th className="px-4 py-3">Perfil de Atención</th>
                  <th className="px-4 py-3 text-center">T. Visita (min)</th>
                  <th className="px-4 py-3 text-center rounded-tr-lg">Estado</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredData.map(c => (
                  <tr key={c.id_categoria} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                    <td className="px-4 py-4 text-slate-500 dark:text-slate-400 font-mono">{c.id_categoria}</td>
                    <td className="px-4 py-4 font-bold text-slate-800 dark:text-slate-200">{c.nombre}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400 max-w-[200px] truncate">{c.criterio_clasificacion}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400 max-w-[250px] text-xs leading-relaxed">{c.perfil_atencion || 'Sin descripción'}</td>
                    <td className="px-4 py-4 text-center font-bold text-brand-blue bg-blue-50/30 dark:bg-brand-blue/10">{c.tiempo_promedio_visita_min}'</td>
                    <td className="px-4 py-4 text-center">
                      <span className={clsx("px-2 py-1 rounded text-[10px] font-bold uppercase", c.activo ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400")}>
                        {c.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Categoría de Cliente">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Nombre de la Categoría</label>
            <input type="text" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} placeholder="Ej. MINORISTA" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm transition-colors focus:ring-1 focus:ring-brand-blue outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Criterio de Clasificación</label>
            <input type="text" required value={formData.criterio_clasificacion} onChange={e => setFormData({...formData, criterio_clasificacion: e.target.value})} placeholder="Ej. Más de Bs. 5,000 de compra" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm transition-colors focus:ring-1 focus:ring-brand-blue outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Tiempo Promedio de Visita (min)</label>
            <input type="number" required value={formData.tiempo_promedio_visita_min} onChange={e => setFormData({...formData, tiempo_promedio_visita_min: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm transition-colors focus:ring-1 focus:ring-brand-blue outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Perfil de Atención</label>
            <textarea rows="3" value={formData.perfil_atencion} onChange={e => setFormData({...formData, perfil_atencion: e.target.value})} placeholder="Descripción detallada sobre cómo se debe atender a esta categoría..." className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm resize-none transition-colors focus:ring-1 focus:ring-brand-blue outline-none"></textarea>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 transition-colors">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-brand-blue-hover transition-colors"><Save size={16}/> Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
