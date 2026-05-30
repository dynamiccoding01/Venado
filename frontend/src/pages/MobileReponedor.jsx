import React, { useState } from 'react';
import { MapPin, Navigation, Camera, CheckCircle, Clock, ChevronLeft, Package, User } from 'lucide-react';
import clsx from 'clsx';

// --- MOCK DATA PARA LA VISTA MÓVIL ---
const initialRouteTasks = [
  { id: 'GV-042', name: 'Supermercado Ketal', address: 'Av. Arce #1020', status: 'completed', time: '08:30' },
  { id: 'GV-089', name: 'Micromercado San Jorge', address: 'Plaza Isabel la Católica', status: 'current', time: '10:15' },
  { id: 'GV-102', name: 'Tienda Doña Lucha', address: 'Sopocachi', status: 'pending', time: '11:00' },
  { id: 'GV-005', name: 'Hipermaxi Los Pinos', address: 'Zona Sur', status: 'pending', time: '14:00' },
];

export function MobileReponedor() {
  const [routeTasks, setRouteTasks] = useState(initialRouteTasks);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentTask, setCurrentTask] = useState('inventory'); // inventory, photos, signature

  // Computed: current active PDV
  const activePdv = routeTasks.find(t => t.status === 'current') || routeTasks.find(t => t.status === 'pending');
  const progressPct = Math.round((routeTasks.filter(t => t.status === 'completed').length / routeTasks.length) * 100);

  const handleFinishVisit = () => {
    setIsCheckedIn(false);
    setCurrentTask('inventory');
    
    // Marcar el actual como completado y el siguiente como 'current'
    let foundCurrent = false;
    const newTasks = routeTasks.map(t => {
      if (t.status === 'current') {
        foundCurrent = true;
        return { ...t, status: 'completed' };
      }
      if (t.status === 'pending' && foundCurrent) {
        foundCurrent = false; // Solo el primero que sigue
        return { ...t, status: 'current' };
      }
      return t;
    });
    setRouteTasks(newTasks);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      
      {/* SIMULADOR DE TELÉFONO */}
      <div className="w-[375px] h-[812px] bg-white rounded-[40px] shadow-[0_0_50px_-10px_rgba(0,0,0,0.2)] border-[8px] border-slate-900 overflow-hidden flex flex-col relative">
        
        {/* Top Notch Simulator */}
        <div className="absolute top-0 w-full h-7 flex justify-center z-50">
          <div className="w-32 h-5 bg-slate-900 rounded-b-2xl"></div>
        </div>

        {/* Status Bar (Simulated) */}
        <div className="h-10 bg-brand-blue w-full shrink-0 flex justify-between items-end px-6 pb-1 text-white text-xs font-medium">
          <span>09:41</span>
          <div className="flex gap-1 items-center">
            <span className="w-3 h-3 rounded-full bg-white animate-pulse"></span>
            <span>LTE</span>
          </div>
        </div>

        {/* HEADER DE LA APP */}
        <div className="bg-brand-blue px-6 pb-6 pt-4 text-white shrink-0 shadow-md z-10 relative">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                 <User size={16} />
               </div>
               <div>
                 <p className="text-[10px] font-medium text-blue-200 uppercase tracking-wider">Reponedor</p>
                 <p className="font-bold text-sm">Carlos Méndez</p>
               </div>
            </div>
            <button className="p-2 bg-white/10 rounded-full">
              <Navigation size={18} />
            </button>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-sm">
            <p className="text-xs text-blue-200 uppercase tracking-widest font-semibold mb-1">Ruta del Día</p>
            <h2 className="text-xl font-bold">Zona Sur (La Paz)</h2>
            <div className="flex justify-between mt-3 text-sm font-medium">
              <span>Progreso: {progressPct}%</span>
              <span>{routeTasks.filter(t => t.status === 'completed').length} / {routeTasks.length} PDVs</span>
            </div>
            {/* Progress Bar */}
            <div className="mt-2 h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
            </div>
          </div>
        </div>

        {/* MAIN SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto bg-slate-50 pb-24">
          
          {/* Botón Principal (Check-In) */}
          <div className="p-6">
            {!isCheckedIn ? (
              <button 
                onClick={() => setIsCheckedIn(true)}
                className="w-full bg-brand-blue text-white py-4 rounded-2xl shadow-lg font-bold text-lg flex items-center justify-center gap-2 transform active:scale-95 transition-transform"
              >
                <MapPin size={24} />
                Hacer Check-In (PDV Actual)
              </button>
            ) : (
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">En Ubicación</h3>
                <h4 className="text-lg font-bold text-slate-800 mt-1">{activePdv ? activePdv.name : 'Ruta Completada'}</h4>
                
                {/* Tareas Activas */}
                <div className="mt-4 flex flex-col gap-3">
                  <button 
                    onClick={() => setCurrentTask('inventory')}
                    className={clsx(
                      "flex items-center justify-between p-3 rounded-xl border transition-colors",
                      currentTask === 'inventory' ? "bg-blue-50 border-brand-blue" : "bg-slate-50 border-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={clsx("p-2 rounded-lg", currentTask === 'inventory' ? "bg-brand-blue text-white" : "bg-white text-slate-400")}>
                        <Package size={16} />
                      </div>
                      <span className={clsx("font-medium", currentTask === 'inventory' ? "text-brand-blue" : "text-slate-600")}>Conteo de Stock</span>
                    </div>
                    {currentTask !== 'inventory' && <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>}
                    {currentTask === 'inventory' && <div className="w-4 h-4 rounded-full border-4 border-brand-blue bg-white"></div>}
                  </button>

                  <button 
                    onClick={() => setCurrentTask('photos')}
                    className={clsx(
                      "flex items-center justify-between p-3 rounded-xl border transition-colors",
                      currentTask === 'photos' ? "bg-blue-50 border-brand-blue" : "bg-slate-50 border-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={clsx("p-2 rounded-lg", currentTask === 'photos' ? "bg-brand-blue text-white" : "bg-white text-slate-400")}>
                        <Camera size={16} />
                      </div>
                      <span className={clsx("font-medium", currentTask === 'photos' ? "text-brand-blue" : "text-slate-600")}>Fotos de Góndola</span>
                    </div>
                    {currentTask !== 'photos' && <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>}
                    {currentTask === 'photos' && <div className="w-4 h-4 rounded-full border-4 border-brand-blue bg-white"></div>}
                  </button>
                </div>

                <button 
                  onClick={handleFinishVisit}
                  className="mt-4 w-full bg-slate-900 text-white py-3 rounded-xl font-bold shadow flex justify-center items-center gap-2"
                >
                  <CheckCircle size={18} /> Finalizar Visita
                </button>
              </div>
            )}
          </div>

          {/* Secuencia de la Ruta */}
          <div className="px-6 pb-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex justify-between items-center">
              <span>Secuencia de Visitas</span>
              <span className="text-xs font-medium text-brand-blue">Ver Mapa</span>
            </h3>
            
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
              {routeTasks.map((task, i) => (
                <div key={i} className="relative pl-6">
                  {/* Timeline Dot */}
                  <div className={clsx(
                    "absolute -left-[11px] top-1 w-5 h-5 rounded-full ring-4 ring-slate-50 flex items-center justify-center",
                    task.status === 'completed' ? "bg-brand-blue" :
                    task.status === 'current' ? "bg-yellow-400" :
                    "bg-slate-300"
                  )}>
                    {task.status === 'completed' && <CheckCircle size={10} className="text-white" />}
                    {task.status === 'current' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                  
                  {/* Task Card */}
                  <div className={clsx(
                    "p-3 rounded-xl border",
                    task.status === 'current' ? "bg-white border-yellow-200 shadow-sm" : "bg-transparent border-transparent"
                  )}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">{task.id}</span>
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><Clock size={10}/> {task.time}</span>
                    </div>
                    <h4 className={clsx(
                      "font-bold text-sm",
                      task.status === 'completed' ? "text-slate-500 line-through" : "text-slate-800"
                    )}>{task.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{task.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
      
      {/* Botón flotante para salir del simulador (fuera del teléfono) */}
      <a href="/" className="fixed top-8 right-8 bg-white px-4 py-2 rounded-lg shadow font-bold text-slate-800 flex items-center gap-2 hover:bg-slate-50">
        <ChevronLeft size={20} /> Volver al Desktop
      </a>
    </div>
  );
}
