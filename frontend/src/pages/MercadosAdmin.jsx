import React, { useState, useEffect } from 'react';
import { Search, Plus, Save, Map as MapIcon } from 'lucide-react';
import clsx from 'clsx';
import { API } from '../api/client';
import { Modal } from '../components/common/Modal';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function LocationPicker({ lat, lng, setLocation }) {
  useMapEvents({
    click(e) {
      setLocation(e.latlng.lat, e.latlng.lng);
    },
  });
  return lat && lng ? <Marker position={[lat, lng]} /> : null;
}

export function MercadosAdmin() {
  const [mercados, setMercados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    id_ciudad: 1,
    direccion: '',
    latitud: '',
    longitud: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await API.getMercados();
      setMercados(data || []);
    } catch (e) {
      console.error("Error loading mercados", e);
    } finally {
      setIsLoading(false);
    }
  };

  const openNewModal = () => {
    setFormData({ nombre: '', id_ciudad: 1, direccion: '', latitud: '', longitud: '' });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nombre: formData.nombre,
        id_ciudad: parseInt(formData.id_ciudad) || 1,
        direccion: formData.direccion,
        latitud: parseFloat(formData.latitud) || null,
        longitud: parseFloat(formData.longitud) || null,
        activo: true
      };
      const created = await API.crearMercado(payload);
      setMercados([created, ...mercados]);
      setIsModalOpen(false);
    } catch (error) {
      alert("Error al guardar el mercado.");
      console.error(error);
    }
  };

  const filteredData = mercados.filter(m => m.nombre?.toLowerCase().includes(searchQuery.toLowerCase()));

  // Mapeo simple de ciudades por defecto
  const getCiudadNombre = (id) => {
    const ciudades = { 1: 'La Paz', 2: 'El Alto', 3: 'Santa Cruz', 4: 'Cochabamba' };
    return ciudades[id] || `Ciudad ${id}`;
  };

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2 transition-colors">
            <MapIcon className="text-brand-blue" />
            Administración de Mercados y Zonas
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Gestiona las áreas geográficas y mercados operativos.</p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-brand-blue hover:bg-brand-blue-hover text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={16} /> Nuevo Mercado
        </button>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border shadow-sm flex flex-col flex-1 min-h-0 transition-colors duration-300">
        <div className="p-4 border-b border-slate-200 dark:border-dark-border flex bg-slate-50/50 dark:bg-slate-800/30 rounded-t-xl transition-colors">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
            <input 
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar mercado..." 
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-brand-blue outline-none transition-colors" 
            />
          </div>
        </div>

        <div className="overflow-x-auto flex-1 p-4">
          {isLoading ? (
            <div className="text-center text-slate-500 dark:text-slate-400 py-10">Cargando mercados...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-700 transition-colors">
                  <th className="px-4 py-3 rounded-tl-lg">ID</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Ciudad</th>
                  <th className="px-4 py-3">Dirección</th>
                  <th className="px-4 py-3">Coordenadas</th>
                  <th className="px-4 py-3 text-center rounded-tr-lg">Estado</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredData.map(m => (
                  <tr key={m.id_mercado} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                    <td className="px-4 py-4 text-slate-500 dark:text-slate-400 font-mono">{m.id_mercado}</td>
                    <td className="px-4 py-4 font-bold text-slate-800 dark:text-slate-200">{m.nombre}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-medium">{getCiudadNombre(m.id_ciudad)}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400 truncate max-w-[200px]">{m.direccion || 'Sin dirección'}</td>
                    <td className="px-4 py-4 text-slate-500 dark:text-slate-500 text-xs font-mono">
                      {m.latitud && m.longitud ? `${m.latitud.toFixed(4)}, ${m.longitud.toFixed(4)}` : 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={clsx("px-2 py-1 rounded text-[10px] font-bold uppercase", m.activo ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400")}>
                        {m.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Nuevo Mercado/Zona">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Nombre del Mercado</label>
              <input type="text" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} placeholder="Ej. Mercado Rodriguez" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm transition-colors focus:ring-1 focus:ring-brand-blue outline-none" />
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Ciudad</label>
              <select required value={formData.id_ciudad} onChange={e => setFormData({...formData, id_ciudad: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm transition-colors focus:ring-1 focus:ring-brand-blue outline-none">
                <option value="1">La Paz</option>
                <option value="2">El Alto</option>
                <option value="3">Santa Cruz</option>
                <option value="4">Cochabamba</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Dirección / Referencia</label>
              <input type="text" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} placeholder="Dirección física" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm transition-colors focus:ring-1 focus:ring-brand-blue outline-none" />
            </div>

            <div className="md:col-span-2 border-t border-slate-200 dark:border-slate-700 pt-4 mt-2 transition-colors">
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Ubicación en el Mapa</label>
              <div className="flex gap-2 mb-4">
                <div className="w-1/2">
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Latitud</label>
                  <input type="number" step="any" value={formData.latitud} onChange={e => setFormData({...formData, latitud: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm transition-colors focus:ring-1 focus:ring-brand-blue outline-none" />
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Longitud</label>
                  <input type="number" step="any" value={formData.longitud} onChange={e => setFormData({...formData, longitud: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm transition-colors focus:ring-1 focus:ring-brand-blue outline-none" />
                </div>
              </div>

              <div className="h-40 w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 relative">
                <p className="absolute top-2 left-2 z-[400] bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 px-2 py-1 text-[10px] font-bold rounded shadow pointer-events-none">Haz clic para fijar la coordenada del mercado</p>
                <MapContainer center={formData.latitud && formData.longitud ? [parseFloat(formData.latitud), parseFloat(formData.longitud)] : [-16.5, -68.15]} zoom={12} className="w-full h-full z-0">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker lat={formData.latitud} lng={formData.longitud} setLocation={(lat, lng) => setFormData({...formData, latitud: lat, longitud: lng})} />
                </MapContainer>
              </div>
            </div>
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
