import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Play } from 'lucide-react';
import clsx from 'clsx';

// --- MOCK DATA PARA REFERENCIA ---
// Coordenadas centrales de La Paz, Bolivia
const centerLaPaz = [-16.5000, -68.1193];

// Algunos puntos falsos alrededor de La Paz para el mapa de referencia
const mockPDVs = [
  { id: 'GV-0042-X', name: 'Minimarket Los Rosales', lat: -16.5050, lng: -68.1200, status: 'Completada', time: '08:15 AM' },
  { id: 'GV-0156-A', name: 'Supermercado Central', lat: -16.4950, lng: -68.1150, status: 'En Curso', time: 'En progreso...' },
  { id: 'GV-0089-B', name: 'Almacenes El Éxito', lat: -16.5100, lng: -68.1100, status: 'No Visitada', time: 'Est. 10:30 AM' },
  { id: 'GV-0210-C', name: 'Bodega San Juan', lat: -16.4900, lng: -68.1250, status: 'No Visitada', time: 'Est. 11:15 AM' },
  { id: 'GV-0331-Z', name: 'Tienda El Sol', lat: -16.4850, lng: -68.1300, status: 'No Visitada', time: 'Est. 12:00 PM' },
];

export function RoutesView() {
  return (
    <div className="flex flex-col h-[calc(100vh-112px)] gap-4">
      
      {/* Header Superior (Gestión de Ruta) */}
      <div className="bg-white rounded-xl border border-brand-gray-border p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Gestión de Ruta</h2>
          <p className="text-sm text-slate-500">Ruta Norte • Operador: Carlos Ruiz</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-4 mr-4">
            <div className="text-center px-4 border-r border-slate-200">
              <p className="text-xs text-slate-500 font-medium uppercase">Cobertura</p>
              <p className="text-lg font-bold text-brand-blue">82%</p>
            </div>
            <div className="text-center px-4 border-r border-slate-200">
              <p className="text-xs text-slate-500 font-medium uppercase">Distancia</p>
              <p className="text-lg font-bold text-slate-800">42.5 km</p>
            </div>
            <div className="text-center pl-4">
              <p className="text-xs text-slate-500 font-medium uppercase">Tiempo Total</p>
              <p className="text-lg font-bold text-slate-800">06:45h</p>
            </div>
          </div>
          
          <button className="bg-brand-blue hover:bg-brand-blue-hover text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm">
            <Play size={16} fill="currentColor" />
            Iniciar Ruta
          </button>
        </div>
      </div>

      {/* Main Layout: Mapa + Panel Derecho */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Left Area: Leaflet Map (60%) */}
        <div className="lg:col-span-7 lg:w-[60%] xl:w-[65%] h-full bg-slate-200 rounded-xl border border-brand-gray-border overflow-hidden relative shadow-sm z-0">
          
          {/* Overlay de resumen sobre el mapa */}
          <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded border border-slate-200 shadow-sm flex items-center gap-2 text-sm font-medium text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-blue"></span>
              8 PDVs Completados
            </div>
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded border border-slate-200 shadow-sm flex items-center gap-2 text-sm font-medium text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
              1 En Curso
            </div>
          </div>

          {/* Leaflet Map */}
          <MapContainer center={centerLaPaz} zoom={14} className="h-full w-full" zoomControl={false}>
            {/* Tema cartográfico gris claro para que resalten los puntos */}
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">Carto</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            
            {/* Puntos de Referencia */}
            {mockPDVs.map((pdv, index) => {
              let color = '#94a3b8'; // default gris (No visitada)
              if (pdv.status === 'Completada') color = 'var(--color-brand-blue)'; // Azul corporativo
              if (pdv.status === 'En Curso') color = '#eab308'; // Amarillo/Ambar
              
              return (
                <CircleMarker 
                  key={index}
                  center={[pdv.lat, pdv.lng]} 
                  radius={8}
                  pathOptions={{ color: '#fff', weight: 2, fillColor: color, fillOpacity: 1 }}
                >
                  <Popup>
                    <strong>{pdv.name}</strong><br/>
                    {pdv.status}
                  </Popup>
                </CircleMarker>
              )
            })}
          </MapContainer>
        </div>

        {/* Right Area: Secuencia de Visitas (40%) */}
        <div className="lg:col-span-5 lg:w-[40%] xl:w-[35%] h-full bg-white rounded-xl border border-brand-gray-border flex flex-col shadow-sm">
          <div className="p-4 border-b border-brand-gray-border flex justify-between items-center bg-slate-50/50 rounded-t-xl">
            <h3 className="text-base font-bold text-slate-800">Secuencia de Visitas</h3>
            <button className="text-xs font-medium text-brand-blue hover:underline">Reordenar</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {mockPDVs.map((pdv, index) => {
              const isCompleted = pdv.status === 'Completada';
              const isInProgress = pdv.status === 'En Curso';
              
              return (
                <div 
                  key={index} 
                  className={clsx(
                    "flex gap-4 p-3 rounded-lg border",
                    isInProgress ? "border-yellow-400 bg-yellow-50" : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  {/* Número de secuencia circular */}
                  <div className={clsx(
                    "w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-sm",
                    isCompleted ? "bg-blue-100 text-brand-blue" :
                    isInProgress ? "bg-yellow-200 text-yellow-800" :
                    "bg-slate-100 text-slate-500 border border-slate-200"
                  )}>
                    {index + 1}
                  </div>
                  
                  {/* Info de la parada */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs text-slate-400">{pdv.id}</span>
                      <span className={clsx("text-xs font-medium", isInProgress ? "text-slate-700 italic" : "text-slate-500")}>
                        {pdv.time}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 truncate leading-tight mt-0.5">{pdv.name}</h4>
                    <p className={clsx(
                      "text-[11px] font-bold uppercase mt-1 tracking-wider",
                      isCompleted ? "text-brand-blue" :
                      isInProgress ? "text-yellow-600" :
                      "text-brand-red"
                    )}>
                      ● {pdv.status}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botón inferior del panel */}
          <div className="p-4 border-t border-brand-gray-border bg-slate-50 rounded-b-xl">
            <button className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
              📄 Reporte Diario Final
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
