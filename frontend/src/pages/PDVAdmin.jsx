import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Edit2, Save, Map as MapIcon, List as ListIcon, Trash2, X, Power, PowerOff, Package, Clock } from 'lucide-react';
import clsx from 'clsx';
import { Modal } from '../components/common/Modal';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { API } from '../api/client';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const createColoredIcon = (priority, activo = true) => {
  let color = '#94a3b8'; // Baja o Inactivo
  if (!activo) {
    color = '#475569'; // Gris oscuro para inactivos
  } else {
    if (priority?.toLowerCase() === 'alta') color = '#ef4444';
    if (priority?.toLowerCase() === 'media') color = '#3b82f6';
  }

  return L.divIcon({
    className: 'custom-colored-marker',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4); opacity: ${activo ? 1 : 0.6};"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

function LocationPicker({ lat, lng, setLocation }) {
  useMapEvents({
    click(e) {
      setLocation(e.latlng.lat, e.latlng.lng);
    },
  });
  return lat && lng ? <Marker position={[lat, lng]} /> : null;
}

const PDV_INITIAL_STATE = {
  codigo_gv: '',
  codigo_interno: '',
  nombre_pdv: '',
  direccion: '',
  id_mercado: '',
  id_categoria: '',
  id_supervisor: '',
  id_reponedor_asignado: '',
  latitud: '',
  longitud: '',
  gmaps_url: '',
  tiempo_visita_min: 15,
  prioridad: 'media',
  ventana_horaria_inicio: '08:00',
  ventana_horaria_fin: '18:00',
  nombre_contacto: '',
  telefono_contacto: '',
  notas_especiales: '',
  atiende_lunes: true,
  atiende_martes: true,
  atiende_miercoles: true,
  atiende_jueves: true,
  atiende_viernes: true,
  atiende_sabado: false,
  atiende_domingo: false,
  frecuencia_semanal: 1,
  frecuencia_mensual: 4,
  tiempo_promedio_min: 15,
  recalibrar: false,
  activo: true
};

export function PDVAdmin() {
  const [pdvs, setPdvs] = useState([]);
  const [mercados, setMercados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [supervisores, setSupervisores] = useState([]); // Asumiendo rol 2
  const [reponedores, setReponedores] = useState([]); // Asumiendo rol 3
  const [isLoading, setIsLoading] = useState(true);

  // Estados de Vista y Filtros
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [priorityFilter, setPriorityFilter] = useState('Todas');

  // Estado del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [newPdv, setNewPdv] = useState(PDV_INITIAL_STATE);

  // Entregas e Inventario State
  const [productosCat, setProductosCat] = useState([]);
  const [historialEntregas, setHistorialEntregas] = useState([]);
  const [entregaForm, setEntregaForm] = useState({ id_producto: '', cantidad: '', notas: '' });
  const [isSubmittingEntrega, setIsSubmittingEntrega] = useState(false);

  // Cargar datos
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [pdvsData, mercData, catData, usersData, prodsData] = await Promise.all([
          API.getPdvs(),
          API.getMercados(),
          API.getCategorias(),
          API.getUsuarios(),
          API.getProductos().catch(() => [])
        ]);
        setPdvs(pdvsData || []);
        setMercados(mercData || []);
        setCategorias(catData || []);
        setProductosCat(prodsData || []);
        
        if (usersData) {
           setSupervisores(usersData.filter(u => u.id_rol === 2));
           setReponedores(usersData.filter(u => u.id_rol === 3));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'entregas' && editingId) {
      loadHistorialEntregas(editingId);
    }
  }, [activeTab, editingId]);

  const loadHistorialEntregas = async (id_pdv) => {
    try {
      const data = await API.getHistorialEntregasPdv(id_pdv);
      setHistorialEntregas(data || []);
    } catch (e) {
      console.error("Error cargando entregas", e);
      setHistorialEntregas([]);
    }
  };

  const handleRegistrarEntrega = async () => {
    if (!entregaForm.id_producto || !entregaForm.cantidad) return alert("Selecciona un producto y cantidad.");
    setIsSubmittingEntrega(true);
    try {
      const payload = {
        id_visita: 1, // Visita ficticia admin
        id_reponedor: 1, // Usuario admin
        id_pdv: editingId,
        notas: entregaForm.notas || "Registro Web (Dashboard)",
        productos: [
          {
            id_producto: parseInt(entregaForm.id_producto),
            cantidad_entregada: parseFloat(entregaForm.cantidad)
          }
        ]
      };
      await API.registrarEntrega(payload);
      setEntregaForm({ id_producto: '', cantidad: '', notas: '' });
      loadHistorialEntregas(editingId);
      
      // Actualizar stock localmente
      const prodsData = await API.getProductos().catch(() => []);
      setProductosCat(prodsData || []);
      alert("Entrega registrada exitosamente");
    } catch (e) {
      alert("Error al registrar entrega. Verifica el stock o conectividad.");
    } finally {
      setIsSubmittingEntrega(false);
    }
  };

  const filteredPdvs = useMemo(() => {
    return pdvs.filter(pdv => {
      const name = pdv.nombre_pdv || pdv.codigo_gv || '';
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'Todas' || pdv.id_categoria?.toString() === categoryFilter.toString();
      const matchesPriority = priorityFilter === 'Todas' || pdv.prioridad?.toLowerCase() === priorityFilter.toLowerCase();
      return matchesSearch && matchesCategory && matchesPriority;
    });
  }, [pdvs, searchQuery, categoryFilter, priorityFilter]);

  const handleUrlChange = (url) => {
    setNewPdv(prev => ({ ...prev, gmaps_url: url }));
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      setNewPdv(prev => ({ ...prev, latitud: match[1], longitud: match[2] }));
    }
  };

  const handleOpenCreate = () => {
    setEditMode(false);
    setEditingId(null);
    setNewPdv(PDV_INITIAL_STATE);
    setActiveTab('general');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pdv) => {
    setEditMode(true);
    setEditingId(pdv.id_pdv);
    setNewPdv({
      ...PDV_INITIAL_STATE,
      ...pdv,
      gmaps_url: '',
      // Ensure times are properly formatted HH:mm
      ventana_horaria_inicio: pdv.ventana_horaria_inicio?.substring(0, 5) || '08:00',
      ventana_horaria_fin: pdv.ventana_horaria_fin?.substring(0, 5) || '18:00',
    });
    setActiveTab('general');
    setIsModalOpen(true);
  };

  const handleToggleActive = async (pdv) => {
    if (window.confirm(`¿Estás seguro de que deseas ${pdv.activo ? 'desactivar (suspender)' : 'reactivar'} este Punto de Venta?`)) {
      try {
        const updated = await API.actualizarPdv(pdv.id_pdv, { ...pdv, activo: !pdv.activo });
        setPdvs(prev => prev.map(p => p.id_pdv === pdv.id_pdv ? updated : p));
      } catch (e) {
        alert("Error al cambiar estado.");
      }
    }
  };

  const handleSavePdv = async (e) => {
    e.preventDefault();

    // Validación manual porque los campos están en diferentes pestañas
    if (!newPdv.nombre_pdv || !newPdv.id_mercado || !newPdv.id_categoria || !newPdv.direccion || !newPdv.latitud || !newPdv.longitud) {
      alert("⚠️ Faltan campos obligatorios.\\n\\nPor favor revisa que el Nombre, Mercado, Categoría, Dirección y Ubicación (Latitud/Longitud) estén llenos en sus respectivas pestañas.");
      return;
    }

    try {
      const payload = {
        ...newPdv,
        id_mercado: parseInt(newPdv.id_mercado) || 0,
        id_categoria: parseInt(newPdv.id_categoria) || 0,
        id_supervisor: newPdv.id_supervisor ? parseInt(newPdv.id_supervisor) : null,
        id_reponedor_asignado: newPdv.id_reponedor_asignado ? parseInt(newPdv.id_reponedor_asignado) : null,
        latitud: parseFloat(newPdv.latitud) || 0,
        longitud: parseFloat(newPdv.longitud) || 0,
        tiempo_visita_min: parseInt(newPdv.tiempo_visita_min) || 15,
        tiempo_promedio_min: parseInt(newPdv.tiempo_promedio_min) || 15,
        frecuencia_semanal: parseInt(newPdv.frecuencia_semanal) || 1,
        frecuencia_mensual: parseInt(newPdv.frecuencia_mensual) || 4,
        ventana_horaria_inicio: newPdv.ventana_horaria_inicio + ":00",
        ventana_horaria_fin: newPdv.ventana_horaria_fin + ":00",
        codigo_gv: newPdv.codigo_gv || `GV-${Math.floor(1000 + Math.random() * 9000)}`,
      };
      
      if (editMode) {
        const updated = await API.actualizarPdv(editingId, payload);
        setPdvs(prev => prev.map(p => p.id_pdv === editingId ? updated : p));
      } else {
        const created = await API.crearPdv(payload);
        setPdvs([created, ...pdvs]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving PDV:", error);
      alert("Hubo un error al guardar el punto de venta.");
    }
  };

  const renderTabButton = (id, label) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={clsx(
        "px-4 py-2 text-sm font-bold border-b-2 transition-colors",
        activeTab === id 
          ? "border-brand-blue text-brand-blue dark:text-brand-blue" 
          : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Administración de Puntos de Venta (PDV)</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gestiona el ciclo de vida y asignación de la red de distribución.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white dark:bg-dark-card rounded-lg p-1 border border-slate-200 dark:border-slate-700 flex shadow-sm">
            <button 
              onClick={() => setViewMode('list')}
              className={clsx("px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2", viewMode === 'list' ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white" : "text-slate-500 dark:hover:text-slate-200")}
            >
              <ListIcon size={16} /> Lista
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={clsx("px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2", viewMode === 'map' ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white" : "text-slate-500 dark:hover:text-slate-200")}
            >
              <MapIcon size={16} /> Mapa
            </button>
          </div>
          <button onClick={handleOpenCreate} className="bg-brand-blue hover:bg-brand-blue-hover text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
            <Plus size={16} /> Nuevo PDV
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col flex-1 min-h-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-end bg-slate-50/50 dark:bg-slate-800/50 rounded-t-xl z-10">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Búsqueda rápida</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre PDV, Código GV o Interno..." 
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm outline-none" 
              />
            </div>
          </div>
          <div className="w-48">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Categoría</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none cursor-pointer">
              <option value="Todas">Todas</option>
              {categorias.map(cat => <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>)}
            </select>
          </div>
          <div className="w-48">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Prioridad</label>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none cursor-pointer">
              <option value="Todas">Cualquier</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-10 text-slate-500">Cargando puntos de venta...</div>
        ) : viewMode === 'list' ? (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-4 w-20">Estado</th>
                  <th className="px-4 py-4 w-24">Código GV</th>
                  <th className="px-4 py-4">Punto de Venta</th>
                  <th className="px-4 py-4">Mercado</th>
                  <th className="px-4 py-4 text-center">Categoría</th>
                  <th className="px-4 py-4 text-center">Prioridad</th>
                  <th className="px-4 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredPdvs.map(pdv => (
                  <tr key={pdv.id_pdv} className={clsx("border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors", !pdv.activo && "opacity-60 bg-slate-50/50 dark:bg-slate-900/30")}>
                    <td className="px-4 py-4">
                      {pdv.activo ? (
                        <span className="w-3 h-3 rounded-full bg-emerald-500 block shadow-sm shadow-emerald-500/30 mx-auto" title="Activo"></span>
                      ) : (
                        <span className="w-3 h-3 rounded-full bg-slate-400 block mx-auto" title="Inactivo"></span>
                      )}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs font-semibold text-brand-blue">{pdv.codigo_gv}</td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{pdv.nombre_pdv || 'Sin Nombre'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">{pdv.direccion || 'Sin Dirección'}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-medium">{mercados.find(m => m.id_mercado === pdv.id_mercado)?.nombre || 'N/A'}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-block border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                        {categorias.find(c => c.id_categoria === pdv.id_categoria)?.nombre || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={clsx("inline-block text-xs font-bold px-2 py-1 rounded-full uppercase", 
                        pdv.prioridad === 'alta' ? "text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400" : 
                        pdv.prioridad === 'media' ? "text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" : 
                        "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400"
                      )}>
                        {pdv.prioridad}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenEdit(pdv)} className="p-1.5 text-brand-blue hover:bg-brand-blue/10 rounded transition-colors" title="Editar">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleToggleActive(pdv)} className={clsx("p-1.5 rounded transition-colors", pdv.activo ? "text-orange-500 hover:bg-orange-500/10" : "text-emerald-500 hover:bg-emerald-500/10")} title={pdv.activo ? "Suspender (Inactivar)" : "Reactivar"}>
                          {pdv.activo ? <PowerOff size={16} /> : <Power size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-1 min-h-0 relative z-0">
            <div className="w-80 bg-white dark:bg-dark-card border-r border-slate-200 dark:border-slate-700 overflow-y-auto hidden md:block shadow-sm z-10">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 sticky top-0 backdrop-blur-sm z-20">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Puntos de Venta</h3>
                <p className="text-xs text-slate-500">{filteredPdvs.length} locales encontrados</p>
              </div>
              <div className="flex flex-col">
                {filteredPdvs.map(pdv => (
                  <div key={pdv.id_pdv} onClick={() => handleOpenEdit(pdv)} className={clsx("p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-all", !pdv.activo && "opacity-60")}>
                    <div className="flex justify-between items-start mb-1.5">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">
                        {pdv.nombre_pdv || 'Sin Nombre'} {pdv.activo ? '' : '(Inactivo)'}
                      </h4>
                      <span className={clsx("w-2.5 h-2.5 rounded-full shrink-0 mt-0.5", pdv.prioridad === 'alta' ? "bg-red-500" : pdv.prioridad === 'media' ? "bg-blue-500" : "bg-slate-400")} />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[11px] text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{pdv.codigo_gv}</p>
                      <p className="text-[11px] font-bold text-slate-400 uppercase">{categorias.find(c => c.id_categoria === pdv.id_categoria)?.nombre || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 relative bg-slate-100 z-0">
              <MapContainer center={[-16.5, -68.15]} zoom={12} className="w-full h-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {filteredPdvs.filter(p => p.latitud && p.longitud).map(pdv => (
                  <Marker key={pdv.id_pdv} position={[pdv.latitud, pdv.longitud]} icon={createColoredIcon(pdv.prioridad, pdv.activo)}>
                    <Popup>
                      <div className="p-1">
                        <p className="font-bold text-sm">{pdv.nombre_pdv || pdv.codigo_gv}</p>
                        <p className="text-xs text-slate-500">{pdv.direccion}</p>
                        {!pdv.activo && <p className="text-xs font-bold text-orange-500">Inactivo</p>}
                        <div className="mt-2 flex gap-2">
                           <button onClick={() => handleOpenEdit(pdv)} className="text-[10px] px-2 py-1 bg-brand-blue text-white rounded">Editar</button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editMode ? "Modificar PDV" : "Registrar Nuevo PDV"} maxWidth="max-w-4xl">
        <form onSubmit={handleSavePdv} className="flex flex-col h-[70vh] max-h-[700px]">
          
          <div className="flex border-b border-slate-200 dark:border-slate-700 px-6 shrink-0 bg-slate-50 dark:bg-slate-800/30 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
             {renderTabButton('general', 'General')}
             {renderTabButton('ubicacion', 'Ubicación')}
             {renderTabButton('horarios', 'Horarios y Operación')}
             {renderTabButton('contacto', 'Contacto y Asignaciones')}
             {editMode && renderTabButton('entregas', 'Entregas e Inventario')}
          </div>

          <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
             {/* TAB GENERAL */}
             <div className={clsx("space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300", activeTab !== 'general' && "hidden")}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Nombre del Local / Razón Social <span className="text-red-500">*</span></label>
                    <input type="text" value={newPdv.nombre_pdv} onChange={e => setNewPdv({...newPdv, nombre_pdv: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand-blue" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Código GV (Autogenerado si vacío)</label>
                    <input type="text" value={newPdv.codigo_gv} onChange={e => setNewPdv({...newPdv, codigo_gv: e.target.value})} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm font-mono outline-none" placeholder="Ej. GV-1234" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Código Interno ERP</label>
                    <input type="text" value={newPdv.codigo_interno || ''} onChange={e => setNewPdv({...newPdv, codigo_interno: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Mercado / Zona <span className="text-red-500">*</span></label>
                    <select value={newPdv.id_mercado} onChange={e => setNewPdv({...newPdv, id_mercado: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm outline-none">
                      <option value="">Seleccione...</option>
                      {mercados.map(m => <option key={m.id_mercado} value={m.id_mercado}>{m.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Categoría <span className="text-red-500">*</span></label>
                    <select value={newPdv.id_categoria} onChange={e => setNewPdv({...newPdv, id_categoria: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm outline-none">
                      <option value="">Seleccione...</option>
                      {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Prioridad Estratégica</label>
                    <select value={newPdv.prioridad} onChange={e => setNewPdv({...newPdv, prioridad: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm outline-none">
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                  </div>
                  <div className="flex items-center mt-4">
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={newPdv.activo} onChange={e => setNewPdv({...newPdv, activo: e.target.checked})} className="w-4 h-4 rounded text-brand-blue focus:ring-brand-blue border-slate-300" />
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">PDV Activo en Sistema</span>
                     </label>
                  </div>
                </div>
             </div>

             {/* TAB UBICACION */}
             <div className={clsx("space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300", activeTab !== 'ubicacion' && "hidden")}>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Dirección Exacta o Referencia <span className="text-red-500">*</span></label>
                  <input type="text" value={newPdv.direccion} onChange={e => setNewPdv({...newPdv, direccion: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand-blue" />
                </div>
                
                <div className="flex gap-4 items-end mb-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Pegar URL de Google Maps (Extraerá Coordenadas)</label>
                    <input type="text" value={newPdv.gmaps_url} onChange={(e) => handleUrlChange(e.target.value)} placeholder="https://www.google.com/maps/@-16.5,-68.1,15z" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm outline-none" />
                  </div>
                  <div className="w-32">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Latitud <span className="text-red-500">*</span></label>
                    <input type="number" step="any" value={newPdv.latitud} onChange={e => setNewPdv({...newPdv, latitud: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm outline-none" />
                  </div>
                  <div className="w-32">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Longitud <span className="text-red-500">*</span></label>
                    <input type="number" step="any" value={newPdv.longitud} onChange={e => setNewPdv({...newPdv, longitud: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm outline-none" />
                  </div>
                </div>

                <div className="h-64 w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 relative z-0">
                  <p className="absolute top-2 left-2 z-[400] bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 px-2 py-1 text-[10px] font-bold rounded shadow pointer-events-none">Haz clic en el mapa para ajustar el pin</p>
                  {activeTab === 'ubicacion' && (
                    <MapContainer center={newPdv.latitud && newPdv.longitud ? [parseFloat(newPdv.latitud), parseFloat(newPdv.longitud)] : [-16.5, -68.15]} zoom={14} className="w-full h-full">
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationPicker lat={newPdv.latitud} lng={newPdv.longitud} setLocation={(lat, lng) => setNewPdv({...newPdv, latitud: lat, longitud: lng})} />
                    </MapContainer>
                  )}
                </div>
             </div>

             {/* TAB HORARIOS */}
             <div className={clsx("space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300", activeTab !== 'horarios' && "hidden")}>
                <div>
                   <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Días de Atención al Cliente</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map(dia => (
                         <label key={dia} className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                            <input type="checkbox" checked={newPdv[`atiende_${dia}`]} onChange={e => setNewPdv({...newPdv, [`atiende_${dia}`]: e.target.checked})} className="w-4 h-4 text-brand-blue rounded" />
                            <span className="text-sm font-medium capitalize text-slate-700 dark:text-slate-300">{dia}</span>
                         </label>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Ventana Horaria de Entrega</h3>
                     <div className="flex items-center gap-4">
                       <div className="flex-1">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Apertura</label>
                          <input type="time" value={newPdv.ventana_horaria_inicio} onChange={e => setNewPdv({...newPdv, ventana_horaria_inicio: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm outline-none" />
                       </div>
                       <span className="text-slate-400 mt-5">- a -</span>
                       <div className="flex-1">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Cierre</label>
                          <input type="time" value={newPdv.ventana_horaria_fin} onChange={e => setNewPdv({...newPdv, ventana_horaria_fin: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm outline-none" />
                       </div>
                     </div>
                   </div>

                   <div>
                     <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Frecuencias y Tiempos</h3>
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="block text-xs font-medium text-slate-500 mb-1">Visitas / Semana</label>
                         <input type="number" min="0" value={newPdv.frecuencia_semanal} onChange={e => setNewPdv({...newPdv, frecuencia_semanal: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none" />
                       </div>
                       <div>
                         <label className="block text-xs font-medium text-slate-500 mb-1">Visitas / Mes</label>
                         <input type="number" min="0" value={newPdv.frecuencia_mensual} onChange={e => setNewPdv({...newPdv, frecuencia_mensual: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none" />
                       </div>
                       <div className="col-span-2">
                         <label className="block text-xs font-medium text-slate-500 mb-1">Tiempo Asignado de Visita (Minutos)</label>
                         <input type="number" min="1" value={newPdv.tiempo_visita_min} onChange={e => setNewPdv({...newPdv, tiempo_visita_min: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none" />
                       </div>
                     </div>
                   </div>
                </div>
             </div>

             {/* TAB CONTACTO */}
             <div className={clsx("space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300", activeTab !== 'contacto' && "hidden")}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-2">Responsable de Tienda</h3>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Nombre Completo</label>
                    <input type="text" value={newPdv.nombre_contacto || ''} onChange={e => setNewPdv({...newPdv, nombre_contacto: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Teléfono o Celular</label>
                    <input type="tel" value={newPdv.telefono_contacto || ''} onChange={e => setNewPdv({...newPdv, telefono_contacto: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm outline-none" />
                  </div>
                  
                  <div className="md:col-span-2 mt-2">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-2">Asignaciones Operativas</h3>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Supervisor de Zona</label>
                    <select value={newPdv.id_supervisor || ''} onChange={e => setNewPdv({...newPdv, id_supervisor: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm outline-none">
                      <option value="">Sin asignar...</option>
                      {supervisores.map(s => <option key={s.id_usuario} value={s.id_usuario}>{s.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Reponedor Predeterminado</label>
                    <select value={newPdv.id_reponedor_asignado || ''} onChange={e => setNewPdv({...newPdv, id_reponedor_asignado: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm outline-none">
                      <option value="">Sin asignar...</option>
                      {reponedores.map(r => <option key={r.id_usuario} value={r.id_usuario}>{r.nombre}</option>)}
                    </select>
                  </div>

                  <div className="md:col-span-2 mt-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Notas Especiales / Observaciones de Ingreso</label>
                    <textarea value={newPdv.notas_especiales || ''} onChange={e => setNewPdv({...newPdv, notas_especiales: e.target.value})} rows={3} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm outline-none" placeholder="Ej. El dueño sale a comer de 12 a 13, tiene perros sueltos..."></textarea>
                  </div>
                </div>
             </div>

             {/* TAB ENTREGAS */}
             {editMode && (
               <div className={clsx("space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300", activeTab !== 'entregas' && "hidden")}>
                  
                  {/* Formulario Registro Manual */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <Package size={16} className="text-brand-blue" />
                      Registrar Entrega Manual
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Producto</label>
                        <select value={entregaForm.id_producto} onChange={e => setEntregaForm({...entregaForm, id_producto: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm outline-none">
                          <option value="">Seleccione producto...</option>
                          {productosCat.map(p => <option key={p.id_producto} value={p.id_producto}>{p.nombre_producto} (Stock: {p.stock_actual})</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Cantidad</label>
                        <input type="number" min="0.1" step="any" value={entregaForm.cantidad} onChange={e => setEntregaForm({...entregaForm, cantidad: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm outline-none" placeholder="Ej. 10" />
                      </div>
                      <div className="flex items-end">
                        <button type="button" onClick={handleRegistrarEntrega} disabled={isSubmittingEntrega} className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md disabled:opacity-50">
                          {isSubmittingEntrega ? "Guardando..." : "Registrar"}
                        </button>
                      </div>
                      <div className="md:col-span-4 mt-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Notas de la Entrega</label>
                        <input type="text" value={entregaForm.notas} onChange={e => setEntregaForm({...entregaForm, notas: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm outline-none" placeholder="Opcional" />
                      </div>
                    </div>
                  </div>

                  {/* Historial Timeline */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <Clock size={16} className="text-slate-500" />
                      Historial de Entregas
                    </h3>
                    
                    {historialEntregas.length === 0 ? (
                      <div className="text-center p-6 text-slate-500 text-sm bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                        No hay entregas registradas para este PDV.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {historialEntregas.map((entrega, idx) => (
                          <div key={entrega.id_entrega || idx} className="relative pl-6 border-l-2 border-brand-blue/30 pb-4 last:pb-0">
                            <div className="absolute w-3 h-3 bg-brand-blue rounded-full -left-[7.5px] top-1 ring-4 ring-white dark:ring-dark-card"></div>
                            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-slate-500">{new Date(entrega.fecha_hora_entrega).toLocaleString()}</span>
                                <span className="text-xs bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded font-medium">Ref: V-{entrega.id_visita}</span>
                              </div>
                              {entrega.notas && <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 italic">"{entrega.notas}"</p>}
                              
                              <div className="space-y-1">
                                {entrega.detalles?.map(det => {
                                  const pName = productosCat.find(p => p.id_producto === det.id_producto)?.nombre_producto || `Prod #${det.id_producto}`;
                                  return (
                                    <div key={det.id_entrega_producto} className="flex justify-between text-sm bg-white dark:bg-slate-800 px-3 py-1.5 rounded shadow-sm border border-slate-100 dark:border-slate-700">
                                      <span className="font-medium text-slate-800 dark:text-slate-200">{pName}</span>
                                      <span className="font-bold text-brand-blue">+{det.cantidad_entregada}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
               </div>
             )}

          </div>

          {/* Footer del Formulario */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 shrink-0 bg-slate-50 dark:bg-slate-800/30">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
            <button type="submit" className="px-5 py-2 bg-brand-blue text-white hover:bg-brand-blue-hover rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
              <Save size={16} /> {editMode ? 'Guardar Cambios' : 'Registrar PDV'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
