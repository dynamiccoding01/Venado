import React, { useState } from 'react';
import { Search, Filter, Play, MoreVertical } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import clsx from 'clsx';

// MOCK DATA PARA RUTAS
const activeRoutes = [
  { 
    id: 'R-042', 
    reponedor: 'Carlos Méndez', 
    progress: 25, 
    status: 'en_curso',
    pdvs: 8,
    completed: 2,
    color: '#2563eb', // brand-blue
    // Coordenadas simuladas en La Paz
    path: [
      [-16.500, -68.119],
      [-16.505, -68.125],
      [-16.510, -68.120]
    ]
  },
  { 
    id: 'R-089', 
    reponedor: 'Ana López', 
    progress: 100, 
    status: 'completada',
    pdvs: 12,
    completed: 12,
    color: '#10b981', // green
    path: [
      [-16.495, -68.130],
      [-16.490, -68.135],
      [-16.485, -68.130]
    ]
  },
  { 
    id: 'R-102', 
    reponedor: 'Julian Delgado', 
    progress: 0, 
    status: 'pendiente',
    pdvs: 5,
    completed: 0,
    color: '#64748b', // slate
    path: [
      [-16.520, -68.110],
      [-16.525, -68.115]
    ]
  }
];

export function RoutesView() {
  const [selectedRoute, setSelectedRoute] = useState(activeRoutes[0]);
  const centerPos = [-16.500, -68.119]; // La Paz, Bolivia

  return (
    <div className="flex flex-col gap-6 h-full pb-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Monitoreo de Rutas</h2>
          <p className="text-sm text-slate-500 mt-1">Supervisión en tiempo real del equipo de campo.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <Filter size={16} /> Filtros Avanzados
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[600px]">
        
        {/* Panel Izquierdo: Lista de Rutas */}
        <div className="w-full lg:w-80 bg-white rounded-xl border border-brand-gray-border shadow-sm flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar reponedor o ruta..." 
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-blue" 
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {activeRoutes.map(route => (
              <button 
                key={route.id}
                onClick={() => setSelectedRoute(route)}
                className={clsx(
                  "w-full text-left p-3 rounded-lg border transition-all duration-200",
                  selectedRoute.id === route.id 
                    ? "bg-blue-50/50 border-brand-blue shadow-sm" 
                    : "bg-white border-slate-100 hover:border-brand-blue hover:shadow-sm"
                )}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold font-mono text-slate-500">{route.id}</span>
                  <span className={clsx(
                    "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                    route.status === 'en_curso' ? "bg-blue-100 text-brand-blue" :
                    route.status === 'completada' ? "bg-green-100 text-green-700" :
                    "bg-slate-100 text-slate-500"
                  )}>
                    {route.status.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-800 mb-1">{route.reponedor}</h4>
                
                {/* Progress */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
                    <span>{route.completed} / {route.pdvs} PDVs</span>
                    <span>{route.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${route.progress}%`,
                        backgroundColor: route.color 
                      }} 
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Panel Derecho: Mapa Interactivo Leaflet */}
        <div className="flex-1 bg-white rounded-xl border border-brand-gray-border shadow-sm flex flex-col overflow-hidden h-[600px] relative z-0">
          
          {/* Capa de Información sobre el mapa */}
          <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-200 w-64 pointer-events-none">
            <h3 className="font-bold text-slate-800 text-sm">Ruta Activa</h3>
            <p className="text-xl font-black text-brand-blue">{selectedRoute.reponedor}</p>
            <p className="text-xs text-slate-500 mt-1">{selectedRoute.completed} de {selectedRoute.pdvs} puntos visitados</p>
          </div>

          <MapContainer center={centerPos} zoom={14} className="w-full h-full" zoomControl={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            
            {/* Dibujar la línea de la ruta */}
            <Polyline 
              positions={selectedRoute.path} 
              color={selectedRoute.color} 
              weight={4}
              opacity={0.8}
              dashArray={selectedRoute.status === 'pendiente' ? "5, 10" : undefined}
            />

            {/* Dibujar los puntos (PDVs) de la ruta */}
            {selectedRoute.path.map((pos, idx) => {
              const isCompleted = idx < selectedRoute.completed;
              const isCurrent = idx === selectedRoute.completed;
              
              return (
                <CircleMarker
                  key={idx}
                  center={pos}
                  radius={isCurrent ? 8 : 6}
                  fillColor={isCompleted ? selectedRoute.color : isCurrent ? '#facc15' : '#fff'}
                  color={isCurrent ? '#ca8a04' : selectedRoute.color}
                  weight={3}
                  fillOpacity={1}
                >
                  <Popup>
                    <div className="font-sans">
                      <p className="font-bold text-sm">Punto de Venta {idx + 1}</p>
                      <p className="text-xs text-slate-500">
                        {isCompleted ? 'Visitado' : isCurrent ? 'Próxima Parada' : 'Pendiente'}
                      </p>
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
