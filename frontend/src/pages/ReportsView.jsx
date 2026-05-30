import React from 'react';
import { Users, Clock, PackageX, Route, Calendar, Filter, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import clsx from 'clsx';

// --- MOCK DATA ---
const staffPerformance = [
  { initials: 'JD', name: 'Julian Delgado', region: 'NORTH-001', visits: 98, target: 100, status: 'Optimal' },
  { initials: 'SM', name: 'Sofia Martinez', region: 'WEST-042', visits: 82, target: 100, status: 'Delayed' },
  { initials: 'RK', name: 'Ricardo Kim', region: 'SOUTH-009', visits: 91, target: 100, status: 'Optimal' },
  { initials: 'AL', name: 'Ana Lopez', region: 'EAST-115', visits: 74, target: 100, status: 'Warning' },
];

const peakHoursData = [
  { time: '08:00', value: 30, high: false },
  { time: '10:00', value: 45, high: false },
  { time: '12:00', value: 85, high: true },
  { time: '14:00', value: 92, high: true },
  { time: '16:00', value: 78, high: true },
  { time: '18:00', value: 50, high: false },
  { time: '20:00', value: 20, high: false },
];

export function ReportsView() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-brand-gray-border shadow-sm flex flex-wrap gap-4 items-end justify-between">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Date Range</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" value="Oct 01 - Oct 24, 2026" readOnly className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-brand-blue outline-none cursor-pointer bg-slate-50 w-52 text-slate-700 font-medium" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Supervisor</label>
            <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none bg-slate-50 w-48 text-slate-700 font-medium cursor-pointer">
              <option>All Supervisors</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">City Selection</label>
            <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none bg-slate-50 w-48 text-slate-700 font-medium cursor-pointer">
              <option>La Paz, BO</option>
            </select>
          </div>
        </div>
        <button className="bg-brand-blue hover:bg-brand-blue-hover text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
          <Download size={16} />
          Update Report
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Coverage', value: '94.2%', desc: '+2.4%', icon: Users, color: 'text-brand-blue', positive: true },
          { label: 'Time Deviation', value: '14.5m', desc: '+5.1%', icon: Clock, color: 'text-brand-red', positive: false },
          { label: 'Stockout Index', value: '3.8%', desc: '-0.4%', icon: PackageX, color: 'text-slate-600', positive: true },
          { label: 'Active Routes', value: '128', desc: 'Target: 130', icon: Route, color: 'text-brand-blue', neutral: true },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-brand-gray-border shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
              <stat.icon size={18} className={stat.color} />
            </div>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-3xl font-bold text-slate-800">{stat.value}</span>
              <span className={clsx(
                "text-xs font-bold", 
                stat.neutral ? "text-slate-500 font-medium" : stat.positive ? "text-brand-blue" : "text-brand-red"
              )}>
                {stat.desc}
              </span>
            </div>
            <div className="mt-3 h-1 w-full bg-slate-100 rounded-full">
              <div className={clsx("h-full rounded-full w-4/5", stat.positive || stat.neutral ? "bg-brand-blue" : "bg-brand-red")} />
            </div>
          </div>
        ))}
      </div>

      {/* Middle Section (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Field Staff Performance (66%) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-brand-gray-border shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-800">Field Staff Performance</h3>
            <div className="flex gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-blue"></span> Visited</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-200"></span> Target</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-6 flex-1 justify-center">
            {staffPerformance.map((staff, idx) => {
              const pct = (staff.visits / staff.target) * 100;
              let statusClass = "bg-blue-50 text-brand-blue border border-blue-100";
              if (staff.status === 'Delayed') statusClass = "bg-red-50 text-brand-red border border-red-100";
              if (staff.status === 'Warning') statusClass = "bg-slate-100 text-slate-600 border border-slate-200";

              return (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                        {staff.initials}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm leading-tight">{staff.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{staff.region}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-slate-600">{staff.visits}/{staff.target} visits</span>
                      <span className="font-bold text-slate-800 text-sm">{Math.round(pct)}%</span>
                      <span className={clsx("text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide", statusClass)}>
                        {staff.status}
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative mt-1">
                    <div 
                      className={clsx("h-full rounded-full transition-all duration-500", staff.status === 'Delayed' ? 'bg-brand-red' : 'bg-brand-blue')}
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          <button className="mt-8 text-sm font-medium text-brand-blue hover:underline text-center w-full">
            View Detailed Staff Report
          </button>
        </div>

        {/* Real-time vs Estimated (33%) */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-brand-gray-border shadow-sm p-6 flex flex-col">
          <h3 className="text-base font-bold text-slate-800 mb-2">Real-time vs Estimated</h3>
          
          <div className="flex items-start gap-3 mt-4 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-brand-red shrink-0">
              <Clock size={16} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Average deviation per PDV</p>
              <p className="text-lg font-bold text-brand-red">+12.4 minutes</p>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Peak Hours</span>
            <span className="text-[10px] font-bold text-brand-red bg-red-50 px-2 py-1 rounded">HIGH</span>
          </div>

          <div className="flex-1 min-h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {peakHoursData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.high ? 'var(--color-brand-blue)' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bottom Section: Critical Stockouts by Segment */}
      <div className="bg-white rounded-xl border border-brand-gray-border shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-800">Critical Stockouts by Market Segment</h3>
            <p className="text-xs text-slate-500 mt-1">Identified product absences during last 24h audit cycle.</p>
          </div>
          <button className="text-slate-400 hover:text-slate-600">
            <Filter size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { segment: 'Traditional Trade', rate: '8.2%', alert: '! Top Out: Leche Pil 1L', status: 'critical', availability: 91.8 },
            { segment: 'Modern Trade', rate: '1.4%', alert: 'Healthy Levels', status: 'optimal', availability: 98.6 },
            { segment: 'Convenience', rate: '4.5%', alert: 'Monitoring Soda', status: 'warning', availability: 95.5 },
            { segment: 'HoReCa', rate: '2.1%', alert: 'Healthy Levels', status: 'optimal', availability: 97.9 },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-100 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-slate-800 text-sm">{item.segment}</span>
                <span className={clsx("font-bold text-sm", item.status === 'critical' ? 'text-brand-red' : 'text-slate-600')}>
                  {item.rate}
                </span>
              </div>
              <p className={clsx(
                "text-xs font-medium flex items-center gap-1",
                item.status === 'critical' ? 'text-brand-red' : 'text-slate-500'
              )}>
                {item.status === 'critical' && <AlertCircle size={12} />}
                {item.status === 'optimal' && <CheckCircle2 size={12} />}
                {item.alert}
              </p>
              
              <div className="mt-4 pt-4 border-t border-slate-200/60">
                <div className="flex justify-between items-center text-xs font-medium mb-1.5">
                  <span className="text-slate-500">Availability</span>
                  <span className="text-slate-800 font-bold">{item.availability}%</span>
                </div>
                <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={clsx("h-full rounded-full", item.status === 'critical' ? 'bg-brand-red' : 'bg-brand-blue')} 
                    style={{ width: `${item.availability}%` }} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
