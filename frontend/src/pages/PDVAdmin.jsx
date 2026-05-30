import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Download, Edit2, ArrowRightLeft, Save, Map as MapIcon, List as ListIcon, MapPin } from 'lucide-react';
import clsx from 'clsx';
import { Modal } from '../components/common/Modal';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { API } from '../api/client';

// Configurar Icono por defecto de Leaflet (Fix para Vite)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper para crear marcadores de colores
const createColoredIcon = (priority) => {
  let color = '#94a3b8'; // Baja - Gris
  if (priority?.toLowerCase() === 'alta') color = '#ef4444';
  if (priority?.toLowerCase() === 'media') color = '#3b82f6';

  return L.divIcon({
    className: 'custom-colored-marker',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

// Componente utilitario para seleccionar punto en el minimapa
function LocationPicker({ lat, lng, setLocation }) {
  useMapEvents({
    click(e) {
      setLocation(e.latlng.lat, e.latlng.lng);
    },
  });
  return lat && lng ? <Marker position={[lat, lng]} /> : null;
}

export function PDVAdmin() {
  const [pdvs, setPdvs] = useState([]);
  const [mercados, setMercados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de Vista y Filtros
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [priorityFilter, setPriorityFilter] = useState('Todas');

  // Estado del Modal "Nuevo PDV"
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado del Formulario
  const [newPdv, setNewPdv] = useState({
    nombre_pdv: '',
    direccion: '',
    id_mercado: '',
    id_categoria: '',
    prioridad: 'media',
    codigo_gv: '',
    latitud: '',
    longitud: '',
    gmaps_url: '',
    tiempo_visita_min: 15
  });

  // Cargar datos
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [pdvsData, mercData, catData] = await Promise.all([
          API.getPdvs(),
          API.getMercados(),
          API.getCategorias()
        ]);
        setPdvs(pdvsData || []);
        setMercados(mercData || []);
        setCategorias(catData || []);
      } catch (error) {
        console.error("Error fetching PDV data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filtrado
  const filteredPdvs = useMemo(() => {
    return pdvs.filter(pdv => {
      const name = pdv.nombre_pdv || pdv.codigo_gv || '';
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'Todas' || pdv.id_categoria?.toString() === categoryFilter.toString();
      const matchesPriority = priorityFilter === 'Todas' || pdv.prioridad?.toLowerCase() === priorityFilter.toLowerCase();
      
      return matchesSearch && matchesCategory && matchesPriority;
    });
  }, [pdvs, searchQuery, categoryFilter, priorityFilter]);

  // Manejador del form URL Gmaps
  const handleUrlChange = (url) => {
    setNewPdv(prev => ({ ...prev, gmaps_url: url }));
    // Parse /@-16.537,-68.048,
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      setNewPdv(prev => ({ ...prev, latitud: match[1], longitud: match[2] }));
    }
  };

  const handleSavePdv = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nombre_pdv: newPdv.nombre_pdv,
        direccion: newPdv.direccion,
        id_mercado: parseInt(newPdv.id_mercado),
        id_categoria: parseInt(newPdv.id_categoria),
        prioridad: newPdv.prioridad,
        codigo_gv: newPdv.codigo_gv || `GV-${Math.floor(1000 + Math.random() * 9000)}`,
        latitud: parseFloat(newPdv.latitud) || 0,
        longitud: parseFloat(newPdv.longitud) || 0,
        tiempo_visita_min: newPdv.tiempo_visita_min,
        activo: true
      };
      
      const created = await API.crearPdv(payload);
      setPdvs([created, ...pdvs]);
      setIsModalOpen(false);
      // Reset
      setNewPdv({ nombre_pdv: '', direccion: '', id_mercado: '', id_categoria: '', prioridad: 'media', codigo_gv: '', latitud: '', longitud: '', gmaps_url: '', tiempo_visita_min: 15 });
    } catch (error) {
      console.error("Error creating PDV:", error);
      alert("Hubo un error al crear el punto de venta.");
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight transition-colors">Administración de Puntos de Venta (PDV)</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Gestiona y asigna la red de distribución regional.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white dark:bg-dark-card rounded-lg p-1 border border-slate-200 dark:border-slate-700 flex shadow-sm transition-colors">
            <button 
              onClick={() => setViewMode('list')}
              className={clsx("px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors", viewMode === 'list' ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200")}
            >
              <ListIcon size={16} /> Lista
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={clsx("px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors", viewMode === 'map' ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200")}
            >
              <MapIcon size={16} /> Mapa
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-blue hover:bg-brand-blue-hover text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Nuevo PDV
          </button>
        </div>
      </div>

      {/* Contenedor Principal (Filtros + Vista) */}
      <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col flex-1 min-h-0 transition-colors">
        
        {/* Barra de Filtros interactiva */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-end bg-slate-50/50 dark:bg-slate-800/50 rounded-t-xl z-10 transition-colors">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Búsqueda rápida</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre PDV o Código..." 
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm focus:ring-1 focus:ring-brand-blue outline-none transition-colors" 
              />
            </div>
          </div>
          <div className="w-48">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Categoría</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white cursor-pointer transition-colors">
              <option value="Todas">Todas</option>
              {categorias.map(cat => (
                <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
              ))}
            </select>
          </div>
          <div className="w-48">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Prioridad</label>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white cursor-pointer transition-colors">
              <option value="Todas">Cualquier</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
        </div>

        {/* ÁREA DE CONTENIDO: LISTA o MAPA */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-10 text-slate-500">Cargando puntos de venta...</div>
        ) : viewMode === 'list' ? (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 transition-colors">
                  <th className="px-5 py-4 w-24">Código GV</th>
                  <th className="px-5 py-4">Punto de Venta</th>
                  <th className="px-5 py-4">Mercado</th>
                  <th className="px-5 py-4 text-center">Categoría</th>
                  <th className="px-5 py-4 text-center">Prioridad</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredPdvs.map(pdv => (
                  <tr key={pdv.id_pdv} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-brand-blue">{pdv.codigo_gv}</td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{pdv.nombre_pdv || 'Sin Nombre'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{pdv.direccion || 'Sin Dirección'}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300 font-medium">{mercados.find(m => m.id_mercado === pdv.id_mercado)?.nombre || 'N/A'}</td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-block border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-colors">
                        {categorias.find(c => c.id_categoria === pdv.id_categoria)?.nombre || 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={clsx("inline-block text-xs font-bold px-2 py-1 rounded-full uppercase", 
                        pdv.prioridad === 'alta' ? "text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400" : 
                        pdv.prioridad === 'media' ? "text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" : 
                        "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400"
                      )}>
                        {pdv.prioridad}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-1 min-h-0 relative z-0">
            {/* Lista minimalista lateral */}
            <div className="w-80 bg-white dark:bg-dark-card border-r border-slate-200 dark:border-slate-700 overflow-y-auto hidden md:block shadow-sm z-10 transition-colors">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 sticky top-0 backdrop-blur-sm z-20 transition-colors">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Puntos de Venta</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{filteredPdvs.length} locales encontrados</p>
              </div>
              <div className="flex flex-col">
                {filteredPdvs.map(pdv => (
                  <div key={pdv.id_pdv} className="p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-all duration-200 group">
                    <div className="flex justify-between items-start mb-1.5">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-blue transition-colors leading-tight">
                        {pdv.nombre_pdv || 'Sin Nombre'}
                      </h4>
                      <span className={clsx(
                        "w-2.5 h-2.5 rounded-full shrink-0 shadow-sm mt-0.5", 
                        pdv.prioridad === 'alta' ? "bg-red-500" : 
                        pdv.prioridad === 'media' ? "bg-blue-500" : "bg-slate-400"
                      )} />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded transition-colors">{pdv.codigo_gv}</p>
                      <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{categorias.find(c => c.id_categoria === pdv.id_categoria)?.nombre || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Mapa Interactivo */}
            <div className="flex-1 relative bg-slate-100 z-0">
              <MapContainer center={[-16.5, -68.15]} zoom={12} className="w-full h-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                {filteredPdvs.filter(p => p.latitud && p.longitud).map(pdv => (
                  <Marker 
                    key={pdv.id_pdv} 
                    position={[pdv.latitud, pdv.longitud]}
                    icon={createColoredIcon(pdv.prioridad)}
                  >
                    <Popup>
                      <div className="p-1">
                        <p className="font-bold text-sm">{pdv.nombre_pdv || pdv.codigo_gv}</p>
                        <p className="text-xs text-slate-500">{pdv.direccion}</p>
                        <span className="text-[10px] font-bold text-white bg-brand-blue px-1.5 py-0.5 rounded mt-1 inline-block uppercase">
                          {pdv.prioridad}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        )}

      </div>

      {/* MODAL: Nuevo PDV */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Nuevo PDV">
        <form onSubmit={handleSavePdv} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Nombre del Local</label>
              <input type="text" required value={newPdv.nombre_pdv} onChange={e => setNewPdv({...newPdv, nombre_pdv: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm transition-colors focus:ring-1 focus:ring-brand-blue outline-none" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Dirección / Referencia</label>
              <input type="text" required value={newPdv.direccion} onChange={e => setNewPdv({...newPdv, direccion: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm transition-colors focus:ring-1 focus:ring-brand-blue outline-none" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Mercado / Zona</label>
              <select required value={newPdv.id_mercado} onChange={e => setNewPdv({...newPdv, id_mercado: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm transition-colors focus:ring-1 focus:ring-brand-blue outline-none">
                <option value="">Seleccione...</option>
                {mercados.map(m => <option key={m.id_mercado} value={m.id_mercado}>{m.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Categoría</label>
              <select required value={newPdv.id_categoria} onChange={e => setNewPdv({...newPdv, id_categoria: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm transition-colors focus:ring-1 focus:ring-brand-blue outline-none">
                <option value="">Seleccione...</option>
                {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Prioridad</label>
              <select value={newPdv.prioridad} onChange={e => setNewPdv({...newPdv, prioridad: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm transition-colors focus:ring-1 focus:ring-brand-blue outline-none">
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>

            {/* Selector de Coordenadas */}
            <div className="md:col-span-2 border-t border-slate-200 dark:border-slate-700 pt-4 mt-2 transition-colors">
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Ubicación Geográfica</label>
              
              <div className="flex gap-2 items-end mb-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">1. Pegar URL de Google Maps</label>
                  <input type="text" value={newPdv.gmaps_url} onChange={(e) => handleUrlChange(e.target.value)} placeholder="https://www.google.com/maps/@-16.5,-68.1,15z" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm transition-colors focus:ring-1 focus:ring-brand-blue outline-none" />
                </div>
                <div className="flex-1 flex gap-2">
                  <div className="w-1/2">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Latitud</label>
                    <input type="number" step="any" value={newPdv.latitud} onChange={e => setNewPdv({...newPdv, latitud: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm transition-colors focus:ring-1 focus:ring-brand-blue outline-none" />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Longitud</label>
                    <input type="number" step="any" value={newPdv.longitud} onChange={e => setNewPdv({...newPdv, longitud: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm transition-colors focus:ring-1 focus:ring-brand-blue outline-none" />
                  </div>
                </div>
              </div>

              <div className="h-48 w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 relative z-0">
                <p className="absolute top-2 left-2 z-[400] bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 px-2 py-1 text-[10px] font-bold rounded shadow pointer-events-none">2. O haz clic en el mapa para fijar el pin</p>
                <MapContainer center={newPdv.latitud && newPdv.longitud ? [parseFloat(newPdv.latitud), parseFloat(newPdv.longitud)] : [-16.5, -68.15]} zoom={13} className="w-full h-full">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker lat={newPdv.latitud} lng={newPdv.longitud} setLocation={(lat, lng) => setNewPdv({...newPdv, latitud: lat, longitud: lng})} />
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Footer del Formulario */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 transition-colors">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
            <button type="submit" disabled={!newPdv.latitud || !newPdv.id_mercado || !newPdv.id_categoria} className="px-4 py-2 bg-brand-blue text-white hover:bg-brand-blue-hover rounded-lg text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <Save size={16} /> Guardar PDV
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
