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
      // Intentamos obtener el nuevo endpoint de Desviaciones (Fase 3)
      const data = await API.getDashboardDesviaciones(fecha).catch(() => null);
      if (data) {
        setMetricas(data);
        setKpis(Array.isArray(data.reponedores) ? data.reponedores : []);
      } else {
        // Fallback si no hay datos
        setMetricas(null);
        setKpis([]);
      }
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
            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm transition-colors flex items-center gap-4 hover:border-brand-blue/30 group">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-brand-blue/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle className="text-brand-blue" size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Cumplimiento Global</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">{metricas?.tasa_cumplimiento_pct != null ? metricas.tasa_cumplimiento_pct : 0}%</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm transition-colors flex items-center gap-4 hover:border-emerald-500/30 group">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="text-emerald-500" size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Visitas Completadas</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                  {metricas?.completadas || 0} <span className="text-sm font-bold text-slate-400">/ {metricas?.total_planificadas || 0}</span>
                </h3>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm transition-colors flex items-center gap-4 hover:border-red-500/30 group">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="text-red-500" size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Visitas Fallidas</p>
                <h3 className="text-2xl font-black text-red-500 dark:text-red-400">{metricas?.no_realizadas || 0} <span className="text-sm font-bold text-slate-400">NO REALIZADAS</span></h3>
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
                      <th className="px-4 py-3 rounded-tl-lg">Reponedor</th>
                      <th className="px-4 py-3 text-center">Visitas Completadas</th>
                      <th className="px-4 py-3 text-center">No Realizadas</th>
                      <th className="px-4 py-3 text-center rounded-tr-lg">Desviación (Orden)</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {kpis.map((kpi, idx) => (
                      <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                        <td className="px-4 py-4 text-slate-800 dark:text-slate-200 font-bold flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center text-xs">
                            {kpi.nombre ? kpi.nombre.charAt(0) : 'R'}
                          </div>
                          <div>
                            <p>{kpi.nombre || 'Reponedor'}</p>
                            <p className="text-[10px] text-slate-500 font-mono tracking-widest">ID: {kpi.id_reponedor}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg">{kpi.completadas || 0}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {kpi.no_realizadas > 0 ? (
                            <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2.5 py-1 rounded-full font-bold text-xs">{kpi.no_realizadas}</span>
                          ) : (
                            <span className="text-slate-400 font-medium">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span className={clsx("font-bold text-sm", kpi.desviacion_orden_pct > 20 ? "text-red-500" : kpi.desviacion_orden_pct > 0 ? "text-amber-500" : "text-emerald-500")}>
                              {kpi.desviacion_orden_pct != null ? kpi.desviacion_orden_pct : 0}%
                            </span>
                            <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className={clsx("h-full", kpi.desviacion_orden_pct > 20 ? "bg-red-500" : kpi.desviacion_orden_pct > 0 ? "bg-amber-500" : "bg-emerald-500")} 
                                style={{ width: `${Math.min(100, kpi.desviacion_orden_pct || 0)}%` }}
                              ></div>
                            </div>
                          </div>
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
