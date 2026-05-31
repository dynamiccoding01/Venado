import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Briefcase, Calendar, MapPin, Building, Key } from 'lucide-react';
import clsx from 'clsx';
import DefaultAvatar from '../assets/default-avatar.jpeg';

export function Profile() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsed = JSON.parse(userStr);
      // El objeto puede estar en parsed directamente o en parsed.usuario
      const data = parsed.usuario || parsed;
      setUserData(data);
    }
  }, []);

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  // Helper para mostrar el nombre del rol
  const getRoleName = (roleId) => {
    switch (Number(roleId)) {
      case 1: return 'Administrador Sistema';
      case 2: return 'Supervisor';
      case 3: return 'Reponedor (Campo)';
      default: return 'Usuario Estándar';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 glass-card p-8 rounded-3xl">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-brand-blue/20 shadow-xl shadow-brand-blue/10 relative group">
            <img 
              src={DefaultAvatar} 
              alt="Avatar" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
              <span className="text-white text-xs font-semibold uppercase tracking-wider">Cambiar Foto</span>
            </div>
          </div>
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight">
              {userData.nombre || 'Nombre de Usuario'}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-sm font-bold tracking-wide">
                {getRoleName(userData.id_rol)}
              </span>
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm font-medium">
                <MapPin size={14} /> Sede Principal
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Información Personal */}
        <div className="glass-card p-6 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200/50 dark:border-white/10 pb-4">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
              <User className="text-brand-blue" size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Datos Personales</h2>
          </div>
          
          <div className="space-y-5">
            <div className="group">
              <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-2">
                <User size={14} /> Nombre Completo
              </p>
              <p className="text-slate-800 dark:text-slate-200 font-semibold text-lg group-hover:text-brand-blue transition-colors">
                {userData.nombre || 'No especificado'}
              </p>
            </div>
            <div className="group">
              <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-2">
                <Mail size={14} /> Correo Electrónico
              </p>
              <p className="text-slate-800 dark:text-slate-200 font-semibold text-lg group-hover:text-brand-blue transition-colors">
                {userData.correo || 'No especificado'}
              </p>
            </div>
            <div className="group">
              <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-2">
                <Briefcase size={14} /> Cargo / Ocupación
              </p>
              <p className="text-slate-800 dark:text-slate-200 font-semibold text-lg group-hover:text-brand-blue transition-colors">
                {getRoleName(userData.id_rol)}
              </p>
            </div>
          </div>
        </div>

        {/* Seguridad y Sistema */}
        <div className="glass-card p-6 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200/50 dark:border-white/10 pb-4">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
              <Shield className="text-emerald-500" size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Seguridad y Sistema</h2>
          </div>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-bg/50 rounded-2xl border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                  <Shield size={18} className="text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Nivel de Acceso</p>
                  <p className="text-xs text-slate-500">ID Rol: {userData.id_rol}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold">Activo</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-bg/50 rounded-2xl border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                  <Key size={18} className="text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Contraseña</p>
                  <p className="text-xs text-slate-500">Actualizada recientemente</p>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-blue dark:hover:border-brand-blue text-slate-600 dark:text-slate-300 hover:text-brand-blue rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md">
                Cambiar
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-bg/50 rounded-2xl border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                  <User size={18} className="text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">ID de Sistema</p>
                  <p className="text-xs text-slate-500">Identificador interno</p>
                </div>
              </div>
              <span className="font-mono text-sm font-bold text-slate-400 bg-slate-200/50 dark:bg-slate-800/50 px-2 py-1 rounded-lg">
                #{userData.id_usuario}
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
