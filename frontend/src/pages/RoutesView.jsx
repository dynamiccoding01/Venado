import React, { useState, useEffect } from 'react';
import { Search, Filter, Play, MoreVertical, Zap, Route } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import clsx from 'clsx';
import { API } from '../api/client';

export function RoutesView() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);

  // La Paz, Bolivia as default center
  const [mapCenter, setMapCenter] = useState([-16.500, -68.119]); 

  // 1. Fetch all routes
  useEffect(() => {
    API.getRutas()
      .then(data => {
        setRoutes(data);
        if (data.length > 0) {
          handleSelectRoute(data[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching rutas:", err);
        setLoading(false);
      });
  }, []);

  // 2. Load route points when selected
  const handleSelectRoute = async (route) => {
    setSelectedRoute(route);
    setRouteDetails(null);
    try {
      const fullRoute = await API.getRutaConPuntos(route.id_ruta);
      setRouteDetails(fullRoute);
      
      // Auto-center map on the first point if available
      if (fullRoute.ruta_puntos && fullRoute.ruta_puntos.length > 0) {
        const firstPoint = fullRoute.ruta_puntos[0].pdv;
        if (firstPoint && firstPoint.latitud && firstPoint.longitud) {
          setMapCenter([firstPoint.latitud, firstPoint.longitud]);
        }
      }
    } catch(e) {
      console.error("Error fetching route details:", e);
    }
  };

  const handleOptimize = async () => {
    if (!selectedRoute) return;
    setOptimizing(true);
    try {
      const optimized = await API.optimizarRuta(selectedRoute.id_ruta);
      setRouteDetails(optimized);
    } catch(e) {
      console.error("Error optimizando ruta:", e);
    } finally {
      setOptimizing(false);
    }
  };

  // Convert backend status to UI color
  const getStatusColor = (status) => {
    if (status === 'completada') return '#10b981'; // emerald
    if (status === 'en_progreso') return '#2563eb'; // blue
    return '#64748b'; // slate
  };

  const mapPath = routeDetails?.ruta_puntos 
    ? routeDetails.ruta_puntos.map(pt => [pt.pdv.latitud, pt.pdv.longitud])
    : [];

  return (
    <div className="flex flex-col gap-6 h-full pb-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Monitoreo de Rutas</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Supervisión y optimización TSP en tiempo real.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleOptimize}
            disabled={!routeDetails || optimizing}
            className="bg-brand-blue hover:bg-brand-blue-hover text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-blue/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
          >
            {optimizing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap size={18} strokeWidth={3} />} 
            Optimizar Ruta Activa
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[600px]">
        
        {/* Panel Izquierdo: Lista de Rutas */}
        <div className="w-full lg:w-80 glass-card rounded-3xl flex flex-col h-[600px] overflow-hidden">
          <div className="p-5 border-b border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-dark-bg/20">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar ruta o reponedor..." 
                className="w-full pl-10 pr-4 py-2.5 glass-panel rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-blue/50 text-slate-800 dark:text-slate-200 transition-all" 
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {loading ? (
              <p className="text-center text-sm font-medium text-slate-500 p-4">Cargando rutas...</p>
            ) : routes.length === 0 ? (
              <p className="text-center text-sm font-medium text-slate-500 p-4">No hay rutas en la base de datos.</p>
            ) : routes.map(route => (
              <button 
                key={route.id_ruta}
                onClick={() => handleSelectRoute(route)}
                className={clsx(
                  "w-full text-left p-4 rounded-2xl transition-all duration-300 relative overflow-hidden group",
                  selectedRoute?.id_ruta === route.id_ruta 
                    ? "glass-panel ring-2 ring-brand-blue shadow-lg shadow-brand-blue/20" 
                    : "glass-panel hover:ring-1 hover:ring-brand-blue/50 hover:shadow-md hover:-translate-y-0.5"
                )}
              >
                {selectedRoute?.id_ruta === route.id_ruta && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-blue rounded-l-2xl"></div>
                )}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black font-mono text-slate-500 dark:text-slate-400">RUTA-{route.id_ruta}</span>
                  <span className={clsx(
                    "text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-sm",
                    route.estado === 'en_progreso' ? "bg-brand-blue/10 text-brand-blue" :
                    route.estado === 'completada' ? "bg-emerald-500/10 text-emerald-500" :
                    "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
                  )}>
                    {route.estado.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1 group-hover:text-brand-blue transition-colors">Reponedor ID: {route.id_reponedor}</h4>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{route.fecha}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Panel Derecho: Mapa Interactivo Leaflet */}
        <div className="flex-1 glass-card rounded-3xl flex flex-col overflow-hidden h-[600px] relative z-0">
          
          {/* Capa de Información sobre el mapa */}
          {selectedRoute && (
            <div className="absolute top-6 left-6 z-[400] glass-panel p-5 rounded-2xl shadow-xl border border-slate-200/50 dark:border-white/10 w-72 pointer-events-none transition-all duration-300 animate-fade-in-up">
              <h3 className="font-black text-slate-800 dark:text-white text-base tracking-tight">Ruta {selectedRoute.id_ruta}</h3>
              <p className="text-2xl font-black text-brand-blue mt-1 drop-shadow-sm">Reponedor {selectedRoute.id_reponedor}</p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-widest">
                {routeDetails ? `${routeDetails.ruta_puntos?.length || 0} PDVs asignados` : 'Cargando paradas...'}
              </p>
            </div>
          )}

          <MapContainer key={selectedRoute?.id_ruta || 'default'} center={mapCenter} zoom={14} className="w-full h-full" zoomControl={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Dibujar la línea de la ruta */}
            {mapPath.length > 0 && (
              <Polyline 
                positions={mapPath} 
                color={getStatusColor(selectedRoute?.estado)} 
                weight={4}
                opacity={0.8}
                dashArray={selectedRoute?.estado === 'pendiente' ? "5, 10" : undefined}
              />
            )}

            {/* Dibujar los puntos (PDVs) de la ruta */}
            {routeDetails?.ruta_puntos?.map((punto, idx) => {
              const pos = [punto.pdv.latitud, punto.pdv.longitud];
              const isCompleted = punto.estado === 'completada';
              
              return (
                <CircleMarker
                  key={punto.id_ruta_punto}
                  center={pos}
                  radius={isCompleted ? 6 : 8}
                  fillColor={isCompleted ? '#10b981' : '#facc15'}
                  color={isCompleted ? '#059669' : '#ca8a04'}
                  weight={3}
                  fillOpacity={1}
                >
                  <Popup>
                    <div className="font-sans">
                      <p className="font-bold text-sm text-slate-800">{punto.pdv.nombre_pdv}</p>
                      <p className="text-xs text-slate-500 font-mono mt-1">{punto.pdv.codigo_gv}</p>
                      <p className="text-xs text-brand-blue font-semibold mt-1">Orden óptimo: {punto.orden}</p>
                      <p className="text-xs text-slate-500 mt-1">Estado: {punto.estado}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
