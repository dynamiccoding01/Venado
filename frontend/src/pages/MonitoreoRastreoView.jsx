import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Users, Navigation, Radio, MapPin, Search, Route, Zap, Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';
import { API } from '../api/client';
import { useSearchParams } from 'react-router-dom';

function MapUpdater({ center, zoom, updateKey }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center[0], center[1], zoom, updateKey, map]);
  return null;
}

const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border px-3 py-1.5 rounded-xl shadow-sm">
      <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></span>
      <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200 tracking-widest">
        {time.toLocaleTimeString('es-BO', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
    </div>
  );
};

export function MonitoreoRastreoView() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Tab State
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'rutas' ? 'rutas' : 'reponedores');
  
  // View Mode: 'global', 'rutas', 'historial'
  const [viewMode, setViewMode] = useState('global');

  // Unified Map Center
  const [mapCenter, setMapCenter] = useState([-16.5000, -68.1500]);
  const [mapZoom, setMapZoom] = useState(13);
  const [mapUpdateKey, setMapUpdateKey] = useState(0);

  // === REPONEDORES STATE ===
  const [reponedores, setReponedores] = useState([]);
  const [selectedRepId, setSelectedRepId] = useState(searchParams.get('reponedor') ? parseInt(searchParams.get('reponedor')) : null);
  const [searchQueryRep, setSearchQueryRep] = useState('');
  const [wsStatus, setWsStatus] = useState('conectando');
  const [historialRuta, setHistorialRuta] = useState([]);
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);
  const [pdvs, setPdvs] = useState([]);
  const [hiddenReponedores, setHiddenReponedores] = useState(new Set());

  // === RUTAS STATE ===
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [searchQueryRoute, setSearchQueryRoute] = useState('');

  // Icono rojo tipo Google Maps
  const redPinIcon = new L.DivIcon({
    html: `<svg viewBox="0 0 24 24" fill="#ea4335" stroke="white" stroke-width="2" class="w-8 h-8 drop-shadow-md" style="margin-left:-8px; margin-top:-16px;"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
    className: 'custom-red-pin',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });

  // Load Initial Data
  useEffect(() => {
    Promise.all([
      API.getUsuarios().catch(() => []),
      API.getUltimasUbicaciones().catch(() => []),
      API.getPdvs().catch(() => [])
    ]).then(([usuarios, gpsData, pdvData]) => {
      
      if (Array.isArray(pdvData)) setPdvs(pdvData);
      let initialReponedores = [];
      if (Array.isArray(usuarios)) {
        initialReponedores = usuarios
          .filter(u => Number(u.id_rol) === 3 || Number(u.rol) === 3 || Number(u.usuario?.id_rol) === 3)
          .map(u => ({
            id: u.id_usuario || u.id,
            nombre: u.nombre || u.usuario?.nombre || u.nombre_completo || u.usuario?.nombre_completo || `Reponedor #${u.id_usuario || u.id}`,
            lat: null, lon: null, estado: 'desconectado', ultimo_update: 'Nunca', pdv_actual: ''
          }));
      }
      if (Array.isArray(gpsData)) {
        const gpsMap = new Map();
        gpsData.forEach(pos => {
          const id = pos.id_usuario || pos.id_reponedor || pos.id;
          const ultimo_update = pos.ultima_conexion || pos.timestamp || pos.creado_en || 'Nunca';
          gpsMap.set(id, {
            lat: pos.lat_actual || pos.latitud || pos.lat, 
            lon: pos.lon_actual || pos.longitud || pos.lon,
            ultimo_update, 
            online: pos.online,
            pdv_actual: pos.pdv_actual || ''
          });
        });
        initialReponedores = initialReponedores.map(rep => gpsMap.has(rep.id) ? { ...rep, ...gpsMap.get(rep.id) } : rep);
      }
      setReponedores(prev => {
        if (prev.length === 0) return initialReponedores;
        const prevMap = new Map(prev.map(p => [p.id, p]));
        return initialReponedores.map(r => prevMap.has(r.id) ? { ...r, ...prevMap.get(r.id) } : r);
      });
    }).catch(e => console.error("Error cargando reponedores:", e));

    let supervisorId = 2;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        if (userData.id_usuario) supervisorId = userData.id_usuario;
      }
    } catch (e) { }

    const wsUrl = `wss://innovahack-gcrh.onrender.com/ws/supervisor/${supervisorId}`;
    let ws = new WebSocket(wsUrl);

    ws.onopen = () => setWsStatus('conectado');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.reponedores && Array.isArray(data.reponedores)) {
          setReponedores(prev => {
            const incomingMap = new Map(data.reponedores.map(r => [r.id || r.id_reponedor, { ...r, ultimo_update: r.ultimo_update || 'Nunca' }]));
            const updated = prev.map(p => incomingMap.has(p.id) ? { ...p, ...incomingMap.get(p.id) } : p);
            return updated;
          });
        }
      } catch (e) { }
    };
    ws.onclose = () => setWsStatus('desconectado');

    return () => { if (ws.readyState === 1) ws.close(); };
  }, []);

  // Polling fallback para actualizar GPS cada 10 segundos
  useEffect(() => {
    const fetchGpsUpdate = async () => {
      try {
        const gpsData = await API.getUltimasUbicaciones();
        if (Array.isArray(gpsData)) {
          setReponedores(prev => {
            if (prev.length === 0) return prev;
            const prevMap = new Map(prev.map(p => [p.id, p]));
            let hasChanges = false;
            
            gpsData.forEach(pos => {
              const id = pos.id_usuario || pos.id_reponedor || pos.id;
              if (prevMap.has(id)) {
                const current = prevMap.get(id);
                const newLat = pos.lat_actual || pos.latitud || pos.lat;
                const newLon = pos.lon_actual || pos.longitud || pos.lon;
                const newUpdate = pos.ultima_conexion || pos.timestamp || pos.creado_en || 'Nunca';
                const newOnline = pos.online;
                
                // Actualizar siempre las propiedades, aunque sean iguales, para forzar que el componente
                // evalúe el tiempo actual (new Date().getTime()) en calcularEstado
                prevMap.set(id, { ...current, lat: newLat, lon: newLon, ultimo_update: newUpdate, online: newOnline, pdv_actual: pos.pdv_actual || '' });
              }
            });
            
            // Retornamos SIEMPRE un nuevo arreglo para forzar un re-render y que se recalcule el estado "En línea"
            return Array.from(prevMap.values());
          });
        }
      } catch (e) {
        console.error("Error en polling GPS:", e);
      }
    };

    const interval = setInterval(fetchGpsUpdate, 60000); // 1 minuto
    return () => clearInterval(interval);
  }, []);

  // Load Historial GPS
  useEffect(() => {
    if (selectedRepId && viewMode === 'historial') {
      API.getHistorialGps(selectedRepId, fechaInicio, fechaFin)
        .then(data => setHistorialRuta(Array.isArray(data) ? data : []))
        .catch(() => setHistorialRuta([]));
    } else {
      setHistorialRuta([]);
    }
  }, [selectedRepId, fechaInicio, fechaFin, viewMode]);

  // Load Rutas Initial
  useEffect(() => {
    API.getRutas()
      .then(data => {
        setRoutes(data);
        setLoadingRoutes(false);
      })
      .catch(err => {
        console.error("Error fetching rutas:", err);
        setLoadingRoutes(false);
      });
  }, []);

  // Load Route Details
  const handleSelectRoute = async (route) => {
    setSelectedRoute(route);
    setRouteDetails(null);
    try {
      const fullRoute = await API.getRutaConPuntos(route.id_ruta);
      setRouteDetails(fullRoute);
      if (fullRoute.ruta_puntos && fullRoute.ruta_puntos.length > 0) {
        const firstPoint = fullRoute.ruta_puntos[0].pdv;
        if (firstPoint && firstPoint.latitud && firstPoint.longitud) {
          setMapCenter([firstPoint.latitud, firstPoint.longitud]);
          setMapZoom(15);
        }
      }
    } catch(e) { }
  };

  const handleSelectReponedor = (rep) => {
    setSelectedRepId(rep.id);
    setViewMode('global'); // Regresar a modo focalizado (global con zoom)
    if (rep.lat && rep.lon) {
      setMapCenter([Number(rep.lat), Number(rep.lon)]);
      setMapZoom(16);
      setMapUpdateKey(prev => prev + 1); // Forzar actualización de mapa
    }
  };

  const handleVerRutasReponedor = (repId) => {
    setSelectedRepId(repId);
    setViewMode('rutas');
    setActiveTab('rutas');
    setSearchQueryRoute(repId.toString());
  };
  
  const handleVerHistorial = (repId) => {
    setSelectedRepId(repId);
    setViewMode('historial');
  };

  const handleOptimize = async () => {
    if (!selectedRoute) return;
    setOptimizing(true);
    try {
      const optimized = await API.optimizarRuta(selectedRoute.id_ruta);
      setRouteDetails(optimized);
    } catch(e) { } finally {
      setOptimizing(false);
    }
  };

  const calcularEstado = (ultimoUpdate) => {
    if (!ultimoUpdate || ultimoUpdate === 'Nunca') return 'desconectado';
    
    // Convert to Date
    const lastTime = new Date(ultimoUpdate).getTime();
    if (isNaN(lastTime)) return 'desconectado';
    
    const now = new Date().getTime();
    const diffMinutes = (now - lastTime) / (1000 * 60);
    
    // Usamos Math.abs para tolerar desincronizaciones de servidor donde el tiempo podría venir ligeramente "en el futuro"
    return Math.abs(diffMinutes) <= 1.5 ? 'activo' : 'desconectado';
  };

  const displayReponedores = reponedores.map((r) => ({
    ...r,
    estado: calcularEstado(r.ultimo_update)
  })).sort((a, b) => {
    // 1. Activos primero
    if (a.estado === 'activo' && b.estado !== 'activo') return -1;
    if (a.estado !== 'activo' && b.estado === 'activo') return 1;
    
    // 2. Orden alfabético por nombre
    const nameA = a.nombre || a.id?.toString() || '';
    const nameB = b.nombre || b.id?.toString() || '';
    return nameA.localeCompare(nameB);
  });

  const filteredReponedores = displayReponedores.filter(r => 
    r.nombre?.toLowerCase().includes(searchQueryRep.toLowerCase()) ||
    r.id?.toString().includes(searchQueryRep.toLowerCase()) ||
    r.estado?.toLowerCase().includes(searchQueryRep.toLowerCase())
  );

  const filteredRoutes = routes.filter(route => 
    route.id_reponedor?.toString().includes(searchQueryRoute) ||
    route.id_ruta?.toString().includes(searchQueryRoute)
  );

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'activo': return 'bg-emerald-500 ring-emerald-500/30';
      case 'sin_señal': return 'bg-amber-500 ring-amber-500/30';
      default: return 'bg-red-500 ring-red-500/30';
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case 'activo': return 'En línea';
      case 'sin_señal': return 'Sin señal';
      case 'desconectado': return 'Desconectado';
      default: return estado || 'Desconocido';
    }
  };

  const toggleVisibility = (id, e) => {
    e.stopPropagation();
    setHiddenReponedores(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const createMarkerIcon = (estado) => {
    let colorHex = '#ef4444'; // Red por defecto (desconectado)
    if (estado === 'activo') colorHex = '#10b981'; // Green (activo)
    if (estado === 'sin_señal') colorHex = '#f59e0b'; // Orange

    const html = `<div style="background-color: ${colorHex}; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.2); display: flex; align-items: center; justify-content: center; z-index: 500;">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </svg>
    </div>`;
    return L.divIcon({ html, className: 'custom-rep-marker', iconSize: [36, 36], iconAnchor: [18, 18] });
  };

  const createPdvIcon = (prioridad) => {
    let colorHex = '#3b82f6'; // Azul por defecto (media)
    if (prioridad?.toLowerCase() === 'alta') colorHex = '#ef4444'; // Rojo
    if (prioridad?.toLowerCase() === 'baja') colorHex = '#10b981'; // Verde

    const html = `<div style="background-color: ${colorHex}; width: 28px; height: 28px; border-radius: 8px; border: 2px solid white; box-shadow: 0 2px 4px rgb(0 0 0 / 0.3); display: flex; align-items: center; justify-content: center;">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;">
        <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
        <path d="M3 9l2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"></path>
        <path d="M12 3v6"></path>
      </svg>
    </div>`;
    return L.divIcon({ html, className: 'custom-pdv-marker', iconSize: [28, 28], iconAnchor: [14, 14] });
  };

  const getRouteStatusColor = (status) => {
    if (status === 'completada') return '#10b981';
    if (status === 'en_progreso') return '#2563eb';
    return '#64748b';
  };

  const mapPath = routeDetails?.ruta_puntos ? routeDetails.ruta_puntos.map(pt => [pt.pdv.latitud, pt.pdv.longitud]) : [];

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <Navigation className="text-brand-blue" /> Monitoreo y Rastreo
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Supervisión en tiempo real de ubicaciones y optimización de rutas.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {activeTab === 'rutas' && (
            <button 
              onClick={handleOptimize}
              disabled={!routeDetails || optimizing}
              className="bg-brand-blue hover:bg-brand-blue-hover text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-blue/30 transition-all disabled:opacity-50"
            >
              {optimizing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap size={16} strokeWidth={3} />} 
              Optimizar Ruta
            </button>
          )}
          <LiveClock />
          <div className="flex items-center gap-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border px-3 py-1.5 rounded-xl shadow-sm">
            <Radio size={14} className={clsx(wsStatus === 'conectado' ? 'text-emerald-500 animate-pulse' : wsStatus === 'conectando' ? 'text-amber-500' : 'text-slate-400')} />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">GPS: {wsStatus === 'conectado' ? 'En Vivo' : wsStatus}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[600px]">
        {/* Sidebar */}
        <div className="lg:w-80 flex flex-col bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm overflow-hidden z-10">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-dark-border">
            <button 
              onClick={() => { setActiveTab('reponedores'); setViewMode('global'); }}
              className={clsx("flex-1 py-3 text-sm font-bold transition-colors border-b-2", activeTab === 'reponedores' ? "border-brand-blue text-brand-blue bg-blue-50/50 dark:bg-brand-blue/5" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
            >
              Reponedores
            </button>
            <button 
              onClick={() => { setActiveTab('rutas'); setViewMode('rutas'); }}
              className={clsx("flex-1 py-3 text-sm font-bold transition-colors border-b-2", activeTab === 'rutas' ? "border-brand-blue text-brand-blue bg-blue-50/50 dark:bg-brand-blue/5" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
            >
              Rutas Asignadas
            </button>
          </div>

          {/* Reponedores Tab Content */}
          {activeTab === 'reponedores' && (
            <>
              <div className="p-4 border-b border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-slate-800/30">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" value={searchQueryRep} onChange={(e) => setSearchQueryRep(e.target.value)} placeholder="Buscar reponedor..." className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-brand-blue outline-none transition-colors" />
                </div>
                {viewMode === 'historial' && (
                  <div className="mt-3 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">F. Inicial</label>
                      <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-md text-xs focus:ring-1 focus:ring-brand-blue outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">F. Final</label>
                      <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-md text-xs focus:ring-1 focus:ring-brand-blue outline-none transition-colors" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {filteredReponedores.map((rep) => {
                  const isSelected = selectedRepId === rep.id;
                  return (
                    <div key={rep.id} onClick={() => handleSelectReponedor(rep)} className={clsx("p-3 rounded-xl cursor-pointer transition-all border", isSelected ? "bg-blue-50 dark:bg-brand-blue/10 border-brand-blue shadow-sm" : "bg-white dark:bg-transparent border-slate-100 dark:border-slate-800 hover:border-slate-300")}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Users className={isSelected ? "text-brand-blue" : "text-slate-400"} size={14} />
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{rep.nombre || `Reponedor #${rep.id_reponedor || rep.id}`}</h4>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <span className={clsx("w-2 h-2 rounded-full ring-2", getStatusColor(rep.estado))}></span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase">{getStatusText(rep.estado)}</span>
                          </div>
                          <button 
                            onClick={(e) => toggleVisibility(rep.id, e)}
                            className="p-1 rounded hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
                            title={hiddenReponedores.has(rep.id) ? "Mostrar en mapa" : "Ocultar del mapa"}
                          >
                            {hiddenReponedores.has(rep.id) ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                        {rep.lat ? `Pos: ${rep.lat.toFixed(4)}, ${rep.lon.toFixed(4)}` : 'Sin GPS'}
                      </div>
                      <div className="flex flex-col gap-1 mt-2">
                        <button onClick={(e) => { e.stopPropagation(); handleVerRutasReponedor(rep.id); }} className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-1.5 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1">
                          <Route size={12} className="text-brand-blue" /> Ver Rutas Asignadas
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleVerHistorial(rep.id); }} className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-1.5 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1">
                          <Radio size={12} className="text-brand-blue" /> Historial de Rutas
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Rutas Tab Content */}
          {activeTab === 'rutas' && (
            <>
              <div className="p-4 border-b border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-slate-800/30">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" value={searchQueryRoute} onChange={(e) => setSearchQueryRoute(e.target.value)} placeholder="Filtrar por ID de ruta o reponedor..." className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-brand-blue outline-none transition-colors" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {loadingRoutes ? <p className="text-center text-xs text-slate-500 py-4">Cargando...</p> : 
                 filteredRoutes.length === 0 ? <p className="text-center text-xs text-slate-500 py-4">No hay rutas</p> :
                 filteredRoutes.map(route => {
                  const isSelected = selectedRoute?.id_ruta === route.id_ruta;
                  return (
                    <button key={route.id_ruta} onClick={() => handleSelectRoute(route)} className={clsx("w-full text-left p-3 rounded-xl transition-all border", isSelected ? "bg-blue-50 dark:bg-brand-blue/10 border-brand-blue shadow-sm" : "bg-white dark:bg-transparent border-slate-100 dark:border-slate-800 hover:border-slate-300")}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-black font-mono text-slate-500 dark:text-slate-400">RUTA-{route.id_ruta}</span>
                        <span className={clsx("text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest", route.estado === 'en_progreso' ? "bg-brand-blue/10 text-brand-blue" : route.estado === 'completada' ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-100 text-slate-500 dark:bg-white/5")}>
                          {route.estado.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Reponedor ID: {route.id_reponedor}</h4>
                      <p className="text-[10px] text-slate-500">{route.fecha}</p>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Map Container */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 dark:border-dark-border shadow-sm relative z-0">
          {/* Info Overlay for Routes */}
          {activeTab === 'rutas' && selectedRoute && (
            <div className="absolute top-4 left-4 z-[400] bg-white/90 dark:bg-slate-800/90 backdrop-blur p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 pointer-events-none">
              <h3 className="font-black text-slate-800 dark:text-white text-sm">Ruta {selectedRoute.id_ruta}</h3>
              <p className="text-lg font-black text-brand-blue">Reponedor {selectedRoute.id_reponedor}</p>
              <p className="text-xs font-bold text-slate-500 mt-1">{routeDetails ? `${routeDetails.ruta_puntos?.length || 0} PDVs asignados` : 'Cargando paradas...'}</p>
            </div>
          )}

          <MapContainer center={mapCenter} zoom={mapZoom} className="w-full h-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapUpdater center={mapCenter} zoom={mapZoom} updateKey={mapUpdateKey} />
            
            {/* CAPA 0: Todos los Puntos de Venta (PDVs) - Solo en Modo Global */}
            {viewMode === 'global' && pdvs.map(pdv => (
              pdv.latitud && pdv.longitud ? (
                <Marker key={`pdv-${pdv.id_pdv}`} position={[pdv.latitud, pdv.longitud]} icon={createPdvIcon(pdv.prioridad)}>
                  <Popup>
                    <div className="font-sans text-xs">
                      <p className="font-bold text-sm text-slate-800">{pdv.nombre_pdv}</p>
                      <p className="text-slate-500 mt-1 uppercase text-[10px] font-bold">Prioridad: {pdv.prioridad || 'Media'}</p>
                    </div>
                  </Popup>
                </Marker>
              ) : null
            ))}

            {/* CAPA 1: Reponedores en vivo */}
            {displayReponedores
              .filter(r => r.lat && r.lon)
              .filter(r => !hiddenReponedores.has(r.id))
              .filter(r => viewMode === 'global' ? true : r.id === selectedRepId)
              .map((rep) => (
              <Marker key={`rep-${rep.id}`} position={[rep.lat, rep.lon]} icon={createMarkerIcon(rep.estado)}>
                <Popup>
                  <div className="font-sans text-xs">
                    <p className="font-bold text-sm text-slate-800">{rep.nombre || `Reponedor #${rep.id_reponedor || rep.id}`}</p>
                    <p className="text-slate-500 mt-1">Estado: {getStatusText(rep.estado)}</p>
                    {rep.ultimo_update && rep.ultimo_update !== 'Nunca' && (
                      <p className="text-slate-500 mt-1 font-medium border-t border-slate-100 pt-1">
                        Última conexión: {new Date(rep.ultimo_update).toLocaleString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* CAPA 2: Historial GPS del Reponedor Seleccionado */}
            {viewMode === 'historial' && historialRuta.length > 0 && (
              <>
                <Polyline positions={historialRuta.filter(p => p.latitud && p.longitud).map(p => [p.latitud, p.longitud])} color="#3b82f6" weight={3} opacity={0.8} dashArray="10, 10" />
                {historialRuta.filter(p => p.latitud && p.longitud).map((punto, idx) => (
                  <CircleMarker key={`hist-${idx}`} center={[punto.latitud, punto.longitud]} radius={4} pathOptions={{ color: '#2563eb', fillColor: 'white', fillOpacity: 1, weight: 2 }}>
                    <Popup>
                      <div className="font-sans text-xs">
                        <p className="font-bold">Hora: {new Date(punto.timestamp || punto.creado_en).toLocaleString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </>
            )}

            {/* CAPA 3: Ruta Asignada (PDVs y Camino planeado) */}
            {viewMode === 'rutas' && (
              <>
                {mapPath.length > 0 && (
                  <Polyline positions={mapPath} color={getRouteStatusColor(selectedRoute?.estado)} weight={4} opacity={0.8} dashArray={selectedRoute?.estado === 'pendiente' ? "5, 10" : undefined} />
                )}
                {routeDetails?.ruta_puntos?.map((punto) => {
                  const pos = [punto.pdv.latitud, punto.pdv.longitud];
                  const isCompleted = punto.estado === 'completada';
                  return (
                    <Marker key={`pt-${punto.id_ruta_punto}`} position={pos} icon={createPdvIcon(punto.pdv.prioridad)}>
                      <Popup>
                        <div className="font-sans text-xs">
                          <p className="font-bold text-sm text-slate-800">{punto.pdv.nombre_pdv}</p>
                          <p className={clsx("mt-1 uppercase text-[10px] font-bold", isCompleted ? "text-emerald-500" : "text-amber-500")}>
                            Estado: {punto.estado.replace('_', ' ')}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
