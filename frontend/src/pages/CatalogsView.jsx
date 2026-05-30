import React, { useState, useEffect } from 'react';
import { Package, Map as MapIcon, Plus, Save, Edit2, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { API } from '../api/client';
import { Modal } from '../components/common/Modal';

export function CatalogsView() {
  const [activeTab, setActiveTab] = useState('mercados'); // 'mercados' | 'categorias'
  
  // Datos
  const [mercados, setMercados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [m, c] = await Promise.all([API.getMercados(), API.getCategorias()]);
      setMercados(m || []);
      setCategorias(c || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const openNewModal = () => {
    if (activeTab === 'mercados') {
      setFormData({ nombre: '', id_ciudad: 1 });
    } else {
      setFormData({ nombre: '', criterio_clasificacion: '', tiempo_promedio_visita_min: 15 });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'mercados') {
        const payload = {
          nombre: formData.nombre,
          id_ciudad: parseInt(formData.id_ciudad) || 1,
          activo: true
        };
        const created = await API.crearMercado(payload);
        setMercados([created, ...mercados]);
      } else {
        const payload = {
          nombre: formData.nombre,
          criterio_clasificacion: formData.criterio_clasificacion,
          tiempo_promedio_visita_min: parseInt(formData.tiempo_promedio_visita_min) || 15,
          activo: true
        };
        const created = await API.crearCategoria(payload);
        setCategorias([created, ...categorias]);
      }
      setIsModalOpen(false);
    } catch (error) {
      alert("Error al guardar.");
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Gestión de Catálogos</h2>
          <p className="text-sm text-slate-500 mt-1">Administra los mercados, zonas y categorías de clientes.</p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-brand-blue hover:bg-brand-blue-hover text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={16} />
          Nuevo {activeTab === 'mercados' ? 'Mercado' : 'Categoría'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-brand-gray-border shadow-sm flex flex-col flex-1 min-h-0">
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('mercados')}
            className={clsx("flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2", activeTab === 'mercados' ? "border-brand-blue text-brand-blue bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700")}
          >
            <MapIcon size={18} /> Mercados y Zonas
          </button>
          <button 
            onClick={() => setActiveTab('categorias')}
            className={clsx("flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2", activeTab === 'categorias' ? "border-brand-blue text-brand-blue bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700")}
          >
            <Package size={18} /> Categorías de PDV
          </button>
        </div>

        <div className="overflow-x-auto flex-1 p-4">
          {isLoading ? (
            <div className="text-center text-slate-500 py-10">Cargando catálogos...</div>
          ) : activeTab === 'mercados' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                  <th className="px-4 py-3 rounded-l-lg">ID</th>
                  <th className="px-4 py-3">Nombre del Mercado</th>
                  <th className="px-4 py-3">ID Ciudad</th>
                  <th className="px-4 py-3 text-center rounded-r-lg">Estado</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {mercados.map(m => (
                  <tr key={m.id_mercado} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500 font-mono">{m.id_mercado}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{m.nombre}</td>
                    <td className="px-4 py-3 text-slate-600">{m.id_ciudad}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={clsx("px-2 py-1 rounded text-[10px] font-bold uppercase", m.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {m.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                  <th className="px-4 py-3 rounded-l-lg">ID</th>
                  <th className="px-4 py-3">Nombre Categoría</th>
                  <th className="px-4 py-3">Criterio Clasificación</th>
                  <th className="px-4 py-3 text-center rounded-r-lg">Tiempo Visita (min)</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {categorias.map(c => (
                  <tr key={c.id_categoria} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500 font-mono">{c.id_categoria}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{c.nombre}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{c.criterio_clasificacion}</td>
                    <td className="px-4 py-3 text-center font-bold text-brand-blue">{c.tiempo_promedio_visita_min}'</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={activeTab === 'mercados' ? "Nuevo Mercado" : "Nueva Categoría"}>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Nombre</label>
            <input type="text" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>

          {activeTab === 'mercados' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">ID Ciudad</label>
              <input type="number" required value={formData.id_ciudad} onChange={e => setFormData({...formData, id_ciudad: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>
          )}

          {activeTab === 'categorias' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Criterio de Clasificación</label>
                <input type="text" required value={formData.criterio_clasificacion} onChange={e => setFormData({...formData, criterio_clasificacion: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tiempo Promedio (Minutos)</label>
                <input type="number" required value={formData.tiempo_promedio_visita_min} onChange={e => setFormData({...formData, tiempo_promedio_visita_min: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>
            </>
          )}

          <div className="mt-4 pt-4 border-t flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-bold"><Save size={16} className="inline mr-1"/> Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
