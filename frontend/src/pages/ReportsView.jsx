import React, { useState, useEffect } from 'react';
import { Calendar, Download, TrendingUp, Users, Clock, CheckCircle, BarChart3 } from 'lucide-react';
import { API } from '../api/client';
import clsx from 'clsx';

export function ReportsView() {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [metricas, setMetricas] = useState(null);
  const [kpis, setKpis] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, [fecha]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const [mets, kpiData] = await Promise.all([
        API.getMetricasPorFecha(fecha).catch(() => null),
        API.getKpis(fecha).catch(() => [])
      ]);
      setMetricas(mets || {
        cumplimiento_total: 0,
        rutas_completadas: 0,
        tiempo_promedio_visita_min: 0
      });
      setKpis(Array.isArray(kpiData) ? kpiData : []);
    } catch (e) {
      console.error("Error cargando reportes", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const url = `https://innovahack-gcrh.onrender.com/reporte/exportar/${fecha}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_${fecha}.csv`;
    link.target = "_blank"; // en caso de que sea descarga directa
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2 transition-colors">
            <BarChart3 className="text-brand-blue" />
            Reportes Analíticos y KPIs
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Analiza el rendimiento general y de campo por fecha.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="date" 
              value={fecha} 
              onChange={(e) => setFecha(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg text-sm font-medium focus:ring-1 focus:ring-brand-blue outline-none transition-colors"
            />
          </div>
          <button 
            onClick={handleExport}
            className="bg-brand-blue hover:bg-brand-blue-hover text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <Download size={16} /> Exportar CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400 font-medium">
          Cargando métricas...
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Métricas Globales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm transition-colors flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-brand-blue/10 flex items-center justify-center">
                <CheckCircle className="text-brand-blue" size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Cumplimiento Global</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">{metricas?.cumplimiento_total || 0}%</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm transition-colors flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="text-emerald-500" size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Rutas Completadas</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">{metricas?.rutas_completadas || 0}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm transition-colors flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                <Clock className="text-purple-500" size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">T. Promedio Visita</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">{metricas?.tiempo_promedio_visita_min || 0} min</h3>
              </div>
            </div>
          </div>

          {/* Tabla de KPIs por Reponedor */}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col flex-1 min-h-0 transition-colors">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex bg-slate-50/50 dark:bg-slate-800/30 rounded-t-xl items-center gap-2 transition-colors">
              <Users className="text-slate-400" size={18} />
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Rendimiento por Reponedor</h3>
            </div>

            <div className="overflow-x-auto flex-1 p-4">
              {kpis.length === 0 ? (
                <div className="text-center text-slate-500 dark:text-slate-400 py-10 text-sm">
                  No hay datos de KPIs registrados para esta fecha.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-700 transition-colors">
                      <th className="px-4 py-3 rounded-tl-lg">ID Reponedor</th>
                      <th className="px-4 py-3">Ruta Asignada</th>
                      <th className="px-4 py-3 text-center">Cumplimiento (%)</th>
                      <th className="px-4 py-3 text-center rounded-tr-lg">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {kpis.map((kpi, idx) => (
                      <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-bold">
                          REP-{kpi.id_reponedor}
                        </td>
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-400 font-medium">
                          {kpi.id_ruta ? `Ruta #${kpi.id_ruta}` : 'Sin ruta'}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{kpi.cumplimiento_ruta || 0}%</span>
                            <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className={clsx("h-full", kpi.cumplimiento_ruta >= 80 ? "bg-emerald-500" : kpi.cumplimiento_ruta >= 50 ? "bg-amber-500" : "bg-red-500")} 
                                style={{ width: `${kpi.cumplimiento_ruta || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={clsx("px-2 py-1 rounded text-[10px] font-bold uppercase", 
                            kpi.cumplimiento_ruta >= 100 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : 
                            "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          )}>
                            {kpi.cumplimiento_ruta >= 100 ? 'Completado' : 'En Progreso'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
