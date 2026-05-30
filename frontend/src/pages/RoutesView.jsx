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
    <div className="flex flex-col gap-6 h-full pb-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Monitoreo de Rutas</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Supervisión y optimización TSP en tiempo real.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleOptimize}
            disabled={!routeDetails || optimizing}
            className="bg-brand-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {optimizing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap size={16} />} 
            Optimizar Ruta Activa
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[600px]">
        
        {/* Panel Izquierdo: Lista de Rutas */}
        <div className="w-full lg:w-80 bg-white dark:bg-slate-800 rounded-xl border border-brand-gray-border dark:border-slate-700 shadow-sm flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar ruta o reponedor..." 
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-brand-blue text-slate-800 dark:text-slate-200" 
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {loading ? (
              <p className="text-center text-sm text-slate-500 p-4">Cargando rutas...</p>
            ) : routes.length === 0 ? (
              <p className="text-center text-sm text-slate-500 p-4">No hay rutas en la base de datos.</p>
            ) : routes.map(route => (
              <button 
                key={route.id_ruta}
                onClick={() => handleSelectRoute(route)}
                className={clsx(
                  "w-full text-left p-3 rounded-lg border transition-all duration-200",
                  selectedRoute?.id_ruta === route.id_ruta 
                    ? "bg-blue-50/50 dark:bg-brand-blue/10 border-brand-blue shadow-sm" 
                    : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-brand-blue dark:hover:border-brand-blue hover:shadow-sm"
                )}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold font-mono text-slate-500">RUTA-{route.id_ruta}</span>
                  <span className={clsx(
                    "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                    route.estado === 'en_progreso' ? "bg-blue-100 text-brand-blue dark:bg-blue-900/30 dark:text-blue-400" :
                    route.estado === 'completada' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                    "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
                  )}>
                    {route.estado.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">Reponedor ID: {route.id_reponedor}</h4>
                <p className="text-xs text-slate-500">{route.fecha}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Panel Derecho: Mapa Interactivo Leaflet */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-brand-gray-border dark:border-slate-700 shadow-sm flex flex-col overflow-hidden h-[600px] relative z-0">
          
          {/* Capa de Información sobre el mapa */}
          {selectedRoute && (
            <div className="absolute top-4 left-4 z-[400] bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 w-64 pointer-events-none">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Ruta {selectedRoute.id_ruta}</h3>
              <p className="text-xl font-black text-brand-blue">Reponedor {selectedRoute.id_reponedor}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
